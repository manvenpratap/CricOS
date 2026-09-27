import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('54. Playwright E2E Theme Verification Suite', () => {
  const playwrightSuitePath = path.join(rootDir, 'tests/test_54_playwright_theme_verification.py');
  const helpersPath = path.join(rootDir, 'tests/helpers.py');
  const screenshotsDir = path.join(rootDir, 'tests/screenshots');
  const galleryPath = path.join(screenshotsDir, 'index.html');
  const dashboardPath = path.join(rootDir, 'apps/api/src/ui/dashboard.ts');
  const mobileViewPath = path.join(rootDir, 'apps/api/src/ui/mobile-view.ts');

  const playwrightSrc = fs.readFileSync(playwrightSuitePath, 'utf8');
  const helpersSrc = fs.readFileSync(helpersPath, 'utf8');
  const dashboardSrc = fs.readFileSync(dashboardPath, 'utf8');
  const mobileSrc = fs.readFileSync(mobileViewPath, 'utf8');

  // ========================================================
  // Suite 1: Playwright Test Specifications & Architecture
  // ========================================================
  describe('Suite 1 — Playwright Test Architecture & Helpers', () => {
    it('54.01 — Playwright test suite exists and defines desktop and mobile test cases', () => {
      assert.ok(fs.existsSync(playwrightSuitePath), 'test_54_playwright_theme_verification.py must exist');
      assert.ok(
        playwrightSrc.includes('async def test_desktop_themes_working_and_distinct():'),
        'Must define test_desktop_themes_working_and_distinct coroutine'
      );
      assert.ok(
        playwrightSrc.includes('async def test_mobile_themes_working_and_distinct():'),
        'Must define test_mobile_themes_working_and_distinct coroutine'
      );
    });

    it('54.02 — verifies all 3 themes across desktop switcher click and keyboard shortcuts', () => {
      assert.ok(
        playwrightSrc.includes("window.setDesignTheme('swiss', false)"),
        'Must verify Swiss Minimal initial activation'
      );
      assert.ok(
        playwrightSrc.includes('await page.click("#btnDesignThemeSwitcher")'),
        'Must verify theme switching via topbar switcher click'
      );
      assert.ok(
        playwrightSrc.includes('await page.keyboard.press("Alt+t")'),
        'Must verify theme switching via keyboard shortcut Alt+T'
      );
    });

    it('54.03 — verifies mathematical and computed distinctness across all 3 themes', () => {
      assert.ok(
        playwrightSrc.includes('swiss_data["bodyBg"] != nordic_data["bodyBg"]'),
        'Must assert Swiss and Nordic desktop body backgrounds differ'
      );
      assert.ok(
        playwrightSrc.includes('swiss_data["bodyBg"] != stadium_data["bodyBg"]'),
        'Must assert Swiss and Stadium desktop body backgrounds differ'
      );
      assert.ok(
        playwrightSrc.includes('mobile_swiss["bodyBg"] != mobile_nordic["bodyBg"]'),
        'Must assert Swiss and Nordic mobile body backgrounds differ'
      );
      assert.ok(
        playwrightSrc.includes('mobile_swiss["bodyBg"] != mobile_stadium["bodyBg"]'),
        'Must assert Swiss and Stadium mobile body backgrounds differ'
      );
    });

    it('54.04 — verifies zero critical console errors (Rule 4 invariant)', () => {
      assert.ok(
        playwrightSrc.includes('assert_no_critical_errors(page)'),
        'Must assert zero critical errors across both test runs'
      );
    });

    it('54.05 — helpers.py provides async screenshot saving with offline gallery cataloging', () => {
      assert.ok(
        helpersSrc.includes('async def save_screenshot_async('),
        'Must export save_screenshot_async in helpers.py'
      );
      assert.ok(
        helpersSrc.includes('def catalog_screenshots('),
        'Must export catalog_screenshots for local offline HTML gallery generation'
      );
    });
  });

  // ========================================================
  // Suite 2: Visual Artifacts & Screenshot Persistence
  // ========================================================
  describe('Suite 2 — Local Visual Regression Artifacts & Gallery', () => {
    it('54.06 — all 3 desktop theme screenshots exist in tests/screenshots/', () => {
      const swissDesktop = path.join(screenshotsDir, 'desktop_theme_swiss.png');
      const nordicDesktop = path.join(screenshotsDir, 'desktop_theme_nordic.png');
      const stadiumDesktop = path.join(screenshotsDir, 'desktop_theme_stadium.png');

      assert.ok(fs.existsSync(swissDesktop), 'desktop_theme_swiss.png must exist');
      assert.ok(fs.existsSync(nordicDesktop), 'desktop_theme_nordic.png must exist');
      assert.ok(fs.existsSync(stadiumDesktop), 'desktop_theme_stadium.png must exist');

      assert.ok(fs.statSync(swissDesktop).size > 10000, 'desktop_theme_swiss.png must not be empty');
      assert.ok(fs.statSync(nordicDesktop).size > 10000, 'desktop_theme_nordic.png must not be empty');
      assert.ok(fs.statSync(stadiumDesktop).size > 10000, 'desktop_theme_stadium.png must not be empty');
    });

    it('54.07 — all 3 mobile theme screenshots exist in tests/screenshots/', () => {
      const swissMobile = path.join(screenshotsDir, 'mobile_theme_swiss.png');
      const nordicMobile = path.join(screenshotsDir, 'mobile_theme_nordic.png');
      const stadiumMobile = path.join(screenshotsDir, 'mobile_theme_stadium.png');

      assert.ok(fs.existsSync(swissMobile), 'mobile_theme_swiss.png must exist');
      assert.ok(fs.existsSync(nordicMobile), 'mobile_theme_nordic.png must exist');
      assert.ok(fs.existsSync(stadiumMobile), 'mobile_theme_stadium.png must exist');

      assert.ok(fs.statSync(swissMobile).size > 10000, 'mobile_theme_swiss.png must not be empty');
      assert.ok(fs.statSync(nordicMobile).size > 10000, 'mobile_theme_nordic.png must not be empty');
      assert.ok(fs.statSync(stadiumMobile).size > 10000, 'mobile_theme_stadium.png must not be empty');
    });

    it('54.08 — offline HTML visual gallery catalog indexes all theme screenshots', () => {
      assert.ok(fs.existsSync(galleryPath), 'tests/screenshots/index.html gallery must exist');
      const galleryHtml = fs.readFileSync(galleryPath, 'utf8');

      assert.ok(galleryHtml.includes('desktop_theme_swiss.png'), 'Gallery must index desktop_theme_swiss.png');
      assert.ok(galleryHtml.includes('desktop_theme_nordic.png'), 'Gallery must index desktop_theme_nordic.png');
      assert.ok(galleryHtml.includes('desktop_theme_stadium.png'), 'Gallery must index desktop_theme_stadium.png');
      assert.ok(galleryHtml.includes('mobile_theme_swiss.png'), 'Gallery must index mobile_theme_swiss.png');
      assert.ok(galleryHtml.includes('mobile_theme_nordic.png'), 'Gallery must index mobile_theme_nordic.png');
      assert.ok(galleryHtml.includes('mobile_theme_stadium.png'), 'Gallery must index mobile_theme_stadium.png');
    });
  });

  // ========================================================
  // Suite 3: Mobile Native Mode Theme Parity
  // ========================================================
  describe('Suite 3 — Mobile Native Mode Theme Parity', () => {
    it('54.09 — mobile-view.ts supports theme switching in native app & standalone edge-to-edge modes', () => {
      assert.ok(
        mobileSrc.includes('body.is-native-app[data-theme="swiss"]'),
        'Must style Swiss theme in native app mode'
      );
      assert.ok(
        mobileSrc.includes('body.is-native-app[data-theme="nordic"]'),
        'Must style Nordic theme in native app mode'
      );
      assert.ok(
        mobileSrc.includes('body.is-native-app[data-theme="stadium"]'),
        'Must style Stadium theme in native app mode'
      );
    });

    it('54.10 — header, bottom nav, and screen viewport dynamically adapt across all themes', () => {
      assert.ok(
        mobileSrc.includes('body[data-theme="swiss"] .mobile-header'),
        'Must style .mobile-header in Swiss theme'
      );
      assert.ok(
        mobileSrc.includes('body[data-theme="nordic"] .mobile-header'),
        'Must style .mobile-header in Nordic theme'
      );
      assert.ok(
        mobileSrc.includes('body.is-native-app[data-theme="swiss"] .screen-viewport'),
        'Must style .screen-viewport in Swiss native mode'
      );
      assert.ok(
        mobileSrc.includes('body.is-native-app[data-theme="nordic"] .screen-viewport'),
        'Must style .screen-viewport in Nordic native mode'
      );
    });
  });
});
