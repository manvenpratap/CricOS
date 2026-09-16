export type DismissalKind = 'BOWLED' | 'CAUGHT' | 'LBW' | 'RUN_OUT' | 'STUMPED' | 'HIT_WICKET';

export type ShotZone = 
  | 'FINE_LEG' 
  | 'SQUARE_LEG' 
  | 'MID_WICKET' 
  | 'LONG_ON' 
  | 'LONG_OFF' 
  | 'EXTRA_COVER' 
  | 'POINT' 
  | 'THIRD_MAN';

export interface DismissalPayload {
  kind: DismissalKind;
  outBatterId: string;
  fielderName?: string;
  isStriker: boolean;
}

export interface ShotEvent {
  zone: ShotZone;
  runs: number;
  isBoundary: boolean;
  ballNumber: number;
}

export interface PartnershipState {
  batter1Runs: number;
  batter1Balls: number;
  batter2Runs: number;
  batter2Balls: number;
  totalRuns: number;
  totalBalls: number;
}

export function calculatePartnership(b1Runs: number, b1Balls: number, b2Runs: number, b2Balls: number): PartnershipState {
  return {
    batter1Runs: b1Runs,
    batter1Balls: b1Balls,
    batter2Runs: b2Runs,
    batter2Balls: b2Balls,
    totalRuns: b1Runs + b2Runs,
    totalBalls: b1Balls + b2Balls
  };
}

export const SHOT_ZONES_CONFIG: Array<{ id: ShotZone; label: string; angleDeg: number }> = [
  { id: 'THIRD_MAN', label: 'Third Man', angleDeg: 315 },
  { id: 'POINT', label: 'Point', angleDeg: 270 },
  { id: 'EXTRA_COVER', label: 'Cover / Extra Cover', angleDeg: 225 },
  { id: 'LONG_OFF', label: 'Long Off', angleDeg: 180 },
  { id: 'LONG_ON', label: 'Long On', angleDeg: 135 },
  { id: 'MID_WICKET', label: 'Mid Wicket', angleDeg: 90 },
  { id: 'SQUARE_LEG', label: 'Square Leg', angleDeg: 45 },
  { id: 'FINE_LEG', label: 'Fine Leg', angleDeg: 0 }
];

export function getDismissalLabel(kind: DismissalKind, fielder?: string): string {
  switch (kind) {
    case 'BOWLED':
      return 'b. Bowler';
    case 'CAUGHT':
      return fielder ? `c. ${fielder} b. Bowler` : 'c. & b. Bowler';
    case 'LBW':
      return 'lbw b. Bowler';
    case 'RUN_OUT':
      return fielder ? `run out (${fielder})` : 'run out';
    case 'STUMPED':
      return fielder ? `st. ${fielder} b. Bowler` : 'stumped';
    case 'HIT_WICKET':
      return 'hit wicket';
    default:
      return 'out';
  }
}
