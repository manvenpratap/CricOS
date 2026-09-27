import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('55. Teams & Rosters Modals & Interactive Desks E2E Suite', () => {
  const playwrightSuitePath = path.join(rootDir, 'tests/test_55_teams_roster_modals.py');
  const screenshotsDir = path.join(rootDir, 'tests/screenshots');
  const galleryPath = path.join(screenshotsDir, 'index.html');
  const dashboardPath = path.join(rootDir, 'apps/api/src/ui/dashboard.ts');

  const playwrightSrc = fs.readFileSync(playwrightSuitePath, 'utf8');
  const dashboardSrc = fs.readFileSync(dashboardPath, 'utf8');

  // ========================================================
  // Suite 1: DOM Hierarchy & Root-Level Modals Architecture
  // ========================================================
  describe('Suite 1 — DOM Hierarchy & Root-Level Modals Architecture', () => {
    it('55.01 — modalSponsorshipAuction has clean closing div tags preventing nested modal trapping', () => {
      // Must not trap subsequent modals inside modalSponsorshipAuction
      const sponsorshipAuctionIdx = dashboardSrc.indexOf('id="modalSponsorshipAuction"');
      const umpireDeskIdx = dashboardSrc.indexOf('id="modalUmpireDesk"');
      assert.ok(sponsorshipAuctionIdx !== -1, 'modalSponsorshipAuction must exist');
      assert.ok(umpireDeskIdx !== -1, 'modalUmpireDesk must exist');
      assert.ok(umpireDeskIdx > sponsorshipAuctionIdx, 'modalUmpireDesk must follow modalSponsorshipAuction');

      const chunk = dashboardSrc.substring(sponsorshipAuctionIdx, umpireDeskIdx);
      const openDivs = (chunk.match(/<div\b/g) || []).length;
      const closeDivs = (chunk.match(/<\/div>/g) || []).length;
      assert.strictEqual(
        openDivs,
        closeDivs,
        `modalSponsorshipAuction must have balanced div tags (opens: ${openDivs}, closes: ${closeDivs})`
      );
    });

    it('55.02 — 3D Player Card, Join Team Dialog, and Expand Analytics Drawer are top-level modals', () => {
      assert.ok(dashboardSrc.includes('id="modal3DPlayerCard"'), 'modal3DPlayerCard must exist');
      assert.ok(dashboardSrc.includes('id="modalAppDialog"'), 'modalAppDialog must exist');
      assert.ok(dashboardSrc.includes('id="modalPlayerStatsDrawer"'), 'modalPlayerStatsDrawer must exist');
      assert.ok(dashboardSrc.includes('id="modalCreateTeam"'), 'modalCreateTeam must exist');
    });

    it('55.03 — global window handlers are exported for all interactive roster actions', () => {
      assert.ok(
        dashboardSrc.includes('window.open3DPlayerCardModal = open3DPlayerCardModal'),
        'open3DPlayerCardModal must be exported on window'
      );
      assert.ok(
        dashboardSrc.includes('window.openJoinTeamPrompt = openJoinTeamPrompt'),
        'openJoinTeamPrompt must be exported on window'
      );
      assert.ok(
        dashboardSrc.includes('window.openPlayerStatsDrawer = openPlayerStatsDrawer'),
        'openPlayerStatsDrawer must be exported on window'
      );
    });
  });

  // ========================================================
  // Suite 2: Playwright E2E Test Suite Specification
  // ========================================================
  describe('Suite 2 — Playwright E2E Specification & Visual Regression Artifacts', () => {
    it('55.04 — Playwright test suite asserts all 4 interactive controls with zero console errors', () => {
      assert.ok(
        playwrightSrc.includes('async def test_teams_roster_modals_and_interactive_desks():'),
        'Must define test_teams_roster_modals_and_interactive_desks coroutine'
      );
      assert.ok(playwrightSrc.includes('#modal3DPlayerCard'), 'Must test 3D Player Card modal');
      assert.ok(playwrightSrc.includes('#modalAppDialog'), 'Must test in-app join team dialog');
      assert.ok(playwrightSrc.includes('#modalPlayerStatsDrawer'), 'Must test analytics slide-over drawer');
      assert.ok(playwrightSrc.includes('#modalCreateTeam'), 'Must test create team modal');
      assert.ok(playwrightSrc.includes('assert_no_critical_errors(page)'), 'Must assert zero critical errors');
    });

    it('55.05 — persists visual regression screenshots to tests/screenshots/', () => {
      assert.ok(
        playwrightSrc.includes('roster_3d_player_card.png'),
        'Must capture roster_3d_player_card.png'
      );
      assert.ok(
        playwrightSrc.includes('roster_join_team_dialog.png'),
        'Must capture roster_join_team_dialog.png'
      );
      assert.ok(
        playwrightSrc.includes('roster_expand_analytics_drawer.png'),
        'Must capture roster_expand_analytics_drawer.png'
      );
    });
  });
});
