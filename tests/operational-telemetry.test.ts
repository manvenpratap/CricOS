process.env.NODE_ENV = 'test';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { MetricsRegistry, metricsRegistry } from '../apps/api/dist/platform/metrics.js';
import { generateOpenApiSpec, getApiDocsHtml } from '../apps/api/dist/platform/openapi.js';
import { buildServer } from '../apps/api/dist/server.js';

describe('Phase 1U: Advanced Operational Telemetry, Performance Profiling & Documentation Showcase', () => {
  beforeEach(() => {
    metricsRegistry.reset();
  });

  describe('1. Prometheus Metrics Registry & Text Exposition', () => {
    it('records requests, updates latency histograms, and increments counters', () => {
      const reg = new MetricsRegistry();
      reg.recordRequest({
        route: '/api/v1/scoring/deliveries',
        method: 'POST',
        statusCode: 201,
        durationMs: 14.5
      });
      reg.recordRequest({
        route: '/api/v1/scoring/deliveries',
        method: 'POST',
        statusCode: 201,
        durationMs: 8.2
      });

      reg.incrementDeliveriesScored(12);
      reg.setActiveMatches(3);
      reg.incrementBookings(5);
      reg.incrementLedgerTransactions(10);

      const promText = reg.toPrometheusText({
        activeChannels: 2,
        activeSubscribers: 15,
        dbPoolActive: 4,
        dbPoolTotal: 10
      });

      // Prometheus exposition format asserts
      assert.ok(promText.includes('# HELP http_requests_total'));
      assert.ok(promText.includes('# TYPE http_requests_total counter'));
      assert.ok(promText.includes('http_requests_total{method="POST",route="/api/v1/scoring/deliveries",status="201"} 2'));

      assert.ok(promText.includes('# HELP http_request_duration_ms'));
      assert.ok(promText.includes('# TYPE http_request_duration_ms histogram'));
      assert.ok(promText.includes('http_request_duration_ms_count{route="/api/v1/scoring/deliveries"} 2'));

      assert.ok(promText.includes('cricket_deliveries_scored_total 12'));
      assert.ok(promText.includes('cricket_matches_active 3'));
      assert.ok(promText.includes('marketplace_bookings_total 5'));
      assert.ok(promText.includes('ledger_transactions_total 10'));
      assert.ok(promText.includes('sse_broadcast_channels_active 2'));
      assert.ok(promText.includes('sse_subscribers_active 15'));
    });

    it('measures event loop lag using native monitorEventLoopDelay', () => {
      const reg = new MetricsRegistry();
      const lag = reg.getEventLoopLagMs();
      assert.ok(typeof lag.p50 === 'number');
      assert.ok(typeof lag.p95 === 'number');
      assert.ok(typeof lag.mean === 'number');
    });

    it('formats structured JSON telemetry for /health/metrics', () => {
      const reg = new MetricsRegistry();
      reg.recordRequest({ route: '/health/live', method: 'GET', statusCode: 200, durationMs: 1.2 });
      const summary = reg.toJsonSummary({
        activeChannels: 1,
        activeSubscribers: 5,
        dbPoolStats: { total: 10, idle: 8 }
      });

      assert.strictEqual(summary.status, 'OK');
      assert.ok((summary.memory as any).rssBytes > 0);
      assert.ok((summary.cricketMetrics as any).deliveriesScoredTotal !== undefined);
      assert.strictEqual((summary.sseBroadcast as any).activeChannels, 1);
    });
  });

  describe('2. Fastify HTTP Endpoints: /metrics & /health/metrics', () => {
    it('serves Prometheus text format on GET /metrics with correct MIME type', async () => {
      const server = buildServer();
      const res = await server.inject({
        method: 'GET',
        url: '/metrics'
      });

      assert.strictEqual(res.statusCode, 200);
      assert.ok(res.headers['content-type']?.includes('text/plain'));
      assert.ok(res.body.includes('process_uptime_seconds'));
      assert.ok(res.body.includes('process_resident_memory_bytes'));
      assert.ok(res.body.includes('cricket_deliveries_scored_total'));
    });

    it('serves deep telemetry on GET /health/metrics', async () => {
      const server = buildServer();
      const res = await server.inject({
        method: 'GET',
        url: '/health/metrics'
      });

      assert.strictEqual(res.statusCode, 200);
      const json = JSON.parse(res.body);
      assert.strictEqual(json.status, 'OK');
      assert.ok(json.eventLoopLagMs);
      assert.ok(json.memory);
      assert.ok(json.cricketMetrics);
    });
  });

  describe('3. OpenAPI 3.0.3 Specification & /docs Interactive Showcase', () => {
    it('generates a valid, complete OpenAPI 3.0.3 schema document', () => {
      const spec = generateOpenApiSpec();
      assert.strictEqual(spec.openapi, '3.0.3');
      assert.strictEqual((spec.info as any).title, 'CricOS Unified Cricket Platform API');
      assert.ok((spec.tags as any[]).length >= 5);

      const paths = spec.paths as Record<string, any>;
      assert.ok(paths['/health/live']);
      assert.ok(paths['/metrics']);
      assert.ok(paths['/api/v1/scoring/matches/{id}/deliveries']);
      assert.ok(paths['/api/v1/tournaments/orchestrate']);
      assert.ok(paths['/api/v1/checkout/bookings']);
    });

    it('serves raw OpenAPI spec on GET /api/v1/openapi.json', async () => {
      const server = buildServer();
      const res = await server.inject({
        method: 'GET',
        url: '/api/v1/openapi.json'
      });

      assert.strictEqual(res.statusCode, 200);
      const spec = JSON.parse(res.body);
      assert.strictEqual(spec.openapi, '3.0.3');
      assert.strictEqual(spec.info.version, '1.0.0-phase1u');
    });

    it('serves interactive API docs portal on GET /docs with accessible tooltips', async () => {
      const server = buildServer();
      const res = await server.inject({
        method: 'GET',
        url: '/docs'
      });

      assert.strictEqual(res.statusCode, 200);
      assert.ok(res.headers['content-type']?.includes('text/html'));
      assert.ok(res.body.includes('CricOS API Showcase'));
      assert.ok(res.body.includes('data-tooltip'));
      assert.ok(res.body.includes('/api/v1/scoring/matches/{id}/deliveries'));
      assert.ok(res.body.includes('/api/v1/tournaments/orchestrate'));
    });
  });
});
