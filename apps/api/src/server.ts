import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import crypto from 'node:crypto';
import { isDbConnected, getPoolStats } from './platform/db.js';
import { broadcastHub } from './modules/scoring/broadcast.js';
import { getDashboardHtml } from './ui/dashboard.js';

import { identityRoutes } from './modules/identity/routes.js';
import { teamsRoutes } from './modules/teams/routes.js';
import { eventsRoutes } from './modules/events/routes.js';
import { marketplaceRoutes } from './modules/marketplace/routes.js';
import { availabilityRoutes } from './modules/availability/routes.js';
import { basketRoutes } from './modules/basket/routes.js';
import { checkoutRoutes } from './modules/checkout/routes.js';
import { paymentsRoutes } from './modules/payments/routes.js';
import { bookingRoutes } from './modules/booking/routes.js';
import { cancellationsRoutes } from './modules/cancellations/routes.js';
import { settlementRoutes } from './modules/settlement/routes.js';
import { disputesRoutes } from './modules/disputes/routes.js';
import { trustRoutes } from './modules/trust/routes.js';
import { payoutsRoutes } from './modules/payouts/routes.js';
import { matchOperationsRoutes } from './modules/match-operations/routes.js';
import { scoringRoutes } from './modules/scoring/routes.js';
import { ratingsRoutes } from './modules/ratings/routes.js';
import { tournamentsRoutes } from './modules/tournaments/routes.js';
import { fixturesRoutes } from './modules/fixtures/routes.js';
import { procurementRoutes } from './modules/procurement/routes.js';
import { reschedulingRoutes } from './modules/rescheduling/routes.js';
import { operationsRoutes } from './modules/operations/routes.js';
import { notificationsRoutes } from './modules/notifications/routes.js';
import { providerIntelligenceRoutes } from './modules/provider-intelligence/routes.js';
import { replacementRoutes } from './modules/replacement/routes.js';
import { reputationRoutes } from './modules/reputation/routes.js';

export function buildServer(): FastifyInstance {
  const server = Fastify({
    logger: false, // Clean test output
    disableRequestLogging: true
  });

  // 1. CORS
  server.register(cors, {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  });

  // 2. Correlation ID & Request timing hook
  server.addHook('onRequest', async (req) => {
    (req.raw as any).correlationId = req.headers['x-correlation-id'] || crypto.randomUUID();
  });

  // 3. Global Error Handler
  server.setErrorHandler((error, _req, reply) => {
    reply.status(error.statusCode || 500).send({
      error: error.name || 'INTERNAL_ERROR',
      message: error.message || 'An unexpected error occurred'
    });
  });

  // 4. Cloud-Native Health & Readiness Probes
  server.get('/health', async (_req, reply) => {
    const dbHealthy = await isDbConnected();
    return reply.status(200).send({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database_connected: dbHealthy,
      version: '1.0.0-phase1r'
    });
  });

  server.get('/health/live', async (_req, reply) => {
    return reply.status(200).send({
      status: 'alive',
      uptime_seconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString()
    });
  });

  server.get('/health/ready', async (_req, reply) => {
    const dbHealthy = await isDbConnected();
    const poolStats = getPoolStats();
    const isReady = dbHealthy || process.env.NODE_ENV === 'test';
    const statusCode = isReady ? 200 : 503;
    return reply.status(statusCode).send({
      status: isReady ? 'ready' : 'degraded',
      database: {
        connected: dbHealthy,
        pool: poolStats
      },
      timestamp: new Date().toISOString()
    });
  });

  server.get('/health/metrics', async (_req, reply) => {
    const mem = process.memoryUsage();
    const dbHealthy = await isDbConnected();
    return reply.status(200).send({
      uptime_seconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      memory: {
        rss_bytes: mem.rss,
        heap_used_bytes: mem.heapUsed,
        heap_total_bytes: mem.heapTotal,
        external_bytes: mem.external
      },
      realtime: {
        active_broadcast_channels: broadcastHub.getActiveChannelCount(),
        total_sse_subscribers: broadcastHub.getTotalSubscribers()
      },
      database: {
        connected: dbHealthy,
        pool: getPoolStats()
      }
    });
  });

  // 5. Interactive Test & Operations Console UI
  server.get('/', async (_req, reply) => {
    return reply.type('text/html').send(getDashboardHtml());
  });
  server.get('/app', async (_req, reply) => {
    return reply.type('text/html').send(getDashboardHtml());
  });

  // 5. Register All Modules under /api/v1
  server.register(async (api) => {
    api.register(identityRoutes);
    api.register(teamsRoutes);
    api.register(eventsRoutes);
    api.register(marketplaceRoutes);
    api.register(availabilityRoutes);
    api.register(basketRoutes);
    api.register(checkoutRoutes);
    api.register(paymentsRoutes);
    api.register(bookingRoutes);
    api.register(cancellationsRoutes);
    api.register(settlementRoutes);
    api.register(disputesRoutes);
    api.register(trustRoutes);
    api.register(payoutsRoutes);
    api.register(matchOperationsRoutes);
    api.register(scoringRoutes);
    api.register(ratingsRoutes);
    api.register(tournamentsRoutes);
    api.register(fixturesRoutes);
    api.register(procurementRoutes);
    api.register(reschedulingRoutes);
    api.register(operationsRoutes);
    api.register(notificationsRoutes);
    api.register(providerIntelligenceRoutes);
    api.register(replacementRoutes);
    api.register(reputationRoutes);
  }, { prefix: '/api/v1' });

  return server;
}
