import { PipeData, PipeType, Position, Direction } from './types';
import { Game } from './Game';
import { Grid } from './Grid';
import {
  CELL_SIZE,
  GRID_WIDTH,
  GRID_HEIGHT,
  COLORS,
  PIPE_CONNECTIONS,
} from './constants';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D rendering context');
    }
    this.ctx = ctx;
    this.width = canvas.width;
    this.height = canvas.height;
  }

  render(game: Game): void {
    this.clear();
    this.drawGrid(game.getGrid());
    this.drawEntry(game.getGrid());
    this.drawPipes(game.getGrid());
    this.drawWaterPath(game.getFlow().getPath(), game.getGrid());
  }

  private clear(): void {
    this.ctx.fillStyle = COLORS.background;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawGrid(grid: Grid): void {
    const ctx = this.ctx;

    // Draw cell backgrounds
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        const cell = grid.getCell(x, y);
        const px = x * CELL_SIZE;
        const py = y * CELL_SIZE;

        // Cell background
        ctx.fillStyle = COLORS.grid;
        ctx.fillRect(px + 1, py + 1, CELL_SIZE - 2, CELL_SIZE - 2);

        // Flooded cell effect
        if (cell?.state === 'flooded') {
          ctx.fillStyle = COLORS.floodGlow;
          ctx.fillRect(px, py, CELL_SIZE, CELL_SIZE);
        }
      }
    }

    // Draw grid lines
    ctx.strokeStyle = COLORS.gridLine;
    ctx.lineWidth = 1;

    for (let x = 0; x <= GRID_WIDTH; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL_SIZE, 0);
      ctx.lineTo(x * CELL_SIZE, GRID_HEIGHT * CELL_SIZE);
      ctx.stroke();
    }

    for (let y = 0; y <= GRID_HEIGHT; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL_SIZE);
      ctx.lineTo(GRID_WIDTH * CELL_SIZE, y * CELL_SIZE);
      ctx.stroke();
    }
  }

  drawEntry(grid: Grid): void {
    const entry = grid.getEntryPosition();
    const direction = grid.getEntryDirection();
    const ctx = this.ctx;

    const cx = entry.x * CELL_SIZE + CELL_SIZE / 2;
    const cy = entry.y * CELL_SIZE + CELL_SIZE / 2;

    // Entry glow
    ctx.fillStyle = COLORS.entryGlow;
    ctx.beginPath();
    ctx.arc(cx, cy, CELL_SIZE / 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Entry arrow
    ctx.fillStyle = COLORS.entry;
    ctx.beginPath();

    const arrowSize = CELL_SIZE / 4;
    if (direction === 'right') {
      ctx.moveTo(cx - arrowSize, cy - arrowSize / 2);
      ctx.lineTo(cx + arrowSize / 2, cy);
      ctx.lineTo(cx - arrowSize, cy + arrowSize / 2);
    } else if (direction === 'left') {
      ctx.moveTo(cx + arrowSize, cy - arrowSize / 2);
      ctx.lineTo(cx - arrowSize / 2, cy);
      ctx.lineTo(cx + arrowSize, cy + arrowSize / 2);
    } else if (direction === 'bottom') {
      ctx.moveTo(cx - arrowSize / 2, cy - arrowSize);
      ctx.lineTo(cx, cy + arrowSize / 2);
      ctx.lineTo(cx + arrowSize / 2, cy - arrowSize);
    } else if (direction === 'top') {
      ctx.moveTo(cx - arrowSize / 2, cy + arrowSize);
      ctx.lineTo(cx, cy - arrowSize / 2);
      ctx.lineTo(cx + arrowSize / 2, cy + arrowSize);
    }

    ctx.closePath();
    ctx.fill();
  }

  drawPipes(grid: Grid): void {
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        const cell = grid.getCell(x, y);
        if (cell?.pipe) {
          this.drawPipe(x, y, cell.pipe);
        }
      }
    }
  }

  drawPipe(x: number, y: number, pipe: PipeData): void {
    const ctx = this.ctx;
    const cx = x * CELL_SIZE + CELL_SIZE / 2;
    const cy = y * CELL_SIZE + CELL_SIZE / 2;
    const radius = CELL_SIZE / 2 - 6;
    const pipeWidth = 12;

    ctx.strokeStyle = COLORS.pipeStroke;
    ctx.lineWidth = pipeWidth + 2;
    ctx.lineCap = 'round';

    // Draw pipe outline
    this.drawPipeShape(cx, cy, radius, pipe.type, pipeWidth + 2);

    // Draw pipe fill
    ctx.strokeStyle = COLORS.pipe;
    ctx.lineWidth = pipeWidth;
    this.drawPipeShape(cx, cy, radius, pipe.type, pipeWidth);

    // Draw water fill if pipe has water
    if (pipe.waterLevel > 0) {
      ctx.strokeStyle = COLORS.water;
      ctx.lineWidth = pipeWidth - 4;
      this.drawPipeShape(cx, cy, radius - 2, pipe.type, pipeWidth - 4);
    }
  }

  private drawPipeShape(
    cx: number,
    cy: number,
    radius: number,
    type: PipeType,
    lineWidth: number
  ): void {
    const ctx = this.ctx;
    ctx.lineWidth = lineWidth;

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

  drawWaterPath(path: Position[], grid: Grid): void {
    // Water is drawn as part of pipe fill, this method can add extra effects
    // like a glow trail or animated particles
    if (path.length === 0) return;

    const ctx = this.ctx;

    // Draw glow effect along path
    ctx.fillStyle = COLORS.waterGlow;
    for (const pos of path) {
      const cx = pos.x * CELL_SIZE + CELL_SIZE / 2;
      const cy = pos.y * CELL_SIZE + CELL_SIZE / 2;

      ctx.beginPath();
      ctx.arc(cx, cy, CELL_SIZE / 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Draw a single pipe type (for queue preview)
  drawPipePreview(
    x: number,
    y: number,
    size: number,
    type: PipeType
  ): void {
    const ctx = this.ctx;
    const cx = x + size / 2;
    const cy = y + size / 2;
    const radius = size / 2 - 4;
    const pipeWidth = 8;

    // Background
    ctx.fillStyle = COLORS.grid;
    ctx.fillRect(x, y, size, size);

    ctx.lineCap = 'round';

    // Pipe outline
    ctx.strokeStyle = COLORS.pipeStroke;
    ctx.lineWidth = pipeWidth + 2;
    this.drawPipeShapeAt(ctx, cx, cy, radius, type);

    // Pipe fill
    ctx.strokeStyle = COLORS.pipe;
    ctx.lineWidth = pipeWidth;
    this.drawPipeShapeAt(ctx, cx, cy, radius, type);
  }

  private drawPipeShapeAt(
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

  // Draw countdown overlay
  drawCountdown(seconds: number): void {
    const ctx = this.ctx;
    const cx = this.width / 2;
    const cy = this.height / 2;

    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, this.width, this.height);

    // Countdown number
    ctx.fillStyle = COLORS.ui.text;
    ctx.font = 'bold 72px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(Math.ceil(seconds).toString(), cx, cy);

    // Label
    ctx.font = '24px sans-serif';
    ctx.fillStyle = COLORS.ui.muted;
    ctx.fillText('Water flowing in...', cx, cy + 50);
  }

  // Draw game over overlay
  drawGameOver(won: boolean, score: number, length: number): void {
    const ctx = this.ctx;
    const cx = this.width / 2;
    const cy = this.height / 2;

    // Overlay
    ctx.fillStyle = won
      ? 'rgba(0, 100, 0, 0.7)'
      : 'rgba(100, 0, 0, 0.7)';
    ctx.fillRect(0, 0, this.width, this.height);

    // Title
    ctx.fillStyle = COLORS.ui.text;
    ctx.font = 'bold 48px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(won ? 'SUCCESS!' : 'FLOODED!', cx, cy - 40);

    // Stats
    ctx.font = '24px sans-serif';
    ctx.fillText(`Score: ${score}`, cx, cy + 20);
    ctx.fillText(`Length: ${length}`, cx, cy + 50);

    // Restart hint
    ctx.font = '18px sans-serif';
    ctx.fillStyle = COLORS.ui.muted;
    ctx.fillText('Press R to restart', cx, cy + 100);
  }

  // Get canvas context for external use
  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }
}
