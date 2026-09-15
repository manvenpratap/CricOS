---
name: Stadium Broadcast Glassmorphism
colors:
  surface: '#0f141a'
  surface-dim: '#0f141a'
  surface-bright: '#353941'
  surface-container-lowest: '#0a0e15'
  surface-container-low: '#181c23'
  surface-container: '#1c2027'
  surface-container-high: '#262a31'
  surface-container-highest: '#31353c'
  on-surface: '#dfe2ec'
  on-surface-variant: '#bacbbe'
  inverse-surface: '#dfe2ec'
  inverse-on-surface: '#2c3138'
  outline: '#849589'
  outline-variant: '#3b4a41'
  surface-tint: '#00e297'
  primary: '#6dffba'
  on-primary: '#003822'
  primary-container: '#00e599'
  on-primary-container: '#00613e'
  inverse-primary: '#006c46'
  secondary: '#a5e7ff'
  on-secondary: '#003543'
  secondary-container: '#00d2ff'
  on-secondary-container: '#00566a'
  tertiary: '#f2deff'
  on-tertiary: '#490081'
  tertiary-container: '#dfbbff'
  on-tertiary-container: '#7035a9'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#4dffb2'
  primary-fixed-dim: '#00e297'
  on-primary-fixed: '#002112'
  on-primary-fixed-variant: '#005234'
  secondary-fixed: '#b6ebff'
  secondary-fixed-dim: '#47d6ff'
  on-secondary-fixed: '#001f28'
  on-secondary-fixed-variant: '#004e60'
  tertiary-fixed: '#f0dbff'
  tertiary-fixed-dim: '#ddb8ff'
  on-tertiary-fixed: '#2c0051'
  on-tertiary-fixed-variant: '#62259b'
  background: '#0f141a'
  on-background: '#dfe2ec'
  surface-variant: '#31353c'
  surface-midnight: '#0A101C'
  surface-glass: rgba(10, 16, 28, 0.82)
  border-refraction: rgba(255, 255, 255, 0.08)
  border-emerald-glow: rgba(0, 229, 153, 0.35)
  broadcast-amber: '#FFB800'
  drs-crimson: '#FF3366'
  text-primary: '#F8FAFC'
  text-muted: '#94A3B8'
typography:
  display-led:
    fontFamily: Chakra Petch
    fontSize: 3.5rem
    fontWeight: '700'
    lineHeight: '1.0'
    letterSpacing: -0.02em
  display-led-mobile:
    fontFamily: Chakra Petch
    fontSize: 2.25rem
    fontWeight: '700'
    lineHeight: '1.0'
    letterSpacing: -0.01em
  headline-xl:
    fontFamily: Space Grotesk
    fontSize: 2.25rem
    fontWeight: '800'
    lineHeight: 2.75rem
    letterSpacing: -0.03em
  headline-xl-mobile:
    fontFamily: Space Grotesk
    fontSize: 1.75rem
    fontWeight: '700'
    lineHeight: 2.25rem
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 1.5rem
    fontWeight: '700'
    lineHeight: 2rem
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 1.125rem
    fontWeight: '600'
    lineHeight: 1.5rem
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 1rem
    fontWeight: '500'
    lineHeight: 1.5rem
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.375rem
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.75rem
    fontWeight: '400'
    lineHeight: 1.125rem
  label-btn:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.75rem
    fontWeight: '700'
    lineHeight: 1rem
    letterSpacing: 0.06em
  metric-mono:
    fontFamily: JetBrains Mono
    fontSize: 0.8125rem
    fontWeight: '500'
    lineHeight: 1.125rem
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.25rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system delivers the high-stakes intensity of premier international night-match cricket broadcasts fused with the calculated precision of an aerospace mission control cockpit. It caters to professional match scorers, tournament directors, broadcast operators, and sports analytics professionals who demand instantaneous situational awareness under high operational stress.

The aesthetic philosophy centers on **Floodlit Stadium Broadcast & Athletic Precision Glassmorphism**:
- **Atmospheric Depth:** A deep obsidian base reminiscent of night-match turf under stadium light rigs, layered with dark midnight glass surfaces, crisp light refraction edges, and high-contrast LED data clusters.
- **Athletic Cockpit Density:** High information density balanced through micro-grids, asymmetric split-screen control panes, and specialized tabular data hierarchy. Every metric occupies a deliberate coordinate.
- **Kinetic Broadcast Cues:** Live SSE telemetry dots, luminous boundary event chips, and mechanical scoreboard readouts provide tactile feedback without decorative noise.

### Anti-Patterns
- Never apply generic neon purple AI glows or fuzzy light leaks; optical highlights are strictly anchored to real-world stadium illumination (floodlight emerald, electric broadcast cyan, DRS crimson).
- Never render score readouts or figures in neutral corporate sans-serifs; scores require digital LED clarity.
- Avoid uniform three-equal-box layouts. Structure layouts through tactical asymmetry, data-dense sidebars, and timeline-driven grids.

## Colors

The color palette recreates a floodlit stadium arena against an obsidian night sky. Contrast and chromatic discipline govern every state.

- **Obsidian Base (`#04070D`):** The primary canvas ground. Avoid pure `#000000` to prevent harsh visual clipping and preserve contrast gradients across midnight glass layers.
- **Turf Emerald (`#00E599`):** The primary energetic driver. Reserved for prime actions, primary runs, active scoreboard numbers, in-progress overs, and boundary four (`4`) indicators.
- **Electric Cyan (`#00D2FF`):** The technical secondary. Drives telemetry pulses, current over markers, positive Net Run Rate indicators, and live stream connectivity beacons.
- **Maximum Violet (`#C084FC`):** The tertiary spectacle tone. Reserved specifically for maximum boundary sixes (`6`), tournament trophy badges, and championship tier highlights.
- **Functional Semantics:**
  - **DRS Crimson (`#FF3366`):** Wickets (`W`), disciplinary warnings, umpire reviews, suspended states, and negative Net Run Rates.
  - **Broadcast Amber (`#FFB800`):** Deliveries with extras (`wd`, `nb`), review cautions, Bayesian rating stars, and temporary warnings.
  - **Refraction Lines (`rgba(255, 255, 255, 0.08)`): Crisp 1px highlights delineating frosted glass cards against the dark obsidian canvas.

## Typography

Typography establishes an indisputable distinction between editorial narrative, operational controls, and numeric scoreboard feeds.

- **Display & Section Titles (`Space Grotesk`):** Industrial, geometric, and muscular. Features tight negative tracking (`-0.02em` to `-0.03em`) to anchor broadcast banners, venue titles, and modal headers.
- **Scoreboard Figures & Metrics (`Chakra Petch`):** Angular LED digits evoking physical stadium scoreboards. Mandatory for match scores (e.g., `142/3`), overs, run rates, and tactical scoring buttons. Always rendered with tabular alignment.
- **Interface & Operational Copy (`Plus Jakarta Sans`):** Clean, open letterforms providing high legibility across tournament standings, commentary feeds, and configuration drawers.
- **Technical Readouts & Currency (`JetBrains Mono`):** Dedicated to cryptographic hashes, minor currency representations (`₹2,500.00`), bowler figures, and match timing markers.

## Layout & Spacing

The layout is built on a high-density, asymmetric fluid grid designed to replicate an athletic broadcast cockpit.

### Grid & Breakpoints
- **Desktop (1440px+):** 12-column layout with `2rem` outer canvas margins and `1.25rem` gutters. Screens avoid standard symmetric card triads. The Match Center utilizes a 65/35 cockpit split: primary telemetry and live ball-by-ball inputs on the left, real-time commentary streams and wagon-wheel telemetry on the right.
- **Tablet (768px - 1023px):** 8-column layout. The HUD scoreboard collapses to two stacked horizontal banners; tactical scoring pads transition into a persistent 4x2 matrix above the fold.
- **Mobile (375px - 767px):** 4-column layout with `1rem` margins and `0.75rem` gutters. Scoring interactions rely on high-target bottom action panels with minimum touch targets of 56px to ensure one-handed thumb entry in high-glare environments.

### Spacing Scale
- `space-xs` (4px) and `space-sm` (8px) govern micro-alignments inside scoreboard pills, ball bubble margins, and status tags.
- `space-md` (16px) establishes standard card interior padding.
- `space-lg` (24px) and `space-xl` (40px) demarcate distinct operational modules (Scoreboard HUD, Scoring Pad, Commentary Stream).

## Elevation & Depth

Visual hierarchy does not rely on ambient drop shadows, but rather on **athletic glassmorphism, surface luminous transmission, and refractive outlines**:

- **Ground Zero (Canvas):** `#04070D` solid obsidian base with zero blur.
- **Tier 1 (Panels & Tables):** Solid midnight surface `#0A101C` with a 1px `rgba(255, 255, 255, 0.05)` border. Used for high-refresh data tables, commentary streams, and configuration drawers.
- **Tier 2 (Glassmorphic HUD & Overlays):** `rgba(10, 16, 28, 0.82)` background with `backdrop-filter: blur(16px)` and a crisp 1px light refraction border `rgba(255, 255, 255, 0.08)`.
- **Active / Luminous Elements:** Elements indicating live action, active strikers, or match states emit directional perimeter auras:
  - **Turf Emerald Halo:** `0 0 24px rgba(0, 229, 153, 0.35)` applied to primary score displays and boundary `4` chips.
  - **Electric Cyan Glow:** `0 0 16px rgba(0, 210, 255, 0.40)` for active SSE telemetry dots and target chase counters.
  - **DRS Crimson Flash:** `0 0 20px rgba(255, 51, 102, 0.45)` for wicket notifications and dismissal chips.

## Shapes

The design system uses a controlled rounded geometry (`roundedness: 2`, base radius 8px) that balances aerospace instrument panels with athletic broadcast overlays:

- **HUD Cards & Main Panels (`rounded-lg` / 16px):** Primary score banners, tactical panels, and marketplace cards use 16px corners to soften the perimeter while holding structural grid lines.
- **Tactical Buttons & Form Inputs (`rounded` / 8px):** Scoring pad buttons, text inputs, and filter selectors use 8px corners to preserve compact touch targets and maximize internal content area.
- **Delivery Balls & Indicator Badges (Full Circle / 9999px):** Over ball chips (`.ball-bubble`), status indicators, and avatar rings are fully circular pills.

## Components

### Buttons & Tactile Scoring Pad
- **Scoring Buttons:** Designed as dual-tier athletic tiles in a 4x2 grid.
  - Metric digit rendered in `Chakra Petch` (`1.35rem`, 700 weight), centered directly above an uppercase micro-label in `Plus Jakarta Sans` (`0.75rem`, 700 weight, `letterSpacing: 0.06em`).
  - Standard buttons use `#0A101C` background with a 1px border `rgba(255, 255, 255, 0.08)`. On hover, they shift `-1px` vertically with border brightening to `rgba(255, 255, 255, 0.2)`. Active state compresses to `0.96` scale.
  - Dedicated event buttons inherit accent fills: Boundary 4 (`#00E599` text, subtle green surface tint), Boundary 6 (`#C084FC` text, purple tint), Wicket (`#FF3366` surface with high-contrast `#F8FAFC` text).
- **Primary CTAs:** Emerald gradient fill (`linear-gradient(135deg, #00E599, #00B377)`) with `#04070D` bold typography, elevated by a subtle emerald aura.

### Delivery Over Strip & Ball Chips
- Horizontal flex row featuring 36px circular badges (`.ball-bubble`).
- **Dot Ball (`·` or `0`):** `#0A101C` fill with `#94A3B8` muted typography and subtle border.
- **Singles / Doubles (`1`, `2`, `3`):** Dark glass fill with crisp white text.
- **Boundary Four (`4`):** Solid `#00E599` fill with `#04070D` bold number and emerald halo.
- **Boundary Six (`6`):** Solid `#C084FC` fill with `#04070D` bold number and violet aura.
- **Wicket (`W`):** Solid `#FF3366` fill with `#FFFFFF` text.
- **Extras (`wd`, `nb`):** Solid `#FFB800` fill with `#04070D` text.

### Cards & Scoreboard HUD
- **Scoreboard HUD:** Banner card structured with a dual-layer glass fill (`rgba(10, 16, 28, 0.82)`), 16px radius, and top 1px border highlighted in `rgba(0, 229, 153, 0.35)`.
- Left side displays match fixture title and live telemetry pill (with pulsing `#00D2FF` dot). Right side houses the 3.5rem `Chakra Petch` LED score, run rates in tabular mono, and active striker cards featuring gold strike stars (`★`).

### Data Tables & Tournament Standings
- Dark obsidian base rows alternating with midnight tint (`#0A101C`).
- Top playoff qualification rows feature a solid 3px left emerald border accent.
- Run rates formatted to three decimal places in `JetBrains Mono`, colored `#00D2FF` for positive rates and `#FF3366` for negative rates.

### Inputs & Selection Controls
- Input fields use `#0A101C` solid fill, 1px border `rgba(255, 255, 255, 0.08)`, and focus states with a `#00E599` hairline border and 4px turf glow ring.
- Checkboxes and radios utilize `#0A101C` surfaces with `#00E599` check fills and high-contrast geometric markers.