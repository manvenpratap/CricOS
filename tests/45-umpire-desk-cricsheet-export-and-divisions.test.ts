import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { getDashboardHtml } from '../apps/api/dist/ui/dashboard.js';
import { getMobileAppHtml } from '../apps/api/dist/ui/mobile-view.js';
import {
  UmpireMatchDeskComponent,
  getSanctionConsequences,
  resolveDrsVerdict,
  generateMatchDigest
} from '../apps/web/dist/components/umpire-match-desk.js';
import {
  CricsheetExportEngine,
  parseSpeechToScore
} from '../apps/web/dist/components/cricsheet-export.js';
import {
  LeagueDivisionsManager,
  calculateNetRunRate,
  formatNrrString
} from '../apps/web/dist/components/league-divisions.js';
import { TournamentsScreenController } from '../apps/mobile/dist/screens/TournamentsScreen.js';
import { IncidentsScreenController } from '../apps/mobile/dist/screens/IncidentsScreen.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('45. Digital Umpire Match Desk, Cricsheet Export & Multi-Division League Ladders', () => {
  const dashboardHtml = getDashboardHtml();
  const mobileHtml = getMobileAppHtml();
  const rootIndexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
  const distIndexHtml = fs.readFileSync(path.join(rootDir, 'dist', 'index.html'), 'utf8');
  const distMobileHtml = fs.readFileSync(path.join(rootDir, 'dist', 'mobile.html'), 'utf8');

  let webWindow: any;
  let mobileWindow: any;
  let mobileApp: any;

  before(() => {
    // Setup Mock DOM for Web VM Execution
    const webElements: Record<string, any> = {};
    const createWebMockEl = (id = '') => {
      const el: any = {
        id,
        innerHTML: '',
        textContent: '',
        value: '',
        style: {},
        classList: {
          classes: new Set<string>(),
          add: (cls: string) => el.classList.classes.add(cls),
          remove: (cls: string) => el.classList.classes.delete(cls),
          contains: (cls: string) => el.classList.classes.has(cls)
        },
        querySelector: () => createWebMockEl(),
        querySelectorAll: () => [],
        addEventListener: () => {},
        removeEventListener: () => {},
        prepend: (child: any) => {
          el.innerHTML = (child.innerHTML || child.outerHTML || '') + el.innerHTML;
        },
        appendChild: (child: any) => {
          el.innerHTML += (child.innerHTML || child.outerHTML || '');
        },
        setAttribute: () => {},
        getAttribute: () => null
      };
      return el;
    };

    const getWebEl = (id: string) => {
      if (!webElements[id]) {
        webElements[id] = createWebMockEl(id);
      }
      return webElements[id];
    };

    webWindow = {
      console,
      setTimeout: (fn: any) => { if (typeof fn === 'function') fn(); return { unref: () => {} }; },
      clearTimeout: () => {},
      setInterval: () => ({ unref: () => {} }),
      clearInterval: () => {},
      MutationObserver: class { observe() {} disconnect() {} },
      document: {
        getElementById: (id: string) => getWebEl(id),
        querySelectorAll: () => [],
        createElement: (tag: string) => createWebMockEl('created-' + tag),
        addEventListener: () => {},
        removeEventListener: () => {}
      },
      addEventListener: () => {},
      removeEventListener: () => {},
      showToast: () => {}
    };
    webWindow.window = webWindow;
    webWindow.globalThis = webWindow;

    const scriptMatches = [...dashboardHtml.matchAll(/<script(?![^>]*src=)>([\s\S]*?)<\/script>/g)];
    const context = vm.createContext(webWindow);
    for (const match of scriptMatches) {
      try {
        vm.runInContext(match[1], context);
      } catch {
        // Mock non-critical runtime environments
      }
    }

    // Setup Mobile Mock DOM
    const mobileElements: Record<string, any> = {};
    const createMobileMockEl = (id = '') => {
      const el: any = {
        id,
        innerHTML: '',
        textContent: '',
        value: '',
        style: {},
        classList: {
          classes: new Set<string>(),
          add: (cls: string) => el.classList.classes.add(cls),
          remove: (cls: string) => el.classList.classes.delete(cls),
          contains: (cls: string) => el.classList.classes.has(cls)
        },
        querySelector: () => createMobileMockEl(),
        querySelectorAll: () => [],
        setAttribute: () => {},
        getAttribute: () => null,
        addEventListener: () => {},
        removeEventListener: () => {}
      };
      return el;
    };

    const getMobileEl = (id: string) => {
      if (!mobileElements[id]) {
        mobileElements[id] = createMobileMockEl(id);
      }
      return mobileElements[id];
    };

    mobileWindow = {
      console,
      setTimeout: (fn: any) => { if (typeof fn === 'function') fn(); return { unref: () => {} }; },
      clearTimeout: () => {},
      setInterval: () => ({ unref: () => {} }),
      clearInterval: () => {},
      showToast: () => {},
      localStorage: {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {}
      },
      document: {
        getElementById: (id: string) => getMobileEl(id),
        querySelectorAll: () => [],
        createElement: (tag: string) => createMobileMockEl('created-mobile-' + tag),
        addEventListener: () => {},
        removeEventListener: () => {}
      },
      addEventListener: () => {},
      removeEventListener: () => {},
      fetch: async () => ({
        ok: true,
        json: async () => ({})
      })
    };
    mobileWindow.window = mobileWindow;
    mobileWindow.globalThis = mobileWindow;

    const mobileScriptMatch = mobileHtml.match(/<script>([\s\S]*?)<\/script>/);
    if (mobileScriptMatch) {
      const scriptCode = mobileScriptMatch[1];
      const mobileContext = vm.createContext(mobileWindow);
      try {
        vm.runInContext(scriptCode, mobileContext);
        mobileApp = mobileWindow.cricosMobileApp;
      } catch (err) {
        console.error('Mobile VM execution error:', err);
      }
    }
  });

  // 1. Digital Umpire Match Day Desk & DRS Reviews
  it('1.1 should calculate MCC Law 41/42 sanctions consequences correctly', () => {
    const l1 = getSanctionConsequences('LEVEL_1');
    assert.strictEqual(l1.penaltyRuns, 0, 'Level 1 is warning with 0 penalty');
    assert.strictEqual(l1.suspensionOvers, 0);

    const l2 = getSanctionConsequences('LEVEL_2');
    assert.strictEqual(l2.penaltyRuns, 5, 'Level 2 awards 5 penalty runs');
    assert.strictEqual(l2.suspensionOvers, 0);

    const l3 = getSanctionConsequences('LEVEL_3');
    assert.strictEqual(l3.penaltyRuns, 5);
    assert.strictEqual(l3.suspensionOvers, 4, 'Level 3 awards 5 runs and 4-over suspension');

    const l4 = getSanctionConsequences('LEVEL_4');
    assert.strictEqual(l4.penaltyRuns, 5);
    assert.strictEqual(l4.suspensionOvers, 999, 'Level 4 awards 5 runs and permanent match removal');
  });

  it('1.2 should resolve DRS LBW trajectory verdicts per ICC playing conditions', () => {
    // Pitching outside leg is always NOT OUT
    const r1 = resolveDrsVerdict('LBW', 'OUT', 'OUTSIDE_LEG', 'IN_LINE', 'HITTING');
    assert.strictEqual(r1.finalDecision, 'NOT_OUT');

    // Impact outside off is NOT OUT
    const r2 = resolveDrsVerdict('LBW', 'OUT', 'IN_LINE', 'OUTSIDE_OFF', 'HITTING');
    assert.strictEqual(r2.finalDecision, 'NOT_OUT');

    // Wickets MISSING is NOT OUT and retains review
    const r3 = resolveDrsVerdict('LBW', 'OUT', 'IN_LINE', 'IN_LINE', 'MISSING');
    assert.strictEqual(r3.finalDecision, 'NOT_OUT');
    assert.strictEqual(r3.reviewRetained, true);

    // Wickets UMPIRES_CALL stands with on-field decision and retains review
    const r4 = resolveDrsVerdict('LBW', 'NOT_OUT', 'IN_LINE', 'IN_LINE', 'UMPIRES_CALL');
    assert.strictEqual(r4.finalDecision, 'NOT_OUT');
    assert.strictEqual(r4.reviewRetained, true);

    // Wickets HITTING is OUT
    const r5 = resolveDrsVerdict('LBW', 'NOT_OUT', 'IN_LINE', 'IN_LINE', 'HITTING');
    assert.strictEqual(r5.finalDecision, 'OUT');
    assert.strictEqual(r5.reviewRetained, true);
  });

  it('1.3 should log sanctions, DRS reviews, and generate cryptographic sign-off card', () => {
    const desk = new UmpireMatchDeskComponent('MATCH-TEST-001', 'Nitin Menon', 'S. Ravi', 'J. Srinath');

    const sanction = desk.logSanction({
      matchId: 'MATCH-TEST-001',
      level: 'LEVEL_2',
      breachType: 'BALL_TAMPERING',
      playerName: 'Steve Warner',
      teamName: 'Canberra CC',
      description: 'Used bottle cap on seam'
    });
    assert.strictEqual(sanction.penaltyRuns, 5);
    assert.strictEqual(desk.getSanctions().length, 2);

    const drs = desk.logDrsReview({
      over: '17.2',
      batterName: 'Virat K.',
      bowlerName: 'Siraj',
      appealType: 'LBW',
      originalDecision: 'OUT',
      pitching: 'IN_LINE',
      impact: 'IN_LINE',
      wickets: 'MISSING'
    });
    assert.strictEqual(drs.finalDecision, 'NOT_OUT');
    assert.strictEqual(drs.reviewRetained, true);

    const card = desk.signOffMatch('Delhi won by 4 wickets', '9876');
    assert.strictEqual(card.status, 'CERTIFIED');
    assert.match(card.digitalStamp, /^CRICOS-CERT-[0-9A-F]{8}-[0-9A-F]{8}$/);
    assert.strictEqual(card.totalSanctions, 2);

    const html = desk.renderUmpireDeskHtml();
    assert.ok(html.includes('CERTIFIED OFFICIAL MATCH CARD'));
    assert.ok(html.includes('Steve Warner'));
  });

  // 2. Cricsheet & Federation XML Export Engine
  it('2.1 should parse natural speech-to-score commentary phrases into delivery telemetry', () => {
    const s1 = parseSpeechToScore('Full length on middle stump, driven cleanly through extra cover for four!');
    assert.strictEqual(s1.runs, 4);
    assert.strictEqual(s1.zone, 'Cover');
    assert.strictEqual(s1.isWicket, false);

    const s2 = parseSpeechToScore('Out! Edged and caught behind by wicketkeeper!');
    assert.strictEqual(s2.isWicket, true);
    assert.strictEqual(s2.wicketKind, 'caught behind');

    const s3 = parseSpeechToScore('Fired wide down leg side');
    assert.strictEqual(s3.isExtra, true);
    assert.strictEqual(s3.extraType, 'WIDE');
    assert.strictEqual(s3.runs, 1);

    const s4 = parseSpeechToScore('Massive six over long on!');
    assert.strictEqual(s4.runs, 6);
    assert.strictEqual(s4.zone, 'Long On');
  });

  it('2.2 should generate compliant Cricsheet JSON and Federation XML structures', () => {
    const engine = new CricsheetExportEngine();
    const payload = engine.getDefaultMatchPayload();

    const jsonStr = engine.generateCricsheetJson(payload);
    const parsed = JSON.parse(jsonStr);
    assert.strictEqual(parsed.meta.data_version, '1.0.0');
    assert.strictEqual(parsed.info.match_type, 'T20');
    assert.strictEqual(parsed.info.teams[0], 'Delhi Daredevils');
    assert.strictEqual(parsed.info.outcome.winner, 'Mumbai Super Strikers');
    assert.ok(Array.isArray(parsed.innings));

    const xmlStr = engine.generateCricketXml(payload);
    assert.ok(xmlStr.includes('<?xml version="1.0" encoding="UTF-8"?>'));
    assert.ok(xmlStr.includes('<CricketMatch id="1.0.0" matchType="T20"'));
    assert.ok(xmlStr.includes('<Venue>Harbour Cricket Ground, South Turf</Venue>'));
    assert.ok(xmlStr.includes('<Ball index="1" batter="Virat Sharma" bowler="Jasprit Bumrah"'));

    const log = engine.recordAudioTelemetry({
      over: '18.1',
      speaker: 'LEAD_COMMENTATOR',
      audioTranscript: 'Single to third man',
      sentiment: 'NEUTRAL'
    });
    assert.strictEqual(log.detectedAction?.runs, 1);
    assert.strictEqual(log.detectedAction?.zone, 'Third Man');
  });

  // 3. Multi-Division League Brackets & Promotion/Relegation
  it('3.1 should calculate exact Net Run Rate and signed formatting', () => {
    // Team scored 1120 runs in 118.2 overs (= 118.333), conceded 980 in 120 ov
    const nrr = calculateNetRunRate(1120, 118.333, 980, 120);
    assert.strictEqual(nrr, 1.298);

    const strPos = formatNrrString(1.42);
    assert.strictEqual(strPos, '+1.420');

    const strNeg = formatNrrString(-0.85);
    assert.strictEqual(strNeg, '-0.850');
  });

  it('3.2 should compute division rankings, status tags, and playoff seeding', () => {
    const manager = new LeagueDivisionsManager();
    const divisions = manager.getDivisions();
    assert.strictEqual(divisions.length, 2);

    const premier = divisions[0];
    assert.strictEqual(premier.tier, 'PREMIER');
    assert.strictEqual(premier.teams[0].status, 'PLAYOFFS');
    assert.strictEqual(premier.teams[premier.teams.length - 1].status, 'RELEGATED');

    const div1 = divisions[1];
    assert.strictEqual(div1.tier, 'DIVISION_1');
    assert.strictEqual(div1.teams[0].status, 'PROMOTED');

    const playoffs = manager.getPlayoffBracket();
    assert.strictEqual(playoffs.qualifier1.seed1, 'Mumbai Super Strikers');
    assert.strictEqual(playoffs.qualifier1.seed2, 'Delhi Daredevils');
    assert.strictEqual(playoffs.grandFinal.prizePurseMinor, 30000000);
  });

  it('3.3 should simulate full season promotion and relegation rollover', () => {
    const manager = new LeagueDivisionsManager();
    const rollover = manager.simulateSeasonTransition();

    assert.ok(rollover.promotedTeams.includes('Punjab Kings XI'), 'Punjab Kings XI promoted to Premier');
    assert.ok(rollover.relegatedTeams.includes('Hyderabad Sunrisers'), 'Hyderabad Sunrisers relegated to Div 1');

    const nextPremier = rollover.newDivisions[0];
    const hasPunjab = nextPremier.teams.some(t => t.teamName === 'Punjab Kings XI');
    const hasHyderabad = nextPremier.teams.some(t => t.teamName === 'Hyderabad Sunrisers');
    assert.strictEqual(hasPunjab, true, 'Premier League has newly promoted Punjab Kings');
    assert.strictEqual(hasHyderabad, false, 'Premier League no longer has relegated Hyderabad');
  });

  // 4. Mobile Screen Controllers & Actions
  it('4.1 should support multi-division standings and NRR on TournamentsScreenController', () => {
    const controller = new TournamentsScreenController();
    const premierStandings = controller.getDivisionStandings('PREMIER');
    assert.strictEqual(premierStandings.length, 4);
    assert.strictEqual(premierStandings[0].team, 'Mumbai Super Strikers');

    const div1Standings = controller.getDivisionStandings('DIVISION_1');
    assert.strictEqual(div1Standings.length, 4);
    assert.strictEqual(div1Standings[0].team, 'Punjab Kings XI');

    controller.setActiveDivisionTier('DIVISION_1');
    assert.strictEqual(controller.getState().activeDivisionTier, 'DIVISION_1');

    const sim = controller.simulatePromotionRelegation();
    assert.strictEqual(sim.promoted[0], 'Punjab Kings XI');
    assert.strictEqual(sim.relegated[0], 'Kolkata Knight Riders');

    const html = controller.renderMobileHtml(true);
    assert.ok(html.includes('Premier 🏆'));
    assert.ok(html.includes('Div 1 ⚡'));
    assert.ok(html.includes('Official Standings & Net Run Rate'));
  });

  it('4.2 should support cryptographic sign-off in IncidentsScreenController', () => {
    const controller = new IncidentsScreenController();
    assert.strictEqual(controller.getState().matchSignedOff, false);

    const stamp = controller.signOffMatch('4321');
    assert.match(stamp, /^CRICOS-CERT-[0-9A-F]{8}$/);
    assert.strictEqual(controller.getState().matchSignedOff, true);
    assert.strictEqual(controller.getState().digitalSignature, stamp);

    const html = controller.renderMobileHtml(true);
    assert.ok(html.includes('✓ CERTIFIED BY UMPIRE'));
    assert.ok(html.includes(stamp));
  });

  // 5. Web Console Dashboard Modals & Actions
  it('5.1 should include Umpire Desk, Cricsheet Export, and League Divisions modals in Web Console', () => {
    assert.ok(dashboardHtml.includes('id="modalUmpireDesk"'), 'Contains modalUmpireDesk');
    assert.ok(dashboardHtml.includes('id="modalCricsheetExport"'), 'Contains modalCricsheetExport');
    assert.ok(dashboardHtml.includes('id="modalLeagueDivisions"'), 'Contains modalLeagueDivisions');

    assert.ok(dashboardHtml.includes('id="btnExportCricsheet"'), 'Contains scoreboard Cricsheet export button');
    assert.ok(dashboardHtml.includes('id="btnUmpireDeskQuick"'), 'Contains scoreboard Umpire desk button');
    assert.ok(dashboardHtml.includes('id="btnDivisionsQuick"'), 'Contains scoreboard Divisions button');

    assert.ok(dashboardHtml.includes('id="sidebarBtnUmpireDesk"'), 'Contains sidebar Umpire desk item');
    assert.ok(dashboardHtml.includes('id="sidebarBtnCricsheetExport"'), 'Contains sidebar Cricsheet item');
    assert.ok(dashboardHtml.includes('id="sidebarBtnLeagueDivisions"'), 'Contains sidebar Divisions item');
  });

  it('5.2 should execute Umpire Desk sign-off, penalty runs, and Cricsheet actions in VM sandbox', () => {
    assert.strictEqual(typeof webWindow.signOffUmpireDesk, 'function');
    assert.strictEqual(typeof webWindow.awardUmpirePenaltyRuns, 'function');
    assert.strictEqual(typeof webWindow.submitSpeechCommentary, 'function');
    assert.strictEqual(typeof webWindow.downloadCricsheetFile, 'function');
    assert.strictEqual(typeof webWindow.simulateSeasonTransitionAction, 'function');

    webWindow.signOffUmpireDesk();
    const signOffText = webWindow.document.getElementById('umpireSignOffStatusText');
    assert.ok(signOffText.innerHTML.includes('CRICOS-CERT-E3A9F21B'));

    webWindow.awardUmpirePenaltyRuns(5);
    const sanctionsList = webWindow.document.getElementById('umpireSanctionsList');
    assert.ok(sanctionsList.innerHTML.includes('+5 Penalty Runs'));

    webWindow.submitSpeechCommentary();
    const audioList = webWindow.document.getElementById('speechAudioLogList');
    assert.ok(audioList.innerHTML.includes('+4 (Cover)'));
  });

  // 6. Mobile Application Division & Sign-Off Actions
  it('6.1 should provide switchDivisionAction, simulateRolloverAction, and signOffMatch in mobile markup and controllers', () => {
    assert.ok(mobileHtml.includes("switchDivisionAction(this.dataset.tier)"), 'Mobile HTML contains switchDivisionAction');
    assert.ok(mobileHtml.includes("simulateRolloverAction()"), 'Mobile HTML contains simulateRolloverAction');
    assert.ok(mobileHtml.includes("window.cricosMobileApp.signOffMatchAction()"), 'Mobile HTML contains signOffMatchAction');
    assert.ok(mobileHtml.includes('id="btnMobileDivisionPremier"'), 'Mobile HTML contains btnMobileDivisionPremier');
    assert.ok(mobileHtml.includes('id="btnMobileDivision1"'), 'Mobile HTML contains btnMobileDivision1');

    const tourneyCtrl = new TournamentsScreenController();
    tourneyCtrl.setActiveDivisionTier('DIVISION_1');
    assert.strictEqual(tourneyCtrl.getState().activeDivisionTier, 'DIVISION_1');
    const rollover = tourneyCtrl.simulatePromotionRelegation();
    assert.strictEqual(rollover.promoted[0], 'Punjab Kings XI');
    assert.strictEqual(rollover.relegated[0], 'Kolkata Knight Riders');

    const incCtrl = new IncidentsScreenController();
    const stamp = incCtrl.signOffMatch('9999');
    assert.match(stamp, /^CRICOS-CERT-[0-9A-F]{8}$/);
    assert.strictEqual(incCtrl.getState().matchSignedOff, true);
  });

  // 7. Governance, Invariants & Release Parity
  it('7.1 should satisfy Rule 5 data-tooltip invariants on all interactive buttons in new features', () => {
    const requiredTooltips = [
      'data-tooltip="Close umpire match desk"',
      'data-tooltip="Cryptographically certify match card and release double-entry escrows"',
      'data-tooltip="Record official player conduct sanction"',
      'data-tooltip="Award 5 penalty runs to batting team per MCC Law 41/42"',
      'data-tooltip="Close cricsheet export modal"',
      'data-tooltip="Download match as official Cricsheet JSON"',
      'data-tooltip="Download match as Federation XML"',
      'data-tooltip="Parse commentary audio transcript to automated delivery record"',
      'data-tooltip="Close league divisions modal"',
      'data-tooltip="Simulate season transition with automatic promotion and relegation"',
      'data-tooltip="Export ball-by-ball Cricsheet JSON and Federation XML with audio telemetry"',
      'data-tooltip="Open Official Umpire Match Day Desk, DRS review, and sign-off"',
      'data-tooltip="Multi-Division League Ladders, NRR and Promotion/Relegation"'
    ];

    for (const tip of requiredTooltips) {
      assert.ok(dashboardHtml.includes(tip), `Dashboard HTML must contain tooltip: ${tip}`);
    }
  });

  it('7.2 should maintain the zero transition: all invariant (Emil Kowalski rule)', () => {
    const transitionAllRegex = /transition:\s*all/i;
    assert.strictEqual(transitionAllRegex.test(dashboardHtml), false, 'Dashboard HTML must not have transition: all');
    assert.strictEqual(transitionAllRegex.test(mobileHtml), false, 'Mobile HTML must not have transition: all');
  });

  it('7.3 should maintain byte-for-byte parity between index.html and dist/index.html (Rule 6)', () => {
    assert.strictEqual(rootIndexHtml, distIndexHtml, 'Root index.html and dist/index.html must be byte-for-byte identical');
    assert.ok(distMobileHtml.length > 50000, 'dist/mobile.html must be generated and valid');
  });
});
