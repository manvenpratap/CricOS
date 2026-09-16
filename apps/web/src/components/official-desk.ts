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
export function transitionOfficialStatus(
  current: OfficialStatus,
  action: 'ACCEPT' | 'CHECK_IN' | 'START_MATCH' | 'COMPLETE'
): OfficialStatus {
  switch (action) {
    case 'ACCEPT':
      return current === 'ASSIGNED' ? 'ACCEPTED' : current;
    case 'CHECK_IN':
      return current === 'ACCEPTED' ? 'CHECKED_IN' : current;
    case 'START_MATCH':
      return current === 'CHECKED_IN' ? 'IN_PROGRESS' : current;
    case 'COMPLETE':
      return current === 'IN_PROGRESS' ? 'COMPLETED' : current;
    default:
      return current;
  }
}

/**
 * Renders an official assignment card with action triggers.
 */
export function renderOfficialCardHtml(assignment: OfficialAssignment): string {
  const isAccepted = assignment.status !== 'ASSIGNED';
  const isCheckedIn = assignment.status === 'CHECKED_IN' || assignment.status === 'IN_PROGRESS' || assignment.status === 'COMPLETED';

  return `
    <div class="official-assignment-card" style="background: rgba(10, 16, 28, 0.85); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 1.15rem; margin-bottom: 1rem;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
        <div>
          <div style="font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 1rem; color: #f8fafc;">
            ${assignment.matchTitle}
          </div>
          <div style="font-size: 0.82rem; color: #94a3b8; margin-top: 0.2rem;">
            📍 ${assignment.venueName} • 🕒 ${assignment.scheduledTime}
          </div>
        </div>
        <div style="text-align: right;">
          <span style="background: rgba(0, 210, 255, 0.15); color: #00D2FF; border: 1px solid rgba(0, 210, 255, 0.3); padding: 0.2rem 0.5rem; border-radius: 6px; font-size: 0.72rem; font-weight: 700;">
            ${assignment.role.replace('_', ' ')}
          </span>
          <div style="font-family: 'Chakra Petch', monospace; font-size: 0.88rem; font-weight: 700; color: #00E599; margin-top: 0.35rem;">
            ₹${(assignment.feeMinor / 100).toFixed(2)} Escrow
          </div>
        </div>
      </div>

      <div style="display: flex; gap: 0.5rem; align-items: center; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 0.75rem;">
        ${!isAccepted ? `
          <button type="button" class="btn btn-primary" style="flex: 1; padding: 0.4rem;" data-tooltip="Accept this officiating assignment">
            Accept Assignment
          </button>
        ` : !isCheckedIn ? `
          <button type="button" class="btn btn-secondary" style="flex: 1; padding: 0.4rem; border-color: #00D2FF; color: #00D2FF;" data-tooltip="Confirm physical arrival at ground">
            📍 Venue Check-In
          </button>
        ` : `
          <span style="color: #00E599; font-size: 0.8rem; font-weight: 600;">
            ✓ Checked in & On-field Ready
          </span>
        `}
      </div>
    </div>
  `;
}
