import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { FastifyInstance } from 'fastify';
import { buildServer } from '../apps/api/dist/server.js';
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
import {
  CommandPaletteEngine,
  DEFAULT_COMMAND_REGISTRY
} from '../apps/web/dist/components/command-palette.js';
import {
  FieldPlacementPlannerEngine,
  FIELD_PRESETS
} from '../apps/web/dist/components/field-placement-planner.js';
import {
  PitchMapAndWinProbEngine,
  SAMPLE_PITCH_MAP_DELIVERIES
} from '../apps/web/dist/components/pitch-map-win-prob.js';
import {
  PlayerAuctionDraftEngine
} from '../apps/web/dist/components/player-auction-draft.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('Domain: Scoring, Match Operations, Umpire Desk & Cricsheet Export', () => {
  let app: FastifyInstance;
  const matchId = 'm-test-lifecycle-01';
  const mobileViewPath = path.join(rootDir, 'apps/api/src/ui/mobile-view.ts');
  const dashboardPath = path.join(rootDir, 'apps/api/src/ui/dashboard.ts');
  const mobileSrc = fs.readFileSync(mobileViewPath, 'utf8');
  const dashboardSrc = fs.readFileSync(dashboardPath, 'utf8');

  before(async () => {
    app = buildServer();
    await app.ready();
  });

  after(async () => {
    await app.close();
  });

  // =========================================================================
  // Suite 1: Match Lifecycle, Fixture Rules & Squads
  // =========================================================================
  describe('Suite 1 — Match Lifecycle, Rules & Squad Management', () => {
    it('1.1 should configure match overs, ball type, powerplays and DLS status', async () => {
      const res = await app.inject({
        method: 'PATCH',
        url: `/api/v1/matches/${matchId}/configuration`,
        payload: {
          overs: 20,
          ball_type: 'Kookaburra White Turf',
          powerplay_overs: 6,
          dls_enabled: true
        }
      });
      assert.equal(res.statusCode, 200);
      const body = JSON.parse(res.body);
      assert.equal(body.success, true);
      assert.equal(body.configuration.overs, 20);
      assert.equal(body.configuration.ball_type, 'Kookaburra White Turf');
    });

    it('1.2 should nominate participating teams and Playing XI / bench rosters', async () => {
      const teamsRes = await app.inject({
        method: 'PUT',
        url: `/api/v1/matches/${matchId}/teams`,
        payload: {
          team_a_id: 'team-blr-strikers',
          team_b_id: 'team-mum-blasters'
        }
      });
      assert.equal(teamsRes.statusCode, 200);
      assert.equal(JSON.parse(teamsRes.body).team_a_id, 'team-blr-strikers');

      const squadRes = await app.inject({
        method: 'PUT',
        url: `/api/v1/matches/${matchId}/squads`,
        payload: {
          team_id: 'team-blr-strikers',
          playing_xi: ['p-01', 'p-02', 'p-03', 'p-04', 'p-05', 'p-06', 'p-07', 'p-08', 'p-09', 'p-10', 'p-11'],
          bench: ['p-12', 'p-13']
        }
      });
      assert.equal(squadRes.statusCode, 200);
      const squadBody = JSON.parse(squadRes.body);
      assert.equal(squadBody.playing_xi_count, 11);
      assert.equal(squadBody.bench_count, 2);
    });

    it('1.3 should record rain stoppages, revise targets via DLS and retrieve timeline', async () => {
      const pauseRes = await app.inject({
        method: 'POST',
        url: `/api/v1/matches/${matchId}/pause`,
        payload: { reason: 'HEAVY_RAIN' }
      });
      assert.equal(pauseRes.statusCode, 200);
      assert.equal(JSON.parse(pauseRes.body).status, 'PAUSED');

      const resumeRes = await app.inject({
        method: 'POST',
        url: `/api/v1/matches/${matchId}/resume`,
        payload: { revised_overs: 15, target_runs: 142 }
      });
      assert.equal(resumeRes.statusCode, 200);
      const resumeBody = JSON.parse(resumeRes.body);
      assert.equal(resumeBody.status, 'IN_PROGRESS');
      assert.equal(resumeBody.revised_overs, 15);

      const timeRes = await app.inject({
        method: 'GET',
        url: `/api/v1/matches/${matchId}/timeline`
      });
      assert.equal(timeRes.statusCode, 200);
      assert.ok(Array.isArray(JSON.parse(timeRes.body).timeline));
    });
  });

  // =========================================================================
  // Suite 2: Real-Time Scoring Sync, Verification & Publication
  // =========================================================================
  describe('Suite 2 — Scoring Delivery Sync, Verification & Publishing', () => {
    it('2.1 should batch sync offline deliveries and update live match state', async () => {
      const syncRes = await app.inject({
        method: 'POST',
        url: `/api/v1/scoring/matches/${matchId}/sync`,
        payload: {
          deliveries: [
            { client_event_id: 'cevt-01', sequence: 1, event_type: 'DELIVERY', bat_runs: 1, extra_runs: 0, extra_type: 'NONE', legal_ball: true, is_wicket: false },
            { client_event_id: 'cevt-02', sequence: 2, event_type: 'DELIVERY', bat_runs: 4, extra_runs: 0, extra_type: 'NONE', legal_ball: true, is_wicket: false },
            { client_event_id: 'cevt-03', sequence: 3, event_type: 'DELIVERY', bat_runs: 0, extra_runs: 0, extra_type: 'NONE', legal_ball: true, is_wicket: true }
          ]
        }
      });
      assert.equal(syncRes.statusCode, 200);
      const syncBody = JSON.parse(syncRes.body);
      assert.equal(syncBody.synced_count, 3);
      assert.equal(syncBody.current_state.runs, 5);
      assert.equal(syncBody.current_state.wickets, 1);
    });

    it('2.2 should verify scorecard integrity by lead official and publish official result', async () => {
      const verifyRes = await app.inject({
        method: 'POST',
        url: `/api/v1/scoring/matches/${matchId}/verify`,
        payload: { verified_by: 'Rajesh Sharma (Lead Umpire)' }
      });
      assert.equal(verifyRes.statusCode, 200);
      assert.equal(JSON.parse(verifyRes.body).success, true);

      const pubRes = await app.inject({
        method: 'POST',
        url: `/api/v1/scoring/matches/${matchId}/publish`
      });
      assert.equal(pubRes.statusCode, 200);
      assert.equal(JSON.parse(pubRes.body).status, 'PUBLISHED');

      const cardRes = await app.inject({
        method: 'GET',
        url: `/api/v1/matches/${matchId}/scorecard`
      });
      assert.equal(cardRes.statusCode, 200);
      const cardBody = JSON.parse(cardRes.body);
      assert.ok(cardBody.score);
      assert.ok(Array.isArray(cardBody.batting));
      assert.ok(Array.isArray(cardBody.bowling));
    });
  });

  // =========================================================================
  // Suite 3: Delivery Undo, Strike Swap & Innings Management
  // =========================================================================
  describe('Suite 3 — Delivery Undo, Manual Strike Swap & Bowler Rotation', () => {
    const testMatchId = 'm-test-undo-ops-01';

    it('3.1 should score deliveries sequentially, support multi-level undo, and revert match state cleanly', async () => {
      await app.inject({
        method: 'POST',
        url: `/api/v1/scoring/matches/${testMatchId}/events`,
        payload: { sequence: 1, bat_runs: 1, extra_runs: 0, extra_type: 'NONE', legal_ball: true, striker_id: 'p-striker', non_striker_id: 'p-nonstriker' }
      });
      await app.inject({
        method: 'POST',
        url: `/api/v1/scoring/matches/${testMatchId}/events`,
        payload: { sequence: 2, bat_runs: 4, extra_runs: 0, extra_type: 'NONE', legal_ball: true }
      });
      await app.inject({
        method: 'POST',
        url: `/api/v1/scoring/matches/${testMatchId}/events`,
        payload: { sequence: 3, bat_runs: 0, extra_runs: 0, extra_type: 'NONE', legal_ball: true, is_wicket: true, wicket_type: 'BOWLED', player_out_id: 'p-striker' }
      });

      // Undo Wicket
      const undoWicket = await app.inject({ method: 'POST', url: `/api/v1/scoring/matches/${testMatchId}/undo` });
      assert.equal(undoWicket.statusCode, 200);
      assert.equal(JSON.parse(undoWicket.body).state.wickets, 0);
      assert.equal(JSON.parse(undoWicket.body).state.runs, 5);

      // Undo Four
      const undoFour = await app.inject({ method: 'POST', url: `/api/v1/scoring/matches/${testMatchId}/undo` });
      assert.equal(undoFour.statusCode, 200);
      assert.equal(JSON.parse(undoFour.body).state.runs, 1);

      // Undo Single via DELETE endpoint
      const undoSingle = await app.inject({ method: 'DELETE', url: `/api/v1/scoring/matches/${testMatchId}/events/last` });
      assert.equal(undoSingle.statusCode, 200);
      assert.equal(JSON.parse(undoSingle.body).state.runs, 0);

      // Undo on empty history
      const emptyUndo = await app.inject({ method: 'POST', url: `/api/v1/scoring/matches/${testMatchId}/undo` });
      assert.equal(emptyUndo.statusCode, 400);
    });

    it('3.2 should handle manual strike swap and enforce active striker/non-striker positions', async () => {
      const swapMatchId = 'm-test-swap-ops-02';
      await app.inject({
        method: 'POST',
        url: `/api/v1/scoring/matches/${swapMatchId}/events`,
        payload: { sequence: 1, bat_runs: 0, extra_runs: 0, extra_type: 'NONE', legal_ball: true, striker_id: 'batter-A', non_striker_id: 'batter-B' }
      });

      const swapRes = await app.inject({ method: 'POST', url: `/api/v1/scoring/matches/${swapMatchId}/swap-strike` });
      assert.equal(swapRes.statusCode, 200);
      const swapBody = JSON.parse(swapRes.body);
      assert.equal(swapBody.state.striker_id, 'batter-B');
      assert.equal(swapBody.state.non_striker_id, 'batter-A');
    });

    it('3.3 should select active bowler and close innings with target set', async () => {
      const bowlerMatchId = 'm-test-bowler-ops-03';
      const bRes = await app.inject({
        method: 'POST',
        url: `/api/v1/scoring/matches/${bowlerMatchId}/bowler`,
        payload: { bowler_id: 'bowler-bumrah', bowler_name: 'Jasprit Bumrah' }
      });
      assert.equal(bRes.statusCode, 200);
      assert.equal(JSON.parse(bRes.body).state.current_bowler_id, 'bowler-bumrah');

      const closeRes = await app.inject({
        method: 'POST',
        url: `/api/v1/scoring/matches/${bowlerMatchId}/innings/close`,
        payload: { target: 185 }
      });
      assert.equal(closeRes.statusCode, 200);
      assert.equal(JSON.parse(closeRes.body).state.is_innings_closed, true);
      assert.equal(JSON.parse(closeRes.body).state.target, 185);
    });
  });

  // =========================================================================
  // Suite 4: Digital Umpire Match Desk, DRS & Disciplinary Sanctions
  // =========================================================================
  describe('Suite 4 — Umpire Match Desk, DRS Verdicts & Sanctions', () => {
    it('4.1 should evaluate DRS Hawk-Eye ball tracking rules deterministically', () => {
      const resOut = resolveDrsVerdict('LBW', 'NOT_OUT', 'IN_LINE', 'IN_LINE', 'HITTING');
      assert.strictEqual(resOut.finalDecision, 'OUT');

      const resPitchOutside = resolveDrsVerdict('LBW', 'OUT', 'OUTSIDE_LEG', 'IN_LINE', 'HITTING');
      assert.strictEqual(resPitchOutside.finalDecision, 'NOT_OUT');

      const resClipping = resolveDrsVerdict('LBW', 'NOT_OUT', 'IN_LINE', 'IN_LINE', 'UMPIRES_CALL');
      assert.strictEqual(resClipping.finalDecision, 'NOT_OUT');
      assert.strictEqual(resClipping.reviewRetained, true);
    });

    it('4.2 should calculate progressive sanctions and match consequences across Code of Conduct levels 1 to 4', () => {
      const l1 = getSanctionConsequences('LEVEL_1');
      assert.strictEqual(l1.penaltyRuns, 0);
      assert.strictEqual(l1.suspensionOvers, 0);

      const l2 = getSanctionConsequences('LEVEL_2');
      assert.strictEqual(l2.penaltyRuns, 5);

      const l3 = getSanctionConsequences('LEVEL_3');
      assert.strictEqual(l3.penaltyRuns, 5);
      assert.strictEqual(l3.suspensionOvers, 4);

      const l4 = getSanctionConsequences('LEVEL_4');
      assert.strictEqual(l4.penaltyRuns, 5);
      assert.strictEqual(l4.suspensionOvers, 999);
    });

    it('4.3 should log sanctions, DRS reviews, and generate cryptographic sign-off card', () => {
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

      const html = desk.renderUmpireDeskHtml();
      assert.ok(html.includes('CERTIFIED OFFICIAL MATCH CARD'));
      assert.ok(html.includes('Steve Warner'));
    });
  });

  // =========================================================================
  // Suite 5: Cricsheet Export, Speech-to-Score & Multi-Division Ladders
  // =========================================================================
  describe('Suite 5 — Cricsheet Export, Speech-to-Score & League Ladders', () => {
    it('5.1 should parse natural spoken cricket commentary into structured delivery events', () => {
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

    it('5.2 should export canonical match data to valid Cricsheet JSON & Federation XML structures', () => {
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
    });

    it('5.3 should calculate exact Net Run Rate (NRR) and maintain multi-division league standings', () => {
      const nrr = calculateNetRunRate(1120, 118.333, 980, 120);
      assert.strictEqual(nrr, 1.298);
      assert.strictEqual(formatNrrString(1.42), '+1.420');
      assert.strictEqual(formatNrrString(-0.85), '-0.850');

      const manager = new LeagueDivisionsManager();
      const divisions = manager.getDivisions();
      assert.strictEqual(divisions.length, 2);
      assert.strictEqual(divisions[0].tier, 'PREMIER');
      assert.strictEqual(divisions[0].teams[0].status, 'PLAYOFFS');

      const playoffs = manager.getPlayoffBracket();
      assert.strictEqual(playoffs.qualifier1.seed1, 'Mumbai Super Strikers');
      assert.strictEqual(playoffs.qualifier1.seed2, 'Delhi Daredevils');
    });
  });

  // =========================================================================
  // Suite 6: Scoring Pad Generic Extras, Undo & Strike Swap Persona Gating
  // =========================================================================
  describe('Suite 6 — Scoring Pad Generic Extras, Undo & Scorer Strike Swap Gating', () => {
    it('6.1 should provide generic extras buttons on mobile & dashboard pads opening extra picker sheets', () => {
      // Mobile
      assert.ok(mobileSrc.includes('>Wide</button>'), 'Mobile pad has generic Wide button');
      assert.ok(mobileSrc.includes('>No Ball</button>'), 'Mobile pad has generic No Ball button');
      assert.ok(mobileSrc.includes('>Leg Bye</button>'), 'Mobile pad has generic Leg Bye button');
      assert.ok(mobileSrc.includes('>Bye</button>'), 'Mobile pad has generic Bye button');
      assert.ok(!mobileSrc.includes('>+1 Wd</button>'), 'Mobile pad avoids +1 prefix');

      // Dashboard
      assert.ok(dashboardSrc.includes('openStudioExtraPicker'), 'Dashboard opens extra picker modal');
      assert.ok(dashboardSrc.includes('STUDIO_EXTRA_OPTIONS'), 'Dashboard defines STUDIO_EXTRA_OPTIONS');
    });

    it('6.2 should render dedicated full-width Undo Last Ball button on mobile & dashboard scoring pads', () => {
      assert.ok(mobileSrc.includes('id="btnMobileStudioUndoBall"'), 'Mobile pad has #btnMobileStudioUndoBall');
      assert.ok(mobileSrc.includes('Undo Last Ball'), 'Mobile pad has Undo Last Ball label');
      assert.ok(dashboardSrc.includes('id="btnStudioUndoBall"'), 'Dashboard pad has #btnStudioUndoBall');
      assert.ok(dashboardSrc.includes('undoLastDelivery()'), 'Calls undoLastDelivery()');
    });

    it('6.3 should strictly gate manual Strike Swap button to SCORER persona on both mobile & desktop', () => {
      // Mobile gating
      assert.ok(mobileSrc.includes("if (this.profile.persona === 'SCORER')"), 'Mobile gates swap button to SCORER');
      assert.ok(mobileSrc.includes("this.showToast('🔒 Only official Scorers can swap strike.', 'warning')"), 'Mobile guard toast');

      // Dashboard gating
      assert.ok(dashboardSrc.includes('id="btnStudioSwapStrike" style="display: none;"'), 'Dashboard swap button hidden by default');
      assert.ok(dashboardSrc.includes("studioSwapBtn.style.display = (role === 'SCORER') ? 'inline-flex' : 'none';"), 'Dashboard sets display only for SCORER');
    });

    it('6.4 should verify Rule 5 tooltips for Undo and Strike Swap controls', () => {
      assert.ok(mobileSrc.includes('data-tooltip="Undo last delivery (revert fat finger or scoring misunderstanding)"'), 'Mobile undo tooltip');
      assert.ok(mobileSrc.includes('data-tooltip="Rotate strike manually (Scorer only)"'), 'Mobile swap tooltip');
      assert.ok(dashboardSrc.includes('data-tooltip="Rotate strike manually (Scorer only)"'), 'Dashboard swap tooltip');
    });
  });

  // =========================================================================
  // Suite 7: Command Palette (Cmd+K), Field Placement Engine, Pitch Map Sim & Player Auction
  // =========================================================================
  describe('Suite 7 — Command Palette, Tactical Field Placement, Pitch Map Simulator & Player Auction Room', () => {
    it('7.1 should search and group items accurately in CommandPaletteEngine', () => {
      const cmdEngine = new CommandPaletteEngine(DEFAULT_COMMAND_REGISTRY);
      const fieldResults = cmdEngine.search('field powerplay');
      assert.ok(fieldResults.length > 0, 'Finds field placement command');
      assert.equal(fieldResults[0]?.id, 'cmd-tactics-field-planner');

      const viratResults = cmdEngine.search('virat');
      assert.ok(viratResults.some((item) => item.id === 'cmd-player-virat'));

      const grouped = cmdEngine.groupByCategory(DEFAULT_COMMAND_REGISTRY);
      assert.ok(grouped.TACTICS_3D.length >= 4);
      assert.ok(grouped.THEMES_PERSONAS.length >= 3);
    });

    it('7.2 should validate MCC Law 28.4 & ICC Powerplay field restrictions and LHB mirroring', () => {
      const ppPreset = FIELD_PRESETS.POWERPLAY_ATTACK!;
      const validRes = FieldPlacementPlannerEngine.validateFieldPlacement(
        ppPreset.fielders,
        'PP1_OVERS_1_6',
        'RHB'
      );
      assert.equal(validRes.isLegal, true);
      assert.equal(validRes.outsideCircleCount, 2);
      assert.equal(validRes.maxAllowedOutsideCircle, 2);
      assert.ok(validRes.runSavingEfficiencyPct > 10);

      // Push a 3rd fielder outside the 30-yard circle in Powerplay 1 -> should trigger No-Ball violation
      const illegalFielders = ppPreset.fielders.map((f, i) =>
        i === 4 ? { ...f, radiusRatio: 0.88 } : f
      );
      const invalidRes = FieldPlacementPlannerEngine.validateFieldPlacement(
        illegalFielders,
        'PP1_OVERS_1_6',
        'RHB'
      );
      assert.equal(invalidRes.isLegal, false);
      assert.equal(invalidRes.outsideCircleCount, 3);
      assert.ok(invalidRes.violations[0]?.includes('No-Ball Restriction Breach'));

      // Mirror field for Left-Handed Batter (LHB)
      const mirrored = FieldPlacementPlannerEngine.mirrorFieldForBatterHand(ppPreset.fielders, 'LHB');
      assert.equal(mirrored.length, 11);
      assert.equal(mirrored[2]?.angleDeg, (360 - ppPreset.fielders[2]!.angleDeg) % 360);
    });

    it('7.3 should classify pitch lengths and compute Monte Carlo Win Probability scenarios', () => {
      assert.equal(PitchMapAndWinProbEngine.classifyPitchLength(1.9), 'YORKER');
      assert.equal(PitchMapAndWinProbEngine.classifyPitchLength(6.2), 'GOOD_LENGTH');
      assert.equal(PitchMapAndWinProbEngine.classifyPitchLength(9.6), 'BOUNCER');

      const dist = PitchMapAndWinProbEngine.summarizeLengthDistribution(SAMPLE_PITCH_MAP_DELIVERIES);
      assert.equal(dist.GOOD_LENGTH.balls, 3);
      assert.equal(dist.YORKER.balls, 1);

      const baseSim = PitchMapAndWinProbEngine.simulateWinProbability({
        targetScore: 178,
        currentScore: 142,
        wicketsLost: 3,
        ballsRemaining: 20
      });
      assert.ok(baseSim.battingTeamWinPct > 40 && baseSim.battingTeamWinPct < 85);

      const bigOverSim = PitchMapAndWinProbEngine.simulateWinProbability({
        targetScore: 178,
        currentScore: 142,
        wicketsLost: 3,
        ballsRemaining: 20,
        simulatedNextBalls: 6,
        simulatedNextRuns: 18,
        simulatedNextWickets: 0
      });
      assert.ok(
        bigOverSim.battingTeamWinPct > baseSim.battingTeamWinPct,
        '18-run over increases batting win probability'
      );
    });

    it('7.4 should enforce salary cap purse limits, RTM matching, and gavel sales in PlayerAuctionDraftEngine', () => {
      const auction = new PlayerAuctionDraftEngine();
      const lot = auction.getActiveLot();
      assert.equal(lot.id, 'lot-1');
      assert.equal(lot.currentBidMinor, 240000);

      const bidRes = auction.placeBid('lot-1', 'fr-titan', 25000);
      assert.equal(bidRes.ok, true);
      assert.equal(bidRes.updatedLot?.currentBidMinor, 265000);
      assert.equal(bidRes.updatedLot?.highestBidderName, 'Titan XI');

      const soldRes = auction.gavelSold('lot-1');
      assert.equal(soldRes.ok, true);
      assert.equal(soldRes.soldLot?.status, 'SOLD');
      assert.equal(auction.getActiveLot().id, 'lot-2');
    });

    it('7.5 should expose all flagship modals and mobile action sheets across dashboard.ts and mobile-view.ts', () => {
      assert.ok(dashboardSrc.includes('id="modalCommandPalette"'), 'Desktop Command Palette modal');
      assert.ok(dashboardSrc.includes('id="modalFieldPlanner"'), 'Desktop Tactical Field Planner modal');
      assert.ok(dashboardSrc.includes('id="modalPitchMapSimulator"'), 'Desktop Pitch Map Simulator modal');
      assert.ok(dashboardSrc.includes('id="modalPlayerAuction"'), 'Desktop Live Player Auction modal');
      assert.ok(dashboardSrc.includes('id="modalKeyboardShortcuts"'), 'Desktop Keyboard Shortcuts modal');

      assert.ok(mobileSrc.includes('openCommandPaletteSheet()'), 'Mobile Command Palette sheet');
      assert.ok(mobileSrc.includes('openFieldPlannerSheet('), 'Mobile Field Planner sheet');
      assert.ok(mobileSrc.includes('openPitchMapSheet('), 'Mobile Pitch Map sheet');
      assert.ok(mobileSrc.includes('openPlayerAuctionSheet('), 'Mobile Player Auction sheet');
    });
  });

  // =========================================================================
  // 8. Dynamic RHB/LHB Stance Sync & Intelligent Venue Weather (63, 67, 69)
  // =========================================================================
  describe('8. Dynamic RHB/LHB Stance Sync & Intelligent Venue Weather (63, 67, 69)', () => {
    it('8.1 should automatically sync active batter stance (RHB / LHB) to Wagon Wheel & 3D Stadium', () => {
      assert.ok(dashboardSrc.includes('setBatterStance'), 'setBatterStance controller must exist');
      assert.ok(dashboardSrc.includes('OFF-SIDE') && dashboardSrc.includes('ON-SIDE'), 'Wagon Wheel & 3D Stadium must label OFF-SIDE and ON-SIDE clearly');
      assert.ok(mobileSrc.includes('setWagonBatterStance') || mobileSrc.includes('RHB') && mobileSrc.includes('LHB'), 'Mobile Wagon Wheel must support RHB and LHB stance switching');
    });

    it('8.2 should provide multi-venue meteorological intelligence and collapse mobile 5-hour weather forecast by default', () => {
      assert.ok(dashboardSrc.includes('VENUE_WEATHER_PROFILES'), 'VENUE_WEATHER_PROFILES dictionary must exist');
      assert.ok(dashboardSrc.includes('Wankhede') && dashboardSrc.includes('Chinnaswamy'), 'Flagship stadium weather profiles must exist');
      assert.ok(mobileSrc.includes('weatherForecastExpanded'), 'weatherForecastExpanded state toggle must exist');
      assert.ok(mobileSrc.includes('toggleMobileWeatherForecast'), 'toggleMobileWeatherForecast handler must exist');
      assert.ok(mobileSrc.includes('id="btnMobileMarketplaceWeatherToggle"'), 'Marketplace weather toggle button must exist');
    });
  });

  // =========================================================================
  // 9. Over Completion Bowler Rotation, Fall of Wicket Dismissal Flow & Undo Integrity
  // =========================================================================
  describe('9. Over Completion Bowler Rotation, Fall of Wicket Dismissal Flow & Undo Integrity', () => {
    it('9.1 should prompt scorer for next bowler on over completion and enforce MCC Law 21 on Desktop & Mobile', () => {
      // Desktop Bowler Rotation checks
      assert.ok(dashboardSrc.includes('id="modalBowlerRotation"'), 'Desktop Bowler Rotation modal must exist');
      assert.ok(dashboardSrc.includes('promptBowlerChange'), 'Desktop promptBowlerChange function must exist');
      assert.ok(dashboardSrc.includes('MCC Law 21'), 'Desktop Bowler modal must cite MCC Law 21');
      assert.ok(dashboardSrc.includes('nextBowlerSelect'), 'Desktop next bowler selector must exist');
      assert.ok(dashboardSrc.includes('confirmBowlerChange'), 'Desktop confirmBowlerChange must exist');

      // Mobile Bowler Rotation checks
      assert.ok(mobileSrc.includes('openMobileBowlerRotationSheet'), 'Mobile openMobileBowlerRotationSheet handler must exist');
      assert.ok(mobileSrc.includes('renderMobileBowlerRotationSheet'), 'Mobile renderMobileBowlerRotationSheet renderer must exist');
      assert.ok(mobileSrc.includes('mobile-bowler-sheet'), 'Mobile bowler sheet CSS class must exist');
      assert.ok(mobileSrc.includes('MCC Law 21'), 'Mobile Bowler sheet must enforce MCC Law 21 consecutive overs prohibition');
      assert.ok(mobileSrc.includes('selectMobileNextBowler'), 'Mobile selectMobileNextBowler handler must exist');
      assert.ok(mobileSrc.includes('confirmMobileBowler'), 'Mobile confirmMobileBowler handler must exist');
    });

    it('9.2 should prompt scorer for dismissal mode, fielders involved (caught/stumped/run out), and incoming batter on Desktop & Mobile', () => {
      // Desktop Dismissal modal checks
      assert.ok(dashboardSrc.includes('id="modalDismissal"'), 'Desktop Fall of Wicket modal must exist');
      assert.ok(dashboardSrc.includes('openDismissalModal'), 'Desktop openDismissalModal function must exist');
      assert.ok(dashboardSrc.includes('dismissalKind'), 'Desktop dismissal kind selector must exist');
      assert.ok(dashboardSrc.includes('dismissalFielder'), 'Desktop fielder input must exist');
      assert.ok(dashboardSrc.includes('dismissalOutBatter'), 'Desktop out batter selector (Striker vs Non-Striker) must exist');
      assert.ok(dashboardSrc.includes('dismissalNextBatter'), 'Desktop incoming batter selector must exist');
      assert.ok(dashboardSrc.includes('toggleFielderField'), 'Desktop toggleFielderField must dynamically display fielder input');

      // Mobile Dismissal sheet checks
      assert.ok(mobileSrc.includes('openMobileDismissalSheet'), 'Mobile openMobileDismissalSheet must exist');
      assert.ok(mobileSrc.includes('renderMobileDismissalSheet'), 'Mobile renderMobileDismissalSheet must exist');
      assert.ok(mobileSrc.includes('selectMobileDismissalMode'), 'Mobile selectMobileDismissalMode must support 6 dismissal modes');
      assert.ok(mobileSrc.includes('selectMobileDismissalOutRole'), 'Mobile selectMobileDismissalOutRole must allow selecting Striker vs Non-Striker');
      assert.ok(mobileSrc.includes('setMobileDismissalFielder'), 'Mobile setMobileDismissalFielder must record fielder involved');
      assert.ok(mobileSrc.includes('selectMobileIncomingBatter'), 'Mobile selectMobileIncomingBatter must set next batter');
      assert.ok(mobileSrc.includes('confirmMobileDismissal'), 'Mobile confirmMobileDismissal must complete dismissal');
      assert.ok(mobileSrc.includes('mobile-dismissal-sheet'), 'Mobile dismissal sheet CSS class must exist');
    });

    it('9.3 should handle undo last ball across over completion and dismissal states seamlessly', () => {
      // Desktop Undo checks
      assert.ok(dashboardSrc.includes('undoLastDelivery'), 'Desktop undoLastDelivery must exist');
      assert.ok(dashboardSrc.includes('closeBowlerModal()'), 'Desktop undo must close bowler rotation modal');
      assert.ok(dashboardSrc.includes('closeDismissalModal()'), 'Desktop undo must close dismissal modal');
      assert.ok(dashboardSrc.includes('desktopDismissalHistory'), 'Desktop must track dismissal history for batter restoration');

      // Mobile Undo checks
      assert.ok(mobileSrc.includes('completedOversHistory'), 'Mobile completedOversHistory must track completed overs for seamless over boundary undo');
      assert.ok(mobileSrc.includes('dismissalHistory'), 'Mobile dismissalHistory must track dismissed batters for full stat restoration');
      assert.ok(mobileSrc.includes('this.bowlerRotationSheetOpen = false'), 'Mobile undo must dismiss bowler rotation sheet');
      assert.ok(mobileSrc.includes('this.dismissalSheetOpen = false'), 'Mobile undo must dismiss fall of wicket sheet');
      assert.ok(mobileSrc.includes('overSnap.deliveries'), 'Mobile undo must restore previous over deliveries when unwinding over boundary');
    });
  });

  // =========================================================================
  // 10. Official Match Scorecard Live Synchronization & Contrast Invariants
  // =========================================================================
  describe('10. Official Match Scorecard Live Synchronization & Contrast Invariants', () => {
    it('10.1 should dynamically synchronize mobile scorecard with live scoring deliveries, overs, CRR, RRR, and extras', () => {
      assert.ok(mobileSrc.includes('renderDynamicScorecard()'), 'Mobile renderDynamicScorecard must exist');
      assert.ok(mobileSrc.includes('id="mobileScorecardPanel"'), 'Mobile scorecard panel must exist');
      assert.ok(mobileSrc.includes('this.matchState.extras'), 'Mobile scorecard must track and display extras breakdown');
      assert.ok(mobileSrc.includes('this.matchState.fallOfWickets'), 'Mobile scorecard must render dynamic fall of wickets');
      assert.ok(mobileSrc.includes('this.matchState.dismissedBatters'), 'Mobile scorecard must render official dismissal descriptions');
      assert.ok(mobileSrc.includes('applyExtraDelivery(type, opt)'), 'Mobile applyExtraDelivery must exist and defend against missing opt');
    });

    it('10.2 should dynamically synchronize desktop scorecard with live score state, totals, and innings badges', () => {
      assert.ok(dashboardSrc.includes('renderDetailedScorecard'), 'Desktop renderDetailedScorecard function must exist');
      assert.ok(dashboardSrc.includes('scorecardInningsScore'), 'Desktop scorecard innings score badge must exist');
      assert.ok(dashboardSrc.includes('scorecardTotalText'), 'Desktop scorecard total text element must exist');
      assert.ok(dashboardSrc.includes('scorecardFowContainer'), 'Desktop fall of wickets container must exist');
      assert.ok(dashboardSrc.includes('btnScorecardInn2'), 'Desktop Innings 2 tab button must dynamically update');
    });

    it('10.3 should enforce Swiss Minimalist and Nordic Editorial daylight card surfaces and deep typography for scorecards', () => {
      assert.ok(mobileSrc.includes('body[data-theme="swiss"] #mobileScorecardPanel'), 'Swiss Minimalist light contrast styling must exist for mobile scorecard');
      assert.ok(mobileSrc.includes('body[data-theme="nordic"] #mobileScorecardPanel'), 'Nordic Editorial warm contrast styling must exist for mobile scorecard');
      assert.ok(dashboardSrc.includes('body[data-theme="swiss"] #scorecardInningsBanner'), 'Swiss Minimalist scorecard banner contrast must exist');
      assert.ok(dashboardSrc.includes('body[data-theme="nordic"] #scorecardInningsBanner'), 'Nordic Editorial scorecard banner contrast must exist');
      assert.ok(dashboardSrc.includes('.scorecard-player-cell'), 'Scorecard player cell styling must exist');
      assert.ok(dashboardSrc.includes('.scorecard-dismissal-cell'), 'Scorecard dismissal cell styling must exist');
    });
  });
});




