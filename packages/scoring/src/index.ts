export type ExtraType = 'NONE' | 'WIDE' | 'NO_BALL' | 'BYE' | 'LEG_BYE' | 'PENALTY';
export type DismissalKind = 'BOWLED' | 'CAUGHT' | 'LBW' | 'RUN_OUT' | 'STUMPED' | 'HIT_WICKET' | 'RETIRED_OUT' | 'OBSTRUCTING';

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
  is_innings_closed: boolean;
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

export function createInitialScoreState(
  target?: number,
  strikerId?: string,
  nonStrikerId?: string,
  openingBowlerId?: string
): ScoreState {
  const batters: Record<string, BatterScorecard> = {};
  if (strikerId) {
    batters[strikerId] = {
      playerId: strikerId,
      runs: 0,
      ballsFaced: 0,
      fours: 0,
      sixes: 0,
      strikeRate: 0,
      isOut: false
    };
  }
  if (nonStrikerId) {
    batters[nonStrikerId] = {
      playerId: nonStrikerId,
      runs: 0,
      ballsFaced: 0,
      fours: 0,
      sixes: 0,
      strikeRate: 0,
      isOut: false
    };
  }

  const bowlers: Record<string, BowlerFigures> = {};
  if (openingBowlerId) {
    bowlers[openingBowlerId] = {
      bowlerId: openingBowlerId,
      legalBalls: 0,
      oversDisplay: '0.0',
      maidens: 0,
      runsConceded: 0,
      wickets: 0,
      wides: 0,
      noBalls: 0,
      economyRate: 0,
      currentOverBalls: 0,
      currentOverRuns: 0
    };
  }

  return {
    runs: 0,
    wickets: 0,
    legal_balls: 0,
    overs: 0,
    balls: 0,
    overs_display: '0.0',
    target,
    is_innings_closed: false,
    striker_id: strikerId,
    non_striker_id: nonStrikerId,
    current_bowler_id: openingBowlerId,
    previous_bowler_id: undefined,
    batters,
    bowlers,
    fall_of_wickets: [],
    extras: {
      wides: 0,
      no_balls: 0,
      byes: 0,
      leg_byes: 0,
      penalties: 0,
      total: 0
    }
  };
}

export function calculateOver(legal_balls: number): { overs: number; balls: number; display: string } {
  if (legal_balls < 0) throw new Error('SCORE_INVALID_LEGAL_BALLS');
  const overs = Math.floor(legal_balls / 6);
  const balls = legal_balls % 6;
  return {
    overs,
    balls,
    display: `${overs}.${balls}`
  };
}

export function calculateRunRate(runs: number, legal_balls: number): number {
  if (legal_balls <= 0) return 0;
  return Number(((runs / legal_balls) * 6).toFixed(2));
}

export function calculateEconomy(runsConceded: number, legalBalls: number): number {
  if (legalBalls <= 0) return 0;
  return Number(((runsConceded / legalBalls) * 6).toFixed(2));
}

export function calculateStrikeRate(runs: number, ballsFaced: number): number {
  if (ballsFaced <= 0) return 0;
  return Number(((runs / ballsFaced) * 100).toFixed(2));
}

export function applyDelivery(state: ScoreState, event: ScoreEvent): ScoreState {
  if (state.is_innings_closed) {
    throw new Error('SCORE_INNINGS_ALREADY_CLOSED: Cannot score after innings close');
  }

  if (event.bat_runs < 0 || event.extra_runs < 0) {
    throw new Error('SCORE_INVALID_RUNS: Runs cannot be negative');
  }

  // 1. Overall runs & balls accounting
  const runsToAdd = event.bat_runs + event.extra_runs;
  const newRuns = state.runs + runsToAdd;
  const isLegal = event.legal_ball && event.extra_type !== 'WIDE' && event.extra_type !== 'NO_BALL';
  const newLegalBalls = state.legal_balls + (isLegal ? 1 : 0);
  const { overs, balls, display } = calculateOver(newLegalBalls);

  // 2. Extras accounting
  const extras = { ...state.extras };
  if (event.extra_type === 'WIDE') {
    extras.wides += event.extra_runs;
    extras.total += event.extra_runs;
  } else if (event.extra_type === 'NO_BALL') {
    extras.no_balls += event.extra_runs;
    extras.total += event.extra_runs;
  } else if (event.extra_type === 'BYE') {
    extras.byes += event.extra_runs;
    extras.total += event.extra_runs;
  } else if (event.extra_type === 'LEG_BYE') {
    extras.leg_byes += event.extra_runs;
    extras.total += event.extra_runs;
  } else if (event.extra_type === 'PENALTY') {
    extras.penalties += event.extra_runs;
    extras.total += event.extra_runs;
  }

  // 3. Batter scorecard tracking
  const batters: Record<string, BatterScorecard> = { ...state.batters };
  const currentStrikerId = event.striker_id || state.striker_id;
  const currentNonStrikerId = event.non_striker_id || state.non_striker_id;

  if (currentStrikerId) {
    const existing = batters[currentStrikerId] || {
      playerId: currentStrikerId,
      runs: 0,
      ballsFaced: 0,
      fours: 0,
      sixes: 0,
      strikeRate: 0,
      isOut: false
    };

    // Batter faces ball on any delivery except wide
    const ballFaced = event.extra_type !== 'WIDE';
    const newBatterRuns = existing.runs + event.bat_runs;
    const newBallsFaced = existing.ballsFaced + (ballFaced ? 1 : 0);

    batters[currentStrikerId] = {
      ...existing,
      runs: newBatterRuns,
      ballsFaced: newBallsFaced,
      fours: existing.fours + (event.bat_runs === 4 ? 1 : 0),
      sixes: existing.sixes + (event.bat_runs === 6 ? 1 : 0),
      strikeRate: calculateStrikeRate(newBatterRuns, newBallsFaced)
    };
  }

  // 4. Bowler spell tracking
  const bowlers: Record<string, BowlerFigures> = { ...state.bowlers };
  const currentBowlerId = event.bowler_id || state.current_bowler_id;

  let bowlerOverComplete = false;
  if (currentBowlerId) {
    const existing = bowlers[currentBowlerId] || {
      bowlerId: currentBowlerId,
      legalBalls: 0,
      oversDisplay: '0.0',
      maidens: 0,
      runsConceded: 0,
      wickets: 0,
      wides: 0,
      noBalls: 0,
      economyRate: 0,
      currentOverBalls: 0,
      currentOverRuns: 0
    };

    // Bowler is charged for bat runs, wides, and no-balls, but NOT byes or leg-byes
    const runsChargedToBowler = event.bat_runs +
      (event.extra_type === 'WIDE' || event.extra_type === 'NO_BALL' ? event.extra_runs : 0);

    const bowlerLegalBalls = existing.legalBalls + (isLegal ? 1 : 0);
    const bowlerRunsConceded = existing.runsConceded + runsChargedToBowler;
    const overBalls = existing.currentOverBalls + (isLegal ? 1 : 0);
    const overRuns = existing.currentOverRuns + runsChargedToBowler;

    let maidens = existing.maidens;
    let resetOverBalls = overBalls;
    let resetOverRuns = overRuns;

    // Check if over completed (6 legal balls)
    if (isLegal && balls === 0 && newLegalBalls > 0 && newLegalBalls % 6 === 0) {
      bowlerOverComplete = true;
      if (overRuns === 0 && overBalls === 6) {
        maidens += 1;
      }
      resetOverBalls = 0;
      resetOverRuns = 0;
    }

    // Wicket credited to bowler if not RUN_OUT or OBSTRUCTING
    const isBowlerWicket = event.is_wicket &&
      event.wicket_type !== 'RUN_OUT' &&
      event.wicket_type !== 'RETIRED_OUT' &&
      event.wicket_type !== 'OBSTRUCTING';

    bowlers[currentBowlerId] = {
      ...existing,
      legalBalls: bowlerLegalBalls,
      oversDisplay: calculateOver(bowlerLegalBalls).display,
      maidens,
      runsConceded: bowlerRunsConceded,
      wickets: existing.wickets + (isBowlerWicket ? 1 : 0),
      wides: existing.wides + (event.extra_type === 'WIDE' ? 1 : 0),
      noBalls: existing.noBalls + (event.extra_type === 'NO_BALL' ? 1 : 0),
      economyRate: calculateEconomy(bowlerRunsConceded, bowlerLegalBalls),
      currentOverBalls: resetOverBalls,
      currentOverRuns: resetOverRuns
    };
  }

  // 5. Wicket dismissal & Fall of Wickets
  const newWickets = state.wickets + (event.is_wicket ? 1 : 0);
  const fallOfWickets = [...state.fall_of_wickets];

  let nextStriker = currentStrikerId;
  let nextNonStriker = currentNonStrikerId;

  if (event.is_wicket) {
    const outPlayerId = event.player_out_id || currentStrikerId;
    if (outPlayerId && batters[outPlayerId]) {
      batters[outPlayerId] = {
        ...batters[outPlayerId]!,
        isOut: true,
        dismissal: {
          kind: event.wicket_type || 'BOWLED',
          bowlerId: currentBowlerId,
          description: `${event.wicket_type || 'Bowled'} b ${currentBowlerId || 'bowler'}`
        }
      };
    }

    if (outPlayerId) {
      fallOfWickets.push({
        wicketNumber: newWickets,
        score: newRuns,
        overs: display,
        playerOutId: outPlayerId
      });
    }

    // New batter takes crease
    if (event.next_batter_id) {
      batters[event.next_batter_id] = {
        playerId: event.next_batter_id,
        runs: 0,
        ballsFaced: 0,
        fours: 0,
        sixes: 0,
        strikeRate: 0,
        isOut: false
      };

      if (outPlayerId === currentStrikerId) {
        nextStriker = event.next_batter_id;
      } else {
        nextNonStriker = event.next_batter_id;
      }
    }
  }

  // 6. Strike rotation rules (MCC Law 18)
  // Odd runs (1, 3, 5): swap striker and non-striker
  const physicalRuns = event.bat_runs +
    (event.extra_type === 'BYE' || event.extra_type === 'LEG_BYE' ? event.extra_runs : 0);

  if (physicalRuns % 2 === 1) {
    const temp = nextStriker;
    nextStriker = nextNonStriker;
    nextNonStriker = temp;
  }

  // Over completion (after 6 legal deliveries): swap striker and non-striker
  if (isLegal && balls === 0 && newLegalBalls > 0 && newLegalBalls % 6 === 0) {
    const temp = nextStriker;
    nextStriker = nextNonStriker;
    nextNonStriker = temp;
  }

  // 7. Check innings conclusion conditions
  let isClosed: boolean = state.is_innings_closed;
  if (state.target !== undefined && newRuns >= state.target) {
    isClosed = true;
  }
  if (newWickets >= 10) {
    isClosed = true;
  }

  return {
    runs: newRuns,
    wickets: newWickets,
    legal_balls: newLegalBalls,
    overs,
    balls,
    overs_display: display,
    target: state.target,
    is_innings_closed: isClosed,
    striker_id: nextStriker,
    non_striker_id: nextNonStriker,
    current_bowler_id: currentBowlerId,
    previous_bowler_id: bowlerOverComplete ? currentBowlerId : state.previous_bowler_id,
    batters,
    bowlers,
    fall_of_wickets: fallOfWickets,
    extras
  };
}
