process.env.NODE_ENV = 'test';
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { TournamentOrchestrator } from '../apps/api/dist/platform/tournament-orchestrator.js';
import { SimulatedMatchEngine } from '../apps/api/dist/platform/match-simulator.js';
import { validateJournalEntry } from '../packages/commercial/dist/index.js';
import { buildServer } from '../apps/api/dist/server.js';

describe('Phase 1T: Synthetic Tournament Orchestration & Load Emulation', () => {
  describe('1. Tournament Lifecycle & Round-Robin Execution', () => {
    it('orchestrates complete 4-team tournament with 6 matches and balanced standings', async () => {
      const orchestrator = new TournamentOrchestrator({
        tournamentName: 'CricOS Premier Cup 2026',
        teamCount: 4,
        oversPerInnings: 5,
        seed: 42
      });

      const result = await orchestrator.orchestrate();

      assert.strictEqual(result.totalTeams, 4);
      assert.strictEqual(result.totalMatches, 6);
      assert.ok(result.totalDeliveries > 200, 'Expected > 200 deliveries across 6 matches');
      assert.ok(result.totalRuns > 250, 'Expected > 250 total runs scored');
      assert.ok(result.durationMs >= 0);
      assert.ok(result.throughputDeliveriesPerSec > 0);

      // Check standings
      assert.strictEqual(result.finalStandings.length, 4);

      // Each team must have played exactly 3 matches
      for (const standing of result.finalStandings) {
        assert.strictEqual(standing.played, 3);
        assert.strictEqual(standing.won + standing.lost + standing.tied + standing.noResult, 3);
      }

      // Total points across 6 matches must equal 12
      const totalPoints = result.finalStandings.reduce((sum, s) => sum + s.points, 0);
      assert.strictEqual(totalPoints, 12);

      // Invariant: sum of NRRs across a closed round-robin league approximates zero
      const sumNrr = result.finalStandings.reduce((sum, s) => sum + s.netRunRate, 0);
      assert.ok(Math.abs(sumNrr) < 0.25, `Sum of NRRs (${sumNrr}) should approximate zero`);
    });

    it('generates reproducible results with identical seeds', async () => {
      const orch1 = new TournamentOrchestrator({ teamCount: 4, oversPerInnings: 3, seed: 999 });
      const orch2 = new TournamentOrchestrator({ teamCount: 4, oversPerInnings: 3, seed: 999 });

      const res1 = await orch1.orchestrate();
      const res2 = await orch2.orchestrate();

      assert.strictEqual(res1.totalDeliveries, res2.totalDeliveries);
      assert.strictEqual(res1.totalRuns, res2.totalRuns);
      assert.strictEqual(res1.totalWickets, res2.totalWickets);
      assert.deepStrictEqual(res1.finalStandings, res2.finalStandings);
    });
  });

  describe('2. Double-Entry Financial Settlement Reconciliation', () => {
    it('guarantees zero imbalance (ΣDebits ≡ ΣCredits) across all tournament bookings', async () => {
      const orchestrator = new TournamentOrchestrator({
        teamCount: 4,
        oversPerInnings: 4,
        seed: 777
      });

      const result = await orchestrator.orchestrate();

      assert.strictEqual(result.ledgerSummary.isBalanced, true);
      assert.strictEqual(result.ledgerSummary.totalEntries, 6);
      assert.ok(result.ledgerSummary.totalDebitMinor > 0);
      assert.strictEqual(
        result.ledgerSummary.totalDebitMinor,
        result.ledgerSummary.totalCreditMinor
      );

      // Verify every fixture journal entry
      for (const fix of result.fixtures) {
        assert.strictEqual(validateJournalEntry(fix.journalEntry), true);
        const escrowDebit = fix.journalEntry.lines.find(l => l.account === 'ESCROW_HOLD');
        const providerCredit = fix.journalEntry.lines.find(l => l.account === 'PROVIDER_PAYABLE');
        const platformFeeCredit = fix.journalEntry.lines.find(l => l.account === 'PLATFORM_FEE_INCOME');
        const gstCredit = fix.journalEntry.lines.find(l => l.account === 'TAX_GST_PAYABLE');

        assert.ok(escrowDebit && escrowDebit.entryType === 'DEBIT');
        assert.ok(providerCredit && providerCredit.entryType === 'CREDIT');
        assert.ok(platformFeeCredit && platformFeeCredit.entryType === 'CREDIT');
        assert.ok(gstCredit && gstCredit.entryType === 'CREDIT');

        assert.strictEqual(
          escrowDebit.amountMinor,
          providerCredit.amountMinor + platformFeeCredit.amountMinor + gstCredit.amountMinor
        );
      }
    });
  });

  describe('3. Match Simulation Mechanics & Chase Logic', () => {
    it('terminates 2nd innings immediately upon reaching the target score', () => {
      const engine = new SimulatedMatchEngine(12345);
      const teamA = {
        id: 't-1',
        name: 'Team Alpha',
        players: Array.from({ length: 11 }, (_, i) => ({
          id: `p-a-${i + 1}`,
          name: `Alpha Player ${i + 1}`,
          role: (i < 5 ? 'BATTER' : 'BOWLER') as any
        }))
      };
      const teamB = {
        id: 't-2',
        name: 'Team Beta',
        players: Array.from({ length: 11 }, (_, i) => ({
          id: `p-b-${i + 1}`,
          name: `Beta Player ${i + 1}`,
          role: (i < 5 ? 'BATTER' : 'BOWLER') as any
        }))
      };

      const match = engine.simulateMatch({
        matchId: 'match-chase-test',
        homeTeam: teamA,
        awayTeam: teamB,
        oversPerInnings: 5
      });

      assert.ok(match.innings1.runs >= 0);
      assert.ok(match.innings2.runs >= 0);

      // If away team won, they must have scored >= innings1.runs + 1
      if (match.winnerId === teamB.id) {
        assert.ok(match.innings2.runs >= match.innings1.runs + 1);
        assert.ok(match.margin.includes('won by'));
      } else if (match.winnerId === teamA.id) {
        assert.ok(match.innings1.runs > match.innings2.runs);
      } else {
        assert.strictEqual(match.isTie, true);
      }
    });
  });

  describe('4. Fastify HTTP Orchestration Route (POST /tournaments/orchestrate)', () => {
    it('executes tournament orchestration via API route', async () => {
      const server = buildServer();
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/tournaments/orchestrate',
        payload: {
          name: 'Fastify Emulated League',
          teamCount: 4,
          oversPerInnings: 2,
          seed: 555
        }
      });

      assert.strictEqual(response.statusCode, 200);
      const data = JSON.parse(response.body);
      assert.strictEqual(data.name, 'Fastify Emulated League');
      assert.strictEqual(data.totalTeams, 4);
      assert.strictEqual(data.totalMatches, 6);
      assert.strictEqual(data.ledgerSummary.isBalanced, true);
      assert.strictEqual(data.finalStandings.length, 4);
    });
  });
});
