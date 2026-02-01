'use client';

import { useEffect, useRef } from 'react';
import { PipeType } from '../game/types';
import { Renderer } from '../game/Renderer';
import { COLORS } from '../game/constants';

interface QueueProps {
  queue: PipeType[];
  onDiscard: () => void;
  discardsRemaining: number;
}

export function Queue({ queue, onDiscard, discardsRemaining }: QueueProps) {
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);

  // Draw pipe previews
  useEffect(() => {
    queue.forEach((pipeType, index) => {
      const canvas = canvasRefs.current[index];
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const size = canvas.width;

      // Clear
      ctx.fillStyle = index === 0 ? COLORS.ui.accent : COLORS.grid;
      ctx.fillRect(0, 0, size, size);

      // Draw border for current piece
      if (index === 0) {
        ctx.strokeStyle = COLORS.ui.accent;
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, size - 2, size - 2);
        ctx.fillStyle = COLORS.grid;
        ctx.fillRect(4, 4, size - 8, size - 8);
      }

      // Draw pipe
      drawPipePreview(ctx, size / 2, size / 2, size * 0.6, pipeType);
    });
  }, [queue]);

  return (
    <div className="bg-gray-800 rounded-lg p-4 flex flex-col gap-3">
      <div className="text-gray-400 text-sm">Next Pieces</div>

      {/* Queue display */}
      <div className="flex gap-2 justify-center">
        {queue.map((_, index) => (
          <canvas
            key={index}
            ref={(el) => {
              canvasRefs.current[index] = el;
            }}
            width={index === 0 ? 50 : 40}
            height={index === 0 ? 50 : 40}
            className={`rounded ${
              index === 0 ? 'border-2 border-cyan-500' : 'opacity-70'
            }`}
          />
        ))}
      </div>

      {/* Discard button */}
      <button
        onClick={onDiscard}
        disabled={discardsRemaining <= 0}
        className={`px-4 py-2 rounded font-medium transition-colors ${
          discardsRemaining > 0
            ? 'bg-yellow-600 hover:bg-yellow-500 text-white'
            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
        }`}
      >
        Discard ({discardsRemaining})
      </button>
    </div>
  );
}

// Helper to draw a pipe preview
function drawPipePreview(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  type: PipeType
): void {
  const radius = size / 2;
  const lineWidth = 6;

  ctx.lineCap = 'round';

  // Outline
  ctx.strokeStyle = COLORS.pipeStroke;
  ctx.lineWidth = lineWidth + 2;
  drawPipeShape(ctx, cx, cy, radius, type);

  // Fill
  ctx.strokeStyle = COLORS.pipe;
  ctx.lineWidth = lineWidth;
  drawPipeShape(ctx, cx, cy, radius, type);
}

function drawPipeShape(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  type: PipeType
): void {
  switch (type) {
    case 'horizontal':
      ctx.beginPath();
      ctx.moveTo(cx - radius, cy);
      ctx.lineTo(cx + radius, cy);
      ctx.stroke();
      break;

    case 'vertical':
      ctx.beginPath();
      ctx.moveTo(cx, cy - radius);
      ctx.lineTo(cx, cy + radius);
      ctx.stroke();
      break;

    case 'elbow_tl':
      ctx.beginPath();
      ctx.arc(cx - radius, cy - radius, radius, 0, Math.PI / 2);
      ctx.stroke();
      break;

    case 'elbow_tr':
      ctx.beginPath();
      ctx.arc(cx + radius, cy - radius, radius, Math.PI / 2, Math.PI);
      ctx.stroke();
      break;

    case 'elbow_bl':
      ctx.beginPath();
      ctx.arc(cx - radius, cy + radius, radius, -Math.PI / 2, 0);
      ctx.stroke();
      break;

    case 'elbow_br':
      ctx.beginPath();
      ctx.arc(cx + radius, cy + radius, radius, Math.PI, -Math.PI / 2);
      ctx.stroke();
      break;

    case 'cross':
      ctx.beginPath();
      ctx.moveTo(cx - radius, cy);
      ctx.lineTo(cx + radius, cy);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy - radius);
      ctx.lineTo(cx, cy + radius);
      ctx.stroke();
      break;

    case 't_top':
      ctx.beginPath();
      ctx.moveTo(cx - radius, cy);
      ctx.lineTo(cx + radius, cy);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx, cy - radius);
      ctx.stroke();
      break;

    case 't_bottom':
      ctx.beginPath();
      ctx.moveTo(cx - radius, cy);
      ctx.lineTo(cx + radius, cy);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx, cy + radius);
      ctx.stroke();
      break;

    case 't_left':
      ctx.beginPath();
      ctx.moveTo(cx, cy - radius);
      ctx.lineTo(cx, cy + radius);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx - radius, cy);
      ctx.stroke();
      break;

    case 't_right':
      ctx.beginPath();
      ctx.moveTo(cx, cy - radius);
      ctx.lineTo(cx, cy + radius);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + radius, cy);
      ctx.stroke();
      break;
  }
}
