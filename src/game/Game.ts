import { GameState, GameStatus, PipeType, Position } from './types';
import { Grid } from './Grid';
import { Flow } from './Flow';
import { generateRandomPipe } from './Pipe';
import {
  QUEUE_SIZE,
  MAX_DISCARDS,
  START_DELAY,
  FLOW_INTERVAL,
  MIN_LENGTH,
  POINTS_PER_SEGMENT,
  CROSS_BONUS,
  NO_DISCARD_BONUS,
} from './constants';

export class Game {
  private grid: Grid;
  private flow: Flow;
  private queue: PipeType[];
  private state: GameState;
  private flowAccumulator: number; // Time accumulator for flow ticks

  constructor() {
    this.grid = new Grid();
    this.flow = new Flow(this.grid);
    this.queue = [];
    this.flowAccumulator = 0;
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
    };
  }

  start(): void {
    this.grid.reset();
    this.flow.start();
    this.queue = this.generateQueue(QUEUE_SIZE);
    this.state = this.createInitialState();
    this.flowAccumulator = 0;
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
    return { ...this.state };
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

    return true;
  }

  // Update game state by delta time (seconds)
  update(deltaTime: number): void {
    if (this.state.status === 'flooded' || this.state.status === 'won') {
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

    // Playing state - advance water
    this.flowAccumulator += remainingTime;

    while (this.flowAccumulator >= this.state.flowTimer) {
      this.flowAccumulator -= this.state.flowTimer;
      this.advanceWater();

      if (this.state.status !== 'playing') {
        break;
      }
    }
  }

  private advanceWater(): void {
    const beforePos = this.flow.getCurrentPosition();
    const result = this.flow.advance();

    if (!result) {
      // Water couldn't advance - flooded
      this.state.status = 'flooded';
      return;
    }

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

    return finalScore;
  }

  // End the game
  endGame(): void {
    if (this.isWin()) {
      this.state.status = 'won';
      this.state.score = this.calculateFinalScore();
    } else {
      this.state.status = 'flooded';
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

  // Restart the game
  restart(): void {
    this.start();
  }
}
