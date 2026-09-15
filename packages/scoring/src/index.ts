export type ExtraType = 'NONE' | 'WIDE' | 'NO_BALL' | 'BYE' | 'LEG_BYE' | 'PENALTY';

export interface ScoreEvent {
  client_event_id: string;
  sequence: number;
  event_type: 'DELIVERY' | 'INNINGS_START' | 'INNINGS_END' | 'OVER_END' | 'WICKET';
  bat_runs: number;
  extra_runs: number;
  extra_type: ExtraType;
  legal_ball: boolean;
  is_wicket?: boolean;
  wicket_type?: 'BOWLED' | 'CAUGHT' | 'LBW' | 'RUN_OUT' | 'STUMPED' | 'HIT_WICKET';
  player_out_id?: string;
  bowler_id?: string;
  striker_id?: string;
  non_striker_id?: string;
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
}

export function createInitialScoreState(target?: number): ScoreState {
  return {
    runs: 0,
    wickets: 0,
    legal_balls: 0,
    overs: 0,
    balls: 0,
    overs_display: '0.0',
    target,
    is_innings_closed: false
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

export function applyDelivery(state: ScoreState, event: ScoreEvent): ScoreState {
  if (state.is_innings_closed) {
    throw new Error('SCORE_INNINGS_ALREADY_CLOSED: Cannot score after innings close');
  }

  if (event.bat_runs < 0 || event.extra_runs < 0) {
    throw new Error('SCORE_INVALID_RUNS: Runs cannot be negative');
  }

  const runsToAdd = event.bat_runs + event.extra_runs;
  const newRuns = state.runs + runsToAdd;
  const newWickets = state.wickets + (event.is_wicket ? 1 : 0);
  const newLegalBalls = state.legal_balls + (event.legal_ball ? 1 : 0);
  const { overs, balls, display } = calculateOver(newLegalBalls);

  // Check if target chased down
  let isClosed: boolean = state.is_innings_closed;
  if (state.target !== undefined && newRuns >= state.target) {
    isClosed = true;
  }
  // Check if 10 wickets down (all out)
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
    is_innings_closed: isClosed
  };
}
