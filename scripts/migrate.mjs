import pg from 'pg';
import fs from 'node:fs';
import path from 'node:path';

const { Client } = pg;
const connectionString = process.env.DATABASE_URL || 'postgresql://cricket:cricket@localhost:5432/cricket';
const client = new Client({ connectionString });

try {
  await client.connect();
  console.log('Connected to database for migrations.');

  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  const dir = path.resolve('migrations');
  const files = fs.readdirSync(dir).filter(x => x.endsWith('.sql')).sort();

  for (const file of files) {
    const exists = await client.query('SELECT 1 FROM schema_migrations WHERE version = $1', [file]);
    if (!exists.rowCount) {
      const sql = fs.readFileSync(path.join(dir, file), 'utf8');
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`✓ Applied migration: ${file}`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`✗ Migration failed in ${file}:`, err.message);
        throw err;
      }
    } else {
      console.log(`- Already applied: ${file}`);
    }
  }
  console.log('All migrations completed successfully.');
} catch (err) {
  console.error('Migration error:', err);
  process.exit(1);
} finally {
  await client.end();
}
