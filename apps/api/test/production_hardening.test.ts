import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { buildServer } from '../dist/server.js';
import { loadConfig } from '../dist/platform/config.js';
import { getPoolStats, closeDbPool } from '../dist/platform/db.js';
import { broadcastHub } from '../dist/modules/scoring/broadcast.js';
import type { FastifyInstance } from 'fastify';

describe('Production Deployment Hardening & Telemetry (Phase 1R)', () => {
  let app: FastifyInstance;

  before(async () => {
    app = buildServer();
    await app.ready();
  });

  after(async () => {
    await app.close();
  });

  describe('1. Configuration & Security Guardrails', () => {
    it('loads standard defaults in development and test environments', () => {
      const config = loadConfig({
        NODE_ENV: 'test',
        PORT: '3000'
      });

      assert.strictEqual(config.nodeEnv, 'test');
      assert.strictEqual(config.port, 3000);
      assert.strictEqual(config.host, '0.0.0.0');
      assert.ok(config.databaseUrl);
      assert.ok(config.jwtSecret);
    });

    it('rejects invalid ports', () => {
      assert.throws(() => {
        loadConfig({ PORT: '999999' });
      }, /INVALID_CONFIG: PORT/);

      assert.throws(() => {
        loadConfig({ PORT: 'invalid' });
      }, /INVALID_CONFIG: PORT/);
    });

    it('enforces strong JWT secret in production (rejects default dev secret)', () => {
      assert.throws(() => {
        loadConfig({
          NODE_ENV: 'production',
          JWT_SECRET: 'dev-secret-change-in-production',
          DATABASE_URL: 'postgresql://prod:pass@localhost:5432/cricket',
          APP_BASE_URL: 'https://cricos.app'
        });
      }, /INVALID_PRODUCTION_CONFIG: JWT_SECRET/);
    });

    it('enforces minimum 32-character key length in production', () => {
      assert.throws(() => {
        loadConfig({
          NODE_ENV: 'production',
          JWT_SECRET: 'short_key_123',
          DATABASE_URL: 'postgresql://prod:pass@localhost:5432/cricket',
          APP_BASE_URL: 'https://cricos.app'
        });
      }, /at least 32 characters/);
    });

    it('enforces HTTPS protocol for APP_BASE_URL in production', () => {
      assert.throws(() => {
        loadConfig({
          NODE_ENV: 'production',
          JWT_SECRET: 'a_very_secure_and_random_production_secret_key_32_chars',
          DATABASE_URL: 'postgresql://prod:pass@localhost:5432/cricket',
          APP_BASE_URL: 'http://insecure-cricos.app'
        });
      }, /must utilize HTTPS protocol in production/);
    });

    it('accepts compliant production configuration', () => {
      const prodConfig = loadConfig({
        NODE_ENV: 'production',
        JWT_SECRET: 'a_very_secure_and_random_production_secret_key_32_chars',
        DATABASE_URL: 'postgresql://prod:pass@localhost:5432/cricket',
        APP_BASE_URL: 'https://cricos.app',
        PORT: '8080'
      });

      assert.strictEqual(prodConfig.nodeEnv, 'production');
      assert.strictEqual(prodConfig.port, 8080);
      assert.strictEqual(prodConfig.appBaseUrl, 'https://cricos.app');
    });
  });

  describe('2. Cloud-Native Probes & Operational Telemetry', () => {
    it('GET /health/live returns HTTP 200 and uptime seconds', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/health/live'
      });

      assert.strictEqual(res.statusCode, 200);
      const body = res.json();
      assert.strictEqual(body.status, 'alive');
      assert.ok(typeof body.uptime_seconds === 'number');
      assert.ok(body.timestamp);
    });

    it('GET /health/ready returns readiness probe and pool metrics', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/health/ready'
      });

      assert.ok([200, 503].includes(res.statusCode));
      const body = res.json();
      assert.ok(['ready', 'degraded'].includes(body.status));
      assert.ok(body.database);
      assert.ok(typeof body.database.pool.totalCount === 'number');
    });

    it('GET /health/metrics returns comprehensive telemetry', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/health/metrics'
      });

      assert.strictEqual(res.statusCode, 200);
      const body = res.json();
      assert.ok(body.memory);
      assert.ok(body.memory.heap_used_bytes > 0);
      assert.ok(body.realtime);
      assert.strictEqual(typeof body.realtime.total_sse_subscribers, 'number');
      assert.ok(body.database);
    });
  });

  describe('3. Draining & Lifecycle Cleanup', () => {
    it('MatchBroadcastHub tracks active subscribers and drains on closeAllChannels()', () => {
      const matchId = 'lifecycle-drain-match-01';
      const unsub = broadcastHub.subscribe(matchId, () => {});

      assert.ok(broadcastHub.getTotalSubscribers() >= 1);
      assert.ok(broadcastHub.getActiveChannelCount() >= 1);

      // Clean drain
      broadcastHub.closeAllChannels();
      assert.strictEqual(broadcastHub.getTotalSubscribers(), 0);
      assert.strictEqual(broadcastHub.getActiveChannelCount(), 0);
    });

    it('reports database connection pool stats', () => {
      const stats = getPoolStats();
      assert.ok(typeof stats.totalCount === 'number');
      assert.ok(typeof stats.idleCount === 'number');
      assert.ok(typeof stats.waitingCount === 'number');
    });
  });
});
