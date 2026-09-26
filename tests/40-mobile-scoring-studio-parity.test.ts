import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getMobileAppHtml } from '../apps/api/dist/ui/mobile-view.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('40. Mobile Scoring Studio & Precision Wagon Wheel Parity', () => {
  const mobileHtml = getMobileAppHtml();
  const distMobilePath = path.join(rootDir, 'dist', 'mobile.html');
  const distMobileHtml = fs.existsSync(distMobilePath) ? fs.readFileSync(distMobilePath, 'utf8') : '';

  describe('1. Tactical Scoring Pad & Controls', () => {
    it('renders 4-column studio keypad grid with tactical labels and distinct glows', () => {
      assert.ok(mobileHtml.includes('mobile-studio-pad-grid'), 'Must include mobile studio pad grid');
      assert.ok(mobileHtml.includes('boundary-four'), 'Must include boundary-four pad button');
      assert.ok(mobileHtml.includes('maximum-six'), 'Must include maximum-six pad button');
      assert.ok(mobileHtml.includes('wicket-out'), 'Must include wicket-out pad button');
      assert.ok(mobileHtml.includes('undo-btn'), 'Must include undo pad button');
      assert.ok(mobileHtml.includes('mobile-studio-sublabel'), 'Must include sublabels');
    });

    it('provides quick and compound extras controls with free hit indication', () => {
      assert.ok(mobileHtml.includes('+1 Wd'), 'Must include +1 Wide');
      assert.ok(mobileHtml.includes('+1 Nb (Free Hit)'), 'Must include +1 No Ball Free Hit');
      assert.ok(mobileHtml.includes('+1 Lb'), 'Must include +1 Leg Bye');
      assert.ok(mobileHtml.includes('+1 Bye'), 'Must include +1 Bye');
      assert.ok(mobileHtml.includes('+5 Wd (4b)'), 'Must include +5 Wd compound extra');
      assert.ok(mobileHtml.includes('+4 Nb (5r)'), 'Must include +4 Nb compound extra');
      assert.ok(mobileHtml.includes('+6 Nb (7r)'), 'Must include +6 Nb compound extra');
      assert.ok(mobileHtml.includes('+5 Penalty'), 'Must include +5 Penalty compound extra');
    });

    it('implements 2-second Hold-to-Reset button with animated progress overlay', () => {
      assert.ok(mobileHtml.includes('btnMobileStudioReset'), 'Must include mobile studio reset button');
      assert.ok(mobileHtml.includes('hold-progress-overlay'), 'Must include hold progress overlay element');
      assert.ok(mobileHtml.includes('↺ Hold to Reset'), 'Must include hold to reset label');
      assert.ok(mobileHtml.includes('bindHoldToReset'), 'Must bind hold-to-reset touch & mouse listeners');
    });
  });

  describe('2. Active Batters & Live Telemetry Parity', () => {
    it('renders striker card with swap strike control, stance badge, and strike rate', () => {
      assert.ok(mobileHtml.includes('STRIKER ⚡'), 'Must include striker header badge');
      assert.ok(mobileHtml.includes('rotateStrike()'), 'Must include strike rotation handler');
      assert.ok(mobileHtml.includes('Swap'), 'Must include swap strike button');
      assert.ok(mobileHtml.includes('NON-STRIKER'), 'Must include non-striker card');
    });

    it('renders live partnership progress track and bowler figures with economy rate', () => {
      assert.ok(mobileHtml.includes('CURRENT PARTNERSHIP'), 'Must include partnership indicator');
      assert.ok(mobileHtml.includes('Econ:'), 'Must calculate bowler economy rate');
    });

    it('provides pulsing Free Hit In-Play banner during no ball situations', () => {
      assert.ok(mobileHtml.includes('FREE HIT IN PLAY'), 'Must include Free Hit banner markup');
    });
  });

  describe('3. Precision 8-Zone Wagon Wheel Stadium Visualizer', () => {
    it('renders full SVG cricket stadium with 8 sector wedges and mower radial stripes', () => {
      assert.ok(mobileHtml.includes('8-Zone Precision Wagon Wheel'), 'Must include wagon wheel header');
      assert.ok(mobileHtml.includes('THIRD_MAN'), 'Must include Third Man wedge');
      assert.ok(mobileHtml.includes('FINE_LEG'), 'Must include Fine Leg wedge');
      assert.ok(mobileHtml.includes('POINT'), 'Must include Point wedge');
      assert.ok(mobileHtml.includes('SQUARE_LEG'), 'Must include Square Leg wedge');
      assert.ok(mobileHtml.includes('EXTRA_COVER'), 'Must include Extra Cover wedge');
      assert.ok(mobileHtml.includes('MID_WICKET'), 'Must include Mid Wicket wedge');
      assert.ok(mobileHtml.includes('LONG_OFF'), 'Must include Long Off wedge');
      assert.ok(mobileHtml.includes('LONG_ON'), 'Must include Long On wedge');
      assert.ok(mobileHtml.includes('wagon-sector-wedge'), 'Must include interactive wedge class');
    });

    it('provides stance switching (RHB/LHB) with dynamic sector angle mirroring', () => {
      assert.ok(mobileHtml.includes('setBatterStance'), 'Must include setBatterStance method');
      assert.ok(mobileHtml.includes('RHB'), 'Must include RHB stance option');
      assert.ok(mobileHtml.includes('LHB'), 'Must include LHB stance option');
      assert.ok(mobileHtml.includes('mobileWagonSelectedZone'), 'Must include dynamic selected zone badge');
    });

    it('provides batter filter pills and shot filter pills', () => {
      assert.ok(mobileHtml.includes('filterWagonBatter'), 'Must include batter filter method');
      assert.ok(mobileHtml.includes('filterWagonShots'), 'Must include shot filter method');
      assert.ok(mobileHtml.includes('4s & 6s'), 'Must include boundaries filter');
      assert.ok(mobileHtml.includes('Singles'), 'Must include singles filter');
      assert.ok(mobileHtml.includes('Dots'), 'Must include dots filter');
    });

    it('dynamically computes and renders shot trajectory rays with boundary circles', () => {
      assert.ok(mobileHtml.includes('renderMobileWagonRays'), 'Must include dynamic shot rays generator');
      assert.ok(mobileHtml.includes('mobileWagonRays'), 'Must render shot rays container in SVG');
    });

    it('renders off-side vs on-side distribution telemetry bar', () => {
      assert.ok(mobileHtml.includes('Off-Side:'), 'Must include off-side distribution metric');
      assert.ok(mobileHtml.includes('On-Side:'), 'Must include on-side distribution metric');
    });
  });

  describe('4. Accessibility, Motion & Script Hygiene', () => {
    it('verifies all interactive scoring buttons include data-tooltip per Rule 5', () => {
      const tooltipMatches = mobileHtml.match(/data-tooltip="[^"]+"/g) || [];
      assert.ok(tooltipMatches.length >= 40, `Expected >= 40 accessible data-tooltips, found ${tooltipMatches.length}`);
      assert.ok(mobileHtml.includes('data-tooltip="Wide (+1 run, ball re-bowled)"'));
      assert.ok(mobileHtml.includes('data-tooltip="Hold 2s to reset match score for new innings"'));
    });

    it('strictly forbids transition: all per Emil Kowalski animation invariants', () => {
      assert.strictEqual(
        mobileHtml.includes('transition: all'),
        false,
        'mobileHtml must not contain transition: all'
      );
      assert.strictEqual(
        distMobileHtml.includes('transition: all'),
        false,
        'dist/mobile.html must not contain transition: all'
      );
    });

    it('compiles embedded mobile client script cleanly with zero syntax errors', () => {
      const scriptMatch = mobileHtml.match(/<script type="module">([\s\S]*?)<\/script>/);
      assert.ok(scriptMatch, 'Mobile HTML must contain a module script');
      assert.doesNotThrow(() => {
        new Function(scriptMatch[1]);
      }, 'Embedded mobile client script must parse with zero syntax errors');
    });
  });
});
