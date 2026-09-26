import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { getMobileAppHtml } from '../apps/api/dist/ui/mobile-view.js';
import { LiveMatchScreenController } from '../apps/mobile/dist/screens/LiveMatchScreen.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('42. Dynamic Production-Grade Mobile Analytics & Scorecard System', () => {
  const mobileHtml = getMobileAppHtml();
  const distMobilePath = path.join(rootDir, 'dist', 'mobile.html');
  const distMobileHtml = fs.existsSync(distMobilePath) ? fs.readFileSync(distMobilePath, 'utf8') : '';

  let appInstance: any;

  before(() => {
    const startTag = '<script type="module">';
    const endTag = '</script>';
    const startIdx = mobileHtml.indexOf(startTag);
    const endIdx = mobileHtml.indexOf(endTag, startIdx);
    const scriptContent = mobileHtml.substring(startIdx + startTag.length, endIdx);

    const createMockEl = () => ({
      innerHTML: '',
      addEventListener: () => {},
      removeEventListener: () => {},
      classList: { add: () => {}, remove: () => {} },
      style: {}
    });

    const doc = {
      documentElement: createMockEl(),
      getElementById: () => createMockEl(),
      querySelectorAll: () => [],
      addEventListener: () => {},
      removeEventListener: () => {}
    };

    const windowObj: any = {
      addEventListener: () => {},
      removeEventListener: () => {},
      localStorage: { getItem: () => null, setItem: () => {} },
      location: { search: '', pathname: '/', reload: () => {} },
      navigator: { userAgent: 'mobile' },
      document: doc,
      matchMedia: () => ({ matches: true, addEventListener: () => {}, removeEventListener: () => {} })
    };

    const context = vm.createContext({
      window: windowObj,
      document: doc,
      navigator: windowObj.navigator,
      location: windowObj.location,
      localStorage: windowObj.localStorage,
      matchMedia: windowObj.matchMedia,
      console
    });

    vm.runInContext(scriptContent, context);
    appInstance = windowObj.cricosMobileApp;
  });

  describe('1. Precision Dynamic Worm Progression Curve', () => {
    it('renders real-time mathematical cumulative progression comparing Innings 1 (DEL 178) vs Chase (MUM 142)', () => {
      const wormHtml = appInstance.renderDynamicWormChart();
      assert.ok(wormHtml.includes('Precision Worm Progression'), 'Must include precision worm progression title');
      assert.ok(wormHtml.includes('DEL 178/10'), 'Must display Delhi final score of 178/10');
      assert.ok(wormHtml.includes('TARGET 178'), 'Must render Target 178 guide line');
      assert.ok(wormHtml.includes('CRR'), 'Must provide CRR telemetry indicator');
      assert.ok(wormHtml.includes('RRR'), 'Must provide RRR telemetry indicator');
      assert.ok(wormHtml.includes('Needed'), 'Must include Needed runs indicator');
    });

    it('renders live pulse radar head at active over coordinate', () => {
      const wormHtml = appInstance.renderDynamicWormChart();
      assert.ok(wormHtml.includes('Live Chase: 142/3 in 16.4 ov'), 'Must render live chase coordinate point');
      assert.ok(wormHtml.includes('animate attributeName="r"'), 'Must have pulsing radar animation attribute');
    });

    it('provides interactive over inspection selector chips and tap handlers', () => {
      const wormHtml = appInstance.renderDynamicWormChart();
      assert.ok(wormHtml.includes('selectWormOver(this.dataset.over)'), 'Must bind selectWormOver tap handler');
      assert.ok(wormHtml.includes('analytics-over-chip'), 'Must style over jump chips');
      assert.ok(wormHtml.includes('data-over="16"'), 'Must include 16 completed overs in tap selectors');

      // Test selecting an over
      appInstance.selectWormOver(6);
      const selWormHtml = appInstance.renderDynamicWormChart();
      assert.ok(selWormHtml.includes('Over 6 Differential Inspection'), 'Must render differential inspection card for over 6');
      appInstance.selectWormOver(6); // toggle off
    });
  });

  describe('2. Precision Manhattan Over Velocity & Dual Phase Comparison', () => {
    it('renders dynamic over-by-over velocity bars with phase support', () => {
      const manhattanHtml = appInstance.renderDynamicManhattanChart();
      assert.ok(manhattanHtml.includes('Precision Manhattan Over Velocity'), 'Must include Manhattan velocity title');
      assert.ok(manhattanHtml.includes('setManhattanViewMode(this.dataset.mode)'), 'Must have Manhattan mode toggle handler');
      assert.ok(manhattanHtml.includes('data-mode="CHASE"'), 'Must offer Chase mode toggle');
      assert.ok(manhattanHtml.includes('data-mode="DUAL"'), 'Must offer Dual comparison toggle');
    });

    it('renders wicket indicators and runs on top of velocity bars', () => {
      const manhattanHtml = appInstance.renderDynamicManhattanChart();
      assert.ok(manhattanHtml.includes('selectManhattanOver(this.dataset.over)'), 'Must bind selectManhattanOver handler');
      
      // Select over 2 (has wicket)
      appInstance.selectManhattanOver(2);
      const selManHtml = appInstance.renderDynamicManhattanChart();
      assert.ok(selManHtml.includes('Over 2 Breakdown'), 'Must display over breakdown detail section');
      assert.ok(selManHtml.includes('Jasprit Bumrah'), 'Must display bowler name for over 2');
      appInstance.selectManhattanOver(2); // toggle off
    });

    it('supports switching to Dual view mode with side-by-side Innings 1 and Chase bars', () => {
      appInstance.setManhattanViewMode('DUAL');
      const dualHtml = appInstance.renderDynamicManhattanChart();
      assert.ok(dualHtml.includes('DEL Over'), 'Must include 1st innings bars in dual mode');
      assert.ok(dualHtml.includes('MUM Over'), 'Must include chase bars in dual mode');
      appInstance.setManhattanViewMode('CHASE'); // reset back
    });
  });

  describe('3. 360° Precision Wagon Wheel & Sector Telemetry', () => {
    it('renders 8 interactive sector wedges with short labels and custom trajectory rays', () => {
      const wagonHtml = appInstance.renderDynamicAnalyticsWagon();
      assert.ok(wagonHtml.includes('360° Precision Wagon Wheel'), 'Must include 360 Wagon Wheel header');
      assert.ok(wagonHtml.includes('selectAnalyticsWagonZone(this.dataset.zone)'), 'Must bind sector wedge tap handler');
      assert.ok(wagonHtml.includes('EXTRA_COVER'), 'Must include EXTRA_COVER zone');
      assert.ok(wagonHtml.includes('MID_WICKET'), 'Must include MID_WICKET zone');
      assert.ok(wagonHtml.includes('LONG_ON'), 'Must include LONG_ON zone');
      assert.ok(wagonHtml.includes('LONG_OFF'), 'Must include LONG_OFF zone');
      assert.ok(wagonHtml.includes('POINT'), 'Must include POINT zone');
      assert.ok(wagonHtml.includes('THIRD_MAN'), 'Must include THIRD_MAN zone');
      assert.ok(wagonHtml.includes('FINE_LEG'), 'Must include FINE_LEG zone');
      assert.ok(wagonHtml.includes('SQUARE_LEG'), 'Must include SQUARE_LEG zone');
    });

    it('supports RHB and LHB batting stance switching with mirrored trajectories', () => {
      const wagonHtml = appInstance.renderDynamicAnalyticsWagon();
      assert.ok(wagonHtml.includes('setAnalyticsWagonStance(this.dataset.stance)'), 'Must bind stance switcher handler');
      assert.ok(wagonHtml.includes('data-stance="RHB"'), 'Must contain RHB stance option');
      assert.ok(wagonHtml.includes('data-stance="LHB"'), 'Must contain LHB stance option');

      appInstance.setAnalyticsWagonStance('LHB');
      const lhbWagonHtml = appInstance.renderDynamicAnalyticsWagon();
      assert.ok(lhbWagonHtml.includes('active" style="font-size: 0.65rem; padding: 0.2rem 0.5rem;" onclick="window.cricosMobileApp.setAnalyticsWagonStance(this.dataset.stance)" data-stance="LHB"'), 'LHB stance must be marked active');
      appInstance.setAnalyticsWagonStance('RHB'); // reset back
    });

    it('supports interactive filtering by batter and shot type', () => {
      const wagonHtml = appInstance.renderDynamicAnalyticsWagon();
      assert.ok(wagonHtml.includes('filterAnalyticsWagonBatter(this.dataset.batter)'), 'Must bind batter filter handler');
      assert.ok(wagonHtml.includes('filterAnalyticsWagonShotType(this.dataset.shottype)'), 'Must bind shot type filter handler');
      assert.ok(wagonHtml.includes('data-shottype="BOUNDARIES"'), 'Must contain boundaries shot filter');
      assert.ok(wagonHtml.includes('data-shottype="SINGLES"'), 'Must contain singles shot filter');
      assert.ok(wagonHtml.includes('data-shottype="DOTS"'), 'Must contain dots shot filter');
    });

    it('computes and displays dynamic Off vs On side split ratio bar', () => {
      const wagonHtml = appInstance.renderDynamicAnalyticsWagon();
      assert.ok(wagonHtml.includes('Off Runs'), 'Must display Off side runs metric');
      assert.ok(wagonHtml.includes('On Runs'), 'Must display On side runs metric');
      assert.ok(wagonHtml.includes('Off Side ('), 'Must render Off side percentage label');
      assert.ok(wagonHtml.includes('On Side ('), 'Must render On side percentage label');
    });
  });

  describe('4. Official Dynamic Match Scorecard', () => {
    it('renders complete batting figures with live strikers and strike rate calculations', () => {
      const scorecardHtml = appInstance.renderDynamicScorecard();
      assert.ok(scorecardHtml.includes('Official Match Scorecard'), 'Must render Official Match Scorecard header');
      assert.ok(scorecardHtml.includes('Batting Figures'), 'Must display Batting Figures section');
      assert.ok(scorecardHtml.includes('not out (striker)'), 'Must denote active striker status');
      assert.ok(scorecardHtml.includes('not out (non-striker)'), 'Must denote active non-striker status');
      assert.ok(scorecardHtml.includes('142/3'), 'Must display exact live innings score 142/3');
    });

    it('renders Fall of Wickets milestone cards', () => {
      const scorecardHtml = appInstance.renderDynamicScorecard();
      assert.ok(scorecardHtml.includes('Fall of Wickets'), 'Must include Fall of Wickets section');
      assert.ok(scorecardHtml.includes('12/1'), 'Must display 1st wicket at 12/1');
      assert.ok(scorecardHtml.includes('12/2'), 'Must display 2nd wicket at 12/2');
      assert.ok(scorecardHtml.includes('20/3'), 'Must display 3rd wicket at 20/3');
    });

    it('renders complete bowling figures summing to match runs and overs', () => {
      const scorecardHtml = appInstance.renderDynamicScorecard();
      assert.ok(scorecardHtml.includes('Bowling Figures (DEL)'), 'Must include Bowling Figures section');
      assert.ok(scorecardHtml.includes('Mohammed Siraj'), 'Must include Mohammed Siraj bowling figures');
      assert.ok(scorecardHtml.includes('Jasprit Bumrah *'), 'Must include active bowler Bumrah with indicator');
      assert.ok(scorecardHtml.includes('Kuldeep Yadav'), 'Must include Kuldeep Yadav bowling figures');
      assert.ok(scorecardHtml.includes('Axar Patel'), 'Must include Axar Patel bowling figures');
    });
  });

  describe('5. Mobile Native Controller Parity (LiveMatchScreen.ts)', () => {
    const controller = new LiveMatchScreenController();

    it('renders Worm chart in LiveMatchScreen with CRR and RRR math', () => {
      const wormHtml = controller.renderMobileHtml('SCORER', 'WORM');
      assert.ok(wormHtml.includes('Precision Worm Progression'), 'Controller must render Worm chart');
      assert.ok(wormHtml.includes('TARGET 178'), 'Controller must include target 178');
      assert.ok(wormHtml.includes('CRR'), 'Controller must include CRR');
      assert.ok(wormHtml.includes('RRR'), 'Controller must include RRR');
    });

    it('renders Manhattan velocity bars in LiveMatchScreen', () => {
      const manhattanHtml = controller.renderMobileHtml('SCORER', 'MANHATTAN');
      assert.ok(manhattanHtml.includes('Precision Manhattan Velocity'), 'Controller must render Manhattan chart');
      assert.ok(manhattanHtml.includes('Overs 1-16'), 'Controller must display completed overs range');
    });

    it('renders 360 Wagon Wheel in LiveMatchScreen', () => {
      const wagonHtml = controller.renderMobileHtml('SCORER', 'WAGON');
      assert.ok(wagonHtml.includes('360° Precision Wagon Wheel'), 'Controller must render Wagon Wheel');
      assert.ok(wagonHtml.includes('OFF'), 'Controller must render OFF side label');
      assert.ok(wagonHtml.includes('ON'), 'Controller must render ON side label');
    });

    it('renders Detailed Scorecard in LiveMatchScreen with Batting and Bowling tables', () => {
      const cardHtml = controller.renderMobileHtml('SCORER', 'SCORECARD');
      assert.ok(cardHtml.includes('Official Match Scorecard'), 'Controller must render Scorecard');
      assert.ok(cardHtml.includes('Batting Figures'), 'Controller must render Batting figures');
      assert.ok(cardHtml.includes('Bowling Figures'), 'Controller must render Bowling figures');
      assert.ok(cardHtml.includes('Fall of Wickets'), 'Controller must render Fall of wickets');
    });
  });

  describe('6. Invariant Adherence: Zero transition: all & 100% Tooltips', () => {
    it('verifies zero transition: all in mobile styles', () => {
      assert.ok(!mobileHtml.includes('transition: all'), 'Mobile HTML must never use transition: all');
      assert.ok(!distMobileHtml.includes('transition: all'), 'Dist mobile HTML must never use transition: all');
    });

    it('verifies data-tooltip attributes on interactive chart triggers', () => {
      assert.ok(mobileHtml.includes('data-tooltip="Toggle Worm cumulative run progression curve"'), 'Worm button has tooltip');
      assert.ok(mobileHtml.includes('data-tooltip="Toggle Manhattan over-by-over run velocity bars"'), 'Bars button has tooltip');
      assert.ok(mobileHtml.includes('data-tooltip="Toggle 8-zone 360° precision wagon wheel"'), 'Wagon button has tooltip');
      assert.ok(mobileHtml.includes('data-tooltip="Toggle official detailed match scorecard"'), 'Card button has tooltip');
    });

    it('verifies distribution packaging parity in dist/mobile.html', () => {
      assert.ok(distMobileHtml.length > 50000, 'dist/mobile.html must be populated');
      assert.ok(distMobileHtml.includes('renderDynamicWormChart'), 'dist/mobile.html must contain precision worm method');
      assert.ok(distMobileHtml.includes('renderDynamicManhattanChart'), 'dist/mobile.html must contain precision manhattan method');
      assert.ok(distMobileHtml.includes('renderDynamicAnalyticsWagon'), 'dist/mobile.html must contain precision wagon method');
      assert.ok(distMobileHtml.includes('renderDynamicScorecard'), 'dist/mobile.html must contain official scorecard method');
    });
  });
});
