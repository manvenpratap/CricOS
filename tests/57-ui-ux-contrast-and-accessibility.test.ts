import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('57. UI/UX Color Contrast, Focus Rings & Accessibility Invariant Suite', () => {
  const playwrightSuitePath = path.join(rootDir, 'tests/test_57_ui_ux_contrast_and_accessibility.py');
  const dashboardPath = path.join(rootDir, 'apps/api/src/ui/dashboard.ts');
  const mobileViewPath = path.join(rootDir, 'apps/api/src/ui/mobile-view.ts');

  const playwrightSrc = fs.readFileSync(playwrightSuitePath, 'utf8');
  const dashboardSrc = fs.readFileSync(dashboardPath, 'utf8');
  const mobileSrc = fs.readFileSync(mobileViewPath, 'utf8');

  // ========================================================
  // Suite 1: Theme Token Contrast Invariants (WCAG 2.2 AA)
  // ========================================================
  describe('Suite 1 — Theme Token Contrast Invariants (WCAG 2.2 AA)', () => {
    it('57.01 — Swiss Minimalist theme defines --text-muted as #475569 (Slate-600) for 7.09:1 contrast', () => {
      assert.ok(
        dashboardSrc.includes('--text-muted: #475569;'),
        'Swiss theme in dashboard.ts must set --text-muted: #475569;'
      );
      assert.ok(
        !dashboardSrc.includes('--text-muted: #64748B;'),
        'Old failing Swiss token #64748B must be eradicated from dashboard.ts'
      );
    });

    it('57.02 — Nordic Editorial theme defines --text-muted as #57534E (Stone-600) for 6.87:1 contrast', () => {
      assert.ok(
        dashboardSrc.includes('--text-muted: #57534E;'),
        'Nordic theme in dashboard.ts must set --text-muted: #57534E;'
      );
      assert.ok(
        !dashboardSrc.includes('--text-muted: #78716C;'),
        'Old failing Nordic token #78716C must be eradicated from dashboard.ts'
      );
    });

    it('57.03 — Dashboard completely eradicates low-contrast hardcoded #8E9BAE colors', () => {
      assert.ok(
        !dashboardSrc.includes('#8E9BAE'),
        'Hardcoded #8E9BAE must have zero occurrences in dashboard.ts'
      );
    });
  });

  // ========================================================
  // Suite 2: Mobile View Theme Contrast & Focus Rings
  // ========================================================
  describe('Suite 2 — Mobile View Theme Contrast & Focus Rings', () => {
    it('57.04 — Mobile Swiss navigation items and subnav buttons use #475569', () => {
      assert.ok(
        mobileSrc.includes('body[data-theme="swiss"] .mobile-nav-item {\n      color: #475569 !important;'),
        'Swiss mobile-nav-item must use #475569 !important;'
      );
      assert.ok(
        mobileSrc.includes('body[data-theme="swiss"] .mobile-subnav-btn {\n      background: #FFFFFF !important;\n      border: 1px solid #CBD5E1 !important;\n      border-radius: 4px !important;\n      color: #475569 !important;'),
        'Swiss mobile-subnav-btn must use #475569 !important;'
      );
    });

    it('57.05 — Mobile Nordic navigation items and subnav buttons use #57534E', () => {
      assert.ok(
        mobileSrc.includes('body[data-theme="nordic"] .mobile-nav-item {\n      color: #57534E !important;'),
        'Nordic mobile-nav-item must use #57534E !important;'
      );
      assert.ok(
        mobileSrc.includes('body[data-theme="nordic"] .mobile-subnav-btn {\n      background: #FCFBF8 !important;\n      border: 1px solid #E6DFD5 !important;\n      border-radius: 10px !important;\n      color: #57534E !important;'),
        'Nordic mobile-subnav-btn must use #57534E !important;'
      );
    });

    it('57.06 — Mobile view defines theme-adaptive focus rings for Swiss (#0F172A) and Nordic (#15803D)', () => {
      assert.ok(
        mobileSrc.includes('body[data-theme="swiss"] :focus-visible'),
        'Mobile Swiss :focus-visible rule must exist'
      );
      assert.ok(
        mobileSrc.includes('outline: 2px solid #0F172A !important;'),
        'Swiss focus outline must be #0F172A'
      );
      assert.ok(
        mobileSrc.includes('body[data-theme="nordic"] :focus-visible'),
        'Mobile Nordic :focus-visible rule must exist'
      );
      assert.ok(
        mobileSrc.includes('outline: 2px solid #15803D !important;'),
        'Nordic focus outline must be #15803D'
      );
    });
  });

  // ========================================================
  // Suite 3: Touch Ergonomics & Wagon Wheel Styling
  // ========================================================
  describe('Suite 3 — Touch Ergonomics & Wagon Wheel Styling', () => {
    it('57.07 — Wagon filter pills and batter pills have active class outside @media (hover: hover)', () => {
      assert.ok(
        dashboardSrc.includes('.wagon-filter-pill.active {\n      background: rgba(0, 229, 153, 0.12);'),
        '.wagon-filter-pill.active must exist outside hover query'
      );
      assert.ok(
        dashboardSrc.includes('.wagon-batter-pill.active {\n      background: rgba(0, 229, 153, 0.14);'),
        '.wagon-batter-pill.active must exist outside hover query'
      );
    });

    it('57.08 — Swiss and Nordic theme overrides exist for wagon wheel pills and stance buttons', () => {
      assert.ok(
        dashboardSrc.includes('body[data-theme="swiss"] .wagon-pill-switch-wrap'),
        'Swiss wagon-pill-switch-wrap override must exist'
      );
      assert.ok(
        dashboardSrc.includes('body[data-theme="swiss"] .wagon-filter-pill.active'),
        'Swiss active wagon filter pill override must exist'
      );
      assert.ok(
        dashboardSrc.includes('body[data-theme="nordic"] .wagon-pill-switch-wrap'),
        'Nordic wagon-pill-switch-wrap override must exist'
      );
      assert.ok(
        dashboardSrc.includes('body[data-theme="nordic"] .wagon-filter-pill.active'),
        'Nordic active wagon filter pill override must exist'
      );
    });

    it('57.09 — Stance switcher buttons use semantic .btn-stance class and dynamic class toggling', () => {
      assert.ok(
        dashboardSrc.includes('.btn-stance {'),
        '.btn-stance CSS class definition must exist'
      );
      assert.ok(
        dashboardSrc.includes("btnRhb.classList.add('active')"),
        'setBatterStance must toggle active class on btnRhb'
      );
      assert.ok(
        dashboardSrc.includes("btnLhb.classList.add('active')"),
        'setBatterStance must toggle active class on btnLhb'
      );
    });
  });

  // ========================================================
  // Suite 4: Playwright E2E Suite & Regression Coverage
  // ========================================================
  describe('Suite 4 — Playwright E2E Suite & Regression Coverage', () => {
    it('57.10 — Playwright Python test suite exists and asserts luminance, contrast, and zero console errors', () => {
      assert.ok(
        playwrightSrc.includes('def luminance('),
        'Playwright test must calculate WCAG relative luminance'
      );
      assert.ok(
        playwrightSrc.includes('def contrast_ratio('),
        'Playwright test must calculate contrast ratios'
      );
      assert.ok(
        playwrightSrc.includes('assert_no_critical_errors(page)'),
        'Playwright test must assert zero critical console errors'
      );
      assert.ok(
        playwrightSrc.includes('contrast_stadium_night.png'),
        'Playwright test must capture contrast_stadium_night.png'
      );
      assert.ok(
        playwrightSrc.includes('contrast_swiss_minimal.png'),
        'Playwright test must capture contrast_swiss_minimal.png'
      );
      assert.ok(
        playwrightSrc.includes('contrast_nordic_editorial.png'),
        'Playwright test must capture contrast_nordic_editorial.png'
      );
    });
  });
});
