# CricOS — Design System & Visual Guidelines

## Aesthetics & Principles
- **Theme**: Sleek, modern dark-mode glassmorphism with high visual hierarchy.
- **Palette**: Deep charcoal surfaces (`#0a0e17`), midnight container borders (`rgba(255,255,255,0.08)`), vibrant cricket turf accents (`#10b981`, emerald green; `#06b6d4`, electric cyan; `#f59e0b`, warm amber).
- **Typography**: Clean, geometric sans-serif fonts (`Inter`, `system-ui`, `-apple-system`) with distinct tabular numbers for scoreboards.
- **Micro-Interactions**: Smooth hover elevations, subtle badge glows, status indicators, and zero-flicker live score updates.

## Component Invariants
1. **Interactive Console**: Served at `GET /` with real-time health badges, interactive module endpoints, live match state inspector, and quick triggers.
2. **Contextual Tooltips**: Interactive elements and scorecard badges utilize accessible tooltips with auto-flip and keyboard dismissal.
3. **Responsive Grid**: Flexbox and CSS grid layouts with mobile-first break points ensuring optimal viewing on mobile tablets and wide desktops.
