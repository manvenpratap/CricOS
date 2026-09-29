export type DismissalKind = 'BOWLED' | 'CAUGHT' | 'LBW' | 'RUN_OUT' | 'STUMPED' | 'HIT_WICKET';
export type ShotZone = 'FINE_LEG' | 'SQUARE_LEG' | 'MID_WICKET' | 'LONG_ON' | 'LONG_OFF' | 'EXTRA_COVER' | 'POINT' | 'THIRD_MAN';
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
    distanceFraction: number;
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
 * Rotated 180° so the visualizer represents the standard broadcast view of the pitch:
 * - Batsman (Striker) stands at the TOP crease (North) facing DOWN towards the Bowler (South).
 * - Straight drives (Long Off, Long On) travel towards the BOTTOM.
 * - Behind the wicket (Third Man, Fine Leg) travel towards the TOP.
 * - For a Right-Handed Batsman (RHB):
 *   - OFF SIDE is on the LEFT (West, 180° to 360°)
 *   - LEG SIDE is on the RIGHT (East, 0° to 180°)
 */
export declare const SHOT_ZONES_CONFIG: Array<ShotZoneDefinition>;
/**
 * Returns zone definitions mirrored for Left-Handed Batsman (LHB).
 */
export declare function getShotZonesConfigForStance(isLhb: boolean): Array<ShotZoneDefinition>;
export declare function calculatePartnership(b1Runs: number, b1Balls: number, b2Runs: number, b2Balls: number): PartnershipState;
export declare function getDismissalLabel(kind: DismissalKind, fielder?: string): string;
/**
 * Calculates (x, y) coordinates for a shot given angle and distance fraction from crease.
 */
export declare function calculateShotCoordinates(angleDeg: number, distanceFraction: number, radius: number, centerX: number, centerY: number): {
    x: number;
    y: number;
};
/**
 * Realistic initial match trajectories for the live match simulation.
 * Angles rotated 180° to align with the standard broadcast pitch view (striker at top).
 */
export declare const DEFAULT_SHOT_TRAJECTORIES: ShotEvent[];
export interface BatterWagonStats {
    batterName: string;
    totalRuns: number;
    ballsFaced: number;
    fours: number;
    sixes: number;
    dots: number;
    singles: number;
    strikeRate: number;
    offSideRuns: number;
    legSideRuns: number;
    offSidePct: number;
    legSidePct: number;
    shotCount: number;
}
/**
 * Filters shots for a specific batsman or returns all partnership shots.
 */
export declare function filterShotsByBatter(shots: ShotEvent[], batterName?: string): ShotEvent[];
/**
 * Computes wagon wheel analytical statistics for an individual batsman or stand.
 */
export declare function calculateBatterWagonStats(shots: ShotEvent[], batterName?: string, isLhb?: boolean): BatterWagonStats;
//# sourceMappingURL=scoring-studio.d.ts.map