import pg from 'pg';

const { Client } = pg;

export async function processOutbox(client: pg.Client): Promise<number> {
  const res = await client.query(`
    SELECT * FROM outbox_events 
    WHERE processed_at IS NULL 
    ORDER BY created_at ASC 
    LIMIT 20 
    FOR UPDATE SKIP LOCKED
  `);

  for (const event of res.rows) {
    // Process outbox event (e.g. dispatch webhook, send notification)
    await client.query(`
      UPDATE outbox_events 
      SET processed_at = now() 
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

async function runWorker() {
  console.log('[Worker] Cricket Platform Worker background service starting...');
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://cricket:cricket@localhost:5432/cricket'
  });

  try {
    await client.connect();
    console.log('[Worker] Connected to PostgreSQL. Polling outbox and inventory holds.');

    // Run periodic tasks
    setInterval(async () => {
      try {
        const outboxCount = await processOutbox(client);
        const holdCount = await expireHolds(client);
        if (outboxCount > 0 || holdCount > 0) {
          console.log(`[Worker] Processed ${outboxCount} outbox events, expired ${holdCount} holds.`);
        }
      } catch (err: any) {
        console.error('[Worker Error]:', err.message);
      }
    }, 5000);
  } catch (err: any) {
    console.warn('[Worker] Could not connect to database in standalone mode:', err.message);
  }
}

if (process.env.NODE_ENV !== 'test') {
  runWorker();
}
