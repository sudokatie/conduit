import { Cell, CellState, PipeType, Position, Direction, PipeData } from './types';
import { GRID_WIDTH, GRID_HEIGHT } from './constants';
import { createPipe } from './Pipe';

export class Grid {
  private cells: Cell[][];
  private width: number;
  private height: number;
  private entryPosition: Position;
  private entryDirection: Direction;

  constructor(width: number = GRID_WIDTH, height: number = GRID_HEIGHT) {
    this.width = width;
    this.height = height;
    this.cells = this.createEmptyGrid();
    
    // Default entry on left side, random row
    const entryRow = Math.floor(Math.random() * height);
    this.entryPosition = { x: 0, y: entryRow };
    this.entryDirection = 'right'; // Water flows right into the grid
    this.cells[entryRow][0].state = 'entry';
  }

  private createEmptyGrid(): Cell[][] {
    const grid: Cell[][] = [];
    for (let y = 0; y < this.height; y++) {
      const row: Cell[] = [];
      for (let x = 0; x < this.width; x++) {
        row.push({ state: 'empty', pipe: null });
      }
      grid.push(row);
    }
    return grid;
  }

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }

  getCell(x: number, y: number): Cell | null {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return null;
    }
    return this.cells[y][x];
  }

  getCells(): Cell[][] {
    return this.cells;
  }

  getEntryPosition(): Position {
    return { ...this.entryPosition };
  }

  getEntryDirection(): Direction {
    return this.entryDirection;
  }

  setEntry(x: number, y: number, direction: Direction): void {
    // Clear old entry
    const oldCell = this.cells[this.entryPosition.y][this.entryPosition.x];
    if (oldCell.state === 'entry') {
      oldCell.state = 'empty';
    }

    // Set new entry
    this.entryPosition = { x, y };
    this.entryDirection = direction;
    this.cells[y][x].state = 'entry';
  }

  isValidPlacement(x: number, y: number): boolean {
    const cell = this.getCell(x, y);
    if (!cell) return false;
    return cell.state === 'empty';
  }

  placePipe(x: number, y: number, type: PipeType): boolean {
    if (!this.isValidPlacement(x, y)) {
      return false;
    }

    this.cells[y][x] = {
      state: 'pipe',
      pipe: createPipe(type),
    };
    return true;
  }

  getPipeAt(x: number, y: number): PipeData | null {
    const cell = this.getCell(x, y);
    return cell?.pipe || null;
  }

  setWaterLevel(x: number, y: number, level: number, fromDirection: Direction): void {
    const cell = this.getCell(x, y);
    if (cell?.pipe) {
      cell.pipe.waterLevel = level;
      cell.pipe.waterFrom = fromDirection;
    }
  }

  setFlooded(x: number, y: number): void {
    const cell = this.getCell(x, y);
    if (cell) {
      cell.state = 'flooded';
    }
  }

  reset(): void {
    this.cells = this.createEmptyGrid();
    this.cells[this.entryPosition.y][this.entryPosition.x].state = 'entry';
  }
}
