/**
 * apps/web/src/components/create-event.ts
 *
 * Create Event Wizard — 3-Step Progressive Disclosure
 * Derived from Archive Specifications:
 * - 01_Functional_Specification_v3 (§7.1 UX-003: Create Event)
 * - 02_Product_Blueprint_v1 (Event-first abstraction §34)
 * - 08_Sprint_Ready_P0_Backlog_v1 (CRK-001, EVT-001..005)
 *
 * Implements the core event creation flow with format selection,
 * team & official assignment, and schedule/venue configuration.
 * Outputs an EventConfig that feeds into Event Basket procurement.
 */
export type CricketFormat = 'T20' | 'ODI' | 'TEST' | 'CUSTOM';
export interface FormatSpec {
    format: CricketFormat;
    overs: number;
    powerplayOvers: number;
    maxBowlerOvers: number;
    playersPerSide: number;
    innings: 1 | 2 | 4;
    label: string;
    description: string;
}
export declare const FORMAT_CATALOGUE: Record<CricketFormat, FormatSpec>;
export type WizardStep = 1 | 2 | 3;
export interface TeamAssignment {
    teamId: string;
    teamName: string;
    shortCode: string;
    confirmed: boolean;
}
export interface OfficialRequirement {
    role: 'UMPIRE' | 'SCORER' | 'REFEREE' | 'STREAMER';
    count: number;
    mandatory: boolean;
    label: string;
}
export interface VenueSlot {
    venueId: string;
    venueName: string;
    date: string;
    startTime: string;
    endTime: string;
    surface: 'NATURAL' | 'ASTROTURF' | 'INDOOR';
    floodlights: boolean;
}
export interface EventConfig {
    eventId: string;
    title: string;
    format: FormatSpec;
    customOvers?: number;
    homeTeam: TeamAssignment | null;
    awayTeam: TeamAssignment | null;
    officials: OfficialRequirement[];
    venue: VenueSlot | null;
    scheduledDate: string;
    estimatedDurationMinutes: number;
    autoGenerateBasket: boolean;
    createdAt: string;
    status: 'DRAFT' | 'CONFIGURED' | 'READY';
}
/**
 * Returns the default official requirements for a given format.
 */
export declare function getDefaultOfficials(format: CricketFormat): OfficialRequirement[];
/**
 * Estimates match duration in minutes based on format.
 */
export declare function estimateMatchDuration(format: CricketFormat, customOvers?: number): number;
/**
 * Generates a deterministic event ID.
 */
export declare function generateEventId(): string;
/**
 * Creates a blank EventConfig with defaults for the selected format.
 */
export declare function createBlankEventConfig(format: CricketFormat, customOvers?: number): EventConfig;
/**
 * Validates the event configuration at each wizard step.
 * Returns an array of validation error messages (empty = valid).
 */
export declare function validateWizardStep(config: EventConfig, step: WizardStep): string[];
/**
 * Determines the current event status based on configuration completeness.
 */
export declare function deriveEventStatus(config: EventConfig): 'DRAFT' | 'CONFIGURED' | 'READY';
/**
 * Renders the Create Event Wizard step indicator HTML.
 */
export declare function renderWizardStepperHtml(currentStep: WizardStep): string;
/**
 * Renders format selection cards for Step 1.
 */
export declare function renderFormatSelectionHtml(selectedFormat: CricketFormat | null): string;
/**
 * Generates basket requirement lines from a completed EventConfig.
 * This feeds into the existing Event Basket procurement system.
 */
export declare function generateBasketFromEvent(config: EventConfig): Array<{
    category: string;
    label: string;
    required: boolean;
    status: 'PENDING' | 'BOOKED';
}>;
//# sourceMappingURL=create-event.d.ts.map