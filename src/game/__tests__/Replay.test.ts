import { Replay, ReplayData } from '../Replay';

describe('Replay', () => {
  let replay: Replay;

  beforeEach(() => {
    replay = new Replay();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('recording', () => {
    it('should start and stop recording', () => {
      replay.startRecording(false, 0);
      expect(replay.isRecording).toBe(true);

      const data = replay.stopRecording(1500, 10);
      expect(replay.isRecording).toBe(false);
      expect(data.finalScore).toBe(1500);
      expect(data.pipeLength).toBe(10);
    });

    it('should record place actions with timestamps', () => {
      replay.startRecording(false, 0);

      replay.recordPlace(3, 4);
      jest.advanceTimersByTime(100);
      replay.recordPlace(5, 6);

      const data = replay.stopRecording(0, 0);
      expect(data.frames).toHaveLength(2);
      expect(data.frames[0].action).toEqual({ type: 'place', x: 3, y: 4 });
      expect(data.frames[1].action).toEqual({ type: 'place', x: 5, y: 6 });
    });

    it('should record discard actions', () => {
      replay.startRecording(false, 0);

      replay.recordDiscard();
      jest.advanceTimersByTime(50);
      replay.recordPlace(1, 1);
      jest.advanceTimersByTime(50);
      replay.recordDiscard();

      const data = replay.stopRecording(0, 0);
      expect(data.frames).toHaveLength(3);
      expect(data.frames[0].action).toEqual({ type: 'discard' });
      expect(data.frames[1].action).toEqual({ type: 'place', x: 1, y: 1 });
      expect(data.frames[2].action).toEqual({ type: 'discard' });
    });

    it('should not record when not recording', () => {
      replay.recordPlace(1, 1);
      replay.recordDiscard();

      replay.startRecording(false, 0);
      const data = replay.stopRecording(0, 0);
      expect(data.frames).toHaveLength(0);
    });

    it('should store daily mode and index', () => {
      replay.startRecording(true, 2);
      const data = replay.stopRecording(0, 0);

      expect(data.dailyMode).toBe(true);
      expect(data.dailyLevelIndex).toBe(2);
    });
  });

  describe('playback', () => {
    const testData: ReplayData = {
      version: 1,
      timestamp: Date.now(),
      duration: 500,
      frames: [
        { time: 0, action: { type: 'place', x: 1, y: 2 } },
        { time: 100, action: { type: 'discard' } },
        { time: 200, action: { type: 'place', x: 3, y: 4 } },
      ],
      finalScore: 1000,
      pipeLength: 5,
      dailyMode: false,
      dailyLevelIndex: 0,
    };

    it('should start playback', () => {
      replay.startPlayback(testData);
      expect(replay.isPlaying).toBe(true);
      expect(replay.playbackProgress).toBe(0);
    });

    it('should return actions at correct times', () => {
      replay.startPlayback(testData);

      // First frame should be immediate
      expect(replay.getNextAction()).toEqual({ type: 'place', x: 1, y: 2 });
      expect(replay.playbackProgress).toBeCloseTo(0.33, 1);

      // Second frame at 100ms
      expect(replay.getNextAction()).toBe(null);
      jest.advanceTimersByTime(100);
      expect(replay.getNextAction()).toEqual({ type: 'discard' });

      // Third frame at 200ms
      jest.advanceTimersByTime(100);
      expect(replay.getNextAction()).toEqual({ type: 'place', x: 3, y: 4 });
      expect(replay.playbackProgress).toBe(1);
    });

    it('should detect playback complete', () => {
      replay.startPlayback(testData);

      for (let i = 0; i < 3; i++) {
        jest.advanceTimersByTime(100);
        replay.getNextAction();
      }

      expect(replay.isPlaybackComplete).toBe(true);
    });

    it('should stop playback', () => {
      replay.startPlayback(testData);
      replay.stopPlayback();

      expect(replay.isPlaying).toBe(false);
      expect(replay.playbackProgress).toBe(0);
    });
  });

  describe('encode/decode', () => {
    const testData: ReplayData = {
      version: 1,
      timestamp: 1234567890000,
      duration: 5000,
      frames: [
        { time: 0, action: { type: 'place', x: 2, y: 3 } },
        { time: 500, action: { type: 'discard' } },
        { time: 1000, action: { type: 'place', x: 4, y: 5 } },
      ],
      finalScore: 2500,
      pipeLength: 15,
      dailyMode: false,
      dailyLevelIndex: 0,
    };

    it('should encode and decode replay data', () => {
      const encoded = Replay.encode(testData);
      expect(typeof encoded).toBe('string');
      expect(encoded.length).toBeGreaterThan(0);

      const decoded = Replay.decode(encoded);
      expect(decoded).not.toBeNull();
      expect(decoded!.version).toBe(testData.version);
      expect(decoded!.finalScore).toBe(testData.finalScore);
      expect(decoded!.pipeLength).toBe(testData.pipeLength);
      expect(decoded!.frames).toHaveLength(testData.frames.length);
    });

    it('should preserve frame data through encode/decode', () => {
      const encoded = Replay.encode(testData);
      const decoded = Replay.decode(encoded)!;

      for (let i = 0; i < testData.frames.length; i++) {
        expect(decoded.frames[i].time).toBe(testData.frames[i].time);
        expect(decoded.frames[i].action).toEqual(testData.frames[i].action);
      }
    });

    it('should handle daily mode flag', () => {
      const dailyData = { ...testData, dailyMode: true, dailyLevelIndex: 2 };
      const encoded = Replay.encode(dailyData);
      const decoded = Replay.decode(encoded)!;

      expect(decoded.dailyMode).toBe(true);
      expect(decoded.dailyLevelIndex).toBe(2);
    });

    it('should return null for invalid encoded data', () => {
      expect(Replay.decode('invalid')).toBeNull();
      expect(Replay.decode('')).toBeNull();
      expect(Replay.decode('!!!')).toBeNull();
    });

    it('should handle empty frames', () => {
      const emptyData = { ...testData, frames: [] };
      const encoded = Replay.encode(emptyData);
      const decoded = Replay.decode(encoded)!;

      expect(decoded.frames).toHaveLength(0);
    });
  });

  describe('getStats', () => {
    it('should calculate action counts', () => {
      const data: ReplayData = {
        version: 1,
        timestamp: Date.now(),
        duration: 5000,
        frames: [
          { time: 0, action: { type: 'place', x: 1, y: 1 } },
          { time: 100, action: { type: 'place', x: 2, y: 2 } },
          { time: 200, action: { type: 'discard' } },
          { time: 300, action: { type: 'place', x: 3, y: 3 } },
          { time: 400, action: { type: 'discard' } },
        ],
        finalScore: 1000,
        pipeLength: 10,
        dailyMode: false,
        dailyLevelIndex: 0,
      };

      const stats = Replay.getStats(data);

      expect(stats.placeCount).toBe(3);
      expect(stats.discardCount).toBe(2);
      expect(stats.totalActions).toBe(5);
    });

    it('should calculate actions per second', () => {
      const data: ReplayData = {
        version: 1,
        timestamp: Date.now(),
        duration: 2000, // 2 seconds
        frames: [
          { time: 0, action: { type: 'place', x: 0, y: 0 } },
          { time: 500, action: { type: 'place', x: 1, y: 1 } },
          { time: 1000, action: { type: 'place', x: 2, y: 2 } },
          { time: 1500, action: { type: 'place', x: 3, y: 3 } },
        ],
        finalScore: 500,
        pipeLength: 4,
        dailyMode: false,
        dailyLevelIndex: 0,
      };

      const stats = Replay.getStats(data);

      expect(stats.actionsPerSecond).toBe(2); // 4 actions / 2 seconds
      expect(stats.durationSeconds).toBe(2);
    });
  });

  describe('generateShareCode', () => {
    it('should generate share code for normal mode', () => {
      const data: ReplayData = {
        version: 1,
        timestamp: new Date('2026-03-07').getTime(),
        duration: 5000,
        frames: [],
        finalScore: 3000,
        pipeLength: 20,
        dailyMode: false,
        dailyLevelIndex: 0,
      };

      const code = Replay.generateShareCode(data);

      expect(code).toContain('CONDUIT-');
      expect(code).toContain('-S3000-');
      expect(code).toContain('-P20');
    });

    it('should generate share code for daily mode', () => {
      const data: ReplayData = {
        version: 1,
        timestamp: new Date('2026-03-07').getTime(),
        duration: 5000,
        frames: [],
        finalScore: 5000,
        pipeLength: 30,
        dailyMode: true,
        dailyLevelIndex: 0,
      };

      const code = Replay.generateShareCode(data);

      expect(code).toContain('CONDUIT-D-');
      expect(code).toContain('-S5000-');
      expect(code).toContain('-P30');
    });
  });
});
