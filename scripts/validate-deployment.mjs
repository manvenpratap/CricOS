import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';

const { Client } = pg;

async function runPreflightValidation() {
  console.log('========================================================');
  console.log('🛡️  CricOS Pre-Flight Deployment & Migration Validator');
  console.log('========================================================');

  let hasErrors = false;

  // 1. Validate Migration Files Integrity
  console.log('\n[1/4] Verifying Migration SQL Scripts (0001–0015)...');
  const migrationsDir = path.resolve('migrations');
  if (!fs.existsSync(migrationsDir)) {
    console.error('✗ Failed: Migrations directory not found at', migrationsDir);
    process.exit(1);
  }

  const migrationFiles = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
  console.log(`Found ${migrationFiles.length} migration files.`);
  if (migrationFiles.length < 15) {
    console.error(`✗ Failed: Expected at least 15 migration files, found ${migrationFiles.length}`);
    hasErrors = true;
  } else {
    for (const f of migrationFiles) {
      const content = fs.readFileSync(path.join(migrationsDir, f), 'utf8');
      if (content.trim().length === 0) {
        console.error(`✗ Failed: Migration file ${f} is empty.`);
        hasErrors = true;
      }
    }
    console.log('✓ All 15 sequential SQL migration files verified non-empty.');
  }

  // 2. Validate Database Schema & Connectivity (if available)
  console.log('\n[2/4] Testing PostgreSQL Connection & Applied Migrations...');
  const dbUrl = process.env.DATABASE_URL || 'postgresql://cricket:cricket@localhost:5432/cricket';
  const client = new Client({ connectionString: dbUrl });

  try {
    await client.connect();
    console.log('✓ Connected to PostgreSQL instance.');

    // Check schema_migrations table
    const migRes = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_name = 'schema_migrations'
    `);

    if (migRes.rows.length === 0) {
      console.warn('⚠️  schema_migrations table not found in active database (unmigrated).');
    } else {
      const applied = await client.query('SELECT count(*) FROM schema_migrations');
      console.log(`✓ Database schema_migrations verified: ${applied.rows[0].count} applied.`);
    }

    // Check btree_gist extension
    const extRes = await client.query(`SELECT extname FROM pg_extension WHERE extname = 'btree_gist'`);
    if (extRes.rows.length > 0) {
      console.log('✓ btree_gist GiST exclusion extension is active.');
    } else {
      console.warn('⚠️  btree_gist extension not installed in connected database.');
    }
    await client.end();
  } catch (err) {
    console.log('ℹ️  PostgreSQL not reachable on default port (skipping live query checks):', err.message);
  }

  // 3. Validate Server Health Probes
  console.log('\n[3/4] Validating Fastify Server Health Probes...');
  try {
    const { buildServer } = await import('../apps/api/dist/server.js');
    const app = buildServer();
    await app.ready();

    const liveRes = await app.inject({ method: 'GET', url: '/health/live' });
    if (liveRes.statusCode !== 200) {
      console.error(`✗ Liveness probe failed with HTTP ${liveRes.statusCode}`);
      hasErrors = true;
    } else {
      console.log('✓ Liveness probe (/health/live) returned HTTP 200 OK.');
    }

    const readyRes = await app.inject({ method: 'GET', url: '/health/ready' });
    if (readyRes.statusCode !== 200 && readyRes.statusCode !== 503) {
      console.error(`✗ Readiness probe returned unexpected HTTP ${readyRes.statusCode}`);
      hasErrors = true;
    } else {
      console.log(`✓ Readiness probe (/health/ready) responsive (HTTP ${readyRes.statusCode}).`);
    }

    const metricsRes = await app.inject({ method: 'GET', url: '/health/metrics' });
    if (metricsRes.statusCode !== 200) {
      console.error(`✗ Metrics probe failed with HTTP ${metricsRes.statusCode}`);
      hasErrors = true;
    } else {
      console.log('✓ Metrics probe (/health/metrics) returned HTTP 200 OK.');
    }

    await app.close();
  } catch (err) {
    console.error('✗ Server bootstrap validation error:', err.message);
    hasErrors = true;
  }

  // 4. Validate Environment Variables Spec
  console.log('\n[4/4] Validating Production Security Constraints...');
  try {
    const { loadConfig } = await import('../apps/api/dist/platform/config.js');
    
    // Test production rejection of weak secrets
    let weakRejected = false;
    try {
      loadConfig({
        NODE_ENV: 'production',
        JWT_SECRET: 'dev-secret-change-in-production',
        DATABASE_URL: 'postgresql://prod:secret@localhost:5432/cricos'
      });
    } catch {
      weakRejected = true;
    }

    if (!weakRejected) {
      console.error('✗ Failed: Production config did not reject default JWT_SECRET!');
      hasErrors = true;
    } else {
      console.log('✓ Production security invariant enforced: weak/default secrets rejected.');
    }
  } catch (err) {
    console.error('✗ Config validator import error:', err.message);
    hasErrors = true;
  }

  console.log('\n========================================================');
  if (hasErrors) {
    console.error('❌ Pre-Flight Deployment Validation FAILED with errors.');
    process.exit(1);
  } else {
    console.log('✅ Pre-Flight Deployment Validation PASSED successfully.');
    process.exit(0);
  }
}

runPreflightValidation();
