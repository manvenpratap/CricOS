export function getMobileAppHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="theme-color" content="#04070D">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <title>CricOS — Consumer Mobile App (iOS & Android)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Chakra+Petch:ital,wght@0,400;0,600;0,700;1,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-pitch: #04070D;
      --turf-emerald: #00E599;
      --cyan: #00D2FF;
      --amber: #FFB800;
      --rose: #FF3366;
      --purple: #A855F7;

      /* Emil Kowalski Animation, Physics & Native Mobile Tokens */
      --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
      --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
      --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
      --ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.15);
      --duration-fast: 120ms;
      --duration-normal: 200ms;
      --duration-modal: 280ms;
    }
    * { box-sizing: border-box; }
    html {
      -webkit-tap-highlight-color: transparent;
      height: 100%;
      overscroll-behavior: none;
    }
    button, input, select, textarea {
      touch-action: manipulation;
      -webkit-touch-callout: none;
    }
    input, select, textarea {
      font-size: 16px;
    }
    .sheet-drag-handle {
      width: 36px;
      height: 4px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.3);
      margin: 8px auto 14px auto;
    }
    body {
      margin: 0;
      padding: 0;
      background: radial-gradient(circle at 50% 10%, rgba(0, 229, 153, 0.08) 0%, #030509 70%);
      color: #f8fafc;
      font-family: 'Plus Jakarta Sans', sans-serif;
      min-height: 100dvh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .preview-header {
      text-align: center;
      margin: 1.5rem 0 1rem;
      max-width: 600px;
      padding: 0 1rem;
    }
    .preview-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: rgba(0, 229, 153, 0.12);
      border: 1px solid rgba(0, 229, 153, 0.3);
      color: #00E599;
      padding: 0.3rem 0.8rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }
    .preview-title {
      margin: 0;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.5rem;
      color: #f8fafc;
    }
    .preview-desc {
      margin: 0.35rem 0 0;
      color: #94a3b8;
      font-size: 0.85rem;
    }

    /* High-End Smartphone Frame */
    .device-wrapper {
      position: relative;
      width: min(390px, 92vw);
      height: 844px;
      max-height: 88vh;
      aspect-ratio: 390 / 844;
      background: #000;
      border-radius: 50px;
      box-shadow: 0 0 0 4px #262e3d, 0 0 0 8px #131722, 0 30px 70px rgba(0,0,0,0.9), 0 0 60px rgba(0, 229, 153, 0.18);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      margin-bottom: 2rem;
    }

    /* Dynamic Island Notch */
    .device-notch {
      position: absolute;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      width: 124px;
      height: 30px;
      background: #000;
      border-radius: 20px;
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 12px;
      box-shadow: 0 0 12px rgba(0, 229, 153, 0.2);
      transition: width var(--duration-modal) var(--ease-spring), box-shadow var(--duration-modal) var(--ease-out);
    }
    @media (hover: hover) and (pointer: fine) {
      .device-notch:hover {
        width: 170px;
        box-shadow: 0 0 22px rgba(0, 229, 153, 0.45);
      }
    }
    .notch-camera {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #0c121e;
      border: 1px solid #1a2233;
    }
    .notch-sensor {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #070a10;
    }

    /* iOS Status Bar */
    .status-bar {
      height: 48px;
      padding: 12px 24px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.85rem;
      font-weight: 700;
      color: #f8fafc;
      z-index: 90;
      background: #04070D;
      font-variant-numeric: tabular-nums;
    }
    .status-icons {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
    }

    /* Screen Viewport (Strict 3-Tier Flex Column: Viewport Frame NEVER Scrolls) */
    .screen-viewport {
      flex: 1 1 auto;
      min-height: 0;
      height: 100%;
      background: #04070D;
      position: relative;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: opacity 0.15s ease-out;
    }
    .screen-viewport::-webkit-scrollbar { display: none; width: 0px; }

    /* Tier 1: Fixed Mobile Header Inside Viewport */
    .mobile-header {
      flex: 0 0 auto;
      padding: 0.75rem 1rem;
      background: rgba(10, 16, 28, 0.95);
      border-bottom: 1px solid rgba(255,255,255,0.08);
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      z-index: 50;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }

    /* Tier 2: Dedicated Scrollable Content Container (Only this element scrolls) */
    .mobile-scroll-body {
      flex: 1 1 auto;
      min-height: 0;
      overflow-y: auto;
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
      overscroll-behavior-y: contain;
      padding-bottom: 1rem;
    }
    .mobile-scroll-body::-webkit-scrollbar {
      width: 4px;
    }
    .mobile-scroll-body::-webkit-scrollbar-track {
      background: transparent;
    }
    .mobile-scroll-body::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.15);
      border-radius: 4px;
    }

    /* Tier 3: Fixed Bottom Navigation Bar (Permanently pinned at bottom, never scrolls) */
    .mobile-bottom-nav {
      flex: 0 0 auto;
      position: relative;
      background: rgba(10, 16, 28, 0.96);
      border-top: 1px solid rgba(255,255,255,0.08);
      display: flex;
      justify-content: space-around;
      align-items: center;
      padding: 0.5rem 0.25rem 1.25rem;
      z-index: 50;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }

    /* Home Indicator bar at bottom of modern phone */
    .home-indicator {
      width: 134px;
      height: 4px;
      background: rgba(255,255,255,0.4);
      border-radius: 9999px;
      position: absolute;
      bottom: 8px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 100;
      pointer-events: none;
    }

    /* Accessible Focus & Tactile Feedback */
    :focus-visible {
      outline: 2px solid #00E599 !important;
      outline-offset: 2px !important;
    }
    button, .role-pill, .slot-pill, .mobile-chip, .pad-touch-btn {
      cursor: pointer;
      user-select: none;
      -webkit-user-select: none;
      touch-action: manipulation;
    }
    button:active, .role-pill:active, .slot-pill:active, .mobile-chip:active, .pad-touch-btn:active {
      transform: scale(0.97);
    }

    /* In-App Toast System */
    .mobile-toast-container {
      position: absolute;
      top: 54px;
      left: 12px;
      right: 12px;
      z-index: 150;
      display: flex;
      flex-direction: column;
      gap: 6px;
      pointer-events: none;
    }
    .mobile-toast {
      pointer-events: auto;
      background: rgba(10, 16, 28, 0.96);
      border: 1px solid rgba(0, 229, 153, 0.4);
      border-radius: 12px;
      padding: 0.65rem 0.85rem;
      font-size: 0.78rem;
      color: #f8fafc;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      animation: toastSlideDown 0.22s var(--ease-spring) forwards;
    }
    .mobile-toast.success { border-color: rgba(0, 229, 153, 0.6); }
    .mobile-toast.error { border-color: rgba(255, 51, 102, 0.6); color: #ff8099; }
    .mobile-toast.warning { border-color: rgba(255, 184, 0, 0.6); color: #ffca40; }
    .mobile-toast.info { border-color: rgba(0, 210, 255, 0.6); }
    @keyframes toastSlideDown {
      from { transform: translateY(-16px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    /* In-App Modal / Action Sheet System */
    .mobile-sheet-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      z-index: 100;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.25s ease;
    }
    .mobile-sheet-backdrop.active {
      opacity: 1;
      pointer-events: auto;
    }
    .mobile-persona-sheet,
    .mobile-action-sheet,
    .mobile-wagon-picker-sheet,
    .mobile-extra-picker-sheet {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: #090f1d;
      border-top: 1px solid rgba(0, 229, 153, 0.35);
      border-radius: 20px 20px 0 0;
      padding: 1.25rem 1rem max(env(safe-area-inset-bottom, 0px), 1.5rem);
      z-index: 101;
      transform: translateY(100%);
      transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.8);
      max-height: 88%;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }
    .mobile-persona-sheet.active,
    .mobile-action-sheet.active,
    .mobile-wagon-picker-sheet.active,
    .mobile-extra-picker-sheet.active {
      transform: translateY(0);
    }
    .extra-run-option-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      padding: 0.65rem 0.8rem;
      margin-bottom: 0.45rem;
      cursor: pointer;
      transition: background-color 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
    }
    .extra-run-option-card:hover,
    .extra-run-option-card:active {
      background: rgba(255, 255, 255, 0.08);
    }
    .extra-run-option-card.active {
      background: rgba(0, 229, 153, 0.12);
      border-color: #00E599;
    }
    .wagon-picker-zone-btn {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      padding: 0.35rem 0.2rem;
      font-size: 0.68rem;
      font-weight: 600;
      color: #94a3b8;
      cursor: pointer;
      text-align: center;
      transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
    }
    .wagon-picker-zone-btn.active {
      background: rgba(0, 229, 153, 0.2);
      border-color: #00E599;
      color: #00E599;
      font-weight: 800;
    }
    .persona-grid-picker {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;
      margin-top: 0.75rem;
    }
    .persona-picker-card {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      padding: 0.65rem;
      text-align: left;
      cursor: pointer;
      color: #f8fafc;
      transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease;
    }
    .persona-picker-card:hover, .persona-picker-card.active {
      background: rgba(0, 229, 153, 0.15);
      border-color: #00E599;
      transform: translateY(-1px);
    }
    .player-list-item {
      cursor: pointer;
      transition: background 0.2s, border-color 0.2s;
    }
    .player-list-item.active-player {
      border-color: #00E599 !important;
      background: rgba(0, 229, 153, 0.12) !important;
    }

    /* Sub-Tab Navigation Bar */
    .mobile-subnav {
      display: flex;
      gap: 0.35rem;
      padding: 0.5rem 0.75rem;
      background: rgba(10, 16, 28, 0.7);
      border-bottom: 1px solid rgba(255,255,255,0.06);
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }
    .mobile-subnav::-webkit-scrollbar { display: none; }
    .mobile-subnav-btn {
      flex: 0 0 auto;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 20px;
      padding: 0.3rem 0.7rem;
      font-size: 0.7rem;
      font-weight: 600;
      color: #94a3b8;
      display: flex;
      align-items: center;
      gap: 0.25rem;
      cursor: pointer;
      transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease, transform 0.15s ease;
    }
    .mobile-subnav-btn.active {
      background: rgba(0, 229, 153, 0.16);
      border-color: #00E599;
      color: #00E599;
      font-weight: 700;
    }

    /* Pitch Telemetry Bar */
    .pitch-telemetry-strip {
      background: rgba(10, 16, 28, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      padding: 0.5rem 0.75rem;
      margin-bottom: 0.85rem;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.3rem;
      text-align: center;
    }
    .pitch-telemetry-item {
      display: flex;
      flex-direction: column;
      gap: 0.1rem;
    }
    .pitch-telemetry-lbl {
      font-size: 0.58rem;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .pitch-telemetry-val {
      font-family: 'Chakra Petch', monospace;
      font-size: 0.8rem;
      font-weight: 700;
      color: #00E599;
    }

    /* Filter Chips */
    .mobile-chip-row {
      display: flex;
      gap: 0.35rem;
      overflow-x: auto;
      padding-bottom: 0.4rem;
      margin-bottom: 0.75rem;
      -webkit-overflow-scrolling: touch;
    }
    .mobile-chip-row::-webkit-scrollbar { display: none; }
    .mobile-chip {
      flex: 0 0 auto;
      padding: 0.3rem 0.65rem;
      border-radius: 9999px;
      border: 1px solid rgba(255,255,255,0.1);
      background: rgba(255,255,255,0.04);
      color: #94a3b8;
      font-size: 0.7rem;
      font-weight: 600;
    }
    .mobile-chip.active {
      background: rgba(0, 229, 153, 0.15);
      border-color: #00E599;
      color: #00E599;
      font-weight: 700;
    }

    /* Tactical Scoring Studio Pad & Hold Button */
    .mobile-studio-pad-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.5rem;
      margin-bottom: 0.75rem;
    }
    .mobile-studio-btn {
      padding: 0.85rem 0.25rem;
      font-size: 1.35rem;
      font-family: 'Chakra Petch', monospace;
      font-weight: 800;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.15rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #F8FAFC;
      cursor: pointer;
      user-select: none;
      -webkit-user-select: none;
      touch-action: manipulation;
      transition: transform 0.15s ease, background-color 0.15s ease, border-color 0.15s ease;
    }
    .mobile-studio-btn:active {
      transform: scale(0.95);
    }
    .mobile-studio-btn.boundary-four {
      background: rgba(0, 210, 255, 0.15);
      border-color: #00D2FF;
      color: #00D2FF;
    }
    .mobile-studio-btn.maximum-six {
      background: rgba(0, 229, 153, 0.18);
      border-color: #00E599;
      color: #00E599;
    }
    .mobile-studio-btn.wicket-out {
      background: rgba(255, 51, 102, 0.18);
      border-color: #ff3366;
      color: #ff3366;
    }
    .mobile-studio-btn.undo-btn {
      background: rgba(255, 184, 0, 0.12);
      border-color: #ffb800;
      color: #ffb800;
    }
    .mobile-studio-sublabel {
      font-size: 0.62rem;
      font-family: 'Inter', sans-serif;
      font-weight: 600;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    /* Hold to Confirm Reset Button */
    .btn-hold-confirm {
      position: relative;
      overflow: hidden;
      user-select: none;
      -webkit-user-select: none;
    }
    .btn-hold-confirm .hold-progress-overlay {
      position: absolute;
      inset: 0;
      background: rgba(255, 51, 102, 0.35);
      clip-path: inset(0 100% 0 0);
      transition: clip-path 200ms ease-out;
      pointer-events: none;
    }
    .btn-hold-confirm.holding .hold-progress-overlay {
      clip-path: inset(0 0 0 0);
      transition: clip-path 2s linear;
    }
    .btn-hold-confirm:active {
      transform: scale(0.97);
    }

    /* Wagon Wheel Sector Wedges & Glow */
    .wagon-sector-wedge {
      fill: rgba(0, 229, 153, 0.04);
      stroke: rgba(255, 255, 255, 0.1);
      stroke-width: 1px;
      cursor: pointer;
      transition: fill 0.18s ease, stroke 0.18s ease, stroke-width 0.18s ease;
    }
    .wagon-sector-wedge:hover, .wagon-sector-wedge.active {
      fill: rgba(0, 229, 153, 0.28) !important;
      stroke: #00E599 !important;
      stroke-width: 2px !important;
    }
    .wagon-pill-btn {
      flex: 0 0 auto;
      padding: 0.25rem 0.55rem;
      border-radius: 9999px;
      font-size: 0.65rem;
      font-weight: 600;
      border: 1px solid rgba(255,255,255,0.12);
      background: rgba(255,255,255,0.04);
      color: #94a3b8;
      cursor: pointer;
      transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
    }
    .wagon-pill-btn.active {
      background: rgba(0, 229, 153, 0.18);
      border-color: #00E599;
      color: #00E599;
      font-weight: 700;
    }
    .score-pulse {
      animation: scorePulseAnim 0.3s ease-out;
    }
    @keyframes scorePulseAnim {
      0% { transform: scale(1.08); color: #00E599; }
      100% { transform: scale(1); }
    }

    /* 21st.dev Athletic KPI & Career Stats Card in Mobile View */
    .athletic-stats-card {
      background: linear-gradient(145deg, rgba(13, 20, 36, 0.95), rgba(7, 11, 20, 0.98));
      border: 1px solid rgba(0, 229, 153, 0.3);
      border-radius: 14px;
      padding: 1rem;
      position: relative;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08);
      margin-bottom: 1rem;
    }
    .athletic-stats-card::before {
      content: '';
      position: absolute;
      top: -30px;
      right: -30px;
      width: 110px;
      height: 110px;
      background: radial-gradient(circle, rgba(0, 229, 153, 0.15) 0%, transparent 70%);
      pointer-events: none;
    }
    .athletic-hero-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.85rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .athletic-player-meta {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }
    .athletic-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(0, 229, 153, 0.15);
      border: 2px solid var(--turf-emerald);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--turf-emerald);
      font-family: 'Chakra Petch', monospace;
      flex-shrink: 0;
    }
    .athletic-hero-kpi {
      text-align: right;
    }
    .athletic-rating-val {
      font-family: 'Chakra Petch', monospace;
      font-size: 1.75rem;
      font-weight: 800;
      line-height: 1;
      background: linear-gradient(135deg, #00E599 0%, #00D2FF 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .athletic-ranking-ribbon {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      background: rgba(255, 184, 0, 0.12);
      border: 1px solid rgba(255, 184, 0, 0.35);
      padding: 0.15rem 0.45rem;
      border-radius: 9999px;
      font-size: 0.65rem;
      font-weight: 700;
      color: #FFB800;
      margin-top: 0.2rem;
    }
    .athletic-substats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.4rem;
      margin-bottom: 0.85rem;
    }
    .athletic-stat-pill {
      background: rgba(10, 16, 28, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 8px;
      padding: 0.45rem 0.5rem;
      text-align: center;
    }
    .athletic-stat-lbl {
      font-size: 0.6rem;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 0.15rem;
    }
    .athletic-stat-num {
      font-family: 'Chakra Petch', monospace;
      font-size: 0.95rem;
      font-weight: 700;
      color: #f8fafc;
    }
    .athletic-momentum-section {
      background: rgba(0, 0, 0, 0.35);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      padding: 0.5rem 0.65rem;
    }
    .athletic-spectrum-track {
      display: flex;
      align-items: flex-end;
      gap: 2px;
      height: 24px;
      margin-top: 0.35rem;
    }
    .athletic-spectrum-bar {
      flex: 1;
      background: rgba(255, 255, 255, 0.12);
      border-radius: 1px;
      min-height: 4px;
      transition: height 0.3s ease, background 0.3s ease;
    }

    /* True Native Mobile & Standalone Edge-to-Edge Styles */
    @media (max-width: 680px), (display-mode: standalone) {
      body {
        background: #04070D !important;
        margin: 0 !important;
        padding: 0 !important;
        width: 100vw !important;
        height: 100% !important;
        min-height: 100dvh !important;
        overflow: hidden !important;
        display: block !important;
        justify-content: flex-start !important;
      }
      .preview-header {
        display: none !important;
      }
      .device-wrapper {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100vw !important;
        max-width: 100vw !important;
        height: 100% !important;
        height: 100dvh !important;
        max-height: 100dvh !important;
        aspect-ratio: auto !important;
        border-radius: 0 !important;
        border: none !important;
        box-shadow: none !important;
        margin: 0 !important;
        padding: 0 !important;
        background: #04070D !important;
      }
      .device-notch,
      .status-bar,
      .home-indicator {
        display: none !important;
      }
      .screen-viewport {
        width: 100% !important;
        height: 100% !important;
        flex: 1 1 auto !important;
        min-height: 0 !important;
        border-radius: 0 !important;
        padding-top: max(env(safe-area-inset-top), 6px) !important;
        padding-bottom: 0 !important;
        overflow: hidden !important;
        display: flex !important;
        flex-direction: column !important;
      }
      .mobile-bottom-nav {
        padding-bottom: max(env(safe-area-inset-bottom), 12px) !important;
      }
    }

    body.is-native-app,
    html.is-native-app {
      background: #04070D !important;
      margin: 0 !important;
      padding: 0 !important;
      width: 100vw !important;
      height: 100% !important;
      min-height: 100dvh !important;
      overflow: hidden !important;
      display: block !important;
    }
    body.is-native-app .preview-header,
    body.is-native-app .device-notch,
    body.is-native-app .status-bar,
    body.is-native-app .home-indicator {
      display: none !important;
    }
    body.is-native-app .device-wrapper {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      width: 100vw !important;
      max-width: 100vw !important;
      height: 100% !important;
      height: 100dvh !important;
      max-height: 100dvh !important;
      aspect-ratio: auto !important;
      border-radius: 0 !important;
      border: none !important;
      box-shadow: none !important;
      margin: 0 !important;
      padding: 0 !important;
      background: #04070D !important;
    }
    body.is-native-app .screen-viewport {
      width: 100% !important;
      height: 100% !important;
      flex: 1 1 auto !important;
      min-height: 0 !important;
      border-radius: 0 !important;
      padding-top: max(env(safe-area-inset-top), 6px) !important;
      padding-bottom: 0 !important;
      overflow: hidden !important;
      display: flex !important;
      flex-direction: column !important;
    }
    body.is-native-app .mobile-bottom-nav {
      padding-bottom: max(env(safe-area-inset-bottom), 12px) !important;
    }
  </style>
</head>
<body>

  <div class="preview-header">
    <div class="preview-badge">
      <span>📱</span>
      <span>CricOS Mobile Client (iOS & Android)</span>
    </div>
    <h1 class="preview-title">Consumer Mobile Experience</h1>
    <p class="preview-desc">Complete multi-persona mobile client covering Captain, Player, Scorer, Fan, Umpire, Organiser, Turf Provider, and Admin.</p>
    <div style="margin-top: 0.75rem; display: flex; gap: 0.5rem; justify-content: center;">
      <a href="/" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #cbd5e1; text-decoration: none; padding: 0.35rem 0.85rem; border-radius: 8px; font-size: 0.8rem; font-weight: 600;" data-tooltip="Switch to Platform Console">← Back to Platform Console</a>
      <a href="/docs" target="_blank" style="background: rgba(0, 229, 153, 0.1); border: 1px solid rgba(0, 229, 153, 0.3); color: #00E599; text-decoration: none; padding: 0.35rem 0.85rem; border-radius: 8px; font-size: 0.8rem; font-weight: 600;" data-tooltip="Inspect REST & WebSocket API Specs">📖 OpenAPI Specs</a>
    </div>
  </div>

  <!-- Device Mockup Shell -->
  <div class="device-wrapper">
    <!-- Dynamic Island / Sensor Notch -->
    <div class="device-notch">
      <div class="notch-sensor"></div>
      <div class="notch-camera"></div>
    </div>

    <!-- iOS Status Bar -->
    <div class="status-bar">
      <span>09:41</span>
      <div class="status-icons">
        <span>5G</span>
        <span>100% 🔋</span>
      </div>
    </div>

    <!-- Active Mobile Screen -->
    <div class="screen-viewport" id="mobile-app-root">
      <!-- Injected by Mobile Client App -->
    </div>

    <!-- iOS Home Indicator -->
    <div class="home-indicator"></div>
  </div>

  <script type="module">
    // Auto-detect native mobile app / standalone mode to strip emulator framing
    (function initNativePlatformMode() {
      const isNative = window.location.protocol === 'file:' ||
        window.location.search.includes('native=true') ||
        window.matchMedia('(max-width: 680px)').matches ||
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator && window.navigator.standalone === true) ||
        /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
      if (isNative) {
        document.documentElement.classList.add('is-native-app');
        if (document.body) {
          document.body.classList.add('is-native-app');
        } else {
          window.addEventListener('DOMContentLoaded', () => {
            document.body.classList.add('is-native-app');
          });
        }
      }
    })();

    // CricOS Synthesized Web Audio Engine
    class CricOSAudioEngine {
      constructor() {
        this.ctx = null;
        this.enabled = true;
      }
      init() {
        if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          this.ctx = new AudioCtx();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
      }
      toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
      }
      playBatHit(isBoundary) {
        if (!this.enabled) return;
        try {
          this.init();
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          const now = this.ctx.currentTime;
          osc.frequency.setValueAtTime(isBoundary ? 380 : 310, now);
          osc.frequency.exponentialRampToValueAtTime(70, now + 0.14);
          gain.gain.setValueAtTime(0.5, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.16);
        } catch (_) {}
      }
      playCheer() {
        if (!this.enabled) return;
        try {
          this.init();
          if (!this.ctx) return;
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.linearRampToValueAtTime(880, now + 0.2);
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.35);
        } catch (_) {}
      }
      playWicket() {
        if (!this.enabled) return;
        try {
          this.init();
          if (!this.ctx) return;
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(260, now);
          osc.frequency.exponentialRampToValueAtTime(45, now + 0.28);
          gain.gain.setValueAtTime(0.6, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.3);
        } catch (_) {}
      }
      playClick() {
        if (!this.enabled) return;
        try {
          this.init();
          if (!this.ctx) return;
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, now);
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.05);
        } catch (_) {}
      }
    }
    window.CricOSSound = new CricOSAudioEngine();

    class StandaloneMobileClient {
      constructor() {
        this.session = null;
      }
      getBaseUrl() { return window.location.origin; }
      setSession(s) { this.session = s; }
      getSession() { return this.session; }
      clearSession() { this.session = null; }
    }

    class StandaloneMobileApp {
      constructor() {
        this.client = new StandaloneMobileClient();
        this.currentScreen = 'MATCHES';
        this.matchSubTab = 'SCORE'; // 'SCORE' | 'TELEMETRY' | 'COMMENTARY' | 'ANALYTICS'
        this.authStep = 'IDENTIFIER';
        this.identifier = '+91 98765 43210';
        this.code = '';
        this.role = 'CAPTAIN';
        this.isLoading = false;
        this.errorMessage = null;
        this.fanCheersCount = 1429;
        this.pollVotes = { BLR: 68, MUM: 32 };
        this.activeChart = 'NONE';
        this.marketCategory = 'ALL';
        this.soundEnabled = true;
        this.personaSheetOpen = false;
        this.activeActionSheet = null;
        this.toasts = [];
        this.selectedPlayerId = 'p1';
        this._screenChanged = false;

        this.playerDatabase = {
          'p1': { id: 'p1', name: 'Virat K.', role: 'CAPTAIN', jersey: 18, rating: 98.4, rank: '#1 WORLD ICC T20', runs: 4892, avg: 53.8, sr: 138.2, boundaryRate: 19.4, trueImpact: '+18.2', form: 'PEAK', momentum: [12, 14, 15, 18, 16, 20, 22, 19, 24, 21, 25, 27, 26, 28, 27, 29, 31, 30, 32, 34] },
          'p2': { id: 'p2', name: 'Rohit S.', role: 'BATTER', jersey: 45, rating: 96.1, rank: '#3 ICC OPENER', runs: 4231, avg: 48.2, sr: 142.6, boundaryRate: 21.1, trueImpact: '+16.5', form: 'EXCELLENT', momentum: [10, 12, 16, 15, 18, 17, 22, 20, 23, 22, 25, 24, 26, 28, 25, 29, 30, 28, 31, 33] },
          'p3': { id: 'p3', name: 'Shubman G.', role: 'BATTER', jersey: 77, rating: 92.5, rank: '#7 ICC ANCHOR', runs: 2840, avg: 44.5, sr: 134.1, boundaryRate: 17.8, trueImpact: '+12.4', form: 'SURGING', momentum: [8, 11, 13, 14, 16, 18, 17, 19, 21, 23, 22, 25, 24, 26, 28, 27, 29, 30, 28, 31] },
          'p4': { id: 'p4', name: 'Shreyas I.', role: 'BATTER', jersey: 96, rating: 89.8, rank: '#12 ICC MIDDLE', runs: 2310, avg: 41.2, sr: 131.5, boundaryRate: 16.2, trueImpact: '+9.8', form: 'STABLE', momentum: [14, 15, 13, 16, 18, 17, 19, 18, 20, 21, 22, 20, 23, 24, 22, 25, 24, 26, 25, 27] },
          'p5': { id: 'p5', name: 'KL Rahul', role: 'WICKETKEEPER', jersey: 1, rating: 91.2, rank: '#6 ICC KEEPER-BAT', runs: 3410, avg: 46.1, sr: 136.0, boundaryRate: 18.0, trueImpact: '+14.1', form: 'SOLID', momentum: [12, 14, 13, 15, 17, 19, 18, 20, 22, 21, 23, 25, 24, 26, 27, 25, 28, 29, 27, 30] },
          'p6': { id: 'p6', name: 'Hardik P.', role: 'ALL_ROUNDER', jersey: 33, rating: 95.8, rank: '#2 ALL-ROUNDER', runs: 2680, avg: 37.8, sr: 154.2, boundaryRate: 24.3, trueImpact: '+22.4', form: 'EXPLOSIVE', momentum: [15, 18, 20, 22, 25, 24, 26, 28, 27, 30, 29, 32, 31, 33, 35, 34, 36, 38, 37, 40] },
          'p7': { id: 'p7', name: 'Ravindra J.', role: 'ALL_ROUNDER', jersey: 8, rating: 94.0, rank: '#4 ALL-ROUNDER', runs: 2150, avg: 34.6, sr: 129.8, boundaryRate: 15.5, trueImpact: '+19.8', form: 'ELITE', momentum: [16, 17, 19, 18, 20, 22, 21, 23, 25, 24, 26, 27, 29, 28, 30, 31, 33, 32, 34, 35] },
          'p8': { id: 'p8', name: 'Axar P.', role: 'ALL_ROUNDER', jersey: 20, rating: 88.6, rank: '#14 ALL-ROUNDER', runs: 1420, avg: 29.5, sr: 132.4, boundaryRate: 16.0, trueImpact: '+11.2', form: 'RELIABLE', momentum: [11, 13, 12, 14, 16, 17, 19, 18, 20, 22, 21, 23, 24, 22, 25, 26, 27, 28, 26, 29] },
          'p9': { id: 'p9', name: 'Jasprit B.', role: 'BOWLER', jersey: 93, rating: 99.2, rank: '#1 WORLD BOWLER', runs: 120, avg: 8.5, sr: 85.0, boundaryRate: 5.2, trueImpact: '+31.5', form: 'UNSTOPPABLE', momentum: [20, 22, 25, 27, 29, 31, 30, 33, 35, 34, 36, 38, 37, 39, 41, 40, 42, 44, 43, 45] },
          'p10': { id: 'p10', name: 'Kuldeep Y.', role: 'BOWLER', jersey: 23, rating: 93.4, rank: '#5 SPINNER', runs: 85, avg: 6.2, sr: 72.0, boundaryRate: 3.1, trueImpact: '+18.9', form: 'WIZARD', momentum: [14, 16, 18, 17, 19, 21, 20, 22, 24, 23, 25, 27, 26, 28, 30, 29, 31, 33, 32, 34] },
          'p11': { id: 'p11', name: 'Mohammed S.', role: 'BOWLER', jersey: 11, rating: 92.8, rank: '#8 SEAMER', runs: 95, avg: 7.1, sr: 78.5, boundaryRate: 4.0, trueImpact: '+17.4', form: 'LETHAL', momentum: [13, 15, 17, 16, 18, 20, 19, 22, 23, 22, 24, 26, 25, 27, 29, 28, 30, 32, 31, 33] },
          'b1': { id: 'b1', name: 'Rishabh P.', role: 'WICKETKEEPER', jersey: 17, rating: 93.1, rank: '#4 DYNAMIC KEEPER', runs: 2450, avg: 39.8, sr: 152.6, boundaryRate: 23.5, trueImpact: '+17.9', form: 'IMPACT', momentum: [12, 15, 17, 19, 22, 24, 23, 26, 28, 27, 30, 29, 32, 34, 33, 35, 37, 36, 38, 41] },
          'b2': { id: 'b2', name: 'Surya Y.', role: 'BATTER', jersey: 63, rating: 97.9, rank: '#2 360-BATTER', runs: 3120, avg: 47.4, sr: 172.5, boundaryRate: 28.4, trueImpact: '+26.8', form: 'SUPERNOVA', momentum: [18, 21, 24, 26, 29, 31, 33, 35, 34, 37, 39, 38, 41, 43, 42, 44, 46, 45, 47, 49] },
          'b3': { id: 'b3', name: 'Arshdeep S.', role: 'BOWLER', jersey: 2, rating: 89.5, rank: '#11 DEATH SEAMER', runs: 42, avg: 5.2, sr: 65.0, boundaryRate: 2.5, trueImpact: '+13.8', form: 'CLUTCH', momentum: [10, 12, 14, 13, 15, 17, 16, 18, 20, 22, 21, 23, 25, 24, 26, 28, 27, 29, 31, 32] },
          'b4': { id: 'b4', name: 'Yuzvendra C.', role: 'BOWLER', jersey: 3, rating: 90.2, rank: '#9 LEGGIE', runs: 58, avg: 5.8, sr: 62.0, boundaryRate: 2.1, trueImpact: '+15.2', form: 'CRAFTY', momentum: [11, 13, 15, 14, 16, 18, 17, 19, 21, 23, 22, 24, 26, 25, 27, 28, 30, 29, 31, 33] }
        };

        this.currentSelectedZone = 'EXTRA_COVER';
        this.currentStance = 'RHB';
        this.currentShotFilter = 'ALL';
        this.currentBatterFilter = 'Virat K.';
        this.freeHitActive = false;
        this.partnership = { runs: 122, balls: 82 };
        this.holdConfirmTimer = null;
        this.holdCompleted = false;
        this.wagonPickerOpen = false;
        this.pendingWagonRuns = 0;
        this.pendingSelectedZone = 'EXTRA_COVER';
        this.extraPickerOpen = false;
        this.pendingExtraType = 'WIDE';
        this.pendingExtraOption = 0;

        this.EXTRA_DELIVERY_TYPES = {
          'WIDE': {
            name: 'Wide Delivery',
            symbol: 'Wd',
            themeColor: '#ffb800',
            badgeText: '+1 PENALTY • RE-BOWL',
            ruleDesc: 'Bowler concedes 1 penalty run + additional byes. Ball is re-bowled (over not incremented). Strike rotates on odd additional byes.',
            options: [
              { id: 'wd_0', runs: 1, batRuns: 0, byes: 0, label: 'Wide Only', sublabel: '0 extra byes', desc: '1 penalty run, ball re-bowled', rotatesStrike: false, isBoundary: false },
              { id: 'wd_1', runs: 2, batRuns: 0, byes: 1, label: '+1 Bye Run', sublabel: '2 runs total', desc: 'Batters run 1 bye, strike rotates', rotatesStrike: true, isBoundary: false },
              { id: 'wd_2', runs: 3, batRuns: 0, byes: 2, label: '+2 Bye Runs', sublabel: '3 runs total', desc: 'Batters run 2 byes', rotatesStrike: false, isBoundary: false },
              { id: 'wd_3', runs: 4, batRuns: 0, byes: 3, label: '+3 Bye Runs', sublabel: '4 runs total', desc: 'Batters run 3 byes, strike rotates', rotatesStrike: true, isBoundary: false },
              { id: 'wd_4', runs: 5, batRuns: 0, byes: 4, label: '+4 Boundary Byes', sublabel: '5 runs total (4b)', desc: 'Ball beats keeper to boundary rope', rotatesStrike: false, isBoundary: true }
            ]
          },
          'NO_BALL': {
            name: 'No Ball',
            symbol: 'Nb',
            themeColor: '#ff3366',
            badgeText: 'FREE HIT NEXT • RE-BOWL',
            ruleDesc: '1 penalty run conceded by bowler + runs off bat credited to striker. Ball is re-bowled. Free Hit awarded for next delivery.',
            options: [
              { id: 'nb_0', runs: 1, batRuns: 0, byes: 0, label: 'No Bat Runs (Dot)', sublabel: '1 run total', desc: 'Penalty only, Free Hit awarded', rotatesStrike: false, isBoundary: false },
              { id: 'nb_1', runs: 2, batRuns: 1, byes: 0, label: '1 Run Off Bat', sublabel: '2 runs total (1 bat)', desc: '1 run to batter, strike rotates, Free Hit', rotatesStrike: true, isBoundary: false },
              { id: 'nb_2', runs: 3, batRuns: 2, byes: 0, label: '2 Runs Off Bat', sublabel: '3 runs total (2 bat)', desc: '2 runs to batter, Free Hit', rotatesStrike: false, isBoundary: false },
              { id: 'nb_3', runs: 4, batRuns: 3, byes: 0, label: '3 Runs Off Bat', sublabel: '4 runs total (3 bat)', desc: '3 runs to batter, strike rotates, Free Hit', rotatesStrike: true, isBoundary: false },
              { id: 'nb_4', runs: 5, batRuns: 4, byes: 0, label: 'Four Off Bat ⚡', sublabel: '5 runs total (4 bat)', desc: 'Boundary four to batter, Free Hit', rotatesStrike: false, isBoundary: true, isFour: true },
              { id: 'nb_6', runs: 7, batRuns: 6, byes: 0, label: 'Six Off Bat 🚀', sublabel: '7 runs total (6 bat)', desc: 'Maximum six to batter, Free Hit', rotatesStrike: false, isBoundary: true, isSix: true }
            ]
          },
          'LEG_BYE': {
            name: 'Leg Bye',
            symbol: 'Lb',
            themeColor: '#00D2FF',
            badgeText: 'LEGAL BALL • NOT TO BOWLER',
            ruleDesc: 'Deflected off batter pads or body without bat contact. Counts as a legal ball in the over. Not charged to bowler.',
            options: [
              { id: 'lb_1', runs: 1, batRuns: 0, byes: 1, label: '1 Leg Bye', sublabel: '1 run total', desc: '1 run taken, strike rotates', rotatesStrike: true, isBoundary: false },
              { id: 'lb_2', runs: 2, batRuns: 0, byes: 2, label: '2 Leg Byes', sublabel: '2 runs total', desc: '2 runs taken', rotatesStrike: false, isBoundary: false },
              { id: 'lb_3', runs: 3, batRuns: 0, byes: 3, label: '3 Leg Byes', sublabel: '3 runs total', desc: '3 runs taken, strike rotates', rotatesStrike: true, isBoundary: false },
              { id: 'lb_4', runs: 4, batRuns: 0, byes: 4, label: '4 Leg Byes ⚡', sublabel: '4 runs total', desc: 'Deflected to boundary rope', rotatesStrike: false, isBoundary: true }
            ]
          },
          'BYE': {
            name: 'Bye',
            symbol: 'B',
            themeColor: '#a78bfa',
            badgeText: 'LEGAL BALL • NOT TO BOWLER',
            ruleDesc: 'Ball passes batter without touching bat or body. Counts as a legal ball in the over. Not charged to bowler.',
            options: [
              { id: 'b_1', runs: 1, batRuns: 0, byes: 1, label: '1 Bye', sublabel: '1 run total', desc: '1 run taken, strike rotates', rotatesStrike: true, isBoundary: false },
              { id: 'b_2', runs: 2, batRuns: 0, byes: 2, label: '2 Byes', sublabel: '2 runs total', desc: '2 runs taken', rotatesStrike: false, isBoundary: false },
              { id: 'b_3', runs: 3, batRuns: 0, byes: 3, label: '3 Byes', sublabel: '3 runs total', desc: '3 runs taken, strike rotates', rotatesStrike: true, isBoundary: false },
              { id: 'b_4', runs: 4, batRuns: 0, byes: 4, label: '4 Byes ⚡', sublabel: '4 runs total', desc: 'Ball beats keeper to boundary rope', rotatesStrike: false, isBoundary: true }
            ]
          }
        };

        this.SHOT_ZONES_DATA = [
          { id: 'FINE_LEG', label: 'Fine Leg', shortLabel: 'Fine Leg', angleDeg: 22.5, side: 'LEG' },
          { id: 'SQUARE_LEG', label: 'Deep Square Leg', shortLabel: 'Sq Leg', angleDeg: 67.5, side: 'LEG' },
          { id: 'MID_WICKET', label: 'Deep Mid Wicket', shortLabel: 'Mid Wkt', angleDeg: 112.5, side: 'LEG' },
          { id: 'LONG_ON', label: 'Long On', shortLabel: 'Long On', angleDeg: 157.5, side: 'LEG' },
          { id: 'LONG_OFF', label: 'Long Off', shortLabel: 'Long Off', angleDeg: 202.5, side: 'OFF' },
          { id: 'EXTRA_COVER', label: 'Cover / Extra Cover', shortLabel: 'Cover', angleDeg: 247.5, side: 'OFF' },
          { id: 'POINT', label: 'Point', shortLabel: 'Point', angleDeg: 292.5, side: 'OFF' },
          { id: 'THIRD_MAN', label: 'Third Man', shortLabel: 'Third Man', angleDeg: 337.5, side: 'OFF' }
        ];

        this.shotHistory = [
          { id: 's1', zone: 'EXTRA_COVER', runs: 4, isBoundary: true, isSix: false, batterName: 'Virat K.', ballNumber: 4, angleDeg: 248, distanceFraction: 0.98 },
          { id: 's2', zone: 'EXTRA_COVER', runs: 4, isBoundary: true, isSix: false, batterName: 'Virat K.', ballNumber: 9, angleDeg: 255, distanceFraction: 0.99 },
          { id: 's3', zone: 'MID_WICKET', runs: 6, isBoundary: true, isSix: true, batterName: 'Virat K.', ballNumber: 14, angleDeg: 115, distanceFraction: 1.15 },
          { id: 's4', zone: 'LONG_ON', runs: 6, isBoundary: true, isSix: true, batterName: 'Virat K.', ballNumber: 21, angleDeg: 160, distanceFraction: 1.18 },
          { id: 's5', zone: 'POINT', runs: 4, isBoundary: true, isSix: false, batterName: 'Virat K.', ballNumber: 26, angleDeg: 290, distanceFraction: 0.97 },
          { id: 's6', zone: 'LONG_OFF', runs: 4, isBoundary: true, isSix: false, batterName: 'Virat K.', ballNumber: 30, angleDeg: 200, distanceFraction: 0.98 },
          { id: 's7', zone: 'SQUARE_LEG', runs: 1, isBoundary: false, isSix: false, batterName: 'Virat K.', ballNumber: 2, angleDeg: 75, distanceFraction: 0.65 },
          { id: 's8', zone: 'FINE_LEG', runs: 2, isBoundary: false, isSix: false, batterName: 'Virat K.', ballNumber: 7, angleDeg: 25, distanceFraction: 0.72 },
          { id: 's9', zone: 'THIRD_MAN', runs: 1, isBoundary: false, isSix: false, batterName: 'Virat K.', ballNumber: 11, angleDeg: 335, distanceFraction: 0.68 },
          { id: 's10', zone: 'MID_WICKET', runs: 2, isBoundary: false, isSix: false, batterName: 'Virat K.', ballNumber: 17, angleDeg: 110, distanceFraction: 0.75 },
          { id: 's11', zone: 'EXTRA_COVER', runs: 0, isBoundary: false, isSix: false, batterName: 'Virat K.', ballNumber: 1, angleDeg: 250, distanceFraction: 0.35 },
          { id: 's12', zone: 'POINT', runs: 0, isBoundary: false, isSix: false, batterName: 'Virat K.', ballNumber: 6, angleDeg: 295, distanceFraction: 0.38 },

          { id: 's13', zone: 'MID_WICKET', runs: 6, isBoundary: true, isSix: true, batterName: 'Rohit S.', ballNumber: 16, angleDeg: 112, distanceFraction: 1.14 },
          { id: 's14', zone: 'SQUARE_LEG', runs: 4, isBoundary: true, isSix: false, batterName: 'Rohit S.', ballNumber: 23, angleDeg: 70, distanceFraction: 0.98 },
          { id: 's15', zone: 'LONG_ON', runs: 2, isBoundary: false, isSix: false, batterName: 'Rohit S.', ballNumber: 18, angleDeg: 162, distanceFraction: 0.78 },
          { id: 's16', zone: 'FINE_LEG', runs: 1, isBoundary: false, isSix: false, batterName: 'Rohit S.', ballNumber: 20, angleDeg: 22, distanceFraction: 0.62 },
          { id: 's17', zone: 'EXTRA_COVER', runs: 1, isBoundary: false, isSix: false, batterName: 'Rohit S.', ballNumber: 27, angleDeg: 245, distanceFraction: 0.58 },
          { id: 's18', zone: 'MID_WICKET', runs: 0, isBoundary: false, isSix: false, batterName: 'Rohit S.', ballNumber: 15, angleDeg: 118, distanceFraction: 0.4 }
        ];

        this.matchState = {
          matchId: 'match-pilot-1',
          battingTeam: 'Delhi Daredevils',
          bowlingTeam: 'Mumbai Super Strikers',
          totalRuns: 142,
          totalWickets: 3,
          legalBalls: 100,
          targetRuns: 178,
          currentOverDeliveries: ['1', '4', '•', '2'],
          striker: { name: 'Virat K.', runs: 68, balls: 44, fours: 6, sixes: 2, isStriker: true, stance: 'RHB' },
          nonStriker: { name: 'Rohit S.', runs: 54, balls: 38, fours: 4, sixes: 1, isStriker: false, stance: 'LHB' },
          bowler: { name: 'Jasprit B.', overs: 3, ballsThisOver: 4, maidens: 0, runsConceded: 24, wickets: 2 },
          commentary: [
            { ball: '16.4', badge: 'TWO', badgeColor: '#00D2FF', text: 'Pushed into the deep cover corridor, brisk sprint turns 1 into 2. Superb running!' },
            { ball: '16.3', badge: 'DOT', badgeColor: '#94a3b8', text: 'Good length jagging back in from off, defensive push down to mid-on.' },
            { ball: '16.2', badge: 'FOUR', badgeColor: '#00E599', text: 'CRACKING BOUNDARY! Slashed through backward point with blistering bat speed.' },
            { ball: '16.1', badge: 'SINGLE', badgeColor: '#cbd5e1', text: 'Tucked off the hips towards backward square leg for an easy single.' }
          ]
        };

        this.profile = {
          name: 'Virat K.',
          jerseyNumber: 18,
          role: 'BATTER',
          teamName: 'Delhi Daredevils',
          persona: 'CAPTAIN',
          batting: { runs: 4892, innings: 118, notOuts: 19, ballsFaced: 3624 },
          bowling: { wickets: 8, overs: 48, runsConceded: 384, bestBowling: '2/18' }
        };

        this.playingXI = [
          { id: 'p1', name: 'Virat K.', role: 'CAPTAIN', jersey: 18 },
          { id: 'p2', name: 'Rohit S.', role: 'BATTER', jersey: 45 },
          { id: 'p3', name: 'Shubman G.', role: 'BATTER', jersey: 77 },
          { id: 'p4', name: 'Shreyas I.', role: 'BATTER', jersey: 96 },
          { id: 'p5', name: 'KL Rahul', role: 'WICKETKEEPER', jersey: 1 },
          { id: 'p6', name: 'Hardik P.', role: 'ALL_ROUNDER', jersey: 33 },
          { id: 'p7', name: 'Ravindra J.', role: 'ALL_ROUNDER', jersey: 8 },
          { id: 'p8', name: 'Axar P.', role: 'ALL_ROUNDER', jersey: 20 },
          { id: 'p9', name: 'Jasprit B.', role: 'BOWLER', jersey: 93 },
          { id: 'p10', name: 'Kuldeep Y.', role: 'BOWLER', jersey: 23 },
          { id: 'p11', name: 'Mohammed S.', role: 'BOWLER', jersey: 11 }
        ];

        this.bench = [
          { id: 'b1', name: 'Rishabh P.', role: 'WICKETKEEPER', jersey: 17 },
          { id: 'b2', name: 'Surya Y.', role: 'BATTER', jersey: 63 },
          { id: 'b3', name: 'Arshdeep S.', role: 'BOWLER', jersey: 2 },
          { id: 'b4', name: 'Yuzvendra C.', role: 'BOWLER', jersey: 3 }
        ];

        this.toss = {
          winner: 'Delhi Daredevils',
          decision: 'BAT',
          conductedAt: '2026-09-21 09:30 AM'
        };

        this.standings = [
          { position: 1, team: 'Mumbai Super Strikers', played: 3, won: 3, lost: 0, points: 6, nrr: '+1.420', qualification: 'QUALIFIED' },
          { position: 2, team: 'Delhi Daredevils', played: 3, won: 2, lost: 1, points: 4, nrr: '+0.850', qualification: 'QUALIFIED' },
          { position: 3, team: 'Bangalore Royal Challengers', played: 3, won: 1, lost: 2, points: 2, nrr: '-0.420', qualification: 'CONTENDING' },
          { position: 4, team: 'Kolkata Knight Riders', played: 3, won: 0, lost: 3, points: 0, nrr: '-1.850', qualification: 'ELIMINATED' }
        ];

        this.fixtures = [
          { id: 'f-1', round: 'Match 1', home: 'Delhi Daredevils', away: 'Mumbai Super Strikers', time: '14:00', status: 'LIVE' },
          { id: 'f-2', round: 'Match 2', home: 'Bangalore RC', away: 'Kolkata KR', time: '18:30', status: 'SCHEDULED' },
          { id: 'f-3', round: 'Match 3', home: 'Mumbai Super Strikers', away: 'Bangalore RC', time: 'Tomorrow 14:00', status: 'UPCOMING' }
        ];

        this.listings = [
          {
            id: 'slot-1',
            title: 'Wankhede Arena Turf Club',
            category: 'GROUND',
            location: 'South Mumbai, MH',
            rating: 4.9,
            price: '3,500.00',
            priceMinor: 350000,
            slots: ['08:00 - 12:00', '13:00 - 17:00'],
            isFrozen: false
          },
          {
            id: 'slot-2',
            title: 'Nitin Menon Panel Umpire',
            category: 'UMPIRE',
            location: 'Indore, Central Zone',
            rating: 5.0,
            price: '800.00',
            priceMinor: 80000,
            slots: ['Morning Slot', 'Afternoon Slot'],
            isFrozen: false
          },
          {
            id: 'slot-3',
            title: 'Sunil Digital Scoring Services',
            category: 'SCORER',
            location: 'Bengaluru, KA',
            rating: 4.8,
            price: '600.00',
            priceMinor: 60000,
            slots: ['Full Day Match'],
            isFrozen: false
          },
          {
            id: 'slot-4',
            title: 'White Kookaburra Match Balls (Box of 6)',
            category: 'GEAR',
            location: 'National Courier Delivery',
            rating: 4.9,
            price: '1,200.00',
            priceMinor: 120000,
            slots: ['Instant Dispatch'],
            isFrozen: false
          },
          {
            id: 'slot-5',
            title: 'Elite Sports Physio & First Responder',
            category: 'MEDICAL',
            location: 'On-Pitch Emergency Panel',
            rating: 5.0,
            price: '1,500.00',
            priceMinor: 150000,
            slots: ['Full Match Cover'],
            isFrozen: false
          }
        ];

        this.incidents = [
          { id: 'inc-1', player: 'Hardik P.', severity: 'LEVEL_1', type: 'DISSENT', description: 'Questioning umpire call aggressively', penalty: 0 },
          { id: 'inc-2', player: 'Kishan V.', severity: 'LEVEL_2', type: 'EQUIPMENT_ABUSE', description: 'Striking boundary foam with bat', penalty: 5 }
        ];

        this.drsState = {
          battingReviewsLeft: 1,
          bowlingReviewsLeft: 2,
          lastCall: 'OUT (WICKETS HITTING)'
        };

        this.disputes = [
          { id: 'dsp-101', matchId: 'match-pilot-1', amount: '₹3,500.00', reason: 'Floodlight outage during 2nd innings', status: 'PENDING' }
        ];
      }

      showToast(msg, type = 'info', duration = 2500) {
        var id = 't-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        this.toasts.push({ id: id, msg: msg, type: type });
        if (window.CricOSSound) window.CricOSSound.playClick();
        try {
          if (navigator.vibrate) {
            navigator.vibrate(type === 'error' ? [80, 50, 80] : 30);
          }
        } catch (_) {}
        this.renderToasts();
        var self = this;
        setTimeout(function() {
          self.toasts = self.toasts.filter(function(t) { return t.id !== id; });
          self.renderToasts();
        }, duration);
      }

      renderToasts() {
        var container = document.getElementById('mobileToastContainer');
        if (!container) return;
        var icons = {
          success: '✓',
          error: '✕',
          warning: '⚠️',
          info: 'ℹ'
        };
        var h = '';
        for (var i = 0; i < this.toasts.length; i++) {
          var t = this.toasts[i];
          h += '<div class="mobile-toast ' + (t.type || 'info') + '">';
          h += '<span style="font-weight: 800; font-size: 0.85rem;">' + (icons[t.type] || 'ℹ') + '</span>';
          h += '<span style="flex: 1; font-weight: 600;">' + t.msg + '</span>';
          h += '</div>';
        }
        container.innerHTML = h;
      }

      openActionSheet(config) {
        this.activeActionSheet = config;
        if (window.CricOSSound) window.CricOSSound.playClick();
        this.render();
      }

      closeActionSheet() {
        this.activeActionSheet = null;
        this.render();
      }

      toggleSound() {
        this.soundEnabled = window.CricOSSound.toggle();
        this.showToast(this.soundEnabled ? 'Web Audio Sound Enabled 🔊' : 'Audio Sound Muted 🔇', 'info', 1500);
        this.render();
      }

      openPersonaSheet() {
        this.personaSheetOpen = true;
        if (window.CricOSSound) window.CricOSSound.playClick();
        this.render();
      }

      closePersonaSheet() {
        this.personaSheetOpen = false;
        this.render();
      }

      selectPlayer(id) {
        this.selectedPlayerId = id;
        if (window.CricOSSound) window.CricOSSound.playClick();
        this.render();
      }

      renderAthleticCard(playerId) {
        var p = (this.playerDatabase && this.playerDatabase[playerId]) || (this.playerDatabase ? this.playerDatabase['p1'] : null);
        if (!p) return '';
        var maxMomentum = Math.max.apply(null, p.momentum) || 50;
        var barsHtml = '';
        for (var i = 0; i < p.momentum.length; i++) {
          var val = p.momentum[i];
          var heightPct = Math.round((val / maxMomentum) * 100);
          var isLatest = i >= p.momentum.length - 4;
          var barBg = isLatest ? 'background: linear-gradient(180deg, #00E599 0%, #00D2FF 100%);' : 'background: rgba(255,255,255,0.18);';
          barsHtml += '<div class="athletic-spectrum-bar" style="height: ' + heightPct + '%; ' + barBg + '" title="Match ' + (i+1) + ': ' + val + ' pts"></div>';
        }

        var h = '<div class="athletic-stats-card" id="mobileAthleticStatsCard">';
        h += '<div class="athletic-hero-section">';
        h += '<div class="athletic-player-meta">';
        h += '<div class="athletic-avatar">#' + p.jersey + '</div>';
        h += '<div>';
        h += '<div style="font-size: 0.95rem; font-weight: 800; color: #f8fafc; font-family: Space Grotesk, sans-serif;">' + p.name + '</div>';
        h += '<div style="font-size: 0.7rem; color: #94a3b8;">' + p.role + ' • ' + p.form + '</div>';
        h += '<div class="athletic-ranking-ribbon">';
        h += '<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>';
        h += '<span>' + p.rank + '</span>';
        h += '</div>';
        h += '</div></div>';

        h += '<div class="athletic-hero-kpi">';
        h += '<div style="font-size: 0.65rem; color: #94a3b8; text-transform: uppercase; font-weight: 700;">Overall Rating</div>';
        h += '<div class="athletic-rating-val">' + p.rating + '</div>';
        h += '<div style="font-size: 0.65rem; color: #00E599; font-weight: 700;">Impact ' + p.trueImpact + '</div>';
        h += '</div></div>';

        h += '<div class="athletic-substats-grid">';
        h += '<div class="athletic-stat-pill" data-tooltip="Total Career Runs"><div class="athletic-stat-lbl">Runs</div><div class="athletic-stat-num" style="color: #00E599;">' + p.runs + '</div></div>';
        h += '<div class="athletic-stat-pill" data-tooltip="Batting Average"><div class="athletic-stat-lbl">Average</div><div class="athletic-stat-num">' + p.avg + '</div></div>';
        h += '<div class="athletic-stat-pill" data-tooltip="Strike Rate"><div class="athletic-stat-lbl">Strike Rate</div><div class="athletic-stat-num" style="color: #00D2FF;">' + p.sr + '</div></div>';
        h += '<div class="athletic-stat-pill" data-tooltip="Boundary Frequency"><div class="athletic-stat-lbl">Boundary %</div><div class="athletic-stat-num">' + p.boundaryRate + '%</div></div>';
        h += '<div class="athletic-stat-pill" data-tooltip="Calculated Win Impact"><div class="athletic-stat-lbl">True Impact</div><div class="athletic-stat-num" style="color: #FFB800;">' + p.trueImpact + '</div></div>';
        h += '<div class="athletic-stat-pill" data-tooltip="Current Form Phase"><div class="athletic-stat-lbl">Form</div><div class="athletic-stat-num" style="color: #c084fc; font-size: 0.8rem;">' + p.form + '</div></div>';
        h += '</div>';

        h += '<div class="athletic-momentum-section">';
        h += '<div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.65rem;">';
        h += '<span style="font-weight: 700; color: #cbd5e1;">⚡ 20-Match Momentum Spectrum</span>';
        h += '<span style="color: #00E599; font-weight: 800;">Surging +14%</span>';
        h += '</div>';
        h += '<div class="athletic-spectrum-track">' + barsHtml + '</div>';
        h += '</div>';
        h += '</div>';
        return h;
      }

      navigateTo(screen) {
        if (this.currentScreen !== screen) {
          this._screenChanged = true;
          this.currentScreen = screen;
        }
        this.render();
      }

      setMatchSubTab(subTab) {
        this.matchSubTab = subTab;
        if (window.CricOSSound) window.CricOSSound.playClick();
        this.render();
      }

      setAuthRole(role) {
        this.role = role;
        this.render();
      }

      switchUserPersona(role) {
        this._screenChanged = true;
        this.profile.persona = role;
        this.role = role;
        this.personaSheetOpen = false;
        var defaultProfiles = {
          CAPTAIN: { name: 'Virat K.', jersey: 18, role: 'BATTER', teamName: 'Delhi Daredevils' },
          PLAYER: { name: 'Hardik P.', jersey: 33, role: 'ALL_ROUNDER', teamName: 'Delhi Daredevils' },
          SCORER: { name: 'Sunil G.', jersey: 18, role: 'OFFICIAL_SCORER', teamName: 'BCCI Panel' },
          FAN: { name: 'Aarav M.', jersey: 7, role: 'SUPER_FAN', teamName: 'Spectator Club' },
          UMPIRE: { name: 'Nitin M.', jersey: 44, role: 'ELITE_UMPIRE', teamName: 'ICC Elite Panel' },
          ORGANISER: { name: 'Jay S.', jersey: 10, role: 'TOURNAMENT_DIRECTOR', teamName: 'CricOS League' },
          TURF_PROVIDER: { name: 'Turf Ops', jersey: 12, role: 'VENUE_OPERATOR', teamName: 'Chinnaswamy Annexe' },
          ADMIN: { name: 'System Root', jersey: 99, role: 'PLATFORM_SUPERUSER', teamName: 'CricOS Cloud' }
        };
        var def = defaultProfiles[role];
        if (def) {
          this.profile.name = def.name;
          this.profile.jerseyNumber = def.jersey;
          this.profile.role = def.role;
          this.profile.teamName = def.teamName;
        }
        if (role === 'UMPIRE' && this.currentScreen !== 'INCIDENTS') {
          this.currentScreen = 'INCIDENTS';
        } else if (role === 'ADMIN' && this.currentScreen !== 'ADMIN') {
          this.currentScreen = 'ADMIN';
        } else if (role === 'TURF_PROVIDER' && this.currentScreen !== 'MARKETPLACE') {
          this.currentScreen = 'MARKETPLACE';
        } else if (role === 'CAPTAIN' && this.currentScreen !== 'TEAMS') {
          this.currentScreen = 'TEAMS';
        }
        this.showToast('Switched to ' + role + ' persona', 'success');
        this.render();
      }

      async requestOtpAction() {
        const input = document.getElementById('authIdentifierInput');
        if (input && input.value) this.identifier = input.value.trim();
        this.isLoading = true;
        this.render();

        try {
          const res = await fetch('/api/v1/auth/otp/request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier: this.identifier })
          });
          const data = await res.json();
          this.isLoading = false;
          if (res.ok && data.success) {
            this.authStep = 'OTP_INPUT';
            this.code = data.debug_code || '123456';
            this.showToast('Verification code dispatched!', 'success');
          } else {
            this.errorMessage = data.message || 'OTP request failed';
            this.showToast(this.errorMessage, 'error');
          }
        } catch {
          this.isLoading = false;
          this.authStep = 'OTP_INPUT';
          this.code = '123456';
          this.showToast('Test OTP ready: 123456', 'info');
        }
        this.render();
      }

      backToIdentifier() {
        this.authStep = 'IDENTIFIER';
        this.render();
      }

      async verifyOtpAction() {
        const input = document.getElementById('authCodeInput');
        if (input && input.value) this.code = input.value.trim();
        this.isLoading = true;
        this.render();

        try {
          const res = await fetch('/api/v1/auth/otp/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier: this.identifier, code: this.code, role: this.role })
          });
          const data = await res.json();
          this.isLoading = false;
          if (res.ok && data.token) {
            this.client.setSession({ token: data.token, role: this.role });
            this.profile.persona = this.role;
            this.showToast('Signed in successfully as ' + this.role, 'success');
            this.navigateTo('MATCHES');
            return;
          }
        } catch {}

        this.isLoading = false;
        this.client.setSession({ token: 'mock-jwt-token', role: this.role });
        this.profile.persona = this.role;
        this.showToast('Signed in as ' + this.role, 'success');
        this.navigateTo('MATCHES');
      }

      onPadNumberSelect(runs) {
        if (this.profile.persona !== 'SCORER') {
          this.showToast('🔒 Only official Scorers can score deliveries.', 'warning');
          return;
        }
        if (window.CricOSSound) window.CricOSSound.playClick();
        this.pendingWagonRuns = Number(runs);
        this.pendingSelectedZone = this.currentSelectedZone || 'EXTRA_COVER';
        this.wagonPickerOpen = true;
        this.render();
      }

      openWagonPickerSheet(runs) {
        this.onPadNumberSelect(runs);
      }

      closeWagonPickerSheet() {
        this.wagonPickerOpen = false;
        this.render();
      }

      selectPickerZone(zoneId) {
        this.pendingSelectedZone = zoneId;
        this.currentSelectedZone = zoneId;
        if (window.CricOSSound) window.CricOSSound.playClick();
        this.render();
      }

      confirmWagonShot(skipDirection) {
        var runs = this.pendingWagonRuns;
        var zone = skipDirection ? (this.currentSelectedZone || 'EXTRA_COVER') : (this.pendingSelectedZone || this.currentSelectedZone || 'EXTRA_COVER');
        this.wagonPickerOpen = false;
        this.scoreBall(runs, zone);
      }

      scoreBall(runs, chosenZone) {
        if (this.profile.persona !== 'SCORER') {
          this.showToast('🔒 Only official Scorers can score deliveries.', 'warning');
          return;
        }
        if (chosenZone) {
          this.currentSelectedZone = chosenZone;
        }
        if (window.CricOSSound) {
          if (runs === 4 || runs === 6) {
            window.CricOSSound.playBatHit(true);
            window.CricOSSound.playCheer();
          } else {
            window.CricOSSound.playBatHit(false);
          }
        }
        this.matchState.totalRuns += runs;
        this.matchState.legalBalls += 1;
        this.matchState.striker.runs += runs;
        this.matchState.striker.balls += 1;
        if (runs === 4) this.matchState.striker.fours = (this.matchState.striker.fours || 0) + 1;
        if (runs === 6) this.matchState.striker.sixes = (this.matchState.striker.sixes || 0) + 1;

        this.partnership.runs = (this.partnership.runs || 0) + runs;
        this.partnership.balls = (this.partnership.balls || 0) + 1;

        this.matchState.bowler.ballsThisOver += 1;
        this.matchState.bowler.runsConceded += runs;

        var dTag = runs === 0 ? '•' : runs.toString();
        this.matchState.currentOverDeliveries.push(dTag);

        var isSix = runs === 6;
        var isBoundary = runs === 4 || isSix;
        var self = this;
        var zoneDef = this.SHOT_ZONES_DATA.find(function(z) { return z.id === self.currentSelectedZone; });
        var angle = zoneDef ? zoneDef.angleDeg + (Math.random() * 16 - 8) : 247.5;
        var dist = isSix ? 1.16 : (isBoundary ? 0.98 : (runs === 0 ? 0.36 : 0.72));

        this.shotHistory.push({
          id: 's' + Date.now(),
          zone: this.currentSelectedZone,
          runs: runs,
          isBoundary: isBoundary,
          isSix: isSix,
          batterName: this.matchState.striker.name,
          ballNumber: this.matchState.striker.balls,
          angleDeg: angle,
          distanceFraction: dist
        });

        var commBadge = runs === 0 ? 'DOT' : (runs === 4 ? 'FOUR' : (runs === 6 ? 'SIX' : 'RUNS'));
        var commColor = runs === 4 ? '#00E599' : (runs === 6 ? '#c084fc' : (runs === 0 ? '#94a3b8' : '#00D2FF'));
        var ballNum = Math.floor(this.matchState.legalBalls / 6) + '.' + (this.matchState.legalBalls % 6);
        this.matchState.commentary.unshift({
          ball: ballNum,
          badge: commBadge,
          badgeColor: commColor,
          text: runs === 4 ? 'CRACKING BOUNDARY! Slashed cleanly to ' + (zoneDef ? zoneDef.label : 'outfield') + '.' : (runs === 6 ? 'MASSIVE MAXIMUM SIX! Cleared the boundary into the crowd!' : (runs === 0 ? 'Dot ball. Solid forward defence.' : runs + ' run(s) taken briskly between wickets.'))
        });

        if (this.freeHitActive) {
          this.freeHitActive = false;
          this.showToast('Free Hit delivery completed', 'info');
        }

        if (runs % 2 !== 0) {
          const tmp = this.matchState.striker;
          this.matchState.striker = this.matchState.nonStriker;
          this.matchState.nonStriker = tmp;
        }

        if (this.matchState.bowler.ballsThisOver >= 6) {
          this.matchState.bowler.overs += 1;
          this.matchState.bowler.ballsThisOver = 0;
          this.matchState.currentOverDeliveries = [];
          const tmp = this.matchState.striker;
          this.matchState.striker = this.matchState.nonStriker;
          this.matchState.nonStriker = tmp;
          this.showToast('Over completed! Strike rotated.', 'info');
        } else {
          this.showToast('+' + runs + (runs === 1 ? ' run' : ' runs') + ' scored (' + (zoneDef ? zoneDef.shortLabel : 'Field') + ')', 'success', 1200);
        }
        this.render();
      }

      openExtraPickerSheet(type) {
        if (this.profile.persona !== 'SCORER') {
          this.showToast('🔒 Only official Scorers can score extras.', 'warning');
          return;
        }
        if (window.CricOSSound) window.CricOSSound.playClick();
        this.pendingExtraType = type || 'WIDE';
        this.pendingExtraOption = 0;
        this.extraPickerOpen = true;
        this.render();
      }

      closeExtraRunsPickerSheet() {
        this.extraPickerOpen = false;
        this.render();
      }

      switchExtraTypeInPicker(type) {
        if (window.CricOSSound) window.CricOSSound.playClick();
        this.pendingExtraType = type;
        this.pendingExtraOption = 0;
        this.render();
      }

      selectExtraOption(idx) {
        if (window.CricOSSound) window.CricOSSound.playClick();
        this.pendingExtraOption = Number(idx);
        this.render();
      }

      confirmExtraRuns() {
        var type = this.pendingExtraType || 'WIDE';
        var extraDef = this.EXTRA_DELIVERY_TYPES[type] || this.EXTRA_DELIVERY_TYPES['WIDE'];
        var opt = extraDef.options[this.pendingExtraOption] || extraDef.options[0];
        this.extraPickerOpen = false;
        this.applyExtraDelivery(type, opt);
      }

      applyExtraDelivery(type, opt) {
        if (this.profile.persona !== 'SCORER') {
          this.showToast('🔒 Only official Scorers can score extras.', 'warning');
          return;
        }
        var totalRuns = opt.runs;
        var batRuns = opt.batRuns || 0;
        var rotatesStrike = opt.rotatesStrike;
        var isBoundary = opt.isBoundary;

        if (window.CricOSSound) {
          if (isBoundary || opt.isFour || opt.isSix) {
            window.CricOSSound.playBatHit(true);
            window.CricOSSound.playCheer();
          } else {
            window.CricOSSound.playClick();
          }
        }

        this.matchState.totalRuns += totalRuns;
        this.partnership.runs = (this.partnership.runs || 0) + totalRuns;

        if (type === 'WIDE') {
          this.matchState.bowler.runsConceded += totalRuns;
          var tagWd = totalRuns === 1 ? '1wd' : (totalRuns + 'wd');
          this.matchState.currentOverDeliveries.push(tagWd);
          this.showToast('+' + totalRuns + ' Wide recorded (re-bowl)', 'warning');
        } else if (type === 'NO_BALL') {
          this.freeHitActive = true;
          this.matchState.bowler.runsConceded += totalRuns;
          if (batRuns > 0) {
            this.matchState.striker.runs += batRuns;
            this.matchState.striker.balls += 1;
            if (opt.isFour) this.matchState.striker.fours = (this.matchState.striker.fours || 0) + 1;
            if (opt.isSix) this.matchState.striker.sixes = (this.matchState.striker.sixes || 0) + 1;
          }
          var tagNb = batRuns === 0 ? '1nb' : (batRuns + 'nb');
          this.matchState.currentOverDeliveries.push(tagNb);
          this.showToast('⚠️ NO BALL! (+' + totalRuns + ' runs) Free Hit awarded! ⚡', 'warning', 3000);
        } else if (type === 'LEG_BYE') {
          this.matchState.legalBalls += 1;
          this.partnership.balls = (this.partnership.balls || 0) + 1;
          this.matchState.bowler.ballsThisOver += 1;
          var tagLb = totalRuns === 1 ? '1lb' : (totalRuns + 'lb');
          this.matchState.currentOverDeliveries.push(tagLb);
          this.showToast('+' + totalRuns + ' Leg Bye' + (rotatesStrike ? ' (Strike rotated)' : ''), 'info');
        } else if (type === 'BYE') {
          this.matchState.legalBalls += 1;
          this.partnership.balls = (this.partnership.balls || 0) + 1;
          this.matchState.bowler.ballsThisOver += 1;
          var tagB = totalRuns === 1 ? '1b' : (totalRuns + 'b');
          this.matchState.currentOverDeliveries.push(tagB);
          this.showToast('+' + totalRuns + ' Bye' + (rotatesStrike ? ' (Strike rotated)' : ''), 'info');
        }

        var commBadge = type === 'WIDE' ? 'WIDE' : (type === 'NO_BALL' ? 'NO BALL' : (type === 'LEG_BYE' ? 'LEG BYE' : 'BYE'));
        var commColor = type === 'WIDE' ? '#ffb800' : (type === 'NO_BALL' ? '#ff3366' : (type === 'LEG_BYE' ? '#00D2FF' : '#a78bfa'));
        var ballNum = Math.floor(this.matchState.legalBalls / 6) + '.' + (this.matchState.legalBalls % 6);
        this.matchState.commentary.unshift({
          ball: ballNum,
          badge: commBadge,
          badgeColor: commColor,
          text: opt.desc + (opt.batRuns > 0 ? ' (' + opt.batRuns + ' run(s) off bat to ' + this.matchState.striker.name + ')' : '')
        });

        if (rotatesStrike) {
          var tmp = this.matchState.striker;
          this.matchState.striker = this.matchState.nonStriker;
          this.matchState.nonStriker = tmp;
        }

        // Over completion check for legal balls (Byes / Leg Byes)
        if (this.matchState.bowler.ballsThisOver >= 6) {
          this.matchState.bowler.overs += 1;
          this.matchState.bowler.ballsThisOver = 0;
          this.matchState.currentOverDeliveries = [];
          var tmpOver = this.matchState.striker;
          this.matchState.striker = this.matchState.nonStriker;
          this.matchState.nonStriker = tmpOver;
          this.showToast('Over completed! Strike rotated.', 'info');
        }

        this.render();
      }

      scoreExtra(type, runs) {
        if (!runs) {
          this.openExtraPickerSheet(type);
          return;
        }
        var opt = {
          runs: runs,
          batRuns: 0,
          rotatesStrike: runs % 2 !== 0,
          isBoundary: runs >= 4,
          desc: '+' + runs + ' ' + (type === 'WIDE' ? 'Wide' : (type === 'NO_BALL' ? 'No Ball' : (type === 'LEG_BYE' ? 'Leg Bye' : 'Bye')))
        };
        this.applyExtraDelivery(type, opt);
      }

      scoreCompoundExtra(batRuns, extraRuns, extraType) {
        if (this.profile.persona !== 'SCORER') {
          this.showToast('🔒 Only official Scorers can score compound extras.', 'warning');
          return;
        }
        if (window.CricOSSound) window.CricOSSound.playClick();
        var total = batRuns + extraRuns;
        this.matchState.totalRuns += total;
        this.partnership.runs = (this.partnership.runs || 0) + total;
        this.matchState.bowler.runsConceded += total;

        if (extraType === 'WIDE') {
          this.matchState.currentOverDeliveries.push('5wd');
          this.showToast('Wide + 4 Byes (+5 runs total, re-bowl)', 'warning');
        } else if (extraType === 'NO_BALL') {
          this.freeHitActive = true;
          this.matchState.striker.runs += batRuns;
          this.matchState.striker.balls += 1;
          if (batRuns === 4) this.matchState.striker.fours = (this.matchState.striker.fours || 0) + 1;
          if (batRuns === 6) this.matchState.striker.sixes = (this.matchState.striker.sixes || 0) + 1;
          this.matchState.currentOverDeliveries.push(batRuns === 4 ? '4nb' : '6nb');
          this.showToast('No Ball + Boundary (+' + total + ' runs, Free Hit active!) ⚡', 'warning', 3000);
        } else if (extraType === 'PENALTY') {
          this.matchState.currentOverDeliveries.push('+5Pen');
          this.showToast('Penalty Awarded (+5 runs to batting team)', 'warning');
        }
        this.render();
      }

      promptWicketModal() {
        if (this.profile.persona !== 'SCORER') {
          this.showToast('🔒 Only official Scorers can record wickets.', 'warning');
          return;
        }
        var strikerName = this.matchState.striker.name;
        var self = this;
        this.openActionSheet({
          title: '🚨 Confirm Wicket Dismissal',
          bodyHtml: '<div style="font-size: 0.85rem; color: #cbd5e1; margin-bottom: 0.75rem;">Select dismissal method for striker <strong style="color: #ff3366;">' + strikerName + '</strong>:</div>' +
            '<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.4rem; margin-bottom: 0.85rem;">' +
            '<button type="button" class="mobile-chip active" style="text-align: center;" onclick="this.parentElement.dataset.method=\\'CAUGHT\\'">Caught</button>' +
            '<button type="button" class="mobile-chip" style="text-align: center;" onclick="this.parentElement.dataset.method=\\'BOWLED\\'">Bowled</button>' +
            '<button type="button" class="mobile-chip" style="text-align: center;" onclick="this.parentElement.dataset.method=\\'LBW\\'">LBW</button>' +
            '<button type="button" class="mobile-chip" style="text-align: center;" onclick="this.parentElement.dataset.method=\\'RUN_OUT\\'">Run Out</button>' +
            '<button type="button" class="mobile-chip" style="text-align: center;" onclick="this.parentElement.dataset.method=\\'STUMPED\\'">Stumped</button>' +
            '<button type="button" class="mobile-chip" style="text-align: center;" onclick="this.parentElement.dataset.method=\\'HIT_WKT\\'">Hit Wkt</button>' +
            '</div>' +
            '<div style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.4rem;">Incoming Batter:</div>' +
            '<select id="incomingBatterSelect" style="width: 100%; background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 0.6rem; color: #f8fafc; font-size: 0.85rem; margin-bottom: 0.85rem;">' +
            '<option value="Rishabh P.">#17 Rishabh Pant (WKT)</option>' +
            '<option value="Surya Y.">#63 Suryakumar Yadav (BAT)</option>' +
            '<option value="Hardik P.">#33 Hardik Pandya (ALL)</option>' +
            '</select>',
          confirmText: 'Dismiss Batter (W) ✓',
          confirmStyle: 'background: #ff3366; color: #fff;',
          onConfirm: function() {
            if (window.CricOSSound) window.CricOSSound.playWicket();
            var select = document.getElementById('incomingBatterSelect');
            var nextBatter = select ? select.value : 'Rishabh P.';
            self.matchState.totalWickets += 1;
            self.matchState.legalBalls += 1;
            self.matchState.bowler.wickets += 1;
            self.matchState.bowler.ballsThisOver += 1;
            self.matchState.currentOverDeliveries.push('W');
            self.matchState.striker = { name: nextBatter, runs: 0, balls: 0, fours: 0, sixes: 0, isStriker: true, stance: 'LHB' };
            self.matchState.commentary.unshift({
              ball: Math.floor(self.matchState.legalBalls / 6) + '.' + (self.matchState.legalBalls % 6),
              badge: 'WICKET',
              badgeColor: '#ff3366',
              text: 'OUT! ' + strikerName + ' dismissed! In walks ' + nextBatter + ' to the middle.'
            });
            self.showToast('WICKET! ' + strikerName + ' out. New batter: ' + nextBatter, 'error');
            self.closeActionSheet();
          }
        });
      }

      rotateStrike() {
        if (this.profile.persona !== 'SCORER') {
          this.showToast('🔒 Only official Scorers can swap strike.', 'warning');
          return;
        }
        const tmp = this.matchState.striker;
        this.matchState.striker = this.matchState.nonStriker;
        this.matchState.nonStriker = tmp;
        this.currentStance = this.matchState.striker.stance || (this.currentStance === 'RHB' ? 'LHB' : 'RHB');
        this.showToast('Strike swapped between batsmen', 'info', 1500);
        this.render();
      }

      undoBall() {
        this.undoLastDelivery();
      }

      undoLastDelivery() {
        if (this.profile.persona !== 'SCORER') {
          this.showToast('🔒 Only official Scorers can undo deliveries.', 'warning');
          return;
        }
        if (this.matchState.currentOverDeliveries.length > 0) {
          var last = this.matchState.currentOverDeliveries.pop();
          if (this.shotHistory.length > 0) {
            this.shotHistory.pop();
          }
          if (last === 'W') {
            this.matchState.totalWickets = Math.max(0, this.matchState.totalWickets - 1);
            this.matchState.bowler.wickets = Math.max(0, this.matchState.bowler.wickets - 1);
            this.matchState.legalBalls = Math.max(0, this.matchState.legalBalls - 1);
            this.matchState.bowler.ballsThisOver = Math.max(0, this.matchState.bowler.ballsThisOver - 1);
          } else if (last.indexOf('wd') !== -1) {
            var rWd = parseInt(last, 10) || 1;
            this.matchState.totalRuns = Math.max(0, this.matchState.totalRuns - rWd);
            this.matchState.bowler.runsConceded = Math.max(0, this.matchState.bowler.runsConceded - rWd);
            this.partnership.runs = Math.max(0, (this.partnership.runs || 0) - rWd);
          } else if (last.indexOf('nb') !== -1) {
            var rNb = parseInt(last, 10) || 1;
            this.matchState.totalRuns = Math.max(0, this.matchState.totalRuns - rNb);
            this.matchState.bowler.runsConceded = Math.max(0, this.matchState.bowler.runsConceded - rNb);
            this.partnership.runs = Math.max(0, (this.partnership.runs || 0) - rNb);
            this.freeHitActive = false;
          } else {
            var r = parseInt(last, 10) || 0;
            this.matchState.totalRuns = Math.max(0, this.matchState.totalRuns - r);
            this.matchState.striker.runs = Math.max(0, this.matchState.striker.runs - r);
            this.matchState.striker.balls = Math.max(0, this.matchState.striker.balls - 1);
            this.partnership.runs = Math.max(0, (this.partnership.runs || 0) - r);
            this.partnership.balls = Math.max(0, (this.partnership.balls || 0) - 1);
            this.matchState.bowler.runsConceded = Math.max(0, this.matchState.bowler.runsConceded - r);
            this.matchState.legalBalls = Math.max(0, this.matchState.legalBalls - 1);
            this.matchState.bowler.ballsThisOver = Math.max(0, this.matchState.bowler.ballsThisOver - 1);
            if (r % 2 !== 0) {
              var tmp = this.matchState.striker;
              this.matchState.striker = this.matchState.nonStriker;
              this.matchState.nonStriker = tmp;
            }
          }
          this.showToast('Last delivery undone per Scorer protocol ↺', 'info');
          this.render();
        } else {
          this.showToast('No deliveries in current over to undo', 'warning');
        }
      }

      setBatterStance(stance) {
        this.currentStance = stance;
        this.showToast('Stance: ' + stance + (stance === 'LHB' ? ' (Field Mirrored)' : ' (Standard)'), 'info', 1200);
        this.render();
      }

      selectWagonZone(zoneId) {
        this.currentSelectedZone = zoneId;
        var self = this;
        var zoneDef = this.SHOT_ZONES_DATA.find(function(z) { return z.id === zoneId; });
        if (navigator.vibrate) navigator.vibrate([15, 25, 20]);
        this.showToast('🎯 Target zone: ' + (zoneDef ? zoneDef.label : zoneId), 'info', 1200);
        this.render();
      }

      filterWagonBatter(name) {
        this.currentBatterFilter = name;
        this.render();
      }

      filterWagonShots(filter) {
        this.currentShotFilter = filter;
        this.render();
      }

      renderMobileWagonRays() {
        var centerX = 180;
        var centerY = 156;
        var radius = 162;
        var self = this;
        var filteredShots = this.shotHistory.filter(function(s) {
          if (self.currentBatterFilter !== 'ALL' && s.batterName !== self.currentBatterFilter) return false;
          if (self.currentShotFilter === 'BOUNDARIES') return s.isBoundary;
          if (self.currentShotFilter === 'SINGLES') return !s.isBoundary && s.runs > 0;
          if (self.currentShotFilter === 'DOTS') return s.runs === 0;
          return true;
        });

        var raysHtml = '';
        for (var i = 0; i < filteredShots.length; i++) {
          var shot = filteredShots[i];
          var angle = shot.angleDeg;
          if (this.currentStance === 'LHB') {
            angle = (360 - angle) % 360;
          }
          var rad = ((angle - 90) * Math.PI) / 180;
          var dist = shot.distanceFraction * radius;
          var targetX = Math.round(centerX + dist * Math.cos(rad));
          var targetY = Math.round(centerY + dist * Math.sin(rad));

          if (shot.isSix) {
            var midX = (centerX + targetX) / 2 + (i % 2 === 0 ? 3 : -3);
            var midY = (centerY + targetY) / 2 - 16;
            raysHtml += '<path d="M ' + centerX + ',' + centerY + ' Q ' + midX + ',' + midY + ' ' + targetX + ',' + targetY + '" fill="none" stroke="#FFB800" stroke-width="2.8" stroke-linecap="round" style="filter: drop-shadow(0 0 4px rgba(255, 184, 0, 0.7));"/>';
            raysHtml += '<polygon points="' + targetX + ',' + (targetY - 5) + ' ' + (targetX + 2) + ',' + (targetY - 1) + ' ' + (targetX + 6) + ',' + targetY + ' ' + (targetX + 2) + ',' + (targetY + 1) + ' ' + targetX + ',' + (targetY + 5) + ' ' + (targetX - 2) + ',' + (targetY + 1) + ' ' + (targetX - 6) + ',' + targetY + ' ' + (targetX - 2) + ',' + (targetY - 1) + '" fill="#FFB800"/>';
          } else if (shot.isBoundary) {
            raysHtml += '<line x1="' + centerX + '" y1="' + centerY + '" x2="' + targetX + '" y2="' + targetY + '" stroke="#00E599" stroke-width="2.4" stroke-linecap="round" style="filter: drop-shadow(0 0 3px rgba(0, 229, 153, 0.6));"/>';
            raysHtml += '<circle cx="' + targetX + '" cy="' + targetY + '" r="3.5" fill="#00E599" stroke="#04070D" stroke-width="1"/>';
          } else if (shot.runs > 0) {
            raysHtml += '<line x1="' + centerX + '" y1="' + centerY + '" x2="' + targetX + '" y2="' + targetY + '" stroke="#00D2FF" stroke-width="' + (shot.runs >= 2 ? '1.8' : '1.3') + '" stroke-linecap="round"/>';
            raysHtml += '<circle cx="' + targetX + '" cy="' + targetY + '" r="2" fill="#00D2FF"/>';
          } else {
            raysHtml += '<line x1="' + centerX + '" y1="' + centerY + '" x2="' + targetX + '" y2="' + targetY + '" stroke="#64748B" stroke-width="1.1" stroke-dasharray="3,3" stroke-linecap="round"/>';
            raysHtml += '<circle cx="' + targetX + '" cy="' + targetY + '" r="1.5" fill="#64748B"/>';
          }
        }
        return raysHtml;
      }

      renderWagonPickerSheet() {
        if (!this.wagonPickerOpen) return '';
        var runs = this.pendingWagonRuns;
        var striker = this.matchState.striker;
        var self = this;
        var activeZoneDef = this.SHOT_ZONES_DATA.find(function(z) { return z.id === self.pendingSelectedZone; }) || this.SHOT_ZONES_DATA[4];
        var activeZoneLabel = activeZoneDef.label;
        var activeZoneSide = activeZoneDef.side;
        var activeZoneShort = activeZoneDef.shortLabel;

        var runsLabel = 'DOT (0 RUNS)';
        var runsColor = '#94a3b8';
        if (runs === 1) { runsLabel = '+1 SINGLE'; runsColor = '#00D2FF'; }
        else if (runs === 2) { runsLabel = '+2 DOUBLE'; runsColor = '#00D2FF'; }
        else if (runs === 3) { runsLabel = '+3 TRIPLE'; runsColor = '#00D2FF'; }
        else if (runs === 4) { runsLabel = '+4 FOUR ⚡'; runsColor = '#00D2FF'; }
        else if (runs === 6) { runsLabel = '+6 MAXIMUM 🚀'; runsColor = '#00E599'; }

        var h = '';
        h += '<div class="mobile-sheet-backdrop active" id="wagonPickerBackdrop" onclick="window.cricosMobileApp.closeWagonPickerSheet()"></div>';
        h += '<div class="mobile-wagon-picker-sheet active" id="wagonPickerSheet">';
        h += '<div class="sheet-drag-handle"></div>';

        // Header
        h += '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">';
        h += '<div>';
        h += '<div style="font-size: 0.95rem; font-weight: 800; font-family: Space Grotesk, sans-serif; color: #f8fafc; display: flex; align-items: center; gap: 0.4rem;">';
        h += '<span>🎯 Select Shot Direction</span>';
        h += '<span style="font-size: 0.65rem; font-family: Chakra Petch, monospace; font-weight: 800; padding: 0.15rem 0.45rem; border-radius: 4px; background: rgba(0, 229, 153, 0.15); color: ' + runsColor + '; border: 1px solid ' + runsColor + '40;">' + runsLabel + '</span>';
        h += '</div>';
        h += '<div style="font-size: 0.72rem; color: #94a3b8; margin-top: 0.15rem;">Batter: <strong style="color: #f8fafc;">' + striker.name + '</strong> (' + this.currentStance + ')</div>';
        h += '</div>';

        h += '<div style="display: flex; align-items: center; gap: 0.4rem;">';
        h += '<div style="display: inline-flex; background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 6px; padding: 2px;">';
        h += '<button type="button" data-stance="RHB" onclick="window.cricosMobileApp.setBatterStance(this.dataset.stance)" style="font-size: 0.62rem; font-weight: 700; padding: 0.15rem 0.45rem; border-radius: 4px; border: none; background: ' + (this.currentStance === 'RHB' ? '#00E599' : 'transparent') + '; color: ' + (this.currentStance === 'RHB' ? '#04070D' : '#94a3b8') + '; cursor: pointer;" data-tooltip="Right-handed batter stance">RHB</button>';
        h += '<button type="button" data-stance="LHB" onclick="window.cricosMobileApp.setBatterStance(this.dataset.stance)" style="font-size: 0.62rem; font-weight: 700; padding: 0.15rem 0.45rem; border-radius: 4px; border: none; background: ' + (this.currentStance === 'LHB' ? '#00E599' : 'transparent') + '; color: ' + (this.currentStance === 'LHB' ? '#04070D' : '#94a3b8') + '; cursor: pointer;" data-tooltip="Left-handed batter stance">LHB</button>';
        h += '</div>';
        h += '<button type="button" onclick="window.cricosMobileApp.closeWagonPickerSheet()" style="background: none; border: none; color: #94a3b8; font-size: 1.2rem; cursor: pointer; padding: 0 0.3rem;" data-tooltip="Dismiss wagon wheel">&times;</button>';
        h += '</div>';
        h += '</div>';

        // Zone Status Readout
        h += '<div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0, 229, 153, 0.08); border: 1px solid rgba(0, 229, 153, 0.25); border-radius: 8px; padding: 0.4rem 0.6rem; margin-bottom: 0.6rem;">';
        h += '<div style="display: flex; align-items: center; gap: 0.35rem;">';
        h += '<span style="font-size: 0.8rem;">📍</span>';
        h += '<span style="font-family: Chakra Petch, monospace; font-size: 0.72rem; font-weight: 800; color: #00E599;" id="wagonPickerActiveZoneLabel">' + activeZoneLabel.toUpperCase() + ' (' + activeZoneSide + '-SIDE)</span>';
        h += '</div>';
        h += '<span style="font-size: 0.65rem; color: #94a3b8;">Tap sector or quick button</span>';
        h += '</div>';

        // Sector Wedges
        var wedges = [
          { id: 'THIRD_MAN', d: 'M180,180 L65.5,65.5 A162,162 0 0,1 180,18 Z', name: 'Third Man' },
          { id: 'FINE_LEG', d: 'M180,180 L180,18 A162,162 0 0,1 294.5,65.5 Z', name: 'Fine Leg' },
          { id: 'POINT', d: 'M180,180 L18,180 A162,162 0 0,1 65.5,65.5 Z', name: 'Point' },
          { id: 'SQUARE_LEG', d: 'M180,180 L294.5,65.5 A162,162 0 0,1 342,180 Z', name: 'Deep Square Leg' },
          { id: 'EXTRA_COVER', d: 'M180,180 L65.5,294.5 A162,162 0 0,1 18,180 Z', name: 'Extra Cover' },
          { id: 'MID_WICKET', d: 'M180,180 L342,180 A162,162 0 0,1 294.5,294.5 Z', name: 'Deep Mid Wicket' },
          { id: 'LONG_OFF', d: 'M180,180 L180,342 A162,162 0 0,1 65.5,294.5 Z', name: 'Long Off' },
          { id: 'LONG_ON', d: 'M180,180 L294.5,294.5 A162,162 0 0,1 180,342 Z', name: 'Long On' }
        ];

        var wedgesSvg = '';
        for (var w = 0; w < wedges.length; w++) {
          var isSel = this.pendingSelectedZone === wedges[w].id;
          wedgesSvg += '<path class="wagon-sector-wedge ' + (isSel ? 'active' : '') + '" d="' + wedges[w].d + '" data-zone="' + wedges[w].id + '" onclick="window.cricosMobileApp.selectPickerZone(this.dataset.zone)" data-tooltip="Aim at ' + wedges[w].name + '"/>';
        }

        // SVG Outfield Preview
        h += '<div style="display: flex; justify-content: center; align-items: center; margin-bottom: 0.6rem;">';
        h += '<svg viewBox="0 0 360 360" style="width: 100%; max-width: 250px; height: auto;" xmlns="http://www.w3.org/2000/svg">';
        h += '<defs>';
        h += '<radialGradient id="pickerTurfGrad" cx="50%" cy="50%" r="50%">';
        h += '<stop offset="0%" stop-color="#0e3d2a"/>';
        h += '<stop offset="60%" stop-color="#0a2a1d"/>';
        h += '<stop offset="100%" stop-color="#051710"/>';
        h += '</radialGradient>';
        h += '<linearGradient id="pickerPitchGrad" x1="0%" y1="0%" x2="0%" y2="100%">';
        h += '<stop offset="0%" stop-color="#947c59"/>';
        h += '<stop offset="50%" stop-color="#bda073"/>';
        h += '<stop offset="100%" stop-color="#947c59"/>';
        h += '</linearGradient>';
        h += '<filter id="pickerRopeGlow" x="-20%" y="-20%" width="140%" height="140%">';
        h += '<feGaussianBlur stdDeviation="3" result="blur"/>';
        h += '<feComposite in="SourceGraphic" in2="blur" operator="over"/>';
        h += '</filter>';
        h += '</defs>';

        h += '<circle cx="180" cy="180" r="162" fill="url(#pickerTurfGrad)"/>';
        h += '<circle cx="180" cy="180" r="162" fill="none" stroke="#00E599" stroke-opacity="0.35" stroke-width="2" filter="url(#pickerRopeGlow)"/>';

        for (var ring = 135; ring >= 45; ring -= 30) {
          h += '<circle cx="180" cy="180" r="' + ring + '" fill="none" stroke="rgba(255, 255, 255, 0.03)" stroke-width="15"/>';
        }
        h += '<circle cx="180" cy="180" r="90" fill="none" stroke="rgba(255, 255, 255, 0.2)" stroke-dasharray="3,3" stroke-width="1.2"/>';
        h += '<circle cx="180" cy="180" r="162" fill="none" stroke="rgba(255, 255, 255, 0.25)" stroke-width="1.5"/>';
        h += '<text x="180" y="26" fill="rgba(255, 255, 255, 0.45)" font-size="7" font-family="Chakra Petch, monospace" text-anchor="middle">75m BOUNDARY ROPE</text>';

        h += '<line x1="180" y1="18" x2="180" y2="342" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1"/>';
        h += '<line x1="18" y1="180" x2="342" y2="180" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1"/>';
        h += '<line x1="65" y1="65" x2="295" y2="295" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1"/>';
        h += '<line x1="295" y1="65" x2="65" y2="295" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1"/>';

        h += wedgesSvg;

        // Pitch Strip
        h += '<rect x="168" y="140" width="24" height="80" rx="3" fill="url(#pickerPitchGrad)" stroke="rgba(255, 255, 255, 0.2)" stroke-width="1"/>';
        h += '<line x1="164" y1="150" x2="196" y2="150" stroke="#FFFFFF" stroke-width="1.2"/>';
        h += '<line x1="168" y1="156" x2="192" y2="156" stroke="rgba(255, 255, 255, 0.7)" stroke-width="0.8"/>';
        h += '<circle cx="177" cy="148" r="1" fill="#FFFFFF"/>';
        h += '<circle cx="180" cy="148" r="1" fill="#FFFFFF"/>';
        h += '<circle cx="183" cy="148" r="1" fill="#FFFFFF"/>';

        h += '<line x1="164" y1="210" x2="196" y2="210" stroke="#FFFFFF" stroke-width="1.2"/>';
        h += '<line x1="168" y1="204" x2="192" y2="204" stroke="rgba(255, 255, 255, 0.7)" stroke-width="0.8"/>';
        h += '<circle cx="177" cy="212" r="1" fill="#FFFFFF"/>';
        h += '<circle cx="180" cy="212" r="1" fill="#FFFFFF"/>';
        h += '<circle cx="183" cy="212" r="1" fill="#FFFFFF"/>';

        // Striker Point
        h += '<circle cx="180" cy="156" r="4.5" fill="#00E599" stroke="#FFFFFF" stroke-width="1.5"/>';

        // Dynamic Shot Preview Ray to the Selected Zone
        var previewAngle = activeZoneDef.angleDeg;
        if (this.currentStance === 'LHB') {
          previewAngle = (360 - previewAngle) % 360;
        }
        var rad = ((previewAngle - 90) * Math.PI) / 180;
        var pDistFraction = runs === 6 ? 1.15 : (runs === 4 ? 0.98 : (runs === 0 ? 0.35 : 0.7));
        var targetDist = 162 * pDistFraction;
        var endX = 180 + Math.cos(rad) * targetDist;
        var endY = 156 + Math.sin(rad) * targetDist;

        if (runs === 6) {
          var cpX = 180 + Math.cos(rad) * (targetDist * 0.5) - Math.sin(rad) * 16;
          var cpY = 156 + Math.sin(rad) * (targetDist * 0.5) + Math.cos(rad) * 16;
          h += '<path d="M180,156 Q' + cpX.toFixed(1) + ',' + cpY.toFixed(1) + ' ' + endX.toFixed(1) + ',' + endY.toFixed(1) + '" fill="none" stroke="#FFB800" stroke-width="2.8" stroke-linecap="round"/>';
          h += '<polygon points="' + endX.toFixed(1) + ',' + (endY - 6).toFixed(1) + ' ' + (endX + 4).toFixed(1) + ',' + (endY + 3).toFixed(1) + ' ' + (endX - 5).toFixed(1) + ',' + (endY - 2).toFixed(1) + ' ' + (endX + 5).toFixed(1) + ',' + (endY - 2).toFixed(1) + ' ' + (endX - 4).toFixed(1) + ',' + (endY + 3).toFixed(1) + '" fill="#FFB800"/>';
        } else if (runs === 4) {
          h += '<line x1="180" y1="156" x2="' + endX.toFixed(1) + '" y2="' + endY.toFixed(1) + '" stroke="#00D2FF" stroke-width="2.6" stroke-linecap="round"/>';
          h += '<circle cx="' + endX.toFixed(1) + '" cy="' + endY.toFixed(1) + '" r="4.5" fill="#00D2FF" stroke="#FFFFFF" stroke-width="1.5"/>';
        } else if (runs === 0) {
          h += '<line x1="180" y1="156" x2="' + endX.toFixed(1) + '" y2="' + endY.toFixed(1) + '" stroke="#94a3b8" stroke-width="1.8" stroke-dasharray="3,3" stroke-linecap="round"/>';
          h += '<circle cx="' + endX.toFixed(1) + '" cy="' + endY.toFixed(1) + '" r="2.5" fill="#94a3b8"/>';
        } else {
          h += '<line x1="180" y1="156" x2="' + endX.toFixed(1) + '" y2="' + endY.toFixed(1) + '" stroke="#00E599" stroke-width="2" stroke-linecap="round"/>';
          h += '<circle cx="' + endX.toFixed(1) + '" cy="' + endY.toFixed(1) + '" r="3.5" fill="#00E599"/>';
        }

        var offText = this.currentStance === 'RHB' ? '◀ OFF' : '◀ ON';
        var legText = this.currentStance === 'RHB' ? 'ON ▶' : 'OFF ▶';
        h += '<text x="35" y="174" fill="#00D2FF" font-size="8" font-family="Chakra Petch, monospace" font-weight="700">' + offText + '</text>';
        h += '<text x="325" y="174" fill="#00E599" font-size="8" font-family="Chakra Petch, monospace" font-weight="700" text-anchor="end">' + legText + '</text>';
        h += '</svg></div>';

        // 8 Tactile Zone Grid Buttons
        h += '<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.35rem; margin-bottom: 0.75rem;">';
        for (var zi = 0; zi < this.SHOT_ZONES_DATA.length; zi++) {
          var zd = this.SHOT_ZONES_DATA[zi];
          var isZoneSel = this.pendingSelectedZone === zd.id;
          h += '<button type="button" class="wagon-picker-zone-btn ' + (isZoneSel ? 'active' : '') + '" data-zone="' + zd.id + '" onclick="window.cricosMobileApp.selectPickerZone(this.dataset.zone)" data-tooltip="Aim at ' + zd.label + ' (' + zd.side + ')">';
          h += zd.shortLabel;
          h += '<div style="font-size: 0.58rem; color: ' + (zd.side === 'OFF' ? '#00D2FF' : '#00E599') + '; font-weight: 700;">' + zd.side + '</div>';
          h += '</button>';
        }
        h += '</div>';

        // Footer Actions
        h += '<div style="display: flex; gap: 0.5rem;">';
        h += '<button type="button" onclick="window.cricosMobileApp.confirmWagonShot(true)" style="flex: 1; padding: 0.65rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); background: transparent; color: #94a3b8; font-weight: 600; font-size: 0.8rem;" data-tooltip="Record +' + runs + ' runs without direction">Skip</button>';
        h += '<button type="button" id="btnConfirmWagonShot" onclick="window.cricosMobileApp.confirmWagonShot(false)" style="flex: 2; padding: 0.65rem; border-radius: 8px; border: none; font-weight: 800; font-size: 0.85rem; background: linear-gradient(135deg, #00E599, #00D2FF); color: #04070D; box-shadow: 0 4px 15px rgba(0, 229, 153, 0.3);" data-tooltip="Confirm shot direction and score ball">Record +' + runs + ' to ' + activeZoneShort + ' ✓</button>';
        h += '</div>';

        h += '</div>';
        return h;
      }

      renderExtraRunsPickerSheet() {
        if (!this.extraPickerOpen) return '';
        var type = this.pendingExtraType || 'WIDE';
        var extraDef = this.EXTRA_DELIVERY_TYPES[type] || this.EXTRA_DELIVERY_TYPES['WIDE'];
        var selectedIdx = this.pendingExtraOption;
        var selectedOption = extraDef.options[selectedIdx] || extraDef.options[0];
        var themeColor = extraDef.themeColor;
        var totalRuns = selectedOption.runs;

        var h = '';
        h += '<div class="mobile-sheet-backdrop active" id="extraPickerBackdrop" onclick="window.cricosMobileApp.closeExtraRunsPickerSheet()"></div>';
        h += '<div class="mobile-extra-picker-sheet active" id="extraRunsPickerSheet" style="border-top-color: ' + themeColor + ';">';
        h += '<div class="sheet-drag-handle"></div>';

        // Header
        h += '<div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.6rem;">';
        h += '<div>';
        h += '<div style="font-size: 0.95rem; font-weight: 800; font-family: Space Grotesk, sans-serif; color: #f8fafc; display: flex; align-items: center; gap: 0.4rem;">';
        h += '<span>⚡ ' + extraDef.name + '</span>';
        h += '<span style="font-size: 0.65rem; font-family: Chakra Petch, monospace; font-weight: 800; padding: 0.15rem 0.45rem; border-radius: 4px; background: ' + themeColor + '20; color: ' + themeColor + '; border: 1px solid ' + themeColor + '50;">' + extraDef.badgeText + '</span>';
        h += '</div>';
        h += '<div style="font-size: 0.72rem; color: #94a3b8; margin-top: 0.15rem;">Choose total runs scored off this delivery</div>';
        h += '</div>';
        h += '<button type="button" onclick="window.cricosMobileApp.closeExtraRunsPickerSheet()" style="background: none; border: none; color: #94a3b8; font-size: 1.25rem; cursor: pointer; padding: 0 0.3rem;" data-tooltip="Dismiss extra runs picker">&times;</button>';
        h += '</div>';

        // Segmented Switcher for Extra Type (Wide, No Ball, Leg Bye, Bye)
        h += '<div style="display: flex; gap: 0.25rem; background: rgba(255, 255, 255, 0.05); padding: 3px; border-radius: 8px; margin-bottom: 0.65rem;">';
        var typesList = [
          { id: 'WIDE', label: 'Wd', full: 'Wide' },
          { id: 'NO_BALL', label: 'Nb', full: 'No Ball' },
          { id: 'LEG_BYE', label: 'Lb', full: 'Leg Bye' },
          { id: 'BYE', label: 'Bye', full: 'Bye' }
        ];
        for (var t = 0; t < typesList.length; t++) {
          var tObj = typesList[t];
          var isTypeActive = tObj.id === type;
          var tColor = this.EXTRA_DELIVERY_TYPES[tObj.id].themeColor;
          h += '<button type="button" data-extra-type="' + tObj.id + '" onclick="window.cricosMobileApp.switchExtraTypeInPicker(this.dataset.extraType)" style="flex: 1; padding: 0.35rem 0.2rem; font-size: 0.72rem; font-weight: 700; border-radius: 6px; border: none; cursor: pointer; transition: background-color 0.15s ease, color 0.15s ease; background: ' + (isTypeActive ? tColor : 'transparent') + '; color: ' + (isTypeActive ? '#04070D' : '#94a3b8') + ';" data-tooltip="Switch to ' + tObj.full + ' delivery">' + tObj.label + '</button>';
        }
        h += '</div>';

        // Rule Explanation Card
        h += '<div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 0.5rem 0.65rem; margin-bottom: 0.75rem; font-size: 0.68rem; color: #cbd5e1; line-height: 1.4; display: flex; align-items: flex-start; gap: 0.4rem;">';
        h += '<span style="font-size: 0.85rem;">ℹ️</span>';
        h += '<div>' + extraDef.ruleDesc + '</div>';
        h += '</div>';

        // Options List / Cards
        h += '<div style="display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 0.85rem;" id="extraRunOptionsContainer">';
        for (var i = 0; i < extraDef.options.length; i++) {
          var opt = extraDef.options[i];
          var isSelected = i === selectedIdx;
          h += '<div class="extra-run-option-card ' + (isSelected ? 'active' : '') + '" style="' + (isSelected ? 'border-color: ' + themeColor + '; background: ' + themeColor + '18;' : '') + '" data-option-index="' + i + '" onclick="window.cricosMobileApp.selectExtraOption(Number(this.dataset.optionIndex))" data-tooltip="Select ' + opt.label + ' (+' + opt.runs + ' runs)">';
          h += '<div style="display: flex; align-items: center; gap: 0.65rem;">';
          h += '<div style="font-family: Chakra Petch, monospace; font-size: 1.15rem; font-weight: 800; min-width: 44px; text-align: center; color: ' + (isSelected ? themeColor : '#f8fafc') + '; background: rgba(255, 255, 255, 0.05); padding: 0.25rem 0.4rem; border-radius: 6px; border: 1px solid ' + (isSelected ? themeColor : 'rgba(255,255,255,0.1)') + ';">+' + opt.runs + '</div>';
          h += '<div>';
          h += '<div style="font-size: 0.82rem; font-weight: 700; color: #f8fafc;">' + opt.label + '</div>';
          h += '<div style="font-size: 0.68rem; color: #94a3b8; margin-top: 0.1rem;">' + opt.desc + '</div>';
          h += '</div>';
          h += '</div>';
          h += '<div style="display: flex; align-items: center; gap: 0.4rem;">';
          h += '<span style="font-size: 0.62rem; font-family: Chakra Petch, monospace; padding: 0.15rem 0.4rem; border-radius: 4px; background: rgba(255, 255, 255, 0.06); color: #94a3b8; border: 1px solid rgba(255, 255, 255, 0.1);">' + opt.sublabel + '</span>';
          h += '<div style="width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 900; background: ' + (isSelected ? themeColor : 'rgba(255, 255, 255, 0.1)') + '; color: ' + (isSelected ? '#04070D' : 'transparent') + ';">✓</div>';
          h += '</div>';
          h += '</div>';
        }
        h += '</div>';

        // Footer Actions
        h += '<div style="display: flex; gap: 0.5rem;">';
        h += '<button type="button" onclick="window.cricosMobileApp.closeExtraRunsPickerSheet()" style="flex: 1; padding: 0.65rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); background: transparent; color: #94a3b8; font-weight: 600; font-size: 0.8rem;" data-tooltip="Cancel and dismiss extra runs picker">Cancel</button>';
        h += '<button type="button" id="btnConfirmExtraRuns" onclick="window.cricosMobileApp.confirmExtraRuns()" style="flex: 2; padding: 0.65rem; border-radius: 8px; border: none; font-weight: 800; font-size: 0.85rem; background: ' + (type === 'NO_BALL' ? 'linear-gradient(135deg, #ff3366, #ffb800)' : (type === 'WIDE' ? 'linear-gradient(135deg, #ffb800, #ff8c00)' : (type === 'LEG_BYE' ? 'linear-gradient(135deg, #00D2FF, #00E599)' : 'linear-gradient(135deg, #a78bfa, #00D2FF)'))) + '; color: #04070D; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);" data-tooltip="Record +' + totalRuns + ' ' + extraDef.name + '">Record ' + extraDef.symbol + ' (+' + totalRuns + (totalRuns === 1 ? ' Run' : ' Runs') + ') ✓</button>';
        h += '</div>';

        h += '</div>';
        return h;
      }

      handleResetButtonClick() {
        if (!this.holdCompleted) {
          this.showToast('Hold ↺ for 2 seconds to reset score', 'warning', 2500);
        }
        this.holdCompleted = false;
      }

      bindHoldToReset() {
        var resetBtn = document.getElementById('btnMobileStudioReset');
        if (!resetBtn) return;
        var self = this;

        var startHold = function(e) {
          if (e.button !== undefined && e.button !== 0) return;
          self.holdCompleted = false;
          resetBtn.classList.add('holding');
          clearTimeout(self.holdConfirmTimer);
          self.holdConfirmTimer = setTimeout(function() {
            self.holdCompleted = true;
            resetBtn.classList.remove('holding');
            self.resetInningsScore();
            if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
          }, 2000);
        };

        var cancelHold = function() {
          clearTimeout(self.holdConfirmTimer);
          resetBtn.classList.remove('holding');
        };

        resetBtn.addEventListener('mousedown', startHold);
        resetBtn.addEventListener('mouseup', cancelHold);
        resetBtn.addEventListener('mouseleave', cancelHold);
        resetBtn.addEventListener('touchstart', startHold, { passive: true });
        resetBtn.addEventListener('touchend', cancelHold, { passive: true });
        resetBtn.addEventListener('touchcancel', cancelHold, { passive: true });
      }

      resetInningsScore() {
        this.matchState.totalRuns = 0;
        this.matchState.totalWickets = 0;
        this.matchState.legalBalls = 0;
        this.matchState.currentOverDeliveries = [];
        this.matchState.striker.runs = 0;
        this.matchState.striker.balls = 0;
        this.matchState.striker.fours = 0;
        this.matchState.striker.sixes = 0;
        this.matchState.nonStriker.runs = 0;
        this.matchState.nonStriker.balls = 0;
        this.matchState.nonStriker.fours = 0;
        this.matchState.nonStriker.sixes = 0;
        this.matchState.bowler.overs = 0;
        this.matchState.bowler.ballsThisOver = 0;
        this.matchState.bowler.maidens = 0;
        this.matchState.bowler.runsConceded = 0;
        this.matchState.bowler.wickets = 0;
        this.freeHitActive = false;
        this.partnership = { runs: 0, balls: 0 };
        this.shotHistory = [];
        this.showToast('Scoreboard reset for new innings ↺', 'success');
        this.render();
      }

      toggleChart(chart) {
        if (this.activeChart === chart) {
          this.activeChart = 'NONE';
        } else {
          this.activeChart = chart;
        }
        this.render();
      }

      sendCheer(text) {
        this.fanCheersCount++;
        if (window.CricOSSound) {
          window.CricOSSound.playCheer();
        }
        this.showToast('Cheer Sent: ' + text + ' 🔥 (' + this.fanCheersCount.toLocaleString() + ' live)', 'success', 1500);
        this.render();
      }

      votePoll(team) {
        if (team === 'BLR') this.pollVotes.BLR++;
        else this.pollVotes.MUM++;
        this.showToast('Vote Recorded! Win Probability: BLR ' + this.pollVotes.BLR + '% • MUM ' + this.pollVotes.MUM + '%', 'success');
        this.render();
      }

      conductTossModal() {
        var self = this;
        this.openActionSheet({
          title: '🪙 Match Toss Certification',
          bodyHtml: '<div style="text-align: center; margin-bottom: 1rem;">' +
            '<div style="font-size: 2.5rem; margin-bottom: 0.35rem;">🪙</div>' +
            '<div style="font-size: 0.85rem; color: #cbd5e1; font-weight: 600;">MCC Law 13: The Toss</div>' +
            '</div>' +
            '<div style="margin-bottom: 0.85rem;">' +
            '<label style="display: block; font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.35rem;">Toss Winner:</label>' +
            '<select id="tossWinnerSelect" style="width: 100%; background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 0.6rem; color: #f8fafc; font-size: 0.85rem;">' +
            '<option value="Bangalore Royal Challengers">Bangalore Royal Challengers</option>' +
            '<option value="Delhi Daredevils">Delhi Daredevils</option>' +
            '<option value="Mumbai Super Strikers">Mumbai Super Strikers</option>' +
            '</select></div>' +
            '<div style="margin-bottom: 1rem;">' +
            '<label style="display: block; font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.35rem;">Elected To:</label>' +
            '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;" id="tossDecisionGroup">' +
            '<button type="button" class="mobile-chip active" style="text-align: center; padding: 0.5rem;" onclick="this.classList.add(\\'active\\'); this.nextElementSibling.classList.remove(\\'active\\'); this.parentElement.dataset.decision=\\'BAT\\'">🏏 Bat First</button>' +
            '<button type="button" class="mobile-chip" style="text-align: center; padding: 0.5rem;" onclick="this.classList.add(\\'active\\'); this.previousElementSibling.classList.remove(\\'active\\'); this.parentElement.dataset.decision=\\'BOWL\\'">🎳 Bowl First</button>' +
            '</div></div>',
          confirmText: 'Certify Toss Result ✓',
          confirmStyle: 'background: linear-gradient(135deg, #FFB800, #FF8800); color: #04070D;',
          onConfirm: function() {
            var wSelect = document.getElementById('tossWinnerSelect');
            var winner = wSelect ? wSelect.value : 'Bangalore Royal Challengers';
            var dGroup = document.getElementById('tossDecisionGroup');
            var decision = (dGroup && dGroup.dataset.decision) || 'BAT';
            self.toss = { winner: winner, decision: decision, conductedAt: 'Certified just now' };
            self.showToast('🪙 Toss Certified: ' + winner + ' elected to ' + decision + ' first.', 'success');
            self.closeActionSheet();
          }
        });
      }

      benchPlayer(idx) {
        if (this.bench.length > 0) {
          const removed = this.playingXI.splice(idx, 1)[0];
          const promoted = this.bench.shift();
          if (removed && promoted) {
            this.playingXI.push(promoted);
            this.bench.push(removed);
            this.showToast('Tactical Swap: ' + removed.name + ' benched, ' + promoted.name + ' promoted to Playing XI', 'success');
            this.render();
          }
        }
      }

      bookTurfInstant(title, price) {
        this.showToast('✓ Authoritative 15-Min GiST Lock Activated for ' + title + ' (₹' + price + ')', 'success');
      }

      openEventBasketModal() {
        var self = this;
        this.openActionSheet({
          title: '🧺 Event Basket Procurement',
          bodyHtml: '<div style="font-size: 0.78rem; color: #cbd5e1; margin-bottom: 0.85rem;">Unified multi-vendor procurement bundle under authoritative 15-min GiST escrow lock:</div>' +
            '<div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 0.65rem; margin-bottom: 0.75rem; font-size: 0.75rem;">' +
            '<div style="display: flex; justify-content: space-between; padding: 0.2rem 0;"><span>🏟️ Wankhede Arena Turf</span><strong style="color: #00E599;">₹3,500.00</strong></div>' +
            '<div style="display: flex; justify-content: space-between; padding: 0.2rem 0;"><span>⚖️ Nitin Menon Umpire Panel</span><strong style="color: #00E599;">₹800.00</strong></div>' +
            '<div style="display: flex; justify-content: space-between; padding: 0.2rem 0;"><span>⚡ Sunil Digital Scorer</span><strong style="color: #00E599;">₹600.00</strong></div>' +
            '<div style="display: flex; justify-content: space-between; padding: 0.2rem 0;"><span>🏏 White Kookaburra Balls</span><strong style="color: #00E599;">₹400.00</strong></div>' +
            '<div style="border-top: 1px solid rgba(255,255,255,0.1); margin-top: 0.35rem; padding-top: 0.35rem; display: flex; justify-content: space-between; font-weight: 700;"><span>Subtotal</span><span>₹5,300.00</span></div>' +
            '<div style="display: flex; justify-content: space-between; color: #94a3b8; font-size: 0.7rem;"><span>Platform Fee (5%)</span><span>₹265.00</span></div>' +
            '<div style="display: flex; justify-content: space-between; color: #94a3b8; font-size: 0.7rem;"><span>GST (18% on fee)</span><span>₹47.70</span></div>' +
            '<div style="border-top: 1px solid rgba(0,229,153,0.3); margin-top: 0.35rem; padding-top: 0.35rem; display: flex; justify-content: space-between; font-weight: 800; color: #00E599; font-size: 0.85rem;"><span>Total Escrow Hold</span><span>₹5,612.70</span></div>' +
            '</div>',
          confirmText: 'Confirm & Lock GiST Escrow Hold →',
          confirmStyle: 'background: linear-gradient(135deg, #00E599, #00D2FF); color: #04070D;',
          onConfirm: function() {
            self.showToast('Escrow hold of ₹5,612.70 locked via GiST spatio-temporal ledger! 🔒', 'success');
            self.closeActionSheet();
          }
        });
      }

      openDrsReviewSheet() {
        var self = this;
        this.openActionSheet({
          title: '📡 Hawk-Eye DRS Review Telemetry',
          bodyHtml: '<div style="text-align: center; margin-bottom: 0.85rem;">' +
            '<div style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.5rem;">Ball Tracking Path: Mitchell Starc to Virat Kohli (16.4)</div>' +
            '<svg viewBox="0 0 320 120" width="100%" height="120" xmlns="http://www.w3.org/2000/svg" style="background: rgba(0,0,0,0.5); border-radius: 8px;">' +
            '<rect x="20" y="90" width="280" height="4" fill="#8C6E3D" />' +
            '<line x1="280" y1="50" x2="280" y2="90" stroke="#FFB800" stroke-width="4" />' +
            '<path d="M 30 40 Q 150 90 280 65" fill="none" stroke="#00E599" stroke-width="3" />' +
            '<circle cx="150" cy="90" r="4" fill="#FF3366" />' +
            '<circle cx="210" cy="80" r="5" fill="#FFB800" />' +
            '<circle cx="280" cy="65" r="4" fill="#FF3366" />' +
            '<text x="150" y="105" fill="#94a3b8" font-size="8" text-anchor="middle">Pitch: In-Line</text>' +
            '<text x="210" y="70" fill="#94a3b8" font-size="8" text-anchor="middle">Impact: In-Line</text>' +
            '<text x="280" y="55" fill="#00E599" font-size="8" text-anchor="middle">Wickets: Hitting</text>' +
            '</svg>' +
            '<div style="margin-top: 0.75rem; padding: 0.5rem; background: rgba(255,51,102,0.15); border: 1px solid #FF3366; border-radius: 6px; font-weight: 800; color: #FF3366; font-size: 0.85rem;">OUT — WICKETS HITTING (MIDDLE STUMP)</div>' +
            '</div>',
          confirmText: 'Uphold On-Field Out Verdict ✓',
          confirmStyle: 'background: #FF3366; color: #fff;',
          onConfirm: function() {
            self.showToast('DRS Verdict Upheld: OUT (Review Retained) 📡', 'success');
            self.closeActionSheet();
          }
        });
      }

      openGearCustomizerSheet() {
        var self = this;
        this.openActionSheet({
          title: '🏏 3D Cricket Bat & Gear Configurator',
          bodyHtml: '<div style="font-size: 0.78rem; color: #cbd5e1; margin-bottom: 0.75rem;">Customise Grade 1 willow blade & rubber grip textures:</div>' +
            '<div style="margin-bottom: 0.75rem;">' +
            '<label style="display: block; font-size: 0.72rem; color: #94a3b8; margin-bottom: 0.35rem;">Willow Grade Selection:</label>' +
            '<select id="willowGradeSelect" style="width: 100%; background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 0.55rem; color: #f8fafc; font-size: 0.8rem;">' +
            '<option value="Grade 1 English Willow (₹18,500)">Grade 1 English Willow (₹18,500)</option>' +
            '<option value="Kashmiri Willow Pro (₹8,200)">Kashmiri Willow Pro (₹8,200)</option>' +
            '<option value="Carbon-Core Hybrid (₹24,000)">Carbon-Core Hybrid (₹24,000)</option>' +
            '</select></div>' +
            '<div style="margin-bottom: 0.75rem;">' +
            '<label style="display: block; font-size: 0.72rem; color: #94a3b8; margin-bottom: 0.35rem;">Grip Accent Color:</label>' +
            '<div style="display: flex; gap: 0.4rem;">' +
            '<button type="button" class="mobile-chip active" style="flex: 1; text-align: center;">Emerald</button>' +
            '<button type="button" class="mobile-chip" style="flex: 1; text-align: center;">Cyan</button>' +
            '<button type="button" class="mobile-chip" style="flex: 1; text-align: center;">Amber</button>' +
            '<button type="button" class="mobile-chip" style="flex: 1; text-align: center;">Stealth</button>' +
            '</div></div>',
          confirmText: 'Add Custom Gear to Basket 🛒',
          confirmStyle: 'background: linear-gradient(135deg, #00E599, #00D2FF); color: #04070D;',
          onConfirm: function() {
            var select = document.getElementById('willowGradeSelect');
            var val = select ? select.value : 'Grade 1 English Willow';
            self.showToast('✓ ' + val + ' added to CricOS Event Basket!', 'success');
            self.closeActionSheet();
          }
        });
      }

      generateFixtures() {
        this.showToast('📅 Round-Robin Brackets Generated: 8 teams, 28 matches with temporal GiST conflict prevention.', 'success');
      }

      setKnockoutReminder(match) {
        this.showToast('⏰ Push notification reminder set for ' + match, 'success');
      }

      publishSlotAction() {
        var self = this;
        this.openActionSheet({
          title: '🏟️ Publish Match Slot',
          bodyHtml: '<div style="margin-bottom: 0.75rem;">' +
            '<label style="display: block; font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.35rem;">Slot Title:</label>' +
            '<input type="text" id="slotTitleInput" value="Night Floodlit Prime Slot" style="width: 100%; box-sizing: border-box; background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 0.6rem; color: #f8fafc; font-size: 0.85rem;" />' +
            '</div>' +
            '<div style="margin-bottom: 0.75rem;">' +
            '<label style="display: block; font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.35rem;">Hourly Rate (₹):</label>' +
            '<input type="number" id="slotPriceInput" value="3500" style="width: 100%; box-sizing: border-box; background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 0.6rem; color: #f8fafc; font-size: 0.85rem;" />' +
            '</div>',
          confirmText: 'Publish Live Slot ⚡',
          confirmStyle: 'background: linear-gradient(135deg, #00E599, #00D2FF); color: #04070D;',
          onConfirm: function() {
            var titleInput = document.getElementById('slotTitleInput');
            var priceInput = document.getElementById('slotPriceInput');
            var title = (titleInput && titleInput.value) || 'Night Floodlit Slot';
            var price = (priceInput && priceInput.value) || '3500';
            self.listings.push({
              id: 'slot-' + Date.now(),
              title: title,
              category: 'GROUND',
              location: 'South Mumbai, MH',
              rating: 5.0,
              price: price + '.00',
              priceMinor: parseInt(price, 10) * 100,
              slots: ['20:00 - 23:00'],
              isFrozen: false
            });
            self.showToast('✓ New match slot published: ' + title + ' at ₹' + price + '/hr.', 'success');
            self.closeActionSheet();
            self.render();
          }
        });
      }

      toggleSlotFreeze(idx) {
        this.listings[idx].isFrozen = !this.listings[idx].isFrozen;
        var st = this.listings[idx].isFrozen ? 'FROZEN / BLOCKED' : 'ACTIVE & BOOKABLE';
        this.showToast('Slot status updated: ' + st, this.listings[idx].isFrozen ? 'warning' : 'success');
        this.render();
      }

      fileIncidentAction() {
        var self = this;
        this.openActionSheet({
          title: '🚨 Report Code of Conduct Breach',
          bodyHtml: '<div style="margin-bottom: 0.75rem;">' +
            '<label style="display: block; font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.35rem;">Reported Player:</label>' +
            '<select id="incidentPlayerSelect" style="width: 100%; background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 0.6rem; color: #f8fafc; font-size: 0.85rem;">' +
            '<option value="Shubman Gill">Shubman Gill (Delhi Daredevils)</option>' +
            '<option value="Hardik Pandya">Hardik Pandya (Mumbai Strikers)</option>' +
            '<option value="Virat Kohli">Virat Kohli (Bangalore RC)</option>' +
            '</select></div>' +
            '<div style="margin-bottom: 0.75rem;">' +
            '<label style="display: block; font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.35rem;">MCC Severity Level:</label>' +
            '<select id="incidentSeveritySelect" style="width: 100%; background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 0.6rem; color: #f8fafc; font-size: 0.85rem;">' +
            '<option value="LEVEL_1">Level 1: Dissent / Warning</option>' +
            '<option value="LEVEL_2">Level 2: Equipment Abuse (+5 Penalty)</option>' +
            '<option value="LEVEL_3">Level 3: Umpire Intimidation</option>' +
            '<option value="LEVEL_4">Level 4: Violent Conduct</option>' +
            '</select></div>' +
            '<div style="margin-bottom: 0.75rem;">' +
            '<label style="display: block; font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.35rem;">Description:</label>' +
            '<input type="text" id="incidentDescInput" value="Questioning LBW ruling repeatedly" style="width: 100%; box-sizing: border-box; background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 0.6rem; color: #f8fafc; font-size: 0.85rem;" />' +
            '</div>',
          confirmText: 'Log Breach & Notify Match Referee 🚨',
          confirmStyle: 'background: #ff3366; color: #fff;',
          onConfirm: function() {
            var pSelect = document.getElementById('incidentPlayerSelect');
            var sSelect = document.getElementById('incidentSeveritySelect');
            var dInput = document.getElementById('incidentDescInput');
            var p = pSelect ? pSelect.value : 'Shubman Gill';
            var s = sSelect ? sSelect.value : 'LEVEL_1';
            var d = dInput ? dInput.value : 'Dissent';
            self.incidents.push({
              id: 'inc-' + Date.now(),
              player: p,
              severity: s,
              type: 'DISSENT',
              description: d,
              penalty: s === 'LEVEL_2' ? 5 : 0
            });
            self.showToast('🚨 Incident logged for ' + p + ' (' + s + '). Forwarded to Referee.', 'error');
            self.closeActionSheet();
            self.render();
          }
        });
      }

      awardPenaltyRuns(runs) {
        this.matchState.totalRuns += runs;
        this.showToast('✓ +' + runs + ' Penalty runs awarded per MCC Laws 41/42.', 'warning');
        this.render();
      }

      signOffMatchAction() {
        this.showToast('✓ Match officially certified and signed off by Lead Umpire under MCC Laws.', 'success');
      }

      approveDispute(idx) {
        this.disputes[idx].status = 'REFUNDED';
        this.showToast('✓ Dispute Approved! Balanced double-entry refund journal executed: Debit REFUND_CLEARING, Credit ESCROW_HOLD.', 'success');
        this.render();
      }

      rejectDispute(idx) {
        this.disputes[idx].status = 'REJECTED';
        this.showToast('✕ Dispute Rejected. Escrow payout released to provider.', 'info');
        this.render();
      }

      signOutAction() {
        this.client.clearSession();
        this.showToast('Signed out of session', 'info');
        this.navigateTo('AUTH');
      }

      promptDeleteAccount() {
        var self = this;
        this.openActionSheet({
          title: '🗑️ Delete CricOS Account & Personal Data',
          bodyHtml: '<div style="font-size: 0.82rem; color: #ff8099; background: rgba(255,51,102,0.1); border: 1px solid rgba(255,51,102,0.3); border-radius: 8px; padding: 0.75rem; margin-bottom: 0.85rem;">' +
            '<strong>App Store Guideline 5.1.1(v) Notice:</strong><br/>' +
            'This action is permanent and irreversible. All personal profiles, career statistics, match records, and wallet escrow details will be permanently erased.' +
            '</div>' +
            '<div style="font-size: 0.75rem; color: #cbd5e1; margin-bottom: 0.75rem;">Are you certain you wish to proceed?</div>',
          confirmText: 'Permanently Erase All Data',
          confirmStyle: 'background: #ff3366; color: #fff;',
          onConfirm: function() {
            self.client.clearSession();
            self.showToast('✓ Account scheduled for permanent deletion per App Store 5.1.1(v).', 'info');
            self.closeActionSheet();
            self.navigateTo('AUTH');
          }
        });
      }

      renderAuth() {
        var h = '<div style="padding: 1.5rem 1.25rem;">';
        h += '<div style="text-align: center; margin-bottom: 1.5rem;">';
        h += '<div style="font-size: 2.75rem; margin-bottom: 0.5rem;">🏏</div>';
        h += '<h2 style="margin: 0; font-family: Space Grotesk, sans-serif; font-size: 1.5rem; color: #f8fafc;">Sign In to CricOS</h2>';
        h += '<p style="margin: 0.35rem 0 0; color: #94a3b8; font-size: 0.85rem;">Tournament & Match Hub (8 User Personas)</p>';
        h += '</div>';

        if (this.authStep === 'IDENTIFIER') {
          h += '<div style="margin-bottom: 1rem;">';
          h += '<label style="display: block; font-size: 0.8rem; font-weight: 600; color: #cbd5e1; margin-bottom: 0.4rem;">Mobile Phone or Email</label>';
          h += '<input type="text" id="authIdentifierInput" value="' + this.identifier + '" style="width: 100%; box-sizing: border-box; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 0.75rem; color: #f8fafc; font-size: 0.95rem;" />';
          h += '</div>';

          h += '<div style="margin-bottom: 1.25rem;">';
          h += '<label style="display: block; font-size: 0.8rem; font-weight: 600; color: #cbd5e1; margin-bottom: 0.4rem;">Choose Persona Journey</label>';
          h += '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.4rem;">';
          var roles = [
            ['CAPTAIN', '🏏 Captain'],
            ['PLAYER', '👤 Player'],
            ['SCORER', '⚡ Scorer'],
            ['FAN', '🎪 Fan Pulse'],
            ['UMPIRE', '⚖️ Umpire'],
            ['ORGANISER', '🏆 Director'],
            ['TURF_PROVIDER', '🏟️ Turf Host'],
            ['ADMIN', '🛡️ Admin Desk']
          ];
          for (var i = 0; i < roles.length; i++) {
            var r = roles[i];
            var active = this.role === r[0] ? 'background: rgba(0, 229, 153, 0.2); border-color: #00E599; color: #00E599;' : 'background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.1); color: #f8fafc;';
            h += '<button type="button" onclick="window.cricosMobileApp.setAuthRole(this.dataset.role)" data-role="' + r[0] + '" style="padding: 0.5rem; font-size: 0.75rem; border-radius: 6px; border: 1px solid; cursor: pointer; ' + active + '" data-tooltip="Sign in as ' + r[1] + '">' + r[1] + '</button>';
          }
          h += '</div></div>';

          h += '<button type="button" onclick="window.cricosMobileApp.requestOtpAction()" style="width: 100%; padding: 0.85rem; border-radius: 8px; border: none; background: linear-gradient(135deg, #00E599, #00D2FF); color: #04070D; font-weight: 700; font-size: 1rem; cursor: pointer;" data-tooltip="Dispatch 6-digit OTP verification code via Fastify backend">' + (this.isLoading ? 'Sending...' : 'Send Secure OTP →') + '</button>';
        } else {
          h += '<div style="background: rgba(0, 229, 153, 0.1); border: 1px solid rgba(0, 229, 153, 0.3); border-radius: 8px; padding: 0.75rem; margin-bottom: 1rem; text-align: center;">';
          h += '<div style="font-size: 0.8rem; color: #94a3b8;">Code sent to: <strong style="color: #f8fafc;">' + this.identifier + '</strong></div>';
          h += '<div style="font-size: 0.75rem; color: #00E599; margin-top: 0.25rem;">Staging Code: <strong>123456</strong></div>';
          h += '</div>';

          h += '<div style="margin-bottom: 1.25rem;">';
          h += '<label style="display: block; font-size: 0.8rem; font-weight: 600; color: #cbd5e1; margin-bottom: 0.4rem;">Enter 6-Digit OTP</label>';
          h += '<input type="text" id="authCodeInput" value="' + this.code + '" maxlength="6" style="width: 100%; box-sizing: border-box; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 0.75rem; color: #00E599; font-size: 1.5rem; text-align: center; letter-spacing: 0.4rem; font-family: Chakra Petch, monospace;" />';
          h += '</div>';

          h += '<div style="display: flex; gap: 0.5rem;">';
          h += '<button type="button" onclick="window.cricosMobileApp.backToIdentifier()" style="flex: 1; padding: 0.85rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); background: transparent; color: #f8fafc; font-weight: 600; font-size: 0.85rem; cursor: pointer;" data-tooltip="Back to identifier input">← Back</button>';
          h += '<button type="button" onclick="window.cricosMobileApp.verifyOtpAction()" style="flex: 2; padding: 0.85rem; border-radius: 8px; border: none; background: linear-gradient(135deg, #00E599, #00D2FF); color: #04070D; font-weight: 700; font-size: 0.95rem; cursor: pointer;" data-tooltip="Verify OTP code and create JWT mobile session">Verify & Enter ✓</button>';
          h += '</div>';
        }
        h += '</div>';
        return h;
      }

      renderMatches() {
        var overs = Math.floor(this.matchState.legalBalls / 6);
        var balls = this.matchState.legalBalls % 6;
        var crr = this.matchState.legalBalls > 0 ? ((this.matchState.totalRuns / this.matchState.legalBalls) * 6).toFixed(2) : '0.00';
        var remainingRuns = Math.max(0, this.matchState.targetRuns - this.matchState.totalRuns);
        var remainingBalls = Math.max(0, 120 - this.matchState.legalBalls);
        var rrr = remainingBalls > 0 ? ((remainingRuns / remainingBalls) * 6).toFixed(2) : '0.00';
        var persona = this.profile.persona;

        var h = '<div class="mobile-subnav">';
        var subTabs = [
          ['SCORE', '⚡ Live Score'],
          ['TELEMETRY', '📡 Pitch & DRS'],
          ['COMMENTARY', '🎙️ Commentary'],
          ['ANALYTICS', '📊 Analytics & Card']
        ];
        for (var st = 0; st < subTabs.length; st++) {
          var isAct = this.matchSubTab === subTabs[st][0];
          h += '<button type="button" class="mobile-subnav-btn ' + (isAct ? 'active' : '') + '" onclick="window.cricosMobileApp.setMatchSubTab(this.dataset.subtab)" data-subtab="' + subTabs[st][0] + '" data-tooltip="View ' + subTabs[st][1] + '">';
          h += subTabs[st][1];
          h += '</button>';
        }
        h += '</div>';

        h += '<div style="padding: 1rem;">';

        // Match Top Badges
        h += '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.4rem;">';
        h += '<div style="display: flex; align-items: center; gap: 0.4rem;">';
        h += '<span style="background: rgba(255, 51, 102, 0.15); border: 1px solid #ff3366; color: #ff3366; font-size: 0.72rem; font-weight: 700; padding: 0.15rem 0.55rem; border-radius: 9999px;">🔴 LIVE MATCH</span>';
        h += '<span style="font-size: 0.7rem; color: #94a3b8;">Wankhede Stadium</span>';
        h += '</div>';
        h += '<div style="display: flex; gap: 0.3rem;">';
        h += '<button type="button" onclick="window.cricosMobileApp.openDrsReviewSheet()" style="background: rgba(0, 210, 255, 0.12); border: 1px solid rgba(0, 210, 255, 0.35); color: #00D2FF; font-size: 0.68rem; padding: 0.2rem 0.5rem; border-radius: 6px;" data-tooltip="Launch Hawk-Eye DRS Review">📡 Hawk-Eye</button>';
        h += '</div></div>';

        // LED Scoreboard HUD
        h += '<div style="background: rgba(10, 16, 28, 0.92); border: 1px solid rgba(0, 229, 153, 0.3); border-radius: 14px; padding: 1rem 1.15rem; text-align: center; margin-bottom: 0.85rem; box-shadow: 0 4px 20px rgba(0,0,0,0.6); position: relative; overflow: hidden;">';
        h += '<div style="font-size: 0.8rem; color: #cbd5e1; font-weight: 600;">' + this.matchState.battingTeam + ' vs ' + this.matchState.bowlingTeam + '</div>';
        h += '<div style="font-size: 2.75rem; font-weight: 800; color: #00E599; font-family: Chakra Petch, monospace; line-height: 1.1; margin: 0.25rem 0;">' + this.matchState.totalRuns + '/' + this.matchState.totalWickets + '</div>';
        h += '<div style="font-size: 0.8rem; color: #94a3b8;">Overs: <strong style="color: #00D2FF; font-family: Chakra Petch, monospace;">' + overs + '.' + balls + '</strong> • CRR: <strong style="color: #f8fafc; font-family: Chakra Petch, monospace;">' + crr + '</strong> • RRR: <strong style="color: #FFB800; font-family: Chakra Petch, monospace;">' + rrr + '</strong></div>';
        h += '<div style="font-size: 0.72rem; color: #00E599; font-weight: 700; margin-top: 0.4rem; padding-top: 0.35rem; border-top: 1px solid rgba(255,255,255,0.06);">';
        h += 'Target Equation: Need ' + remainingRuns + ' runs in ' + remainingBalls + ' balls';
        h += '</div>';
        h += '</div>';

        // SUB-VIEW 1: SCORE & TACTICAL SCORER STUDIO
        if (this.matchSubTab === 'SCORE') {
          // 1. Free Hit In-Play Banner (if active)
          if (this.freeHitActive) {
            h += '<div style="background: rgba(255, 184, 0, 0.15); border: 1px solid #ffb800; border-radius: 10px; padding: 0.55rem 0.75rem; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.4rem; color: #ffb800; font-size: 0.75rem; font-weight: 700; animation: scorePulseAnim 1.5s infinite;"><span style="font-size: 1rem;">⚡</span> FREE HIT IN PLAY — Next delivery: Batter cannot be dismissed except Run Out!</div>';
          }

          // 2. Active Batters on Field (Striker + Non-Striker)
          h += '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 0.65rem;">';
          
          // Striker Card
          h += '<div style="background: rgba(0, 229, 153, 0.08); border: 1px solid rgba(0, 229, 153, 0.35); border-radius: 12px; padding: 0.75rem; position: relative;" data-tooltip="Striker facing delivery">';
          h += '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">';
          h += '<div style="display: flex; align-items: center; gap: 0.3rem;">';
          h += '<span style="font-size: 0.7rem; color: #00E599; font-weight: 800;">STRIKER ⚡</span>';
          h += '<span style="font-size: 0.6rem; padding: 0.1rem 0.35rem; border-radius: 4px; background: rgba(0, 229, 153, 0.2); color: #00E599; font-weight: 800;">' + this.currentStance + '</span>';
          h += '</div>';
          h += '<button type="button" onclick="window.cricosMobileApp.rotateStrike()" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); color: #f8fafc; font-size: 0.62rem; padding: 0.15rem 0.45rem; border-radius: 4px;" data-tooltip="Swap strike manually">⇄ Swap</button>';
          h += '</div>';
          h += '<div style="font-size: 1rem; font-weight: 800; color: #f8fafc;">' + this.matchState.striker.name + '</div>';
          h += '<div style="font-family: Chakra Petch, monospace; font-size: 1.25rem; font-weight: 800; color: #00E599; margin-top: 0.15rem;">';
          h += this.matchState.striker.runs + '* <span style="font-size: 0.75rem; color: #94a3b8; font-weight: 600;">(' + this.matchState.striker.balls + 'b, ' + (this.matchState.striker.fours || 0) + 'x4, ' + (this.matchState.striker.sixes || 0) + 'x6)</span>';
          h += '</div>';
          var strikerSr = this.matchState.striker.balls > 0 ? ((this.matchState.striker.runs / this.matchState.striker.balls) * 100).toFixed(1) : '0.0';
          h += '<div style="font-size: 0.65rem; color: #94a3b8; margin-top: 0.2rem;">SR: <strong style="color: #f8fafc;">' + strikerSr + '</strong></div>';
          h += '</div>';

          // Non-Striker Card
          h += '<div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 0.75rem;" data-tooltip="Non-striker crease">';
          h += '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">';
          h += '<div style="display: flex; align-items: center; gap: 0.3rem;">';
          h += '<span style="font-size: 0.7rem; color: #94a3b8; font-weight: 700;">NON-STRIKER</span>';
          h += '<span style="font-size: 0.6rem; padding: 0.1rem 0.35rem; border-radius: 4px; background: rgba(0, 210, 255, 0.15); color: #00D2FF; font-weight: 800;">' + (this.currentStance === 'RHB' ? 'LHB' : 'RHB') + '</span>';
          h += '</div>';
          h += '</div>';
          h += '<div style="font-size: 1rem; font-weight: 800; color: #f8fafc;">' + this.matchState.nonStriker.name + '</div>';
          h += '<div style="font-family: Chakra Petch, monospace; font-size: 1.25rem; font-weight: 800; color: #00D2FF; margin-top: 0.15rem;">';
          h += this.matchState.nonStriker.runs + ' <span style="font-size: 0.75rem; color: #94a3b8; font-weight: 600;">(' + this.matchState.nonStriker.balls + 'b, ' + (this.matchState.nonStriker.fours || 0) + 'x4, ' + (this.matchState.nonStriker.sixes || 0) + 'x6)</span>';
          h += '</div>';
          var nonStrikerSr = this.matchState.nonStriker.balls > 0 ? ((this.matchState.nonStriker.runs / this.matchState.nonStriker.balls) * 100).toFixed(1) : '0.0';
          h += '<div style="font-size: 0.65rem; color: #94a3b8; margin-top: 0.2rem;">SR: <strong style="color: #f8fafc;">' + nonStrikerSr + '</strong></div>';
          h += '</div>';
          h += '</div>';

          // 3. Partnership & Bowler Figures Card
          h += '<div style="background: rgba(10, 16, 28, 0.95); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 0.75rem; margin-bottom: 0.65rem;">';
          h += '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">';
          h += '<span style="font-size: 0.7rem; color: #94a3b8; font-weight: 700;">🤝 CURRENT PARTNERSHIP</span>';
          h += '<span style="font-family: Chakra Petch, monospace; font-size: 0.8rem; font-weight: 700; color: #00E599;">' + this.partnership.runs + ' runs (' + this.partnership.balls + 'b)</span>';
          h += '</div>';
          h += '<div style="height: 4px; background: rgba(255,255,255,0.08); border-radius: 2px; overflow: hidden; margin-bottom: 0.55rem;">';
          h += '<div style="width: ' + Math.min(100, (this.partnership.runs / 75) * 100) + '%; height: 100%; background: linear-gradient(90deg, #00E599, #00D2FF); border-radius: 2px;"></div>';
          h += '</div>';
          var bowlerOversExact = this.matchState.bowler.overs + (this.matchState.bowler.ballsThisOver / 6);
          var bowlerEcon = bowlerOversExact > 0 ? (this.matchState.bowler.runsConceded / bowlerOversExact).toFixed(2) : '0.00';
          h += '<div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 0.45rem;">';
          h += '<span style="font-weight: 600;">🎳 ' + this.matchState.bowler.name + '</span>';
          h += '<span style="font-family: Chakra Petch, monospace; font-weight: 700; color: #00D2FF;">' + this.matchState.bowler.overs + '.' + this.matchState.bowler.ballsThisOver + '-' + this.matchState.bowler.maidens + '-' + this.matchState.bowler.runsConceded + '-' + this.matchState.bowler.wickets + ' <small style="color: #94a3b8; font-size: 0.68rem;">(Econ: ' + bowlerEcon + ')</small></span>';
          h += '</div>';
          h += '</div>';

          // 4. Over Deliveries Strip
          h += '<div style="margin-bottom: 0.75rem;">';
          h += '<div style="font-size: 0.7rem; color: #94a3b8; margin-bottom: 0.3rem; font-weight: 600;">This Over Deliveries:</div>';
          h += '<div style="display: flex; gap: 0.4rem; overflow-x: auto; padding-bottom: 0.25rem;">';
          for (var i = 0; i < this.matchState.currentOverDeliveries.length; i++) {
            var d = this.matchState.currentOverDeliveries[i];
            var bg = 'rgba(255,255,255,0.06)';
            var color = '#f8fafc';
            if (d === '4' || d === '4nb') { bg = 'rgba(0, 210, 255, 0.25)'; color = '#00D2FF'; }
            if (d === '6' || d === '6nb') { bg = 'rgba(0, 229, 153, 0.25)'; color = '#00E599'; }
            if (d === 'W') { bg = 'rgba(255, 51, 102, 0.25)'; color = '#ff3366'; }
            if (d.indexOf('wd') !== -1 || d.indexOf('nb') !== -1) { bg = 'rgba(255, 184, 0, 0.2)'; color = '#ffb800'; }
            h += '<span style="display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 50%; background:' + bg + '; color:' + color + '; font-weight: 800; font-size: 0.85rem; font-family: Chakra Petch, monospace; border: 1px solid rgba(255,255,255,0.1);">' + d + '</span>';
          }
          if (this.matchState.currentOverDeliveries.length === 0) {
            h += '<span style="font-size: 0.7rem; color: #64748b; font-style: italic;">Awaiting first delivery of the over...</span>';
          }
          h += '</div></div>';

          // 5. Tactical Scorer Studio Pad & Keypad
          h += '<div style="background: rgba(10, 16, 28, 0.95); border: 1px solid rgba(0, 229, 153, 0.25); border-radius: 14px; padding: 0.85rem; margin-bottom: 0.85rem; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">';
          h += '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem;">';
          h += '<div style="display: flex; align-items: center; gap: 0.35rem;">';
          h += '<span style="font-size: 0.85rem;">🎯</span>';
          h += '<span style="font-size: 0.8rem; font-weight: 800; color: #f8fafc; font-family: Space Grotesk, sans-serif;">Scorer Studio & Tactical Pad</span>';
          h += '</div>';
          h += '<span style="font-size: 0.62rem; color: #00E599; border: 1px solid rgba(0, 229, 153, 0.35); padding: 0.15rem 0.45rem; border-radius: 9999px; font-weight: 800;">TACTICAL SCORER</span>';
          h += '</div>';

          // 4-Column Keypad Grid
          h += '<div class="mobile-studio-pad-grid">';
          h += '<button type="button" class="mobile-studio-btn pad-btn" data-runs="0" onclick="window.cricosMobileApp.onPadNumberSelect(0)" data-tooltip="Dot ball (0 runs, choose direction)">0<span class="mobile-studio-sublabel">Dot</span></button>';
          h += '<button type="button" class="mobile-studio-btn pad-btn" data-runs="1" onclick="window.cricosMobileApp.onPadNumberSelect(1)" data-tooltip="Single (+1 run, choose direction)">1<span class="mobile-studio-sublabel">Single</span></button>';
          h += '<button type="button" class="mobile-studio-btn pad-btn" data-runs="2" onclick="window.cricosMobileApp.onPadNumberSelect(2)" data-tooltip="Two runs (+2 runs, choose direction)">2<span class="mobile-studio-sublabel">Double</span></button>';
          h += '<button type="button" class="mobile-studio-btn pad-btn" data-runs="3" onclick="window.cricosMobileApp.onPadNumberSelect(3)" data-tooltip="Three runs (+3 runs, choose direction)">3<span class="mobile-studio-sublabel">Triple</span></button>';
          h += '<button type="button" class="mobile-studio-btn pad-btn boundary-four" data-runs="4" onclick="window.cricosMobileApp.onPadNumberSelect(4)" data-tooltip="Boundary Four (+4 runs, choose direction)">4<span class="mobile-studio-sublabel" style="color: #00D2FF;">Four</span></button>';
          h += '<button type="button" class="mobile-studio-btn pad-btn maximum-six" data-runs="6" onclick="window.cricosMobileApp.onPadNumberSelect(6)" data-tooltip="Maximum Six (+6 runs, choose direction)">6<span class="mobile-studio-sublabel" style="color: #00E599;">Six</span></button>';
          h += '<button type="button" class="mobile-studio-btn pad-btn wicket-out" onclick="window.cricosMobileApp.promptWicketModal()" data-tooltip="Wicket Dismissal Dialog">W<span class="mobile-studio-sublabel" style="color: #ff3366;">Wicket</span></button>';
          h += '<button type="button" class="mobile-studio-btn pad-btn undo-btn" onclick="window.cricosMobileApp.undoLastDelivery()" data-tooltip="Undo last delivery">↺<span class="mobile-studio-sublabel" style="color: #ffb800;">Undo</span></button>';
          h += '</div>';

          // Quick Extras Strip
          h += '<div style="display: flex; gap: 0.35rem; margin-bottom: 0.6rem;">';
          h += '<button type="button" class="btn btn-secondary" style="flex: 1; padding: 0.4rem 0.2rem; font-size: 0.72rem; text-align: center;" data-extra="WIDE" data-runs="1" onclick="window.cricosMobileApp.openExtraPickerSheet(this.dataset.extra)" data-tooltip="Wide (+1 run, ball re-bowled)">+1 Wd</button>';
          h += '<button type="button" class="btn btn-secondary" style="flex: 1.2; padding: 0.4rem 0.2rem; font-size: 0.72rem; text-align: center;" data-extra="NO_BALL" data-runs="1" onclick="window.cricosMobileApp.openExtraPickerSheet(this.dataset.extra)" data-tooltip="No Ball (+1 run, Free Hit next delivery)">+1 Nb (Free Hit)</button>';
          h += '<button type="button" class="btn btn-secondary" style="flex: 1; padding: 0.4rem 0.2rem; font-size: 0.72rem; text-align: center;" data-extra="LEG_BYE" data-runs="1" onclick="window.cricosMobileApp.openExtraPickerSheet(this.dataset.extra)" data-tooltip="Leg Bye (+1 run)">+1 Lb</button>';
          h += '<button type="button" class="btn btn-secondary" style="flex: 1; padding: 0.4rem 0.2rem; font-size: 0.72rem; text-align: center;" data-extra="BYE" data-runs="1" onclick="window.cricosMobileApp.openExtraPickerSheet(this.dataset.extra)" data-tooltip="Bye (+1 run)">+1 Bye</button>';
          h += '</div>';

          // Compound Extras & 2-Second Hold-to-Reset Strip
          h += '<div style="display: flex; gap: 0.3rem; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 0.6rem; flex-wrap: wrap;">';
          h += '<button type="button" class="btn btn-secondary" style="flex: 1; min-width: 60px; padding: 0.3rem 0.2rem; font-size: 0.65rem;" data-bat="0" data-extra-runs="5" data-extra-type="WIDE" onclick="window.cricosMobileApp.scoreCompoundExtra(Number(this.dataset.bat), Number(this.dataset.extraRuns), this.dataset.extraType)" data-tooltip="Wide + 4 Byes (+5 runs)">+5 Wd (4b)</button>';
          h += '<button type="button" class="btn btn-secondary" style="flex: 1; min-width: 60px; padding: 0.3rem 0.2rem; font-size: 0.65rem;" data-bat="4" data-extra-runs="1" data-extra-type="NO_BALL" onclick="window.cricosMobileApp.scoreCompoundExtra(Number(this.dataset.bat), Number(this.dataset.extraRuns), this.dataset.extraType)" data-tooltip="No Ball + Four (+5 runs, Free Hit)">+4 Nb (5r)</button>';
          h += '<button type="button" class="btn btn-secondary" style="flex: 1; min-width: 60px; padding: 0.3rem 0.2rem; font-size: 0.65rem;" data-bat="6" data-extra-runs="1" data-extra-type="NO_BALL" onclick="window.cricosMobileApp.scoreCompoundExtra(Number(this.dataset.bat), Number(this.dataset.extraRuns), this.dataset.extraType)" data-tooltip="No Ball + Six (+7 runs, Free Hit)">+6 Nb (7r)</button>';
          h += '<button type="button" class="btn btn-secondary" style="flex: 1; min-width: 60px; padding: 0.3rem 0.2rem; font-size: 0.65rem;" data-bat="0" data-extra-runs="5" data-extra-type="PENALTY" onclick="window.cricosMobileApp.scoreCompoundExtra(Number(this.dataset.bat), Number(this.dataset.extraRuns), this.dataset.extraType)" data-tooltip="Penalty Award (+5 runs)">+5 Penalty</button>';
          h += '<button type="button" class="btn btn-secondary btn-hold-confirm" id="btnMobileStudioReset" onclick="window.cricosMobileApp.handleResetButtonClick()" style="flex: 1.2; min-width: 80px; padding: 0.3rem 0.4rem; font-size: 0.68rem; border-color: rgba(255,51,102,0.3); color: #ff3366;" data-tooltip="Hold 2s to reset match score for new innings"><span class="hold-progress-overlay"></span><span style="position: relative; z-index: 1;">↺ Hold to Reset</span></button>';
          h += '</div>';
          h += '</div>';

          // 6. Full Interactive Precision 8-Zone Wagon Wheel
          var self = this;
          var activeZoneDef = this.SHOT_ZONES_DATA.find(function(z) { return z.id === self.currentSelectedZone; });
          var activeZoneLabel = activeZoneDef ? activeZoneDef.label : 'Cover / Extra Cover';
          var activeZoneSide = activeZoneDef ? activeZoneDef.side : 'OFF';

          h += '<div style="background: rgba(10, 16, 28, 0.95); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 0.85rem; margin-bottom: 0.85rem;">';
          
          // Header: Title, Stance Switcher, Selected Zone Badge
          h += '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem; flex-wrap: wrap; gap: 0.4rem;">';
          h += '<div style="display: flex; align-items: center; gap: 0.4rem;">';
          h += '<span style="font-size: 0.8rem; font-weight: 800; color: #f8fafc; font-family: Space Grotesk, sans-serif;">8-Zone Precision Wagon Wheel</span>';
          h += '<div style="display: inline-flex; background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 6px; padding: 2px;">';
          h += '<button type="button" data-stance="RHB" onclick="window.cricosMobileApp.setBatterStance(this.dataset.stance)" style="font-size: 0.62rem; font-weight: 700; padding: 0.15rem 0.45rem; border-radius: 4px; border: none; background: ' + (this.currentStance === 'RHB' ? '#00E599' : 'transparent') + '; color: ' + (this.currentStance === 'RHB' ? '#04070D' : '#94a3b8') + '; cursor: pointer;" data-tooltip="Right-handed batter stance">RHB</button>';
          h += '<button type="button" data-stance="LHB" onclick="window.cricosMobileApp.setBatterStance(this.dataset.stance)" style="font-size: 0.62rem; font-weight: 700; padding: 0.15rem 0.45rem; border-radius: 4px; border: none; background: ' + (this.currentStance === 'LHB' ? '#00E599' : 'transparent') + '; color: ' + (this.currentStance === 'LHB' ? '#04070D' : '#94a3b8') + '; cursor: pointer;" data-tooltip="Left-handed batter stance">LHB</button>';
          h += '</div></div>';
          h += '<span style="font-family: Chakra Petch, monospace; font-size: 0.68rem; color: #00E599; font-weight: 700; padding: 0.15rem 0.5rem; border-radius: 6px; background: rgba(0, 229, 153, 0.1); border: 1px solid rgba(0, 229, 153, 0.25);" id="mobileWagonSelectedZone">ZONE: ' + activeZoneLabel.toUpperCase() + ' (' + activeZoneSide + '-SIDE)</span>';
          h += '</div>';

          // Batter Filter Row
          h += '<div style="display: flex; gap: 0.35rem; margin-bottom: 0.5rem; overflow-x: auto; padding-bottom: 0.2rem;">';
          h += '<button type="button" class="wagon-pill-btn ' + (this.currentBatterFilter === 'Virat K.' ? 'active' : '') + '" data-batter="Virat K." onclick="window.cricosMobileApp.filterWagonBatter(this.dataset.batter)" data-tooltip="Filter shots for Virat K.">Virat K. (' + this.matchState.striker.runs + '*)</button>';
          h += '<button type="button" class="wagon-pill-btn ' + (this.currentBatterFilter === 'Rohit S.' ? 'active' : '') + '" data-batter="Rohit S." onclick="window.cricosMobileApp.filterWagonBatter(this.dataset.batter)" data-tooltip="Filter shots for Rohit S.">Rohit S. (' + this.matchState.nonStriker.runs + ')</button>';
          h += '<button type="button" class="wagon-pill-btn ' + (this.currentBatterFilter === 'ALL' ? 'active' : '') + '" data-batter="ALL" onclick="window.cricosMobileApp.filterWagonBatter(this.dataset.batter)" data-tooltip="Filter shots for Partnership">🤝 Partnership (' + this.partnership.runs + ')</button>';
          h += '</div>';

          // Shot Filter Row
          h += '<div style="display: flex; gap: 0.3rem; margin-bottom: 0.75rem; overflow-x: auto; padding-bottom: 0.2rem;">';
          h += '<button type="button" class="wagon-pill-btn ' + (this.currentShotFilter === 'ALL' ? 'active' : '') + '" data-filter="ALL" onclick="window.cricosMobileApp.filterWagonShots(this.dataset.filter)" data-tooltip="Show all shots">All Shots</button>';
          h += '<button type="button" class="wagon-pill-btn ' + (this.currentShotFilter === 'BOUNDARIES' ? 'active' : '') + '" data-filter="BOUNDARIES" onclick="window.cricosMobileApp.filterWagonShots(this.dataset.filter)" data-tooltip="Show boundaries only">4s & 6s</button>';
          h += '<button type="button" class="wagon-pill-btn ' + (this.currentShotFilter === 'SINGLES' ? 'active' : '') + '" data-filter="SINGLES" onclick="window.cricosMobileApp.filterWagonShots(this.dataset.filter)" data-tooltip="Show singles only">Singles</button>';
          h += '<button type="button" class="wagon-pill-btn ' + (this.currentShotFilter === 'DOTS' ? 'active' : '') + '" data-filter="DOTS" onclick="window.cricosMobileApp.filterWagonShots(this.dataset.filter)" data-tooltip="Show dot balls only">Dots</button>';
          h += '</div>';

          // 8 Sector Wedges definition
          var wedges = [
            { id: 'THIRD_MAN', d: 'M180,180 L65.5,65.5 A162,162 0 0,1 180,18 Z', name: 'Third Man' },
            { id: 'FINE_LEG', d: 'M180,180 L180,18 A162,162 0 0,1 294.5,65.5 Z', name: 'Fine Leg' },
            { id: 'POINT', d: 'M180,180 L18,180 A162,162 0 0,1 65.5,65.5 Z', name: 'Point' },
            { id: 'SQUARE_LEG', d: 'M180,180 L294.5,65.5 A162,162 0 0,1 342,180 Z', name: 'Deep Square Leg' },
            { id: 'EXTRA_COVER', d: 'M180,180 L65.5,294.5 A162,162 0 0,1 18,180 Z', name: 'Extra Cover' },
            { id: 'MID_WICKET', d: 'M180,180 L342,180 A162,162 0 0,1 294.5,294.5 Z', name: 'Deep Mid Wicket' },
            { id: 'LONG_OFF', d: 'M180,180 L180,342 A162,162 0 0,1 65.5,294.5 Z', name: 'Long Off' },
            { id: 'LONG_ON', d: 'M180,180 L294.5,294.5 A162,162 0 0,1 180,342 Z', name: 'Long On' }
          ];

          var wedgesSvg = '';
          for (var w = 0; w < wedges.length; w++) {
            var isSel = this.currentSelectedZone === wedges[w].id;
            wedgesSvg += '<path class="wagon-sector-wedge ' + (isSel ? 'active' : '') + '" d="' + wedges[w].d + '" data-zone="' + wedges[w].id + '" onclick="window.cricosMobileApp.selectWagonZone(this.dataset.zone)" data-tooltip="Select ' + wedges[w].name + ' Zone"/>';
          }

          // SVG Stadium Outfield
          h += '<div style="display: flex; justify-content: center; align-items: center; margin-bottom: 0.6rem;">';
          h += '<svg viewBox="0 0 360 360" style="width: 100%; max-width: 330px; height: auto;" xmlns="http://www.w3.org/2000/svg">';
          h += '<defs>';
          h += '<radialGradient id="mobileTurfGrad" cx="50%" cy="50%" r="50%">';
          h += '<stop offset="0%" stop-color="#0E3324"/>';
          h += '<stop offset="60%" stop-color="#092418"/>';
          h += '<stop offset="90%" stop-color="#05170F"/>';
          h += '<stop offset="100%" stop-color="#030C08"/>';
          h += '</radialGradient>';
          h += '<linearGradient id="mobilePitchGrad" x1="0%" y1="0%" x2="100%" y2="0%">';
          h += '<stop offset="0%" stop-color="#8C6E3D"/>';
          h += '<stop offset="50%" stop-color="#A38350"/>';
          h += '<stop offset="100%" stop-color="#8C6E3D"/>';
          h += '</linearGradient>';
          h += '<filter id="mobileBoundaryGlow" x="-20%" y="-20%" width="140%" height="140%">';
          h += '<feGaussianBlur stdDeviation="3" result="blur"/>';
          h += '<feComposite in="SourceGraphic" in2="blur" operator="over"/>';
          h += '</filter>';
          h += '</defs>';

          // Ground Circle & Mower Rings
          h += '<circle cx="180" cy="180" r="168" fill="url(#mobileTurfGrad)" stroke="rgba(0, 229, 153, 0.4)" stroke-width="2" filter="url(#mobileBoundaryGlow)"/>';
          h += '<circle cx="180" cy="180" r="140" fill="none" stroke="rgba(255, 255, 255, 0.025)" stroke-width="14"/>';
          h += '<circle cx="180" cy="180" r="110" fill="none" stroke="rgba(255, 255, 255, 0.025)" stroke-width="14"/>';
          h += '<circle cx="180" cy="180" r="80" fill="none" stroke="rgba(255, 255, 255, 0.025)" stroke-width="14"/>';
          h += '<circle cx="180" cy="180" r="50" fill="none" stroke="rgba(255, 255, 255, 0.025)" stroke-width="14"/>';

          // 30-Yard Circle
          h += '<circle cx="180" cy="180" r="88" fill="none" stroke="rgba(0, 210, 255, 0.35)" stroke-width="1.2" stroke-dasharray="4,4"/>';
          h += '<text x="180" y="98" fill="rgba(0, 210, 255, 0.6)" font-size="6.5" font-family="Chakra Petch, monospace" text-anchor="middle" letter-spacing="1">30 YD CIRCLE</text>';

          // 75m Boundary Rope
          h += '<circle cx="180" cy="180" r="162" fill="none" stroke="rgba(255, 255, 255, 0.25)" stroke-width="1.5"/>';
          h += '<text x="180" y="26" fill="rgba(255, 255, 255, 0.45)" font-size="7" font-family="Chakra Petch, monospace" text-anchor="middle">75m BOUNDARY ROPE</text>';

          // Radial sector lines
          h += '<line x1="180" y1="18" x2="180" y2="342" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1"/>';
          h += '<line x1="18" y1="180" x2="342" y2="180" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1"/>';
          h += '<line x1="65" y1="65" x2="295" y2="295" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1"/>';
          h += '<line x1="295" y1="65" x2="65" y2="295" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1"/>';

          // Sector Wedges
          h += wedgesSvg;

          // Pitch Strip in Center
          h += '<rect x="168" y="140" width="24" height="80" rx="3" fill="url(#mobilePitchGrad)" stroke="rgba(255, 255, 255, 0.2)" stroke-width="1"/>';
          h += '<line x1="164" y1="150" x2="196" y2="150" stroke="#FFFFFF" stroke-width="1.2"/>';
          h += '<line x1="168" y1="156" x2="192" y2="156" stroke="rgba(255, 255, 255, 0.7)" stroke-width="0.8"/>';
          h += '<circle cx="177" cy="148" r="1" fill="#FFFFFF"/>';
          h += '<circle cx="180" cy="148" r="1" fill="#FFFFFF"/>';
          h += '<circle cx="183" cy="148" r="1" fill="#FFFFFF"/>';

          h += '<line x1="164" y1="210" x2="196" y2="210" stroke="#FFFFFF" stroke-width="1.2"/>';
          h += '<line x1="168" y1="204" x2="192" y2="204" stroke="rgba(255, 255, 255, 0.7)" stroke-width="0.8"/>';
          h += '<circle cx="177" cy="212" r="1" fill="#FFFFFF"/>';
          h += '<circle cx="180" cy="212" r="1" fill="#FFFFFF"/>';
          h += '<circle cx="183" cy="212" r="1" fill="#FFFFFF"/>';

          // Striker Crease Indicator
          h += '<circle cx="180" cy="156" r="4.5" fill="#00E599" stroke="#FFFFFF" stroke-width="1.5"/>';
          h += '<g transform="translate(180, 134)">';
          h += '<rect x="-56" y="-8" width="112" height="16" rx="8" fill="rgba(4, 7, 13, 0.92)" stroke="rgba(0, 229, 153, 0.5)" stroke-width="1.2"/>';
          h += '<text x="-46" y="2.5" fill="#00E599" font-size="6" font-family="Chakra Petch, monospace" font-weight="800">VK</text>';
          h += '<text x="-34" y="2.5" fill="#FFFFFF" font-size="6" font-family="Space Grotesk, sans-serif" font-weight="700">Virat K.</text>';
          h += '<text x="50" y="2.5" fill="#00E599" font-size="6" font-family="Chakra Petch, monospace" font-weight="700" text-anchor="end">' + this.matchState.striker.runs + '*</text>';
          h += '</g>';

          // Non-Striker Crease Indicator
          h += '<g transform="translate(180, 226)">';
          h += '<circle cx="0" cy="-22" r="3" fill="#64748B" stroke="#FFFFFF" stroke-width="1"/>';
          h += '<rect x="-44" y="-7" width="88" height="14" rx="7" fill="rgba(4, 7, 13, 0.85)" stroke="rgba(255, 255, 255, 0.18)" stroke-width="0.8"/>';
          h += '<text x="0" y="2.5" fill="#94A3B8" font-size="5.5" font-family="Space Grotesk, sans-serif" font-weight="600" text-anchor="middle">Rohit S. ' + this.matchState.nonStriker.runs + '</text>';
          h += '</g>';

          // Off-Side / On-Side Direction Labels
          var offLabel = this.currentStance === 'RHB' ? '◀ OFF' : '◀ ON';
          var legLabel = this.currentStance === 'RHB' ? 'ON ▶' : 'OFF ▶';
          var offColor = this.currentStance === 'RHB' ? '#00D2FF' : '#00E599';
          var legColor = this.currentStance === 'RHB' ? '#00E599' : '#00D2FF';
          h += '<text x="35" y="174" fill="' + offColor + '" font-size="8" font-family="Chakra Petch, monospace" font-weight="700" letter-spacing="0.5">' + offLabel + '</text>';
          h += '<text x="325" y="174" fill="' + legColor + '" font-size="8" font-family="Chakra Petch, monospace" font-weight="700" text-anchor="end" letter-spacing="0.5">' + legLabel + '</text>';

          // Dynamic Shot Rays
          h += '<g id="mobileWagonRays">';
          h += this.renderMobileWagonRays();
          h += '</g>';
          h += '</svg></div>';

          // Shot Distribution Ratio Bar (Off-Side vs On-Side)
          var offRuns = 0;
          var legRuns = 0;
          for (var sh = 0; sh < this.shotHistory.length; sh++) {
            var sItem = this.shotHistory[sh];
            var zMatch = this.SHOT_ZONES_DATA.find(function(z) { return z.id === sItem.zone; });
            if (zMatch) {
              if (zMatch.side === 'OFF') offRuns += sItem.runs;
              else legRuns += sItem.runs;
            }
          }
          var totalShotRuns = Math.max(1, offRuns + legRuns);
          var offPct = Math.round((offRuns / totalShotRuns) * 100);
          var legPct = 100 - offPct;

          h += '<div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 0.45rem 0.65rem; margin-bottom: 0.75rem;">';
          h += '<div style="display: flex; justify-content: space-between; font-size: 0.68rem; margin-bottom: 0.25rem;">';
          h += '<span style="color: #00D2FF; font-weight: 700;">Off-Side: ' + offRuns + 'r (' + offPct + '%)</span>';
          h += '<span style="color: #00E599; font-weight: 700;">On-Side: ' + legRuns + 'r (' + legPct + '%)</span>';
          h += '</div>';
          h += '<div style="height: 4px; background: rgba(255,255,255,0.08); border-radius: 2px; display: flex; overflow: hidden;">';
          h += '<div style="width: ' + offPct + '%; background: #00D2FF;"></div>';
          h += '<div style="width: ' + legPct + '%; background: #00E599;"></div>';
          h += '</div></div>';
          h += '</div>';

          // 7. Fan Stadium Pulse
          h += '<div style="background: rgba(168, 85, 247, 0.08); border: 1px solid rgba(168, 85, 247, 0.25); border-radius: 12px; padding: 0.75rem; margin-bottom: 0.85rem;">';
          h += '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">';
          h += '<div style="font-size: 0.75rem; font-weight: 700; color: #c084fc;">🎪 Fan Stadium Pulse</div>';
          h += '<div style="font-size: 0.7rem; color: #cbd5e1;">' + this.fanCheersCount.toLocaleString() + ' Live Cheers</div>';
          h += '</div>';
          h += '<div style="display: flex; gap: 0.4rem; margin-bottom: 0.6rem;">';
          h += '<button type="button" onclick="window.cricosMobileApp.sendCheer(this.dataset.cheer)" data-cheer="🔥 MAXIMUM SIX!" style="flex: 1; padding: 0.4rem; border-radius: 6px; border: 1px solid rgba(168, 85, 247, 0.4); background: rgba(168, 85, 247, 0.2); color: #c084fc; font-size: 0.7rem; font-weight: 700;" data-tooltip="Dispatch Six Cheer">🔥 666!</button>';
          h += '<button type="button" onclick="window.cricosMobileApp.sendCheer(this.dataset.cheer)" data-cheer="💥 CLEAN BOWLED!" style="flex: 1; padding: 0.4rem; border-radius: 6px; border: 1px solid rgba(255, 51, 102, 0.4); background: rgba(255, 51, 102, 0.15); color: #ff3366; font-size: 0.7rem; font-weight: 700;" data-tooltip="Dispatch Wicket Cheer">💥 WICKET!</button>';
          h += '<button type="button" onclick="window.cricosMobileApp.sendCheer(this.dataset.cheer)" data-cheer="👏 CRACKING FOUR!" style="flex: 1; padding: 0.4rem; border-radius: 6px; border: 1px solid rgba(0, 229, 153, 0.4); background: rgba(0, 229, 153, 0.15); color: #00E599; font-size: 0.7rem; font-weight: 700;" data-tooltip="Dispatch Four Cheer">👏 FOUR!</button>';
          h += '</div>';
          h += '<div style="font-size: 0.7rem; color: #94a3b8; margin-bottom: 0.3rem;">Win Probability: BLR ' + this.pollVotes.BLR + '% • MUM ' + this.pollVotes.MUM + '%</div>';
          h += '<div style="display: flex; gap: 0.4rem;">';
          h += '<button type="button" onclick="window.cricosMobileApp.votePoll(this.dataset.team)" data-team="BLR" style="flex: 1; padding: 0.35rem; border-radius: 4px; border: 1px solid rgba(0, 229, 153, 0.3); background: rgba(0, 229, 153, 0.1); color: #00E599; font-size: 0.7rem; font-weight: 600;" data-tooltip="Vote for Bangalore">Vote BLR</button>';
          h += '<button type="button" onclick="window.cricosMobileApp.votePoll(this.dataset.team)" data-team="MUM" style="flex: 1; padding: 0.35rem; border-radius: 4px; border: 1px solid rgba(0, 210, 255, 0.3); background: rgba(0, 210, 255, 0.1); color: #00D2FF; font-size: 0.7rem; font-weight: 600;" data-tooltip="Vote for Mumbai">Vote MUM</button>';
          h += '</div></div>';
        }

        // SUB-VIEW 2: PITCH TELEMETRY & DRS HAWK-EYE
        else if (this.matchSubTab === 'TELEMETRY') {
          h += '<div class="pitch-telemetry-strip">';
          h += '<div class="pitch-telemetry-item"><span class="pitch-telemetry-lbl">Moisture</span><span class="pitch-telemetry-val">11.2%</span></div>';
          h += '<div class="pitch-telemetry-item"><span class="pitch-telemetry-lbl">Pace</span><span class="pitch-telemetry-val">142.4k</span></div>';
          h += '<div class="pitch-telemetry-item"><span class="pitch-telemetry-lbl">Bounce</span><span class="pitch-telemetry-val">8.8/10</span></div>';
          h += '<div class="pitch-telemetry-item"><span class="pitch-telemetry-lbl">Turn</span><span class="pitch-telemetry-val">3.2°</span></div>';
          h += '</div>';

          h += '<div style="background: rgba(10, 16, 28, 0.95); border: 1px solid rgba(0, 210, 255, 0.3); border-radius: 12px; padding: 0.85rem; margin-bottom: 1rem;">';
          h += '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">';
          h += '<span style="font-size: 0.8rem; font-weight: 700; color: #00D2FF;">📡 Hawk-Eye DRS Telemetry</span>';
          h += '<span style="font-size: 0.65rem; color: #00E599; font-weight: 700; background: rgba(0,229,153,0.12); padding: 0.15rem 0.45rem; border-radius: 4px;">CALIBRATED</span>';
          h += '</div>';
          h += '<div style="font-size: 0.72rem; color: #94a3b8; margin-bottom: 0.6rem;">High-frame rate tracking of trajectory, pitch bounce, pad impact, and stumps path:</div>';
          h += '<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.4rem; text-align: center; margin-bottom: 0.75rem;">';
          h += '<div style="background: rgba(0,0,0,0.4); padding: 0.5rem; border-radius: 6px;"><div style="font-size: 0.6rem; color: #94a3b8;">Pitching</div><div style="font-weight: 800; color: #00E599; font-size: 0.8rem;">IN-LINE</div></div>';
          h += '<div style="background: rgba(0,0,0,0.4); padding: 0.5rem; border-radius: 6px;"><div style="font-size: 0.6rem; color: #94a3b8;">Impact</div><div style="font-weight: 800; color: #00E599; font-size: 0.8rem;">IN-LINE</div></div>';
          h += '<div style="background: rgba(0,0,0,0.4); padding: 0.5rem; border-radius: 6px;"><div style="font-size: 0.6rem; color: #94a3b8;">Wickets</div><div style="font-weight: 800; color: #FF3366; font-size: 0.8rem;">HITTING</div></div>';
          h += '</div>';
          h += '<button type="button" onclick="window.cricosMobileApp.openDrsReviewSheet()" style="width: 100%; padding: 0.65rem; border-radius: 8px; border: none; background: linear-gradient(135deg, #00D2FF, #00E599); color: #04070D; font-weight: 700; font-size: 0.8rem;" data-tooltip="Inspect 3D Hawk-Eye trajectory graphic">Inspect 3D Ball Tracking Trajectory →</button>';
          h += '</div>';
        }

        // SUB-VIEW 3: COMMENTARY STREAM
        else if (this.matchSubTab === 'COMMENTARY') {
          h += '<div style="font-size: 0.8rem; font-weight: 700; color: #cbd5e1; margin-bottom: 0.6rem;">🎙️ Live Ball-by-Ball Feed</div>';
          h += '<div style="display: flex; flex-direction: column; gap: 0.5rem;">';
          for (var c = 0; c < this.matchState.commentary.length; c++) {
            var item = this.matchState.commentary[c];
            h += '<div style="background: rgba(10, 16, 28, 0.85); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 0.65rem 0.85rem;">';
            h += '<div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">';
            h += '<span style="font-family: Chakra Petch, monospace; font-size: 0.75rem; font-weight: 700; color: #f8fafc; background: rgba(255,255,255,0.08); padding: 0.1rem 0.35rem; border-radius: 4px;">' + item.ball + '</span>';
            h += '<span style="font-size: 0.65rem; font-weight: 800; color: ' + item.badgeColor + '; background: rgba(255,255,255,0.04); padding: 0.1rem 0.4rem; border-radius: 4px; border: 1px solid ' + item.badgeColor + '40;">' + item.badge + '</span>';
            h += '</div>';
            h += '<div style="font-size: 0.75rem; color: #cbd5e1; line-height: 1.35;">' + item.text + '</div>';
            h += '</div>';
          }
          h += '</div>';
        }

        // SUB-VIEW 4: ANALYTICS & SCORECARD
        else if (this.matchSubTab === 'ANALYTICS') {
          h += '<div style="display: flex; gap: 0.3rem; flex-wrap: wrap; margin-bottom: 0.85rem;">';
          h += '<button type="button" onclick="window.cricosMobileApp.toggleChart(this.dataset.chart)" data-chart="WORM" style="background: ' + (this.activeChart === 'WORM' ? 'rgba(0, 229, 153, 0.25)' : 'rgba(0, 229, 153, 0.1)') + '; border: 1px solid rgba(0, 229, 153, 0.3); color: #00E599; font-size: 0.7rem; padding: 0.3rem 0.6rem; border-radius: 6px; cursor: pointer;" data-tooltip="View Worm progression curve">📈 Worm</button>';
          h += '<button type="button" onclick="window.cricosMobileApp.toggleChart(this.dataset.chart)" data-chart="MANHATTAN" style="background: ' + (this.activeChart === 'MANHATTAN' ? 'rgba(0, 210, 255, 0.25)' : 'rgba(0, 210, 255, 0.1)') + '; border: 1px solid rgba(0, 210, 255, 0.3); color: #00D2FF; font-size: 0.7rem; padding: 0.3rem 0.6rem; border-radius: 6px; cursor: pointer;" data-tooltip="View Manhattan over bars">📊 Bars</button>';
          h += '<button type="button" onclick="window.cricosMobileApp.toggleChart(this.dataset.chart)" data-chart="WAGON" style="background: ' + (this.activeChart === 'WAGON' ? 'rgba(192, 132, 252, 0.25)' : 'rgba(192, 132, 252, 0.1)') + '; border: 1px solid rgba(192, 132, 252, 0.3); color: #c084fc; font-size: 0.7rem; padding: 0.3rem 0.6rem; border-radius: 6px; cursor: pointer;" data-tooltip="View 8-zone Wagon Wheel">🎯 Wagon</button>';
          h += '<button type="button" onclick="window.cricosMobileApp.toggleChart(this.dataset.chart)" data-chart="SCORECARD" style="background: ' + (this.activeChart === 'SCORECARD' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.06)') + '; border: 1px solid rgba(255, 255, 255, 0.15); color: #f8fafc; font-size: 0.7rem; padding: 0.3rem 0.6rem; border-radius: 6px; cursor: pointer;" data-tooltip="View full detailed scorecard">📄 Card</button>';
          h += '</div>';

          // Worm Chart
          if (this.activeChart === 'WORM') {
            h += '<div style="background: rgba(10, 16, 28, 0.95); border: 1px solid var(--turf-emerald); border-radius: 12px; padding: 0.85rem; margin-bottom: 1rem;">';
            h += '<div style="font-size: 0.8rem; font-weight: 700; color: #00E599; margin-bottom: 0.5rem; display: flex; justify-content: space-between;">';
            h += '<span>📈 Worm Progression (1st Inn vs Chase)</span><span style="color: #94a3b8; font-size: 0.7rem;">Target: 178</span>';
            h += '</div>';
            h += '<svg viewBox="0 0 340 140" width="100%" height="140" xmlns="http://www.w3.org/2000/svg" style="background: rgba(0,0,0,0.3); border-radius: 8px;">';
            h += '<line x1="30" y1="120" x2="320" y2="120" stroke="rgba(255,255,255,0.15)" />';
            h += '<line x1="30" y1="20" x2="30" y2="120" stroke="rgba(255,255,255,0.15)" />';
            h += '<path d="M 30 120 L 75 105 L 120 90 L 175 75 L 230 55 L 285 35 L 320 25" fill="none" stroke="#00E599" stroke-width="2.5" />';
            h += '<path d="M 30 120 L 75 108 L 120 92 L 175 70 L 230 50 L 270 38" fill="none" stroke="#00D2FF" stroke-width="2.5" />';
            h += '<circle cx="120" cy="90" r="3.5" fill="#FF3366" />';
            h += '<circle cx="230" cy="55" r="3.5" fill="#FF3366" />';
            h += '<text x="40" y="25" fill="#00E599" font-size="9" font-weight="700">DEL 178/10</text>';
            h += '<text x="140" y="25" fill="#00D2FF" font-size="9" font-weight="700">MUM ' + this.matchState.totalRuns + '/' + this.matchState.totalWickets + '</text>';
            h += '</svg></div>';
          }

          // Manhattan Chart
          else if (this.activeChart === 'MANHATTAN') {
            h += '<div style="background: rgba(10, 16, 28, 0.95); border: 1px solid var(--cyan); border-radius: 12px; padding: 0.85rem; margin-bottom: 1rem;">';
            h += '<div style="font-size: 0.8rem; font-weight: 700; color: #00D2FF; margin-bottom: 0.5rem; display: flex; justify-content: space-between;">';
            h += '<span>📊 Manhattan Over-by-Over Runs</span><span style="color: #94a3b8; font-size: 0.7rem;">Overs 1-16</span>';
            h += '</div>';
            h += '<svg viewBox="0 0 340 120" width="100%" height="120" xmlns="http://www.w3.org/2000/svg" style="background: rgba(0,0,0,0.3); border-radius: 8px;">';
            h += '<line x1="20" y1="105" x2="320" y2="105" stroke="rgba(255,255,255,0.15)" />';
            h += '<rect x="25" y="75" width="14" height="30" fill="#00D2FF" rx="2" />';
            h += '<rect x="45" y="45" width="14" height="60" fill="#00E599" rx="2" />';
            h += '<rect x="65" y="85" width="14" height="20" fill="#64748b" rx="2" />';
            h += '<rect x="85" y="55" width="14" height="50" fill="#00D2FF" rx="2" />';
            h += '<rect x="105" y="30" width="14" height="75" fill="#00E599" rx="2" />';
            h += '<rect x="125" y="90" width="14" height="15" fill="#64748b" rx="2" />';
            h += '<rect x="145" y="65" width="14" height="40" fill="#00D2FF" rx="2" />';
            h += '<rect x="165" y="50" width="14" height="55" fill="#00D2FF" rx="2" />';
            h += '<rect x="185" y="35" width="14" height="70" fill="#00E599" rx="2" />';
            h += '<rect x="205" y="70" width="14" height="35" fill="#00D2FF" rx="2" />';
            h += '<rect x="225" y="55" width="14" height="50" fill="#00D2FF" rx="2" />';
            h += '<rect x="245" y="40" width="14" height="65" fill="#00D2FF" rx="2" />';
            h += '<rect x="265" y="65" width="14" height="40" fill="#00D2FF" rx="2" />';
            h += '<rect x="285" y="30" width="14" height="75" fill="#00E599" rx="2" />';
            h += '<rect x="305" y="25" width="14" height="80" fill="#00E599" rx="2" />';
            h += '</svg></div>';
          }

          // Wagon Wheel
          else if (this.activeChart === 'WAGON') {
            h += '<div id="mobileWagonPanel" style="background: rgba(10, 16, 28, 0.95); border: 1px solid #c084fc; border-radius: 12px; padding: 0.85rem; margin-bottom: 1rem;">';
            h += '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">';
            h += '<span style="font-size: 0.8rem; font-weight: 700; color: #c084fc;">🎯 Mobile Precision Wagon Wheel</span>';
            h += '<span style="font-size: 0.65rem; color: #00E599; font-weight: 800; background: rgba(0,229,153,0.15); padding: 0.1rem 0.4rem; border-radius: 4px;">RHB • Virat (48*)</span>';
            h += '</div>';
            h += '<div style="position: relative; width: 100%; display: flex; justify-content: center; margin-bottom: 0.5rem;">';
            h += '<svg viewBox="0 0 300 300" width="260" height="260" xmlns="http://www.w3.org/2000/svg" style="border-radius: 50%; background: #030C08;">';
            h += '<circle cx="150" cy="150" r="140" fill="#092418" stroke="rgba(0, 229, 153, 0.4)" stroke-width="2" />';
            h += '<circle cx="150" cy="150" r="75" fill="none" stroke="rgba(0, 210, 255, 0.35)" stroke-width="1" stroke-dasharray="3,3" />';
            h += '<rect x="140" y="115" width="20" height="70" rx="2" fill="#8C6E3D" />';
            h += '<circle cx="150" cy="130" r="4" fill="#00E599" />';
            h += '<text x="35" y="145" fill="#00D2FF" font-size="7" font-weight="700">◀ OFF</text>';
            h += '<text x="265" y="145" fill="#00E599" font-size="7" font-weight="700" text-anchor="end">ON ▶</text>';
            h += '<line x1="150" y1="130" x2="65" y2="230" stroke="#00E599" stroke-width="2" />';
            h += '<line x1="150" y1="130" x2="50" y2="190" stroke="#00E599" stroke-width="2" />';
            h += '<line x1="150" y1="130" x2="230" y2="180" stroke="#00E599" stroke-width="2" />';
            h += '<path d="M 150 130 Q 110 230 130 270" fill="none" stroke="#FFB800" stroke-width="2" />';
            h += '<path d="M 150 130 Q 200 230 180 270" fill="none" stroke="#FFB800" stroke-width="2" />';
            h += '<line x1="150" y1="130" x2="75" y2="85" stroke="#00D2FF" stroke-width="1.2" />';
            h += '<line x1="150" y1="130" x2="225" y2="75" stroke="#00D2FF" stroke-width="1.2" />';
            h += '</svg></div>';
            h += '<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.3rem; font-size: 0.7rem; text-align: center; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 0.4rem;">';
            h += '<div><span style="color: #94a3b8; display: block; font-size: 0.6rem;">Off Runs</span><strong style="color: #00D2FF;">28</strong></div>';
            h += '<div><span style="color: #94a3b8; display: block; font-size: 0.6rem;">On Runs</span><strong style="color: #00E599;">20</strong></div>';
            h += '<div><span style="color: #94a3b8; display: block; font-size: 0.6rem;">Boundaries</span><strong style="color: #c084fc;">32</strong></div>';
            h += '<div><span style="color: #94a3b8; display: block; font-size: 0.6rem;">Dots</span><strong style="color: #ffb800;">12.5%</strong></div>';
            h += '</div></div>';
          }

          // Full Scorecard
          else if (this.activeChart === 'SCORECARD') {
            h += '<div id="mobileScorecardPanel" style="background: rgba(10, 16, 28, 0.95); border: 1px solid rgba(255,255,255,0.15); border-radius: 12px; padding: 0.85rem; margin-bottom: 1rem;">';
            h += '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">';
            h += '<span style="font-size: 0.8rem; font-weight: 700; color: #f8fafc;">📄 Detailed Scorecard</span>';
            h += '<span style="font-size: 0.7rem; color: #00E599; font-weight: 700;">Innings 2: 142/3</span>';
            h += '</div>';
            h += '<table style="width: 100%; border-collapse: collapse; font-size: 0.72rem; margin-bottom: 0.6rem;">';
            h += '<thead><tr style="color: #94a3b8; border-bottom: 1px solid rgba(255,255,255,0.1); text-align: left;">';
            h += '<th style="padding: 0.25rem 0;">Batter</th><th style="padding: 0.25rem 0; text-align: right;">R</th><th style="padding: 0.25rem 0; text-align: right;">B</th><th style="padding: 0.25rem 0; text-align: right;">4s</th><th style="padding: 0.25rem 0; text-align: right;">6s</th><th style="padding: 0.25rem 0; text-align: right;">SR</th>';
            h += '</tr></thead><tbody>';
            h += '<tr style="border-bottom: 1px solid rgba(255,255,255,0.04);"><td style="padding: 0.25rem 0; font-weight: 700;">Rohit Verma <small style="color: #94a3b8; display: block;">c Pant b Bumrah</small></td><td style="padding: 0.25rem 0; text-align: right; color: #00E599; font-weight: 700;">38</td><td style="padding: 0.25rem 0; text-align: right;">26</td><td style="padding: 0.25rem 0; text-align: right;">4</td><td style="padding: 0.25rem 0; text-align: right;">2</td><td style="padding: 0.25rem 0; text-align: right;">146.1</td></tr>';
            h += '<tr style="border-bottom: 1px solid rgba(255,255,255,0.04);"><td style="padding: 0.25rem 0; font-weight: 700;">Ishan Kishan <small style="color: #94a3b8; display: block;">b Siraj</small></td><td style="padding: 0.25rem 0; text-align: right; color: #00E599; font-weight: 700;">16</td><td style="padding: 0.25rem 0; text-align: right;">11</td><td style="padding: 0.25rem 0; text-align: right;">2</td><td style="padding: 0.25rem 0; text-align: right;">1</td><td style="padding: 0.25rem 0; text-align: right;">145.5</td></tr>';
            h += '<tr style="border-bottom: 1px solid rgba(255,255,255,0.04);"><td style="padding: 0.25rem 0; font-weight: 700;">Suryakumar Yadav <small style="color: #94a3b8; display: block;">c sub b Kuldeep</small></td><td style="padding: 0.25rem 0; text-align: right; color: #00E599; font-weight: 700;">42</td><td style="padding: 0.25rem 0; text-align: right;">28</td><td style="padding: 0.25rem 0; text-align: right;">5</td><td style="padding: 0.25rem 0; text-align: right;">2</td><td style="padding: 0.25rem 0; text-align: right;">150.0</td></tr>';
            h += '<tr style="border-bottom: 1px solid rgba(255,255,255,0.04);"><td style="padding: 0.25rem 0; font-weight: 700; color: #00E599;">Virat Sharma * <small style="color: #94a3b8; display: block;">not out</small></td><td style="padding: 0.25rem 0; text-align: right; color: #00E599; font-weight: 700;">48</td><td style="padding: 0.25rem 0; text-align: right;">32</td><td style="padding: 0.25rem 0; text-align: right;">4</td><td style="padding: 0.25rem 0; text-align: right;">2</td><td style="padding: 0.25rem 0; text-align: right;">150.0</td></tr>';
            h += '<tr><td style="padding: 0.25rem 0; font-weight: 700; color: #00D2FF;">Hardik Patel <small style="color: #94a3b8; display: block;">not out</small></td><td style="padding: 0.25rem 0; text-align: right; color: #00E599; font-weight: 700;">18</td><td style="padding: 0.25rem 0; text-align: right;">12</td><td style="padding: 0.25rem 0; text-align: right;">1</td><td style="padding: 0.25rem 0; text-align: right;">1</td><td style="padding: 0.25rem 0; text-align: right;">150.0</td></tr>';
            h += '</tbody></table>';
            h += '<div style="font-size: 0.7rem; color: #94a3b8; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 0.3rem;">';
            h += 'Extras: <strong style="color: #ffb800;">12</strong> (b 4, lb 2, w 5, nb 1) • Total: <strong style="color: #00E599;">142/3</strong> (16.4 ov)';
            h += '</div></div>';
          }
        }

        h += '</div>';
        return h;
      }

      renderTeams() {
        var isCaptain = this.profile.persona === 'CAPTAIN';
        var h = '<div style="padding: 1rem;">';

        // Team Header & Join Code
        h += '<div style="background: rgba(10, 16, 28, 0.9); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 1.25rem; margin-bottom: 1rem;">';
        h += '<div style="display: flex; justify-content: space-between; align-items: flex-start;">';
        h += '<div>';
        h += '<div style="font-size: 0.7rem; font-weight: 700; color: #00E599; text-transform: uppercase;">Captain & Squad Hub</div>';
        h += '<h2 style="margin: 0.25rem 0 0; font-size: 1.35rem; font-family: Space Grotesk, sans-serif;">' + this.profile.teamName + '</h2>';
        h += '</div>';
        h += '<button type="button" onclick="window.cricosMobileApp.openGearCustomizerSheet()" style="padding: 0.35rem 0.65rem; border-radius: 6px; border: 1px solid rgba(0, 229, 153, 0.4); background: rgba(0, 229, 153, 0.15); color: #00E599; font-size: 0.72rem; font-weight: 700;" data-tooltip="Customise 3D bat blade and grips">🏏 3D Gear</button>';
        h += '</div>';
        h += '<div style="margin-top: 0.6rem; display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.4); padding: 0.5rem 0.75rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">';
        h += '<div><span style="font-size: 0.7rem; color: #94a3b8;">Team Join Code:</span> <strong style="color: #00D2FF; font-family: Chakra Petch, monospace; letter-spacing: 1px;">CRIC-BLR-4821</strong></div>';
        h += '<button type="button" onclick="window.cricosMobileApp.copyJoinCode()" style="padding: 0.25rem 0.6rem; border-radius: 4px; border: 1px solid rgba(0, 210, 255, 0.4); background: rgba(0, 210, 255, 0.15); color: #00D2FF; font-size: 0.7rem; font-weight: 600;" data-tooltip="Copy team code to share with squad">Copy</button>';
        h += '</div></div>';

        // Toss Execution Card
        h += '<div style="background: rgba(10, 16, 28, 0.8); border: 1px solid rgba(255, 184, 0, 0.25); border-radius: 12px; padding: 0.85rem; margin-bottom: 1rem;">';
        h += '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">';
        h += '<div style="font-size: 0.8rem; font-weight: 700; color: #ffb800;">🪙 Match Toss Certification</div>';
        h += '<span style="font-size: 0.65rem; color: #94a3b8;">' + this.toss.conductedAt + '</span>';
        h += '</div>';
        h += '<div style="font-size: 0.8rem; color: #cbd5e1; margin-bottom: 0.6rem;">Winner: <strong style="color: #f8fafc;">' + this.toss.winner + '</strong> (Elected to <strong>' + this.toss.decision + '</strong>)</div>';
        if (isCaptain) {
          h += '<button type="button" onclick="window.cricosMobileApp.conductTossModal()" style="width: 100%; padding: 0.55rem; border-radius: 6px; border: none; background: linear-gradient(135deg, #ffb800, #ff8800); color: #04070D; font-weight: 700; font-size: 0.8rem;" data-tooltip="Conduct pre-match coin toss">🪙 Conduct Official Toss →</button>';
        }
        h += '</div>';

        // 21st.dev Athletic KPI & Career Stats Card (Selected Roster Player)
        h += this.renderAthleticCard(this.selectedPlayerId || 'p1');

        // Playing XI List
        h += '<div style="font-size: 0.85rem; font-weight: 700; margin-bottom: 0.5rem; display: flex; justify-content: space-between;">';
        h += '<span>Playing XI (' + this.playingXI.length + ')</span>';
        h += '<span style="font-size: 0.75rem; color: #00E599;">Match Ready</span>';
        h += '</div>';

        h += '<div style="display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1rem;">';
        for (var i = 0; i < this.playingXI.length; i++) {
          var p = this.playingXI[i];
          var isSel = p.id === (this.selectedPlayerId || 'p1');
          h += '<div class="player-list-item ' + (isSel ? 'active-player' : '') + '" onclick="window.cricosMobileApp.selectPlayer(this.dataset.playerId)" data-player-id="' + p.id + '" style="background: ' + (isSel ? 'rgba(0, 229, 153, 0.12)' : 'rgba(10, 16, 28, 0.8)') + '; border: 1px solid ' + (isSel ? '#00E599' : 'rgba(255,255,255,0.08)') + '; border-radius: 8px; padding: 0.6rem 0.75rem; display: flex; justify-content: space-between; align-items: center;">';
          h += '<div style="display: flex; align-items: center; gap: 0.5rem;">';
          h += '<span style="font-family: Chakra Petch, monospace; font-size: 0.75rem; color: #94a3b8; width: 22px;">#' + p.jersey + '</span>';
          h += '<div>';
          h += '<div style="font-size: 0.85rem; font-weight: 700;">' + p.name + ' ' + (p.role === 'CAPTAIN' ? '<span style="color: #00E599; font-size: 0.65rem;">(C)</span>' : '') + '</div>';
          h += '<div style="font-size: 0.65rem; color: #94a3b8;">' + p.role + '</div>';
          h += '</div></div>';
          if (isCaptain) {
            h += '<button type="button" onclick="event.stopPropagation(); window.cricosMobileApp.benchPlayer(' + i + ')" style="padding: 0.3rem 0.5rem; border-radius: 4px; border: 1px solid rgba(255,255,255,0.15); background: transparent; color: #cbd5e1; font-size: 0.65rem;" data-tooltip="Move player to bench">Bench ⇄</button>';
          }
          h += '</div>';
        }
        h += '</div>';

        // Bench Reserves
        h += '<div style="font-size: 0.85rem; font-weight: 700; margin-bottom: 0.5rem;">Bench Reserves (' + this.bench.length + ')</div>';
        h += '<div style="display: flex; flex-direction: column; gap: 0.4rem;">';
        for (var b = 0; b < this.bench.length; b++) {
          var bp = this.bench[b];
          var isSelB = bp.id === (this.selectedPlayerId || 'p1');
          h += '<div class="player-list-item ' + (isSelB ? 'active-player' : '') + '" onclick="window.cricosMobileApp.selectPlayer(this.dataset.playerId)" data-player-id="' + bp.id + '" style="background: ' + (isSelB ? 'rgba(0, 229, 153, 0.12)' : 'rgba(10, 16, 28, 0.5)') + '; border: 1px solid ' + (isSelB ? '#00E599' : 'rgba(255,255,255,0.05)') + '; border-radius: 8px; padding: 0.5rem 0.75rem; display: flex; justify-content: space-between; align-items: center;">';
          h += '<div style="font-size: 0.8rem; color: #94a3b8;">#' + bp.jersey + ' ' + bp.name + ' <small>(' + bp.role + ')</small></div>';
          h += '<span style="font-size: 0.65rem; color: #64748b;">Reserve</span>';
          h += '</div>';
        }
        h += '</div></div>';
        return h;
      }

      renderTournaments() {
        var isOrganiser = this.profile.persona === 'ORGANISER';
        var h = '<div style="padding: 1rem;">';

        // Tournament Card & 4-Stage Stepper
        h += '<div style="background: rgba(10, 16, 28, 0.9); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 1.25rem; margin-bottom: 1rem;">';
        h += '<div style="font-size: 0.7rem; font-weight: 700; color: #00D2FF; text-transform: uppercase;">Championship Hub</div>';
        h += '<h2 style="margin: 0.25rem 0 0; font-size: 1.25rem; font-family: Space Grotesk, sans-serif;">Club Premier League 2026</h2>';
        h += '<div style="display: flex; gap: 0.25rem; margin-top: 0.75rem;">';
        var stages = ['REGISTRATION', 'GROUP_STAGE', 'PLAYOFFS', 'COMPLETED'];
        for (var st = 0; st < stages.length; st++) {
          var isCur = stages[st] === 'GROUP_STAGE';
          var bg = isCur ? '#00E599' : 'rgba(255,255,255,0.1)';
          var col = isCur ? '#04070D' : '#94a3b8';
          h += '<div style="flex: 1; text-align: center; padding: 0.25rem; font-size: 0.6rem; font-weight: 700; border-radius: 4px; background:' + bg + '; color:' + col + ';">' + stages[st].replace('_', ' ') + '</div>';
        }
        h += '</div></div>';

        // Organiser Event Basket Action
        if (isOrganiser) {
          h += '<div style="background: rgba(0, 229, 153, 0.08); border: 1px solid rgba(0, 229, 153, 0.25); border-radius: 12px; padding: 0.85rem; margin-bottom: 1rem;">';
          h += '<div style="font-size: 0.8rem; font-weight: 700; color: #00E599; margin-bottom: 0.3rem;">🧺 Event Basket Procurement</div>';
          h += '<div style="font-size: 0.75rem; color: #cbd5e1; margin-bottom: 0.6rem;">Book venue, umpires, and balls in a unified escrow bundle with 15-min GiST lock.</div>';
          h += '<div style="display: flex; gap: 0.5rem;">';
          h += '<button type="button" onclick="window.cricosMobileApp.openEventBasketModal()" style="flex: 1; padding: 0.55rem; border-radius: 6px; border: none; background: linear-gradient(135deg, #00E599, #00D2FF); color: #04070D; font-weight: 700; font-size: 0.75rem;" data-tooltip="Open unified match event procurement basket">Procure Basket →</button>';
          h += '<button type="button" onclick="window.cricosMobileApp.generateFixtures()" style="flex: 1; padding: 0.55rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.05); color: #f8fafc; font-weight: 600; font-size: 0.75rem;" data-tooltip="Generate round-robin match brackets">Auto Fixtures 📅</button>';
          h += '</div></div>';
        }

        // NRR Trajectory Sparkline SVG (Stitch Application Architecture integration)
        h += '<div style="background: rgba(10, 16, 28, 0.85); border: 1px solid rgba(0, 229, 153, 0.25); border-radius: 12px; padding: 0.85rem; margin-bottom: 1rem;">';
        h += '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">';
        h += '<span style="font-size: 0.78rem; font-weight: 700; color: #00E599;">📈 NRR Trajectory Sparkline</span>';
        h += '<span style="font-size: 0.65rem; color: #94a3b8;">Matches 1-7 Progression</span>';
        h += '</div>';
        h += '<svg viewBox="0 0 320 80" width="100%" height="80" xmlns="http://www.w3.org/2000/svg" style="background: rgba(0,0,0,0.3); border-radius: 6px;">';
        h += '<line x1="20" y1="40" x2="300" y2="40" stroke="rgba(255,255,255,0.12)" stroke-dasharray="3,3" />';
        h += '<path d="M 20 50 Q 90 20 160 30 T 300 15" fill="none" stroke="#00E599" stroke-width="2.5" />';
        h += '<path d="M 20 40 Q 90 45 160 35 T 300 28" fill="none" stroke="#00D2FF" stroke-width="2" stroke-dasharray="4,2" />';
        h += '<path d="M 20 35 Q 90 60 160 65 T 300 70" fill="none" stroke="#FF3366" stroke-width="1.8" />';
        h += '<circle cx="300" cy="15" r="3" fill="#00E599" />';
        h += '<circle cx="300" cy="28" r="3" fill="#00D2FF" />';
        h += '<circle cx="300" cy="70" r="3" fill="#FF3366" />';
        h += '</svg>';
        h += '<div style="display: flex; justify-content: space-between; font-size: 0.65rem; margin-top: 0.35rem; color: #94a3b8;">';
        h += '<span><strong style="color: #00E599;">—</strong> Mumbai (+1.42)</span>';
        h += '<span><strong style="color: #00D2FF;">--</strong> Delhi (+0.85)</span>';
        h += '<span><strong style="color: #FF3366;">—</strong> Kolkata (-1.85)</span>';
        h += '</div></div>';

        // Playoff Knockout Tree Bracket (Qualifier 1, Eliminator, Grand Final)
        h += '<div style="background: rgba(10, 16, 28, 0.85); border: 1px solid rgba(255, 184, 0, 0.25); border-radius: 12px; padding: 0.85rem; margin-bottom: 1rem;">';
        h += '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem;">';
        h += '<span style="font-size: 0.78rem; font-weight: 700; color: #FFB800;">🏆 Playoff Knockout Bracket</span>';
        h += '<span style="font-size: 0.65rem; color: #FFB800; font-weight: 700; background: rgba(255,184,0,0.15); padding: 0.1rem 0.4rem; border-radius: 4px;">₹300k Purse</span>';
        h += '</div>';
        h += '<div style="display: flex; flex-direction: column; gap: 0.45rem;">';
        h += '<div style="background: rgba(0,0,0,0.35); border-left: 3px solid #00E599; border-radius: 6px; padding: 0.5rem 0.65rem; display: flex; justify-content: space-between; align-items: center;">';
        h += '<div><div style="font-size: 0.65rem; color: #00E599; font-weight: 700;">QUALIFIER 1</div><div style="font-size: 0.75rem; font-weight: 700;">Mumbai vs Delhi</div></div>';
        h += '<button type="button" onclick="window.cricosMobileApp.setKnockoutReminder(\\'Qualifier 1\\')" style="background: rgba(0,229,153,0.12); border: 1px solid rgba(0,229,153,0.3); color: #00E599; font-size: 0.65rem; padding: 0.2rem 0.45rem; border-radius: 4px;" data-tooltip="Set reminder for Qualifier 1">Remind ⏰</button>';
        h += '</div>';
        h += '<div style="background: rgba(0,0,0,0.35); border-left: 3px solid #00D2FF; border-radius: 6px; padding: 0.5rem 0.65rem; display: flex; justify-content: space-between; align-items: center;">';
        h += '<div><div style="font-size: 0.65rem; color: #00D2FF; font-weight: 700;">ELIMINATOR</div><div style="font-size: 0.75rem; font-weight: 700;">Bangalore RC vs Kolkata KR</div></div>';
        h += '<button type="button" onclick="window.cricosMobileApp.setKnockoutReminder(\\'Eliminator\\')" style="background: rgba(0,210,255,0.12); border: 1px solid rgba(0,210,255,0.3); color: #00D2FF; font-size: 0.65rem; padding: 0.2rem 0.45rem; border-radius: 4px;" data-tooltip="Set reminder for Eliminator">Remind ⏰</button>';
        h += '</div>';
        h += '<div style="background: rgba(255,184,0,0.08); border-left: 3px solid #FFB800; border-radius: 6px; padding: 0.5rem 0.65rem; display: flex; justify-content: space-between; align-items: center;">';
        h += '<div><div style="font-size: 0.65rem; color: #FFB800; font-weight: 700;">GRAND FINAL</div><div style="font-size: 0.75rem; font-weight: 700;">Winner Q1 vs Winner Q2</div></div>';
        h += '<span style="font-size: 0.65rem; color: #FFB800; font-weight: 700;">Sun 19:30</span>';
        h += '</div>';
        h += '</div></div>';

        // ICC Points Table & Net Run Rate
        h += '<div style="background: rgba(10, 16, 28, 0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden; margin-bottom: 1rem;">';
        h += '<div style="padding: 0.75rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.08); font-size: 0.85rem; font-weight: 700; font-family: Space Grotesk, sans-serif;">ICC Points Table & Net Run Rate</div>';
        h += '<table style="width: 100%; border-collapse: collapse; font-size: 0.75rem;">';
        h += '<thead><tr style="color: #94a3b8; border-bottom: 1px solid rgba(255,255,255,0.08);">';
        h += '<th style="padding: 0.5rem 0.75rem; text-align: left;">Team</th><th style="padding: 0.5rem; text-align: center;">P</th><th style="padding: 0.5rem; text-align: center;">W</th><th style="padding: 0.5rem; text-align: center; color: #00E599;">Pts</th><th style="padding: 0.5rem 0.75rem; text-align: right;">NRR</th>';
        h += '</tr></thead><tbody>';

        for (var i = 0; i < this.standings.length; i++) {
          var s = this.standings[i];
          var nrrColor = s.nrr.indexOf('+') === 0 ? '#00E599' : '#ff3366';
          h += '<tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">';
          h += '<td style="padding: 0.65rem 0.75rem; font-weight: 600;">' + s.position + '. ' + s.team + '</td>';
          h += '<td style="padding: 0.65rem; text-align: center;">' + s.played + '</td>';
          h += '<td style="padding: 0.65rem; text-align: center;">' + s.won + '</td>';
          h += '<td style="padding: 0.65rem; text-align: center; font-weight: 800; color: #00E599; font-family: Chakra Petch, monospace;">' + s.points + '</td>';
          h += '<td style="padding: 0.65rem 0.75rem; text-align: right; font-family: Chakra Petch, monospace; font-weight: 700; color: ' + nrrColor + ';">' + s.nrr + '</td>';
          h += '</tr>';
        }
        h += '</tbody></table></div>';

        // Fixtures Schedule
        h += '<div style="font-size: 0.85rem; font-weight: 700; margin-bottom: 0.5rem;">Tournament Fixtures</div>';
        h += '<div style="display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1rem;">';
        for (var f = 0; f < this.fixtures.length; f++) {
          var fx = this.fixtures[f];
          h += '<div style="background: rgba(10, 16, 28, 0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 0.6rem 0.75rem; display: flex; justify-content: space-between; align-items: center;">';
          h += '<div><div style="font-size: 0.8rem; font-weight: 700;">' + fx.home + ' vs ' + fx.away + '</div><div style="font-size: 0.65rem; color: #94a3b8;">' + fx.round + ' • ' + fx.time + '</div></div>';
          h += '<span style="font-size: 0.65rem; font-weight: 700; padding: 0.15rem 0.4rem; border-radius: 4px; ' + (fx.status === 'LIVE' ? 'background: rgba(255, 51, 102, 0.2); color: #ff3366;' : 'background: rgba(255,255,255,0.05); color: #94a3b8;') + '">' + fx.status + '</span>';
          h += '</div>';
        }
        h += '</div>';

        // Leaderboards: Orange & Purple Cap
        h += '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">';
        h += '<div style="background: rgba(255, 184, 0, 0.08); border: 1px solid rgba(255, 184, 0, 0.25); border-radius: 8px; padding: 0.65rem;">';
        h += '<div style="font-size: 0.7rem; font-weight: 700; color: #ffb800;">🧢 Orange Cap (Runs)</div>';
        h += '<div style="font-size: 0.85rem; font-weight: 800; margin-top: 0.2rem;">Virat K. <span style="color: #ffb800; font-family: Chakra Petch, monospace;">248</span></div>';
        h += '</div>';
        h += '<div style="background: rgba(168, 85, 247, 0.08); border: 1px solid rgba(168, 85, 247, 0.25); border-radius: 8px; padding: 0.65rem;">';
        h += '<div style="font-size: 0.7rem; font-weight: 700; color: #c084fc;">🧢 Purple Cap (Wickets)</div>';
        h += '<div style="font-size: 0.85rem; font-weight: 800; margin-top: 0.2rem;">Jasprit B. <span style="color: #c084fc; font-family: Chakra Petch, monospace;">9</span></div>';
        h += '</div></div>';

        h += '</div>';
        return h;
      }

      renderMarketplace() {
        var isProvider = this.profile.persona === 'TURF_PROVIDER';
        var h = '<div style="padding: 1rem;">';

        // Marketplace Header
        h += '<div style="background: rgba(10, 16, 28, 0.9); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 1.25rem; margin-bottom: 1rem;">';
        h += '<div style="display: flex; justify-content: space-between; align-items: flex-start;">';
        h += '<div>';
        h += '<h2 style="margin: 0; font-size: 1.25rem; font-family: Space Grotesk, sans-serif;">' + (isProvider ? '🏟️ Turf Provider Storefront' : '🛒 Cricket Marketplace') + '</h2>';
        h += '<div style="font-size: 0.72rem; color: #94a3b8; margin-top: 0.2rem;">Authoritative GiST slot hold with escrow settlement</div>';
        h += '</div>';
        h += '<button type="button" onclick="window.cricosMobileApp.openEventBasketModal()" style="padding: 0.35rem 0.65rem; border-radius: 6px; border: 1px solid rgba(0, 229, 153, 0.4); background: rgba(0, 229, 153, 0.15); color: #00E599; font-size: 0.72rem; font-weight: 700;" data-tooltip="Inspect unified Event Basket">🧺 Basket</button>';
        h += '</div></div>';

        // Category Filter Chips
        h += '<div class="mobile-chip-row">';
        var categories = ['ALL', 'GROUND', 'UMPIRE', 'SCORER', 'GEAR', 'MEDICAL'];
        for (var c = 0; c < categories.length; c++) {
          var cat = categories[c];
          var isCatAct = this.marketCategory === cat;
          h += '<button type="button" class="mobile-chip ' + (isCatAct ? 'active' : '') + '" onclick="window.cricosMobileApp.filterCategory(this.dataset.cat)" data-cat="' + cat + '" data-tooltip="Filter by ' + cat + '">';
          h += cat.charAt(0) + cat.slice(1).toLowerCase();
          h += '</button>';
        }
        h += '</div>';

        // Turf Provider Storefront Tools
        if (isProvider) {
          var gross = 45000;
          var fee = gross * 0.05;
          var gst = fee * 0.18;
          var net = gross - fee - gst;

          h += '<div style="background: rgba(0, 229, 153, 0.08); border: 1px solid rgba(0, 229, 153, 0.25); border-radius: 12px; padding: 0.85rem; margin-bottom: 1rem;">';
          h += '<div style="font-size: 0.8rem; font-weight: 700; color: #00E599; margin-bottom: 0.4rem;">💰 Monthly Earnings Dashboard</div>';
          h += '<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.3rem; margin-bottom: 0.6rem; text-align: center;">';
          h += '<div style="background: rgba(0,0,0,0.4); padding: 0.4rem; border-radius: 6px;"><div style="font-size: 0.65rem; color: #94a3b8;">Gross</div><div style="font-weight: 800; font-size: 0.85rem; font-family: Chakra Petch, monospace;">₹' + gross.toLocaleString() + '</div></div>';
          h += '<div style="background: rgba(0,0,0,0.4); padding: 0.4rem; border-radius: 6px;"><div style="font-size: 0.65rem; color: #94a3b8;">Fee & GST</div><div style="font-weight: 800; font-size: 0.85rem; color: #ff3366; font-family: Chakra Petch, monospace;">-₹' + (fee + gst).toFixed(0) + '</div></div>';
          h += '<div style="background: rgba(0,0,0,0.4); padding: 0.4rem; border-radius: 6px;"><div style="font-size: 0.65rem; color: #94a3b8;">Net Payout</div><div style="font-weight: 800; font-size: 0.85rem; color: #00E599; font-family: Chakra Petch, monospace;">₹' + net.toFixed(0) + '</div></div>';
          h += '</div>';
          h += '<button type="button" onclick="window.cricosMobileApp.publishSlotAction()" style="width: 100%; padding: 0.6rem; border-radius: 6px; border: none; background: linear-gradient(135deg, #00E599, #00D2FF); color: #04070D; font-weight: 700; font-size: 0.8rem;" data-tooltip="Publish a new pitch slot for booking">+ Publish Pitch Slot ⚡</button>';
          h += '</div>';
        }

        // Available Listings
        h += '<div style="display: flex; flex-direction: column; gap: 0.85rem;">';
        var filteredListings = this.listings.filter(function(l) {
          return this.marketCategory === 'ALL' || l.category === this.marketCategory;
        }, this);

        for (var i = 0; i < filteredListings.length; i++) {
          var l = filteredListings[i];
          h += '<div style="background: rgba(10, 16, 28, 0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 0.85rem;">';
          h += '<div style="display: flex; justify-content: space-between;">';
          h += '<div>';
          h += '<div style="font-size: 0.7rem; color: #00E599; font-weight: 700;">' + l.category + '</div>';
          h += '<div style="font-weight: 700; font-size: 0.95rem; margin: 0.15rem 0;">' + l.title + '</div>';
          h += '<div style="font-size: 0.75rem; color: #94a3b8;">★ ' + l.rating + ' • ' + l.location + '</div>';
          h += '</div>';
          h += '<div style="text-align: right;">';
          h += '<div style="font-weight: 800; color: #00E599; font-family: Chakra Petch, monospace; font-size: 1.1rem;">₹' + l.price + '</div>';
          h += '<div style="font-size: 0.65rem; color: #94a3b8;">per slot</div>';
          h += '</div></div>';

          if (isProvider) {
            h += '<button type="button" onclick="window.cricosMobileApp.toggleSlotFreeze(' + i + ')" style="margin-top: 0.75rem; width: 100%; padding: 0.55rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.15); background: ' + (l.isFrozen ? 'rgba(255, 51, 102, 0.2)' : 'rgba(0, 229, 153, 0.1)') + '; color: ' + (l.isFrozen ? '#ff3366' : '#00E599') + '; font-weight: 700; font-size: 0.75rem;" data-tooltip="Toggle slot availability">' + (l.isFrozen ? '❄️ Slot Frozen (Tap to Unfreeze)' : '✓ Active & Bookable (Tap to Freeze)') + '</button>';
          } else {
            h += '<button type="button" onclick="window.cricosMobileApp.bookTurfInstant(this.dataset.title, this.dataset.price)" data-title="' + l.title + '" data-price="' + l.price + '" style="margin-top: 0.75rem; width: 100%; padding: 0.6rem; border-radius: 6px; border: none; background: linear-gradient(135deg, #00E599, #00D2FF); color: #04070D; font-weight: 700; font-size: 0.8rem;" data-tooltip="Lock slot with 15-minute GiST PostgreSQL hold">Instant 15-Min Hold & Book →</button>';
          }
          h += '</div>';
        }
        h += '</div></div>';
        return h;
      }

      filterCategory(cat) {
        this.marketCategory = cat;
        if (window.CricOSSound) window.CricOSSound.playClick();
        this.render();
      }

      renderIncidents() {
        var h = '<div style="padding: 1rem;">';
        h += '<div style="background: rgba(10, 16, 28, 0.9); border: 1px solid rgba(255, 51, 102, 0.3); border-radius: 14px; padding: 1.25rem; margin-bottom: 1rem;">';
        h += '<div style="font-size: 0.7rem; font-weight: 700; color: #ff3366; text-transform: uppercase;">MCC Laws & Trust Desk</div>';
        h += '<h2 style="margin: 0.25rem 0 0; font-size: 1.25rem; font-family: Space Grotesk, sans-serif;">Lead Umpire Desk</h2>';
        h += '<div style="font-size: 0.75rem; color: #94a3b8; margin-top: 0.2rem;">DRS Reviews, Fair Play Log & Official Sign-off</div>';
        h += '</div>';

        // DRS Status
        h += '<div style="background: rgba(10, 16, 28, 0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 0.85rem; margin-bottom: 1rem;">';
        h += '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">';
        h += '<div style="font-size: 0.8rem; font-weight: 700; color: #00D2FF;">📡 DRS Review Tracking</div>';
        h += '<button type="button" onclick="window.cricosMobileApp.openDrsReviewSheet()" style="background: rgba(0,210,255,0.15); border: 1px solid rgba(0,210,255,0.3); color: #00D2FF; font-size: 0.65rem; padding: 0.15rem 0.45rem; border-radius: 4px;" data-tooltip="Simulate DRS review">Launch DRS</button>';
        h += '</div>';
        h += '<div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: #cbd5e1;">';
        h += '<div>Batting: <strong style="color: #00E599;">' + this.drsState.battingReviewsLeft + ' Left</strong></div>';
        h += '<div>Bowling: <strong style="color: #00E599;">' + this.drsState.bowlingReviewsLeft + ' Left</strong></div>';
        h += '</div></div>';

        // Incident Log
        h += '<div style="font-size: 0.85rem; font-weight: 700; margin-bottom: 0.5rem;">Logged Incidents</div>';
        h += '<div style="display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1rem;">';
        for (var i = 0; i < this.incidents.length; i++) {
          var inc = this.incidents[i];
          h += '<div style="background: rgba(10, 16, 28, 0.8); border: 1px solid rgba(255, 51, 102, 0.2); border-radius: 8px; padding: 0.6rem 0.75rem;">';
          h += '<div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 700;">';
          h += '<span>' + inc.player + '</span>';
          h += '<span style="color: #ff3366;">' + inc.severity + '</span>';
          h += '</div>';
          h += '<div style="font-size: 0.7rem; color: #94a3b8; margin-top: 0.2rem;">' + inc.description + '</div>';
          h += '</div>';
        }
        h += '</div>';

        // Umpire Action Buttons
        h += '<div style="display: flex; flex-direction: column; gap: 0.5rem;">';
        h += '<button type="button" onclick="window.cricosMobileApp.fileIncidentAction()" style="width: 100%; padding: 0.65rem; border-radius: 6px; border: 1px solid rgba(255, 51, 102, 0.4); background: rgba(255, 51, 102, 0.15); color: #ff3366; font-weight: 700; font-size: 0.8rem;" data-tooltip="Log Code of Conduct breach">🚨 Report Conduct Breach</button>';
        h += '<button type="button" onclick="window.cricosMobileApp.awardPenaltyRuns(5)" style="width: 100%; padding: 0.65rem; border-radius: 6px; border: 1px solid rgba(255, 184, 0, 0.4); background: rgba(255, 184, 0, 0.15); color: #ffb800; font-weight: 700; font-size: 0.8rem;" data-tooltip="Award 5 penalty runs under MCC Law 41/42">+5 Penalty Runs (Law 41/42)</button>';
        h += '<button type="button" onclick="window.cricosMobileApp.signOffMatchAction()" style="width: 100%; padding: 0.65rem; border-radius: 6px; border: none; background: linear-gradient(135deg, #00E599, #00D2FF); color: #04070D; font-weight: 700; font-size: 0.8rem;" data-tooltip="Official match certification under MCC Laws">✓ Official Match Sign-off</button>';
        h += '</div></div>';
        return h;
      }

      renderAdmin() {
        var h = '<div style="padding: 1rem;">';
        h += '<div style="background: rgba(10, 16, 28, 0.9); border: 1px solid rgba(0, 210, 255, 0.3); border-radius: 14px; padding: 1.25rem; margin-bottom: 1rem;">';
        h += '<div style="font-size: 0.7rem; font-weight: 700; color: #00D2FF; text-transform: uppercase;">Governance & Ledger</div>';
        h += '<h2 style="margin: 0.25rem 0 0; font-size: 1.25rem; font-family: Space Grotesk, sans-serif;">Platform Admin Desk</h2>';
        h += '<div style="font-size: 0.75rem; color: #94a3b8; margin-top: 0.2rem;">Double-Entry Ledger Integrity & Disputes</div>';
        h += '</div>';

        // Cluster Operational Pulse
        h += '<div style="background: rgba(10, 16, 28, 0.8); border: 1px solid rgba(0, 229, 153, 0.25); border-radius: 12px; padding: 0.85rem; margin-bottom: 1rem;">';
        h += '<div style="font-size: 0.78rem; font-weight: 700; color: #00E599; margin-bottom: 0.4rem;">⚡ Cluster Operational Pulse</div>';
        h += '<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.3rem; text-align: center;">';
        h += '<div style="background: rgba(0,0,0,0.4); padding: 0.35rem; border-radius: 4px;"><div style="font-size: 0.58rem; color: #94a3b8;">Fastify API</div><div style="font-weight: 800; font-size: 0.75rem; color: #00E599;">99.98%</div></div>';
        h += '<div style="background: rgba(0,0,0,0.4); padding: 0.35rem; border-radius: 4px;"><div style="font-size: 0.58rem; color: #94a3b8;">GiST Pool</div><div style="font-weight: 800; font-size: 0.75rem; color: #00D2FF;">12 Active</div></div>';
        h += '<div style="background: rgba(0,0,0,0.4); padding: 0.35rem; border-radius: 4px;"><div style="font-size: 0.58rem; color: #94a3b8;">Redis Latency</div><div style="font-weight: 800; font-size: 0.75rem; color: #FFB800;">0.8ms</div></div>';
        h += '<div style="background: rgba(0,0,0,0.4); padding: 0.35rem; border-radius: 4px;"><div style="font-size: 0.58rem; color: #94a3b8;">WS Clients</div><div style="font-weight: 800; font-size: 0.75rem; color: #c084fc;">1,429</div></div>';
        h += '</div></div>';

        // 5-Account Balance Sheet
        h += '<div style="background: rgba(10, 16, 28, 0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 0.85rem; margin-bottom: 1rem;">';
        h += '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">';
        h += '<div style="font-size: 0.8rem; font-weight: 700;">5-Account Chart of Accounts</div>';
        h += '<span style="color: #00E599; font-size: 0.7rem; font-weight: 700;">✓ Balanced (₹0.00 Imbalance)</span>';
        h += '</div>';
        var accounts = [
          ['ESCROW_HOLD', '₹24,500.00'],
          ['PLATFORM_FEES', '₹1,225.00'],
          ['GST_PAYABLE', '₹220.50'],
          ['MERCHANT_PAYABLE', '₹23,054.50'],
          ['REFUND_CLEARING', '₹0.00']
        ];
        for (var a = 0; a < accounts.length; a++) {
          h += '<div style="display: flex; justify-content: space-between; font-size: 0.7rem; padding: 0.25rem 0; border-bottom: 1px solid rgba(255,255,255,0.04);">';
          h += '<span style="color: #94a3b8;">' + accounts[a][0] + '</span>';
          h += '<strong style="font-family: Chakra Petch, monospace; color: #f8fafc;">' + accounts[a][1] + '</strong>';
          h += '</div>';
        }
        h += '</div>';

        // Dispute Queue
        h += '<div style="font-size: 0.85rem; font-weight: 700; margin-bottom: 0.5rem;">Dispute Arbitration Queue</div>';
        h += '<div style="display: flex; flex-direction: column; gap: 0.5rem;">';
        for (var d = 0; d < this.disputes.length; d++) {
          var disp = this.disputes[d];
          h += '<div style="background: rgba(10, 16, 28, 0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 0.75rem;">';
          h += '<div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 700;">';
          h += '<span>' + disp.id + ' (' + disp.matchId + ')</span>';
          h += '<span style="color: #00E599;">' + disp.amount + '</span>';
          h += '</div>';
          h += '<div style="font-size: 0.7rem; color: #94a3b8; margin: 0.3rem 0;">' + disp.reason + '</div>';
          if (disp.status === 'PENDING') {
            h += '<div style="display: flex; gap: 0.4rem; margin-top: 0.5rem;">';
            h += '<button type="button" onclick="window.cricosMobileApp.approveDispute(' + d + ')" style="flex: 1; padding: 0.4rem; border-radius: 6px; border: none; background: #00E599; color: #04070D; font-weight: 700; font-size: 0.7rem;" data-tooltip="Approve refund with balanced double-entry journal">Approve Refund ✓</button>';
            h += '<button type="button" onclick="window.cricosMobileApp.rejectDispute(' + d + ')" style="flex: 1; padding: 0.4rem; border-radius: 6px; border: 1px solid rgba(255, 51, 102, 0.4); background: rgba(255, 51, 102, 0.1); color: #ff3366; font-weight: 600; font-size: 0.7rem;" data-tooltip="Reject dispute and release escrow">Reject ✕</button>';
            h += '</div>';
          } else {
            h += '<div style="font-size: 0.7rem; font-weight: 700; color: ' + (disp.status === 'REFUNDED' ? '#00E599' : '#ff3366') + '; margin-top: 0.4rem;">Status: ' + disp.status + '</div>';
          }
          h += '</div>';
        }
        h += '</div></div>';
        return h;
      }

      renderProfile() {
        var avg = (this.profile.batting.runs / (this.profile.batting.innings - this.profile.batting.notOuts)).toFixed(2);
        var sr = ((this.profile.batting.runs / this.profile.batting.ballsFaced) * 100).toFixed(1);

        var h = '<div style="padding: 1rem;">';

        // 8-Persona Switcher Strip
        h += '<div style="background: rgba(10, 16, 28, 0.9); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 0.85rem; margin-bottom: 1rem;">';
        h += '<div style="font-size: 0.7rem; font-weight: 700; color: #00E599; margin-bottom: 0.4rem;">🔄 Switch Persona Journey</div>';
        h += '<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.3rem;">';
        var allRoles = [
          ['CAPTAIN', '🏏 Cpt'],
          ['PLAYER', '👤 Ply'],
          ['SCORER', '⚡ Scr'],
          ['FAN', '🎪 Fan'],
          ['UMPIRE', '⚖️ Ump'],
          ['ORGANISER', '🏆 Org'],
          ['TURF_PROVIDER', '🏟️ Trf'],
          ['ADMIN', '🛡️ Adm']
        ];
        for (var r = 0; r < allRoles.length; r++) {
          var roleItem = allRoles[r];
          var isAct = this.profile.persona === roleItem[0];
          var st = isAct ? 'background: rgba(0, 229, 153, 0.25); border: 1px solid #00E599; color: #00E599; font-weight: 700;' : 'background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); color: #94a3b8;';
          h += '<button type="button" onclick="window.cricosMobileApp.switchUserPersona(this.dataset.persona)" data-persona="' + roleItem[0] + '" style="padding: 0.4rem 0.2rem; border-radius: 6px; font-size: 0.65rem; cursor: pointer; ' + st + '" data-tooltip="Switch persona to ' + roleItem[1] + '">' + roleItem[1] + '</button>';
        }
        h += '</div></div>';

        // Profile Identity Card
        h += '<div style="background: rgba(10, 16, 28, 0.9); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 1.25rem; margin-bottom: 1rem;">';
        h += '<div style="display: flex; align-items: center; gap: 0.85rem;">';
        h += '<div style="width: 50px; height: 50px; border-radius: 50%; background: rgba(0, 229, 153, 0.15); border: 2px solid #00E599; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; font-weight: 800; color: #00E599; font-family: Chakra Petch, monospace;">#' + this.profile.jerseyNumber + '</div>';
        h += '<div>';
        h += '<div style="font-size: 1.15rem; font-weight: 700;">' + this.profile.name + '</div>';
        h += '<div style="font-size: 0.75rem; color: #94a3b8;"><span style="color: #00E599; font-weight: 600;">' + this.profile.persona + '</span> • ' + this.profile.role + ' • ' + this.profile.teamName + '</div>';
        h += '</div></div></div>';

        // 21st.dev Athletic KPI & Career Stats Card (Player Profile Experience)
        h += this.renderAthleticCard(this.selectedPlayerId || 'p1');

        // Career Figures
        h += '<div style="font-size: 0.85rem; font-weight: 700; margin-bottom: 0.4rem;">🏏 Career Batting Figures</div>';
        h += '<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.4rem; margin-bottom: 1rem;">';
        h += '<div style="background: rgba(10, 16, 28, 0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 0.65rem; text-align: center;" data-tooltip="Total Career Runs"><div style="font-size: 1.1rem; font-weight: 800; color: #00E599; font-family: Chakra Petch, monospace;">' + this.profile.batting.runs + '</div><div style="font-size: 0.65rem; color: #94a3b8;">Runs</div></div>';
        h += '<div style="background: rgba(10, 16, 28, 0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 0.65rem; text-align: center;" data-tooltip="Batting Average"><div style="font-size: 1.1rem; font-weight: 800; font-family: Chakra Petch, monospace;">' + avg + '</div><div style="font-size: 0.65rem; color: #94a3b8;">Average</div></div>';
        h += '<div style="background: rgba(10, 16, 28, 0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 0.65rem; text-align: center;" data-tooltip="Batting Strike Rate"><div style="font-size: 1.1rem; font-weight: 800; color: #00D2FF; font-family: Chakra Petch, monospace;">' + sr + '</div><div style="font-size: 0.65rem; color: #94a3b8;">Strike Rate</div></div>';
        h += '</div>';

        // Compliance & App Store Safety
        h += '<div style="background: rgba(10, 16, 28, 0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 0.85rem;">';
        h += '<div style="font-size: 0.8rem; font-weight: 700; margin-bottom: 0.6rem;">Account & Compliance</div>';
        h += '<button type="button" onclick="window.cricosMobileApp.signOutAction()" style="width: 100%; padding: 0.6rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.15); background: transparent; color: #f8fafc; font-weight: 600; font-size: 0.75rem; margin-bottom: 0.5rem; cursor: pointer;" data-tooltip="Clear JWT authentication session">🚪 Sign Out</button>';
        h += '<button type="button" onclick="window.cricosMobileApp.promptDeleteAccount()" style="width: 100%; padding: 0.6rem; border-radius: 6px; border: 1px solid rgba(255, 51, 102, 0.3); background: rgba(255, 51, 102, 0.1); color: #ff6688; font-weight: 600; font-size: 0.75rem; cursor: pointer;" data-tooltip="Apple App Store Guideline 5.1.1(v) mandatory account deletion">🗑️ Delete Account & Data (App Store 5.1.1v)</button>';
        h += '</div></div>';
        return h;
      }

      render() {
        var root = document.getElementById('mobile-app-root');
        if (!root) return;

        var existingScroll = document.getElementById('mobileScrollBody');
        var prevScrollTop = (!this._screenChanged && existingScroll) ? existingScroll.scrollTop : 0;
        this._screenChanged = false;

        var session = this.client.getSession();
        var isAuth = !!session;

        var content = '';
        if (this.currentScreen === 'AUTH') {
          content = this.renderAuth();
        } else if (this.currentScreen === 'MATCHES') {
          content = this.renderMatches();
        } else if (this.currentScreen === 'TEAMS') {
          content = this.renderTeams();
        } else if (this.currentScreen === 'TOURNAMENTS') {
          content = this.renderTournaments();
        } else if (this.currentScreen === 'MARKETPLACE') {
          content = this.renderMarketplace();
        } else if (this.currentScreen === 'INCIDENTS') {
          content = this.renderIncidents();
        } else if (this.currentScreen === 'ADMIN') {
          content = this.renderAdmin();
        } else if (this.currentScreen === 'PROFILE') {
          content = this.renderProfile();
        }

        var h = '';
        // Fixed Top Header Inside Viewport (Locked at top, never scrolls)
        h += '<header class="mobile-header">';
        h += '<div style="display: flex; align-items: center; gap: 0.4rem;">';
        h += '<span style="font-size: 1.1rem;">🏏</span>';
        h += '<span style="font-family: Space Grotesk, sans-serif; font-weight: 800; font-size: 1rem; color: #f8fafc;">CricOS</span>';
        h += '</div>';
        h += '<div style="display: flex; align-items: center; gap: 0.4rem;">';
        h += '<button type="button" id="btnMobileSoundToggle" onclick="window.cricosMobileApp.toggleSound()" style="background: rgba(255,255,255,0.06); color: ' + (this.soundEnabled ? '#00E599' : '#64748b') + '; border: 1px solid rgba(255,255,255,0.12); padding: 0.2rem 0.45rem; border-radius: 6px; font-size: 0.75rem; cursor: pointer;" data-tooltip="Toggle Web Audio synthesized sound FX">' + (this.soundEnabled ? '🔊' : '🔇') + '</button>';
        h += '<button type="button" id="btnMobilePersonaSwitch" onclick="window.cricosMobileApp.openPersonaSheet()" style="background: rgba(0, 229, 153, 0.15); color: #00E599; border: 1px solid rgba(0, 229, 153, 0.3); padding: 0.15rem 0.45rem; border-radius: 4px; font-size: 0.65rem; font-weight: 700; cursor: pointer;" data-tooltip="Switch persona sheet">' + this.profile.persona + ' ▾</button>';
        h += '</div></header>';

        // Dedicated Toast Container
        h += '<div class="mobile-toast-container" id="mobileToastContainer"></div>';

        // Dedicated Scrollable Content Container (Only this element scrolls with momentum touch)
        h += '<main class="mobile-scroll-body" id="mobileScrollBody">' + content + '</main>';

        // Fixed Bottom Navigation Bar tailored to Persona (Permanently pinned at bottom, never scrolls)
        h += '<nav class="mobile-bottom-nav" id="mobileBottomNav">';

        var navItems = [];
        var persona = this.profile.persona;
        if (persona === 'CAPTAIN' || persona === 'PLAYER') {
          navItems.push(['MATCHES', '🏏', 'Match']);
          navItems.push(['TEAMS', '👥', 'Squad']);
          navItems.push(['TOURNAMENTS', '🏆', 'Standings']);
          navItems.push(['MARKETPLACE', '🛒', 'Turf']);
          navItems.push(['PROFILE', '👤', 'Profile']);
        } else if (persona === 'SCORER') {
          navItems.push(['MATCHES', '⚡', 'Scoring']);
          navItems.push(['TOURNAMENTS', '🏆', 'Standings']);
          navItems.push(['PROFILE', '👤', 'Profile']);
        } else if (persona === 'FAN') {
          navItems.push(['MATCHES', '🎪', 'Pulse']);
          navItems.push(['TOURNAMENTS', '🏆', 'Standings']);
          navItems.push(['MARKETPLACE', '🛒', 'Venues']);
          navItems.push(['PROFILE', '👤', 'Profile']);
        } else if (persona === 'UMPIRE') {
          navItems.push(['INCIDENTS', '⚖️', 'Umpire']);
          navItems.push(['MATCHES', '🏏', 'Match']);
          navItems.push(['TOURNAMENTS', '🏆', 'Standings']);
          navItems.push(['PROFILE', '👤', 'Profile']);
        } else if (persona === 'ORGANISER') {
          navItems.push(['TOURNAMENTS', '🏆', 'Fixtures']);
          navItems.push(['MARKETPLACE', '🧺', 'Basket']);
          navItems.push(['TEAMS', '👥', 'Teams']);
          navItems.push(['MATCHES', '🏏', 'Match']);
          navItems.push(['PROFILE', '👤', 'Profile']);
        } else if (persona === 'TURF_PROVIDER') {
          navItems.push(['MARKETPLACE', '🏟️', 'Storefront']);
          navItems.push(['INCIDENTS', '⚖️', 'Disputes']);
          navItems.push(['MATCHES', '🏏', 'Live']);
          navItems.push(['PROFILE', '👤', 'Profile']);
        } else {
          // ADMIN
          navItems.push(['ADMIN', '⚡', 'Audit']);
          navItems.push(['MATCHES', '🏏', 'Match']);
          navItems.push(['TEAMS', '👥', 'Teams']);
          navItems.push(['INCIDENTS', '⚖️', 'Incidents']);
          navItems.push(['PROFILE', '👤', 'Profile']);
        }

        if (!isAuth) {
          navItems.push(['AUTH', '🔑', 'Sign In']);
        }

        for (var i = 0; i < navItems.length; i++) {
          var item = navItems[i];
          var active = this.currentScreen === item[0];
          var color = active ? '#00E599' : '#94a3b8';
          h += '<button type="button" onclick="window.cricosMobileApp.navigateTo(this.dataset.screen)" data-screen="' + item[0] + '" style="background: none; border: none; color: ' + color + '; font-size: 0.65rem; font-weight: 600; display: flex; flex-direction: column; align-items: center; gap: 0.2rem; cursor: pointer;" data-tooltip="Navigate to ' + item[2] + '">';
          h += '<span style="font-size: 1rem;">' + item[1] + '</span>';
          h += '<span>' + item[2] + '</span>';
          h += '</button>';
        }
        h += '</nav>';

        // Persona Sheet Modal & Backdrop
        var isPersonaActive = this.personaSheetOpen ? 'active' : '';
        h += '<div class="mobile-sheet-backdrop ' + isPersonaActive + '" id="mobileSheetBackdrop" onclick="window.cricosMobileApp.closePersonaSheet()"></div>';
        h += '<div class="mobile-persona-sheet ' + isPersonaActive + '" id="mobilePersonaSheet">';
        h += '<div class="sheet-drag-handle"></div>';
        h += '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">';
        h += '<div style="font-size: 0.95rem; font-weight: 800; font-family: Space Grotesk, sans-serif; color: #f8fafc;">Switch Persona Experience</div>';
        h += '<button type="button" onclick="window.cricosMobileApp.closePersonaSheet()" style="background: none; border: none; color: #94a3b8; font-size: 1.1rem; cursor: pointer;" data-tooltip="Close persona switcher">&times;</button>';
        h += '</div>';
        h += '<div style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.75rem;">Select any of the 8 dedicated personas to preview their unique workflow.</div>';
        h += '<div class="persona-grid-picker">';
        var personaOptions = [
          ['CAPTAIN', '🏏 Captain', 'Squad selection & toss'],
          ['PLAYER', '👤 Player', 'Player KPIs & career stats'],
          ['SCORER', '⚡ Scorer', 'Over-by-over ball input'],
          ['FAN', '🎪 Fan Pulse', 'Live cheers & win polls'],
          ['UMPIRE', '⚖️ Umpire', 'MCC code & incident log'],
          ['ORGANISER', '🏆 Director', 'Tournaments & schedules'],
          ['TURF_PROVIDER', '🏟️ Turf Host', 'Slot management & fees'],
          ['ADMIN', '🛡️ Admin Desk', 'Dispute ledger & audit']
        ];
        for (var pIdx = 0; pIdx < personaOptions.length; pIdx++) {
          var pOpt = personaOptions[pIdx];
          var isCur = this.profile.persona === pOpt[0];
          h += '<div class="persona-picker-card ' + (isCur ? 'active' : '') + '" onclick="window.cricosMobileApp.switchUserPersona(this.dataset.personaChoice)" data-persona-choice="' + pOpt[0] + '">';
          h += '<div style="font-weight: 700; font-size: 0.8rem; color: ' + (isCur ? '#00E599' : '#f8fafc') + ';">' + pOpt[1] + '</div>';
          h += '<div style="font-size: 0.65rem; color: #94a3b8; margin-top: 0.2rem;">' + pOpt[2] + '</div>';
          h += '</div>';
        }
        h += '</div></div>';

        // Generic In-App Action Sheet Modal
        if (this.activeActionSheet) {
          var cfg = this.activeActionSheet;
          h += '<div class="mobile-sheet-backdrop active" id="actionSheetBackdrop" onclick="window.cricosMobileApp.closeActionSheet()"></div>';
          h += '<div class="mobile-action-sheet active" id="actionSheetModal">';
          h += '<div class="sheet-drag-handle"></div>';
          h += '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">';
          h += '<div style="font-size: 0.95rem; font-weight: 800; font-family: Space Grotesk, sans-serif; color: #f8fafc;">' + cfg.title + '</div>';
          h += '<button type="button" onclick="window.cricosMobileApp.closeActionSheet()" style="background: none; border: none; color: #94a3b8; font-size: 1.2rem; cursor: pointer;" data-tooltip="Dismiss sheet">&times;</button>';
          h += '</div>';
          h += '<div style="margin-bottom: 1rem;">' + (cfg.bodyHtml || '') + '</div>';
          h += '<div style="display: flex; gap: 0.5rem;">';
          h += '<button type="button" onclick="window.cricosMobileApp.closeActionSheet()" style="flex: 1; padding: 0.65rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); background: transparent; color: #f8fafc; font-weight: 600; font-size: 0.8rem;" data-tooltip="Cancel action">Cancel</button>';
          h += '<button type="button" id="btnActionSheetConfirm" style="flex: 2; padding: 0.65rem; border-radius: 8px; border: none; font-weight: 700; font-size: 0.85rem; ' + (cfg.confirmStyle || 'background: linear-gradient(135deg, #00E599, #00D2FF); color: #04070D;') + '" data-tooltip="Confirm sheet action">' + (cfg.confirmText || 'Confirm ✓') + '</button>';
          h += '</div></div>';
        }

        // Extras Runs Picker Sheet (slides in from bottom when Wide, No Ball, Leg Bye, or Bye is chosen)
        if (this.extraPickerOpen) {
          h += this.renderExtraRunsPickerSheet();
        }

        // Wagon Wheel Shot Direction Picker Sheet (slides in from bottom when pad number is chosen)
        if (this.wagonPickerOpen) {
          h += this.renderWagonPickerSheet();
        }

        root.innerHTML = h;

        if (this.activeActionSheet && typeof this.activeActionSheet.onConfirm === 'function') {
          var confirmBtn = document.getElementById('btnActionSheetConfirm');
          if (confirmBtn) {
            confirmBtn.onclick = this.activeActionSheet.onConfirm;
          }
        }

        this.renderToasts();
        this.bindHoldToReset();

        var newScroll = document.getElementById('mobileScrollBody');
        if (newScroll && prevScrollTop > 0) {
          newScroll.scrollTop = prevScrollTop;
        }
      }
    }

    const app = new StandaloneMobileApp();
    window.cricosMobileApp = app;
    app.render();

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && window.cricosMobileApp) {
        if (window.cricosMobileApp.extraPickerOpen) {
          window.cricosMobileApp.closeExtraRunsPickerSheet();
        } else if (window.cricosMobileApp.wagonPickerOpen) {
          window.cricosMobileApp.closeWagonPickerSheet();
        } else if (window.cricosMobileApp.activeActionSheet) {
          window.cricosMobileApp.closeActionSheet();
        } else if (window.cricosMobileApp.personaSheetOpen) {
          window.cricosMobileApp.closePersonaSheet();
        }
      }
    });
  </script>
</body>
</html>
`;
}
