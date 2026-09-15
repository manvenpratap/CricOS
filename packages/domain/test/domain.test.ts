import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateEventWindow,
  canTransitionEventStatus,
  validateTeamName,
  canTransitionMatchStatus,
  isHoldExpired,
  calculatePoints,
  computeReputationDelta,
  calculateBayesianRating,
  evaluateProviderTrustState,
  parseOversToBalls,
  formatBallsToOvers,
  calculateNetRunRate,
  generateRoundRobinSchedule,
  initializeStandings,
  updateTournamentStandings
} from '../dist/index.js';

describe('Domain Package', () => {
  it('validates event time window', () => {
    const t1 = new Date('2026-10-01T10:00:00Z');
    const t2 = new Date('2026-10-01T14:00:00Z');
    assert.doesNotThrow(() => validateEventWindow(t1, t2));
    assert.throws(() => validateEventWindow(t2, t1), /EVENT_INVALID_TIME_WINDOW/);
    assert.throws(() => validateEventWindow(t1, t1), /EVENT_INVALID_TIME_WINDOW/);
  });

  it('verifies event lifecycle status transitions', () => {
    assert.equal(canTransitionEventStatus('DRAFT', 'PUBLISHED'), true);
    assert.equal(canTransitionEventStatus('PUBLISHED', 'READY'), true);
    assert.equal(canTransitionEventStatus('DRAFT', 'COMPLETED'), false);
    assert.equal(canTransitionEventStatus('CANCELLED', 'PUBLISHED'), false);
  });

  it('validates team name boundaries', () => {
    assert.doesNotThrow(() => validateTeamName('Strikers XI'));
    assert.throws(() => validateTeamName('A'), /TEAM_NAME_TOO_SHORT/);
    assert.throws(() => validateTeamName('   '), /TEAM_NAME_TOO_SHORT/);
  });

  it('verifies match transitions', () => {
    assert.equal(canTransitionMatchStatus('DRAFT', 'SCHEDULED'), true);
    assert.equal(canTransitionMatchStatus('SCHEDULED', 'TOSS_DONE'), true);
    assert.equal(canTransitionMatchStatus('SCHEDULED', 'COMPLETED'), false);
  });

  it('checks hold expiration', () => {
    const activeFuture = {
      id: 'h1',
      slotId: 's1',
      heldUntil: new Date(Date.now() + 60000),
      status: 'ACTIVE' as const,
      createdAt: new Date()
    };
    assert.equal(isHoldExpired(activeFuture), false);

    const activePast = {
      ...activeFuture,
      heldUntil: new Date(Date.now() - 1000)
    };
    assert.equal(isHoldExpired(activePast), true);
  });

  it('calculates tournament points correctly', () => {
    // 3 wins, 1 tie, 1 no-result = (3*2) + 1 + 1 = 8 points
    assert.equal(calculatePoints(3, 1, 1), 8);
  });

  it('computes reputation adjustments based on domain events', () => {
    assert.equal(computeReputationDelta('MATCH_COMPLETED'), 0.01);
    assert.equal(computeReputationDelta('NO_SHOW'), -0.15);
    assert.equal(computeReputationDelta('RATING_RECEIVED', 5), 0.04);
  });

  it('calculates Bayesian weighted smoothed ratings correctly', () => {
    // Single 5-star review should not yield 5.0 (smoothed towards platform average 4.2)
    // (5*4.2 + 5) / 6 = 26 / 6 = 4.33
    const singleReview = calculateBayesianRating([5]);
    assert.equal(singleReview, 4.33);

    // Large sample of 5-star reviews converges close to 5.0
    const manyReviews = calculateBayesianRating([5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5]);
    assert.ok(manyReviews > 4.75);

    // Empty reviews return default platform average
    assert.equal(calculateBayesianRating([]), 4.2);
  });

  it('evaluates provider trust state and trips suspension circuit breaker', () => {
    // Healthy provider remains VERIFIED
    const healthy = evaluateProviderTrustState('VERIFIED', 0.95);
    assert.equal(healthy.newState, 'VERIFIED');
    assert.equal(healthy.transitioned, false);

    // Score drops below 80% -> transitions to PROBATION
    const probation = evaluateProviderTrustState('VERIFIED', 0.75);
    assert.equal(probation.newState, 'PROBATION');
    assert.equal(probation.transitioned, true);
    assert.equal(probation.actionRequired, 'NOTIFY_PROBATION');

    // Score drops below 65% -> trips circuit breaker to SUSPENDED
    const suspended = evaluateProviderTrustState('PROBATION', 0.60);
    assert.equal(suspended.newState, 'SUSPENDED');
    assert.equal(suspended.transitioned, true);
    assert.equal(suspended.actionRequired, 'SUSPEND_SLOTS_AND_ALERT');

    // Recovery from PROBATION back to VERIFIED at >= 85%
    const recovered = evaluateProviderTrustState('PROBATION', 0.88);
    assert.equal(recovered.newState, 'VERIFIED');
    assert.equal(recovered.transitioned, true);
  });

  it('converts overs to balls and back correctly', () => {
    assert.equal(parseOversToBalls(20), 120);
    assert.equal(parseOversToBalls('19.4'), 118);
    assert.equal(parseOversToBalls('0.1'), 1);
    assert.equal(parseOversToBalls(0), 0);

    assert.equal(formatBallsToOvers(120), '20.0');
    assert.equal(formatBallsToOvers(118), '19.4');
    assert.equal(formatBallsToOvers(1), '0.1');
    assert.equal(formatBallsToOvers(0), '0.0');
  });

  it('calculates official Net Run Rate (NRR) accurately', () => {
    // Team scores 160 in 20 overs (8.00 RPO), concedes 140 in 20 overs (7.00 RPO)
    // NRR = 8.00 - 7.00 = +1.000
    const nrr = calculateNetRunRate(160, 120, 140, 120);
    assert.equal(nrr, 1.0);

    // Conceding more runs than scored yields negative NRR
    const negNrr = calculateNetRunRate(120, 120, 150, 120);
    assert.equal(negNrr, -1.5);
  });

  it('generates a complete, balanced round-robin fixture bracket', () => {
    const teams = ['team-1', 'team-2', 'team-3', 'team-4'];
    const fixtures = generateRoundRobinSchedule(teams);
    // 4 teams -> (4 * 3) / 2 = 6 fixtures
    assert.equal(fixtures.length, 6);

    // Verify all unique pairings exist
    const pairKeys = new Set<string>();
    for (const f of fixtures) {
      const sortedPair = [f.homeTeamId, f.awayTeamId].sort().join(':');
      pairKeys.add(sortedPair);
    }
    assert.equal(pairKeys.size, 6);
  });

  it('updates standings with ICC all-out overs normalization and multi-tier sorting', () => {
    const standings = initializeStandings(['team-A', 'team-B']);
    // Team A (180/4 in 20 ov) def Team B (120 all out in 15 ov)
    // For Team B (all out), balls faced normalizes to full 20 overs (120 balls)
    const updated = updateTournamentStandings(standings, {
      homeTeamId: 'team-A',
      awayTeamId: 'team-B',
      homeRuns: 180,
      homeBallsFaced: 120,
      awayRuns: 120,
      awayBallsFaced: 90, // Bowled out in 15 overs
      awayAllOut: true,
      maxScheduledOvers: 20,
      winnerId: 'team-A'
    });

    assert.equal(updated[0]?.teamId, 'team-A');
    assert.equal(updated[0]?.points, 2);
    assert.equal(updated[0]?.won, 1);
    assert.equal(updated[0]?.netRunRate, 3.0); // 180/20 - 120/20 = 9 - 6 = +3.0

    assert.equal(updated[1]?.teamId, 'team-B');
    assert.equal(updated[1]?.points, 0);
    assert.equal(updated[1]?.lost, 1);
    assert.equal(updated[1]?.netRunRate, -3.0);
  });
});
