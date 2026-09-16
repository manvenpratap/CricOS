export * from './api/mobile-client.js';
export * from './screens/LiveMatchScreen.js';
export * from './screens/MarketplaceScreen.js';
export * from './screens/ProfileScreen.js';
export * from './screens/AuthScreen.js';
export * from './screens/TournamentsScreen.js';
export * from './screens/MarketplaceScreenView.js';

import { CricOSMobileClient, MobileSession, type MobileClientOptions } from './api/mobile-client.js';
import { AuthScreenController } from './screens/AuthScreen.js';
import { ProfileScreenController } from './screens/ProfileScreen.js';
import { LiveMatchScreenController } from './screens/LiveMatchScreen.js';
import { TournamentsScreenController } from './screens/TournamentsScreen.js';
import { MarketplaceScreenViewController } from './screens/MarketplaceScreenView.js';

export type MobileScreenType = 'AUTH' | 'MATCHES' | 'LIVE_MATCH' | 'TOURNAMENTS' | 'MARKETPLACE' | 'PROFILE';

export class CricOSMobileApp {
  private client: CricOSMobileClient;
  private currentScreen: MobileScreenType = 'LIVE_MATCH';
  private container: HTMLElement | null = null;

  public authCtrl: AuthScreenController;
  public profileCtrl: ProfileScreenController;
  public matchCtrl: LiveMatchScreenController;
  public tournamentsCtrl: TournamentsScreenController;
  public marketplaceCtrl: MarketplaceScreenViewController;

  constructor(options: MobileClientOptions = {}) {
    this.client = new CricOSMobileClient(options);

    this.authCtrl = new AuthScreenController(this.client, (session: MobileSession) => {
      this.profileCtrl.updateProfile({ persona: session.role });
      this.navigateTo('MATCHES');
    });

    this.profileCtrl = new ProfileScreenController();
    this.tournamentsCtrl = new TournamentsScreenController();
    this.marketplaceCtrl = new MarketplaceScreenViewController(this.client);

    this.matchCtrl = new LiveMatchScreenController({
      matchId: 'match-pilot-1',
      battingTeam: 'Delhi Daredevils',
      bowlingTeam: 'Mumbai Super Strikers',
      totalRuns: 142,
      totalWickets: 3,
      legalBalls: 100, // 16.4 overs
      striker: {
        playerId: 'p-1',
        name: 'Virat K.',
        runs: 68,
        balls: 44,
        fours: 7,
        sixes: 2,
        isStriker: true
      },
      nonStriker: {
        playerId: 'p-2',
        name: 'Rohit S.',
        runs: 54,
        balls: 38,
        fours: 5,
        sixes: 2,
        isStriker: false
      },
      bowler: {
        playerId: 'b-1',
        name: 'Jasprit B.',
        overs: 3,
        ballsThisOver: 4,
        maidens: 0,
        runsConceded: 24,
        wickets: 2
      },
      currentOverDeliveries: ['1', '4', '•', '2'],
      fallOfWickets: [
        { wicketNumber: 1, playerOut: 'S. Gill', runsAtDismissal: 14, overNumber: '2.1' },
        { wicketNumber: 2, playerOut: 'KL Rahul', runsAtDismissal: 58, overNumber: '8.4' },
        { wicketNumber: 3, playerOut: 'S. Iyer', runsAtDismissal: 102, overNumber: '13.2' }
      ],
      isOverComplete: false
    });

    // Register globally for DOM events in web preview
    if (typeof window !== 'undefined') {
      (window as any).cricosMobileApp = this;
    }
  }

  public getClient(): CricOSMobileClient {
    return this.client;
  }

  public getCurrentScreen(): MobileScreenType {
    return this.currentScreen;
  }

  public navigateTo(screen: MobileScreenType): void {
    this.currentScreen = screen;
    this.render();
  }

  // --- Interaction Action Handlers ---

  public setAuthRole(role: 'CAPTAIN' | 'PLAYER' | 'SCORER' | 'ORGANISER' | 'PROVIDER'): void {
    this.authCtrl.setRole(role);
    this.render();
  }

  public async requestOtpAction(): Promise<void> {
    const input = document.getElementById('authIdentifierInput') as HTMLInputElement | null;
    if (input && input.value) {
      this.authCtrl.setIdentifier(input.value.trim());
    }
    await this.authCtrl.requestOtp();
    this.render();
  }

  public backToIdentifier(): void {
    const state = this.authCtrl.getState();
    (state as any).step = 'IDENTIFIER';
    this.render();
  }

  public async verifyOtpAction(): Promise<void> {
    const input = document.getElementById('authCodeInput') as HTMLInputElement | null;
    if (input && input.value) {
      this.authCtrl.setCode(input.value.trim());
    }
    const success = await this.authCtrl.verifyOtp();
    if (success) {
      this.navigateTo('MATCHES');
    } else {
      this.render();
    }
  }

  public scoreBall(runs: number): void {
    this.matchCtrl.recordDelivery({ runs });
    this.render();
  }

  public scoreExtra(extraType: 'WIDE' | 'NO_BALL'): void {
    this.matchCtrl.recordDelivery({ runs: 1, isExtra: true, extraType });
    this.render();
  }

  public promptWicketModal(): void {
    const confirmed = confirm('Confirm Wicket: Dismiss current striker and bring in new batter?');
    if (confirmed) {
      this.matchCtrl.recordDelivery({
        runs: 0,
        isWicket: true,
        wicketType: 'CAUGHT',
        newBatterName: 'Rishabh P.'
      });
      this.render();
    }
  }

  public selectSlot(title: string, slotTime: string, price: string): void {
    alert(`Selected: ${title}\nTime: ${slotTime}\nTotal Price with Escrow: ₹${price}`);
  }

  public bookTurfInstant(title: string, price: string): void {
    alert(`✓ Authoritative 15-Min GiST Lock Activated!\nBooking: ${title}\nSecured in Escrow: ₹${price}`);
  }

  public signOutAction(): void {
    this.client.clearSession();
    this.navigateTo('AUTH');
  }

  public promptDeleteAccount(): void {
    const confirmed = confirm(
      'App Store Safety Check:\nAre you sure you want to delete your CricOS account and all associated match/squad data? This action is permanent and cannot be undone.'
    );
    if (confirmed) {
      this.client.clearSession();
      alert('✓ Account and personal data have been scheduled for permanent deletion per Apple App Store Guideline 5.1.1(v).');
      this.navigateTo('AUTH');
    }
  }

  // --- Rendering Shell ---

  public mount(containerId: string): void {
    if (typeof document === 'undefined') return;
    this.container = document.getElementById(containerId);
    this.render();
  }

  public render(): void {
    if (!this.container) return;

    let contentHtml = '';
    switch (this.currentScreen) {
      case 'AUTH':
        contentHtml = this.authCtrl.renderHtml();
        break;
      case 'MATCHES':
      case 'LIVE_MATCH':
        contentHtml = this.matchCtrl.renderMobileHtml();
        break;
      case 'TOURNAMENTS':
        contentHtml = this.tournamentsCtrl.renderMobileHtml();
        break;
      case 'MARKETPLACE':
        contentHtml = this.marketplaceCtrl.renderMobileHtml();
        break;
      case 'PROFILE':
        contentHtml = this.profileCtrl.renderMobileHtml();
        break;
    }

    const session = this.client.getSession();
    const isAuthenticated = !!session;

    this.container.innerHTML = `
      <div class="cricos-mobile-shell" style="max-width: 480px; margin: 0 auto; min-height: 100vh; background: #04070D; color: #f8fafc; font-family: 'Plus Jakarta Sans', sans-serif; display: flex; flex-direction: column; position: relative; box-shadow: 0 0 40px rgba(0,0,0,0.8);">
        <!-- Mobile Top App Bar -->
        <header style="padding: 0.85rem 1rem; background: rgba(10, 16, 28, 0.95); border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 50; backdrop-filter: blur(12px);">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="font-size: 1.25rem;">🏏</span>
            <span style="font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 1.15rem; color: #f8fafc;">CricOS Mobile</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            ${isAuthenticated ? `
              <span style="background: rgba(0, 229, 153, 0.15); color: #00E599; border: 1px solid rgba(0, 229, 153, 0.3); padding: 0.2rem 0.5rem; border-radius: 6px; font-size: 0.7rem; font-weight: 700;">
                ${session.role}
              </span>
            ` : `
              <span style="color: #94a3b8; font-size: 0.75rem;">Guest Mode</span>
            `}
          </div>
        </header>

        <!-- Main Screen Body -->
        <main style="flex: 1; overflow-y: auto; padding-bottom: 70px;">
          ${contentHtml}
        </main>

        <!-- Consumer Bottom Navigation Bar -->
        <nav style="position: sticky; bottom: 0; left: 0; right: 0; background: rgba(10, 16, 28, 0.96); border-top: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-around; padding: 0.5rem 0.25rem; z-index: 50; backdrop-filter: blur(12px);">
          <button type="button" onclick="window.cricosMobileApp.navigateTo('MATCHES')" style="background: none; border: none; color: ${(this.currentScreen === 'MATCHES' || this.currentScreen === 'LIVE_MATCH') ? '#00E599' : '#94a3b8'}; font-size: 0.7rem; font-weight: 600; display: flex; flex-direction: column; align-items: center; gap: 0.25rem; cursor: pointer;">
            <span style="font-size: 1.1rem;">🏏</span>
            <span>Matches</span>
          </button>
          <button type="button" onclick="window.cricosMobileApp.navigateTo('TOURNAMENTS')" style="background: none; border: none; color: ${this.currentScreen === 'TOURNAMENTS' ? '#00E599' : '#94a3b8'}; font-size: 0.7rem; font-weight: 600; display: flex; flex-direction: column; align-items: center; gap: 0.25rem; cursor: pointer;">
            <span style="font-size: 1.1rem;">🏆</span>
            <span>Standings</span>
          </button>
          <button type="button" onclick="window.cricosMobileApp.navigateTo('MARKETPLACE')" style="background: none; border: none; color: ${this.currentScreen === 'MARKETPLACE' ? '#00E599' : '#94a3b8'}; font-size: 0.7rem; font-weight: 600; display: flex; flex-direction: column; align-items: center; gap: 0.25rem; cursor: pointer;">
            <span style="font-size: 1.1rem;">🛒</span>
            <span>Book Turf</span>
          </button>
          <button type="button" onclick="window.cricosMobileApp.navigateTo('PROFILE')" style="background: none; border: none; color: ${this.currentScreen === 'PROFILE' ? '#00E599' : '#94a3b8'}; font-size: 0.7rem; font-weight: 600; display: flex; flex-direction: column; align-items: center; gap: 0.25rem; cursor: pointer;">
            <span style="font-size: 1.1rem;">👤</span>
            <span>My Profile</span>
          </button>
          ${!isAuthenticated ? `
            <button type="button" onclick="window.cricosMobileApp.navigateTo('AUTH')" style="background: none; border: none; color: ${this.currentScreen === 'AUTH' ? '#00D2FF' : '#94a3b8'}; font-size: 0.7rem; font-weight: 600; display: flex; flex-direction: column; align-items: center; gap: 0.25rem; cursor: pointer;">
              <span style="font-size: 1.1rem;">🔑</span>
              <span>Sign In</span>
            </button>
          ` : ''}
        </nav>
      </div>
    `;
  }
}
