/**
 * CricOS Offline Scoring & Outbox Sync Engine
 * Caches match deliveries when offline and flushes sequentially upon reconnection.
 */
export interface QueuedDelivery {
    id: string;
    clientEventId: string;
    matchId: string;
    sequence: number;
    batRuns: number;
    extraRuns: number;
    extraType: string;
    legalBall: boolean;
    isWicket: boolean;
    shotZone?: string;
    timestamp: number;
    retryCount: number;
}
export declare class OfflineDeliveryQueue {
    private queue;
    private readonly storageKey;
    private isSyncing;
    constructor(matchId?: string);
    private loadFromStorage;
    private persist;
    enqueue(delivery: Omit<QueuedDelivery, 'id' | 'timestamp' | 'retryCount'>): QueuedDelivery;
    getQueue(): QueuedDelivery[];
    getPendingCount(): number;
    clear(): void;
    flush(sender: (delivery: QueuedDelivery) => Promise<boolean>): Promise<{
        sent: number;
        failed: number;
    }>;
}
//# sourceMappingURL=offline-sync.d.ts.map