import Fastify from 'fastify';
import cors from '@fastify/cors';
import crypto from 'node:crypto';
import { isDbConnected, getPoolStats } from './platform/db.js';
import { broadcastHub } from './modules/scoring/broadcast.js';
import { getDashboardHtml } from './ui/dashboard.js';
import { getMobileAppHtml } from './ui/mobile-view.js';
import { metricsRegistry } from './platform/metrics.js';
import { generateOpenApiSpec, getApiDocsHtml } from './platform/openapi.js';
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
import { officialsRoutes } from './modules/officials/routes.js';
import { conversationsRoutes } from './modules/conversations/routes.js';
import { adminRoutes } from './modules/admin/routes.js';
import { operationsExtendedRoutes } from './modules/operations/extended-routes.js';
import { intelligenceRoutes } from './modules/intelligence/routes.js';
import { promotionsAndSponsorshipRoutes } from './modules/promotions-and-sponsorship/routes.js';
import { AppError } from './platform/errors.js';
import { recordAuditEvent } from './platform/audit.js';
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 500; // 500 requests per minute per IP
export function buildServer() {
    const server = Fastify({
        logger: false, // Clean test output
        disableRequestLogging: true
    });
    // 1. CORS
    server.register(cors, {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    });
    // 2. Correlation ID, Request Timing & Security Headers Hook
    server.addHook('onRequest', async (req, reply) => {
        const correlationId = req.headers['x-correlation-id'] || crypto.randomUUID();
        req.raw.correlationId = correlationId;
        req.raw.startTime = process.hrtime.bigint();
        // Echo correlation and request ID headers back to the client
        reply.header('x-correlation-id', correlationId);
        reply.header('x-request-id', correlationId);
        // Baseline security headers (XSS, Sniffing, Framing)
        reply.header('x-content-type-options', 'nosniff');
        reply.header('x-frame-options', 'SAMEORIGIN');
        reply.header('referrer-policy', 'strict-origin-when-cross-origin');
        reply.header('x-xss-protection', '1; mode=block');
    });
    // 3. Rate Limiting PreHandler Hook
    server.addHook('preHandler', async (req, reply) => {
        const url = req.url || '';
        // Skip rate limiting for probes, docs, metrics, and static previews
        if (url.startsWith('/health') ||
            url.startsWith('/metrics') ||
            url === '/' ||
            url === '/mobile' ||
            url === '/docs' ||
            process.env.NODE_ENV === 'test') {
            return;
        }
        const clientIp = String(req.headers['x-forwarded-for'] || req.ip || '127.0.0.1');
        const now = Date.now();
        let entry = rateLimitMap.get(clientIp);
        if (!entry || now > entry.resetTime) {
            entry = { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS };
            rateLimitMap.set(clientIp, entry);
        }
        else {
            entry.count++;
        }
        const remaining = Math.max(0, RATE_LIMIT_MAX - entry.count);
        reply.header('x-ratelimit-limit', RATE_LIMIT_MAX);
        reply.header('x-ratelimit-remaining', remaining);
        reply.header('x-ratelimit-reset', Math.ceil(entry.resetTime / 1000));
        if (entry.count > RATE_LIMIT_MAX) {
            const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
            reply.header('retry-after', retryAfter);
            return reply.status(429).send({
                error: 'RATE_LIMIT_EXCEEDED',
                message: `Too many requests. Please retry in ${retryAfter} seconds.`
            });
        }
    });
    // 4. Metrics Recording & Mutating Audit Event Logging
    server.addHook('onResponse', async (req, reply) => {
        const startTime = req.raw.startTime;
        if (startTime) {
            const elapsedNs = Number(process.hrtime.bigint() - startTime);
            const durationMs = Math.round((elapsedNs / 1e6) * 100) / 100;
            const routeUrl = req.routeOptions.url || req.url.split('?')[0] || 'unknown';
            metricsRegistry.recordRequest({
                method: req.method,
                route: routeUrl,
                statusCode: reply.statusCode,
                durationMs
            });
        }
        // Persist audit event on successful mutations under /api/v1
        const method = req.method;
        const statusCode = reply.statusCode;
        const url = req.url;
        if (['POST', 'PUT', 'DELETE'].includes(method) && url.startsWith('/api/v1/') && statusCode < 400) {
            const user = req.user;
            const actorUserId = user?.userId || null;
            const basePath = (url || '').split('?')[0] || '';
            const segments = basePath.split('/').filter(Boolean);
            const objectType = segments[2] || 'system';
            const rawId = segments[3];
            const objectId = rawId && rawId.length > 10 ? rawId : null;
            recordAuditEvent({
                actorUserId,
                action: `${method}_${objectType.toUpperCase()}`,
                objectType,
                objectId,
                metadata: {
                    url,
                    statusCode,
                    correlationId: req.raw.correlationId
                }
            }).catch(() => { });
        }
    });
    // 5. Global Error Handler with AppError Hierarchy Support
    server.setErrorHandler((error, _req, reply) => {
        if (error instanceof AppError) {
            return reply.status(error.statusCode).send({
                error: error.code,
                message: error.message,
                details: error.details
            });
        }
        const statusCode = error.statusCode || 500;
        return reply.status(statusCode).send({
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
            version: '1.0.0-phase1u'
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
        const dbHealthy = await isDbConnected();
        const poolStats = getPoolStats();
        return reply.status(200).send({
            ...metricsRegistry.toJsonSummary({
                activeChannels: broadcastHub.getActiveChannelCount(),
                activeSubscribers: broadcastHub.getTotalSubscribers(),
                dbPoolStats: poolStats
            }),
            database: {
                connected: dbHealthy,
                pool: poolStats
            },
            database_connected: dbHealthy
        });
    });
    server.get('/metrics', async (_req, reply) => {
        const poolStats = getPoolStats();
        const text = metricsRegistry.toPrometheusText({
            activeChannels: broadcastHub.getActiveChannelCount(),
            activeSubscribers: broadcastHub.getTotalSubscribers(),
            dbPoolActive: poolStats.totalCount - poolStats.idleCount,
            dbPoolTotal: poolStats.totalCount
        });
        return reply.type('text/plain; version=0.0.4; charset=utf-8').send(text);
    });
    server.get('/api/v1/openapi.json', async (_req, reply) => {
        return reply.status(200).send(generateOpenApiSpec());
    });
    server.get('/docs', async (_req, reply) => {
        return reply.type('text/html; charset=utf-8').send(getApiDocsHtml());
    });
    server.get('/mobile', async (_req, reply) => {
        return reply.type('text/html; charset=utf-8').send(getMobileAppHtml());
    });
    server.get('/mobile.html', async (_req, reply) => {
        return reply.type('text/html; charset=utf-8').send(getMobileAppHtml());
    });
    // 5. Interactive Test & Operations Console UI
    server.get('/', async (_req, reply) => {
        return reply.type('text/html; charset=utf-8').send(getDashboardHtml());
    });
    server.get('/index.html', async (_req, reply) => {
        return reply.type('text/html; charset=utf-8').send(getDashboardHtml());
    });
    server.get('/app', async (_req, reply) => {
        return reply.type('text/html; charset=utf-8').send(getDashboardHtml());
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
        api.register(officialsRoutes);
        api.register(conversationsRoutes);
        api.register(adminRoutes);
        api.register(operationsExtendedRoutes);
        api.register(intelligenceRoutes);
        api.register(promotionsAndSponsorshipRoutes);
    }, { prefix: '/api/v1' });
    return server;
}
//# sourceMappingURL=server.js.map