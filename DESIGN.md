# CricOS — Design System & Visual Guidelines
> Full Stitch UI design requirements and ready-to-run prompts: see [STITCH_DESIGN_REQUIREMENTS.md](file:///Volumes/Study/Projects/unified_cricket_platform/STITCH_DESIGN_REQUIREMENTS.md).

## 1. Aesthetics & Atmosphere
- **Theme**: Floodlit Stadium Broadcast & Athletic Precision Glassmorphism (DFII 17/15).
- **Ambiance**: Night-match international cricket stadium under high-intensity floodlights. Deep obsidian base (`#04070D`), semi-transparent glass cards (`rgba(10, 16, 28, 0.82)`), and light refraction borders (`rgba(255, 255, 255, 0.08)`).
- **Core Accents**:
  - `var(--turf-emerald)`: `#00E599` (Primary CTAs, LED main scores, Boundary 4s, Active Status)
  - `var(--cyan)`: `#00D2FF` (Overs display, SSE pulse indicators, secondary navigation)
  - `var(--amber)`: `#FFB800` (Extras, warnings, Bayesian reputation stars)
  - `var(--rose)`: `#FF3366` (Wickets, suspension circuit breakers)
  - `var(--purple)`: `#A855F7` / `#C084FC` (Sixes / Maximums, championship badges)

## 2. Typographic Architecture
- **Display Headings**: `Space Grotesk` (weights 700, 800) — track-tight, authoritative athletic titling.
- **Scoreboard LED Digits**: `Chakra Petch` (weights 600, 700, 800) — 3.5rem glowing scoreboard digits, overs, bowling figures, and strike rates.
- **Body & UI**: `Plus Jakarta Sans` (weights 400, 500, 600, 700) — field labels, data tables, micro-copy.
- **Code & Minor Currency**: `JetBrains Mono` — financial ledger entries, integer minor units, OpenAPI specs.

## 3. Core Component Invariants
1. **Broadcast Scoreboard HUD**: 3.5rem LED score (`142/3`) in Turf Emerald with radial glow, Overs in Electric Cyan (`16.4 ov`), dynamic run rates (CRR/RRR), and active batter/bowler figures.
2. **Kinetic Over Strip**: 36px circular delivery chips with distinct chromatic indicators (emerald for 4s, purple for 6s, crimson for wickets) and pop-in entrance animation.
3. **Athletic Scoring Pad**: 4x2 tactile button grid with dual-tier typography (digit in `Chakra Petch` + tactical label in `Plus Jakarta Sans`).
4. **Contextual Tooltips (Rule 5)**: 100% of interactive controls, icon buttons, and metric cards must feature accessible `data-tooltip="..."` attributes.
5. **Single-File Console Parity (Rule 6)**: `dist/index.html` and root `index.html` must remain byte-for-byte identical.

