import { Position, Direction, FlowState } from './types';
import { Grid } from './Grid';
import { canFlowThrough, getExitDirections, getOppositeDirection, isCrossPipe } from './Pipe';
import { DIRECTION_OFFSET } from './constants';

export class Flow {
  private grid: Grid;
  private currentPos: Position;
  private currentDir: Direction;
  private segments: number;
  private flooded: boolean;
  private path: Position[];
  private crossVisited: Set<string>; // Track which cross pipes have been visited and from which direction

  constructor(grid: Grid) {
    this.grid = grid;
    this.currentPos = grid.getEntryPosition();
    this.currentDir = grid.getEntryDirection();
    this.segments = 0;
    this.flooded = false;
    this.path = [];
    this.crossVisited = new Set();
  }

  start(): void {
    // Water starts at entry, ready to flow into first pipe
    this.segments = 0;
    this.flooded = false;
    this.path = [];
    this.crossVisited.clear();
    this.currentPos = this.grid.getEntryPosition();
    this.currentDir = this.grid.getEntryDirection();
  }

  // Advance water by one segment. Returns false if flooded.
  advance(): boolean {
    if (this.flooded) return false;

    // Calculate next position based on current direction
    const offset = DIRECTION_OFFSET[this.currentDir];
    const nextX = this.currentPos.x + offset.dx;
    const nextY = this.currentPos.y + offset.dy;

    // Check if we're leaving the grid
    const cell = this.grid.getCell(nextX, nextY);
    if (!cell) {
      // Left the grid - flooded unless we've met minimum length
      this.flooded = true;
      return false;
    }

    // Check if there's a pipe at the next position
    const pipe = this.grid.getPipeAt(nextX, nextY);
    if (!pipe) {
      // No pipe - flooded
      this.flooded = true;
      this.grid.setFlooded(nextX, nextY);
      return false;
    }

    // Check if water can enter the pipe from current direction
    if (!canFlowThrough(pipe.type, this.currentDir)) {
      // Pipe doesn't have an opening facing us - flooded
      this.flooded = true;
      this.grid.setFlooded(nextX, nextY);
      return false;
    }

    // Water successfully enters the pipe
    this.currentPos = { x: nextX, y: nextY };
    this.path.push({ ...this.currentPos });
    this.segments++;

    // Track cross pipe visits
    const posKey = `${nextX},${nextY}`;
    const visitKey = `${posKey}:${this.currentDir}`;
    
    if (isCrossPipe(pipe.type)) {
      this.crossVisited.add(visitKey);
    }

    // Fill the pipe with water
    this.grid.setWaterLevel(nextX, nextY, 1, this.currentDir);

    // Determine exit direction
    const exits = getExitDirections(pipe.type, this.currentDir);
    if (exits.length === 0) {
      // No exit - this shouldn't happen if canFlowThrough returned true
      this.flooded = true;
      return false;
    }

    // For cross pipes, we might have multiple exits - take the first available
    // In standard flow, there's usually one exit
    this.currentDir = exits[0];

    return true;
  }

  getCurrentPosition(): Position {
    return { ...this.currentPos };
  }

  getCurrentDirection(): Direction {
    return this.currentDir;
  }

  getSegments(): number {
    return this.segments;
  }

  getPath(): Position[] {
    return [...this.path];
  }

  isFlooded(): boolean {
    return this.flooded;
  }

  getState(): FlowState {
    return {
      x: this.currentPos.x,
      y: this.currentPos.y,
      direction: this.currentDir,
      segments: this.segments,
    };
  }
}
