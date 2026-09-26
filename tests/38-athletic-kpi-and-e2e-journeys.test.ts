import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDashboardHtml } from '../apps/api/dist/ui/dashboard.js';
import { getMobileAppHtml } from '../apps/api/dist/ui/mobile-view.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('38. Athletic KPI & Career Stats, 3D Modals & E2E Mobile Journeys', () => {
  const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
  const distIndexHtml = fs.readFileSync(path.join(rootDir, 'dist/index.html'), 'utf8');
  const distMobileHtml = fs.readFileSync(path.join(rootDir, 'dist/mobile.html'), 'utf8');
  const dashboardHtml = getDashboardHtml();
  const mobileHtml = getMobileAppHtml();

  // ---------------------------------------------------------------------------
  // 1. 21st.dev Athletic KPI & Career Stats Architecture
  // ---------------------------------------------------------------------------
  describe('21st.dev Athletic KPI Cards & Slide-Over Drawer', () => {
    it('embeds Athletic KPI card in Squad Rosters tab (#tab-teams)', () => {
      assert.ok(indexHtml.includes('id="embeddedPlayerStatsCard"'), 'embeddedPlayerStatsCard missing in index.html');
      assert.ok(dashboardHtml.includes('id="embeddedPlayerStatsCard"'), 'embeddedPlayerStatsCard missing in dashboard.ts');
      assert.ok(indexHtml.includes('id="athleticHeroName"'), 'athleticHeroName element missing');
      assert.ok(indexHtml.includes('id="athleticHeroKpi"'), 'athleticHeroKpi element missing');
      assert.ok(indexHtml.includes('id="btnOpenStatsDrawer"'), 'btnOpenStatsDrawer missing');
    });

    it('renders laurel wreath ranking ribbon with accessible tooltip', () => {
      assert.ok(indexHtml.includes('class="athletic-ranking-ribbon"'), 'athletic-ranking-ribbon class missing');
      assert.ok(indexHtml.includes('id="athleticRankText"'), 'athleticRankText id missing');
      assert.ok(indexHtml.includes('data-tooltip="Official Division A ranking based on ELO &amp; MVP impact points"'), 'ranking ribbon tooltip missing');
    });

    it('renders slide-over analytics drawer (#modalPlayerStatsDrawer) with comprehensive tabs & splits', () => {
      assert.ok(indexHtml.includes('id="modalPlayerStatsDrawer"'), 'modalPlayerStatsDrawer missing');
      assert.ok(indexHtml.includes('id="drawerRadarContainer"'), 'drawerRadarContainer missing');
      assert.ok(indexHtml.includes('id="drawerSkillBreakdown"'), 'drawerSkillBreakdown missing');
      assert.ok(indexHtml.includes('id="drawerSplitsTableBody"'), 'drawerSplitsTableBody missing');
      assert.ok(indexHtml.includes('id="drawerGameLogTableBody"'), 'drawerGameLogTableBody missing');
    });

    it('exposes window.CricOSPlayerStats with public analytical methods', () => {
      assert.ok(indexHtml.includes('window.CricOSPlayerStats = {'), 'CricOSPlayerStats object missing');
      assert.ok(indexHtml.includes('selectPlayer: selectRosterPlayer'), 'selectPlayer method missing');
      assert.ok(indexHtml.includes('openDrawer: openPlayerStatsDrawer'), 'openDrawer method missing');
      assert.ok(indexHtml.includes('closeDrawer: closePlayerStatsDrawer'), 'closeDrawer method missing');
      assert.ok(indexHtml.includes('getPlayerData: function'), 'getPlayerData method missing');
    });
  });

  // ---------------------------------------------------------------------------
  // 2. Multi-Persona Switching & Global API
  // ---------------------------------------------------------------------------
  describe('Multi-Persona Topbar Switching & Global CricOS API', () => {
    it('exposes window.CricOS namespace with switchPersona & role permissions', () => {
      assert.ok(indexHtml.includes('window.CricOS = {'), 'window.CricOS API missing in index.html');
      assert.ok(indexHtml.includes('switchPersona: selectPersona'), 'switchPersona mapping missing');
      assert.ok(indexHtml.includes('getCurrentUser: function()'), 'getCurrentUser mapping missing');
      assert.ok(indexHtml.includes('applyRolePermissions: applyRolePermissions'), 'applyRolePermissions mapping missing');
    });

    it('supports all 8 personas in topbar badge and quick switch', () => {
      const personas = ['CAPTAIN', 'PLAYER', 'SCORER', 'FAN', 'UMPIRE', 'ORGANISER', 'TURF_PROVIDER', 'ADMIN'];
      personas.forEach(role => {
        assert.ok(indexHtml.includes(`selectPersona('${role}')`), `Persona switch button for ${role} missing in topbar menu`);
      });
      assert.ok(indexHtml.includes('id="activePersonaBadge"'), 'activePersonaBadge element missing');
    });

    it('renders quick mobile preview and APK download launcher modal', () => {
      assert.ok(indexHtml.includes('id="btnMobileQuickLauncher"'), 'btnMobileQuickLauncher missing');
      assert.ok(indexHtml.includes('id="qrMobileDemoModal"'), 'qrMobileDemoModal missing');
      assert.ok(indexHtml.includes('download="cricos-debug.apk"'), 'direct APK download link missing');
    });
  });

  // ---------------------------------------------------------------------------
  // 3. 3D Web Experiences Hub & Modal Architecture
  // ---------------------------------------------------------------------------
  describe('3D Web Experiences Hub & Root Modal Declarations', () => {
    it('ensures 3D modals are declared cleanly at root level without parent nesting', () => {
      assert.ok(indexHtml.includes('id="modal3DTrophyCabinet"'), 'modal3DTrophyCabinet missing');
      assert.ok(indexHtml.includes('id="modal3DPlayerCard"'), 'modal3DPlayerCard missing');
      assert.ok(indexHtml.includes('id="modal3DBatCustomizer"'), 'modal3DBatCustomizer missing');

      // Verify modalDlsCalculator closes cleanly before modal3DTrophyCabinet
      const dlsIdx = indexHtml.indexOf('id="modalDlsCalculator"');
      const trophyIdx = indexHtml.indexOf('id="modal3DTrophyCabinet"');
      assert.ok(dlsIdx < trophyIdx, 'modalDlsCalculator should precede modal3DTrophyCabinet');

      const intermediate = indexHtml.substring(dlsIdx, trophyIdx);
      const openCount = (intermediate.match(/<div\b/g) || []).length;
      const closeCount = (intermediate.match(/<\/div>/g) || []).length;
      assert.strictEqual(openCount, closeCount, 'modalDlsCalculator must have balanced <div> open/close tags before next modal');
    });

    it('provides 3D Trophy Cabinet, Holographic Player Card, and Bat Customizer controls', () => {
      assert.ok(indexHtml.includes('id="threeJsTrophyCanvas"'), 'threeJsTrophyCanvas missing');
      assert.ok(indexHtml.includes('id="threeJsPlayerCardCanvas"'), 'threeJsPlayerCardCanvas missing');
      assert.ok(indexHtml.includes('id="threeJsBatCanvas"'), 'threeJsBatCanvas missing');
      assert.ok(indexHtml.includes('window.open3DTrophyCabinetModal = open3DTrophyCabinetModal'), 'open3DTrophyCabinetModal missing');
      assert.ok(indexHtml.includes('window.open3DPlayerCardModal = open3DPlayerCardModal'), 'open3DPlayerCardModal missing');
      assert.ok(indexHtml.includes('window.open3DBatCustomizerModal = open3DBatCustomizerModal'), 'open3DBatCustomizerModal missing');
    });
  });

  // ---------------------------------------------------------------------------
  // 4. Mobile Client Viewport, Audio & Bottom Sheet Modal
  // ---------------------------------------------------------------------------
  describe('Consumer Mobile Viewport & Native Experience', () => {
    it('includes Web Audio sound engine CricOSAudioEngine in mobile view', () => {
      assert.ok(mobileHtml.includes('class CricOSAudioEngine'), 'CricOSAudioEngine class missing in mobile view');
      assert.ok(mobileHtml.includes('id="btnMobileSoundToggle"'), 'btnMobileSoundToggle missing in mobile view');
      assert.ok(distMobileHtml.includes('id="btnMobileSoundToggle"'), 'btnMobileSoundToggle missing in dist/mobile.html');
    });

    it('implements mobile 8-persona bottom sheet modal with Escape key dismissal', () => {
      assert.ok(mobileHtml.includes('id="btnMobilePersonaSwitch"'), 'btnMobilePersonaSwitch missing');
      assert.ok(mobileHtml.includes('id="mobilePersonaSheet"'), 'mobilePersonaSheet missing');
      assert.ok(mobileHtml.includes('id="mobileSheetBackdrop"'), 'mobileSheetBackdrop missing');
      assert.ok(mobileHtml.includes('openPersonaSheet'), 'openPersonaSheet method missing');
      assert.ok(mobileHtml.includes('closePersonaSheet'), 'closePersonaSheet method missing');
      assert.ok(mobileHtml.includes('e.key === \'Escape\''), 'Escape key listener missing in mobile view');
    });

    it('embeds 21st.dev Athletic Card in mobile Profile and Squad screens', () => {
      assert.ok(mobileHtml.includes('renderAthleticCard'), 'renderAthleticCard method missing in mobile view');
      assert.ok(mobileHtml.includes('class="athletic-stats-card"'), 'athletic-stats-card class missing in mobile view');
      assert.ok(mobileHtml.includes('this.dataset.playerId'), 'this.dataset.playerId missing for selectPlayer');
    });

    it('ensures clean JavaScript execution without syntax errors in dist/mobile.html', () => {
      assert.ok(!distMobileHtml.includes('selectPlayer(\'\''), 'Found broken string escape in selectPlayer');
      assert.ok(!distMobileHtml.includes('switchUserPersona(\'\''), 'Found broken string escape in switchUserPersona');
    });

    it('enforces 3-tier flex column layout with locked header, scroll container, and pinned bottom nav', () => {
      assert.ok(mobileHtml.includes('.mobile-scroll-body'), 'mobile-scroll-body CSS class missing');
      assert.ok(mobileHtml.includes('id="mobileScrollBody"'), 'mobileScrollBody element ID missing');
      assert.ok(mobileHtml.includes('.mobile-bottom-nav'), 'mobile-bottom-nav CSS class missing');
      assert.ok(mobileHtml.includes('id="mobileBottomNav"'), 'mobileBottomNav element ID missing');
      assert.ok(mobileHtml.includes('.mobile-header'), 'mobile-header CSS class missing');
      assert.ok(mobileHtml.includes('overscroll-behavior-y: contain'), 'overscroll-behavior-y missing on scroll body');
      assert.ok(mobileHtml.includes('-webkit-overflow-scrolling: touch'), 'webkit momentum touch scrolling missing');
      assert.ok(!mobileHtml.includes('position: absolute; bottom: 0; left: 0; right: 0; background: rgba(10, 16, 28, 0.96)'), 'Erratic absolute bottom nav anti-pattern must be completely removed');
    });
  });

  // ---------------------------------------------------------------------------
  // 5. Distribution Parity & Packaging Invariant (Rule 6)
  // ---------------------------------------------------------------------------
  describe('Distribution Parity & Rule 6 Invariants', () => {
    it('verifies root index.html and dist/index.html are byte-for-byte identical', () => {
      assert.strictEqual(
        distIndexHtml,
        indexHtml,
        'Rule 6 violation: dist/index.html must be byte-for-byte identical to root index.html'
      );
    });

    it('verifies dist/mobile.html matches getMobileAppHtml()', () => {
      assert.strictEqual(
        distMobileHtml,
        mobileHtml,
        'dist/mobile.html must match getMobileAppHtml()'
      );
    });
  });
});
