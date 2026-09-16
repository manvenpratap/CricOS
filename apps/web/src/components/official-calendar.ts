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

export const DAYS_OF_WEEK: DayOfWeek[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export const DAY_LABELS: Record<DayOfWeek, string> = {
  MON: 'Monday',
  TUE: 'Tuesday',
  WED: 'Wednesday',
  THU: 'Thursday',
  FRI: 'Friday',
  SAT: 'Saturday',
  SUN: 'Sunday'
};

export type SlotStatus = 'AVAILABLE' | 'HELD' | 'BOOKED' | 'BLOCKED' | 'COMPLETED' | 'BUFFER';

export interface TimeSlot {
  hour: number; // 0–23
  label: string; // "08:00", "09:00", etc.
}

export const CALENDAR_HOURS: TimeSlot[] = Array.from({ length: 15 }, (_, i) => ({
  hour: i + 6, // 06:00 to 20:00
  label: `${String(i + 6).padStart(2, '0')}:00`
}));

export interface RecurringSlot {
  day: DayOfWeek;
  startHour: number;
  endHour: number;
  enabled: boolean;
}

export interface DateOverride {
  date: string; // ISO date YYYY-MM-DD
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
  preMatchMinutes: number;  // Preparation buffer before match
  postMatchMinutes: number; // Wind-down buffer after match
  travelMinutes: number;    // Travel buffer
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
export function getSlotStatusMeta(status: SlotStatus): { label: string; color: string; bg: string } {
  switch (status) {
    case 'AVAILABLE':
      return { label: 'Available', color: '#00E599', bg: 'rgba(0,229,153,0.15)' };
    case 'HELD':
      return { label: 'Held (Pending)', color: '#FFB800', bg: 'rgba(255,184,0,0.15)' };
    case 'BOOKED':
      return { label: 'Confirmed', color: '#00D2FF', bg: 'rgba(0,210,255,0.15)' };
    case 'BLOCKED':
      return { label: 'Blocked', color: '#FF3366', bg: 'rgba(255,51,102,0.12)' };
    case 'COMPLETED':
      return { label: 'Completed', color: '#A855F7', bg: 'rgba(168,85,247,0.12)' };
    case 'BUFFER':
      return { label: 'Buffer', color: '#94A3B8', bg: 'rgba(148,163,184,0.10)' };
  }
}

/**
 * Checks if two time ranges overlap (exclusive of touching endpoints).
 * Enforces temporal GiST-like exclusion at the application layer.
 */
export function doSlotsOverlap(
  aStart: number, aEnd: number,
  bStart: number, bEnd: number
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Resolves the effective status of a calendar cell for a given date and hour.
 * Priority: BOOKED > HELD > BLOCKED > DATE_OVERRIDE > RECURRING > empty.
 */
export function resolveSlotStatus(
  day: DayOfWeek,
  date: string,
  hour: number,
  state: OfficialCalendarState
): SlotStatus | null {
  // Check booked slots first (highest priority)
  for (const booked of state.bookedSlots) {
    if (booked.date === date && doSlotsOverlap(hour, hour + 1, booked.startHour, booked.endHour)) {
      return booked.status;
    }
  }

  // Check buffer zones around booked slots
  const bufferHours = Math.ceil(state.bufferConfig.travelMinutes / 60) +
    Math.ceil(state.bufferConfig.preMatchMinutes / 60);
  for (const booked of state.bookedSlots) {
    if (booked.date === date && (booked.status === 'BOOKED' || booked.status === 'HELD')) {
      const bufferStart = booked.startHour - bufferHours;
      const bufferEnd = booked.endHour + Math.ceil(state.bufferConfig.postMatchMinutes / 60);
      if (doSlotsOverlap(hour, hour + 1, bufferStart, bufferEnd) &&
          !doSlotsOverlap(hour, hour + 1, booked.startHour, booked.endHour)) {
        return 'BUFFER';
      }
    }
  }

  // Check date-specific overrides
  for (const override of state.dateOverrides) {
    if (override.date === date && doSlotsOverlap(hour, hour + 1, override.startHour, override.endHour)) {
      return override.action === 'ADD' ? 'AVAILABLE' : 'BLOCKED';
    }
  }

  // Check recurring availability
  for (const recurring of state.recurringSlots) {
    if (recurring.day === day && recurring.enabled &&
        doSlotsOverlap(hour, hour + 1, recurring.startHour, recurring.endHour)) {
      return 'AVAILABLE';
    }
  }

  return null; // Not available
}

/**
 * Validates that adding a new booking doesn't conflict with existing ones.
 * Mirrors PostgreSQL GiST exclusion constraint at the client layer.
 */
export function validateBookingSlot(
  date: string,
  startHour: number,
  endHour: number,
  state: OfficialCalendarState
): { valid: boolean; conflicts: string[] } {
  const conflicts: string[] = [];

  for (const booked of state.bookedSlots) {
    if (booked.date === date &&
        (booked.status === 'BOOKED' || booked.status === 'HELD') &&
        doSlotsOverlap(startHour, endHour, booked.startHour, booked.endHour)) {
      conflicts.push(`Conflicts with "${booked.eventTitle}" (${booked.startHour}:00–${booked.endHour}:00)`);
    }
  }

  // Check buffer violations
  const bufferHours = Math.ceil((state.bufferConfig.travelMinutes + state.bufferConfig.preMatchMinutes) / 60);
  const postBuffer = Math.ceil(state.bufferConfig.postMatchMinutes / 60);

  for (const booked of state.bookedSlots) {
    if (booked.date === date && (booked.status === 'BOOKED' || booked.status === 'HELD')) {
      const expandedStart = booked.startHour - bufferHours;
      const expandedEnd = booked.endHour + postBuffer;
      if (doSlotsOverlap(startHour, endHour, expandedStart, expandedEnd) &&
          !doSlotsOverlap(startHour, endHour, booked.startHour, booked.endHour)) {
        conflicts.push(`Violates travel/prep buffer for "${booked.eventTitle}"`);
      }
    }
  }

  return { valid: conflicts.length === 0, conflicts };
}

/**
 * Renders the weekly calendar grid HTML for a given week.
 */
export function renderWeeklyCalendarHtml(
  state: OfficialCalendarState,
  weekStartDate: string // ISO date of the Monday
): string {
  const startDate = new Date(weekStartDate);

  const headerCells = DAYS_OF_WEEK.map((day, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    return `<th class="cal-header" data-tooltip="${DAY_LABELS[day]} ${dateStr}">${day}<br/><span class="cal-date">${d.getDate()}</span></th>`;
  }).join('');

  const rows = CALENDAR_HOURS.map(slot => {
    const cells = DAYS_OF_WEEK.map((day, i) => {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0]!;
      const status = resolveSlotStatus(day, dateStr, slot.hour, state);

      if (!status) {
        return `<td class="cal-cell cal-empty" data-tooltip="No availability set for ${slot.label}" onclick="toggleCalendarSlot('${day}', ${slot.hour})"></td>`;
      }

      const meta = getSlotStatusMeta(status);
      return `<td class="cal-cell" style="background:${meta.bg};border-left:3px solid ${meta.color};" data-tooltip="${meta.label} — ${slot.label} ${DAY_LABELS[day]}">${meta.label}</td>`;
    }).join('');

    return `<tr><td class="cal-time" data-tooltip="Time: ${slot.label}">${slot.label}</td>${cells}</tr>`;
  }).join('');

  return `<div class="official-calendar-wrapper">
    <table class="official-calendar">
      <thead><tr><th class="cal-time-header" data-tooltip="Time slots">Time</th>${headerCells}</tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}

/**
 * Renders the buffer configuration panel HTML.
 */
export function renderBufferConfigHtml(config: BufferConfig): string {
  return `<div class="buffer-config" data-tooltip="Travel and preparation buffer settings for this official">
    <div class="buffer-item">
      <label>Pre-Match Prep</label>
      <span class="buffer-value">${config.preMatchMinutes} min</span>
    </div>
    <div class="buffer-item">
      <label>Post-Match</label>
      <span class="buffer-value">${config.postMatchMinutes} min</span>
    </div>
    <div class="buffer-item">
      <label>Travel Buffer</label>
      <span class="buffer-value">${config.travelMinutes} min</span>
    </div>
  </div>`;
}

/**
 * Creates a sample calendar state for demonstration.
 */
export function createSampleCalendarState(): OfficialCalendarState {
  return {
    officialId: 'UMP-RK-001',
    officialName: 'Ravi Kumar',
    role: 'UMPIRE',
    recurringSlots: [
      { day: 'SAT', startHour: 8, endHour: 20, enabled: true },
      { day: 'SUN', startHour: 8, endHour: 20, enabled: true },
      { day: 'FRI', startHour: 16, endHour: 21, enabled: true },
      { day: 'WED', startHour: 17, endHour: 21, enabled: true }
    ],
    dateOverrides: [],
    bookedSlots: [
      {
        bookingId: 'BK-001',
        date: (() => { const d = new Date(); d.setDate(d.getDate() + (6 - d.getDay())); return d.toISOString().split('T')[0]!; })(),
        startHour: 14,
        endHour: 18,
        eventTitle: 'BLR T20 League — Match 7',
        venueName: 'Greenfield CC',
        status: 'BOOKED'
      },
      {
        bookingId: 'BK-002',
        date: (() => { const d = new Date(); d.setDate(d.getDate() + (7 - d.getDay())); return d.toISOString().split('T')[0]!; })(),
        startHour: 9,
        endHour: 13,
        eventTitle: 'Corporate Cup — Semi Final',
        venueName: 'Diamond Oval',
        status: 'HELD',
        expiresAt: new Date(Date.now() + 1800_000).toISOString()
      }
    ],
    bufferConfig: {
      preMatchMinutes: 30,
      postMatchMinutes: 15,
      travelMinutes: 60
    }
  };
}
