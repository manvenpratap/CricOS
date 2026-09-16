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

test('Distribution Packaging: Phase 2B Offline Scoring, Match Analytics Charts & Scorecard Export Invariants', () => {
  const rootIndex = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');

  // 1. Offline Scoring & Outbox Sync
  assert.ok(rootIndex.includes('id="telemetrySyncNode"'), 'Telemetry sync node must exist');
  assert.ok(rootIndex.includes('id="telemetrySyncVal"'), 'Telemetry sync value must exist');
  assert.ok(rootIndex.includes('triggerQueueSync()'), 'Queue sync trigger function must exist');

  // 2. Match Analytics Charts (Worm & Manhattan)
  assert.ok(rootIndex.includes('id="matchChartContainer"'), 'Match chart container must exist');
  assert.ok(rootIndex.includes('id="btnChartWorm"'), 'Worm chart toggle button must exist');
  assert.ok(rootIndex.includes('id="btnChartManhattan"'), 'Manhattan chart toggle button must exist');
  assert.ok(rootIndex.includes('showMatchChart(\'WORM\')'), 'Worm chart switcher must exist');
  assert.ok(rootIndex.includes('showMatchChart(\'MANHATTAN\')'), 'Manhattan chart switcher must exist');
  assert.ok(rootIndex.includes('renderMatchCharts()'), 'SVG chart renderer must exist');

  // 3. Official Scorecard Export & Print Sheet
  assert.ok(rootIndex.includes('id="modalScorecardExport"'), 'Scorecard export modal must exist');
  assert.ok(rootIndex.includes('openScorecardModal()'), 'Open scorecard modal trigger must exist');
  assert.ok(rootIndex.includes('downloadScorecardCsv()'), 'Download scorecard CSV handler must exist');
  assert.ok(rootIndex.includes('printScorecardView()'), 'Print scorecard view handler must exist');
  assert.ok(rootIndex.includes('id="scorecardBatterRows"'), 'Scorecard batter table body must exist');
  assert.ok(rootIndex.includes('id="scorecardBowlerRows"'), 'Scorecard bowler table body must exist');

  // 4. Match Conclusion & Victory Banner
  assert.ok(rootIndex.includes('id="matchResultBanner"'), 'Match result victory banner must exist');
  assert.ok(rootIndex.includes('id="matchResultText"'), 'Match result text display must exist');
});

test('Distribution Packaging: App Store & Google Play Store Listing Readiness Invariants', () => {
  const assetsDir = path.join(rootDir, 'apps/mobile/assets');
  const storeDir = path.join(rootDir, 'apps/mobile/store');

  // 1. Visual Store Assets
  const iconPath = path.join(assetsDir, 'icon.png');
  const adaptiveIconPath = path.join(assetsDir, 'adaptive-icon.png');
  const splashPath = path.join(assetsDir, 'splash.png');
  const featureGraphicPath = path.join(assetsDir, 'feature-graphic.png');
  const faviconPath = path.join(assetsDir, 'favicon.png');

  assert.ok(fs.existsSync(iconPath), 'App Store 1024x1024 icon.png must exist');
  assert.ok(fs.statSync(iconPath).size > 10000, 'icon.png must be non-empty valid PNG');
  assert.ok(fs.existsSync(adaptiveIconPath), 'Google Play 512x512 adaptive-icon.png must exist');
  assert.ok(fs.existsSync(splashPath), 'Mobile 1242x2436 splash.png must exist');
  assert.ok(fs.existsSync(featureGraphicPath), 'Google Play 1024x500 feature-graphic.png must exist');
  assert.ok(fs.existsSync(faviconPath), 'Favicon 48x48 must exist');

  // 2. Apple App Store Privacy Manifest (WWDC 2024 compliance)
  const privacyManifestPath = path.join(rootDir, 'apps/mobile/PrivacyInfo.xcprivacy');
  assert.ok(fs.existsSync(privacyManifestPath), 'PrivacyInfo.xcprivacy must exist');
  const privacyXml = fs.readFileSync(privacyManifestPath, 'utf8');
  assert.ok(privacyXml.includes('<key>NSPrivacyTracking</key>'), 'Privacy manifest must declare tracking state');
  assert.ok(privacyXml.includes('<false/>'), 'CricOS must declare zero tracking (<false/>)');
  assert.ok(privacyXml.includes('NSPrivacyAccessedAPITypeUserDefaults'), 'Must declare user defaults reason');

  // 3. Apple App Store Metadata Package
  const appleMetaPath = path.join(storeDir, 'apple/metadata.json');
  assert.ok(fs.existsSync(appleMetaPath), 'Apple metadata.json must exist');
  const appleMeta = JSON.parse(fs.readFileSync(appleMetaPath, 'utf8'));
  assert.ok(appleMeta.app_store_info.title.length <= 30, 'App Store title must not exceed 30 characters');
  assert.ok(appleMeta.app_store_info.subtitle.length <= 30, 'App Store subtitle must not exceed 30 characters');
  assert.ok(appleMeta.app_store_info.keywords.length <= 100, 'App Store keywords must not exceed 100 characters');
  assert.ok(appleMeta.app_store_info.description.length <= 4000, 'App Store description must not exceed 4000 characters');
  assert.ok(appleMeta.review_information.notes_for_review.length > 50, 'Review notes must provide reviewer demo instructions');

  // 4. Google Play Store Metadata & Data Safety Package
  const googleMetaPath = path.join(storeDir, 'google/metadata.json');
  const googleSafetyPath = path.join(storeDir, 'google/data-safety.json');
  assert.ok(fs.existsSync(googleMetaPath), 'Google Play metadata.json must exist');
  assert.ok(fs.existsSync(googleSafetyPath), 'Google Play data-safety.json must exist');

  const googleMeta = JSON.parse(fs.readFileSync(googleMetaPath, 'utf8'));
  assert.ok(googleMeta.listing.title.length <= 30, 'Google Play title must not exceed 30 characters');
  assert.ok(googleMeta.listing.short_description.length <= 80, 'Google Play short description must not exceed 80 characters');
  assert.ok(googleMeta.listing.full_description.length <= 4000, 'Google Play full description must not exceed 4000 characters');
  assert.equal(googleMeta.target_sdk_version, 34, 'Must target Android 14 (API level 34)');

  const googleSafety = JSON.parse(fs.readFileSync(googleSafetyPath, 'utf8'));
  assert.equal(googleSafety.data_collection_and_security.data_shared_with_third_parties, false);
  assert.equal(googleSafety.data_collection_and_security.encrypted_in_transit, true);
  assert.equal(googleSafety.data_collection_and_security.in_app_deletion_available, true);

  // 5. Legal Policies
  assert.ok(fs.existsSync(path.join(storeDir, 'legal/PRIVACY_POLICY.md')), 'PRIVACY_POLICY.md must exist');
  assert.ok(fs.existsSync(path.join(storeDir, 'legal/TERMS_OF_SERVICE.md')), 'TERMS_OF_SERVICE.md must exist');
});

test('Distribution Packaging: Archive Features & Stitch UI Invariants in Root index.html', () => {
  const rootIndex = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');

  // 1. Official Toss Management (03_UX_Blueprint_v2)
  assert.ok(rootIndex.includes('id="modalMatchToss"'), 'Official Match Toss modal must exist');
  assert.ok(rootIndex.includes('confirmTossDecision(event)'), 'Confirm toss decision handler must exist');
  assert.ok(rootIndex.includes('openTossModal()'), 'Open toss modal button must exist');

  // 2. Post-Match 5-Star Ratings & Escrow Disbursement (TRU-001...008)
  assert.ok(rootIndex.includes('id="modalMatchRating"'), 'Post-match rating modal must exist');
  assert.ok(rootIndex.includes('submitPostMatchRating(event)'), 'Submit post-match rating handler must exist');
  assert.ok(rootIndex.includes('openMatchRatingModal()'), 'Open match rating modal button must exist');

  // 3. Store Compliance & Legal Modal
  assert.ok(rootIndex.includes('id="modalLegalPolicies"'), 'Store compliance legal policies modal must exist');
  assert.ok(rootIndex.includes('openLegalModal()'), 'Open legal modal button must exist in header');
  assert.ok(rootIndex.includes('switchLegalTab('), 'Switch legal tab function must exist');

  // 4. Event Operational Readiness Bar
  assert.ok(rootIndex.includes('id="eventReadinessBanner"'), 'Event readiness banner container must exist');
  assert.ok(rootIndex.includes('initEventReadiness()'), 'Event readiness initializer must exist');

  // 5. Tournament Player Leaderboards (Orange Cap & Purple Cap, TMT-007)
  assert.ok(rootIndex.includes('id="orangeCapSubView"'), 'Orange cap batting leaderboard container must exist');
  assert.ok(rootIndex.includes('id="purpleCapSubView"'), 'Purple cap bowling leaderboard container must exist');
  assert.ok(rootIndex.includes('switchTournamentSubTab('), 'Tournament sub-tab switcher must exist');

  // 6. Umpire & Official Assignment Desk (Journey J2)
  assert.ok(rootIndex.includes('id="officialDeskContainer"'), 'Official assignment desk container must exist');
  assert.ok(rootIndex.includes('initOfficialDesk()'), 'Official desk initializer must exist');
});


