import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('52. Strike Swap Scorer-Only Persona Gating & Tactile CSS System', () => {
  const mobileViewPath = path.join(rootDir, 'apps/api/src/ui/mobile-view.ts');
  const dashboardPath = path.join(rootDir, 'apps/api/src/ui/dashboard.ts');

  const mobileSrc = fs.readFileSync(mobileViewPath, 'utf8');
  const dashboardSrc = fs.readFileSync(dashboardPath, 'utf8');

  // ========================================================
  // Suite 1: Mobile Strike Swap Scorer Gating
  // ========================================================
  describe('Suite 1 — Mobile Strike Swap Persona Gating', () => {
    it('52.01 — Mobile Swap button is strictly gated on SCORER persona in render()', () => {
      assert.ok(
        mobileSrc.includes("if (this.profile.persona === 'SCORER')"),
        'Must conditionally render Swap button only when profile persona is SCORER'
      );
      assert.ok(
        mobileSrc.includes('id="btnMobileSwapStrike"'),
        'Must feature #btnMobileSwapStrike element'
      );
    });

    it('52.02 — Mobile rotateStrike handler enforces SCORER role check with toast guard', () => {
      assert.ok(
        mobileSrc.includes("if (this.profile.persona !== 'SCORER')"),
        'rotateStrike must verify SCORER persona'
      );
      assert.ok(
        mobileSrc.includes("this.showToast('🔒 Only official Scorers can swap strike.', 'warning')"),
        'rotateStrike must trigger security toast warning on unauthorized execution'
      );
    });
  });

  // ========================================================
  // Suite 2: Web Dashboard Strike Swap Scorer Gating
  // ========================================================
  describe('Suite 2 — Web Dashboard Strike Swap Persona Gating', () => {
    it('52.03 — Dashboard #btnStudioSwapStrike is hidden by default in initial markup', () => {
      assert.ok(
        dashboardSrc.includes('id="btnStudioSwapStrike" style="display: none;"'),
        'Swap button must be hidden by default in HTML to prevent FOUC / unauthorized visibility'
      );
    });

    it('52.04 — applyRolePermissions only displays Swap button for SCORER persona', () => {
      assert.ok(
        dashboardSrc.includes("studioSwapBtn.style.display = (role === 'SCORER') ? 'inline-flex' : 'none';"),
        'applyRolePermissions must only set inline-flex display for SCORER'
      );
    });

    it('52.05 — Dashboard swapStudioStrike function enforces SCORER role check with toast guard', () => {
      assert.ok(
        dashboardSrc.includes("if (typeof currentUser !== 'undefined' && currentUser.persona !== 'SCORER')"),
        'swapStudioStrike must verify SCORER persona'
      );
      assert.ok(
        dashboardSrc.includes("showToast('🔒 Only official Scorers can swap strike.')"),
        'swapStudioStrike must trigger security toast warning on unauthorized execution'
      );
    });
  });

  // ========================================================
  // Suite 3: Tactile CSS Quality & Styling Invariants
  // ========================================================
  describe('Suite 3 — Strike Swap CSS Architecture & Tactile Feedback', () => {
    it('52.06 — Mobile stylesheet defines .btn-swap-strike with turf-emerald theme and 6px radius', () => {
      assert.ok(mobileSrc.includes('.btn-swap-strike {'), 'Mobile CSS must define .btn-swap-strike');
      assert.ok(mobileSrc.includes('display: inline-flex;'), 'Must use inline-flex for icon & text alignment');
      assert.ok(mobileSrc.includes('color: var(--turf-emerald);'), 'Must use turf-emerald color token');
      assert.ok(mobileSrc.includes('border-radius: 6px;'), 'Must use 6px rounded corners');
    });

    it('52.07 — Dashboard stylesheet defines .btn-swap-strike with hover and active states', () => {
      assert.ok(dashboardSrc.includes('.btn-swap-strike {'), 'Dashboard CSS must define .btn-swap-strike');
      assert.ok(dashboardSrc.includes('.btn-swap-strike:hover {'), 'Must define hover state');
      assert.ok(dashboardSrc.includes('.btn-swap-strike:active {'), 'Must define active press state');
    });

    it('52.08 — Zero transition: all strictly enforced on Swap button styles (Emil Kowalski invariant)', () => {
      assert.ok(!mobileSrc.includes('.btn-swap-strike { transition: all'), 'Mobile must not use transition: all');
      assert.ok(!dashboardSrc.includes('.btn-swap-strike { transition: all'), 'Dashboard must not use transition: all');
      assert.ok(
        mobileSrc.includes('transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease, transform 0.1s ease;'),
        'Mobile must use explicit transition properties'
      );
      assert.ok(
        dashboardSrc.includes('transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease, transform 0.1s ease;'),
        'Dashboard must use explicit transition properties'
      );
    });

    it('52.09 — Swap buttons on both Mobile and Dashboard feature Rule 5 accessible data-tooltip', () => {
      assert.ok(
        mobileSrc.includes('id="btnMobileSwapStrike" onclick="window.cricosMobileApp.rotateStrike()" data-tooltip="Rotate strike manually (Scorer only)"'),
        'Mobile button must have descriptive data-tooltip'
      );
      assert.ok(
        dashboardSrc.includes('id="btnStudioSwapStrike" style="display: none;" onclick="swapStudioStrike()" data-tooltip="Rotate strike manually (Scorer only)"'),
        'Dashboard button must have descriptive data-tooltip'
      );
    });
  });
});
