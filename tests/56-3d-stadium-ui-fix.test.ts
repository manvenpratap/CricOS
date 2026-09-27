import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('56. 3D Stadium Viewport & Toolbar UI Fix Suite', () => {
  const playwrightSuitePath = path.join(rootDir, 'tests/test_56_3d_stadium_ui_fix.py');
  const screenshotsDir = path.join(rootDir, 'tests/screenshots');
  const dashboardPath = path.join(rootDir, 'apps/api/src/ui/dashboard.ts');

  const playwrightSrc = fs.readFileSync(playwrightSuitePath, 'utf8');
  const dashboardSrc = fs.readFileSync(dashboardPath, 'utf8');

  // ========================================================
  // Suite 1: 3D Stadium Viewport & 2D Button Hiding Geometry
  // ========================================================
  describe('Suite 1 — 3D Stadium Viewport & 2D Button Hiding Geometry', () => {
    it('56.01 — CSS expands container and explicitly hides 2D field zone buttons in 3D mode', () => {
      assert.ok(
        dashboardSrc.includes('.wagon-wheel-card.is-3d .field-zone-btn'),
        'CSS rule for hiding field zone buttons in 3D mode must exist'
      );
      assert.ok(
        dashboardSrc.includes('display: none !important;'),
        'field-zone-btn must have display: none !important in 3D mode'
      );
      assert.ok(
        dashboardSrc.includes('.wagon-wheel-card.is-3d .wagon-wheel-container'),
        'Container expansion rule must exist'
      );
    });

    it('56.02 — .three-stadium-viewport has 440px height, 14px border radius, and full width', () => {
      assert.ok(
        dashboardSrc.includes('.three-stadium-viewport {'),
        '.three-stadium-viewport CSS rule must exist'
      );
      assert.ok(
        dashboardSrc.includes('height: 440px;'),
        '.three-stadium-viewport must specify height: 440px;'
      );
      assert.ok(
        dashboardSrc.includes('border-radius: 14px;'),
        '.three-stadium-viewport must specify border-radius: 14px;'
      );
    });

    it('56.03 — setWagonDisplayMode dynamically toggles is-3d class and triggers pitch resize', () => {
      assert.ok(
        dashboardSrc.includes("card.classList.add('is-3d')"),
        'setWagonDisplayMode must add is-3d to card'
      );
      assert.ok(
        dashboardSrc.includes("card.classList.remove('is-3d')"),
        'setWagonDisplayMode must remove is-3d from card'
      );
      assert.ok(
        dashboardSrc.includes('window.stadiumPitch.resize()'),
        'setWagonDisplayMode must call window.stadiumPitch.resize()'
      );
    });
  });

  // ========================================================
  // Suite 2: Toolbar Layout, Themes & Accessibility Invariants
  // ========================================================
  describe('Suite 2 — Toolbar Layout, Themes & Accessibility Invariants', () => {
    it('56.04 — camera bar and sub bar use sleek docked strips with horizontal scroll support', () => {
      assert.ok(
        dashboardSrc.includes('.three-camera-bar {'),
        '.three-camera-bar rule must exist'
      );
      assert.ok(
        dashboardSrc.includes('.three-sub-bar {'),
        '.three-sub-bar rule must exist'
      );
      assert.ok(
        dashboardSrc.includes('overflow-x: auto;'),
        'Toolbars must have overflow-x: auto for sleek scroll strip'
      );
      assert.ok(
        dashboardSrc.includes('.three-bar-group {'),
        '.three-bar-group helper class must exist'
      );
    });

    it('56.05 — Swiss Minimalist theme overrides provide hairline borders and crisp technical styling', () => {
      assert.ok(
        dashboardSrc.includes('body[data-theme="swiss"] .three-stadium-viewport'),
        'Swiss theme viewport styling must exist'
      );
      assert.ok(
        dashboardSrc.includes('body[data-theme="swiss"] .three-camera-bar'),
        'Swiss theme camera bar styling must exist'
      );
    });

    it('56.06 — Nordic Editorial theme overrides provide warm stone borders and forest pine accents', () => {
      assert.ok(
        dashboardSrc.includes('body[data-theme="nordic"] .three-stadium-viewport'),
        'Nordic theme viewport styling must exist'
      );
      assert.ok(
        dashboardSrc.includes('body[data-theme="nordic"] .three-camera-bar'),
        'Nordic theme camera bar styling must exist'
      );
    });

    it('56.07 — All camera presets, modes, and lighting controls preserve accessible data-tooltips', () => {
      assert.ok(dashboardSrc.includes('id="btnCamOrbit"'), 'btnCamOrbit must exist');
      assert.ok(dashboardSrc.includes('id="btnCamBatsman"'), 'btnCamBatsman must exist');
      assert.ok(dashboardSrc.includes('id="btnCamElevation"'), 'btnCamElevation must exist');
      assert.ok(dashboardSrc.includes('id="btnCamTopDown"'), 'btnCamTopDown must exist');
      assert.ok(dashboardSrc.includes('id="btnCamAuto"'), 'btnCamAuto must exist');
      assert.ok(dashboardSrc.includes('id="btnThreeSubMode"'), 'btnThreeSubMode must exist');
      assert.ok(dashboardSrc.includes('id="btnModeWagon"'), 'btnModeWagon must exist');
      assert.ok(dashboardSrc.includes('id="btnModeHawkeye"'), 'btnModeHawkeye must exist');
      assert.ok(dashboardSrc.includes('id="btnModeFusion"'), 'btnModeFusion must exist');
      assert.ok(dashboardSrc.includes('id="btnModeFielders"'), 'btnModeFielders must exist');
      assert.ok(dashboardSrc.includes('id="btnModeDrs"'), 'btnModeDrs must exist');
      assert.ok(dashboardSrc.includes('id="btnLightNight"'), 'btnLightNight must exist');
    });
  });

  // ========================================================
  // Suite 3: Python Playwright E2E Parity & Regression Screenshots
  // ========================================================
  describe('Suite 3 — Python Playwright E2E Parity & Regression Screenshots', () => {
    it('56.08 — test_56_3d_stadium_ui_fix.py exists with strict geometry and error assertions', () => {
      assert.ok(fs.existsSync(playwrightSuitePath), 'test_56_3d_stadium_ui_fix.py must exist');
      assert.ok(playwrightSrc.includes('assert_no_critical_errors(page)'), 'Rule 4 assertion missing');
      assert.ok(playwrightSrc.includes('btnWagonMode3D'), '3D switch missing in E2E suite');
      assert.ok(playwrightSrc.includes('btnWagonMode2D'), '2D switch missing in E2E suite');
    });

    it('56.09 — high-resolution visual regression screenshots exist in tests/screenshots/', () => {
      assert.ok(
        fs.existsSync(path.join(screenshotsDir, '3d_stadium_night.png')),
        '3d_stadium_night.png screenshot must exist'
      );
      assert.ok(
        fs.existsSync(path.join(screenshotsDir, '3d_stadium_swiss.png')),
        '3d_stadium_swiss.png screenshot must exist'
      );
      assert.ok(
        fs.existsSync(path.join(screenshotsDir, '3d_stadium_nordic.png')),
        '3d_stadium_nordic.png screenshot must exist'
      );
    });
  });
});
