'use client';

import { DailyLeaderboard } from '@/game/Daily';

interface TitleScreenProps {
  onStart: () => void;
  onStartDaily: () => void;
}

export function TitleScreen({ onStart, onStartDaily }: TitleScreenProps) {
  const dailyBest = DailyLeaderboard.getBest();

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-8">
      <h1 className="text-6xl font-bold text-cyan-400 mb-4">CONDUIT</h1>
      <p className="text-gray-400 text-lg mb-12">Connect the pipes before the flood!</p>

      <div className="flex flex-col gap-4 w-full max-w-md">
        {/* Daily Challenge Button */}
        <button
          onClick={onStartDaily}
          className="w-full py-4 px-6 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 rounded-lg text-white font-bold transition-all"
        >
          <div className="text-xl">DAILY CHALLENGE</div>
          <div className="text-sm opacity-80">
            {dailyBest
              ? `Best: ${dailyBest.score} points (${dailyBest.levelsCompleted} rounds)`
              : '3 rounds - compete for the highest score!'}
          </div>
        </button>

        {/* Normal Play Button */}
        <button
          onClick={onStart}
          className="w-full py-4 px-6 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-bold transition-all"
        >
          <div className="text-xl">PLAY</div>
          <div className="text-sm text-gray-400">Practice mode</div>
        </button>
      </div>

      <div className="mt-12 text-gray-500 text-sm text-center">
        <p className="mb-2">Controls:</p>
        <p>Click to place pipes | D to discard | P to pause</p>
        <p className="mt-1">Connect 10+ segments before the water floods!</p>
      </div>
    </div>
  );
}
