/**
 * CricOS Biomechanics Pitch Map (Length Zones + Beehive Crease Arrival) &
 * Interactive Monte Carlo "What-If" Win Probability & Chase Simulator
 */

export type PitchLengthZone =
  | 'FULL_TOSS'
  | 'YORKER'
  | 'FULL_DRIVING'
  | 'GOOD_LENGTH'
  | 'SHORT_OF_GOOD'
  | 'BOUNCER';

export type PitchLineChannel =
  | 'WIDE_OUTSIDE_OFF'
  | 'FIFTH_FOURTH_STUMP'
  | 'OFF_STUMP'
  | 'MIDDLE_STUMP'
  | 'LEG_STUMP'
  | 'DOWN_LEG';

export interface PitchDeliveryPoint {
  id: string;
  overBall: string;
  bowler: string;
  batter: string;
  speedKph: number;
  lengthMetersFromStumps: number; // 0m = popping crease, 20.12m = bowler crease
  lineOffsetCmFromMiddle: number; // negative = off side (for RHB), positive = leg side
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
  pressureIndex: number; // 0-100
  pressureLabel: 'CALM_CONTROL' | 'BALANCED_CONTEST' | 'HIGH_PRESSURE' | 'EXTREME_CRUNCH';
}

export const SAMPLE_PITCH_MAP_DELIVERIES: PitchDeliveryPoint[] = [
  {
    id: 'pm-1',
    overBall: '16.1',
    bowler: 'Jasprit Bumrah',
    batter: 'Virat Sharma',
    speedKph: 146.2,
    lengthMetersFromStumps: 1.8,
    lineOffsetCmFromMiddle: -8,
    lengthZone: 'YORKER',
    lineChannel: 'OFF_STUMP',
    outcome: 'DOT',
    runs: 0,
  },
  {
    id: 'pm-2',
    overBall: '16.2',
    bowler: 'Jasprit Bumrah',
    batter: 'Virat Sharma',
    speedKph: 144.8,
    lengthMetersFromStumps: 6.4,
    lineOffsetCmFromMiddle: -18,
    lengthZone: 'GOOD_LENGTH',
    lineChannel: 'FIFTH_FOURTH_STUMP',
    outcome: 'BOUNDARY_4',
    runs: 4,
  },
  {
    id: 'pm-3',
    overBall: '16.3',
    bowler: 'Jasprit Bumrah',
    batter: 'Virat Sharma',
    speedKph: 147.5,
    lengthMetersFromStumps: 9.8,
    lineOffsetCmFromMiddle: 4,
    lengthZone: 'BOUNCER',
    lineChannel: 'MIDDLE_STUMP',
    outcome: 'MAXIMUM_6',
    runs: 6,
  },
  {
    id: 'pm-4',
    overBall: '16.4',
    bowler: 'Jasprit Bumrah',
    batter: 'Hardik Patel',
    speedKph: 145.1,
    lengthMetersFromStumps: 6.1,
    lineOffsetCmFromMiddle: -4,
    lengthZone: 'GOOD_LENGTH',
    lineChannel: 'OFF_STUMP',
    outcome: 'WICKET',
    runs: 0,
  },
  {
    id: 'pm-5',
    overBall: '15.5',
    bowler: 'Rashid Khan',
    batter: 'Hardik Patel',
    speedKph: 96.4,
    lengthMetersFromStumps: 4.5,
    lineOffsetCmFromMiddle: -12,
    lengthZone: 'FULL_DRIVING',
    lineChannel: 'OFF_STUMP',
    outcome: 'BOUNDARY_4',
    runs: 4,
  },
  {
    id: 'pm-6',
    overBall: '15.6',
    bowler: 'Rashid Khan',
    batter: 'Virat Sharma',
    speedKph: 98.1,
    lengthMetersFromStumps: 5.8,
    lineOffsetCmFromMiddle: 0,
    lengthZone: 'GOOD_LENGTH',
    lineChannel: 'MIDDLE_STUMP',
    outcome: 'SINGLE',
    runs: 1,
  },
];

export class PitchMapAndWinProbEngine {
  public static classifyPitchLength(metersFromStumps: number): PitchLengthZone {
    if (metersFromStumps < 1.2) return 'FULL_TOSS';
    if (metersFromStumps < 2.6) return 'YORKER';
    if (metersFromStumps < 5.0) return 'FULL_DRIVING';
    if (metersFromStumps < 7.2) return 'GOOD_LENGTH';
    if (metersFromStumps < 9.0) return 'SHORT_OF_GOOD';
    return 'BOUNCER';
  }

  public static summarizeLengthDistribution(deliveries: PitchDeliveryPoint[]): Record<PitchLengthZone, { balls: number; runs: number; wickets: number; pct: number }> {
    const summary: Record<PitchLengthZone, { balls: number; runs: number; wickets: number; pct: number }> = {
      FULL_TOSS: { balls: 0, runs: 0, wickets: 0, pct: 0 },
      YORKER: { balls: 0, runs: 0, wickets: 0, pct: 0 },
      FULL_DRIVING: { balls: 0, runs: 0, wickets: 0, pct: 0 },
      GOOD_LENGTH: { balls: 0, runs: 0, wickets: 0, pct: 0 },
      SHORT_OF_GOOD: { balls: 0, runs: 0, wickets: 0, pct: 0 },
      BOUNCER: { balls: 0, runs: 0, wickets: 0, pct: 0 },
    };

    const total = deliveries.length || 1;
    for (const d of deliveries) {
      const bucket = summary[d.lengthZone];
      bucket.balls += 1;
      bucket.runs += d.runs;
      if (d.outcome === 'WICKET') bucket.wickets += 1;
    }

    for (const key of Object.keys(summary) as PitchLengthZone[]) {
      summary[key].pct = Number(((summary[key].balls / total) * 100).toFixed(1));
    }

    return summary;
  }

  public static simulateWinProbability(
    input: WinProbabilitySimulationInput
  ): WinProbabilitySimulationOutput {
    const simBalls = input.simulatedNextBalls ?? 0;
    const simRuns = input.simulatedNextRuns ?? 0;
    const simWickets = input.simulatedNextWickets ?? 0;

    const scoreAfter = input.currentScore + simRuns;
    const wicketsLostAfter = Math.min(10, input.wicketsLost + simWickets);
    const wicketsInHand = Math.max(0, 10 - wicketsLostAfter);
    const ballsLeft = Math.max(0, input.ballsRemaining - simBalls);
    const runsNeeded = Math.max(0, input.targetScore - scoreAfter);

    if (runsNeeded <= 0) {
      return {
        battingTeamWinPct: 100,
        bowlingTeamWinPct: 0,
        tieSuperOverPct: 0,
        requiredRunRate: 0,
        ballsRemainingAfterSim: ballsLeft,
        runsNeededAfterSim: 0,
        wicketsInHandAfterSim: wicketsInHand,
        projectedFinalScore: scoreAfter,
        pressureIndex: 5,
        pressureLabel: 'CALM_CONTROL',
      };
    }

    if (wicketsInHand === 0 || ballsLeft === 0) {
      return {
        battingTeamWinPct: 0,
        bowlingTeamWinPct: 100,
        tieSuperOverPct: 0,
        requiredRunRate: 99.9,
        ballsRemainingAfterSim: ballsLeft,
        runsNeededAfterSim: runsNeeded,
        wicketsInHandAfterSim: wicketsInHand,
        projectedFinalScore: scoreAfter,
        pressureIndex: 100,
        pressureLabel: 'EXTREME_CRUNCH',
      };
    }

    const rrr = Number(((runsNeeded / ballsLeft) * 6).toFixed(2));
    // Expected par run rate capacity given wickets in hand (higher wickets = higher ceiling)
    const resourceParRunRate = 6.8 + wicketsInHand * 0.52;
    const rateDelta = resourceParRunRate - rrr;

    // Logistic curve mapping rateDelta + wicket buffer to win probability
    const logit = rateDelta * 0.68 + (wicketsInHand - 5) * 0.22;
    const rawBatWin = 1 / (1 + Math.exp(-logit));

    const tiePct = Number(
      Math.max(0.8, Math.min(4.5, 4.2 - Math.abs(rateDelta) * 0.8)).toFixed(1)
    );
    const batWinPct = Number(
      Math.max(1.5, Math.min(98.0 - tiePct, rawBatWin * (100 - tiePct))).toFixed(1)
    );
    const bowlWinPct = Number((100 - batWinPct - tiePct).toFixed(1));

    const projectedFinalScore = Math.round(
      scoreAfter + (ballsLeft / 6) * Math.min(13.5, Math.max(5.5, resourceParRunRate * 0.92))
    );

    const pressureIndex = Math.round(
      Math.max(8, Math.min(99, 50 + (rrr - 8.5) * 8.5 + (5 - wicketsInHand) * 6))
    );

    let pressureLabel: WinProbabilitySimulationOutput['pressureLabel'] = 'BALANCED_CONTEST';
    if (pressureIndex < 35) pressureLabel = 'CALM_CONTROL';
    else if (pressureIndex < 62) pressureLabel = 'BALANCED_CONTEST';
    else if (pressureIndex < 82) pressureLabel = 'HIGH_PRESSURE';
    else pressureLabel = 'EXTREME_CRUNCH';

    return {
      battingTeamWinPct: batWinPct,
      bowlingTeamWinPct: bowlWinPct,
      tieSuperOverPct: tiePct,
      requiredRunRate: rrr,
      ballsRemainingAfterSim: ballsLeft,
      runsNeededAfterSim: runsNeeded,
      wicketsInHandAfterSim: wicketsInHand,
      projectedFinalScore,
      pressureIndex,
      pressureLabel,
    };
  }
}
