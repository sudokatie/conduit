'use client';

import { GameState } from '../game/types';
import { MIN_LENGTH } from '../game/constants';

interface GameOverProps {
  state: GameState;
  onRestart: () => void;
}

export function GameOver({ state, onRestart }: GameOverProps) {
  const won = state.status === 'won';

  if (state.status !== 'won' && state.status !== 'flooded') {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div
        className={`bg-gray-900 rounded-xl p-8 max-w-sm w-full mx-4 border-2 ${
          won ? 'border-green-500' : 'border-red-500'
        }`}
      >
        {/* Title */}
        <h2
          className={`text-4xl font-bold text-center mb-6 ${
            won ? 'text-green-400' : 'text-red-400'
          }`}
        >
          {won ? 'SUCCESS!' : 'FLOODED!'}
        </h2>

        {/* Stats */}
        <div className="space-y-4 mb-8">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Final Score</span>
            <span className="text-2xl font-bold text-white">{state.score}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-400">Pipe Length</span>
            <span
              className={`text-xl font-medium ${
                state.length >= MIN_LENGTH ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {state.length} / {MIN_LENGTH}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-400">Discards Used</span>
            <span className="text-xl font-medium text-yellow-400">
              {3 - state.discards}
            </span>
          </div>
        </div>

        {/* Message */}
        <p className="text-gray-400 text-center mb-6">
          {won
            ? 'Great job! The water made it through!'
            : state.length < MIN_LENGTH
            ? `You need ${MIN_LENGTH} segments to win. Try placing pipes further ahead!`
            : 'So close! Make sure your pipes connect properly.'}
        </p>

        {/* Restart button */}
        <button
          onClick={onRestart}
          className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          Play Again
        </button>

        {/* Keyboard hint */}
        <p className="text-gray-500 text-sm text-center mt-4">
          Press R to restart
        </p>
      </div>
    </div>
  );
}
