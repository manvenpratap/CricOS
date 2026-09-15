import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateTotal, buildCommercialSnapshot } from '../dist/index.js';

describe('Commercial Package', () => {
  it('calculates total correctly from snapshot input', () => {
    const result = calculateTotal({
      subtotal_minor: 10000,
      fee_minor: 500,
      tax_minor: 90,
      discount_minor: 100,
      currency: 'INR',
      policy_version: '2026.1'
    });

    assert.equal(result.total_minor, 10490);
    assert.equal(result.currency, 'INR');
  });

  it('throws when total is negative', () => {
    assert.throws(() => {
      calculateTotal({
        subtotal_minor: 100,
        fee_minor: 10,
        tax_minor: 5,
        discount_minor: 500, // discount exceeds sum
        currency: 'INR',
        policy_version: '2026.1'
      });
    }, /COMMERCIAL_NEGATIVE_TOTAL/);
  });

  it('buildCommercialSnapshot calculates fees and taxes accurately', () => {
    const snapshot = buildCommercialSnapshot({
      subtotal_minor: 250000, // Rs 2,500.00
      fee_percentage_bps: 500, // 5% fee = Rs 125.00 (12500 minor)
      tax_percentage_bps: 1800, // 18% GST on fee = Rs 22.50 (2250 minor)
      discount_minor: 0,
      currency: 'INR'
    });

    assert.equal(snapshot.subtotal_minor, 250000);
    assert.equal(snapshot.fee_minor, 12500);
    assert.equal(snapshot.tax_minor, 2250);
    assert.equal(snapshot.total_minor, 264750);
    assert.equal(snapshot.currency, 'INR');
  });
});
