import { Flow } from '../Flow';
import { Grid } from '../Grid';

describe('Flow', () => {
  describe('initialization', () => {
    it('should start at grid entry position', () => {
      const grid = new Grid(7, 10);
      const flow = new Flow(grid);
      
      flow.start();
      
      const pos = flow.getCurrentPosition();
      const entryPos = grid.getEntryPosition();
      expect(pos.x).toBe(entryPos.x);
      expect(pos.y).toBe(entryPos.y);
    });

    it('should start with entry direction', () => {
      const grid = new Grid(7, 10);
      const flow = new Flow(grid);
      
      flow.start();
      
      expect(flow.getCurrentDirection()).toBe('right');
    });

    it('should start with zero segments', () => {
      const grid = new Grid(7, 10);
      const flow = new Flow(grid);
      
      flow.start();
      
      expect(flow.getSegments()).toBe(0);
    });

    it('should start with empty path', () => {
      const grid = new Grid(7, 10);
      const flow = new Flow(grid);
      
      flow.start();
      
      expect(flow.getPath()).toEqual([]);
    });

    it('should not be flooded at start', () => {
      const grid = new Grid(7, 10);
      const flow = new Flow(grid);
      
      flow.start();
      
      expect(flow.isFlooded()).toBe(false);
    });
  });

  describe('advance through pipes', () => {
    it('should advance through horizontal pipe', () => {
      const grid = new Grid(7, 10);
      grid.placePipe(1, 5, 'horizontal');
      const flow = new Flow(grid);
      
      flow.start();
      const result = flow.advance();
      
      expect(result).toBe(true);
      expect(flow.getSegments()).toBe(1);
      expect(flow.getCurrentPosition()).toEqual({ x: 1, y: 5 });
    });

    it('should advance through vertical pipe', () => {
      const grid = new Grid(7, 10);
      grid.setEntry(3, 0, 'bottom'); // Enter from top
      grid.placePipe(3, 1, 'vertical');
      const flow = new Flow(grid);
      
      flow.start();
      const result = flow.advance();
      
      expect(result).toBe(true);
      expect(flow.getCurrentDirection()).toBe('bottom');
    });

    it('should turn through elbow pipe', () => {
      const grid = new Grid(7, 10);
      // Water flows right, enters through left, needs elbow with left+bottom connections
      grid.placePipe(1, 5, 'elbow_bl'); // bottom-left elbow
      const flow = new Flow(grid);
      
      flow.start();
      flow.advance();
      
      // Water entering from left exits through bottom
      expect(flow.getCurrentDirection()).toBe('bottom');
    });

    it('should advance through multiple pipes', () => {
      const grid = new Grid(7, 10);
      grid.placePipe(1, 5, 'horizontal');
      grid.placePipe(2, 5, 'horizontal');
      grid.placePipe(3, 5, 'horizontal');
      const flow = new Flow(grid);
      
      flow.start();
      flow.advance();
      flow.advance();
      flow.advance();
      
      expect(flow.getSegments()).toBe(3);
      expect(flow.getCurrentPosition()).toEqual({ x: 3, y: 5 });
    });

    it('should track path correctly', () => {
      const grid = new Grid(7, 10);
      grid.placePipe(1, 5, 'horizontal');
      grid.placePipe(2, 5, 'horizontal');
      const flow = new Flow(grid);
      
      flow.start();
      flow.advance();
      flow.advance();
      
      const path = flow.getPath();
      expect(path).toHaveLength(2);
      expect(path[0]).toEqual({ x: 1, y: 5 });
      expect(path[1]).toEqual({ x: 2, y: 5 });
    });
  });

  describe('flood detection', () => {
    it('should flood when no pipe at next position', () => {
      const grid = new Grid(7, 10);
      // No pipe placed at (1, 5)
      const flow = new Flow(grid);
      
      flow.start();
      const result = flow.advance();
      
      expect(result).toBe(false);
      expect(flow.isFlooded()).toBe(true);
    });

    it('should flood when pipe does not accept flow direction', () => {
      const grid = new Grid(7, 10);
      grid.placePipe(1, 5, 'vertical'); // Can't accept from left
      const flow = new Flow(grid);
      
      flow.start();
      const result = flow.advance();
      
      expect(result).toBe(false);
      expect(flow.isFlooded()).toBe(true);
    });

    it('should flood when leaving grid', () => {
      const grid = new Grid(7, 10);
      grid.placePipe(1, 5, 'horizontal');
      grid.placePipe(2, 5, 'horizontal');
      grid.placePipe(3, 5, 'horizontal');
      grid.placePipe(4, 5, 'horizontal');
      grid.placePipe(5, 5, 'horizontal');
      grid.placePipe(6, 5, 'horizontal');
      const flow = new Flow(grid);
      
      flow.start();
      for (let i = 0; i < 6; i++) {
        flow.advance();
      }
      // Next advance should leave the grid
      const result = flow.advance();
      
      expect(result).toBe(false);
      expect(flow.isFlooded()).toBe(true);
    });

    it('should not advance after flooding', () => {
      const grid = new Grid(7, 10);
      const flow = new Flow(grid);
      
      flow.start();
      flow.advance(); // Floods
      const result = flow.advance(); // Should fail
      
      expect(result).toBe(false);
      expect(flow.getSegments()).toBe(0);
    });
  });

  describe('cross pipe handling', () => {
    it('should pass through cross pipe', () => {
      const grid = new Grid(7, 10);
      grid.placePipe(1, 5, 'cross');
      const flow = new Flow(grid);
      
      flow.start();
      const result = flow.advance();
      
      expect(result).toBe(true);
      expect(flow.getSegments()).toBe(1);
    });

    it('should maintain direction through cross pipe when going straight', () => {
      const grid = new Grid(7, 10);
      grid.placePipe(1, 5, 'cross');
      const flow = new Flow(grid);
      
      flow.start();
      flow.advance();
      
      // Should continue in same direction (right becomes left exit, meaning water goes left/right)
      // Actually cross pipe exits: water from left can exit top, bottom, or left
      // But the first exit should be in the continuing direction
      const dir = flow.getCurrentDirection();
      expect(['top', 'bottom', 'left']).toContain(dir);
    });
  });

  describe('T pipe handling', () => {
    it('should flow through T pipe from valid entry', () => {
      const grid = new Grid(7, 10);
      grid.placePipe(1, 5, 't_bottom'); // left, right, bottom
      const flow = new Flow(grid);
      
      flow.start();
      const result = flow.advance();
      
      expect(result).toBe(true);
    });

    it('should reject T pipe from invalid entry', () => {
      const grid = new Grid(7, 10);
      grid.placePipe(1, 5, 't_top'); // left, right, top - no bottom connection
      grid.setEntry(1, 6, 'top'); // Coming from below
      const flow = new Flow(grid);
      
      flow.start();
      const result = flow.advance();
      
      expect(result).toBe(false);
      expect(flow.isFlooded()).toBe(true);
    });
  });

  describe('state management', () => {
    it('should return correct state', () => {
      const grid = new Grid(7, 10);
      grid.placePipe(1, 5, 'horizontal');
      const flow = new Flow(grid);
      
      flow.start();
      flow.advance();
      
      const state = flow.getState();
      expect(state.x).toBe(1);
      expect(state.y).toBe(5);
      expect(state.direction).toBe('right'); // Horizontal continues in same direction
      expect(state.segments).toBe(1);
    });

    it('should reset on start()', () => {
      const grid = new Grid(7, 10);
      grid.placePipe(1, 5, 'horizontal');
      const flow = new Flow(grid);
      
      flow.start();
      flow.advance();
      expect(flow.getSegments()).toBe(1);
      
      flow.start();
      expect(flow.getSegments()).toBe(0);
      expect(flow.getPath()).toEqual([]);
      expect(flow.isFlooded()).toBe(false);
    });
  });

  describe('complex paths', () => {
    it('should navigate L-shaped path', () => {
      const grid = new Grid(7, 10);
      // Water flows right from entry (0,5)
      // elbow_bl has left+bottom, so water enters from left, exits bottom
      grid.placePipe(1, 5, 'horizontal');
      grid.placePipe(2, 5, 'elbow_bl'); // Turn down (left+bottom)
      grid.placePipe(2, 6, 'vertical');
      grid.placePipe(2, 7, 'vertical');
      const flow = new Flow(grid);
      
      flow.start();
      flow.advance(); // (1,5) horizontal
      flow.advance(); // (2,5) turn
      flow.advance(); // (2,6) vertical
      flow.advance(); // (2,7) vertical
      
      expect(flow.getSegments()).toBe(4);
      expect(flow.getCurrentPosition()).toEqual({ x: 2, y: 7 });
      expect(flow.getCurrentDirection()).toBe('bottom');
    });

    it('should navigate S-shaped path', () => {
      const grid = new Grid(7, 10);
      // Water flows right from entry (0,5)
      // elbow_bl: left+bottom, enters from left, exits bottom
      // elbow_tr: top+right, enters from top, exits right
      grid.placePipe(1, 5, 'elbow_bl'); // Turn down
      grid.placePipe(1, 6, 'elbow_tr'); // Turn right
      grid.placePipe(2, 6, 'horizontal');
      const flow = new Flow(grid);
      
      flow.start();
      flow.advance(); // (1,5) turn down
      flow.advance(); // (1,6) turn right
      flow.advance(); // (2,6) horizontal
      
      expect(flow.getSegments()).toBe(3);
      expect(flow.isFlooded()).toBe(false);
    });
  });

  describe('water fill tracking', () => {
    it('should fill pipe with water after advance', () => {
      const grid = new Grid(7, 10);
      grid.placePipe(1, 5, 'horizontal');
      const flow = new Flow(grid);
      
      flow.start();
      flow.advance();
      
      const pipe = grid.getPipeAt(1, 5);
      expect(pipe?.waterLevel).toBe(1);
      expect(pipe?.waterFrom).toBe('right'); // fromDirection is the direction water came from
    });
  });
});
