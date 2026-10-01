export type ExtraType = 'NONE' | 'WIDE' | 'NO_BALL' | 'BYE' | 'LEG_BYE' | 'PENALTY';
export type DismissalKind = 'BOWLED' | 'CAUGHT' | 'LBW' | 'RUN_OUT' | 'STUMPED' | 'HIT_WICKET' | 'RETIRED_OUT' | 'RETIRED_HURT' | 'OBSTRUCTING' | 'HIT_BALL_TWICE' | 'TIMED_OUT';
export interface ScoreEvent {
    client_event_id: string;
    sequence: number;
    event_type: 'DELIVERY' | 'INNINGS_START' | 'INNINGS_END' | 'OVER_END' | 'WICKET';
    bat_runs: number;
    extra_runs: number;
    extra_type: ExtraType;
    legal_ball: boolean;
    is_wicket?: boolean;
    wicket_type?: DismissalKind;
    player_out_id?: string;
    bowler_id?: string;
    striker_id?: string;
    non_striker_id?: string;
    next_batter_id?: string;
    fielder_id?: string;
    is_free_hit?: boolean;
    shot_zone?: string;
}
export interface BatterScorecard {
    playerId: string;
    name?: string;
    runs: number;
    ballsFaced: number;
    fours: number;
    sixes: number;
    strikeRate: number;
    isOut: boolean;
    dismissal?: {
        kind: DismissalKind;
        bowlerId?: string;
        fielderId?: string;
        description: string;
    };
}
export interface BowlerFigures {
    bowlerId: string;
    name?: string;
    legalBalls: number;
    oversDisplay: string;
    maidens: number;
    runsConceded: number;
    wickets: number;
    wides: number;
    noBalls: number;
    economyRate: number;
    currentOverBalls: number;
    currentOverRuns: number;
}
export interface FallOfWicket {
    wicketNumber: number;
    score: number;
    overs: string;
    playerOutId: string;
}
export interface ScoreState {
    runs: number;
    wickets: number;
    legal_balls: number;
    overs: number;
    balls: number;
    overs_display: string;
    target?: number;
    max_overs?: number;
    is_innings_closed: boolean;
    is_match_completed?: boolean;
    match_result?: string;
    winner_id?: string;
    margin?: string;
    is_free_hit?: boolean;
    striker_id?: string;
    non_striker_id?: string;
    current_bowler_id?: string;
    previous_bowler_id?: string;
    batters: Record<string, BatterScorecard>;
    bowlers: Record<string, BowlerFigures>;
    fall_of_wickets: FallOfWicket[];
    extras: {
        wides: number;
        no_balls: number;
        byes: number;
        leg_byes: number;
        penalties: number;
        total: number;
    };
}
export declare function createInitialScoreState(target?: number, strikerId?: string, nonStrikerId?: string, openingBowlerId?: string): ScoreState;
export declare function calculateOver(legal_balls: number): {
    overs: number;
    balls: number;
    display: string;
};
export declare function calculateRunRate(runs: number, legal_balls: number): number;
export declare function calculateEconomy(runsConceded: number, legalBalls: number): number;
export declare function calculateStrikeRate(runs: number, ballsFaced: number): number;
export declare function applyDelivery(state: ScoreState, event: ScoreEvent): ScoreState;
export declare function undoDelivery(events: ScoreEvent[], initial?: ScoreState): {
    state: ScoreState;
    undoneEvent: ScoreEvent | null;
};
export declare function swapStrike(state: ScoreState): ScoreState;
export declare function changeBowler(state: ScoreState, nextBowlerId: string, enforceConsecutiveRule?: boolean): ScoreState;
export declare function closeInnings(state: ScoreState, target?: number, resultText?: string): ScoreState;
export declare function concludeMatch(state: ScoreState, winnerId?: string, resultText?: string, margin?: string): ScoreState;
export interface IccCricketLawItem {
    id: string;
    law: string;
    title: string;
    category: string;
    icon: string;
    badge: string;
    summary: string;
    scorerRules: string[];
    systemEnforcement: string;
    quickActionText?: string;
    quickAction?: string;
}
export declare const ICC_CRICKET_LAWS_DIRECTORY: IccCricketLawItem[];
//# sourceMappingURL=index.d.ts.map