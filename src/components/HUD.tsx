'use client';

import { GameState } from '../game/types';
import { MIN_LENGTH, MAX_DISCARDS } from '../game/constants';

interface HUDProps {
  state: GameState;
}

export function HUD({ state }: HUDProps) {
  const progress = Math.min(state.length / MIN_LENGTH, 1);
  const progressPercent = Math.round(progress * 100);

  return (
    <div className="bg-gray-800 rounded-lg p-4 flex flex-col gap-3">
      {/* Score */}
      <div className="flex justify-between items-center">
        <span className="text-gray-400 text-sm">Score</span>
        <span className="text-white text-xl font-bold">{state.score}</span>
      </div>

      {/* Length Progress */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Length</span>
          <span className="text-white text-sm">
            {state.length} / {MIN_LENGTH}
          </span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-200 ${
              progress >= 1 ? 'bg-green-500' : 'bg-cyan-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Discards */}
      <div className="flex justify-between items-center">
        <span className="text-gray-400 text-sm">Discards</span>
        <div className="flex gap-1">
          {Array.from({ length: MAX_DISCARDS }).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${
                i < state.discards ? 'bg-yellow-500' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Status */}
      <div className="flex justify-between items-center">
        <span className="text-gray-400 text-sm">Status</span>
        <span
          className={`text-sm font-medium ${
            state.status === 'won'
              ? 'text-green-400'
              : state.status === 'flooded'
              ? 'text-red-400'
              : state.status === 'playing'
              ? 'text-cyan-400'
              : 'text-gray-400'
          }`}
        >
          {state.status === 'waiting'
            ? 'Get ready...'
            : state.status === 'playing'
            ? 'Playing'
            : state.status === 'won'
            ? 'Success!'
            : 'Flooded!'}
        </span>
      </div>
    </div>
  );
}
