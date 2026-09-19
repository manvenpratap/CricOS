import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { buildServer } from '../apps/api/dist/server.js';
import type { FastifyInstance } from 'fastify';

describe('Wave 3: Multi-Provider Basket Checkout, Suborders & Invoicing API', () => {
  let app: FastifyInstance;
  const eventId = 'evt-test-basket-01';
  let createdOrderId: string;

  before(async () => {
    app = buildServer();
    await app.ready();
  });

  after(async () => {
    await app.close();
  });

  it('1. Basket Checkout: converts event basket into parent order and itemized suborders', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/events/${eventId}/basket/checkout`
    });
    assert.equal(res.statusCode, 201);
    const body = JSON.parse(res.body);
    assert.equal(body.success, true);
    assert.equal(body.event_id, eventId);
    assert.ok(body.order_id);
    assert.ok(Array.isArray(body.suborders));
    assert.equal(body.suborders.length, 2);
    assert.ok(body.total_minor > 0);

    createdOrderId = body.order_id;
  });

  it('2. Suborders Breakdown: retrieves per-provider allocations and fulfillment state', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/orders/${createdOrderId}/suborders`
    });
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.equal(body.order_id, createdOrderId);
    assert.ok(Array.isArray(body.suborders));
    assert.equal(body.suborders.length, 2);
    assert.equal(body.suborders[0].category, 'VENUE');
    assert.equal(body.suborders[1].category, 'OFFICIAL');
  });

  it('3. Order Cancellation: allows cancelling order or specific suborder scope', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/orders/${createdOrderId}/cancel`,
      payload: { reason: 'WEATHER_UNFAVORABLE', suborder_id: 'sub-01' }
    });
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.equal(body.status, 'CANCELLED');
    assert.equal(body.suborder_id, 'sub-01');
    assert.equal(body.refund_eligible, true);
  });

  it('4. Payment Retry: safely requests new client secret for failed payment', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/payments/pay-failed-01/retry`
    });
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.equal(body.success, true);
    assert.equal(body.status, 'REQUIRES_CONFIRMATION');
    assert.ok(body.gateway_order_id);
    assert.ok(body.client_secret);
  });

  it('5. Tax Invoice Snapshot: generates compliant GST invoice and receipt breakdown', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/invoices/INV-CRIC-2026-0042`
    });
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.equal(body.invoice_number, 'INV-CRIC-2026-0042');
    assert.equal(body.currency, 'INR');
    assert.ok(body.gross_base_minor > 0);
    assert.ok(body.platform_fee_minor > 0);
    assert.ok(body.cgst_minor > 0);
    assert.ok(body.sgst_minor > 0);
    assert.equal(body.total_amount_minor, body.gross_base_minor + body.platform_fee_minor + body.cgst_minor + body.sgst_minor);
    assert.ok(Array.isArray(body.items));
  });
});
