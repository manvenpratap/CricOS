import { buildServer } from './server.js';
import { loadConfig, type AppConfig } from './platform/config.js';
import { closeDbPool } from './platform/db.js';
import { broadcastHub } from './modules/scoring/broadcast.js';
import type { FastifyInstance } from 'fastify';

// 1. Validate environment configuration
let config: AppConfig;
try {
  config = loadConfig();
} catch (err: any) {
  console.error('[Fatal Config Error]:', err.message);
  process.exit(1);
}

const server = buildServer();

let isShuttingDown = false;

export async function gracefulShutdown(app: FastifyInstance, signal: string): Promise<void> {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`[Lifecycle] Received ${signal}. Draining connections and initiating graceful shutdown...`);

  // Force exit fallback timer (10 seconds)
  const forceExitTimer = setTimeout(() => {
    console.error('[Lifecycle] Forced shutdown timed out after 10s. Forcing exit.');
    process.exit(1);
  }, 10000);
  if (forceExitTimer.unref) forceExitTimer.unref();

  try {
    // 1. Stop accepting new inbound HTTP requests
    await app.close();
    console.log('[Lifecycle] HTTP server stopped accepting connections.');

    // 2. Disconnect active SSE streams & clean heartbeats
    broadcastHub.closeAllChannels();
    console.log('[Lifecycle] SSE broadcast channels closed and heartbeats cleaned.');

    // 3. Drain PostgreSQL connection pool
    await closeDbPool();
    console.log('[Lifecycle] Database client pool cleanly drained.');

    console.log('[Lifecycle] Graceful shutdown completed cleanly.');
    process.exit(0);
  } catch (err: any) {
    console.error('[Lifecycle Error] Error during graceful shutdown:', err.message);
    process.exit(1);
  }
}

async function start() {
  try {
    const address = await server.listen({ port: config.port, host: config.host });
    console.log(`[Cricket Platform API] Server listening at ${address} in ${config.nodeEnv} mode`);

    // Register lifecycle signal listeners
    process.on('SIGTERM', () => gracefulShutdown(server, 'SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown(server, 'SIGINT'));
  } catch (err) {
    console.error('[Cricket Platform API] Failed to start server:', err);
    process.exit(1);
  }
}

start();
