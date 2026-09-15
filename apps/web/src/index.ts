export * from './api/client.js';
export * from './components/scoreboard.js';
export * from './components/marketplace.js';
export * from './components/disputes.js';

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
        <div class="cricos-app-shell" style="font-family:'Inter',sans-serif;color:#f1f5f9;background:#090d16;min-height:100vh;">
          <header style="padding:1rem 2rem;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;justify-content:space-between;align-items:center;">
            <div style="font-size:1.25rem;font-weight:700;color:#10b981;">🏏 CricOS Web Portal</div>
            <div id="cricos-connection-status" style="font-size:0.8rem;color:#94a3b8;">API: ${this.client.getBaseUrl()}</div>
          </header>
          <main style="max-width:1200px;margin:2rem auto;padding:0 1.5rem;">
            <div id="cricos-app-content"></div>
          </main>
        </div>
      `;
    }
  }
}
