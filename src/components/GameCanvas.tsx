'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Game } from '../game/Game';
import { Renderer } from '../game/Renderer';
import { CANVAS_WIDTH, CANVAS_HEIGHT, CELL_SIZE } from '../game/constants';

interface GameCanvasProps {
  game: Game;
  onGameUpdate: () => void;
}

export function GameCanvas({ game, onGameUpdate }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const lastTimeRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  // Initialize renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    rendererRef.current = new Renderer(canvas);
  }, []);

  // Game loop
  useEffect(() => {
    const gameLoop = (timestamp: number) => {
      if (!rendererRef.current) {
        rafRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      // Calculate delta time
      const deltaTime = lastTimeRef.current
        ? (timestamp - lastTimeRef.current) / 1000
        : 0;
      lastTimeRef.current = timestamp;

      // Update game state
      const status = game.getStatus();
      if (status === 'waiting' || status === 'playing') {
        game.update(deltaTime);
        onGameUpdate();
      }

      // Render
      rendererRef.current.render(game);

      // Draw overlays based on status
      const state = game.getState();
      if (status === 'waiting' && state.countdown > 0) {
        rendererRef.current.drawCountdown(state.countdown);
      } else if (state.paused) {
        rendererRef.current.drawPaused();
      } else if (status === 'flooded' || status === 'won') {
        rendererRef.current.drawGameOver(
          status === 'won',
          state.score,
          state.length
        );
      }

      rafRef.current = requestAnimationFrame(gameLoop);
    };

    rafRef.current = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [game, onGameUpdate]);

  // Handle click to place pipe
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
      const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);

      if (game.canPlaceAt(x, y)) {
        game.placePipe(x, y);
        onGameUpdate();
      }
    },
    [game, onGameUpdate]
  );

  // Handle touch to place pipe (same as click)
  const handleTouch = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const canvas = canvasRef.current;
      if (!canvas || e.changedTouches.length !== 1) return;

      const touch = e.changedTouches[0];
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((touch.clientX - rect.left) / CELL_SIZE);
      const y = Math.floor((touch.clientY - rect.top) / CELL_SIZE);

      if (game.canPlaceAt(x, y)) {
        game.placePipe(x, y);
        onGameUpdate();
      }
    },
    [game, onGameUpdate]
  );

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      onClick={handleClick}
      onTouchEnd={handleTouch}
      className="border-2 border-gray-700 rounded cursor-pointer"
    />
  );
}
