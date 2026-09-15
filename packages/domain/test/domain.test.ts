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
  evaluateProviderTrustState
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
});
