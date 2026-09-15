import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { buildServer } from '../dist/server.js';
import type { FastifyInstance } from 'fastify';

describe('Cricket Platform API — Comprehensive End-to-End Integration Tests', () => {
  let app: FastifyInstance;

  before(async () => {
    app = buildServer();
    await app.ready();
  });

  after(async () => {
    await app.close();
  });

  it('1. Health Check returns 200 and system status', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/health'
    });

    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.equal(body.status, 'ok');
    assert.equal(body.version, '1.0.0-phase1n');
    assert.ok(body.timestamp);
  });

  it('2. Identity & OTP authentication workflow', async () => {
    // Request OTP
    const reqRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/otp/request',
      payload: { identifier: '+919876543210' }
    });
    assert.equal(reqRes.statusCode, 200);
    const reqBody = JSON.parse(reqRes.body);
    assert.equal(reqBody.success, true);

    // Verify OTP
    const verifyRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/otp/verify',
      payload: { identifier: '+919876543210', code: '123456' }
    });
    assert.equal(verifyRes.statusCode, 200);
    const verifyBody = JSON.parse(verifyRes.body);
    assert.ok(verifyBody.token);
    assert.equal(verifyBody.user.status, 'ACTIVE');

    // Get current auth profile
    const meRes = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/me',
      headers: { authorization: `Bearer ${verifyBody.token}` }
    });
    assert.equal(meRes.statusCode, 200);
  });

  it('3. Team management lifecycle', async () => {
    const createRes = await app.inject({
      method: 'POST',
      url: '/api/v1/teams',
      payload: { name: 'Mumbai Super Strikers' }
    });
    assert.equal(createRes.statusCode, 201);
    const team = JSON.parse(createRes.body);
    assert.equal(team.name, 'Mumbai Super Strikers');
    assert.ok(team.id);

    // Add team member
    const memberRes = await app.inject({
      method: 'POST',
      url: `/api/v1/teams/${team.id}/members`,
      payload: { user_id: '00000000-0000-0000-0000-000000000002', role: 'CAPTAIN' }
    });
    assert.equal(memberRes.statusCode, 201);

    // Get team details
    const getRes = await app.inject({
      method: 'GET',
      url: `/api/v1/teams/${team.id}`
    });
    assert.equal(getRes.statusCode, 200);
  });

  it('4. Event creation and requirements', async () => {
    const now = new Date();
    const startsAt = new Date(now.getTime() + 86400000);
    const endsAt = new Date(startsAt.getTime() + 14400000);

    const eventRes = await app.inject({
      method: 'POST',
      url: '/api/v1/events',
      payload: {
        type: 'MATCH',
        title: 'Semifinal Match A',
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        timezone: 'Asia/Kolkata',
        team_ids: ['team-1', 'team-2'],
        format: 'T20',
        ruleset_version: '1.0'
      }
    });

    assert.equal(eventRes.statusCode, 201);
    const eventBody = JSON.parse(eventRes.body);
    assert.equal(eventBody.title, 'Semifinal Match A');
    assert.equal(eventBody.format, 'T20');

    // Add requirement
    const reqRes = await app.inject({
      method: 'POST',
      url: `/api/v1/events/${eventBody.id}/requirements`,
      payload: { category: 'UMPIRE', quantity: 2 }
    });
    assert.equal(reqRes.statusCode, 201);
  });

  it('5. Marketplace search and inventory hold flow', async () => {
    // Search listings
    const listRes = await app.inject({
      method: 'GET',
      url: '/api/v1/marketplace/listings?category=VENUE'
    });
    assert.equal(listRes.statusCode, 200);
    const listings = JSON.parse(listRes.body);
    assert.ok(Array.isArray(listings));

    // Create an inventory hold
    const holdRes = await app.inject({
      method: 'POST',
      url: '/api/v1/availability/holds',
      payload: {
        slot_id: '00000000-0000-0000-0000-000000000010',
        starts_at: new Date().toISOString(),
        ends_at: new Date(Date.now() + 10800000).toISOString()
      }
    });
    assert.equal(holdRes.statusCode, 201);
    const hold = JSON.parse(holdRes.body);
    assert.equal(hold.status, 'ACTIVE');

    // Release hold
    const releaseRes = await app.inject({
      method: 'DELETE',
      url: `/api/v1/availability/holds/${hold.hold_id}`
    });
    assert.equal(releaseRes.statusCode, 200);
  });

  it('6. Basket management', async () => {
    const addRes = await app.inject({
      method: 'POST',
      url: '/api/v1/basket/items',
      payload: {
        user_id: 'test-user-1',
        listing_id: 'listing-123',
        slot_id: 'slot-456',
        price_minor: 350000
      }
    });
    assert.equal(addRes.statusCode, 201);

    const getRes = await app.inject({
      method: 'GET',
      url: '/api/v1/basket?user_id=test-user-1'
    });
    assert.equal(getRes.statusCode, 200);
    const basket = JSON.parse(getRes.body);
    assert.equal(basket.items.length, 1);
    assert.equal(basket.total_minor, 350000);
  });

  it('7. Checkout and commercial calculation (Phase 1D model)', async () => {
    const checkoutRes = await app.inject({
      method: 'POST',
      url: '/api/v1/checkout',
      payload: {
        items: [
          { listing_id: 'list-1', slot_id: 'slot-1', unit_price_minor: 350000 }
        ]
      }
    });

    assert.equal(checkoutRes.statusCode, 201);
    const order = JSON.parse(checkoutRes.body);
    assert.ok(order.order_id);
    assert.equal(order.status, 'CHECKOUT');
    assert.equal(order.subtotal_minor, 350000);
    assert.ok(order.total_minor > order.subtotal_minor); // includes fee and tax
  });

  it('8. Payment Intent and Webhook processing', async () => {
    const intentRes = await app.inject({
      method: 'POST',
      url: '/api/v1/payments/intent',
      payload: { order_id: 'order-12345' }
    });
    assert.equal(intentRes.statusCode, 201);
    const intent = JSON.parse(intentRes.body);
    assert.ok(intent.client_secret);

    // Webhook event
    const webhookRes = await app.inject({
      method: 'POST',
      url: '/api/v1/payments/webhook',
      payload: {
        idempotency_key: `wh-test-${Date.now()}`,
        payment_intent_id: intent.payment_intent_id,
        order_id: 'order-12345',
        status: 'SUCCEEDED'
      }
    });
    assert.equal(webhookRes.statusCode, 200);
    const webhookBody = JSON.parse(webhookRes.body);
    assert.equal(webhookBody.status, 'PROCESSED');
  });

  it('9. Live match scoring engine integration', async () => {
    const matchId = 'match-scoring-test-1';

    // Ball 1: 4 runs boundary
    const ball1Res = await app.inject({
      method: 'POST',
      url: `/api/v1/matches/${matchId}/score-events`,
      payload: {
        client_event_id: 'evt-1',
        sequence: 1,
        bat_runs: 4,
        extra_runs: 0,
        extra_type: 'NONE',
        legal_ball: true
      }
    });
    assert.equal(ball1Res.statusCode, 201);
    const state1 = JSON.parse(ball1Res.body).state;
    assert.equal(state1.runs, 4);
    assert.equal(state1.overs_display, '0.1');

    // Ball 2: 1 wide run (illegal delivery)
    const ball2Res = await app.inject({
      method: 'POST',
      url: `/api/v1/matches/${matchId}/score-events`,
      payload: {
        client_event_id: 'evt-2',
        sequence: 2,
        bat_runs: 0,
        extra_runs: 1,
        extra_type: 'WIDE',
        legal_ball: false
      }
    });
    assert.equal(ball2Res.statusCode, 201);
    const state2 = JSON.parse(ball2Res.body).state;
    assert.equal(state2.runs, 5);
    assert.equal(state2.overs_display, '0.1'); // ball count unchanged

    // Get live score state
    const scoreStateRes = await app.inject({
      method: 'GET',
      url: `/api/v1/matches/${matchId}/score-state`
    });
    assert.equal(scoreStateRes.statusCode, 200);
    const finalScore = JSON.parse(scoreStateRes.body).state;
    assert.equal(finalScore.runs, 5);
  });

  it('10. Tournament creation, fixture generation, and standings', async () => {
    const tournRes = await app.inject({
      method: 'POST',
      url: '/api/v1/tournaments',
      payload: { name: 'Delhi Premier League', format: 'ROUND_ROBIN', team_count: 4 }
    });
    assert.equal(tournRes.statusCode, 201);
    const tourn = JSON.parse(tournRes.body);

    // Generate fixtures
    const fixRes = await app.inject({
      method: 'POST',
      url: `/api/v1/tournaments/${tourn.id}/fixtures/generate`,
      payload: { team_ids: ['team-1', 'team-2', 'team-3', 'team-4'] }
    });
    assert.equal(fixRes.statusCode, 201);
    const fixtures = JSON.parse(fixRes.body);
    assert.equal(fixtures.count, 6); // 4C2 = 6 round-robin matches

    // Get standings
    const standRes = await app.inject({
      method: 'GET',
      url: `/api/v1/tournaments/${tourn.id}/standings`
    });
    assert.equal(standRes.statusCode, 200);
    const standings = JSON.parse(standRes.body);
    assert.equal(standings.standings.length, 2);
  });

  it('11. Incident management, replacement proposals, and reputation adjustments', async () => {
    // Open incident
    const incRes = await app.inject({
      method: 'POST',
      url: '/api/v1/incidents',
      payload: {
        booking_id: 'booking-inc-1',
        type: 'PROVIDER_NO_SHOW',
        reason: 'Umpire did not arrive at venue'
      }
    });
    assert.equal(incRes.statusCode, 201);
    const incident = JSON.parse(incRes.body);
    assert.equal(incident.status, 'OPEN');

    // Propose replacement
    const propRes = await app.inject({
      method: 'POST',
      url: '/api/v1/replacements/propose',
      payload: {
        original_booking_id: 'booking-inc-1',
        proposed_provider_id: 'provider-replacement-99',
        price_delta_minor: 0
      }
    });
    assert.equal(propRes.statusCode, 201);
    const proposal = JSON.parse(propRes.body);
    assert.equal(proposal.status, 'PENDING');

    // Accept replacement
    const acceptRes = await app.inject({
      method: 'POST',
      url: `/api/v1/replacements/${proposal.id}/accept`,
      payload: { reason: 'Accepted qualified alternative umpire' }
    });
    assert.equal(acceptRes.statusCode, 200);

    // Apply reputation penalty for no-show
    const repRes = await app.inject({
      method: 'POST',
      url: '/api/v1/reputation/events',
      payload: {
        provider_id: 'provider-original-1',
        event_type: 'NO_SHOW'
      }
    });
    assert.equal(repRes.statusCode, 201);
    const rep = JSON.parse(repRes.body);
    assert.equal(rep.score_delta, -0.15);
  });

  it('12. Operations dashboard', async () => {
    const dashRes = await app.inject({
      method: 'GET',
      url: '/api/v1/operations/dashboard'
    });
    assert.equal(dashRes.statusCode, 200);
    const dash = JSON.parse(dashRes.body);
    assert.equal(dash.system_health, 'HEALTHY');
  });
});
