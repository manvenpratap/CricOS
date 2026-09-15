import { buildServer } from './server.js';

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';

const server = buildServer();

async function start() {
  try {
    const address = await server.listen({ port: PORT, host: HOST });
    console.log(`[Cricket Platform API] Server listening at ${address}`);
  } catch (err) {
    console.error('[Cricket Platform API] Failed to start server:', err);
    process.exit(1);
  }
}

start();
