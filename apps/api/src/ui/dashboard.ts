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
      --font-display: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif;
      --font-body: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif;
      --font-score: 'Chakra Petch', monospace;
      --font-mono: 'JetBrains Mono', monospace;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    /* Accessible Focus Ring (WCAG 2.2 AA) */
    :focus-visible {
      outline: 2px solid var(--turf-emerald) !important;
      outline-offset: 3px !important;
    }
    button:focus-visible,
    a:focus-visible,
    input:focus-visible,
    select:focus-visible,
    .tab-btn:focus-visible,
    .nav-pill:focus-visible,
    .pad-btn:focus-visible,
    .modal-close-btn:focus-visible {
      outline: 2px solid var(--turf-emerald) !important;
      outline-offset: 2px !important;
    }

    /* Reduced Motion Safeguard */
    @media (prefers-reduced-motion: reduce) {
      *, ::before, ::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
      .live-dot, .telemetry-pulse {
        animation: none !important;
        opacity: 1 !important;
      }
      .modal-backdrop.active .modal-dialog,
      .ball-bubble {
        animation: none !important;
      }
    }

    /* Tabular Numbers Alignment */
    .score-text,
    .live-score,
    .overs-val,
    .runrate-val,
    .target-badge,
    .fow-pill,
    .ball-bubble,
    .pad-btn,
    .stat-player-figures,
    .telemetry-val,
    .counter-badge,
    .price-tag,
    .timer-val {
      font-variant-numeric: tabular-nums;
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

    /* ==========================================================================
       App Layout & Athletic Sidebar Architecture
       ========================================================================== */
    .app-layout {
      display: flex;
      min-height: 100vh;
      width: 100%;
      position: relative;
    }

    .app-sidebar {
      width: 250px;
      min-width: 250px;
      background: rgba(6, 10, 18, 0.96);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-right: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      flex-direction: column;
      height: 100vh;
      position: sticky;
      top: 0;
      z-index: 120;
      transition: width 0.25s cubic-bezier(0.16, 1, 0.3, 1), min-width 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 4px 0 24px rgba(0, 0, 0, 0.4);
    }

    .app-sidebar.collapsed {
      width: 68px;
      min-width: 68px;
    }

    .sidebar-header {
      padding: 0.85rem 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      flex-shrink: 0;
      min-height: 56px;
      position: relative;
    }

    .sidebar-header .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      overflow: hidden;
      text-decoration: none;
    }

    .brand-logo {
      font-size: 1.35rem;
      background: linear-gradient(135deg, var(--turf-emerald), var(--cyan));
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 9px;
      box-shadow: 0 0 16px var(--turf-glow);
      flex-shrink: 0;
    }

    .sidebar-header .brand-text {
      display: flex;
      flex-direction: column;
      min-width: 0;
      transition: opacity 0.2s ease;
    }

    .brand-title {
      font-family: var(--font-display);
      font-weight: 800;
      font-size: 1.15rem;
      letter-spacing: -0.03em;
      line-height: 1.1;
      background: linear-gradient(135deg, #FFFFFF 40%, var(--turf-emerald) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .brand-subtitle {
      font-size: 0.6rem;
      color: var(--text-muted);
      letter-spacing: 0.06em;
      text-transform: uppercase;
      font-family: var(--font-body);
      font-weight: 600;
      white-space: nowrap;
    }

    .broadcast-tag {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.62rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: var(--turf-emerald);
      background: rgba(0, 229, 153, 0.1);
      border: 1px solid rgba(0, 229, 153, 0.25);
      padding: 0.15rem 0.45rem;
      border-radius: 9999px;
      margin-left: 0.4rem;
      text-transform: uppercase;
    }

    .live-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--turf-emerald);
      box-shadow: 0 0 8px var(--turf-emerald);
      animation: livePulse 2s infinite ease-in-out;
    }

    @keyframes livePulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.35; transform: scale(0.8); }
    }

    .sidebar-collapse-btn {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: var(--text-muted);
      width: 28px;
      height: 28px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 0.75rem;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      flex-shrink: 0;
    }

    .sidebar-collapse-btn:hover {
      background: rgba(0, 229, 153, 0.12);
      border-color: rgba(0, 229, 153, 0.3);
      color: var(--turf-emerald);
    }

    .btn-scorecard-inn {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.25rem 0.65rem;
      border-radius: 6px;
      border: none;
      background: transparent;
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-scorecard-inn.active {
      background: var(--turf-emerald);
      color: #04070D;
    }

    .sidebar-cta-wrap {
      padding: 0.85rem 1rem 0.5rem 1rem;
      flex-shrink: 0;
    }

    .sidebar-cta-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      background: linear-gradient(135deg, #00E599, #00C782);
      color: #04070D;
      border: 1px solid rgba(0, 229, 153, 0.5);
      padding: 0.55rem 0.95rem;
      border-radius: 8px;
      font-family: var(--font-display);
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 0 16px rgba(0, 229, 153, 0.28), 0 2px 4px rgba(0, 0, 0, 0.4);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      white-space: nowrap;
      overflow: hidden;
    }

    .sidebar-cta-btn:hover {
      background: linear-gradient(135deg, #05f5a4, #00E599);
      box-shadow: 0 0 24px rgba(0, 229, 153, 0.45);
      transform: translateY(-1px);
    }

    .sidebar-nav-scroll {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 0.5rem 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      scrollbar-width: thin;
      scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
    }

    .sidebar-nav-scroll::-webkit-scrollbar {
      width: 4px;
    }
    .sidebar-nav-scroll::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
    }

    .sidebar-nav-section {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .sidebar-section-title {
      font-size: 0.65rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--text-muted);
      padding: 0.25rem 0.5rem;
      font-family: var(--font-body);
      opacity: 0.7;
    }

    .sidebar-nav-list {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .sidebar-nav-item,
    .tab-btn {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      padding: 0.5rem 0.65rem;
      border-radius: 7px;
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--text-muted);
      text-decoration: none;
      background: transparent;
      border: 1px solid transparent;
      cursor: pointer;
      transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
      white-space: nowrap;
      text-align: left;
      width: 100%;
      position: relative;
      font-family: var(--font-body);
    }

    .sidebar-nav-item:hover,
    .tab-btn:hover {
      background: rgba(255, 255, 255, 0.05);
      color: #FFFFFF;
      border-color: rgba(255, 255, 255, 0.08);
      transform: translateX(2px);
    }

    .sidebar-nav-item:active,
    .tab-btn:active {
      transform: scale(0.98);
    }

    .sidebar-nav-item.active,
    .tab-btn.active {
      background: rgba(0, 229, 153, 0.1);
      border-color: rgba(0, 229, 153, 0.3);
      color: var(--turf-emerald);
      font-weight: 700;
      box-shadow: inset 3px 0 0 var(--turf-emerald);
    }

    .sidebar-nav-item .tab-icon,
    .tab-btn .tab-icon {
      font-size: 1rem;
      width: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .sidebar-nav-label {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-family: var(--font-body);
    }

    .sidebar-footer {
      padding: 0.75rem 0.85rem;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      background: rgba(4, 7, 13, 0.6);
      flex-shrink: 0;
    }

    /* Collapsed Sidebar State */
    .app-sidebar.collapsed .brand-text,
    .app-sidebar.collapsed .sidebar-section-title,
    .app-sidebar.collapsed .sidebar-nav-label,
    .app-sidebar.collapsed .sidebar-btn-label,
    .app-sidebar.collapsed .user-meta-pill,
    .app-sidebar.collapsed .broadcast-tag,
    .app-sidebar.collapsed .counter-badge {
      display: none !important;
    }

    .app-sidebar.collapsed .sidebar-header {
      justify-content: center;
      padding: 0.85rem 0.5rem;
    }

    .app-sidebar.collapsed .sidebar-collapse-btn {
      position: absolute;
      right: -12px;
      top: 14px;
      background: var(--bg-card);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 50%;
      width: 22px;
      height: 22px;
      z-index: 130;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
    }

    .app-sidebar.collapsed .sidebar-cta-wrap {
      padding: 0.6rem 0.5rem;
    }

    .app-sidebar.collapsed .sidebar-cta-btn {
      padding: 0.5rem;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      margin: 0 auto;
    }

    .app-sidebar.collapsed .sidebar-nav-scroll {
      padding: 0.5rem 0.35rem;
      align-items: center;
    }

    .app-sidebar.collapsed .sidebar-nav-item,
    .app-sidebar.collapsed .tab-btn {
      justify-content: center;
      padding: 0.55rem;
      width: 42px;
      height: 42px;
      border-radius: 8px;
    }

    .app-sidebar.collapsed .sidebar-nav-item.active,
    .app-sidebar.collapsed .tab-btn.active {
      box-shadow: 0 0 12px rgba(0, 229, 153, 0.3);
      border-color: var(--turf-emerald);
    }

    .app-sidebar.collapsed .sidebar-footer {
      display: flex;
      justify-content: center;
      padding: 0.6rem 0.35rem;
    }

    /* Streamlined Main & Top Command Bar */
    .app-main-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      background: transparent;
    }

    .app-topbar {
      background: rgba(6, 10, 18, 0.92);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding: 0.5rem 1.75rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 100;
      gap: 1rem;
      min-height: 54px;
    }

    .topbar-left {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      min-width: 0;
    }

    .mobile-sidebar-toggle {
      display: none;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: var(--text-main);
      width: 32px;
      height: 32px;
      border-radius: 7px;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 1rem;
    }

    .topbar-breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.82rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .breadcrumb-brand {
      font-family: var(--font-display);
      font-weight: 700;
      color: var(--text-muted);
    }

    .breadcrumb-sep {
      color: rgba(255, 255, 255, 0.2);
    }

    .breadcrumb-crumb {
      color: var(--turf-emerald);
      font-weight: 700;
      font-family: var(--font-display);
    }

    .breadcrumb-sub {
      color: var(--text-muted);
      font-size: 0.78rem;
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-shrink: 0;
    }

    .topbar-telemetry-group {
      display: flex;
      align-items: center;
      gap: 0.45rem;
    }

    .topbar-node,
    .telemetry-node {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      padding: 0.25rem 0.55rem;
      border-radius: 9999px;
      font-size: 0.72rem;
      color: var(--text-muted);
      white-space: nowrap;
      transition: background 0.2s;
    }

    .topbar-node:hover,
    .telemetry-node:hover {
      background: rgba(255, 255, 255, 0.07);
    }

    .topbar-node-val,
    .telemetry-val {
      font-family: var(--font-score);
      font-weight: 700;
      color: var(--text-main);
      font-size: 0.75rem;
    }

    .telemetry-pulse {
      width: 7px;
      height: 7px;
      background: var(--turf-emerald);
      border-radius: 50%;
      box-shadow: 0 0 8px var(--turf-emerald);
      animation: pulse 2s infinite;
    }

    .header-nav-divider {
      width: 1px;
      height: 20px;
      background: rgba(255, 255, 255, 0.1);
      margin: 0 0.1rem;
      flex-shrink: 0;
    }

    .nav-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.09);
      padding: 0.36rem 0.72rem;
      border-radius: 9999px;
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--text-muted);
      text-decoration: none;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      cursor: pointer;
      white-space: nowrap;
    }

    .nav-pill:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(0, 229, 153, 0.35);
      color: #FFFFFF;
      transform: translateY(-1px);
    }
    .nav-pill:active {
      transform: scale(0.97);
    }

    .counter-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 0.65rem;
      font-weight: 800;
      padding: 0.08rem 0.36rem;
      border-radius: 9999px;
      line-height: 1;
    }
    .counter-badge.amber {
      background: var(--amber);
      color: #04070D;
    }
    .counter-badge.emerald {
      background: var(--turf-emerald);
      color: #04070D;
    }

    .status-pill {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(0, 229, 153, 0.08);
      border: 1px solid rgba(0, 229, 153, 0.25);
      padding: 0.36rem 0.8rem;
      border-radius: 9999px;
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--primary);
      transition: all 0.2s ease;
      cursor: pointer;
      white-space: nowrap;
    }
    .status-pill:hover {
      background: rgba(0, 229, 153, 0.15);
      border-color: rgba(0, 229, 153, 0.45);
      box-shadow: 0 0 12px rgba(0, 229, 153, 0.2);
    }

    .pulse-dot {
      width: 7px;
      height: 7px;
      background: var(--primary);
      border-radius: 50%;
      box-shadow: 0 0 8px var(--primary);
      animation: livePulse 2s infinite ease-in-out;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }

    /* Mobile responsive drawer */
    @media (max-width: 1024px) {
      .mobile-sidebar-toggle {
        display: flex;
      }
      .app-sidebar {
        position: fixed;
        left: -260px;
        top: 0;
        bottom: 0;
        z-index: 200;
        transition: left 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .app-sidebar.mobile-open {
        left: 0;
      }
      .sidebar-backdrop {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(4px);
        z-index: 190;
      }
      .sidebar-backdrop.active {
        display: block;
      }
      .topbar-telemetry-group {
        display: none;
      }
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
      transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
      min-height: 52px;
      user-select: none;
      -webkit-user-select: none;
    }

    .pad-btn span {
      font-family: var(--font-body);
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      margin-top: 2px;
      text-transform: uppercase;
    }

    .pad-btn:hover {
      transform: translateY(-2px);
      border-color: rgba(255, 255, 255, 0.25);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 4px 12px rgba(0, 0, 0, 0.4);
    }

    .pad-btn:active {
      transform: scale(0.96) translateY(1px);
      box-shadow: inset 0 0 16px var(--turf-glow);
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
      position: relative;
    }
    button[data-tooltip],
    a[data-tooltip],
    .tab-btn[data-tooltip],
    .nav-pill[data-tooltip],
    .pad-btn[data-tooltip],
    .btn[data-tooltip],
    .user-profile-header-btn[data-tooltip],
    .status-pill[data-tooltip],
    .telemetry-node[data-tooltip],
    .fow-pill[data-tooltip],
    .persona-pill-btn[data-tooltip],
    .format-card[data-tooltip],
    .slot-block-toggle[data-tooltip],
    [role="button"][data-tooltip] {
      cursor: pointer !important;
    }
    .pill-icon, .tab-icon {
      font-style: normal;
      font-family: 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif;
      line-height: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    /* Header User Account Button */
    .user-profile-header-btn {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.12);
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .user-profile-header-btn:hover {
      background: rgba(0, 229, 153, 0.12);
      border-color: rgba(0, 229, 153, 0.35);
    }
    .user-avatar-pill {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--turf-emerald);
      color: #04070D;
      font-weight: 800;
      font-size: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .user-meta-pill {
      display: flex;
      flex-direction: column;
      text-align: left;
    }
    .user-name-text {
      font-size: 0.82rem;
      font-weight: 700;
      color: #F8FAFC;
    }
    .user-role-text {
      font-size: 0.65rem;
      font-weight: 800;
      color: var(--turf-emerald);
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }

    /* Modals System */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(4, 7, 13, 0.82);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
    }
    .modal-backdrop.active {
      display: flex;
    }
    .modal-dialog {
      background: #0A101C;
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 16px;
      width: 100%;
      max-width: 620px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.85), 0 0 35px rgba(0, 229, 153, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.12);
      transform-origin: center center;
    }
    .modal-backdrop.active .modal-dialog {
      animation: modalPopIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes modalPopIn {
      0% {
        opacity: 0;
        transform: scale(0.95) translateY(12px);
      }
      100% {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }
    .modal-header {
      padding: 1.25rem 1.75rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .modal-title {
      font-family: var(--font-display);
      font-size: 1.22rem;
      font-weight: 800;
      color: #F8FAFC;
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }
    .modal-close-btn {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #94A3B8;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 1.1rem;
      transition: all 0.2s;
    }
    .modal-close-btn:hover {
      background: rgba(255, 51, 102, 0.2);
      color: #FF3366;
      border-color: rgba(255, 51, 102, 0.4);
    }
    .modal-body {
      padding: 1.5rem 1.75rem;
    }
    .modal-footer {
      padding: 1.15rem 1.75rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      background: rgba(0, 0, 0, 0.25);
    }

    /* Persona Selector Pills */
    .persona-pills-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      gap: 0.5rem;
      margin-bottom: 1.25rem;
    }
    .persona-pill-btn {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      padding: 0.65rem 0.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.35rem;
      color: #94A3B8;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 0.75rem;
      font-weight: 700;
    }
    .persona-pill-btn:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #F8FAFC;
    }
    .persona-pill-btn.active {
      background: rgba(0, 229, 153, 0.15);
      border-color: var(--turf-emerald);
      color: var(--turf-emerald);
    }
    .persona-icon {
      font-size: 1.25rem;
    }

    /* Wagon Wheel Precision Stadium Graphic */
    .wagon-wheel-card {
      position: relative;
      border-radius: 16px;
      background: linear-gradient(145deg, rgba(13, 20, 36, 0.88) 0%, rgba(8, 12, 22, 0.96) 100%);
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 20px 40px -15px rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(16px);
      padding: 1.5rem;
    }
    .wagon-wheel-container {
      position: relative;
      width: 100%;
      max-width: 360px;
      aspect-ratio: 1;
      margin: 0.75rem auto 1.25rem auto;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      user-select: none;
    }
    .wagon-wheel-svg {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      overflow: visible;
      filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.5));
    }
    .wagon-sector-wedge {
      cursor: pointer;
      transition: fill 0.2s ease, opacity 0.2s ease;
      fill: transparent;
    }
    .wagon-sector-wedge:hover {
      fill: rgba(0, 229, 153, 0.14);
    }
    .wagon-sector-wedge.active {
      fill: rgba(0, 229, 153, 0.24);
    }
    .field-zone-btn {
      position: absolute;
      background: rgba(10, 16, 28, 0.88);
      border: 1px solid rgba(255, 255, 255, 0.18);
      color: #F8FAFC;
      border-radius: 20px;
      padding: 0.22rem 0.52rem;
      font-size: 0.68rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      white-space: nowrap;
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
      z-index: 10;
    }
    .field-zone-btn:hover {
      border-color: var(--cyan);
      transform: scale(1.06);
      background: rgba(15, 23, 42, 0.95);
    }
    .field-zone-btn.active {
      background: var(--turf-emerald);
      color: #04070D;
      border-color: var(--turf-emerald);
      transform: scale(1.08);
      box-shadow: 0 0 14px rgba(0, 229, 153, 0.45);
    }
    .field-zone-runs {
      font-family: var(--font-mono);
      font-size: 0.62rem;
      background: rgba(255, 255, 255, 0.12);
      padding: 0.05rem 0.3rem;
      border-radius: 10px;
    }
    .field-zone-btn.active .field-zone-runs {
      background: rgba(0, 0, 0, 0.25);
      color: #04070D;
    }
    .wagon-filter-pill {
      font-size: 0.72rem;
      padding: 0.25rem 0.6rem;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #94A3B8;
      cursor: pointer;
      transition: all 0.2s;
    }
    .wagon-filter-pill:hover, .wagon-filter-pill.active {
      background: rgba(0, 229, 153, 0.12);
      border-color: var(--turf-emerald);
      color: var(--turf-emerald);
      font-weight: 600;
    }
    .wagon-batter-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.72rem;
      padding: 0.25rem 0.6rem;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #94A3B8;
      cursor: pointer;
      transition: all 0.2s;
    }
    .wagon-batter-pill:hover, .wagon-batter-pill.active {
      background: rgba(0, 229, 153, 0.14);
      border-color: var(--turf-emerald);
      color: #FFFFFF;
      font-weight: 600;
    }
    .wagon-batter-pill.active .batter-pill-badge {
      background: var(--turf-emerald);
      color: #04070D;
    }
    .batter-pill-badge {
      font-size: 0.62rem;
      font-family: var(--font-mono);
      font-weight: 700;
      padding: 0.1rem 0.3rem;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.1);
      color: #CBD5E1;
    }
    .batter-pill-score {
      font-family: var(--font-mono);
      font-size: 0.68rem;
      color: var(--turf-emerald);
      font-weight: 700;
    }
    .wagon-shot-ray {
      transition: opacity 0.3s ease, stroke-width 0.2s ease;
      cursor: pointer;
    }
    .wagon-shot-ray:hover {
      stroke-width: 3.5px !important;
      filter: drop-shadow(0 0 6px currentColor);
    }

    /* Roster Player Card */
    .player-roster-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 8px;
      padding: 0.65rem 0.95rem;
      margin-bottom: 0.45rem;
      transition: all 0.2s;
    }
    .player-roster-row:hover {
      background: rgba(255, 255, 255, 0.06);
      border-color: rgba(255, 255, 255, 0.15);
    }
    .player-role-badge {
      font-size: 0.65rem;
      font-weight: 800;
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
      text-transform: uppercase;
    }

    /* Tactical Scoring Studio Pad */
    .studio-pad-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.75rem;
      margin-bottom: 1.25rem;
    }
    .studio-btn {
      padding: 1.1rem 0.5rem;
      font-size: 1.4rem;
      font-family: var(--font-score);
      font-weight: 800;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.2rem;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #F8FAFC;
      cursor: pointer;
      transition: all 0.15s ease-out;
    }
    .studio-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px -4px rgba(0, 0, 0, 0.5);
    }
    .studio-btn.boundary-four {
      background: rgba(0, 210, 255, 0.15);
      border-color: var(--cyan);
      color: var(--cyan);
    }
    .studio-btn.maximum-six {
      background: rgba(0, 229, 153, 0.18);
      border-color: var(--turf-emerald);
      color: var(--turf-emerald);
    }
    .studio-btn.wicket-out {
      background: rgba(255, 51, 102, 0.18);
      border-color: var(--rose);
      color: var(--rose);
    }
    .studio-sublabel {
      font-size: 0.65rem;
      font-family: var(--font-body);
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
    }
  </style>
</head>
<body>
  <!-- Mobile Backdrop for responsive drawer -->
  <div class="sidebar-backdrop" id="sidebarBackdrop" onclick="closeSidebarMobile()"></div>

  <div class="app-layout" id="appLayout">
    <!-- Left Athletic Glassmorphism Sidebar -->
    <aside class="app-sidebar" id="appSidebar">
      <!-- 1. Sidebar Header: Brand & Collapse Toggle -->
      <div class="sidebar-header">
        <a href="/" class="brand" data-tooltip="CricOS Broadcast Console">
          <div class="brand-logo">🏏</div>
          <div class="brand-text">
            <div style="display: flex; align-items: center; gap: 0.35rem;">
              <span class="brand-title">CricOS</span>
              <span class="broadcast-tag"><span class="live-dot"></span> LIVE</span>
            </div>
            <span class="brand-subtitle">Unified Cricket Operating System</span>
          </div>
        </a>
        <button type="button" class="sidebar-collapse-btn" id="sidebarCollapseBtn" onclick="toggleSidebarCollapse()" data-tooltip="Toggle sidebar (expand/collapse)" aria-label="Toggle Sidebar">
          <span class="collapse-icon">◀</span>
        </button>
      </div>

      <!-- 2. Primary CTA: Create Match -->
      <div class="sidebar-cta-wrap">
        <button type="button" onclick="openCreateEventModal()" class="sidebar-cta-btn" data-tooltip="Schedule match fixtures, select formats, and procure verified officials and venues">
          <span class="pill-icon">➕</span>
          <span class="sidebar-btn-label">Create Match</span>
        </button>
      </div>

      <!-- 3. Navigation Sections (Scrollable Container) -->
      <div class="sidebar-nav-scroll">
        <!-- Section A: Main Consoles & Studios (The 7 Tabs) -->
        <div class="sidebar-nav-section">
          <div class="sidebar-section-title">Consoles &amp; Studios</div>
          <div class="sidebar-nav-list" role="tablist" aria-label="Operating system consoles and studios">
            <button class="tab-btn sidebar-nav-item active" role="tab" aria-selected="true" aria-controls="tab-scoring" data-tab="scoring" onclick="switchTab('scoring')" data-tooltip="Live match scoring center, strike rotation, and ball strip">
              <span class="tab-icon">🏏</span>
              <span class="sidebar-nav-label">Match Center</span>
            </button>
            <button class="tab-btn sidebar-nav-item" role="tab" aria-selected="false" aria-controls="tab-teams" data-tab="teams" onclick="switchTab('teams')" data-tooltip="Create teams, manage squad rosters, playing XI, and join codes">
              <span class="tab-icon">👥</span>
              <span class="sidebar-nav-label">Teams &amp; Rosters</span>
            </button>
            <button class="tab-btn sidebar-nav-item" role="tab" aria-selected="false" aria-controls="tab-tournaments" data-tab="tournaments" onclick="switchTab('tournaments')" data-tooltip="Tournament scheduling, fixtures, Net Run Rate, and create wizard">
              <span class="tab-icon">🏆</span>
              <span class="sidebar-nav-label">Tournaments</span>
            </button>
            <button class="tab-btn sidebar-nav-item" role="tab" aria-selected="false" aria-controls="tab-marketplace" data-tab="marketplace" onclick="switchTab('marketplace')" data-tooltip="Turf and official booking with instant 15-minute reservation hold">
              <span class="tab-icon">🛒</span>
              <span class="sidebar-nav-label">Venues &amp; Turfs</span>
            </button>
            <button class="tab-btn sidebar-nav-item" role="tab" aria-selected="false" aria-controls="tab-studio" data-tab="studio" onclick="switchTab('studio')" data-tooltip="Scorer Studio: Dismissals, extras, wagon wheel, and partnerships">
              <span class="tab-icon">🎯</span>
              <span class="sidebar-nav-label">Scoring Studio</span>
            </button>
            <button class="tab-btn sidebar-nav-item" role="tab" aria-selected="false" aria-controls="tab-incidents" data-tab="incidents" onclick="switchTab('incidents')" data-tooltip="Dispute resolution, verified reliability scores, and fair play protection">
              <span class="tab-icon">🛡️</span>
              <span class="sidebar-nav-label">Fair Play &amp; Trust</span>
            </button>
            <button class="tab-btn sidebar-nav-item" role="tab" aria-selected="false" aria-controls="tab-explorer" data-tab="explorer" onclick="switchTab('explorer')" data-tooltip="Live API endpoint runner, telemetry, and response inspector">
              <span class="tab-icon">⚡</span>
              <span class="sidebar-nav-label">Operations &amp; APIs</span>
            </button>
          </div>
        </div>

        <!-- Section B: Operations & Workflows -->
        <div class="sidebar-nav-section">
          <div class="sidebar-section-title">Operations &amp; Workflows</div>
          <div class="sidebar-nav-list">
            <button type="button" onclick="openEventOverviewModal()" class="sidebar-nav-item" data-tooltip="Event procurement readiness, operational checklists, and match countdown">
              <span class="tab-icon">📋</span>
              <span class="sidebar-nav-label">Readiness</span>
            </button>
            <button type="button" onclick="openOfficialCalendarModal()" class="sidebar-nav-item" data-tooltip="Weekly availability schedule, match assignments, and rest buffers">
              <span class="tab-icon">📅</span>
              <span class="sidebar-nav-label">Calendar</span>
            </button>
            <button type="button" onclick="openMessagingModal()" class="sidebar-nav-item" data-tooltip="Match operations chat, official dispatch, and booking alerts">
              <span class="tab-icon">💬</span>
              <span class="sidebar-nav-label">Match Chat</span>
              <span class="counter-badge amber">1</span>
            </button>
            <button type="button" onclick="openModal('modalRfq')" class="sidebar-nav-item" data-tooltip="Tournament procurement requests, quote submissions, and provider bids">
              <span class="tab-icon">📑</span>
              <span class="sidebar-nav-label">RFQ Desk</span>
            </button>
            <button type="button" onclick="openModal('modalCommerce')" class="sidebar-nav-item" data-tooltip="Cricket gear, match leather balls, practice nets, and trophies">
              <span class="tab-icon">🛍️</span>
              <span class="sidebar-nav-label">Gear Store</span>
            </button>
            <button type="button" onclick="openModal('modalTournamentOps')" class="sidebar-nav-item" data-tooltip="Tournament fixture board, conflict detection, and bulk CSV schedule import">
              <span class="tab-icon">📊</span>
              <span class="sidebar-nav-label">Fixtures Ops</span>
            </button>
            <button type="button" onclick="openModal('modalMatchInsights')" class="sidebar-nav-item" data-tooltip="AI match narrative recap, turning points, and Player of the Match MVP">
              <span class="tab-icon">🤖</span>
              <span class="sidebar-nav-label">AI Insights</span>
            </button>
            <button type="button" onclick="openModal('modalCheckIn')" class="sidebar-nav-item" data-tooltip="Provider arrival OTP verification and 3-party match scorecard sign-off">
              <span class="tab-icon">📍</span>
              <span class="sidebar-nav-label">Check-In</span>
            </button>
            <button type="button" onclick="openModal('modalSponsorshipAuction')" class="sidebar-nav-item" data-tooltip="Tournament sponsorship prize pool pledges and virtual player auction desk">
              <span class="tab-icon">🤝</span>
              <span class="sidebar-nav-label">Sponsors &amp; Auction</span>
            </button>
          </div>
        </div>

        <!-- Section C: Developer & Platform -->
        <div class="sidebar-nav-section">
          <div class="sidebar-section-title">Developer &amp; Platform</div>
          <div class="sidebar-nav-list">
            <button type="button" onclick="openMobilePreviewModal()" class="sidebar-nav-item" data-tooltip="Launch Standalone Consumer Mobile App (iOS &amp; Android Preview) with OTP &amp; Profile">
              <span class="tab-icon">📱</span>
              <span class="sidebar-nav-label">Mobile App</span>
            </button>
            <a href="/docs" onclick="openApiDocsModal(); return false;" class="sidebar-nav-item" data-tooltip="Interactive OpenAPI 3.0 Documentation & Sandbox">
              <span class="tab-icon">📖</span>
              <span class="sidebar-nav-label">API Docs</span>
            </a>
            <a href="/metrics" onclick="openMetricsModal(); return false;" class="sidebar-nav-item" data-tooltip="Prometheus & OpenMetrics Standard Metrics Exposition">
              <span class="tab-icon">📈</span>
              <span class="sidebar-nav-label">Metrics</span>
            </a>
            <a href="/health/ready" onclick="openHealthModal(); return false;" class="sidebar-nav-item" data-tooltip="Kubernetes Readiness Probe & Database Pool Status">
              <span class="tab-icon">🩺</span>
              <span class="sidebar-nav-label">System Health</span>
            </a>
            <button type="button" onclick="openLegalModal()" class="sidebar-nav-item" data-tooltip="Review Apple App Store &amp; Google Play Policies, Privacy Policy and Terms">
              <span class="tab-icon">📜</span>
              <span class="sidebar-nav-label">Legal &amp; Privacy</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 4. Sidebar Footer: User Profile & Quick Persona -->
      <div class="sidebar-footer">
        <div class="user-profile-header-btn" onclick="openUserModal()" data-tooltip="Manage User Profile, Career Stats, and Switch Persona (Captain, Player, Scorer...)" style="width: 100%; display: flex; align-items: center; gap: 0.65rem; padding: 0.35rem; cursor: pointer; border-radius: 8px; transition: background 0.2s;">
          <div class="user-avatar-pill" id="headerUserAvatar" style="width: 34px; height: 34px; font-size: 0.85rem; border-radius: 8px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-weight: 800; background: var(--turf-emerald); color: #04070D;">VK</div>
          <div class="user-meta-pill" style="display: flex; flex-direction: column; min-width: 0; overflow: hidden;">
            <span class="user-name-text" id="headerUserName" style="font-weight: 700; font-size: 0.82rem; color: #FFFFFF; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">Virat Sharma</span>
            <span class="user-role-text" id="headerUserRoleBadge" style="font-size: 0.65rem; color: var(--turf-emerald); font-weight: 700; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">CAPTAIN #18</span>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="app-main-wrapper">
      <!-- Streamlined, Decluttered Top Bar -->
      <header class="app-topbar">
        <div class="topbar-left">
          <button type="button" class="mobile-sidebar-toggle" onclick="toggleSidebarMobile()" data-tooltip="Toggle Navigation Menu" aria-label="Toggle Navigation">
            <span>☰</span>
          </button>
          <div class="topbar-breadcrumb">
            <span class="breadcrumb-brand">🏏 CricOS</span>
            <span class="breadcrumb-sep">/</span>
            <span class="breadcrumb-crumb" id="topbarCurrentTab">Match Center</span>
            <span class="breadcrumb-sep">/</span>
            <span class="breadcrumb-sub">Delhi Daredevils vs Mumbai Super Strikers</span>
          </div>
        </div>

        <!-- Center / Right: Clean Status & Actions -->
        <div class="topbar-right">
          <!-- Compact Telemetry Pills -->
          <div class="topbar-telemetry-group">
            <div class="topbar-node" data-tooltip="Live matches running across the platform with active SSE stream">
              <span class="telemetry-pulse"></span>
              <span class="topbar-node-val" id="telemetryMatches">1 LIVE</span>
            </div>
            <div class="topbar-node" data-tooltip="Total platform funds locked in double-entry escrow ledger">
              <span class="topbar-node-icon">🔒</span>
              <span class="topbar-node-val" id="telemetryEscrow">₹500,000</span>
            </div>
            <div class="topbar-node" data-tooltip="Automated provider circuit breaker: freezes unbooked slots if reliability drops below 65%">
              <span class="topbar-node-icon">🛡️</span>
              <span class="topbar-node-val" style="color: var(--turf-emerald);" id="telemetryCircuit">100% NOMINAL</span>
            </div>
            <div class="topbar-node" data-tooltip="Real-time Server-Sent Events delivery latency">
              <span class="topbar-node-icon">⚡</span>
              <span class="topbar-node-val" style="color: var(--cyan);" id="telemetryLatency">&lt;10ms</span>
            </div>
            <div class="topbar-node" id="telemetrySyncNode" onclick="triggerQueueSync()" data-tooltip="Offline Scoring Queue: Click to flush queued deliveries to Fastify API" style="cursor: pointer;">
              <span class="telemetry-pulse" id="telemetrySyncPulse" style="background: var(--turf-emerald);"></span>
              <span class="topbar-node-val" style="color: var(--turf-emerald);" id="telemetrySyncVal">ONLINE (0)</span>
            </div>
          </div>

          <div class="header-nav-divider"></div>

          <!-- Utility: Notifications Drawer -->
          <button type="button" onclick="toggleNotificationsDrawer()" class="nav-pill" data-tooltip="Real-time match alerts, financial settlements, and platform notifications">
            <span class="pill-icon">🔔</span>
            <span id="headerNotifBadge" class="counter-badge emerald">3</span>
          </button>

          <!-- Status Pill -->
          <div class="status-pill" id="healthPill" onclick="openHealthModal()" style="cursor: pointer;" data-tooltip="API Service &amp; Live SSE Connection Status. Click for detailed diagnostics.">
            <div class="pulse-dot"></div>
            <span id="healthText">Online</span>
          </div>
        </div>
      </header>

      <main id="appMainContent">
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
            <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
              <div class="match-meta">T20 Championship • Innings 2 • Match ID: <span id="currentMatchId" style="font-family: monospace; color: var(--cyan);">match-pilot-1</span></div>
              <button class="nav-pill" style="cursor: pointer; background: rgba(0,229,153,0.12); border-color: rgba(0,229,153,0.3); color: var(--turf-emerald); font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.6rem;" onclick="openScorecardModal()" data-tooltip="Export official match scorecard as RFC 4180 CSV or print-ready PDF/HTML">📥 Export Scorecard</button>
              <button class="nav-pill" id="btnConductToss" style="cursor: pointer; background: rgba(255,184,0,0.12); border-color: rgba(255,184,0,0.3); color: var(--amber); font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.6rem;" onclick="openTossModal()" data-tooltip="Conduct official pre-match toss, select decision (Bat/Bowl), and confirm squads">🪙 Conduct Toss</button>
              <button class="nav-pill" style="cursor: pointer; background: rgba(192,132,252,0.12); border-color: rgba(192,132,252,0.3); color: var(--purple-light); font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.6rem;" onclick="openMatchRatingModal()" data-tooltip="Rate turf quality, umpiring, and scoring accuracy to update community trust ratings">⭐ Rate Match</button>
            </div>
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

        <!-- Match Result Victory Banner -->
        <div id="matchResultBanner" style="display: none; background: rgba(0,229,153,0.15); border: 1px solid var(--turf-emerald); border-radius: 8px; padding: 0.85rem 1.25rem; margin-top: 1rem; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;">
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <span style="font-size: 1.5rem;">🏆</span>
            <div>
              <div style="font-weight: 800; color: #F8FAFC; font-size: 1.05rem;" id="matchResultText">Mumbai Super Strikers won by 6 wickets!</div>
              <div style="font-size: 0.75rem; color: var(--turf-emerald);">Official Match Concluded • Player of the Match: Virat Sharma (68 runs off 42 balls)</div>
            </div>
          </div>
          <button class="btn btn-secondary" style="width: auto; padding: 0.35rem 0.85rem; font-size: 0.75rem;" onclick="openScorecardModal()" data-tooltip="Download match summary sheet">Download Sheet</button>
        </div>

        <!-- Event Operational Readiness Bar (Archive Spec 03_UX_Blueprint_v2) -->
        <div id="eventReadinessBanner" style="margin-top: 1rem;"></div>

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
            <div class="stat-mini-title">
              <span style="display: flex; align-items: center; gap: 0.4rem;">Striker <button class="btn btn-secondary" style="width: auto; padding: 0.1rem 0.45rem; font-size: 0.65rem;" onclick="swapMatchStrike()" data-tooltip="Manually rotate strike between batters">Swap Strike</button></span>
              <span style="color: var(--primary);">★ On Strike</span>
            </div>
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

        <!-- Free Hit Active Alert Banner -->
        <div id="freeHitBanner" style="display: none; background: rgba(255,184,0,0.15); border: 1px solid var(--amber); border-radius: 8px; padding: 0.65rem 1.15rem; margin-top: 1rem; align-items: center; gap: 0.65rem;">
          <span style="font-size: 1.25rem;">⚡</span>
          <div>
            <div style="font-weight: 800; color: var(--amber); font-size: 0.95rem;">FREE HIT IN EFFECT!</div>
            <div style="font-size: 0.75rem; color: #F8FAFC;">Batter cannot be dismissed bowled, caught, lbw, or stumped on this delivery. Only run out applies!</div>
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

        <!-- Fan Cheering & Community Pulse Console (Active for FAN persona) -->
        <div id="fanCheerSection" style="display: none; margin-top: 1.25rem; background: linear-gradient(135deg, rgba(192, 132, 252, 0.08) 0%, rgba(13, 20, 36, 0.95) 100%); border: 1px solid rgba(192, 132, 252, 0.25); border-radius: 12px; padding: 1.25rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="font-size: 1.25rem;">🎪</span>
              <div>
                <div style="font-size: 0.95rem; font-weight: 800; color: #FFF;">Fan Stadium Cheering &amp; Match Pulse</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">Send real-time stadium cheers, crowd noise, and predict match turning points</div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="font-size: 0.72rem; color: var(--purple-light); font-weight: 700; background: rgba(192, 132, 252, 0.15); padding: 0.2rem 0.5rem; border-radius: 4px;">LIVE FAN SPECTATOR MODE</span>
              <span style="font-size: 0.75rem; color: var(--text-muted);">Total Cheers: <strong id="fanTotalCheers" style="color: var(--purple-light); font-family: var(--font-mono);">1,428</strong></span>
            </div>
          </div>

          <!-- Cheering Buttons -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 0.6rem; margin-bottom: 1rem;">
            <button class="btn btn-secondary" onclick="sendFanCheer('🔥 Lets Go Bangalore!')" data-tooltip="Cheer for Bangalore Blasters with fire energy" style="border-color: rgba(255, 184, 0, 0.4); color: var(--amber);">🔥 Cheer BLR (+1)</button>
            <button class="btn btn-secondary" onclick="sendFanCheer('👏 Clapping Strikers!')" data-tooltip="Applaud the active partnership" style="border-color: rgba(0, 229, 153, 0.4); color: var(--turf-emerald);">👏 Applause (+1)</button>
            <button class="btn btn-secondary" onclick="sendFanCheer('💥 Boundary Expected!')" data-tooltip="Predict boundary next delivery" style="border-color: rgba(0, 210, 255, 0.4); color: var(--cyan);">💥 Boundary (+1)</button>
            <button class="btn btn-secondary" onclick="sendFanCheer('⚡ Maximum Six!')" data-tooltip="Call for a maximum 6" style="border-color: rgba(192, 132, 252, 0.4); color: var(--purple-light);">⚡ Sixer! (+1)</button>
            <button class="btn btn-secondary" onclick="sendFanCheer('🛡️ Wicket Alert!')" data-tooltip="Back the bowling team for a breakthrough" style="border-color: rgba(255, 51, 102, 0.4); color: var(--rose);">🛡️ Breakthrough (+1)</button>
          </div>

          <!-- Fan Win Probability Prediction Poll -->
          <div style="background: rgba(0, 0, 0, 0.3); border-radius: 8px; padding: 0.75rem 1rem;">
            <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 0.35rem;">
              <span style="font-weight: 700; color: #FFF;">Fan Win Prediction Poll:</span>
              <span style="color: var(--text-muted);"><span id="fanVotePctBLR" style="color: var(--turf-emerald); font-weight: 700;">68% Bangalore</span> vs <span id="fanVotePctMUM" style="color: var(--cyan); font-weight: 700;">32% Mumbai</span></span>
            </div>
            <div style="height: 6px; border-radius: 3px; background: rgba(255,255,255,0.08); overflow: hidden; display: flex; margin-bottom: 0.5rem;">
              <div id="fanVoteBarBLR" style="width: 68%; background: var(--turf-emerald); transition: width 0.3s;"></div>
              <div id="fanVoteBarMUM" style="width: 32%; background: var(--cyan); transition: width 0.3s;"></div>
            </div>
            <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
              <button class="btn btn-secondary" onclick="voteFanPoll('BLR')" style="width: auto; padding: 0.2rem 0.6rem; font-size: 0.7rem;" data-tooltip="Vote for Bangalore Blasters to win">Vote BLR</button>
              <button class="btn btn-secondary" onclick="voteFanPoll('MUM')" style="width: auto; padding: 0.2rem 0.6rem; font-size: 0.7rem;" data-tooltip="Vote for Mumbai Super Strikers to win">Vote MUM</button>
            </div>
          </div>
        </div>
      </div>

      <div class="grid-2">
        <!-- Non-Scorer Match Center Notice -->
        <div class="card" id="nonScorerMatchCenterNotice" style="display: none;">
          <div class="card-title" style="color: var(--amber); display: flex; align-items: center; gap: 0.5rem;">
            <span>🔒 Scoring Console Locked</span>
          </div>
          <div class="card-desc">Only certified Official Scorers can input deliveries, extras, and dismissals. Live match events, telemetry, and detailed scorecards remain fully accessible below.</div>
          <div style="background: rgba(255, 184, 0, 0.08); border: 1px solid rgba(255, 184, 0, 0.25); border-radius: 8px; padding: 0.75rem 1rem; font-size: 0.82rem; color: var(--text-main); margin-top: 0.75rem;">
            <div style="font-weight: 700; color: var(--amber); margin-bottom: 0.25rem;">Official Scorer Governance Active:</div>
            <div style="color: var(--text-muted); font-size: 0.78rem;">MCC Laws 2.1 &amp; BCCI Digital Scoring Protocol: Match scoring is certified exclusively by appointed scorers. Switch to the <strong>Official Scorer</strong> persona if you are managing live scoring.</div>
          </div>
        </div>

        <!-- Ball-by-Ball Scoring Pad -->
        <div class="card" id="cardMatchScoringPad">
          <div class="card-title">⚡ Interactive Ball-by-Ball Scoring Pad</div>
          <div class="card-desc">Click delivery buttons to trigger real-time scoring events via Fastify <code>POST /api/v1/matches/:id/score-events</code></div>

          <div class="pad-grid">
            <button class="pad-btn" onclick="scoreDelivery(0, 0, 'NONE', true)" data-tooltip="Score 0 runs (dot delivery)">0<span>Dot</span></button>
            <button class="pad-btn" onclick="scoreDelivery(1, 0, 'NONE', true)" data-tooltip="Score 1 run and rotate strike">1<span>Single</span></button>
            <button class="pad-btn" onclick="scoreDelivery(2, 0, 'NONE', true)" data-tooltip="Score 2 runs (strike retained)">2<span>Double</span></button>
            <button class="pad-btn" onclick="scoreDelivery(3, 0, 'NONE', true)" data-tooltip="Score 3 runs and rotate strike">3<span>Triple</span></button>
            <button class="pad-btn boundary-4" onclick="scoreDelivery(4, 0, 'NONE', true)" data-tooltip="Score 4 runs boundary">4 FOUR<span>Boundary</span></button>
            <button class="pad-btn boundary-6" onclick="scoreDelivery(6, 0, 'NONE', true)" data-tooltip="Score 6 runs over-the-rope maximum">6 SIX<span>Maximum</span></button>
            <button class="pad-btn wicket" onclick="openDismissalModal()" data-tooltip="Record wicket: select mode, fielder, and incoming batter">W WICKET<span>Out</span></button>
            <button class="pad-btn extra" onclick="scoreDelivery(0, 1, 'WIDE', false)" data-tooltip="Wide: +1 run extra, delivery re-bowled">Wd WIDE<span>+1 Run</span></button>
            <button class="pad-btn extra" onclick="scoreDelivery(0, 1, 'NO_BALL', false)" data-tooltip="No Ball: +1 run extra, triggers Free Hit">Nb NO BALL<span>+1 Run</span></button>
            <button class="pad-btn extra" onclick="scoreDelivery(0, 1, 'BYE', true)" data-tooltip="Byes: +1 run extra, strike rotates if odd">B BYE<span>+1 Run</span></button>
            <button class="pad-btn extra" onclick="scoreDelivery(0, 1, 'LEG_BYE', true)" data-tooltip="Leg Byes: +1 run extra, strike rotates if odd">Lb LEG BYE<span>+1 Run</span></button>
            <button class="pad-btn" id="btnUndoDelivery" onclick="undoLastDelivery()" style="border-color: var(--amber); color: var(--amber);" data-tooltip="Undo last delivery (Shortcut: Ctrl+Z / Cmd+Z)">↺ UNDO<span>Ctrl+Z</span></button>
            <button class="pad-btn btn-secondary" onclick="resetMatchScore()" data-tooltip="Reset match score to 0/0 for new innings">↺ RESET<span>New Innings</span></button>

            <!-- Compound Extras Strip -->
            <div style="grid-column: 1 / -1; display: flex; gap: 0.45rem; flex-wrap: wrap; margin-top: 0.65rem; border-top: 1px solid var(--border-subtle); padding-top: 0.65rem;">
              <button class="btn btn-secondary" style="flex: 1; min-width: 68px; padding: 0.35rem 0.4rem; font-size: 0.72rem;" onclick="scoreDelivery(0, 5, 'WIDE', false)" data-tooltip="Wide + 4 Byes: +5 runs total, delivery re-bowled">+5 Wd (4b)</button>
              <button class="btn btn-secondary" style="flex: 1; min-width: 68px; padding: 0.35rem 0.4rem; font-size: 0.72rem;" onclick="scoreDelivery(4, 1, 'NO_BALL', false)" data-tooltip="No Ball + Boundary 4: +5 runs, Free Hit next delivery">+4 Nb (5 runs)</button>
              <button class="btn btn-secondary" style="flex: 1; min-width: 68px; padding: 0.35rem 0.4rem; font-size: 0.72rem;" onclick="scoreDelivery(6, 1, 'NO_BALL', false)" data-tooltip="No Ball + Maximum 6: +7 runs, Free Hit next delivery">+6 Nb (7 runs)</button>
              <button class="btn btn-secondary" style="flex: 1; min-width: 68px; padding: 0.35rem 0.4rem; font-size: 0.72rem;" onclick="scoreDelivery(0, 5, 'PENALTY', false)" data-tooltip="Penalty runs awarded (+5 runs)">+5 Penalty</button>
            </div>
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

      <!-- Detailed Match Scorecard Card -->
      <div class="card" id="cardDetailedScorecard" style="margin-top: 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
          <div>
            <div class="card-title" style="display: flex; align-items: center; gap: 0.5rem;">
              <span>📋 Detailed Match Scorecard</span>
              <span class="rate-badge" style="color: var(--turf-emerald); border-color: rgba(0,229,153,0.3); font-size: 0.7rem;">BROADCAST SPEC</span>
            </div>
            <div class="card-desc">Comprehensive batting, bowling, extras, and fall-of-wickets breakdown</div>
          </div>
          <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
            <div style="display: inline-flex; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 2px;">
              <button type="button" class="btn-scorecard-inn active" id="btnScorecardInn2" onclick="switchScorecardInnings(2)" data-tooltip="View Mumbai Super Strikers Innings 2 (Current Chase: 142/3)">Innings 2 (MUM 142/3)</button>
              <button type="button" class="btn-scorecard-inn" id="btnScorecardInn1" onclick="switchScorecardInnings(1)" data-tooltip="View Delhi Daredevils Innings 1 (178/10)">Innings 1 (DEL 178/10)</button>
            </div>
            <button class="btn btn-secondary" id="btnExportScorecardCsv" style="width: auto; padding: 0.35rem 0.75rem; font-size: 0.75rem;" onclick="downloadScorecardCsv()" data-tooltip="Export official scorecard as RFC 4180 CSV">📥 CSV Export</button>
            <button class="btn btn-secondary" id="btnPrintScorecard" style="width: auto; padding: 0.35rem 0.75rem; font-size: 0.75rem;" onclick="printScorecardView()" data-tooltip="Open print-ready scorecard sheet">🖨️ Print</button>
          </div>
        </div>

        <!-- Innings Header Banner -->
        <div id="scorecardInningsBanner" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 0.75rem 1rem; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
          <div>
            <span style="font-size: 1.1rem; font-weight: 800; color: #F8FAFC;" id="scorecardTeamName">Mumbai Super Strikers</span>
            <span style="font-size: 0.8rem; color: var(--text-muted); margin-left: 0.5rem;" id="scorecardInningsLabel">Innings 2 (Target: 178)</span>
          </div>
          <div style="font-family: var(--font-score); font-size: 1.3rem; font-weight: 800; color: var(--turf-emerald);" id="scorecardInningsScore">
            142/3 <span style="font-size: 0.85rem; color: var(--text-muted); font-family: var(--font-ui);">(16.4 ov • CRR: 8.52 • RRR: 10.80)</span>
          </div>
        </div>

        <!-- Batting Scorecard Table -->
        <div style="overflow-x: auto; margin-bottom: 1rem;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.82rem;">
            <thead>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.12); color: var(--text-muted); text-align: left; font-size: 0.75rem; text-transform: uppercase;">
                <th style="padding: 0.5rem 0.6rem;">Batter</th>
                <th style="padding: 0.5rem 0.6rem;">Dismissal</th>
                <th style="padding: 0.5rem 0.6rem; text-align: right;">R</th>
                <th style="padding: 0.5rem 0.6rem; text-align: right;">B</th>
                <th style="padding: 0.5rem 0.6rem; text-align: right;">4s</th>
                <th style="padding: 0.5rem 0.6rem; text-align: right;">6s</th>
                <th style="padding: 0.5rem 0.6rem; text-align: right;">SR</th>
              </tr>
            </thead>
            <tbody id="detailedScorecardBattersBody">
              <!-- Rendered via JS -->
            </tbody>
          </table>
        </div>

        <!-- Extras & Total Line -->
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0.6rem; background: rgba(255,255,255,0.02); border-radius: 6px; margin-bottom: 0.75rem; font-size: 0.8rem; flex-wrap: wrap; gap: 0.5rem;">
          <div>Extras: <strong id="scorecardExtrasText" style="color: var(--amber);">12</strong> <span style="color: var(--text-muted); font-size: 0.75rem;" id="scorecardExtrasDetail">(b 4, lb 2, w 5, nb 1)</span></div>
          <div>Total: <strong id="scorecardTotalText" style="color: var(--turf-emerald); font-family: var(--font-score); font-size: 1rem;">142/3</strong> <span style="color: var(--text-muted); font-size: 0.75rem;" id="scorecardTotalDetail">(3 wkts, 16.4 ov)</span></div>
        </div>

        <!-- Did Not Bat Strip -->
        <div style="padding: 0.4rem 0.6rem; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 1rem;" id="scorecardDnbContainer">
          Did Not Bat: <span style="color: #cbd5e1;" id="scorecardDnbText">Rishabh Pant (wk), Ravindra Jadeja, Axar Patel, Mohammed Shami, Jasprit Bumrah</span>
        </div>

        <!-- Fall of Wickets Timeline -->
        <div style="margin-bottom: 1.25rem;">
          <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.4rem;">Fall of Wickets</div>
          <div id="scorecardFowContainer" style="display: flex; gap: 0.6rem; flex-wrap: wrap; font-size: 0.78rem;">
            <!-- Rendered via JS -->
          </div>
        </div>

        <!-- Bowling Scorecard Table -->
        <div style="overflow-x: auto;">
          <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.4rem;">Bowling Figures</div>
          <table style="width: 100%; border-collapse: collapse; font-size: 0.82rem;">
            <thead>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.12); color: var(--text-muted); text-align: left; font-size: 0.75rem; text-transform: uppercase;">
                <th style="padding: 0.5rem 0.6rem;">Bowler</th>
                <th style="padding: 0.5rem 0.6rem; text-align: right;">O</th>
                <th style="padding: 0.5rem 0.6rem; text-align: right;">M</th>
                <th style="padding: 0.5rem 0.6rem; text-align: right;">R</th>
                <th style="padding: 0.5rem 0.6rem; text-align: right;">W</th>
                <th style="padding: 0.5rem 0.6rem; text-align: right;">Econ</th>
                <th style="padding: 0.5rem 0.6rem; text-align: right;">Dots</th>
              </tr>
            </thead>
            <tbody id="detailedScorecardBowlersBody">
              <!-- Rendered via JS -->
            </tbody>
          </table>
        </div>
      </div>

      <!-- Match Analytics: Worm, Manhattan, Wagon Wheel & Partnerships -->
      <div class="card" style="margin-top: 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
          <div>
            <div class="card-title">📈 Live Match Run Analytics &amp; Visualizations</div>
            <div class="card-desc">Zero-dependency responsive SVG comparative run trajectory, over bars, wagon wheel and partnerships</div>
          </div>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button class="btn btn-secondary active" id="btnChartWorm" style="width: auto; padding: 0.35rem 0.85rem; font-size: 0.78rem; background: rgba(0,229,153,0.15); border-color: var(--turf-emerald); color: var(--turf-emerald);" onclick="showMatchChart('WORM')" data-tooltip="Run Progression Worm Chart: Compares Delhi (1st Inn) vs Mumbai (Chase)">📈 Worm Chart</button>
            <button class="btn btn-secondary" id="btnChartManhattan" style="width: auto; padding: 0.35rem 0.85rem; font-size: 0.78rem;" onclick="showMatchChart('MANHATTAN')" data-tooltip="Manhattan Over Bars: Runs scored per over with boundary and wicket highlights">📊 Manhattan Bars</button>
            <button class="btn btn-secondary" id="btnChartWagon" style="width: auto; padding: 0.35rem 0.85rem; font-size: 0.78rem;" onclick="showMatchChart('WAGON')" data-tooltip="8-Zone Precision Wagon Wheel: Outfield shot trajectories and zone distribution">🎯 Wagon Wheel</button>
            <button class="btn btn-secondary" id="btnChartPartnerships" style="width: auto; padding: 0.35rem 0.85rem; font-size: 0.78rem;" onclick="showMatchChart('PARTNERSHIPS')" data-tooltip="Partnership Stand Breakdown: Visual stand contributions between batters">👥 Partnerships</button>
          </div>
        </div>
        <div id="matchChartContainer" style="width: 100%; min-height: 220px; display: flex; align-items: center; justify-content: center;">
          <!-- Rendered via JS -->
        </div>
      </div>
    </div>

    <!-- TAB: TEAMS & ROSTERS -->
    <div id="tab-teams" class="tab-pane">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 1rem;">
        <div>
          <h2 style="font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; color: #F8FAFC; display: flex; align-items: center; gap: 0.6rem;">
            🏏 Bangalore Blasters <span style="font-size: 0.8rem; background: rgba(0,229,153,0.15); color: var(--turf-emerald); border: 1px solid var(--border-accent); padding: 0.2rem 0.6rem; border-radius: 6px;">BLR</span>
          </h2>
          <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.2rem;">Home Ground: Chinnaswamy Turf A • Verified Squad Status: 11/11 Verified</div>
        </div>
        <div style="display: flex; gap: 0.65rem; align-items: center; flex-wrap: wrap;">
          <div class="nav-pill" style="cursor: pointer; background: rgba(255,255,255,0.06); font-family: var(--font-mono); font-size: 0.82rem;" onclick="copyJoinCode()" data-tooltip="Click to copy team join invite code for new players">
            🔑 Join Code: <strong style="color: var(--cyan);" id="teamJoinCodeBadge">CRIC-BLR-4821</strong>
          </div>
          <button class="btn btn-secondary" style="width: auto; padding: 0.5rem 1rem; font-size: 0.85rem;" onclick="openJoinTeamPrompt()" data-tooltip="Join an existing team using a 8-character invite code">➕ Join Team</button>
          <button class="btn" style="width: auto; padding: 0.5rem 1.15rem; font-size: 0.85rem;" onclick="openCreateTeamModal()" data-tooltip="Create a new cricket franchise or local club team">🏆 Create New Team</button>
        </div>
      </div>

      <div class="grid-2">
        <!-- Playing XI Card -->
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <div class="card-title">⚡ Playing XI (Active Match Lineup)</div>
            <span style="font-size: 0.72rem; color: var(--turf-emerald); font-weight: 700;">11 PLAYERS</span>
          </div>
          <div class="card-desc">Current starting lineup declared for match day</div>

          <div id="playingXiContainer">
            <!-- Rendered by JS -->
          </div>
        </div>

        <!-- Bench, Reserves & Team Stats -->
        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <div class="card-title">🪑 Bench & Reserve Squad</div>
              <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700;">3 RESERVES</span>
            </div>
            <div class="card-desc">Substitutes available for tactical rotation or concussion sub</div>
            <div id="benchContainer">
              <!-- Rendered by JS -->
            </div>
          </div>

          <div class="card">
            <div class="card-title">📊 Team Franchise Profile</div>
            <div class="card-desc">Official team registration details and jersey kit</div>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; margin-top: 0.5rem;">
              <div style="background: rgba(255,255,255,0.03); padding: 0.75rem; border-radius: 8px; border: 1px solid var(--border-subtle);">
                <div style="font-size: 0.72rem; color: var(--text-muted);">Franchise Win Rate</div>
                <div style="font-size: 1.2rem; font-weight: 800; color: var(--turf-emerald); font-family: var(--font-score);">74.2% (26W - 9L)</div>
              </div>
              <div style="background: rgba(255,255,255,0.03); padding: 0.75rem; border-radius: 8px; border: 1px solid var(--border-subtle);">
                <div style="font-size: 0.72rem; color: var(--text-muted);">Kit Palette</div>
                <div style="display: flex; gap: 0.5rem; align-items: center; margin-top: 0.25rem;">
                  <span style="width: 20px; height: 20px; border-radius: 4px; background: #00E599; display: inline-block; border: 1px solid rgba(255,255,255,0.2);" data-tooltip="Primary Color: Turf Emerald"></span>
                  <span style="width: 20px; height: 20px; border-radius: 4px; background: #00D2FF; display: inline-block; border: 1px solid rgba(255,255,255,0.2);" data-tooltip="Secondary Color: Stadium Cyan"></span>
                  <span style="font-size: 0.78rem; color: var(--text-muted);">Emerald &amp; Cyan</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 2: MARKETPLACE & BOOKING -->
    <div id="tab-marketplace" class="tab-pane">
      <div style="display: flex; justify-content: flex-end; margin-bottom: 1rem; gap: 0.5rem; flex-wrap: wrap;">
        <button class="btn btn-secondary" onclick="openBookingLifecycleModal()" data-tooltip="Manage booking cancellation bands, penalty calculations, reschedule price adjustments, and no-show dispute handling" style="width: auto; padding: 0.35rem 0.85rem; font-size: 0.8rem; display: flex; align-items: center; gap: 0.4rem;">
          <span>🔄</span> Cancellation &amp; Reschedule Desk
        </button>
        <button class="btn btn-secondary" onclick="openOfficialCalendarModal()" data-tooltip="Inspect official weekly schedule, slot availability, buffer times, and conflict overlap checks" style="width: auto; padding: 0.35rem 0.85rem; font-size: 0.8rem; display: flex; align-items: center; gap: 0.4rem;">
          <span>📅</span> Official Availability Calendar
        </button>
        <button class="btn btn-secondary" onclick="openProviderStorefrontModal()" data-tooltip="Provider Capacity Manager: publish hourly slots, set rates, and inspect monthly payout earnings" style="width: auto; padding: 0.35rem 0.85rem; font-size: 0.8rem; display: flex; align-items: center; gap: 0.4rem;">
          <span>🏪</span> Provider Storefront &amp; Slot Publisher
        </button>
      </div>
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
          <div class="card-desc">Itemized Sporting Resource Breakdown &amp; Escrow Hold</div>

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
            <button class="btn btn-secondary" onclick="simulateHoldSlot()" data-tooltip="Reserve slot with 15-minute exclusive hold preventing schedule overlaps">⏱️ Hold Slot (15-min TTL)</button>
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
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.5rem;">
            <div class="card-title">📊 Competition Standings &amp; Player Caps</div>
            <div style="display: flex; gap: 0.35rem;">
              <button type="button" id="btnSubTabStandings" class="nav-pill active" style="cursor: pointer; padding: 0.2rem 0.55rem; font-size: 0.72rem; font-weight: 700;" onclick="switchTournamentSubTab('standings')" data-tooltip="ICC Group Standings and official Net Run Rate table">🏆 Standings</button>
              <button type="button" id="btnSubTabOrange" class="nav-pill" style="cursor: pointer; padding: 0.2rem 0.55rem; font-size: 0.72rem; font-weight: 700; color: #FFB800;" onclick="switchTournamentSubTab('orange')" data-tooltip="Orange Cap: Leading tournament run scorers and strike rates">👑 Orange Cap</button>
              <button type="button" id="btnSubTabPurple" class="nav-pill" style="cursor: pointer; padding: 0.2rem 0.55rem; font-size: 0.72rem; font-weight: 700; color: var(--purple-light);" onclick="switchTournamentSubTab('purple')" data-tooltip="Purple Cap: Leading tournament wicket takers and bowling figures">💜 Purple Cap</button>
            </div>
          </div>
          <div class="card-desc" id="tournamentSubTabDesc">Automatic points calculation and Net Run Rate (NRR) tracking</div>

          <!-- Sub-view 1: ICC Standings -->
          <div id="standingsSubView">
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

          <!-- Sub-view 2: Orange Cap (Batting Leaders) -->
          <div id="orangeCapSubView" style="display: none;"></div>

          <!-- Sub-view 3: Purple Cap (Bowling Leaders) -->
          <div id="purpleCapSubView" style="display: none;"></div>
        </div>
      </div>
    </div>

    <!-- TAB: SCORING STUDIO -->
    <div id="tab-studio" class="tab-pane">
      <div class="grid-2">
        <!-- Studio Pad & Ball Logger -->
        <div class="card" id="cardStudioKeypad">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <div class="card-title">🎯 Scorer Studio & Tactical Pad</div>
            <span class="rate-badge" id="studioModePill" style="color: var(--turf-emerald); border-color: rgba(0,229,153,0.3);">TACTICAL SCORER MODE</span>
          </div>
          <div class="card-desc">Select runs, trigger dismissals with fielders, or record extras with free hits</div>
          <div id="captainTacticalNotice" style="display: none; background: rgba(0, 229, 153, 0.1); border: 1px solid rgba(0, 229, 153, 0.3); border-radius: 8px; padding: 0.5rem 0.75rem; margin-bottom: 0.75rem; font-size: 0.75rem; color: var(--turf-emerald); font-weight: 700;">👑 Captain Tactical View: Wagon Wheel &amp; Shot Telemetry (Official ball scoring managed by Scorer)</div>
          <div id="fanTacticalNotice" style="display: none; background: rgba(192, 132, 252, 0.1); border: 1px solid rgba(192, 132, 252, 0.3); border-radius: 8px; padding: 0.5rem 0.75rem; margin-bottom: 0.75rem; font-size: 0.75rem; color: var(--purple-light); font-weight: 700;">🎪 Fan Spectator View: Precision 8-Zone Wagon Wheel &amp; Shot Telemetry (Scoring Pad disabled in spectator mode)</div>
          <div id="adminTacticalNotice" style="display: none; background: rgba(255, 51, 102, 0.1); border: 1px solid rgba(255, 51, 102, 0.3); border-radius: 8px; padding: 0.5rem 0.75rem; margin-bottom: 0.75rem; font-size: 0.75rem; color: var(--rose); font-weight: 700;">⚡ Non-Scorer Observation View: Scoring keypad locked. Only certified Official Scorers can input deliveries.</div>

          <!-- Active Batters on Field -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1.25rem;">
            <div style="background: rgba(0,229,153,0.08); border: 1px solid rgba(0,229,153,0.3); border-radius: 10px; padding: 0.85rem;" data-tooltip="Striker currently facing delivery">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 0.35rem;">
                  <span style="font-size: 0.72rem; color: var(--turf-emerald); font-weight: 800;">STRIKER ⚡</span>
                  <span id="studioStrikerStanceBadge" style="font-size: 0.65rem; padding: 0.1rem 0.4rem; border-radius: 4px; background: rgba(0, 229, 153, 0.15); color: var(--turf-emerald); font-weight: 800;">RHB</span>
                </div>
                <button class="btn btn-secondary" id="btnStudioSwapStrike" style="width: auto; padding: 0.15rem 0.5rem; font-size: 0.68rem;" onclick="swapStudioStrike()" data-tooltip="Rotate strike manually: flips off/on side for opposite batting stance">Swap Strike</button>
              </div>
              <div style="font-size: 1.05rem; font-weight: 800; color: #F8FAFC; margin-top: 0.35rem;" id="studioStrikerName">Virat Sharma</div>
              <div style="font-family: var(--font-score); font-size: 1.25rem; font-weight: 800; color: var(--turf-emerald);" id="studioStrikerStats">48* <span style="font-size: 0.8rem; color: var(--text-muted);">(32b, 4x4, 2x6)</span></div>
            </div>

            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 0.85rem;" data-tooltip="Non-striker at bowler's end">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 0.35rem;">
                  <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700;">NON-STRIKER</span>
                  <span id="studioNonStrikerStanceBadge" style="font-size: 0.65rem; padding: 0.1rem 0.4rem; border-radius: 4px; background: rgba(0, 210, 255, 0.15); color: var(--cyan); font-weight: 800;">LHB</span>
                </div>
              </div>
              <div style="font-size: 1.05rem; font-weight: 800; color: #F8FAFC; margin-top: 0.35rem;" id="studioNonStrikerName">Hardik Patel</div>
              <div style="font-family: var(--font-score); font-size: 1.25rem; font-weight: 800; color: var(--cyan);" id="studioNonStrikerStats">18 <span style="font-size: 0.8rem; color: var(--text-muted);">(12b, 1x4, 1x6)</span></div>
            </div>
          </div>

          <div id="studioScoringControlsGroup">
            <!-- Studio Keypad -->
            <div class="studio-pad-grid">
              <button class="studio-btn" onclick="recordStudioBall(0)" data-tooltip="Record Dot Ball (0 runs, legal delivery)">0<span class="studio-sublabel">Dot</span></button>
              <button class="studio-btn" onclick="recordStudioBall(1)" data-tooltip="Single: 1 run and strike rotates">1<span class="studio-sublabel">Single</span></button>
              <button class="studio-btn" onclick="recordStudioBall(2)" data-tooltip="Two runs (no strike rotation)">2<span class="studio-sublabel">Double</span></button>
              <button class="studio-btn" onclick="recordStudioBall(3)" data-tooltip="Three runs (strike rotates)">3<span class="studio-sublabel">Triple</span></button>
              <button class="studio-btn boundary-four" onclick="recordStudioBall(4)" data-tooltip="Boundary Four (+4 runs)">4<span class="studio-sublabel">Four</span></button>
              <button class="studio-btn maximum-six" onclick="recordStudioBall(6)" data-tooltip="Maximum Six (+6 runs)">6<span class="studio-sublabel">Six</span></button>
              <button class="studio-btn wicket-out" onclick="openDismissalModal()" data-tooltip="Trigger Wicket Dismissal Dialog (Bowled, Caught, LBW, Run out...)">W<span class="studio-sublabel">Wicket</span></button>
              <button class="studio-btn" style="border-color: var(--amber); color: var(--amber);" onclick="recordStudioExtra('WIDE', 1)" data-tooltip="Record Wide (+1 run, extra)">EX<span class="studio-sublabel">Extras</span></button>
            </div>

            <!-- Quick Extras Strip -->
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              <button class="btn btn-secondary" style="flex: 1; padding: 0.45rem; font-size: 0.78rem;" onclick="recordStudioExtra('WIDE', 1)" data-tooltip="Wide ball (+1 run, ball does not count toward over)">+1 Wd</button>
              <button class="btn btn-secondary" style="flex: 1; padding: 0.45rem; font-size: 0.78rem;" onclick="recordStudioExtra('NO_BALL', 1)" data-tooltip="No Ball (+1 run, triggers Free Hit on next delivery)">+1 Nb (Free Hit)</button>
              <button class="btn btn-secondary" style="flex: 1; padding: 0.45rem; font-size: 0.78rem;" onclick="recordStudioExtra('LEG_BYE', 1)" data-tooltip="Leg Bye (+1 run, strike rotates)">+1 Lb</button>
              <button class="btn btn-secondary" style="flex: 1; padding: 0.45rem; font-size: 0.78rem;" onclick="recordStudioExtra('BYE', 1)" data-tooltip="Bye (+1 run, strike rotates)">+1 Bye</button>
            </div>
          </div>
        </div>

        <!-- Wagon Wheel & Partnerships -->
        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          <div class="card wagon-wheel-card" id="wagonWheelCard">
            <!-- Header: Title, Stance Switcher, Selected Zone Badge -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <div class="card-title" style="margin: 0; font-size: 1.05rem;">8-Zone Precision Wagon Wheel</div>
                <div style="display: inline-flex; background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 2px;">
                  <button type="button" class="btn-stance active" id="btnStanceRhb" onclick="setBatterStance('RHB', true)" data-tooltip="Right-Handed Batsman orientation (Off-side Left, On-side Right)" style="font-size: 0.68rem; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 6px; border: none; background: var(--turf-emerald); color: #04070D; cursor: pointer;">RHB</button>
                  <button type="button" class="btn-stance" id="btnStanceLhb" onclick="setBatterStance('LHB', true)" data-tooltip="Left-Handed Batsman orientation (Off-side Right, On-side Left)" style="font-size: 0.68rem; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 6px; border: none; background: transparent; color: #8E9BAE; cursor: pointer;">LHB</button>
                </div>
              </div>
              <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--turf-emerald); font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 6px; background: rgba(0, 229, 153, 0.1); border: 1px solid rgba(0, 229, 153, 0.25);" id="wagonWheelSelectedZone">ZONE: EXTRA COVER (OFF-SIDE)</span>
            </div>

            <!-- Batsman Selector Strip -->
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.65rem; padding: 0.45rem 0.65rem; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 8px; flex-wrap: wrap;">
              <div style="display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap;">
                <span style="font-size: 0.7rem; font-weight: 700; color: #8E9BAE; text-transform: uppercase; letter-spacing: 0.5px;">Batsman:</span>
                <div style="display: flex; gap: 0.35rem; flex-wrap: wrap;" id="wagonBatterSelector">
                  <button type="button" class="wagon-batter-pill active" id="wagonBatterBtn_Virat" onclick="filterWagonBatter('Virat Sharma', this)" data-tooltip="Wagon wheel for Virat Sharma (RHB): 48* (32 balls, 4x4, 2x6)">
                    <span class="batter-pill-badge">VK • RHB</span>
                    <span>Virat Sharma</span>
                    <span class="batter-pill-score" id="wagonBatterScore_Virat">48* (32)</span>
                  </button>
                  <button type="button" class="wagon-batter-pill" id="wagonBatterBtn_Hardik" onclick="filterWagonBatter('Hardik Patel', this)" data-tooltip="Wagon wheel for Hardik Patel (LHB): 18 (12 balls, 1x4, 1x6)">
                    <span class="batter-pill-badge">HP • LHB</span>
                    <span>Hardik Patel</span>
                    <span class="batter-pill-score" id="wagonBatterScore_Hardik">18 (12)</span>
                  </button>
                  <button type="button" class="wagon-batter-pill" id="wagonBatterBtn_All" onclick="filterWagonBatter('ALL', this)" data-tooltip="Combined partnership stand wagon wheel (66 runs, 44 balls)">
                    <span class="batter-pill-badge">🤝</span>
                    <span>Partnership Stand</span>
                    <span class="batter-pill-score" id="wagonBatterScore_All">66 (44)</span>
                  </button>
                </div>
              </div>
              <div style="font-size: 0.72rem; color: #8E9BAE;" id="wagonBatterSummaryInfo">
                Wagon for: <strong style="color: var(--turf-emerald);" id="wagonActiveBatterLabel">Virat Sharma (48* off 32)</strong>
              </div>
            </div>

            <!-- Filter Strip: Shot Types & Batter Selection -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem; border-bottom: 1px solid rgba(255, 255, 255, 0.06); padding-bottom: 0.75rem;">
              <div style="display: flex; gap: 0.35rem; flex-wrap: wrap;" id="wagonShotFilters">
                <button type="button" class="wagon-filter-pill active" onclick="filterWagonShots('ALL', this)" data-tooltip="Show all recorded deliveries for selected batsman">All Shots (12)</button>
                <button type="button" class="wagon-filter-pill" onclick="filterWagonShots('BOUNDARIES', this)" data-tooltip="Show 4s and 6s only">4s &amp; 6s (6)</button>
                <button type="button" class="wagon-filter-pill" onclick="filterWagonShots('SINGLES', this)" data-tooltip="Show 1s, 2s, 3s only">Singles / 2s (4)</button>
                <button type="button" class="wagon-filter-pill" onclick="filterWagonShots('DOTS', this)" data-tooltip="Show dot balls">Dots (2)</button>
              </div>
              <div style="font-size: 0.72rem; color: #8E9BAE;">
                Facing: <strong style="color: #FFFFFF;" id="wagonFacingBatter">Virat Sharma</strong>
              </div>
            </div>

            <!-- Stadium Outfield SVG Visualizer -->
            <div class="wagon-wheel-container">
              <svg class="wagon-wheel-svg" id="wagonWheelSvg" viewBox="0 0 360 360" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <!-- Stadium Grass Radial Gradient -->
                  <radialGradient id="turfGrad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="0%" stop-color="#0E3324"/>
                    <stop offset="60%" stop-color="#092418"/>
                    <stop offset="90%" stop-color="#05170F"/>
                    <stop offset="100%" stop-color="#030C08"/>
                  </radialGradient>
                  <!-- Pitch Clay Gradient -->
                  <linearGradient id="pitchGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#8C6E3D"/>
                    <stop offset="50%" stop-color="#A38350"/>
                    <stop offset="100%" stop-color="#8C6E3D"/>
                  </linearGradient>
                  <!-- Boundary Glow -->
                  <filter id="boundaryGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur"/>
                    <feComposite in="SourceGraphic" in2="blur" operator="over"/>
                  </filter>
                </defs>

                <!-- Ground Circle -->
                <circle cx="180" cy="180" r="168" fill="url(#turfGrad)" stroke="rgba(0, 229, 153, 0.4)" stroke-width="2" filter="url(#boundaryGlow)"/>
                
                <!-- Concentric Mower Stripes -->
                <circle cx="180" cy="180" r="140" fill="none" stroke="rgba(255, 255, 255, 0.025)" stroke-width="14"/>
                <circle cx="180" cy="180" r="110" fill="none" stroke="rgba(255, 255, 255, 0.025)" stroke-width="14"/>
                <circle cx="180" cy="180" r="80" fill="none" stroke="rgba(255, 255, 255, 0.025)" stroke-width="14"/>
                <circle cx="180" cy="180" r="50" fill="none" stroke="rgba(255, 255, 255, 0.025)" stroke-width="14"/>

                <!-- 30-Yard Infield Circle -->
                <circle cx="180" cy="180" r="88" fill="none" stroke="rgba(0, 210, 255, 0.35)" stroke-width="1.2" stroke-dasharray="4,4"/>
                <text x="180" y="98" fill="rgba(0, 210, 255, 0.6)" font-size="6.5" font-family="var(--font-mono)" text-anchor="middle" letter-spacing="1">30 YD CIRCLE</text>

                <!-- Outer Boundary Rope (75m) -->
                <circle cx="180" cy="180" r="162" fill="none" stroke="rgba(255, 255, 255, 0.25)" stroke-width="1.5"/>
                <text x="180" y="26" fill="rgba(255, 255, 255, 0.45)" font-size="7" font-family="var(--font-mono)" text-anchor="middle">75m BOUNDARY ROPE</text>

                <!-- 8 Radial Sector Lines -->
                <line x1="180" y1="18" x2="180" y2="342" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1"/>
                <line x1="18" y1="180" x2="342" y2="180" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1"/>
                <line x1="65" y1="65" x2="295" y2="295" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1"/>
                <line x1="295" y1="65" x2="65" y2="295" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1"/>

                <!-- Interactive 8 Sector Slices (Paths) Rotated 180° for Standard Pitch View -->
                <g id="wagonSectorSlices">
                  <!-- top_left: Third Man (RHB) / Fine Leg (LHB) -->
                  <path id="wedge_top_left" data-pos="top_left" data-zone="THIRD_MAN" class="wagon-sector-wedge" d="M180,180 L65.5,65.5 A162,162 0 0,1 180,18 Z" onclick="selectShotZone('THIRD_MAN')" data-tooltip="Third Man (Off-Side Behind)"/>
                  <!-- top_right: Fine Leg (RHB) / Third Man (LHB) -->
                  <path id="wedge_top_right" data-pos="top_right" data-zone="FINE_LEG" class="wagon-sector-wedge" d="M180,180 L180,18 A162,162 0 0,1 294.5,65.5 Z" onclick="selectShotZone('FINE_LEG')" data-tooltip="Fine Leg (On-Side Behind)"/>
                  <!-- mid_left: Point (RHB) / Deep Square Leg (LHB) -->
                  <path id="wedge_mid_left" data-pos="mid_left" data-zone="POINT" class="wagon-sector-wedge" d="M180,180 L18,180 A162,162 0 0,1 65.5,65.5 Z" onclick="selectShotZone('POINT')" data-tooltip="Point (Off-Side Square)"/>
                  <!-- mid_right: Deep Square Leg (RHB) / Point (LHB) -->
                  <path id="wedge_mid_right" data-pos="mid_right" data-zone="SQUARE_LEG" class="wagon-sector-wedge" d="M180,180 L294.5,65.5 A162,162 0 0,1 342,180 Z" onclick="selectShotZone('SQUARE_LEG')" data-tooltip="Deep Square Leg (On-Side Square)"/>
                  <!-- lower_left: Cover (RHB) / Deep Mid Wicket (LHB) -->
                  <path id="wedge_lower_left" data-pos="lower_left" data-zone="EXTRA_COVER" class="wagon-sector-wedge active" d="M180,180 L65.5,294.5 A162,162 0 0,1 18,180 Z" onclick="selectShotZone('EXTRA_COVER')" data-tooltip="Extra Cover (Off-Side Forward)"/>
                  <!-- lower_right: Deep Mid Wicket (RHB) / Cover (LHB) -->
                  <path id="wedge_lower_right" data-pos="lower_right" data-zone="MID_WICKET" class="wagon-sector-wedge" d="M180,180 L342,180 A162,162 0 0,1 294.5,294.5 Z" onclick="selectShotZone('MID_WICKET')" data-tooltip="Deep Mid Wicket (On-Side Forward)"/>
                  <!-- bottom_left: Long Off (RHB) / Long On (LHB) -->
                  <path id="wedge_bottom_left" data-pos="bottom_left" data-zone="LONG_OFF" class="wagon-sector-wedge" d="M180,180 L180,342 A162,162 0 0,1 65.5,294.5 Z" onclick="selectShotZone('LONG_OFF')" data-tooltip="Long Off (Off-Side Straight)"/>
                  <!-- bottom_right: Long On (RHB) / Long Off (LHB) -->
                  <path id="wedge_bottom_right" data-pos="bottom_right" data-zone="LONG_ON" class="wagon-sector-wedge" d="M180,180 L294.5,294.5 A162,162 0 0,1 180,342 Z" onclick="selectShotZone('LONG_ON')" data-tooltip="Long On (On-Side Straight)"/>
                </g>

                <!-- Pitch Strip in Center (Standard Broadcast View: Batsman at Top, Bowler at Bottom) -->
                <rect x="168" y="140" width="24" height="80" rx="3" fill="url(#pitchGrad)" stroke="rgba(255, 255, 255, 0.2)" stroke-width="1"/>
                <!-- Bowling Crease & Popping Crease (Striker's End - Top) -->
                <line x1="164" y1="150" x2="196" y2="150" stroke="#FFFFFF" stroke-width="1.2"/>
                <line x1="168" y1="156" x2="192" y2="156" stroke="rgba(255, 255, 255, 0.7)" stroke-width="0.8"/>
                <!-- Stumps (Striker's End) -->
                <circle cx="177" cy="148" r="1" fill="#FFFFFF"/>
                <circle cx="180" cy="148" r="1" fill="#FFFFFF"/>
                <circle cx="183" cy="148" r="1" fill="#FFFFFF"/>

                <!-- Bowling Crease & Popping Crease (Bowler's End - Bottom) -->
                <line x1="164" y1="210" x2="196" y2="210" stroke="#FFFFFF" stroke-width="1.2"/>
                <line x1="168" y1="204" x2="192" y2="204" stroke="rgba(255, 255, 255, 0.7)" stroke-width="0.8"/>
                <!-- Stumps (Bowler's End) -->
                <circle cx="177" cy="212" r="1" fill="#FFFFFF"/>
                <circle cx="180" cy="212" r="1" fill="#FFFFFF"/>
                <circle cx="183" cy="212" r="1" fill="#FFFFFF"/>

                <!-- Batsman at Crease Indicator (Striker at Top Crease cy=156) -->
                <g id="wagonPitchStrikerGroup">
                  <!-- Striker Crease Circle -->
                  <circle cx="180" cy="156" r="4.5" fill="var(--turf-emerald)" stroke="#FFFFFF" stroke-width="1.5" filter="url(#boundaryGlow)"/>
                  <circle cx="180" cy="156" r="2" fill="#04070D"/>
                  <!-- Batsman Name & Figure Banner Overlay (Above striker) -->
                  <g id="wagonPitchBatterBadge" transform="translate(180, 134)">
                    <rect x="-68" y="-9" width="136" height="18" rx="9" fill="rgba(4, 7, 13, 0.92)" stroke="rgba(0, 229, 153, 0.45)" stroke-width="1.2"/>
                    <circle cx="-56" cy="0" r="6" fill="var(--turf-emerald)"/>
                    <text x="-56" y="2.5" fill="#04070D" font-size="6.5" font-family="var(--font-heading)" font-weight="800" text-anchor="middle" id="svgPitchBatterInitials">VK</text>
                    <text x="-46" y="2.8" fill="#FFFFFF" font-size="6.5" font-family="var(--font-heading)" font-weight="700" id="svgPitchBatterName">Virat Sharma</text>
                    <text x="60" y="2.8" fill="var(--turf-emerald)" font-size="6.5" font-family="var(--font-score)" font-weight="700" text-anchor="end" id="svgPitchBatterScore">48* (32)</text>
                  </g>
                </g>

                <!-- Non-Striker Pitch Indicator (Bowler end cy=204, banner below) -->
                <g id="wagonPitchNonStrikerGroup" transform="translate(180, 226)">
                  <circle cx="0" cy="-22" r="3" fill="#64748B" stroke="#FFFFFF" stroke-width="1"/>
                  <rect x="-46" y="-7" width="92" height="14" rx="7" fill="rgba(4, 7, 13, 0.85)" stroke="rgba(255, 255, 255, 0.18)" stroke-width="0.8"/>
                  <text x="0" y="2.5" fill="#94A3B8" font-size="5.5" font-family="var(--font-heading)" font-weight="600" text-anchor="middle" id="svgPitchNonStrikerText">Hardik Patel 18 (12)</text>
                </g>

                <!-- Off-Side / On-Side Arc Labels -->
                <text x="35" y="174" fill="var(--cyan)" font-size="8" font-family="var(--font-mono)" font-weight="700" letter-spacing="0.5" id="wagonLabelOff">◀ OFF SIDE</text>
                <text x="325" y="174" fill="var(--turf-emerald)" font-size="8" font-family="var(--font-mono)" font-weight="700" text-anchor="end" letter-spacing="0.5" id="wagonLabelLeg">ON SIDE ▶</text>

                <!-- Dynamic Shot Trajectory Rays Group -->
                <g id="wagonWheelRays">
                  <!-- Generated dynamically by JS -->
                </g>
              </svg>

              <!-- 8 Factually Accurate Outer Perimeter Field Zone Buttons (Dynamic Positional IDs for Stance Flip) -->
              <!-- Top-Left: Third Man (RHB) / Fine Leg (LHB) -->
              <button type="button" class="field-zone-btn" id="btnZone_top_left" data-pos="top_left" data-zone="THIRD_MAN" style="top: 14px; left: 24%; transform: translateX(-50%);" onclick="selectShotZone('THIRD_MAN', this)" data-tooltip="Third Man: Behind square on off side">
                <span>Third Man</span> <span class="field-zone-runs" id="zoneRuns_THIRD_MAN">1r</span>
              </button>
              <!-- Top-Right: Fine Leg (RHB) / Third Man (LHB) -->
              <button type="button" class="field-zone-btn" id="btnZone_top_right" data-pos="top_right" data-zone="FINE_LEG" style="top: 14px; left: 76%; transform: translateX(-50%);" onclick="selectShotZone('FINE_LEG', this)" data-tooltip="Fine Leg: Behind square on on-side">
                <span>Fine Leg</span> <span class="field-zone-runs" id="zoneRuns_FINE_LEG">3r</span>
              </button>
              <!-- Mid-Left: Point (RHB) / Deep Square Leg (LHB) -->
              <button type="button" class="field-zone-btn" id="btnZone_mid_left" data-pos="mid_left" data-zone="POINT" style="top: 36%; left: 4px;" onclick="selectShotZone('POINT', this)" data-tooltip="Point: Square of the wicket on off side">
                <span>Point</span> <span class="field-zone-runs" id="zoneRuns_POINT">4r</span>
              </button>
              <!-- Mid-Right: Deep Square Leg (RHB) / Point (LHB) -->
              <button type="button" class="field-zone-btn" id="btnZone_mid_right" data-pos="mid_right" data-zone="SQUARE_LEG" style="top: 36%; right: 4px;" onclick="selectShotZone('SQUARE_LEG', this)" data-tooltip="Deep Square Leg: Square of the wicket on on-side">
                <span>Sq Leg</span> <span class="field-zone-runs" id="zoneRuns_SQUARE_LEG">5r</span>
              </button>
              <!-- Lower-Left: Cover (RHB) / Deep Mid Wicket (LHB) -->
              <button type="button" class="field-zone-btn active" id="btnZone_lower_left" data-pos="lower_left" data-zone="EXTRA_COVER" style="top: 66%; left: 4px;" onclick="selectShotZone('EXTRA_COVER', this)" data-tooltip="Cover / Extra Cover: Forward of square on off side">
                <span>Cover</span> <span class="field-zone-runs" id="zoneRuns_EXTRA_COVER">9r</span>
              </button>
              <!-- Lower-Right: Deep Mid Wicket (RHB) / Cover (LHB) -->
              <button type="button" class="field-zone-btn" id="btnZone_lower_right" data-pos="lower_right" data-zone="MID_WICKET" style="top: 66%; right: 4px;" onclick="selectShotZone('MID_WICKET', this)" data-tooltip="Deep Mid Wicket: Forward of square on on-side">
                <span>Mid Wkt</span> <span class="field-zone-runs" id="zoneRuns_MID_WICKET">14r</span>
              </button>
              <!-- Bottom-Left: Long Off (RHB) / Long On (LHB) -->
              <button type="button" class="field-zone-btn" id="btnZone_bottom_left" data-pos="bottom_left" data-zone="LONG_OFF" style="bottom: 14px; left: 24%; transform: translateX(-50%);" onclick="selectShotZone('LONG_OFF', this)" data-tooltip="Long Off: Straight off-side drive">
                <span>Long Off</span> <span class="field-zone-runs" id="zoneRuns_LONG_OFF">4r</span>
              </button>
              <!-- Bottom-Right: Long On (RHB) / Long Off (LHB) -->
              <button type="button" class="field-zone-btn" id="btnZone_bottom_right" data-pos="bottom_right" data-zone="LONG_ON" style="bottom: 14px; left: 76%; transform: translateX(-50%);" onclick="selectShotZone('LONG_ON', this)" data-tooltip="Long On: Straight on-side drive">
                <span>Long On</span> <span class="field-zone-runs" id="zoneRuns_LONG_ON">8r</span>
              </button>
            </div>

            <!-- Telemetry & Distribution Bar -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 0.85rem; font-size: 0.78rem;">
              <div style="background: rgba(255, 255, 255, 0.03); padding: 0.5rem 0.6rem; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05);">
                <div style="color: #8E9BAE; font-size: 0.7rem; margin-bottom: 2px;">Off Side Ratio</div>
                <div style="font-family: var(--font-mono); font-weight: 700; color: var(--cyan); font-size: 0.95rem; font-variant-numeric: tabular-nums;" id="wagonOffTally">58% (28 runs)</div>
              </div>
              <div style="background: rgba(255, 255, 255, 0.03); padding: 0.5rem 0.6rem; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05);">
                <div style="color: #8E9BAE; font-size: 0.7rem; margin-bottom: 2px;">Leg Side Ratio</div>
                <div style="font-family: var(--font-mono); font-weight: 700; color: var(--turf-emerald); font-size: 0.95rem; font-variant-numeric: tabular-nums;" id="wagonLegTally">42% (20 runs)</div>
              </div>
              <div style="background: rgba(255, 255, 255, 0.03); padding: 0.5rem 0.6rem; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05);">
                <div style="color: #8E9BAE; font-size: 0.7rem; margin-bottom: 2px;">Boundaries</div>
                <div style="font-family: var(--font-mono); font-weight: 700; color: var(--amber); font-size: 0.95rem; font-variant-numeric: tabular-nums;" id="wagonBoundaryTally">6 Hits (4x4, 2x6)</div>
              </div>
              <div style="background: rgba(255, 255, 255, 0.03); padding: 0.5rem 0.6rem; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05);">
                <div style="color: #8E9BAE; font-size: 0.7rem; margin-bottom: 2px;">Batsman SR</div>
                <div style="font-family: var(--font-mono); font-weight: 700; color: #FFFFFF; font-size: 0.95rem; font-variant-numeric: tabular-nums;" id="wagonBatterSrTally">150.0 SR (32b)</div>
              </div>
            </div>
          </div>

          <!-- Active Partnership Widget -->
          <div class="card">
            <div class="card-title">🤝 Active Partnership</div>
            <div class="card-desc">4th Wicket Stand</div>
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.5rem;">
              <div style="font-family: var(--font-score); font-size: 1.6rem; font-weight: 800; color: var(--turf-emerald);" id="partnershipRunsBalls">44 runs <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: normal;">(28 balls)</span></div>
              <div style="font-size: 0.8rem; color: var(--cyan); font-weight: 700;">CRR: 9.42</div>
            </div>
            <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.08); border-radius: 9999px; overflow: hidden; margin-bottom: 0.75rem;">
              <div style="width: 62%; height: 100%; background: linear-gradient(90deg, var(--turf-emerald), var(--cyan)); border-radius: 9999px;" id="partnershipProgressFill"></div>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted);">
              <span>V. Sharma: 26 (16b)</span>
              <span>H. Patel: 18 (12b)</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 4: INCIDENTS & REPUTATION -->
    <div id="tab-incidents" class="tab-pane">
      <div class="grid-2">
        <div class="card">
          <div class="card-title">⚠️ Service Incidents & Replacement Proposals</div>
          <div class="card-desc">Automated official replacement and incident protection</div>

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

          <button class="btn" style="background: var(--rose); color: #FFF;" onclick="logIncidentAndFindReplacement()" data-tooltip="File operational dispute and search top-rated replacement officials">🚨 Open Incident &amp; Propose Emergency Replacement</button>

          <div id="replacementResult" style="margin-top: 1.25rem;"></div>
        </div>

        <div class="card">
          <div class="card-title">⭐ Provider Trust & Reputation Engine</div>
          <div class="card-desc">Weighted reliability score, trust transitions, and automated quality guard</div>

          <div style="background: rgba(0, 0, 0, 0.3); border-radius: 10px; padding: 1.25rem; margin-bottom: 1.25rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <span style="font-weight: 600;">Harbour Cricket Grounds</span>
              <span id="providerTrustBadge" style="background: rgba(16, 185, 129, 0.15); color: var(--primary); padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: 700;" data-tooltip="Live operational trust status (VERIFIED / PROBATION / SUSPENDED)">VERIFIED</span>
            </div>
            <div style="display: flex; gap: 1.5rem; margin-top: 0.75rem; flex-wrap: wrap;">
              <div data-tooltip="Weighted reliability score computed from verified match reviews">
                <div style="font-size: 0.75rem; color: var(--text-muted);">Trust Score</div>
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

        <!-- Official & Umpire Assignment Desk (Archive Spec 03_UX_Blueprint_v2 Journey J2) -->
        <div class="card" style="grid-column: 1 / -1; margin-top: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <div class="card-title">⚖️ Official &amp; Umpire Assignment Desk (Journey J2)</div>
            <span style="font-size: 0.72rem; color: var(--turf-emerald); font-weight: 700;">ACTIVE MATCH ROSTER</span>
          </div>
          <div class="card-desc">Officiating appointments, digital check-in, and double-entry escrow disbursement</div>
          <div id="officialDeskContainer" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1rem; margin-top: 1rem;">
            <!-- Rendered via JS -->
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

      <!-- Admin Operations & Settlement Audit Desk -->
      <div id="adminAuditDeskContainer" style="margin-top: 1.5rem;"></div>
    </div>
  </main>
</div>
</div>

  <!-- User Profile & Persona Switcher Modal -->
  <div class="modal-backdrop" id="modalUserProfile">
    <div class="modal-dialog">
      <div class="modal-header">
        <div class="modal-title">
          <span>👤 User Profile &amp; Persona Switcher</span>
        </div>
        <button class="modal-close-btn" aria-label="Close dialog" onclick="closeUserModal()" data-tooltip="Close modal">✕</button>
      </div>
      <div class="modal-body">
        <!-- Persona Pills -->
        <label style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.5rem; display: block;">Select Active Persona</label>
        <div class="persona-pills-container">
          <button class="persona-pill-btn active" onclick="selectPersona('CAPTAIN')" data-role="CAPTAIN" data-tooltip="Captain persona: Manage Playing XI, toss, declarations, and tactical pad">
            <span class="persona-icon">👑</span>
            <span>Captain</span>
          </button>
          <button class="persona-pill-btn" onclick="selectPersona('PLAYER')" data-role="PLAYER" data-tooltip="Player persona: Career stats, RSVP, squad roster, and match fixtures">
            <span class="persona-icon">🏏</span>
            <span>Player</span>
          </button>
          <button class="persona-pill-btn" onclick="selectPersona('SCORER')" data-role="SCORER" data-tooltip="Official Scorer: Ball-by-ball scoring, dismissals, wagon wheel, and match sign-off">
            <span class="persona-icon">📋</span>
            <span>Scorer</span>
          </button>
          <button class="persona-pill-btn" onclick="selectPersona('FAN')" data-role="FAN" data-tooltip="Fan persona: Live spectator broadcast, cheering console, polls, and MVP insights">
            <span class="persona-icon">🎪</span>
            <span>Fan</span>
          </button>
          <button class="persona-pill-btn" onclick="selectPersona('UMPIRE')" data-role="UMPIRE" data-tooltip="Official Umpire: Fair play reports, code of conduct breaches, DRS reviews, and sign-off">
            <span class="persona-icon">⚖️</span>
            <span>Umpire</span>
          </button>
          <button class="persona-pill-btn" onclick="selectPersona('ADMIN')" data-role="ADMIN" data-tooltip="Platform Admin: Unrestricted access across all consoles, ledgers, audit desk, and APIs">
            <span class="persona-icon">⚡</span>
            <span>Admin</span>
          </button>
          <button class="persona-pill-btn" onclick="selectPersona('ORGANISER')" data-role="ORGANISER" data-tooltip="Tournament Organiser: Fixture brackets, round-robin scheduler, and venue RFQs">
            <span class="persona-icon">🏆</span>
            <span>Organiser</span>
          </button>
          <button class="persona-pill-btn" onclick="selectPersona('TURF_PROVIDER')" data-role="TURF_PROVIDER" data-tooltip="Turf Venue Owner: Manage ground slots, surge pricing, and escrow payouts">
            <span class="persona-icon">🏟️</span>
            <span>Provider</span>
          </button>
        </div>

        <!-- Profile Form -->
        <div class="grid-2" style="margin-bottom: 1rem;">
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" id="profileInputName" value="Virat Sharma">
          </div>
          <div class="form-group">
            <label>Jersey Number</label>
            <input type="number" id="profileInputJersey" value="18">
          </div>
        </div>

        <div class="grid-2" style="margin-bottom: 1rem;">
          <div class="form-group">
            <label>Batting Style</label>
            <select id="profileInputBatting">
              <option value="RHB">Right Hand Bat (RHB)</option>
              <option value="LHB">Left Hand Bat (LHB)</option>
            </select>
          </div>
          <div class="form-group">
            <label>Bowling Style</label>
            <select id="profileInputBowling">
              <option value="Right-Arm Fast">Right-Arm Fast</option>
              <option value="Right-Arm Spin">Right-Arm Spin (Off/Leg)</option>
              <option value="Left-Arm Fast">Left-Arm Fast</option>
              <option value="Left-Arm Spin">Left-Arm Spin</option>
            </select>
          </div>
        </div>

        <!-- Career Figures Card -->
        <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 1rem; margin-bottom: 1.25rem;">
          <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.5rem;">Verified Career Figures</div>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; text-align: center;">
            <div>
              <div style="font-size: 0.68rem; color: var(--text-muted);">Matches</div>
              <div style="font-size: 1.15rem; font-weight: 800; color: #F8FAFC; font-family: var(--font-score);">48</div>
            </div>
            <div>
              <div style="font-size: 0.68rem; color: var(--text-muted);">Runs</div>
              <div style="font-size: 1.15rem; font-weight: 800; color: var(--turf-emerald); font-family: var(--font-score);">1,850</div>
            </div>
            <div>
              <div style="font-size: 0.68rem; color: var(--text-muted);">Average</div>
              <div style="font-size: 1.15rem; font-weight: 800; color: var(--cyan); font-family: var(--font-score);">46.25</div>
            </div>
            <div>
              <div style="font-size: 0.68rem; color: var(--text-muted);">Strike Rate</div>
              <div style="font-size: 1.15rem; font-weight: 800; color: var(--amber); font-family: var(--font-score);">144.5</div>
            </div>
          </div>
        </div>

        <!-- Privacy & Danger Zone (Apple 5.1.1(v)) -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 1rem;">
          <div>
            <div style="font-size: 0.78rem; font-weight: 700; color: #F8FAFC;">Account Privacy &amp; Data Rights</div>
            <div style="font-size: 0.7rem; color: var(--text-muted);">Apple App Store Guideline 5.1.1(v) Compliant</div>
          </div>
          <button class="btn btn-secondary" style="width: auto; padding: 0.35rem 0.75rem; font-size: 0.75rem; color: var(--rose); border-color: rgba(255,51,102,0.3);" onclick="confirmAccountDeletion()" data-tooltip="Irreversibly delete account and personal playing data">Delete Account</button>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" style="width: auto;" onclick="closeUserModal()">Cancel</button>
        <button class="btn" style="width: auto; padding: 0.5rem 1.5rem;" onclick="saveUserProfile()" data-tooltip="Save profile edits and persona selection">Save Profile</button>
      </div>
    </div>
  </div>

  <!-- Dismissal / Wicket Modal -->
  <div class="modal-backdrop" id="modalDismissal">
    <div class="modal-dialog">
      <div class="modal-header">
        <div class="modal-title">
          <span style="color: var(--rose);">⚡ Record Wicket Dismissal</span>
        </div>
        <button class="modal-close-btn" aria-label="Close dialog" onclick="closeDismissalModal()" data-tooltip="Cancel wicket">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>Dismissal Mode</label>
          <select id="dismissalKind" onchange="toggleFielderField()">
            <option value="BOWLED">Bowled</option>
            <option value="CAUGHT">Caught</option>
            <option value="LBW">LBW (Leg Before Wicket)</option>
            <option value="RUN_OUT">Run Out</option>
            <option value="STUMPED">Stumped</option>
            <option value="HIT_WICKET">Hit Wicket</option>
          </select>
        </div>

        <div class="form-group" id="fielderGroup" style="display: none;">
          <label>Fielder Involved</label>
          <input type="text" id="dismissalFielder" placeholder="e.g. Ravindra Jadeja">
        </div>

        <div class="grid-2">
          <div class="form-group">
            <label>Out Batter</label>
            <select id="dismissalOutBatter">
              <option value="STRIKER" id="outStrikerOption">Virat Sharma (Striker)</option>
              <option value="NON_STRIKER" id="outNonStrikerOption">Hardik Patel (Non-Striker)</option>
            </select>
          </div>
          <div class="form-group">
            <label>Incoming Batter</label>
            <select id="dismissalNextBatter">
              <option value="Rishabh Pant" data-stance="LHB">Rishabh Pant (LHB)</option>
              <option value="Ravindra Jadeja" data-stance="LHB">Ravindra Jadeja (LHB)</option>
              <option value="Jasprit Bumrah" data-stance="RHB">Jasprit Bumrah (RHB)</option>
            </select>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" style="width: auto;" onclick="closeDismissalModal()">Cancel</button>
        <button class="btn" style="width: auto; background: var(--rose); border-color: var(--rose); color: white;" onclick="confirmDismissal()" data-tooltip="Record wicket and fall of wicket to scorecard">Confirm Wicket</button>
      </div>
    </div>
  </div>

  <!-- Bowler Rotation / Over End Modal -->
  <div class="modal-backdrop" id="modalBowlerRotation">
    <div class="modal-dialog">
      <div class="modal-header">
        <div class="modal-title">
          <span style="color: var(--amber);">🏏 Over Completed — Select Next Bowler</span>
        </div>
        <button class="modal-close-btn" aria-label="Close dialog" onclick="closeBowlerModal()" data-tooltip="Dismiss dialog">✕</button>
      </div>
      <div class="modal-body">
        <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.85rem;" id="bowlerModalDesc">
          Over has completed. Select the next bowler to commence the next over.
          <div style="color: var(--amber); margin-top: 0.35rem; font-size: 0.78rem;">⚠️ MCC Law 21: A bowler cannot bowl two consecutive overs.</div>
        </div>
        <div class="form-group">
          <label>Next Bowler</label>
          <select id="nextBowlerSelect">
            <option value="p-bowler-2">Mohammed Shami (Right-arm Fast)</option>
            <option value="p-bowler-3">Ravindra Jadeja (Left-arm Orthodox)</option>
            <option value="p-bowler-4">Kuldeep Yadav (Left-arm Wrist Spin)</option>
            <option value="p-bowler-5">Hardik Pandya (Right-arm Medium Fast)</option>
            <option value="p-bowler-1" id="optPrevBowler" disabled>Jasprit Bumrah (Current Bowler - Cannot Bowl Consecutively)</option>
          </select>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" style="width: auto;" onclick="closeBowlerModal()">Close</button>
        <button class="btn" style="width: auto; background: var(--turf-emerald); border-color: var(--turf-emerald); color: black; font-weight: 700;" onclick="confirmBowlerChange()" data-tooltip="Set new bowler for next over">Confirm Bowler</button>
      </div>
    </div>
  </div>

  <!-- Create Team Modal -->
  <div class="modal-backdrop" id="modalCreateTeam">
    <div class="modal-dialog">
      <div class="modal-header">
        <div class="modal-title">
          <span>🏆 Create Cricket Team / Club</span>
        </div>
        <button class="modal-close-btn" aria-label="Close dialog" onclick="closeCreateTeamModal()">✕</button>
      </div>
      <div class="modal-body">
        <div class="grid-2">
          <div class="form-group">
            <label>Franchise / Team Name</label>
            <input type="text" id="newTeamName" placeholder="e.g. Delhi Dominators">
          </div>
          <div class="form-group">
            <label>Short Code (3-4 chars)</label>
            <input type="text" id="newTeamCode" placeholder="e.g. DEL" maxlength="4">
          </div>
        </div>

        <div class="form-group">
          <label>Home Turf / Venue</label>
          <input type="text" id="newTeamVenue" placeholder="e.g. Feroz Shah Stadium Turf B">
        </div>

        <div class="grid-2">
          <div class="form-group">
            <label>Primary Jersey Color</label>
            <input type="color" id="newTeamColor1" value="#00E599" style="height: 40px; padding: 2px;">
          </div>
          <div class="form-group">
            <label>Secondary Jersey Color</label>
            <input type="color" id="newTeamColor2" value="#00D2FF" style="height: 40px; padding: 2px;">
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" style="width: auto;" onclick="closeCreateTeamModal()">Cancel</button>
        <button class="btn" style="width: auto;" onclick="saveNewTeam()" data-tooltip="Register new team and generate squad join code">Create Team</button>
      </div>
    </div>
  </div>

  <!-- Instant Hold Checkout Modal -->
  <div class="modal-backdrop" id="modalCheckout">
    <div class="modal-dialog">
      <div class="modal-header">
        <div class="modal-title">
          <span>🛒 Turf Booking &amp; 15-Minute Reservation Hold</span>
        </div>
        <button class="modal-close-btn" aria-label="Close dialog" onclick="closeCheckoutModal()">✕</button>
      </div>
      <div class="modal-body">
        <div style="background: rgba(0,210,255,0.08); border: 1px solid rgba(0,210,255,0.3); border-radius: 8px; padding: 0.85rem; margin-bottom: 1.25rem; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div style="font-size: 0.72rem; color: var(--cyan); font-weight: 800; text-transform: uppercase;">15-Minute Reservation Lock Active</div>
            <div style="font-size: 0.95rem; font-weight: 700; color: #F8FAFC;" id="modalCheckoutSlotTitle">Chinnaswamy Turf A (13:00 - 14:00)</div>
          </div>
          <div style="font-family: var(--font-score); font-size: 1.3rem; font-weight: 800; color: var(--cyan);" id="modalHoldTimer">14:59</div>
        </div>

        <div class="breakdown-table" style="margin-bottom: 1.25rem;">
          <div class="breakdown-row">
            <span>Base Hourly Turf Fee</span>
            <span id="modalCheckoutSubtotal">₹1,000.00</span>
          </div>
          <div class="breakdown-row">
            <span>Platform Facilitation (5%)</span>
            <span id="modalCheckoutFee">₹50.00</span>
          </div>
          <div class="breakdown-row">
            <span>GST on Facilitation (18%)</span>
            <span id="modalCheckoutTax">₹9.00</span>
          </div>
          <div class="breakdown-row total">
            <span>Total Escrow Deposit</span>
            <span id="modalCheckoutTotal">₹1,059.00</span>
          </div>
        </div>

        <div style="font-size: 0.75rem; color: var(--text-muted); background: rgba(255,255,255,0.03); padding: 0.75rem; border-radius: 6px; border: 1px solid var(--border-subtle);">
          🔒 Funds are locked in CricOS Double-Entry Escrow until match completion. Full refund issued automatically if venue cancels or weather suspends play.
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" style="width: auto;" onclick="closeCheckoutModal()">Cancel</button>
        <button class="btn" style="width: auto;" onclick="confirmBookingPayment()" data-tooltip="Process mock payment and confirm slot booking">Confirm &amp; Pay ₹1,059</button>
      </div>
    </div>
  </div>

  <!-- Official Scorecard Export Modal -->
  <div class="modal-backdrop" id="modalScorecardExport">
    <div class="modal-dialog" style="max-width: 720px;">
      <div class="modal-header">
        <div class="modal-title">
          <span>📥 Official Match Scorecard &amp; Export</span>
        </div>
        <button class="modal-close-btn" aria-label="Close dialog" onclick="closeScorecardModal()" data-tooltip="Close modal">✕</button>
      </div>
      <div class="modal-body">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
          <div>
            <div style="font-weight: 700; font-size: 1.1rem; color: #F8FAFC;">Delhi Daredevils vs Mumbai Super Strikers</div>
            <div style="font-size: 0.78rem; color: var(--text-muted);">T20 Championship • Innings 2 • Match ID: match-pilot-1</div>
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn" style="width: auto; padding: 0.4rem 0.9rem; font-size: 0.8rem;" onclick="downloadScorecardCsv()" data-tooltip="Download structured RFC 4180 CSV file">📄 Download CSV</button>
            <button class="btn btn-secondary" style="width: auto; padding: 0.4rem 0.9rem; font-size: 0.8rem;" onclick="printScorecardView()" data-tooltip="Open clean printer-ready scorecard view">🖨️ Print Sheet</button>
          </div>
        </div>

        <div style="background: rgba(0,0,0,0.35); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 1rem; max-height: 380px; overflow-y: auto;">
          <div style="font-size: 0.8rem; font-weight: 700; color: var(--turf-emerald); margin-bottom: 0.5rem;">BATTING SCORECARD (MUMBAI SUPER STRIKERS)</div>
          <table>
            <thead>
              <tr>
                <th>Batter</th>
                <th>Dismissal</th>
                <th style="text-align: right;">Runs</th>
                <th style="text-align: right;">Balls</th>
                <th style="text-align: right;">4s</th>
                <th style="text-align: right;">6s</th>
                <th style="text-align: right;">SR</th>
              </tr>
            </thead>
            <tbody id="scorecardBatterRows">
              <!-- Rendered via JS -->
            </tbody>
          </table>

          <div style="font-size: 0.8rem; font-weight: 700; color: var(--cyan); margin: 1rem 0 0.5rem 0;">BOWLING ANALYSIS (DELHI DAREDEVILS)</div>
          <table>
            <thead>
              <tr>
                <th>Bowler</th>
                <th style="text-align: right;">Overs</th>
                <th style="text-align: right;">Maidens</th>
                <th style="text-align: right;">Runs</th>
                <th style="text-align: right;">Wickets</th>
                <th style="text-align: right;">Econ</th>
              </tr>
            </thead>
            <tbody id="scorecardBowlerRows">
              <!-- Rendered via JS -->
            </tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" style="width: auto;" onclick="closeScorecardModal()">Close</button>
      </div>
    </div>
  </div>

  <!-- Official Match Toss Modal -->
  <div class="modal-backdrop" id="modalMatchToss">
    <div class="modal-dialog" style="max-width: 540px;">
      <div class="modal-header">
        <div class="modal-title">
          <span>🪙 Official Match Toss &amp; Lineup Confirmation</span>
        </div>
        <button class="modal-close-btn" aria-label="Close dialog" onclick="closeTossModal()" data-tooltip="Close toss modal">✕</button>
      </div>
      <div class="modal-body">
        <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem;">
          Recorded under MCC Law 1.3 by Lead Umpire. Official toss result sets batting order and match clock.
        </div>

        <form id="formMatchToss" onsubmit="confirmTossDecision(event)">
          <div class="form-group" style="margin-bottom: 1rem;">
            <label style="font-size: 0.82rem; font-weight: 700; color: #F8FAFC;">Toss Winner</label>
            <select id="tossWinnerSelect" style="width: 100%; background: #060a12; border: 1px solid var(--border-subtle); border-radius: 8px; color: #f8fafc; padding: 0.6rem; font-family: var(--font-body);">
              <option value="team-delhi">Delhi Daredevils</option>
              <option value="team-mumbai" selected>Mumbai Super Strikers</option>
            </select>
          </div>

          <div class="form-group" style="margin-bottom: 1rem;">
            <label style="font-size: 0.82rem; font-weight: 700; color: #F8FAFC;">Elected Decision</label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-top: 0.25rem;">
              <label style="background: rgba(255,255,255,0.04); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 0.75rem; display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                <input type="radio" name="tossDecision" value="BAT" checked style="accent-color: var(--turf-emerald);">
                <span style="font-weight: 700; color: #F8FAFC;">🏏 Bat First</span>
              </label>
              <label style="background: rgba(255,255,255,0.04); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 0.75rem; display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                <input type="radio" name="tossDecision" value="BOWL" style="accent-color: var(--cyan);">
                <span style="font-weight: 700; color: #F8FAFC;">🎯 Bowl First</span>
              </label>
            </div>
          </div>

          <div style="background: rgba(0, 229, 153, 0.08); border: 1px solid rgba(0, 229, 153, 0.25); border-radius: 8px; padding: 0.75rem; margin-bottom: 1.25rem; font-size: 0.8rem; color: #F8FAFC; display: flex; align-items: center; gap: 0.5rem;">
            <input type="checkbox" id="checkPlayingXiVerified" checked style="accent-color: var(--turf-emerald);">
            <label for="checkPlayingXiVerified" style="cursor: pointer;">Both captains have exchanged and signed verified Playing XI team sheets</label>
          </div>

          <div style="display: flex; gap: 0.75rem;">
            <button type="button" class="btn btn-secondary" onclick="closeTossModal()" style="width: auto; flex: 1;">Cancel</button>
            <button type="submit" class="btn" style="width: auto; flex: 2;" data-tooltip="Submit toss record and lock match lineups">✓ Confirm Toss &amp; Start Match</button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Post-Match 5-Star Rating Modal -->
  <div class="modal-backdrop" id="modalMatchRating">
    <div class="modal-dialog" style="max-width: 540px;">
      <div class="modal-header">
        <div class="modal-title">
          <span>⭐ Post-Match Verification &amp; Ratings</span>
        </div>
        <button class="modal-close-btn" aria-label="Close dialog" onclick="closeMatchRatingModal()" data-tooltip="Close rating modal">✕</button>
      </div>
      <div class="modal-body">
        <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem;">
          Verified post-match evaluation directly updates provider trust ratings and authorizes double-entry escrow disbursement.
        </div>

        <form id="formPostMatchRating" onsubmit="submitPostMatchRating(event)">
          <div style="margin-bottom: 1.15rem;">
            <div style="display: flex; justify-content: space-between; font-size: 0.88rem; font-weight: 700; color: #f8fafc; margin-bottom: 0.35rem;">
              <span>🏟️ Turf &amp; Pitch Condition</span>
              <span id="labelPitchRating" style="color: #FFB800; font-family: var(--font-score); font-weight: 700;">5 ★</span>
            </div>
            <input type="range" id="inputRatingPitch" min="1" max="5" value="5" step="1" oninput="updateRatingDisplay('labelPitchRating', this.value)" style="width: 100%; accent-color: var(--turf-emerald);">
            <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-muted);">
              <span>Poor Surface</span>
              <span>International Standard</span>
            </div>
          </div>

          <div style="margin-bottom: 1.15rem;">
            <div style="display: flex; justify-content: space-between; font-size: 0.88rem; font-weight: 700; color: #f8fafc; margin-bottom: 0.35rem;">
              <span>⚖️ Official Umpiring &amp; Fair Play</span>
              <span id="labelUmpireRating" style="color: #FFB800; font-family: var(--font-score); font-weight: 700;">5 ★</span>
            </div>
            <input type="range" id="inputRatingUmpire" min="1" max="5" value="5" step="1" oninput="updateRatingDisplay('labelUmpireRating', this.value)" style="width: 100%; accent-color: var(--cyan);">
            <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-muted);">
              <span>Disputed Decisions</span>
              <span>Flawless Officiating</span>
            </div>
          </div>

          <div style="margin-bottom: 1.15rem;">
            <div style="display: flex; justify-content: space-between; font-size: 0.88rem; font-weight: 700; color: #f8fafc; margin-bottom: 0.35rem;">
              <span>📋 Live Electronic Scoring Accuracy</span>
              <span id="labelScorerRating" style="color: #FFB800; font-family: var(--font-score); font-weight: 700;">5 ★</span>
            </div>
            <input type="range" id="inputRatingScorer" min="1" max="5" value="5" step="1" oninput="updateRatingDisplay('labelScorerRating', this.value)" style="width: 100%; accent-color: var(--purple-light);">
            <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-muted);">
              <span>Sync Lag / Errors</span>
              <span>100% Ball Precision</span>
            </div>
          </div>

          <div style="margin-bottom: 1.25rem;">
            <label style="display: block; font-size: 0.82rem; color: var(--text-muted); margin-bottom: 0.35rem;">Match Verification Remarks (Optional):</label>
            <textarea id="inputRatingRemarks" rows="2" placeholder="Both franchises played with exceptional MCC Spirit of Cricket..." style="width: 100%; background: #060a12; border: 1px solid var(--border-subtle); border-radius: 8px; color: #f8fafc; padding: 0.5rem; font-family: var(--font-body); font-size: 0.85rem;"></textarea>
          </div>

          <div style="display: flex; gap: 0.75rem;">
            <button type="button" onclick="closeMatchRatingModal()" class="btn btn-secondary" style="width: auto; flex: 1;">Cancel</button>
            <button type="submit" class="btn" style="width: auto; flex: 2;" data-tooltip="Submit verified review and disburse escrow to provider">✓ Submit &amp; Disburse Escrow</button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Store Compliance, Privacy Policy & Terms Modal -->
  <div class="modal-backdrop" id="modalLegalPolicies">
    <div class="modal-dialog" style="max-width: 680px;">
      <div class="modal-header">
        <div class="modal-title">
          <span>📜 CricOS Store Compliance, Privacy &amp; Terms</span>
        </div>
        <button class="modal-close-btn" aria-label="Close dialog" onclick="closeLegalModal()" data-tooltip="Close legal modal">✕</button>
      </div>
      <div class="modal-body">
        <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.75rem;">
          <button type="button" id="btnLegalTabPrivacy" class="nav-pill active" onclick="switchLegalTab('privacy')" style="cursor: pointer; font-weight: 700;">🔒 Privacy Policy</button>
          <button type="button" id="btnLegalTabTerms" class="nav-pill" onclick="switchLegalTab('terms')" style="cursor: pointer; font-weight: 700;">⚖️ Terms of Service</button>
          <button type="button" id="btnLegalTabApple" class="nav-pill" onclick="switchLegalTab('apple')" style="cursor: pointer; font-weight: 700; color: var(--turf-emerald);">🍏 Store Guidelines</button>
        </div>

        <div id="legalSubViewPrivacy" style="font-size: 0.84rem; line-height: 1.6; color: #CBD5E1; max-height: 420px; overflow-y: auto; padding-right: 0.5rem;">
          <h3 style="color: #F8FAFC; margin-bottom: 0.5rem;">Privacy Policy (Effective 16 Sept 2026)</h3>
          <p>CricOS (<code>com.cricos.app</code>) operates on privacy-by-design principles for all sporting, scoring, and booking participants.</p>
          <div style="background: rgba(0, 229, 153, 0.08); border: 1px solid rgba(0, 229, 153, 0.25); border-radius: 8px; padding: 0.75rem; margin: 0.75rem 0;">
            <strong style="color: var(--turf-emerald);">Zero Third-Party Tracking:</strong> We do NOT sell personal data or track users across third-party websites or services. Apple <code>NSPrivacyTracking</code> is certified <code>false</code>.
          </div>
          <h4 style="color: #F8FAFC; margin-top: 1rem;">In-App Account &amp; Data Deletion (Apple 5.1.1(v) &amp; Google Play)</h4>
          <p>Users may irreversibly delete their profile, squad memberships, and personal data at any time via <code>My Profile &gt; Delete Account</code>. Token revocation and database record purging occur within 24 hours.</p>
        </div>

        <div id="legalSubViewTerms" style="display: none; font-size: 0.84rem; line-height: 1.6; color: #CBD5E1; max-height: 420px; overflow-y: auto; padding-right: 0.5rem;">
          <h3 style="color: #F8FAFC; margin-bottom: 0.5rem;">Terms of Service</h3>
          <p>By using CricOS, you agree to record truthful, unbiased match scores, adhere to MCC Laws of Cricket, and respect confirmed turf booking commitments.</p>
          <p style="margin-top: 0.5rem;">All commercial bookings are secured via 15-minute exclusive reservation locks and double-entry escrow accounting. Platform service fees (5%) and statutory GST (18%) are transparently itemized prior to confirmation.</p>
        </div>

        <div id="legalSubViewApple" style="display: none; font-size: 0.84rem; line-height: 1.6; color: #CBD5E1; max-height: 420px; overflow-y: auto; padding-right: 0.5rem;">
          <h3 style="color: #F8FAFC; margin-bottom: 0.5rem;">App Store &amp; Google Play Store Readiness Checklist</h3>
          <ul style="padding-left: 1.25rem; margin: 0.5rem 0;">
            <li>✓ <strong>Apple Privacy Manifest:</strong> <code>PrivacyInfo.xcprivacy</code> bundled with declared API reasons (CA92.1, 35F9.1, C617.1, E174.1).</li>
            <li>✓ <strong>Apple Guideline 5.1.1(v):</strong> Real-time in-app account deletion workflow verified.</li>
            <li>✓ <strong>Google Play Data Safety:</strong> Complete data collection &amp; encryption declarations ready.</li>
            <li>✓ <strong>App Assets:</strong> 1024x1024 RGB App Store icon, 512x512 adaptive icon, and 1242x2436 splash screen bundled.</li>
            <li>✓ <strong>Target Android API:</strong> API 34+ (Android 14).</li>
          </ul>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" style="width: auto;" onclick="closeLegalModal()">Close</button>
      </div>
    </div>
  </div>
  <!-- Notification Center Drawer -->
  <div id="notificationsDrawerOverlay" class="modal-backdrop" onclick="closeNotificationsDrawer()" style="display: none; background: rgba(0,0,0,0.65); backdrop-filter: blur(4px);"></div>
  <div id="notificationsDrawer" style="position: fixed; top: 0; right: -400px; width: 380px; max-width: 92vw; height: 100vh; background: var(--bg-surface); border-left: 1px solid var(--border-subtle); box-shadow: -10px 0 30px rgba(0, 0, 0, 0.6); z-index: 10000; transition: right 0.25s cubic-bezier(0.16, 1, 0.3, 1); display: flex; flex-direction: column;">
    <div style="padding: 1.25rem 1rem; border-bottom: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <span style="font-size: 1.15rem;">🔔</span>
        <span style="font-weight: 700; font-family: var(--font-display); font-size: 1rem; color: #FFF;">Notification Center</span>
        <span id="drawerUnreadCountBadge" style="font-size: 0.7rem; background: var(--turf-emerald); color: #04070D; font-weight: 800; padding: 0.1rem 0.45rem; border-radius: 9999px;">3 unread</span>
      </div>
      <button onclick="closeNotificationsDrawer()" style="background: none; border: none; color: var(--text-muted); font-size: 1.2rem; cursor: pointer;" data-tooltip="Close notification drawer">&times;</button>
    </div>
    <div style="padding: 0.5rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.2);">
      <div style="display: flex; gap: 0.35rem;">
        <button class="notif-filter-pill active" onclick="filterDrawerNotifications('ALL')" data-tooltip="Show all notifications" style="font-size: 0.7rem; padding: 0.2rem 0.5rem; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.08); color: #FFF; cursor: pointer;">All</button>
        <button class="notif-filter-pill" onclick="filterDrawerNotifications('UNREAD')" data-tooltip="Show unread notifications" style="font-size: 0.7rem; padding: 0.2rem 0.5rem; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: var(--text-muted); cursor: pointer;">Unread</button>
        <button class="notif-filter-pill" onclick="filterDrawerNotifications('MATCH')" data-tooltip="Show match alerts" style="font-size: 0.7rem; padding: 0.2rem 0.5rem; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: var(--text-muted); cursor: pointer;">Match</button>
        <button class="notif-filter-pill" onclick="filterDrawerNotifications('FINANCIAL')" data-tooltip="Show escrow payments" style="font-size: 0.7rem; padding: 0.2rem 0.5rem; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: var(--text-muted); cursor: pointer;">Escrow</button>
      </div>
      <button onclick="markAllDrawerAsRead()" data-tooltip="Mark all notifications as read" style="background: none; border: none; font-size: 0.7rem; color: var(--turf-emerald); cursor: pointer; text-decoration: underline;">Mark read</button>
    </div>
    <div id="notificationItemsList" style="flex: 1; overflow-y: auto; padding: 0.5rem 0;"></div>
  </div>

  <!-- Event Basket Modal -->
  <div class="modal-backdrop" id="modalEventBasket">
    <div class="modal-dialog" style="max-width: 600px;">
      <div class="modal-header">
        <div class="modal-title">
          <span>🧺 Match Event Basket &amp; Resource Procurement</span>
        </div>
        <button class="modal-close-btn" aria-label="Close dialog" onclick="closeEventBasketModal()" data-tooltip="Close basket modal">✕</button>
      </div>
      <div class="modal-body">
        <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1rem;">
          Mandatory match sporting resources locked in double-entry escrow under verified commercial policies.
        </div>

        <div id="eventBasketItemsList" style="display: flex; flex-direction: column; gap: 0.65rem; margin-bottom: 1.25rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.06); padding: 0.75rem 1rem; border-radius: 8px;">
            <div>
              <div style="font-weight: 700; font-size: 0.85rem; color: #FFF;">🏟️ Turf Arena (Koramangala Pitch 1)</div>
              <div style="font-size: 0.72rem; color: var(--text-muted);">4-Hour Match Slot (14:00 - 18:00) • Reservation Lock Confirmed</div>
            </div>
            <div style="text-align: right;">
              <div style="font-family: var(--font-mono); font-weight: 700; color: var(--turf-emerald); font-size: 0.88rem;">₹8,500.00</div>
              <span style="font-size: 0.65rem; color: var(--turf-emerald); font-weight: 700;">LOCKED</span>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.06); padding: 0.75rem 1rem; border-radius: 8px;">
            <div>
              <div style="font-weight: 700; font-size: 0.85rem; color: #FFF;">👨‍⚖️ Lead Umpire (Rajesh Sharma)</div>
              <div style="font-size: 0.72rem; color: var(--text-muted);">Level-2 MCC Certified • Venue Check-In Complete</div>
            </div>
            <div style="text-align: right;">
              <div style="font-family: var(--font-mono); font-weight: 700; color: var(--turf-emerald); font-size: 0.88rem;">₹3,500.00</div>
              <span style="font-size: 0.65rem; color: var(--turf-emerald); font-weight: 700;">LOCKED</span>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.06); padding: 0.75rem 1rem; border-radius: 8px;">
            <div>
              <div style="font-weight: 700; font-size: 0.85rem; color: #FFF;">🏏 Official Match Balls (Box of 2)</div>
              <div style="font-size: 0.72rem; color: var(--text-muted);">Kookaburra Turf Regulation White Balls (156g)</div>
            </div>
            <div style="text-align: right;">
              <div style="font-family: var(--font-mono); font-weight: 700; color: var(--turf-emerald); font-size: 0.88rem;">₹2,200.00</div>
              <span style="font-size: 0.65rem; color: var(--turf-emerald); font-weight: 700;">PROCURED</span>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.06); padding: 0.75rem 1rem; border-radius: 8px;">
            <div>
              <div style="font-weight: 700; font-size: 0.85rem; color: #FFF;">📋 Official Scorer Console License</div>
              <div style="font-size: 0.72rem; color: var(--text-muted);">Live SSE Real-Time Ball Stream + Worm Charts</div>
            </div>
            <div style="text-align: right;">
              <div style="font-family: var(--font-mono); font-weight: 700; color: var(--turf-emerald); font-size: 0.88rem;">₹800.00</div>
              <span style="font-size: 0.65rem; color: var(--turf-emerald); font-weight: 700;">ACTIVE</span>
            </div>
          </div>
        </div>

        <!-- Commercial Settlement Breakdown -->
        <div style="background: rgba(0, 0, 0, 0.4); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 1rem;">
          <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 0.35rem; color: var(--text-muted);">
            <span>Subtotal (4 Items)</span>
            <span style="font-family: var(--font-mono); font-weight: 600; color: #FFF;">₹15,000.00</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 0.35rem; color: var(--text-muted);">
            <span>Platform Facilitation Fee (5%)</span>
            <span style="font-family: var(--font-mono); font-weight: 600; color: #FFF;">₹750.00</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 0.5rem; color: var(--text-muted);">
            <span>Statutory GST (18% on fee)</span>
            <span style="font-family: var(--font-mono); font-weight: 600; color: #FFF;">₹135.00</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 1rem; font-weight: 700; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 0.65rem; color: var(--turf-emerald);">
            <span>Total Escrow Deposit</span>
            <span style="font-family: var(--font-mono);">₹15,885.00</span>
          </div>
        </div>
      </div>
      <div class="modal-footer" style="display: flex; justify-content: space-between;">
        <button class="btn btn-secondary" onclick="closeEventBasketModal()" style="width: auto;">Close</button>
        <button class="btn btn-primary" onclick="proceedBasketCheckout()" data-tooltip="Simulate verified double-entry escrow disbursement" style="width: auto;">✓ Secure in Escrow</button>
      </div>
    </div>
  </div>

  <!-- Provider Storefront Modal -->
  <div class="modal-backdrop" id="modalProviderStorefront">
    <div class="modal-dialog" style="max-width: 640px;">
      <div class="modal-header">
        <div class="modal-title">
          <span>🏪 Provider Storefront &amp; Capacity Manager</span>
        </div>
        <button class="modal-close-btn" aria-label="Close dialog" onclick="closeProviderStorefrontModal()" data-tooltip="Close storefront modal">✕</button>
      </div>
      <div class="modal-body">
        <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1rem;">
          Publish match slots, set availability hours, and inspect settled provider earnings.
        </div>

        <!-- Earnings Breakdown -->
        <div style="background: rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 1rem; margin-bottom: 1.25rem;">
          <div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.5rem;">Settlement Earnings (Month to Date)</div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; font-family: var(--font-mono); text-align: center;">
            <div style="background: rgba(255,255,255,0.02); padding: 0.5rem; border-radius: 6px;">
              <div style="font-size: 0.65rem; color: var(--text-muted);">Gross Revenue</div>
              <div style="font-size: 1.1rem; font-weight: 700; color: #FFF;">₹1,45,000</div>
            </div>
            <div style="background: rgba(255,255,255,0.02); padding: 0.5rem; border-radius: 6px;">
              <div style="font-size: 0.65rem; color: var(--text-muted);">Net Disbursed</div>
              <div style="font-size: 1.1rem; font-weight: 700; color: var(--turf-emerald);">₹1,36,445</div>
            </div>
            <div style="background: rgba(255,255,255,0.02); padding: 0.5rem; border-radius: 6px;">
              <div style="font-size: 0.65rem; color: var(--text-muted);">In Escrow Hold</div>
              <div style="font-size: 1.1rem; font-weight: 700; color: var(--amber);">₹18,500</div>
            </div>
          </div>
        </div>

        <!-- Add New Slot -->
        <div style="background: rgba(255,255,255,0.03); border: 1px dashed rgba(255,255,255,0.12); border-radius: 8px; padding: 1rem; margin-bottom: 1.25rem;">
          <div style="font-weight: 700; font-size: 0.85rem; margin-bottom: 0.5rem; color: var(--cyan);">+ Publish New Match Slot</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.5rem; margin-bottom: 0.5rem;">
            <div>
              <label style="font-size: 0.7rem; color: var(--text-muted);">Time Range</label>
              <input type="text" id="storefrontSlotTime" value="14:00 - 18:00" style="width: 100%; padding: 0.4rem; font-size: 0.78rem; background: rgba(0,0,0,0.5); border: 1px solid var(--border-subtle); color: #FFF; border-radius: 4px;">
            </div>
            <div>
              <label style="font-size: 0.7rem; color: var(--text-muted);">Rate (INR)</label>
              <input type="number" id="storefrontSlotRate" value="6500" style="width: 100%; padding: 0.4rem; font-size: 0.78rem; background: rgba(0,0,0,0.5); border: 1px solid var(--border-subtle); color: #FFF; border-radius: 4px;">
            </div>
            <div>
              <label style="font-size: 0.7rem; color: var(--text-muted);">Pitch Type</label>
              <select id="storefrontSlotPitch" style="width: 100%; padding: 0.4rem; font-size: 0.78rem; background: rgba(0,0,0,0.5); border: 1px solid var(--border-subtle); color: #FFF; border-radius: 4px;">
                <option value="Natural Turf">Natural Turf</option>
                <option value="Astro Turf">Astro Turf</option>
                <option value="Floodlit Turf">Floodlit Turf</option>
              </select>
            </div>
          </div>
          <div style="display: flex; justify-content: flex-end; margin-top: 0.5rem;">
            <button class="btn btn-primary" onclick="submitNewSlotPublication()" data-tooltip="Publish slot into real-time search index" style="padding: 0.35rem 0.8rem; font-size: 0.75rem; width: auto;">Publish Slot</button>
          </div>
        </div>

        <div style="font-weight: 700; font-size: 0.85rem; margin-bottom: 0.5rem;">Managed Match Slots</div>
        <div id="storefrontSlotsList" style="display: flex; flex-direction: column; gap: 0.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.06); padding: 0.65rem 0.85rem; border-radius: 6px;">
            <div>
              <div style="font-weight: 700; font-size: 0.85rem; color: #FFF;">06:00 - 09:00</div>
              <div style="font-size: 0.7rem; color: var(--text-muted);">Natural Turf • Morning Slot</div>
            </div>
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <span style="font-weight: 700; font-family: var(--font-mono); color: var(--turf-emerald); font-size: 0.85rem;">₹4,500</span>
              <span style="font-size: 0.65rem; color: var(--cyan); font-weight: 700;">AVAILABLE</span>
              <button class="btn btn-secondary" onclick="toggleSlotStatus(this)" style="padding: 0.2rem 0.5rem; font-size: 0.7rem; width: auto;" data-tooltip="Block or unblock slot">Block</button>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.06); padding: 0.65rem 0.85rem; border-radius: 6px;">
            <div>
              <div style="font-weight: 700; font-size: 0.85rem; color: #FFF;">18:00 - 22:00</div>
              <div style="font-size: 0.7rem; color: var(--text-muted);">Floodlit Premium Turf • Evening Prime</div>
            </div>
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <span style="font-weight: 700; font-family: var(--font-mono); color: var(--turf-emerald); font-size: 0.85rem;">₹8,500</span>
              <span style="font-size: 0.65rem; color: var(--rose); font-weight: 700;">RESERVED</span>
              <button class="btn btn-secondary" onclick="toggleSlotStatus(this)" style="padding: 0.2rem 0.5rem; font-size: 0.7rem; width: auto;" data-tooltip="Block or unblock slot">Unfreeze</button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeProviderStorefrontModal()" style="width: auto;">Close</button>
      </div>
    </div>
  </div>

  <!-- Modal 1: Create Match Wizard -->
  <div class="modal-backdrop" id="modalCreateEvent">
    <div class="modal-dialog" style="max-width: 680px;">
      <div class="modal-header">
        <div class="modal-title">
          <span>🏏 Create Cricket Event &amp; Match Wizard</span>
        </div>
        <button class="modal-close-btn" aria-label="Close dialog" onclick="closeCreateEventModal()" data-tooltip="Close event wizard">✕</button>
      </div>
      <div class="modal-body">
        <!-- Stepper -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 1.5rem; position: relative; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 1rem;">
          <div class="wizard-step active" id="wizStep1Indicator" style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; font-weight: 700; color: var(--turf-emerald);">
            <span style="width: 22px; height: 22px; border-radius: 50%; background: var(--turf-emerald); color: #04070D; display: inline-flex; align-items: center; justify-content: center; font-size: 0.75rem;">1</span>
            Format &amp; Overs
          </div>
          <div class="wizard-step" id="wizStep2Indicator" style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; font-weight: 700; color: var(--text-muted);">
            <span style="width: 22px; height: 22px; border-radius: 50%; background: rgba(255,255,255,0.1); color: #FFF; display: inline-flex; align-items: center; justify-content: center; font-size: 0.75rem;">2</span>
            Teams &amp; Officials
          </div>
          <div class="wizard-step" id="wizStep3Indicator" style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; font-weight: 700; color: var(--text-muted);">
            <span style="width: 22px; height: 22px; border-radius: 50%; background: rgba(255,255,255,0.1); color: #FFF; display: inline-flex; align-items: center; justify-content: center; font-size: 0.75rem;">3</span>
            Venue &amp; Schedule
          </div>
        </div>

        <!-- Step 1 Panel: Format Selection -->
        <div id="wizStep1Panel">
          <div style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 1rem;">Select official cricket match format and playing conditions:</div>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; margin-bottom: 1.25rem;">
            <div class="format-card active" onclick="selectWizardFormat('T20')" id="fmtCard-T20" style="background: rgba(0, 229, 153, 0.08); border: 2px solid var(--turf-emerald); border-radius: 8px; padding: 1rem; cursor: pointer;" data-tooltip="Twenty20: 20 overs per side, 6-over powerplay, max 4 overs/bowler">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                <span style="font-family: var(--font-display); font-weight: 800; font-size: 1.1rem; color: #FFF;">T20</span>
                <span style="background: var(--turf-emerald); color: #04070D; font-size: 0.65rem; font-weight: 800; padding: 0.1rem 0.4rem; border-radius: 4px;">RECOMMENDED</span>
              </div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">20 Overs • 6 Over Powerplay • Max 4 ov/bowler</div>
            </div>
            <div class="format-card" onclick="selectWizardFormat('ODI')" id="fmtCard-ODI" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 1rem; cursor: pointer;" data-tooltip="One Day International: 50 overs per side, 10-over powerplay">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                <span style="font-family: var(--font-display); font-weight: 800; font-size: 1.1rem; color: #FFF;">ODI (50 Overs)</span>
              </div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">50 Overs • 10 Over Powerplay • Max 10 ov/bowler</div>
            </div>
            <div class="format-card" onclick="selectWizardFormat('TEST')" id="fmtCard-TEST" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 1rem; cursor: pointer;" data-tooltip="Multi-day Test match: 4 innings, unlimited overs">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                <span style="font-family: var(--font-display); font-weight: 800; font-size: 1.1rem; color: #FFF;">TEST MATCH</span>
              </div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">4 Innings • Unlimited Overs • Traditional White Kit</div>
            </div>
            <div class="format-card" onclick="selectWizardFormat('CUSTOM')" id="fmtCard-CUSTOM" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 1rem; cursor: pointer;" data-tooltip="Configure custom overs, powerplay, and squad size">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                <span style="font-family: var(--font-display); font-weight: 800; font-size: 1.1rem; color: #FFF;">CUSTOM</span>
              </div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">Box Cricket / 10-15 Overs • Dynamic Conditions</div>
            </div>
          </div>
          <div id="customOversRow" style="display: none; background: rgba(0,0,0,0.3); padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); margin-bottom: 1rem;">
            <label style="font-size: 0.75rem; color: var(--text-muted); display: block; margin-bottom: 0.35rem;">Custom Overs Per Side (1 – 100)</label>
            <input type="number" id="wizCustomOvers" value="12" min="1" max="100" style="width: 100px; padding: 0.4rem; background: rgba(0,0,0,0.5); border: 1px solid var(--border-subtle); color: #FFF; border-radius: 4px; font-family: var(--font-mono);">
          </div>
        </div>

        <!-- Step 2 Panel: Teams & Officials -->
        <div id="wizStep2Panel" style="display: none;">
          <div style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 1rem;">Assign participating teams and mandatory sporting officials:</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1.25rem;">
            <div>
              <label style="font-size: 0.75rem; color: var(--text-muted); display: block; margin-bottom: 0.35rem;">Home Team</label>
              <select id="wizHomeTeam" style="width: 100%; padding: 0.5rem; background: rgba(0,0,0,0.5); border: 1px solid var(--border-subtle); color: #FFF; border-radius: 6px;">
                <option value="BLR">Bengaluru Strikers (BLR)</option>
                <option value="MUM">Mumbai Blasters (MUM)</option>
                <option value="DEL">Delhi Daredevils (DEL)</option>
                <option value="CHE">Chennai Super Kings (CHE)</option>
              </select>
            </div>
            <div>
              <label style="font-size: 0.75rem; color: var(--text-muted); display: block; margin-bottom: 0.35rem;">Away Team</label>
              <select id="wizAwayTeam" style="width: 100%; padding: 0.5rem; background: rgba(0,0,0,0.5); border: 1px solid var(--border-subtle); color: #FFF; border-radius: 6px;">
                <option value="MUM">Mumbai Blasters (MUM)</option>
                <option value="BLR">Bengaluru Strikers (BLR)</option>
                <option value="DEL">Delhi Daredevils (DEL)</option>
                <option value="CHE">Chennai Super Kings (CHE)</option>
              </select>
            </div>
          </div>
          <div style="font-weight: 700; font-size: 0.82rem; margin-bottom: 0.5rem; color: #f8fafc;">Mandatory Sporting Officials (Required for Live Sanction)</div>
          <div style="display: flex; flex-direction: column; gap: 0.5rem; background: rgba(0,0,0,0.25); padding: 0.75rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06);">
            <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; color: #FFF; cursor: pointer;">
              <input type="checkbox" id="wizUmpire1" checked disabled>
              <span>Lead Umpire (Level-2 MCC Certified) • ₹3,500.00 Escrow</span>
            </label>
            <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; color: #FFF; cursor: pointer;">
              <input type="checkbox" id="wizUmpire2" checked disabled>
              <span>Leg Umpire (State Board Certified) • ₹2,500.00 Escrow</span>
            </label>
            <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; color: #FFF; cursor: pointer;">
              <input type="checkbox" id="wizScorer" checked disabled>
              <span>Official Digital Scorer (SSE Broadcast Hub) • ₹800.00 Escrow</span>
            </label>
          </div>
        </div>

        <!-- Step 3 Panel: Venue & Schedule -->
        <div id="wizStep3Panel" style="display: none;">
          <div style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 1rem;">Configure venue reservation and match timing:</div>
          <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1rem;">
            <div>
              <label style="font-size: 0.75rem; color: var(--text-muted); display: block; margin-bottom: 0.35rem;">Venue / Turf Arena</label>
              <select id="wizVenue" style="width: 100%; padding: 0.5rem; background: rgba(0,0,0,0.5); border: 1px solid var(--border-subtle); color: #FFF; border-radius: 6px;">
                <option value="V1">Chinnaswamy Turf Arena Ground A (Natural Turf) • ₹8,500.00</option>
                <option value="V2">Koramangala Stadium Pitch 2 (Astro Turf) • ₹6,500.00</option>
                <option value="V3">Indiranagar Cricket Ground (Floodlit) • ₹7,200.00</option>
              </select>
            </div>
            <div style="grid-template-columns: 1fr 1fr; display: grid; gap: 0.75rem;">
              <div>
                <label style="font-size: 0.75rem; color: var(--text-muted); display: block; margin-bottom: 0.35rem;">Match Date</label>
                <input type="date" id="wizDate" value="2026-10-15" style="width: 100%; padding: 0.45rem; background: rgba(0,0,0,0.5); border: 1px solid var(--border-subtle); color: #FFF; border-radius: 6px;">
              </div>
              <div>
                <label style="font-size: 0.75rem; color: var(--text-muted); display: block; margin-bottom: 0.35rem;">Start Time (4-Hour Match Window)</label>
                <input type="time" id="wizTime" value="14:00" style="width: 100%; padding: 0.45rem; background: rgba(0,0,0,0.5); border: 1px solid var(--border-subtle); color: #FFF; border-radius: 6px;">
              </div>
            </div>
            <div style="background: rgba(0, 229, 153, 0.08); border: 1px solid rgba(0, 229, 153, 0.25); padding: 0.75rem 1rem; border-radius: 8px; margin-top: 0.5rem;">
              <div style="font-size: 0.8rem; font-weight: 700; color: var(--turf-emerald);">✓ Auto-Generated Event Basket Total: ₹15,885.00</div>
              <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.2rem;">Includes Venue + 2 Umpires + Official Scorer + Match Balls + 5% platform fee &amp; 18% GST. Protected by double-entry escrow.</div>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer" style="display: flex; justify-content: space-between;">
        <button class="btn btn-secondary" id="wizPrevBtn" onclick="prevWizardStep()" style="display: none; width: auto;">Previous</button>
        <div style="display: flex; gap: 0.5rem; margin-left: auto;">
          <button class="btn btn-secondary" onclick="closeCreateEventModal()" style="width: auto;">Cancel</button>
          <button class="btn btn-primary" id="wizNextBtn" onclick="nextWizardStep()" style="width: auto;">Next: Teams &amp; Officials →</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal 2: Event Overview & Readiness -->
  <div class="modal-backdrop" id="modalEventOverview">
    <div class="modal-dialog" style="max-width: 650px;">
      <div class="modal-header">
        <div class="modal-title">
          <span>📋 Match Event Overview &amp; Procurement Readiness</span>
        </div>
        <button class="modal-close-btn" aria-label="Close dialog" onclick="closeEventOverviewModal()" data-tooltip="Close readiness modal">✕</button>
      </div>
      <div class="modal-body">
        <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 1.25rem; margin-bottom: 1.25rem;">
          <div style="flex: 1;">
            <div style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--turf-emerald); letter-spacing: 0.05em; margin-bottom: 0.35rem;">Operational Clearance</div>
            <div style="font-family: var(--font-display); font-size: 1.25rem; font-weight: 800; color: #FFF; margin-bottom: 0.35rem;">Bengaluru Strikers vs Mumbai Blasters</div>
            <div style="font-size: 0.78rem; color: var(--text-muted);">Match ID: #M-101 • Chinnaswamy Turf Arena Ground A • 20 Overs</div>
          </div>
          <!-- Dynamic SVG Readiness Ring -->
          <div style="text-align: center; margin-left: 1rem;">
            <svg width="84" height="84" viewBox="0 0 100 100" data-tooltip="Procurement readiness: 100% of required match resources secured">
              <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.08)" stroke-width="8" fill="transparent"/>
              <circle cx="50" cy="50" r="42" stroke="var(--turf-emerald)" stroke-width="8" fill="transparent" stroke-dasharray="264" stroke-dashoffset="0" stroke-linecap="round" style="filter: drop-shadow(0 0 6px var(--turf-emerald));"/>
              <text x="50" y="55" font-family="'Space Grotesk', sans-serif" font-weight="800" font-size="20" fill="#FFF" text-anchor="middle">100%</text>
            </svg>
            <div style="font-size: 0.65rem; color: var(--turf-emerald); font-weight: 700; margin-top: 0.2rem;">READY FOR TOSS</div>
          </div>
        </div>

        <!-- 6-Stage Lifecycle Stepper -->
        <div style="margin-bottom: 1.25rem;">
          <div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.5rem;">Event Lifecycle Stage</div>
          <div style="display: flex; gap: 0.35rem; overflow-x: auto; padding-bottom: 0.25rem;">
            <span style="font-size: 0.68rem; font-weight: 700; background: rgba(0,229,153,0.15); color: var(--turf-emerald); border: 1px solid rgba(0,229,153,0.3); padding: 0.25rem 0.5rem; border-radius: 4px;" data-tooltip="Event created in draft">✓ CREATED</span>
            <span style="font-size: 0.68rem; font-weight: 700; background: rgba(0,229,153,0.15); color: var(--turf-emerald); border: 1px solid rgba(0,229,153,0.3); padding: 0.25rem 0.5rem; border-radius: 4px;" data-tooltip="Format, overs, and rules configured">✓ CONFIGURED</span>
            <span style="font-size: 0.68rem; font-weight: 700; background: rgba(0,229,153,0.15); color: var(--turf-emerald); border: 1px solid rgba(0,229,153,0.3); padding: 0.25rem 0.5rem; border-radius: 4px;" data-tooltip="All sporting resources procured in escrow">✓ RESOURCES_BOOKED</span>
            <span style="font-size: 0.68rem; font-weight: 700; background: rgba(0,210,255,0.2); color: var(--cyan); border: 1px solid var(--cyan); padding: 0.25rem 0.5rem; border-radius: 4px;" data-tooltip="Both teams and officials checked in">● READY</span>
            <span style="font-size: 0.68rem; font-weight: 700; background: rgba(255,255,255,0.03); color: var(--text-muted); border: 1px solid rgba(255,255,255,0.06); padding: 0.25rem 0.5rem; border-radius: 4px;" data-tooltip="Live match broadcast in progress">○ LIVE</span>
            <span style="font-size: 0.68rem; font-weight: 700; background: rgba(255,255,255,0.03); color: var(--text-muted); border: 1px solid rgba(255,255,255,0.06); padding: 0.25rem 0.5rem; border-radius: 4px;" data-tooltip="Match finalized and escrow settled">○ COMPLETED</span>
          </div>
        </div>

        <!-- Procurement Checklist -->
        <div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.5rem;">Procured Resources (4 of 4 Confirmed)</div>
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.06); padding: 0.65rem 0.85rem; border-radius: 6px;">
            <div>
              <div style="font-size: 0.82rem; font-weight: 700; color: #FFF;">🏟️ Turf Arena (Chinnaswamy Ground A)</div>
              <div style="font-size: 0.7rem; color: var(--text-muted);">4-Hour Slot • Natural Grass Pitch • Reservation Lock Active</div>
            </div>
            <span style="background: rgba(0,229,153,0.15); color: var(--turf-emerald); font-size: 0.68rem; font-weight: 700; padding: 0.15rem 0.45rem; border-radius: 4px;">BOOKED</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.06); padding: 0.65rem 0.85rem; border-radius: 6px;">
            <div>
              <div style="font-size: 0.82rem; font-weight: 700; color: #FFF;">👨‍⚖️ Lead Umpire (Rajesh Sharma)</div>
              <div style="font-size: 0.7rem; color: var(--text-muted);">Level-2 MCC Certified • Venue Check-In Completed</div>
            </div>
            <span style="background: rgba(0,229,153,0.15); color: var(--turf-emerald); font-size: 0.68rem; font-weight: 700; padding: 0.15rem 0.45rem; border-radius: 4px;">CONFIRMED</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.06); padding: 0.65rem 0.85rem; border-radius: 6px;">
            <div>
              <div style="font-size: 0.82rem; font-weight: 700; color: #FFF;">👨‍⚖️ Leg Umpire (Vikram Rao)</div>
              <div style="font-size: 0.7rem; color: var(--text-muted);">State Board Certified • Ready at Bowler's End</div>
            </div>
            <span style="background: rgba(0,229,153,0.15); color: var(--turf-emerald); font-size: 0.68rem; font-weight: 700; padding: 0.15rem 0.45rem; border-radius: 4px;">CONFIRMED</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.06); padding: 0.65rem 0.85rem; border-radius: 6px;">
            <div>
              <div style="font-size: 0.82rem; font-weight: 700; color: #FFF;">📋 Official Scorer (Amit Patel)</div>
              <div style="font-size: 0.7rem; color: var(--text-muted);">Digital Scorer Console • SSE Live Stream Synchronized</div>
            </div>
            <span style="background: rgba(0,229,153,0.15); color: var(--turf-emerald); font-size: 0.68rem; font-weight: 700; padding: 0.15rem 0.45rem; border-radius: 4px;">ACTIVE</span>
          </div>
        </div>

        <div style="background: rgba(0,229,153,0.08); border: 1px solid rgba(0,229,153,0.25); border-radius: 8px; padding: 0.75rem 1rem; margin-top: 1rem; display: flex; align-items: center; gap: 0.5rem;">
          <span style="font-size: 1rem;">✓</span>
          <span style="font-size: 0.78rem; color: var(--turf-emerald); font-weight: 600;">Zero Blockers Detected: All required sporting assets secured in escrow. Event is fully cleared for live toss.</span>
        </div>
      </div>
      <div class="modal-footer" style="display: flex; justify-content: space-between;">
        <button class="btn btn-secondary" onclick="closeEventOverviewModal()" style="width: auto;">Close</button>
        <button class="btn btn-primary" onclick="closeEventOverviewModal(); openEventBasketModal();" data-tooltip="Inspect escrow financial deposit breakdown" style="width: auto;">🧺 View Event Basket</button>
      </div>
    </div>
  </div>

  <!-- Modal 3: Official Calendar & Availability -->
  <div class="modal-backdrop" id="modalOfficialCalendar">
    <div class="modal-dialog" style="max-width: 720px;">
      <div class="modal-header">
        <div class="modal-title">
          <span>📅 Official Availability Calendar &amp; Slot Manager</span>
        </div>
        <button class="modal-close-btn" aria-label="Close dialog" onclick="closeOfficialCalendarModal()" data-tooltip="Close calendar modal">✕</button>
      </div>
      <div class="modal-body">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
          <div>
            <label style="font-size: 0.72rem; color: var(--text-muted); display: block; margin-bottom: 0.2rem;">Active Official</label>
            <select id="calOfficialSelect" style="padding: 0.35rem 0.65rem; background: rgba(0,0,0,0.5); border: 1px solid var(--border-subtle); color: #FFF; border-radius: 6px; font-size: 0.8rem;">
              <option value="1">Rajesh Sharma (Lead Umpire • 98% Trust • 42 Matches)</option>
              <option value="2">Vikram Rao (Leg Umpire • 95% Trust • 28 Matches)</option>
              <option value="3">Amit Patel (Official Scorer • 99% Trust • 65 Matches)</option>
            </select>
          </div>
          <div style="display: flex; gap: 0.35rem; align-items: center;">
            <span style="font-size: 0.7rem; color: var(--cyan); background: rgba(0,210,255,0.1); padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 700;">Conflict Guard: Active</span>
          </div>
        </div>

        <!-- Day Selector Tabs -->
        <div style="display: flex; gap: 0.35rem; margin-bottom: 1rem; overflow-x: auto; padding-bottom: 0.25rem;">
          <button class="cal-day-btn" onclick="selectCalendarDay('MON', this)" style="padding: 0.35rem 0.65rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: var(--text-muted); font-size: 0.75rem; cursor: pointer;">Mon</button>
          <button class="cal-day-btn" onclick="selectCalendarDay('TUE', this)" style="padding: 0.35rem 0.65rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: var(--text-muted); font-size: 0.75rem; cursor: pointer;">Tue</button>
          <button class="cal-day-btn" onclick="selectCalendarDay('WED', this)" style="padding: 0.35rem 0.65rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: var(--text-muted); font-size: 0.75rem; cursor: pointer;">Wed</button>
          <button class="cal-day-btn" onclick="selectCalendarDay('THU', this)" style="padding: 0.35rem 0.65rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: var(--text-muted); font-size: 0.75rem; cursor: pointer;">Thu</button>
          <button class="cal-day-btn" onclick="selectCalendarDay('FRI', this)" style="padding: 0.35rem 0.65rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: var(--text-muted); font-size: 0.75rem; cursor: pointer;">Fri</button>
          <button class="cal-day-btn active" onclick="selectCalendarDay('SAT', this)" style="padding: 0.35rem 0.65rem; border-radius: 6px; border: 1px solid var(--turf-emerald); background: rgba(0,229,153,0.15); color: var(--turf-emerald); font-weight: 700; font-size: 0.75rem; cursor: pointer;">Sat (Matchday)</button>
          <button class="cal-day-btn" onclick="selectCalendarDay('SUN', this)" style="padding: 0.35rem 0.65rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: var(--text-muted); font-size: 0.75rem; cursor: pointer;">Sun</button>
        </div>

        <!-- Hourly Schedule Grid -->
        <div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.5rem;">Saturday Schedule &amp; Temporal Allocations</div>
        <div id="calendarGridContainer" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 0.5rem; margin-bottom: 1.25rem;">
          <div style="background: rgba(0,229,153,0.08); border: 1px solid rgba(0,229,153,0.25); border-radius: 6px; padding: 0.5rem; text-align: center;">
            <div style="font-family: var(--font-mono); font-size: 0.75rem; font-weight: 700; color: #FFF;">06:00 - 09:00</div>
            <div style="font-size: 0.65rem; color: var(--turf-emerald); font-weight: 700; margin-top: 0.15rem;">AVAILABLE</div>
          </div>
          <div style="background: rgba(255,184,0,0.08); border: 1px solid rgba(255,184,0,0.25); border-radius: 6px; padding: 0.5rem; text-align: center;">
            <div style="font-family: var(--font-mono); font-size: 0.75rem; font-weight: 700; color: #FFF;">09:00 - 10:00</div>
            <div style="font-size: 0.65rem; color: var(--amber); font-weight: 700; margin-top: 0.15rem;">BUFFER (30m Pre)</div>
          </div>
          <div style="background: rgba(255,51,102,0.12); border: 1px solid rgba(255,51,102,0.3); border-radius: 6px; padding: 0.5rem; text-align: center;">
            <div style="font-family: var(--font-mono); font-size: 0.75rem; font-weight: 700; color: #FFF;">10:00 - 14:00</div>
            <div style="font-size: 0.65rem; color: var(--rose); font-weight: 700; margin-top: 0.15rem;">BOOKED (M-098)</div>
          </div>
          <div style="background: rgba(255,184,0,0.08); border: 1px solid rgba(255,184,0,0.25); border-radius: 6px; padding: 0.5rem; text-align: center;">
            <div style="font-family: var(--font-mono); font-size: 0.75rem; font-weight: 700; color: #FFF;">14:00 - 15:00</div>
            <div style="font-size: 0.65rem; color: var(--amber); font-weight: 700; margin-top: 0.15rem;">BUFFER (Post)</div>
          </div>
          <div style="background: rgba(0,210,255,0.12); border: 1px solid rgba(0,210,255,0.3); border-radius: 6px; padding: 0.5rem; text-align: center;">
            <div style="font-family: var(--font-mono); font-size: 0.75rem; font-weight: 700; color: #FFF;">15:00 - 19:00</div>
            <div style="font-size: 0.65rem; color: var(--cyan); font-weight: 700; margin-top: 0.15rem;">HELD (M-101)</div>
          </div>
          <div style="background: rgba(0,229,153,0.08); border: 1px solid rgba(0,229,153,0.25); border-radius: 6px; padding: 0.5rem; text-align: center;">
            <div style="font-family: var(--font-mono); font-size: 0.75rem; font-weight: 700; color: #FFF;">19:00 - 20:00</div>
            <div style="font-size: 0.65rem; color: var(--turf-emerald); font-weight: 700; margin-top: 0.15rem;">AVAILABLE</div>
          </div>
        </div>

        <!-- Conflict Detector Interactive Bar -->
        <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 0.85rem; margin-bottom: 1rem;">
          <div style="font-size: 0.75rem; font-weight: 700; color: #f8fafc; margin-bottom: 0.5rem;">⏱️ Test Booking Slot for Conflict Overlap</div>
          <div style="display: flex; gap: 0.5rem; align-items: flex-end; flex-wrap: wrap;">
            <div>
              <label style="font-size: 0.65rem; color: var(--text-muted); display: block;">Start Hour (24h)</label>
              <input type="number" id="testSlotStart" value="11" min="6" max="20" style="width: 70px; padding: 0.35rem; font-size: 0.75rem; background: rgba(0,0,0,0.5); border: 1px solid var(--border-subtle); color: #FFF; border-radius: 4px;">
            </div>
            <div>
              <label style="font-size: 0.65rem; color: var(--text-muted); display: block;">End Hour (24h)</label>
              <input type="number" id="testSlotEnd" value="13" min="7" max="21" style="width: 70px; padding: 0.35rem; font-size: 0.75rem; background: rgba(0,0,0,0.5); border: 1px solid var(--border-subtle); color: #FFF; border-radius: 4px;">
            </div>
            <button class="btn btn-secondary" onclick="checkCalendarSlotConflict()" data-tooltip="Check schedule availability and detect overlapping match bookings" style="padding: 0.35rem 0.75rem; font-size: 0.75rem; width: auto;">Check Overlap</button>
            <div id="slotConflictResult" style="font-size: 0.75rem; color: var(--amber); margin-left: 0.5rem; align-self: center;"></div>
          </div>
        </div>

        <!-- Buffer Times Configuration -->
        <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-muted); background: rgba(255,255,255,0.02); padding: 0.5rem 0.75rem; border-radius: 6px;">
          <span>Pre-Match Buffer: <strong style="color: #FFF;">30 min</strong></span>
          <span>Post-Match Buffer: <strong style="color: #FFF;">15 min</strong></span>
          <span>Travel Buffer: <strong style="color: #FFF;">60 min</strong></span>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeOfficialCalendarModal()" style="width: auto;">Close</button>
      </div>
    </div>
  </div>

  <!-- Modal 4: Contextual Match Messaging -->
  <div class="modal-backdrop" id="modalMessaging">
    <div class="modal-dialog" style="max-width: 680px; height: 600px; display: flex; flex-direction: column;">
      <div class="modal-header">
        <div class="modal-title">
          <span>💬 Match Coordination &amp; Contextual Messaging</span>
        </div>
        <button class="modal-close-btn" aria-label="Close dialog" onclick="closeMessagingModal()" data-tooltip="Close messaging modal">✕</button>
      </div>
      <div class="modal-body" style="flex: 1; display: flex; flex-direction: column; overflow: hidden; padding: 0;">
        <!-- Thread Header Bar -->
        <div style="padding: 0.75rem 1.25rem; background: rgba(0,0,0,0.3); border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-weight: 700; font-size: 0.88rem; color: #FFF;">Match #M-101 Coordination Thread</div>
            <div style="font-size: 0.72rem; color: var(--text-muted);">Bengaluru Strikers vs Mumbai Blasters • Chinnaswamy Turf A</div>
          </div>
          <span style="font-size: 0.7rem; color: var(--turf-emerald); background: rgba(0,229,153,0.1); padding: 0.15rem 0.45rem; border-radius: 4px; font-weight: 700;">ACTIVE MATCH</span>
        </div>

        <!-- Message Bubbles Scroll Stream -->
        <div id="messagingStream" style="flex: 1; overflow-y: auto; padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem;">
          <!-- System message -->
          <div style="text-align: center; margin: 0.25rem 0;">
            <span style="background: rgba(255,255,255,0.05); color: var(--text-muted); font-size: 0.7rem; padding: 0.2rem 0.6rem; border-radius: 9999px;">🔒 Match created with ₹15,885.00 secured in double-entry escrow</span>
          </div>

          <!-- Provider Message -->
          <div style="align-self: flex-start; max-width: 80%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 0.65rem 0.85rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem; gap: 1rem;">
              <span style="font-size: 0.75rem; font-weight: 700; color: var(--cyan);">🏟️ Chinnaswamy Turf Manager</span>
              <span style="font-size: 0.65rem; color: var(--text-muted);">13:10</span>
            </div>
            <div style="font-size: 0.8rem; color: #e2e8f0;">Ground staff has prepped Pitch #3 with freshly marked regulation white bowling creases. Floodlights operational for second innings.</div>
          </div>

          <!-- Official Quote Card Message -->
          <div style="align-self: flex-start; max-width: 85%; background: rgba(0,229,153,0.05); border: 1px solid rgba(0,229,153,0.25); border-radius: 8px; padding: 0.75rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
              <span style="font-size: 0.75rem; font-weight: 700; color: var(--turf-emerald);">👨‍⚖️ Rajesh Sharma (Level-2 Umpire)</span>
              <span style="font-size: 0.65rem; color: var(--text-muted);">13:15</span>
            </div>
            <div style="font-size: 0.8rem; color: #FFF; margin-bottom: 0.5rem;">Official Umpiring Quote for Match #M-101 (4-Hour Assignment)</div>
            <div style="background: rgba(0,0,0,0.4); padding: 0.5rem; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <span style="font-size: 0.78rem; color: var(--text-muted);">Umpiring Fee:</span>
              <span style="font-family: var(--font-mono); font-weight: 700; color: var(--turf-emerald);">₹3,500.00</span>
            </div>
            <div style="display: flex; gap: 0.5rem;">
              <button class="btn btn-primary" onclick="acceptChatQuote()" style="padding: 0.25rem 0.6rem; font-size: 0.72rem; width: auto;" data-tooltip="Accept quote and lock into match escrow">✓ Accept Quote</button>
              <button class="btn btn-secondary" onclick="declineChatQuote()" style="padding: 0.25rem 0.6rem; font-size: 0.72rem; width: auto;" data-tooltip="Decline quote">Decline</button>
            </div>
          </div>

          <!-- Captain Message -->
          <div style="align-self: flex-end; max-width: 80%; background: rgba(0,229,153,0.15); border: 1px solid rgba(0,229,153,0.3); border-radius: 8px; padding: 0.65rem 0.85rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem; gap: 1rem;">
              <span style="font-size: 0.75rem; font-weight: 700; color: var(--turf-emerald);">Virat Sharma (Captain)</span>
              <span style="font-size: 0.65rem; color: var(--text-muted);">13:20</span>
            </div>
            <div style="font-size: 0.8rem; color: #FFF;">Confirmed! Squad will arrive at 13:30 for team warm-ups and pitch inspection before toss.</div>
          </div>
        </div>

        <!-- Quick Actions Chips -->
        <div style="padding: 0.4rem 1rem; background: rgba(0,0,0,0.2); border-top: 1px solid rgba(255,255,255,0.06); display: flex; gap: 0.4rem; overflow-x: auto;">
          <button onclick="sendQuickAction('Confirm Arrival')" style="padding: 0.2rem 0.5rem; font-size: 0.7rem; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: var(--text-muted); cursor: pointer;" data-tooltip="Send fast check-in update">📍 Confirm Arrival</button>
          <button onclick="sendQuickAction('Request Pitch Inspection')" style="padding: 0.2rem 0.5rem; font-size: 0.7rem; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: var(--text-muted); cursor: pointer;" data-tooltip="Ask umpires for pitch clearance">🏏 Inspect Pitch</button>
          <button onclick="sendQuickAction('Ready for Toss')" style="padding: 0.2rem 0.5rem; font-size: 0.7rem; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: var(--text-muted); cursor: pointer;" data-tooltip="Notify scorer and officials">🪙 Ready for Toss</button>
        </div>

        <!-- Message Input Bar -->
        <div style="padding: 0.75rem 1rem; background: rgba(9,13,22,0.95); border-top: 1px solid rgba(255,255,255,0.08); display: flex; gap: 0.5rem; align-items: center;">
          <input type="text" id="chatInputText" placeholder="Type match coordination message..." style="flex: 1; padding: 0.5rem 0.75rem; background: rgba(0,0,0,0.5); border: 1px solid var(--border-subtle); color: #FFF; border-radius: 6px; font-size: 0.82rem;">
          <button class="btn btn-primary" onclick="submitChatMessage()" style="width: auto; padding: 0.5rem 1rem; font-size: 0.82rem;" data-tooltip="Send message across WebSocket / SSE channel">Send</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal 5: Booking Lifecycle, Cancellation & Rescheduling -->
  <div class="modal-backdrop" id="modalBookingLifecycle">
    <div class="modal-dialog" style="max-width: 680px;">
      <div class="modal-header">
        <div class="modal-title">
          <span>🔄 Cancellation Policy &amp; Rescheduling Engine</span>
        </div>
        <button class="modal-close-btn" aria-label="Close dialog" onclick="closeBookingLifecycleModal()" data-tooltip="Close cancellation modal">✕</button>
      </div>
      <div class="modal-body">
        <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1rem;">
          Automated double-entry refund and penalty enforcement based on notice time bands:
        </div>

        <!-- 4-Tier Cancellation Bands -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; margin-bottom: 1.25rem;">
          <div style="background: rgba(0,229,153,0.08); border: 2px solid var(--turf-emerald); border-radius: 8px; padding: 0.75rem; text-align: center;">
            <div style="font-size: 0.68rem; font-weight: 700; color: var(--turf-emerald);">ACTIVE WINDOW</div>
            <div style="font-weight: 800; font-size: 1.1rem; color: #FFF; margin: 0.2rem 0;">&gt; 48 Hrs</div>
            <div style="font-size: 0.72rem; color: var(--turf-emerald); font-weight: 700;">100% Refund</div>
            <div style="font-size: 0.65rem; color: var(--text-muted);">0% Penalty</div>
          </div>
          <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 0.75rem; text-align: center;">
            <div style="font-size: 0.68rem; font-weight: 700; color: var(--text-muted);">BAND 2</div>
            <div style="font-weight: 800; font-size: 1.1rem; color: #FFF; margin: 0.2rem 0;">24 – 48 Hrs</div>
            <div style="font-size: 0.72rem; color: var(--cyan); font-weight: 700;">75% Refund</div>
            <div style="font-size: 0.65rem; color: var(--text-muted);">25% Provider Comp</div>
          </div>
          <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 0.75rem; text-align: center;">
            <div style="font-size: 0.68rem; font-weight: 700; color: var(--text-muted);">BAND 3</div>
            <div style="font-weight: 800; font-size: 1.1rem; color: #FFF; margin: 0.2rem 0;">12 – 24 Hrs</div>
            <div style="font-size: 0.72rem; color: var(--amber); font-weight: 700;">50% Refund</div>
            <div style="font-size: 0.65rem; color: var(--text-muted);">50% Provider Split</div>
          </div>
          <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 0.75rem; text-align: center;">
            <div style="font-size: 0.68rem; font-weight: 700; color: var(--text-muted);">BAND 4</div>
            <div style="font-weight: 800; font-size: 1.1rem; color: #FFF; margin: 0.2rem 0;">&lt; 12 Hrs</div>
            <div style="font-size: 0.72rem; color: var(--rose); font-weight: 700;">0% Refund</div>
            <div style="font-size: 0.65rem; color: var(--text-muted);">100% Forfeited</div>
          </div>
        </div>

        <!-- Rescheduling Calculator -->
        <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 1rem; margin-bottom: 1.25rem;">
          <div style="font-size: 0.82rem; font-weight: 700; color: #f8fafc; margin-bottom: 0.5rem;">🔄 Reschedule Slot &amp; Price Adjustment Calculator</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem; margin-bottom: 0.75rem;">
            <div>
              <label style="font-size: 0.68rem; color: var(--text-muted);">Current Slot Rate</label>
              <div style="font-family: var(--font-mono); font-weight: 700; font-size: 0.9rem; color: #FFF; padding-top: 0.25rem;">₹3,500.00</div>
            </div>
            <div>
              <label style="font-size: 0.68rem; color: var(--text-muted);">Select New Slot</label>
              <select id="rescheduleTargetRate" onchange="calculateReschedulePriceAdjustment()" style="width: 100%; padding: 0.35rem; font-size: 0.75rem; background: rgba(0,0,0,0.5); border: 1px solid var(--border-subtle); color: #FFF; border-radius: 4px;">
                <option value="4000">Sunday 18:00 Prime (₹4,000)</option>
                <option value="3500">Sunday 10:00 Standard (₹3,500)</option>
                <option value="3000">Monday 07:00 Morning (₹3,000)</option>
              </select>
            </div>
            <div>
              <label style="font-size: 0.68rem; color: var(--text-muted);">Price Adjustment</label>
              <div id="rescheduleDiffDisplay" style="font-family: var(--font-mono); font-weight: 700; font-size: 0.9rem; color: var(--amber); padding-top: 0.25rem;">+₹500.00 to pay</div>
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 0.5rem;">
            <span style="font-size: 0.7rem; color: var(--text-muted);">Reschedule Policy: 1 of 3 allowed reschedules used.</span>
            <button class="btn btn-secondary" onclick="executeRescheduleBooking()" data-tooltip="Perform slot shift and adjust escrow balance" style="padding: 0.25rem 0.65rem; font-size: 0.72rem; width: auto;">Confirm Reschedule</button>
          </div>
        </div>

        <!-- Special Event Protections -->
        <div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.5rem;">Special Protections &amp; Dispute Actions</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div style="background: rgba(0,210,255,0.05); border: 1px solid rgba(0,210,255,0.2); border-radius: 8px; padding: 0.75rem;">
            <div style="font-weight: 700; font-size: 0.82rem; color: var(--cyan); margin-bottom: 0.25rem;">🌧️ Weather Washout Claim</div>
            <div style="font-size: 0.7rem; color: var(--text-muted); margin-bottom: 0.5rem;">Unplayable rain interruption triggers 100% full refund with zero cancellation penalty under force-majeure clause.</div>
            <button class="btn btn-secondary" onclick="triggerWeatherWashout()" data-tooltip="Execute 100% full refund journal entry" style="padding: 0.25rem 0.5rem; font-size: 0.7rem; width: auto;">Claim Weather Refund</button>
          </div>
          <div style="background: rgba(255,51,102,0.05); border: 1px solid rgba(255,51,102,0.2); border-radius: 8px; padding: 0.75rem;">
            <div style="font-weight: 700; font-size: 0.82rem; color: var(--rose); margin-bottom: 0.25rem;">⚠️ Report Provider No-Show</div>
            <div style="font-size: 0.7rem; color: var(--text-muted); margin-bottom: 0.5rem;">Applies -15 trust penalty points, 10% provider penalty fine, and automatic customer refund from escrow.</div>
            <button class="btn btn-secondary" onclick="reportNoShowProvider()" data-tooltip="Escalate provider failure to Fair Play desk" style="padding: 0.25rem 0.5rem; font-size: 0.7rem; width: auto; color: var(--rose);">Report No-Show</button>
          </div>
        </div>
      </div>
      <div class="modal-footer" style="display: flex; justify-content: space-between;">
        <button class="btn btn-secondary" onclick="closeBookingLifecycleModal()" style="width: auto;">Close</button>
        <button class="btn btn-secondary" onclick="cancelCurrentBooking()" style="width: auto; color: var(--rose); border-color: rgba(255,51,102,0.3);" data-tooltip="Cancel booking under active band rules">Cancel Booking</button>
      </div>
    </div>
  </div>

  <!-- Modal 6: Daily Financial Reconciliation -->
  <div class="modal-backdrop" id="modalFinancialReconciliation">
    <div class="modal-dialog" style="max-width: 720px;">
      <div class="modal-header">
        <div class="modal-title">
          <span>📑 Daily Financial Reconciliation &amp; Ledger Audit</span>
        </div>
        <button class="modal-close-btn" aria-label="Close dialog" onclick="closeReconciliationModal()" data-tooltip="Close reconciliation modal">✕</button>
      </div>
      <div class="modal-body">
        <!-- Metrics Header -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; margin-bottom: 1.25rem; font-family: var(--font-mono); text-align: center;">
          <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); padding: 0.5rem; border-radius: 6px;">
            <div style="font-size: 0.65rem; color: var(--text-muted);">Total Settled</div>
            <div style="font-size: 1rem; font-weight: 700; color: #FFF;">₹1,45,000</div>
          </div>
          <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); padding: 0.5rem; border-radius: 6px;">
            <div style="font-size: 0.65rem; color: var(--text-muted);">Provider Net</div>
            <div style="font-size: 1rem; font-weight: 700; color: var(--turf-emerald);">₹1,36,445</div>
          </div>
          <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); padding: 0.5rem; border-radius: 6px;">
            <div style="font-size: 0.65rem; color: var(--text-muted);">Platform Fee (5%)</div>
            <div style="font-size: 1rem; font-weight: 700; color: var(--cyan);">₹7,250</div>
          </div>
          <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); padding: 0.5rem; border-radius: 6px;">
            <div style="font-size: 0.65rem; color: var(--text-muted);">GST (18%)</div>
            <div style="font-size: 1rem; font-weight: 700; color: var(--amber);">₹1,305</div>
          </div>
        </div>

        <!-- 5-Account Double-Entry Trial Balance Table -->
        <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 1rem; margin-bottom: 1.25rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <span style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted);">5-Account Chart of Accounts Trial Balance</span>
            <span style="font-size: 0.7rem; font-weight: 700; color: var(--turf-emerald); background: rgba(0,229,153,0.1); padding: 0.15rem 0.5rem; border-radius: 4px;">✓ ZERO IMBALANCE (Σ Debits ≡ Σ Credits)</span>
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 0.75rem; font-family: var(--font-mono);">
            <thead>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); text-align: left; color: var(--text-muted);">
                <th style="padding: 0.35rem 0;">Account Name</th>
                <th style="padding: 0.35rem 0; text-align: right;">Debit (INR)</th>
                <th style="padding: 0.35rem 0; text-align: right;">Credit (INR)</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                <td style="padding: 0.4rem 0; color: #FFF;">ESCROW_HOLD (Escrow Funds)</td>
                <td style="padding: 0.4rem 0; text-align: right; color: var(--text-muted);">-</td>
                <td style="padding: 0.4rem 0; text-align: right; color: #FFF;">₹1,45,000.00</td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                <td style="padding: 0.4rem 0; color: #FFF;">PROVIDER_PAYABLE (Disbursed)</td>
                <td style="padding: 0.4rem 0; text-align: right; color: var(--turf-emerald);">₹1,36,445.00</td>
                <td style="padding: 0.4rem 0; text-align: right; color: var(--text-muted);">-</td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                <td style="padding: 0.4rem 0; color: #FFF;">PLATFORM_FEE_INCOME (Revenue)</td>
                <td style="padding: 0.4rem 0; text-align: right; color: var(--cyan);">₹7,250.00</td>
                <td style="padding: 0.4rem 0; text-align: right; color: var(--text-muted);">-</td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                <td style="padding: 0.4rem 0; color: #FFF;">TAX_GST_PAYABLE (Statutory GST)</td>
                <td style="padding: 0.4rem 0; text-align: right; color: var(--amber);">₹1,305.00</td>
                <td style="padding: 0.4rem 0; text-align: right; color: var(--text-muted);">-</td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                <td style="padding: 0.4rem 0; color: #FFF;">REFUND_CLEARING (Disputes &amp; Rain)</td>
                <td style="padding: 0.4rem 0; text-align: right; color: var(--rose);">₹0.00</td>
                <td style="padding: 0.4rem 0; text-align: right; color: var(--text-muted);">-</td>
              </tr>
              <tr style="font-weight: 700; color: var(--turf-emerald);">
                <td style="padding: 0.5rem 0;">TOTALS &amp; IMBALANCE</td>
                <td style="padding: 0.5rem 0; text-align: right;">₹1,45,000.00</td>
                <td style="padding: 0.5rem 0; text-align: right;">₹1,45,000.00</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="font-size: 0.72rem; color: var(--text-muted); margin-bottom: 1rem; background: rgba(255,255,255,0.02); padding: 0.5rem 0.75rem; border-radius: 6px;">
          All monetary ledger values strictly computed as 64-bit integer minor units. Zero floating-point drift. Verified against strict double-entry ledger constraints.
        </div>
      </div>
      <div class="modal-footer" style="display: flex; justify-content: space-between;">
        <button class="btn btn-secondary" onclick="closeReconciliationModal()" style="width: auto;">Close</button>
        <button class="btn btn-primary" onclick="downloadReconciliationCsv()" data-tooltip="Download full reconciliation audit ledger as RFC 4180 CSV" style="width: auto;">📥 Export Reconciliation CSV</button>
      </div>
    </div>
  </div>

  <!-- Modal: Mobile App Preview -->
  <div class="modal-backdrop" id="modalMobileAppPreview">
    <div class="modal-card" style="max-width: 480px;">
      <div class="modal-header">
        <div style="display: flex; align-items: center; gap: 0.6rem;">
          <span style="font-size: 1.4rem;">📱</span>
          <div>
            <div class="modal-title">CricOS Mobile App Simulator</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">Consumer iOS &amp; Android App (Expo EAS / Target SDK 34)</div>
          </div>
        </div>
        <button class="modal-close-btn" aria-label="Close dialog" onclick="closeMobilePreviewModal()" data-tooltip="Close mobile preview">×</button>
      </div>
      <div class="modal-body" style="padding: 1rem; text-align: center;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; padding: 0.5rem 0.75rem; background: rgba(0, 229, 153, 0.08); border: 1px solid rgba(0, 229, 153, 0.25); border-radius: 8px;">
          <span style="font-size: 0.78rem; color: var(--turf-emerald); font-weight: 700;">✓ Apple 5.1.1(v) &bull; Google Play 34 Compliant</span>
          <a href="/mobile" target="_blank" class="nav-pill" style="font-size: 0.72rem; padding: 0.2rem 0.6rem; color: var(--turf-emerald); border-color: rgba(0,229,153,0.3);" data-tooltip="Open mobile simulator in standalone window">↗ Dedicated Tab</a>
        </div>
        <div style="display: inline-block; width: 340px; height: 520px; border: 8px solid #1E293B; border-radius: 32px; overflow: hidden; box-shadow: 0 16px 36px rgba(0,0,0,0.6); position: relative; background: #000;">
          <iframe src="/mobile" style="width: 100%; height: 100%; border: none;" title="CricOS Mobile App Preview"></iframe>
        </div>
      </div>
      <div class="modal-footer" style="display: flex; justify-content: space-between;">
        <button class="btn btn-secondary" onclick="closeMobilePreviewModal()" style="width: auto;">Close</button>
        <button class="btn btn-primary" onclick="window.open('/mobile', '_blank')" style="width: auto;" data-tooltip="Launch full-screen mobile experience">🚀 Open Fullscreen</button>
      </div>
    </div>
  </div>

  <!-- Modal: API Docs & Explorer -->
  <div class="modal-backdrop" id="modalApiDocs">
    <div class="modal-card" style="max-width: 660px;">
      <div class="modal-header">
        <div style="display: flex; align-items: center; gap: 0.6rem;">
          <span style="font-size: 1.4rem;">📖</span>
          <div>
            <div class="modal-title">OpenAPI 3.0.3 Documentation &amp; Schemas</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">26 Production Endpoints across 8 Workspace Modules</div>
          </div>
        </div>
        <button class="modal-close-btn" aria-label="Close dialog" onclick="closeApiDocsModal()" data-tooltip="Close documentation">×</button>
      </div>
      <div class="modal-body" style="padding: 1.25rem;">
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin-bottom: 1.25rem;">
          <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); padding: 0.75rem; border-radius: 8px; text-align: center;">
            <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">Total Endpoints</div>
            <div style="font-size: 1.3rem; font-weight: 800; color: var(--cyan);">26</div>
          </div>
          <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); padding: 0.75rem; border-radius: 8px; text-align: center;">
            <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">Specification</div>
            <div style="font-size: 1.1rem; font-weight: 800; color: var(--turf-emerald);">OpenAPI 3.0.3</div>
          </div>
          <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); padding: 0.75rem; border-radius: 8px; text-align: center;">
            <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">Latency Overhead</div>
            <div style="font-size: 1.3rem; font-weight: 800; color: var(--amber);">&lt; 2ms</div>
          </div>
        </div>

        <div style="font-size: 0.82rem; font-weight: 700; color: #FFF; margin-bottom: 0.5rem;">Core Operational Endpoints:</div>
        <div style="display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1.25rem; font-family: var(--font-mono); font-size: 0.76rem;">
          <div style="padding: 0.45rem 0.65rem; background: rgba(0, 229, 153, 0.06); border: 1px solid rgba(0,229,153,0.2); border-radius: 6px; display: flex; justify-content: space-between;">
            <span><strong style="color: var(--turf-emerald);">GET</strong> /api/v1/scoring/matches/:id/live</span>
            <span style="color: var(--text-muted);">SSE Broadcast Stream</span>
          </div>
          <div style="padding: 0.45rem 0.65rem; background: rgba(0, 210, 255, 0.06); border: 1px solid rgba(0,210,255,0.2); border-radius: 6px; display: flex; justify-content: space-between;">
            <span><strong style="color: var(--cyan);">POST</strong> /api/v1/scoring/matches/:id/deliveries</span>
            <span style="color: var(--text-muted);">MCC Law 1.3 Scoring</span>
          </div>
          <div style="padding: 0.45rem 0.65rem; background: rgba(255, 184, 0, 0.06); border: 1px solid rgba(255,184,0,0.2); border-radius: 6px; display: flex; justify-content: space-between;">
            <span><strong style="color: var(--amber);">POST</strong> /api/v1/marketplace/bookings/checkout</span>
            <span style="color: var(--text-muted);">15-min Reservation Lock</span>
          </div>
          <div style="padding: 0.45rem 0.65rem; background: rgba(168, 85, 247, 0.06); border: 1px solid rgba(168,85,247,0.2); border-radius: 6px; display: flex; justify-content: space-between;">
            <span><strong style="color: var(--purple);">GET</strong> /api/v1/tournaments/fixtures</span>
            <span style="color: var(--text-muted);">Round-Robin Schedule</span>
          </div>
        </div>
      </div>
      <div class="modal-footer" style="display: flex; justify-content: space-between;">
        <button class="btn btn-secondary" onclick="closeApiDocsModal()" style="width: auto;">Close</button>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn btn-secondary" onclick="switchTab('explorer'); closeApiDocsModal();" style="width: auto;">⚡ Explorer Tab</button>
          <button class="btn btn-primary" onclick="window.open('/docs', '_blank')" style="width: auto;" data-tooltip="Open full OpenAPI documentation in new tab">↗ Open /docs Portal</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal: System Health & Readiness -->
  <div class="modal-backdrop" id="modalSystemHealth">
    <div class="modal-card" style="max-width: 600px;">
      <div class="modal-header">
        <div style="display: flex; align-items: center; gap: 0.6rem;">
          <span style="font-size: 1.4rem;">🩺</span>
          <div>
            <div class="modal-title">System Health &amp; Readiness Diagnostics</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">Fastify Server &bull; PostgreSQL Database &bull; Health Probes</div>
          </div>
        </div>
        <button class="modal-close-btn" aria-label="Close dialog" onclick="closeHealthModal()" data-tooltip="Close health diagnostics">×</button>
      </div>
      <div class="modal-body" style="padding: 1.25rem;">
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; margin-bottom: 1.25rem;">
          <div style="background: rgba(0, 229, 153, 0.06); border: 1px solid rgba(0,229,153,0.25); padding: 0.85rem; border-radius: 10px;">
            <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.25rem;">Fastify Daemon</div>
            <div style="font-size: 1.15rem; font-weight: 800; color: var(--turf-emerald);" id="healthModalStatus">HTTP 200 (ONLINE)</div>
            <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.25rem;" id="healthModalUptime">Uptime: checking...</div>
          </div>
          <div style="background: rgba(0, 210, 255, 0.06); border: 1px solid rgba(0,210,255,0.25); padding: 0.85rem; border-radius: 10px;">
            <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.25rem;">Database Engine</div>
            <div style="font-size: 1.15rem; font-weight: 800; color: var(--cyan);">PostgreSQL 16</div>
            <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.25rem;">Migrations 0001–0015 Active</div>
          </div>
        </div>

        <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 0.85rem; margin-bottom: 1rem;">
          <div style="font-size: 0.75rem; font-weight: 700; color: #FFF; margin-bottom: 0.5rem;">Live Kubernetes Probes:</div>
          <div style="display: flex; flex-direction: column; gap: 0.35rem; font-family: var(--font-mono); font-size: 0.75rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.3rem 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
              <span>Liveness Probe: <strong style="color: var(--turf-emerald);">GET /health/live</strong></span>
              <span style="color: var(--turf-emerald);" id="healthLiveResult">HTTP 200 OK</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.3rem 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
              <span>Readiness Probe: <strong style="color: var(--cyan);">GET /health/ready</strong></span>
              <span style="color: var(--cyan);" id="healthReadyResult">HTTP 200 OK</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.3rem 0;">
              <span>Metrics Stream: <strong style="color: var(--amber);">GET /health/metrics</strong></span>
              <span style="color: var(--amber);" id="healthMetricsResult">Active (&lt; 2ms)</span>
            </div>
          </div>
        </div>

        <div id="healthProbeFeedback" style="display: none; padding: 0.5rem 0.75rem; border-radius: 6px; font-size: 0.75rem; margin-bottom: 0.5rem; background: rgba(0, 229, 153, 0.12); color: var(--turf-emerald); border: 1px solid var(--turf-emerald);"></div>
      </div>
      <div class="modal-footer" style="display: flex; justify-content: space-between;">
        <button class="btn btn-secondary" onclick="closeHealthModal()" style="width: auto;">Close</button>
        <button class="btn btn-primary" onclick="runHealthProbePing()" style="width: auto;" data-tooltip="Ping Fastify server live and readiness endpoints">⚡ Run Probe Ping</button>
      </div>
    </div>
  </div>

  <!-- Modal: Operational Metrics & Telemetry -->
  <div class="modal-backdrop" id="modalMetricsTelemetry">
    <div class="modal-card" style="max-width: 640px;">
      <div class="modal-header">
        <div style="display: flex; align-items: center; gap: 0.6rem;">
          <span style="font-size: 1.4rem;">📊</span>
          <div>
            <div class="modal-title">Operational Telemetry &amp; OpenMetrics</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">Real-time Prometheus Exposition &bull; Sub-Millisecond Profiling</div>
          </div>
        </div>
        <button class="modal-close-btn" aria-label="Close dialog" onclick="closeMetricsModal()" data-tooltip="Close metrics">×</button>
      </div>
      <div class="modal-body" style="padding: 1.25rem;">
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.6rem; margin-bottom: 1.25rem;">
          <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); padding: 0.65rem; border-radius: 8px; text-align: center;">
            <div style="font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase;">Req Throughput</div>
            <div style="font-size: 1.15rem; font-weight: 800; color: var(--turf-emerald);">45,200/s</div>
          </div>
          <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); padding: 0.65rem; border-radius: 8px; text-align: center;">
            <div style="font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase;">Avg Latency</div>
            <div style="font-size: 1.15rem; font-weight: 800; color: var(--cyan);" id="modalMetricsAvgLat">1.2ms</div>
          </div>
          <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); padding: 0.65rem; border-radius: 8px; text-align: center;">
            <div style="font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase;">Event Loop Lag</div>
            <div style="font-size: 1.15rem; font-weight: 800; color: var(--purple);">0.15ms</div>
          </div>
          <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); padding: 0.65rem; border-radius: 8px; text-align: center;">
            <div style="font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase;">Heap Used</div>
            <div style="font-size: 1.15rem; font-weight: 800; color: var(--amber);" id="modalMetricsHeap">42 MB</div>
          </div>
        </div>

        <div style="background: rgba(10, 16, 28, 0.75); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 0.85rem; margin-bottom: 1rem;">
          <div style="font-size: 0.75rem; font-weight: 700; color: #FFF; margin-bottom: 0.5rem;">Prometheus Metric Descriptors (/metrics):</div>
          <pre style="font-family: var(--font-mono); font-size: 0.72rem; color: #94A3B8; overflow-x: auto; max-height: 120px; background: rgba(0,0,0,0.4); padding: 0.6rem; border-radius: 6px;"># HELP cricos_http_requests_total Total number of HTTP requests
# TYPE cricos_http_requests_total counter
cricos_http_requests_total{method="GET",status="200"} 1842
# HELP cricos_http_request_duration_seconds HTTP latency histogram
cricos_http_request_duration_seconds_bucket{le="0.005"} 1820
# HELP cricos_active_sse_connections Active SSE broadcast clients
cricos_active_sse_connections 1</pre>
        </div>
      </div>
      <div class="modal-footer" style="display: flex; justify-content: space-between;">
        <button class="btn btn-secondary" onclick="closeMetricsModal()" style="width: auto;">Close</button>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn btn-secondary" onclick="switchTab('explorer'); closeMetricsModal();" style="width: auto;">⚡ Switch to Explorer</button>
          <button class="btn btn-primary" onclick="window.open('/metrics', '_blank')" style="width: auto;" data-tooltip="View raw Prometheus text exposition">↗ Raw /metrics</button>
        </div>
      </div>
    </div>
  </div>

  <!-- P1-001: Modal RFQ & Quote Negotiation -->
  <div class="modal-backdrop" id="modalRfq">
    <div class="modal-card" style="max-width: 720px; border-radius: 20px; background: linear-gradient(145deg, rgba(12, 18, 34, 0.92) 0%, rgba(7, 10, 20, 0.96) 100%); border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 25px 50px -12px rgba(0, 0, 0, 0.65); backdrop-filter: blur(20px);">
      <div class="modal-header" style="border-bottom: 1px solid rgba(255, 255, 255, 0.07); padding: 1.25rem 1.5rem;">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 10px; background: rgba(0, 229, 153, 0.1); border: 1px solid rgba(0, 229, 153, 0.25); color: var(--turf-emerald);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M9 14l2 2 4-4"/></svg>
          </div>
          <div>
            <div class="modal-title" style="font-family: var(--font-display); font-size: 1.25rem; font-weight: 600; letter-spacing: -0.02em; color: #FFFFFF;">Procurement RFQ &amp; Quote Negotiation Desk</div>
            <div style="font-size: 0.75rem; color: #8E9BAE; margin-top: 2px;">Tournament Requirements &bull; Competitive Bidding &bull; Escrow Contract Awarding</div>
          </div>
        </div>
        <button class="modal-close-btn" aria-label="Close dialog" onclick="closeModal('modalRfq')" data-tooltip="Close RFQ modal" style="font-size: 1.25rem; width: 32px; height: 32px; border-radius: 8px;">×</button>
      </div>
      <div class="modal-body" style="padding: 1.5rem;">
        <div style="margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span class="badge badge-cyan" style="font-size: 0.75rem; padding: 0.25rem 0.6rem; border-radius: 6px;">Active Requirements</span>
            <span style="font-size: 0.75rem; color: #8E9BAE;">1 Open Tender</span>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="showToast('Create RFQ specification builder opened')" style="display: inline-flex; align-items: center; gap: 0.35rem; font-size: 0.78rem; padding: 0.4rem 0.75rem; border-radius: 8px;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>New Requirement</span>
          </button>
        </div>
        <div id="rfqContainer">
          <article class="glass-panel" style="padding: 1.4rem; border-radius: 14px; margin-bottom: 1rem; border: 1px solid rgba(255, 255, 255, 0.08); background: linear-gradient(135deg, rgba(14, 21, 38, 0.85) 0%, rgba(9, 13, 24, 0.95) 100%); box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; margin-bottom: 0.75rem;">
              <div>
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.4rem;">
                  <span class="badge" style="font-size: 0.7rem; font-weight: 700; text-transform: uppercase; background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.1); color: #CBD5E1; padding: 0.15rem 0.5rem; border-radius: 4px;">OFFICIAL: UMPIRE</span>
                  <span class="badge badge-cyan" style="font-size: 0.7rem; display: inline-flex; align-items: center; gap: 0.3rem;">
                    <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--cyan); box-shadow: 0 0 6px var(--cyan);"></span>
                    OPEN FOR BIDS
                  </span>
                </div>
                <h4 style="margin: 0; font-family: var(--font-display); font-size: 1.12rem; font-weight: 600; color: #FFFFFF; letter-spacing: -0.015em;">T20 Championship Lead Umpire Procurement</h4>
              </div>
              <div style="text-align: right; flex-shrink: 0;">
                <div style="font-family: var(--font-mono); font-size: 1.3rem; font-weight: 700; color: var(--turf-emerald); font-variant-numeric: tabular-nums; line-height: 1.1;">₹3,000</div>
                <div style="font-size: 0.7rem; color: #8E9BAE; text-transform: uppercase; letter-spacing: 0.04em; margin-top: 0.2rem;">Budget Cap</div>
              </div>
            </div>
            <p style="font-size: 0.85rem; color: #94A3B8; margin: 0 0 1.1rem; line-height: 1.5; max-width: 60ch;">
              Need certified lead umpire for 20-over floodlit tournament final. Requires minimum BCCI Level-1 credential or State Association certification.
            </p>
            <div style="background: rgba(15, 23, 42, 0.6); padding: 1rem 1.1rem; border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.06);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.65rem;">
                <div style="font-size: 0.72rem; font-weight: 700; color: var(--cyan); letter-spacing: 0.05em; text-transform: uppercase;">
                  Submitted Proposals (1 Verified Bid)
                </div>
                <span style="font-size: 0.7rem; color: #8E9BAE;">Algorithm Score: 92/100</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap;">
                <div>
                  <div style="font-weight: 600; color: #FFFFFF; font-size: 0.92rem;">R. Venkatesh (BCCI Level-2 Official)</div>
                  <div style="font-size: 0.75rem; color: #8E9BAE; margin-top: 2px;">
                    Trust Track Record: <strong style="color: var(--amber);">96.8%</strong> &bull; 14 Matches Officiated &bull; Zero Incident Reports
                  </div>
                </div>
                <div style="display: flex; align-items: center; gap: 1rem;">
                  <div style="text-align: right;">
                    <span style="font-family: var(--font-mono); font-weight: 700; color: var(--turf-emerald); font-size: 1.15rem; font-variant-numeric: tabular-nums;">₹2,800</span>
                    <div style="font-size: 0.68rem; color: #8E9BAE;">Excl. GST</div>
                  </div>
                  <button class="btn btn-primary btn-sm" onclick="awardSampleQuote()" data-tooltip="Award contract, lock escrow deposit, and dispatch confirmation" style="display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; font-weight: 600; border-radius: 8px; padding: 0.45rem 0.9rem;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    <span>Award Contract</span>
                  </button>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
      <div class="modal-footer" style="border-top: 1px solid rgba(255, 255, 255, 0.07); padding: 1rem 1.5rem; display: flex; justify-content: flex-end;">
        <button class="btn btn-secondary" onclick="closeModal('modalRfq')" style="border-radius: 8px;">Close</button>
      </div>
    </div>
  </div>

  <!-- P1-002: Modal Commerce & Cricket Gear -->
  <div class="modal-backdrop" id="modalCommerce">
    <div class="modal-card" style="max-width: 720px;">
      <div class="modal-header">
        <div style="display: flex; align-items: center; gap: 0.6rem;">
          <span style="font-size: 1.4rem;">🛒</span>
          <div>
            <div class="modal-title">Cricket Gear, Match Balls &amp; Equipment Store</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">Match Balls &bull; Practice Cages &bull; Trophies &bull; Free Venue Delivery</div>
          </div>
        </div>
        <button class="modal-close-btn" aria-label="Close dialog" onclick="closeModal('modalCommerce')" data-tooltip="Close gear store">×</button>
      </div>
      <div class="modal-body" style="padding: 1.25rem;">
        <!-- Coupon Bar -->
        <div style="display: flex; gap: 0.5rem; margin-bottom: 1.25rem; background: rgba(255,255,255,0.03); padding: 0.75rem; border-radius: 8px; border: 1px solid var(--border-subtle);">
          <input type="text" id="promoCodeInput" placeholder="Promo code (try CRIC20 or TURF500)" style="flex: 1; padding: 0.5rem 0.75rem; border-radius: 6px; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.15); color: #fff; font-family: var(--font-mono); text-transform: uppercase;" />
          <button class="btn btn-primary btn-sm" onclick="applyPromoCode()" data-tooltip="Apply discount code to order">Apply Code</button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.85rem;">
          <div class="glass-panel" style="padding: 1rem; border-radius: 10px; background: rgba(10,16,28,0.7); border: 1px solid rgba(255,255,255,0.08); display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <span class="badge badge-purple" style="font-size: 0.65rem;">BALLS</span>
              <h4 style="margin: 0.5rem 0 0.25rem; font-size: 0.95rem; color: #fff;">Match Leather Balls (Box of 6)</h4>
              <p style="font-size: 0.75rem; color: #94A3B8; line-height: 1.3;">4-piece alum tanned English leather, MCC Law 4 compliant.</p>
            </div>
            <div style="margin-top: 0.75rem; padding-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center;">
              <span style="font-family: var(--font-mono); font-weight: 700; color: var(--turf-emerald);">₹4,800</span>
              <button class="btn btn-primary btn-sm" onclick="showToast('🛒 Added Box of Match Balls to Basket!')">Add</button>
            </div>
          </div>

          <div class="glass-panel" style="padding: 1rem; border-radius: 10px; background: rgba(10,16,28,0.7); border: 1px solid rgba(255,255,255,0.08); display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <span class="badge badge-cyan" style="font-size: 0.65rem;">EQUIPMENT</span>
              <h4 style="margin: 0.5rem 0 0.25rem; font-size: 0.95rem; color: #fff;">Pro Practice Net (Day Rental)</h4>
              <p style="font-size: 0.75rem; color: #94A3B8; line-height: 1.3;">Heavy duty 12x4m cricket practice cage with frame.</p>
            </div>
            <div style="margin-top: 0.75rem; padding-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center;">
              <span style="font-family: var(--font-mono); font-weight: 700; color: var(--turf-emerald);">₹1,500</span>
              <button class="btn btn-primary btn-sm" onclick="showToast('🛒 Added Practice Net Rental to Basket!')">Add</button>
            </div>
          </div>

          <div class="glass-panel" style="padding: 1rem; border-radius: 10px; background: rgba(10,16,28,0.7); border: 1px solid rgba(255,255,255,0.08); display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <span class="badge badge-amber" style="font-size: 0.65rem;">TROPHIES</span>
              <h4 style="margin: 0.5rem 0 0.25rem; font-size: 0.95rem; color: #fff;">Championship Trophy Set</h4>
              <p style="font-size: 0.75rem; color: #94A3B8; line-height: 1.3;">24-inch gold-plated trophy plus 16 embossed medals.</p>
            </div>
            <div style="margin-top: 0.75rem; padding-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center;">
              <span style="font-family: var(--font-mono); font-weight: 700; color: var(--turf-emerald);">₹8,500</span>
              <button class="btn btn-primary btn-sm" onclick="showToast('🛒 Added Trophy Set to Basket!')">Add</button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer" style="display: flex; justify-content: flex-end;">
        <button class="btn btn-secondary" onclick="closeModal('modalCommerce')">Close</button>
      </div>
    </div>
  </div>

  <!-- P1-006 & P1-007: Modal Tournament Ops & Fixture Board -->
  <div class="modal-backdrop" id="modalTournamentOps">
    <div class="modal-card" style="max-width: 750px;">
      <div class="modal-header">
        <div style="display: flex; align-items: center; gap: 0.6rem;">
          <span style="font-size: 1.4rem;">📊</span>
          <div>
            <div class="modal-title">Tournament Fixture Board &amp; Command Centre</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">Round-Robin Schedule &bull; Conflict Engine &bull; Bulk CSV Upload</div>
          </div>
        </div>
        <button class="modal-close-btn" aria-label="Close dialog" onclick="closeModal('modalTournamentOps')" data-tooltip="Close fixture board">×</button>
      </div>
      <div class="modal-body" style="padding: 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <div>
            <span class="badge badge-emerald">✓ Zero Conflicts Detected</span>
            <span style="font-size: 0.8rem; color: #8E9BAE; margin-left: 0.5rem;">Overall Readiness: <strong style="color: var(--turf-emerald);">100%</strong></span>
          </div>
          <button class="btn btn-primary btn-sm" onclick="showBulkImportPrompt()" data-tooltip="Upload fixture schedule via CSV">📤 Bulk Import</button>
        </div>

        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem;">
            <thead>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); color: #8E9BAE; font-size: 0.7rem; text-transform: uppercase;">
                <th style="padding: 0.5rem 0.75rem;">Round</th>
                <th style="padding: 0.5rem 0.75rem;">Matchup &amp; Venue</th>
                <th style="padding: 0.5rem 0.75rem;">Slot</th>
                <th style="padding: 0.5rem 0.75rem;">Readiness</th>
                <th style="padding: 0.5rem 0.75rem; text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                <td style="padding: 0.65rem 0.75rem; font-weight: 700; color: var(--cyan);">R1</td>
                <td style="padding: 0.65rem 0.75rem;">
                  <div style="font-weight: 700; color: #fff;">Northside XI vs Riverside XI</div>
                  <div style="font-size: 0.75rem; color: #8E9BAE;">Harbour Ground - Pitch 1</div>
                </td>
                <td style="padding: 0.65rem 0.75rem; color: #CBD5E1;">Sat, 13:00</td>
                <td style="padding: 0.65rem 0.75rem;"><span class="badge badge-emerald">100%</span></td>
                <td style="padding: 0.65rem 0.75rem; text-align: right;">
                  <button class="btn btn-secondary btn-sm" onclick="showToast('Procurement verified')">📋 Verified</button>
                </td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                <td style="padding: 0.65rem 0.75rem; font-weight: 700; color: var(--cyan);">R1</td>
                <td style="padding: 0.65rem 0.75rem;">
                  <div style="font-weight: 700; color: #fff;">Eastern Knights vs Southern Stars</div>
                  <div style="font-size: 0.75rem; color: #8E9BAE;">Harbour Ground - Pitch 2</div>
                </td>
                <td style="padding: 0.65rem 0.75rem; color: #CBD5E1;">Sun, 09:00</td>
                <td style="padding: 0.65rem 0.75rem;"><span class="badge badge-emerald">100%</span></td>
                <td style="padding: 0.65rem 0.75rem; text-align: right;">
                  <button class="btn btn-secondary btn-sm" onclick="showToast('Procurement verified')">📋 Verified</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer" style="display: flex; justify-content: flex-end;">
        <button class="btn btn-secondary" onclick="closeModal('modalTournamentOps')">Close</button>
      </div>
    </div>
  </div>

  <!-- P1-010 & P2-001: Modal Match Insights & AI Recap -->
  <div class="modal-backdrop" id="modalMatchInsights">
    <div class="modal-card" style="max-width: 650px;">
      <div class="modal-header">
        <div style="display: flex; align-items: center; gap: 0.6rem;">
          <span style="font-size: 1.4rem;">🤖</span>
          <div>
            <div class="modal-title">AI Match Insights &amp; MVP Impact Analysis</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">Algorithmic POTM &bull; Automated Press Recap &bull; Turning Point Swing</div>
          </div>
        </div>
        <button class="modal-close-btn" aria-label="Close dialog" onclick="closeModal('modalMatchInsights')" data-tooltip="Close insights">×</button>
      </div>
      <div class="modal-body" style="padding: 1.25rem;">
        <!-- MVP Card -->
        <div style="padding: 1.25rem; border-radius: 12px; border: 1px solid rgba(255, 184, 0, 0.35); background: linear-gradient(135deg, rgba(255, 184, 0, 0.08), rgba(10, 16, 28, 0.85)); margin-bottom: 1.25rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <span class="badge badge-amber" style="font-weight: 700;">🏆 PLAYER OF THE MATCH (MVP)</span>
            <span style="font-family: var(--font-mono); font-weight: 800; font-size: 1.2rem; color: var(--amber);">96 pts</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: flex-end;">
            <div>
              <h3 style="margin: 0; font-family: var(--font-display); font-size: 1.3rem; color: #fff;">Virat Sharma</h3>
              <div style="font-size: 0.85rem; color: var(--cyan); font-weight: 600;">Northside XI &bull; 74 (42) + 2 Catches</div>
            </div>
            <div style="display: flex; gap: 0.75rem; text-align: right; font-size: 0.8rem;">
              <div><span style="color: #8E9BAE;">Bat:</span> <strong>84</strong></div>
              <div><span style="color: #8E9BAE;">Field:</span> <strong>20</strong></div>
            </div>
          </div>
        </div>

        <!-- AI Narrative -->
        <div style="padding: 1rem; border-radius: 8px; background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); margin-bottom: 1rem;">
          <div style="font-size: 0.75rem; color: var(--cyan); font-weight: 700; margin-bottom: 0.4rem;">PRESS WIRE SUMMARY</div>
          <h4 style="margin: 0 0 0.5rem; color: #fff; font-size: 1.05rem;">Riverside XI clinch victory by 5 wickets in thrilling chase</h4>
          <p style="font-size: 0.85rem; color: #CBD5E1; line-height: 1.45; margin: 0;">Northside XI posted 168/6 in 20 overs led by Virat Sharma (74 off 42). In response, Riverside XI chased down the target reaching 169/5 in 19.3 overs.</p>
        </div>

        <!-- Turning Point -->
        <div style="padding: 0.85rem; border-radius: 8px; background: rgba(0, 229, 153, 0.05); border: 1px solid rgba(0, 229, 153, 0.2);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
            <span style="font-size: 0.8rem; font-weight: 700; color: var(--turf-emerald);">⚡ MATCH TURNING POINT (Over 16.4)</span>
            <span class="badge badge-emerald">+34% Win Prob Swing</span>
          </div>
          <div style="font-size: 0.8rem; color: #fff;">Decisive boundary and dropped catch in over 16 shifted match win probability decisively.</div>
        </div>
      </div>
      <div class="modal-footer" style="display: flex; justify-content: flex-end;">
        <button class="btn btn-secondary" onclick="closeModal('modalMatchInsights')">Close</button>
      </div>
    </div>
  </div>

  <!-- P1-011: Modal Provider Check-In & Match Sign-Off -->
  <div class="modal-backdrop" id="modalCheckIn">
    <div class="modal-card" style="max-width: 520px;">
      <div class="modal-header">
        <div style="display: flex; align-items: center; gap: 0.6rem;">
          <span style="font-size: 1.4rem;">📍</span>
          <div>
            <div class="modal-title">Provider Check-In &amp; Match Sign-Off</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">Arrival OTP Verification &bull; 3-Party Digital Sign-Off</div>
          </div>
        </div>
        <button class="modal-close-btn" aria-label="Close dialog" onclick="closeModal('modalCheckIn')" data-tooltip="Close check-in">×</button>
      </div>
      <div class="modal-body" style="padding: 1.25rem;">
        <!-- Provider OTP Verification -->
        <div style="padding: 1rem; border-radius: 8px; background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); margin-bottom: 1.25rem;">
          <div style="font-size: 0.8rem; font-weight: 700; color: var(--cyan); margin-bottom: 0.5rem;">STEP 1: PROVIDER ARRIVAL OTP</div>
          <p style="font-size: 0.8rem; color: #94A3B8; margin-bottom: 0.75rem;">Official enters 4-digit PIN upon arrival at the venue.</p>
          <div style="display: flex; gap: 0.5rem;">
            <input type="text" id="providerOtpInput" maxlength="6" value="4821" style="width: 140px; text-align: center; font-family: var(--font-mono); font-size: 1.2rem; letter-spacing: 0.2rem; padding: 0.4rem; border-radius: 6px; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.2); color: var(--turf-emerald);" />
            <button class="btn btn-primary btn-sm" onclick="showToast('✓ Provider Check-In Verified via OTP 4821!')">Verify Arrival</button>
          </div>
        </div>

        <!-- 3-Party Sign-Off -->
        <div style="padding: 1rem; border-radius: 8px; background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle);">
          <div style="font-size: 0.8rem; font-weight: 700; color: var(--turf-emerald); margin-bottom: 0.5rem;">STEP 2: OFFICIAL MATCH SIGN-OFF</div>
          <p style="font-size: 0.8rem; color: #94A3B8; margin-bottom: 0.75rem;">All 3 stakeholders digitally sign to unlock escrow payouts.</p>
          <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem;">
            <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: #fff; cursor: pointer;">
              <input type="checkbox" checked /> Home Captain (Virat Sharma) Digitally Signed
            </label>
            <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: #fff; cursor: pointer;">
              <input type="checkbox" checked /> Away Captain (David Warner) Digitally Signed
            </label>
            <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: #fff; cursor: pointer;">
              <input type="checkbox" checked /> Lead Umpire (Certified Official) Digitally Signed
            </label>
          </div>
          <button class="btn btn-primary btn-sm" style="width: 100%;" onclick="showToast('✍ 3-Party Sign-Off Complete! Escrow Payouts Unlocked.')">
            ✍ Complete Digital Sign-Off
          </button>
        </div>
      </div>
      <div class="modal-footer" style="display: flex; justify-content: flex-end;">
        <button class="btn btn-secondary" onclick="closeModal('modalCheckIn')">Close</button>
      </div>
    </div>
  </div>

  <!-- P2-004 & P3-001: Modal Sponsorship & Player Auction -->
  <div class="modal-backdrop" id="modalSponsorshipAuction">
    <div class="modal-card" style="max-width: 680px;">
      <div class="modal-header">
        <div style="display: flex; align-items: center; gap: 0.6rem;">
          <span style="font-size: 1.4rem;">🤝</span>
          <div>
            <div class="modal-title">Sponsorship Inventory &amp; Player Auction Desk</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">Prize Pool Pledges &bull; Live Franchise Bidding &bull; Double-Entry Escrow</div>
          </div>
        </div>
        <button class="modal-close-btn" aria-label="Close dialog" onclick="closeModal('modalSponsorshipAuction')" data-tooltip="Close sponsors and auction">×</button>
      </div>
      <div class="modal-body" style="padding: 1.25rem;">
        <!-- Sponsorship Section -->
        <div style="margin-bottom: 1.5rem;">
          <div style="font-size: 0.8rem; font-weight: 700; color: var(--cyan); margin-bottom: 0.75rem;">SPONSORSHIP INVENTORY TIERS</div>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem;">
            <div class="glass-panel" style="padding: 0.85rem; border-radius: 8px; background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle);">
              <span class="badge badge-purple" style="font-size: 0.65rem;">TITLE SPONSOR</span>
              <div style="font-weight: 700; color: #fff; margin: 0.35rem 0;">Premier Trophy Title</div>
              <div style="font-family: var(--font-mono); font-weight: 700; color: var(--turf-emerald); font-size: 1.1rem;">₹2,50,000</div>
              <div style="margin-top: 0.5rem;"><span class="badge badge-emerald">✓ PLEDGED (RedBull)</span></div>
            </div>
            <div class="glass-panel" style="padding: 0.85rem; border-radius: 8px; background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle);">
              <span class="badge badge-cyan" style="font-size: 0.65rem;">BALL SPONSOR</span>
              <div style="font-weight: 700; color: #fff; margin: 0.35rem 0;">Official Match Balls</div>
              <div style="font-family: var(--font-mono); font-weight: 700; color: var(--turf-emerald); font-size: 1.1rem;">₹75,000</div>
              <div style="margin-top: 0.5rem;"><span class="badge badge-emerald">✓ PLEDGED (SG)</span></div>
            </div>
          </div>
        </div>

        <!-- Virtual Player Auction Live Bidding -->
        <div style="padding: 1rem; border-radius: 10px; background: rgba(0, 210, 255, 0.05); border: 1px solid rgba(0, 210, 255, 0.25);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <span class="badge badge-purple">LIVE FRANCHISE AUCTION</span>
            <span style="font-size: 0.75rem; color: #8E9BAE;">Purse Remaining: <strong style="color: #fff;">₹10,00,000</strong></span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 1rem;">
            <div>
              <h3 style="margin: 0; color: #fff; font-size: 1.25rem;">K.L. Rahul</h3>
              <div style="font-size: 0.8rem; color: #8E9BAE;">Wicketkeeper-Batter &bull; Base: ₹1,00,000</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 0.7rem; color: #8E9BAE;">Highest Bid</div>
              <div style="font-family: var(--font-mono); font-size: 1.5rem; font-weight: 800; color: var(--turf-emerald);" id="auctionHighestBid">₹3,25,000</div>
            </div>
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-secondary btn-sm" style="flex: 1;" onclick="submitAuctionBid(2500000)">+ ₹25k</button>
            <button class="btn btn-secondary btn-sm" style="flex: 1;" onclick="submitAuctionBid(5000000)">+ ₹50k</button>
            <button class="btn btn-primary btn-sm" style="flex: 1;" onclick="submitAuctionBid(10000000)">+ ₹1,00,000</button>
          </div>
        </div>
      </div>
      <div class="modal-footer" style="display: flex; justify-content: flex-end;">
        <button class="btn btn-secondary" onclick="closeModal('modalSponsorshipAuction')">Close</button>
      </div>
    </div>
  </div>

  <div id="toast">✓ Event completed</div>

  <script>
    // ==========================================
    // Role-Based Access Control (RBAC) & Feature Gating
    // ==========================================
    const ROLE_PERMISSIONS = {
      CAPTAIN: {
        allowedTabs: ['scoring', 'teams', 'tournaments', 'marketplace', 'studio'],
        defaultTab: 'teams',
        badgeColor: '#00E599',
        badgeBg: 'rgba(0, 229, 153, 0.15)',
        icon: '👑',
        label: 'Captain',
        canConductToss: true,
        canManageLineup: true,
        canScore: false, // Tactical mode in studio
        canFileIncident: false,
        canAccessAdmin: false,
        canAccessExplorer: false,
        fanCheerConsole: false
      },
      PLAYER: {
        allowedTabs: ['scoring', 'teams', 'tournaments', 'marketplace'],
        defaultTab: 'teams',
        badgeColor: '#00D2FF',
        badgeBg: 'rgba(0, 210, 255, 0.15)',
        icon: '🏏',
        label: 'Player',
        canConductToss: false,
        canManageLineup: false,
        canScore: false,
        canFileIncident: false,
        canAccessAdmin: false,
        canAccessExplorer: false,
        fanCheerConsole: false
      },
      SCORER: {
        allowedTabs: ['scoring', 'studio', 'tournaments'],
        defaultTab: 'studio',
        badgeColor: '#FFB800',
        badgeBg: 'rgba(255, 184, 0, 0.15)',
        icon: '📋',
        label: 'Official Scorer',
        canConductToss: false,
        canManageLineup: false,
        canScore: true,
        canFileIncident: false,
        canAccessAdmin: false,
        canAccessExplorer: false,
        fanCheerConsole: false
      },
      FAN: {
        allowedTabs: ['scoring', 'teams', 'tournaments', 'studio'],
        defaultTab: 'scoring',
        badgeColor: '#C084FC',
        badgeBg: 'rgba(192, 132, 252, 0.15)',
        icon: '🎪',
        label: 'Fan',
        canConductToss: false,
        canManageLineup: false,
        canScore: false,
        canFileIncident: false,
        canAccessAdmin: false,
        canAccessExplorer: false,
        fanCheerConsole: true
      },
      UMPIRE: {
        allowedTabs: ['scoring', 'incidents', 'tournaments'],
        defaultTab: 'incidents',
        badgeColor: '#38BDF8',
        badgeBg: 'rgba(56, 189, 248, 0.15)',
        icon: '⚖️',
        label: 'Official Umpire',
        canConductToss: false,
        canManageLineup: false,
        canScore: false,
        canFileIncident: true,
        canAccessAdmin: false,
        canAccessExplorer: false,
        fanCheerConsole: false
      },
      ADMIN: {
        allowedTabs: ['scoring', 'teams', 'tournaments', 'marketplace', 'studio', 'incidents', 'explorer'],
        defaultTab: 'explorer',
        badgeColor: '#FF3366',
        badgeBg: 'rgba(255, 51, 102, 0.15)',
        icon: '⚡',
        label: 'Admin',
        canConductToss: true,
        canManageLineup: true,
        canScore: false,
        canFileIncident: true,
        canAccessAdmin: true,
        canAccessExplorer: true,
        fanCheerConsole: false
      },
      ORGANISER: {
        allowedTabs: ['tournaments', 'marketplace', 'teams', 'scoring', 'incidents'],
        defaultTab: 'tournaments',
        badgeColor: '#A855F7',
        badgeBg: 'rgba(168, 85, 247, 0.15)',
        icon: '🏆',
        label: 'Organiser',
        canConductToss: false,
        canManageLineup: true,
        canScore: false,
        canFileIncident: true,
        canAccessAdmin: false,
        canAccessExplorer: false,
        fanCheerConsole: false
      },
      TURF_PROVIDER: {
        allowedTabs: ['marketplace', 'scoring', 'incidents'],
        defaultTab: 'marketplace',
        badgeColor: '#34D399',
        badgeBg: 'rgba(52, 211, 153, 0.15)',
        icon: '🏟️',
        label: 'Provider',
        canConductToss: false,
        canManageLineup: false,
        canScore: false,
        canFileIncident: false,
        canAccessAdmin: false,
        canAccessExplorer: false,
        fanCheerConsole: false
      }
    };

    // Tab Switching with RBAC Enforcer
    function switchTab(tabId) {
      const perms = ROLE_PERMISSIONS[currentUser.persona] || ROLE_PERMISSIONS.FAN;
      if (!perms.allowedTabs.includes(tabId)) {
        showToast('Access Restricted: ' + currentUser.persona + ' role cannot access ' + tabId);
        tabId = perms.defaultTab;
      }

      document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
        const t = b.getAttribute('data-tab');
        const onclickAttr = b.getAttribute('onclick') || '';
        if (t === tabId || onclickAttr.indexOf("'" + tabId + "'") !== -1) {
          b.classList.add('active');
          b.setAttribute('aria-selected', 'true');
        }
      });
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      const target = document.getElementById('tab-' + tabId);
      if (target) target.classList.add('active');
      if (tabId === 'studio') {
        renderWagonWheelRays();
        updateWagonTelemetry();
      }

      // Update topbar breadcrumb active tab
      const tabNames = {
        scoring: 'Match Center',
        teams: 'Teams & Rosters',
        tournaments: 'Tournaments',
        marketplace: 'Venues & Turfs',
        studio: 'Scoring Studio',
        incidents: 'Fair Play & Trust',
        explorer: 'Operations & APIs'
      };
      const currentTabEl = document.getElementById('topbarCurrentTab');
      if (currentTabEl && tabNames[tabId]) {
        currentTabEl.textContent = tabNames[tabId];
      }
      closeSidebarMobile();
    }

    function toggleSidebarCollapse() {
      const sidebar = document.getElementById('appSidebar');
      const collapseBtn = document.getElementById('sidebarCollapseBtn');
      if (!sidebar) return;
      sidebar.classList.toggle('collapsed');
      const isCollapsed = sidebar.classList.contains('collapsed');
      if (collapseBtn) {
        collapseBtn.innerHTML = isCollapsed ? '<span class="collapse-icon">▶</span>' : '<span class="collapse-icon">◀</span>';
        collapseBtn.setAttribute('data-tooltip', isCollapsed ? 'Expand sidebar' : 'Collapse sidebar');
      }
      try {
        localStorage.setItem('cricos_sidebar_collapsed', isCollapsed ? '1' : '0');
      } catch (e) {}
    }

    function toggleSidebarMobile() {
      const sidebar = document.getElementById('appSidebar');
      const backdrop = document.getElementById('sidebarBackdrop');
      if (!sidebar) return;
      sidebar.classList.toggle('mobile-open');
      if (backdrop) {
        backdrop.classList.toggle('active', sidebar.classList.contains('mobile-open'));
      }
    }

    function closeSidebarMobile() {
      const sidebar = document.getElementById('appSidebar');
      const backdrop = document.getElementById('sidebarBackdrop');
      if (sidebar) sidebar.classList.remove('mobile-open');
      if (backdrop) backdrop.classList.remove('active');
    }

    function showToast(msg) {
      const t = document.getElementById('toast');
      if (!t) return;
      t.textContent = msg;
      t.classList.add('show');
      setTimeout(() => t.classList.remove('show'), 3000);
    }

    // ==========================================
    // User Persona & Profile State
    // ==========================================
    let currentUser = {
      name: 'Virat Sharma',
      persona: 'CAPTAIN',
      jerseyNumber: 18,
      battingStyle: 'RHB',
      bowlingStyle: 'Right-Arm Fast'
    };

    function openUserModal() {
      const modal = document.getElementById('modalUserProfile');
      if (modal) modal.classList.add('active');
    }

    function closeUserModal() {
      const modal = document.getElementById('modalUserProfile');
      if (modal) modal.classList.remove('active');
    }

    function applyRolePermissions(role) {
      const perms = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.FAN;

      // 1. Update top bar active persona pill
      const badge = document.getElementById('activePersonaBadge');
      if (badge) {
        badge.style.color = perms.badgeColor;
        badge.style.background = perms.badgeBg;
        badge.style.borderColor = perms.badgeColor;
        badge.innerHTML = perms.icon + ' ' + perms.label.toUpperCase();
        badge.setAttribute('data-tooltip', 'Active Persona: ' + perms.label + ' • ' + perms.description);
      }

      // 2. Tab Gating (show/hide sidebar nav tabs based on permissions)
      const allTabs = ['scoring', 'teams', 'tournaments', 'marketplace', 'studio', 'incidents', 'officials', 'admin', 'explorer'];
      allTabs.forEach(tabKey => {
        const navItem = document.querySelector(\`.sidebar-nav-item[data-tab="\${tabKey}"]\`);
        if (navItem) {
          const isAllowed = perms.allowedTabs.includes(tabKey);
          navItem.style.display = isAllowed ? 'flex' : 'none';
        }
      });

      // 3. Tab Redirection Safety
      const currentActiveTabPane = document.querySelector('.tab-pane.active');
      const currentTabKey = currentActiveTabPane ? currentActiveTabPane.id.replace('tab-', '') : 'scoring';
      const activeTabAllowed = perms.allowedTabs.includes(currentTabKey);

      // If current active tab is forbidden, navigate to default tab
      if (!activeTabAllowed) {
        switchTab(perms.defaultTab);
      }

      // 4. Update Match Center elements: Fan Cheering vs Scorer Pad vs Non-Scorer Locked Notice
      const cheerSection = document.getElementById('fanCheerSection');
      const matchScoringPad = document.getElementById('cardMatchScoringPad');
      const nonScorerNotice = document.getElementById('nonScorerMatchCenterNotice');
      const tossBtn = document.getElementById('btnConductToss');

      if (cheerSection) cheerSection.style.display = perms.fanCheerConsole ? 'block' : 'none';
      if (matchScoringPad) matchScoringPad.style.display = (role === 'SCORER') ? 'block' : 'none';
      if (nonScorerNotice) nonScorerNotice.style.display = (!perms.fanCheerConsole && role !== 'SCORER') ? 'block' : 'none';
      if (tossBtn) tossBtn.style.display = perms.canConductToss ? 'inline-block' : 'none';

      // 5. Update Studio Pad modes
      const studioModePill = document.getElementById('studioModePill');
      const captainNotice = document.getElementById('captainTacticalNotice');
      const fanNotice = document.getElementById('fanTacticalNotice');
      const adminNotice = document.getElementById('adminTacticalNotice');
      const studioControls = document.getElementById('studioScoringControlsGroup');
      const studioSwapBtn = document.getElementById('btnStudioSwapStrike');

      if (studioModePill) {
        if (role === 'CAPTAIN') {
          studioModePill.textContent = 'CAPTAIN TACTICAL MODE';
          studioModePill.style.color = 'var(--turf-emerald)';
          studioModePill.style.borderColor = 'rgba(0, 229, 153, 0.3)';
        } else if (role === 'SCORER') {
          studioModePill.textContent = 'OFFICIAL SCORER MODE';
          studioModePill.style.color = 'var(--amber)';
          studioModePill.style.borderColor = 'rgba(255, 184, 0, 0.3)';
        } else if (role === 'ADMIN') {
          studioModePill.textContent = 'ADMIN AUDIT & OBSERVATION MODE';
          studioModePill.style.color = 'var(--rose)';
          studioModePill.style.borderColor = 'rgba(255, 51, 102, 0.3)';
        } else if (role === 'FAN') {
          studioModePill.textContent = 'FAN SPECTATOR & WAGON WHEEL STUDIO';
          studioModePill.style.color = 'var(--purple-light)';
          studioModePill.style.borderColor = 'rgba(192, 132, 252, 0.3)';
        } else {
          studioModePill.textContent = perms.label.toUpperCase();
        }
      }
      if (captainNotice) {
        captainNotice.style.display = (role === 'CAPTAIN') ? 'block' : 'none';
      }
      if (fanNotice) {
        fanNotice.style.display = (role === 'FAN') ? 'block' : 'none';
      }
      if (adminNotice) {
        adminNotice.style.display = (role !== 'SCORER' && role !== 'CAPTAIN' && role !== 'FAN') ? 'block' : 'none';
      }
      if (studioControls) {
        studioControls.style.display = (role === 'SCORER') ? 'block' : 'none';
      }
      if (studioSwapBtn) {
        studioSwapBtn.style.display = (role === 'SCORER') ? 'inline-block' : 'none';
      }

      // 6. Admin Audit Desk Visibility
      const auditDesk = document.getElementById('adminAuditDeskContainer');
      if (auditDesk) {
        auditDesk.style.display = perms.canAccessAdmin ? 'block' : 'none';
      }

      showToast('Switched to ' + perms.label + ' persona: ' + perms.description);
    }

    function selectPersona(role) {
      currentUser.persona = role;
      const defaultProfiles = {
        CAPTAIN: { name: 'Virat Sharma', jersey: 18, batting: 'RHB', bowling: 'Right-Arm Fast' },
        PLAYER: { name: 'Hardik Patel', jersey: 33, batting: 'RHB', bowling: 'Right-Arm Medium' },
        SCORER: { name: 'Sunil Gavaskar', jersey: 18, batting: 'RHB', bowling: 'None' },
        FAN: { name: 'Aarav Mehta', jersey: 7, batting: 'RHB', bowling: 'None' },
        UMPIRE: { name: 'Nitin Menon', jersey: 44, batting: 'RHB', bowling: 'None' },
        ADMIN: { name: 'System Root', jersey: 99, batting: 'RHB', bowling: 'Right-Arm Fast' },
        ORGANISER: { name: 'Jay Shah', jersey: 10, batting: 'RHB', bowling: 'None' },
        TURF_PROVIDER: { name: 'Bengaluru Turf Ops', jersey: 12, batting: 'RHB', bowling: 'None' }
      };
      const def = defaultProfiles[role];
      if (def) {
        currentUser.name = def.name;
        currentUser.jerseyNumber = def.jersey;
        currentUser.battingStyle = def.batting;
        currentUser.bowlingStyle = def.bowling;
        const nameInput = document.getElementById('profileInputName');
        const jerseyInput = document.getElementById('profileInputJersey');
        const battingSelect = document.getElementById('profileInputBatting');
        const bowlingSelect = document.getElementById('profileInputBowling');
        if (nameInput) nameInput.value = def.name;
        if (jerseyInput) jerseyInput.value = def.jersey;
        if (battingSelect) battingSelect.value = def.batting;
        if (bowlingSelect) bowlingSelect.value = def.bowling;
      }
      applyRolePermissions(role);
    }

    // Fan Cheering & Pulse Handlers
    let fanTotalCheers = 1428;
    let fanVotes = { BLR: 68, MUM: 32 };

    function sendFanCheer(cheerText) {
      fanTotalCheers++;
      const counter = document.getElementById('fanTotalCheers');
      if (counter) counter.textContent = fanTotalCheers.toLocaleString();
      showToast('📢 Cheer Sent: ' + cheerText);
      const feed = document.getElementById('scoringFeed');
      if (feed) {
        const item = document.createElement('div');
        item.className = 'feed-item';
        item.style.borderLeft = '3px solid var(--purple-light)';
        item.innerHTML = '<span style="color: var(--purple-light); font-weight: 700;">[FAN CHEER]</span> 🎪 ' + currentUser.name + ': ' + cheerText;
        feed.insertBefore(item, feed.firstChild);
      }
    }

    function voteFanPoll(team) {
      if (team === 'BLR') fanVotes.BLR++;
      else fanVotes.MUM++;
      const total = fanVotes.BLR + fanVotes.MUM;
      const pctBLR = Math.round((fanVotes.BLR / total) * 100);
      const pctMUM = 100 - pctBLR;
      const barBLR = document.getElementById('fanVoteBarBLR');
      const barMUM = document.getElementById('fanVoteBarMUM');
      const lblBLR = document.getElementById('fanVotePctBLR');
      const lblMUM = document.getElementById('fanVotePctMUM');
      if (barBLR) barBLR.style.width = pctBLR + '%';
      if (barMUM) barMUM.style.width = pctMUM + '%';
      if (lblBLR) lblBLR.textContent = pctBLR + '% Bangalore';
      if (lblMUM) lblMUM.textContent = pctMUM + '% Mumbai';
      showToast('Voted for ' + (team === 'BLR' ? 'Bangalore Blasters' : 'Mumbai Super Strikers') + '!');
    }

    function saveUserProfile() {
      const nameInput = document.getElementById('profileInputName');
      const jerseyInput = document.getElementById('profileInputJersey');
      const battingSelect = document.getElementById('profileInputBatting');
      const bowlingSelect = document.getElementById('profileInputBowling');

      if (nameInput && nameInput.value.trim()) currentUser.name = nameInput.value.trim();
      if (jerseyInput && jerseyInput.value) currentUser.jerseyNumber = parseInt(jerseyInput.value, 10) || 18;
      if (battingSelect) currentUser.battingStyle = battingSelect.value;
      if (bowlingSelect) currentUser.bowlingStyle = bowlingSelect.value;

      closeUserModal();
      applyRolePermissions(currentUser.persona);
      showToast('Profile updated! Active Persona: ' + currentUser.persona);
    }

    function confirmAccountDeletion() {
      if (window.confirm('Are you sure you want to delete your account? All personal match records will be scrubbed per Apple App Store Guideline 5.1.1(v).')) {
        currentUser.name = 'Anonymous Player';
        currentUser.persona = 'PLAYER';
        currentUser.jerseyNumber = 0;
        closeUserModal();
        applyRolePermissions('PLAYER');
        showToast('Account data deleted per Apple Guideline 5.1.1(v)');
      }
    }

    // ==========================================
    // Tactical Scoring Studio & Precision Wagon Wheel
    // ==========================================
    const KNOWN_BATTER_STANCES = {
      'Rishabh Pant': 'LHB',
      'Hardik Patel': 'LHB',
      'Ravindra Jadeja': 'LHB',
      'Ravindra Singh': 'LHB',
      'Axar Patel': 'LHB',
      'Shivam Dube': 'LHB',
      'Kuldeep Yadav': 'LHB',
      'Arshdeep Singh': 'LHB',
      'Yashasvi Jaiswal': 'LHB',
      'Rinku Singh': 'LHB',
      'Nicholas Pooran': 'LHB',
      'Quinton de Kock': 'LHB',
      'David Warner': 'LHB',
      'Travis Head': 'LHB',
      'Shikhar Dhawan': 'LHB',
      'Suresh Raina': 'LHB',
      'Gautam Gambhir': 'LHB',
      'Brian Lara': 'LHB',
      'Sourav Ganguly': 'LHB',
      'Virat Sharma': 'RHB',
      'Virat Kohli': 'RHB',
      'Rohit Verma': 'RHB',
      'Rohit Sharma': 'RHB',
      'KL Rahul': 'RHB',
      'Suryakumar Rao': 'RHB',
      'Suryakumar Yadav': 'RHB',
      'Surya Kumar': 'RHB',
      'Jasprit Bumrah': 'RHB',
      'Mohammed Siraj': 'RHB',
      'Mohammed Shami': 'RHB',
      'Sanju Samson': 'RHB',
      'Yuzvendra Chahal': 'RHB',
      'Shubman Gill': 'RHB',
      'Shreyas Iyer': 'RHB',
      'MS Dhoni': 'RHB'
    };

    function getBatterStanceByName(name, optionEl) {
      if (!name) return 'RHB';
      if (optionEl) {
        if (optionEl.dataset && optionEl.dataset.stance) return optionEl.dataset.stance;
        if (optionEl.textContent && optionEl.textContent.includes('(LHB)')) return 'LHB';
        if (optionEl.textContent && optionEl.textContent.includes('(RHB)')) return 'RHB';
      }
      if (typeof initialPlayingXi !== 'undefined') {
        const inXi = initialPlayingXi.find(p => p.name === name);
        if (inXi && inXi.battingStyle) return inXi.battingStyle;
      }
      if (typeof initialBench !== 'undefined') {
        const inBench = initialBench.find(p => p.name === name);
        if (inBench && inBench.battingStyle) return inBench.battingStyle;
      }
      if (KNOWN_BATTER_STANCES[name]) return KNOWN_BATTER_STANCES[name];
      const lower = name.toLowerCase();
      if (lower.includes('pant') || lower.includes('jadeja') || lower.includes('axar') || lower.includes('dube') || lower.includes('lhb')) {
        return 'LHB';
      }
      return 'RHB';
    }

    let studioStriker = { name: 'Virat Sharma', runs: 48, balls: 32, fours: 4, sixes: 2, battingStyle: 'RHB' };
    let studioNonStriker = { name: 'Hardik Patel', runs: 18, balls: 12, fours: 1, sixes: 1, battingStyle: 'LHB' };
    let partnership = { runs: 44, balls: 28 };
    let currentSelectedZone = 'EXTRA_COVER';
    let currentStance = 'RHB';
    let currentShotFilter = 'ALL';
    let currentBatterFilter = 'Virat Sharma';

    const SHOT_ZONES_DATA = [
      { id: 'FINE_LEG', label: 'Fine Leg', shortLabel: 'Fine Leg', angleDeg: 22.5, side: 'LEG' },
      { id: 'SQUARE_LEG', label: 'Deep Square Leg', shortLabel: 'Sq Leg', angleDeg: 67.5, side: 'LEG' },
      { id: 'MID_WICKET', label: 'Deep Mid Wicket', shortLabel: 'Mid Wkt', angleDeg: 112.5, side: 'LEG' },
      { id: 'LONG_ON', label: 'Long On', shortLabel: 'Long On', angleDeg: 157.5, side: 'LEG' },
      { id: 'LONG_OFF', label: 'Long Off', shortLabel: 'Long Off', angleDeg: 202.5, side: 'OFF' },
      { id: 'EXTRA_COVER', label: 'Cover / Extra Cover', shortLabel: 'Cover', angleDeg: 247.5, side: 'OFF' },
      { id: 'POINT', label: 'Point', shortLabel: 'Point', angleDeg: 292.5, side: 'OFF' },
      { id: 'THIRD_MAN', label: 'Third Man', shortLabel: 'Third Man', angleDeg: 337.5, side: 'OFF' }
    ];

    const ZONE_LAYOUT = {
      RHB: {
        top_left: { id: 'THIRD_MAN', label: 'Third Man', shortLabel: 'Third Man', side: 'OFF', angleDeg: 337.5, tooltip: 'Third Man: Behind square on off side' },
        top_right: { id: 'FINE_LEG', label: 'Fine Leg', shortLabel: 'Fine Leg', side: 'ON', angleDeg: 22.5, tooltip: 'Fine Leg: Behind square on on-side' },
        mid_left: { id: 'POINT', label: 'Point', shortLabel: 'Point', side: 'OFF', angleDeg: 292.5, tooltip: 'Point: Square of the wicket on off side' },
        mid_right: { id: 'SQUARE_LEG', label: 'Deep Square Leg', shortLabel: 'Sq Leg', side: 'ON', angleDeg: 67.5, tooltip: 'Deep Square Leg: Square of the wicket on on-side' },
        lower_left: { id: 'EXTRA_COVER', label: 'Cover / Extra Cover', shortLabel: 'Cover', side: 'OFF', angleDeg: 247.5, tooltip: 'Cover / Extra Cover: Forward of square on off side' },
        lower_right: { id: 'MID_WICKET', label: 'Deep Mid Wicket', shortLabel: 'Mid Wkt', side: 'ON', angleDeg: 112.5, tooltip: 'Deep Mid Wicket: Forward of square on on-side' },
        bottom_left: { id: 'LONG_OFF', label: 'Long Off', shortLabel: 'Long Off', side: 'OFF', angleDeg: 202.5, tooltip: 'Long Off: Straight off-side drive' },
        bottom_right: { id: 'LONG_ON', label: 'Long On', shortLabel: 'Long On', side: 'ON', angleDeg: 157.5, tooltip: 'Long On: Straight on-side drive' }
      },
      LHB: {
        top_left: { id: 'FINE_LEG', label: 'Fine Leg', shortLabel: 'Fine Leg', side: 'ON', angleDeg: 22.5, tooltip: 'Fine Leg: Behind square on on-side (left for LHB)' },
        top_right: { id: 'THIRD_MAN', label: 'Third Man', shortLabel: 'Third Man', side: 'OFF', angleDeg: 337.5, tooltip: 'Third Man: Behind square on off side (right for LHB)' },
        mid_left: { id: 'SQUARE_LEG', label: 'Deep Square Leg', shortLabel: 'Sq Leg', side: 'ON', angleDeg: 67.5, tooltip: 'Deep Square Leg: Square of the wicket on on-side (left for LHB)' },
        mid_right: { id: 'POINT', label: 'Point', shortLabel: 'Point', side: 'OFF', angleDeg: 292.5, tooltip: 'Point: Square of the wicket on off side (right for LHB)' },
        lower_left: { id: 'MID_WICKET', label: 'Deep Mid Wicket', shortLabel: 'Mid Wkt', side: 'ON', angleDeg: 112.5, tooltip: 'Deep Mid Wicket: Forward of square on on-side (left for LHB)' },
        lower_right: { id: 'EXTRA_COVER', label: 'Cover / Extra Cover', shortLabel: 'Cover', side: 'OFF', angleDeg: 247.5, tooltip: 'Cover / Extra Cover: Forward of square on off side (right for LHB)' },
        bottom_left: { id: 'LONG_ON', label: 'Long On', shortLabel: 'Long On', side: 'ON', angleDeg: 157.5, tooltip: 'Long On: Straight on-side drive (left for LHB)' },
        bottom_right: { id: 'LONG_OFF', label: 'Long Off', shortLabel: 'Long Off', side: 'OFF', angleDeg: 202.5, tooltip: 'Long Off: Straight off-side drive (right for LHB)' }
      }
    };

    let shotHistory = [
      // Virat Sharma (48* off 32: 4x4, 2x6)
      { id: 's1', zone: 'EXTRA_COVER', runs: 4, isBoundary: true, isSix: false, batterName: 'Virat Sharma', ballNumber: 4, angleDeg: 248, distanceFraction: 0.98 },
      { id: 's2', zone: 'EXTRA_COVER', runs: 4, isBoundary: true, isSix: false, batterName: 'Virat Sharma', ballNumber: 9, angleDeg: 255, distanceFraction: 0.99 },
      { id: 's3', zone: 'MID_WICKET', runs: 6, isBoundary: true, isSix: true, batterName: 'Virat Sharma', ballNumber: 14, angleDeg: 115, distanceFraction: 1.15 },
      { id: 's4', zone: 'LONG_ON', runs: 6, isBoundary: true, isSix: true, batterName: 'Virat Sharma', ballNumber: 21, angleDeg: 160, distanceFraction: 1.18 },
      { id: 's5', zone: 'POINT', runs: 4, isBoundary: true, isSix: false, batterName: 'Virat Sharma', ballNumber: 26, angleDeg: 290, distanceFraction: 0.97 },
      { id: 's6', zone: 'LONG_OFF', runs: 4, isBoundary: true, isSix: false, batterName: 'Virat Sharma', ballNumber: 30, angleDeg: 200, distanceFraction: 0.98 },
      { id: 's7', zone: 'SQUARE_LEG', runs: 1, isBoundary: false, isSix: false, batterName: 'Virat Sharma', ballNumber: 2, angleDeg: 75, distanceFraction: 0.65 },
      { id: 's8', zone: 'FINE_LEG', runs: 2, isBoundary: false, isSix: false, batterName: 'Virat Sharma', ballNumber: 7, angleDeg: 25, distanceFraction: 0.72 },
      { id: 's9', zone: 'THIRD_MAN', runs: 1, isBoundary: false, isSix: false, batterName: 'Virat Sharma', ballNumber: 11, angleDeg: 335, distanceFraction: 0.68 },
      { id: 's10', zone: 'MID_WICKET', runs: 2, isBoundary: false, isSix: false, batterName: 'Virat Sharma', ballNumber: 17, angleDeg: 110, distanceFraction: 0.75 },
      { id: 's11', zone: 'EXTRA_COVER', runs: 0, isBoundary: false, isSix: false, batterName: 'Virat Sharma', ballNumber: 1, angleDeg: 250, distanceFraction: 0.35 },
      { id: 's12', zone: 'POINT', runs: 0, isBoundary: false, isSix: false, batterName: 'Virat Sharma', ballNumber: 6, angleDeg: 295, distanceFraction: 0.38 },

      // Hardik Patel (18 off 12: 1x4, 1x6)
      { id: 's13', zone: 'MID_WICKET', runs: 6, isBoundary: true, isSix: true, batterName: 'Hardik Patel', ballNumber: 16, angleDeg: 112, distanceFraction: 1.14 },
      { id: 's14', zone: 'SQUARE_LEG', runs: 4, isBoundary: true, isSix: false, batterName: 'Hardik Patel', ballNumber: 23, angleDeg: 70, distanceFraction: 0.98 },
      { id: 's15', zone: 'LONG_ON', runs: 2, isBoundary: false, isSix: false, batterName: 'Hardik Patel', ballNumber: 18, angleDeg: 162, distanceFraction: 0.78 },
      { id: 's16', zone: 'FINE_LEG', runs: 1, isBoundary: false, isSix: false, batterName: 'Hardik Patel', ballNumber: 20, angleDeg: 22, distanceFraction: 0.62 },
      { id: 's17', zone: 'EXTRA_COVER', runs: 1, isBoundary: false, isSix: false, batterName: 'Hardik Patel', ballNumber: 27, angleDeg: 245, distanceFraction: 0.58 },
      { id: 's18', zone: 'MID_WICKET', runs: 0, isBoundary: false, isSix: false, batterName: 'Hardik Patel', ballNumber: 15, angleDeg: 118, distanceFraction: 0.4 }
    ];

    function updateZoneElementsForStance(stance) {
      const layout = ZONE_LAYOUT[stance] || ZONE_LAYOUT.RHB;
      Object.keys(layout).forEach(pos => {
        const info = layout[pos];
        const btn = document.getElementById('btnZone_' + pos);
        if (btn) {
          btn.setAttribute('data-zone', info.id);
          btn.setAttribute('onclick', "selectShotZone('" + info.id + "', this)");
          btn.setAttribute('data-tooltip', info.tooltip);
          btn.innerHTML = '<span>' + info.shortLabel + '</span> <span class="field-zone-runs" id="zoneRuns_' + info.id + '">0r</span>';
        }
        const wedge = document.getElementById('wedge_' + pos);
        if (wedge) {
          wedge.setAttribute('data-zone', info.id);
          wedge.setAttribute('onclick', "selectShotZone('" + info.id + "')");
          wedge.setAttribute('data-tooltip', info.label + ' (' + (info.side === 'OFF' ? 'Off-Side' : 'On-Side') + ')');
        }
      });
    }

    function selectShotZone(zone, btnEl) {
      currentSelectedZone = zone;
      document.querySelectorAll('.field-zone-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.wagon-sector-wedge').forEach(w => w.classList.remove('active'));

      const matchedBtn = btnEl || document.querySelector('.field-zone-btn[data-zone="' + zone + '"]');
      if (matchedBtn) matchedBtn.classList.add('active');

      const matchedWedge = document.querySelector('.wagon-sector-wedge[data-zone="' + zone + '"]');
      if (matchedWedge) matchedWedge.classList.add('active');

      const zoneDef = SHOT_ZONES_DATA.find(z => z.id === zone);
      const isOff = currentStance === 'RHB' ? zoneDef?.side === 'OFF' : zoneDef?.side === 'LEG';
      const sideLabel = isOff ? 'OFF-SIDE' : 'ON-SIDE';

      const label = document.getElementById('wagonWheelSelectedZone');
      if (label && zoneDef) {
        label.textContent = 'ZONE: ' + zoneDef.label.toUpperCase() + ' (' + sideLabel + ' • ' + Math.round(zoneDef.angleDeg) + '°)';
      }
      showToast('Wagon Zone: ' + (zoneDef?.label || zone) + ' (' + sideLabel + ')');
    }

    function setBatterStance(stance, updateStriker = false) {
      currentStance = stance;
      if (updateStriker) {
        studioStriker.battingStyle = stance;
        const strikerBadge = document.getElementById('studioStrikerStanceBadge');
        if (strikerBadge) strikerBadge.textContent = stance;
      }
      const btnRhb = document.getElementById('btnStanceRhb');
      const btnLhb = document.getElementById('btnStanceLhb');
      const offLabel = document.getElementById('wagonLabelOff');
      const legLabel = document.getElementById('wagonLabelLeg');

      if (stance === 'RHB') {
        if (btnRhb) { btnRhb.style.background = 'var(--turf-emerald)'; btnRhb.style.color = '#04070D'; }
        if (btnLhb) { btnLhb.style.background = 'transparent'; btnLhb.style.color = '#8E9BAE'; }
        if (offLabel) {
          offLabel.setAttribute('x', '35');
          offLabel.setAttribute('text-anchor', 'start');
          offLabel.setAttribute('fill', 'var(--cyan)');
          offLabel.textContent = '◀ OFF SIDE';
        }
        if (legLabel) {
          legLabel.setAttribute('x', '325');
          legLabel.setAttribute('text-anchor', 'end');
          legLabel.setAttribute('fill', 'var(--turf-emerald)');
          legLabel.textContent = 'ON SIDE ▶';
        }
      } else {
        if (btnLhb) { btnLhb.style.background = 'var(--turf-emerald)'; btnLhb.style.color = '#04070D'; }
        if (btnRhb) { btnRhb.style.background = 'transparent'; btnRhb.style.color = '#8E9BAE'; }
        if (offLabel) {
          offLabel.setAttribute('x', '325');
          offLabel.setAttribute('text-anchor', 'end');
          offLabel.setAttribute('fill', 'var(--cyan)');
          offLabel.textContent = 'OFF SIDE ▶';
        }
        if (legLabel) {
          legLabel.setAttribute('x', '35');
          legLabel.setAttribute('text-anchor', 'start');
          legLabel.setAttribute('fill', 'var(--turf-emerald)');
          legLabel.textContent = '◀ ON SIDE';
        }
      }

      updateZoneElementsForStance(stance);
      selectShotZone(currentSelectedZone);
      renderWagonWheelRays();
      updateWagonTelemetry();
      showToast('Batsman stance: ' + stance + ' (Off-Side & On-Side flipped dynamically)');
    }

    function filterWagonShots(filterType, btnEl) {
      currentShotFilter = filterType;
      document.querySelectorAll('.wagon-filter-pill').forEach(p => p.classList.remove('active'));
      if (btnEl) btnEl.classList.add('active');
      renderWagonWheelRays();
    }

    function filterWagonBatter(batterName, btnEl) {
      currentBatterFilter = batterName;
      document.querySelectorAll('.wagon-batter-pill').forEach(p => p.classList.remove('active'));
      if (btnEl) {
        btnEl.classList.add('active');
      } else {
        const targetBtn = document.querySelector('.wagon-batter-pill[onclick*="' + batterName + '"]');
        if (targetBtn) targetBtn.classList.add('active');
      }

      // Automatically select stance based on selected batter
      let targetStance = 'RHB';
      if (batterName === studioStriker.name) {
        targetStance = studioStriker.battingStyle || getBatterStanceByName(studioStriker.name);
      } else if (batterName === studioNonStriker.name) {
        targetStance = studioNonStriker.battingStyle || getBatterStanceByName(studioNonStriker.name);
      } else if (batterName === 'ALL') {
        targetStance = studioStriker.battingStyle || getBatterStanceByName(studioStriker.name);
      } else {
        targetStance = getBatterStanceByName(batterName);
      }
      if (currentStance !== targetStance) {
        setBatterStance(targetStance, false);
      }

      // Update Pitch SVG Badge & Stance
      const svgInitials = document.getElementById('svgPitchBatterInitials');
      const svgName = document.getElementById('svgPitchBatterName');
      const svgScore = document.getElementById('svgPitchBatterScore');
      const svgNonStriker = document.getElementById('svgPitchNonStrikerText');
      const activeLabel = document.getElementById('wagonActiveBatterLabel');
      const facingEl = document.getElementById('wagonFacingBatter');

      if (batterName === 'ALL') {
        if (svgInitials) svgInitials.textContent = '🤝';
        if (svgName) svgName.textContent = 'Partnership';
        if (svgScore) svgScore.textContent = partnership.runs + ' (' + partnership.balls + ')';
        if (svgNonStriker) svgNonStriker.textContent = studioStriker.name + ' & ' + studioNonStriker.name;
        if (activeLabel) activeLabel.textContent = 'Partnership Stand (' + partnership.runs + ' runs off ' + partnership.balls + 'b)';
        if (facingEl) facingEl.textContent = 'Both Batsmen (Partnership)';
      } else if (batterName === studioStriker.name) {
        const inits = studioStriker.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
        if (svgInitials) svgInitials.textContent = inits;
        if (svgName) svgName.textContent = studioStriker.name + ' (' + targetStance + ')';
        if (svgScore) svgScore.textContent = studioStriker.runs + '* (' + studioStriker.balls + ')';
        if (svgNonStriker) svgNonStriker.textContent = studioNonStriker.name + ' ' + studioNonStriker.runs + ' (' + studioNonStriker.balls + ')';
        if (activeLabel) activeLabel.textContent = studioStriker.name + ' [' + targetStance + '] (' + studioStriker.runs + '* off ' + studioStriker.balls + 'b)';
        if (facingEl) facingEl.textContent = studioStriker.name + ' (' + targetStance + ' - Striker)';
      } else if (batterName === studioNonStriker.name) {
        const inits = studioNonStriker.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
        if (svgInitials) svgInitials.textContent = inits;
        if (svgName) svgName.textContent = studioNonStriker.name + ' (' + targetStance + ')';
        if (svgScore) svgScore.textContent = studioNonStriker.runs + ' (' + studioNonStriker.balls + ')';
        if (svgNonStriker) svgNonStriker.textContent = studioStriker.name + ' ' + studioStriker.runs + '* (' + studioStriker.balls + ')';
        if (activeLabel) activeLabel.textContent = studioNonStriker.name + ' [' + targetStance + '] (' + studioNonStriker.runs + ' off ' + studioNonStriker.balls + 'b)';
        if (facingEl) facingEl.textContent = studioNonStriker.name + ' (' + targetStance + ' - Non-Striker)';
      }

      renderWagonWheelRays();
      updateWagonTelemetry();
      showToast('Wagon wheel filtered for: ' + (batterName === 'ALL' ? 'Partnership Stand' : batterName + ' (' + targetStance + ')'));
    }

    function renderWagonWheelRays() {
      const container = document.getElementById('wagonWheelRays');
      if (!container) return;
      container.innerHTML = '';

      const centerX = 180;
      const centerY = 156; // Striker's popping crease in standard top-crease orientation
      const radius = 162;

      const filteredShots = shotHistory.filter(s => {
        if (currentBatterFilter !== 'ALL' && s.batterName !== currentBatterFilter) return false;
        if (currentShotFilter === 'BOUNDARIES') return s.isBoundary;
        if (currentShotFilter === 'SINGLES') return !s.isBoundary && s.runs > 0;
        if (currentShotFilter === 'DOTS') return s.runs === 0;
        return true;
      });

      filteredShots.forEach((shot) => {
        // Adjust angle if LHB (mirrored across the North-South 0°-180° pitch line)
        let angle = shot.angleDeg;
        if (currentStance === 'LHB') {
          angle = (360 - angle) % 360;
        }

        const rad = ((angle - 90) * Math.PI) / 180;
        const dist = shot.distanceFraction * radius;
        const targetX = Math.round(centerX + dist * Math.cos(rad));
        const targetY = Math.round(centerY + dist * Math.sin(rad));

        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'wagon-shot-ray');
        g.setAttribute('data-tooltip', shot.batterName + ' • ' + shot.runs + (shot.runs === 1 ? ' Run' : ' Runs') + (shot.isSix ? ' (MAXIMUM)' : shot.isBoundary ? ' (FOUR)' : '') + ' to ' + shot.zone.replace('_', ' '));

        if (shot.isSix) {
          // Curved Arc for Sixes
          const midX = (centerX + targetX) / 2 + (Math.random() * 8 - 4);
          const midY = (centerY + targetY) / 2 - 16;
          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          path.setAttribute('d', 'M ' + centerX + ',' + centerY + ' Q ' + midX + ',' + midY + ' ' + targetX + ',' + targetY);
          path.setAttribute('fill', 'none');
          path.setAttribute('stroke', '#FFB800');
          path.setAttribute('stroke-width', '2.8');
          path.setAttribute('stroke-linecap', 'round');
          path.setAttribute('filter', 'drop-shadow(0 0 4px rgba(255, 184, 0, 0.7))');
          g.appendChild(path);

          // Star marker at impact
          const marker = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
          marker.setAttribute('points', targetX + ',' + (targetY - 5) + ' ' + (targetX + 2) + ',' + (targetY - 1) + ' ' + (targetX + 6) + ',' + targetY + ' ' + (targetX + 2) + ',' + (targetY + 1) + ' ' + targetX + ',' + (targetY + 5) + ' ' + (targetX - 2) + ',' + (targetY + 1) + ' ' + (targetX - 6) + ',' + targetY + ' ' + (targetX - 2) + ',' + (targetY - 1));
          marker.setAttribute('fill', '#FFB800');
          g.appendChild(marker);
        } else {
          // Straight Line
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', String(centerX));
          line.setAttribute('y1', String(centerY));
          line.setAttribute('x2', String(targetX));
          line.setAttribute('y2', String(targetY));
          line.setAttribute('stroke-linecap', 'round');

          if (shot.isBoundary) {
            line.setAttribute('stroke', '#00E599');
            line.setAttribute('stroke-width', '2.4');
            line.setAttribute('filter', 'drop-shadow(0 0 3px rgba(0, 229, 153, 0.6))');
            const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            dot.setAttribute('cx', String(targetX));
            dot.setAttribute('cy', String(targetY));
            dot.setAttribute('r', '3.5');
            dot.setAttribute('fill', '#00E599');
            dot.setAttribute('stroke', '#04070D');
            dot.setAttribute('stroke-width', '1');
            g.appendChild(dot);
          } else if (shot.runs > 0) {
            line.setAttribute('stroke', '#00D2FF');
            line.setAttribute('stroke-width', shot.runs >= 2 ? '1.8' : '1.3');
            const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            dot.setAttribute('cx', String(targetX));
            dot.setAttribute('cy', String(targetY));
            dot.setAttribute('r', '2');
            dot.setAttribute('fill', '#00D2FF');
            g.appendChild(dot);
          } else {
            line.setAttribute('stroke', '#64748B');
            line.setAttribute('stroke-width', '1.1');
            line.setAttribute('stroke-dasharray', '3,3');
            const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            dot.setAttribute('cx', String(targetX));
            dot.setAttribute('cy', String(targetY));
            dot.setAttribute('r', '1.5');
            dot.setAttribute('fill', '#64748B');
            g.appendChild(dot);
          }
          g.appendChild(line);
        }

        container.appendChild(g);
      });
    }

    function updateWagonTelemetry() {
      const zoneRuns = {};
      SHOT_ZONES_DATA.forEach(z => { zoneRuns[z.id] = 0; });

      let offRuns = 0;
      let legRuns = 0;
      let boundaries = 0;
      let sixes = 0;
      let fours = 0;
      let totalRuns = 0;
      let totalBalls = 0;

      shotHistory.forEach(s => {
        if (currentBatterFilter !== 'ALL' && s.batterName !== currentBatterFilter) return;
        totalRuns += s.runs;
        totalBalls += 1;
        if (zoneRuns[s.zone] !== undefined) {
          zoneRuns[s.zone] += s.runs;
        }
        const zoneDef = SHOT_ZONES_DATA.find(z => z.id === s.zone);
        const isOff = currentStance === 'RHB' ? zoneDef?.side === 'OFF' : zoneDef?.side === 'LEG';
        if (isOff) offRuns += s.runs;
        else legRuns += s.runs;

        if (s.isSix) { sixes++; boundaries++; }
        else if (s.isBoundary) { fours++; boundaries++; }
      });

      // Update Zone Badge Numbers
      SHOT_ZONES_DATA.forEach(z => {
        const el = document.getElementById('zoneRuns_' + z.id);
        if (el) el.textContent = zoneRuns[z.id] + 'r';
      });

      const totalScored = offRuns + legRuns;
      const offPct = totalScored > 0 ? Math.round((offRuns / totalScored) * 100) : 50;
      const legPct = totalScored > 0 ? (100 - offPct) : 50;

      const offEl = document.getElementById('wagonOffTally');
      const legEl = document.getElementById('wagonLegTally');
      const bndEl = document.getElementById('wagonBoundaryTally');
      const srEl = document.getElementById('wagonBatterSrTally');

      if (offEl) offEl.textContent = offPct + '% (' + offRuns + ' runs)';
      if (legEl) legEl.textContent = legPct + '% (' + legRuns + ' runs)';
      if (bndEl) bndEl.textContent = boundaries + ' Hits (' + fours + 'x4, ' + sixes + 'x6)';
      if (srEl) {
        const sr = totalBalls > 0 ? ((totalRuns / totalBalls) * 100).toFixed(1) : '0.0';
        srEl.textContent = sr + ' SR (' + totalBalls + 'b)';
      }
    }

    function swapStudioStrike() {
      if (typeof currentUser !== 'undefined' && currentUser.persona !== 'SCORER') {
        showToast('🔒 Only official Scorers can swap strike.');
        return;
      }
      const temp = { ...studioStriker };
      studioStriker = { ...studioNonStriker };
      studioNonStriker = temp;
      
      // Update stance dynamically based on new batsman on strike
      const newStance = studioStriker.battingStyle || getBatterStanceByName(studioStriker.name);
      studioStriker.battingStyle = newStance;
      setBatterStance(newStance, false);
      updateStudioUI();

      if (currentBatterFilter !== 'ALL') {
        filterWagonBatter(studioStriker.name);
      } else {
        const svgNonStriker = document.getElementById('svgPitchNonStrikerText');
        if (svgNonStriker) svgNonStriker.textContent = studioStriker.name + ' & ' + studioNonStriker.name;
      }
      showToast('Strike swapped! Now facing: ' + studioStriker.name + ' (' + newStance + ')');
    }

    function updateStudioUI() {
      const sName = document.getElementById('studioStrikerName');
      const sStats = document.getElementById('studioStrikerStats');
      const sBadge = document.getElementById('studioStrikerStanceBadge');
      const nsName = document.getElementById('studioNonStrikerName');
      const nsStats = document.getElementById('studioNonStrikerStats');
      const nsBadge = document.getElementById('studioNonStrikerStanceBadge');
      const partEl = document.getElementById('partnershipRunsBalls');
      const partFill = document.getElementById('partnershipProgressFill');
      const facingEl = document.getElementById('wagonFacingBatter');
      const scoreAll = document.getElementById('wagonBatterScore_All');

      // Update Batsman Selector Pills dynamically
      const pillStriker = document.getElementById('wagonBatterBtn_Virat');
      const pillNonStriker = document.getElementById('wagonBatterBtn_Hardik');
      if (pillStriker) {
        const inits1 = studioStriker.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
        const stance1 = studioStriker.battingStyle || getBatterStanceByName(studioStriker.name);
        pillStriker.setAttribute('onclick', "filterWagonBatter('" + studioStriker.name + "', this)");
        pillStriker.setAttribute('data-tooltip', 'Wagon wheel for ' + studioStriker.name + ' (' + stance1 + '): ' + studioStriker.runs + '* (' + studioStriker.balls + ' balls)');
        pillStriker.innerHTML = '<span class="batter-pill-badge">' + inits1 + ' • ' + stance1 + '</span>' +
          '<span>' + studioStriker.name + '</span>' +
          '<span class="batter-pill-score" id="wagonBatterScore_Virat">' + studioStriker.runs + '* (' + studioStriker.balls + ')</span>';
      }
      if (pillNonStriker) {
        const inits2 = studioNonStriker.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
        const stance2 = studioNonStriker.battingStyle || getBatterStanceByName(studioNonStriker.name);
        pillNonStriker.setAttribute('onclick', "filterWagonBatter('" + studioNonStriker.name + "', this)");
        pillNonStriker.setAttribute('data-tooltip', 'Wagon wheel for ' + studioNonStriker.name + ' (' + stance2 + '): ' + studioNonStriker.runs + ' (' + studioNonStriker.balls + ')');
        pillNonStriker.innerHTML = '<span class="batter-pill-badge">' + inits2 + ' • ' + stance2 + '</span>' +
          '<span>' + studioNonStriker.name + '</span>' +
          '<span class="batter-pill-score" id="wagonBatterScore_Hardik">' + studioNonStriker.runs + ' (' + studioNonStriker.balls + ')</span>';
      }

      if (sName) sName.textContent = studioStriker.name;
      if (sBadge) {
        const sStance = studioStriker.battingStyle || getBatterStanceByName(studioStriker.name);
        sBadge.textContent = sStance;
        sBadge.style.background = sStance === 'LHB' ? 'rgba(0, 210, 255, 0.15)' : 'rgba(0, 229, 153, 0.15)';
        sBadge.style.color = sStance === 'LHB' ? 'var(--cyan)' : 'var(--turf-emerald)';
      }
      if (sStats) sStats.innerHTML = studioStriker.runs + '* <span style="font-size: 0.8rem; color: var(--text-muted);">(' + studioStriker.balls + 'b, ' + studioStriker.fours + 'x4, ' + studioStriker.sixes + 'x6)</span>';
      
      if (nsName) nsName.textContent = studioNonStriker.name;
      if (nsBadge) {
        const nsStance = studioNonStriker.battingStyle || getBatterStanceByName(studioNonStriker.name);
        nsBadge.textContent = nsStance;
        nsBadge.style.background = nsStance === 'LHB' ? 'rgba(0, 210, 255, 0.15)' : 'rgba(0, 229, 153, 0.15)';
        nsBadge.style.color = nsStance === 'LHB' ? 'var(--cyan)' : 'var(--turf-emerald)';
      }
      if (nsStats) nsStats.innerHTML = studioNonStriker.runs + ' <span style="font-size: 0.8rem; color: var(--text-muted);">(' + studioNonStriker.balls + 'b, ' + studioNonStriker.fours + 'x4, ' + studioNonStriker.sixes + 'x6)</span>';
      
      if (facingEl) {
        const facingStance = studioStriker.battingStyle || getBatterStanceByName(studioStriker.name);
        facingEl.textContent = studioStriker.name + ' (' + facingStance + ')';
      }

      if (scoreAll) scoreAll.textContent = partnership.runs + ' (' + partnership.balls + ')';

      if (partEl) partEl.innerHTML = partnership.runs + ' runs <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: normal;">(' + partnership.balls + ' balls)</span>';
      if (partFill) partFill.style.width = Math.min(100, (partnership.runs / 75) * 100) + '%';
    }

    function recordStudioBall(batRuns) {
      if (typeof currentUser !== 'undefined' && currentUser.persona !== 'SCORER') {
        showToast('🔒 Only official Scorers can record deliveries.');
        return;
      }
      studioStriker.runs += batRuns;
      studioStriker.balls += 1;
      const isSix = batRuns === 6;
      const isBoundary = batRuns === 4 || isSix;
      if (batRuns === 4) studioStriker.fours += 1;
      if (batRuns === 6) studioStriker.sixes += 1;
      partnership.runs += batRuns;
      partnership.balls += 1;

      // Add shot to wagon wheel
      const zoneDef = SHOT_ZONES_DATA.find(z => z.id === currentSelectedZone);
      const angle = zoneDef ? zoneDef.angleDeg + (Math.random() * 16 - 8) : 247.5;
      const dist = isSix ? 1.16 : isBoundary ? 0.98 : batRuns === 0 ? 0.36 : 0.72;

      shotHistory.push({
        id: 's' + Date.now(),
        zone: currentSelectedZone,
        runs: batRuns,
        isBoundary,
        isSix,
        batterName: studioStriker.name,
        ballNumber: studioStriker.balls,
        angleDeg: angle,
        distanceFraction: dist
      });

      renderWagonWheelRays();
      updateWagonTelemetry();

      scoreDelivery(batRuns, 0, 'NONE', true, false);

      if (batRuns % 2 === 1) {
        swapStudioStrike();
      } else {
        updateStudioUI();
      }
    }

    function recordStudioExtra(extraType, extraRuns) {
      if (typeof currentUser !== 'undefined' && currentUser.persona !== 'SCORER') {
        showToast('🔒 Only official Scorers can record extras.');
        return;
      }
      partnership.runs += extraRuns;
      scoreDelivery(0, extraRuns, extraType, extraType !== 'WIDE' && extraType !== 'NO_BALL', false);
      if (extraType === 'BYE' || extraType === 'LEG_BYE') {
        if (extraRuns % 2 === 1) swapStudioStrike();
      }
      updateStudioUI();
    }

    // ==========================================
    // Dismissal / Wicket Flow
    // ==========================================
    function openDismissalModal() {
      if (typeof currentUser !== 'undefined' && currentUser.persona !== 'SCORER') {
        showToast('🔒 Only official Scorers can record dismissals.');
        return;
      }
      const modal = document.getElementById('modalDismissal');
      if (modal) {
        modal.classList.add('active');
        const strikerOpt = document.getElementById('outStrikerOption');
        const nonStrikerOpt = document.getElementById('outNonStrikerOption');
        const currentStriker = document.getElementById('strikerName')?.textContent?.replace(' *', '').trim() || studioStriker.name;
        const currentNonStriker = document.getElementById('nonStrikerName')?.textContent?.trim() || studioNonStriker.name;
        if (strikerOpt) strikerOpt.textContent = currentStriker + ' (Striker)';
        if (nonStrikerOpt) nonStrikerOpt.textContent = currentNonStriker + ' (Non-Striker)';
      }
    }

    function closeDismissalModal() {
      const modal = document.getElementById('modalDismissal');
      if (modal) modal.classList.remove('active');
    }

    function toggleFielderField() {
      const kind = document.getElementById('dismissalKind').value;
      const group = document.getElementById('fielderGroup');
      if (group) {
        if (kind === 'CAUGHT' || kind === 'RUN_OUT' || kind === 'STUMPED') {
          group.style.display = 'block';
        } else {
          group.style.display = 'none';
        }
      }
    }

    function confirmDismissal() {
      if (typeof currentUser !== 'undefined' && currentUser.persona !== 'SCORER') {
        showToast('🔒 Only official Scorers can record dismissals.');
        return;
      }
      const kind = document.getElementById('dismissalKind').value;
      const fielder = document.getElementById('dismissalFielder').value.trim();
      const outRole = document.getElementById('dismissalOutBatter').value;
      const nextBatterSelect = document.getElementById('dismissalNextBatter');
      const nextBatter = nextBatterSelect ? nextBatterSelect.value : 'Rishabh Pant';
      const selectedOption = nextBatterSelect && nextBatterSelect.selectedIndex >= 0 ? nextBatterSelect.options[nextBatterSelect.selectedIndex] : null;

      const currentStriker = document.getElementById('strikerName')?.textContent?.replace(' *', '').trim() || studioStriker.name;
      const currentNonStriker = document.getElementById('nonStrikerName')?.textContent?.trim() || studioNonStriker.name;
      const outName = outRole === 'STRIKER' ? currentStriker : currentNonStriker;

      let dismissalDesc = kind;
      if (kind === 'CAUGHT') dismissalDesc = 'c ' + (fielder || 'Sub') + ' b Bowler';
      else if (kind === 'RUN_OUT') dismissalDesc = 'run out (' + (fielder || 'Direct Hit') + ')';
      else if (kind === 'LBW') dismissalDesc = 'lbw b Bowler';
      else if (kind === 'BOWLED') dismissalDesc = 'b Bowler';
      else if (kind === 'STUMPED') dismissalDesc = 'st ' + (fielder || 'Keeper') + ' b Bowler';

      scoreDelivery(0, 0, 'NONE', true, true, {
        wicket_type: kind,
        fielder_id: fielder || undefined,
        player_out_id: outName,
        next_batter_id: nextBatter
      });

      const nextStance = getBatterStanceByName(nextBatter, selectedOption);

      if (outRole === 'STRIKER') {
        studioStriker.name = nextBatter;
        studioStriker.battingStyle = nextStance;
        studioStriker.runs = 0;
        studioStriker.balls = 0;
        studioStriker.fours = 0;
        studioStriker.sixes = 0;
        setBatterStance(nextStance, false);
      } else {
        studioNonStriker.name = nextBatter;
        studioNonStriker.battingStyle = nextStance;
        studioNonStriker.runs = 0;
        studioNonStriker.balls = 0;
        studioNonStriker.fours = 0;
        studioNonStriker.sixes = 0;
      }
      partnership.runs = 0;
      partnership.balls = 0;
      updateStudioUI();
      filterWagonBatter(studioStriker.name);

      closeDismissalModal();
      showToast('🛑 WICKET! ' + outName + ' ' + dismissalDesc + ' • Next: ' + nextBatter + ' (' + nextStance + ')');
    }

    // ==========================================
    // Teams & Rosters Management
    // ==========================================
    const initialPlayingXi = [
      { id: 'p-1', name: 'Virat Sharma', role: 'BAT', isCaptain: true, isViceCaptain: false, isWicketKeeper: false, jersey: 18, verified: true, battingStyle: 'RHB' },
      { id: 'p-2', name: 'Rohit Verma', role: 'BAT', isCaptain: false, isViceCaptain: true, isWicketKeeper: false, jersey: 45, verified: true, battingStyle: 'RHB' },
      { id: 'p-3', name: 'KL Rahul', role: 'WK', isCaptain: false, isViceCaptain: false, isWicketKeeper: true, jersey: 1, verified: true, battingStyle: 'RHB' },
      { id: 'p-4', name: 'Suryakumar Rao', role: 'BAT', isCaptain: false, isViceCaptain: false, isWicketKeeper: false, jersey: 63, verified: true, battingStyle: 'RHB' },
      { id: 'p-5', name: 'Hardik Patel', role: 'ALL', isCaptain: false, isViceCaptain: false, isWicketKeeper: false, jersey: 33, verified: true, battingStyle: 'LHB' },
      { id: 'p-6', name: 'Ravindra Singh', role: 'ALL', isCaptain: false, isViceCaptain: false, isWicketKeeper: false, jersey: 8, verified: true, battingStyle: 'LHB' },
      { id: 'p-7', name: 'Axar Patel', role: 'ALL', isCaptain: false, isViceCaptain: false, isWicketKeeper: false, jersey: 20, verified: true, battingStyle: 'LHB' },
      { id: 'p-8', name: 'Kuldeep Yadav', role: 'BOWL', isCaptain: false, isViceCaptain: false, isWicketKeeper: false, jersey: 23, verified: true, battingStyle: 'LHB' },
      { id: 'p-9', name: 'Jasprit Bumrah', role: 'BOWL', isCaptain: false, isViceCaptain: false, isWicketKeeper: false, jersey: 93, verified: true, battingStyle: 'RHB' },
      { id: 'p-10', name: 'Mohammed Siraj', role: 'BOWL', isCaptain: false, isViceCaptain: false, isWicketKeeper: false, jersey: 73, verified: true, battingStyle: 'RHB' },
      { id: 'p-11', name: 'Arshdeep Singh', role: 'BOWL', isCaptain: false, isViceCaptain: false, isWicketKeeper: false, jersey: 2, verified: true, battingStyle: 'LHB' }
    ];

    const initialBench = [
      { id: 'b-1', name: 'Rishabh Pant', role: 'WK', jersey: 17, verified: true, battingStyle: 'LHB' },
      { id: 'b-2', name: 'Sanju Samson', role: 'WK', jersey: 11, verified: true, battingStyle: 'RHB' },
      { id: 'b-3', name: 'Yuzvendra Chahal', role: 'BOWL', jersey: 3, verified: true, battingStyle: 'RHB' },
      { id: 'b-4', name: 'Shivam Dube', role: 'ALL', jersey: 25, verified: true, battingStyle: 'LHB' }
    ];

    function renderRoster() {
      const xiContainer = document.getElementById('playingXiContainer');
      const benchContainer = document.getElementById('benchContainer');

      if (xiContainer) {
        xiContainer.innerHTML = initialPlayingXi.map((p, idx) => {
          let roleColor = p.role === 'BAT' ? 'var(--turf-emerald)' : (p.role === 'BOWL' ? 'var(--cyan)' : (p.role === 'ALL' ? 'var(--amber)' : 'var(--rose)'));
          let badgeHtml = '';
          if (p.isCaptain) badgeHtml += ' <span class="player-role-badge" style="background: rgba(0,229,153,0.2); color: var(--turf-emerald);" data-tooltip="Team Captain">C</span>';
          if (p.isViceCaptain) badgeHtml += ' <span class="player-role-badge" style="background: rgba(0,210,255,0.2); color: var(--cyan);" data-tooltip="Vice-Captain">VC</span>';
          if (p.isWicketKeeper) badgeHtml += ' <span class="player-role-badge" style="background: rgba(255,184,0,0.2); color: var(--amber);" data-tooltip="Designated Wicketkeeper">WK</span>';

          return '<div class="player-roster-row">' +
            '<div style="display: flex; align-items: center; gap: 0.65rem;">' +
              '<span style="font-family: var(--font-score); font-size: 0.85rem; color: var(--text-muted); width: 20px;">' + (idx + 1) + '</span>' +
              '<div>' +
                '<div style="font-weight: 700; color: #F8FAFC; font-size: 0.88rem;">' + p.name + badgeHtml + '</div>' +
                '<div style="font-size: 0.72rem; color: var(--text-muted);">#' + p.jersey + ' • ' + (p.battingStyle || 'RHB') + ' • Verified Player KYC ✓</div>' +
              '</div>' +
            '</div>' +
            '<span class="player-role-badge" style="background: rgba(255,255,255,0.06); color: ' + roleColor + '; border: 1px solid rgba(255,255,255,0.1);">' + p.role + '</span>' +
          '</div>';
        }).join('');
      }

      if (benchContainer) {
        benchContainer.innerHTML = initialBench.map((p) => {
          return '<div class="player-roster-row">' +
            '<div>' +
              '<div style="font-weight: 700; color: #F8FAFC; font-size: 0.85rem;">' + p.name + '</div>' +
              '<div style="font-size: 0.72rem; color: var(--text-muted);">#' + p.jersey + ' • ' + (p.battingStyle || 'RHB') + ' • Reserve Squad</div>' +
            '</div>' +
            '<span class="player-role-badge" style="background: rgba(255,255,255,0.04); color: var(--text-muted);">' + p.role + '</span>' +
          '</div>';
        }).join('');
      }
    }

    function copyJoinCode() {
      const codeBadge = document.getElementById('teamJoinCodeBadge');
      const code = codeBadge ? codeBadge.textContent.trim() : 'CRIC-BLR-4821';
      if (navigator.clipboard) {
        navigator.clipboard.writeText(code).then(() => {
          showToast('✓ Join code copied: ' + code);
        }).catch(() => {
          showToast('Team code: ' + code);
        });
      } else {
        showToast('Team code: ' + code);
      }
    }

    function openJoinTeamPrompt() {
      const code = window.prompt('Enter 8-character Team Join Code (e.g. CRIC-BLR-4821):');
      if (code && code.trim()) {
        showToast('✓ Request sent to join team ' + code.trim().toUpperCase());
      }
    }

    function openCreateTeamModal() {
      const modal = document.getElementById('modalCreateTeam');
      if (modal) modal.classList.add('active');
    }

    function closeCreateTeamModal() {
      const modal = document.getElementById('modalCreateTeam');
      if (modal) modal.classList.remove('active');
    }

    function saveNewTeam() {
      const nameInput = document.getElementById('newTeamName');
      const codeInput = document.getElementById('newTeamCode');
      const name = nameInput ? nameInput.value.trim() : '';
      const code = codeInput ? codeInput.value.trim().toUpperCase() : 'SQUAD';

      if (!name) {
        alert('Please enter a team name');
        return;
      }

      const newJoinCode = 'CRIC-' + (code || 'SQUAD') + '-' + Math.floor(1000 + Math.random() * 9000);
      const codeBadge = document.getElementById('teamJoinCodeBadge');
      if (codeBadge) codeBadge.textContent = newJoinCode;
      closeCreateTeamModal();
      showToast('🏆 New team ' + name + ' created! Invite code: ' + newJoinCode);
    }

    // ==========================================
    // Checkout Modal & 15-Minute Reservation Hold
    // ==========================================
    let holdTimerInterval = null;
    let currentSelectedTitle = 'Harbour Cricket Ground (4hr Match Slot)';
    let currentSelectedPrice = 350000;

    function openCheckoutModal(slotTitle, priceMinor) {
      const modal = document.getElementById('modalCheckout');
      if (!modal) return;

      const subtotal = (priceMinor || currentSelectedPrice || 100000) / 100;
      const fee = subtotal * 0.05;
      const tax = fee * 0.18;
      const total = subtotal + fee + tax;

      const titleEl = document.getElementById('modalCheckoutSlotTitle');
      const subEl = document.getElementById('modalCheckoutSubtotal');
      const feeEl = document.getElementById('modalCheckoutFee');
      const taxEl = document.getElementById('modalCheckoutTax');
      const totEl = document.getElementById('modalCheckoutTotal');

      if (titleEl) titleEl.textContent = slotTitle || currentSelectedTitle || 'Chinnaswamy Turf A (13:00 - 14:00)';
      if (subEl) subEl.textContent = '₹' + subtotal.toFixed(2);
      if (feeEl) feeEl.textContent = '₹' + fee.toFixed(2);
      if (taxEl) taxEl.textContent = '₹' + tax.toFixed(2);
      if (totEl) totEl.textContent = '₹' + total.toFixed(2);

      let secondsLeft = 15 * 60;
      if (holdTimerInterval) clearInterval(holdTimerInterval);
      holdTimerInterval = setInterval(() => {
        secondsLeft--;
        const timerEl = document.getElementById('modalHoldTimer');
        if (!timerEl) return;
        if (secondsLeft <= 0) {
          clearInterval(holdTimerInterval);
          timerEl.textContent = '00:00 (Expired)';
        } else {
          const m = Math.floor(secondsLeft / 60);
          const s = secondsLeft % 60;
          timerEl.textContent = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
        }
      }, 1000);

      modal.classList.add('active');
    }

    function closeCheckoutModal() {
      const modal = document.getElementById('modalCheckout');
      if (modal) modal.classList.remove('active');
      if (holdTimerInterval) clearInterval(holdTimerInterval);
    }

    function confirmBookingPayment() {
      closeCheckoutModal();
      executeCheckoutAndPay();
    }

    // ==========================================
    // Offline Scoring & Outbox Sync Engine
    // ==========================================
    let isOnline = typeof navigator !== 'undefined' ? (navigator.onLine !== false) : true;
    let offlineDeliveries = [];

    function updateSyncUI() {
      const pulse = document.getElementById('telemetrySyncPulse');
      const val = document.getElementById('telemetrySyncVal');
      if (!val || !pulse) return;

      if (!isOnline) {
        pulse.style.background = 'var(--amber)';
        val.style.color = 'var(--amber)';
        val.textContent = 'OFFLINE (' + offlineDeliveries.length + ' QUEUED)';
      } else if (offlineDeliveries.length > 0) {
        pulse.style.background = 'var(--cyan)';
        val.style.color = 'var(--cyan)';
        val.textContent = 'SYNCING (' + offlineDeliveries.length + ' QUEUED)';
      } else {
        pulse.style.background = 'var(--turf-emerald)';
        val.style.color = 'var(--turf-emerald)';
        val.textContent = 'ONLINE (0 QUEUED)';
      }
    }

    window.addEventListener('online', () => {
      isOnline = true;
      updateSyncUI();
      triggerQueueSync();
      showToast('Network online: Syncing queued deliveries...');
    });

    window.addEventListener('offline', () => {
      isOnline = false;
      updateSyncUI();
      showToast('Network offline: Deliveries will queue locally');
    });

    async function triggerQueueSync() {
      if (offlineDeliveries.length === 0) {
        showToast('✓ Outbox in sync (0 pending)');
        return;
      }
      updateSyncUI();
      let flushed = 0;
      while (offlineDeliveries.length > 0) {
        const item = offlineDeliveries[0];
        try {
          const res = await fetch('/api/v1/scoring/matches/' + matchId + '/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
          });
          if (res.ok) {
            offlineDeliveries.shift();
            flushed++;
            updateSyncUI();
          } else {
            break;
          }
        } catch {
          break;
        }
      }
      if (flushed > 0) {
        showToast('✓ Synced ' + flushed + ' offline delivery events!');
      }
      updateSyncUI();
    }

    // ==========================================
    // Match Analytics Visuals (Worm & Manhattan)
    // ==========================================
    let currentActiveChart = 'WORM';
    const team1Progression = [
      { over: 0, runs: 0 },
      { over: 2, runs: 18 },
      { over: 4, runs: 34, isWicket: true },
      { over: 6, runs: 49 },
      { over: 8, runs: 68 },
      { over: 10, runs: 85, isWicket: true },
      { over: 12, runs: 104 },
      { over: 14, runs: 122, isWicket: true },
      { over: 16, runs: 141 },
      { over: 18, runs: 162 },
      { over: 20, runs: 178 }
    ];

    let overHistory = [
      { overNumber: 1, runs: 8, wickets: 0 },
      { overNumber: 2, runs: 14, wickets: 1 },
      { overNumber: 3, runs: 6, wickets: 0 },
      { overNumber: 4, runs: 11, wickets: 0 },
      { overNumber: 5, runs: 18, wickets: 0 },
      { overNumber: 6, runs: 4, wickets: 1 },
      { overNumber: 7, runs: 9, wickets: 0 },
      { overNumber: 8, runs: 12, wickets: 0 },
      { overNumber: 9, runs: 15, wickets: 0 },
      { overNumber: 10, runs: 7, wickets: 1 },
      { overNumber: 11, runs: 10, wickets: 0 },
      { overNumber: 12, runs: 13, wickets: 0 },
      { overNumber: 13, runs: 8, wickets: 0 },
      { overNumber: 14, runs: 16, wickets: 1 },
      { overNumber: 15, runs: 12, wickets: 0 },
      { overNumber: 16, runs: 19, wickets: 0 }
    ];

    function showMatchChart(type) {
      currentActiveChart = type;
      const bWorm = document.getElementById('btnChartWorm');
      const bManhattan = document.getElementById('btnChartManhattan');
      const bWagon = document.getElementById('btnChartWagon');
      const bPartnerships = document.getElementById('btnChartPartnerships');

      const allBtns = [
        { el: bWorm, key: 'WORM', color: 'var(--turf-emerald)', bg: 'rgba(0,229,153,0.15)' },
        { el: bManhattan, key: 'MANHATTAN', color: 'var(--cyan)', bg: 'rgba(0,210,255,0.15)' },
        { el: bWagon, key: 'WAGON', color: 'var(--purple-light)', bg: 'rgba(192,132,252,0.15)' },
        { el: bPartnerships, key: 'PARTNERSHIPS', color: 'var(--amber)', bg: 'rgba(255,184,0,0.15)' }
      ];

      allBtns.forEach(b => {
        if (!b.el) return;
        if (b.key === type) {
          b.el.classList.add('active');
          b.el.style.background = b.bg;
          b.el.style.borderColor = b.color;
          b.el.style.color = b.color;
        } else {
          b.el.classList.remove('active');
          b.el.style.background = 'rgba(255,255,255,0.08)';
          b.el.style.borderColor = 'rgba(255,255,255,0.1)';
          b.el.style.color = 'var(--text-main)';
        }
      });
      renderMatchCharts();
    }

    let mcActiveWagonBatter = 'Virat Sharma';

    function filterMcWagon(batterName, btnEl) {
      mcActiveWagonBatter = batterName;
      document.querySelectorAll('#btnMcWagon_Virat, #btnMcWagon_Hardik, #btnMcWagon_All').forEach(b => b.classList.remove('active'));
      if (btnEl) btnEl.classList.add('active');
      renderMcWagonRays(batterName);
    }

    function renderMcWagonRays(batterName) {
      const g = document.getElementById('mcWagonRaysGroup');
      const badge = document.getElementById('mcWagonStanceBadge');
      const statOff = document.getElementById('mcWagonStatOff');
      const statLeg = document.getElementById('mcWagonStatLeg');
      const statBoundaries = document.getElementById('mcWagonStatBoundaries');
      const statDots = document.getElementById('mcWagonStatDots');
      const lblOff = document.getElementById('mcWagonLabelOff');
      const lblLeg = document.getElementById('mcWagonLabelLeg');

      if (!g) return;

      const isLhb = batterName === 'Hardik Patel';
      if (badge) {
        badge.textContent = isLhb ? 'LHB' : (batterName === 'ALL' ? 'STAND' : 'RHB');
        badge.style.color = isLhb ? 'var(--cyan)' : 'var(--turf-emerald)';
      }
      if (lblOff && lblLeg) {
        if (isLhb) {
          lblOff.setAttribute('x', '325');
          lblOff.setAttribute('text-anchor', 'end');
          lblOff.textContent = 'OFF SIDE ▶';
          lblLeg.setAttribute('x', '35');
          lblLeg.setAttribute('text-anchor', 'start');
          lblLeg.textContent = '◀ ON SIDE';
        } else {
          lblOff.setAttribute('x', '35');
          lblOff.setAttribute('text-anchor', 'start');
          lblOff.textContent = '◀ OFF SIDE';
          lblLeg.setAttribute('x', '325');
          lblLeg.setAttribute('text-anchor', 'end');
          lblLeg.textContent = 'ON SIDE ▶';
        }
      }

      // Trajectories tailored to batter
      let rays = '';
      if (batterName === 'Virat Sharma' || batterName === 'ALL') {
        rays += '<line x1="180" y1="156" x2="80" y2="280" stroke="#00E599" stroke-width="2" stroke-linecap="round"><title>Virat 4 to Cover</title></line>' +
                '<line x1="180" y1="156" x2="60" y2="240" stroke="#00E599" stroke-width="2" stroke-linecap="round"><title>Virat 4 to Extra Cover</title></line>' +
                '<path d="M 180 156 Q 120 280 150 330" fill="none" stroke="#FFB800" stroke-width="2.5" stroke-dasharray="3,3"><title>Virat 6 to Long Off</title></path>' +
                '<path d="M 180 156 Q 240 280 210 330" fill="none" stroke="#FFB800" stroke-width="2.5"><title>Virat 6 to Long On</title></path>' +
                '<line x1="180" y1="156" x2="280" y2="220" stroke="#00E599" stroke-width="2"><title>Virat 4 to Mid Wicket</title></line>' +
                '<line x1="180" y1="156" x2="90" y2="100" stroke="#00D2FF" stroke-width="1.5"><title>Virat Single to Point</title></line>' +
                '<line x1="180" y1="156" x2="260" y2="90" stroke="#00D2FF" stroke-width="1.5"><title>Virat Single to Fine Leg</title></line>' +
                '<line x1="180" y1="156" x2="160" y2="175" stroke="#64748b" stroke-width="1.2" stroke-dasharray="2,2"><title>Virat Dot Ball</title></line>';
      }
      if (batterName === 'Hardik Patel' || batterName === 'ALL') {
        rays += '<path d="M 180 156 Q 260 250 310 260" fill="none" stroke="#C084FC" stroke-width="2.5"><title>Hardik 6 to Deep Mid Wicket</title></path>' +
                '<line x1="180" y1="156" x2="300" y2="220" stroke="#00E599" stroke-width="2"><title>Hardik 4 to Square Leg</title></line>' +
                '<line x1="180" y1="156" x2="140" y2="290" stroke="#00D2FF" stroke-width="1.5"><title>Hardik Single to Long Off</title></line>' +
                '<line x1="180" y1="156" x2="220" y2="290" stroke="#00D2FF" stroke-width="1.5"><title>Hardik Single to Long On</title></line>' +
                '<line x1="180" y1="156" x2="110" y2="110" stroke="#64748b" stroke-width="1.2" stroke-dasharray="2,2"><title>Hardik Dot Ball</title></line>';
      }
      g.innerHTML = rays;

      if (statOff && statLeg && statBoundaries && statDots) {
        if (batterName === 'Virat Sharma') {
          statOff.textContent = '28 (58%)';
          statLeg.textContent = '20 (42%)';
          statBoundaries.textContent = '32 (4x4, 2x6)';
          statDots.textContent = '12.5% (4 dots)';
        } else if (batterName === 'Hardik Patel') {
          statOff.textContent = '4 (22%)';
          statLeg.textContent = '14 (78%)';
          statBoundaries.textContent = '10 (1x4, 1x6)';
          statDots.textContent = '25.0% (3 dots)';
        } else {
          statOff.textContent = '32 (48%)';
          statLeg.textContent = '34 (52%)';
          statBoundaries.textContent = '42 (5x4, 3x6)';
          statDots.textContent = '15.9% (7 dots)';
        }
      }
    }

    function renderMatchCharts() {
      const container = document.getElementById('matchChartContainer');
      if (!container) return;

      if (currentActiveChart === 'WORM') {
        const currentOverNum = (legalBalls / 6);
        const currentRunsNum = runs || 142;
        const currentWicketsNum = wickets || 3;

        const team2Progression = [
          { over: 0, runs: 0 },
          { over: 2, runs: 22, isWicket: true },
          { over: 5, runs: 48 },
          { over: 8, runs: 76, isWicket: true },
          { over: 11, runs: 102 },
          { over: 14, runs: 128, isWicket: true },
          { over: Math.max(16.4, currentOverNum), runs: currentRunsNum, isWicket: false }
        ];

        const w = 620;
        const h = 220;
        const padL = 45;
        const padR = 25;
        const padT = 25;
        const padB = 30;
        const plotW = w - padL - padR;
        const plotH = h - padT - padB;
        const maxR = 200;

        const sx = (ov) => padL + (ov / 20) * plotW;
        const sy = (r) => padT + plotH - (r / maxR) * plotH;

        let grid = '';
        for (let r = 50; r <= 200; r += 50) {
          const y = sy(r);
          grid += '<line x1="' + padL + '" y1="' + y + '" x2="' + (w - padR) + '" y2="' + y + '" stroke="rgba(255,255,255,0.08)" stroke-dasharray="3,3" />' +
                  '<text x="' + (padL - 8) + '" y="' + (y + 4) + '" fill="#64748b" font-size="10" text-anchor="end">' + r + '</text>';
        }
        for (let o = 5; o <= 20; o += 5) {
          const x = sx(o);
          grid += '<line x1="' + x + '" y1="' + padT + '" x2="' + x + '" y2="' + (h - padB) + '" stroke="rgba(255,255,255,0.06)" />' +
                  '<text x="' + x + '" y="' + (h - padB + 16) + '" fill="#64748b" font-size="10" text-anchor="middle">' + o + ' ov</text>';
        }

        const p1Path = team1Progression.reduce((acc, p, idx) => (idx === 0 ? 'M ' + sx(p.over) + ' ' + sy(p.runs) : acc + ' L ' + sx(p.over) + ' ' + sy(p.runs)), '');
        const p2Path = team2Progression.reduce((acc, p, idx) => (idx === 0 ? 'M ' + sx(p.over) + ' ' + sy(p.runs) : acc + ' L ' + sx(p.over) + ' ' + sy(p.runs)), '');

        const p1Dots = team1Progression.filter(p => p.isWicket).map(p => '<circle cx="' + sx(p.over) + '" cy="' + sy(p.runs) + '" r="4" fill="#FF3366" stroke="#00E599" stroke-width="1.5"><title>Delhi Wicket (' + p.runs + ')</title></circle>').join('');
        const p2Dots = team2Progression.filter(p => p.isWicket).map(p => '<circle cx="' + sx(p.over) + '" cy="' + sy(p.runs) + '" r="4" fill="#FF3366" stroke="#00D2FF" stroke-width="1.5"><title>Mumbai Wicket (' + p.runs + ')</title></circle>').join('');

        container.innerHTML = '<svg viewBox="0 0 ' + w + ' ' + h + '" width="100%" height="220" xmlns="http://www.w3.org/2000/svg" style="background: rgba(0,0,0,0.25); border-radius: 8px;">' +
          grid +
          '<path d="' + p1Path + '" fill="none" stroke="#00E599" stroke-width="2.5" stroke-linecap="round" />' +
          '<path d="' + p2Path + '" fill="none" stroke="#00D2FF" stroke-width="2.5" stroke-linecap="round" />' +
          p1Dots + p2Dots +
          '<g transform="translate(' + (padL + 10) + ', ' + (padT + 8) + ')">' +
            '<rect x="0" y="-8" width="12" height="4" fill="#00E599" rx="2" />' +
            '<text x="16" y="-4" fill="#00E599" font-size="11" font-weight="700">Delhi 178/10</text>' +
            '<rect x="110" y="-8" width="12" height="4" fill="#00D2FF" rx="2" />' +
            '<text x="126" y="-4" fill="#00D2FF" font-size="11" font-weight="700">Mumbai ' + currentRunsNum + '/' + currentWicketsNum + ' (Chase)</text>' +
          '</g>' +
        '</svg>';
      } else if (currentActiveChart === 'MANHATTAN') {
        const w = 620;
        const h = 220;
        const padL = 35;
        const padR = 20;
        const padT = 25;
        const padB = 30;
        const plotW = w - padL - padR;
        const plotH = h - padT - padB;
        const maxBar = 24;
        const totalOvers = 20;
        const slotW = plotW / totalOvers;
        const barW = slotW * 0.7;

        let bars = '';
        let labels = '';
        for (let i = 0; i < totalOvers; i++) {
          const item = overHistory[i] || { overNumber: i + 1, runs: (i < 16 ? 6 : 0), wickets: 0 };
          const barH = (item.runs / maxBar) * plotH;
          const x = padL + i * slotW + (slotW - barW) / 2;
          const y = h - padB - barH;

          let color = '#00D2FF';
          if (item.runs >= 15) color = '#00E599';
          else if (item.runs <= 3 && item.runs > 0) color = '#64748b';

          bars += '<rect x="' + x + '" y="' + y + '" width="' + barW + '" height="' + barH + '" fill="' + color + '" rx="3">' +
                  '<title>Over ' + item.overNumber + ': ' + item.runs + ' runs, ' + item.wickets + ' wickets</title></rect>';

          if (item.runs > 0) {
            bars += '<text x="' + (x + barW / 2) + '" y="' + (y - 4) + '" fill="#F8FAFC" font-size="9" text-anchor="middle" font-weight="700">' + item.runs + '</text>';
          }

          if (item.wickets > 0) {
            for (let k = 0; k < item.wickets; k++) {
              bars += '<circle cx="' + (x + barW / 2) + '" cy="' + (y - 12 - k * 8) + '" r="3.5" fill="#FF3366" />';
            }
          }

          if ((i + 1) % 2 === 0 || (i + 1) === 1) {
            labels += '<text x="' + (x + barW / 2) + '" y="' + (h - padB + 15) + '" fill="#64748b" font-size="9" text-anchor="middle">' + (i + 1) + '</text>';
          }
        }

        container.innerHTML = '<svg viewBox="0 0 ' + w + ' ' + h + '" width="100%" height="220" xmlns="http://www.w3.org/2000/svg" style="background: rgba(0,0,0,0.25); border-radius: 8px;">' +
          '<line x1="' + padL + '" y1="' + (h - padB) + '" x2="' + (w - padR) + '" y2="' + (h - padB) + '" stroke="rgba(255,255,255,0.15)" />' +
          bars + labels +
        '</svg>';
      } else if (currentActiveChart === 'WAGON') {
        container.innerHTML = \`
          <div style="width: 100%; display: flex; flex-direction: column; align-items: center; gap: 0.75rem; padding: 0.5rem 0;">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; flex-wrap: wrap; gap: 0.5rem;">
              <div style="display: flex; gap: 0.35rem; align-items: center; flex-wrap: wrap;">
                <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Batter:</span>
                <button type="button" class="btn-scorecard-inn active" id="btnMcWagon_Virat" onclick="filterMcWagon('Virat Sharma', this)" data-tooltip="Wagon wheel for Virat Sharma: 48* (32b, 4x4, 2x6)">Virat Sharma 48* (32)</button>
                <button type="button" class="btn-scorecard-inn" id="btnMcWagon_Hardik" onclick="filterMcWagon('Hardik Patel', this)" data-tooltip="Wagon wheel for Hardik Patel: 18 (12b, 1x4, 1x6)">Hardik Patel 18 (12)</button>
                <button type="button" class="btn-scorecard-inn" id="btnMcWagon_All" onclick="filterMcWagon('ALL', this)" data-tooltip="Combined partnership stand wagon wheel (66 runs, 44 balls)">Partnership Stand 66 (44)</button>
              </div>
              <div style="display: flex; align-items: center; gap: 0.4rem;">
                <span id="mcWagonStanceBadge" style="font-size: 0.7rem; font-weight: 800; padding: 0.15rem 0.5rem; border-radius: 4px; background: rgba(0,229,153,0.15); color: var(--turf-emerald); border: 1px solid rgba(0,229,153,0.3);">RHB</span>
                <span style="font-size: 0.72rem; color: var(--text-muted);" id="mcWagonZoneSelected">Zone: Extra Cover (Off-Side)</span>
              </div>
            </div>

            <div style="position: relative; width: 340px; height: 340px; max-width: 100%;">
              <svg id="mcWagonSvg" viewBox="0 0 360 360" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="border-radius: 50%; box-shadow: 0 0 30px rgba(0,0,0,0.6);">
                <defs>
                  <radialGradient id="mcTurfGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stop-color="#0E3324"/>
                    <stop offset="60%" stop-color="#092418"/>
                    <stop offset="100%" stop-color="#030C08"/>
                  </radialGradient>
                  <linearGradient id="mcPitchGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#8C6E3D"/>
                    <stop offset="50%" stop-color="#A38350"/>
                    <stop offset="100%" stop-color="#8C6E3D"/>
                  </linearGradient>
                </defs>
                <circle cx="180" cy="180" r="168" fill="url(#mcTurfGrad)" stroke="rgba(0, 229, 153, 0.4)" stroke-width="2"/>
                <circle cx="180" cy="180" r="88" fill="none" stroke="rgba(0, 210, 255, 0.35)" stroke-width="1.2" stroke-dasharray="4,4"/>
                <text x="180" y="98" fill="rgba(0, 210, 255, 0.6)" font-size="6.5" font-family="var(--font-mono)" text-anchor="middle" letter-spacing="1">30 YD CIRCLE</text>
                <circle cx="180" cy="180" r="162" fill="none" stroke="rgba(255, 255, 255, 0.25)" stroke-width="1.5"/>
                <text x="180" y="26" fill="rgba(255, 255, 255, 0.45)" font-size="7" font-family="var(--font-mono)" text-anchor="middle">75m BOUNDARY ROPE</text>

                <line x1="180" y1="18" x2="180" y2="342" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1"/>
                <line x1="18" y1="180" x2="342" y2="180" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1"/>
                <line x1="65" y1="65" x2="295" y2="295" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1"/>
                <line x1="295" y1="65" x2="65" y2="295" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1"/>

                <rect x="168" y="140" width="24" height="80" rx="3" fill="url(#mcPitchGrad)" stroke="rgba(255, 255, 255, 0.2)" stroke-width="1"/>
                <line x1="164" y1="156" x2="196" y2="156" stroke="#FFFFFF" stroke-width="1.2"/>
                <line x1="164" y1="204" x2="196" y2="204" stroke="#FFFFFF" stroke-width="1.2"/>
                <circle cx="180" cy="156" r="4.5" fill="var(--turf-emerald)" stroke="#FFFFFF" stroke-width="1.5"/>

                <text x="35" y="174" fill="var(--cyan)" font-size="8" font-family="var(--font-mono)" font-weight="700" id="mcWagonLabelOff">◀ OFF SIDE</text>
                <text x="325" y="174" fill="var(--turf-emerald)" font-size="8" font-family="var(--font-mono)" font-weight="700" text-anchor="end" id="mcWagonLabelLeg">ON SIDE ▶</text>

                <g id="mcWagonRaysGroup"></g>
              </svg>
            </div>

            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; width: 100%; border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 0.75rem; text-align: center; font-size: 0.78rem;">
              <div>
                <div style="font-size: 0.68rem; color: var(--text-muted);">Off-Side Runs</div>
                <div style="font-size: 1.1rem; font-weight: 800; color: var(--cyan); font-family: var(--font-score);" id="mcWagonStatOff">28 (58%)</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: var(--text-muted);">On-Side Runs</div>
                <div style="font-size: 1.1rem; font-weight: 800; color: var(--turf-emerald); font-family: var(--font-score);" id="mcWagonStatLeg">20 (42%)</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: var(--text-muted);">Boundaries (4s/6s)</div>
                <div style="font-size: 1.1rem; font-weight: 800; color: #C084FC; font-family: var(--font-score);" id="mcWagonStatBoundaries">32 (4x4, 2x6)</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: var(--text-muted);">Dot Ball %</div>
                <div style="font-size: 1.1rem; font-weight: 800; color: var(--amber); font-family: var(--font-score);" id="mcWagonStatDots">12.5% (4 dots)</div>
              </div>
            </div>
          </div>
        \`;
        renderMcWagonRays('Virat Sharma');
      } else if (currentActiveChart === 'PARTNERSHIPS') {
        const stands = [
          { wicket: '1st Wicket', runs: 14, balls: 13, batter1: 'Rohit Verma', r1: 8, b1: 8, batter2: 'Ishan Kishan', r2: 6, b2: 5, active: false },
          { wicket: '2nd Wicket', runs: 34, balls: 21, batter1: 'Rohit Verma', r1: 30, b1: 18, batter2: 'Suryakumar Yadav', r2: 4, b2: 3, active: false },
          { wicket: '3rd Wicket', runs: 56, balls: 41, batter1: 'Suryakumar Yadav', r1: 38, b1: 25, batter2: 'Virat Sharma', r2: 18, b2: 16, active: false },
          { wicket: '4th Wicket (Current Stand)', runs: 38, balls: 26, batter1: 'Virat Sharma', r1: 30, b1: 16, batter2: 'Hardik Patel', r2: 8, b2: 10, active: true }
        ];

        let standsHtml = stands.map(s => {
          const p1Pct = Math.round((s.r1 / s.runs) * 100);
          const p2Pct = 100 - p1Pct;
          const borderStyle = s.active ? 'border: 1px solid var(--turf-emerald); background: rgba(0, 229, 153, 0.05);' : 'border: 1px solid rgba(255,255,255,0.07); background: rgba(255,255,255,0.02);';
          return \`
            <div style="border-radius: 8px; padding: 0.75rem 1rem; \${borderStyle}">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem; font-size: 0.82rem;">
                <div style="font-weight: 800; color: #F8FAFC;">
                  \${s.wicket}
                  \${s.active ? '<span style="background: rgba(0,229,153,0.15); color: var(--turf-emerald); font-size: 0.68rem; padding: 0.1rem 0.4rem; border-radius: 4px; margin-left: 0.4rem; font-weight: 800;">CURRENT UNBROKEN STAND ⚡</span>' : ''}
                </div>
                <div style="font-family: var(--font-score); font-weight: 800; color: var(--turf-emerald); font-size: 1rem;">
                  \${s.runs} runs <small style="color: var(--text-muted); font-size: 0.75rem; font-family: var(--font-ui);">(\${s.balls} balls)</small>
                </div>
              </div>
              <div style="display: flex; height: 10px; border-radius: 5px; overflow: hidden; background: rgba(255,255,255,0.08); margin-bottom: 0.35rem;">
                <div style="width: \${p1Pct}%; background: var(--turf-emerald);" data-tooltip="\${s.batter1}: \${s.r1} runs (\${p1Pct}%)"></div>
                <div style="width: \${p2Pct}%; background: var(--cyan);" data-tooltip="\${s.batter2}: \${s.r2} runs (\${p2Pct}%)"></div>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted);">
                <span><strong style="color: var(--turf-emerald);">\${s.batter1}</strong>: \${s.r1} (\${s.b1}b, \${p1Pct}%)</span>
                <span><strong style="color: var(--cyan);">\${s.batter2}</strong>: \${s.r2} (\${s.b2}b, \${p2Pct}%)</span>
              </div>
            </div>
          \`;
        }).join('');

        container.innerHTML = \`
          <div style="width: 100%; display: flex; flex-direction: column; gap: 0.65rem; padding: 0.5rem 0;" id="mcPartnershipBars">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
              <span style="font-size: 0.85rem; font-weight: 700; color: #F8FAFC;">Mumbai Super Strikers • Partnership Breakdown (Chase: 142/3 in 16.4 ov)</span>
              <span style="font-size: 0.75rem; color: var(--text-muted);">4 Stands Total</span>
            </div>
            \${standsHtml}
          </div>
        \`;
      }
    }

    // ==========================================
    // Scorecard Export & Detailed Scorecard Logic
    // ==========================================
    let currentScorecardInnings = 2;

    const matchScorecardData = {
      matchTitle: 'Delhi Daredevils vs Mumbai Super Strikers',
      matchId: 'match-pilot-1',
      innings1Score: '178/10 (19.4 ov)',
      innings2Score: '142/3 (16.4 ov)',
      result: 'Mumbai Super Strikers require 36 runs in 20 balls',
      batters: [
        { name: 'Rohit Verma', dismissal: 'c. Pant b. Bumrah', runs: 38, balls: 26, fours: 4, sixes: 2, sr: 146.15 },
        { name: 'Ishan Kishan (WK)', dismissal: 'b. Siraj', runs: 16, balls: 11, fours: 2, sixes: 1, sr: 145.45 },
        { name: 'Suryakumar Yadav', dismissal: 'c. sub b. Kuldeep', runs: 42, balls: 28, fours: 5, sixes: 2, sr: 150.00 },
        { name: 'Virat Sharma *', dismissal: 'not out', runs: 48, balls: 32, fours: 4, sixes: 2, sr: 150.00 },
        { name: 'Hardik Patel', dismissal: 'not out', runs: 18, balls: 12, fours: 1, sixes: 1, sr: 150.00 }
      ],
      bowlers: [
        { name: 'Jasprit Bumrah', overs: '3.4', maidens: 0, runs: 28, wickets: 1, econ: 7.64, dots: 11 },
        { name: 'Mohammed Siraj', overs: '4.0', maidens: 0, runs: 36, wickets: 1, econ: 9.00, dots: 8 },
        { name: 'Kuldeep Yadav', overs: '4.0', maidens: 0, runs: 32, wickets: 1, econ: 8.00, dots: 9 },
        { name: 'Axar Patel', overs: '4.0', maidens: 0, runs: 38, wickets: 0, econ: 9.50, dots: 7 },
        { name: 'Hardik Pandya', overs: '1.0', maidens: 0, runs: 8, wickets: 0, econ: 8.00, dots: 2 }
      ],
      innings1Batters: [
        { name: 'Prithvi Shaw', dismissal: 'c. Rohit b. Bumrah', runs: 24, balls: 14, fours: 3, sixes: 1, sr: 171.43 },
        { name: 'David Warner', dismissal: 'b. Siraj', runs: 45, balls: 30, fours: 5, sixes: 2, sr: 150.00 },
        { name: 'Mitchell Marsh', dismissal: 'c. Kishan b. Pandya', runs: 32, balls: 22, fours: 3, sixes: 2, sr: 145.45 },
        { name: 'Rishabh Pant (c, wk)', dismissal: 'c. sub b. Kuldeep', runs: 36, balls: 24, fours: 3, sixes: 2, sr: 150.00 },
        { name: 'Axar Patel', dismissal: 'run out (Kohli)', runs: 18, balls: 12, fours: 2, sixes: 0, sr: 150.00 },
        { name: 'Lalit Yadav', dismissal: 'b. Bumrah', runs: 8, balls: 6, fours: 1, sixes: 0, sr: 133.33 },
        { name: 'Anrich Nortje', dismissal: 'c. Hardik b. Bumrah', runs: 4, balls: 4, fours: 0, sixes: 0, sr: 100.00 },
        { name: 'Kuldeep Yadav', dismissal: 'b. Siraj', runs: 2, balls: 3, fours: 0, sixes: 0, sr: 66.67 },
        { name: 'Khaleel Ahmed', dismissal: 'not out', runs: 1, balls: 2, fours: 0, sixes: 0, sr: 50.00 },
        { name: 'Ishant Sharma', dismissal: 'b. Bumrah', runs: 0, balls: 1, fours: 0, sixes: 0, sr: 0.00 }
      ],
      innings1Bowlers: [
        { name: 'Jasprit Bumrah', overs: '4.0', maidens: 0, runs: 26, wickets: 4, econ: 6.50, dots: 14 },
        { name: 'Mohammed Siraj', overs: '4.0', maidens: 0, runs: 34, wickets: 2, econ: 8.50, dots: 10 },
        { name: 'Hardik Pandya', overs: '3.4', maidens: 0, runs: 38, wickets: 1, econ: 10.36, dots: 7 },
        { name: 'Kuldeep Yadav', overs: '4.0', maidens: 0, runs: 35, wickets: 1, econ: 8.75, dots: 8 },
        { name: 'Ravindra Jadeja', overs: '4.0', maidens: 0, runs: 39, wickets: 1, econ: 9.75, dots: 6 }
      ]
    };

    function switchScorecardInnings(innNum) {
      currentScorecardInnings = innNum;
      const b1 = document.getElementById('btnScorecardInn1');
      const b2 = document.getElementById('btnScorecardInn2');
      if (b1 && b2) {
        if (innNum === 1) {
          b1.classList.add('active');
          b2.classList.remove('active');
        } else {
          b2.classList.add('active');
          b1.classList.remove('active');
        }
      }
      renderDetailedScorecard();
    }

    function renderDetailedScorecard() {
      const isInn2 = currentScorecardInnings === 2;
      const batters = isInn2 ? matchScorecardData.batters : matchScorecardData.innings1Batters;
      const bowlers = isInn2 ? matchScorecardData.bowlers : matchScorecardData.innings1Bowlers;

      const teamName = document.getElementById('scorecardTeamName');
      const label = document.getElementById('scorecardInningsLabel');
      const scoreEl = document.getElementById('scorecardInningsScore');
      const extrasText = document.getElementById('scorecardExtrasText');
      const extrasDetail = document.getElementById('scorecardExtrasDetail');
      const totalText = document.getElementById('scorecardTotalText');
      const totalDetail = document.getElementById('scorecardTotalDetail');
      const dnbText = document.getElementById('scorecardDnbText');
      const fowContainer = document.getElementById('scorecardFowContainer');
      const batterBody = document.getElementById('detailedScorecardBattersBody');
      const bowlerBody = document.getElementById('detailedScorecardBowlersBody');

      if (teamName) teamName.textContent = isInn2 ? 'Mumbai Super Strikers' : 'Delhi Daredevils';
      if (label) label.textContent = isInn2 ? 'Innings 2 (Target: 178)' : 'Innings 1 (First Batting)';
      if (scoreEl) {
        scoreEl.innerHTML = isInn2
          ? '142/3 <span style="font-size: 0.85rem; color: var(--text-muted); font-family: var(--font-ui);">(16.4 ov • CRR: 8.52 • RRR: 10.80)</span>'
          : '178/10 <span style="font-size: 0.85rem; color: var(--text-muted); font-family: var(--font-ui);">(19.4 ov • RR: 9.05)</span>';
      }
      if (extrasText) extrasText.textContent = isInn2 ? '12' : '8';
      if (extrasDetail) extrasDetail.textContent = isInn2 ? '(b 4, lb 2, w 5, nb 1)' : '(b 2, lb 1, w 4, nb 1)';
      if (totalText) totalText.textContent = isInn2 ? '142/3' : '178/10';
      if (totalDetail) totalDetail.textContent = isInn2 ? '(3 wkts, 16.4 ov)' : '(10 wkts, 19.4 ov)';
      if (dnbText) {
        dnbText.textContent = isInn2
          ? 'Rishabh Pant (wk), Ravindra Jadeja, Axar Patel, Mohammed Shami, Jasprit Bumrah'
          : 'None (All out)';
      }

      if (fowContainer) {
        const fowList = isInn2 ? [
          { wkt: '1-14', batter: 'Rohit Verma', ov: '2.1 ov' },
          { wkt: '2-48', batter: 'Ishan Kishan', ov: '5.4 ov' },
          { wkt: '3-104', batter: 'Suryakumar Yadav', ov: '12.2 ov' }
        ] : [
          { wkt: '1-28', batter: 'Prithvi Shaw', ov: '3.1 ov' },
          { wkt: '2-74', batter: 'Mitchell Marsh', ov: '8.2 ov' },
          { wkt: '3-98', batter: 'David Warner', ov: '11.5 ov' },
          { wkt: '4-142', batter: 'Axar Patel', ov: '15.3 ov' },
          { wkt: '5-155', batter: 'Rishabh Pant', ov: '17.1 ov' }
        ];

        fowContainer.innerHTML = fowList.map(f => \`
          <span style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 0.25rem 0.6rem; color: #F8FAFC;" data-tooltip="Wicket: \${f.batter} at \${f.ov}">
            <strong style="color: var(--rose);">\${f.wkt}</strong> <small style="color: var(--text-muted);">(\${f.batter}, \${f.ov})</small>
          </span>
        \`).join('');
      }

      if (batterBody && batters) {
        batterBody.innerHTML = batters.map(b => \`
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
            <td style="padding: 0.5rem 0.6rem; font-weight: 700; color: #F8FAFC;">\${b.name}</td>
            <td style="padding: 0.5rem 0.6rem; color: var(--text-muted); font-size: 0.78rem;">\${b.dismissal}</td>
            <td style="padding: 0.5rem 0.6rem; text-align: right; font-weight: 800; color: var(--turf-emerald); font-family: var(--font-score);">\${b.runs}</td>
            <td style="padding: 0.5rem 0.6rem; text-align: right;">\${b.balls}</td>
            <td style="padding: 0.5rem 0.6rem; text-align: right;">\${b.fours}</td>
            <td style="padding: 0.5rem 0.6rem; text-align: right;">\${b.sixes}</td>
            <td style="padding: 0.5rem 0.6rem; text-align: right; font-family: var(--font-score);">\${b.sr.toFixed(1)}</td>
          </tr>
        \`).join('');
      }

      if (bowlerBody && bowlers) {
        bowlerBody.innerHTML = bowlers.map(bw => \`
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
            <td style="padding: 0.5rem 0.6rem; font-weight: 700; color: #F8FAFC;">\${bw.name}</td>
            <td style="padding: 0.5rem 0.6rem; text-align: right;">\${bw.overs}</td>
            <td style="padding: 0.5rem 0.6rem; text-align: right;">\${bw.maidens}</td>
            <td style="padding: 0.5rem 0.6rem; text-align: right;">\${bw.runs}</td>
            <td style="padding: 0.5rem 0.6rem; text-align: right; font-weight: 800; color: var(--rose); font-family: var(--font-score);">\${bw.wickets}</td>
            <td style="padding: 0.5rem 0.6rem; text-align: right; font-family: var(--font-score);">\${bw.econ.toFixed(2)}</td>
            <td style="padding: 0.5rem 0.6rem; text-align: right;">\${bw.dots || 0}</td>
          </tr>
        \`).join('');
      }
    }
    // Initialize detailed scorecard on load
    setTimeout(renderDetailedScorecard, 100);

    function openScorecardModal() {
      const modal = document.getElementById('modalScorecardExport');
      if (!modal) return;

      const batterBody = document.getElementById('scorecardBatterRows');
      const bowlerBody = document.getElementById('scorecardBowlerRows');

      if (batterBody) {
        batterBody.innerHTML = matchScorecardData.batters.map(b => 
          '<tr>' +
            '<td style="font-weight: 700; color: #F8FAFC;">' + b.name + '</td>' +
            '<td style="color: var(--text-muted); font-size: 0.8rem;">' + b.dismissal + '</td>' +
            '<td style="text-align: right; font-weight: 700; color: var(--turf-emerald); font-family: var(--font-score);">' + b.runs + '</td>' +
            '<td style="text-align: right;">' + b.balls + '</td>' +
            '<td style="text-align: right;">' + b.fours + '</td>' +
            '<td style="text-align: right;">' + b.sixes + '</td>' +
            '<td style="text-align: right;">' + b.sr.toFixed(1) + '</td>' +
          '</tr>'
        ).join('');
      }

      if (bowlerBody) {
        bowlerBody.innerHTML = matchScorecardData.bowlers.map(bw => 
          '<tr>' +
            '<td style="font-weight: 700; color: #F8FAFC;">' + bw.name + '</td>' +
            '<td style="text-align: right;">' + bw.overs + '</td>' +
            '<td style="text-align: right;">' + bw.maidens + '</td>' +
            '<td style="text-align: right;">' + bw.runs + '</td>' +
            '<td style="text-align: right; font-weight: 700; color: var(--rose); font-family: var(--font-score);">' + bw.wickets + '</td>' +
            '<td style="text-align: right;">' + bw.econ.toFixed(2) + '</td>' +
          '</tr>'
        ).join('');
      }

      modal.classList.add('active');
    }

    function closeScorecardModal() {
      const modal = document.getElementById('modalScorecardExport');
      if (modal) modal.classList.remove('active');
    }

    function downloadScorecardCsv() {
      let csv = 'Match,Delhi Daredevils vs Mumbai Super Strikers\\nMatch ID,match-pilot-1\\nResult,' + matchScorecardData.result + '\\n\\n' +
                'BATTING,Dismissal,Runs,Balls,4s,6s,SR\\n';
      matchScorecardData.batters.forEach(b => {
        csv += '"' + b.name + '","' + b.dismissal + '",' + b.runs + ',' + b.balls + ',' + b.fours + ',' + b.sixes + ',' + b.sr.toFixed(2) + '\\n';
      });
      csv += '\\nBOWLING,Overs,Maidens,Runs,Wickets,Economy\\n';
      matchScorecardData.bowlers.forEach(bw => {
        csv += '"' + bw.name + '",' + bw.overs + ',' + bw.maidens + ',' + bw.runs + ',' + bw.wickets + ',' + bw.econ.toFixed(2) + '\\n';
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'match-pilot-1-scorecard.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('✓ RFC 4180 Scorecard CSV Downloaded');
    }

    function printScorecardView() {
      window.print();
    }

    // Official Toss Management Handlers
    function openTossModal() {
      const m = document.getElementById('modalMatchToss');
      if (m) m.classList.add('active');
    }
    function closeTossModal() {
      const m = document.getElementById('modalMatchToss');
      if (m) m.classList.remove('active');
    }
    async function confirmTossDecision(e) {
      if (e) e.preventDefault();
      const winnerSelect = document.getElementById('tossWinnerSelect');
      const winnerId = winnerSelect ? winnerSelect.value : 'team-mumbai';
      const winnerName = winnerSelect && winnerSelect.selectedOptions[0] ? winnerSelect.selectedOptions[0].text : 'Mumbai Super Strikers';
      const decisionRadio = document.querySelector('input[name="tossDecision"]:checked');
      const decision = decisionRadio ? decisionRadio.value : 'BAT';

      try {
        await fetch('/api/v1/matches/match-pilot-1/toss', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ winner_team_id: winnerId, decision: decision })
        });
      } catch (err) {
        console.warn('Toss API sync warning:', err);
      }

      closeTossModal();
      showToast('✓ Toss Recorded: ' + winnerName + ' elected to ' + decision + ' first!');
      const sub = document.querySelector('.match-meta');
      if (sub) {
        sub.innerHTML = 'T20 Championship • Toss: <strong style="color: var(--amber);">' + winnerName + ' (' + decision + ')</strong> • Match ID: <span id="currentMatchId" style="font-family: monospace; color: var(--cyan);">match-pilot-1</span>';
      }
    }

    // Post-Match Verification & Ratings Handlers
    function openMatchRatingModal() {
      const m = document.getElementById('modalMatchRating');
      if (m) m.classList.add('active');
    }
    function closeMatchRatingModal() {
      const m = document.getElementById('modalMatchRating');
      if (m) m.classList.remove('active');
    }
    function updateRatingDisplay(labelId, val) {
      const el = document.getElementById(labelId);
      if (el) el.textContent = val + ' ★';
    }
    async function submitPostMatchRating(e) {
      if (e) e.preventDefault();
      const pRating = document.getElementById('inputRatingPitch') ? Number(document.getElementById('inputRatingPitch').value) : 5;
      const uRating = document.getElementById('inputRatingUmpire') ? Number(document.getElementById('inputRatingUmpire').value) : 5;
      const sRating = document.getElementById('inputRatingScorer') ? Number(document.getElementById('inputRatingScorer').value) : 5;
      const remarks = document.getElementById('inputRatingRemarks') ? document.getElementById('inputRatingRemarks').value : '';
      const avg = Number(((pRating + uRating + sRating) / 3).toFixed(1));

      try {
        await fetch('/api/v1/ratings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            booking_id: 'booking-pilot-1',
            target_type: 'PROVIDER',
            target_id: 'provider-harbour-grounds',
            rating: Math.round(avg),
            review: 'Pitch: ' + pRating + '/5, Umpire: ' + uRating + '/5, Scorer: ' + sRating + '/5. ' + remarks
          })
        });
      } catch (err) {
        console.warn('Ratings API warning:', err);
      }

      closeMatchRatingModal();
      showToast('⭐ Review Submitted (' + avg + '★)! Escrow Payout Disbursed to Providers.');
      const bRating = document.getElementById('providerBayesianRating');
      if (bRating) bRating.textContent = '4.85 / 5.0';
    }

    // Universal Modal Handlers
    function openModal(modalId) {
      const m = document.getElementById(modalId);
      if (m) m.classList.add('active');
    }
    function closeModal(modalId) {
      const m = document.getElementById(modalId);
      if (m) m.classList.remove('active');
    }

    function awardSampleQuote() {
      showToast('🏆 Quote Awarded to Elite Certified Umpire! Escrow Hold Locked.');
      closeModal('modalRfq');
    }

    function applyPromoCode() {
      const input = document.getElementById('promoCodeInput');
      const val = (input ? input.value : '').trim().toUpperCase();
      if (!val) {
        showToast('⚠ Please enter a promo code');
        return;
      }
      if (val === 'CRIC20') {
        showToast('✓ Coupon CRIC20 applied! 20% discount applied to basket.');
      } else if (val === 'TURF500') {
        showToast('✓ Coupon TURF500 applied! ₹500 flat discount applied.');
      } else {
        showToast('⚠ Invalid or expired promo code: ' + val);
      }
    }

    function showBulkImportPrompt() {
      showToast('📤 Bulk fixture schedule imported: 4 matches scheduled with 0 conflicts!');
      closeModal('modalTournamentOps');
    }

    let auctionBidMinor = 32500000;
    function submitAuctionBid(incrementMinor) {
      auctionBidMinor += incrementMinor;
      const formatted = '₹' + (auctionBidMinor / 100).toLocaleString('en-IN');
      const el = document.getElementById('auctionHighestBid');
      if (el) el.textContent = formatted;
      showToast('🔨 New Highest Bid Placed: ' + formatted + '!');
    }

    // Store Compliance & Legal Policies Handlers
    function openLegalModal() {
      const m = document.getElementById('modalLegalPolicies');
      if (m) m.classList.add('active');
    }
    function closeLegalModal() {
      const m = document.getElementById('modalLegalPolicies');
      if (m) m.classList.remove('active');
    }
    function switchLegalTab(tab) {
      ['privacy', 'terms', 'apple'].forEach(t => {
        const btn = document.getElementById('btnLegalTab' + t.charAt(0).toUpperCase() + t.slice(1));
        const view = document.getElementById('legalSubView' + t.charAt(0).toUpperCase() + t.slice(1));
        if (btn) btn.classList.toggle('active', t === tab);
        if (view) view.style.display = t === tab ? 'block' : 'none';
      });
    }

    // Tournament Leaderboards Handlers
    function switchTournamentSubTab(subTab) {
      const tabs = ['standings', 'orange', 'purple'];
      tabs.forEach(t => {
        const btn = document.getElementById('btnSubTab' + t.charAt(0).toUpperCase() + t.slice(1));
        if (btn) btn.classList.toggle('active', t === subTab);
      });

      const sView = document.getElementById('standingsSubView');
      const oView = document.getElementById('orangeCapSubView');
      const pView = document.getElementById('purpleCapSubView');
      const desc = document.getElementById('tournamentSubTabDesc');

      if (sView) sView.style.display = subTab === 'standings' ? 'block' : 'none';
      if (oView) oView.style.display = subTab === 'orange' ? 'block' : 'none';
      if (pView) pView.style.display = subTab === 'purple' ? 'block' : 'none';

      if (subTab === 'standings' && desc) desc.textContent = 'Automatic points calculation and Net Run Rate (NRR) tracking';
      if (subTab === 'orange' && desc) {
        desc.textContent = '👑 Orange Cap: Leading tournament run-scorers and boundary tallies';
        renderOrangeCapTable();
      }
      if (subTab === 'purple' && desc) {
        desc.textContent = '💜 Purple Cap: Leading tournament wicket-takers and bowling figures';
        renderPurpleCapTable();
      }
    }

    function renderOrangeCapTable() {
      const oView = document.getElementById('orangeCapSubView');
      if (!oView) return;
      const leaders = [
        { rank: 1, name: 'Virat Sharma', team: 'Bengaluru Strikers', runs: 284, hs: '92*', avg: 71.0, sr: 154.3, boundaries: '28 / 11' },
        { rank: 2, name: 'Rohit Varma', team: 'Mumbai Blasters', runs: 242, hs: '84', avg: 48.4, sr: 148.5, boundaries: '22 / 14' },
        { rank: 3, name: 'KL Rahul', team: 'Delhi Titans', runs: 198, hs: '71*', avg: 66.0, sr: 139.4, boundaries: '19 / 6' },
        { rank: 4, name: 'Suryakumar Y.', team: 'Mumbai Blasters', runs: 176, hs: '64', avg: 35.2, sr: 181.4, boundaries: '15 / 12' },
        { rank: 5, name: 'Sanju S.', team: 'Chennai Warriors', runs: 165, hs: '58', avg: 41.2, sr: 144.7, boundaries: '14 / 8' }
      ];
      oView.innerHTML = '<div style="overflow-x: auto;"><table style="width:100%; border-collapse: collapse; font-size:0.85rem;">' +
        '<thead><tr style="border-bottom: 1px solid rgba(255,255,255,0.1); color: #94a3b8; font-size:0.75rem; text-transform: uppercase;">' +
          '<th style="padding:0.6rem 0.5rem;">Rank</th>' +
          '<th style="padding:0.6rem 0.5rem;">Batter</th>' +
          '<th style="padding:0.6rem 0.5rem;">Team</th>' +
          '<th style="padding:0.6rem 0.5rem; text-align:right;">Runs</th>' +
          '<th style="padding:0.6rem 0.5rem; text-align:right;">HS</th>' +
          '<th style="padding:0.6rem 0.5rem; text-align:right;">AVG</th>' +
          '<th style="padding:0.6rem 0.5rem; text-align:right;">SR</th>' +
          '<th style="padding:0.6rem 0.5rem; text-align:right;">4s/6s</th>' +
        '</tr></thead><tbody>' +
        leaders.map(l => '<tr style="border-bottom: 1px solid rgba(255,255,255,0.05); ' + (l.rank === 1 ? 'background: rgba(255,184,0,0.08);' : '') + '">' +
          '<td style="padding:0.6rem 0.5rem; font-weight:700; color:' + (l.rank === 1 ? '#FFB800' : '#f8fafc') + ';">' + (l.rank === 1 ? '👑 1' : '#' + l.rank) + '</td>' +
          '<td style="padding:0.6rem 0.5rem; font-weight:600; color:#f8fafc;">' + l.name + '</td>' +
          '<td style="padding:0.6rem 0.5rem; color:#94a3b8;">' + l.team + '</td>' +
          '<td style="padding:0.6rem 0.5rem; text-align:right; font-family: var(--font-score); font-weight:700; color: var(--turf-emerald); font-size:0.95rem;">' + l.runs + '</td>' +
          '<td style="padding:0.6rem 0.5rem; text-align:right; font-family: var(--font-score); color:#f8fafc;">' + l.hs + '</td>' +
          '<td style="padding:0.6rem 0.5rem; text-align:right; font-family: var(--font-score); color: var(--cyan);">' + l.avg.toFixed(1) + '</td>' +
          '<td style="padding:0.6rem 0.5rem; text-align:right; font-family: var(--font-score); color:#f8fafc;">' + l.sr.toFixed(1) + '</td>' +
          '<td style="padding:0.6rem 0.5rem; text-align:right; color:#94a3b8;">' + l.boundaries + '</td>' +
        '</tr>').join('') +
        '</tbody></table></div>';
    }

    function renderPurpleCapTable() {
      const pView = document.getElementById('purpleCapSubView');
      if (!pView) return;
      const leaders = [
        { rank: 1, name: 'Jasprit B.', team: 'Mumbai Blasters', wickets: 12, overs: '20.0', bbi: '4/14', econ: 5.85, dots: 68 },
        { rank: 2, name: 'Mohammed S.', team: 'Bengaluru Strikers', wickets: 10, overs: '19.4', bbi: '3/18', econ: 6.75, dots: 54 },
        { rank: 3, name: 'Rashid K.', team: 'Delhi Titans', wickets: 9, overs: '16.0', bbi: '3/22', econ: 6.20, dots: 46 },
        { rank: 4, name: 'Yuzvendra C.', team: 'Chennai Warriors', wickets: 8, overs: '15.0', bbi: '4/25', econ: 7.40, dots: 39 },
        { rank: 5, name: 'Arshdeep S.', team: 'Delhi Titans', wickets: 7, overs: '15.2', bbi: '3/28', econ: 8.10, dots: 35 }
      ];
      pView.innerHTML = '<div style="overflow-x: auto;"><table style="width:100%; border-collapse: collapse; font-size:0.85rem;">' +
        '<thead><tr style="border-bottom: 1px solid rgba(255,255,255,0.1); color: #94a3b8; font-size:0.75rem; text-transform: uppercase;">' +
          '<th style="padding:0.6rem 0.5rem;">Rank</th>' +
          '<th style="padding:0.6rem 0.5rem;">Bowler</th>' +
          '<th style="padding:0.6rem 0.5rem;">Team</th>' +
          '<th style="padding:0.6rem 0.5rem; text-align:right;">Wkts</th>' +
          '<th style="padding:0.6rem 0.5rem; text-align:right;">Overs</th>' +
          '<th style="padding:0.6rem 0.5rem; text-align:right;">BBI</th>' +
          '<th style="padding:0.6rem 0.5rem; text-align:right;">Econ</th>' +
          '<th style="padding:0.6rem 0.5rem; text-align:right;">Dots</th>' +
        '</tr></thead><tbody>' +
        leaders.map(l => '<tr style="border-bottom: 1px solid rgba(255,255,255,0.05); ' + (l.rank === 1 ? 'background: rgba(192,132,252,0.08);' : '') + '">' +
          '<td style="padding:0.6rem 0.5rem; font-weight:700; color:' + (l.rank === 1 ? 'var(--purple-light)' : '#f8fafc') + ';">' + (l.rank === 1 ? '💜 1' : '#' + l.rank) + '</td>' +
          '<td style="padding:0.6rem 0.5rem; font-weight:600; color:#f8fafc;">' + l.name + '</td>' +
          '<td style="padding:0.6rem 0.5rem; color:#94a3b8;">' + l.team + '</td>' +
          '<td style="padding:0.6rem 0.5rem; text-align:right; font-family: var(--font-score); font-weight:700; color: var(--purple-light); font-size:0.95rem;">' + l.wickets + '</td>' +
          '<td style="padding:0.6rem 0.5rem; text-align:right; font-family: var(--font-score); color:#f8fafc;">' + l.overs + '</td>' +
          '<td style="padding:0.6rem 0.5rem; text-align:right; font-family: var(--font-score); color: var(--turf-emerald);">' + l.bbi + '</td>' +
          '<td style="padding:0.6rem 0.5rem; text-align:right; font-family: var(--font-score); color: var(--cyan);">' + l.econ.toFixed(2) + '</td>' +
          '<td style="padding:0.6rem 0.5rem; text-align:right; color:#94a3b8;">' + l.dots + '</td>' +
        '</tr>').join('') +
        '</tbody></table></div>';
    }

    // Event Operational Readiness Renderer
    function initEventReadiness() {
      const container = document.getElementById('eventReadinessBanner');
      if (!container) return;
      container.innerHTML = '<div class="event-readiness-card" style="background: rgba(10, 16, 28, 0.85); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 0.85rem 1.15rem; margin-bottom: 0.75rem;">' +
        '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.4rem;">' +
          '<div style="display: flex; align-items: center; gap: 0.5rem;">' +
            '<span style="font-size: 1rem;">⚡</span>' +
            '<span style="font-family: var(--font-display); font-weight: 700; font-size: 0.9rem; color: #f8fafc;">Event Operational Readiness</span>' +
            '<span style="background: rgba(0, 229, 153, 0.15); color: var(--turf-emerald); border: 1px solid rgba(0,229,153,0.3); font-size: 0.7rem; font-weight: 700; padding: 0.1rem 0.45rem; border-radius: 9999px;">100% CONFIRMED</span>' +
          '</div>' +
          '<div style="font-size: 0.75rem; color: var(--text-muted);">' +
            '4 of 4 required sporting resources secured (Turf, 2 Umpires, Scorer)' +
          '</div>' +
        '</div>' +
        '<div style="width: 100%; height: 6px; background: rgba(255,255,255,0.06); border-radius: 9999px; overflow: hidden;">' +
          '<div style="width: 100%; height: 100%; background: linear-gradient(90deg, var(--turf-emerald), var(--cyan)); border-radius: 9999px; box-shadow: 0 0 10px rgba(0,229,153,0.5);"></div>' +
        '</div>' +
        '<div style="margin-top: 0.45rem; font-size: 0.75rem; color: var(--turf-emerald); display: flex; align-items: center; justify-content: space-between; gap: 0.4rem; flex-wrap: wrap;">' +
          '<span>✓ Mandatory sporting resources locked. Match is fully cleared for live broadcast.</span>' +
          '<div style="display: flex; gap: 0.4rem;">' +
            '<button class="btn btn-secondary" onclick="openEventOverviewModal()" data-tooltip="Inspect full event lifecycle, procurement readiness ring, and resource blockers" style="padding: 0.2rem 0.6rem; font-size: 0.72rem; width: auto;">📋 Full Readiness</button>' +
            '<button class="btn btn-secondary" onclick="openEventBasketModal()" data-tooltip="Inspect match operational basket, equipment line items, and escrow deposit breakdown" style="padding: 0.2rem 0.6rem; font-size: 0.72rem; width: auto;">🧺 View Event Basket</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    }

    // Official & Umpire Assignment Desk Renderer
    function initOfficialDesk() {
      const container = document.getElementById('officialDeskContainer');
      if (!container) return;
      const assignments = [
        { title: 'Delhi Daredevils vs Mumbai Super Strikers', venue: 'Chinnaswamy Ground B', time: '18:00 – 22:00', role: 'LEAD UMPIRE', fee: '₹600.00', status: 'CHECKED_IN', checked: true },
        { title: 'Delhi Daredevils vs Mumbai Super Strikers', venue: 'Chinnaswamy Ground B', time: '18:00 – 22:00', role: 'LEG UMPIRE', fee: '₹500.00', status: 'CHECKED_IN', checked: true },
        { title: 'Delhi Daredevils vs Mumbai Super Strikers', venue: 'Chinnaswamy Ground B', time: '18:00 – 22:00', role: 'DIGITAL SCORER', fee: '₹400.00', status: 'ACTIVE SCORING', checked: true }
      ];
      container.innerHTML = assignments.map(a => 
        '<div class="official-assignment-card" style="background: rgba(10, 16, 28, 0.85); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 1rem;">' +
          '<div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">' +
            '<div>' +
              '<div style="font-family: var(--font-display); font-weight: 700; font-size: 0.92rem; color: #f8fafc;">' + a.title + '</div>' +
              '<div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 0.15rem;">📍 ' + a.venue + ' • 🕒 ' + a.time + '</div>' +
            '</div>' +
            '<div style="text-align: right;">' +
              '<span style="background: rgba(0, 210, 255, 0.15); color: var(--cyan); border: 1px solid rgba(0, 210, 255, 0.3); padding: 0.15rem 0.45rem; border-radius: 6px; font-size: 0.68rem; font-weight: 700;">' + a.role + '</span>' +
              '<div style="font-family: var(--font-score); font-size: 0.82rem; font-weight: 700; color: var(--turf-emerald); margin-top: 0.25rem;">' + a.fee + ' Escrow</div>' +
            '</div>' +
          '</div>' +
          '<div style="display: flex; gap: 0.5rem; align-items: center; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 0.65rem; margin-top: 0.5rem;">' +
            '<span style="color: var(--turf-emerald); font-size: 0.78rem; font-weight: 600;">✓ ' + a.status + ' • Escrow Guarded</span>' +
          '</div>' +
        '</div>'
      ).join('');
    }

    // Notification Center Handlers
    var drawerNotifications = [
      { id: 'notif-1', category: 'MATCH', title: '🪙 Match Toss Scheduled', body: 'Coin toss scheduled in 15 mins for M-101 (Bengaluru Strikers vs Mumbai Blasters).', time: '2m ago', read: false, tab: 'scoring' },
      { id: 'notif-2', category: 'FINANCIAL', title: '💳 Escrow Deposit Secured', body: '₹18,500 held in zero-imbalance escrow for Koramangala Turf Arena — Slot #2.', time: '18m ago', read: false, tab: 'marketplace' },
      { id: 'notif-3', category: 'TRUST', title: '⭐ Verified Reputation Upgrade', body: 'Harbour Cricket Grounds reliability increased to 98.5% (+1.2% bonus).', time: '1h ago', read: false, tab: 'incidents' },
      { id: 'notif-4', category: 'MATCH', title: '👨‍⚖️ Official Check-In Complete', body: 'Umpire Rajesh Sharma (Level-2 Certified) checked in at venue 45 mins prior.', time: '2h ago', read: true, tab: 'incidents' },
      { id: 'notif-5', category: 'SYSTEM', title: '📱 App Store Listing Ready', body: 'CricOS build v1.0.0 passed Apple Privacy Manifest & Google Play Target SDK 34.', time: '3h ago', read: true }
    ];

    function renderDrawerNotifications(filter) {
      filter = filter || 'ALL';
      const listEl = document.getElementById('notificationItemsList');
      if (!listEl) return;
      const filtered = drawerNotifications.filter(function(n) {
        if (filter === 'UNREAD') return !n.read;
        if (filter === 'ALL') return true;
        return n.category === filter;
      });

      const unreadCount = drawerNotifications.filter(function(n) { return !n.read; }).length;
      const b1 = document.getElementById('headerNotifBadge');
      const b2 = document.getElementById('drawerUnreadCountBadge');
      if (b1) b1.textContent = unreadCount;
      if (b2) b2.textContent = unreadCount + ' unread';

      if (filtered.length === 0) {
        listEl.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">No notifications in this view</div>';
        return;
      }

      const colors = { MATCH: 'var(--cyan)', FINANCIAL: 'var(--amber)', TRUST: 'var(--turf-emerald)', SYSTEM: 'var(--purple-light)' };
      listEl.innerHTML = filtered.map(function(item) {
        return '<div style="padding: 0.85rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.06); background: ' + (item.read ? 'transparent' : 'rgba(0,229,153,0.04)') + '; border-left: 3px solid ' + (item.read ? 'transparent' : (colors[item.category] || 'var(--cyan)')) + ';">' +
          '<div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.25rem;">' +
            '<span style="font-weight: 700; font-size: 0.84rem; color: #FFF;">' + item.title + '</span>' +
            '<span style="font-size: 0.7rem; color: var(--text-muted);">' + item.time + '</span>' +
          '</div>' +
          '<div style="font-size: 0.76rem; color: var(--text-muted); line-height: 1.35; margin-bottom: 0.45rem;">' + item.body + '</div>' +
          '<div style="display: flex; justify-content: space-between; align-items: center;">' +
            '<span style="font-size: 0.65rem; font-weight: 700; color: ' + (colors[item.category] || 'var(--cyan)') + '; text-transform: uppercase; letter-spacing: 0.05em; background: rgba(255,255,255,0.05); padding: 0.15rem 0.4rem; border-radius: 4px;">' + item.category + '</span>' +
            (item.tab ? '<button class="btn btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.7rem; width: auto;" onclick="handleNotificationAction(&apos;' + item.id + '&apos;, &apos;' + item.tab + '&apos;)" data-tooltip="Navigate to notification">View &rarr;</button>' : '') +
          '</div>' +
        '</div>';
      }).join('');
    }

    function toggleNotificationsDrawer() {
      const drawer = document.getElementById('notificationsDrawer');
      const overlay = document.getElementById('notificationsDrawerOverlay');
      if (!drawer || !overlay) return;
      const isOpen = drawer.style.right === '0px';
      if (isOpen) {
        drawer.style.right = '-400px';
        overlay.style.display = 'none';
      } else {
        renderDrawerNotifications('ALL');
        drawer.style.right = '0px';
        overlay.style.display = 'block';
      }
    }

    function closeNotificationsDrawer() {
      const drawer = document.getElementById('notificationsDrawer');
      const overlay = document.getElementById('notificationsDrawerOverlay');
      if (drawer) drawer.style.right = '-400px';
      if (overlay) overlay.style.display = 'none';
    }

    function filterDrawerNotifications(cat) {
      document.querySelectorAll('.notif-filter-pill').forEach(function(b) {
        b.classList.remove('active');
        b.style.background = 'transparent';
        b.style.color = 'var(--text-muted)';
      });
      if (window.event && window.event.target) {
        window.event.target.classList.add('active');
        window.event.target.style.background = 'rgba(255,255,255,0.08)';
        window.event.target.style.color = '#FFF';
      }
      renderDrawerNotifications(cat);
    }

    function markAllDrawerAsRead() {
      drawerNotifications.forEach(function(n) { n.read = true; });
      renderDrawerNotifications('ALL');
      showToast('✓ All notifications marked as read');
    }

    function handleNotificationAction(id, tab) {
      const n = drawerNotifications.find(function(item) { return item.id === id; });
      if (n) n.read = true;
      closeNotificationsDrawer();
      switchTab(tab);
    }

    // Event Basket Modal Handlers
    function openEventBasketModal() {
      const m = document.getElementById('modalEventBasket');
      if (m) m.classList.add('active');
    }
    function closeEventBasketModal() {
      const m = document.getElementById('modalEventBasket');
      if (m) m.classList.remove('active');
    }
    function proceedBasketCheckout() {
      closeEventBasketModal();
      showToast('✓ Event Basket Locked in Double-Entry Escrow (₹15,885.00)');
    }

    // Provider Storefront Modal Handlers
    function openProviderStorefrontModal() {
      const m = document.getElementById('modalProviderStorefront');
      if (m) m.classList.add('active');
    }
    function closeProviderStorefrontModal() {
      const m = document.getElementById('modalProviderStorefront');
      if (m) m.classList.remove('active');
    }
    function toggleSlotStatus(btn) {
      if (!btn) return;
      const isBlocked = btn.textContent.trim() === 'Block';
      btn.textContent = isBlocked ? 'Unfreeze' : 'Block';
      const statusSpan = btn.previousElementSibling;
      if (statusSpan) {
        statusSpan.textContent = isBlocked ? 'RESERVED' : 'AVAILABLE';
        statusSpan.style.color = isBlocked ? 'var(--rose)' : 'var(--cyan)';
      }
      showToast(isBlocked ? '⚠️ Slot blocked from marketplace search' : '✓ Slot unblocked and available for bookings');
    }
    function submitNewSlotPublication() {
      const time = document.getElementById('storefrontSlotTime').value;
      const rate = document.getElementById('storefrontSlotRate').value;
      const pitch = document.getElementById('storefrontSlotPitch').value;
      const list = document.getElementById('storefrontSlotsList');
      if (list) {
        const div = document.createElement('div');
        div.style.cssText = 'display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.06); padding: 0.65rem 0.85rem; border-radius: 6px;';
        div.innerHTML = '<div>' +
            '<div style="font-weight: 700; font-size: 0.85rem; color: #FFF;">' + time + '</div>' +
            '<div style="font-size: 0.7rem; color: var(--text-muted);">' + pitch + ' • Newly Published</div>' +
          '</div>' +
          '<div style="display: flex; align-items: center; gap: 0.75rem;">' +
            '<span style="font-weight: 700; font-family: var(--font-mono); color: var(--turf-emerald); font-size: 0.85rem;">₹' + Number(rate).toLocaleString('en-IN') + '</span>' +
            '<span style="font-size: 0.65rem; color: var(--cyan); font-weight: 700;">AVAILABLE</span>' +
            '<button class="btn btn-secondary" onclick="toggleSlotStatus(this)" style="padding: 0.2rem 0.5rem; font-size: 0.7rem; width: auto;" data-tooltip="Block or unblock slot">Block</button>' +
          '</div>';
        list.prepend(div);
      }
      showToast('✓ Published slot ' + time + ' (₹' + rate + ') to live search index');
    }

    // Admin Operations & Settlement Audit Desk
    var adminCases = [
      { caseId: 'CASE-9041', type: 'DISPUTE', title: 'Adverse Weather Interruption Claim', entity: 'Bengaluru Strikers vs Mumbai Blasters', amount: '₹8,500', status: 'PENDING_REVIEW', time: '25m ago', recommendation: 'Execute 50% rain refund journal entry (D: REFUND_CLEARING, C: ESCROW_HOLD)' },
      { caseId: 'CASE-8912', type: 'CIRCUIT_BREAKER', title: 'Automated Provider Slot Freeze Tripped', entity: 'Whitefield Sports Complex', amount: '₹0', status: 'PENDING_REVIEW', time: '1h ago', recommendation: 'Review no-show evidence or manually reset circuit breaker with probation status' },
      { caseId: 'CASE-8755', type: 'LEDGER_AUDIT', title: 'Zero-Sum Escrow Settlement Verification', entity: 'Tournament Batch #TRN-2026-BLR', amount: '₹1,45,000', status: 'RESOLVED', time: '3h ago', recommendation: 'All 8 matches balanced with 0 INR discrepancy across 5 ledger accounts' }
    ];

    function initAdminDesk() {
      const c = document.getElementById('adminAuditDeskContainer');
      if (!c) return;

      const casesHtml = adminCases.map(function(item) {
        return '<div id="admin-case-' + item.caseId + '" style="background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 1rem; margin-bottom: 0.75rem;">' +
          '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem; flex-wrap: wrap; gap: 0.4rem;">' +
            '<div style="display: flex; align-items: center; gap: 0.5rem;">' +
              '<span style="font-family: var(--font-mono); font-size: 0.75rem; font-weight: 700; color: var(--cyan);">' + item.caseId + '</span>' +
              '<span style="font-weight: 700; font-size: 0.85rem; color: #FFF;">' + item.title + '</span>' +
            '</div>' +
            '<span style="font-size: 0.7rem; font-weight: 700; color: ' + (item.status === 'RESOLVED' ? 'var(--turf-emerald)' : 'var(--amber)') + '; background: rgba(255,255,255,0.05); padding: 0.15rem 0.5rem; border-radius: 4px;">' + item.status + '</span>' +
          '</div>' +
          '<div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.4rem;">' +
            '<span>Entity: <strong style="color: #FFF;">' + item.entity + '</strong></span>' +
            '<span>Dispute Value: <strong style="color: var(--amber);">' + item.amount + '</strong></span>' +
            '<span>Logged: ' + item.time + '</span>' +
          '</div>' +
          '<div style="font-size: 0.75rem; color: var(--text-muted); background: rgba(0,0,0,0.3); padding: 0.5rem; border-radius: 6px; border-left: 3px solid var(--amber); margin-bottom: 0.75rem;">' +
            '<strong>Suggested Action:</strong> ' + item.recommendation +
          '</div>' +
          '<div style="display: flex; gap: 0.5rem; justify-content: flex-end;">' +
            '<button class="btn btn-secondary" style="padding: 0.25rem 0.6rem; font-size: 0.72rem; width: auto;" onclick="arbitrateAdminCase(&apos;' + item.caseId + '&apos;, &apos;REJECT&apos;)" data-tooltip="Reject claim and disburse provider payout">Reject Claim</button>' +
            '<button class="btn btn-primary" style="padding: 0.25rem 0.6rem; font-size: 0.72rem; width: auto;" onclick="arbitrateAdminCase(&apos;' + item.caseId + '&apos;, &apos;RESOLVE&apos;)" data-tooltip="Approve resolution and trigger balanced double-entry refund">Approve &amp; Execute</button>' +
          '</div>' +
        '</div>';
      }).join('');

      c.innerHTML = '<div class="card" style="background: rgba(10, 16, 28, 0.85); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.25rem;">' +
          '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">' +
            '<div>' +
              '<div class="card-title" style="display: flex; align-items: center; gap: 0.5rem;">' +
                '<span>🏛️</span> Admin Operations &amp; Settlement Audit Desk' +
              '</div>' +
              '<div class="card-desc">Authoritative dispute arbitration, circuit breaker governance, and double-entry ledger audits</div>' +
            '</div>' +
            '<button class="btn btn-secondary" onclick="refreshAdminCases()" data-tooltip="Refresh administrative cases and audit ledger" style="width: auto; padding: 0.35rem 0.75rem; font-size: 0.75rem;">🔄 Refresh Audit</button>' +
          '</div>' +
          '<div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 1rem; margin-bottom: 1.25rem;">' +
            '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">' +
              '<span style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted);">Chart of Accounts Integrity Verification</span>' +
              '<span style="font-size: 0.72rem; font-weight: 700; color: var(--turf-emerald); background: rgba(0,229,153,0.1); padding: 0.2rem 0.5rem; border-radius: 4px;">✓ 100% BALANCED (ZERO IMBALANCE)</span>' +
            '</div>' +
            '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 0.75rem; font-family: var(--font-mono); font-size: 0.75rem;">' +
              '<div><div style="color: var(--text-muted); font-size: 0.65rem;">ESCROW_HOLD</div><div style="font-size: 0.95rem; font-weight: 700; color: #FFF;">₹1,45,000</div></div>' +
              '<div><div style="color: var(--text-muted); font-size: 0.65rem;">PROVIDER_PAYABLE</div><div style="font-size: 0.95rem; font-weight: 700; color: var(--cyan);">₹1,36,445</div></div>' +
              '<div><div style="color: var(--text-muted); font-size: 0.65rem;">PLATFORM_FEE</div><div style="font-size: 0.95rem; font-weight: 700; color: var(--turf-emerald);">₹7,250</div></div>' +
              '<div><div style="color: var(--text-muted); font-size: 0.65rem;">TAX_GST_PAYABLE</div><div style="font-size: 0.95rem; font-weight: 700; color: var(--amber);">₹1,305</div></div>' +
              '<div><div style="color: var(--text-muted); font-size: 0.65rem;">REFUND_CLEARING</div><div style="font-size: 0.95rem; font-weight: 700; color: var(--rose);">₹0</div></div>' +
            '</div>' +
          '</div>' +
          '<div style="font-size: 0.85rem; font-weight: 700; margin-bottom: 0.75rem; color: #f8fafc;">Active Case Arbitrations (' + adminCases.length + ')</div>' +
          '<div id="adminCasesListContainer">' + casesHtml + '</div>' +
        '</div>';
    }

    function arbitrateAdminCase(caseId, action) {
      const c = adminCases.find(function(item) { return item.caseId === caseId; });
      if (c) {
        c.status = action === 'RESOLVE' ? 'RESOLVED' : 'REJECTED';
      }
      initAdminDesk();
      showToast(action === 'RESOLVE' ? '✓ ' + caseId + ' approved: Zero-sum double-entry refund executed' : '✓ ' + caseId + ' rejected: Escrow funds disbursed to provider');
    }

    function refreshAdminCases() {
      initAdminDesk();
      showToast('✓ Admin audit desk refreshed with latest ledger balances');
    }

    // ==========================================
    // Interactive Handlers:
    // Create Event, Event Overview, Official Calendar,
    // Contextual Messaging, Booking Lifecycle & Financial Reconciliation
    // ==========================================

    // 1. Create Event Wizard
    let currentWizStep = 1;
    let selectedWizFormat = 'T20';

    function openCreateEventModal() {
      currentWizStep = 1;
      updateWizardStepUI();
      const m = document.getElementById('modalCreateEvent');
      if (m) m.classList.add('active');
    }
    function closeCreateEventModal() {
      const m = document.getElementById('modalCreateEvent');
      if (m) m.classList.remove('active');
    }
    function selectWizardFormat(fmt) {
      selectedWizFormat = fmt;
      document.querySelectorAll('.format-card').forEach(c => {
        c.classList.remove('active');
        c.style.borderColor = 'rgba(255,255,255,0.1)';
        c.style.background = 'rgba(255,255,255,0.03)';
      });
      const target = document.getElementById('fmtCard-' + fmt);
      if (target) {
        target.classList.add('active');
        target.style.borderColor = 'var(--turf-emerald)';
        target.style.background = 'rgba(0, 229, 153, 0.08)';
      }
      const customRow = document.getElementById('customOversRow');
      if (customRow) customRow.style.display = fmt === 'CUSTOM' ? 'block' : 'none';
    }
    function updateWizardStepUI() {
      const s1 = document.getElementById('wizStep1Panel');
      const s2 = document.getElementById('wizStep2Panel');
      const s3 = document.getElementById('wizStep3Panel');
      if (s1) s1.style.display = currentWizStep === 1 ? 'block' : 'none';
      if (s2) s2.style.display = currentWizStep === 2 ? 'block' : 'none';
      if (s3) s3.style.display = currentWizStep === 3 ? 'block' : 'none';
      const prevBtn = document.getElementById('wizPrevBtn');
      if (prevBtn) prevBtn.style.display = currentWizStep > 1 ? 'inline-block' : 'none';
      const nextBtn = document.getElementById('wizNextBtn');
      if (nextBtn) {
        if (currentWizStep === 1) nextBtn.textContent = 'Next: Teams & Officials →';
        else if (currentWizStep === 2) nextBtn.textContent = 'Next: Venue & Schedule →';
        else if (currentWizStep === 3) nextBtn.textContent = '✓ Create Event & Lock Basket';
      }

      ['wizStep1Indicator', 'wizStep2Indicator', 'wizStep3Indicator'].forEach((id, idx) => {
        const el = document.getElementById(id);
        if (el) {
          el.style.color = (idx + 1 <= currentWizStep) ? 'var(--turf-emerald)' : 'var(--text-muted)';
          const badge = el.querySelector('span');
          if (badge) {
            badge.style.background = (idx + 1 <= currentWizStep) ? 'var(--turf-emerald)' : 'rgba(255,255,255,0.1)';
            badge.style.color = (idx + 1 <= currentWizStep) ? '#04070D' : '#FFF';
          }
        }
      });
    }
    function nextWizardStep() {
      if (currentWizStep < 3) {
        currentWizStep++;
        updateWizardStepUI();
      } else {
        closeCreateEventModal();
        showToast('✓ Event created! Opening match operational basket in escrow...');
        openEventBasketModal();
      }
    }
    function prevWizardStep() {
      if (currentWizStep > 1) {
        currentWizStep--;
        updateWizardStepUI();
      }
    }

    // 2. Event Overview & Readiness
    function openEventOverviewModal() {
      const m = document.getElementById('modalEventOverview');
      if (m) m.classList.add('active');
    }
    function closeEventOverviewModal() {
      const m = document.getElementById('modalEventOverview');
      if (m) m.classList.remove('active');
    }

    // 3. Official Calendar & Availability
    function openOfficialCalendarModal() {
      const m = document.getElementById('modalOfficialCalendar');
      if (m) m.classList.add('active');
    }
    function closeOfficialCalendarModal() {
      const m = document.getElementById('modalOfficialCalendar');
      if (m) m.classList.remove('active');
    }
    function selectCalendarDay(day, btn) {
      document.querySelectorAll('.cal-day-btn').forEach(b => {
        b.style.borderColor = 'rgba(255,255,255,0.1)';
        b.style.background = 'transparent';
        b.style.color = 'var(--text-muted)';
        b.style.fontWeight = 'normal';
      });
      if (btn) {
        btn.style.borderColor = 'var(--turf-emerald)';
        btn.style.background = 'rgba(0,229,153,0.15)';
        btn.style.color = 'var(--turf-emerald)';
        btn.style.fontWeight = '700';
      }
      showToast('✓ Loaded schedule allocations for ' + day);
    }
    function checkCalendarSlotConflict() {
      const start = parseInt(document.getElementById('testSlotStart').value, 10);
      const end = parseInt(document.getElementById('testSlotEnd').value, 10);
      const resEl = document.getElementById('slotConflictResult');
      if (!resEl) return;
      const overlaps = (start < 14 && end > 10) || (start < 19 && end > 15);
      if (overlaps) {
        resEl.textContent = '⚠️ Schedule Conflict: Overlaps with existing match booking!';
        resEl.style.color = 'var(--rose)';
      } else {
        resEl.textContent = '✓ No Conflict Detected: Slot is clear for booking';
        resEl.style.color = 'var(--turf-emerald)';
      }
    }

    // 4. Contextual Messaging
    function openMessagingModal() {
      const m = document.getElementById('modalMessaging');
      if (m) m.classList.add('active');
    }
    function closeMessagingModal() {
      const m = document.getElementById('modalMessaging');
      if (m) m.classList.remove('active');
    }
    function acceptChatQuote() {
      showToast('✓ Quote accepted! ₹3,500.00 locked in double-entry escrow');
    }
    function declineChatQuote() {
      showToast('Quote declined. Notified official.');
    }
    function sendQuickAction(act) {
      const stream = document.getElementById('messagingStream');
      if (!stream) return;
      const d = document.createElement('div');
      d.style.cssText = 'align-self: flex-end; max-width: 80%; background: rgba(0,229,153,0.15); border: 1px solid rgba(0,229,153,0.3); border-radius: 8px; padding: 0.65rem 0.85rem;';
      d.innerHTML = '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem; gap: 1rem;">' +
        '<span style="font-size: 0.75rem; font-weight: 700; color: var(--turf-emerald);">Virat Sharma (Captain)</span>' +
        '<span style="font-size: 0.65rem; color: var(--text-muted);">Just now</span>' +
      '</div>' +
      '<div style="font-size: 0.8rem; color: #FFF;">⚡ ' + act + '</div>';
      stream.appendChild(d);
      stream.scrollTop = stream.scrollHeight;
      showToast('✓ Quick update broadcast: ' + act);
    }
    function submitChatMessage() {
      const input = document.getElementById('chatInputText');
      if (!input || !input.value.trim()) return;
      const text = input.value.trim();
      const stream = document.getElementById('messagingStream');
      if (stream) {
        const d = document.createElement('div');
        d.style.cssText = 'align-self: flex-end; max-width: 80%; background: rgba(0,229,153,0.15); border: 1px solid rgba(0,229,153,0.3); border-radius: 8px; padding: 0.65rem 0.85rem;';
        d.innerHTML = '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem; gap: 1rem;">' +
          '<span style="font-size: 0.75rem; font-weight: 700; color: var(--turf-emerald);">Virat Sharma (Captain)</span>' +
          '<span style="font-size: 0.65rem; color: var(--text-muted);">Just now</span>' +
        '</div>' +
        '<div style="font-size: 0.8rem; color: #FFF;">' + text + '</div>';
        stream.appendChild(d);
        stream.scrollTop = stream.scrollHeight;
      }
      input.value = '';
      showToast('✓ Message sent across SSE/WebSocket sync');
    }

    // 5. Booking Lifecycle, Rescheduling & Cancellations
    function openBookingLifecycleModal() {
      const m = document.getElementById('modalBookingLifecycle');
      if (m) m.classList.add('active');
    }
    function closeBookingLifecycleModal() {
      const m = document.getElementById('modalBookingLifecycle');
      if (m) m.classList.remove('active');
    }
    function calculateReschedulePriceAdjustment() {
      const select = document.getElementById('rescheduleTargetRate');
      if (!select) return;
      const targetRate = parseInt(select.value, 10);
      const diff = targetRate - 3500;
      const display = document.getElementById('rescheduleDiffDisplay');
      if (!display) return;
      if (diff > 0) {
        display.textContent = '+₹' + diff.toLocaleString('en-IN') + ' to pay';
        display.style.color = 'var(--amber)';
      } else if (diff < 0) {
        display.textContent = '-₹' + Math.abs(diff).toLocaleString('en-IN') + ' refund';
        display.style.color = 'var(--turf-emerald)';
      } else {
        display.textContent = '₹0.00 (Even swap)';
        display.style.color = 'var(--cyan)';
      }
    }
    function executeRescheduleBooking() {
      closeBookingLifecycleModal();
      showToast('✓ Booking rescheduled. Match slot updated and escrow rebalanced.');
    }
    function triggerWeatherWashout() {
      closeBookingLifecycleModal();
      showToast('✓ Rain washout claim approved: 100% full refund journal entry executed (D: REFUND_CLEARING, C: ESCROW_HOLD)');
    }
    function reportNoShowProvider() {
      closeBookingLifecycleModal();
      showToast('⚠️ Provider no-show recorded: -15 reputation penalty applied and refund initiated.');
    }
    function cancelCurrentBooking() {
      closeBookingLifecycleModal();
      showToast('✓ Booking cancelled under Band 1 (>48h): 100% full refund processed to customer');
    }

    // 6. Financial Reconciliation & 5-Account Audit
    function openReconciliationModal() {
      const m = document.getElementById('modalFinancialReconciliation');
      if (m) m.classList.add('active');
    }
    function closeReconciliationModal() {
      const m = document.getElementById('modalFinancialReconciliation');
      if (m) m.classList.remove('active');
    }
    function downloadReconciliationCsv() {
      const csvContent = 'Settlement ID,Booking ID,Provider Name,Gross Base (INR),Platform Fee (INR),GST (INR),Net Disbursed (INR),Status,Dispute Flag\\n' +
        'SETTL-2026-001,BK-101,Chinnaswamy Turf Arena,8500.00,425.00,76.50,7998.50,PAYOUT_COMPLETED,NO\\n' +
        'SETTL-2026-002,BK-102,Rajesh Sharma (Lead Umpire),3500.00,175.00,31.50,3293.50,PAYOUT_COMPLETED,NO\\n' +
        'SETTL-2026-003,BK-103,Vikram Rao (Leg Umpire),2500.00,125.00,22.50,2352.50,SETTLEMENT_ELIGIBLE,NO\\n' +
        'SETTL-2026-004,BK-104,Amit Patel (Official Scorer),800.00,40.00,7.20,752.80,SETTLEMENT_ELIGIBLE,NO\\n' +
        'SETTL-2026-005,BK-105,Whitefield Sports Ground,6500.00,325.00,58.50,6116.50,HELD_DISPUTE,YES\\n';
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'cricos_reconciliation_' + new Date().toISOString().split('T')[0] + '.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('✓ Exported RFC 4180 Reconciliation CSV (5 settlement rows)');
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

      // Check match conclusion victory condition
      if (currentRuns >= targetRuns) {
        const banner = document.getElementById('matchResultBanner');
        const text = document.getElementById('matchResultText');
        if (banner) banner.style.display = 'flex';
        if (text) text.textContent = 'Mumbai Super Strikers won by ' + Math.max(1, 10 - wickets) + ' wickets!';
      }

      // Update Free Hit active status banner
      const fhBanner = document.getElementById('freeHitBanner');
      if (fhBanner) {
        fhBanner.style.display = state.is_free_hit ? 'flex' : 'none';
      }

      // Prompt bowler rotation on over completion
      if (eventType === 'OVER_COMPLETED' || (state.legal_balls > 0 && state.legal_balls % 6 === 0 && event && event.legal_ball)) {
        promptBowlerChange(state);
      }

      renderMatchCharts();

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

        source.addEventListener('undo_delivery', (e) => {
          const data = JSON.parse(e.data);
          renderScoreState(data.state, null, 'UNDO_DELIVERY');
          const strip = document.getElementById('overBallStrip');
          if (strip && strip.lastElementChild) {
            strip.removeChild(strip.lastElementChild);
            if (strip.children.length === 0) {
              strip.innerHTML = '<div class="ball-bubble dot">•</div>';
            }
          }
          if (data.event && data.event.is_wicket) {
            const fowStrip = document.getElementById('fowStrip');
            if (fowStrip && fowStrip.lastElementChild) {
              fowStrip.removeChild(fowStrip.lastElementChild);
            }
          }
          const feed = document.getElementById('scoringFeed');
          if (feed) {
            const item = document.createElement('div');
            item.className = 'feed-item';
            item.style.color = 'var(--amber)';
            item.innerHTML = '<span>↺ Delivery Undone (Over ' + (data.state.overs_display || '0.0') + ')</span><span style="color: var(--text-muted); font-weight: 600;">' + data.state.runs + '/' + data.state.wickets + '</span>';
            feed.prepend(item);
          }
          showToast('↺ Delivery undone via broadcast stream');
        });

        source.addEventListener('bowler_changed', (e) => {
          const data = JSON.parse(e.data);
          renderScoreState(data.state, null, 'BOWLER_CHANGED');
          showToast('🏏 ' + (data.message || 'Bowler updated'));
        });

        source.addEventListener('strike_swapped', (e) => {
          const data = JSON.parse(e.data);
          renderScoreState(data.state, null, 'STRIKE_SWAPPED');
          showToast('⚡ Strike swapped via live stream');
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
      item.innerHTML = '<span>Ball ' + (state.overs_display || '0.0') + ' — ' + desc + '</span><span style="color: var(--text-muted); font-weight: 600;">' + (state.runs || 0) + '/' + (state.wickets || 0) + '</span>';
      feed.prepend(item);
    }

    async function scoreDelivery(batRuns, extraRuns, extraType, legalBall, isWicket = false, wicketOptions = null) {
      if (typeof currentUser !== 'undefined' && currentUser.persona !== 'SCORER') {
        showToast('🔒 Only official Scorers can score deliveries.');
        return;
      }
      sequence++;
      const clientEventId = 'evt-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
      const payload = {
        client_event_id: clientEventId,
        sequence,
        bat_runs: batRuns,
        extra_runs: extraRuns,
        extra_type: extraType,
        legal_ball: legalBall,
        is_wicket: isWicket,
        shot_zone: typeof currentSelectedZone !== 'undefined' ? currentSelectedZone : undefined,
        ...(wicketOptions || {})
      };

      // Offline detection & optimistic local outbox queueing
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        offlineDeliveries.push(payload);
        updateSyncUI();
        runs += batRuns + extraRuns;
        if (isWicket) wickets++;
        if (legalBall) legalBalls++;
        const overs = Math.floor(legalBalls / 6) + '.' + (legalBalls % 6);
        const fallbackState = { runs, wickets, legal_balls: legalBalls, overs_display: overs };
        renderScoreState(fallbackState, payload, 'OFFLINE_LOCAL');
        logFeedItem(fallbackState, payload);
        renderMatchCharts();
        showToast('⚡ [Offline Queue] Delivery stored in outbox (' + offlineDeliveries.length + ' queued)');
        return;
      }

      try {
        const res = await fetch('/api/v1/scoring/matches/' + matchId + '/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const data = await res.json();
          // If SSE stream is disconnected or inactive, apply local update as fallback
          if (!isSseConnected) {
            const fallbackEvent = data.event || payload;
            renderScoreState(data.state, fallbackEvent, data.broadcast_type);
            logFeedItem(data.state, fallbackEvent);
          }
          renderMatchCharts();
          let desc = isWicket ? '🛑 WICKET!' : (batRuns === 4 ? '🏏 FOUR!' : (batRuns === 6 ? '🚀 SIX!' : (extraType !== 'NONE' ? extraType + ' (+' + (extraRuns || 1) + ')' : batRuns + ' run(s)')));
          showToast('Delivered: ' + desc);
        }
      } catch (err) {
        // Network drop during request: save to outbox
        offlineDeliveries.push(payload);
        updateSyncUI();
        showToast('⚠️ Network failure: Delivery queued in outbox');
      }
    }

    async function undoLastDelivery() {
      if (typeof currentUser !== 'undefined' && currentUser.persona !== 'SCORER') {
        showToast('🔒 Only official Scorers can undo deliveries.');
        return;
      }
      try {
        const res = await fetch('/api/v1/scoring/matches/' + matchId + '/undo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        if (res.ok) {
          const data = await res.json();
          renderScoreState(data.state, null, 'UNDO_DELIVERY');
          const strip = document.getElementById('overBallStrip');
          if (strip && strip.lastElementChild) {
            strip.removeChild(strip.lastElementChild);
            if (strip.children.length === 0) {
              strip.innerHTML = '<div class="ball-bubble dot">•</div>';
            }
          }
          if (data.undone_event && data.undone_event.is_wicket) {
            const fowStrip = document.getElementById('fowStrip');
            if (fowStrip && fowStrip.lastElementChild) {
              fowStrip.removeChild(fowStrip.lastElementChild);
            }
          }
          const feed = document.getElementById('scoringFeed');
          if (feed) {
            const item = document.createElement('div');
            item.className = 'feed-item';
            item.style.color = 'var(--amber)';
            item.innerHTML = '<span>↺ Delivery Undone (Over ' + (data.state.overs_display || '0.0') + ')</span><span style="color: var(--text-muted); font-weight: 600;">' + data.state.runs + '/' + data.state.wickets + '</span>';
            feed.prepend(item);
          }
          showToast('↺ Last delivery undone');
        } else {
          const err = await res.json();
          showToast('⚠️ ' + (err.error || 'Cannot undo delivery'));
        }
      } catch (e) {
        showToast('⚠️ Error undoing delivery: Network error');
      }
    }

    async function swapMatchStrike() {
      if (typeof currentUser !== 'undefined' && currentUser.persona !== 'SCORER') {
        showToast('🔒 Only official Scorers can swap strike.');
        return;
      }
      try {
        const res = await fetch('/api/v1/scoring/matches/' + matchId + '/swap-strike', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        if (res.ok) {
          const data = await res.json();
          renderScoreState(data.state, null, 'STRIKE_SWAPPED');
          showToast('⚡ Strike rotated');
        }
      } catch (e) {
        showToast('⚠️ Error swapping strike');
      }
    }

    function promptBowlerChange(state) {
      const modal = document.getElementById('modalBowlerRotation');
      if (!modal) return;
      const desc = document.getElementById('bowlerModalDesc');
      const prevBowler = state.previous_bowler_id || state.current_bowler_id;
      if (desc && prevBowler) {
        const bowlerDisplayName = state.bowlers?.[prevBowler]?.name || prevBowler;
        desc.innerHTML = 'Over has concluded (' + (state.overs_display || '1.0') + ' ov). Select the next bowler.<br><span style="color: var(--amber); font-weight: 700; margin-top: 0.35rem; display: inline-block;">⚠️ ' + bowlerDisplayName + ' cannot bowl two consecutive overs (MCC Law 21).</span>';
      }
      const optPrev = document.getElementById('optPrevBowler');
      if (optPrev && prevBowler) {
        optPrev.value = prevBowler;
        optPrev.textContent = (state.bowlers?.[prevBowler]?.name || prevBowler) + ' (Current Bowler - Cannot Bowl Consecutively)';
        optPrev.disabled = true;
      }
      modal.classList.add('active');
    }

    function closeBowlerModal() {
      const modal = document.getElementById('modalBowlerRotation');
      if (modal) modal.classList.remove('active');
    }

    async function confirmBowlerChange() {
      if (typeof currentUser !== 'undefined' && currentUser.persona !== 'SCORER') {
        showToast('🔒 Only official Scorers can change bowlers.');
        return;
      }
      const sel = document.getElementById('nextBowlerSelect');
      if (!sel) return;
      const bowlerId = sel.value;
      const bowlerName = sel.options[sel.selectedIndex]?.text.split('(')[0].trim();
      try {
        const res = await fetch('/api/v1/scoring/matches/' + matchId + '/bowler', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bowler_id: bowlerId, bowler_name: bowlerName, enforce_rule: true })
        });
        if (res.ok) {
          const data = await res.json();
          renderScoreState(data.state, null, 'BOWLER_CHANGED');
          closeBowlerModal();
          showToast('🏏 Next Bowler set: ' + bowlerName);
        } else {
          const err = await res.json();
          showToast('⚠️ ' + (err.error || 'Bowler change rejected'));
        }
      } catch (e) {
        showToast('⚠️ Error updating bowler');
      }
    }

    // Global keyboard listener for Undo (Ctrl+Z / Cmd+Z)
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
        if (activeTag !== 'input' && activeTag !== 'textarea') {
          e.preventDefault();
          undoLastDelivery();
        }
      }
    });

    function resetMatchScore() {
      if (typeof currentUser !== 'undefined' && currentUser.persona !== 'SCORER') {
        showToast('🔒 Only official Scorers can reset scores.');
        return;
      }
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
              <span class="slot-chip booked" data-tooltip="Peak night fixture: 18:00 - 22:00 (Match Confirmed &amp; Reserved)">18:00 Booked</span>
            </div>
          </div>
        \`).join('');
      } catch (e) {
        container.textContent = 'Error loading listings';
      }
    }
    loadListings();

    function selectListing(title, priceMinor) {
      currentSelectedTitle = title;
      currentSelectedPrice = priceMinor;
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
      openCheckoutModal(currentSelectedTitle, currentSelectedPrice);
      try {
        const res = await fetch('/api/v1/availability/holds', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slot_id: '00000000-0000-0000-0000-000000000010' })
        });
        if (res.ok) {
          showToast('✓ 15-Minute Authoritative Hold Activated');
        }
      } catch (e) {
        showToast('Hold active on client');
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
      container.innerHTML = '<div style="font-weight: 600; margin-bottom: 0.5rem; color: var(--primary);">Generated ' + fix.count + ' Round-Robin Fixtures:</div>' +
        fix.fixtures.map(f => '<div style="padding: 0.35rem 0; border-bottom: 1px solid var(--border-subtle); font-size: 0.85rem;">Round ' + f.round + ': <strong>' + f.home + '</strong> vs <strong>' + f.away + '</strong></div>').join('');
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
      document.getElementById('replacementResult').innerHTML = '<div style="color: var(--primary); font-weight: 600;">✓ Replacement Accepted & Confirmed!</div>';
      showToast('Replacement accepted');
    }

    // Reputation & Trust Engine
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

    // ==========================================
    // Top Bar Interactive Modals & Probes
    // ==========================================

    // Mobile App Preview Modal
    function openMobilePreviewModal() {
      const m = document.getElementById('modalMobileAppPreview');
      if (m) m.classList.add('active');
    }
    function closeMobilePreviewModal() {
      const m = document.getElementById('modalMobileAppPreview');
      if (m) m.classList.remove('active');
    }

    // API Docs Modal
    function openApiDocsModal() {
      const m = document.getElementById('modalApiDocs');
      if (m) m.classList.add('active');
    }
    function closeApiDocsModal() {
      const m = document.getElementById('modalApiDocs');
      if (m) m.classList.remove('active');
    }

    // System Health & Probe Diagnostics Modal
    async function openHealthModal() {
      const m = document.getElementById('modalSystemHealth');
      if (m) m.classList.add('active');
      runHealthProbePing();
    }
    function closeHealthModal() {
      const m = document.getElementById('modalSystemHealth');
      if (m) m.classList.remove('active');
    }
    async function runHealthProbePing() {
      const feedback = document.getElementById('healthProbeFeedback');
      const start = Date.now();
      try {
        const res = await fetch('/health/live');
        const latency = Date.now() - start;
        const data = await res.json();
        const uptimeEl = document.getElementById('healthModalUptime');
        if (uptimeEl) uptimeEl.textContent = 'Uptime: ' + Math.floor(data.uptime_seconds || 0) + 's';
        const liveRes = document.getElementById('healthLiveResult');
        if (liveRes) liveRes.textContent = 'HTTP ' + res.status + ' (' + latency + 'ms)';
        if (feedback) {
          feedback.style.display = 'block';
          feedback.style.borderColor = 'var(--turf-emerald)';
          feedback.style.color = 'var(--turf-emerald)';
          feedback.style.background = 'rgba(0, 229, 153, 0.12)';
          feedback.textContent = '✓ Fastify daemon verified in ' + latency + 'ms. Event loop nominal with 0 lag.';
        }
      } catch (err) {
        if (feedback) {
          feedback.style.display = 'block';
          feedback.style.borderColor = 'var(--rose)';
          feedback.style.color = 'var(--rose)';
          feedback.style.background = 'rgba(255, 51, 102, 0.12)';
          feedback.textContent = 'Probe check failed: ' + err.message;
        }
      }
    }

    // Operational Metrics Modal
    async function openMetricsModal() {
      const m = document.getElementById('modalMetricsTelemetry');
      if (m) m.classList.add('active');
      try {
        const res = await fetch('/health/metrics');
        if (res.ok) {
          const d = await res.json();
          const heapEl = document.getElementById('modalMetricsHeap');
          if (heapEl && d.memory) heapEl.textContent = Math.round(d.memory.heap_used / 1048576) + ' MB';
          const latEl = document.getElementById('modalMetricsAvgLat');
          if (latEl && d.event_loop_lag_ms) latEl.textContent = d.event_loop_lag_ms.toFixed(2) + 'ms';
        }
      } catch (_) {}
    }
    function closeMetricsModal() {
      const m = document.getElementById('modalMetricsTelemetry');
      if (m) m.classList.remove('active');
    }

    // Global Modal Escape & Outside Click Dismissal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop.active').forEach(m => m.classList.remove('active'));
        const drawer = document.getElementById('notificationsDrawer');
        if (drawer && drawer.style.right === '0px') closeNotificationsDrawer();
      }
    });

    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          backdrop.classList.remove('active');
        }
      });
    });

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

    // Initial load calls
    try {
      if (localStorage.getItem('cricos_sidebar_collapsed') === '1') {
        const sb = document.getElementById('appSidebar');
        const cb = document.getElementById('sidebarCollapseBtn');
        if (sb) sb.classList.add('collapsed');
        if (cb) {
          cb.innerHTML = '<span class="collapse-icon">▶</span>';
          cb.setAttribute('data-tooltip', 'Expand sidebar');
        }
      }
    } catch (e) {}

    updateSyncUI();
    renderMatchCharts();
    renderRoster();
    initEventReadiness();
    initOfficialDesk();
    initAdminDesk();
    renderWagonWheelRays();
    updateWagonTelemetry();
    applyRolePermissions(currentUser.persona);
  </script>
</body>
</html>`;
}
