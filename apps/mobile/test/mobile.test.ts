import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  CricOSMobileClient,
  LiveMatchScreenController,
  MarketplaceScreenController,
  ProfileScreenController,
  TeamsScreenController,
  IncidentsScreenController,
  AdminDeskScreenController,
  TournamentsScreenController,
  AuthScreenController,
  CricOSMobileApp,
  type LiveMatchScreenState,
  type PlayerProfileData,
  type MobileUserRole,
  type TournamentStage
} from '../dist/index.js';

describe('CricOS Mobile Client Application (@cricket-platform/mobile)', () => {
  describe('1. Mobile API Client, Session Caching & Offline Queueing', () => {
    it('manages mobile session authentication and expiry', () => {
      const client = new CricOSMobileClient({ baseUrl: 'http://localhost:3000' });
      assert.strictEqual(client.isAuthenticated(), false);

      const activeSession = {
        token: 'mobile-jwt-token',
        userId: 'usr-mob-1',
        role: 'CAPTAIN' as const,
        expiresAt: Date.now() + 3600000 // 1 hour ahead
      };
      client.setSession(activeSession);
      assert.strictEqual(client.isAuthenticated(), true);
      assert.strictEqual(client.getSession()?.userId, 'usr-mob-1');

      client.clearSession();
      assert.strictEqual(client.isAuthenticated(), false);
      assert.strictEqual(client.getSession(), null);
    });

    it('formats integer minor units accurately into INR currency strings', () => {
      assert.strictEqual(CricOSMobileClient.formatMinorUnits(500000, 'INR'), '₹5,000.00');
      assert.strictEqual(CricOSMobileClient.formatMinorUnits(123456, 'INR'), '₹1,234.56');
      assert.strictEqual(CricOSMobileClient.formatMinorUnits(7500, 'INR'), '₹75.00');
    });

    it('queues offline requests and inspects queue state', () => {
      const client = new CricOSMobileClient({ isOnline: false });
      assert.strictEqual(client.getOnlineStatus(), false);

      const item = client.queueOfflineAction('/api/v1/scoring/deliveries', 'POST', { runs: 4 });
      assert.strictEqual(client.getOfflineQueue().length, 1);
      assert.strictEqual(client.getOfflineQueue()[0]?.endpoint, '/api/v1/scoring/deliveries');

      client.clearOfflineQueue();
      assert.strictEqual(client.getOfflineQueue().length, 0);
    });
  });

  describe('2. Live Match Screen Controller & Strike Accounting', () => {
    const createSampleState = (): LiveMatchScreenState => ({
      matchId: 'match-mob-101',
      battingTeam: 'Mumbai Indians',
      bowlingTeam: 'Chennai Super Kings',
      totalRuns: 45,
      totalWickets: 1,
      legalBalls: 24, // 4.0 overs completed
      striker: {
        playerId: 'p-1',
        name: 'Rohit',
        runs: 28,
        balls: 15,
        fours: 4,
        sixes: 1,
        isStriker: true
      },
      nonStriker: {
        playerId: 'p-2',
        name: 'Surya',
        runs: 16,
        balls: 9,
        fours: 2,
        sixes: 1,
        isStriker: false
      },
      bowler: {
        playerId: 'p-3',
        name: 'Deepak',
        overs: 2,
        ballsThisOver: 0,
        maidens: 0,
        runsConceded: 18,
        wickets: 1
      },
      currentOverDeliveries: [],
      fallOfWickets: [
        { wicketNumber: 1, playerOut: 'Ishan', runsAtDismissal: 20, overNumber: '2.1' }
      ],
      isOverComplete: false
    });

    it('rotates strike on odd runs (single)', () => {
      const controller = new LiveMatchScreenController(createSampleState());
      assert.strictEqual(controller.getStriker().name, 'Rohit');

      controller.recordDelivery({ runs: 1 });
      // Total score updated
      assert.strictEqual(controller.getState().totalRuns, 46);
      // Rohit faced ball, scored 1
      assert.strictEqual(controller.getNonStriker().name, 'Rohit');
      assert.strictEqual(controller.getNonStriker().runs, 29);
      // Surya is now striker
      assert.strictEqual(controller.getStriker().name, 'Surya');
      assert.strictEqual(controller.getState().currentOverDeliveries[0], '1');
    });

    it('does not rotate strike on boundary four or six', () => {
      const controller = new LiveMatchScreenController(createSampleState());
      controller.recordDelivery({ runs: 4 });
      assert.strictEqual(controller.getStriker().name, 'Rohit');
      assert.strictEqual(controller.getStriker().runs, 32);
      assert.strictEqual(controller.getStriker().fours, 5);
      assert.strictEqual(controller.getState().currentOverDeliveries[0], '4');
    });

    it('handles wicket fall and substitutes new batter', () => {
      const controller = new LiveMatchScreenController(createSampleState());
      controller.recordDelivery({
        runs: 0,
        isWicket: true,
        wicketType: 'BOWLED',
        newBatterId: 'p-4',
        newBatterName: 'Tilak'
      });

      const state = controller.getState();
      assert.strictEqual(state.totalWickets, 2);
      assert.strictEqual(state.fallOfWickets.length, 2);
      assert.strictEqual(state.fallOfWickets[1]?.playerOut, 'Rohit');
      assert.strictEqual(controller.getStriker().name, 'Tilak');
      assert.strictEqual(controller.getStriker().runs, 0);
      assert.strictEqual(state.currentOverDeliveries[0], 'W');
    });

    it('completes over on 6 legal deliveries and rotates strike', () => {
      const controller = new LiveMatchScreenController(createSampleState());
      // Bowl 6 dot balls
      for (let i = 0; i < 6; i++) {
        controller.recordDelivery({ runs: 0 });
      }

      const state = controller.getState();
      assert.strictEqual(state.isOverComplete, true);
      assert.strictEqual(state.bowler.overs, 3);
      assert.strictEqual(state.bowler.maidens, 1);
      // Strike rotates at the end of the over
      assert.strictEqual(controller.getStriker().name, 'Surya');
    });

    it('supports undoing a delivery', () => {
      const controller = new LiveMatchScreenController(createSampleState());
      controller.recordDelivery({ runs: 6 });
      assert.strictEqual(controller.getState().totalRuns, 51);

      controller.undo();
      assert.strictEqual(controller.getState().totalRuns, 45);
    });

    it('renders accessible mobile HTML with tooltips', () => {
      const controller = new LiveMatchScreenController(createSampleState());
      const html = controller.renderMobileHtml();
      assert.ok(html.includes('data-tooltip="Active striker on strike"'));
      assert.ok(html.includes('data-tooltip="Non-striker at bowler\'s end"'));
      assert.ok(html.includes('data-tooltip="Current Bowler Figures"'));
      assert.ok(html.includes('Rohit'));
    });
  });

  describe('3. Marketplace Screen Controller & Slot Booking', () => {
    const mockSlots = [
      {
        id: 'slot-1',
        providerId: 'prv-1',
        providerName: 'Eden Gardens',
        category: 'GROUND' as const,
        title: 'Eden Pitch 1 Evening',
        location: 'Kolkata, WB',
        startTime: '18:00',
        endTime: '22:00',
        priceMinor: 400000, // ₹4,000
        rating: 4.8,
        isAvailable: true
      },
      {
        id: 'slot-2',
        providerId: 'prv-2',
        providerName: 'Anil Umpire',
        category: 'UMPIRE' as const,
        title: 'BCCI Level 2 Umpiring',
        location: 'Kolkata, WB',
        startTime: '18:00',
        endTime: '22:00',
        priceMinor: 150000, // ₹1,500
        rating: 4.9,
        isAvailable: true
      }
    ];

    it('calculates commercial fee breakdown with 5% platform fee and 18% GST', () => {
      const controller = new MarketplaceScreenController(mockSlots);
      // base: 400000
      // fee: 20000
      // gst: 18% of 420000 = 75600
      // total: 495600
      const breakdown = controller.calculateBreakdown(400000);
      assert.strictEqual(breakdown.baseMinor, 400000);
      assert.strictEqual(breakdown.platformFeeMinor, 20000);
      assert.strictEqual(breakdown.gstMinor, 75600);
      assert.strictEqual(breakdown.totalMinor, 495600);
    });

    it('filters slots by category and handles booking lifecycle', () => {
      const controller = new MarketplaceScreenController(mockSlots);
      assert.strictEqual(controller.getFilteredSlots().length, 2);

      controller.setCategory('UMPIRE');
      assert.strictEqual(controller.getFilteredSlots().length, 1);
      assert.strictEqual(controller.getFilteredSlots()[0]?.category, 'UMPIRE');

      const receipt = controller.bookSlot('slot-2');
      assert.strictEqual(receipt.status, 'CONFIRMED');
      assert.strictEqual(receipt.providerName, 'Anil Umpire');

      // Attempting to book again throws
      assert.throws(() => controller.bookSlot('slot-2'), /already booked/);
    });

    it('renders mobile marketplace HTML with accessible tooltips', () => {
      const controller = new MarketplaceScreenController(mockSlots);
      const html = controller.renderMobileHtml();
      assert.ok(html.includes('Eden Pitch 1'));
      assert.ok(html.includes('data-tooltip'));
      assert.ok(html.includes('Book Venues & Umpires'));
    });
  });

  describe('4. Profile Screen Controller & Career Figures', () => {
    const sampleProfile: PlayerProfileData = {
      id: 'ply-10',
      name: 'Virat Kohli',
      role: 'BATTER',
      teamName: 'Royal Challengers',
      jerseyNumber: 18,
      batting: {
        matches: 50,
        innings: 48,
        runs: 2150,
        ballsFaced: 1600,
        notOuts: 8,
        highestScore: 113,
        centuries: 5,
        fifties: 15,
        fours: 210,
        sixes: 65
      },
      bowling: {
        matches: 50,
        overs: 18,
        maidens: 0,
        runsConceded: 144,
        wickets: 4,
        bestBowling: '2/25'
      }
    };

    it('computes batting average and strike rate accurately', () => {
      const controller = new ProfileScreenController(sampleProfile);
      // outs = 48 - 8 = 40. average = 2150 / 40 = 53.75
      assert.strictEqual(controller.getBattingAverage(), '53.75');

      // strike rate = (2150 / 1600) * 100 = 134.38
      assert.strictEqual(controller.getBattingStrikeRate(), '134.38');
    });

    it('computes bowling economy and bowling average accurately', () => {
      const controller = new ProfileScreenController(sampleProfile);
      // economy = 144 / 18 = 8.00
      assert.strictEqual(controller.getBowlingEconomy(), '8.00');

      // bowling average = 144 / 4 = 36.00
      assert.strictEqual(controller.getBowlingAverage(), '36.00');
    });

    it('renders profile HTML with accessible data-tooltips', () => {
      const controller = new ProfileScreenController(sampleProfile);
      const html = controller.renderMobileHtml();
      assert.ok(html.includes('Virat Kohli'));
      assert.ok(html.includes('#18'));
      assert.ok(html.includes('data-tooltip="Total Career Runs"'));
      assert.ok(html.includes('data-tooltip="Bowling Economy Rate"'));
    });
  });

  describe('5. Mobile App Shell & Screen Router', () => {
    it('manages active screen transitions', () => {
      const app = new CricOSMobileApp();
      assert.strictEqual(app.getCurrentScreen(), 'LIVE_MATCH');

      app.navigateTo('MARKETPLACE');
      assert.strictEqual(app.getCurrentScreen(), 'MARKETPLACE');

      app.navigateTo('PROFILE');
      assert.strictEqual(app.getCurrentScreen(), 'PROFILE');
    });
  });

  describe('6. Teams Screen Controller & Squad Management (CAPTAIN / PLAYER)', () => {
    it('initializes with 11 playing squad members and 3 bench reserves', () => {
      const controller = new TeamsScreenController();
      const state = controller.getState();
      assert.strictEqual(state.playingXI.length, 11);
      assert.strictEqual(state.bench.length, 3);
      assert.strictEqual(state.playingXI[0]?.role, 'C');
      assert.strictEqual(state.playingXI[0]?.name, 'Virat Sharma');
    });

    it('records certified coin toss details', () => {
      const controller = new TeamsScreenController();
      controller.recordToss('Bangalore Royal Challengers', 'BAT');
      const state = controller.getState();
      assert.strictEqual(state.tossWinner, 'Bangalore Royal Challengers');
      assert.strictEqual(state.tossDecision, 'BAT');
    });

    it('executes tactical bench swap between XI and reserves', () => {
      const controller = new TeamsScreenController();
      const xiPlayerId = controller.getState().playingXI[1]!.id; // Faf du Plessis
      const benchPlayerId = controller.getState().bench[0]!.id; // Anuj Rawat

      controller.swapPlayerWithBench(xiPlayerId, benchPlayerId);
      const state = controller.getState();
      assert.strictEqual(state.playingXI.some(p => p.id === benchPlayerId), true);
      assert.strictEqual(state.bench.some(p => p.id === xiPlayerId), true);
    });

    it('renders accessible mobile HTML with team code and tooltips', () => {
      const controller = new TeamsScreenController();
      const captainHtml = controller.renderMobileHtml(true);
      assert.ok(captainHtml.includes('CRIC-BLR-4821'));
      assert.ok(captainHtml.includes('data-tooltip="Conduct official MCC match toss"'));
      assert.ok(captainHtml.includes('data-tooltip="Move to bench"'));

      const playerHtml = controller.renderMobileHtml(false);
      assert.ok(playerHtml.includes('CRIC-BLR-4821'));
      assert.ok(!playerHtml.includes('Conduct Toss'));
    });
  });

  describe('7. Incidents Screen Controller & MCC Laws (UMPIRE / ADMIN)', () => {
    it('logs Fair Play code of conduct breach', () => {
      const controller = new IncidentsScreenController();
      controller.reportIncident({
        matchId: 'match-101',
        playerName: 'Shubman Gill',
        teamName: 'Delhi Daredevils',
        severity: 'LEVEL_1',
        type: 'DISSENT',
        description: 'Excessive appealing and questioning umpire',
        penaltyRuns: 0
      });

      const state = controller.getState();
      assert.strictEqual(state.incidents.length, 2);
      assert.strictEqual(state.incidents[0]?.playerName, 'Shubman Gill');
      assert.strictEqual(state.incidents[0]?.severity, 'LEVEL_1');
    });

    it('tracks DRS reviews history', () => {
      const controller = new IncidentsScreenController();
      assert.strictEqual(controller.getState().drsReviews.length, 1);

      controller.logDrsReview({
        over: '15.2',
        battingTeam: 'Mumbai Super Strikers',
        decision: 'OUT',
        retained: false,
        ballTracking: 'Pitching In-Line • Impact Outside'
      });
      assert.strictEqual(controller.getState().drsReviews.length, 2);
      assert.strictEqual(controller.getState().drsReviews[0]?.decision, 'OUT');
    });

    it('executes official match sign-off under MCC Laws', () => {
      const controller = new IncidentsScreenController();
      assert.strictEqual(controller.getState().matchSignedOff, false);

      controller.signOffMatch();
      assert.strictEqual(controller.getState().matchSignedOff, true);
    });

    it('renders accessible HTML with tooltips for Umpire', () => {
      const controller = new IncidentsScreenController();
      const html = controller.renderMobileHtml(true);
      assert.ok(html.includes('Official Umpire Desk'));
      assert.ok(html.includes('data-tooltip="Certify match results under MCC Laws"'));
      assert.ok(html.includes('data-tooltip="Award 5 penalty runs to batting team per MCC Law 41/42"'));
    });
  });

  describe('8. Admin Desk Screen Controller & Double-Entry Integrity (ADMIN)', () => {
    it('verifies 5-account balance sheet equality and zero ledger imbalance', () => {
      const controller = new AdminDeskScreenController();
      assert.strictEqual(controller.isLedgerBalanced(), true);
      const state = controller.getState();
      const { accounts, totalDebitsMinor, totalCreditsMinor } = state;
      assert.strictEqual(accounts.length, 5);
      assert.strictEqual(totalDebitsMinor, totalCreditsMinor);
    });

    it('arbitrates disputes with balanced double-entry refund journal', () => {
      const controller = new AdminDeskScreenController();
      const disputeId = controller.getState().disputes[0]!.id;

      controller.approveDispute(disputeId);
      assert.strictEqual(controller.getState().disputes[0]?.status, 'REFUNDED');
      assert.strictEqual(controller.isLedgerBalanced(), true);

      controller.rejectDispute('dsp-102');
      assert.strictEqual(controller.getState().disputes[1]?.status, 'REJECTED');
    });

    it('renders accessible Admin Desk HTML with tooltips', () => {
      const controller = new AdminDeskScreenController();
      const html = controller.renderMobileHtml();
      assert.ok(html.includes('Admin & Settlement Desk'));
      assert.ok(html.includes('5-Account Balance Sheet'));
      assert.ok(html.includes('data-tooltip="Execute balanced zero-sum refund journal entry"'));
      assert.ok(html.includes('data-tooltip="Reject claim and disburse escrow to provider"'));
    });
  });

  describe('9. Tournaments Screen Controller & Event Basket (ORGANISER)', () => {
    it('manages 4-stage stepper state transitions', () => {
      const controller = new TournamentsScreenController();
      assert.strictEqual(controller.getState().currentStage, 2);

      controller.setStage(3);
      assert.strictEqual(controller.getState().currentStage, 3);
    });

    it('calculates event basket with 5% platform fee and 18% GST', () => {
      const controller = new TournamentsScreenController();
      // base: 530000 (₹5,300)
      // fee: 5% of 530000 = 26500 (₹265)
      // gst: 18% of 26500 = 4770 (₹47.70)
      // total: 561270 (₹5,612.70)
      const basket = controller.calculateEventBasket(530000);
      assert.strictEqual(basket.baseMinor, 530000);
      assert.strictEqual(basket.platformFeeMinor, 26500);
      assert.strictEqual(basket.gstMinor, 4770);
      assert.strictEqual(basket.totalMinor, 561270);
    });

    it('renders Organiser HTML with fixtures and event basket procurement', () => {
      const controller = new TournamentsScreenController();
      const html = controller.renderMobileHtml(true);
      assert.ok(html.includes('National Club Premier League'));
      assert.ok(html.includes('data-tooltip="Manage Event Basket & Procurement"'));
      assert.ok(html.includes('data-tooltip="Auto-generate round-robin bracket"'));
      assert.ok(html.includes('Orange Cap'));
      assert.ok(html.includes('Purple Cap'));
    });
  });

  describe('10. Turf Provider Storefront & Slot Publisher (TURF_PROVIDER)', () => {
    it('publishes and toggles availability of turf slots', () => {
      const controller = new MarketplaceScreenController([]);
      controller.addSlot({
        providerId: 'prv-10',
        providerName: 'Kallam Turf',
        category: 'GROUND',
        title: 'Kallam Pitch 1 Floodlit',
        location: 'Hyderabad, TS',
        startTime: '19:00',
        endTime: '22:00',
        priceMinor: 450000,
        rating: 4.9
      });

      assert.strictEqual(controller.getFilteredSlots().length, 1);
      const slotId = controller.getFilteredSlots()[0]!.id;
      assert.strictEqual(controller.getFilteredSlots()[0]!.isAvailable, true);

      controller.toggleSlotAvailability(slotId);
      assert.strictEqual(controller.getFilteredSlots()[0]!.isAvailable, false);
    });

    it('renders Turf Provider storefront HTML with earnings and slot controls', () => {
      const controller = new MarketplaceScreenController([
        {
          id: 'slot-tp-1',
          providerId: 'prv-1',
          providerName: 'Wankhede Club',
          category: 'GROUND',
          title: 'Wankhede Arena',
          location: 'Mumbai, MH',
          startTime: '08:00',
          endTime: '12:00',
          priceMinor: 350000,
          rating: 4.9,
          isAvailable: true
        }
      ]);
      const html = controller.renderMobileHtml(true);
      assert.ok(html.includes('Turf Capacity & Storefront'));
      assert.ok(html.includes('Gross Revenue'));
      assert.ok(html.includes('data-tooltip="Publish slot to live search index"'));
      assert.ok(html.includes('data-tooltip="Freeze slot to prevent bookings"'));
    });
  });

  describe('11. Fan Engagement & Match Pulse (FAN)', () => {
    it('renders live match screen with fan cheering and win probability poll', () => {
      const app = new CricOSMobileApp();
      app.switchUserPersona('FAN');
      assert.strictEqual(app.getUserPersona(), 'FAN');

      const liveHtml = app.matchCtrl.renderMobileHtml('FAN');
      assert.ok(liveHtml.includes('Fan Stadium Cheering Pulse'));
      assert.ok(liveHtml.includes('🔥 Cheer BLR'));
      assert.ok(liveHtml.includes('Vote BLR'));
      assert.ok(liveHtml.includes('Vote MUM'));
    });
  });

  describe('12. Persona Navigation Adaptation & Apple App Store Compliance', () => {
    it('adapts screen and navigation for each of the 8 personas', () => {
      const app = new CricOSMobileApp();
      const allRoles: MobileUserRole[] = [
        'CAPTAIN',
        'PLAYER',
        'SCORER',
        'FAN',
        'UMPIRE',
        'ORGANISER',
        'TURF_PROVIDER',
        'ADMIN'
      ];

      for (const role of allRoles) {
        app.switchUserPersona(role);
        assert.strictEqual(app.getUserPersona(), role);

        // Verify role-appropriate screen routing
        if (role === 'UMPIRE') {
          assert.strictEqual(app.getCurrentScreen(), 'INCIDENTS');
        } else if (role === 'ADMIN') {
          assert.strictEqual(app.getCurrentScreen(), 'ADMIN');
        } else if (role === 'TURF_PROVIDER') {
          assert.strictEqual(app.getCurrentScreen(), 'MARKETPLACE');
        } else if (role === 'CAPTAIN') {
          assert.strictEqual(app.getCurrentScreen(), 'TEAMS');
        }
      }
    });

    it('renders Apple App Store Guideline 5.1.1(v) account deletion action', () => {
      const app = new CricOSMobileApp();
      const profileHtml = app.profileCtrl.renderMobileHtml();
      assert.ok(profileHtml.includes('data-tooltip="Mandatory permanent account deletion per Apple App Store 5.1.1(v)"'));
      assert.ok(profileHtml.includes('Delete Account & All Data (App Store Compliance)'));
    });
  });
});
