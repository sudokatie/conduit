import { Grid } from '../Grid';

describe('Grid', () => {
  describe('initialization', () => {
    it('should create grid with default dimensions', () => {
      const grid = new Grid();
      expect(grid.getWidth()).toBe(7);
      expect(grid.getHeight()).toBe(10);
    });

    it('should create grid with custom dimensions', () => {
      const grid = new Grid(5, 8);
      expect(grid.getWidth()).toBe(5);
      expect(grid.getHeight()).toBe(8);
    });

    it('should initialize with empty cells except entry', () => {
      const grid = new Grid(3, 3);
      const entryPos = grid.getEntryPosition();
      for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
          const cell = grid.getCell(x, y);
          if (x === entryPos.x && y === entryPos.y) {
            expect(cell?.state).toBe('entry');
          } else {
            expect(cell?.state).toBe('empty');
          }
          expect(cell?.pipe).toBeNull();
        }
      }
    });

    it('should set default entry point on left edge', () => {
      const grid = new Grid(7, 10);
      const entryPos = grid.getEntryPosition();
      expect(entryPos.x).toBe(0);
      expect(entryPos.y).toBeGreaterThanOrEqual(0);
      expect(entryPos.y).toBeLessThan(10);
    });

    it('should set default entry direction to right', () => {
      const grid = new Grid();
      expect(grid.getEntryDirection()).toBe('right');
    });
  });

  describe('getCell', () => {
    it('should return cell at valid position', () => {
      const grid = new Grid(5, 5);
      const cell = grid.getCell(2, 2);
      expect(cell).not.toBeNull();
    });

    it('should return null for negative x', () => {
      const grid = new Grid(5, 5);
      expect(grid.getCell(-1, 2)).toBeNull();
    });

    it('should return null for negative y', () => {
      const grid = new Grid(5, 5);
      expect(grid.getCell(2, -1)).toBeNull();
    });

    it('should return null for x >= width', () => {
      const grid = new Grid(5, 5);
      expect(grid.getCell(5, 2)).toBeNull();
    });

    it('should return null for y >= height', () => {
      const grid = new Grid(5, 5);
      expect(grid.getCell(2, 5)).toBeNull();
    });
  });

  describe('placePipe', () => {
    it('should place pipe at valid empty position', () => {
      const grid = new Grid(5, 5);
      const result = grid.placePipe(2, 2, 'horizontal');
      expect(result).toBe(true);
      
      const pipe = grid.getPipeAt(2, 2);
      expect(pipe?.type).toBe('horizontal');
    });

    it('should reject placement at occupied position', () => {
      const grid = new Grid(5, 5);
      grid.placePipe(2, 2, 'horizontal');
      const result = grid.placePipe(2, 2, 'vertical');
      expect(result).toBe(false);
      
      // Original pipe should remain
      const pipe = grid.getPipeAt(2, 2);
      expect(pipe?.type).toBe('horizontal');
    });

    it('should reject placement at entry position', () => {
      const grid = new Grid(5, 5);
      const entry = grid.getEntryPosition();
      const result = grid.placePipe(entry.x, entry.y, 'horizontal');
      expect(result).toBe(false);
    });

    it('should reject placement outside grid', () => {
      const grid = new Grid(5, 5);
      expect(grid.placePipe(-1, 2, 'horizontal')).toBe(false);
      expect(grid.placePipe(5, 2, 'horizontal')).toBe(false);
      expect(grid.placePipe(2, -1, 'horizontal')).toBe(false);
      expect(grid.placePipe(2, 5, 'horizontal')).toBe(false);
    });

    it('should update cell state to pipe', () => {
      const grid = new Grid(5, 5);
      grid.placePipe(2, 2, 'horizontal');
      const cell = grid.getCell(2, 2);
      expect(cell?.state).toBe('pipe');
    });
  });

  describe('getPipeAt', () => {
    it('should return pipe at position', () => {
      const grid = new Grid(5, 5);
      grid.placePipe(2, 2, 'vertical');
      const pipe = grid.getPipeAt(2, 2);
      expect(pipe?.type).toBe('vertical');
      expect(pipe?.connections).toEqual(['top', 'bottom']);
    });

    it('should return null for empty position', () => {
      const grid = new Grid(5, 5);
      expect(grid.getPipeAt(2, 2)).toBeNull();
    });

    it('should return null for out of bounds', () => {
      const grid = new Grid(5, 5);
      expect(grid.getPipeAt(-1, 0)).toBeNull();
      expect(grid.getPipeAt(5, 0)).toBeNull();
    });
  });

  describe('setEntry', () => {
    it('should update entry position', () => {
      const grid = new Grid(5, 5);
      grid.setEntry(0, 3, 'right');
      
      const pos = grid.getEntryPosition();
      expect(pos.x).toBe(0);
      expect(pos.y).toBe(3);
    });

    it('should update entry direction', () => {
      const grid = new Grid(5, 5);
      grid.setEntry(2, 0, 'bottom');
      expect(grid.getEntryDirection()).toBe('bottom');
    });

    it('should update cell states correctly', () => {
      const grid = new Grid(5, 5);
      // Set entry to known position first to avoid flaky test
      grid.setEntry(0, 0, 'right');
      
      grid.setEntry(0, 3, 'right');
      
      // Old entry should be empty
      const oldCell = grid.getCell(0, 0);
      expect(oldCell?.state).toBe('empty');
      
      // New entry should be entry
      const newCell = grid.getCell(0, 3);
      expect(newCell?.state).toBe('entry');
    });
  });

  describe('setWaterLevel', () => {
    it('should set water level on pipe', () => {
      const grid = new Grid(5, 5);
      grid.placePipe(2, 2, 'horizontal');
      grid.setWaterLevel(2, 2, 0.5, 'left');
      
      const pipe = grid.getPipeAt(2, 2);
      expect(pipe?.waterLevel).toBe(0.5);
      expect(pipe?.waterFrom).toBe('left');
    });

    it('should not affect empty cells', () => {
      const grid = new Grid(5, 5);
      grid.setWaterLevel(2, 2, 0.5, 'left');
      
      const cell = grid.getCell(2, 2);
      expect(cell?.pipe).toBeNull();
    });
  });

  describe('setFlooded', () => {
    it('should mark cell as flooded', () => {
      const grid = new Grid(5, 5);
      grid.setFlooded(2, 2);
      
      const cell = grid.getCell(2, 2);
      expect(cell?.state).toBe('flooded');
    });
  });

  describe('reset', () => {
    it('should clear all pipes', () => {
      const grid = new Grid(5, 5);
      grid.placePipe(1, 1, 'horizontal');
      grid.placePipe(2, 2, 'vertical');
      
      grid.reset();
      
      expect(grid.getPipeAt(1, 1)).toBeNull();
      expect(grid.getPipeAt(2, 2)).toBeNull();
    });

    it('should restore entry point', () => {
      const grid = new Grid(5, 5);
      grid.placePipe(1, 1, 'horizontal');
      
      grid.reset();
      
      const entryPos = grid.getEntryPosition();
      const cell = grid.getCell(entryPos.x, entryPos.y);
      expect(cell?.state).toBe('entry');
    });
  });

  describe('getCells', () => {
    it('should return all cells', () => {
      const grid = new Grid(3, 4);
      const cells = grid.getCells();
      
      expect(cells.length).toBe(4);
      expect(cells[0].length).toBe(3);
    });
  });
});
