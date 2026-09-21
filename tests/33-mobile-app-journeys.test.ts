import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CricOSMobileClient,
  CricOSMobileApp,
  LiveMatchScreenController,
  TeamsScreenController,
  TournamentsScreenController,
  MarketplaceScreenController,
  IncidentsScreenController,
  AdminDeskScreenController,
  ProfileScreenController,
  type MobileUserRole
} from '../apps/mobile/dist/index.js';
import { getMobileAppHtml } from '../apps/api/dist/ui/mobile-view.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('33. Mobile App User Journeys & Multi-Persona Architecture', () => {
  const all8Roles: MobileUserRole[] = [
    'CAPTAIN',
    'PLAYER',
    'SCORER',
    'FAN',
    'UMPIRE',
    'ORGANISER',
    'TURF_PROVIDER',
    'ADMIN'
  ];

  describe('1. Persona Switching & Navigation Adaptation', () => {
    it('supports all 8 user personas and dynamically adapts active screens', () => {
      const app = new CricOSMobileApp();

      for (const role of all8Roles) {
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

    it('manages guest and authenticated session transitions', () => {
      const app = new CricOSMobileApp();
      const client = app.getClient();

      assert.strictEqual(client.isAuthenticated(), false);
      client.setSession({
        token: 'test-mobile-jwt',
        userId: 'usr-101',
        role: 'CAPTAIN',
        expiresAt: Date.now() + 3600000
      });
      assert.strictEqual(client.isAuthenticated(), true);

      client.clearSession();
      assert.strictEqual(client.isAuthenticated(), false);
    });
  });

  describe('2. Captain Journey: Squad XI, Toss & Tactical Wagon Wheel', () => {
    it('manages Playing XI lineup, bench reserves, and team join code', () => {
      const controller = new TeamsScreenController();
      const state = controller.getState();

      assert.strictEqual(state.playingXI.length, 11);
      assert.strictEqual(state.bench.length, 3);
      assert.strictEqual(state.teamCode, 'CRIC-BLR-4821');
      assert.strictEqual(state.playingXI[0]?.isCaptain, true);

      // Tactical player swap
      const xiPlayerId = state.playingXI[1]!.id;
      const benchPlayerId = state.bench[0]!.id;
      const swapped = controller.swapPlayerWithBench(xiPlayerId, benchPlayerId);
      assert.strictEqual(swapped, true);

      const updated = controller.getState();
      assert.strictEqual(updated.playingXI.some(p => p.id === benchPlayerId), true);
      assert.strictEqual(updated.bench.some(p => p.id === xiPlayerId), true);
    });

    it('conducts and certifies coin toss under MCC Laws', () => {
      const controller = new TeamsScreenController();
      assert.strictEqual(controller.getState().tossConducted, false);

      controller.recordToss('Bangalore Royal Challengers', 'BAT');
      const state = controller.getState();
      assert.strictEqual(state.tossConducted, true);
      assert.strictEqual(state.tossWinner, 'Bangalore Royal Challengers');
      assert.strictEqual(state.tossDecision, 'BAT');
    });

    it('renders Captain tactical wagon wheel and accessible controls', () => {
      const liveCtrl = new LiveMatchScreenController({
        matchId: 'match-pilot-1',
        battingTeam: 'Delhi Daredevils',
        bowlingTeam: 'Mumbai Super Strikers',
        totalRuns: 142,
        totalWickets: 3,
        legalBalls: 100,
        striker: { playerId: 'p1', name: 'Virat K.', runs: 68, balls: 44, fours: 7, sixes: 2, isStriker: true },
        nonStriker: { playerId: 'p2', name: 'Rohit S.', runs: 54, balls: 38, fours: 5, sixes: 2, isStriker: false },
        bowler: { playerId: 'b1', name: 'Jasprit B.', overs: 3, ballsThisOver: 4, maidens: 0, runsConceded: 24, wickets: 2 },
        currentOverDeliveries: ['1', '4', '•', '2'],
        fallOfWickets: [],
        isOverComplete: false
      });

      const html = liveCtrl.renderMobileHtml('CAPTAIN');
      assert.ok(html.includes('Captain Tactical View'));
      assert.ok(html.includes('Target Equation'));
      assert.ok(html.includes('data-tooltip="Record toss result"'));
    });
  });

  describe('3. Player Journey: Career Metrics & Turf Booking', () => {
    it('computes career batting and bowling statistics accurately', () => {
      const controller = new ProfileScreenController({
        id: 'p-18',
        name: 'Virat Kohli',
        role: 'BATTER',
        teamName: 'Bangalore Royal Challengers',
        jerseyNumber: 18,
        persona: 'PLAYER',
        batting: {
          matches: 100,
          innings: 95,
          runs: 4800,
          ballsFaced: 3600,
          notOuts: 15,
          highestScore: 113,
          centuries: 8,
          fifties: 35,
          fours: 420,
          sixes: 110
        },
        bowling: {
          matches: 100,
          overs: 50,
          maidens: 1,
          runsConceded: 400,
          wickets: 10,
          bestBowling: '2/18'
        }
      });

      // outs = 95 - 15 = 80; average = 4800 / 80 = 60.00
      assert.strictEqual(controller.getBattingAverage(), '60.00');
      // strike rate = (4800 / 3600) * 100 = 133.33
      assert.strictEqual(controller.getBattingStrikeRate(), '133.33');
      // economy = 400 / 50 = 8.00
      assert.strictEqual(controller.getBowlingEconomy(), '8.00');
      // bowling average = 400 / 10 = 40.00
      assert.strictEqual(controller.getBowlingAverage(), '40.00');
    });

    it('enforces Apple App Store Guideline 5.1.1(v) account deletion action', () => {
      const controller = new ProfileScreenController();
      const html = controller.renderMobileHtml();
      assert.ok(html.includes('data-tooltip="Mandatory permanent account deletion per Apple App Store 5.1.1(v)"'));
      assert.ok(html.includes('Delete Account & All Data (App Store Compliance)'));
    });
  });

  describe('4. Scorer Journey: Compound Extras, Wickets, Strike Rotation & Scorecard', () => {
    it('records legal boundaries, compound extras, and handles over completion', () => {
      const controller = new LiveMatchScreenController({
        matchId: 'match-score-1',
        battingTeam: 'Delhi Daredevils',
        bowlingTeam: 'Mumbai Super Strikers',
        totalRuns: 0,
        totalWickets: 0,
        legalBalls: 0,
        striker: { playerId: 'p1', name: 'Striker A', runs: 0, balls: 0, fours: 0, sixes: 0, isStriker: true },
        nonStriker: { playerId: 'p2', name: 'Non-Striker B', runs: 0, balls: 0, fours: 0, sixes: 0, isStriker: false },
        bowler: { playerId: 'b1', name: 'Bowler C', overs: 0, ballsThisOver: 0, maidens: 0, runsConceded: 0, wickets: 0 },
        currentOverDeliveries: [],
        fallOfWickets: [],
        isOverComplete: false
      });

      // Ball 1: Boundary Four (4 runs, legal ball, Striker A gets 4, no strike rotation)
      controller.recordDelivery({ runs: 4 });
      assert.strictEqual(controller.getState().totalRuns, 4);
      assert.strictEqual(controller.getState().legalBalls, 1);
      assert.strictEqual(controller.getStriker().name, 'Striker A');
      assert.strictEqual(controller.getStriker().runs, 4);

      // Ball 2: Single (1 run, strike rotates -> Non-Striker B is now on strike)
      controller.recordDelivery({ runs: 1 });
      assert.strictEqual(controller.getStriker().name, 'Non-Striker B');
      assert.strictEqual(controller.getNonStriker().name, 'Striker A');

      // Ball 3: Wicket (new batter in)
      controller.recordDelivery({
        runs: 0,
        isWicket: true,
        wicketType: 'CAUGHT',
        newBatterId: 'p-4',
        newBatterName: 'Batter D'
      });
      assert.strictEqual(controller.getState().totalWickets, 1);
      assert.strictEqual(controller.getStriker().name, 'Batter D');

      // Undo last ball
      controller.undo();
      assert.strictEqual(controller.getState().totalWickets, 0);
      assert.strictEqual(controller.getStriker().name, 'Non-Striker B');
    });

    it('renders accessible Scorer pad with 8-zone wagon wheel selector', () => {
      const controller = new LiveMatchScreenController({
        matchId: 'match-score-2',
        battingTeam: 'Delhi Daredevils',
        bowlingTeam: 'Mumbai Super Strikers',
        totalRuns: 100,
        totalWickets: 2,
        legalBalls: 60,
        striker: { playerId: 'p1', name: 'Virat K.', runs: 50, balls: 30, fours: 5, sixes: 2, isStriker: true },
        nonStriker: { playerId: 'p2', name: 'Rohit S.', runs: 40, balls: 25, fours: 4, sixes: 1, isStriker: false },
        bowler: { playerId: 'b1', name: 'Jasprit B.', overs: 2, ballsThisOver: 0, maidens: 0, runsConceded: 15, wickets: 1 },
        currentOverDeliveries: [],
        fallOfWickets: [],
        isOverComplete: false
      });

      const html = controller.renderMobileHtml('SCORER');
      assert.ok(html.includes('⚡ Live Scoring Pad'));
      assert.ok(html.includes('data-tooltip="Swap batsman strike"'));
      assert.ok(html.includes('data-tooltip="Undo last recorded delivery"'));
      assert.ok(html.includes('8-Zone Wagon Wheel Shot Selector'));
    });
  });

  describe('5. Fan Journey: Stadium Pulse & Win Probability Poll', () => {
    it('renders Fan Cheering pulse and Win Probability poll voting buttons', () => {
      const liveCtrl = new LiveMatchScreenController({
        matchId: 'match-fan-1',
        battingTeam: 'Delhi Daredevils',
        bowlingTeam: 'Mumbai Super Strikers',
        totalRuns: 142,
        totalWickets: 3,
        legalBalls: 100,
        striker: { playerId: 'p1', name: 'Virat K.', runs: 68, balls: 44, fours: 7, sixes: 2, isStriker: true },
        nonStriker: { playerId: 'p2', name: 'Rohit S.', runs: 54, balls: 38, fours: 5, sixes: 2, isStriker: false },
        bowler: { playerId: 'b1', name: 'Jasprit B.', overs: 3, ballsThisOver: 4, maidens: 0, runsConceded: 24, wickets: 2 },
        currentOverDeliveries: ['1', '4', '•', '2'],
        fallOfWickets: [],
        isOverComplete: false
      });

      const html = liveCtrl.renderMobileHtml('FAN');
      assert.ok(html.includes('Fan Stadium Cheering Pulse'));
      assert.ok(html.includes('🔥 Cheer BLR'));
      assert.ok(html.includes('💥 Boundary'));
      assert.ok(html.includes('⚡ Sixer!'));
      assert.ok(html.includes('Win Probability Poll'));
      assert.ok(html.includes('Vote BLR'));
      assert.ok(html.includes('Vote MUM'));
    });
  });

  describe('6. Umpire Journey: Code of Conduct, DRS Reviews & Match Sign-Off', () => {
    it('logs Fair Play breach records and tracks DRS challenges', () => {
      const controller = new IncidentsScreenController();
      assert.strictEqual(controller.getState().matchSignedOff, false);

      const record = controller.reportIncident({
        matchId: 'match-ump-1',
        playerName: 'Shubman Gill',
        teamName: 'Delhi Daredevils',
        severity: 'LEVEL_1',
        type: 'DISSENT',
        description: 'Questioned wide ball ruling',
        penaltyRuns: 0
      });
      assert.strictEqual(record.severity, 'LEVEL_1');
      assert.strictEqual(controller.getState().incidents.length, 2);

      // DRS review
      const drs = controller.logDrsReview({
        over: '16.1',
        battingTeam: 'Delhi Daredevils',
        decision: 'OUT',
        retained: false,
        ballTracking: 'Pitching in line, hitting middle stump'
      });
      assert.strictEqual(drs.decision, 'OUT');
      assert.strictEqual(controller.getState().drsReviews.length, 2);

      // Official sign-off
      controller.signOffMatch();
      assert.strictEqual(controller.getState().matchSignedOff, true);
    });

    it('renders accessible Umpire Desk HTML with tooltips', () => {
      const controller = new IncidentsScreenController();
      const html = controller.renderMobileHtml(true);
      assert.ok(html.includes('Official Umpire Desk'));
      assert.ok(html.includes('data-tooltip="Certify match results under MCC Laws"'));
      assert.ok(html.includes('data-tooltip="Log official Code of Conduct breach"'));
      assert.ok(html.includes('data-tooltip="Award 5 penalty runs to batting team per MCC Law 41/42"'));
    });
  });

  describe('7. Organiser Journey: Tournament Brackets, Points & Event Basket', () => {
    it('manages 4-stage stepper, round-robin fixtures, and leaderboards', () => {
      const controller = new TournamentsScreenController();
      assert.strictEqual(controller.getState().currentStage, 2);

      controller.setStage(3);
      assert.strictEqual(controller.getState().currentStage, 3);

      const state = controller.getState();
      assert.strictEqual(state.standings.length, 4);
      assert.strictEqual(state.fixtures.length, 3);
      assert.strictEqual(state.orangeCap.length, 3);
      assert.strictEqual(state.purpleCap.length, 3);
    });

    it('calculates Event Basket with 5% platform fee and 18% GST', () => {
      const controller = new TournamentsScreenController();
      const basket = controller.calculateEventBasket(530000);

      assert.strictEqual(basket.baseMinor, 530000);
      assert.strictEqual(basket.platformFeeMinor, 26500);
      assert.strictEqual(basket.gstMinor, 4770);
      assert.strictEqual(basket.totalMinor, 561270);
    });

    it('renders Organiser HTML with accessible tooltips', () => {
      const controller = new TournamentsScreenController();
      const html = controller.renderMobileHtml(true);
      assert.ok(html.includes('National Club Premier League'));
      assert.ok(html.includes('data-tooltip="Manage Event Basket & Procurement"'));
      assert.ok(html.includes('data-tooltip="Auto-generate round-robin bracket"'));
    });
  });

  describe('8. Turf Provider Journey: Storefront, Slots & Net Earnings', () => {
    it('publishes match slots and toggles freeze / unfreeze availability', () => {
      const controller = new MarketplaceScreenController([]);
      controller.addSlot({
        providerId: 'prv-wankhede',
        providerName: 'Wankhede Arena Turf Club',
        category: 'GROUND',
        title: 'Wankhede Arena Pitch 1',
        location: 'South Mumbai, MH',
        startTime: '18:00',
        endTime: '22:00',
        priceMinor: 350000,
        rating: 4.9
      });

      assert.strictEqual(controller.getFilteredSlots().length, 1);
      const slot = controller.getFilteredSlots()[0]!;
      assert.strictEqual(slot.isAvailable, true);

      // Freeze slot
      controller.toggleSlotAvailability(slot.id);
      assert.strictEqual(controller.getFilteredSlots()[0]!.isAvailable, false);

      // Unfreeze slot
      controller.toggleSlotAvailability(slot.id);
      assert.strictEqual(controller.getFilteredSlots()[0]!.isAvailable, true);
    });

    it('calculates net earnings with 5% platform fee and 18% GST deduction', () => {
      const controller = new MarketplaceScreenController([]);
      const breakdown = controller.calculateBreakdown(350000);

      assert.strictEqual(breakdown.baseMinor, 350000);
      assert.strictEqual(breakdown.platformFeeMinor, 17500);
      assert.strictEqual(breakdown.gstMinor, 66150);
      assert.strictEqual(breakdown.totalMinor, 433650);
    });

    it('renders Turf Provider storefront with earnings dashboard', () => {
      const controller = new MarketplaceScreenController([
        {
          id: 'slot-1',
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
      assert.ok(html.includes('Net Disbursed'));
      assert.ok(html.includes('data-tooltip="Publish slot to live search index"'));
      assert.ok(html.includes('data-tooltip="Freeze slot to prevent bookings"'));
    });
  });

  describe('9. Admin Journey: 5-Account Balance Sheet & Dispute Arbitration', () => {
    it('verifies 5-account balance sheet equality and zero ledger imbalance', () => {
      const controller = new AdminDeskScreenController();
      assert.strictEqual(controller.isLedgerBalanced(), true);

      const state = controller.getState();
      assert.strictEqual(state.accounts.length, 5);
      assert.strictEqual(state.totalDebitsMinor, state.totalCreditsMinor);
    });

    it('arbitrates dispute with balanced double-entry refund journal', () => {
      const controller = new AdminDeskScreenController();
      const disputeId = controller.getState().disputes[0]!.id;

      const refunded = controller.approveDispute(disputeId);
      assert.strictEqual(refunded?.status, 'REFUNDED');
      assert.strictEqual(controller.isLedgerBalanced(), true);

      const rejected = controller.rejectDispute('dsp-102');
      assert.strictEqual(rejected?.status, 'REJECTED');
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

  describe('10. Standalone Mobile App View & Release Parity (Rules 5 & 6)', () => {
    it('generates standalone mobile HTML containing all 8 personas and journeys', () => {
      const mobileHtml = getMobileAppHtml();

      assert.ok(mobileHtml.includes('CricOS — Consumer Mobile App'));
      assert.ok(mobileHtml.includes('CAPTAIN'));
      assert.ok(mobileHtml.includes('PLAYER'));
      assert.ok(mobileHtml.includes('SCORER'));
      assert.ok(mobileHtml.includes('FAN'));
      assert.ok(mobileHtml.includes('UMPIRE'));
      assert.ok(mobileHtml.includes('ORGANISER'));
      assert.ok(mobileHtml.includes('TURF_PROVIDER'));
      assert.ok(mobileHtml.includes('ADMIN'));

      // Verify accessible data-tooltip attributes per Rule 5
      assert.ok(mobileHtml.includes('data-tooltip'));
      assert.ok(mobileHtml.includes('data-tooltip="Switch to Platform Console"'));
      assert.ok(mobileHtml.includes('data-tooltip="Inspect REST & WebSocket API Specs"'));
    });

    it('verifies distribution files and byte-for-byte single-file parity (Rule 6)', () => {
      const rootIndex = fs.readFileSync(path.join(rootDir, 'index.html'));
      const distIndex = fs.readFileSync(path.join(rootDir, 'dist/index.html'));
      assert.strictEqual(rootIndex.equals(distIndex), true, 'index.html and dist/index.html must be byte-for-byte identical');

      const distMobilePath = path.join(rootDir, 'dist/mobile.html');
      assert.strictEqual(fs.existsSync(distMobilePath), true, 'dist/mobile.html must exist');
      const distMobileContent = fs.readFileSync(distMobilePath, 'utf8');
      assert.ok(distMobileContent.includes('CricOS — Consumer Mobile App'));

      const manifestPath = path.join(rootDir, 'dist/release-manifest.json');
      assert.strictEqual(fs.existsSync(manifestPath), true, 'dist/release-manifest.json must exist');
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      assert.ok(manifest.artifacts['dist/index.html']);
      assert.ok(manifest.artifacts['dist/mobile.html']);
    });
  });
});
