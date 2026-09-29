/**
 * CricOS Match Analytics Chart Engine
 * Zero-dependency, responsive SVG generators for match run progression and over bar analysis.
 */
export interface WormDataPoint {
    over: number;
    runs: number;
    isWicket?: boolean;
}
export interface ManhattanOverData {
    overNumber: number;
    runs: number;
    wickets: number;
    isMaiden?: boolean;
}
/**
 * Generates an SVG Worm Chart comparing Team 1 and Team 2 run progressions
 */
export declare function renderWormChartSvg(team1Runs: WormDataPoint[], team2Runs: WormDataPoint[], options?: {
    width?: number;
    height?: number;
    team1Color?: string;
    team2Color?: string;
    team1Name?: string;
    team2Name?: string;
}): string;
/**
 * Generates an SVG Manhattan Bar Chart displaying runs scored per over
 */
export declare function renderManhattanChartSvg(overs: ManhattanOverData[], options?: {
    width?: number;
    height?: number;
    barColor?: string;
    wicketColor?: string;
}): string;
//# sourceMappingURL=match-charts.d.ts.map