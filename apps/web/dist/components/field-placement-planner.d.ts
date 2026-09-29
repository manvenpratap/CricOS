/**
 * CricOS Interactive Tactical Field Placement & MCC Law 28.4 Powerplay Restriction Engine
 * Models 11-player fielding geometries, 30-yard circle legality, RHB/LHB mirroring,
 * and bowling plan run-saving efficiency telemetry.
 */
export type PowerplayPhase = 'PP1_OVERS_1_6' | 'MIDDLE_OVERS_7_15' | 'DEATH_OVERS_16_20';
export type BatterHand = 'RHB' | 'LHB';
export interface FielderNode {
    id: string;
    roleCode: string;
    positionName: string;
    /** Normalized polar angle in degrees (0 = straight down ground / Sight Screen, 90 = Off-side Cover for RHB, 270 = Leg-side Mid-Wicket for RHB) */
    angleDeg: number;
    /** Normalized radius from pitch center (0.0 to 1.0, where 0.52 is the 30-yard circle boundary) */
    radiusRatio: number;
    isLocked?: boolean;
}
export interface FieldValidationResult {
    isLegal: boolean;
    phase: PowerplayPhase;
    outsideCircleCount: number;
    maxAllowedOutsideCircle: number;
    behindSquareLegCount: number;
    maxAllowedBehindSquareLeg: number;
    violations: string[];
    tacticalSummary: string;
    runSavingEfficiencyPct: number;
}
export declare const THIRTY_YARD_CIRCLE_RATIO = 0.52;
export declare const FIELD_PRESETS: Record<string, {
    label: string;
    phase: PowerplayPhase;
    bowlingPlan: string;
    fielders: FielderNode[];
}>;
export declare class FieldPlacementPlannerEngine {
    static getMaxOutsideCircle(phase: PowerplayPhase): number;
    static mirrorFieldForBatterHand(fielders: FielderNode[], targetHand: BatterHand): FielderNode[];
    static validateFieldPlacement(fielders: FielderNode[], phase: PowerplayPhase, hand?: BatterHand): FieldValidationResult;
}
//# sourceMappingURL=field-placement-planner.d.ts.map