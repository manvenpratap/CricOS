import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('51. Scoring Pad Generic Extras & Dedicated Undo Last Ball System', () => {
  const mobileViewPath = path.join(rootDir, 'apps/api/src/ui/mobile-view.ts');
  const dashboardPath = path.join(rootDir, 'apps/api/src/ui/dashboard.ts');

  const mobileSrc = fs.readFileSync(mobileViewPath, 'utf8');
  const dashboardSrc = fs.readFileSync(dashboardPath, 'utf8');

  // ========================================================
  // Suite 1: Mobile Scoring Pad Generic Extras & Undo
  // ========================================================
  describe('Suite 1 — Mobile Scoring Pad Parity & Clean UI', () => {
    it('51.01 — Quick extras strip displays clean generic labels without +1 prefix', () => {
      assert.ok(mobileSrc.includes('>Wide</button>'), 'Mobile pad must feature generic Wide button');
      assert.ok(mobileSrc.includes('>No Ball</button>'), 'Mobile pad must feature generic No Ball button');
      assert.ok(mobileSrc.includes('>Leg Bye</button>'), 'Mobile pad must feature generic Leg Bye button');
      assert.ok(mobileSrc.includes('>Bye</button>'), 'Mobile pad must feature generic Bye button');

      // Ensure no preceding +1 in mobile pad extras buttons
      assert.ok(!mobileSrc.includes('>+1 Wd</button>'), 'Mobile pad must not use +1 Wd label');
      assert.ok(!mobileSrc.includes('>+1 Nb'), 'Mobile pad must not use +1 Nb label');
      assert.ok(!mobileSrc.includes('>+1 Lb</button>'), 'Mobile pad must not use +1 Lb label');
      assert.ok(!mobileSrc.includes('>+1 Bye</button>'), 'Mobile pad must not use +1 Bye label');
    });

    it('51.02 — Mobile extras buttons invoke openExtraPickerSheet to choose run options', () => {
      assert.ok(
        mobileSrc.includes('openExtraPickerSheet(this.dataset.extra)'),
        'Buttons must trigger openExtraPickerSheet on click'
      );
      assert.ok(mobileSrc.includes('data-extra="WIDE"'), 'Must specify WIDE dataset');
      assert.ok(mobileSrc.includes('data-extra="NO_BALL"'), 'Must specify NO_BALL dataset');
      assert.ok(mobileSrc.includes('data-extra="LEG_BYE"'), 'Must specify LEG_BYE dataset');
      assert.ok(mobileSrc.includes('data-extra="BYE"'), 'Must specify BYE dataset');
    });

    it('51.03 — Redundant compound extras are removed from the mobile scoring pad', () => {
      assert.ok(!mobileSrc.includes('+5 Wd (4b)'), 'Compound +5 Wd (4b) button must be removed');
      assert.ok(!mobileSrc.includes('+4 Nb (5r)'), 'Compound +4 Nb (5r) button must be removed');
      assert.ok(!mobileSrc.includes('+6 Nb (7r)'), 'Compound +6 Nb (7r) button must be removed');
      assert.ok(!mobileSrc.includes('id="btnMobileStudioReset"'), 'Hold to reset button must be removed from scoring pad markup');
      assert.ok(!mobileSrc.includes('↺ Hold to Reset'), 'Hold to reset label must be removed from mobile pad');
    });

    it('51.04 — Dedicated full-width Undo Last Ball button replaces hold-to-reset on mobile', () => {
      assert.ok(
        mobileSrc.includes('id="btnMobileStudioUndoBall"'),
        'Must have dedicated #btnMobileStudioUndoBall element'
      );
      assert.ok(
        mobileSrc.includes('Undo Last Ball'),
        'Must feature clear "Undo Last Ball" label'
      );
      assert.ok(
        mobileSrc.includes('window.cricosMobileApp.undoLastDelivery()'),
        'Must call undoLastDelivery handler'
      );
      assert.ok(
        mobileSrc.includes('data-tooltip="Undo last delivery (revert fat finger or scoring misunderstanding)"'),
        'Must have contextual data-tooltip explaining fat finger / mistake recovery'
      );
    });
  });

  // ========================================================
  // Suite 2: Web Dashboard Scoring Pad Generic Extras & Undo
  // ========================================================
  describe('Suite 2 — Web Dashboard Scoring Pad Parity & Clean UI', () => {
    it('51.05 — Dashboard scoring pad displays clean generic labels without +1 prefix', () => {
      assert.ok(dashboardSrc.includes('>Wide</button>'), 'Dashboard pad must feature generic Wide button');
      assert.ok(dashboardSrc.includes('>No Ball</button>'), 'Dashboard pad must feature generic No Ball button');
      assert.ok(dashboardSrc.includes('>Leg Bye</button>'), 'Dashboard pad must feature generic Leg Bye button');
      assert.ok(dashboardSrc.includes('>Bye</button>'), 'Dashboard pad must feature generic Bye button');

      // Ensure no preceding +1 in dashboard pad extras buttons
      assert.ok(!dashboardSrc.includes('>+1 Wd</button>'), 'Dashboard pad must not use +1 Wd label');
      assert.ok(!dashboardSrc.includes('>+1 Nb'), 'Dashboard pad must not use +1 Nb label');
      assert.ok(!dashboardSrc.includes('>+1 Lb</button>'), 'Dashboard pad must not use +1 Lb label');
      assert.ok(!dashboardSrc.includes('>+1 Bye</button>'), 'Dashboard pad must not use +1 Bye label');
    });

    it('51.06 — Dashboard extras buttons invoke openStudioExtraPicker with extra type', () => {
      assert.ok(dashboardSrc.includes("openStudioExtraPicker('WIDE')"), 'Must open wide picker');
      assert.ok(dashboardSrc.includes("openStudioExtraPicker('NO_BALL')"), 'Must open no ball picker');
      assert.ok(dashboardSrc.includes("openStudioExtraPicker('LEG_BYE')"), 'Must open leg bye picker');
      assert.ok(dashboardSrc.includes("openStudioExtraPicker('BYE')"), 'Must open bye picker');
    });

    it('51.07 — Redundant compound extras and hold-to-reset are removed from dashboard scoring pad', () => {
      assert.ok(!dashboardSrc.includes('+5 Wd (4b)'), 'Compound +5 Wd (4b) button must be removed from dashboard pad');
      assert.ok(!dashboardSrc.includes('+4 Nb (5 runs)'), 'Compound +4 Nb button must be removed from dashboard pad');
      assert.ok(!dashboardSrc.includes('+6 Nb (7 runs)'), 'Compound +6 Nb button must be removed from dashboard pad');
      assert.ok(!dashboardSrc.includes('id="btnStudioReset"'), 'Hold to reset button must be removed from dashboard scoring pad markup');
      assert.ok(!dashboardSrc.includes('↺ Hold to Reset'), 'Hold to reset label must be removed from dashboard pad');
    });

    it('51.08 — Dedicated full-width Undo Last Ball button is present on dashboard scoring pad', () => {
      assert.ok(
        dashboardSrc.includes('id="btnStudioUndoBall"'),
        'Must have dedicated #btnStudioUndoBall element'
      );
      assert.ok(
        dashboardSrc.includes('Undo Last Ball</button>'),
        'Must display "Undo Last Ball" label'
      );
      assert.ok(
        dashboardSrc.includes('data-tooltip="Undo last delivery (revert fat finger or scoring misunderstanding)"'),
        'Must have contextual data-tooltip on undo last ball button'
      );
    });
  });

  // ========================================================
  // Suite 3: Desktop Extra Runs Modal Dialog & Interaction Logic
  // ========================================================
  describe('Suite 3 — Studio Extra Runs Modal Dialog Architecture', () => {
    it('51.09 — modalExtraPicker modal backdrop and dialog exist with full accessibility attributes', () => {
      assert.ok(dashboardSrc.includes('id="modalExtraPicker"'), 'Must have modalExtraPicker backdrop element');
      assert.ok(dashboardSrc.includes('role="dialog"'), 'Must have ARIA dialog role');
      assert.ok(dashboardSrc.includes('aria-modal="true"'), 'Must have aria-modal attribute');
      assert.ok(dashboardSrc.includes('aria-labelledby="extraPickerTitle"'), 'Must reference extraPickerTitle');
      assert.ok(dashboardSrc.includes('onclick="closeStudioExtraPicker()"'), 'Must wire close buttons');
    });

    it('51.10 — STUDIO_EXTRA_OPTIONS defines comprehensive run permutations for all 4 extras', () => {
      assert.ok(dashboardSrc.includes('STUDIO_EXTRA_OPTIONS'), 'Must define STUDIO_EXTRA_OPTIONS');
      assert.ok(dashboardSrc.includes('Wide Only (0 byes)'), 'Must include wide only option');
      assert.ok(dashboardSrc.includes('+4 Boundary Byes'), 'Must include wide boundary byes option');
      assert.ok(dashboardSrc.includes('Dot Ball (0 off bat)'), 'Must include no ball dot option');
      assert.ok(dashboardSrc.includes('Four Off Bat ⚡'), 'Must include no ball four option');
      assert.ok(dashboardSrc.includes('Six Off Bat 🚀'), 'Must include no ball six option');
      assert.ok(dashboardSrc.includes('4 Leg Byes ⚡'), 'Must include boundary leg byes option');
      assert.ok(dashboardSrc.includes('4 Byes ⚡'), 'Must include boundary byes option');
    });

    it('51.11 — Studio extra picker functions are attached to window for script & inline handler access', () => {
      assert.ok(dashboardSrc.includes('window.openStudioExtraPicker = openStudioExtraPicker;'), 'Must export openStudioExtraPicker');
      assert.ok(dashboardSrc.includes('window.closeStudioExtraPicker = closeStudioExtraPicker;'), 'Must export closeStudioExtraPicker');
      assert.ok(dashboardSrc.includes('window.selectStudioExtraOption = selectStudioExtraOption;'), 'Must export selectStudioExtraOption');
      assert.ok(dashboardSrc.includes('window.undoLastDelivery = undoLastDelivery;'), 'Must export undoLastDelivery');
    });

    it('51.12 — Global Escape key listener automatically dismisses active modals including extra picker', () => {
      assert.ok(
        dashboardSrc.includes("document.querySelectorAll('.modal-backdrop.active').forEach"),
        'Escape key must remove active class on modals'
      );
    });
  });

  // ========================================================
  // Suite 4: Design Token & Accessibility Invariants
  // ========================================================
  describe('Suite 4 — Design Token & Accessibility Invariants (Rule 5)', () => {
    it('51.13 — Every interactive button on mobile scoring pad has data-tooltip contextual help', () => {
      const mobilePadRegex = /data-extra="[^"]*"[^>]*data-tooltip="[^"]*"/g;
      const matches = mobileSrc.match(mobilePadRegex);
      assert.ok(matches && matches.length >= 4, 'All 4 mobile extra buttons must have data-tooltip');
    });

    it('51.14 — Every interactive button on dashboard scoring pad has data-tooltip contextual help', () => {
      const dashPadRegex = /data-extra="[^"]*"[^>]*data-tooltip="[^"]*"/g;
      const matches = dashboardSrc.match(dashPadRegex);
      assert.ok(matches && matches.length >= 4, 'All 4 dashboard extra buttons must have data-tooltip');
    });

    it('51.15 — Zero transition: all in custom extra button styles', () => {
      assert.ok(!dashboardSrc.includes('studio-extra-opt-btn { transition: all'), 'Must not use transition: all');
      assert.ok(
        dashboardSrc.includes('transition: border-color 0.15s ease, background-color 0.15s ease;'),
        'Must use explicit transitions'
      );
    });
  });
});
