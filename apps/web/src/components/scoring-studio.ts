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
  id: string;
  zone: ShotZone;
  runs: number;
  isBoundary: boolean;
  isSix: boolean;
  isWicket?: boolean;
  batterName: string;
  ballNumber: number;
  angleDeg: number;
  distanceFraction: number; // 0.0 (crease) to 1.0 (boundary), >1.0 for sixes
}

export interface PartnershipState {
  batter1Runs: number;
  batter1Balls: number;
  batter2Runs: number;
  batter2Balls: number;
  totalRuns: number;
  totalBalls: number;
}

export interface ShotZoneDefinition {
  id: ShotZone;
  label: string;
  shortLabel: string;
  angleDeg: number;
  sectorStartDeg: number;
  sectorEndDeg: number;
  side: 'OFF' | 'LEG';
  description: string;
}

/**
 * Factually accurate 8-zone cricket wagon wheel configuration.
 * Angles in degrees measured clockwise from North (0° = Straight towards Bowler / Long Off & Long On).
 * For a Right-Handed Batsman (RHB) facing North:
 * - 0° to 180° is the LEG SIDE (East)
 * - 180° to 360° is the OFF SIDE (West)
 */
export const SHOT_ZONES_CONFIG: Array<ShotZoneDefinition> = [
  {
    id: 'LONG_ON',
    label: 'Long On',
    shortLabel: 'Long On',
    angleDeg: 22.5,
    sectorStartDeg: 0,
    sectorEndDeg: 45,
    side: 'LEG',
    description: 'Straight on-side down the ground towards the boundary'
  },
  {
    id: 'MID_WICKET',
    label: 'Deep Mid Wicket',
    shortLabel: 'Mid Wkt',
    angleDeg: 67.5,
    sectorStartDeg: 45,
    sectorEndDeg: 90,
    side: 'LEG',
    description: 'Forward of square on the leg-side between long on and square leg'
  },
  {
    id: 'SQUARE_LEG',
    label: 'Deep Square Leg',
    shortLabel: 'Sq Leg',
    angleDeg: 112.5,
    sectorStartDeg: 90,
    sectorEndDeg: 135,
    side: 'LEG',
    description: 'Square of the wicket on the leg-side'
  },
  {
    id: 'FINE_LEG',
    label: 'Fine Leg',
    shortLabel: 'Fine Leg',
    angleDeg: 157.5,
    sectorStartDeg: 135,
    sectorEndDeg: 180,
    side: 'LEG',
    description: 'Behind square on the leg-side towards the boundary'
  },
  {
    id: 'THIRD_MAN',
    label: 'Third Man',
    shortLabel: 'Third Man',
    angleDeg: 202.5,
    sectorStartDeg: 180,
    sectorEndDeg: 225,
    side: 'OFF',
    description: 'Behind square on the off-side towards the boundary'
  },
  {
    id: 'POINT',
    label: 'Point / Backward Point',
    shortLabel: 'Point',
    angleDeg: 247.5,
    sectorStartDeg: 225,
    sectorEndDeg: 270,
    side: 'OFF',
    description: 'Square of the wicket on the off-side'
  },
  {
    id: 'EXTRA_COVER',
    label: 'Cover / Extra Cover',
    shortLabel: 'Cover',
    angleDeg: 292.5,
    sectorStartDeg: 270,
    sectorEndDeg: 315,
    side: 'OFF',
    description: 'Forward of square on the off-side between point and long off'
  },
  {
    id: 'LONG_OFF',
    label: 'Long Off',
    shortLabel: 'Long Off',
    angleDeg: 337.5,
    sectorStartDeg: 315,
    sectorEndDeg: 360,
    side: 'OFF',
    description: 'Straight off-side down the ground towards the boundary'
  }
];

/**
 * Returns zone definitions mirrored for Left-Handed Batsman (LHB).
 */
export function getShotZonesConfigForStance(isLhb: boolean): Array<ShotZoneDefinition> {
  if (!isLhb) return SHOT_ZONES_CONFIG;
  return SHOT_ZONES_CONFIG.map(zone => ({
    ...zone,
    angleDeg: (360 - zone.angleDeg) % 360,
    sectorStartDeg: (360 - zone.sectorEndDeg) % 360,
    sectorEndDeg: (360 - zone.sectorStartDeg) % 360,
    side: zone.side === 'OFF' ? 'LEG' : 'OFF'
  }));
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

/**
 * Calculates (x, y) coordinates for a shot given angle and distance fraction from crease.
 */
export function calculateShotCoordinates(
  angleDeg: number,
  distanceFraction: number,
  radius: number,
  centerX: number,
  centerY: number
): { x: number; y: number } {
  // Convert clockwise from North (0° = North, 90° = East) to standard math angle (0° = East, counterclockwise)
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  const dist = distanceFraction * radius;
  return {
    x: Math.round(centerX + dist * Math.cos(rad)),
    y: Math.round(centerY + dist * Math.sin(rad))
  };
}

/**
 * Realistic initial match trajectories for the live match simulation.
 */
export const DEFAULT_SHOT_TRAJECTORIES: ShotEvent[] = [
  // Virat Sharma (48* off 32: 4x4, 2x6)
  { id: 's1', zone: 'EXTRA_COVER', runs: 4, isBoundary: true, isSix: false, batterName: 'Virat Sharma', ballNumber: 4, angleDeg: 298, distanceFraction: 0.98 },
  { id: 's2', zone: 'EXTRA_COVER', runs: 4, isBoundary: true, isSix: false, batterName: 'Virat Sharma', ballNumber: 9, angleDeg: 288, distanceFraction: 0.99 },
  { id: 's3', zone: 'MID_WICKET', runs: 6, isBoundary: true, isSix: true, batterName: 'Virat Sharma', ballNumber: 14, angleDeg: 65, distanceFraction: 1.15 },
  { id: 's4', zone: 'LONG_ON', runs: 6, isBoundary: true, isSix: true, batterName: 'Virat Sharma', ballNumber: 21, angleDeg: 18, distanceFraction: 1.18 },
  { id: 's5', zone: 'POINT', runs: 4, isBoundary: true, isSix: false, batterName: 'Virat Sharma', ballNumber: 26, angleDeg: 250, distanceFraction: 0.97 },
  { id: 's6', zone: 'LONG_OFF', runs: 4, isBoundary: true, isSix: false, batterName: 'Virat Sharma', ballNumber: 30, angleDeg: 340, distanceFraction: 0.98 },
  { id: 's7', zone: 'SQUARE_LEG', runs: 1, isBoundary: false, isSix: false, batterName: 'Virat Sharma', ballNumber: 2, angleDeg: 105, distanceFraction: 0.65 },
  { id: 's8', zone: 'FINE_LEG', runs: 2, isBoundary: false, isSix: false, batterName: 'Virat Sharma', ballNumber: 7, angleDeg: 145, distanceFraction: 0.72 },
  { id: 's9', zone: 'THIRD_MAN', runs: 1, isBoundary: false, isSix: false, batterName: 'Virat Sharma', ballNumber: 11, angleDeg: 212, distanceFraction: 0.68 },
  { id: 's10', zone: 'MID_WICKET', runs: 2, isBoundary: false, isSix: false, batterName: 'Virat Sharma', ballNumber: 17, angleDeg: 78, distanceFraction: 0.75 },
  { id: 's11', zone: 'EXTRA_COVER', runs: 0, isBoundary: false, isSix: false, batterName: 'Virat Sharma', ballNumber: 1, angleDeg: 290, distanceFraction: 0.35 },
  { id: 's12', zone: 'POINT', runs: 0, isBoundary: false, isSix: false, batterName: 'Virat Sharma', ballNumber: 6, angleDeg: 255, distanceFraction: 0.38 },

  // Hardik Patel (18 off 12: 1x4, 1x6)
  { id: 's13', zone: 'MID_WICKET', runs: 6, isBoundary: true, isSix: true, batterName: 'Hardik Patel', ballNumber: 16, angleDeg: 72, distanceFraction: 1.14 },
  { id: 's14', zone: 'SQUARE_LEG', runs: 4, isBoundary: true, isSix: false, batterName: 'Hardik Patel', ballNumber: 23, angleDeg: 118, distanceFraction: 0.98 },
  { id: 's15', zone: 'LONG_ON', runs: 2, isBoundary: false, isSix: false, batterName: 'Hardik Patel', ballNumber: 18, angleDeg: 28, distanceFraction: 0.78 },
  { id: 's16', zone: 'FINE_LEG', runs: 1, isBoundary: false, isSix: false, batterName: 'Hardik Patel', ballNumber: 20, angleDeg: 150, distanceFraction: 0.62 },
  { id: 's17', zone: 'EXTRA_COVER', runs: 1, isBoundary: false, isSix: false, batterName: 'Hardik Patel', ballNumber: 27, angleDeg: 305, distanceFraction: 0.58 },
  { id: 's18', zone: 'MID_WICKET', runs: 0, isBoundary: false, isSix: false, batterName: 'Hardik Patel', ballNumber: 15, angleDeg: 82, distanceFraction: 0.4 }
];
