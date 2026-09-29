/**
 * CricOS Biomechanics Pitch Map (Length Zones + Beehive Crease Arrival) &
 * Interactive Monte Carlo "What-If" Win Probability & Chase Simulator
 */
export type PitchLengthZone = 'FULL_TOSS' | 'YORKER' | 'FULL_DRIVING' | 'GOOD_LENGTH' | 'SHORT_OF_GOOD' | 'BOUNCER';
export type PitchLineChannel = 'WIDE_OUTSIDE_OFF' | 'FIFTH_FOURTH_STUMP' | 'OFF_STUMP' | 'MIDDLE_STUMP' | 'LEG_STUMP' | 'DOWN_LEG';
export interface PitchDeliveryPoint {
    id: string;
    overBall: string;
    bowler: string;
    batter: string;
    speedKph: number;
    lengthMetersFromStumps: number;
    lineOffsetCmFromMiddle: number;
    lengthZone: PitchLengthZone;
    lineChannel: PitchLineChannel;
    outcome: 'DOT' | 'SINGLE' | 'BOUNDARY_4' | 'MAXIMUM_6' | 'WICKET';
    runs: number;
}
export interface WinProbabilitySimulationInput {
    targetScore: number;
    currentScore: number;
    wicketsLost: number;
    ballsRemaining: number;
    /** Optional "What-If" scenario delta for the next N balls */
    simulatedNextBalls?: number;
    simulatedNextRuns?: number;
    simulatedNextWickets?: number;
}
export interface WinProbabilitySimulationOutput {
    battingTeamWinPct: number;
    bowlingTeamWinPct: number;
    tieSuperOverPct: number;
    requiredRunRate: number;
    ballsRemainingAfterSim: number;
    runsNeededAfterSim: number;
    wicketsInHandAfterSim: number;
    projectedFinalScore: number;
    pressureIndex: number;
    pressureLabel: 'CALM_CONTROL' | 'BALANCED_CONTEST' | 'HIGH_PRESSURE' | 'EXTREME_CRUNCH';
}
export declare const SAMPLE_PITCH_MAP_DELIVERIES: PitchDeliveryPoint[];
export declare class PitchMapAndWinProbEngine {
    static classifyPitchLength(metersFromStumps: number): PitchLengthZone;
    static summarizeLengthDistribution(deliveries: PitchDeliveryPoint[]): Record<PitchLengthZone, {
        balls: number;
        runs: number;
        wickets: number;
        pct: number;
    }>;
    static simulateWinProbability(input: WinProbabilitySimulationInput): WinProbabilitySimulationOutput;
}
//# sourceMappingURL=pitch-map-win-prob.d.ts.map