/**
 * apps/web/src/components/official-calendar.ts
 *
 * Umpire/Official Calendar & Availability Manager
 * Derived from Archive Specifications:
 * - 03_UX_Blueprint_v2 (§8.2 UX-015: Umpire Calendar)
 * - 01_Functional_Specification_v3 (§8.2 Umpire Calendar, US-UM-01)
 * - 08_Sprint_Ready_P0_Backlog_v1 (MKT-001..010, Journey J3)
 *
 * Manages weekly recurring availability, date-specific overrides,
 * travel/preparation buffers, and temporal GiST booking enforcement.
 */
export type DayOfWeek = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
export declare const DAYS_OF_WEEK: DayOfWeek[];
export declare const DAY_LABELS: Record<DayOfWeek, string>;
export type SlotStatus = 'AVAILABLE' | 'HELD' | 'BOOKED' | 'BLOCKED' | 'COMPLETED' | 'BUFFER';
export interface TimeSlot {
    hour: number;
    label: string;
}
export declare const CALENDAR_HOURS: TimeSlot[];
export interface RecurringSlot {
    day: DayOfWeek;
    startHour: number;
    endHour: number;
    enabled: boolean;
}
export interface DateOverride {
    date: string;
    startHour: number;
    endHour: number;
    action: 'ADD' | 'REMOVE';
    reason?: string;
}
export interface BookedSlot {
    bookingId: string;
    date: string;
    startHour: number;
    endHour: number;
    eventTitle: string;
    venueName: string;
    status: SlotStatus;
    expiresAt?: string;
}
export interface BufferConfig {
    preMatchMinutes: number;
    postMatchMinutes: number;
    travelMinutes: number;
}
export interface OfficialCalendarState {
    officialId: string;
    officialName: string;
    role: 'UMPIRE' | 'SCORER' | 'REFEREE';
    recurringSlots: RecurringSlot[];
    dateOverrides: DateOverride[];
    bookedSlots: BookedSlot[];
    bufferConfig: BufferConfig;
}
/**
 * Returns the slot status color and label metadata.
 */
export declare function getSlotStatusMeta(status: SlotStatus): {
    label: string;
    color: string;
    bg: string;
};
/**
 * Checks if two time ranges overlap (exclusive of touching endpoints).
 * Enforces temporal GiST-like exclusion at the application layer.
 */
export declare function doSlotsOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean;
/**
 * Resolves the effective status of a calendar cell for a given date and hour.
 * Priority: BOOKED > HELD > BLOCKED > DATE_OVERRIDE > RECURRING > empty.
 */
export declare function resolveSlotStatus(day: DayOfWeek, date: string, hour: number, state: OfficialCalendarState): SlotStatus | null;
/**
 * Validates that adding a new booking doesn't conflict with existing ones.
 * Mirrors PostgreSQL GiST exclusion constraint at the client layer.
 */
export declare function validateBookingSlot(date: string, startHour: number, endHour: number, state: OfficialCalendarState): {
    valid: boolean;
    conflicts: string[];
};
/**
 * Renders the weekly calendar grid HTML for a given week.
 */
export declare function renderWeeklyCalendarHtml(state: OfficialCalendarState, weekStartDate: string): string;
/**
 * Renders the buffer configuration panel HTML.
 */
export declare function renderBufferConfigHtml(config: BufferConfig): string;
/**
 * Creates a sample calendar state for demonstration.
 */
export declare function createSampleCalendarState(): OfficialCalendarState;
//# sourceMappingURL=official-calendar.d.ts.map