/**
 * apps/web/src/components/reconciliation.ts
 *
 * Financial Reconciliation Dashboard
 * Derived from Archive Specifications:
 * - 01_Functional_Specification_v3 (§46: Payments, Escrow & Settlement)
 * - 10_Marketplace_Commercial_Policy_Matrix_v1 (§17–18: Provider Settlement, §26: Ledger Rules)
 * - 02_Product_Blueprint_v1 (§31: Marketplace Unit Economics Dashboard)
 *
 * Settlement timeline, provider-level breakdown, daily reconciliation,
 * exception highlighting, and financial export capabilities.
 * All amounts in integer minor units per Invariant #1.
 */
export type SettlementStage = 'BOOKING_CONFIRMED' | 'SERVICE_COMPLETED' | 'DISPUTE_WINDOW' | 'SETTLEMENT_ELIGIBLE' | 'PAYOUT_INITIATED' | 'PAYOUT_COMPLETED' | 'HELD_DISPUTE';
export interface SettlementRecord {
    settlementId: string;
    bookingId: string;
    eventTitle: string;
    providerId: string;
    providerName: string;
    grossServiceMinor: number;
    commissionMinor: number;
    commissionRate: number;
    platformFeeMinor: number;
    gstMinor: number;
    gstRate: number;
    adjustmentsMinor: number;
    refundLiabilityMinor: number;
    netPayoutMinor: number;
    stage: SettlementStage;
    completedAt?: string;
    disputeWindowEndsAt?: string;
    payoutInitiatedAt?: string;
    payoutCompletedAt?: string;
}
export interface DailyReconciliation {
    date: string;
    totalBookingsCount: number;
    totalGrossMinor: number;
    totalCommissionMinor: number;
    totalGstMinor: number;
    totalRefundsMinor: number;
    totalPayoutsMinor: number;
    netPlatformRevenueMinor: number;
    exceptions: ReconciliationException[];
    balanced: boolean;
}
export interface ReconciliationException {
    type: 'IMBALANCE' | 'MISSING_ENTRY' | 'DUPLICATE' | 'TIMING' | 'OVERPAYMENT';
    description: string;
    amountMinor: number;
    severity: 'CRITICAL' | 'WARNING' | 'INFO';
    bookingId?: string;
}
export interface LedgerAccountBalance {
    account: string;
    label: string;
    debitTotalMinor: number;
    creditTotalMinor: number;
    balanceMinor: number;
}
/**
 * Calculates provider net settlement per Commercial Policy §17.
 * Formula: Net = Gross − Commission − Platform Fees/Taxes − Refund Liability − Penalties + Adjustments
 */
export declare function calculateProviderNet(grossMinor: number, commissionRate: number, gstRate: number, refundLiabilityMinor?: number, adjustmentsMinor?: number): {
    commissionMinor: number;
    platformFeeMinor: number;
    gstMinor: number;
    netPayoutMinor: number;
};
/**
 * Returns settlement stage metadata for rendering.
 */
export declare function getSettlementStageMeta(stage: SettlementStage): {
    label: string;
    icon: string;
    color: string;
    bg: string;
};
/**
 * Checks if a settlement is eligible for payout.
 * Per Commercial Policy §18: Dispute window must be closed and no pending disputes.
 */
export declare function isPayoutEligible(record: SettlementRecord): {
    eligible: boolean;
    reason: string;
};
/**
 * Generates a daily reconciliation summary.
 */
export declare function generateDailyReconciliation(date: string, settlements: SettlementRecord[]): DailyReconciliation;
/**
 * Generates chart of accounts balances from settlement records.
 */
export declare function generateAccountBalances(settlements: SettlementRecord[]): LedgerAccountBalance[];
/**
 * Renders the settlement timeline HTML for a single record.
 */
export declare function renderSettlementTimelineHtml(record: SettlementRecord): string;
/**
 * Renders the provider settlement breakdown HTML.
 */
export declare function renderProviderBreakdownHtml(record: SettlementRecord): string;
/**
 * Renders the daily reconciliation summary HTML.
 */
export declare function renderDailyReconciliationHtml(recon: DailyReconciliation): string;
/**
 * Generates CSV export content for reconciliation data.
 */
export declare function exportReconciliationCsv(settlements: SettlementRecord[]): string;
/**
 * Creates sample settlement records for demonstration.
 */
export declare function createSampleSettlements(): SettlementRecord[];
//# sourceMappingURL=reconciliation.d.ts.map