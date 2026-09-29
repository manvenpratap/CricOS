/**
 * apps/web/src/components/match-control.ts
 *
 * Official Toss & Match Control Engine
 * Derived from Archive Specifications:
 * - 03_UX_Blueprint_v2.docx (Match Control & Toss Panel)
 * - 08_Sprint_Ready_P0_Backlog_v1.docx (CRK-001...010, Journey J1 & J2)
 *
 * Handles official match lifecycle state machines, toss recording,
 * playing XI verification, and rain contingency target recalculations.
 */
export type MatchLifecycleStatus = 'SCHEDULED' | 'TOSS_DONE' | 'INNINGS_1' | 'INNINGS_BREAK' | 'INNINGS_2' | 'COMPLETED' | 'SUPER_OVER' | 'ABANDONED';
export interface TossRecord {
    winnerTeamId: string;
    winnerTeamName: string;
    decision: 'BAT' | 'BOWL';
    tossTime: string;
    confirmedByOfficial: string;
}
export interface MatchControlState {
    matchId: string;
    homeTeam: {
        id: string;
        name: string;
        shortCode: string;
    };
    awayTeam: {
        id: string;
        name: string;
        shortCode: string;
    };
    status: MatchLifecycleStatus;
    toss: TossRecord | null;
    scheduledOvers: number;
    currentInnings: 1 | 2;
    revisedTarget?: number;
}
/**
 * Returns human-readable label and color style for match lifecycle statuses.
 */
export declare function getMatchStatusMeta(status: MatchLifecycleStatus): {
    label: string;
    bg: string;
    color: string;
    border: string;
};
/**
 * Recalculates revised target in overs-reduced matches (rain contingency / standard run-rate adjustment).
 */
export declare function calculateRevisedTarget(target: number, totalOvers: number, reducedOvers: number): number;
/**
 * Evaluates batting and bowling team assignments after toss.
 */
export declare function resolveInningsTeams(homeTeam: {
    id: string;
    name: string;
}, awayTeam: {
    id: string;
    name: string;
}, toss: TossRecord): {
    batting1st: {
        id: string;
        name: string;
    };
    bowling1st: {
        id: string;
        name: string;
    };
};
//# sourceMappingURL=match-control.d.ts.map