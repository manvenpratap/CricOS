import crypto from 'node:crypto';

export interface PaymentOrderResult {
  gatewayOrderId: string;
  orderId: string;
  amountMinor: number;
  currency: string;
  clientSecret: string;
  status: 'CREATED' | 'REQUIRES_PAYMENT_METHOD' | 'PROCESSING';
}

export interface PaymentGatewayAdapter {
  createOrder(orderId: string, amountMinor: number, currency: string): Promise<PaymentOrderResult>;
  verifyWebhookSignature(rawBody: string, signature: string, secret: string): boolean;
}

export class MockPaymentAdapter implements PaymentGatewayAdapter {
  async createOrder(orderId: string, amountMinor: number, currency: string): Promise<PaymentOrderResult> {
    const gatewayOrderId = `order_mock_${orderId.replace(/-/g, '').slice(0, 14)}`;
    return {
      gatewayOrderId,
      orderId,
      amountMinor,
      currency,
      clientSecret: `mock_secret_${crypto.randomBytes(16).toString('hex')}`,
      status: 'REQUIRES_PAYMENT_METHOD'
    };
  }

  verifyWebhookSignature(rawBody: string, signature: string, secret: string): boolean {
    if (!signature || !secret) return false;
    // Allow 'test-valid-sig' in test sandbox mode or compute HMAC
    if (signature === 'test-valid-sig') return true;

    try {
      const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
      const sigBuf = Buffer.from(signature);
      const expBuf = Buffer.from(expected);
      return sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf);
    } catch {
      return false;
    }
  }
}

export class RazorpayPaymentAdapter implements PaymentGatewayAdapter {
  private keyId: string;
  private keySecret: string;

  constructor(keyId?: string, keySecret?: string) {
    this.keyId = keyId || process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder';
    this.keySecret = keySecret || process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_placeholder';
  }

  async createOrder(orderId: string, amountMinor: number, currency: string): Promise<PaymentOrderResult> {
    const gatewayOrderId = `order_rzp_${crypto.randomBytes(8).toString('hex')}`;
    return {
      gatewayOrderId,
      orderId,
      amountMinor,
      currency,
      clientSecret: `${this.keyId}:${gatewayOrderId}`,
      status: 'REQUIRES_PAYMENT_METHOD'
    };
  }

  verifyWebhookSignature(rawBody: string, signature: string, secret: string): boolean {
    if (!signature || !secret || !rawBody) return false;
    try {
      const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
      const sigBuf = Buffer.from(signature);
      const expBuf = Buffer.from(expected);
      return sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf);
    } catch {
      return false;
    }
  }
}

export function getPaymentGateway(): PaymentGatewayAdapter {
  const mode = process.env.PAYMENT_MODE || 'mock';
  if (mode === 'razorpay') {
    return new RazorpayPaymentAdapter();
  }
  return new MockPaymentAdapter();
}
