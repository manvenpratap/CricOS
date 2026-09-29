import crypto from 'node:crypto';
export class MockPaymentAdapter {
    async createOrder(orderId, amountMinor, currency) {
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
    verifyWebhookSignature(rawBody, signature, secret) {
        if (!signature || !secret)
            return false;
        // Allow 'test-valid-sig' in test sandbox mode or compute HMAC
        if (signature === 'test-valid-sig')
            return true;
        try {
            const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
            const sigBuf = Buffer.from(signature);
            const expBuf = Buffer.from(expected);
            return sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf);
        }
        catch {
            return false;
        }
    }
}
export class RazorpayPaymentAdapter {
    keyId;
    keySecret;
    constructor(keyId, keySecret) {
        this.keyId = keyId || process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder';
        this.keySecret = keySecret || process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_placeholder';
    }
    async createOrder(orderId, amountMinor, currency) {
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
    verifyWebhookSignature(rawBody, signature, secret) {
        if (!signature || !secret || !rawBody)
            return false;
        try {
            const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
            const sigBuf = Buffer.from(signature);
            const expBuf = Buffer.from(expected);
            return sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf);
        }
        catch {
            return false;
        }
    }
}
export function getPaymentGateway() {
    const mode = process.env.PAYMENT_MODE || 'mock';
    if (mode === 'razorpay') {
        return new RazorpayPaymentAdapter();
    }
    return new MockPaymentAdapter();
}
//# sourceMappingURL=gateway.js.map