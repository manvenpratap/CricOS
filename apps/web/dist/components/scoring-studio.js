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
export const SHOT_ZONES_CONFIG = [
    {
        id: 'FINE_LEG',
        label: 'Fine Leg',
        shortLabel: 'Fine Leg',
        angleDeg: 22.5,
        sectorStartDeg: 0,
        sectorEndDeg: 45,
        side: 'LEG',
        description: 'Behind square on the leg-side towards the boundary'
    },
    {
        id: 'SQUARE_LEG',
        label: 'Deep Square Leg',
        shortLabel: 'Sq Leg',
        angleDeg: 67.5,
        sectorStartDeg: 45,
        sectorEndDeg: 90,
        side: 'LEG',
        description: 'Square of the wicket on the leg-side'
    },
    {
        id: 'MID_WICKET',
        label: 'Deep Mid Wicket',
        shortLabel: 'Mid Wkt',
        angleDeg: 112.5,
        sectorStartDeg: 90,
        sectorEndDeg: 135,
        side: 'LEG',
        description: 'Forward of square on the leg-side between long on and square leg'
    },
    {
        id: 'LONG_ON',
        label: 'Long On',
        shortLabel: 'Long On',
        angleDeg: 157.5,
        sectorStartDeg: 135,
        sectorEndDeg: 180,
        side: 'LEG',
        description: 'Straight on-side down the ground towards the boundary'
    },
    {
        id: 'LONG_OFF',
        label: 'Long Off',
        shortLabel: 'Long Off',
        angleDeg: 202.5,
        sectorStartDeg: 180,
        sectorEndDeg: 225,
        side: 'OFF',
        description: 'Straight off-side down the ground towards the boundary'
    },
    {
        id: 'EXTRA_COVER',
        label: 'Cover / Extra Cover',
        shortLabel: 'Cover',
        angleDeg: 247.5,
        sectorStartDeg: 225,
        sectorEndDeg: 270,
        side: 'OFF',
        description: 'Forward of square on the off-side between point and long off'
    },
    {
        id: 'POINT',
        label: 'Point / Backward Point',
        shortLabel: 'Point',
        angleDeg: 292.5,
        sectorStartDeg: 270,
        sectorEndDeg: 315,
        side: 'OFF',
        description: 'Square of the wicket on the off-side'
    },
    {
        id: 'THIRD_MAN',
        label: 'Third Man',
        shortLabel: 'Third Man',
        angleDeg: 337.5,
        sectorStartDeg: 315,
        sectorEndDeg: 360,
        side: 'OFF',
        description: 'Behind square on the off-side towards the boundary'
    }
];
/**
 * Returns zone definitions mirrored for Left-Handed Batsman (LHB).
 */
export function getShotZonesConfigForStance(isLhb) {
    if (!isLhb)
        return SHOT_ZONES_CONFIG;
    return SHOT_ZONES_CONFIG.map(zone => ({
        ...zone,
        angleDeg: (360 - zone.angleDeg) % 360,
        sectorStartDeg: (360 - zone.sectorEndDeg) % 360,
        sectorEndDeg: (360 - zone.sectorStartDeg) % 360,
        side: zone.side
    }));
}
export function calculatePartnership(b1Runs, b1Balls, b2Runs, b2Balls) {
    return {
        batter1Runs: b1Runs,
        batter1Balls: b1Balls,
        batter2Runs: b2Runs,
        batter2Balls: b2Balls,
        totalRuns: b1Runs + b2Runs,
        totalBalls: b1Balls + b2Balls
    };
}
export function getDismissalLabel(kind, fielder) {
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
export function calculateShotCoordinates(angleDeg, distanceFraction, radius, centerX, centerY) {
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
 * Angles rotated 180° to align with the standard broadcast pitch view (striker at top).
 */
export const DEFAULT_SHOT_TRAJECTORIES = [
    // Virat Sharma (48* off 32: 4x4, 2x6)
    { id: 's1', zone: 'EXTRA_COVER', runs: 4, isBoundary: true, isSix: false, batterName: 'Virat Sharma', ballNumber: 4, angleDeg: 248, distanceFraction: 0.98 },
    { id: 's2', zone: 'EXTRA_COVER', runs: 4, isBoundary: true, isSix: false, batterName: 'Virat Sharma', ballNumber: 9, angleDeg: 255, distanceFraction: 0.99 },
    { id: 's3', zone: 'MID_WICKET', runs: 6, isBoundary: true, isSix: true, batterName: 'Virat Sharma', ballNumber: 14, angleDeg: 115, distanceFraction: 1.15 },
    { id: 's4', zone: 'LONG_ON', runs: 6, isBoundary: true, isSix: true, batterName: 'Virat Sharma', ballNumber: 21, angleDeg: 160, distanceFraction: 1.18 },
    { id: 's5', zone: 'POINT', runs: 4, isBoundary: true, isSix: false, batterName: 'Virat Sharma', ballNumber: 26, angleDeg: 290, distanceFraction: 0.97 },
    { id: 's6', zone: 'LONG_OFF', runs: 4, isBoundary: true, isSix: false, batterName: 'Virat Sharma', ballNumber: 30, angleDeg: 200, distanceFraction: 0.98 },
    { id: 's7', zone: 'SQUARE_LEG', runs: 1, isBoundary: false, isSix: false, batterName: 'Virat Sharma', ballNumber: 2, angleDeg: 75, distanceFraction: 0.65 },
    { id: 's8', zone: 'FINE_LEG', runs: 2, isBoundary: false, isSix: false, batterName: 'Virat Sharma', ballNumber: 7, angleDeg: 25, distanceFraction: 0.72 },
    { id: 's9', zone: 'THIRD_MAN', runs: 1, isBoundary: false, isSix: false, batterName: 'Virat Sharma', ballNumber: 11, angleDeg: 335, distanceFraction: 0.68 },
    { id: 's10', zone: 'MID_WICKET', runs: 2, isBoundary: false, isSix: false, batterName: 'Virat Sharma', ballNumber: 17, angleDeg: 110, distanceFraction: 0.75 },
    { id: 's11', zone: 'EXTRA_COVER', runs: 0, isBoundary: false, isSix: false, batterName: 'Virat Sharma', ballNumber: 1, angleDeg: 250, distanceFraction: 0.35 },
    { id: 's12', zone: 'POINT', runs: 0, isBoundary: false, isSix: false, batterName: 'Virat Sharma', ballNumber: 6, angleDeg: 295, distanceFraction: 0.38 },
    // Hardik Patel (18 off 12: 1x4, 1x6)
    { id: 's13', zone: 'MID_WICKET', runs: 6, isBoundary: true, isSix: true, batterName: 'Hardik Patel', ballNumber: 16, angleDeg: 112, distanceFraction: 1.14 },
    { id: 's14', zone: 'SQUARE_LEG', runs: 4, isBoundary: true, isSix: false, batterName: 'Hardik Patel', ballNumber: 23, angleDeg: 70, distanceFraction: 0.98 },
    { id: 's15', zone: 'LONG_ON', runs: 2, isBoundary: false, isSix: false, batterName: 'Hardik Patel', ballNumber: 18, angleDeg: 162, distanceFraction: 0.78 },
    { id: 's16', zone: 'FINE_LEG', runs: 1, isBoundary: false, isSix: false, batterName: 'Hardik Patel', ballNumber: 20, angleDeg: 22, distanceFraction: 0.62 },
    { id: 's17', zone: 'EXTRA_COVER', runs: 1, isBoundary: false, isSix: false, batterName: 'Hardik Patel', ballNumber: 27, angleDeg: 245, distanceFraction: 0.58 },
    { id: 's18', zone: 'MID_WICKET', runs: 0, isBoundary: false, isSix: false, batterName: 'Hardik Patel', ballNumber: 15, angleDeg: 118, distanceFraction: 0.4 }
];
/**
 * Filters shots for a specific batsman or returns all partnership shots.
 */
export function filterShotsByBatter(shots, batterName) {
    if (!batterName || batterName === 'ALL')
        return shots;
    return shots.filter(s => s.batterName === batterName);
}
/**
 * Computes wagon wheel analytical statistics for an individual batsman or stand.
 */
export function calculateBatterWagonStats(shots, batterName, isLhb = false) {
    const filtered = filterShotsByBatter(shots, batterName);
    let totalRuns = 0;
    let fours = 0;
    let sixes = 0;
    let dots = 0;
    let singles = 0;
    let offSideRuns = 0;
    let legSideRuns = 0;
    filtered.forEach(s => {
        totalRuns += s.runs;
        if (s.isSix)
            sixes++;
        else if (s.isBoundary)
            fours++;
        else if (s.runs === 0)
            dots++;
        else
            singles++;
        const zoneDef = SHOT_ZONES_CONFIG.find(z => z.id === s.zone);
        const side = isLhb ? (zoneDef?.side === 'OFF' ? 'LEG' : 'OFF') : (zoneDef?.side || 'OFF');
        if (side === 'OFF')
            offSideRuns += s.runs;
        else
            legSideRuns += s.runs;
    });
    const ballsFaced = filtered.length;
    const strikeRate = ballsFaced > 0 ? Math.round((totalRuns / ballsFaced) * 10000) / 100 : 0;
    const totalScored = offSideRuns + legSideRuns;
    const offSidePct = totalScored > 0 ? Math.round((offSideRuns / totalScored) * 100) : 50;
    const legSidePct = totalScored > 0 ? 100 - offSidePct : 50;
    return {
        batterName: batterName || 'All Batters',
        totalRuns,
        ballsFaced,
        fours,
        sixes,
        dots,
        singles,
        strikeRate,
        offSideRuns,
        legSideRuns,
        offSidePct,
        legSidePct,
        shotCount: filtered.length
    };
}
//# sourceMappingURL=scoring-studio.js.map