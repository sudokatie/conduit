import type { Position } from './types';

/**
 * Types of actions that can be recorded
 */
export type ReplayAction = 
  | { type: 'place'; x: number; y: number }
  | { type: 'discard' };

/**
 * A single recorded action with timestamp
 */
export interface ReplayFrame {
  time: number;      // ms since replay start
  action: ReplayAction;
}

/**
 * Complete replay data for a game session
 */
export interface ReplayData {
  version: number;
  timestamp: number;     // Unix timestamp when recorded
  duration: number;      // Total replay duration in ms
  frames: ReplayFrame[];
  finalScore: number;
  pipeLength: number;
  dailyMode: boolean;
  dailyLevelIndex: number;  // For daily mode
}

/**
 * Encodes an action to a compact string
 */
function encodeAction(action: ReplayAction): string {
  if (action.type === 'place') {
    return `p${action.x},${action.y}`;
  } else {
    return 'd';
  }
}

/**
 * Decodes a string back to action
 */
function decodeAction(str: string): ReplayAction | null {
  if (str.startsWith('p')) {
    const coords = str.slice(1).split(',');
    if (coords.length === 2) {
      const x = parseInt(coords[0], 10);
      const y = parseInt(coords[1], 10);
      if (!isNaN(x) && !isNaN(y)) {
        return { type: 'place', x, y };
      }
    }
    return null;
  } else if (str === 'd') {
    return { type: 'discard' };
  }
  return null;
}

/**
 * Replay recorder and player for Conduit
 */
export class Replay {
  private _frames: ReplayFrame[] = [];
  private _startTime: number = 0;
  private _isRecording: boolean = false;
  private _isPlaying: boolean = false;
  private _playbackIndex: number = 0;
  private _playbackStartTime: number = 0;
  private _dailyMode: boolean = false;
  private _dailyLevelIndex: number = 0;

  /**
   * Start recording actions
   */
  startRecording(dailyMode: boolean = false, dailyLevelIndex: number = 0): void {
    this._frames = [];
    this._startTime = Date.now();
    this._isRecording = true;
    this._isPlaying = false;
    this._dailyMode = dailyMode;
    this._dailyLevelIndex = dailyLevelIndex;
  }

  /**
   * Record a pipe placement
   */
  recordPlace(x: number, y: number): void {
    if (!this._isRecording) return;
    
    this._frames.push({
      time: Date.now() - this._startTime,
      action: { type: 'place', x, y },
    });
  }

  /**
   * Record a discard action
   */
  recordDiscard(): void {
    if (!this._isRecording) return;
    
    this._frames.push({
      time: Date.now() - this._startTime,
      action: { type: 'discard' },
    });
  }

  /**
   * Stop recording and return the replay data
   */
  stopRecording(finalScore: number, pipeLength: number): ReplayData {
    this._isRecording = false;
    
    return {
      version: 1,
      timestamp: this._startTime,
      duration: Date.now() - this._startTime,
      frames: [...this._frames],
      finalScore,
      pipeLength,
      dailyMode: this._dailyMode,
      dailyLevelIndex: this._dailyLevelIndex,
    };
  }

  /**
   * Check if currently recording
   */
  get isRecording(): boolean {
    return this._isRecording;
  }

  /**
   * Start playback of a replay
   */
  startPlayback(data: ReplayData): void {
    this._frames = [...data.frames];
    this._playbackIndex = 0;
    this._playbackStartTime = Date.now();
    this._isPlaying = true;
    this._isRecording = false;
    this._dailyMode = data.dailyMode;
    this._dailyLevelIndex = data.dailyLevelIndex;
  }

  /**
   * Get next action if its time has come
   * Returns null if no action ready or playback complete
   */
  getNextAction(): ReplayAction | null {
    if (!this._isPlaying || this._playbackIndex >= this._frames.length) {
      return null;
    }

    const elapsed = Date.now() - this._playbackStartTime;
    const frame = this._frames[this._playbackIndex];

    if (elapsed >= frame.time) {
      this._playbackIndex++;
      return frame.action;
    }

    return null;
  }

  /**
   * Check if playback is complete
   */
  get isPlaybackComplete(): boolean {
    return this._isPlaying && this._playbackIndex >= this._frames.length;
  }

  /**
   * Check if currently playing back
   */
  get isPlaying(): boolean {
    return this._isPlaying;
  }

  /**
   * Stop playback
   */
  stopPlayback(): void {
    this._isPlaying = false;
    this._playbackIndex = 0;
  }

  /**
   * Get playback progress (0-1)
   */
  get playbackProgress(): number {
    if (!this._isPlaying || this._frames.length === 0) return 0;
    return this._playbackIndex / this._frames.length;
  }

  /**
   * Get daily mode flag for current replay
   */
  get dailyMode(): boolean {
    return this._dailyMode;
  }

  /**
   * Encode replay data to a shareable string
   * Format: version|timestamp|duration|score|length|daily|dailyIdx|frames
   * Frames: time,action;time,action;...
   */
  static encode(data: ReplayData): string {
    const framesStr = data.frames
      .map(f => `${f.time},${encodeAction(f.action)}`)
      .join(';');
    
    const parts = [
      data.version,
      data.timestamp,
      data.duration,
      data.finalScore,
      data.pipeLength,
      data.dailyMode ? 1 : 0,
      data.dailyLevelIndex,
      framesStr,
    ];
    
    return btoa(parts.join('|'));
  }

  /**
   * Decode a replay string back to ReplayData
   */
  static decode(encoded: string): ReplayData | null {
    try {
      const decoded = atob(encoded);
      const parts = decoded.split('|');
      
      if (parts.length < 8) return null;
      
      const [version, timestamp, duration, score, length, daily, dailyIdx, framesStr] = parts;
      
      const frames: ReplayFrame[] = framesStr
        .split(';')
        .filter(f => f.length > 0)
        .map(f => {
          const commaIdx = f.indexOf(',');
          if (commaIdx === -1) return null;
          const time = parseInt(f.slice(0, commaIdx), 10);
          const action = decodeAction(f.slice(commaIdx + 1));
          if (isNaN(time) || !action) return null;
          return { time, action };
        })
        .filter((f): f is ReplayFrame => f !== null);
      
      return {
        version: parseInt(version, 10),
        timestamp: parseInt(timestamp, 10),
        duration: parseInt(duration, 10),
        frames,
        finalScore: parseInt(score, 10),
        pipeLength: parseInt(length, 10),
        dailyMode: daily === '1',
        dailyLevelIndex: parseInt(dailyIdx, 10),
      };
    } catch {
      return null;
    }
  }

  /**
   * Get replay statistics
   */
  static getStats(data: ReplayData): {
    totalActions: number;
    placeCount: number;
    discardCount: number;
    actionsPerSecond: number;
    durationSeconds: number;
  } {
    let placeCount = 0;
    let discardCount = 0;
    
    for (const frame of data.frames) {
      if (frame.action.type === 'place') {
        placeCount++;
      } else {
        discardCount++;
      }
    }
    
    const durationSec = data.duration / 1000;
    
    return {
      totalActions: data.frames.length,
      placeCount,
      discardCount,
      actionsPerSecond: durationSec > 0 ? data.frames.length / durationSec : 0,
      durationSeconds: durationSec,
    };
  }

  /**
   * Generate share code for a replay
   */
  static generateShareCode(data: ReplayData): string {
    const dateStr = new Date(data.timestamp).toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = data.dailyMode ? 'CONDUIT-D' : 'CONDUIT';
    return `${prefix}-${dateStr}-S${data.finalScore}-P${data.pipeLength}`;
  }
}
