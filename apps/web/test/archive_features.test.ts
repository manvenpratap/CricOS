import { test } from 'node:test';
import assert from 'node:assert';
import {
  calculateEventReadiness,
  generateDefaultMatchRequirements,
  renderEventReadinessBarHtml,
  formatMinorInr,
  getMatchStatusMeta,
  calculateRevisedTarget,
  resolveInningsTeams,
  transitionOfficialStatus,
  renderOfficialCardHtml,
  calculateAverageRating,
  renderRatingsStars,
  getDefaultBattingLeaders,
  getDefaultBowlingLeaders,
  renderBattingLeaderboardHtml,
  renderBowlingLeaderboardHtml
} from '../dist/index.js';

test('calculateEventReadiness: accurately measures operational completeness', () => {
  const requirements = generateDefaultMatchRequirements();
  const readiness = calculateEventReadiness(requirements);

  assert.strictEqual(typeof readiness.percentage, 'number');
  assert.strictEqual(readiness.totalRequired, 4); // Venue, 2 Umpires, Scorer
  assert.strictEqual(readiness.confirmedRequired, 4); // All 4 confirmed or held
  assert.strictEqual(readiness.percentage, 100);
  assert.strictEqual(readiness.isReadyToStart, true);

  // Mark one required item as missing
  requirements[0]!.status = 'MISSING';
  const degradedReadiness = calculateEventReadiness(requirements);
  assert.strictEqual(degradedReadiness.percentage, 75);
  assert.strictEqual(degradedReadiness.confirmedRequired, 3);
  assert.strictEqual(degradedReadiness.missingItems.length, 1);
  assert.strictEqual(degradedReadiness.isReadyToStart, false);

  // Render HTML progress bar
  const html = renderEventReadinessBarHtml(degradedReadiness);
  assert.ok(html.includes('75% CONFIRMED'));
  assert.ok(html.includes('Match Venue & Turf Pitch'));
});

test('currency formatting: correctly formats minor units to INR', () => {
  assert.strictEqual(formatMinorInr(250000), '₹2,500.00');
  assert.strictEqual(formatMinorInr(60000), '₹600.00');
  assert.strictEqual(formatMinorInr(0), '₹0.00');
});

test('match-control: status meta and DLS rain revised target calculator', () => {
  const meta = getMatchStatusMeta('TOSS_DONE');
  assert.strictEqual(meta.label, 'TOSS COMPLETED');
  assert.strictEqual(meta.color, '#FFB800');

  // Rain revision: 180 runs target in 20 overs, reduced to 12 overs
  // 180 / 20 = 9 runs/over * 12 = 108 * 1.05 = 113.4 -> ceil = 114
  const revisedTarget = calculateRevisedTarget(180, 20, 12);
  assert.strictEqual(revisedTarget, 114);

  // If overs not reduced, target stays same
  assert.strictEqual(calculateRevisedTarget(180, 20, 20), 180);
});

test('match-control: resolveInningsTeams resolves batting and bowling 1st correctly', () => {
  const teamA = { id: 'team-a', name: 'Bengaluru Strikers' };
  const teamB = { id: 'team-b', name: 'Mumbai Blasters' };

  // Team A wins toss and elects to bat
  const toss1 = {
    winnerTeamId: 'team-a',
    winnerTeamName: 'Bengaluru Strikers',
    decision: 'BAT' as const,
    tossTime: '2026-09-16T18:00:00Z',
    confirmedByOfficial: 'Umpire Sundaram'
  };
  const res1 = resolveInningsTeams(teamA, teamB, toss1);
  assert.strictEqual(res1.batting1st.id, 'team-a');
  assert.strictEqual(res1.bowling1st.id, 'team-b');

  // Team B wins toss and elects to bowl
  const toss2 = {
    winnerTeamId: 'team-b',
    winnerTeamName: 'Mumbai Blasters',
    decision: 'BOWL' as const,
    tossTime: '2026-09-16T18:00:00Z',
    confirmedByOfficial: 'Umpire Sundaram'
  };
  const res2 = resolveInningsTeams(teamA, teamB, toss2);
  assert.strictEqual(res2.batting1st.id, 'team-a'); // Team A bats first since B chose to bowl
  assert.strictEqual(res2.bowling1st.id, 'team-b');
});

test('official-desk: lifecycle state machine and HTML card rendering', () => {
  let status = transitionOfficialStatus('ASSIGNED', 'ACCEPT');
  assert.strictEqual(status, 'ACCEPTED');

  status = transitionOfficialStatus(status, 'CHECK_IN');
  assert.strictEqual(status, 'CHECKED_IN');

  status = transitionOfficialStatus(status, 'START_MATCH');
  assert.strictEqual(status, 'IN_PROGRESS');

  status = transitionOfficialStatus(status, 'COMPLETE');
  assert.strictEqual(status, 'COMPLETED');

  const cardHtml = renderOfficialCardHtml({
    id: 'off-1',
    matchId: 'm-1',
    matchTitle: 'Delhi Titans vs Mumbai Blasters',
    venueName: 'Chinnaswamy Ground B',
    scheduledTime: '18:00 – 22:00',
    role: 'LEAD_UMPIRE',
    feeMinor: 60000,
    status: 'CHECKED_IN',
    payoutStatus: 'ESCROW_HELD'
  });

  assert.ok(cardHtml.includes('Delhi Titans vs Mumbai Blasters'));
  assert.ok(cardHtml.includes('LEAD UMPIRE'));
  assert.ok(cardHtml.includes('₹600.00 Escrow'));
  assert.ok(cardHtml.includes('Checked in &amp; On-field Ready') || cardHtml.includes('Checked in & On-field Ready'));
});

test('ratings-modal: calculates average ratings and star representation', () => {
  const ratings = {
    pitchQuality: 5,
    umpiringAccuracy: 4,
    scoringReliability: 5
  };
  const avg = calculateAverageRating(ratings);
  assert.strictEqual(avg, 4.7);

  const stars = renderRatingsStars(4.7);
  assert.strictEqual(stars, '★★★★★');

  const stars3 = renderRatingsStars(3.2);
  assert.strictEqual(stars3, '★★★☆☆');
});

test('leaderboards: player leaderboards generate compliant statistics and HTML', () => {
  const batting = getDefaultBattingLeaders();
  assert.strictEqual(batting.length, 5);
  assert.strictEqual(batting[0]!.name, 'Virat Sharma');
  assert.strictEqual(batting[0]!.runs, 284);

  const bowling = getDefaultBowlingLeaders();
  assert.strictEqual(bowling.length, 5);
  assert.strictEqual(bowling[0]!.name, 'Jasprit B.');
  assert.strictEqual(bowling[0]!.wickets, 12);

  const batHtml = renderBattingLeaderboardHtml(batting);
  assert.ok(batHtml.includes('Virat Sharma'));
  assert.ok(batHtml.includes('284'));

  const bowlHtml = renderBowlingLeaderboardHtml(bowling);
  assert.ok(bowlHtml.includes('Jasprit B.'));
  assert.ok(bowlHtml.includes('12'));
});
