export function getDashboardHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cricket Platform — Interactive Testing Console</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-dark: #090D16;
      --bg-card: rgba(18, 24, 38, 0.75);
      --bg-card-solid: #111726;
      --border-subtle: rgba(255, 255, 255, 0.08);
      --border-accent: rgba(16, 185, 129, 0.3);
      --text-main: #F1F5F9;
      --text-muted: #94A3B8;
      --primary: #10B981;
      --primary-glow: rgba(16, 185, 129, 0.25);
      --amber: #F59E0B;
      --cyan: #06B6D4;
      --rose: #F43F5E;
      --purple: #8B5CF6;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg-dark);
      background-image: 
        radial-gradient(circle at 15% 15%, rgba(16, 185, 129, 0.08) 0%, transparent 40%),
        radial-gradient(circle at 85% 85%, rgba(6, 182, 212, 0.08) 0%, transparent 40%);
      color: var(--text-main);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
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
      background: linear-gradient(135deg, #10B981, #06B6D4);
      width: 42px;
      height: 42px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
    }

    .brand-title {
      font-family: 'Outfit', sans-serif;
      font-weight: 700;
      font-size: 1.25rem;
      letter-spacing: -0.02em;
    }

    .brand-subtitle {
      font-size: 0.75rem;
      color: var(--text-muted);
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .header-status {
      display: flex;
      align-items: center;
      gap: 1.25rem;
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
      font-family: 'Outfit', sans-serif;
      font-size: 0.95rem;
      font-weight: 600;
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
      backdrop-filter: blur(12px);
      border: 1px solid var(--border-subtle);
      border-radius: 14px;
      padding: 1.5rem;
      position: relative;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    }

    .card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
    }

    .card-title {
      font-family: 'Outfit', sans-serif;
      font-size: 1.15rem;
      font-weight: 700;
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
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(6, 182, 212, 0.08));
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 16px;
      padding: 1.75rem;
      margin-bottom: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1.5rem;
    }

    .match-info h2 {
      font-family: 'Outfit', sans-serif;
      font-size: 1.4rem;
      font-weight: 700;
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
      font-family: 'Outfit', sans-serif;
      font-size: 3rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #FFF;
      text-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
    }

    .overs-score {
      font-family: 'Outfit', sans-serif;
      font-size: 1.35rem;
      color: var(--amber);
      font-weight: 600;
    }

    .rate-badge {
      background: rgba(255, 255, 255, 0.08);
      padding: 0.35rem 0.75rem;
      border-radius: 6px;
      font-size: 0.8rem;
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
      width: 34px;
      height: 34px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Outfit', sans-serif;
      font-weight: 700;
      font-size: 0.85rem;
      background: rgba(255, 255, 255, 0.06);
      color: var(--text-main);
      border: 1px solid var(--border-subtle);
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      animation: popBall 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes popBall {
      0% { transform: scale(0.5); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }

    .ball-bubble.dot { color: var(--text-muted); }
    .ball-bubble.single { color: var(--text-main); }
    .ball-bubble.four { background: rgba(16, 185, 129, 0.25); color: #10B981; border-color: #10B981; }
    .ball-bubble.six { background: rgba(139, 92, 246, 0.25); color: #A78BFA; border-color: #8B5CF6; }
    .ball-bubble.wicket { background: rgba(244, 63, 94, 0.3); color: #FB7185; border-color: #F43F5E; }
    .ball-bubble.extra { background: rgba(245, 158, 11, 0.25); color: #FBBF24; border-color: #F59E0B; }

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
      font-size: 1.15rem;
      font-weight: 700;
      font-family: 'Outfit', sans-serif;
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
      font-family: 'Outfit', sans-serif;
      font-size: 1.25rem;
      font-weight: 700;
      padding: 0.9rem 0;
      cursor: pointer;
      transition: all 0.15s ease;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .pad-btn:hover {
      transform: translateY(-2px);
      border-color: rgba(255, 255, 255, 0.25);
    }

    .pad-btn:active {
      transform: scale(0.96);
    }

    .pad-btn.boundary-4 {
      background: rgba(6, 182, 212, 0.15);
      border-color: rgba(6, 182, 212, 0.4);
      color: var(--cyan);
    }

    .pad-btn.boundary-6 {
      background: rgba(16, 185, 129, 0.2);
      border-color: rgba(16, 185, 129, 0.5);
      color: var(--primary);
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
      background: var(--primary);
      color: #052E16;
      border: none;
      border-radius: 8px;
      padding: 0.75rem 1.25rem;
      font-family: 'Outfit', sans-serif;
      font-weight: 700;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
    }

    .btn:hover {
      background: #34D399;
      box-shadow: 0 0 15px var(--primary-glow);
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.08);
      color: var(--text-main);
    }

    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.14);
      box-shadow: none;
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
  </style>
</head>
<body>
  <!-- Header -->
  <header>
    <div class="brand">
      <div class="brand-logo">🏏</div>
      <div>
        <div class="brand-title">Cricket Platform</div>
        <div class="brand-subtitle">Interactive Operations & Test Console</div>
      </div>
    </div>
    <div class="header-status">
      <div class="status-pill" id="healthPill">
        <div class="pulse-dot"></div>
        <span id="healthText">Connecting...</span>
      </div>
      <div style="font-size: 0.85rem; color: var(--text-muted);">
        Port: <span style="color: var(--primary); font-family: monospace;">3000</span>
      </div>
    </div>
  </header>

  <!-- Navigation Tabs -->
  <div class="tabs-bar">
    <button class="tab-btn active" onclick="switchTab('scoring')">🏏 Live Match Scoring</button>
    <button class="tab-btn" onclick="switchTab('marketplace')">🛒 Marketplace & Booking</button>
    <button class="tab-btn" onclick="switchTab('tournaments')">🏆 Tournaments & Fixtures</button>
    <button class="tab-btn" onclick="switchTab('incidents')">🛡️ Incidents & Reputation</button>
    <button class="tab-btn" onclick="switchTab('explorer')">⚡ Live API Explorer</button>
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
      </div>

      <div class="grid-2">
        <!-- Ball-by-Ball Scoring Pad -->
        <div class="card">
          <div class="card-title">⚡ Interactive Ball-by-Ball Scoring Pad</div>
          <div class="card-desc">Click delivery buttons to trigger real-time scoring events via Fastify <code>POST /api/v1/matches/:id/score-events</code></div>

          <div class="pad-grid">
            <button class="pad-btn" onclick="scoreDelivery(0, 0, 'NONE', true)">0<span>Dot</span></button>
            <button class="pad-btn" onclick="scoreDelivery(1, 0, 'NONE', true)">1<span>Single</span></button>
            <button class="pad-btn" onclick="scoreDelivery(2, 0, 'NONE', true)">2<span>Double</span></button>
            <button class="pad-btn" onclick="scoreDelivery(3, 0, 'NONE', true)">3<span>Triple</span></button>
            <button class="pad-btn boundary-4" onclick="scoreDelivery(4, 0, 'NONE', true)">4 FOUR<span>Boundary</span></button>
            <button class="pad-btn boundary-6" onclick="scoreDelivery(6, 0, 'NONE', true)">6 SIX<span>Maximum</span></button>
            <button class="pad-btn wicket" onclick="scoreDelivery(0, 0, 'NONE', true, true)">W WICKET<span>Out</span></button>
            <button class="pad-btn extra" onclick="scoreDelivery(0, 1, 'WIDE', false)">Wd WIDE<span>+1 Run</span></button>
            <button class="pad-btn extra" onclick="scoreDelivery(0, 1, 'NO_BALL', false)">Nb NO BALL<span>+1 Run</span></button>
            <button class="pad-btn extra" onclick="scoreDelivery(0, 1, 'BYE', true)">B BYE<span>+1 Run</span></button>
            <button class="pad-btn extra" onclick="scoreDelivery(0, 1, 'LEG_BYE', true)">Lb LEG BYE<span>+1 Run</span></button>
            <button class="pad-btn btn-secondary" onclick="resetMatchScore()">↺ RESET<span>New Innings</span></button>
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
            <button class="btn" onclick="executeCheckoutAndPay()">💳 Confirm Order & Simulate Payment Webhook</button>
            <button class="btn btn-secondary" onclick="simulateHoldSlot()">⏱️ Hold Slot (15-min TTL)</button>
          </div>

          <div id="bookingConfirmation" style="margin-top: 1rem; font-size: 0.85rem; color: var(--primary); display: none;">
            ✓ Booking Confirmed & Payment Webhook Idempotently Processed!
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 3: TOURNAMENTS & FIXTURES -->
    <div id="tab-tournaments" class="tab-pane">
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

          <button class="btn" onclick="generateTournamentFixtures()">⚡ Create Tournament & Generate Round-Robin Fixtures</button>

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
              <tr>
                <td>Northside XI</td>
                <td>3</td>
                <td>2</td>
                <td>1</td>
                <td><strong style="color: var(--primary);">4</strong></td>
                <td>+0.85</td>
              </tr>
              <tr>
                <td>Royal Strikers</td>
                <td>3</td>
                <td>2</td>
                <td>1</td>
                <td><strong style="color: var(--primary);">4</strong></td>
                <td>+0.32</td>
              </tr>
              <tr>
                <td>Riverside XI</td>
                <td>3</td>
                <td>1</td>
                <td>2</td>
                <td><strong style="color: var(--text-main);">2</strong></td>
                <td>-0.42</td>
              </tr>
              <tr>
                <td>Coastal Titans</td>
                <td>3</td>
                <td>1</td>
                <td>2</td>
                <td><strong style="color: var(--text-main);">2</strong></td>
                <td>-0.75</td>
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

          <button class="btn" style="background: var(--rose); color: #FFF;" onclick="logIncidentAndFindReplacement()">🚨 Open Incident & Propose Emergency Replacement</button>

          <div id="replacementResult" style="margin-top: 1.25rem;"></div>
        </div>

        <div class="card">
          <div class="card-title">⭐ Provider Trust & Reputation Engine</div>
          <div class="card-desc">Event-sourced projections: reliability delta applied automatically</div>

          <div style="background: rgba(0, 0, 0, 0.3); border-radius: 10px; padding: 1.25rem; margin-bottom: 1.25rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <span style="font-weight: 600;">Harbour Cricket Grounds</span>
              <span style="background: rgba(16, 185, 129, 0.15); color: var(--primary); padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.75rem;">VERIFIED</span>
            </div>
            <div style="display: flex; gap: 2rem; margin-top: 0.75rem;">
              <div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">Avg Rating</div>
                <div style="font-size: 1.5rem; font-weight: 700; color: var(--amber);">4.8 / 5.0</div>
              </div>
              <div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">Reliability Score</div>
                <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary);" id="providerReliability">98.5%</div>
              </div>
            </div>
          </div>

          <div style="display: flex; gap: 0.75rem;">
            <button class="btn btn-secondary" onclick="applyReputationEvent('MATCH_COMPLETED')">✓ Match Completed (+1%)</button>
            <button class="btn btn-secondary" style="color: var(--rose);" onclick="applyReputationEvent('NO_SHOW')">✗ No-Show Penalty (-15%)</button>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 5: API EXPLORER -->
    <div id="tab-explorer" class="tab-pane">
      <div class="card">
        <div class="card-title">⚡ Live API Endpoint Runner</div>
        <div class="card-desc">Execute requests directly against the running Fastify instance</div>

        <div style="display: flex; gap: 0.75rem; margin-bottom: 1rem;">
          <select id="apiMethod" style="width: 120px;">
            <option value="GET">GET</option>
            <option value="POST">POST</option>
          </select>
          <input type="text" id="apiEndpoint" value="/health" style="flex: 1;">
          <button class="btn" style="width: 140px;" onclick="executeApiCall()">Run Request</button>
        </div>

        <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap;">
          <button class="btn btn-secondary" style="width: auto; padding: 0.35rem 0.75rem; font-size: 0.8rem;" onclick="setApi('/health')">/health</button>
          <button class="btn btn-secondary" style="width: auto; padding: 0.35rem 0.75rem; font-size: 0.8rem;" onclick="setApi('/api/v1/marketplace/listings')">/marketplace/listings</button>
          <button class="btn btn-secondary" style="width: auto; padding: 0.35rem 0.75rem; font-size: 0.8rem;" onclick="setApi('/api/v1/events')">/events</button>
          <button class="btn btn-secondary" style="width: auto; padding: 0.35rem 0.75rem; font-size: 0.8rem;" onclick="setApi('/api/v1/operations/dashboard')">/operations/dashboard</button>
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
    let currentOverBalls = [];
    const matchId = 'match-pilot-1';

    function renderScoreState(state, event, eventType) {
      if (!state) return;
      runs = state.runs ?? 0;
      wickets = state.wickets ?? 0;
      legalBalls = state.legal_balls ?? 0;

      document.getElementById('scoreRunsWickets').textContent = runs + '/' + wickets;
      document.getElementById('scoreOvers').textContent = '(' + (state.overs_display || '0.0') + ' ov)';
      const crr = legalBalls > 0 ? ((runs / legalBalls) * 6).toFixed(2) : '0.00';
      document.getElementById('scoreRunRate').textContent = 'CRR: ' + crr;

      // Update Over Ball Strip
      if (event) {
        if (state.legal_balls > 0 && state.legal_balls % 6 === 0 && event.legal_ball && eventType === 'OVER_COMPLETED') {
          // Add final ball of completed over, then clear after delay
          addBallBubble(event);
        } else {
          addBallBubble(event);
        }
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

    function addBallBubble(event) {
      const strip = document.getElementById('overBallStrip');
      const bubble = document.createElement('div');

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

      if (strip.children.length === 1 && strip.children[0].textContent === '•' && !event.legal_ball && event.bat_runs === 0 && event.extra_runs === 0) {
        strip.innerHTML = '';
      }
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
          const badge = document.getElementById('sseStatusBadge');
          if (badge) {
            badge.style.borderColor = 'rgba(16, 185, 129, 0.5)';
            document.getElementById('sseStatusText').textContent = 'SSE Stream: Connected (Live)';
          }
        };

        source.onerror = () => {
          const badge = document.getElementById('sseStatusBadge');
          if (badge) {
            badge.style.borderColor = 'rgba(245, 158, 11, 0.5)';
            document.getElementById('sseStatusText').textContent = 'SSE Stream: Reconnecting...';
          }
        };
      } catch (err) {
        console.warn('SSE not supported or failed to connect:', err);
      }
    }
    initSseStream();

    function logFeedItem(state, event) {
      const feed = document.getElementById('scoringFeed');
      if (!feed) return;
      const item = document.createElement('div');
      item.className = 'feed-item';
      let desc = event.is_wicket ? '🛑 WICKET!' : (event.bat_runs === 4 ? '🏏 FOUR!' : (event.bat_runs === 6 ? '🚀 SIX!' : (event.extra_type !== 'NONE' ? event.extra_type + ' (+' + event.extra_runs + ')' : event.bat_runs + ' run(s)')));
      item.innerHTML = '<span>Ball ' + state.overs_display + ' — ' + desc + '</span><span style=\"color: var(--text-muted); font-weight: 600;\">' + state.runs + '/' + state.wickets + '</span>';
      feed.prepend(item);
    }

    async function scoreDelivery(batRuns, extraRuns, extraType, legalBall, isWicket = false) {
      sequence++;
      const res = await fetch('/api/v1/scoring/matches/' + matchId + '/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_event_id: 'evt-' + Date.now(),
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
        // The SSE stream will broadcast this, but we update locally for instant responsiveness
        renderScoreState(data.state, { bat_runs: batRuns, extra_runs: extraRuns, extra_type: extraType, legal_ball: legalBall, is_wicket: isWicket }, data.broadcast_type);
        let desc = isWicket ? '🛑 WICKET!' : (batRuns === 4 ? '🏏 FOUR!' : (batRuns === 6 ? '🚀 SIX!' : (extraType !== 'NONE' ? extraType + ' (+1)' : batRuns + ' run(s)')));
        showToast('Delivered: ' + desc);
      }
    }

    function resetMatchScore() {
      runs = 0; wickets = 0; legalBalls = 0; sequence = 0;
      document.getElementById('scoreRunsWickets').textContent = '0/0';
      document.getElementById('scoreOvers').textContent = '(0.0 ov)';
      document.getElementById('scoreRunRate').textContent = 'CRR: 0.00';
      document.getElementById('overBallStrip').innerHTML = '<div class="ball-bubble dot">•</div>';
      document.getElementById('overSummaryText').textContent = 'Waiting for over to commence...';
      document.getElementById('scoringFeed').innerHTML = '<div class="feed-item" style="color: var(--text-muted);">New innings initialized.</div>';
      showToast('Match scoreboard reset');
    }

    // Marketplace load
    async function loadListings() {
      const container = document.getElementById('listingsContainer');
      try {
        const res = await fetch('/api/v1/marketplace/listings');
        const listings = await res.json();
        container.innerHTML = listings.map(l => \`
          <div style="background: rgba(0,0,0,0.3); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 0.85rem; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 600;">\${l.title}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">Category: \${l.category} • \${l.pricing_model || 'FIXED'}</div>
            </div>
            <div style="text-align: right;">
              <div style="font-weight: 700; color: var(--primary);">₹\${(l.base_price_minor / 100).toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
              <button class="btn btn-secondary" style="width: auto; padding: 0.25rem 0.65rem; font-size: 0.75rem; margin-top: 0.35rem;" onclick="selectListing('\${l.title}', \${l.base_price_minor})">Select</button>
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
          <button class="btn" style="padding: 0.4rem; font-size: 0.8rem; margin-top: 0.35rem;" onclick="acceptReplacement('\${prop.id}')">Accept Replacement</button>
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

    // Reputation event
    let currentScore = 0.985;
    async function applyReputationEvent(eventType) {
      const res = await fetch('/api/v1/reputation/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider_id: '00000000-0000-0000-0000-000000000002',
          event_type: eventType
        })
      });
      const data = await res.json();
      currentScore = Math.max(0, Math.min(1, currentScore + data.score_delta));
      document.getElementById('providerReliability').textContent = (currentScore * 100).toFixed(1) + '%';
      showToast('Reputation delta applied: ' + (data.score_delta > 0 ? '+' : '') + (data.score_delta * 100).toFixed(1) + '%');
    }

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
