#!/usr/bin/env node
/**
 * CricOS Standalone Distribution Packager
 * Generates production distribution artifacts, synchronizes root/dist single-file HTML,
 * outputs OpenAPI specifications, and calculates cryptographic SHA-256 release manifests.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const distPublicDir = path.join(distDir, 'public');

function getGitCommit() {
  try {
    return execSync('git rev-parse HEAD', { cwd: rootDir, encoding: 'utf8' }).trim();
  } catch {
    return 'untracked';
  }
}

function calculateSha256(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

async function runPackaging() {
  console.log('========================================================');
  console.log('📦 CricOS Production Distribution Packager');
  console.log('========================================================');

  // 1. Ensure target distribution directories exist
  fs.mkdirSync(distDir, { recursive: true });
  fs.mkdirSync(distPublicDir, { recursive: true });

  // 2. Compile latest TypeScript UI & API modules before importing
  try {
    execSync('npx tsc -p apps/api/tsconfig.json', { cwd: rootDir, stdio: 'pipe' });
  } catch (buildErr) {
    console.error('⚠️ tsc build warning/error:', buildErr.stdout?.toString() || buildErr.message);
    execSync('pnpm --filter @cricket-platform/api build', { cwd: rootDir, stdio: 'inherit' });
  }

  const dashboardModulePath = path.join(rootDir, 'apps/api/dist/ui/dashboard.js');
  const openapiModulePath = path.join(rootDir, 'apps/api/dist/platform/openapi.js');

  const { getDashboardHtml } = await import(dashboardModulePath);
  const { getApiDocsHtml, generateOpenApiSpec } = await import(openapiModulePath);

  // 3. Generate Dashboard Single-File Console HTML
  const dashboardHtml = getDashboardHtml();
  const rootIndexPath = path.join(rootDir, 'index.html');
  const distIndexPath = path.join(distDir, 'index.html');
  const distPublicIndexPath = path.join(distPublicDir, 'index.html');

  fs.writeFileSync(distIndexPath, dashboardHtml, 'utf8');
  fs.writeFileSync(rootIndexPath, dashboardHtml, 'utf8');
  fs.writeFileSync(distPublicIndexPath, dashboardHtml, 'utf8');

  // Verify byte-for-byte equality between dist/index.html and root index.html (Rule 6)
  const rootIndexBuf = fs.readFileSync(rootIndexPath);
  const distIndexBuf = fs.readFileSync(distIndexPath);
  const isByteEqual = rootIndexBuf.equals(distIndexBuf);

  if (!isByteEqual) {
    throw new Error('FATAL: root index.html and dist/index.html are not byte-for-byte identical!');
  }
  console.log('✓ Synced byte-for-byte identical root index.html and dist/index.html');

  // 4. Generate Interactive API Docs HTML
  const docsHtml = getApiDocsHtml();
  const distDocsPath = path.join(distDir, 'docs.html');
  const distPublicDocsPath = path.join(distPublicDir, 'docs.html');
  fs.writeFileSync(distDocsPath, docsHtml, 'utf8');
  fs.writeFileSync(distPublicDocsPath, docsHtml, 'utf8');
  console.log('✓ Generated dist/docs.html');

  // 5. Generate OpenAPI 3.0.3 Specification JSON
  const openapiSpec = generateOpenApiSpec();
  const openapiJson = JSON.stringify(openapiSpec, null, 2);
  const distOpenApiPath = path.join(distDir, 'openapi.json');
  fs.writeFileSync(distOpenApiPath, openapiJson, 'utf8');
  console.log('✓ Generated dist/openapi.json');

  // 6. Generate Standalone Mobile App Console HTML
  const mobileViewModulePath = path.join(rootDir, 'apps/api/dist/ui/mobile-view.js');
  let mobileHtml = '';
  if (fs.existsSync(mobileViewModulePath)) {
    const { getMobileAppHtml } = await import(mobileViewModulePath);
    mobileHtml = getMobileAppHtml();
    const distMobilePath = path.join(distDir, 'mobile.html');
    const distPublicMobilePath = path.join(distPublicDir, 'mobile.html');
    fs.writeFileSync(distMobilePath, mobileHtml, 'utf8');
    fs.writeFileSync(distPublicMobilePath, mobileHtml, 'utf8');
    console.log('✓ Generated dist/mobile.html & dist/public/mobile.html');

    const androidAssetPath = path.join(rootDir, 'apps/mobile/android/app/src/main/assets/index.html');
    const iosAssetPath = path.join(rootDir, 'apps/mobile/ios/CricOS/Resources/www/index.html');
    if (fs.existsSync(path.dirname(androidAssetPath))) {
      const androidHtml = mobileHtml
        .replace('<html lang="en">', '<html lang="en" class="is-native-app is-native-android">')
        .replace('<body>', '<body class="is-native-app is-native-android">');
      fs.writeFileSync(androidAssetPath, androidHtml, 'utf8');
      console.log('✓ Synced mobile distribution to Android native assets');
    }
    if (fs.existsSync(path.dirname(iosAssetPath))) {
      const iosHtml = mobileHtml
        .replace('<html lang="en">', '<html lang="en" class="is-native-app is-native-ios">')
        .replace('<body>', '<body class="is-native-app is-native-ios">');
      fs.writeFileSync(iosAssetPath, iosHtml, 'utf8');
      console.log('✓ Synced mobile distribution to iOS native assets');
    }
  }

  // 7. Compute Cryptographic Checksums & Manifest
  const gitCommit = getGitCommit();
  const now = new Date().toISOString();

  const manifest = {
    name: 'cricos',
    version: '1.0.0-phase1v',
    release_name: 'CricOS Unified Cricket Operating System',
    built_at: now,
    git_commit: gitCommit,
    architectures: [
      'linux/amd64',
      'linux/arm64',
      'darwin/arm64',
      'darwin/x64'
    ],
    modules_count: 26,
    packages: [
      '@cricket-platform/contracts',
      '@cricket-platform/domain',
      '@cricket-platform/commercial',
      '@cricket-platform/scoring',
      '@cricket-platform/api',
      '@cricket-platform/worker',
      '@cricket-platform/web',
      '@cricket-platform/mobile'
    ],
    artifacts: {
      'dist/index.html': {
        bytes: distIndexBuf.length,
        sha256: calculateSha256(distIndexBuf)
      },
      'index.html': {
        bytes: rootIndexBuf.length,
        sha256: calculateSha256(rootIndexBuf)
      },
      'dist/docs.html': {
        bytes: Buffer.byteLength(docsHtml, 'utf8'),
        sha256: calculateSha256(Buffer.from(docsHtml, 'utf8'))
      },
      'dist/openapi.json': {
        bytes: Buffer.byteLength(openapiJson, 'utf8'),
        sha256: calculateSha256(Buffer.from(openapiJson, 'utf8'))
      },
      ...(mobileHtml ? {
        'dist/mobile.html': {
          bytes: Buffer.byteLength(mobileHtml, 'utf8'),
          sha256: calculateSha256(Buffer.from(mobileHtml, 'utf8'))
        }
      } : {})
    },
    single_file_sync_verified: true
  };

  const manifestPath = path.join(distDir, 'release-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  console.log('✓ Generated dist/release-manifest.json with verified SHA-256 hashes');

  console.log('--------------------------------------------------------');
  console.log(`Version:       ${manifest.version}`);
  console.log(`Commit:        ${gitCommit.substring(0, 7)}`);
  console.log(`Console SHA:   ${manifest.artifacts['dist/index.html'].sha256.substring(0, 16)}...`);
  console.log(`OpenAPI SHA:   ${manifest.artifacts['dist/openapi.json'].sha256.substring(0, 16)}...`);
  console.log('========================================================');
  console.log('✅ Distribution Packaging Complete.');
  console.log('========================================================');
}

runPackaging().catch((err) => {
  console.error('❌ Distribution packaging failed:', err);
  process.exit(1);
});
