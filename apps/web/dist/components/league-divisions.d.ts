/**
 * apps/web/src/components/league-divisions.ts
 *
 * CricOS Multi-Division League Brackets & Promotion/Relegation Engine
 * Implements NRR calculation, tier ladders, playoff seeding, and season transitions.
 */
export type DivisionTier = 'PREMIER' | 'DIVISION_1' | 'DIVISION_2';
export type TeamSeasonStatus = 'CHAMPION' | 'PLAYOFFS' | 'RETAINED' | 'PROMOTED' | 'RELEGATED';
export interface DivisionTeamStats {
    teamId: string;
    teamName: string;
    played: number;
    won: number;
    lost: number;
    tied: number;
    noResult: number;
    runsScored: number;
    oversFaced: number;
    runsConceded: number;
    oversBowled: number;
    points: number;
    nrr: number;
    rank: number;
    status: TeamSeasonStatus;
}
export interface DivisionConfig {
    id: string;
    tier: DivisionTier;
    title: string;
    maxTeams: number;
    promotionSlots: number;
    relegationSlots: number;
    teams: DivisionTeamStats[];
}
export interface PlayoffBracket {
    qualifier1: {
        seed1: string;
        seed2: string;
    };
    eliminator: {
        seed3: string;
        seed4: string;
    };
    qualifier2: {
        tbd1: string;
        tbd2: string;
    };
    grandFinal: {
        finalist1: string;
        finalist2: string;
        prizePurseMinor: number;
    };
}
/**
 * Calculates exact Net Run Rate (NRR) per ICC Section 16 Playing Conditions.
 * NRR = (Runs Scored / Overs Faced) - (Runs Conceded / Overs Bowled)
 */
export declare function calculateNetRunRate(runsScored: number, oversFaced: number, runsConceded: number, oversBowled: number): number;
/**
 * Formats numeric NRR to standard signed 3-decimal string (e.g. "+1.420" or "-0.850").
 */
export declare function formatNrrString(nrr: number): string;
export declare class LeagueDivisionsManager {
    private divisions;
    constructor();
    private seedDefaultDivisions;
    recalculateAllStandings(): void;
    getDivisions(): DivisionConfig[];
    getPlayoffBracket(): PlayoffBracket;
    /**
     * Simulates full season rollover with automatic promotion and relegation.
     * Returns newly configured divisions for the upcoming season.
     */
    simulateSeasonTransition(): {
        promotedTeams: string[];
        relegatedTeams: string[];
        newDivisions: DivisionConfig[];
    };
    renderDivisionLaddersHtml(): string;
}
//# sourceMappingURL=league-divisions.d.ts.map