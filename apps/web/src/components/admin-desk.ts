/**
 * Admin Desk & Ledger Audit Reconciliation Component (UX-027, ADM-001..020)
 * Provides administrative dispute resolution, double-entry balance validation, and provider trust governance.
 */

export interface AdminCase {
  caseId: string;
  type: 'DISPUTE' | 'CIRCUIT_BREAKER' | 'LEDGER_AUDIT' | 'CODE_OF_CONDUCT';
  title: string;
  entityName: string;
  amountMinor: number;
  status: 'PENDING_REVIEW' | 'RESOLVED' | 'ESCALATED';
  createdAt: string;
  recommendedAction: string;
}

export interface LedgerAuditSummary {
  escrowHoldMinor: number;
  providerPayableMinor: number;
  platformFeeIncomeMinor: number;
  taxGstPayableMinor: number;
  refundClearingMinor: number;
  totalDebitsMinor: number;
  totalCreditsMinor: number;
  isBalanced: boolean;
  imbalanceMinor: number;
}

export function getDefaultAdminCases(): AdminCase[] {
  return [
    {
      caseId: 'CASE-9041',
      type: 'DISPUTE',
      title: 'Adverse Weather Interruption Claim',
      entityName: 'Bengaluru Strikers vs Mumbai Blasters',
      amountMinor: 850000, // ₹8,500
      status: 'PENDING_REVIEW',
      createdAt: '25 mins ago',
      recommendedAction: 'Execute 50% rain refund journal entry (D: REFUND_CLEARING, C: ESCROW_HOLD)',
    },
    {
      caseId: 'CASE-8912',
      type: 'CIRCUIT_BREAKER',
      title: 'Automated Provider Slot Freeze Tripped',
      entityName: 'Whitefield Sports Complex',
      amountMinor: 0,
      status: 'PENDING_REVIEW',
      createdAt: '1 hour ago',
      recommendedAction: 'Review no-show evidence or manually reset circuit breaker with probation status',
    },
    {
      caseId: 'CASE-8755',
      type: 'LEDGER_AUDIT',
      title: 'Zero-Sum Escrow Settlement Verification',
      entityName: 'Tournament Batch #TRN-2026-BLR',
      amountMinor: 14500000, // ₹145,000
      status: 'RESOLVED',
      createdAt: '3 hours ago',
      recommendedAction: 'All 8 matches balanced with 0 INR discrepancy across 5 ledger accounts',
    },
  ];
}

export function verifyLedgerAuditIntegrity(
  escrow: number,
  payable: number,
  fee: number,
  gst: number,
  refund: number
): LedgerAuditSummary {
  // In our double-entry ledger: Debits (Assets/Clearing/Holds) = Credits (Payables/Liabilities/Income)
  const totalDebits = escrow + refund;
  const totalCredits = payable + fee + gst;
  const imbalance = Math.abs(totalDebits - totalCredits);

  return {
    escrowHoldMinor: escrow,
    providerPayableMinor: payable,
    platformFeeIncomeMinor: fee,
    taxGstPayableMinor: gst,
    refundClearingMinor: refund,
    totalDebitsMinor: totalDebits,
    totalCreditsMinor: totalCredits,
    isBalanced: imbalance === 0,
    imbalanceMinor: imbalance,
  };
}

import { formatMinorInr } from './event-basket.js';

export function renderAdminDeskHtml(cases: AdminCase[], audit: LedgerAuditSummary): string {
  const casesHtml = cases
    .map((c) => {
      const statusColor =
        c.status === 'RESOLVED'
          ? 'var(--turf-emerald)'
          : c.status === 'PENDING_REVIEW'
          ? 'var(--amber)'
          : 'var(--rose)';

      return `
      <div style="background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 1rem; margin-bottom: 0.75rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="font-family: var(--font-mono); font-size: 0.75rem; font-weight: 700; color: var(--cyan);">${c.caseId}</span>
            <span style="font-weight: 700; font-size: 0.85rem; color: #FFF;">${c.title}</span>
          </div>
          <span style="font-size: 0.7rem; font-weight: 700; color: ${statusColor}; background: rgba(255,255,255,0.05); padding: 0.15rem 0.5rem; border-radius: 4px;">
            ${c.status}
          </span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.5rem;">
          <span>Entity: <strong style="color: #FFF;">${c.entityName}</strong></span>
          ${c.amountMinor > 0 ? `<span>Dispute Value: <strong style="color: var(--amber);">${formatMinorInr(c.amountMinor)}</strong></span>` : ''}
          <span>Logged: ${c.createdAt}</span>
        </div>
        <div style="font-size: 0.75rem; color: var(--text-muted); background: rgba(0,0,0,0.3); padding: 0.5rem; border-radius: 6px; border-left: 3px solid var(--amber); margin-bottom: 0.75rem;">
          <strong>Suggested Action:</strong> ${c.recommendedAction}
        </div>
        <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
          <button class="btn btn-secondary" style="padding: 0.25rem 0.6rem; font-size: 0.72rem;" onclick="arbitrateAdminCase('${c.caseId}', 'REJECT')" data-tooltip="Reject claim and release provider payout">Reject Claim</button>
          <button class="btn btn-primary" style="padding: 0.25rem 0.6rem; font-size: 0.72rem;" onclick="arbitrateAdminCase('${c.caseId}', 'RESOLVE')" data-tooltip="Approve resolution and trigger balanced double-entry refund">Approve & Execute</button>
        </div>
      </div>
    `;
    })
    .join('');

  return `
    <div class="card" style="margin-top: 1.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <div>
          <div class="card-title" style="display: flex; align-items: center; gap: 0.5rem;">
            <span>🏛️</span> Admin Operations & Settlement Audit Desk
          </div>
          <div class="card-desc">Authoritative dispute arbitration, circuit breaker governance, and double-entry ledger audits</div>
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn btn-secondary" onclick="refreshAdminCases()" data-tooltip="Refresh administrative cases and audit ledger">🔄 Refresh Audit</button>
        </div>
      </div>

      <!-- Ledger Integrity Meter -->
      <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 1rem; margin-bottom: 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <span style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted);">Chart of Accounts Verification</span>
          <span style="font-size: 0.75rem; font-weight: 700; color: ${audit.isBalanced ? 'var(--turf-emerald)' : 'var(--rose)'}; background: rgba(0,229,153,0.1); padding: 0.2rem 0.5rem; border-radius: 4px;">
            ${audit.isBalanced ? '✓ 100% BALANCED (ZERO IMBALANCE)' : '⚠️ LEDGER IMBALANCE DETECTED'}
          </span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 0.75rem; font-family: var(--font-mono); font-size: 0.75rem;">
          <div>
            <div style="color: var(--text-muted); font-size: 0.65rem;">ESCROW_HOLD</div>
            <div style="font-size: 0.95rem; font-weight: 700; color: #FFF;">${formatMinorInr(audit.escrowHoldMinor)}</div>
          </div>
          <div>
            <div style="color: var(--text-muted); font-size: 0.65rem;">PROVIDER_PAYABLE</div>
            <div style="font-size: 0.95rem; font-weight: 700; color: var(--cyan);">${formatMinorInr(audit.providerPayableMinor)}</div>
          </div>
          <div>
            <div style="color: var(--text-muted); font-size: 0.65rem;">PLATFORM_FEE_INCOME</div>
            <div style="font-size: 0.95rem; font-weight: 700; color: var(--turf-emerald);">${formatMinorInr(audit.platformFeeIncomeMinor)}</div>
          </div>
          <div>
            <div style="color: var(--text-muted); font-size: 0.65rem;">TAX_GST_PAYABLE</div>
            <div style="font-size: 0.95rem; font-weight: 700; color: var(--amber);">${formatMinorInr(audit.taxGstPayableMinor)}</div>
          </div>
          <div>
            <div style="color: var(--text-muted); font-size: 0.65rem;">REFUND_CLEARING</div>
            <div style="font-size: 0.95rem; font-weight: 700; color: var(--rose);">${formatMinorInr(audit.refundClearingMinor)}</div>
          </div>
        </div>
      </div>

      <!-- Active Cases Queue -->
      <div style="font-size: 0.85rem; font-weight: 700; margin-bottom: 0.75rem;">Active Case Arbitrations (${cases.length})</div>
      <div id="adminCasesListContainer">
        ${casesHtml}
      </div>
    </div>
  `;
}
