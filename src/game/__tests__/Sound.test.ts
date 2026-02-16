import { Sound } from '../Sound';

describe('Sound System', () => {
  beforeEach(() => {
    Sound.resetContext();
    Sound.setEnabled(true);
    Sound.setVolume(0.3);
  });

  describe('singleton pattern', () => {
    it('returns the same instance', () => {
      const instance1 = Sound;
      const instance2 = Sound;
      expect(instance1).toBe(instance2);
    });
  });

  describe('enabled state', () => {
    it('can be enabled and disabled', () => {
      Sound.setEnabled(false);
      expect(Sound.isEnabled()).toBe(false);

      Sound.setEnabled(true);
      expect(Sound.isEnabled()).toBe(true);
    });

    it('does not throw when playing while disabled', () => {
      Sound.setEnabled(false);
      expect(() => Sound.play('pipePlace')).not.toThrow();
    });
  });

  describe('volume control', () => {
    it('can set and get volume', () => {
      Sound.setVolume(0.5);
      expect(Sound.getVolume()).toBe(0.5);
    });

    it('clamps volume to 0-1 range', () => {
      Sound.setVolume(-0.5);
      expect(Sound.getVolume()).toBe(0);

      Sound.setVolume(1.5);
      expect(Sound.getVolume()).toBe(1);
    });
  });

  describe('sound playback', () => {
    it('plays pipePlace sound without error', () => {
      expect(() => Sound.play('pipePlace')).not.toThrow();
    });

    it('plays pipeDiscard sound without error', () => {
      expect(() => Sound.play('pipeDiscard')).not.toThrow();
    });

    it('plays waterFlow sound without error', () => {
      expect(() => Sound.play('waterFlow')).not.toThrow();
    });

    it('plays countdown sound without error', () => {
      expect(() => Sound.play('countdown')).not.toThrow();
    });

    it('plays levelComplete sound without error', () => {
      expect(() => Sound.play('levelComplete')).not.toThrow();
    });

    it('plays levelFail sound without error', () => {
      expect(() => Sound.play('levelFail')).not.toThrow();
    });
  });
});
