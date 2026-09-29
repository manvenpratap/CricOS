import { ScoreEvent } from '@cricket-platform/scoring';
import { MatchResultSummary } from '@cricket-platform/domain';
export interface SimulatedPlayer {
    id: string;
    name: string;
    role: 'BATTER' | 'BOWLER' | 'ALL_ROUNDER' | 'WICKET_KEEPER';
    skillRating?: number;
}
export interface SimulatedTeam {
    id: string;
    name: string;
    players: SimulatedPlayer[];
}
export interface MatchSimulationConfig {
    matchId: string;
    homeTeam: SimulatedTeam;
    awayTeam: SimulatedTeam;
    oversPerInnings?: number;
    seed?: number;
}
export interface InningsSimulationResult {
    battingTeamId: string;
    bowlingTeamId: string;
    runs: number;
    wickets: number;
    ballsFaced: number;
    oversDisplay: string;
    allOut: boolean;
    deliveries: ScoreEvent[];
}
export interface SimulatedMatchResult {
    matchId: string;
    homeTeamId: string;
    awayTeamId: string;
    innings1: InningsSimulationResult;
    innings2: InningsSimulationResult;
    winnerId: string | null;
    isTie: boolean;
    margin: string;
    summary: MatchResultSummary;
}
export declare class SimulatedMatchEngine {
    private rngState;
    constructor(seed?: number);
    private nextRandom;
    simulateMatch(config: MatchSimulationConfig): SimulatedMatchResult;
    private simulateInnings;
}
//# sourceMappingURL=match-simulator.d.ts.map