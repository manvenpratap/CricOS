import pg from 'pg';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://cricket:cricket@localhost:5432/cricket',
  max: Number(process.env.DB_POOL_SIZE || 10),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 3000
});

let isInMemoryDevMode = false;
let hasLoggedDevModeNotice = false;

// In-Memory Dev Store for graceful offline operation
const inMemoryStore = {
  scoreEvents: [] as Array<{ id: string; matchId: string; sequence: number; payload: any }>,
  auditEvents: [] as Array<{ id: string; action: string; objectType: string; metadata: any }>,
  listings: [
    {
      id: 'lst-turf-1',
      title: 'Chinnaswamy Turf Arena - Pitch A',
      status: 'ACTIVE',
      hourly_rate_cents: 350000,
      currency: 'INR',
      created_at: new Date().toISOString()
    },
    {
      id: 'lst-turf-2',
      title: 'Wankhede Practice Turf 2',
      status: 'ACTIVE',
      hourly_rate_cents: 420000,
      currency: 'INR',
      created_at: new Date().toISOString()
    }
  ]
};

pool.on('error', (err) => {
  if (process.env.NODE_ENV !== 'test' && !isInMemoryDevMode) {
    console.error('[DB] Unexpected error on idle client:', err.message);
  }
});

export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<pg.QueryResult<T>> {
  // If already in in-memory dev mode, handle via in-memory mock store
  if (isInMemoryDevMode) {
    return handleInMemoryQuery<T>(text, params);
  }

  const start = Date.now();
  try {
    const res = await pool.query<T>(text, params);
    return res;
  } catch (err: any) {
    const errMsg = err?.message || err?.code || String(err);
    const isConnRefused = errMsg.includes('ECONNREFUSED') || errMsg.includes('EPERM') || errMsg.includes('connect');

    // In development mode, gracefully switch to In-Memory store instead of crashing or spamming logs
    if (isConnRefused && process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
      isInMemoryDevMode = true;
      if (!hasLoggedDevModeNotice) {
        hasLoggedDevModeNotice = true;
        console.warn('⚡ [DB] PostgreSQL unavailable. Operating in In-Memory Dev Mode (queries handled in-memory).');
      }
      return handleInMemoryQuery<T>(text, params);
    }

    if (process.env.NODE_ENV !== 'test') {
      console.error(`[DB Query Error] duration=${Date.now() - start}ms sql="${text.slice(0, 100)}..." error=${errMsg}`);
    }
    throw err;
  }
}

function handleInMemoryQuery<T extends pg.QueryResultRow>(
  text: string,
  params?: unknown[]
): pg.QueryResult<T> {
  const sql = text.trim().toUpperCase();

  if (sql.includes('SELECT * FROM LISTINGS') || sql.includes('FROM LISTINGS')) {
    return {
      rows: inMemoryStore.listings as unknown as T[],
      command: 'SELECT',
      rowCount: inMemoryStore.listings.length,
      oid: 0,
      fields: []
    };
  }

  if (sql.includes('INSERT INTO SCORE_EVENTS')) {
    if (params && params.length >= 6) {
      inMemoryStore.scoreEvents.push({
        id: String(params[0]),
        matchId: String(params[1]),
        sequence: Number(params[4]),
        payload: params[5]
      });
    }
    return {
      rows: [{ id: params?.[0] }] as unknown as T[],
      command: 'INSERT',
      rowCount: 1,
      oid: 0,
      fields: []
    };
  }

  if (sql.includes('INSERT INTO AUDIT_EVENTS')) {
    if (params && params.length >= 6) {
      inMemoryStore.auditEvents.push({
        id: String(params[0]),
        action: String(params[2]),
        objectType: String(params[3]),
        metadata: params[5]
      });
    }
    return {
      rows: [{ id: params?.[0] }] as unknown as T[],
      command: 'INSERT',
      rowCount: 1,
      oid: 0,
      fields: []
    };
  }

  // Default empty result for unmocked dev queries
  return {
    rows: [] as T[],
    command: 'SELECT',
    rowCount: 0,
    oid: 0,
    fields: []
  };
}

export async function withTransaction<T>(fn: (client: pg.PoolClient) => Promise<T>): Promise<T> {
  if (isInMemoryDevMode) {
    const mockClient = {
      query: (text: string, params?: unknown[]) => query(text, params),
      release: () => {}
    } as unknown as pg.PoolClient;
    return fn(mockClient);
  }

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
  if (isInMemoryDevMode) return true;
  try {
    const res = await pool.query('SELECT 1 as alive');
    return res.rows.length > 0;
  } catch {
    return false;
  }
}

export async function closeDbPool(): Promise<void> {
  if (isInMemoryDevMode) return;
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
    totalCount: isInMemoryDevMode ? 1 : pool.totalCount,
    idleCount: isInMemoryDevMode ? 1 : pool.idleCount,
    waitingCount: isInMemoryDevMode ? 0 : pool.waitingCount
  };
}

