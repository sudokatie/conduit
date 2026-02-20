'use client';

import { useState } from 'react';
import { Music } from '../game/Music';
import { Sound } from '../game/Sound';

interface PauseMenuProps {
  onResume: () => void;
}

export function PauseMenu({ onResume }: PauseMenuProps) {
  const [musicVolume, setMusicVolume] = useState(Music.getVolume());
  const [soundVolume, setSoundVolume] = useState(Sound.getVolume());
  const [musicEnabled, setMusicEnabled] = useState(Music.isEnabled());
  const [soundEnabled, setSoundEnabled] = useState(Sound.isEnabled());

  const handleMusicVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setMusicVolume(vol);
    Music.setVolume(vol);
  };

  const handleSoundVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setSoundVolume(vol);
    Sound.setVolume(vol);
  };

  const toggleMusic = () => {
    const newState = !musicEnabled;
    setMusicEnabled(newState);
    Music.setEnabled(newState);
  };

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    Sound.setEnabled(newState);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-8 max-w-sm w-full mx-4 shadow-2xl border border-cyan-500/30">
        <h2 className="text-3xl font-bold text-cyan-400 text-center mb-8">PAUSED</h2>

        {/* Music Volume */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="text-gray-300 font-medium">Music</label>
            <button
              onClick={toggleMusic}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                musicEnabled
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                  : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
              }`}
            >
              {musicEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={musicVolume}
            onChange={handleMusicVolumeChange}
            disabled={!musicEnabled}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <div className="text-right text-sm text-gray-500 mt-1">
            {Math.round(musicVolume * 100)}%
          </div>
        </div>

        {/* Sound Volume */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <label className="text-gray-300 font-medium">Sound Effects</label>
            <button
              onClick={toggleSound}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                soundEnabled
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                  : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
              }`}
            >
              {soundEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={soundVolume}
            onChange={handleSoundVolumeChange}
            disabled={!soundEnabled}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <div className="text-right text-sm text-gray-500 mt-1">
            {Math.round(soundVolume * 100)}%
          </div>
        </div>

        {/* Resume Button */}
        <button
          onClick={onResume}
          className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          Resume (P)
        </button>
      </div>
    </div>
  );
}
