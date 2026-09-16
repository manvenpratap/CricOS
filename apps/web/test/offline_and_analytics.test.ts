import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  OfflineDeliveryQueue,
  generateScorecardCsv,
  generatePrintableScorecardHtml,
  renderWormChartSvg,
  renderManhattanChartSvg,
  type MatchScorecardData
} from '../dist/index.js';

describe('Phase 2B: Offline-First Scoring, Analytics & Scorecard Export', () => {
  describe('1. Offline Delivery Queue', () => {
    it('enqueues deliveries and tracks pending count', () => {
      const queue = new OfflineDeliveryQueue('test-match-1');
      queue.clear();
      assert.strictEqual(queue.getPendingCount(), 0);

      const item1 = queue.enqueue({
        clientEventId: 'c1',
        matchId: 'test-match-1',
        sequence: 1,
        batRuns: 4,
        extraRuns: 0,
        extraType: 'NONE',
        legalBall: true,
        isWicket: false
      });

      assert.strictEqual(queue.getPendingCount(), 1);
      assert.strictEqual(item1.batRuns, 4);
      assert.strictEqual(item1.legalBall, true);

      queue.enqueue({
        clientEventId: 'c2',
        matchId: 'test-match-1',
        sequence: 2,
        batRuns: 1,
        extraRuns: 0,
        extraType: 'NONE',
        legalBall: true,
        isWicket: false
      });

      assert.strictEqual(queue.getPendingCount(), 2);
    });

    it('flushes queue sequentially through mock sender', async () => {
      const queue = new OfflineDeliveryQueue('test-match-2');
      queue.clear();

      queue.enqueue({
        clientEventId: 'c1',
        matchId: 'test-match-2',
        sequence: 1,
        batRuns: 0,
        extraRuns: 0,
        extraType: 'NONE',
        legalBall: true,
        isWicket: false
      });
      queue.enqueue({
        clientEventId: 'c2',
        matchId: 'test-match-2',
        sequence: 2,
        batRuns: 6,
        extraRuns: 0,
        extraType: 'NONE',
        legalBall: true,
        isWicket: false
      });

      const sentIds: string[] = [];
      const result = await queue.flush(async (delivery) => {
        sentIds.push(delivery.clientEventId);
        return true;
      });

      assert.strictEqual(result.sent, 2);
      assert.strictEqual(result.failed, 0);
      assert.strictEqual(queue.getPendingCount(), 0);
      assert.deepStrictEqual(sentIds, ['c1', 'c2']);
    });
  });

  describe('2. Scorecard Export Engine', () => {
    const mockMatchData: MatchScorecardData = {
      matchId: 'match-101',
      matchTitle: 'Delhi Daredevils vs Mumbai Super Strikers',
      innings1Team: 'Delhi Daredevils',
      innings2Team: 'Mumbai Super Strikers',
      innings1Score: '178/5 (20.0 ov)',
      innings2Score: '180/4 (19.2 ov)',
      result: 'Mumbai Super Strikers won by 6 wickets',
      batters: [
        { name: 'Virat Sharma', dismissal: 'c. Jadeja b. Bumrah', runs: 68, balls: 42, fours: 6, sixes: 3, strikeRate: 161.9 },
        { name: 'Rohit Verma', dismissal: 'b. Shami', runs: 34, balls: 24, fours: 4, sixes: 1, strikeRate: 141.67 }
      ],
      bowlers: [
        { name: 'Jasprit Bumrah', overs: '4.0', maidens: 1, runs: 24, wickets: 2, economyRate: 6.0 }
      ],
      fallOfWickets: ['1/45 (Rohit, 5.2 ov)', '2/112 (Virat, 13.4 ov)'],
      extras: { wides: 4, noBalls: 1, byes: 2, legByes: 1, total: 8 }
    };

    it('generates standard CSV scorecard', () => {
      const csv = generateScorecardCsv(mockMatchData);
      assert.ok(csv.includes('"Match","Delhi Daredevils vs Mumbai Super Strikers"'));
      assert.ok(csv.includes('"Virat Sharma"'));
      assert.ok(csv.includes('"Jasprit Bumrah"'));
      assert.ok(csv.includes('"FALL OF WICKETS"'));
    });

    it('generates printable HTML match summary sheet', () => {
      const html = generatePrintableScorecardHtml(mockMatchData);
      assert.ok(html.includes('Delhi Daredevils vs Mumbai Super Strikers'));
      assert.ok(html.includes('Mumbai Super Strikers won by 6 wickets'));
      assert.ok(html.includes('window.print') || html.includes('Batting Card'));
      assert.ok(html.includes('Bowling Analysis'));
    });
  });

  describe('3. Match Analytics SVG Charts', () => {
    it('generates responsive SVG Worm Chart comparing run trajectories', () => {
      const team1 = [
        { over: 0, runs: 0 },
        { over: 5, runs: 45, isWicket: true },
        { over: 10, runs: 90 },
        { over: 20, runs: 178 }
      ];
      const team2 = [
        { over: 0, runs: 0 },
        { over: 5, runs: 52 },
        { over: 10, runs: 98, isWicket: true },
        { over: 19.2, runs: 180 }
      ];

      const svg = renderWormChartSvg(team1, team2, {
        team1Name: 'Delhi',
        team2Name: 'Mumbai'
      });

      assert.ok(svg.includes('<svg'));
      assert.ok(svg.includes('Delhi'));
      assert.ok(svg.includes('Mumbai'));
      assert.ok(svg.includes('circle')); // wicket dot
      assert.ok(svg.includes('path')); // run line
    });

    it('generates responsive SVG Manhattan Bar Chart', () => {
      const overs = [
        { overNumber: 1, runs: 8, wickets: 0 },
        { overNumber: 2, runs: 12, wickets: 1 },
        { overNumber: 3, runs: 4, wickets: 0, isMaiden: false },
        { overNumber: 4, runs: 16, wickets: 0 }
      ];

      const svg = renderManhattanChartSvg(overs);
      assert.ok(svg.includes('<svg'));
      assert.ok(svg.includes('rect')); // over bar
      assert.ok(svg.includes('circle')); // wicket marker
    });
  });
});
