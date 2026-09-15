import { TournamentFormat, TournamentStatus } from '@cricket-platform/contracts';

export interface Tournament {
  id: string;
  ownerUserId: string;
  name: string;
  format: TournamentFormat;
  teamCount: number;
  status: TournamentStatus;
  startDate: Date;
  endDate: Date;
}

export interface Fixture {
  id: string;
  tournamentId: string;
  eventId?: string;
  homeTeamId: string;
  awayTeamId: string;
  roundNumber: number;
  scheduledAt: Date;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'POSTPONED' | 'CANCELLED';
}

export interface Standing {
  teamId: string;
  played: number;
  won: number;
  lost: number;
  tied: number;
  noResult: number;
  points: number;
  runsFor: number;
  ballsFor: number;
  runsAgainst: number;
  ballsAgainst: number;
  netRunRate: number;
}

export interface MatchResultSummary {
  homeTeamId: string;
  awayTeamId: string;
  homeRuns: number;
  homeBallsFaced: number;
  homeAllOut?: boolean;
  awayRuns: number;
  awayBallsFaced: number;
  awayAllOut?: boolean;
  maxScheduledOvers?: number; // e.g. 20 overs (120 balls). If all out, balls faced normalizes to full overs
  winnerId?: string | null;   // null for tie or no-result
  isTie?: boolean;
  isNoResult?: boolean;
}

export interface ScheduledRoundRobinFixture {
  id: string;
  round: number;
  homeTeamId: string;
  awayTeamId: string;
}

export function calculatePoints(won: number, tied: number, noResult: number): number {
  return (won * 2) + (tied * 1) + (noResult * 1);
}

/**
 * Parses cricket overs notation (e.g. 19.4 or 20) into total legal deliveries.
 */
export function parseOversToBalls(overs: number | string): number {
  const num = typeof overs === 'string' ? parseFloat(overs) : overs;
  if (isNaN(num) || num <= 0) return 0;
  const completedOvers = Math.floor(num);
  const fraction = Math.round((num - completedOvers) * 10);
  const extraBalls = Math.min(fraction, 5);
  return (completedOvers * 6) + extraBalls;
}

/**
 * Formats total legal balls into standard cricket overs notation (e.g. 118 balls -> "19.4").
 */
export function formatBallsToOvers(balls: number): string {
  if (balls <= 0) return '0.0';
  const completedOvers = Math.floor(balls / 6);
  const remainderBalls = balls % 6;
  return `${completedOvers}.${remainderBalls}`;
}

/**
 * Computes official ICC/MCC Net Run Rate:
 * NRR = (Runs Scored / (Balls Faced / 6)) - (Runs Conceded / (Balls Bowled / 6))
 * Normalized to 3 decimal places.
 */
export function calculateNetRunRate(
  runsScored: number,
  ballsFaced: number,
  runsConceded: number,
  ballsBowled: number
): number {
  const oversFaced = ballsFaced > 0 ? ballsFaced / 6 : 0;
  const oversBowled = ballsBowled > 0 ? ballsBowled / 6 : 0;

  const runRateScored = oversFaced > 0 ? runsScored / oversFaced : 0;
  const runRateConceded = oversBowled > 0 ? runsConceded / oversBowled : 0;

  const rawNrr = runRateScored - runRateConceded;
  return Math.round(rawNrr * 1000) / 1000;
}

/**
 * Generates a balanced round-robin fixture bracket for N teams using the polygon circle method.
 * Handles even and odd numbers of teams (odd gets a bye).
 */
export function generateRoundRobinSchedule(
  teamIds: string[],
  rounds: number = 1
): ScheduledRoundRobinFixture[] {
  if (teamIds.length < 2) return [];

  const teams = [...teamIds];
  const hasGhost = teams.length % 2 !== 0;
  if (hasGhost) {
    teams.push('__BYE__');
  }

  const numTeams = teams.length;
  const roundsPerCycle = numTeams - 1;
  const matchesPerRound = numTeams / 2;
  const fixtures: ScheduledRoundRobinFixture[] = [];
  let fixtureSeq = 1;

  for (let cycle = 0; cycle < rounds; cycle++) {
    const currentTeams = [...teams];
    for (let round = 0; round < roundsPerCycle; round++) {
      const currentRoundNum = (cycle * roundsPerCycle) + round + 1;

      for (let m = 0; m < matchesPerRound; m++) {
        const homeIdx = (round + m) % (numTeams - 1);
        let awayIdx = (numTeams - 1 - m + round) % (numTeams - 1);
        if (m === 0) {
          awayIdx = numTeams - 1;
        }

        const teamA = currentTeams[homeIdx]!;
        const teamB = currentTeams[awayIdx]!;

        // Ignore bye pairings
        if (teamA === '__BYE__' || teamB === '__BYE__') continue;

        // Alternate home and away to maintain fair venue balance
        const isAlternate = (round + m + cycle) % 2 === 1;
        const home = isAlternate ? teamB : teamA;
        const away = isAlternate ? teamA : teamB;

        fixtures.push({
          id: `fix-${fixtureSeq++}`,
          round: currentRoundNum,
          homeTeamId: home,
          awayTeamId: away
        });
      }
    }
  }

  return fixtures;
}

/**
 * Initializes empty tournament standings for a list of teams.
 */
export function initializeStandings(teamIds: string[]): Standing[] {
  return teamIds.map(teamId => ({
    teamId,
    played: 0,
    won: 0,
    lost: 0,
    tied: 0,
    noResult: 0,
    points: 0,
    runsFor: 0,
    ballsFor: 0,
    runsAgainst: 0,
    ballsAgainst: 0,
    netRunRate: 0
  }));
}

/**
 * Updates tournament standings after a completed match according to ICC tournament rules:
 * - If a team is bowled out, overs to take into account are the full scheduled overs.
 * - Sort order: 1. Points (DESC), 2. NRR (DESC), 3. Wins (DESC), 4. Team ID (ASC).
 */
export function updateTournamentStandings(
  currentStandings: Standing[],
  result: MatchResultSummary
): Standing[] {
  const standingsMap = new Map<string, Standing>();
  for (const s of currentStandings) {
    standingsMap.set(s.teamId, { ...s });
  }

  const home = standingsMap.get(result.homeTeamId) || {
    teamId: result.homeTeamId,
    played: 0,
    won: 0,
    lost: 0,
    tied: 0,
    noResult: 0,
    points: 0,
    runsFor: 0,
    ballsFor: 0,
    runsAgainst: 0,
    ballsAgainst: 0,
    netRunRate: 0
  };

  const away = standingsMap.get(result.awayTeamId) || {
    teamId: result.awayTeamId,
    played: 0,
    won: 0,
    lost: 0,
    tied: 0,
    noResult: 0,
    points: 0,
    runsFor: 0,
    ballsFor: 0,
    runsAgainst: 0,
    ballsAgainst: 0,
    netRunRate: 0
  };

  home.played += 1;
  away.played += 1;

  // Outcome
  if (result.isNoResult) {
    home.noResult += 1;
    away.noResult += 1;
    home.points += 1;
    away.points += 1;
  } else if (result.isTie || result.homeRuns === result.awayRuns) {
    home.tied += 1;
    away.tied += 1;
    home.points += 1;
    away.points += 1;
  } else if (result.winnerId === result.homeTeamId || (!result.winnerId && result.homeRuns > result.awayRuns)) {
    home.won += 1;
    away.lost += 1;
    home.points += 2;
  } else {
    away.won += 1;
    home.lost += 1;
    away.points += 2;
  }

  // NRR Balls normalization: All-out innings use full scheduled overs (e.g. 20 overs = 120 balls)
  const maxBalls = (result.maxScheduledOvers || 20) * 6;
  const homeBallsFacedNorm = result.homeAllOut ? maxBalls : Math.min(result.homeBallsFaced, maxBalls);
  const awayBallsFacedNorm = result.awayAllOut ? maxBalls : Math.min(result.awayBallsFaced, maxBalls);

  if (!result.isNoResult) {
    home.runsFor += result.homeRuns;
    home.ballsFor += homeBallsFacedNorm;
    home.runsAgainst += result.awayRuns;
    home.ballsAgainst += awayBallsFacedNorm;

    away.runsFor += result.awayRuns;
    away.ballsFor += awayBallsFacedNorm;
    away.runsAgainst += result.homeRuns;
    away.ballsAgainst += homeBallsFacedNorm;

    home.netRunRate = calculateNetRunRate(home.runsFor, home.ballsFor, home.runsAgainst, home.ballsAgainst);
    away.netRunRate = calculateNetRunRate(away.runsFor, away.ballsFor, away.runsAgainst, away.ballsAgainst);
  }

  standingsMap.set(home.teamId, home);
  standingsMap.set(away.teamId, away);

  const updated = Array.from(standingsMap.values());

  // Deterministic sorting
  return updated.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.netRunRate !== a.netRunRate) return b.netRunRate - a.netRunRate;
    if (b.won !== a.won) return b.won - a.won;
    return a.teamId.localeCompare(b.teamId);
  });
}
