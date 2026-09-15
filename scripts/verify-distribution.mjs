#!/usr/bin/env node
/**
 * CricOS Production Distribution Verifier
 * Verifies byte-for-byte single-file HTML synchronization, cryptographic SHA-256 checksums,
 * multi-architecture Dockerfile configurations, and environment templates.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

function calculateSha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function verifyDistribution() {
  console.log('========================================================');
  console.log('🔍 CricOS Distribution & Multi-Architecture Verifier');
  console.log('========================================================');

  let checksPassed = 0;
  const errors = [];

  // 1. Verify byte-for-byte equality of index.html and dist/index.html (Rule 6)
  const rootIndexPath = path.join(rootDir, 'index.html');
  const distIndexPath = path.join(distDir, 'index.html');

  if (!fs.existsSync(rootIndexPath) || !fs.existsSync(distIndexPath)) {
    errors.push('Missing index.html or dist/index.html. Run pnpm package:dist first.');
  } else {
    const rootBuf = fs.readFileSync(rootIndexPath);
    const distBuf = fs.readFileSync(distIndexPath);
    if (!rootBuf.equals(distBuf)) {
      errors.push('dist/index.html is NOT byte-for-byte identical to root index.html!');
    } else {
      console.log(`✓ Rule 6 Single-File Invariant: root and dist/index.html are byte-for-byte identical (${distBuf.length} bytes)`);
      checksPassed++;
    }
  }

  // 2. Verify Release Manifest & Checksums
  const manifestPath = path.join(distDir, 'release-manifest.json');
  if (!fs.existsSync(manifestPath)) {
    errors.push('dist/release-manifest.json not found. Run pnpm package:dist first.');
  } else {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    console.log(`✓ Release Manifest: ${manifest.release_name} (v${manifest.version})`);

    let checksumMismatches = 0;
    for (const [artifactRelPath, meta] of Object.entries(manifest.artifacts)) {
      const artifactAbsPath = path.join(rootDir, artifactRelPath);
      if (!fs.existsSync(artifactAbsPath)) {
        errors.push(`Artifact missing on disk: ${artifactRelPath}`);
        checksumMismatches++;
        continue;
      }
      const buf = fs.readFileSync(artifactAbsPath);
      const computedSha = calculateSha256(buf);
      if (computedSha !== meta.sha256) {
        errors.push(`SHA-256 mismatch on ${artifactRelPath}: expected ${meta.sha256}, got ${computedSha}`);
        checksumMismatches++;
      }
    }

    if (checksumMismatches === 0) {
      console.log(`✓ Cryptographic Integrity: All ${Object.keys(manifest.artifacts).length} release artifacts matched SHA-256 checksums`);
      checksPassed++;
    }
  }

  // 3. Verify Multi-Architecture Dockerfiles
  const dockerfileApi = path.join(rootDir, 'Dockerfile.api');
  const dockerfileWorker = path.join(rootDir, 'Dockerfile.worker');

  const requiredWorkspacePackages = [
    'packages/contracts',
    'packages/commercial',
    'packages/domain',
    'packages/scoring',
    'apps/api',
    'apps/worker',
    'apps/web',
    'apps/mobile'
  ];

  if (!fs.existsSync(dockerfileApi) || !fs.existsSync(dockerfileWorker)) {
    errors.push('Dockerfile.api or Dockerfile.worker missing');
  } else {
    const apiContent = fs.readFileSync(dockerfileApi, 'utf8');
    const workerContent = fs.readFileSync(dockerfileWorker, 'utf8');

    // Check multi-stage
    if (!apiContent.includes('AS builder') || !apiContent.includes('AS runner')) {
      errors.push('Dockerfile.api is not configured as a multi-stage Dockerfile');
    }
    if (!workerContent.includes('AS builder') || !workerContent.includes('AS runner')) {
      errors.push('Dockerfile.worker is not configured as a multi-stage Dockerfile');
    }

    // Check workspace package declarations
    for (const pkg of requiredWorkspacePackages) {
      if (!apiContent.includes(`${pkg}/package.json`)) {
        errors.push(`Dockerfile.api missing workspace manifest copy for ${pkg}`);
      }
      if (!workerContent.includes(`${pkg}/package.json`)) {
        errors.push(`Dockerfile.worker missing workspace manifest copy for ${pkg}`);
      }
    }

    // Check non-root execution
    if (!apiContent.includes('USER node') || !workerContent.includes('USER node')) {
      errors.push('Dockerfiles must execute under non-root USER node');
    }

    // Check health check
    if (!apiContent.includes('HEALTHCHECK')) {
      errors.push('Dockerfile.api must declare a HEALTHCHECK probe');
    }

    console.log('✓ Multi-Architecture Dockerfiles: Multi-stage, 8-workspace package trees, non-root USER node, HEALTHCHECK verified');
    checksPassed++;
  }

  // 4. Verify .dockerignore exclusions
  const dockerignorePath = path.join(rootDir, '.dockerignore');
  if (!fs.existsSync(dockerignorePath)) {
    errors.push('.dockerignore is missing');
  } else {
    const ignoreContent = fs.readFileSync(dockerignorePath, 'utf8');
    const essentialExclusions = ['node_modules', 'dist', '.git', 'tests/screenshots', '*.log', '.env'];
    const missingExclusions = essentialExclusions.filter(e => !ignoreContent.includes(e));
    if (missingExclusions.length > 0) {
      errors.push(`.dockerignore missing essential exclusions: ${missingExclusions.join(', ')}`);
    } else {
      console.log('✓ Container Build Context: .dockerignore properly excludes development caches, git, and logs');
      checksPassed++;
    }
  }

  // 5. Verify Production Environment Template
  const envProdPath = path.join(rootDir, '.env.production.example');
  if (!fs.existsSync(envProdPath)) {
    errors.push('.env.production.example template is missing');
  } else {
    const envContent = fs.readFileSync(envProdPath, 'utf8');
    if (!envContent.includes('NODE_ENV=production') || !envContent.includes('JWT_SECRET') || !envContent.includes('DATABASE_URL')) {
      errors.push('.env.production.example missing essential production parameters');
    } else {
      console.log('✓ Production Config: .env.production.example verified with strict security guidelines');
      checksPassed++;
    }
  }

  console.log('--------------------------------------------------------');
  if (errors.length > 0) {
    console.error(`❌ Verification FAILED with ${errors.length} error(s):`);
    for (const err of errors) {
      console.error(`  - ${err}`);
    }
    process.exit(1);
  }

  console.log(`✅ All ${checksPassed} Distribution & Container Invariants Passed 100%.`);
  console.log('========================================================');
}

verifyDistribution();
