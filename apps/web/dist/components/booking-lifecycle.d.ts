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
export type BookingStatus = 'PENDING' | 'HELD' | 'CONFIRMED' | 'RESCHEDULING' | 'CANCELLED_BY_CUSTOMER' | 'CANCELLED_BY_PROVIDER' | 'NO_SHOW' | 'COMPLETED' | 'DISPUTED';
export interface CancellationBand {
    minHoursBeforeEvent: number;
    maxHoursBeforeEvent: number | null;
    refundPercent: number;
    penaltyPercent: number;
    label: string;
}
/**
 * Default cancellation policy bands per Commercial Policy Matrix §11.
 * Configurable per category/geography in production.
 */
export declare const DEFAULT_CANCELLATION_BANDS: CancellationBand[];
export interface BookingRecord {
    bookingId: string;
    eventId: string;
    eventTitle: string;
    providerId: string;
    providerName: string;
    serviceLabel: string;
    originalPriceMinor: number;
    paidAmountMinor: number;
    eventDateTime: string;
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
    reliabilityImpact: number;
    refundAmountMinor: number;
    penaltyToProviderMinor: number;
    journalEntries: JournalEntry[];
}
/**
 * Determines the applicable cancellation band based on hours before event.
 */
export declare function getCancellationBand(hoursBeforeEvent: number, bands?: CancellationBand[]): CancellationBand;
/**
 * Calculates hours remaining before the event from now.
 */
export declare function hoursUntilEvent(eventDateTime: string): number;
/**
 * Processes a customer-initiated cancellation.
 * Returns refund amount, penalty, and balanced double-entry journal entries.
 * All amounts in integer minor units per Invariant #1.
 */
export declare function processCancellation(booking: BookingRecord, bands?: CancellationBand[]): CancellationResult;
/**
 * Evaluates a reschedule proposal.
 * Per Commercial Policy Matrix §12: price difference handled explicitly.
 */
export declare function evaluateReschedule(booking: BookingRecord, newPriceMinor: number, newDateTime: string): RescheduleResult;
/**
 * Processes a provider no-show.
 * Per Commercial Policy §13: Full customer refund + provider reliability impact.
 */
export declare function processProviderNoShow(booking: BookingRecord): ProviderNoShowResult;
/**
 * Propagates event cancellation through dependent bookings.
 * Per Commercial Policy §14: Rain/weather cascade handling.
 */
export declare function propagateEventCancellation(bookings: BookingRecord[], reason: 'RAIN' | 'WEATHER' | 'ORGANISER' | 'FORCE_MAJEURE'): Array<CancellationResult & {
    specialTreatment: string;
}>;
/**
 * Renders cancellation penalty bands HTML for display.
 */
export declare function renderCancellationBandsHtml(bands?: CancellationBand[], activeBand?: CancellationBand): string;
/**
 * Renders the booking lifecycle actions panel HTML.
 */
export declare function renderBookingActionsHtml(booking: BookingRecord): string;
//# sourceMappingURL=booking-lifecycle.d.ts.map