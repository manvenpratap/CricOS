export type LedgerAccount =
  | 'ESCROW_HOLD'
  | 'PROVIDER_PAYABLE'
  | 'PLATFORM_FEE_INCOME'
  | 'TAX_GST_PAYABLE'
  | 'REFUND_CLEARING'
  | 'PROMOTIONAL_DISCOUNT_EXPENSE'
  | 'SPONSORSHIP_ESCROW';

export type EntryType = 'DEBIT' | 'CREDIT';

export interface JournalLine {
  account: LedgerAccount;
  entryType: EntryType;
  amountMinor: number;
  currency: string;
  description: string;
}

export interface JournalEntry {
  id: string;
  referenceId: string;
  referenceType: 'ORDER_SETTLEMENT' | 'ORDER_REFUND' | 'PAYOUT_DISBURSEMENT' | 'PROMOTIONAL_SETTLEMENT' | 'SPONSORSHIP_PLEDGE';
  timestamp: string;
  lines: JournalLine[];
}

export function validateJournalEntry(entry: JournalEntry): boolean {
  if (!entry.lines || entry.lines.length === 0) return false;
  let totalDebit = 0;
  let totalCredit = 0;
  for (const line of entry.lines) {
    if (line.amountMinor <= 0) return false;
    if (line.entryType === 'DEBIT') {
      totalDebit += line.amountMinor;
    } else if (line.entryType === 'CREDIT') {
      totalCredit += line.amountMinor;
    } else {
      return false;
    }
  }
  return totalDebit === totalCredit && totalDebit > 0;
}

export function createSettlementJournalEntry(params: {
  orderId: string;
  totalPaidMinor: number;
  platformFeeMinor: number;
  taxMinor: number;
  providerPayoutMinor: number;
  currency?: string;
  id?: string;
}): JournalEntry {
  const {
    orderId,
    totalPaidMinor,
    platformFeeMinor,
    taxMinor,
    providerPayoutMinor,
    currency = 'INR',
    id
  } = params;

  if (totalPaidMinor !== platformFeeMinor + taxMinor + providerPayoutMinor) {
    throw new Error(
      `LEDGER_IMBALANCE: Total paid (${totalPaidMinor}) must equal sum of platform fee (${platformFeeMinor}), tax (${taxMinor}), and provider payout (${providerPayoutMinor})`
    );
  }

  const lines: JournalLine[] = [
    {
      account: 'ESCROW_HOLD',
      entryType: 'DEBIT',
      amountMinor: totalPaidMinor,
      currency,
      description: `Release funds from escrow for order ${orderId}`
    },
    {
      account: 'PROVIDER_PAYABLE',
      entryType: 'CREDIT',
      amountMinor: providerPayoutMinor,
      currency,
      description: `Net earnings payable to provider for order ${orderId}`
    },
    {
      account: 'PLATFORM_FEE_INCOME',
      entryType: 'CREDIT',
      amountMinor: platformFeeMinor,
      currency,
      description: `CricOS platform service fee for order ${orderId}`
    }
  ];

  if (taxMinor > 0) {
    lines.push({
      account: 'TAX_GST_PAYABLE',
      entryType: 'CREDIT',
      amountMinor: taxMinor,
      currency,
      description: `GST collected on platform fee for order ${orderId}`
    });
  }

  const entry: JournalEntry = {
    id: id || `je_${orderId.replace(/-/g, '').slice(0, 8)}_${Date.now()}`,
    referenceId: orderId,
    referenceType: 'ORDER_SETTLEMENT',
    timestamp: new Date().toISOString(),
    lines
  };

  if (!validateJournalEntry(entry)) {
    throw new Error('LEDGER_VALIDATION_FAILED: Journal entry debits and credits do not balance');
  }

  return entry;
}

export function createRefundJournalEntry(params: {
  orderId: string;
  refundAmountMinor: number;
  currency?: string;
  id?: string;
}): JournalEntry {
  const { orderId, refundAmountMinor, currency = 'INR', id } = params;

  if (refundAmountMinor <= 0) {
    throw new Error('LEDGER_INVALID_AMOUNT: Refund amount must be greater than zero');
  }

  const lines: JournalLine[] = [
    {
      account: 'REFUND_CLEARING',
      entryType: 'DEBIT',
      amountMinor: refundAmountMinor,
      currency,
      description: `Refund clearing transit debit for order ${orderId}`
    },
    {
      account: 'ESCROW_HOLD',
      entryType: 'CREDIT',
      amountMinor: refundAmountMinor,
      currency,
      description: `Release escrow hold back to customer for order ${orderId}`
    }
  ];

  const entry: JournalEntry = {
    id: id || `je_ref_${orderId.replace(/-/g, '').slice(0, 8)}_${Date.now()}`,
    referenceId: orderId,
    referenceType: 'ORDER_REFUND',
    timestamp: new Date().toISOString(),
    lines
  };

  if (!validateJournalEntry(entry)) {
    throw new Error('LEDGER_VALIDATION_FAILED: Refund journal entry does not balance');
  }

  return entry;
}

export function createPromotionalSettlementJournalEntry(params: {
  orderId: string;
  totalPaidByCustomerMinor: number;
  discountSubsidyMinor: number;
  platformFeeMinor: number;
  taxMinor: number;
  providerPayoutMinor: number;
  currency?: string;
  id?: string;
}): JournalEntry {
  const {
    orderId,
    totalPaidByCustomerMinor,
    discountSubsidyMinor,
    platformFeeMinor,
    taxMinor,
    providerPayoutMinor,
    currency = 'INR',
    id
  } = params;

  const totalFunds = totalPaidByCustomerMinor + discountSubsidyMinor;
  const totalOutflows = providerPayoutMinor + platformFeeMinor + taxMinor;

  if (totalFunds !== totalOutflows) {
    throw new Error(
      `LEDGER_IMBALANCE: Total funds (${totalFunds}) must equal total outflows (${totalOutflows})`
    );
  }

  const lines: JournalLine[] = [
    {
      account: 'ESCROW_HOLD',
      entryType: 'DEBIT',
      amountMinor: totalPaidByCustomerMinor,
      currency,
      description: `Customer escrow release for order ${orderId}`
    },
    {
      account: 'PROMOTIONAL_DISCOUNT_EXPENSE',
      entryType: 'DEBIT',
      amountMinor: discountSubsidyMinor,
      currency,
      description: `Platform promotional subsidy absorbed for order ${orderId}`
    },
    {
      account: 'PROVIDER_PAYABLE',
      entryType: 'CREDIT',
      amountMinor: providerPayoutMinor,
      currency,
      description: `Net earnings payable to provider for order ${orderId}`
    },
    {
      account: 'PLATFORM_FEE_INCOME',
      entryType: 'CREDIT',
      amountMinor: platformFeeMinor,
      currency,
      description: `CricOS platform service fee for order ${orderId}`
    }
  ];

  if (taxMinor > 0) {
    lines.push({
      account: 'TAX_GST_PAYABLE',
      entryType: 'CREDIT',
      amountMinor: taxMinor,
      currency,
      description: `GST collected on platform fee for order ${orderId}`
    });
  }

  const entry: JournalEntry = {
    id: id || `je_promo_${orderId.replace(/-/g, '').slice(0, 8)}_${Date.now()}`,
    referenceId: orderId,
    referenceType: 'PROMOTIONAL_SETTLEMENT',
    timestamp: new Date().toISOString(),
    lines
  };

  if (!validateJournalEntry(entry)) {
    throw new Error('LEDGER_VALIDATION_FAILED: Promotional settlement journal entry does not balance');
  }

  return entry;
}

export function createSponsorshipJournalEntry(params: {
  tournamentId: string;
  pledgeAmountMinor: number;
  sponsorName: string;
  currency?: string;
  id?: string;
}): JournalEntry {
  const { tournamentId, pledgeAmountMinor, sponsorName, currency = 'INR', id } = params;

  if (pledgeAmountMinor <= 0) {
    throw new Error('LEDGER_INVALID_AMOUNT: Pledge amount must be greater than zero');
  }

  const lines: JournalLine[] = [
    {
      account: 'SPONSORSHIP_ESCROW',
      entryType: 'DEBIT',
      amountMinor: pledgeAmountMinor,
      currency,
      description: `Sponsorship escrow pledge from ${sponsorName} for tournament ${tournamentId}`
    },
    {
      account: 'PROVIDER_PAYABLE',
      entryType: 'CREDIT',
      amountMinor: pledgeAmountMinor,
      currency,
      description: `Prize pool allocation from sponsor ${sponsorName} for tournament ${tournamentId}`
    }
  ];

  const entry: JournalEntry = {
    id: id || `je_spons_${tournamentId.replace(/-/g, '').slice(0, 8)}_${Date.now()}`,
    referenceId: tournamentId,
    referenceType: 'SPONSORSHIP_PLEDGE',
    timestamp: new Date().toISOString(),
    lines
  };

  if (!validateJournalEntry(entry)) {
    throw new Error('LEDGER_VALIDATION_FAILED: Sponsorship journal entry does not balance');
  }

  return entry;
}

