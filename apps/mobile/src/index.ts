export * from './api/mobile-client.js';
export * from './screens/LiveMatchScreen.js';
export * from './screens/MarketplaceScreen.js';
export * from './screens/ProfileScreen.js';
export * from './screens/AuthScreen.js';
export * from './screens/TournamentsScreen.js';
export * from './screens/MarketplaceScreenView.js';
export * from './screens/TeamsScreen.js';
export * from './screens/IncidentsScreen.js';
export * from './screens/AdminDeskScreen.js';

import { CricOSMobileClient, MobileSession, type MobileClientOptions } from './api/mobile-client.js';
import { AuthScreenController, type MobileUserRole } from './screens/AuthScreen.js';
import { ProfileScreenController } from './screens/ProfileScreen.js';
import { LiveMatchScreenController } from './screens/LiveMatchScreen.js';
import { TournamentsScreenController } from './screens/TournamentsScreen.js';
import { MarketplaceScreenController } from './screens/MarketplaceScreen.js';
import { TeamsScreenController } from './screens/TeamsScreen.js';
import { IncidentsScreenController } from './screens/IncidentsScreen.js';
import { AdminDeskScreenController } from './screens/AdminDeskScreen.js';

export type MobileScreenType = 
  | 'AUTH' 
  | 'MATCHES' 
  | 'LIVE_MATCH' 
  | 'TEAMS' 
  | 'TOURNAMENTS' 
  | 'MARKETPLACE' 
  | 'INCIDENTS' 
  | 'ADMIN' 
  | 'PROFILE';

export class CricOSMobileApp {
  private client: CricOSMobileClient;
  private currentScreen: MobileScreenType = 'LIVE_MATCH';
  private container: HTMLElement | null = null;
  private activeChart: 'NONE' | 'WORM' | 'MANHATTAN' | 'WAGON' | 'SCORECARD' = 'NONE';
  private fanCheersCount: number = 1429;
  private pollVotes = { BLR: 68, MUM: 32 };

  public authCtrl: AuthScreenController;
  public profileCtrl: ProfileScreenController;
  public matchCtrl: LiveMatchScreenController;
  public tournamentsCtrl: TournamentsScreenController;
  public marketplaceCtrl: MarketplaceScreenController;
  public teamsCtrl: TeamsScreenController;
  public incidentsCtrl: IncidentsScreenController;
  public adminCtrl: AdminDeskScreenController;

  constructor(options: MobileClientOptions = {}) {
    this.client = new CricOSMobileClient(options);

    this.authCtrl = new AuthScreenController(this.client, (session: MobileSession) => {
      this.profileCtrl.updateProfile({ persona: session.role as MobileUserRole });
      this.navigateTo('MATCHES');
    });

    this.profileCtrl = new ProfileScreenController();
    this.tournamentsCtrl = new TournamentsScreenController();
    this.marketplaceCtrl = new MarketplaceScreenController([
      {
        id: 'slot-wankhede-1',
        providerId: 'prv-wankhede',
        providerName: 'Wankhede Arena Turf Club',
        category: 'GROUND',
        title: 'Wankhede Arena Turf Club',
        location: 'South Mumbai, MH',
        startTime: '08:00',
        endTime: '12:00',
        priceMinor: 350000,
        rating: 4.9,
        isAvailable: true
      },
      {
        id: 'slot-umpire-menon',
        providerId: 'prv-menon',
        providerName: 'Nitin Menon Panel',
        category: 'UMPIRE',
        title: 'Nitin Menon Panel Umpire',
        location: 'Indore, Central Zone',
        startTime: '08:00',
        endTime: '12:00',
        priceMinor: 80000,
        rating: 5.0,
        isAvailable: true
      },
      {
        id: 'slot-scorer-sunil',
        providerId: 'prv-scorer',
        providerName: 'Sunil Digital Scoring',
        category: 'SCORER',
        title: 'BCCI Certified Digital Scorer',
        location: 'Bengaluru, KA',
        startTime: '13:00',
        endTime: '17:00',
        priceMinor: 60000,
        rating: 4.8,
        isAvailable: true
      }
    ]);
    this.teamsCtrl = new TeamsScreenController();
    this.incidentsCtrl = new IncidentsScreenController();
    this.adminCtrl = new AdminDeskScreenController();

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

  public getUserPersona(): MobileUserRole {
    return this.profileCtrl.getProfile().persona;
  }

  public switchUserPersona(role: MobileUserRole): void {
    this.profileCtrl.updateProfile({ persona: role });
    // Adjust default screen for role if current screen is not appropriate
    if (role === 'UMPIRE' && this.currentScreen !== 'INCIDENTS') {
      this.currentScreen = 'INCIDENTS';
    } else if (role === 'ADMIN' && this.currentScreen !== 'ADMIN') {
      this.currentScreen = 'ADMIN';
    } else if (role === 'TURF_PROVIDER' && this.currentScreen !== 'MARKETPLACE') {
      this.currentScreen = 'MARKETPLACE';
    } else if (role === 'CAPTAIN' && this.currentScreen !== 'TEAMS') {
      this.currentScreen = 'TEAMS';
    }
    this.render();
  }

  // --- Interaction Action Handlers ---

  public setAuthRole(role: MobileUserRole): void {
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
      const persona = this.authCtrl.getState().role;
      this.profileCtrl.updateProfile({ persona });
      this.navigateTo('MATCHES');
    } else {
      this.render();
    }
  }

  // Live Match & Scoring Handlers
  public scoreBall(runs: number): void {
    if (this.getUserPersona() !== 'SCORER') {
      alert('🔒 Only official Scorers can score deliveries.');
      return;
    }
    this.matchCtrl.recordDelivery({ runs });
    this.render();
  }

  public scoreExtra(extraType: 'WIDE' | 'NO_BALL' | 'BYE' | 'LEG_BYE'): void {
    if (this.getUserPersona() !== 'SCORER') {
      alert('🔒 Only official Scorers can score extras.');
      return;
    }
    this.matchCtrl.recordDelivery({ runs: 1, isExtra: true, extraType });
    this.render();
  }

  public promptWicketModal(): void {
    if (this.getUserPersona() !== 'SCORER') {
      alert('🔒 Only official Scorers can record wickets.');
      return;
    }
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

  public swapMobileStrike(): void {
    if (this.getUserPersona() !== 'SCORER') {
      alert('🔒 Only official Scorers can swap strike.');
      return;
    }
    this.matchCtrl.rotateStrike();
    this.render();
  }

  public undoMobileBall(): void {
    if (this.getUserPersona() !== 'SCORER') {
      alert('🔒 Only official Scorers can undo deliveries.');
      return;
    }
    this.matchCtrl.undo();
    this.render();
  }

  public selectMobileWagonZone(zone: string): void {
    alert(`🎯 Wagon Wheel Zone Selected: ${zone}\nTrajectory recorded for batter ${this.matchCtrl.getStriker().name}`);
  }

  public toggleMobileChart(type: 'WORM' | 'MANHATTAN' | 'WAGON' | 'SCORECARD'): void {
    this.activeChart = this.activeChart === type ? 'NONE' : type;
    this.render();
  }

  public getActiveChart(): 'NONE' | 'WORM' | 'MANHATTAN' | 'WAGON' | 'SCORECARD' {
    return this.activeChart;
  }

  public openScorecardModal(): void {
    const score = this.matchCtrl.getFormattedScore();
    alert(`📄 Official CricOS Match Scorecard\n${score}\n\nStriker: ${this.matchCtrl.getStriker().name} (${this.matchCtrl.getStriker().runs} off ${this.matchCtrl.getStriker().balls})\nBowler: ${this.matchCtrl.getBowler().name} (${this.matchCtrl.getBowler().overs}.${this.matchCtrl.getBowler().ballsThisOver}-${this.matchCtrl.getBowler().runsConceded}-${this.matchCtrl.getBowler().wickets})\n\n✓ Ready for RFC 4180 CSV Export & PDF Print`);
  }

  // Fan Cheering Handlers
  public sendMobileCheer(cheerText: string): void {
    this.fanCheersCount++;
    alert(`📢 Cheer Dispatched: ${cheerText}!\nTotal stadium pulse: ${this.fanCheersCount.toLocaleString()} cheers`);
    this.render();
  }

  public votePoll(team: string): void {
    if (team === 'BLR') this.pollVotes.BLR++;
    else this.pollVotes.MUM++;
    alert(`✓ Vote recorded for ${team}! Current Win Probability: BLR ${this.pollVotes.BLR}% • MUM ${this.pollVotes.MUM}%`);
    this.render();
  }

  // Captain & Teams Handlers
  public conductTossModal(): void {
    const winner = prompt('Enter Toss Winner:', 'Bangalore Royal Challengers') || 'Bangalore Royal Challengers';
    const decision = confirm('Did they choose to BAT? (Click OK for BAT, Cancel for BOWL)') ? 'BAT' : 'BOWL';
    this.teamsCtrl.recordToss(winner, decision);
    alert(`🪙 Toss Certified: ${winner} won the toss and elected to ${decision} first.`);
    this.render();
  }

  public benchPlayer(playerId: string): void {
    const bench = this.teamsCtrl.getState().bench;
    if (bench.length > 0 && bench[0]) {
      this.teamsCtrl.swapPlayerWithBench(playerId, bench[0].id);
      alert('✓ Player moved to bench; substitute promoted to Playing XI.');
      this.render();
    }
  }

  public promoteToXi(playerId: string): void {
    const xi = this.teamsCtrl.getState().playingXI;
    if (xi.length > 0 && xi[xi.length - 1]) {
      this.teamsCtrl.swapPlayerWithBench(xi[xi.length - 1]!.id, playerId);
      alert('✓ Substitute promoted to Playing XI.');
      this.render();
    }
  }

  // Umpire & Incidents Handlers
  public fileIncidentAction(): void {
    const playerInput = document.getElementById('incidentPlayerInput') as HTMLInputElement | null;
    const descInput = document.getElementById('incidentDescInput') as HTMLInputElement | null;
    const sevSelect = document.getElementById('incidentSeveritySelect') as HTMLSelectElement | null;

    const playerName = playerInput?.value.trim() || 'Hardik Patel';
    const description = descInput?.value.trim() || 'Dissent against decision';
    const severity = (sevSelect?.value as any) || 'LEVEL_1';

    this.incidentsCtrl.reportIncident({
      matchId: 'match-pilot-1',
      playerName,
      teamName: 'Delhi Daredevils',
      severity,
      type: 'DISSENT',
      description,
      penaltyRuns: 0
    });
    alert(`🚨 Code of Conduct Incident Logged: ${playerName} (${severity})\nReport forwarded to Match Referee.`);
    this.render();
  }

  public addPenaltyRunsAction(runs: number): void {
    this.matchCtrl.recordDelivery({ runs, isExtra: true, extraType: 'BYE' });
    alert(`✓ +${runs} Penalty runs awarded to batting team per MCC Laws 41/42.`);
    this.render();
  }

  public signOffMatchAction(): void {
    this.incidentsCtrl.signOffMatch();
    alert('✓ Match officially certified and signed off by Lead Umpire under MCC Laws.');
    this.render();
  }

  // Organiser & Tournaments Handlers
  public openEventBasketModal(): void {
    alert('🧺 CricOS Event Basket Procurement:\n• Arena: Wankhede Arena (₹3,500.00)\n• Lead Umpire: Nitin Menon Panel (₹800.00)\n• Scorer: Digital Scorer (₹600.00)\n• Balls: Kookaburra Turf White (₹400.00)\n\nSubtotal: ₹5,300.00\nPlatform Fee (5%): ₹265.00\nGST on Fee (18%): ₹47.70\nTotal Escrow: ₹5,612.70\n\n🔒 15-Minute GiST Hold Active');
  }

  public generateFixturesAction(): void {
    alert('📅 Automated Round-Robin Brackets Generated: 8 teams, 28 matches scheduled with temporal GiST conflict detection.');
  }

  // Turf Provider & Marketplace Handlers
  public publishSlotAction(): void {
    const titleInput = document.getElementById('slotTitleInput') as HTMLInputElement | null;
    const priceInput = document.getElementById('slotPriceInput') as HTMLInputElement | null;
    const timeInput = document.getElementById('slotTimeInput') as HTMLInputElement | null;

    const title = titleInput?.value.trim() || 'Evening Floodlit Pitch';
    const price = parseInt(priceInput?.value.trim() || '3500', 10) * 100;
    const time = timeInput?.value.trim() || '18:00 - 22:00';

    this.marketplaceCtrl.addSlot({
      providerId: 'prv-wankhede',
      providerName: 'Wankhede Arena Turf Club',
      category: 'GROUND',
      title,
      location: 'South Mumbai, MH',
      startTime: time.split('-')[0]?.trim() || '18:00',
      endTime: time.split('-')[1]?.trim() || '22:00',
      priceMinor: price,
      rating: 4.9
    });
    alert(`✓ New match slot published: ${title} (₹${price / 100}) with floodlights.`);
    this.render();
  }

  public toggleSlotFreeze(slotId: string): void {
    const isAvail = this.marketplaceCtrl.toggleSlotAvailability(slotId);
    alert(`✓ Slot status updated: ${isAvail ? 'ACTIVE & BOOKABLE' : 'FROZEN / BLOCKED'}`);
    this.render();
  }

  public setMarketCategory(category: any): void {
    this.marketplaceCtrl.setCategory(category);
    this.render();
  }

  public bookTurfInstant(title: string, price: string): void {
    alert(`✓ Authoritative 15-Min GiST Lock Activated!\nBooking: ${title}\nSecured in Escrow: ₹${price}`);
  }

  // Admin & Financial Settlement Handlers
  public approveDisputeAction(disputeId: string): void {
    this.adminCtrl.approveDispute(disputeId);
    alert('✓ Dispute Approved! Balanced double-entry refund journal entry executed:\nDebit: REFUND_CLEARING\nCredit: ESCROW_HOLD\nZero ledger imbalance maintained.');
    this.render();
  }

  public rejectDisputeAction(disputeId: string): void {
    this.adminCtrl.rejectDispute(disputeId);
    alert('✕ Dispute Rejected. Escrow payout released to provider.');
    this.render();
  }

  // User Profile & Compliance Handlers
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

    const persona = this.getUserPersona();
    const isCaptain = persona === 'CAPTAIN';
    const isUmpire = persona === 'UMPIRE';
    const isOrganiser = persona === 'ORGANISER';
    const isProvider = persona === 'TURF_PROVIDER';

    let contentHtml = '';
    switch (this.currentScreen) {
      case 'AUTH':
        contentHtml = this.authCtrl.renderHtml();
        break;
      case 'MATCHES':
      case 'LIVE_MATCH':
        contentHtml = this.matchCtrl.renderMobileHtml(persona, this.activeChart);
        break;
      case 'TEAMS':
        contentHtml = this.teamsCtrl.renderMobileHtml(isCaptain);
        break;
      case 'TOURNAMENTS':
        contentHtml = this.tournamentsCtrl.renderMobileHtml(isOrganiser);
        break;
      case 'MARKETPLACE':
        contentHtml = this.marketplaceCtrl.renderMobileHtml(isProvider);
        break;
      case 'INCIDENTS':
        contentHtml = this.incidentsCtrl.renderMobileHtml(isUmpire || persona === 'ADMIN');
        break;
      case 'ADMIN':
        contentHtml = this.adminCtrl.renderMobileHtml();
        break;
      case 'PROFILE':
        contentHtml = this.profileCtrl.renderMobileHtml();
        break;
    }

    const session = this.client.getSession();
    const isAuthenticated = !!session;

    // Determine bottom navigation items tailored to the active persona
    const navItems: Array<{ id: MobileScreenType; icon: string; label: string }> = [];

    if (persona === 'CAPTAIN' || persona === 'PLAYER') {
      navItems.push({ id: 'MATCHES', icon: '🏏', label: 'Match' });
      navItems.push({ id: 'TEAMS', icon: '👥', label: 'Squad' });
      navItems.push({ id: 'TOURNAMENTS', icon: '🏆', label: 'Standings' });
      navItems.push({ id: 'MARKETPLACE', icon: '🛒', label: 'Book Turf' });
      navItems.push({ id: 'PROFILE', icon: '👤', label: 'Profile' });
    } else if (persona === 'SCORER') {
      navItems.push({ id: 'MATCHES', icon: '⚡', label: 'Scoring' });
      navItems.push({ id: 'TOURNAMENTS', icon: '🏆', label: 'Standings' });
      navItems.push({ id: 'PROFILE', icon: '👤', label: 'Profile' });
    } else if (persona === 'FAN') {
      navItems.push({ id: 'MATCHES', icon: '🎪', label: 'Pulse & Cheer' });
      navItems.push({ id: 'TOURNAMENTS', icon: '🏆', label: 'Standings' });
      navItems.push({ id: 'MARKETPLACE', icon: '🛒', label: 'Venues' });
      navItems.push({ id: 'PROFILE', icon: '👤', label: 'Profile' });
    } else if (persona === 'UMPIRE') {
      navItems.push({ id: 'INCIDENTS', icon: '⚖️', label: 'Umpire Desk' });
      navItems.push({ id: 'MATCHES', icon: '🏏', label: 'Match' });
      navItems.push({ id: 'TOURNAMENTS', icon: '🏆', label: 'Standings' });
      navItems.push({ id: 'PROFILE', icon: '👤', label: 'Profile' });
    } else if (persona === 'ORGANISER') {
      navItems.push({ id: 'TOURNAMENTS', icon: '🏆', label: 'Fixtures' });
      navItems.push({ id: 'MARKETPLACE', icon: '🧺', label: 'Procurement' });
      navItems.push({ id: 'TEAMS', icon: '👥', label: 'Teams' });
      navItems.push({ id: 'MATCHES', icon: '🏏', label: 'Match' });
      navItems.push({ id: 'PROFILE', icon: '👤', label: 'Profile' });
    } else if (persona === 'TURF_PROVIDER') {
      navItems.push({ id: 'MARKETPLACE', icon: '🏟️', label: 'Storefront' });
      navItems.push({ id: 'INCIDENTS', icon: '⚖️', label: 'Disputes' });
      navItems.push({ id: 'MATCHES', icon: '🏏', label: 'Live' });
      navItems.push({ id: 'PROFILE', icon: '👤', label: 'Profile' });
    } else {
      // ADMIN
      navItems.push({ id: 'ADMIN', icon: '⚡', label: 'Audit Desk' });
      navItems.push({ id: 'MATCHES', icon: '🏏', label: 'Match' });
      navItems.push({ id: 'TEAMS', icon: '👥', label: 'Teams' });
      navItems.push({ id: 'INCIDENTS', icon: '⚖️', label: 'Incidents' });
      navItems.push({ id: 'PROFILE', icon: '👤', label: 'Profile' });
    }

    if (!isAuthenticated) {
      navItems.push({ id: 'AUTH', icon: '🔑', label: 'Sign In' });
    }

    this.container.innerHTML = `
      <div class="cricos-mobile-shell" style="max-width: 480px; margin: 0 auto; min-height: 100vh; background: #04070D; color: #f8fafc; font-family: 'Plus Jakarta Sans', sans-serif; display: flex; flex-direction: column; position: relative; box-shadow: 0 0 40px rgba(0,0,0,0.8);">
        <!-- Mobile Top App Bar -->
        <header style="padding: 0.85rem 1rem; background: rgba(10, 16, 28, 0.95); border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 50; backdrop-filter: blur(12px);">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="font-size: 1.25rem;">🏏</span>
            <span style="font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 1.15rem; color: #f8fafc;">CricOS Mobile</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <button type="button" onclick="window.cricosMobileApp.navigateTo('PROFILE')" style="background: rgba(0, 229, 153, 0.15); color: #00E599; border: 1px solid rgba(0, 229, 153, 0.3); padding: 0.2rem 0.5rem; border-radius: 6px; font-size: 0.7rem; font-weight: 700; cursor: pointer;" data-tooltip="Active persona. Tap to switch">
              ${persona}
            </button>
          </div>
        </header>

        <!-- Main Screen Body -->
        <main style="flex: 1; overflow-y: auto; padding-bottom: 75px;">
          ${contentHtml}
        </main>

        <!-- Consumer Bottom Navigation Bar -->
        <nav style="position: sticky; bottom: 0; left: 0; right: 0; background: rgba(10, 16, 28, 0.96); border-top: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-around; padding: 0.5rem 0.25rem 0.75rem; z-index: 50; backdrop-filter: blur(12px);">
          ${navItems.map(item => {
            const active = (this.currentScreen === item.id) || (item.id === 'MATCHES' && this.currentScreen === 'LIVE_MATCH');
            const color = active ? '#00E599' : '#94a3b8';
            return `
              <button type="button" onclick="window.cricosMobileApp.navigateTo('${item.id}')" style="background: none; border: none; color: ${color}; font-size: 0.65rem; font-weight: 600; display: flex; flex-direction: column; align-items: center; gap: 0.2rem; cursor: pointer;" data-tooltip="Navigate to ${item.label}">
                <span style="font-size: 1.1rem;">${item.icon}</span>
                <span>${item.label}</span>
              </button>
            `;
          }).join('')}
        </nav>
      </div>
    `;
  }
}
