export interface ApiClientOptions {
    baseUrl?: string;
    token?: string;
}
export interface ApiResponse<T = any> {
    status: number;
    ok: boolean;
    data: T;
    error?: string;
}
export declare class CricOSApiClient {
    private baseUrl;
    private token?;
    constructor(options?: ApiClientOptions);
    setToken(token: string): void;
    getToken(): string | undefined;
    getBaseUrl(): string;
    private getHeaders;
    private request;
    getLiveness(): Promise<ApiResponse>;
    getReadiness(): Promise<ApiResponse>;
    getMetrics(): Promise<ApiResponse>;
    getMarketplaceListings(): Promise<ApiResponse>;
    createHold(slotId: string, holdMinutes?: number): Promise<ApiResponse>;
    postScoringEvent(matchId: string, event: Record<string, any>): Promise<ApiResponse>;
    getProviderReputation(providerId: string): Promise<ApiResponse>;
    postReputationEvent(params: {
        provider_id: string;
        event_type: string;
        rating?: number;
    }): Promise<ApiResponse>;
    resolveDispute(disputeId: string, params: {
        resolution: 'UPHELD_CUSTOMER_REFUND' | 'REJECTED_PROVIDER_FAVORED' | 'RESOLVED_MUTUAL';
        resolution_notes?: string;
    }): Promise<ApiResponse>;
    disbursePayout(params: {
        provider_id: string;
        booking_id?: string;
        amount_minor: number;
    }): Promise<ApiResponse>;
    /**
     * Currency minor units formatter (integer cents/paise to formatted string)
     */
    static formatMinorUnits(amountMinor: number, currency?: string): string;
}
//# sourceMappingURL=client.d.ts.map