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

export type SettlementStage =
  | 'BOOKING_CONFIRMED'
  | 'SERVICE_COMPLETED'
  | 'DISPUTE_WINDOW'
  | 'SETTLEMENT_ELIGIBLE'
  | 'PAYOUT_INITIATED'
  | 'PAYOUT_COMPLETED'
  | 'HELD_DISPUTE';

export interface SettlementRecord {
  settlementId: string;
  bookingId: string;
  eventTitle: string;
  providerId: string;
  providerName: string;
  grossServiceMinor: number;
  commissionMinor: number;
  commissionRate: number; // e.g. 0.05 for 5%
  platformFeeMinor: number;
  gstMinor: number;
  gstRate: number; // e.g. 0.18 for 18%
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
  date: string; // ISO date YYYY-MM-DD
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
export function calculateProviderNet(
  grossMinor: number,
  commissionRate: number,
  gstRate: number,
  refundLiabilityMinor: number = 0,
  adjustmentsMinor: number = 0
): {
  commissionMinor: number;
  platformFeeMinor: number;
  gstMinor: number;
  netPayoutMinor: number;
} {
  const commissionMinor = Math.round(grossMinor * commissionRate);
  const platformFeeMinor = commissionMinor; // Commission IS the platform fee
  const gstMinor = Math.round(commissionMinor * gstRate);
  const netPayoutMinor = grossMinor - commissionMinor - gstMinor - refundLiabilityMinor + adjustmentsMinor;

  return { commissionMinor, platformFeeMinor, gstMinor, netPayoutMinor };
}

/**
 * Returns settlement stage metadata for rendering.
 */
export function getSettlementStageMeta(stage: SettlementStage): {
  label: string;
  icon: string;
  color: string;
  bg: string;
} {
  switch (stage) {
    case 'BOOKING_CONFIRMED':
      return { label: 'Booking Confirmed', icon: '📋', color: '#94A3B8', bg: 'rgba(148,163,184,0.12)' };
    case 'SERVICE_COMPLETED':
      return { label: 'Service Completed', icon: '✅', color: '#00D2FF', bg: 'rgba(0,210,255,0.12)' };
    case 'DISPUTE_WINDOW':
      return { label: 'Dispute Window', icon: '⏳', color: '#FFB800', bg: 'rgba(255,184,0,0.12)' };
    case 'SETTLEMENT_ELIGIBLE':
      return { label: 'Settlement Eligible', icon: '💰', color: '#00E599', bg: 'rgba(0,229,153,0.12)' };
    case 'PAYOUT_INITIATED':
      return { label: 'Payout Initiated', icon: '🔄', color: '#00D2FF', bg: 'rgba(0,210,255,0.15)' };
    case 'PAYOUT_COMPLETED':
      return { label: 'Payout Completed', icon: '✅', color: '#00E599', bg: 'rgba(0,229,153,0.15)' };
    case 'HELD_DISPUTE':
      return { label: 'Held — Dispute', icon: '⚠️', color: '#FF3366', bg: 'rgba(255,51,102,0.12)' };
  }
}

/**
 * Checks if a settlement is eligible for payout.
 * Per Commercial Policy §18: Dispute window must be closed and no pending disputes.
 */
export function isPayoutEligible(record: SettlementRecord): {
  eligible: boolean;
  reason: string;
} {
  if (record.stage === 'HELD_DISPUTE') {
    return { eligible: false, reason: 'Booking has a pending dispute. Settlement is held.' };
  }

  if (record.stage === 'DISPUTE_WINDOW' && record.disputeWindowEndsAt) {
    const windowEnd = new Date(record.disputeWindowEndsAt).getTime();
    if (Date.now() < windowEnd) {
      const hoursLeft = Math.ceil((windowEnd - Date.now()) / (1000 * 60 * 60));
      return { eligible: false, reason: `Dispute window open for ${hoursLeft} more hours.` };
    }
  }

  if (record.refundLiabilityMinor > 0) {
    return { eligible: false, reason: `Outstanding refund liability: ₹${(record.refundLiabilityMinor / 100).toFixed(0)}` };
  }

  if (record.netPayoutMinor <= 0) {
    return { eligible: false, reason: 'Net payout is zero or negative after deductions.' };
  }

  return { eligible: true, reason: 'All conditions met — payout eligible.' };
}

/**
 * Generates a daily reconciliation summary.
 */
export function generateDailyReconciliation(
  date: string,
  settlements: SettlementRecord[]
): DailyReconciliation {
  const totalGrossMinor = settlements.reduce((s, r) => s + r.grossServiceMinor, 0);
  const totalCommissionMinor = settlements.reduce((s, r) => s + r.commissionMinor, 0);
  const totalGstMinor = settlements.reduce((s, r) => s + r.gstMinor, 0);
  const totalRefundsMinor = settlements.reduce((s, r) => s + r.refundLiabilityMinor, 0);
  const totalPayoutsMinor = settlements.reduce((s, r) => s + r.netPayoutMinor, 0);
  const netPlatformRevenueMinor = totalCommissionMinor + totalGstMinor;

  // Verify balance: Gross = Payouts + Commission + GST + Refunds + Adjustments
  const sumOfParts = totalPayoutsMinor + totalCommissionMinor + totalGstMinor + totalRefundsMinor;
  const totalAdjustments = settlements.reduce((s, r) => s + r.adjustmentsMinor, 0);
  const imbalance = totalGrossMinor - sumOfParts + totalAdjustments;

  const exceptions: ReconciliationException[] = [];

  if (Math.abs(imbalance) > 0) {
    exceptions.push({
      type: 'IMBALANCE',
      description: `Ledger imbalance detected: ₹${(Math.abs(imbalance) / 100).toFixed(2)} discrepancy`,
      amountMinor: Math.abs(imbalance),
      severity: Math.abs(imbalance) > 10000 ? 'CRITICAL' : 'WARNING'
    });
  }

  // Check for held-dispute settlements
  const disputeHeld = settlements.filter(s => s.stage === 'HELD_DISPUTE');
  if (disputeHeld.length > 0) {
    exceptions.push({
      type: 'TIMING',
      description: `${disputeHeld.length} settlement(s) held pending dispute resolution`,
      amountMinor: disputeHeld.reduce((s, r) => s + r.netPayoutMinor, 0),
      severity: 'WARNING'
    });
  }

  return {
    date,
    totalBookingsCount: settlements.length,
    totalGrossMinor,
    totalCommissionMinor,
    totalGstMinor,
    totalRefundsMinor,
    totalPayoutsMinor,
    netPlatformRevenueMinor,
    exceptions,
    balanced: Math.abs(imbalance) === 0
  };
}

/**
 * Generates chart of accounts balances from settlement records.
 */
export function generateAccountBalances(settlements: SettlementRecord[]): LedgerAccountBalance[] {
  const escrowHold = settlements
    .filter(s => s.stage !== 'PAYOUT_COMPLETED')
    .reduce((sum, s) => sum + s.grossServiceMinor, 0);

  const providerPayable = settlements
    .filter(s => s.stage === 'SETTLEMENT_ELIGIBLE' || s.stage === 'PAYOUT_INITIATED')
    .reduce((sum, s) => sum + s.netPayoutMinor, 0);

  const platformFee = settlements.reduce((sum, s) => sum + s.commissionMinor, 0);
  const gstPayable = settlements.reduce((sum, s) => sum + s.gstMinor, 0);
  const refundClearing = settlements.reduce((sum, s) => sum + s.refundLiabilityMinor, 0);

  return [
    { account: 'ESCROW_HOLD', label: 'Escrow Hold', debitTotalMinor: escrowHold, creditTotalMinor: 0, balanceMinor: escrowHold },
    { account: 'PROVIDER_PAYABLE', label: 'Provider Payable', debitTotalMinor: 0, creditTotalMinor: providerPayable, balanceMinor: providerPayable },
    { account: 'PLATFORM_FEE_INCOME', label: 'Platform Fee Income', debitTotalMinor: 0, creditTotalMinor: platformFee, balanceMinor: platformFee },
    { account: 'TAX_GST_PAYABLE', label: 'GST Payable', debitTotalMinor: 0, creditTotalMinor: gstPayable, balanceMinor: gstPayable },
    { account: 'REFUND_CLEARING', label: 'Refund Clearing', debitTotalMinor: refundClearing, creditTotalMinor: 0, balanceMinor: refundClearing }
  ];
}

/**
 * Renders the settlement timeline HTML for a single record.
 */
export function renderSettlementTimelineHtml(record: SettlementRecord): string {
  const stages: SettlementStage[] = [
    'BOOKING_CONFIRMED', 'SERVICE_COMPLETED', 'DISPUTE_WINDOW',
    'SETTLEMENT_ELIGIBLE', 'PAYOUT_INITIATED', 'PAYOUT_COMPLETED'
  ];

  const currentIdx = record.stage === 'HELD_DISPUTE' ? 2 : stages.indexOf(record.stage);

  const steps = stages.map((s, i) => {
    const meta = getSettlementStageMeta(s);
    let cls = 'upcoming';
    if (record.stage === 'HELD_DISPUTE' && s === 'DISPUTE_WINDOW') cls = 'held';
    else if (i < currentIdx) cls = 'completed';
    else if (i === currentIdx) cls = 'active';

    return `<div class="settle-step ${cls}" data-tooltip="${meta.label}">
      <span class="settle-icon">${i < currentIdx ? '✓' : meta.icon}</span>
      <span class="settle-label">${meta.label}</span>
    </div>`;
  }).join('<div class="settle-connector"></div>');

  return `<div class="settlement-timeline" data-tooltip="Settlement ${record.settlementId}">${steps}</div>`;
}

/**
 * Renders the provider settlement breakdown HTML.
 */
export function renderProviderBreakdownHtml(record: SettlementRecord): string {
  const formatCurrency = (minor: number) => `₹${(minor / 100).toLocaleString('en-IN')}`;
  const eligibility = isPayoutEligible(record);

  return `<div class="settlement-breakdown" data-tooltip="Settlement breakdown for ${record.providerName}">
    <div class="settle-header">
      <span class="settle-provider">${record.providerName}</span>
      <span class="settle-event">${record.eventTitle}</span>
    </div>
    <div class="settle-lines">
      <div class="settle-line" data-tooltip="Gross service entitlement"><span>Gross Revenue</span><span class="settle-amount">${formatCurrency(record.grossServiceMinor)}</span></div>
      <div class="settle-line deduction" data-tooltip="Platform commission (${(record.commissionRate * 100).toFixed(0)}%)"><span>− Commission</span><span class="settle-amount" style="color:#FF3366">−${formatCurrency(record.commissionMinor)}</span></div>
      <div class="settle-line deduction" data-tooltip="GST on commission (${(record.gstRate * 100).toFixed(0)}%)"><span>− GST</span><span class="settle-amount" style="color:#FF3366">−${formatCurrency(record.gstMinor)}</span></div>
      ${record.refundLiabilityMinor > 0 ? `<div class="settle-line deduction" data-tooltip="Outstanding refund liability"><span>− Refund Liability</span><span class="settle-amount" style="color:#FF3366">−${formatCurrency(record.refundLiabilityMinor)}</span></div>` : ''}
      ${record.adjustmentsMinor !== 0 ? `<div class="settle-line" data-tooltip="Manual adjustments"><span>${record.adjustmentsMinor > 0 ? '+ Adjustment' : '− Adjustment'}</span><span class="settle-amount">${formatCurrency(Math.abs(record.adjustmentsMinor))}</span></div>` : ''}
      <div class="settle-line total" data-tooltip="Net provider payout"><span>Net Payout</span><span class="settle-amount" style="color:#00E599;font-weight:700">${formatCurrency(record.netPayoutMinor)}</span></div>
    </div>
    <div class="settle-eligibility" style="color:${eligibility.eligible ? '#00E599' : '#FFB800'}" data-tooltip="${eligibility.reason}">
      ${eligibility.eligible ? '✅' : '⏳'} ${eligibility.reason}
    </div>
  </div>`;
}

/**
 * Renders the daily reconciliation summary HTML.
 */
export function renderDailyReconciliationHtml(recon: DailyReconciliation): string {
  const formatCurrency = (minor: number) => `₹${(minor / 100).toLocaleString('en-IN')}`;

  const exceptionHtml = recon.exceptions.length > 0
    ? recon.exceptions.map(e => {
      const severityColor = e.severity === 'CRITICAL' ? '#FF3366' : e.severity === 'WARNING' ? '#FFB800' : '#94A3B8';
      return `<div class="recon-exception" style="border-left:3px solid ${severityColor}" data-tooltip="${e.type}: ${e.description}">
        <span class="exception-severity" style="color:${severityColor}">${e.severity}</span>
        <span class="exception-desc">${e.description}</span>
        <span class="exception-amount">${formatCurrency(e.amountMinor)}</span>
      </div>`;
    }).join('')
    : '<div class="recon-clean" data-tooltip="No exceptions found">✅ All entries balanced — no exceptions</div>';

  return `<div class="daily-reconciliation" data-tooltip="Daily reconciliation: ${recon.date}">
    <div class="recon-header">
      <span class="recon-date">${recon.date}</span>
      <span class="recon-count">${recon.totalBookingsCount} bookings</span>
      <span class="recon-balanced" style="color:${recon.balanced ? '#00E599' : '#FF3366'}" data-tooltip="${recon.balanced ? 'Ledger balanced' : 'Ledger imbalance detected'}">${recon.balanced ? '✅ BALANCED' : '⚠️ IMBALANCED'}</span>
    </div>
    <div class="recon-summary">
      <div class="recon-metric" data-tooltip="Total gross from all bookings"><span>Gross</span><span>${formatCurrency(recon.totalGrossMinor)}</span></div>
      <div class="recon-metric" data-tooltip="Platform commission earned"><span>Commission</span><span style="color:#00E599">${formatCurrency(recon.totalCommissionMinor)}</span></div>
      <div class="recon-metric" data-tooltip="GST collected"><span>GST</span><span>${formatCurrency(recon.totalGstMinor)}</span></div>
      <div class="recon-metric" data-tooltip="Total refunds issued"><span>Refunds</span><span style="color:#FF3366">${formatCurrency(recon.totalRefundsMinor)}</span></div>
      <div class="recon-metric" data-tooltip="Total payouts to providers"><span>Payouts</span><span>${formatCurrency(recon.totalPayoutsMinor)}</span></div>
      <div class="recon-metric total" data-tooltip="Net platform revenue"><span>Net Revenue</span><span style="color:#00E599;font-weight:700">${formatCurrency(recon.netPlatformRevenueMinor)}</span></div>
    </div>
    <div class="recon-exceptions">${exceptionHtml}</div>
  </div>`;
}

/**
 * Generates CSV export content for reconciliation data.
 */
export function exportReconciliationCsv(settlements: SettlementRecord[]): string {
  const header = 'Settlement ID,Booking ID,Event,Provider,Gross (₹),Commission (₹),GST (₹),Refund Liability (₹),Adjustments (₹),Net Payout (₹),Stage\n';

  const rows = settlements.map(s =>
    [
      s.settlementId,
      s.bookingId,
      `"${s.eventTitle}"`,
      `"${s.providerName}"`,
      (s.grossServiceMinor / 100).toFixed(2),
      (s.commissionMinor / 100).toFixed(2),
      (s.gstMinor / 100).toFixed(2),
      (s.refundLiabilityMinor / 100).toFixed(2),
      (s.adjustmentsMinor / 100).toFixed(2),
      (s.netPayoutMinor / 100).toFixed(2),
      s.stage
    ].join(',')
  ).join('\n');

  return header + rows;
}

/**
 * Creates sample settlement records for demonstration.
 */
export function createSampleSettlements(): SettlementRecord[] {
  const grossBase = 350000; // ₹3,500

  return [
    (() => {
      const net = calculateProviderNet(grossBase, 0.05, 0.18);
      return {
        settlementId: 'STL-001',
        bookingId: 'BK-001',
        eventTitle: 'BLR T20 League — Match 7',
        providerId: 'PRV-GCC',
        providerName: 'Greenfield Cricket Club',
        grossServiceMinor: grossBase,
        commissionRate: 0.05,
        gstRate: 0.18,
        ...net,
        adjustmentsMinor: 0,
        refundLiabilityMinor: 0,
        stage: 'PAYOUT_COMPLETED' as SettlementStage,
        completedAt: new Date(Date.now() - 86400_000 * 5).toISOString(),
        payoutCompletedAt: new Date(Date.now() - 86400_000 * 2).toISOString()
      };
    })(),
    (() => {
      const gross = 150000;
      const net = calculateProviderNet(gross, 0.05, 0.18);
      return {
        settlementId: 'STL-002',
        bookingId: 'BK-002',
        eventTitle: 'Corporate Cup — Semi Final',
        providerId: 'PRV-RK',
        providerName: 'Ravi Kumar (Umpire)',
        grossServiceMinor: gross,
        commissionRate: 0.05,
        gstRate: 0.18,
        ...net,
        adjustmentsMinor: 0,
        refundLiabilityMinor: 0,
        stage: 'DISPUTE_WINDOW' as SettlementStage,
        completedAt: new Date(Date.now() - 86400_000).toISOString(),
        disputeWindowEndsAt: new Date(Date.now() + 86400_000 * 2).toISOString()
      };
    })(),
    (() => {
      const gross = 85000;
      const net = calculateProviderNet(gross, 0.05, 0.18);
      return {
        settlementId: 'STL-003',
        bookingId: 'BK-003',
        eventTitle: 'BLR T20 League — Match 7',
        providerId: 'PRV-CGP',
        providerName: 'CricGear Pro (Equipment)',
        grossServiceMinor: gross,
        commissionRate: 0.05,
        gstRate: 0.18,
        ...net,
        adjustmentsMinor: 0,
        refundLiabilityMinor: 15000,
        stage: 'HELD_DISPUTE' as SettlementStage,
        completedAt: new Date(Date.now() - 86400_000 * 3).toISOString()
      };
    })()
  ];
}
