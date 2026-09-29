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
export declare class MockPaymentAdapter implements PaymentGatewayAdapter {
    createOrder(orderId: string, amountMinor: number, currency: string): Promise<PaymentOrderResult>;
    verifyWebhookSignature(rawBody: string, signature: string, secret: string): boolean;
}
export declare class RazorpayPaymentAdapter implements PaymentGatewayAdapter {
    private keyId;
    private keySecret;
    constructor(keyId?: string, keySecret?: string);
    createOrder(orderId: string, amountMinor: number, currency: string): Promise<PaymentOrderResult>;
    verifyWebhookSignature(rawBody: string, signature: string, secret: string): boolean;
}
export declare function getPaymentGateway(): PaymentGatewayAdapter;
//# sourceMappingURL=gateway.d.ts.map