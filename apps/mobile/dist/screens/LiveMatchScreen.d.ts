export interface BatterState {
    playerId: string;
    name: string;
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    isStriker: boolean;
}
export interface BowlerState {
    playerId: string;
    name: string;
    overs: number;
    ballsThisOver: number;
    maidens: number;
    runsConceded: number;
    wickets: number;
}
export interface FallOfWicket {
    wicketNumber: number;
    playerOut: string;
    runsAtDismissal: number;
    overNumber: string;
}
export interface DeliveryInput {
    runs: number;
    isExtra?: boolean;
    extraType?: 'WIDE' | 'NO_BALL' | 'BYE' | 'LEG_BYE';
    isWicket?: boolean;
    wicketType?: 'BOWLED' | 'CAUGHT' | 'LBW' | 'RUN_OUT' | 'STUMPED';
    dismissedPlayerId?: string;
    newBatterId?: string;
    newBatterName?: string;
}
export interface LiveMatchScreenState {
    matchId: string;
    battingTeam: string;
    bowlingTeam: string;
    totalRuns: number;
    totalWickets: number;
    legalBalls: number;
    striker: BatterState;
    nonStriker: BatterState;
    bowler: BowlerState;
    currentOverDeliveries: string[];
    fallOfWickets: FallOfWicket[];
    isOverComplete: boolean;
}
export declare class LiveMatchScreenController {
    private state;
    private history;
    constructor(initialState?: LiveMatchScreenState);
    getState(): LiveMatchScreenState;
    getStriker(): BatterState;
    getNonStriker(): BatterState;
    getBowler(): BowlerState;
    getFormattedScore(): string;
    recordDelivery(delivery: DeliveryInput): LiveMatchScreenState;
    rotateStrike(): void;
    startNewOver(newBowler: BowlerState): void;
    undo(): LiveMatchScreenState | null;
    renderMobileHtml(userRole?: string, activeChart?: string): string;
}
//# sourceMappingURL=LiveMatchScreen.d.ts.map