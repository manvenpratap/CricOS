import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  getDefaultNotifications,
  filterNotifications,
  markAllAsRead,
  getUnreadCount,
  renderNotificationsDrawerHtml,
  getDefaultAdminCases,
  verifyLedgerAuditIntegrity,
  renderAdminDeskHtml,
  getDefaultProviderSlots,
  calculateProviderEarnings,
  renderProviderStorefrontModalHtml,
} from '../dist/index.js';

describe('Advanced UX & Operational Components (UX-018, UX-025, UX-027)', () => {
  test('Notification Center: computes unread counts and filters by category', () => {
    const notifs = getDefaultNotifications();
    assert.strictEqual(notifs.length, 5);

    const unread = getUnreadCount(notifs);
    assert.strictEqual(unread, 3);

    const matchNotifs = filterNotifications(notifs, 'MATCH');
    assert.strictEqual(matchNotifs.length, 2);

    const financialNotifs = filterNotifications(notifs, 'FINANCIAL');
    assert.strictEqual(financialNotifs.length, 1);

    const marked = markAllAsRead(notifs);
    assert.strictEqual(getUnreadCount(marked), 0);

    const html = renderNotificationsDrawerHtml(notifs);
    assert.match(html, /Notification Center/);
    assert.match(html, /notificationsDrawer/);
    assert.match(html, /data-tooltip/);
  });

  test('Admin Desk: verifies zero-sum ledger audit balance and renders cases', () => {
    // Balanced scenario:
    // Debits = 100000 (Escrow) + 5000 (Refund) = 105000
    // Credits = 85000 (Payable) + 15000 (Fee) + 5000 (GST) = 105000
    const balancedAudit = verifyLedgerAuditIntegrity(100000, 85000, 15000, 5000, 5000);
    assert.strictEqual(balancedAudit.isBalanced, true);
    assert.strictEqual(balancedAudit.imbalanceMinor, 0);

    // Imbalanced scenario:
    const imbalancedAudit = verifyLedgerAuditIntegrity(100000, 90000, 15000, 5000, 5000);
    assert.strictEqual(imbalancedAudit.isBalanced, false);
    assert.strictEqual(imbalancedAudit.imbalanceMinor, 5000);

    const cases = getDefaultAdminCases();
    assert.strictEqual(cases.length, 3);

    const html = renderAdminDeskHtml(cases, balancedAudit);
    assert.match(html, /Settlement Audit Desk/);
    assert.match(html, /100% BALANCED/);
    assert.match(html, /CASE-9041/);
  });

  test('Provider Storefront: calculates commercial earnings breakdown and renders capacity manager', () => {
    const grossMinor = 10000000; // ₹100,000
    const earnings = calculateProviderEarnings(grossMinor);

    // Platform fee 5% = 500,000 minor
    assert.strictEqual(earnings.platformFeeMinor, 500000);
    // GST 18% on fee = 90,000 minor
    assert.strictEqual(earnings.taxGstMinor, 90000);
    // Net payable = 10,000,000 - 500,000 - 90,000 = 9,410,000
    assert.strictEqual(earnings.netPayableMinor, 9410000);
    assert.strictEqual(earnings.disbursedMinor + earnings.pendingDisbursementMinor, earnings.netPayableMinor);

    const slots = getDefaultProviderSlots();
    assert.strictEqual(slots.length, 5);

    const modalHtml = renderProviderStorefrontModalHtml(slots, earnings);
    assert.match(modalHtml, /modalProviderStorefront/);
    assert.match(modalHtml, /Published Match Slots/);
    assert.match(modalHtml, /Natural Turf/);
    assert.match(modalHtml, /data-tooltip/);
  });
});
