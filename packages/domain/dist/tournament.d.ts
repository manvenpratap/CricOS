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
    maxScheduledOvers?: number;
    winnerId?: string | null;
    isTie?: boolean;
    isNoResult?: boolean;
}
export interface ScheduledRoundRobinFixture {
    id: string;
    round: number;
    homeTeamId: string;
    awayTeamId: string;
}
export declare function calculatePoints(won: number, tied: number, noResult: number): number;
/**
 * Parses cricket overs notation (e.g. 19.4 or 20) into total legal deliveries.
 */
export declare function parseOversToBalls(overs: number | string): number;
/**
 * Formats total legal balls into standard cricket overs notation (e.g. 118 balls -> "19.4").
 */
export declare function formatBallsToOvers(balls: number): string;
/**
 * Computes official ICC/MCC Net Run Rate:
 * NRR = (Runs Scored / (Balls Faced / 6)) - (Runs Conceded / (Balls Bowled / 6))
 * Normalized to 3 decimal places.
 */
export declare function calculateNetRunRate(runsScored: number, ballsFaced: number, runsConceded: number, ballsBowled: number): number;
/**
 * Generates a balanced round-robin fixture bracket for N teams using the polygon circle method.
 * Handles even and odd numbers of teams (odd gets a bye).
 */
export declare function generateRoundRobinSchedule(teamIds: string[], rounds?: number): ScheduledRoundRobinFixture[];
/**
 * Initializes empty tournament standings for a list of teams.
 */
export declare function initializeStandings(teamIds: string[]): Standing[];
/**
 * Updates tournament standings after a completed match according to ICC tournament rules:
 * - If a team is bowled out, overs to take into account are the full scheduled overs.
 * - Sort order: 1. Points (DESC), 2. NRR (DESC), 3. Wins (DESC), 4. Team ID (ASC).
 */
export declare function updateTournamentStandings(currentStandings: Standing[], result: MatchResultSummary): Standing[];
//# sourceMappingURL=tournament.d.ts.map