import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

function calculateSha256(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

test('Distribution Packaging: Release manifest exists and adheres to release contract', () => {
  const manifestPath = path.join(distDir, 'release-manifest.json');
  assert.ok(fs.existsSync(manifestPath), 'dist/release-manifest.json must exist');

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.equal(manifest.name, 'cricos');
  assert.equal(manifest.version, '1.0.0-phase1v');
  assert.equal(manifest.release_name, 'CricOS Unified Cricket Operating System');
  assert.ok(Array.isArray(manifest.architectures), 'architectures must be an array');
  assert.ok(manifest.architectures.includes('linux/amd64'));
  assert.ok(manifest.architectures.includes('linux/arm64'));
  assert.equal(manifest.packages.length, 8, 'must cover 8 workspace packages');
  assert.equal(manifest.single_file_sync_verified, true);
});

test('Distribution Packaging: Release manifest SHA-256 checksums match artifacts on disk', () => {
  const manifestPath = path.join(distDir, 'release-manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  for (const [artifactRelPath, meta] of Object.entries(manifest.artifacts as Record<string, { bytes: number; sha256: string }>)) {
    const artifactAbsPath = path.join(rootDir, artifactRelPath);
    assert.ok(fs.existsSync(artifactAbsPath), `Artifact must exist on disk: ${artifactRelPath}`);
    const content = fs.readFileSync(artifactAbsPath);
    const computedSha = calculateSha256(content);
    assert.equal(computedSha, meta.sha256, `SHA-256 hash mismatch on ${artifactRelPath}`);
    assert.equal(content.length, meta.bytes, `Byte length mismatch on ${artifactRelPath}`);
  }
});

test('Distribution Packaging: Rule 6 Invariant: root index.html and dist/index.html are byte-for-byte identical', () => {
  const rootIndexPath = path.join(rootDir, 'index.html');
  const distIndexPath = path.join(distDir, 'index.html');

  assert.ok(fs.existsSync(rootIndexPath), 'root index.html must exist');
  assert.ok(fs.existsSync(distIndexPath), 'dist/index.html must exist');

  const rootBuf = fs.readFileSync(rootIndexPath);
  const distBuf = fs.readFileSync(distIndexPath);

  assert.ok(rootBuf.length > 50000, 'index.html must be a complete self-contained console');
  assert.ok(rootBuf.equals(distBuf), 'dist/index.html must be byte-for-byte identical to root index.html');
});

test('Distribution Packaging: Static docs and OpenAPI specification are valid', () => {
  const docsPath = path.join(distDir, 'docs.html');
  const openapiPath = path.join(distDir, 'openapi.json');

  assert.ok(fs.existsSync(docsPath), 'dist/docs.html must exist');
  assert.ok(fs.existsSync(openapiPath), 'dist/openapi.json must exist');

  const docsHtml = fs.readFileSync(docsPath, 'utf8');
  assert.ok(docsHtml.includes('CricOS API Showcase'));
  assert.ok(docsHtml.includes('API Architecture & Operational Catalog'));
  assert.ok(docsHtml.includes('/metrics'));

  const openapiJson = fs.readFileSync(openapiPath, 'utf8');
  const spec = JSON.parse(openapiJson);
  assert.equal(spec.openapi, '3.0.3');
  assert.equal(spec.info.title, 'CricOS Unified Cricket Platform API');
  assert.ok(Object.keys(spec.paths).length >= 10, 'OpenAPI catalog must define at least 10 core route paths');
  assert.ok(spec.paths['/health/live']);
  assert.ok(spec.paths['/metrics']);
  assert.ok(spec.paths['/api/v1/tournaments/orchestrate']);
});

test('Distribution Packaging: Multi-architecture Dockerfiles declare multi-stage builds and complete workspaces', () => {
  const dockerfileApi = fs.readFileSync(path.join(rootDir, 'Dockerfile.api'), 'utf8');
  const dockerfileWorker = fs.readFileSync(path.join(rootDir, 'Dockerfile.worker'), 'utf8');

  // Verify multi-stage pattern
  assert.ok(dockerfileApi.includes('FROM node:22-alpine AS builder'));
  assert.ok(dockerfileApi.includes('FROM node:22-alpine AS runner'));
  assert.ok(dockerfileWorker.includes('FROM node:22-alpine AS builder'));
  assert.ok(dockerfileWorker.includes('FROM node:22-alpine AS runner'));

  // Verify non-root user execution
  assert.ok(dockerfileApi.includes('USER node'));
  assert.ok(dockerfileWorker.includes('USER node'));

  // Verify all workspace packages are copied for clean pnpm install
  const expectedPackages = [
    'packages/contracts',
    'packages/commercial',
    'packages/domain',
    'packages/scoring',
    'apps/api',
    'apps/worker',
    'apps/web',
    'apps/mobile'
  ];

  for (const pkg of expectedPackages) {
    assert.ok(dockerfileApi.includes(`${pkg}/package.json`), `Dockerfile.api must declare manifest for ${pkg}`);
    assert.ok(dockerfileWorker.includes(`${pkg}/package.json`), `Dockerfile.worker must declare manifest for ${pkg}`);
  }

  // Verify health check probe
  assert.ok(dockerfileApi.includes('HEALTHCHECK'));
});

test('Distribution Packaging: .dockerignore properly excludes non-production assets and test caches', () => {
  const dockerignore = fs.readFileSync(path.join(rootDir, '.dockerignore'), 'utf8');

  const requiredExclusions = [
    'node_modules',
    'dist',
    '.git',
    '.agents',
    'tests/screenshots',
    '*.log',
    '.env'
  ];

  for (const item of requiredExclusions) {
    assert.ok(dockerignore.includes(item), `.dockerignore must exclude ${item}`);
  }
});

test('Distribution Packaging: Dashboard console contains polished branding, title, and accessible navigation tooltips', () => {
  const rootIndex = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');

  // Title and branding
  assert.ok(rootIndex.includes('<title>CricOS — Unified Cricket Operating System & Interactive Console</title>'));
  assert.ok(rootIndex.includes('CricOS'));
  assert.ok(rootIndex.includes('Unified Cricket Operating System'));

  // Navigation links with data-tooltip attributes
  assert.ok(rootIndex.includes('href="/docs"'));
  assert.ok(rootIndex.includes('data-tooltip="Interactive OpenAPI 3.0 Documentation & Sandbox"'));
  assert.ok(rootIndex.includes('href="/metrics"'));
  assert.ok(rootIndex.includes('data-tooltip="Prometheus & OpenMetrics Standard Metrics Exposition"'));
  assert.ok(rootIndex.includes('href="/health/ready"'));
  assert.ok(rootIndex.includes('data-tooltip="Kubernetes Readiness Probe & Database Pool Status"'));
});

test('Distribution Packaging: Floodlit Stadium Broadcast & Athletic Precision Design System invariants', () => {
  const rootIndex = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');

  // Athletic & LED Google Fonts imports
  assert.ok(rootIndex.includes('family=Chakra+Petch:wght@500;600;700;800'));
  assert.ok(rootIndex.includes('family=Plus+Jakarta+Sans:wght@400;500;600;700;800'));
  assert.ok(rootIndex.includes('family=Space+Grotesk:wght@500;600;700;800'));

  // Color tokens & CSS variables
  assert.ok(rootIndex.includes('--turf-emerald: #00E599;'));
  assert.ok(rootIndex.includes('--cyan: #00D2FF;'));
  assert.ok(rootIndex.includes('--rose: #FF3366;'));
  assert.ok(rootIndex.includes('--font-display: \'Space Grotesk\''));
  assert.ok(rootIndex.includes('--font-score: \'Chakra Petch\''));

  // Stadium scoreboard HUD & kinetic ball bubble classes
  assert.ok(rootIndex.includes('.scoreboard'));
  assert.ok(rootIndex.includes('.main-score'));
  assert.ok(rootIndex.includes('font-family: var(--font-score);'));
  assert.ok(rootIndex.includes('.ball-bubble'));
  assert.ok(rootIndex.includes('popBall'));
});

test('Distribution Packaging: Consumer User Journeys & Interactive Modal Systems Invariants', () => {
  const rootIndex = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');

  // 1. User Profile & Persona Switcher
  assert.ok(rootIndex.includes('id="modalUserProfile"'), 'User Profile modal must exist');
  assert.ok(rootIndex.includes('id="headerUserAvatar"'), 'Header User Avatar pill must exist');
  assert.ok(rootIndex.includes('id="headerUserName"'), 'Header User Name must exist');
  assert.ok(rootIndex.includes('id="headerUserRoleBadge"'), 'Header User Role Badge must exist');
  assert.ok(rootIndex.includes('data-role="CAPTAIN"'), 'Captain persona pill must exist');
  assert.ok(rootIndex.includes('data-role="SCORER"'), 'Scorer persona pill must exist');
  assert.ok(rootIndex.includes('data-role="TURF_PROVIDER"'), 'Turf Provider persona pill must exist');
  assert.ok(rootIndex.includes('confirmAccountDeletion()'), 'Apple Guideline 5.1.1(v) account deletion handler must exist');

  // 2. Dismissal Modal Flow
  assert.ok(rootIndex.includes('id="modalDismissal"'), 'Dismissal modal must exist');
  assert.ok(rootIndex.includes('id="dismissalKind"'), 'Dismissal kind dropdown must exist');
  assert.ok(rootIndex.includes('id="fielderGroup"'), 'Fielder input group must exist');
  assert.ok(rootIndex.includes('confirmDismissal()'), 'Confirm dismissal function must exist');

  // 3. Tactical Scoring Studio & 8-Zone Wagon Wheel
  assert.ok(rootIndex.includes('id="tab-studio"'), 'Scoring Studio tab pane must exist');
  assert.ok(rootIndex.includes('wagon-wheel-container'), 'Wagon wheel container must exist');
  assert.ok(rootIndex.includes('selectShotZone(\'LONG_OFF\''), 'Long off wagon zone must exist');
  assert.ok(rootIndex.includes('selectShotZone(\'EXTRA_COVER\''), 'Extra cover wagon zone must exist');
  assert.ok(rootIndex.includes('swapStudioStrike()'), 'Swap studio strike handler must exist');
  assert.ok(rootIndex.includes('recordStudioBall(4)'), 'Boundary four scoring pad button must exist');
  assert.ok(rootIndex.includes('openDismissalModal()'), 'Wicket button must trigger dismissal modal');

  // 4. Teams & Rosters
  assert.ok(rootIndex.includes('id="tab-teams"'), 'Teams tab pane must exist');
  assert.ok(rootIndex.includes('id="playingXiContainer"'), 'Playing XI container must exist');
  assert.ok(rootIndex.includes('id="benchContainer"'), 'Bench container must exist');
  assert.ok(rootIndex.includes('id="teamJoinCodeBadge"'), 'Team join code badge must exist');
  assert.ok(rootIndex.includes('id="modalCreateTeam"'), 'Create Team modal must exist');

  // 5. 15-Minute GiST Hold & Checkout Modal
  assert.ok(rootIndex.includes('id="modalCheckout"'), 'Checkout modal must exist');
  assert.ok(rootIndex.includes('id="modalHoldTimer"'), '15-minute GiST hold timer must exist');
  assert.ok(rootIndex.includes('confirmBookingPayment()'), 'Booking payment confirmation handler must exist');
});

