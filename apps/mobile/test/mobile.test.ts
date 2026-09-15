import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  CricOSMobileClient,
  LiveMatchScreenController,
  MarketplaceScreenController,
  ProfileScreenController,
  CricOSMobileApp,
  type LiveMatchScreenState,
  type PlayerProfileData
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
      assert.ok(html.includes('data-tooltip="On Strike"'));
      assert.ok(html.includes('data-tooltip="Non-Striker"'));
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
      assert.ok(html.includes('Cricket Marketplace'));
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
});
