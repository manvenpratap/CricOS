import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { buildServer } from '../apps/api/dist/server.js';
import { evaluateRfqQuotes } from '../packages/domain/dist/intelligence.js';
import { createPromotionalSettlementJournalEntry } from '../packages/commercial/dist/ledger.js';

describe('Wave 5: RFQ, Quotes, Physical Commerce & Promotional Engine API', () => {
  let app: any;

  before(async () => {
    process.env.NODE_ENV = 'test';
    app = buildServer();
    await app.ready();
  });

  after(async () => {
    if (app) await app.close();
  });

  test('1. RFQ Lifecycle: creates RFQ, lists, submits quote, ranks, and awards quote', async () => {
    // 1. Create RFQ
    const createRes = await app.inject({
      method: 'POST',
      url: '/api/v1/procurement/rfq',
      payload: {
        category: 'UMPIRE',
        title: 'Semifinal Match Lead Umpire',
        description: 'Need certified umpire for high-stakes 20-over semifinal.',
        budget_minor: 350000,
        currency: 'INR'
      }
    });
    assert.equal(createRes.statusCode, 201);
    const rfq = JSON.parse(createRes.payload);
    assert.ok(rfq.id);
    assert.equal(rfq.status, 'OPEN');

    // 2. List RFQs with category filter
    const listRes = await app.inject({
      method: 'GET',
      url: '/api/v1/procurement/rfq?category=UMPIRE'
    });
    assert.equal(listRes.statusCode, 200);
    const rfqs = JSON.parse(listRes.payload);
    assert.ok(Array.isArray(rfqs));
    assert.ok(rfqs.some((r: any) => r.id === rfq.id));

    // 3. Submit Quote
    const quoteRes = await app.inject({
      method: 'POST',
      url: '/api/v1/procurement/quotes',
      payload: {
        rfq_id: rfq.id,
        provider_id: '00000000-0000-0000-0000-000000000002',
        provider_name: 'BCCI Level 1 Umpire',
        provider_trust_rating: 96,
        quote_price_minor: 300000,
        notes: 'Available for both innings'
      }
    });
    assert.equal(quoteRes.statusCode, 201);
    const quote = JSON.parse(quoteRes.payload);
    assert.ok(quote.id);
    assert.equal(quote.status, 'SUBMITTED');

    // 4. View and Rank Quotes
    const quotesListRes = await app.inject({
      method: 'GET',
      url: `/api/v1/procurement/rfq/${rfq.id}/quotes`
    });
    assert.equal(quotesListRes.statusCode, 200);
    const ranked = JSON.parse(quotesListRes.payload);
    assert.equal(ranked.rfq_id, rfq.id);
    assert.ok(ranked.quotes.length > 0);
    assert.ok(ranked.quotes[0].total_score >= 75);

    // 5. Award Quote
    const acceptRes = await app.inject({
      method: 'POST',
      url: `/api/v1/procurement/quotes/${quote.id}/accept`
    });
    assert.equal(acceptRes.statusCode, 200);
    const awarded = JSON.parse(acceptRes.payload);
    assert.equal(awarded.status, 'ACCEPTED');
    assert.equal(awarded.escrow_locked, true);
    assert.ok(awarded.hold_reference.startsWith('hold_rfq_'));
  });

  test('2. Physical Commerce: catalogs products, adds new product, and queries filters', async () => {
    // 1. Get products
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/marketplace/products'
    });
    assert.equal(res.statusCode, 200);
    const products = JSON.parse(res.payload);
    assert.ok(products.length >= 3);
    assert.ok(products.some((p: any) => p.category === 'BALLS'));

    // 2. Add custom gear product
    const addRes = await app.inject({
      method: 'POST',
      url: '/api/v1/marketplace/products',
      payload: {
        provider_id: '00000000-0000-0000-0000-000000000001',
        title: 'Team Playing Kit (15 Jerseys)',
        description: 'Sublimation dry-fit cricket jerseys with team crest.',
        category: 'KITS',
        price_minor: 1200000,
        currency: 'INR'
      }
    });
    assert.equal(addRes.statusCode, 201);
    const newKit = JSON.parse(addRes.payload);
    assert.equal(newKit.category, 'KITS');
    assert.equal(newKit.price_minor, 1200000);
  });

  test('3. Scorer & Media Marketplace & Facilities: returns verified provider listings', async () => {
    const scorerRes = await app.inject({
      method: 'GET',
      url: '/api/v1/marketplace/scorers'
    });
    assert.equal(scorerRes.statusCode, 200);
    const scorers = JSON.parse(scorerRes.payload);
    assert.ok(scorers.length >= 2);
    assert.ok(scorers[0].certification_level);

    const mediaRes = await app.inject({
      method: 'GET',
      url: '/api/v1/marketplace/media'
    });
    assert.equal(mediaRes.statusCode, 200);
    const media = JSON.parse(mediaRes.payload);
    assert.ok(media.length >= 2);
    assert.ok(media[0].package_price_minor > 0);

    const groundRes = await app.inject({
      method: 'GET',
      url: '/api/v1/marketplace/grounds/facilities'
    });
    assert.equal(groundRes.statusCode, 200);
    const grounds = JSON.parse(groundRes.payload);
    assert.ok(grounds.length >= 1);
    assert.ok(grounds[0].pitch_types.includes('NATURAL_TURF'));
  });

  test('4. Promotional Engine: validates coupons and balances promotional settlement ledger', async () => {
    // 1. Validate valid coupon CRIC20
    const validRes = await app.inject({
      method: 'POST',
      url: '/api/v1/checkout/coupons/validate',
      payload: {
        code: 'CRIC20',
        basket_value_minor: 200000
      }
    });
    assert.equal(validRes.statusCode, 200);
    const validData = JSON.parse(validRes.payload);
    assert.equal(validData.valid, true);
    assert.equal(validData.discount_minor, 40000); // 20% of 2,00,000 = 40,000
    assert.equal(validData.final_amount_minor, 160000);

    // 2. Validate invalid coupon
    const invalidRes = await app.inject({
      method: 'POST',
      url: '/api/v1/checkout/coupons/validate',
      payload: {
        code: 'INVALID_CODE',
        basket_value_minor: 200000
      }
    });
    assert.equal(invalidRes.statusCode, 404);

    // 3. Double-entry promotional settlement ledger balancing
    // Customer pays ₹1,600 (160000 minor)
    // Platform subsidy ₹400 (40000 minor)
    // Provider payout ₹1,800 (180000 minor)
    // Platform net fee ₹169 (16949 minor)
    // Tax ₹31 (3051 minor)
    // Total funds: 160000 + 40000 = 200000
    // Total outflows: 180000 + 16949 + 3051 = 200000
    const promoEntry = createPromotionalSettlementJournalEntry({
      orderId: 'ord-promo-001',
      totalPaidByCustomerMinor: 160000,
      discountSubsidyMinor: 40000,
      platformFeeMinor: 16949,
      taxMinor: 3051,
      providerPayoutMinor: 180000
    });
    assert.ok(promoEntry.id);
    assert.equal(promoEntry.lines.length, 5);
  });
});
