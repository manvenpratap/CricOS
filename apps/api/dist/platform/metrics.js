import { monitorEventLoopDelay } from 'node:perf_hooks';
export class MetricsRegistry {
    static instance = null;
    eventLoopMonitor = null;
    // Counters
    requestCounters = new Map();
    deliveriesScoredTotal = 0;
    activeMatchesGauge = 0;
    bookingsTotal = 0;
    ledgerTransactionsTotal = 0;
    // Latency Histogram Buckets (in milliseconds)
    defaultBuckets = [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000];
    routeHistograms = new Map();
    constructor() {
        try {
            this.eventLoopMonitor = monitorEventLoopDelay({ resolution: 20 });
            this.eventLoopMonitor.enable();
        }
        catch {
            this.eventLoopMonitor = null;
        }
    }
    static getInstance() {
        if (!MetricsRegistry.instance) {
            MetricsRegistry.instance = new MetricsRegistry();
        }
        return MetricsRegistry.instance;
    }
    recordRequest(record) {
        const routeKey = record.route || 'unknown';
        const counterKey = `${record.method}_${routeKey}_${record.statusCode}`;
        this.requestCounters.set(counterKey, (this.requestCounters.get(counterKey) || 0) + 1);
        // Record into histogram
        let hist = this.routeHistograms.get(routeKey);
        if (!hist) {
            hist = {
                buckets: [...this.defaultBuckets],
                counts: new Array(this.defaultBuckets.length).fill(0),
                sum: 0,
                count: 0
            };
            this.routeHistograms.set(routeKey, hist);
        }
        hist.count += 1;
        hist.sum += record.durationMs;
        for (let i = 0; i < hist.buckets.length; i++) {
            if (record.durationMs <= hist.buckets[i]) {
                hist.counts[i] = (hist.counts[i] || 0) + 1;
            }
        }
    }
    incrementDeliveriesScored(count = 1) {
        this.deliveriesScoredTotal += count;
    }
    getDeliveriesScored() {
        return this.deliveriesScoredTotal;
    }
    setActiveMatches(count) {
        this.activeMatchesGauge = Math.max(0, count);
    }
    getActiveMatches() {
        return this.activeMatchesGauge;
    }
    incrementBookings(count = 1) {
        this.bookingsTotal += count;
    }
    getBookings() {
        return this.bookingsTotal;
    }
    incrementLedgerTransactions(count = 1) {
        this.ledgerTransactionsTotal += count;
    }
    getLedgerTransactions() {
        return this.ledgerTransactionsTotal;
    }
    getEventLoopLagMs() {
        if (!this.eventLoopMonitor) {
            return { min: 0, mean: 0, p50: 0, p95: 0, p99: 0, max: 0 };
        }
        // nanoseconds to milliseconds
        return {
            min: Math.round((this.eventLoopMonitor.min / 1e6) * 100) / 100,
            mean: Math.round((this.eventLoopMonitor.mean / 1e6) * 100) / 100,
            p50: Math.round((this.eventLoopMonitor.percentile(50) / 1e6) * 100) / 100,
            p95: Math.round((this.eventLoopMonitor.percentile(95) / 1e6) * 100) / 100,
            p99: Math.round((this.eventLoopMonitor.percentile(99) / 1e6) * 100) / 100,
            max: Math.round((this.eventLoopMonitor.max / 1e6) * 100) / 100
        };
    }
    toPrometheusText(options = {}) {
        const mem = process.memoryUsage();
        const cpu = process.cpuUsage();
        const uptime = process.uptime();
        const eventLoop = this.getEventLoopLagMs();
        const lines = [];
        // Header & metadata
        lines.push('# HELP process_uptime_seconds Process uptime in seconds');
        lines.push('# TYPE process_uptime_seconds gauge');
        lines.push(`process_uptime_seconds ${uptime.toFixed(2)}`);
        lines.push('# HELP process_resident_memory_bytes Resident memory size in bytes');
        lines.push('# TYPE process_resident_memory_bytes gauge');
        lines.push(`process_resident_memory_bytes ${mem.rss}`);
        lines.push('# HELP process_heap_bytes Process heap memory bytes');
        lines.push('# TYPE process_heap_bytes gauge');
        lines.push(`process_heap_bytes{type="used"} ${mem.heapUsed}`);
        lines.push(`process_heap_bytes{type="total"} ${mem.heapTotal}`);
        lines.push('# HELP process_cpu_seconds_total Total user and system CPU time in seconds');
        lines.push('# TYPE process_cpu_seconds_total counter');
        lines.push(`process_cpu_seconds_total{type="user"} ${(cpu.user / 1e6).toFixed(3)}`);
        lines.push(`process_cpu_seconds_total{type="system"} ${(cpu.system / 1e6).toFixed(3)}`);
        lines.push('# HELP process_event_loop_lag_ms Event loop latency lag in milliseconds');
        lines.push('# TYPE process_event_loop_lag_ms gauge');
        lines.push(`process_event_loop_lag_ms{quantile="0.50"} ${eventLoop.p50}`);
        lines.push(`process_event_loop_lag_ms{quantile="0.95"} ${eventLoop.p95}`);
        lines.push(`process_event_loop_lag_ms{quantile="0.99"} ${eventLoop.p99}`);
        lines.push(`process_event_loop_lag_ms{quantile="mean"} ${eventLoop.mean}`);
        // Business & Operational Metrics
        lines.push('# HELP cricket_deliveries_scored_total Total ball-by-ball deliveries scored');
        lines.push('# TYPE cricket_deliveries_scored_total counter');
        lines.push(`cricket_deliveries_scored_total ${this.deliveriesScoredTotal}`);
        lines.push('# HELP cricket_matches_active Number of active cricket matches');
        lines.push('# TYPE cricket_matches_active gauge');
        lines.push(`cricket_matches_active ${this.activeMatchesGauge}`);
        lines.push('# HELP marketplace_bookings_total Total provider bookings created');
        lines.push('# TYPE marketplace_bookings_total counter');
        lines.push(`marketplace_bookings_total ${this.bookingsTotal}`);
        lines.push('# HELP ledger_transactions_total Total double-entry financial settlement transactions');
        lines.push('# TYPE ledger_transactions_total counter');
        lines.push(`ledger_transactions_total ${this.ledgerTransactionsTotal}`);
        if (options.activeChannels !== undefined) {
            lines.push('# HELP sse_broadcast_channels_active Active SSE live match channels');
            lines.push('# TYPE sse_broadcast_channels_active gauge');
            lines.push(`sse_broadcast_channels_active ${options.activeChannels}`);
        }
        if (options.activeSubscribers !== undefined) {
            lines.push('# HELP sse_subscribers_active Total connected SSE clients');
            lines.push('# TYPE sse_subscribers_active gauge');
            lines.push(`sse_subscribers_active ${options.activeSubscribers}`);
        }
        if (options.dbPoolTotal !== undefined) {
            lines.push('# HELP db_pool_connections Total database pool connections');
            lines.push('# TYPE db_pool_connections gauge');
            lines.push(`db_pool_connections{state="total"} ${options.dbPoolTotal}`);
            lines.push(`db_pool_connections{state="active"} ${options.dbPoolActive || 0}`);
        }
        // HTTP Request Counters
        lines.push('# HELP http_requests_total Total HTTP requests processed by method, route, and status');
        lines.push('# TYPE http_requests_total counter');
        if (this.requestCounters.size === 0) {
            lines.push('http_requests_total{method="GET",route="/health",status="200"} 0');
        }
        else {
            for (const [key, count] of this.requestCounters.entries()) {
                const parts = key.split('_');
                const method = parts[0] || 'GET';
                const status = parts[parts.length - 1] || '200';
                const route = parts.slice(1, parts.length - 1).join('_');
                lines.push(`http_requests_total{method="${method}",route="${route}",status="${status}"} ${count}`);
            }
        }
        // HTTP Latency Histograms
        lines.push('# HELP http_request_duration_ms HTTP request latency duration histogram in milliseconds');
        lines.push('# TYPE http_request_duration_ms histogram');
        for (const [route, hist] of this.routeHistograms.entries()) {
            for (let i = 0; i < hist.buckets.length; i++) {
                lines.push(`http_request_duration_ms_bucket{route="${route}",le="${hist.buckets[i]}"} ${hist.counts[i]}`);
            }
            lines.push(`http_request_duration_ms_bucket{route="${route}",le="+Inf"} ${hist.count}`);
            lines.push(`http_request_duration_ms_sum{route="${route}"} ${hist.sum.toFixed(2)}`);
            lines.push(`http_request_duration_ms_count{route="${route}"} ${hist.count}`);
        }
        return lines.join('\n') + '\n';
    }
    toJsonSummary(options = {}) {
        const mem = process.memoryUsage();
        const eventLoop = this.getEventLoopLagMs();
        return {
            status: 'OK',
            timestamp: new Date().toISOString(),
            uptime_seconds: Math.floor(process.uptime()),
            uptimeSeconds: Math.floor(process.uptime()),
            memory: {
                rss: mem.rss,
                rss_bytes: mem.rss,
                rssBytes: mem.rss,
                heap_used_bytes: mem.heapUsed,
                heapUsedBytes: mem.heapUsed,
                heap_total_bytes: mem.heapTotal,
                heapTotalBytes: mem.heapTotal,
                external_bytes: mem.external,
                externalBytes: mem.external
            },
            realtime: {
                active_broadcast_channels: options.activeChannels || 0,
                total_sse_subscribers: options.activeSubscribers || 0
            },
            eventLoopLagMs: eventLoop,
            cricketMetrics: {
                deliveriesScoredTotal: this.deliveriesScoredTotal,
                activeMatches: this.activeMatchesGauge,
                marketplaceBookingsTotal: this.bookingsTotal,
                ledgerTransactionsTotal: this.ledgerTransactionsTotal
            },
            sseBroadcast: {
                activeChannels: options.activeChannels || 0,
                totalSubscribers: options.activeSubscribers || 0
            },
            databasePool: options.dbPoolStats || {},
            routeHistograms: Array.from(this.routeHistograms.entries()).map(([route, h]) => ({
                route,
                totalRequests: h.count,
                avgDurationMs: h.count > 0 ? Math.round((h.sum / h.count) * 100) / 100 : 0
            }))
        };
    }
    reset() {
        this.requestCounters.clear();
        this.routeHistograms.clear();
        this.deliveriesScoredTotal = 0;
        this.activeMatchesGauge = 0;
        this.bookingsTotal = 0;
        this.ledgerTransactionsTotal = 0;
    }
}
export const metricsRegistry = MetricsRegistry.getInstance();
//# sourceMappingURL=metrics.js.map