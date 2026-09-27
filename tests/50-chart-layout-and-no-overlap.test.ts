import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('50. Chart Layout, Anti-Collision & Zero-Overlap System (Worm, Bars, Wagon)', () => {
  const mobileViewPath = path.join(rootDir, 'apps/api/src/ui/mobile-view.ts');
  const dashboardPath = path.join(rootDir, 'apps/api/src/ui/dashboard.ts');

  const mobileSrc = fs.readFileSync(mobileViewPath, 'utf8');
  const dashboardSrc = fs.readFileSync(dashboardPath, 'utf8');

  // Suite 1: Mobile Worm Chart Anti-Overlap & Layout Invariants
  describe('Suite 1 — Mobile Worm Chart Anti-Overlap Invariants', () => {
    it('50.01 — Phase labels (POWERPLAY, MIDDLE, DEATH) are anchored at bottom baseline away from target line', () => {
      assert.ok(
        mobileSrc.includes('yBottom - 6'),
        'Worm phase labels must be positioned at (yBottom - 6) to avoid top-area target collision'
      );
      assert.ok(mobileSrc.includes('>POWERPLAY</text>'), 'Must render POWERPLAY phase');
      assert.ok(mobileSrc.includes('>MIDDLE</text>'), 'Must render MIDDLE phase');
      assert.ok(mobileSrc.includes('>DEATH</text>'), 'Must render DEATH phase');
    });

    it('50.02 — TARGET 178 line has a high-contrast pill backdrop to prevent line clashing', () => {
      assert.ok(
        mobileSrc.includes('<rect x="0" y="0" width="56" height="11" rx="3" fill="rgba(4, 7, 13, 0.88)" stroke="#FFB800"'),
        'TARGET badge must have high-contrast pill backdrop'
      );
      assert.ok(
        mobileSrc.includes('TARGET \' + this.matchState.targetRuns'),
        'Must display TARGET text inside pill'
      );
    });

    it('50.03 — Wicket markers center "W" text inside the circle with zero floating text', () => {
      assert.ok(
        mobileSrc.includes('<circle cx="\' + m1.x + \'" cy="\' + m1.y + \'" r="3.8" fill="#FF3366"'),
        'DEL wicket marker circle'
      );
      assert.ok(
        mobileSrc.includes('<text x="\' + m1.x + \'" y="\' + (m1.y + 2) + \'" fill="#ffffff" font-size="4.8" font-weight="900" font-family="Chakra Petch, monospace" text-anchor="middle">W</text>'),
        'DEL wicket centered W text'
      );
      assert.ok(
        mobileSrc.includes('<circle cx="\' + m2.x + \'" cy="\' + m2.y + \'" r="4.6" fill="#FF3366"'),
        'MUM wicket marker circle'
      );
      assert.ok(
        mobileSrc.includes('<text x="\' + m2.x + \'" y="\' + (m2.y + 2.2) + \'" fill="#ffffff" font-size="5.5" font-weight="900" font-family="Chakra Petch, monospace" text-anchor="middle">W</text>'),
        'MUM wicket centered W text'
      );
    });

    it('50.04 — Over level tick labels apply directional text-anchor to avoid viewport edge clipping', () => {
      assert.ok(
        mobileSrc.includes("var anchor = ol === 0 ? 'start' : (ol === overLevels.length - 1 ? 'end' : 'middle');"),
        'Start and end tick labels must use start/end text-anchor to avoid clipping'
      );
    });

    it('50.05 — Analytics HUD metrics CSS enforces nowrap and ellipsis to prevent text spilling', () => {
      assert.ok(
        mobileSrc.includes('.analytics-hud-metric .label'),
        'Must style .analytics-hud-metric .label'
      );
      assert.ok(
        mobileSrc.includes('text-overflow: ellipsis;'),
        'Must use text-overflow: ellipsis'
      );
      assert.ok(
        mobileSrc.includes('white-space: nowrap;'),
        'Must use white-space: nowrap'
      );
    });
  });

  // Suite 2: Mobile Manhattan Over Velocity Headroom & Bar Layout
  describe('Suite 2 — Mobile Manhattan Bars Headroom & Layout Invariants', () => {
    it('50.06 — Manhattan chart configures maxRuns >= 24 with adequate top headroom', () => {
      assert.ok(mobileSrc.includes('var maxRuns = 24;'), 'maxRuns must be 24 for headroom');
      assert.ok(mobileSrc.includes('viewBox="0 0 360 170"'), 'SVG viewBox must be expanded to 360x170');
      assert.ok(mobileSrc.includes('var yTop = 26;'), 'yTop must provide >= 26px padding');
      assert.ok(mobileSrc.includes('var yBottom = 135;'), 'yBottom must be 135px');
    });

    it('50.07 — Single-mode bars stack wicket badge at barY - 13 and run count at barY - 3', () => {
      assert.ok(
        mobileSrc.includes('y="\' + (barY - 3) + \'"'),
        'Run count must be positioned at barY - 3'
      );
      assert.ok(
        mobileSrc.includes('transform="translate(\' + (barX + barW / 2) + \', \' + (barY - 13) + \')"'),
        'Wicket badge group must be stacked at barY - 13'
      );
    });

    it('50.08 — Dual mode renders separate, non-overlapping labels for Delhi and Mumbai', () => {
      assert.ok(
        mobileSrc.includes('y="\' + (bar1Y - 3) + \'" fill="#00E599"'),
        'DEL bar1 run count rendered above bar 1'
      );
      assert.ok(
        mobileSrc.includes('y="\' + (bar2Y - 3) + \'" fill="\' + (isSelected ? \'#FFB800\' : \'#00D2FF\') + \'"'),
        'MUM bar2 run count rendered above bar 2'
      );
    });
  });

  // Suite 3: Mobile Wagon Wheel Anti-Collision & Backdrops
  describe('Suite 3 — Mobile Wagon Wheel Anti-Collision Invariants', () => {
    it('50.09 — All 8 sector labels in dynamic analytics wagon have pill backdrops', () => {
      assert.ok(
        mobileSrc.includes('rect x="-\' + (labelW / 2).toFixed(1) + \'" y="-6" width="\' + labelW.toFixed(1) + \'" height="12" rx="3" fill="rgba(3, 12, 8, 0.88)"'),
        'Dynamic analytics wagon sector labels must have pill backdrops'
      );
    });

    it('50.10 — OFF/ON side labels are positioned in inner pitch corridor (126, 155) and (194, 155)', () => {
      assert.ok(
        mobileSrc.includes('transform="translate(126, 155)"'),
        'Left side direction label placed at (126, 155)'
      );
      assert.ok(
        mobileSrc.includes('transform="translate(194, 155)"'),
        'Right side direction label placed at (194, 155)'
      );
    });

    it('50.11 — Scoring studio wagon wheel OFF/ON direction labels have pill backdrops', () => {
      assert.ok(
        mobileSrc.includes('transform="translate(42, 174)"'),
        'Scoring studio wagon left pill at (42, 174)'
      );
      assert.ok(
        mobileSrc.includes('transform="translate(318, 174)"'),
        'Scoring studio wagon right pill at (318, 174)'
      );
      assert.ok(
        mobileSrc.includes('rect x="-22" y="-7" width="44" height="14" rx="4" fill="rgba(4,7,13,0.88)"'),
        'Scoring studio wagon direction pills must have background rect'
      );
    });

    it('50.12 — Wagon picker sheet has pill backdrops for OFF/ON direction labels', () => {
      assert.ok(
        mobileSrc.includes('translate(42, 174)'),
        'Picker sheet left pill'
      );
      assert.ok(
        mobileSrc.includes('translate(318, 174)'),
        'Picker sheet right pill'
      );
    });
  });

  // Suite 4: Web Console Dashboard Worm, Manhattan & Wagon Layouts
  describe('Suite 4 — Web Console Dashboard Worm, Manhattan & Wagon Layouts', () => {
    it('50.13 — Field zone buttons maintain translateX(-50%) on hover and active states', () => {
      assert.ok(
        dashboardSrc.includes('.field-zone-btn[data-pos*="top"]:hover,'),
        'Must preserve translateX(-50%) on top zone hover'
      );
      assert.ok(
        dashboardSrc.includes('.field-zone-btn[data-pos*="bottom"]:hover'),
        'Must preserve translateX(-50%) on bottom zone hover'
      );
      assert.ok(
        dashboardSrc.includes('.field-zone-btn[data-pos*="top"].active,'),
        'Must preserve translateX(-50%) on top zone active'
      );
      assert.ok(
        dashboardSrc.includes('transform: translateX(-50%) scale(1.08);'),
        'Must apply translateX(-50%) scale(1.08) on active top/bottom zone buttons'
      );
    });

    it('50.14 — Dashboard Worm chart has top header legend, bottom baseline phases, and target pill', () => {
      assert.ok(dashboardSrc.includes('const h = 230;'), 'Worm height must be 230');
      assert.ok(dashboardSrc.includes('const padT = 38;'), 'padT must be 38 for clean legend headroom');
      assert.ok(
        dashboardSrc.includes('translate(\' + (padL + 6) + \', 18)'),
        'Legend placed at y=18 above plot area'
      );
      assert.ok(
        dashboardSrc.includes('y="\' + (h - padB - 6) + \'" fill="rgba(255,255,255,0.22)" font-size="8" font-family="var(--font-mono)" font-weight="700" text-anchor="middle" letter-spacing="1">POWERPLAY</text>'),
        'Phase label POWERPLAY placed at bottom baseline (h - padB - 6)'
      );
      assert.ok(
        dashboardSrc.includes('TARGET 178</text>'),
        'Must render TARGET 178 pill label'
      );
      assert.ok(
        dashboardSrc.includes('>W</text>'),
        'Centered W text in wicket circles'
      );
    });

    it('50.15 — Dashboard Manhattan chart configures maxBar = 24 with horizontal grid and even-over labels', () => {
      assert.ok(dashboardSrc.includes('const maxBar = 24;'), 'maxBar must be 24');
      assert.ok(dashboardSrc.includes('for (let r = 6; r <= maxBar; r += 6)'), 'Grid lines every 6 runs');
      assert.ok(dashboardSrc.includes('const wy = y - 14 - k * 9;'), 'Stacked wickets with 9px vertical spacing');
      assert.ok(dashboardSrc.includes('if ((i + 1) % 2 === 0)'), 'Even over numbers to eliminate adjacent 1 & 2 clumping');
    });

    it('50.16 — Dashboard Wagon Wheel uses pill groups for OFF/ON side with dynamic stance repositioning', () => {
      assert.ok(dashboardSrc.includes('id="mcWagonOffGroup"'), 'Must have mcWagonOffGroup');
      assert.ok(dashboardSrc.includes('id="mcWagonLegGroup"'), 'Must have mcWagonLegGroup');
      assert.ok(
        dashboardSrc.includes('offGrp.setAttribute(\'transform\', \'translate(318, 174)\');'),
        'Reposition offGrp for LHB stance'
      );
      assert.ok(
        dashboardSrc.includes('legGrp.setAttribute(\'transform\', \'translate(42, 174)\');'),
        'Reposition legGrp for LHB stance'
      );
    });

    it('50.17 — Dashboard Wagon Wheel stat cards have text overflow protection', () => {
      assert.ok(
        dashboardSrc.includes('text-overflow: ellipsis;'),
        'Stat cards must contain text-overflow: ellipsis'
      );
    });
  });
});
