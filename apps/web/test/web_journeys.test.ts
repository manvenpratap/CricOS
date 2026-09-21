import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  getDefaultProfile,
  renderUserBadgeHtml,
  getDefaultTeam,
  renderPlayerCardHtml,
  calculatePartnership,
  SHOT_ZONES_CONFIG,
  getDismissalLabel,
  generateTournamentSchedule,
  filterShotsByBatter,
  calculateBatterWagonStats,
  DEFAULT_SHOT_TRAJECTORIES
} from '../dist/index.js';

describe('CricOS Web User Journeys & Components (@cricket-platform/web)', () => {
  describe('1. User Profile & Persona Switching', () => {
    it('creates default user profile with career statistics', () => {
      const captain = getDefaultProfile('CAPTAIN');
      assert.strictEqual(captain.role, 'CAPTAIN');
      assert.strictEqual(captain.name, 'Virat Sharma');
      assert.strictEqual(captain.jerseyNumber, 18);
      assert.ok(Number(captain.careerStats.battingAverage) > 40);
      assert.ok(Number(captain.careerStats.strikeRate) > 130);
    });

    it('renders accessible user badge HTML with tooltip', () => {
      const scorer = getDefaultProfile('SCORER');
      const html = renderUserBadgeHtml(scorer);
      assert.ok(html.includes('data-tooltip'));
      assert.ok(html.includes('SCORER'));
      assert.ok(html.includes('#18'));
    });
  });

  describe('2. Teams & Squad Roster', () => {
    it('provides default team details with full playing XI', () => {
      const team = getDefaultTeam();
      assert.strictEqual(team.shortCode, 'BLR');
      assert.strictEqual(team.players.length, 11);
      const captain = team.players.find(p => p.isCaptain);
      assert.ok(captain);
      assert.strictEqual(captain.name, 'Virat Sharma');
    });

    it('renders player card with role badges and tooltips', () => {
      const team = getDefaultTeam();
      const captain = team.players[0]!;
      const html = renderPlayerCardHtml(captain);
      assert.ok(html.includes('data-tooltip'));
      assert.ok(html.includes('Team Captain'));
      assert.ok(html.includes('#18'));
    });
  });

  describe('3. Tactical Scoring Studio & Wagon Wheel', () => {
    it('calculates active batting partnership stats', () => {
      const partnership = calculatePartnership(34, 20, 16, 12);
      assert.strictEqual(partnership.totalRuns, 50);
      assert.strictEqual(partnership.totalBalls, 32);
    });

    it('defines 8 field zones for wagon wheel', () => {
      assert.strictEqual(SHOT_ZONES_CONFIG.length, 8);
      const zones = SHOT_ZONES_CONFIG.map(z => z.id);
      assert.ok(zones.includes('LONG_ON'));
      assert.ok(zones.includes('EXTRA_COVER'));
      assert.ok(zones.includes('POINT'));
      assert.ok(zones.includes('FINE_LEG'));
    });

    it('formats dismissal labels correctly', () => {
      assert.strictEqual(getDismissalLabel('BOWLED'), 'b. Bowler');
      assert.strictEqual(getDismissalLabel('CAUGHT', 'Kohli'), 'c. Kohli b. Bowler');
      assert.strictEqual(getDismissalLabel('LBW'), 'lbw b. Bowler');
      assert.strictEqual(getDismissalLabel('RUN_OUT', 'Pant'), 'run out (Pant)');
      assert.strictEqual(getDismissalLabel('STUMPED', 'Dhoni'), 'st. Dhoni b. Bowler');
      assert.strictEqual(getDismissalLabel('HIT_WICKET'), 'hit wicket');
    });

    it('filters wagon wheel shot events by batsman name', () => {
      const viratShots = filterShotsByBatter(DEFAULT_SHOT_TRAJECTORIES, 'Virat Sharma');
      const hardikShots = filterShotsByBatter(DEFAULT_SHOT_TRAJECTORIES, 'Hardik Patel');
      const allShots = filterShotsByBatter(DEFAULT_SHOT_TRAJECTORIES, 'ALL');

      assert.strictEqual(viratShots.length, 12);
      assert.strictEqual(hardikShots.length, 6);
      assert.strictEqual(allShots.length, 18);
      assert.ok(viratShots.every(s => s.batterName === 'Virat Sharma'));
      assert.ok(hardikShots.every(s => s.batterName === 'Hardik Patel'));
    });

    it('calculates batsman wagon wheel telemetry and off/leg distributions', () => {
      const viratStats = calculateBatterWagonStats(DEFAULT_SHOT_TRAJECTORIES, 'Virat Sharma', false);
      assert.strictEqual(viratStats.batterName, 'Virat Sharma');
      assert.strictEqual(viratStats.totalRuns, 34);
      assert.strictEqual(viratStats.ballsFaced, 12);
      assert.strictEqual(viratStats.fours, 4);
      assert.strictEqual(viratStats.sixes, 2);
      assert.strictEqual(viratStats.strikeRate, 283.33);
      assert.strictEqual(viratStats.offSidePct + viratStats.legSidePct, 100);

      const hardikStats = calculateBatterWagonStats(DEFAULT_SHOT_TRAJECTORIES, 'Hardik Patel', false);
      assert.strictEqual(hardikStats.batterName, 'Hardik Patel');
      assert.strictEqual(hardikStats.totalRuns, 14);
      assert.strictEqual(hardikStats.ballsFaced, 6);
      assert.strictEqual(hardikStats.fours, 1);
      assert.strictEqual(hardikStats.sixes, 1);
      assert.strictEqual(hardikStats.strikeRate, 233.33);

      const allStats = calculateBatterWagonStats(DEFAULT_SHOT_TRAJECTORIES, 'ALL', false);
      assert.strictEqual(allStats.totalRuns, 48);
      assert.strictEqual(allStats.ballsFaced, 18);
      assert.strictEqual(allStats.fours, 5);
      assert.strictEqual(allStats.sixes, 3);
    });
  });

  describe('4. Tournament Creator & Schedule Generator', () => {
    it('generates round-robin fixtures for an even number of teams', () => {
      const fixtures = generateTournamentSchedule({
        name: 'Super Cup T20',
        format: 'T20',
        teamIds: ['BLR', 'CHE', 'MUM', 'DEL'],
        maxOversPerInnings: 20
      });

      // 4 teams -> 3 rounds, 2 matches per round = 6 total fixtures
      assert.strictEqual(fixtures.length, 6);
      assert.strictEqual(fixtures[0]?.roundNumber, 1);
    });

    it('handles odd number of teams with bye handling', () => {
      const fixtures = generateTournamentSchedule({
        name: 'Tri Series',
        format: 'T20',
        teamIds: ['BLR', 'CHE', 'MUM'],
        maxOversPerInnings: 20
      });

      // 3 teams with bye -> 3 fixtures
      assert.strictEqual(fixtures.length, 3);
    });
  });
});
