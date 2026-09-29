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
export declare function getDefaultAdminCases(): AdminCase[];
export declare function verifyLedgerAuditIntegrity(escrow: number, payable: number, fee: number, gst: number, refund: number): LedgerAuditSummary;
export declare function renderAdminDeskHtml(cases: AdminCase[], audit: LedgerAuditSummary): string;
//# sourceMappingURL=admin-desk.d.ts.map