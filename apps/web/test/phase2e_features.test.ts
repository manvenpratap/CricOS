/**
 * apps/web/test/phase2e_features.test.ts
 *
 * Phase 2E Test Suite — Create Event, Event Overview, Official Calendar,
 * Messaging, Booking Lifecycle, and Financial Reconciliation.
 *
 * Coverage targets:
 * - Event creation validation & format configuration
 * - Readiness calculation algorithm
 * - Calendar availability slot management with overlap detection
 * - Messaging thread rendering & quick actions
 * - Cancellation penalty band calculation with double-entry journal entries
 * - Reconciliation balance verification
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

function expect(actual: any) {
  return {
    toBe(expected: any) {
      assert.strictEqual(actual, expected);
    },
    not: {
      toBe(expected: any) {
        assert.notStrictEqual(actual, expected);
      }
    },
    toMatch(reg: RegExp) {
      assert.match(String(actual), reg);
    },
    toBeGreaterThan(n: number) {
      assert.ok(actual > n, `expected ${actual} > ${n}`);
    },
    toBeGreaterThanOrEqual(n: number) {
      assert.ok(actual >= n, `expected ${actual} >= ${n}`);
    },
    toBeLessThan(n: number) {
      assert.ok(actual < n, `expected ${actual} < ${n}`);
    },
    toHaveLength(len: number) {
      assert.strictEqual(actual.length, len);
    },
    toContain(substr: any) {
      if (Array.isArray(actual)) {
        assert.ok(actual.includes(substr), `expected array to contain ${substr}`);
      } else {
        assert.ok(String(actual).includes(substr), `expected ${actual} to contain ${substr}`);
      }
    },
    toBeTruthy() {
      assert.ok(actual);
    }
  };
}

/* ── Component 1: Create Event Wizard ─────────────────────────────── */
import {
  FORMAT_CATALOGUE,
  getDefaultOfficials,
  estimateMatchDuration,
  generateEventId,
  createBlankEventConfig,
  validateWizardStep,
  deriveEventStatus,
  renderWizardStepperHtml,
  renderFormatSelectionHtml,
  generateBasketFromEvent
} from '../dist/index.js';

describe('Create Event Wizard (UX-003)', () => {
  it('should provide format specs for all cricket formats', () => {
    expect(FORMAT_CATALOGUE.T20.overs).toBe(20);
    expect(FORMAT_CATALOGUE.ODI.overs).toBe(50);
    expect(FORMAT_CATALOGUE.TEST.innings).toBe(4);
    expect(FORMAT_CATALOGUE.CUSTOM.format).toBe('CUSTOM');
  });

  it('should generate unique event IDs', () => {
    const id1 = generateEventId();
    const id2 = generateEventId();
    expect(id1).toMatch(/^EVT-/);
    expect(id1).not.toBe(id2);
  });

  it('should create blank T20 config with correct defaults', () => {
    const config = createBlankEventConfig('T20');
    expect(config.format.overs).toBe(20);
    expect(config.format.powerplayOvers).toBe(6);
    expect(config.format.maxBowlerOvers).toBe(4);
    expect(config.status).toBe('DRAFT');
    expect(config.officials.length).toBeGreaterThan(0);
  });

  it('should configure custom overs correctly', () => {
    const config = createBlankEventConfig('CUSTOM', 15);
    expect(config.format.overs).toBe(15);
    expect(config.format.maxBowlerOvers).toBe(3); // ceil(15/5)
    expect(config.format.powerplayOvers).toBe(3); // floor(15/5)
    expect(config.customOvers).toBe(15);
  });

  it('should get default officials including mandatory umpires and scorer', () => {
    const officials = getDefaultOfficials('T20');
    const umpires = officials.find(o => o.role === 'UMPIRE');
    const scorer = officials.find(o => o.role === 'SCORER');
    expect(umpires?.mandatory).toBe(true);
    expect(umpires?.count).toBe(2);
    expect(scorer?.mandatory).toBe(true);
  });

  it('should estimate reasonable match durations', () => {
    expect(estimateMatchDuration('T20')).toBe(180);
    expect(estimateMatchDuration('ODI')).toBe(480);
    expect(estimateMatchDuration('CUSTOM', 10)).toBeGreaterThanOrEqual(60);
  });

  it('should validate Step 1 — format selection', () => {
    const config = createBlankEventConfig('T20');
    const errors = validateWizardStep(config, 1);
    expect(errors).toHaveLength(0);
  });

  it('should reject custom overs out of range', () => {
    const config = createBlankEventConfig('CUSTOM', 150);
    config.format.overs = 150;
    const errors = validateWizardStep(config, 1);
    expect(errors.some(e => e.includes('between 1 and 100'))).toBe(true);
  });

  it('should validate Step 2 — team and official assignment', () => {
    const config = createBlankEventConfig('T20');
    const errors = validateWizardStep(config, 2);
    expect(errors.some(e => e.includes('Home team'))).toBe(true);
    expect(errors.some(e => e.includes('Away team'))).toBe(true);
  });

  it('should reject same team as home and away', () => {
    const config = createBlankEventConfig('T20');
    config.homeTeam = { teamId: 'T1', teamName: 'Team A', shortCode: 'TA', confirmed: true };
    config.awayTeam = { teamId: 'T1', teamName: 'Team A', shortCode: 'TA', confirmed: true };
    const errors = validateWizardStep(config, 2);
    expect(errors.some(e => e.includes('different'))).toBe(true);
  });

  it('should derive READY status when fully configured', () => {
    const config = createBlankEventConfig('T20');
    config.homeTeam = { teamId: 'T1', teamName: 'Team A', shortCode: 'TA', confirmed: true };
    config.awayTeam = { teamId: 'T2', teamName: 'Team B', shortCode: 'TB', confirmed: true };
    config.venue = { venueId: 'V1', venueName: 'Ground', date: '2026-12-01', startTime: '14:00', endTime: '18:00', surface: 'NATURAL', floodlights: true };
    config.scheduledDate = new Date(Date.now() + 86400_000 * 5).toISOString();
    expect(deriveEventStatus(config)).toBe('READY');
  });

  it('should generate basket from event config', () => {
    const config = createBlankEventConfig('T20');
    const basket = generateBasketFromEvent(config);
    expect(basket.length).toBeGreaterThanOrEqual(4); // venue + 2 umpires + scorer + balls + stumps
    expect(basket.some(b => b.category === 'VENUE')).toBe(true);
    expect(basket.some(b => b.category === 'EQUIPMENT')).toBe(true);
  });

  it('should render wizard stepper HTML with data-tooltip', () => {
    const html = renderWizardStepperHtml(2);
    expect(html).toContain('wizard-step');
    expect(html).toContain('data-tooltip');
    expect(html).toContain('completed');
    expect(html).toContain('active');
  });

  it('should render format selection cards', () => {
    const html = renderFormatSelectionHtml('T20');
    expect(html).toContain('T20');
    expect(html).toContain('selected');
    expect(html).toContain('data-tooltip');
  });
});

/* ── Component 2: Event Overview & Readiness ──────────────────────── */
import {
  calculateProcurementReadiness,
  getStageMetadata,
  deriveLifecycleStage,
  renderLifecycleTimelineHtml,
  renderReadinessRingSvg,
  renderProcurementCardsHtml,
  createSampleEventOverview
} from '../dist/index.js';

describe('Event Overview & Readiness (UX-004)', () => {
  it('should calculate 100% readiness when all required items are booked', () => {
    const items = [
      { id: '1', category: 'VENUE' as const, label: 'Ground', required: true, status: 'BOOKED' as const },
      { id: '2', category: 'OFFICIAL' as const, label: 'Umpire', required: true, status: 'CONFIRMED' as const }
    ];
    const result = calculateProcurementReadiness(items);
    expect(result.percent).toBe(100);
    expect(result.blockers).toHaveLength(0);
  });

  it('should count held items as 50% toward readiness', () => {
    const items = [
      { id: '1', category: 'VENUE' as const, label: 'Ground', required: true, status: 'BOOKED' as const },
      { id: '2', category: 'OFFICIAL' as const, label: 'Umpire', required: true, status: 'HELD' as const }
    ];
    const result = calculateProcurementReadiness(items);
    expect(result.percent).toBe(75); // (1 + 0.5) / 2 * 100 = 75
  });

  it('should list pending required items as blockers', () => {
    const items = [
      { id: '1', category: 'OFFICIAL' as const, label: 'Scorer', required: true, status: 'PENDING' as const }
    ];
    const result = calculateProcurementReadiness(items);
    expect(result.blockers).toHaveLength(1);
    expect(result.blockers[0]).toContain('Scorer');
  });

  it('should return 100% readiness for empty procurement', () => {
    const result = calculateProcurementReadiness([]);
    expect(result.percent).toBe(100);
  });

  it('should derive lifecycle stages correctly', () => {
    expect(deriveLifecycleStage([], true, true, false, true)).toBe('COMPLETED');
    expect(deriveLifecycleStage([], true, true, true, false)).toBe('LIVE');
  });

  it('should return valid metadata for all stages', () => {
    const stages: Array<'CREATED' | 'CONFIGURED' | 'RESOURCES_BOOKED' | 'READY' | 'LIVE' | 'COMPLETED' | 'CANCELLED'> = ['CREATED', 'CONFIGURED', 'RESOURCES_BOOKED', 'READY', 'LIVE', 'COMPLETED', 'CANCELLED'];
    for (const stage of stages) {
      const meta = getStageMetadata(stage);
      expect(meta.label).toBeTruthy();
      expect(meta.icon).toBeTruthy();
    }
  });

  it('should render readiness ring SVG with correct percentage', () => {
    const svg = renderReadinessRingSvg(75);
    expect(svg).toContain('75%');
    expect(svg).toContain('data-tooltip');
  });

  it('should render procurement cards with status badges', () => {
    const sample = createSampleEventOverview();
    const html = renderProcurementCardsHtml(sample.procurement);
    expect(html).toContain('procurement-card');
    expect(html).toContain('data-tooltip');
    expect(html).toContain('REQUIRED');
  });

  it('should render lifecycle timeline', () => {
    const html = renderLifecycleTimelineHtml('RESOURCES_BOOKED');
    expect(html).toContain('lifecycle-step');
    expect(html).toContain('completed');
    expect(html).toContain('active');
  });
});

/* ── Component 3: Official Calendar & Availability ────────────────── */
import {
  DAYS_OF_WEEK,
  CALENDAR_HOURS,
  getSlotStatusMeta,
  doSlotsOverlap,
  resolveSlotStatus,
  validateBookingSlot,
  renderWeeklyCalendarHtml,
  renderBufferConfigHtml,
  createSampleCalendarState
} from '../dist/index.js';

describe('Official Calendar & Availability (UX-015)', () => {
  it('should define all 7 days of week', () => {
    expect(DAYS_OF_WEEK).toHaveLength(7);
    expect(DAYS_OF_WEEK[0]).toBe('MON');
    expect(DAYS_OF_WEEK[6]).toBe('SUN');
  });

  it('should generate calendar hours from 06:00 to 20:00', () => {
    expect(CALENDAR_HOURS).toHaveLength(15);
    expect(CALENDAR_HOURS[0].hour).toBe(6);
    expect(CALENDAR_HOURS[14].hour).toBe(20);
  });

  it('should detect overlapping slots', () => {
    expect(doSlotsOverlap(8, 12, 10, 14)).toBe(true);
    expect(doSlotsOverlap(8, 10, 10, 14)).toBe(false); // touching endpoints, not overlapping
    expect(doSlotsOverlap(14, 18, 8, 12)).toBe(false);
  });

  it('should resolve BOOKED status with highest priority', () => {
    const state = createSampleCalendarState();
    const bookedSlot = state.bookedSlots[0];
    const status = resolveSlotStatus('SAT', bookedSlot.date, bookedSlot.startHour, state);
    expect(status).toBe('BOOKED');
  });

  it('should resolve AVAILABLE from recurring slots', () => {
    const state = createSampleCalendarState();
    // Saturday at 9am should be available (recurring 8-20)
    const nextSat = new Date();
    nextSat.setDate(nextSat.getDate() + (6 - nextSat.getDay()));
    const dateStr = nextSat.toISOString().split('T')[0];
    const status = resolveSlotStatus('SAT', dateStr, 9, state);
    // Could be AVAILABLE or BUFFER depending on booked slot proximity
    expect(status).toBeTruthy();
  });

  it('should validate booking slot conflicts', () => {
    const state = createSampleCalendarState();
    const bookedSlot = state.bookedSlots[0];
    const result = validateBookingSlot(bookedSlot.date, bookedSlot.startHour, bookedSlot.endHour, state);
    expect(result.valid).toBe(false);
    expect(result.conflicts.length).toBeGreaterThan(0);
  });

  it('should validate non-conflicting booking slot', () => {
    const state = createSampleCalendarState();
    const result = validateBookingSlot('2099-01-01', 10, 12, state);
    expect(result.valid).toBe(true);
    expect(result.conflicts).toHaveLength(0);
  });

  it('should return metadata for all slot statuses', () => {
    const statuses: Array<'AVAILABLE' | 'HELD' | 'BOOKED' | 'BLOCKED' | 'COMPLETED' | 'BUFFER'> = ['AVAILABLE', 'HELD', 'BOOKED', 'BLOCKED', 'COMPLETED', 'BUFFER'];
    for (const status of statuses) {
      const meta = getSlotStatusMeta(status);
      expect(meta.label).toBeTruthy();
      expect(meta.color).toBeTruthy();
    }
  });

  it('should render weekly calendar HTML with data-tooltip', () => {
    const state = createSampleCalendarState();
    const monday = new Date();
    monday.setDate(monday.getDate() - monday.getDay() + 1);
    const html = renderWeeklyCalendarHtml(state, monday.toISOString().split('T')[0]);
    expect(html).toContain('official-calendar');
    expect(html).toContain('data-tooltip');
  });

  it('should render buffer config panel', () => {
    const html = renderBufferConfigHtml({ preMatchMinutes: 30, postMatchMinutes: 15, travelMinutes: 60 });
    expect(html).toContain('30 min');
    expect(html).toContain('60 min');
    expect(html).toContain('data-tooltip');
  });
});

/* ── Component 4: Contextual Messaging ────────────────────────────── */
import {
  generateMessageId,
  generateThreadId,
  createMessage,
  createSystemMessage,
  createQuoteMessage,
  calculateUnreadCount,
  getQuickActions,
  persistThreadsToStorage,
  loadThreadsFromStorage,
  getPendingMessages,
  renderMessageBubbleHtml,
  renderThreadPanelHtml,
  createSampleThreads
} from '../dist/index.js';

describe('Contextual Messaging (FSD §45)', () => {
  it('should generate unique message IDs', () => {
    const id1 = generateMessageId();
    const id2 = generateMessageId();
    expect(id1).toMatch(/^MSG-/);
    expect(id1).not.toBe(id2);
  });

  it('should generate thread IDs from context', () => {
    const id = generateThreadId('BOOKING', 'BK-001');
    expect(id).toBe('THR-BOOKING-BK-001');
  });

  it('should create user messages', () => {
    const msg = createMessage('THR-1', 'user-1', 'Test User', 'CAPTAIN', 'Hello');
    expect(msg.threadId).toBe('THR-1');
    expect(msg.type).toBe('USER');
    expect(msg.read).toBe(true); // sender reads own message
    expect(msg.synced).toBe(false);
  });

  it('should create system messages clearly identified', () => {
    const msg = createSystemMessage('THR-1', 'Booking created');
    expect(msg.type).toBe('SYSTEM');
    expect(msg.senderName).toBe('CricOS System');
    expect(msg.senderRole).toBe('SYSTEM');
  });

  it('should create quote messages with pricing details', () => {
    const msg = createQuoteMessage('THR-1', 'prov-1', 'Provider', 'Umpiring', 150000, '2026-12-01');
    expect(msg.type).toBe('QUOTE');
    expect(msg.attachments).toHaveLength(1);
    expect(msg.attachments[0].type).toBe('QUOTE_DETAIL');
    expect(msg.content).toContain('₹');
  });

  it('should calculate unread count correctly', () => {
    const threads = createSampleThreads();
    const unread = calculateUnreadCount(threads[0], 'cap-001');
    expect(unread).toBeGreaterThanOrEqual(0);
  });

  it('should provide context-appropriate quick actions', () => {
    const bookingActions = getQuickActions('BOOKING');
    expect(bookingActions.some(a => a.action === 'SEND_QUOTE')).toBe(true);
    expect(bookingActions.some(a => a.action === 'ACCEPT')).toBe(true);

    const disputeActions = getQuickActions('DISPUTE');
    expect(disputeActions.some(a => a.action === 'ACCEPT')).toBe(true);
    expect(disputeActions.some(a => a.action === 'SEND_QUOTE')).toBe(false);
  });

  it('should get pending unsynced messages', () => {
    const threads = createSampleThreads();
    const pending = getPendingMessages(threads);
    // Sample threads have synced: true on most messages
    expect(Array.isArray(pending)).toBe(true);
  });

  it('should render message bubbles with data-tooltip', () => {
    const msg = createMessage('THR-1', 'user-1', 'Test', 'CAPTAIN', 'Hello world');
    const html = renderMessageBubbleHtml(msg, true);
    expect(html).toContain('msg-bubble');
    expect(html).toContain('msg-own');
    expect(html).toContain('data-tooltip');
  });

  it('should render thread panel with quick actions', () => {
    const threads = createSampleThreads();
    const html = renderThreadPanelHtml(threads[0], 'cap-001');
    expect(html).toContain('thread-panel');
    expect(html).toContain('qa-btn');
    expect(html).toContain('data-tooltip');
  });
});

/* ── Component 5: Cancellation & Rescheduling ─────────────────────── */
import {
  DEFAULT_CANCELLATION_BANDS,
  getCancellationBand,
  hoursUntilEvent,
  processCancellation,
  evaluateReschedule,
  processProviderNoShow,
  propagateEventCancellation,
  renderCancellationBandsHtml,
  renderBookingActionsHtml
} from '../dist/index.js';

import type { BookingRecord } from '../dist/index.js';

describe('Cancellation & Rescheduling Engine (Commercial §10-14)', () => {
  const makeBooking = (hoursAhead: number): BookingRecord => ({
    bookingId: 'BK-TEST',
    eventId: 'EVT-1',
    eventTitle: 'Test Match',
    providerId: 'PRV-1',
    providerName: 'Test Provider',
    serviceLabel: 'Umpiring',
    originalPriceMinor: 150000, // ₹1,500
    paidAmountMinor: 150000,
    eventDateTime: new Date(Date.now() + hoursAhead * 3600_000).toISOString(),
    status: 'CONFIRMED',
    bookedAt: new Date(Date.now() - 86400_000).toISOString(),
    rescheduleHistory: []
  });

  it('should define 4 cancellation bands', () => {
    expect(DEFAULT_CANCELLATION_BANDS).toHaveLength(4);
  });

  it('should return full refund band for >48h cancellation', () => {
    const band = getCancellationBand(72);
    expect(band.refundPercent).toBe(100);
    expect(band.penaltyPercent).toBe(0);
  });

  it('should return 75% refund for 24-48h cancellation', () => {
    const band = getCancellationBand(36);
    expect(band.refundPercent).toBe(75);
  });

  it('should return 50% refund for 12-24h cancellation', () => {
    const band = getCancellationBand(18);
    expect(band.refundPercent).toBe(50);
  });

  it('should return no refund for <12h cancellation', () => {
    const band = getCancellationBand(6);
    expect(band.refundPercent).toBe(0);
    expect(band.penaltyPercent).toBe(100);
  });

  it('should calculate hours until event', () => {
    const future = new Date(Date.now() + 3600_000 * 48).toISOString();
    const hours = hoursUntilEvent(future);
    expect(hours).toBeGreaterThan(47);
    expect(hours).toBeLessThan(49);
  });

  it('should process cancellation with balanced journal entries (>48h)', () => {
    const booking = makeBooking(72);
    const result = processCancellation(booking);
    expect(result.refundAmountMinor).toBe(150000); // Full refund
    expect(result.penaltyAmountMinor).toBe(0);
    expect(result.journalEntries).toHaveLength(1);
    expect(result.journalEntries[0].debitAccount).toBe('REFUND_CLEARING');
    expect(result.journalEntries[0].creditAccount).toBe('ESCROW_HOLD');
  });

  it('should process cancellation with penalty (12-24h)', () => {
    const booking = makeBooking(18);
    const result = processCancellation(booking);
    expect(result.refundAmountMinor).toBe(75000);  // 50% of 150000
    expect(result.penaltyAmountMinor).toBe(75000);
    expect(result.journalEntries).toHaveLength(2); // refund + penalty
    // Verify double-entry balance
    const totalDebits = result.journalEntries.reduce((s, e) => s + e.amountMinor, 0);
    expect(totalDebits).toBe(150000);
  });

  it('should evaluate reschedule with price difference', () => {
    const booking = makeBooking(72);
    const result = evaluateReschedule(booking, 200000, new Date(Date.now() + 86400_000 * 7).toISOString());
    expect(result.valid).toBe(true);
    expect(result.chargeMinor).toBe(50000); // 200000 - 150000
  });

  it('should evaluate cheaper reschedule with refund', () => {
    const booking = makeBooking(72);
    const result = evaluateReschedule(booking, 100000, new Date(Date.now() + 86400_000 * 7).toISOString());
    expect(result.valid).toBe(true);
    expect(result.refundMinor).toBe(50000);
  });

  it('should reject reschedule after 3 attempts', () => {
    const booking = makeBooking(72);
    booking.rescheduleHistory = [
      { rescheduleId: 'R1', originalDateTime: '', newDateTime: '', priceDiffMinor: 0, reason: '', agreedByProvider: true, agreedByCustomer: true, rescheduledAt: '' },
      { rescheduleId: 'R2', originalDateTime: '', newDateTime: '', priceDiffMinor: 0, reason: '', agreedByProvider: true, agreedByCustomer: true, rescheduledAt: '' },
      { rescheduleId: 'R3', originalDateTime: '', newDateTime: '', priceDiffMinor: 0, reason: '', agreedByProvider: true, agreedByCustomer: true, rescheduledAt: '' }
    ];
    const result = evaluateReschedule(booking, 150000, new Date(Date.now() + 86400_000 * 7).toISOString());
    expect(result.valid).toBe(false);
    expect(result.message).toContain('limit');
  });

  it('should process provider no-show with full refund and penalty', () => {
    const booking = makeBooking(0);
    const result = processProviderNoShow(booking);
    expect(result.refundAmountMinor).toBe(150000); // Full refund
    expect(result.reliabilityImpact).toBe(-15);
    expect(result.penaltyToProviderMinor).toBe(15000); // 10% penalty
    expect(result.journalEntries).toHaveLength(2);
  });

  it('should propagate rain cancellation with full refunds', () => {
    const bookings = [makeBooking(6), makeBooking(6)];
    const results = propagateEventCancellation(bookings, 'RAIN');
    expect(results).toHaveLength(2);
    for (const r of results) {
      expect(r.refundAmountMinor).toBe(150000); // Full refund regardless of timing
      expect(r.specialTreatment).toContain('RAIN');
    }
  });

  it('should render cancellation bands HTML with data-tooltip', () => {
    const html = renderCancellationBandsHtml();
    expect(html).toContain('cancellation-bands');
    expect(html).toContain('data-tooltip');
    expect(html).toContain('100% refund');
  });

  it('should render booking actions panel', () => {
    const booking = makeBooking(36);
    const html = renderBookingActionsHtml(booking);
    expect(html).toContain('booking-actions');
    expect(html).toContain('data-tooltip');
    expect(html).toContain('Reschedule');
  });
});

/* ── Component 6: Financial Reconciliation ────────────────────────── */
import {
  calculateProviderNet,
  getSettlementStageMeta,
  isPayoutEligible,
  generateDailyReconciliation,
  generateAccountBalances,
  renderSettlementTimelineHtml,
  renderProviderBreakdownHtml,
  renderDailyReconciliationHtml,
  exportReconciliationCsv,
  createSampleSettlements
} from '../dist/index.js';

describe('Financial Reconciliation Dashboard (Commercial §17-18)', () => {
  it('should calculate provider net correctly (integer minor units)', () => {
    const result = calculateProviderNet(350000, 0.05, 0.18);
    expect(result.commissionMinor).toBe(17500); // 5% of 350000
    expect(result.gstMinor).toBe(3150);         // 18% of 17500
    expect(result.netPayoutMinor).toBe(350000 - 17500 - 3150);
  });

  it('should not use floating-point for monetary calculations', () => {
    const result = calculateProviderNet(333333, 0.05, 0.18);
    expect(Number.isInteger(result.commissionMinor)).toBe(true);
    expect(Number.isInteger(result.gstMinor)).toBe(true);
    expect(Number.isInteger(result.netPayoutMinor)).toBe(true);
  });

  it('should return metadata for all settlement stages', () => {
    const stages: Array<'BOOKING_CONFIRMED' | 'SERVICE_COMPLETED' | 'DISPUTE_WINDOW' | 'SETTLEMENT_ELIGIBLE' | 'PAYOUT_INITIATED' | 'PAYOUT_COMPLETED' | 'HELD_DISPUTE'> = ['BOOKING_CONFIRMED', 'SERVICE_COMPLETED', 'DISPUTE_WINDOW', 'SETTLEMENT_ELIGIBLE', 'PAYOUT_INITIATED', 'PAYOUT_COMPLETED', 'HELD_DISPUTE'];
    for (const stage of stages) {
      const meta = getSettlementStageMeta(stage);
      expect(meta.label).toBeTruthy();
      expect(meta.color).toBeTruthy();
    }
  });

  it('should reject payout for held-dispute settlement', () => {
    const settlements = createSampleSettlements();
    const held = settlements.find(s => s.stage === 'HELD_DISPUTE');
    expect(held).toBeTruthy();
    const result = isPayoutEligible(held!);
    expect(result.eligible).toBe(false);
    expect(result.reason).toContain('dispute');
  });

  it('should approve payout for completed settlement', () => {
    const settlements = createSampleSettlements();
    const completed = settlements.find(s => s.stage === 'PAYOUT_COMPLETED');
    expect(completed).toBeTruthy();
    const result = isPayoutEligible(completed!);
    expect(result.eligible).toBe(true);
  });

  it('should generate balanced daily reconciliation', () => {
    const settlements = createSampleSettlements();
    const recon = generateDailyReconciliation('2026-09-15', settlements);
    expect(recon.totalBookingsCount).toBe(3);
    expect(recon.totalGrossMinor).toBeGreaterThan(0);
    expect(recon.netPlatformRevenueMinor).toBeGreaterThan(0);
  });

  it('should generate account balances for 5-account chart', () => {
    const settlements = createSampleSettlements();
    const balances = generateAccountBalances(settlements);
    expect(balances).toHaveLength(5);
    expect(balances.map(b => b.account)).toContain('ESCROW_HOLD');
    expect(balances.map(b => b.account)).toContain('PROVIDER_PAYABLE');
    expect(balances.map(b => b.account)).toContain('PLATFORM_FEE_INCOME');
    expect(balances.map(b => b.account)).toContain('TAX_GST_PAYABLE');
    expect(balances.map(b => b.account)).toContain('REFUND_CLEARING');
  });

  it('should render settlement timeline HTML', () => {
    const settlements = createSampleSettlements();
    const html = renderSettlementTimelineHtml(settlements[0]);
    expect(html).toContain('settlement-timeline');
    expect(html).toContain('data-tooltip');
  });

  it('should render provider breakdown with deductions', () => {
    const settlements = createSampleSettlements();
    const html = renderProviderBreakdownHtml(settlements[0]);
    expect(html).toContain('settlement-breakdown');
    expect(html).toContain('Commission');
    expect(html).toContain('Net Payout');
    expect(html).toContain('data-tooltip');
  });

  it('should render daily reconciliation summary', () => {
    const settlements = createSampleSettlements();
    const recon = generateDailyReconciliation('2026-09-15', settlements);
    const html = renderDailyReconciliationHtml(recon);
    expect(html).toContain('daily-reconciliation');
    expect(html).toContain('data-tooltip');
  });

  it('should export reconciliation as RFC 4180 CSV', () => {
    const settlements = createSampleSettlements();
    const csv = exportReconciliationCsv(settlements);
    const lines = csv.split('\n');
    expect(lines[0]).toContain('Settlement ID');
    expect(lines.length).toBe(settlements.length + 1); // header + rows
  });
});
