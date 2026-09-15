import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { buildServer } from '../dist/server.js';
import { calculateBayesianRating, evaluateProviderTrustState } from '@cricket-platform/domain';
import { setProviderReputation } from '../dist/modules/reputation/routes.js';
import type { FastifyInstance } from 'fastify';

describe('Provider Reputation, Circuit Breaker, Dispute Refund, & Payout Pipeline (Phase 1Q)', () => {
  let app: FastifyInstance;

  before(async () => {
    app = buildServer();
    await app.ready();
  });

  after(async () => {
    await app.close();
  });

  it('1. Calculates Bayesian weighted ratings with m-estimate smoothing', () => {
    // Single 5-star rating smoothed towards platform mean (4.2 with weight 5)
    // Formula: (5*4.2 + 5) / 6 = 26 / 6 = 4.33
    const single = calculateBayesianRating([5]);
    assert.strictEqual(single, 4.33);

    // Empty ratings return baseline
    assert.strictEqual(calculateBayesianRating([]), 4.2);

    // Mixed ratings: [5, 4, 5, 3] -> sum = 17, n = 4 -> (5*4.2 + 17) / 9 = 38 / 9 = 4.22
    assert.strictEqual(calculateBayesianRating([5, 4, 5, 3]), 4.22);
  });

  it('2. Evaluates trust state transitions and trips emergency suspension circuit breaker', () => {
    // Verified standing
    const resVerified = evaluateProviderTrustState('VERIFIED', 0.95);
    assert.strictEqual(resVerified.newState, 'VERIFIED');
    assert.strictEqual(resVerified.transitioned, false);

    // Drops below 80% -> PROBATION
    const resProbation = evaluateProviderTrustState('VERIFIED', 0.78);
    assert.strictEqual(resProbation.newState, 'PROBATION');
    assert.strictEqual(resProbation.transitioned, true);
    assert.strictEqual(resProbation.actionRequired, 'NOTIFY_PROBATION');

    // Drops below 65% -> SUSPENDED & slot freeze
    const resSuspended = evaluateProviderTrustState('PROBATION', 0.62);
    assert.strictEqual(resSuspended.newState, 'SUSPENDED');
    assert.strictEqual(resSuspended.transitioned, true);
    assert.strictEqual(resSuspended.actionRequired, 'SUSPEND_SLOTS_AND_ALERT');

    // Recovery from PROBATION back to VERIFIED
    const resRecovered = evaluateProviderTrustState('PROBATION', 0.86);
    assert.strictEqual(resRecovered.newState, 'VERIFIED');
    assert.strictEqual(resRecovered.transitioned, true);
  });

  it('3. POST /reputation/events triggers event-sourced updates and trips circuit breaker', async () => {
    const providerId = 'provider-reputation-test-01';
    setProviderReputation(providerId, 0.70, 'PROBATION');

    // Inflict severe NO_SHOW penalty (-15%) -> score drops to 0.55 (<65%)
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/reputation/events',
      payload: {
        provider_id: providerId,
        event_type: 'NO_SHOW'
      }
    });

    assert.strictEqual(res.statusCode, 201);
    const body = res.json();
    assert.strictEqual(body.event_type, 'NO_SHOW');
    assert.strictEqual(body.score_delta, -0.15);
    assert.strictEqual(body.trust_state, 'SUSPENDED');
    assert.strictEqual(body.circuit_breaker_tripped, true);
    assert.strictEqual(body.action_required, 'SUSPEND_SLOTS_AND_ALERT');
  });

  it('4. Resolves dispute with UPHELD_CUSTOMER_REFUND generating balanced ledger entry & provider penalty', async () => {
    const bookingId = 'booking-dispute-test-01';
    const providerId = 'provider-dispute-test-01';
    setProviderReputation(providerId, 0.90, 'VERIFIED');

    // 1. Open dispute
    const openRes = await app.inject({
      method: 'POST',
      url: '/api/v1/disputes',
      payload: {
        booking_id: bookingId,
        provider_id: providerId,
        amount_minor: 350000,
        reason: 'Umpire unexcused late arrival delayed match start by 45 minutes'
      }
    });
    assert.strictEqual(openRes.statusCode, 201);
    const disputeId = openRes.json().id;

    // 2. Resolve dispute with customer refund
    const resolveRes = await app.inject({
      method: 'POST',
      url: `/api/v1/disputes/${disputeId}/resolve`,
      payload: {
        resolution: 'UPHELD_CUSTOMER_REFUND',
        resolution_notes: 'Full refund issued pursuant to Service Guarantee Policy'
      }
    });

    assert.strictEqual(resolveRes.statusCode, 200);
    const resolveBody = resolveRes.json();
    assert.strictEqual(resolveBody.status, 'UPHELD_CUSTOMER_REFUND');

    // Verify double-entry refund entry zero-sum balance
    const journal = resolveBody.refund_journal_entry;
    assert.ok(journal, 'Journal entry must be present');
    const totalDebits = journal.lines
      .filter((l: any) => l.entryType === 'DEBIT')
      .reduce((s: number, l: any) => s + l.amountMinor, 0);
    const totalCredits = journal.lines
      .filter((l: any) => l.entryType === 'CREDIT')
      .reduce((s: number, l: any) => s + l.amountMinor, 0);
    assert.strictEqual(totalDebits, 350000);
    assert.strictEqual(totalCredits, 350000);
    assert.strictEqual(totalDebits, totalCredits, 'Total debits must strictly equal total credits');

    // Verify provider penalty was applied
    assert.ok(resolveBody.provider_penalty);
    assert.strictEqual(resolveBody.provider_penalty.event_type, 'DISPUTE_LOST');
    assert.strictEqual(resolveBody.provider_penalty.score_delta, -0.10);
  });

  it('5. POST /payouts/disburse blocks disbursement when open dispute is active', async () => {
    const bookingId = 'booking-dispute-block-01';
    const providerId = 'provider-dispute-block-01';
    setProviderReputation(providerId, 0.95, 'VERIFIED');

    // Open an active dispute
    await app.inject({
      method: 'POST',
      url: '/api/v1/disputes',
      payload: {
        booking_id: bookingId,
        provider_id: providerId,
        amount_minor: 250000,
        reason: 'Ground pitch lighting failed mid-innings'
      }
    });

    // Attempt to disburse payout for this booking
    const disburseRes = await app.inject({
      method: 'POST',
      url: '/api/v1/payouts/disburse',
      payload: {
        provider_id: providerId,
        booking_id: bookingId,
        amount_minor: 220000
      }
    });

    assert.strictEqual(disburseRes.statusCode, 422);
    const errorBody = disburseRes.json();
    assert.strictEqual(errorBody.error, 'DISPUTE_IN_PROGRESS');
  });

  it('6. POST /payouts/disburse blocks disbursement when provider is SUSPENDED by circuit breaker', async () => {
    const bookingId = 'booking-suspended-block-01';
    const providerId = 'provider-suspended-block-01';
    setProviderReputation(providerId, 0.50, 'SUSPENDED');

    const disburseRes = await app.inject({
      method: 'POST',
      url: '/api/v1/payouts/disburse',
      payload: {
        provider_id: providerId,
        booking_id: bookingId,
        amount_minor: 180000
      }
    });

    assert.strictEqual(disburseRes.statusCode, 422);
    const errorBody = disburseRes.json();
    assert.strictEqual(errorBody.error, 'PROVIDER_SUSPENDED_CIRCUIT_BREAKER_ACTIVE');
  });

  it('7. POST /payouts/disburse succeeds when provider is healthy and no open disputes exist', async () => {
    const bookingId = 'booking-healthy-01';
    const providerId = 'provider-healthy-01';
    setProviderReputation(providerId, 0.95, 'VERIFIED');

    const disburseRes = await app.inject({
      method: 'POST',
      url: '/api/v1/payouts/disburse',
      payload: {
        provider_id: providerId,
        booking_id: bookingId,
        amount_minor: 275000
      }
    });

    assert.strictEqual(disburseRes.statusCode, 200);
    const body = disburseRes.json();
    assert.strictEqual(body.status, 'DISBURSED');
    assert.strictEqual(body.amount_minor, 275000);
    assert.strictEqual(body.provider_id, providerId);
    assert.ok(body.disbursed_at);
  });
});
