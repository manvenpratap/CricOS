/**
 * apps/web/src/components/booking-lifecycle.ts
 *
 * Cancellation & Rescheduling Engine
 * Derived from Archive Specifications:
 * - 10_Marketplace_Commercial_Policy_Matrix_v1 (§10–14: Cancellation, Rescheduling, Rain Policy)
 * - 01_Functional_Specification_v3 (§46: Payments, Escrow & Settlement)
 * - 08_Sprint_Ready_P0_Backlog_v1 (PAY-001..010, MKT-001..010)
 *
 * Implements configurable cancellation penalty bands, reschedule workflows,
 * provider no-show handling, and rain/weather event cascade propagation.
 * All refunds generate balanced double-entry journal entries.
 */

export type BookingStatus =
  | 'PENDING'
  | 'HELD'
  | 'CONFIRMED'
  | 'RESCHEDULING'
  | 'CANCELLED_BY_CUSTOMER'
  | 'CANCELLED_BY_PROVIDER'
  | 'NO_SHOW'
  | 'COMPLETED'
  | 'DISPUTED';

export interface CancellationBand {
  minHoursBeforeEvent: number;
  maxHoursBeforeEvent: number | null; // null = unlimited
  refundPercent: number;
  penaltyPercent: number;
  label: string;
}

/**
 * Default cancellation policy bands per Commercial Policy Matrix §11.
 * Configurable per category/geography in production.
 */
export const DEFAULT_CANCELLATION_BANDS: CancellationBand[] = [
  { minHoursBeforeEvent: 48, maxHoursBeforeEvent: null, refundPercent: 100, penaltyPercent: 0, label: '> 48 hours — Full refund' },
  { minHoursBeforeEvent: 24, maxHoursBeforeEvent: 48, refundPercent: 75, penaltyPercent: 25, label: '24–48 hours — 75% refund' },
  { minHoursBeforeEvent: 12, maxHoursBeforeEvent: 24, refundPercent: 50, penaltyPercent: 50, label: '12–24 hours — 50% refund' },
  { minHoursBeforeEvent: 0, maxHoursBeforeEvent: 12, refundPercent: 0, penaltyPercent: 100, label: '< 12 hours — No refund' }
];

export interface BookingRecord {
  bookingId: string;
  eventId: string;
  eventTitle: string;
  providerId: string;
  providerName: string;
  serviceLabel: string;
  originalPriceMinor: number;
  paidAmountMinor: number;
  eventDateTime: string; // ISO datetime
  status: BookingStatus;
  bookedAt: string;
  cancelledAt?: string;
  cancelReason?: string;
  rescheduleHistory: RescheduleRecord[];
}

export interface RescheduleRecord {
  rescheduleId: string;
  originalDateTime: string;
  newDateTime: string;
  priceDiffMinor: number;
  reason: string;
  agreedByProvider: boolean;
  agreedByCustomer: boolean;
  rescheduledAt: string;
}

export interface CancellationResult {
  bookingId: string;
  refundAmountMinor: number;
  penaltyAmountMinor: number;
  band: CancellationBand;
  journalEntries: JournalEntry[];
  hoursBeforeEvent: number;
}

export interface JournalEntry {
  entryId: string;
  debitAccount: string;
  creditAccount: string;
  amountMinor: number;
  description: string;
  timestamp: string;
}

export interface RescheduleResult {
  valid: boolean;
  priceDiffMinor: number;
  refundMinor: number;
  chargeMinor: number;
  message: string;
}

export interface ProviderNoShowResult {
  bookingId: string;
  reliabilityImpact: number; // Percentage points deducted
  refundAmountMinor: number;
  penaltyToProviderMinor: number;
  journalEntries: JournalEntry[];
}

/**
 * Determines the applicable cancellation band based on hours before event.
 */
export function getCancellationBand(
  hoursBeforeEvent: number,
  bands: CancellationBand[] = DEFAULT_CANCELLATION_BANDS
): CancellationBand {
  for (const band of bands) {
    const min = band.minHoursBeforeEvent;
    const max = band.maxHoursBeforeEvent;
    if (hoursBeforeEvent >= min && (max === null || hoursBeforeEvent < max)) {
      return band;
    }
  }
  // Fallback: no refund (less than minimum threshold)
  return bands[bands.length - 1]!;
}

/**
 * Calculates hours remaining before the event from now.
 */
export function hoursUntilEvent(eventDateTime: string): number {
  const eventTime = new Date(eventDateTime).getTime();
  const now = Date.now();
  return Math.max(0, (eventTime - now) / (1000 * 60 * 60));
}

/**
 * Processes a customer-initiated cancellation.
 * Returns refund amount, penalty, and balanced double-entry journal entries.
 * All amounts in integer minor units per Invariant #1.
 */
export function processCancellation(
  booking: BookingRecord,
  bands: CancellationBand[] = DEFAULT_CANCELLATION_BANDS
): CancellationResult {
  const hours = hoursUntilEvent(booking.eventDateTime);
  const band = getCancellationBand(hours, bands);

  const refundAmountMinor = Math.round(booking.paidAmountMinor * band.refundPercent / 100);
  const penaltyAmountMinor = booking.paidAmountMinor - refundAmountMinor;
  const timestamp = new Date().toISOString();

  const journalEntries: JournalEntry[] = [];

  if (refundAmountMinor > 0) {
    // Debit REFUND_CLEARING, Credit ESCROW_HOLD (refund to customer)
    journalEntries.push({
      entryId: `JE-CANC-RF-${booking.bookingId}`,
      debitAccount: 'REFUND_CLEARING',
      creditAccount: 'ESCROW_HOLD',
      amountMinor: refundAmountMinor,
      description: `Customer cancellation refund — ${band.label}`,
      timestamp
    });
  }

  if (penaltyAmountMinor > 0) {
    // Debit ESCROW_HOLD, Credit PLATFORM_FEE_INCOME (penalty retained)
    journalEntries.push({
      entryId: `JE-CANC-PN-${booking.bookingId}`,
      debitAccount: 'ESCROW_HOLD',
      creditAccount: 'PLATFORM_FEE_INCOME',
      amountMinor: penaltyAmountMinor,
      description: `Cancellation penalty retained — ${band.label}`,
      timestamp
    });
  }

  return {
    bookingId: booking.bookingId,
    refundAmountMinor,
    penaltyAmountMinor,
    band,
    journalEntries,
    hoursBeforeEvent: hours
  };
}

/**
 * Evaluates a reschedule proposal.
 * Per Commercial Policy Matrix §12: price difference handled explicitly.
 */
export function evaluateReschedule(
  booking: BookingRecord,
  newPriceMinor: number,
  newDateTime: string
): RescheduleResult {
  // Cannot reschedule completed/cancelled bookings
  if (booking.status === 'COMPLETED' || booking.status.startsWith('CANCELLED')) {
    return { valid: false, priceDiffMinor: 0, refundMinor: 0, chargeMinor: 0, message: `Cannot reschedule a ${booking.status} booking` };
  }

  // New date must be in the future
  if (new Date(newDateTime).getTime() <= Date.now()) {
    return { valid: false, priceDiffMinor: 0, refundMinor: 0, chargeMinor: 0, message: 'New date must be in the future' };
  }

  // Check reschedule count limit (max 3 per Commercial Policy)
  if (booking.rescheduleHistory.length >= 3) {
    return { valid: false, priceDiffMinor: 0, refundMinor: 0, chargeMinor: 0, message: 'Maximum reschedule limit (3) reached. Please cancel and rebook.' };
  }

  const priceDiffMinor = newPriceMinor - booking.originalPriceMinor;

  if (priceDiffMinor < 0) {
    // Cheaper slot: refund difference per §12
    return {
      valid: true,
      priceDiffMinor,
      refundMinor: Math.abs(priceDiffMinor),
      chargeMinor: 0,
      message: `New slot is ₹${(Math.abs(priceDiffMinor) / 100).toFixed(0)} cheaper. Difference will be refunded.`
    };
  } else if (priceDiffMinor > 0) {
    // More expensive: customer pays difference per §12
    return {
      valid: true,
      priceDiffMinor,
      refundMinor: 0,
      chargeMinor: priceDiffMinor,
      message: `New slot is ₹${(priceDiffMinor / 100).toFixed(0)} more expensive. Additional payment required.`
    };
  }

  return { valid: true, priceDiffMinor: 0, refundMinor: 0, chargeMinor: 0, message: 'Same price. No additional payment needed.' };
}

/**
 * Processes a provider no-show.
 * Per Commercial Policy §13: Full customer refund + provider reliability impact.
 */
export function processProviderNoShow(booking: BookingRecord): ProviderNoShowResult {
  const timestamp = new Date().toISOString();
  const refundAmountMinor = booking.paidAmountMinor;

  // Provider no-show: -15% reliability, distinguishable from controlled cancellation
  const reliabilityImpact = -15;

  // Provider penalty: 10% of booking value
  const penaltyToProviderMinor = Math.round(booking.originalPriceMinor * 0.10);

  const journalEntries: JournalEntry[] = [
    {
      entryId: `JE-NOSHOW-RF-${booking.bookingId}`,
      debitAccount: 'REFUND_CLEARING',
      creditAccount: 'ESCROW_HOLD',
      amountMinor: refundAmountMinor,
      description: 'Provider no-show — Full customer refund',
      timestamp
    },
    {
      entryId: `JE-NOSHOW-PN-${booking.bookingId}`,
      debitAccount: 'PROVIDER_PAYABLE',
      creditAccount: 'PLATFORM_FEE_INCOME',
      amountMinor: penaltyToProviderMinor,
      description: 'Provider no-show penalty (10%)',
      timestamp
    }
  ];

  return {
    bookingId: booking.bookingId,
    reliabilityImpact,
    refundAmountMinor,
    penaltyToProviderMinor,
    journalEntries
  };
}

/**
 * Propagates event cancellation through dependent bookings.
 * Per Commercial Policy §14: Rain/weather cascade handling.
 */
export function propagateEventCancellation(
  bookings: BookingRecord[],
  reason: 'RAIN' | 'WEATHER' | 'ORGANISER' | 'FORCE_MAJEURE'
): Array<CancellationResult & { specialTreatment: string }> {
  return bookings
    .filter(b => b.status === 'CONFIRMED' || b.status === 'HELD')
    .map(booking => {
      // Weather/force majeure: full refund regardless of timing
      if (reason === 'RAIN' || reason === 'WEATHER' || reason === 'FORCE_MAJEURE') {
        const timestamp = new Date().toISOString();
        return {
          bookingId: booking.bookingId,
          refundAmountMinor: booking.paidAmountMinor,
          penaltyAmountMinor: 0,
          band: { minHoursBeforeEvent: 0, maxHoursBeforeEvent: null, refundPercent: 100, penaltyPercent: 0, label: `${reason} — Full refund` },
          journalEntries: [{
            entryId: `JE-EVT-CANC-${booking.bookingId}`,
            debitAccount: 'REFUND_CLEARING',
            creditAccount: 'ESCROW_HOLD',
            amountMinor: booking.paidAmountMinor,
            description: `Event cancellation (${reason}) — Full refund`,
            timestamp
          }],
          hoursBeforeEvent: hoursUntilEvent(booking.eventDateTime),
          specialTreatment: `${reason}: Full refund applied regardless of cancellation window`
        };
      }

      // Organiser cancellation: standard bands apply
      const result = processCancellation(booking);
      return { ...result, specialTreatment: 'Standard cancellation bands applied' };
    });
}

/**
 * Renders cancellation penalty bands HTML for display.
 */
export function renderCancellationBandsHtml(
  bands: CancellationBand[] = DEFAULT_CANCELLATION_BANDS,
  activeBand?: CancellationBand
): string {
  const rows = bands.map(b => {
    const isActive = activeBand && b.label === activeBand.label;
    const maxLabel = b.maxHoursBeforeEvent === null ? '∞' : `${b.maxHoursBeforeEvent}h`;
    return `<div class="cancel-band ${isActive ? 'active' : ''}" data-tooltip="${b.label}">
      <div class="band-window">${b.minHoursBeforeEvent}h – ${maxLabel}</div>
      <div class="band-refund" style="color:${b.refundPercent >= 75 ? '#00E599' : b.refundPercent >= 50 ? '#FFB800' : '#FF3366'}">${b.refundPercent}% refund</div>
      <div class="band-penalty">${b.penaltyPercent}% penalty</div>
    </div>`;
  }).join('');

  return `<div class="cancellation-bands" data-tooltip="Cancellation policy bands">${rows}</div>`;
}

/**
 * Renders the booking lifecycle actions panel HTML.
 */
export function renderBookingActionsHtml(booking: BookingRecord): string {
  const hours = hoursUntilEvent(booking.eventDateTime);
  const band = getCancellationBand(hours);

  const canCancel = booking.status === 'CONFIRMED' || booking.status === 'HELD';
  const canReschedule = booking.status === 'CONFIRMED' && booking.rescheduleHistory.length < 3;

  return `<div class="booking-actions" data-tooltip="Booking ${booking.bookingId} — ${booking.serviceLabel}">
    <div class="booking-summary">
      <div class="booking-service">${booking.serviceLabel}</div>
      <div class="booking-provider">${booking.providerName}</div>
      <div class="booking-price">₹${(booking.paidAmountMinor / 100).toLocaleString('en-IN')}</div>
      <div class="booking-status" data-tooltip="Current status: ${booking.status}">${booking.status}</div>
      <div class="booking-time" data-tooltip="Time until event: ${hours.toFixed(1)} hours">${hours.toFixed(0)}h until event</div>
    </div>
    <div class="booking-policy" data-tooltip="Current cancellation band">
      <span>Current band: ${band.label}</span>
      <span style="color:${band.refundPercent >= 50 ? '#00E599' : '#FF3366'}">Refund: ${band.refundPercent}%</span>
    </div>
    <div class="booking-btns">
      ${canReschedule ? `<button class="btn-reschedule" onclick="openRescheduleModal('${booking.bookingId}')" data-tooltip="Reschedule this booking to a different time">📅 Reschedule</button>` : ''}
      ${canCancel ? `<button class="btn-cancel" onclick="openCancelModal('${booking.bookingId}')" data-tooltip="Cancel booking — ${band.refundPercent}% refund applies">❌ Cancel Booking</button>` : ''}
    </div>
    ${booking.rescheduleHistory.length > 0 ? `<div class="reschedule-count" data-tooltip="Reschedules used">Reschedules: ${booking.rescheduleHistory.length}/3</div>` : ''}
  </div>`;
}
