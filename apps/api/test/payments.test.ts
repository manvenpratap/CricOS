import { describe, it } from 'node:test';
import assert from 'node:assert';
import crypto from 'node:crypto';
import { buildServer } from '../dist/server.js';
import { MockPaymentAdapter, RazorpayPaymentAdapter } from '../dist/modules/payments/gateway.js';

describe('Payment Gateway & Webhook Signature Hardening', () => {
  const secret = 'webhook_secret_xyz123_secure';

  it('MockPaymentAdapter generates order and verifies HMAC signature', async () => {
    const adapter = new MockPaymentAdapter();
    const order = await adapter.createOrder('ord-12345', 450000, 'INR');

    assert.strictEqual(order.orderId, 'ord-12345');
    assert.strictEqual(order.amountMinor, 450000);
    assert.strictEqual(order.currency, 'INR');
    assert.match(order.gatewayOrderId, /^order_mock_/);

    const payload = JSON.stringify({ event: 'payment.captured', orderId: 'ord-12345' });
    const validSig = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    assert.strictEqual(adapter.verifyWebhookSignature(payload, validSig, secret), true);
    assert.strictEqual(adapter.verifyWebhookSignature(payload, 'tampered_signature_hex_value_123', secret), false);
    assert.strictEqual(adapter.verifyWebhookSignature(payload, validSig, 'wrong_secret'), false);
    assert.strictEqual(adapter.verifyWebhookSignature(payload, 'test-valid-sig', secret), true);
  });

  it('RazorpayPaymentAdapter generates order and securely verifies HMAC-SHA256 signature', async () => {
    const adapter = new RazorpayPaymentAdapter('rzp_test_key', secret);
    const order = await adapter.createOrder('ord-99999', 150000, 'INR');

    assert.strictEqual(order.orderId, 'ord-99999');
    assert.strictEqual(order.amountMinor, 150000);
    assert.match(order.gatewayOrderId, /^order_rzp_/);

    const payload = JSON.stringify({
      entity: 'event',
      event: 'payment.captured',
      payload: { payment: { entity: { id: 'pay_xyz', amount: 150000, status: 'captured' } } }
    });
    const validSig = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    assert.strictEqual(adapter.verifyWebhookSignature(payload, validSig, secret), true);
    assert.strictEqual(adapter.verifyWebhookSignature(payload, 'invalid_sig', secret), false);
    assert.strictEqual(adapter.verifyWebhookSignature('', validSig, secret), false);
    assert.strictEqual(adapter.verifyWebhookSignature(payload, '', secret), false);
  });

  it('Payment Intent API endpoint generates gateway order via adapter', async () => {
    const app = await buildServer({ logger: false });
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/payments/intent',
      payload: {
        orderId: '00000000-0000-0000-0000-000000000101',
        amountMinor: 350000,
        currency: 'INR'
      }
    });

    assert.strictEqual(res.statusCode, 201);
    const body = res.json();
    assert.strictEqual(body.amountMinor, 350000);
    assert.strictEqual(body.currency, 'INR');
    assert.ok(body.gatewayOrderId);
    assert.ok(body.clientSecret);
  });

  it('Payment Webhook rejects forged webhook signature (400 Bad Request)', async () => {
    const app = await buildServer({ logger: false });
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/payments/webhook',
      headers: {
        'x-razorpay-signature': 'forged_fake_signature_hash_1234567890'
      },
      payload: {
        paymentIntentId: 'pay_fake_123',
        status: 'PAID'
      }
    });

    assert.strictEqual(res.statusCode, 400);
    const body = res.json();
    assert.strictEqual(body.error, 'INVALID_SIGNATURE');
  });

  it('Payment Webhook accepts valid webhook signature (200 OK)', async () => {
    const app = await buildServer({ logger: false });
    const payload = {
      paymentIntentId: 'pay_mock_verified_001',
      status: 'PAID'
    };
    const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET || 'wh_sec_cricos_test_secret';
    const validSig = crypto.createHmac('sha256', webhookSecret).update(JSON.stringify(payload)).digest('hex');

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/payments/webhook',
      headers: {
        'x-razorpay-signature': validSig
      },
      payload
    });

    assert.strictEqual(res.statusCode, 200);
    const body = res.json();
    assert.strictEqual(body.received, true);
  });
});
