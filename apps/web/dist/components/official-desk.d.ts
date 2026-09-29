/**
 * apps/web/src/components/official-desk.ts
 *
 * Umpire & Official Assignment Desk
 * Derived from Archive Specifications:
 * - 03_UX_Blueprint_v2.docx (Journey J2: Umpire & Official Assignment Lifecycle)
 * - 08_Sprint_Ready_P0_Backlog_v1.docx (BKG-001...014, FIN-011)
 *
 * Coordinates official appointment, accept/decline workflows, venue check-in,
 * match briefing sign-off, and automated double-entry escrow disbursement.
 */
export type OfficialRole = 'LEAD_UMPIRE' | 'LEG_UMPIRE' | 'THIRD_UMPIRE' | 'SCORER';
export type OfficialStatus = 'ASSIGNED' | 'ACCEPTED' | 'CHECKED_IN' | 'IN_PROGRESS' | 'COMPLETED';
export interface OfficialAssignment {
    id: string;
    matchId: string;
    matchTitle: string;
    venueName: string;
    scheduledTime: string;
    role: OfficialRole;
    feeMinor: number;
    status: OfficialStatus;
    payoutStatus: 'ESCROW_HELD' | 'DISBURSED' | 'DISPUTED';
}
/**
 * Transitions assignment status following the official lifecycle state machine.
 */
export declare function transitionOfficialStatus(current: OfficialStatus, action: 'ACCEPT' | 'CHECK_IN' | 'START_MATCH' | 'COMPLETE'): OfficialStatus;
/**
 * Renders an official assignment card with action triggers.
 */
export declare function renderOfficialCardHtml(assignment: OfficialAssignment): string;
//# sourceMappingURL=official-desk.d.ts.map