import { Direction, PipeType } from './types';

// Grid
export const GRID_WIDTH = 7;
export const GRID_HEIGHT = 10;
export const CELL_SIZE = 50;
export const CANVAS_WIDTH = GRID_WIDTH * CELL_SIZE;
export const CANVAS_HEIGHT = GRID_HEIGHT * CELL_SIZE;

// Timing
export const START_DELAY = 5; // Seconds before water flows
export const FLOW_INTERVAL = 1; // Seconds per segment
export const MIN_LENGTH = 10; // Minimum segments to win

// Queue
export const QUEUE_SIZE = 5;
export const MAX_DISCARDS = 3;

// Scoring
export const POINTS_PER_SEGMENT = 10;
export const CROSS_BONUS = 25;
export const NO_DISCARD_BONUS = 200;
export const SPEED_BONUS_PER_SECOND = 10;
export const PAR_TIME = 30; // Par time in seconds for speed bonus

// Pipe definitions with connections
export const PIPE_CONNECTIONS: Record<PipeType, Direction[]> = {
  horizontal: ['left', 'right'],
  vertical: ['top', 'bottom'],
  elbow_tl: ['top', 'left'],
  elbow_tr: ['top', 'right'],
  elbow_bl: ['bottom', 'left'],
  elbow_br: ['bottom', 'right'],
  cross: ['top', 'right', 'bottom', 'left'],
  t_top: ['left', 'right', 'top'],
  t_bottom: ['left', 'right', 'bottom'],
  t_left: ['top', 'bottom', 'left'],
  t_right: ['top', 'bottom', 'right'],
};

// Pipe generation weights (must sum to 100)
export const PIPE_WEIGHTS: Record<PipeType, number> = {
  horizontal: 20,
  vertical: 20,
  elbow_tl: 8,
  elbow_tr: 8,
  elbow_bl: 8,
  elbow_br: 8,
  cross: 8,
  t_top: 5,
  t_bottom: 5,
  t_left: 5,
  t_right: 5,
};

// Colors
export const COLORS = {
  background: '#1a1a2e',
  grid: '#2d2d44',
  gridLine: '#3d3d5c',
  pipe: '#4a90d9',
  pipeStroke: '#2d5a8a',
  water: '#00bfff',
  waterGlow: 'rgba(0, 191, 255, 0.3)',
  entry: '#00ff00',
  entryGlow: 'rgba(0, 255, 0, 0.3)',
  flood: '#ff4444',
  floodGlow: 'rgba(255, 68, 68, 0.5)',
  empty: '#1a1a2e',
  ui: {
    panel: '#2d2d44',
    button: '#3d3d5c',
    buttonHover: '#4d4d6c',
    text: '#ffffff',
    muted: '#888888',
    accent: '#00bfff',
    warning: '#ffaa00',
    danger: '#ff4444',
  },
};

// Direction utilities
export const OPPOSITE_DIRECTION: Record<Direction, Direction> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

export const DIRECTION_OFFSET: Record<Direction, { dx: number; dy: number }> = {
  top: { dx: 0, dy: -1 },
  bottom: { dx: 0, dy: 1 },
  left: { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 },
};
