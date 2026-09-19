import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { buildServer } from '../apps/api/dist/server.js';
import { calculateDynamicPrice, calculateMultiCurrencyConversion } from '../packages/domain/dist/intelligence.js';

describe('Wave 8: Sponsorship, Player Auctions & Advanced P2/P3 API', () => {
  let app: any;

  before(async () => {
    process.env.NODE_ENV = 'test';
    app = buildServer();
    await app.ready();
  });

  after(async () => {
    if (app) await app.close();
  });

  test('1. Sponsorship Inventory & Pledges: records pledge and posts balanced double-entry journal', async () => {
    const tournamentId = '00000000-0000-0000-0000-000000000010';

    // 1. List inventory
    const listRes = await app.inject({
      method: 'GET',
      url: `/api/v1/sponsorship/tournaments/${tournamentId}`
    });
    assert.equal(listRes.statusCode, 200);
    const items = JSON.parse(listRes.payload);
    assert.ok(items.length >= 2);

    // 2. Pledge sponsorship
    const pledgeRes = await app.inject({
      method: 'POST',
      url: '/api/v1/sponsorship/pledge',
      payload: {
        tournament_id: tournamentId,
        tier: 'PLAYER_OF_MATCH',
        sponsor_name: 'CEAT Tyres',
        pledge_amount_minor: 5000000, // ₹50,000
        currency: 'INR'
      }
    });
    assert.equal(pledgeRes.statusCode, 201);
    const pledgeData = JSON.parse(pledgeRes.payload);
    assert.equal(pledgeData.pledge.sponsor_name, 'CEAT Tyres');
    assert.ok(pledgeData.journal_entry);
    assert.equal(pledgeData.journal_entry.lines.length, 2);
  });

  test('2. Virtual Player Auction Bidding Engine: evaluates bids and enforces purse reserves', async () => {
    // 1. Valid bid higher than current
    const bidRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auctions/bid',
      payload: {
        auction_id: 'auc-001',
        team_id: 'team-2',
        player_id: 'p-101',
        bid_amount_minor: 35000000, // ₹3,50,000 (exceeds current ₹3,25,000 by 25k)
        team_purse_remaining_minor: 80000000,
        remaining_squad_slots: 4
      }
    });
    assert.equal(bidRes.statusCode, 200);
    const bidData = JSON.parse(bidRes.payload);
    assert.equal(bidData.status, 'ACCEPTED');
    assert.equal(bidData.current_highest_bid_minor, 35000000);

    // 2. Invalid bid: lower than current
    const lowBidRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auctions/bid',
      payload: {
        auction_id: 'auc-001',
        team_id: 'team-3',
        player_id: 'p-101',
        bid_amount_minor: 30000000,
        team_purse_remaining_minor: 80000000,
        remaining_squad_slots: 4
      }
    });
    assert.equal(lowBidRes.statusCode, 400);

    // 3. Invalid bid: exceeds purse after retaining minimum reserve
    const overBidRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auctions/bid',
      payload: {
        auction_id: 'auc-001',
        team_id: 'team-4',
        player_id: 'p-101',
        bid_amount_minor: 75000000,
        team_purse_remaining_minor: 80000000,
        remaining_squad_slots: 4 // Requires 3 * 50k = 1,50,000 reserve, but 80k - 75k = 50k
      }
    });
    assert.equal(overBidRes.statusCode, 400);
  });

  test('3. Weather Insurance Claims: verifies rain precipitation threshold and unlocks payouts', async () => {
    // 1. Verified rain washout (22mm > 15mm threshold)
    const claimRes = await app.inject({
      method: 'POST',
      url: '/api/v1/insurance/claims/weather',
      payload: {
        booking_id: '00000000-0000-0000-0000-000000000021',
        match_id: 'match-001',
        precipitation_mm: 22.5
      }
    });
    assert.equal(claimRes.statusCode, 200);
    const claimData = JSON.parse(claimRes.payload);
    assert.equal(claimData.status, 'VERIFIED');
    assert.equal(claimData.payout_minor, 350000);

    // 2. Non-washout light drizzle (5mm < 15mm threshold)
    const rejectedClaimRes = await app.inject({
      method: 'POST',
      url: '/api/v1/insurance/claims/weather',
      payload: {
        booking_id: '00000000-0000-0000-0000-000000000021',
        match_id: 'match-001',
        precipitation_mm: 5.0
      }
    });
    assert.equal(rejectedClaimRes.statusCode, 200);
    const rejData = JSON.parse(rejectedClaimRes.payload);
    assert.equal(rejData.status, 'REJECTED');
    assert.equal(rejData.payout_minor, 0);
  });

  test('4. Coaching Academies: lists certified training camps and facilities', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/academies'
    });
    assert.equal(res.statusCode, 200);
    const academies = JSON.parse(res.payload);
    assert.ok(academies.length >= 2);
    assert.ok(academies[0].monthly_subscription_minor > 0);
  });

  test('5. Dynamic Pricing & Multi-Currency: calculates surge rates and regional tax conversions', async () => {
    // 1. Dynamic surge calculation
    const normalQuote = calculateDynamicPrice('slot-01', 350000, 'LOW', false);
    assert.equal(normalQuote.final_price_minor, 350000);

    const surgeQuote = calculateDynamicPrice('slot-01', 350000, 'HIGH', true); // +30% + 20% = +50%
    assert.equal(surgeQuote.final_price_minor, 525000);
    assert.equal(surgeQuote.is_peak, true);

    // 2. Multi-currency and regional tax (e.g. GBP 20% VAT)
    const conversion = calculateMultiCurrencyConversion(350000, 'INR', 'GBP', { INR: 1.0, GBP: 0.01 });
    assert.equal(conversion.currency, 'GBP');
    assert.equal(conversion.base_minor, 3500);
    assert.equal(conversion.tax_minor, 700); // 20% VAT
    assert.equal(conversion.total_minor, 4200);
  });
});
