/**
 * apps/web/src/components/event-basket.ts
 *
 * Event Basket & Automated Requirements Generator
 * Derived from Archive Specifications:
 * - 03_UX_Blueprint_v2.docx (Event Basket & Readiness Bar)
 * - 08_Sprint_Ready_P0_Backlog_v1.docx (BAS-001...010, Journey J1 Captain)
 *
 * Manages required (Venue, Umpires, Scorer) and suggested (Live Stream, Catering)
 * resources, calculates 0–100% readiness score, and renders Stitch-styled basket cards.
 */
export type RequirementCategory = 'VENUE' | 'OFFICIAL_UMPIRE' | 'OFFICIAL_SCORER' | 'LIVE_STREAM' | 'COMMENTARY' | 'CATERING';
export type RequirementStatus = 'MISSING' | 'REQUESTED' | 'HELD' | 'CONFIRMED';
export interface EventRequirementItem {
    id: string;
    category: RequirementCategory;
    title: string;
    isRequired: boolean;
    status: RequirementStatus;
    providerName?: string;
    slotTime?: string;
    priceMinor: number;
}
export interface EventReadinessResult {
    percentage: number;
    totalRequired: number;
    confirmedRequired: number;
    missingItems: EventRequirementItem[];
    isReadyToStart: boolean;
}
/**
 * Calculates event operational readiness percentage based on required resources.
 */
export declare function calculateEventReadiness(items: EventRequirementItem[]): EventReadinessResult;
/**
 * Generates canonical default requirements for a match event.
 */
export declare function generateDefaultMatchRequirements(venueTitle?: string): EventRequirementItem[];
/**
 * Renders the Stitch-styled Event Readiness Progress Bar.
 */
export declare function renderEventReadinessBarHtml(readiness: EventReadinessResult): string;
/**
 * Formats minor currency to Indian Rupees.
 */
export declare function formatMinorInr(amountMinor: number): string;
//# sourceMappingURL=event-basket.d.ts.map