/**
 * Sound system for Conduit using Web Audio API.
 * Generates retro-style synthesized sounds.
 */

type SoundType =
  | 'pipePlace'
  | 'pipeDiscard'
  | 'waterFlow'
  | 'countdown'
  | 'levelComplete'
  | 'levelFail';

class SoundSystem {
  private static instance: SoundSystem;
  private context: AudioContext | null = null;
  private enabled: boolean = true;
  private volume: number = 0.3;

  private constructor() {}

  static getInstance(): SoundSystem {
    if (!SoundSystem.instance) {
      SoundSystem.instance = new SoundSystem();
    }
    return SoundSystem.instance;
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.context) {
      try {
        this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch {
        return null;
      }
    }

    if (this.context.state === 'suspended') {
      this.context.resume();
    }

    return this.context;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  getVolume(): number {
    return this.volume;
  }

  resetContext(): void {
    this.context = null;
  }

  play(sound: SoundType): void {
    if (!this.enabled) return;

    const ctx = this.getContext();
    if (!ctx) return;

    switch (sound) {
      case 'pipePlace':
        this.playPipePlace(ctx);
        break;
      case 'pipeDiscard':
        this.playPipeDiscard(ctx);
        break;
      case 'waterFlow':
        this.playWaterFlow(ctx);
        break;
      case 'countdown':
        this.playCountdown(ctx);
        break;
      case 'levelComplete':
        this.playLevelComplete(ctx);
        break;
      case 'levelFail':
        this.playLevelFail(ctx);
        break;
    }
  }

  private playPipePlace(ctx: AudioContext): void {
    // Satisfying click/clunk for placing pipe
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(this.volume * 0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);
  }

  private playPipeDiscard(ctx: AudioContext): void {
    // Dismissive "whoosh" down
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(500, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(this.volume * 0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.12);
  }

  private playWaterFlow(ctx: AudioContext): void {
    // Bubbling water sound
    const bufferSize = ctx.sampleRate * 0.1;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize;
      // Mix of noise and sine for water bubble effect
      const noise = (Math.random() * 2 - 1) * 0.3;
      const bubble = Math.sin(2 * Math.PI * 200 * t * (1 + Math.sin(t * 30)));
      data[i] = (noise + bubble * 0.7) * Math.exp(-t * 8);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(this.volume * 0.15, ctx.currentTime);

    noise.connect(gain);
    gain.connect(ctx.destination);

    noise.start(ctx.currentTime);
  }

  private playCountdown(ctx: AudioContext): void {
    // Sharp tick
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'square';
    osc.frequency.setValueAtTime(880, ctx.currentTime);

    gain.gain.setValueAtTime(this.volume * 0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  }

  private playLevelComplete(ctx: AudioContext): void {
    // Triumphant rising fanfare
    const melody = [
      { freq: 523.25, time: 0, dur: 0.12 },      // C5
      { freq: 659.25, time: 0.12, dur: 0.12 },   // E5
      { freq: 783.99, time: 0.24, dur: 0.12 },   // G5
      { freq: 1046.50, time: 0.36, dur: 0.25 },  // C6
    ];

    melody.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'square';
      osc.frequency.value = freq;

      const startTime = ctx.currentTime + time;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(this.volume * 0.3, startTime + 0.02);
      gain.gain.setValueAtTime(this.volume * 0.3, startTime + dur - 0.03);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + dur);

      osc.start(startTime);
      osc.stop(startTime + dur);
    });
  }

  private playLevelFail(ctx: AudioContext): void {
    // Sad descending tone
    const melody = [
      { freq: 392, time: 0, dur: 0.2 },       // G4
      { freq: 349.23, time: 0.2, dur: 0.2 },  // F4
      { freq: 293.66, time: 0.4, dur: 0.3 },  // D4
    ];

    melody.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sawtooth';
      osc.frequency.value = freq;

      const startTime = ctx.currentTime + time;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(this.volume * 0.3, startTime + 0.02);
      gain.gain.setValueAtTime(this.volume * 0.3, startTime + dur - 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + dur);

      osc.start(startTime);
      osc.stop(startTime + dur);
    });
  }
}

export const Sound = SoundSystem.getInstance();
