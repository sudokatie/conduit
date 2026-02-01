export type Direction = 'top' | 'right' | 'bottom' | 'left';

export type PipeType =
  | 'horizontal'
  | 'vertical'
  | 'elbow_tl'
  | 'elbow_tr'
  | 'elbow_bl'
  | 'elbow_br'
  | 'cross'
  | 't_top'
  | 't_bottom'
  | 't_left'
  | 't_right';

export type CellState = 'empty' | 'pipe' | 'entry' | 'flooded';

export type GameStatus = 'waiting' | 'playing' | 'flooded' | 'won';

export interface Position {
  x: number;
  y: number;
}

export interface PipeData {
  type: PipeType;
  connections: Direction[];
  waterLevel: number; // 0-1, how filled with water
  waterFrom: Direction | null; // Direction water entered from
}

export interface Cell {
  state: CellState;
  pipe: PipeData | null;
}

export interface GameState {
  status: GameStatus;
  score: number;
  length: number;
  discards: number;
  countdown: number; // Seconds until water flows
  flowTimer: number; // Time until next flow tick
  paused: boolean; // Game is paused
  elapsedTime: number; // Total time since water started flowing
}

export interface FlowState {
  x: number;
  y: number;
  direction: Direction; // Direction water is flowing
  segments: number;
}
