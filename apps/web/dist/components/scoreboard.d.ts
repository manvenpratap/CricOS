export interface BatterStats {
    id: string;
    name: string;
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    isStriker?: boolean;
}
export interface BowlerStats {
    id: string;
    name: string;
    overs: number;
    maidens: number;
    runsConceded: number;
    wickets: number;
}
export interface DeliveryChip {
    ballNumber: number;
    display: string;
    type: 'DOT' | 'RUNS' | 'BOUNDARY_FOUR' | 'MAXIMUM_SIX' | 'WICKET' | 'EXTRA';
}
export declare function calculateStrikeRate(runs: number, balls: number): string;
export declare function calculateEconomy(runs: number, overs: number): string;
export declare function parseDeliveryToChip(delivery: {
    runs: number;
    isWicket?: boolean;
    isExtra?: boolean;
    extraType?: string;
}): DeliveryChip;
export declare function renderDeliveryChipHtml(chip: DeliveryChip): string;
export declare function renderBatterCardHtml(batter: BatterStats, isStriker: boolean): string;
export declare function renderBowlerCardHtml(bowler: BowlerStats): string;
//# sourceMappingURL=scoreboard.d.ts.map