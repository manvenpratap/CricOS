import pg from 'pg';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://cricket:cricket@localhost:5432/cricket',
  max: Number(process.env.DB_POOL_SIZE || 10),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 3000
});

pool.on('error', (err) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error('[DB] Unexpected error on idle client:', err.message);
  }
});

export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<pg.QueryResult<T>> {
  const start = Date.now();
  try {
    const res = await pool.query<T>(text, params);
    return res;
  } catch (err: any) {
    if (process.env.NODE_ENV !== 'test') {
      const errMsg = err?.message || err?.code || String(err);
      console.error(`[DB Query Error] duration=${Date.now() - start}ms sql="${text.slice(0, 100)}..." error=${errMsg}`);
    }
    throw err;
  }
}

export async function withTransaction<T>(fn: (client: pg.PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export async function isDbConnected(): Promise<boolean> {
  try {
    const res = await pool.query('SELECT 1 as alive');
    return res.rows.length > 0;
  } catch {
    return false;
  }
}

export async function closeDbPool(): Promise<void> {
  try {
    await pool.end();
  } catch (err: any) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn('[DB] Error while closing pool:', err.message);
    }
  }
}

export function getPoolStats() {
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount
  };
}
