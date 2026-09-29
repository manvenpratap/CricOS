/**
 * apps/web/src/components/event-overview.ts
 *
 * Event Overview & Readiness Dashboard
 * Derived from Archive Specifications:
 * - 01_Functional_Specification_v3 (§7.2 UX-004: Event Overview)
 * - 02_Product_Blueprint_v1 (§34 Event-centric abstraction, §50 Captain Home)
 * - 08_Sprint_Ready_P0_Backlog_v1 (EVT-001..005, BAS-001..015)
 *
 * Provides a unified event detail view with readiness percentage,
 * procurement status, team lineup, and event lifecycle timeline.
 */
export type EventLifecycleStage = 'CREATED' | 'CONFIGURED' | 'RESOURCES_BOOKED' | 'READY' | 'LIVE' | 'COMPLETED' | 'CANCELLED';
export interface ProcurementItem {
    id: string;
    category: 'VENUE' | 'OFFICIAL' | 'EQUIPMENT' | 'SERVICE';
    label: string;
    required: boolean;
    status: 'PENDING' | 'SEARCHING' | 'HELD' | 'BOOKED' | 'CONFIRMED' | 'CANCELLED';
    providerName?: string;
    priceMinor?: number;
    holdExpiresAt?: string;
}
export interface TeamLineupStatus {
    teamId: string;
    teamName: string;
    shortCode: string;
    playingXIConfirmed: boolean;
    confirmedCount: number;
    requiredCount: number;
}
export interface EventOverviewState {
    eventId: string;
    title: string;
    format: string;
    overs: number;
    stage: EventLifecycleStage;
    scheduledDate: string;
    venueName: string;
    homeTeam: TeamLineupStatus;
    awayTeam: TeamLineupStatus;
    procurement: ProcurementItem[];
    readinessPercent: number;
    blockers: string[];
    warnings: string[];
}
/**
 * Calculates event readiness percentage from procurement items.
 * Required items that are BOOKED/CONFIRMED count toward readiness.
 * Non-required items are bonus but don't reduce the percentage.
 */
export declare function calculateProcurementReadiness(procurement: ProcurementItem[]): {
    percent: number;
    blockers: string[];
    warnings: string[];
};
/**
 * Returns lifecycle stage metadata for rendering.
 */
export declare function getStageMetadata(stage: EventLifecycleStage): {
    label: string;
    icon: string;
    color: string;
    bg: string;
};
/**
 * Derives the lifecycle stage from procurement and lineup state.
 */
export declare function deriveLifecycleStage(procurement: ProcurementItem[], homeConfirmed: boolean, awayConfirmed: boolean, isLive: boolean, isCompleted: boolean): EventLifecycleStage;
/**
 * Renders the event lifecycle timeline stepper HTML.
 */
export declare function renderLifecycleTimelineHtml(currentStage: EventLifecycleStage): string;
/**
 * Renders the readiness ring SVG (0–100%).
 */
export declare function renderReadinessRingSvg(percent: number): string;
/**
 * Renders procurement status cards HTML.
 */
export declare function renderProcurementCardsHtml(items: ProcurementItem[]): string;
/**
 * Creates a sample event overview state for demonstration.
 */
export declare function createSampleEventOverview(): EventOverviewState;
//# sourceMappingURL=event-overview.d.ts.map