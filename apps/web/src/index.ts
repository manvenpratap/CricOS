export * from './api/client.js';
export * from './components/scoreboard.js';
export * from './components/marketplace.js';
export * from './components/disputes.js';
export * from './components/auth-modal.js';
export * from './components/team-roster.js';
export * from './components/scoring-studio.js';
export * from './components/tournament-wizard.js';
export * from './components/offline-sync.js';
export * from './components/scorecard-export.js';
export * from './components/match-charts.js';
export * from './components/event-basket.js';
export * from './components/match-control.js';
export * from './components/official-desk.js';
export * from './components/ratings-modal.js';
export * from './components/leaderboards.js';
export * from './components/notifications-drawer.js';
export * from './components/admin-desk.js';
export * from './components/provider-storefront.js';
export * from './components/create-event.js';
export * from './components/event-overview.js';
export * from './components/official-calendar.js';
export * from './components/messaging.js';
export * from './components/booking-lifecycle.js';
export * from './components/reconciliation.js';
export * from './components/rfq-manager.js';
export * from './components/commerce-catalog.js';
export * from './components/tournament-ops.js';
export * from './components/match-insights.js';
export * from './components/operations-checkin.js';
export * from './components/sponsorship-auction.js';
export * from './components/officials-marketplace.js';
export * from './components/player-career.js';
export * from './components/umpire-match-desk.js';
export * from './components/cricsheet-export.js';
export * from './components/league-divisions.js';

import { CricOSApiClient, type ApiClientOptions } from './api/client.js';

export class CricOSWebApp {
  private client: CricOSApiClient;
  private container: HTMLElement | null = null;

  constructor(options: ApiClientOptions = {}) {
    this.client = new CricOSApiClient(options);
  }

  public getClient(): CricOSApiClient {
    return this.client;
  }

  public mount(containerId: string): void {
    if (typeof document === 'undefined') return;
    this.container = document.getElementById(containerId);
    if (this.container) {
      this.container.innerHTML = `
        <div class="cricos-app-shell" style="font-family:'Plus Jakarta Sans',sans-serif;color:#F8FAFC;background:#04070D;min-height:100vh;">
          <header style="padding:1rem 2rem;border-bottom:1px solid rgba(255,255,255,0.08);background:rgba(10,16,28,0.85);backdrop-filter:blur(16px);display:flex;justify-content:space-between;align-items:center;">
            <div style="font-family:'Space Grotesk',sans-serif;font-size:1.25rem;font-weight:800;letter-spacing:-0.02em;color:#00E599;display:flex;align-items:center;gap:0.5rem;">
              <span>🏏</span> CricOS <span style="font-size:0.65rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#00D2FF;background:rgba(0,210,255,0.1);border:1px solid rgba(0,210,255,0.25);padding:0.15rem 0.45rem;border-radius:999px;">Broadcast Portal</span>
            </div>
            <div id="cricos-connection-status" style="font-family:'JetBrains Mono',monospace;font-size:0.75rem;color:#94a3b8;display:flex;align-items:center;gap:0.4rem;">
              <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#00E599;box-shadow:0 0 8px #00E599;"></span>
              API: ${this.client.getBaseUrl()}
            </div>
          </header>
          <main style="max-width:1240px;margin:2rem auto;padding:0 1.5rem;">
            <div id="cricos-app-content"></div>
          </main>
        </div>
      `;
    }
  }
}
