export type LedgerAccount =
  | 'ESCROW_HOLD'
  | 'PROVIDER_PAYABLE'
  | 'PLATFORM_FEE_INCOME'
  | 'TAX_GST_PAYABLE'
  | 'REFUND_CLEARING';

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
  referenceType: 'ORDER_SETTLEMENT' | 'ORDER_REFUND' | 'PAYOUT_DISBURSEMENT';
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
