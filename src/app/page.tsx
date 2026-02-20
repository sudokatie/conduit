'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Game } from '../game/Game';
import { GameCanvas } from '../components/GameCanvas';
import { HUD } from '../components/HUD';
import { Queue } from '../components/Queue';
import { GameOver } from '../components/GameOver';
import { PauseMenu } from '../components/PauseMenu';

export default function Home() {
  const gameRef = useRef<Game | null>(null);
  const [, forceUpdate] = useState({});

  // Initialize game
  useEffect(() => {
    gameRef.current = new Game();
    gameRef.current.start();
    forceUpdate({});
  }, []);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameRef.current) return;

      switch (e.key.toLowerCase()) {
        case 'd':
          gameRef.current.discard();
          forceUpdate({});
          break;
        case 'r':
          gameRef.current.restart();
          forceUpdate({});
          break;
        case 'p':
          gameRef.current.togglePause();
          forceUpdate({});
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleGameUpdate = useCallback(() => {
    forceUpdate({});
  }, []);

  const handleDiscard = useCallback(() => {
    if (gameRef.current) {
      gameRef.current.discard();
      forceUpdate({});
    }
  }, []);

  const handleRestart = useCallback(() => {
    if (gameRef.current) {
      gameRef.current.restart();
      forceUpdate({});
    }
  }, []);

  const handleTogglePause = useCallback(() => {
    if (gameRef.current) {
      gameRef.current.togglePause();
      forceUpdate({});
    }
  }, []);

  if (!gameRef.current) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const game = gameRef.current;
  const state = game.getState();

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      {/* Title */}
      <h1 className="text-4xl font-bold text-cyan-400 mb-6">Conduit</h1>

      {/* Game layout */}
      <div className="flex gap-6">
        {/* Main game area */}
        <GameCanvas game={game} onGameUpdate={handleGameUpdate} />

        {/* Side panel */}
        <div className="flex flex-col gap-4 w-48">
          <HUD state={state} />
          <Queue
            queue={game.getQueue()}
            onDiscard={handleDiscard}
            discardsRemaining={state.discards}
          />

          {/* Restart button */}
          <button
            onClick={handleRestart}
            className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            Restart (R)
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 text-gray-500 text-sm text-center">
        <p>Click to place pipes | D to discard | P to pause | R to restart</p>
        <p className="mt-1">Connect {10}+ segments before the water floods!</p>
      </div>

      {/* Game over modal */}
      <GameOver state={state} onRestart={handleRestart} />

      {/* Pause menu */}
      {state.paused && <PauseMenu onResume={handleTogglePause} />}
    </div>
  );
}
