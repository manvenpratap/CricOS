/**
 * apps/web/src/components/leaderboards.ts
 *
 * Tournament Player Leaderboards (Orange & Purple Caps)
 * Derived from Archive Specifications:
 * - 04_API_and_Engineering/08_Sprint_Ready_P0_Backlog_v1.docx (Story TMT-007: Leaderboard projection)
 * - 02_Product_Experience/03_UX_Blueprint_v2.docx (Competition & Standings)
 *
 * Computes and renders real-time batting and bowling statistics rankings
 * with Stitch design tokens and athletic typography.
 */
export interface BattingLeader {
    rank: number;
    playerId: string;
    name: string;
    teamName: string;
    matches: number;
    innings: number;
    runs: number;
    highScore: string;
    average: number;
    strikeRate: number;
    fours: number;
    sixes: number;
}
export interface BowlingLeader {
    rank: number;
    playerId: string;
    name: string;
    teamName: string;
    matches: number;
    overs: string;
    wickets: number;
    bestBowling: string;
    economy: number;
    maidens: number;
    dotBalls: number;
}
export declare function getDefaultBattingLeaders(): BattingLeader[];
export declare function getDefaultBowlingLeaders(): BowlingLeader[];
/**
 * Renders the Batting (Orange Cap) Leaderboard HTML.
 */
export declare function renderBattingLeaderboardHtml(leaders: BattingLeader[]): string;
/**
 * Renders the Bowling (Purple Cap) Leaderboard HTML.
 */
export declare function renderBowlingLeaderboardHtml(leaders: BowlingLeader[]): string;
//# sourceMappingURL=leaderboards.d.ts.map