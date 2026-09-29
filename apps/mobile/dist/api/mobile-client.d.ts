export interface MobileSession {
    token: string;
    userId: string;
    role: 'ADMIN' | 'ORGANISER' | 'CAPTAIN' | 'PLAYER' | 'PROVIDER' | 'SCORER';
    expiresAt: number;
}
export interface OfflineQueueItem {
    id: string;
    endpoint: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    payload?: Record<string, unknown>;
    timestamp: number;
    retryCount: number;
}
export interface MobileClientOptions {
    baseUrl?: string;
    session?: MobileSession | null;
    isOnline?: boolean;
    maxRetries?: number;
}
export declare class CricOSMobileClient {
    private baseUrl;
    private session;
    private isOnline;
    private maxRetries;
    private offlineQueue;
    constructor(options?: MobileClientOptions);
    getBaseUrl(): string;
    setBaseUrl(url: string): void;
    setSession(session: MobileSession | null): void;
    getSession(): MobileSession | null;
    clearSession(): void;
    isAuthenticated(): boolean;
    setOnlineStatus(online: boolean): void;
    getOnlineStatus(): boolean;
    getOfflineQueue(): OfflineQueueItem[];
    clearOfflineQueue(): void;
    queueOfflineAction(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', payload?: Record<string, unknown>): OfflineQueueItem;
    syncOfflineQueue(): Promise<{
        synced: number;
        failed: number;
    }>;
    private executeRequest;
    static formatMinorUnits(minorUnits: number, currency?: string): string;
    getMatchSummary(matchId: string): Promise<Record<string, unknown>>;
    recordBallEvent(matchId: string, ballData: Record<string, unknown>): Promise<Record<string, unknown>>;
    getMarketplaceSlots(category?: string): Promise<Record<string, unknown>>;
    createSlotBooking(slotId: string, paymentMethod?: string): Promise<Record<string, unknown>>;
}
//# sourceMappingURL=mobile-client.d.ts.map