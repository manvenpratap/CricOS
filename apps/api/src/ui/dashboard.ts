export function getDashboardHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CricOS — Unified Cricket Operating System & Interactive Console</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-dark: #04070D;
      --bg-card: rgba(10, 16, 28, 0.82);
      --bg-card-solid: #0A101C;
      --border-subtle: rgba(255, 255, 255, 0.08);
      --border-accent: rgba(0, 229, 153, 0.35);
      --text-main: #F8FAFC;
      --text-muted: #94A3B8;
      --turf-emerald: #00E599;
      --turf-glow: rgba(0, 229, 153, 0.35);
      --primary: #00E599;
      --primary-glow: rgba(0, 229, 153, 0.30);
      --amber: #FFB800;
      --cyan: #00D2FF;
      --cyan-glow: rgba(0, 210, 255, 0.25);
      --rose: #FF3366;
      --purple: #A855F7;
      --font-display: 'Space Grotesk', -apple-system, sans-serif;
      --font-body: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      --font-score: 'Chakra Petch', monospace;
      --font-mono: 'JetBrains Mono', monospace;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg-dark);
      background-image: 
        radial-gradient(1100px circle at 50% -12%, rgba(0, 229, 153, 0.15) 0%, transparent 60%),
        radial-gradient(850px circle at 90% 25%, rgba(0, 210, 255, 0.09) 0%, transparent 50%),
        radial-gradient(750px circle at 10% 75%, rgba(168, 85, 247, 0.07) 0%, transparent 50%);
      color: var(--text-main);
      font-family: var(--font-body);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    /* Top Navigation Header */
    header {
      background: rgba(9, 13, 22, 0.85);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border-subtle);
      padding: 0.85rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .brand-logo {
      font-size: 1.6rem;
      background: linear-gradient(135deg, var(--turf-emerald), var(--cyan));
      width: 42px;
      height: 42px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      box-shadow: 0 0 20px var(--turf-glow);
    }

    .brand-title {
      font-family: var(--font-display);
      font-weight: 800;
      font-size: 1.35rem;
      letter-spacing: -0.03em;
      background: linear-gradient(135deg, #FFFFFF 40%, var(--turf-emerald) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .brand-subtitle {
      font-size: 0.72rem;
      color: var(--text-muted);
      letter-spacing: 0.06em;
      text-transform: uppercase;
      font-family: var(--font-body);
    }

    .header-status {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .header-nav-links {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .nav-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-subtle);
      padding: 0.35rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--text-muted);
      text-decoration: none;
      transition: all 0.2s ease;
      cursor: pointer;
    }

    .nav-pill:hover {
      background: rgba(16, 185, 129, 0.15);
      border-color: var(--border-accent);
      color: var(--primary);
      transform: translateY(-1px);
    }

    .status-pill {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid var(--border-accent);
      padding: 0.4rem 0.85rem;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--primary);
    }

    .pulse-dot {
      width: 8px;
      height: 8px;
      background: var(--primary);
      border-radius: 50%;
      box-shadow: 0 0 8px var(--primary);
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }

    /* Tab Navigation */
    .tabs-bar {
      display: flex;
      padding: 0 2rem;
      background: rgba(13, 19, 32, 0.5);
      border-bottom: 1px solid var(--border-subtle);
      overflow-x: auto;
    }

    .tab-btn {
      background: none;
      border: none;
      padding: 1rem 1.35rem;
      font-family: var(--font-display);
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--text-muted);
      cursor: pointer;
      border-bottom: 2px solid transparent;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .tab-btn:hover {
      color: var(--text-main);
    }

    .tab-btn.active {
      color: var(--primary);
      border-bottom-color: var(--primary);
    }

    /* Global Stadium Telemetry Strip */
    .stadium-telemetry-bar {
      background: rgba(6, 10, 18, 0.92);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border-subtle);
      padding: 0.6rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
      font-size: 0.8rem;
    }

    .telemetry-node {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-muted);
      cursor: pointer;
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
      transition: background 0.2s;
    }

    .telemetry-node:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    .telemetry-pulse {
      width: 8px;
      height: 8px;
      background: var(--turf-emerald);
      border-radius: 50%;
      box-shadow: 0 0 8px var(--turf-emerald);
      animation: pulse 2s infinite;
    }

    .telemetry-val {
      font-family: var(--font-score);
      font-weight: 700;
      letter-spacing: 0.02em;
      color: var(--text-main);
    }

    /* Target Equation & Chase Progress */
    .target-equation-bar {
      width: 100%;
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid var(--border-subtle);
      border-radius: 10px;
      padding: 0.75rem 1.25rem;
      margin-top: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }

    .target-equation-info {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      flex-wrap: wrap;
      font-size: 0.88rem;
    }

    .target-badge {
      background: rgba(0, 229, 153, 0.15);
      border: 1px solid var(--border-accent);
      color: var(--turf-emerald);
      padding: 0.2rem 0.6rem;
      border-radius: 6px;
      font-family: var(--font-score);
      font-weight: 700;
      letter-spacing: 0.04em;
    }

    .target-divider {
      color: var(--border-subtle);
    }

    .target-progress-track {
      width: 100%;
      height: 6px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 9999px;
      overflow: hidden;
      cursor: pointer;
    }

    .target-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--turf-emerald), var(--cyan));
      border-radius: 9999px;
      box-shadow: 0 0 10px rgba(0, 229, 153, 0.5);
      transition: width 0.4s ease;
    }

    /* Fall of Wickets Timeline */
    .fow-container {
      width: 100%;
      margin-top: 1rem;
      display: flex;
      align-items: center;
      gap: 0.85rem;
      flex-wrap: wrap;
      background: rgba(0, 0, 0, 0.25);
      border: 1px solid var(--border-subtle);
      border-radius: 10px;
      padding: 0.65rem 1.25rem;
    }

    .fow-label {
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .fow-strip {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .fow-pill {
      background: rgba(255, 51, 102, 0.12);
      border: 1px solid rgba(255, 51, 102, 0.35);
      color: #FFA3BA;
      font-family: var(--font-score);
      font-size: 0.82rem;
      font-weight: 700;
      padding: 0.2rem 0.65rem;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .fow-pill:hover {
      transform: scale(1.05);
      border-color: var(--rose);
      box-shadow: 0 0 10px rgba(255, 51, 102, 0.4);
    }

    .fow-pill small {
      color: var(--text-muted);
      font-weight: normal;
      margin-left: 2px;
    }

    /* Tournament Stage Stepper */
    .stage-stepper {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: rgba(10, 16, 28, 0.6);
      border: 1px solid var(--border-subtle);
      border-radius: 12px;
      padding: 0.75rem 1.25rem;
      margin-bottom: 1.5rem;
      overflow-x: auto;
    }

    .stage-step {
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--text-muted);
      padding: 0.35rem 0.75rem;
      border-radius: 6px;
      white-space: nowrap;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      border: 1px solid transparent;
      transition: all 0.2s;
    }

    .stage-step.completed {
      color: var(--turf-emerald);
      background: rgba(0, 229, 153, 0.1);
      border-color: rgba(0, 229, 153, 0.3);
    }

    .stage-step.active {
      color: var(--cyan);
      background: rgba(0, 210, 255, 0.12);
      border-color: rgba(0, 210, 255, 0.4);
      font-weight: 700;
      box-shadow: 0 0 12px rgba(0, 210, 255, 0.2);
    }

    /* Slot Reservation Matrix */
    .slot-matrix {
      display: flex;
      gap: 0.4rem;
      margin-top: 0.5rem;
      flex-wrap: wrap;
    }

    .slot-chip {
      font-size: 0.72rem;
      font-family: var(--font-score);
      font-weight: 600;
      padding: 0.2rem 0.55rem;
      border-radius: 4px;
      border: 1px solid var(--border-subtle);
      cursor: pointer;
      transition: all 0.2s;
    }

    .slot-chip.available {
      background: rgba(0, 229, 153, 0.08);
      border-color: rgba(0, 229, 153, 0.3);
      color: var(--turf-emerald);
    }

    .slot-chip.available:hover {
      background: rgba(0, 229, 153, 0.2);
      transform: translateY(-1px);
    }

    .slot-chip.booked {
      background: rgba(255, 255, 255, 0.04);
      border-color: rgba(255, 255, 255, 0.08);
      color: var(--text-muted);
      cursor: not-allowed;
      text-decoration: line-through;
    }

    .slot-chip.selected {
      background: var(--cyan);
      color: #04070D;
      border-color: var(--cyan);
      font-weight: 700;
      box-shadow: 0 0 10px rgba(0, 210, 255, 0.4);
    }

    /* Main Container */
    main {
      flex: 1;
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
      width: 100%;
    }

    .tab-pane {
      display: none;
      animation: fadeIn 0.3s ease;
    }

    .tab-pane.active {
      display: block;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Grid Layouts */
    .grid-2 {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
      gap: 1.5rem;
    }

    .grid-3 {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 1.25rem;
    }

    /* Glass Cards */
    .card {
      background: var(--bg-card);
      backdrop-filter: blur(16px);
      border: 1px solid var(--border-subtle);
      border-radius: 14px;
      padding: 1.5rem;
      position: relative;
      overflow: hidden;
      box-shadow: 0 16px 40px -10px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.12);
    }

    .card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(0, 229, 153, 0.4), transparent);
    }

    .card-title {
      font-family: var(--font-display);
      font-size: 1.18rem;
      font-weight: 700;
      letter-spacing: -0.01em;
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .card-desc {
      font-size: 0.85rem;
      color: var(--text-muted);
      margin-bottom: 1.25rem;
    }

    /* Scoreboard Banner */
    .scoreboard {
      background: linear-gradient(135deg, rgba(0, 229, 153, 0.12), rgba(0, 210, 255, 0.07));
      border: 1px solid rgba(0, 229, 153, 0.35);
      border-radius: 16px;
      padding: 1.75rem;
      margin-bottom: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1.5rem;
      box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15);
    }

    .match-info h2 {
      font-family: var(--font-display);
      font-size: 1.45rem;
      font-weight: 800;
      letter-spacing: -0.02em;
    }

    .match-meta {
      font-size: 0.85rem;
      color: var(--text-muted);
      margin-top: 0.25rem;
    }

    .score-display {
      display: flex;
      align-items: baseline;
      gap: 0.75rem;
    }

    .main-score {
      font-family: var(--font-score);
      font-size: 3.5rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: var(--turf-emerald);
      text-shadow: 0 0 25px rgba(0, 229, 153, 0.55), 0 0 50px rgba(0, 229, 153, 0.25);
    }

    .overs-score {
      font-family: var(--font-score);
      font-size: 1.5rem;
      color: var(--cyan);
      font-weight: 700;
      letter-spacing: 0.02em;
      text-shadow: 0 0 15px rgba(0, 210, 255, 0.4);
    }

    .rate-badge {
      background: rgba(255, 255, 255, 0.08);
      padding: 0.35rem 0.75rem;
      border-radius: 6px;
      font-size: 0.82rem;
      font-family: var(--font-score);
      font-weight: 600;
      color: var(--text-muted);
    }

    .sse-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(6, 182, 212, 0.12);
      border: 1px solid rgba(6, 182, 212, 0.4);
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      font-size: 0.8rem;
      color: var(--cyan);
      font-weight: 500;
    }

    .over-strip-container {
      margin-top: 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
      background: rgba(0, 0, 0, 0.35);
      border: 1px solid var(--border-subtle);
      border-radius: 12px;
      padding: 0.75rem 1.25rem;
      width: 100%;
    }

    .over-strip-label {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .ball-strip {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .ball-bubble {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-score);
      font-weight: 700;
      font-size: 0.9rem;
      background: rgba(255, 255, 255, 0.06);
      color: var(--text-main);
      border: 1px solid var(--border-subtle);
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      animation: popBall 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .ball-bubble:hover {
      transform: scale(1.15);
    }

    @keyframes popBall {
      0% { transform: scale(0.5); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }

    .ball-bubble.dot { color: var(--text-muted); }
    .ball-bubble.single { color: var(--text-main); background: rgba(255, 255, 255, 0.1); }
    .ball-bubble.four { background: rgba(0, 229, 153, 0.25); color: var(--turf-emerald); border-color: var(--turf-emerald); box-shadow: 0 0 12px rgba(0, 229, 153, 0.4); }
    .ball-bubble.six { background: rgba(168, 85, 247, 0.25); color: #C084FC; border-color: #A855F7; box-shadow: 0 0 12px rgba(168, 85, 247, 0.4); }
    .ball-bubble.wicket { background: rgba(255, 51, 102, 0.3); color: #FF3366; border-color: #FF3366; box-shadow: 0 0 14px rgba(255, 51, 102, 0.5); }
    .ball-bubble.extra { background: rgba(255, 184, 0, 0.25); color: #FFB800; border-color: #FFB800; box-shadow: 0 0 12px rgba(255, 184, 0, 0.4); }

    .live-match-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-top: 1rem;
      width: 100%;
    }

    .stat-mini-card {
      background: rgba(0, 0, 0, 0.25);
      border: 1px solid var(--border-subtle);
      border-radius: 10px;
      padding: 0.85rem;
    }

    .stat-mini-title {
      font-size: 0.75rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.35rem;
      display: flex;
      justify-content: space-between;
    }

    .stat-player-name {
      font-size: 0.95rem;
      font-weight: 600;
      color: #FFF;
    }

    .stat-player-figures {
      font-size: 1.25rem;
      font-weight: 700;
      font-family: var(--font-score);
      margin-top: 0.25rem;
    }

    /* Scoring Controls Pad */
    .pad-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.75rem;
      margin-top: 1rem;
    }

    .pad-btn {
      background: var(--bg-card-solid);
      border: 1px solid var(--border-subtle);
      border-radius: 10px;
      color: var(--text-main);
      font-family: var(--font-score);
      font-size: 1.35rem;
      font-weight: 700;
      padding: 0.9rem 0;
      cursor: pointer;
      transition: all 0.15s ease;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
    }

    .pad-btn span {
      font-family: var(--font-body);
      font-size: 0.72rem;
      font-weight: 500;
      letter-spacing: 0.04em;
      margin-top: 2px;
      text-transform: uppercase;
    }

    .pad-btn:hover {
      transform: translateY(-2px);
      border-color: rgba(255, 255, 255, 0.25);
    }

    .pad-btn:active {
      transform: scale(0.96);
    }

    .pad-btn.boundary-4 {
      background: rgba(0, 229, 153, 0.18);
      border-color: rgba(0, 229, 153, 0.45);
      color: var(--turf-emerald);
      box-shadow: 0 0 10px rgba(0, 229, 153, 0.2);
    }

    .pad-btn.boundary-6 {
      background: rgba(168, 85, 247, 0.2);
      border-color: rgba(168, 85, 247, 0.45);
      color: #C084FC;
      box-shadow: 0 0 10px rgba(168, 85, 247, 0.25);
    }

    .pad-btn.wicket {
      background: rgba(244, 63, 94, 0.15);
      border-color: rgba(244, 63, 94, 0.4);
      color: var(--rose);
    }

    .pad-btn.extra {
      background: rgba(245, 158, 11, 0.15);
      border-color: rgba(245, 158, 11, 0.4);
      color: var(--amber);
    }

    /* Feed List */
    .feed-container {
      max-height: 280px;
      overflow-y: auto;
      border: 1px solid var(--border-subtle);
      border-radius: 8px;
      background: rgba(0, 0, 0, 0.25);
      padding: 0.5rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.85rem;
    }

    .feed-item {
      padding: 0.5rem 0.75rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .feed-item:last-child {
      border-bottom: none;
    }

    /* Forms & Inputs */
    .form-group {
      margin-bottom: 1rem;
    }

    label {
      display: block;
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--text-muted);
      margin-bottom: 0.35rem;
    }

    input, select, textarea {
      width: 100%;
      background: rgba(0, 0, 0, 0.35);
      border: 1px solid var(--border-subtle);
      border-radius: 8px;
      padding: 0.65rem 0.85rem;
      color: var(--text-main);
      font-family: inherit;
      font-size: 0.9rem;
      transition: border-color 0.2s;
    }

    input:focus, select:focus, textarea:focus {
      outline: none;
      border-color: var(--primary);
    }

    /* Action Buttons */
    .btn {
      background: linear-gradient(135deg, #00E599, #00D2FF);
      color: #04070D;
      border: none;
      border-radius: 9px;
      padding: 0.8rem 1.35rem;
      font-family: var(--font-display);
      font-weight: 700;
      font-size: 0.92rem;
      letter-spacing: -0.01em;
      cursor: pointer;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
      box-shadow: 0 4px 15px rgba(0, 229, 153, 0.3);
    }

    .btn:hover {
      filter: brightness(1.1);
      box-shadow: 0 6px 20px rgba(0, 229, 153, 0.45);
      transform: translateY(-1px);
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.08);
      color: var(--text-main);
      box-shadow: none;
    }

    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.14);
      box-shadow: none;
      filter: none;
    }

    /* Commercial Breakdown Drawer */
    .breakdown-table {
      width: 100%;
      margin: 1rem 0;
      font-size: 0.85rem;
    }

    .breakdown-row {
      display: flex;
      justify-content: space-between;
      padding: 0.4rem 0;
      border-bottom: 1px dashed rgba(255, 255, 255, 0.08);
    }

    .breakdown-row.total {
      font-weight: 700;
      font-size: 1.05rem;
      border-bottom: none;
      padding-top: 0.75rem;
      color: var(--primary);
    }

    /* Table styling */
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.85rem;
    }

    th, td {
      padding: 0.65rem 0.85rem;
      text-align: left;
      border-bottom: 1px solid var(--border-subtle);
    }

    th {
      font-family: 'Outfit', sans-serif;
      color: var(--text-muted);
      font-weight: 600;
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.05em;
    }

    /* Toast Notification */
    #toast {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: var(--bg-card-solid);
      border: 1px solid var(--border-accent);
      padding: 0.85rem 1.25rem;
      border-radius: 10px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      gap: 0.75rem;
      transform: translateY(100px);
      opacity: 0;
      transition: all 0.3s ease;
      z-index: 999;
      font-size: 0.9rem;
    }

    #toast.show {
      transform: translateY(0);
      opacity: 1;
    }

    /* Universal Accessible Tooltips */
    .uni-tooltip {
      position: absolute;
      z-index: 99999;
      display: none;
      max-width: 280px;
      padding: 6px 12px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 12px;
      font-weight: 500;
      line-height: 1.4;
      letter-spacing: 0.01em;
      border-radius: 6px;
      pointer-events: none;
      word-wrap: break-word;
      box-sizing: border-box;
      background: #1e293b;
      color: #f8fafc;
      border: 1px solid rgba(255, 255, 255, 0.15);
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      transition: opacity 0.15s ease-out, transform 0.15s ease-out;
    }
    [data-tooltip] {
      cursor: help;
      position: relative;
    }
    button[data-tooltip], a[data-tooltip] {
      cursor: pointer;
    }
  </style>
</head>
<body>
  <!-- Header -->
  <header>
    <div class="brand">
      <div class="brand-logo">🏏</div>
      <div>
        <div class="brand-title">CricOS</div>
        <div class="brand-subtitle">Unified Cricket Operating System</div>
      </div>
    </div>
    <div class="header-status">
      <div class="header-nav-links">
        <a href="/mobile" class="nav-pill" style="background: rgba(16, 185, 129, 0.15); border-color: rgba(16, 185, 129, 0.4); color: #34d399; font-weight: 600;" data-tooltip="Launch Standalone Consumer Mobile App (iOS & Android Preview) with OTP & Profile">📱 Mobile App</a>
        <a href="/docs" target="_blank" class="nav-pill" data-tooltip="Interactive OpenAPI 3.0 Documentation & Sandbox">📖 API Docs</a>
        <a href="/metrics" target="_blank" class="nav-pill" data-tooltip="Prometheus & OpenMetrics Standard Metrics Exposition">📊 Metrics</a>
        <a href="/health/ready" target="_blank" class="nav-pill" data-tooltip="Kubernetes Readiness Probe & Database Pool Status">🩺 Health</a>
      </div>
      <div class="status-pill" id="healthPill" data-tooltip="API Service & Live SSE Connection Status">
        <div class="pulse-dot"></div>
        <span id="healthText">Connecting...</span>
      </div>
      <div style="font-size: 0.85rem; color: var(--text-muted);" data-tooltip="Fastify HTTP Port">
        Port: <span style="color: var(--primary); font-family: monospace;">3000</span>
      </div>
    </div>
  </header>

  <!-- Navigation Tabs -->
  <div class="tabs-bar">
    <button class="tab-btn active" onclick="switchTab('scoring')" data-tooltip="Live match scoring center, strike rotation, and ball strip">🏏 Live Match Scoring</button>
    <button class="tab-btn" onclick="switchTab('marketplace')" data-tooltip="Marketplace provider booking and checkout">🛒 Marketplace & Booking</button>
    <button class="tab-btn" onclick="switchTab('tournaments')" data-tooltip="Tournament scheduling, fixtures, and Net Run Rate standings">🏆 Tournaments & Fixtures</button>
    <button class="tab-btn" onclick="switchTab('incidents')" data-tooltip="Dispute resolution, provider Bayesian trust, and circuit breaker">🛡️ Incidents & Reputation</button>
    <button class="tab-btn" onclick="switchTab('explorer')" data-tooltip="Live API endpoint runner and response inspector">⚡ Live API Explorer</button>
  </div>

  <!-- Global Stadium Telemetry Strip -->
  <div class="stadium-telemetry-bar">
    <div class="telemetry-node" data-tooltip="Live matches running across the platform with active SSE stream">
      <span class="telemetry-pulse"></span>
      <span class="telemetry-label">Active Matches:</span>
      <span class="telemetry-val" id="telemetryMatches">1 LIVE IN PROGRESS</span>
    </div>
    <div class="telemetry-node" data-tooltip="Total platform funds locked in double-entry escrow ledger">
      <span class="telemetry-icon">🔒</span>
      <span class="telemetry-label">Escrow Guarded:</span>
      <span class="telemetry-val" id="telemetryEscrow">₹500,000</span>
    </div>
    <div class="telemetry-node" data-tooltip="Automated provider circuit breaker: freezes unbooked slots if reliability drops below 65%">
      <span class="telemetry-icon">🛡️</span>
      <span class="telemetry-label">Circuit Health:</span>
      <span class="telemetry-val" style="color: var(--turf-emerald);" id="telemetryCircuit">100% NOMINAL</span>
    </div>
    <div class="telemetry-node" data-tooltip="Real-time Server-Sent Events delivery latency">
      <span class="telemetry-icon">⚡</span>
      <span class="telemetry-label">SSE Broadcast:</span>
      <span class="telemetry-val" style="color: var(--cyan);" id="telemetryLatency">&lt;10ms LATENCY</span>
    </div>
  </div>

  <main>
    <!-- TAB 1: LIVE MATCH SCORING -->
    <div id="tab-scoring" class="tab-pane active">
      <div class="scoreboard">
        <div style="width: 100%; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div class="match-info">
            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.35rem;">
              <h2>Delhi Daredevils vs Mumbai Super Strikers</h2>
              <div class="sse-badge" id="sseStatusBadge">
                <div class="pulse-dot" style="background: var(--cyan); width: 8px; height: 8px;"></div>
                <span id="sseStatusText">SSE Stream: Connecting...</span>
              </div>
            </div>
            <div class="match-meta">T20 Championship • Innings 1 • Match ID: <span id="currentMatchId" style="font-family: monospace; color: var(--cyan);">match-pilot-1</span></div>
          </div>
          <div class="score-display">
            <div class="main-score" id="scoreRunsWickets">0/0</div>
            <div class="overs-score" id="scoreOvers">(0.0 ov)</div>
            <div class="rate-badge" id="scoreRunRate">CRR: 0.00</div>
          </div>
        </div>

        <!-- Target Equation Bar -->
        <div class="target-equation-bar" id="targetEquationBar">
          <div class="target-equation-info">
            <span class="target-badge" data-tooltip="Target set in first innings">🎯 TARGET: 178</span>
            <span class="target-stat">Need <strong style="color: var(--amber);" id="targetRunsNeeded">36</strong> runs in <strong id="targetBallsLeft">20</strong> balls</span>
            <span class="target-divider">•</span>
            <span class="target-stat">Req RR: <strong style="color: var(--rose);" id="targetRRR">10.80</strong></span>
          </div>
          <div class="target-progress-track" data-tooltip="Match chase progression: 142 of 178 runs completed (79.7%)">
            <div class="target-progress-fill" id="targetProgressFill" style="width: 79.8%;"></div>
          </div>
        </div>

        <!-- Real-time Over Ball Strip -->
        <div class="over-strip-container">
          <div class="over-strip-label">Current Over Deliveries:</div>
          <div class="ball-strip" id="overBallStrip">
            <div class="ball-bubble dot">•</div>
          </div>
          <div style="font-size: 0.8rem; color: var(--text-muted);" id="overSummaryText">Waiting for over to commence...</div>
        </div>

        <!-- Live Player Stats -->
        <div class="live-match-stats">
          <div class="stat-mini-card">
            <div class="stat-mini-title"><span>Striker</span><span style="color: var(--primary);">★ On Strike</span></div>
            <div class="stat-player-name" id="strikerName">Virat K. *</div>
            <div class="stat-player-figures" id="strikerFigures">0 <span style="font-size: 0.85rem; color: var(--text-muted);">(0b) • SR: 0.0</span></div>
          </div>
          <div class="stat-mini-card">
            <div class="stat-mini-title"><span>Non-Striker</span><span>Runner</span></div>
            <div class="stat-player-name" id="nonStrikerName">Rohit S.</div>
            <div class="stat-player-figures" id="nonStrikerFigures">0 <span style="font-size: 0.85rem; color: var(--text-muted);">(0b) • SR: 0.0</span></div>
          </div>
          <div class="stat-mini-card">
            <div class="stat-mini-title"><span>Bowler</span><span style="color: var(--amber);">Current Spell</span></div>
            <div class="stat-player-name" id="bowlerName">Jasprit B.</div>
            <div class="stat-player-figures" id="bowlerFigures" style="color: var(--amber);">0-0-0-0 <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: normal;">(Econ: 0.00)</span></div>
          </div>
        </div>

        <!-- Fall of Wickets Timeline -->
        <div class="fow-container">
          <div class="fow-label">Fall of Wickets (FoW):</div>
          <div class="fow-strip" id="fowStrip">
            <span class="fow-pill" data-tooltip="Wicket 1: Rohit S. caught at mid-on off Bumrah">1/1 <small>(0.2 ov)</small></span>
            <span class="fow-pill" data-tooltip="Wicket 2: S. Gill bowled off Shami">45/2 <small>(5.4 ov)</small></span>
            <span class="fow-pill" data-tooltip="Wicket 3: V. Kohli caught behind off Siraj">112/3 <small>(13.1 ov)</small></span>
          </div>
        </div>
      </div>

      <div class="grid-2">
        <!-- Ball-by-Ball Scoring Pad -->
        <div class="card">
          <div class="card-title">⚡ Interactive Ball-by-Ball Scoring Pad</div>
          <div class="card-desc">Click delivery buttons to trigger real-time scoring events via Fastify <code>POST /api/v1/matches/:id/score-events</code></div>

          <div class="pad-grid">
            <button class="pad-btn" onclick="scoreDelivery(0, 0, 'NONE', true)" data-tooltip="Score 0 runs (dot delivery)">0<span>Dot</span></button>
            <button class="pad-btn" onclick="scoreDelivery(1, 0, 'NONE', true)" data-tooltip="Score 1 run and rotate strike">1<span>Single</span></button>
            <button class="pad-btn" onclick="scoreDelivery(2, 0, 'NONE', true)" data-tooltip="Score 2 runs (strike retained)">2<span>Double</span></button>
            <button class="pad-btn" onclick="scoreDelivery(3, 0, 'NONE', true)" data-tooltip="Score 3 runs and rotate strike">3<span>Triple</span></button>
            <button class="pad-btn boundary-4" onclick="scoreDelivery(4, 0, 'NONE', true)" data-tooltip="Score 4 runs boundary">4 FOUR<span>Boundary</span></button>
            <button class="pad-btn boundary-6" onclick="scoreDelivery(6, 0, 'NONE', true)" data-tooltip="Score 6 runs over-the-rope maximum">6 SIX<span>Maximum</span></button>
            <button class="pad-btn wicket" onclick="scoreDelivery(0, 0, 'NONE', true, true)" data-tooltip="Wicket fell: record out and update strike">W WICKET<span>Out</span></button>
            <button class="pad-btn extra" onclick="scoreDelivery(0, 1, 'WIDE', false)" data-tooltip="Wide: +1 run extra, delivery re-bowled">Wd WIDE<span>+1 Run</span></button>
            <button class="pad-btn extra" onclick="scoreDelivery(0, 1, 'NO_BALL', false)" data-tooltip="No Ball: +1 run extra, delivery re-bowled">Nb NO BALL<span>+1 Run</span></button>
            <button class="pad-btn extra" onclick="scoreDelivery(0, 1, 'BYE', true)" data-tooltip="Byes: +1 run extra, strike rotates if odd">B BYE<span>+1 Run</span></button>
            <button class="pad-btn extra" onclick="scoreDelivery(0, 1, 'LEG_BYE', true)" data-tooltip="Leg Byes: +1 run extra, strike rotates if odd">Lb LEG BYE<span>+1 Run</span></button>
            <button class="pad-btn btn-secondary" onclick="resetMatchScore()" data-tooltip="Reset match score to 0/0 for new innings">↺ RESET<span>New Innings</span></button>
          </div>
        </div>

        <!-- Live Delivery Commentary Feed -->
        <div class="card">
          <div class="card-title">📜 Live Ball Log & Event Stream</div>
          <div class="card-desc">Event-sourced deliveries validated through Scoring State Machine</div>
          <div class="feed-container" id="scoringFeed">
            <div class="feed-item" style="color: var(--text-muted);">Match ready. Waiting for first delivery...</div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 2: MARKETPLACE & BOOKING -->
    <div id="tab-marketplace" class="tab-pane">
      <div class="grid-2">
        <div class="card">
          <div class="card-title">🏪 Available Venue & Official Listings</div>
          <div class="card-desc">Browse certified listings from <code>GET /api/v1/marketplace/listings</code></div>
          <div id="listingsContainer" style="display: flex; flex-direction: column; gap: 0.75rem;">
            Loading listings...
          </div>
        </div>

        <div class="card">
          <div class="card-title">🧾 Checkout & Commercial Breakdown</div>
          <div class="card-desc">Phase 1D Order Items Model + Policy Snapshot Calculation</div>

          <div class="breakdown-table">
            <div class="breakdown-row">
              <span id="summaryItemTitle">Harbour Cricket Ground (4hr Match Slot)</span>
              <span id="summarySubtotal">₹3,500.00</span>
            </div>
            <div class="breakdown-row">
              <span>Platform Service Fee (5% bps)</span>
              <span id="summaryFee">₹175.00</span>
            </div>
            <div class="breakdown-row">
              <span>GST Tax (18% on Fee)</span>
              <span id="summaryTax">₹31.50</span>
            </div>
            <div class="breakdown-row total">
              <span>Total Payable</span>
              <span id="summaryTotal">₹3,706.50</span>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-top: 1.5rem;">
            <button class="btn" onclick="executeCheckoutAndPay()" data-tooltip="Execute booking checkout, platform fee calculation, and payment webhook">💳 Confirm Order & Simulate Payment Webhook</button>
            <button class="btn btn-secondary" onclick="simulateHoldSlot()" data-tooltip="Reserve slot with 15-minute temporary hold with GiST temporal exclusion">⏱️ Hold Slot (15-min TTL)</button>
          </div>

          <div id="bookingConfirmation" style="margin-top: 1rem; font-size: 0.85rem; color: var(--primary); display: none;">
            ✓ Booking Confirmed & Payment Webhook Idempotently Processed!
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 3: TOURNAMENTS & FIXTURES -->
    <div id="tab-tournaments" class="tab-pane">
      <!-- Tournament Stage Stepper -->
      <div class="stage-stepper">
        <div class="stage-step completed" data-tooltip="Team registration, player KYC, and squads verified">✓ Squads Verified</div>
        <div class="stage-step active" data-tooltip="Round-robin stage currently underway across 4 match grounds">⚡ Group Stage (Live)</div>
        <div class="stage-step" data-tooltip="Top 2 teams qualify for playoff finals">Super 4s</div>
        <div class="stage-step" data-tooltip="Grand Final championship under stadium floodlights">🏆 Grand Final</div>
      </div>

      <div class="grid-2">
        <div class="card">
          <div class="card-title">🏆 Create Tournament & Generate Schedule</div>
          <div class="card-desc">Tournament Operating System (<code>/api/v1/tournaments</code>)</div>

          <div class="form-group">
            <label>Tournament Name</label>
            <input type="text" id="tournamentName" value="Delhi Inter-Club T20 Trophy 2026">
          </div>
          <div class="form-group">
            <label>Format</label>
            <select id="tournamentFormat">
              <option value="ROUND_ROBIN">Round Robin (All vs All)</option>
              <option value="KNOCKOUT">Knockout</option>
            </select>
          </div>
          <div class="form-group">
            <label>Participating Teams (comma-separated)</label>
            <input type="text" id="tournamentTeams" value="Northside XI, Riverside XI, Coastal Titans, Royal Strikers">
          </div>

          <button class="btn" onclick="generateTournamentFixtures()" data-tooltip="Orchestrate multi-team round-robin schedule and standings table">⚡ Create Tournament & Generate Round-Robin Fixtures</button>

          <div id="fixturesList" style="margin-top: 1.25rem;"></div>
        </div>

        <div class="card">
          <div class="card-title">📊 Live Tournament Standings</div>
          <div class="card-desc">Automatic points calculation and Net Run Rate (NRR) tracking</div>
          <table id="standingsTable">
            <thead>
              <tr>
                <th>Team</th>
                <th>P</th>
                <th>W</th>
                <th>L</th>
                <th>Pts</th>
                <th>NRR</th>
              </tr>
            </thead>
            <tbody id="standingsBody">
              <tr style="border-left: 3px solid var(--turf-emerald);">
                <td><strong>Northside XI</strong> <span style="font-size: 0.72rem; color: var(--turf-emerald); font-weight: 700;">[Q]</span></td>
                <td>3</td>
                <td>2</td>
                <td>1</td>
                <td><strong style="color: var(--primary); font-family: var(--font-score);">4</strong></td>
                <td><span style="background: rgba(0, 210, 255, 0.15); color: var(--cyan); padding: 0.15rem 0.45rem; border-radius: 4px; font-family: var(--font-score); font-weight: 700;" data-tooltip="Official ICC Net Run Rate: +0.850">+0.850</span></td>
              </tr>
              <tr style="border-left: 3px solid var(--turf-emerald);">
                <td><strong>Royal Strikers</strong> <span style="font-size: 0.72rem; color: var(--turf-emerald); font-weight: 700;">[Q]</span></td>
                <td>3</td>
                <td>2</td>
                <td>1</td>
                <td><strong style="color: var(--primary); font-family: var(--font-score);">4</strong></td>
                <td><span style="background: rgba(0, 210, 255, 0.15); color: var(--cyan); padding: 0.15rem 0.45rem; border-radius: 4px; font-family: var(--font-score); font-weight: 700;" data-tooltip="Official ICC Net Run Rate: +0.320">+0.320</span></td>
              </tr>
              <tr>
                <td>Riverside XI</td>
                <td>3</td>
                <td>1</td>
                <td>2</td>
                <td><strong style="color: var(--text-main); font-family: var(--font-score);">2</strong></td>
                <td><span style="background: rgba(255, 51, 102, 0.15); color: var(--rose); padding: 0.15rem 0.45rem; border-radius: 4px; font-family: var(--font-score); font-weight: 700;" data-tooltip="Official ICC Net Run Rate: -0.420">-0.420</span></td>
              </tr>
              <tr>
                <td>Coastal Titans</td>
                <td>3</td>
                <td>1</td>
                <td>2</td>
                <td><strong style="color: var(--text-main); font-family: var(--font-score);">2</strong></td>
                <td><span style="background: rgba(255, 51, 102, 0.15); color: var(--rose); padding: 0.15rem 0.45rem; border-radius: 4px; font-family: var(--font-score); font-weight: 700;" data-tooltip="Official ICC Net Run Rate: -0.750">-0.750</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 4: INCIDENTS & REPUTATION -->
    <div id="tab-incidents" class="tab-pane">
      <div class="grid-2">
        <div class="card">
          <div class="card-title">⚠️ Service Incidents & Replacement Proposals</div>
          <div class="card-desc">Automated recovery when providers fail or no-show (Phase 1L/1M)</div>

          <div class="form-group">
            <label>Incident Type</label>
            <select id="incidentType">
              <option value="PROVIDER_NO_SHOW">Provider No-Show (Umpire/Groundsman)</option>
              <option value="WEATHER">Adverse Weather / Unplayable Pitch</option>
              <option value="DISPUTE">Match Dispute</option>
            </select>
          </div>
          <div class="form-group">
            <label>Reason / Details</label>
            <input type="text" id="incidentReason" value="Umpire did not arrive 30 mins before match toss">
          </div>

          <button class="btn" style="background: var(--rose); color: #FFF;" onclick="logIncidentAndFindReplacement()" data-tooltip="File operational dispute and search Bayesian-rated replacement provider">🚨 Open Incident & Propose Emergency Replacement</button>

          <div id="replacementResult" style="margin-top: 1.25rem;"></div>
        </div>

        <div class="card">
          <div class="card-title">⭐ Provider Trust & Reputation Engine</div>
          <div class="card-desc">Bayesian smoothed rating, trust transitions, and automated circuit breaker</div>

          <div style="background: rgba(0, 0, 0, 0.3); border-radius: 10px; padding: 1.25rem; margin-bottom: 1.25rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <span style="font-weight: 600;">Harbour Cricket Grounds</span>
              <span id="providerTrustBadge" style="background: rgba(16, 185, 129, 0.15); color: var(--primary); padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: 700;" data-tooltip="Live operational trust status (VERIFIED / PROBATION / SUSPENDED)">VERIFIED</span>
            </div>
            <div style="display: flex; gap: 1.5rem; margin-top: 0.75rem; flex-wrap: wrap;">
              <div data-tooltip="Bayesian smoothed rating using m-estimate prior (platform avg: 4.2)">
                <div style="font-size: 0.75rem; color: var(--text-muted);">Bayesian Rating</div>
                <div style="font-size: 1.5rem; font-weight: 700; color: var(--amber);" id="providerBayesianRating">4.72 / 5.0</div>
              </div>
              <div data-tooltip="Reliability score: probation triggered at <80%, suspension circuit breaker at <65%">
                <div style="font-size: 0.75rem; color: var(--text-muted);">Reliability Score</div>
                <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary);" id="providerReliability">98.5%</div>
              </div>
              <div data-tooltip="Automated circuit breaker status. If tripped, unbooked slots are automatically frozen.">
                <div style="font-size: 0.75rem; color: var(--text-muted);">Circuit Breaker</div>
                <div style="font-size: 1.1rem; font-weight: 700; color: var(--primary);" id="providerCircuitStatus">HEALTHY</div>
              </div>
            </div>
          </div>

          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button class="btn btn-secondary" onclick="applyReputationEvent('MATCH_COMPLETED')" data-tooltip="Completed match successfully (+1% reliability delta)">✓ Match Completed (+1%)</button>
            <button class="btn btn-secondary" style="color: var(--amber);" onclick="applyReputationEvent('LATE_CANCELLATION')" data-tooltip="Late cancellation penalty (-6% reliability delta)">⚠️ Late Cancel (-6%)</button>
            <button class="btn btn-secondary" style="color: var(--rose);" onclick="applyReputationEvent('NO_SHOW')" data-tooltip="Severe penalty for provider no-show (-15% reliability delta)">✗ No-Show (-15%)</button>
            <button class="btn btn-secondary" style="color: var(--rose); border: 1px dashed var(--rose);" onclick="simulateCircuitBreakerTrip()" data-tooltip="Trigger consecutive no-shows to pull score below 65% and trip circuit breaker">🚨 Trip Circuit Breaker</button>
          </div>

          <!-- Dispute Escalation & Double-Entry Auto-Refund -->
          <div style="margin-top: 1.25rem; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 1.25rem;">
            <div style="font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; color: var(--text-main);">⚖️ Dispute Escalation & Double-Entry Auto-Refund</div>
            <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.75rem;">Escalate booking dispute: executes zero-sum double-entry refund entry and applies provider trust penalty.</div>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              <button class="btn" style="background: rgba(244,63,94,0.15); border: 1px solid var(--rose); color: var(--rose); font-size: 0.8rem; padding: 0.4rem 0.8rem;" onclick="escalateAndResolveDispute('UPHELD_CUSTOMER_REFUND')" data-tooltip="Upholds dispute, generates zero-sum refund entry, penalizes provider trust (-8%)">Upheld & Auto-Refund (₹3,500)</button>
              <button class="btn btn-secondary" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;" onclick="escalateAndResolveDispute('REJECTED_PROVIDER_FAVORED')" data-tooltip="Rejects dispute in favor of provider (+1% provider trust delta)">Reject (Provider Favored)</button>
              <button class="btn btn-secondary" style="font-size: 0.8rem; padding: 0.4rem 0.8rem; border-color: var(--cyan); color: var(--cyan);" onclick="testPayoutDisbursement()" data-tooltip="Verify payout disbursement against open disputes and circuit breaker state">💰 Test Payout</button>
            </div>
            <div id="disputeRefundResult" style="margin-top: 0.75rem; font-size: 0.8rem;"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 5: API EXPLORER -->
    <div id="tab-explorer" class="tab-pane">
      <div class="grid-3" style="margin-bottom: 1.25rem;">
        <div class="card" style="padding: 1rem 1.25rem;" data-tooltip="Total HTTP API requests served with Prometheus OpenMetrics instrumentation">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
            <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">HTTP Throughput</span>
            <span style="color: var(--turf-emerald); font-size: 0.72rem; font-weight: 700;">PROMETHEUS</span>
          </div>
          <div style="font-family: var(--font-score); font-size: 1.6rem; font-weight: 800; color: var(--turf-emerald);">4,820 <span style="font-size: 0.8rem; font-weight: normal; color: var(--text-muted);">req/s</span></div>
          <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">Sub-millisecond route timings</div>
        </div>

        <div class="card" style="padding: 1rem 1.25rem;" data-tooltip="p95 HTTP route execution latency measured via fastify onRequest/onResponse hooks">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
            <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">p95 Latency</span>
            <span style="color: var(--cyan); font-size: 0.72rem; font-weight: 700;">FASTIFY</span>
          </div>
          <div style="font-family: var(--font-score); font-size: 1.6rem; font-weight: 800; color: var(--cyan);">1.85 <span style="font-size: 0.8rem; font-weight: normal; color: var(--text-muted);">ms</span></div>
          <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">99th percentile &lt; 3.2ms</div>
        </div>

        <div class="card" style="padding: 1rem 1.25rem;" data-tooltip="Node.js event loop delay histogram via perf_hooks.monitorEventLoopDelay">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
            <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Event Loop Lag</span>
            <span style="color: var(--amber); font-size: 0.72rem; font-weight: 700;">PERF_HOOKS</span>
          </div>
          <div style="font-family: var(--font-score); font-size: 1.6rem; font-weight: 800; color: var(--amber);">0.42 <span style="font-size: 0.8rem; font-weight: normal; color: var(--text-muted);">ms</span></div>
          <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">Zero event loop stalls</div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">⚡ Live API Endpoint Runner</div>
        <div class="card-desc">Execute requests directly against the running Fastify instance</div>

        <div style="display: flex; gap: 0.75rem; margin-bottom: 1rem;">
          <select id="apiMethod" style="width: 120px;" aria-label="API HTTP Method">
            <option value="GET">GET</option>
            <option value="POST">POST</option>
          </select>
          <input type="text" id="apiEndpoint" value="/health" style="flex: 1;" aria-label="API Endpoint Path">
          <button class="btn" style="width: 140px;" onclick="executeApiCall()" data-tooltip="Execute live HTTP request against local API server">Run Request</button>
        </div>

        <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap;">
          <button class="btn btn-secondary" style="width: auto; padding: 0.35rem 0.75rem; font-size: 0.8rem;" onclick="setApi('/health')" data-tooltip="Test cloud-native /health endpoint">/health</button>
          <button class="btn btn-secondary" style="width: auto; padding: 0.35rem 0.75rem; font-size: 0.8rem;" onclick="setApi('/api/v1/marketplace/listings')" data-tooltip="Fetch active marketplace provider service listings">/marketplace/listings</button>
          <button class="btn btn-secondary" style="width: auto; padding: 0.35rem 0.75rem; font-size: 0.8rem;" onclick="setApi('/api/v1/events')" data-tooltip="Fetch scheduled match events">/events</button>
          <button class="btn btn-secondary" style="width: auto; padding: 0.35rem 0.75rem; font-size: 0.8rem;" onclick="setApi('/api/v1/operations/dashboard')" data-tooltip="Fetch platform operations and metrics summary">/operations/dashboard</button>
        </div>

        <div class="form-group" id="apiBodyContainer" style="display: none;">
          <label>Request JSON Body</label>
          <textarea id="apiBody" rows="3">{}</textarea>
        </div>

        <label>Response Preview (<span id="apiTiming">0ms</span>)</label>
        <pre id="apiResponse" style="background: rgba(0,0,0,0.5); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 1rem; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; max-height: 300px; overflow-y: auto; color: #38BDF8;">Click 'Run Request' to test</pre>
      </div>
    </div>
  </main>

  <div id="toast">✓ Event completed</div>

  <script>
    // Tab Switching
    function switchTab(tabId) {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      event.target.classList.add('active');
      document.getElementById('tab-' + tabId).classList.add('active');
    }

    function showToast(msg) {
      const t = document.getElementById('toast');
      t.textContent = msg;
      t.classList.add('show');
      setTimeout(() => t.classList.remove('show'), 3000);
    }

    // Health check ping
    async function checkHealth() {
      try {
        const res = await fetch('/health');
        if (res.ok) {
          const data = await res.json();
          document.getElementById('healthText').textContent = 'API Live (' + data.version + ')';
        }
      } catch (err) {
        document.getElementById('healthText').textContent = 'API Offline';
      }
    }
    checkHealth();
    setInterval(checkHealth, 5000);

    // Scoring State & Live Broadcast Engine
    let runs = 0;
    let wickets = 0;
    let legalBalls = 0;
    let sequence = 0;
    let isSseConnected = false;
    const renderedDeliveryKeys = new Set();
    const feedDeliveryKeys = new Set();
    const matchId = 'match-pilot-1';

    function getDeliveryKey(event) {
      if (!event) return null;
      if (event.event_id) return 'eid-' + event.event_id;
      if (event.client_event_id) return 'cid-' + event.client_event_id;
      if (event.sequence) return 'seq-' + event.sequence;
      return null;
    }

    function renderScoreState(state, event, eventType) {
      if (!state) return;
      runs = state.runs ?? 0;
      wickets = state.wickets ?? 0;
      legalBalls = state.legal_balls ?? 0;

      const oversDisplay = state.overs_display || '0.0';
      document.getElementById('scoreRunsWickets').textContent = runs + '/' + wickets;
      document.getElementById('scoreOvers').textContent = '(' + oversDisplay + ' ov)';
      const crr = legalBalls > 0 ? ((runs / legalBalls) * 6).toFixed(2) : '0.00';
      document.getElementById('scoreRunRate').textContent = 'CRR: ' + crr;

      // Update Target Equation chase stats
      const targetRuns = 178;
      const targetBalls = 120;
      const currentRuns = runs || 0;
      const currentBalls = legalBalls || 0;
      const runsNeeded = Math.max(0, targetRuns - currentRuns);
      const ballsLeft = Math.max(0, targetBalls - currentBalls);
      const rrr = ballsLeft > 0 ? ((runsNeeded / ballsLeft) * 6).toFixed(2) : '0.00';
      const progressPercent = Math.min(100, (currentRuns / targetRuns) * 100).toFixed(1);

      const targetRunsEl = document.getElementById('targetRunsNeeded');
      const targetBallsEl = document.getElementById('targetBallsLeft');
      const targetRRREl = document.getElementById('targetRRR');
      const targetProgressFill = document.getElementById('targetProgressFill');

      if (targetRunsEl) targetRunsEl.textContent = runsNeeded;
      if (targetBallsEl) targetBallsEl.textContent = ballsLeft;
      if (targetRRREl) targetRRREl.textContent = rrr;
      if (targetProgressFill) targetProgressFill.style.width = progressPercent + '%';

      // Deduplication check for delivery progression
      const eventKey = getDeliveryKey(event);
      const isAlreadyRendered = eventKey ? renderedDeliveryKeys.has(eventKey) : false;

      if (event && !isAlreadyRendered) {
        if (eventKey) {
          renderedDeliveryKeys.add(eventKey);
          if (renderedDeliveryKeys.size > 200) {
            const oldest = renderedDeliveryKeys.values().next().value;
            renderedDeliveryKeys.delete(oldest);
          }
        }

        // Update Fall of Wickets Timeline
        if (event.is_wicket) {
          const fowStrip = document.getElementById('fowStrip');
          if (fowStrip) {
            const pill = document.createElement('span');
            pill.className = 'fow-pill';
            pill.setAttribute('data-tooltip', 'Wicket ' + wickets + ': ' + runs + '/' + wickets + ' at ' + oversDisplay + ' ov');
            pill.innerHTML = runs + '/' + wickets + ' <small>(' + oversDisplay + ' ov)</small>';
            fowStrip.appendChild(pill);
          }
        }

        // Update Over Ball Strip
        addBallBubble(event, eventKey);
      }

      // Update Active Batters & Bowler
      if (state.batters) {
        const batterKeys = Object.keys(state.batters);
        if (batterKeys.length >= 2) {
          const striker = state.batters[state.striker_id || batterKeys[0]];
          const nonStriker = state.batters[state.non_striker_id || batterKeys[1]];
          if (striker) {
            document.getElementById('strikerName').textContent = (striker.name || 'Virat K.') + ' *';
            document.getElementById('strikerFigures').innerHTML = striker.runs + ' <span style="font-size: 0.85rem; color: var(--text-muted);">(' + striker.ballsFaced + 'b) • ' + striker.fours + 'x4 ' + striker.sixes + 'x6 • SR: ' + striker.strikeRate.toFixed(1) + '</span>';
          }
          if (nonStriker) {
            document.getElementById('nonStrikerName').textContent = (nonStriker.name || 'Rohit S.');
            document.getElementById('nonStrikerFigures').innerHTML = nonStriker.runs + ' <span style="font-size: 0.85rem; color: var(--text-muted);">(' + nonStriker.ballsFaced + 'b) • SR: ' + nonStriker.strikeRate.toFixed(1) + '</span>';
          }
        }
      }

      if (state.bowlers) {
        const bowlerKeys = Object.keys(state.bowlers);
        if (bowlerKeys.length > 0) {
          const bowler = state.bowlers[state.current_bowler_id || bowlerKeys[0]];
          if (bowler) {
            document.getElementById('bowlerName').textContent = bowler.name || 'Jasprit B.';
            document.getElementById('bowlerFigures').innerHTML = bowler.oversDisplay + '-' + bowler.maidens + '-' + bowler.runsConceded + '-' + bowler.wickets + ' <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: normal;">(Econ: ' + bowler.economyRate.toFixed(2) + ')</span>';
          }
        }
      }
    }

    function addBallBubble(event, eventKey) {
      const strip = document.getElementById('overBallStrip');
      if (!strip) return;

      // Prevent duplicate DOM nodes for the same delivery
      if (eventKey && strip.querySelector('[data-event-key="' + eventKey + '"]')) {
        return;
      }

      // Remove initial placeholder dot if present
      const firstChild = strip.firstElementChild;
      if (strip.children.length === 1 && firstChild && firstChild.textContent.trim() === '•' && !firstChild.dataset.eventKey) {
        strip.innerHTML = '';
      }

      const bubble = document.createElement('div');
      if (eventKey) {
        bubble.dataset.eventKey = eventKey;
      }

      let label = '•';
      let cls = 'dot';

      if (event.is_wicket) {
        label = 'W';
        cls = 'wicket';
      } else if (event.extra_type === 'WIDE') {
        label = (event.extra_runs || 1) + 'wd';
        cls = 'extra';
      } else if (event.extra_type === 'NO_BALL') {
        label = (event.extra_runs || 1) + 'nb';
        cls = 'extra';
      } else if (event.extra_type === 'BYE') {
        label = (event.extra_runs || 1) + 'b';
        cls = 'extra';
      } else if (event.extra_type === 'LEG_BYE') {
        label = (event.extra_runs || 1) + 'lb';
        cls = 'extra';
      } else if (event.bat_runs === 4) {
        label = '4';
        cls = 'four';
      } else if (event.bat_runs === 6) {
        label = '6';
        cls = 'six';
      } else if (event.bat_runs > 0) {
        label = '' + event.bat_runs;
        cls = 'single';
      }

      bubble.className = 'ball-bubble ' + cls;
      bubble.textContent = label;

      strip.appendChild(bubble);

      // Keep up to 8 recent delivery chips in strip
      while (strip.children.length > 8) {
        strip.removeChild(strip.firstChild);
      }

      document.getElementById('overSummaryText').textContent = 'This Over: ' + strip.children.length + ' deliveries bowled';
    }

    // Connect to Server-Sent Events (SSE) Live Broadcast Stream
    function initSseStream() {
      try {
        const sseUrl = '/api/v1/scoring/matches/' + matchId + '/live';
        const source = new EventSource(sseUrl);

        source.addEventListener('initial_state', (e) => {
          const data = JSON.parse(e.data);
          renderScoreState(data.state);
        });

        source.addEventListener('ball_bowled', (e) => {
          const data = JSON.parse(e.data);
          renderScoreState(data.state, data.event, 'BALL_BOWLED');
          logFeedItem(data.state, data.event);
        });

        source.addEventListener('wicket_fallen', (e) => {
          const data = JSON.parse(e.data);
          renderScoreState(data.state, data.event, 'WICKET_FALLEN');
          logFeedItem(data.state, data.event);
          showToast('🛑 WICKET! ' + (data.state.wickets) + ' down for ' + data.state.runs);
        });

        source.addEventListener('over_completed', (e) => {
          const data = JSON.parse(e.data);
          renderScoreState(data.state, data.event, 'OVER_COMPLETED');
          logFeedItem(data.state, data.event);
          showToast('✓ Over complete! End of over ' + data.state.overs_display);
        });

        source.addEventListener('innings_closed', (e) => {
          const data = JSON.parse(e.data);
          renderScoreState(data.state, data.event, 'INNINGS_CLOSED');
          showToast('🏆 Innings Closed! Total: ' + data.state.runs + '/' + data.state.wickets);
        });

        source.onopen = () => {
          isSseConnected = true;
          const badge = document.getElementById('sseStatusBadge');
          if (badge) {
            badge.style.borderColor = 'rgba(16, 185, 129, 0.5)';
            document.getElementById('sseStatusText').textContent = 'SSE Stream: Connected (Live)';
          }
        };

        source.onerror = () => {
          isSseConnected = false;
          const badge = document.getElementById('sseStatusBadge');
          if (badge) {
            badge.style.borderColor = 'rgba(245, 158, 11, 0.5)';
            document.getElementById('sseStatusText').textContent = 'SSE Stream: Reconnecting...';
          }
        };
      } catch (err) {
        isSseConnected = false;
        console.warn('SSE not supported or failed to connect:', err);
      }
    }
    initSseStream();

    function logFeedItem(state, event) {
      if (!event) return;
      const key = getDeliveryKey(event);
      if (key && feedDeliveryKeys.has(key)) return;
      if (key) {
        feedDeliveryKeys.add(key);
        if (feedDeliveryKeys.size > 200) {
          const oldest = feedDeliveryKeys.values().next().value;
          feedDeliveryKeys.delete(oldest);
        }
      }

      const feed = document.getElementById('scoringFeed');
      if (!feed) return;
      const item = document.createElement('div');
      item.className = 'feed-item';
      let desc = event.is_wicket ? '🛑 WICKET!' : (event.bat_runs === 4 ? '🏏 FOUR!' : (event.bat_runs === 6 ? '🚀 SIX!' : (event.extra_type && event.extra_type !== 'NONE' ? event.extra_type + ' (+' + (event.extra_runs || 1) + ')' : (event.bat_runs || 0) + ' run(s)')));
      item.innerHTML = '<span>Ball ' + (state.overs_display || '0.0') + ' — ' + desc + '</span><span style=\"color: var(--text-muted); font-weight: 600;\">' + (state.runs || 0) + '/' + (state.wickets || 0) + '</span>';
      feed.prepend(item);
    }

    async function scoreDelivery(batRuns, extraRuns, extraType, legalBall, isWicket = false) {
      sequence++;
      const clientEventId = 'evt-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
      const res = await fetch('/api/v1/scoring/matches/' + matchId + '/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_event_id: clientEventId,
          sequence,
          bat_runs: batRuns,
          extra_runs: extraRuns,
          extra_type: extraType,
          legal_ball: legalBall,
          is_wicket: isWicket
        })
      });

      if (res.ok) {
        const data = await res.json();
        // If SSE stream is disconnected or inactive, apply local update as fallback
        if (!isSseConnected) {
          const fallbackEvent = data.event || {
            client_event_id: clientEventId,
            sequence,
            bat_runs: batRuns,
            extra_runs: extraRuns,
            extra_type: extraType,
            legal_ball: legalBall,
            is_wicket: isWicket
          };
          renderScoreState(data.state, fallbackEvent, data.broadcast_type);
          logFeedItem(data.state, fallbackEvent);
        }
        let desc = isWicket ? '🛑 WICKET!' : (batRuns === 4 ? '🏏 FOUR!' : (batRuns === 6 ? '🚀 SIX!' : (extraType !== 'NONE' ? extraType + ' (+1)' : batRuns + ' run(s)')));
        showToast('Delivered: ' + desc);
      }
    }

    function resetMatchScore() {
      runs = 0; wickets = 0; legalBalls = 0; sequence = 0;
      renderedDeliveryKeys.clear();
      feedDeliveryKeys.clear();
      document.getElementById('scoreRunsWickets').textContent = '0/0';
      document.getElementById('scoreOvers').textContent = '(0.0 ov)';
      document.getElementById('scoreRunRate').textContent = 'CRR: 0.00';
      document.getElementById('overBallStrip').innerHTML = '<div class="ball-bubble dot">•</div>';
      document.getElementById('overSummaryText').textContent = 'Waiting for over to commence...';
      document.getElementById('scoringFeed').innerHTML = '<div class="feed-item" style="color: var(--text-muted);">New innings initialized.</div>';
      const fowStrip = document.getElementById('fowStrip');
      if (fowStrip) fowStrip.innerHTML = '';
      showToast('Match scoreboard reset');
    }

    // Marketplace load
    async function loadListings() {
      const container = document.getElementById('listingsContainer');
      try {
        const res = await fetch('/api/v1/marketplace/listings');
        const listings = await res.json();
        container.innerHTML = listings.map(l => \`
          <div style="background: rgba(0,0,0,0.3); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 0.85rem;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-weight: 600;">\${l.title}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">Category: \${l.category} • \${l.pricing_model || 'FIXED'}</div>
              </div>
              <div style="text-align: right;">
                <div style="font-weight: 700; color: var(--primary);">₹\${(l.base_price_minor / 100).toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
                <button class="btn btn-secondary" style="width: auto; padding: 0.25rem 0.65rem; font-size: 0.75rem; margin-top: 0.35rem;" onclick="selectListing('\${l.title}', \${l.base_price_minor})" data-tooltip="Select this service listing for checkout calculation">Select</button>
              </div>
            </div>
            <div class="slot-matrix">
              <span class="slot-chip available" data-tooltip="Morning match slot: 08:00 - 12:00 (Available)">08:00 Avail</span>
              <span class="slot-chip available" data-tooltip="Afternoon practice slot: 13:00 - 17:00 (Available)">13:00 Avail</span>
              <span class="slot-chip booked" data-tooltip="Peak night fixture: 18:00 - 22:00 (GiST Temporal Exclusion Locked)">18:00 Booked</span>
            </div>
          </div>
        \`).join('');
      } catch (e) {
        container.textContent = 'Error loading listings';
      }
    }
    loadListings();

    function selectListing(title, priceMinor) {
      document.getElementById('summaryItemTitle').textContent = title;
      const subtotal = priceMinor / 100;
      const fee = subtotal * 0.05;
      const tax = fee * 0.18;
      const total = subtotal + fee + tax;
      document.getElementById('summarySubtotal').textContent = '₹' + subtotal.toFixed(2);
      document.getElementById('summaryFee').textContent = '₹' + fee.toFixed(2);
      document.getElementById('summaryTax').textContent = '₹' + tax.toFixed(2);
      document.getElementById('summaryTotal').textContent = '₹' + total.toFixed(2);
      showToast('Selected: ' + title);
    }

    async function simulateHoldSlot() {
      const res = await fetch('/api/v1/availability/holds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slot_id: '00000000-0000-0000-0000-000000000010' })
      });
      if (res.ok) {
        showToast('✓ 15-Minute Authoritative Hold Activated');
      }
    }

    async function executeCheckoutAndPay() {
      const res = await fetch('/api/v1/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ listing_id: 'list-1', slot_id: 'slot-1', unit_price_minor: 350000 }]
        })
      });
      const order = await res.json();

      // Trigger payment webhook simulation
      await fetch('/api/v1/payments/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_intent_id: 'pi-' + Date.now(),
          order_id: order.order_id,
          status: 'SUCCEEDED'
        })
      });

      document.getElementById('bookingConfirmation').style.display = 'block';
      showToast('✓ Order #' + order.order_id.slice(0, 8) + ' Paid & Booked!');
    }

    // Tournament Fixtures
    async function generateTournamentFixtures() {
      const name = document.getElementById('tournamentName').value;
      const teams = document.getElementById('tournamentTeams').value.split(',').map(t => t.trim());
      const res = await fetch('/api/v1/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, team_count: teams.length })
      });
      const t = await res.json();

      const fixRes = await fetch('/api/v1/tournaments/' + t.id + '/fixtures/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_ids: teams })
      });
      const fix = await fixRes.json();

      const container = document.getElementById('fixturesList');
      container.innerHTML = '<div style=\"font-weight: 600; margin-bottom: 0.5rem; color: var(--primary);\">Generated ' + fix.count + ' Round-Robin Fixtures:</div>' +
        fix.fixtures.map(f => '<div style=\"padding: 0.35rem 0; border-bottom: 1px solid var(--border-subtle); font-size: 0.85rem;\">Round ' + f.round + ': <strong>' + f.home + '</strong> vs <strong>' + f.away + '</strong></div>').join('');
      showToast('Generated ' + fix.count + ' fixtures');
    }

    // Incidents
    async function logIncidentAndFindReplacement() {
      const type = document.getElementById('incidentType').value;
      const reason = document.getElementById('incidentReason').value;
      const res = await fetch('/api/v1/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: 'booking-1', type, reason })
      });
      const inc = await res.json();

      const propRes = await fetch('/api/v1/replacements/propose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incident_id: inc.id,
          original_booking_id: 'booking-1',
          proposed_provider_id: 'provider-certified-99'
        })
      });
      const prop = await propRes.json();

      document.getElementById('replacementResult').innerHTML = \`
        <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid var(--border-accent); border-radius: 8px; padding: 0.85rem;">
          <div style="font-weight: 600; color: var(--primary);">✓ Emergency Replacement Found!</div>
          <div style="font-size: 0.8rem; margin: 0.35rem 0;">Qualified Provider: <strong>Premier Match Officials Ltd</strong></div>
          <button class="btn" style="padding: 0.4rem; font-size: 0.8rem; margin-top: 0.35rem;" onclick="acceptReplacement('\${prop.id}')" data-tooltip="Accept and bind emergency replacement provider">Accept Replacement</button>
        </div>
      \`;
      showToast('Emergency replacement proposed');
    }

    async function acceptReplacement(id) {
      await fetch('/api/v1/replacements/' + id + '/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Replacement accepted by organizer' })
      });
      document.getElementById('replacementResult').innerHTML = '<div style=\"color: var(--primary); font-weight: 600;\">✓ Replacement Accepted & Confirmed!</div>';
      showToast('Replacement accepted');
    }

    // Reputation & Trust Engine (Phase 1Q)
    let currentScore = 0.985;
    let currentTrustState = 'VERIFIED';
    const testProviderId = '00000000-0000-0000-0000-000000000002';
    const testBookingId = 'booking-ops-demo-01';

    function updateTrustUI(score, trustState, circuitTripped) {
      currentScore = Math.max(0, Math.min(1, score));
      currentTrustState = trustState || (currentScore < 0.65 ? 'SUSPENDED' : currentScore < 0.80 ? 'PROBATION' : 'VERIFIED');
      document.getElementById('providerReliability').textContent = (currentScore * 100).toFixed(1) + '%';
      
      const badge = document.getElementById('providerTrustBadge');
      const circuit = document.getElementById('providerCircuitStatus');
      badge.textContent = currentTrustState;

      if (currentTrustState === 'SUSPENDED' || circuitTripped) {
        badge.style.background = 'rgba(244, 63, 94, 0.2)';
        badge.style.color = 'var(--rose)';
        circuit.textContent = '🚨 TRIPPED (FROZEN)';
        circuit.style.color = 'var(--rose)';
      } else if (currentTrustState === 'PROBATION') {
        badge.style.background = 'rgba(245, 158, 11, 0.2)';
        badge.style.color = 'var(--amber)';
        circuit.textContent = '⚠️ PROBATION';
        circuit.style.color = 'var(--amber)';
      } else {
        badge.style.background = 'rgba(16, 185, 129, 0.15)';
        badge.style.color = 'var(--primary)';
        circuit.textContent = 'HEALTHY';
        circuit.style.color = 'var(--primary)';
      }
    }

    async function applyReputationEvent(eventType) {
      const res = await fetch('/api/v1/reputation/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider_id: testProviderId,
          event_type: eventType
        })
      });
      const data = await res.json();
      updateTrustUI(data.reliability_score, data.trust_state, data.circuit_breaker_tripped);
      showToast('Reputation ' + eventType + ': ' + (data.score_delta > 0 ? '+' : '') + (data.score_delta * 100).toFixed(1) + '% (' + data.trust_state + ')');
    }

    async function simulateCircuitBreakerTrip() {
      await applyReputationEvent('NO_SHOW');
      await applyReputationEvent('NO_SHOW');
      await applyReputationEvent('NO_SHOW');
      showToast('Circuit Breaker Tripped! Provider SUSPENDED and unbooked slots frozen.');
    }

    async function escalateAndResolveDispute(resolution) {
      const resultEl = document.getElementById('disputeRefundResult');
      resultEl.innerHTML = '<div style="color: var(--cyan);">Processing dispute and double-entry ledger settlement...</div>';

      try {
        const dispRes = await fetch('/api/v1/disputes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            booking_id: testBookingId,
            provider_id: testProviderId,
            reason: 'Ground pitch pitch-marking non-compliant with MCC standard',
            amount_minor: 350000
          })
        });
        const dispData = await dispRes.json();

        const resolveRes = await fetch('/api/v1/disputes/' + dispData.id + '/resolve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resolution: resolution,
            resolution_notes: 'Administrative adjudication via CricOS Commercial Policy Engine'
          })
        });
        const resolveData = await resolveRes.json();

        if (resolveData.provider_penalty) {
          updateTrustUI(
            resolveData.provider_penalty.reliability_score,
            resolveData.provider_penalty.trust_state,
            resolveData.provider_penalty.circuit_breaker_tripped
          );
        }

        if (resolution === 'UPHELD_CUSTOMER_REFUND') {
          const entry = resolveData.refund_journal_entry;
          const journalId = entry && entry.id ? entry.id : 'REFUND-ENTRY-01';
          const nextState = resolveData.provider_penalty ? resolveData.provider_penalty.trust_state : 'PROBATION';
          resultEl.innerHTML = 
            '<div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(244,63,94,0.3); border-radius: 6px; padding: 0.75rem; margin-top: 0.5rem;">' +
              '<div style="color: var(--rose); font-weight: 600; margin-bottom: 0.35rem;">✓ Dispute Upheld: Double-Entry Refund Balanced</div>' +
              '<div style="color: var(--text-muted); font-size: 0.75rem;">Journal ID: <code>' + journalId + '</code></div>' +
              '<div style="font-family: monospace; font-size: 0.75rem; margin-top: 0.35rem; color: #a5f3fc;">' +
                '<div>DEBIT:  ESCROW_HOLD      ₹3,500.00</div>' +
                '<div>CREDIT: REFUND_CLEARING  ₹3,500.00</div>' +
                '<div style="color: var(--primary);">IMBALANCE: ₹0.00 (Zero-Sum Verified)</div>' +
              '</div>' +
              '<div style="font-size: 0.75rem; color: var(--rose); margin-top: 0.35rem;">' +
                'Provider Penalty: DISPUTE_LOST (-8.0%) → State: ' + nextState +
              '</div>' +
            '</div>';
          showToast('Dispute resolved: ₹3,500 auto-refunded to customer ledger');
        } else {
          resultEl.innerHTML = 
            '<div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(16,185,129,0.3); border-radius: 6px; padding: 0.75rem; margin-top: 0.5rem;">' +
              '<div style="color: var(--primary); font-weight: 600;">✓ Dispute Rejected: Provider Upheld</div>' +
              '<div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem;">Provider awarded +1% reputation recovery delta.</div>' +
            '</div>';
          showToast('Dispute resolved in favor of provider');
        }
      } catch (err) {
        resultEl.innerHTML = '<div style="color: var(--rose);">Error processing dispute: ' + err.message + '</div>';
      }
    }

    async function testPayoutDisbursement() {
      const resultEl = document.getElementById('disputeRefundResult');
      resultEl.innerHTML = '<div style="color: var(--cyan);">Evaluating payout disbursement invariants...</div>';

      try {
        const res = await fetch('/api/v1/payouts/disburse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider_id: testProviderId,
            booking_id: testBookingId,
            amount_minor: 300000
          })
        });
        const data = await res.json();

        if (res.status === 422) {
          const errMsg = data.message || data.error;
          resultEl.innerHTML = 
            '<div style="background: rgba(244,63,94,0.1); border: 1px solid var(--rose); border-radius: 6px; padding: 0.75rem; margin-top: 0.5rem;">' +
              '<div style="color: var(--rose); font-weight: 600;">🛡️ Disbursement Blocked: Invariant Protected</div>' +
              '<div style="font-size: 0.75rem; color: #fca5a5; margin-top: 0.25rem;">' + errMsg + '</div>' +
            '</div>';
          showToast('Disbursement guarded: ' + data.error);
        } else {
          resultEl.innerHTML = 
            '<div style="background: rgba(16,185,129,0.1); border: 1px solid var(--primary); border-radius: 6px; padding: 0.75rem; margin-top: 0.5rem;">' +
              '<div style="color: var(--primary); font-weight: 600;">✓ Payout Disbursed: ₹3,000.00</div>' +
              '<div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem;">Transaction status: DISBURSED (Zero open disputes & active trust standing).</div>' +
            '</div>';
          showToast('Payout disbursed successfully!');
        }
      } catch (err) {
        resultEl.innerHTML = '<div style="color: var(--rose);">Disbursement error: ' + err.message + '</div>';
      }
    }

    // Accessible Universal Tooltip Component
    (function () {
      let activeTooltip = null;
      let activeTrigger = null;

      function createTooltipElement() {
        const el = document.createElement('div');
        el.id = 'universal-tooltip-popover';
        el.className = 'uni-tooltip';
        el.setAttribute('role', 'tooltip');
        el.setAttribute('aria-hidden', 'true');
        document.body.appendChild(el);
        return el;
      }

      function getTooltipElement() {
        return document.getElementById('universal-tooltip-popover') || createTooltipElement();
      }

      function positionTooltip(trigger, tooltip) {
        const trigRect = trigger.getBoundingClientRect();
        const ttRect = tooltip.getBoundingClientRect();
        const margin = 8;
        const vpW = window.innerWidth;
        const vpH = window.innerHeight;

        let top = trigRect.top - ttRect.height - margin;
        let left = trigRect.left + (trigRect.width / 2) - (ttRect.width / 2);

        if (top < margin) {
          top = trigRect.bottom + margin;
        }

        if (left < margin) left = margin;
        if (left + ttRect.width > vpW - margin) left = vpW - ttRect.width - margin;

        tooltip.style.top = Math.round(top + window.scrollY) + 'px';
        tooltip.style.left = Math.round(left + window.scrollX) + 'px';
      }

      function show(trigger, text) {
        if (!text) return;
        const tooltip = getTooltipElement();
        tooltip.textContent = text;
        tooltip.style.display = 'block';
        tooltip.setAttribute('aria-hidden', 'false');
        positionTooltip(trigger, tooltip);
        trigger.setAttribute('aria-describedby', tooltip.id);
        activeTooltip = tooltip;
        activeTrigger = trigger;
      }

      function hide() {
        if (!activeTooltip) return;
        activeTooltip.style.display = 'none';
        activeTooltip.setAttribute('aria-hidden', 'true');
        if (activeTrigger) activeTrigger.removeAttribute('aria-describedby');
        activeTooltip = null;
        activeTrigger = null;
      }

      document.addEventListener('mouseenter', (e) => {
        const trigger = e.target.closest && e.target.closest('[data-tooltip]');
        if (trigger) show(trigger, trigger.getAttribute('data-tooltip'));
      }, true);

      document.addEventListener('mouseleave', (e) => {
        const trigger = e.target.closest && e.target.closest('[data-tooltip]');
        if (trigger && trigger === activeTrigger) hide();
      }, true);

      document.addEventListener('focusin', (e) => {
        const trigger = e.target.closest && e.target.closest('[data-tooltip]');
        if (trigger) show(trigger, trigger.getAttribute('data-tooltip'));
      }, true);

      document.addEventListener('focusout', (e) => {
        const trigger = e.target.closest && e.target.closest('[data-tooltip]');
        if (trigger && trigger === activeTrigger) hide();
      }, true);

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && activeTooltip) hide();
      });

      document.addEventListener('pointerdown', (e) => {
        if (activeTooltip && !e.target.closest('[data-tooltip]') && !e.target.closest('#universal-tooltip-popover')) {
          hide();
        }
      });
    })();

    // API Explorer
    function setApi(endpoint) {
      document.getElementById('apiEndpoint').value = endpoint;
      executeApiCall();
    }

    async function executeApiCall() {
      const method = document.getElementById('apiMethod').value;
      const endpoint = document.getElementById('apiEndpoint').value;
      const out = document.getElementById('apiResponse');
      const start = Date.now();

      try {
        const res = await fetch(endpoint, { method });
        const latency = Date.now() - start;
        document.getElementById('apiTiming').textContent = latency + 'ms (HTTP ' + res.status + ')';
        const data = await res.json();
        out.textContent = JSON.stringify(data, null, 2);
      } catch (err) {
        out.textContent = 'Error: ' + err.message;
      }
    }
  </script>
</body>
</html>`;
}
