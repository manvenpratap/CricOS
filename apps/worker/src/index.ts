import pg from 'pg';

const { Client } = pg;

export async function processOutbox(client: pg.Client): Promise<number> {
  const res = await client.query(`
    SELECT * FROM outbox_events 
    WHERE published_at IS NULL 
    ORDER BY created_at ASC 
    LIMIT 20 
    FOR UPDATE SKIP LOCKED
  `);

  for (const event of res.rows) {
    // Process outbox event (e.g. dispatch webhook, send notification)
    await client.query(`
      UPDATE outbox_events 
      SET published_at = now() 
      WHERE id = $1
    `, [event.id]);
  }

  return res.rows.length;
}

export async function expireHolds(client: pg.Client): Promise<number> {
  const res = await client.query(`
    UPDATE inventory_holds 
    SET status = 'EXPIRED' 
    WHERE status = 'ACTIVE' AND expires_at <= now()
    RETURNING id
  `);
  return res.rowCount || 0;
}

let pollInterval: NodeJS.Timeout | null = null;
let isStopping = false;

async function shutdownWorker(client: pg.Client, signal: string) {
  if (isStopping) return;
  isStopping = true;
  console.log(`[Worker] Received ${signal}. Stopping worker intervals...`);
  if (pollInterval) clearInterval(pollInterval);
  try {
    await client.end();
    console.log('[Worker] Database client closed cleanly.');
  } catch {}
  process.exit(0);
}

async function runWorker() {
  console.log('[Worker] Cricket Platform Worker background service starting...');
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://cricket:cricket@localhost:5432/cricket'
  });

  try {
    await client.connect();
    console.log('[Worker] Connected to PostgreSQL. Polling outbox and inventory holds.');

    // Attach lifecycle signals
    process.on('SIGTERM', () => shutdownWorker(client, 'SIGTERM'));
    process.on('SIGINT', () => shutdownWorker(client, 'SIGINT'));

    // Run periodic tasks
    pollInterval = setInterval(async () => {
      if (isStopping) return;
      try {
        const outboxCount = await processOutbox(client);
        const holdCount = await expireHolds(client);
        if (outboxCount > 0 || holdCount > 0) {
          console.log(`[Worker] Processed ${outboxCount} outbox events, expired ${holdCount} holds.`);
        }
      } catch (err: any) {
        if (!isStopping) {
          console.error('[Worker Error]:', err.message);
        }
      }
    }, 5000);
  } catch (err: any) {
    console.warn('[Worker] Could not connect to database in standalone mode:', err.message);
  }
}

if (process.env.NODE_ENV !== 'test') {
  runWorker();
}
