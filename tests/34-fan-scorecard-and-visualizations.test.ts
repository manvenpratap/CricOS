import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CricOSMobileApp,
  LiveMatchScreenController,
  type MobileUserRole
} from '../apps/mobile/dist/index.js';
import { getMobileAppHtml } from '../apps/api/dist/ui/mobile-view.js';
import { getDashboardHtml } from '../apps/api/dist/ui/dashboard.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('34. Fan Detailed Scorecard & Match Center Visualizations (Wagon Wheel, Worm, Manhattan, Partnerships)', () => {
  const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
  const distIndexHtml = fs.readFileSync(path.join(rootDir, 'dist/index.html'), 'utf8');

  describe('1. Role Permissions & Fan Spectator Mode in Web Console', () => {
    it('grants Fan persona access to Match Center (scoring) and Tactical Studio (studio)', () => {
      // Fan persona permissions
      assert.ok(indexHtml.includes("allowedTabs: ['scoring', 'teams', 'tournaments', 'studio']"));
      assert.ok(indexHtml.includes("defaultTab: 'scoring'"));
    });

    it('displays Spectator Notice and secures scoring controls in Studio for Fan persona', () => {
      assert.ok(indexHtml.includes('id="fanTacticalNotice"'));
      assert.ok(indexHtml.includes('id="studioScoringControlsGroup"'));
      assert.ok(indexHtml.includes('Fan Spectator View: Precision 8-Zone Wagon Wheel &amp; Shot Telemetry'));
      // applyRolePermissions logic for FAN and non-scorers
      assert.ok(indexHtml.includes("studioControls.style.display = (role === 'SCORER') ? 'block' : 'none';"));
      assert.ok(indexHtml.includes("fanNotice.style.display = (role === 'FAN') ? 'block' : 'none';"));
    });

    it('enforces RBAC so Fan cannot access restricted official or admin tabs', () => {
      assert.ok(!indexHtml.includes("FAN: { name: 'Fan & Spectator', allowedTabs: ['scoring', 'studio', 'admin']"));
      assert.ok(!indexHtml.includes("FAN: { name: 'Fan & Spectator', allowedTabs: ['scoring', 'studio', 'officials']"));
    });
  });

  describe('2. Match Center Detailed Scorecard Component', () => {
    it('contains Detailed Scorecard card with Innings 1 & 2 toggles and export buttons', () => {
      assert.ok(indexHtml.includes('id="cardDetailedScorecard"'));
      assert.ok(indexHtml.includes('id="btnScorecardInn1"'));
      assert.ok(indexHtml.includes('id="btnScorecardInn2"'));
      assert.ok(indexHtml.includes('id="btnExportScorecardCsv"'));
      assert.ok(indexHtml.includes('id="btnPrintScorecard"'));
    });

    it('contains batting, bowling, extras, fall of wickets and DNB containers', () => {
      assert.ok(indexHtml.includes('id="detailedScorecardBattersBody"'));
      assert.ok(indexHtml.includes('id="detailedScorecardBowlersBody"'));
      assert.ok(indexHtml.includes('id="scorecardExtrasText"'));
      assert.ok(indexHtml.includes('id="scorecardFowContainer"'));
      assert.ok(indexHtml.includes('id="scorecardDnbContainer"'));
    });

    it('includes JavaScript rendering logic for detailed scorecards and CSV exports', () => {
      assert.ok(indexHtml.includes('function switchScorecardInnings(innNum)'));
      assert.ok(indexHtml.includes('function renderDetailedScorecard('));
      assert.ok(indexHtml.includes('function downloadScorecardCsv()'));
      assert.ok(indexHtml.includes('function printScorecardView()'));
    });
  });

  describe('3. Match Center Visualizations (Worm, Manhattan, Wagon Wheel, Partnerships)', () => {
    it('contains all 4 visualization toggle buttons in Match Center', () => {
      assert.ok(indexHtml.includes('id="btnChartWorm"'));
      assert.ok(indexHtml.includes('id="btnChartManhattan"'));
      assert.ok(indexHtml.includes('id="btnChartWagon"'));
      assert.ok(indexHtml.includes('id="btnChartPartnerships"'));
    });

    it('renders interactive SVG Wagon Wheel with 8 radial sectors and shot rays', () => {
      assert.ok(indexHtml.includes("showMatchChart('WAGON')"));
      assert.ok(indexHtml.includes('id="mcWagonSvg"'));
      assert.ok(indexHtml.includes('id="mcWagonRaysGroup"'));
      assert.ok(indexHtml.includes('btnMcWagon_Virat'));
      assert.ok(indexHtml.includes('btnMcWagon_Hardik'));
      assert.ok(indexHtml.includes('btnMcWagon_All'));
      assert.ok(indexHtml.includes('id="mcWagonStanceBadge"'));
      assert.ok(indexHtml.includes('function renderMcWagonRays('));
      assert.ok(indexHtml.includes('function filterMcWagon('));
    });

    it('renders visual proportional partnership stand bars', () => {
      assert.ok(indexHtml.includes("showMatchChart('PARTNERSHIPS')"));
      assert.ok(indexHtml.includes('id="mcPartnershipBars"'));
      assert.ok(indexHtml.includes('CURRENT UNBROKEN STAND'));
    });
  });

  describe('4. Mobile App Fan Journey: Scorecard & Visualizations Parity', () => {
    it('provides Worm, Bars, Wagon, and Card analytics buttons on mobile live match screen', () => {
      const controller = new LiveMatchScreenController();
      const fanHtml = controller.renderMobileHtml('FAN', 'NONE');

      assert.ok(fanHtml.includes('data-tooltip="View Worm progression curve"'));
      assert.ok(fanHtml.includes('data-tooltip="View Manhattan over bars"'));
      assert.ok(fanHtml.includes('data-tooltip="View 8-zone Wagon Wheel"'));
      assert.ok(fanHtml.includes('data-tooltip="View full detailed scorecard"'));
    });

    it('renders interactive mobile SVG Wagon Wheel when activeChart is WAGON', () => {
      const controller = new LiveMatchScreenController();
      const wagonHtml = controller.renderMobileHtml('FAN', 'WAGON');

      assert.ok(wagonHtml.includes('🎯 Mobile Precision Wagon Wheel'));
      assert.ok(wagonHtml.includes('<svg viewBox="0 0 300 300"'));
      assert.ok(wagonHtml.includes('stroke="#00E599"')); // boundaries
      assert.ok(wagonHtml.includes('Off Runs'));
      assert.ok(wagonHtml.includes('On Runs'));
    });

    it('renders detailed scorecard tables on mobile when activeChart is SCORECARD', () => {
      const controller = new LiveMatchScreenController();
      const scorecardHtml = controller.renderMobileHtml('FAN', 'SCORECARD');

      assert.ok(scorecardHtml.includes('📄 Detailed Scorecard'));
      assert.ok(scorecardHtml.includes('Innings 2: 142/3'));
      assert.ok(scorecardHtml.includes('Rohit Verma'));
      assert.ok(scorecardHtml.includes('c Pant b Bumrah'));
      assert.ok(scorecardHtml.includes('Extras:'));
    });

    it('supports toggleMobileChart in CricOSMobileApp for WAGON and SCORECARD', () => {
      const app = new CricOSMobileApp();
      app.switchUserPersona('FAN');
      assert.strictEqual(app.getActiveChart(), 'NONE');

      app.toggleMobileChart('WAGON');
      assert.strictEqual(app.getActiveChart(), 'WAGON');

      app.toggleMobileChart('SCORECARD');
      assert.strictEqual(app.getActiveChart(), 'SCORECARD');

      app.toggleMobileChart('SCORECARD'); // toggle off
      assert.strictEqual(app.getActiveChart(), 'NONE');
    });

    it('serves mobile HTML with wagon wheel and scorecard in mobile-view endpoint', () => {
      const mobileHtml = getMobileAppHtml();
      assert.ok(mobileHtml.includes('toggleChart(this.dataset.chart)'));
      assert.ok(mobileHtml.includes('data-chart="WAGON"'));
      assert.ok(mobileHtml.includes('data-chart="SCORECARD"'));
      assert.ok(mobileHtml.includes('mobileWagonPanel'));
      assert.ok(mobileHtml.includes('mobileScorecardPanel'));
    });
  });

  describe('5. UI Tooltips & Accessibility Invariants (Rule 5)', () => {
    it('ensures all Match Center visualization buttons have data-tooltip', () => {
      assert.ok(indexHtml.includes('id="btnChartWorm"'));
      assert.ok(indexHtml.includes('data-tooltip="Run Progression Worm Chart: Compares Delhi (1st Inn) vs Mumbai (Chase)"'));
      assert.ok(indexHtml.includes('id="btnChartManhattan"'));
      assert.ok(indexHtml.includes('data-tooltip="Manhattan Over Bars: Runs scored per over with boundary and wicket highlights"'));
      assert.ok(indexHtml.includes('id="btnChartWagon"'));
      assert.ok(indexHtml.includes('data-tooltip="8-Zone Precision Wagon Wheel: Outfield shot trajectories and zone distribution"'));
      assert.ok(indexHtml.includes('id="btnChartPartnerships"'));
      assert.ok(indexHtml.includes('data-tooltip="Partnership Stand Breakdown: Visual stand contributions between batters"'));
    });

    it('ensures all Detailed Scorecard controls have data-tooltip', () => {
      assert.ok(indexHtml.includes('id="btnScorecardInn2"'));
      assert.ok(indexHtml.includes('data-tooltip="View Mumbai Super Strikers Innings 2 (Current Chase: 142/3)"'));
      assert.ok(indexHtml.includes('id="btnScorecardInn1"'));
      assert.ok(indexHtml.includes('data-tooltip="View Delhi Daredevils Innings 1 (178/10)"'));
      assert.ok(indexHtml.includes('data-tooltip="Export official scorecard as RFC 4180 CSV"'));
      assert.ok(indexHtml.includes('data-tooltip="Open print-ready scorecard sheet"'));
    });
  });

  describe('6. Packaging & Release Ship Rule (Rule 6)', () => {
    it('verifies dist/index.html is byte-for-byte identical to root index.html', () => {
      const rootBuf = fs.readFileSync(path.join(rootDir, 'index.html'));
      const distBuf = fs.readFileSync(path.join(rootDir, 'dist/index.html'));
      assert.ok(rootBuf.equals(distBuf), 'dist/index.html and root index.html must be byte-for-byte identical');
    });

    it('verifies getDashboardHtml() produces the exact byte content of index.html', () => {
      const dashboardHtml = getDashboardHtml();
      const rootBuf = fs.readFileSync(path.join(rootDir, 'index.html'));
      const generatedBuf = Buffer.from(dashboardHtml, 'utf8');
      assert.ok(rootBuf.equals(generatedBuf), 'getDashboardHtml() output must match index.html');
    });
  });
});
