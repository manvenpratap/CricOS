export interface RouteLatencyRecord {
    route: string;
    method: string;
    statusCode: number;
    durationMs: number;
}
export interface MetricHistogram {
    buckets: number[];
    counts: number[];
    sum: number;
    count: number;
}
export declare class MetricsRegistry {
    private static instance;
    private eventLoopMonitor;
    private requestCounters;
    private deliveriesScoredTotal;
    private activeMatchesGauge;
    private bookingsTotal;
    private ledgerTransactionsTotal;
    private readonly defaultBuckets;
    private routeHistograms;
    constructor();
    static getInstance(): MetricsRegistry;
    recordRequest(record: RouteLatencyRecord): void;
    incrementDeliveriesScored(count?: number): void;
    getDeliveriesScored(): number;
    setActiveMatches(count: number): void;
    getActiveMatches(): number;
    incrementBookings(count?: number): void;
    getBookings(): number;
    incrementLedgerTransactions(count?: number): void;
    getLedgerTransactions(): number;
    getEventLoopLagMs(): {
        min: number;
        mean: number;
        p50: number;
        p95: number;
        p99: number;
        max: number;
    };
    toPrometheusText(options?: {
        activeChannels?: number;
        activeSubscribers?: number;
        dbPoolActive?: number;
        dbPoolTotal?: number;
    }): string;
    toJsonSummary(options?: {
        activeChannels?: number;
        activeSubscribers?: number;
        dbPoolStats?: Record<string, unknown>;
    }): Record<string, unknown>;
    reset(): void;
}
export declare const metricsRegistry: MetricsRegistry;
//# sourceMappingURL=metrics.d.ts.map