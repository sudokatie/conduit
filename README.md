# Conduit

A browser-based pipe puzzle game. Connect pipes before the water floods everything. Think Pipe Dream, but with existential dread about whether your connections will hold.

## Why This Exists?

Remember Pipe Dream? That DOS game where you frantically placed pipes while water rushed toward your poor planning decisions? This is that, but in your browser. No DOSBox required. No excuses for losing either.

The goal is simple: place at least 10 connected pipe segments before the water finds a dead end and floods your screen. Sounds easy? The countdown timer begs to differ.

## Features

- 11 pipe types (straight, elbow, cross, T-junctions)
- 5-piece preview queue so you can plan ahead (or panic ahead)
- 3 discards per game for those moments when RNG hates you
- Score tracking for bragging rights
- Clean canvas rendering because we're not savages
- Retro sound effects (synthesized via Web Audio API)
- 110+ tests because untested code is just optimistic guessing

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000 and start clicking.

## Controls

- **Click** - Place the current pipe
- **D** - Discard current piece (limited uses)
- **P** - Pause game
- **R** - Restart game

## How to Win

1. Water starts flowing after a 5-second countdown
2. Place pipes to create a connected path
3. Reach 10+ segments before hitting a dead end
4. Don't flood

That's it. Simple in theory. Humbling in practice.

## Tech Stack

- Next.js 14 with App Router
- TypeScript (strict mode, because we have standards)
- HTML5 Canvas for rendering
- Tailwind CSS for the UI
- Jest for testing

## Project Structure

```
src/
├── app/           # Next.js app router
├── components/    # React components
│   ├── GameCanvas.tsx
│   ├── HUD.tsx
│   ├── Queue.tsx
│   └── GameOver.tsx
└── game/          # Game logic
    ├── types.ts
    ├── constants.ts
    ├── Pipe.ts
    ├── Grid.ts
    ├── Flow.ts
    ├── Game.ts
    ├── Renderer.ts
    └── __tests__/
```

## Development

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm test         # Run tests
npm run lint     # Lint check
```

## Philosophy

1. Simple mechanics, emergent challenge
2. No tutorials needed - figure it out like we used to
3. Quick games, instant restarts
4. Satisfying when it works, educational when it doesn't

## License

MIT

## Author

Katie

---

*Water finds a way. Usually through your worst-placed pipe.*
