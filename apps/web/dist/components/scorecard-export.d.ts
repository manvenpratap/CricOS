/**
 * CricOS Scorecard Export Engine
 * Generates structured CSV and printable HTML match sheets for tournament archives.
 */
export interface BatterScorecardEntry {
    name: string;
    dismissal: string;
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    strikeRate: number;
}
export interface BowlerScorecardEntry {
    name: string;
    overs: string;
    maidens: number;
    runs: number;
    wickets: number;
    economyRate: number;
}
export interface MatchScorecardData {
    matchId: string;
    matchTitle: string;
    innings1Team: string;
    innings2Team: string;
    innings1Score: string;
    innings2Score: string;
    result: string;
    batters: BatterScorecardEntry[];
    bowlers: BowlerScorecardEntry[];
    fallOfWickets: string[];
    extras: {
        wides: number;
        noBalls: number;
        byes: number;
        legByes: number;
        total: number;
    };
}
export declare function generateScorecardCsv(data: MatchScorecardData): string;
export declare function generatePrintableScorecardHtml(data: MatchScorecardData): string;
//# sourceMappingURL=scorecard-export.d.ts.map