import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  createSettlementJournalEntry,
  createRefundJournalEntry,
  validateJournalEntry,
  type JournalEntry
} from '../dist/index.js';

describe('Commercial Package — Double-Entry Financial Settlement Ledger', () => {
  it('creates balanced journal entry for order settlement with platform fee and GST', () => {
    // Total: INR 5,000. Platform Fee: 5% = 250. GST (18% on fee): 45. Net to Provider: 4705.
    const entry = createSettlementJournalEntry({
      orderId: '00000000-0000-0000-0000-000000000001',
      totalPaidMinor: 500000,
      platformFeeMinor: 25000,
      taxMinor: 4500,
      providerPayoutMinor: 470500,
      currency: 'INR'
    });

    assert.strictEqual(entry.referenceId, '00000000-0000-0000-0000-000000000001');
    assert.strictEqual(entry.referenceType, 'ORDER_SETTLEMENT');
    assert.strictEqual(entry.lines.length, 4);

    const debitTotal = entry.lines
      .filter((l) => l.entryType === 'DEBIT')
      .reduce((sum, l) => sum + l.amountMinor, 0);

    const creditTotal = entry.lines
      .filter((l) => l.entryType === 'CREDIT')
      .reduce((sum, l) => sum + l.amountMinor, 0);

    assert.strictEqual(debitTotal, 500000);
    assert.strictEqual(creditTotal, 500000);
    assert.strictEqual(debitTotal, creditTotal);
    assert.strictEqual(validateJournalEntry(entry), true);
  });

  it('rejects imbalanced journal entries where total != fee + tax + payout', () => {
    assert.throws(
      () => {
        createSettlementJournalEntry({
          orderId: 'ord-bad-1',
          totalPaidMinor: 100000,
          platformFeeMinor: 5000,
          taxMinor: 900,
          providerPayoutMinor: 90000 // sum is 95900, NOT 100000
        });
      },
      /LEDGER_IMBALANCE/
    );
  });

  it('creates balanced refund journal entry releasing escrow hold', () => {
    const entry = createRefundJournalEntry({
      orderId: 'ord-ref-001',
      refundAmountMinor: 120000,
      currency: 'INR'
    });

    assert.strictEqual(entry.referenceType, 'ORDER_REFUND');
    assert.strictEqual(entry.lines.length, 2);

    const debit = entry.lines.find((l) => l.account === 'REFUND_CLEARING');
    const credit = entry.lines.find((l) => l.account === 'ESCROW_HOLD');

    assert.strictEqual(debit?.entryType, 'DEBIT');
    assert.strictEqual(debit?.amountMinor, 120000);
    assert.strictEqual(credit?.entryType, 'CREDIT');
    assert.strictEqual(credit?.amountMinor, 120000);
    assert.strictEqual(validateJournalEntry(entry), true);
  });

  it('validateJournalEntry rejects invalid or manipulated journal entries', () => {
    const invalidEntry: JournalEntry = {
      id: 'je-invalid',
      referenceId: 'ref-1',
      referenceType: 'ORDER_SETTLEMENT',
      timestamp: new Date().toISOString(),
      lines: [
        { account: 'ESCROW_HOLD', entryType: 'DEBIT', amountMinor: 100, currency: 'INR', description: '' },
        { account: 'PROVIDER_PAYABLE', entryType: 'CREDIT', amountMinor: 50, currency: 'INR', description: '' }
      ]
    };

    assert.strictEqual(validateJournalEntry(invalidEntry), false);
  });
});
