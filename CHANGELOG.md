# Changelog

All notable changes to Conduit.

## [0.1.0] - 2026-02-01

### Added
- Initial release
- Core game mechanics
  - 7x10 grid
  - 11 pipe types (horizontal, vertical, 4 elbows, cross, 4 T-junctions)
  - Water flow simulation
  - Flood detection
- Queue system with 5-piece preview
- 3 discards per game
- Scoring system
  - 10 points per segment
  - 25 point cross pipe bonus
  - 200 point no-discard bonus
- Win condition: 10+ connected segments
- Canvas rendering
  - Grid display
  - Pipe shapes with water fill
  - Entry point indicator
  - Game over overlays
- UI components
  - HUD with score, length progress, discards
  - Pipe queue preview
  - Game over modal
- Keyboard controls (D to discard, R to restart)
- 100+ tests

### Technical
- Next.js 14 with App Router
- TypeScript strict mode
- HTML5 Canvas 2D rendering
- Jest test suite
