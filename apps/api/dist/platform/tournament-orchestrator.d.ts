import { Standing, ProviderTrustState } from '@cricket-platform/domain';
import { JournalEntry } from '@cricket-platform/commercial';
import { SimulatedMatchResult } from './match-simulator.js';
export interface TournamentOrchestratorConfig {
    tournamentId?: string;
    tournamentName?: string;
    teamCount?: number;
    oversPerInnings?: number;
    enableLiveBroadcast?: boolean;
    seed?: number;
}
export interface FixtureExecutionReport {
    fixtureId: string;
    round: number;
    homeTeam: string;
    awayTeam: string;
    matchResult: SimulatedMatchResult;
    journalEntry: JournalEntry;
}
export interface TournamentOrchestrationResult {
    tournamentId: string;
    name: string;
    totalTeams: number;
    totalMatches: number;
    totalDeliveries: number;
    totalRuns: number;
    totalWickets: number;
    durationMs: number;
    throughputDeliveriesPerSec: number;
    fixtures: FixtureExecutionReport[];
    finalStandings: Standing[];
    ledgerSummary: {
        totalEntries: number;
        totalDebitMinor: number;
        totalCreditMinor: number;
        isBalanced: boolean;
    };
    providerTrustSummary: {
        providerId: string;
        role: string;
        bayesianRating: number;
        trustState: ProviderTrustState;
    }[];
}
export declare class TournamentOrchestrator {
    private config;
    constructor(config?: TournamentOrchestratorConfig);
    orchestrate(): Promise<TournamentOrchestrationResult>;
    private generateSyntheticTeams;
}
//# sourceMappingURL=tournament-orchestrator.d.ts.map