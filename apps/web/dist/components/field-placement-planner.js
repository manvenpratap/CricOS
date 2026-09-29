/**
 * CricOS Interactive Tactical Field Placement & MCC Law 28.4 Powerplay Restriction Engine
 * Models 11-player fielding geometries, 30-yard circle legality, RHB/LHB mirroring,
 * and bowling plan run-saving efficiency telemetry.
 */
export const THIRTY_YARD_CIRCLE_RATIO = 0.52;
export const FIELD_PRESETS = {
    POWERPLAY_ATTACK: {
        label: '⚡ Powerplay Attacking (2 Slips + Gully)',
        phase: 'PP1_OVERS_1_6',
        bowlingPlan: 'Good Length 4th Stump (Outswing)',
        fielders: [
            { id: 'f-wk', roleCode: 'WK', positionName: 'Wicketkeeper', angleDeg: 180, radiusRatio: 0.18, isLocked: true },
            { id: 'f-bwl', roleCode: 'BWL', positionName: 'Bowler', angleDeg: 0, radiusRatio: 0.22, isLocked: true },
            { id: 'f-1', roleCode: '1SL', positionName: 'First Slip', angleDeg: 164, radiusRatio: 0.24 },
            { id: 'f-2', roleCode: '2SL', positionName: 'Second Slip', angleDeg: 154, radiusRatio: 0.25 },
            { id: 'f-3', roleCode: 'GUL', positionName: 'Gully', angleDeg: 132, radiusRatio: 0.30 },
            { id: 'f-4', roleCode: 'PT', positionName: 'Backward Point', angleDeg: 108, radiusRatio: 0.42 },
            { id: 'f-5', roleCode: 'COV', positionName: 'Extra Cover', angleDeg: 68, radiusRatio: 0.45 },
            { id: 'f-6', roleCode: 'MOFF', positionName: 'Mid-Off', angleDeg: 28, radiusRatio: 0.46 },
            { id: 'f-7', roleCode: 'MON', positionName: 'Mid-On', angleDeg: 332, radiusRatio: 0.46 },
            { id: 'f-8', roleCode: '3M', positionName: 'Third Man (Deep)', angleDeg: 142, radiusRatio: 0.86 },
            { id: 'f-9', roleCode: 'FLEG', positionName: 'Fine Leg (Deep)', angleDeg: 215, radiusRatio: 0.86 },
        ],
    },
    MIDDLE_SPIN_TRAP: {
        label: '🛡️ Middle Overs Spin Trap (Catching Ring + Boundary Riders)',
        phase: 'MIDDLE_OVERS_7_15',
        bowlingPlan: 'Tossed Up Flight on Middle & Off',
        fielders: [
            { id: 'f-wk', roleCode: 'WK', positionName: 'Wicketkeeper (Up)', angleDeg: 180, radiusRatio: 0.12, isLocked: true },
            { id: 'f-bwl', roleCode: 'BWL', positionName: 'Spinner', angleDeg: 0, radiusRatio: 0.20, isLocked: true },
            { id: 'f-1', roleCode: 'SLG', positionName: 'Short Leg', angleDeg: 245, radiusRatio: 0.18 },
            { id: 'f-2', roleCode: 'SLIP', positionName: 'First Slip', angleDeg: 162, radiusRatio: 0.20 },
            { id: 'f-3', roleCode: 'PT', positionName: 'Point', angleDeg: 95, radiusRatio: 0.42 },
            { id: 'f-4', roleCode: 'COV', positionName: 'Cover', angleDeg: 65, radiusRatio: 0.44 },
            { id: 'f-5', roleCode: 'MWK', positionName: 'Short Mid-Wicket', angleDeg: 292, radiusRatio: 0.38 },
            { id: 'f-6', roleCode: 'LOFF', positionName: 'Long-Off (Deep)', angleDeg: 24, radiusRatio: 0.88 },
            { id: 'f-7', roleCode: 'LON', positionName: 'Long-On (Deep)', angleDeg: 336, radiusRatio: 0.88 },
            { id: 'f-8', roleCode: 'DMW', positionName: 'Deep Mid-Wicket', angleDeg: 288, radiusRatio: 0.88 },
            { id: 'f-9', roleCode: 'DCV', positionName: 'Deep Extra Cover', angleDeg: 62, radiusRatio: 0.86 },
        ],
    },
    DEATH_YORKER_DEFENSE: {
        label: '🔥 Death Overs Yorker Defense (5 Boundary Riders)',
        phase: 'DEATH_OVERS_16_20',
        bowlingPlan: 'Wide Toe-Crushing Yorker (6th Stump)',
        fielders: [
            { id: 'f-wk', roleCode: 'WK', positionName: 'Wicketkeeper', angleDeg: 180, radiusRatio: 0.20, isLocked: true },
            { id: 'f-bwl', roleCode: 'BWL', positionName: 'Death Pacer', angleDeg: 0, radiusRatio: 0.22, isLocked: true },
            { id: 'f-1', roleCode: 'S3M', positionName: 'Short Third Man', angleDeg: 138, radiusRatio: 0.42 },
            { id: 'f-2', roleCode: 'COV', positionName: 'Cover', angleDeg: 72, radiusRatio: 0.45 },
            { id: 'f-3', roleCode: 'MWK', positionName: 'Mid-Wicket (In)', angleDeg: 295, radiusRatio: 0.44 },
            { id: 'f-4', roleCode: 'SFL', positionName: 'Short Fine Leg', angleDeg: 218, radiusRatio: 0.40 },
            { id: 'f-5', roleCode: 'LOFF', positionName: 'Long-Off (Deep)', angleDeg: 22, radiusRatio: 0.90 },
            { id: 'f-6', roleCode: 'LON', positionName: 'Long-On (Deep)', angleDeg: 338, radiusRatio: 0.90 },
            { id: 'f-7', roleCode: 'DPT', positionName: 'Deep Point', angleDeg: 94, radiusRatio: 0.90 },
            { id: 'f-8', roleCode: 'DCV', positionName: 'Deep Cover', angleDeg: 56, radiusRatio: 0.88 },
            { id: 'f-9', roleCode: 'DMW', positionName: 'Deep Square Leg', angleDeg: 268, radiusRatio: 0.88 },
        ],
    },
};
export class FieldPlacementPlannerEngine {
    static getMaxOutsideCircle(phase) {
        switch (phase) {
            case 'PP1_OVERS_1_6':
                return 2;
            case 'MIDDLE_OVERS_7_15':
                return 4;
            case 'DEATH_OVERS_16_20':
                return 5;
        }
    }
    static mirrorFieldForBatterHand(fielders, targetHand) {
        if (targetHand === 'RHB') {
            return fielders.map((f) => ({ ...f }));
        }
        // Mirror horizontally across the 0-180 degree axis for Left-Handed Batter
        return fielders.map((f) => ({
            ...f,
            angleDeg: (360 - f.angleDeg) % 360,
        }));
    }
    static validateFieldPlacement(fielders, phase, hand = 'RHB') {
        const maxOutside = this.getMaxOutsideCircle(phase);
        const maxBehindSquareLeg = 2; // MCC Law 28.4
        let outsideCount = 0;
        let behindSquareLegCount = 0;
        for (const f of fielders) {
            if (f.isLocked)
                continue;
            if (f.radiusRatio > THIRTY_YARD_CIRCLE_RATIO) {
                outsideCount++;
            }
            // For RHB, behind square on leg side is angle 182 to 268 deg
            // For LHB, behind square on leg side is angle 92 to 178 deg
            const normAngle = ((f.angleDeg % 360) + 360) % 360;
            const isBehindSquareLeg = hand === 'RHB'
                ? normAngle > 185 && normAngle < 270
                : normAngle > 90 && normAngle < 175;
            if (isBehindSquareLeg) {
                behindSquareLegCount++;
            }
        }
        const violations = [];
        if (outsideCount > maxOutside) {
            violations.push(`No-Ball Restriction Breach: ${outsideCount} fielders outside 30-yard circle (Max ${maxOutside} allowed in ${phase.replace(/_/g, ' ')})`);
        }
        if (behindSquareLegCount > maxBehindSquareLeg) {
            violations.push(`MCC Law 28.4 Breach: ${behindSquareLegCount} fielders behind popping crease on leg side (Max 2 allowed)`);
        }
        const isLegal = violations.length === 0;
        const baseEfficiency = phase === 'PP1_OVERS_1_6' ? 12.8 : phase === 'MIDDLE_OVERS_7_15' ? 15.4 : 18.6;
        const runSavingEfficiencyPct = isLegal
            ? Number((baseEfficiency + outsideCount * 1.1).toFixed(1))
            : 0;
        const tacticalSummary = isLegal
            ? `✓ ICC & MCC Compliant Field (${outsideCount}/${maxOutside} outside 30-yd ring • +${runSavingEfficiencyPct}% expected run suppression)`
            : `⚠️ Illegal Field Geometry (${violations[0]})`;
        return {
            isLegal,
            phase,
            outsideCircleCount: outsideCount,
            maxAllowedOutsideCircle: maxOutside,
            behindSquareLegCount,
            maxAllowedBehindSquareLeg: maxBehindSquareLeg,
            violations,
            tacticalSummary,
            runSavingEfficiencyPct,
        };
    }
}
//# sourceMappingURL=field-placement-planner.js.map