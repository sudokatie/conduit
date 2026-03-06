'use client';

import { useState } from 'react';
import { DailyLeaderboard, todayString, generateShareCode } from '@/game/Daily';

interface DailyCompleteProps {
  totalScore: number;
  totalPipes: number;
  levelsCompleted: number;
  timeSeconds: number;
  onSubmit: (name: string) => void;
  onClose: () => void;
}

export function DailyComplete({
  totalScore,
  totalPipes,
  levelsCompleted,
  timeSeconds,
  onSubmit,
  onClose,
}: DailyCompleteProps) {
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [rank, setRank] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const shareCode = generateShareCode(todayString(), totalScore, levelsCompleted);
  const leaderboard = DailyLeaderboard.getToday();

  const handleSubmit = () => {
    if (!name.trim()) return;
    const newRank = DailyLeaderboard.recordScore(
      name.trim(),
      totalScore,
      totalPipes,
      levelsCompleted,
      timeSeconds
    );
    setRank(newRank);
    setSubmitted(true);
    onSubmit(name.trim());
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-cyan-400 text-center mb-4">
          DAILY COMPLETE!
        </h2>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-700 rounded p-3 text-center">
            <div className="text-2xl font-bold text-white">{totalScore}</div>
            <div className="text-xs text-gray-400">Total Score</div>
          </div>
          <div className="bg-gray-700 rounded p-3 text-center">
            <div className="text-2xl font-bold text-white">{totalPipes}</div>
            <div className="text-xs text-gray-400">Total Pipes</div>
          </div>
          <div className="bg-gray-700 rounded p-3 text-center">
            <div className="text-2xl font-bold text-white">{levelsCompleted}</div>
            <div className="text-xs text-gray-400">Rounds</div>
          </div>
          <div className="bg-gray-700 rounded p-3 text-center">
            <div className="text-2xl font-bold text-white">{formatTime(timeSeconds)}</div>
            <div className="text-xs text-gray-400">Time</div>
          </div>
        </div>

        {/* Name Input / Rank Display */}
        {!submitted ? (
          <div className="mb-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              maxLength={20}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-cyan-500 focus:outline-none mb-2"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              autoFocus
            />
            <button
              onClick={handleSubmit}
              disabled={!name.trim()}
              className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded transition-colors"
            >
              Submit Score
            </button>
          </div>
        ) : (
          <div className="mb-4 text-center">
            {rank && (
              <div className="text-xl font-bold text-cyan-400 mb-2">
                Rank #{rank}
              </div>
            )}
          </div>
        )}

        {/* Share Code */}
        <div className="mb-4">
          <div className="text-xs text-gray-400 mb-1">Share Code:</div>
          <div className="flex gap-2">
            <code className="flex-1 px-3 py-2 bg-gray-900 text-cyan-400 rounded font-mono text-sm">
              {shareCode}
            </code>
            <button
              onClick={handleCopy}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Leaderboard */}
        {leaderboard.length > 0 && (
          <div className="mb-4">
            <div className="text-sm font-medium text-gray-300 mb-2">Today's Best:</div>
            <div className="bg-gray-900 rounded p-2 max-h-40 overflow-y-auto">
              {leaderboard.slice(0, 5).map((entry, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center py-1 px-2 text-sm"
                >
                  <span className="text-gray-400">#{i + 1}</span>
                  <span className="text-white flex-1 ml-2 truncate">{entry.name}</span>
                  <span className="text-cyan-400 ml-2">{entry.score}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
