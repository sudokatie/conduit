import {
  getPipeConnections,
  canFlowThrough,
  getExitDirections,
  getOppositeDirection,
  generateRandomPipe,
  createPipe,
  isCrossPipe,
} from '../Pipe';

describe('Pipe', () => {
  describe('getPipeConnections', () => {
    it('should return correct connections for horizontal pipe', () => {
      expect(getPipeConnections('horizontal')).toEqual(['left', 'right']);
    });

    it('should return correct connections for vertical pipe', () => {
      expect(getPipeConnections('vertical')).toEqual(['top', 'bottom']);
    });

    it('should return correct connections for elbow pipes', () => {
      expect(getPipeConnections('elbow_tl')).toEqual(['top', 'left']);
      expect(getPipeConnections('elbow_tr')).toEqual(['top', 'right']);
      expect(getPipeConnections('elbow_bl')).toEqual(['bottom', 'left']);
      expect(getPipeConnections('elbow_br')).toEqual(['bottom', 'right']);
    });

    it('should return correct connections for cross pipe', () => {
      expect(getPipeConnections('cross')).toEqual(['top', 'right', 'bottom', 'left']);
    });

    it('should return correct connections for T pipes', () => {
      expect(getPipeConnections('t_top')).toEqual(['left', 'right', 'top']);
      expect(getPipeConnections('t_bottom')).toEqual(['left', 'right', 'bottom']);
      expect(getPipeConnections('t_left')).toEqual(['top', 'bottom', 'left']);
      expect(getPipeConnections('t_right')).toEqual(['top', 'bottom', 'right']);
    });
  });

  describe('canFlowThrough', () => {
    it('should return true when pipe has matching connection', () => {
      // Water coming from left enters through right opening
      expect(canFlowThrough('horizontal', 'left')).toBe(true);
      expect(canFlowThrough('horizontal', 'right')).toBe(true);
    });

    it('should return false when pipe lacks matching connection', () => {
      // Water coming from top can't enter horizontal pipe
      expect(canFlowThrough('horizontal', 'top')).toBe(false);
      expect(canFlowThrough('horizontal', 'bottom')).toBe(false);
    });

    it('should work correctly for elbow pipes', () => {
      // elbow_br connects bottom and right
      expect(canFlowThrough('elbow_br', 'top')).toBe(true); // enters through bottom
      expect(canFlowThrough('elbow_br', 'left')).toBe(true); // enters through right
      expect(canFlowThrough('elbow_br', 'bottom')).toBe(false);
      expect(canFlowThrough('elbow_br', 'right')).toBe(false);
    });

    it('should accept all directions for cross pipe', () => {
      expect(canFlowThrough('cross', 'top')).toBe(true);
      expect(canFlowThrough('cross', 'right')).toBe(true);
      expect(canFlowThrough('cross', 'bottom')).toBe(true);
      expect(canFlowThrough('cross', 'left')).toBe(true);
    });
  });

  describe('getExitDirections', () => {
    it('should return opposite direction for straight pipes', () => {
      expect(getExitDirections('horizontal', 'left')).toEqual(['left']);
      expect(getExitDirections('horizontal', 'right')).toEqual(['right']);
      expect(getExitDirections('vertical', 'top')).toEqual(['top']);
      expect(getExitDirections('vertical', 'bottom')).toEqual(['bottom']);
    });

    it('should return perpendicular direction for elbow pipes', () => {
      // Water from left enters through right, exits through bottom
      expect(getExitDirections('elbow_br', 'left')).toEqual(['bottom']);
      // Water from top enters through bottom, exits through right
      expect(getExitDirections('elbow_br', 'top')).toEqual(['right']);
    });

    it('should return empty array when cannot enter', () => {
      expect(getExitDirections('horizontal', 'top')).toEqual([]);
    });

    it('should return multiple exits for cross pipe', () => {
      // Water from left enters through right, can exit through top, bottom, left
      const exits = getExitDirections('cross', 'left');
      expect(exits).toContain('top');
      expect(exits).toContain('bottom');
      expect(exits).toContain('left');
      expect(exits).not.toContain('right');
    });
  });

  describe('getOppositeDirection', () => {
    it('should return opposite directions', () => {
      expect(getOppositeDirection('top')).toBe('bottom');
      expect(getOppositeDirection('bottom')).toBe('top');
      expect(getOppositeDirection('left')).toBe('right');
      expect(getOppositeDirection('right')).toBe('left');
    });
  });

  describe('generateRandomPipe', () => {
    it('should return a valid pipe type', () => {
      for (let i = 0; i < 100; i++) {
        const pipe = generateRandomPipe();
        expect(getPipeConnections(pipe)).toBeDefined();
      }
    });
  });

  describe('createPipe', () => {
    it('should create pipe with correct properties', () => {
      const pipe = createPipe('horizontal');
      expect(pipe.type).toBe('horizontal');
      expect(pipe.connections).toEqual(['left', 'right']);
      expect(pipe.waterLevel).toBe(0);
      expect(pipe.waterFrom).toBeNull();
    });
  });

  describe('isCrossPipe', () => {
    it('should return true only for cross pipe', () => {
      expect(isCrossPipe('cross')).toBe(true);
      expect(isCrossPipe('horizontal')).toBe(false);
      expect(isCrossPipe('vertical')).toBe(false);
      expect(isCrossPipe('elbow_br')).toBe(false);
    });
  });
});
