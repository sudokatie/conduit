import { GameState, GameStatus, PipeType, Position } from './types';
import { Grid } from './Grid';
import { Flow } from './Flow';
import { generateRandomPipe } from './Pipe';
import { Sound } from './Sound';
import { getDailyLevelIds, DailyLeaderboard, todayString, generateShareCode, SeededRNG, todaySeed } from './Daily';
import {
  QUEUE_SIZE,
  MAX_DISCARDS,
  START_DELAY,
  FLOW_INTERVAL,
  MIN_LENGTH,
  POINTS_PER_SEGMENT,
  CROSS_BONUS,
  NO_DISCARD_BONUS,
  SPEED_BONUS_PER_SECOND,
  PAR_TIME,
  FLOW_SPEED_SCALE,
  MIN_FLOW_INTERVAL,
} from './constants';

export class Game {
  private grid: Grid;
  private flow: Flow;
  private queue: PipeType[];
  private state: GameState;
  private flowAccumulator: number; // Time accumulator for flow ticks
  private headFillProgress: number; // Animation progress for water head (0-1)

  // Daily challenge state
  private dailyMode: boolean = false;
  private dailyLevels: number[] = [];
  private dailyLevelIndex: number = 0;
  private dailyTotalScore: number = 0;
  private dailyTotalPipes: number = 0;
  private dailyStartTime: number = 0;
  private dailyRng: SeededRNG | null = null;

  // Callbacks
  onDailyComplete?: (result: {
    totalScore: number;
    totalPipes: number;
    levelsCompleted: number;
    timeSeconds: number;
    shareCode: string;
  }) => void;

  constructor() {
    this.grid = new Grid();
    this.flow = new Flow(this.grid);
    this.queue = [];
    this.flowAccumulator = 0;
    this.headFillProgress = 0;
    this.state = this.createInitialState();
  }

  private createInitialState(): GameState {
    return {
      status: 'waiting',
      score: 0,
      length: 0,
      discards: MAX_DISCARDS,
      countdown: START_DELAY,
      flowTimer: FLOW_INTERVAL,
      paused: false,
      elapsedTime: 0,
      dailyMode: this.dailyMode,
    };
  }

  start(): void {
    this.grid.reset();
    this.flow.start();
    this.queue = this.generateQueue(QUEUE_SIZE);
    this.state = this.createInitialState();
    this.flowAccumulator = 0;
    this.headFillProgress = 0;
  }

  private generateQueue(count: number): PipeType[] {
    const queue: PipeType[] = [];
    for (let i = 0; i < count; i++) {
      queue.push(generateRandomPipe());
    }
    return queue;
  }

  getGrid(): Grid {
    return this.grid;
  }

  getFlow(): Flow {
    return this.flow;
  }

  getQueue(): PipeType[] {
    return [...this.queue];
  }

  getCurrentPipe(): PipeType | null {
    return this.queue[0] || null;
  }

  getState(): GameState {
    const state = { ...this.state };
    state.dailyMode = this.dailyMode;
    
    if (this.dailyMode) {
      state.dailyProgress = {
        current: this.dailyLevelIndex + 1,
        total: this.dailyLevels.length,
        totalScore: this.dailyTotalScore + this.state.score,
        totalPipes: this.dailyTotalPipes + this.state.length,
      };
    }
    
    return state;
  }

  getStatus(): GameStatus {
    return this.state.status;
  }

  // Place the current pipe at the given position
  placePipe(x: number, y: number): boolean {
    if (this.state.status !== 'waiting' && this.state.status !== 'playing') {
      return false;
    }

    const currentPipe = this.getCurrentPipe();
    if (!currentPipe) {
      return false;
    }

    if (!this.grid.placePipe(x, y, currentPipe)) {
      return false;
    }

    // Remove placed pipe from queue and add new one
    this.queue.shift();
    this.queue.push(generateRandomPipe());
    Sound.play('pipePlace');

    return true;
  }

  // Discard current pipe
  discard(): boolean {
    if (this.state.status !== 'waiting' && this.state.status !== 'playing') {
      return false;
    }

    if (this.state.discards <= 0) {
      return false;
    }

    if (this.queue.length === 0) {
      return false;
    }

    // Remove current pipe and add new one
    this.queue.shift();
    this.queue.push(generateRandomPipe());
    this.state.discards--;
    Sound.play('pipeDiscard');

    return true;
  }

  // Update game state by delta time (seconds)
  update(deltaTime: number): void {
    if (this.state.status === 'flooded' || this.state.status === 'won') {
      return;
    }

    // Don't update if paused
    if (this.state.paused) {
      return;
    }

    let remainingTime = deltaTime;

    if (this.state.status === 'waiting') {
      if (remainingTime < this.state.countdown) {
        this.state.countdown -= remainingTime;
        return;
      }
      // Transition to playing
      remainingTime -= this.state.countdown;
      this.state.countdown = 0;
      this.state.status = 'playing';
    }

    // Track elapsed time for speed bonus
    this.state.elapsedTime += remainingTime;

    // Playing state - advance water
    this.flowAccumulator += remainingTime;

    // Flow interval decreases as score increases
    const currentInterval = this.getCurrentFlowInterval();

    while (this.flowAccumulator >= currentInterval) {
      this.flowAccumulator -= currentInterval;
      this.headFillProgress = 0; // Reset fill progress when water advances
      this.advanceWater();

      if (this.state.status !== 'playing') {
        break;
      }
    }

    // Track fill progress for water head animation (0-1 over flow interval)
    if (this.state.status === 'playing') {
      this.headFillProgress = this.flowAccumulator / currentInterval;
    }
  }

  // Toggle pause state
  togglePause(): boolean {
    if (this.state.status !== 'playing') {
      return false;
    }
    this.state.paused = !this.state.paused;
    return true;
  }

  // Check if game is paused
  isPaused(): boolean {
    return this.state.paused;
  }

  private advanceWater(): void {
    const beforePos = this.flow.getCurrentPosition();
    const result = this.flow.advance();

    if (!result) {
      // Water couldn't advance - flooded
      this.state.status = 'flooded';
      Sound.play('levelFail');
      return;
    }
    
    Sound.play('waterFlow');

    // Water advanced successfully
    const pos = this.flow.getCurrentPosition();
    const pipe = this.grid.getPipeAt(pos.x, pos.y);

    // Base points
    this.state.score += POINTS_PER_SEGMENT;
    this.state.length = this.flow.getSegments();

    // Cross pipe bonus (if traversed second time)
    if (pipe?.type === 'cross') {
      const path = this.flow.getPath();
      const crossCount = path.filter(
        (p) => p.x === pos.x && p.y === pos.y
      ).length;
      if (crossCount > 1) {
        this.state.score += CROSS_BONUS;
      }
    }

    // Check win condition
    if (this.state.length >= MIN_LENGTH) {
      // Continue playing but mark as won when water eventually floods
      // For now, we'll allow continued play until flood
      // Win is checked when game ends
    }
  }

  // Check if game can be considered won (called when flooded)
  isWin(): boolean {
    return this.state.length >= MIN_LENGTH;
  }

  // Calculate final score with bonuses
  calculateFinalScore(): number {
    let finalScore = this.state.score;

    // No discard bonus
    if (this.state.discards === MAX_DISCARDS) {
      finalScore += NO_DISCARD_BONUS;
    }

    // Speed bonus: +10 per second under par time
    const secondsUnderPar = Math.floor(PAR_TIME - this.state.elapsedTime);
    if (secondsUnderPar > 0) {
      finalScore += secondsUnderPar * SPEED_BONUS_PER_SECOND;
    }

    return finalScore;
  }

  // End the game
  endGame(): void {
    if (this.isWin()) {
      this.state.status = 'won';
      this.state.score = this.calculateFinalScore();
      Sound.play('levelComplete');
    } else {
      this.state.status = 'flooded';
      Sound.play('levelFail');
    }
  }

  // Get remaining discards
  getDiscardsRemaining(): number {
    return this.state.discards;
  }

  // Get countdown remaining
  getCountdown(): number {
    return this.state.countdown;
  }

  // Get current length
  getLength(): number {
    return this.state.length;
  }

  // Get current score
  getScore(): number {
    return this.state.score;
  }

  // Check if can place at position
  canPlaceAt(x: number, y: number): boolean {
    return this.grid.isValidPlacement(x, y);
  }

  // Get current fill progress for water head animation (0-1)
  getHeadFillProgress(): number {
    return this.headFillProgress;
  }

  // Calculate current flow interval based on score (gets faster as score increases)
  getCurrentFlowInterval(): number {
    const reduction = this.state.score * FLOW_SPEED_SCALE;
    const interval = FLOW_INTERVAL - reduction;
    return Math.max(interval, MIN_FLOW_INTERVAL);
  }

  // Restart the game
  restart(): void {
    this.start();
  }

  // Sound toggle
  toggleSound(): boolean {
    const newState = !Sound.isEnabled();
    Sound.setEnabled(newState);
    return newState;
  }

  isSoundEnabled(): boolean {
    return Sound.isEnabled();
  }

  /** Start a daily challenge */
  startDaily(): void {
    this.dailyMode = true;
    this.dailyLevels = [0, 1, 2]; // 3 rounds
    this.dailyLevelIndex = 0;
    this.dailyTotalScore = 0;
    this.dailyTotalPipes = 0;
    this.dailyStartTime = Date.now();
    this.dailyRng = new SeededRNG(todaySeed());
    
    this.start();
  }

  /** Advance to next daily level or complete */
  nextDailyLevel(): void {
    if (!this.dailyMode) return;
    
    this.dailyTotalScore += this.calculateFinalScore();
    this.dailyTotalPipes += this.state.length;
    this.dailyLevelIndex++;
    
    if (this.dailyLevelIndex < this.dailyLevels.length) {
      this.start();
    } else {
      // Daily complete
      const timeSeconds = Math.floor((Date.now() - this.dailyStartTime) / 1000);
      const shareCode = generateShareCode(todayString(), this.dailyTotalScore, this.dailyLevels.length);
      
      this.onDailyComplete?.({
        totalScore: this.dailyTotalScore,
        totalPipes: this.dailyTotalPipes,
        levelsCompleted: this.dailyLevels.length,
        timeSeconds,
        shareCode,
      });
    }
  }

  /** Exit daily mode */
  exitDaily(): void {
    this.dailyMode = false;
    this.dailyLevels = [];
    this.dailyLevelIndex = 0;
    this.dailyTotalScore = 0;
    this.dailyTotalPipes = 0;
    this.dailyRng = null;
    
    this.state = this.createInitialState();
  }

  /** Submit daily score */
  submitDailyScore(name: string): number | null {
    const timeSeconds = Math.floor((Date.now() - this.dailyStartTime) / 1000);
    return DailyLeaderboard.recordScore(
      name,
      this.dailyTotalScore,
      this.dailyTotalPipes,
      this.dailyLevels.length,
      timeSeconds
    );
  }

  /** Check if in daily mode */
  isDailyMode(): boolean {
    return this.dailyMode;
  }

  /** Get daily progress */
  getDailyProgress(): { current: number; total: number; score: number; pipes: number } {
    return {
      current: this.dailyLevelIndex + 1,
      total: this.dailyLevels.length,
      score: this.dailyTotalScore + this.state.score,
      pipes: this.dailyTotalPipes + this.state.length,
    };
  }
}
