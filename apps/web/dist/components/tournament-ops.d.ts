import { FixtureBoardItem } from '@cricket-platform/contracts';
/**
 * Renders the tournament fixture board with conflict & readiness indicators (UX-020, UX-021, P1-006).
 */
export declare function renderFixtureBoardHtml(data: {
    tournament_id: string;
    total_fixtures: number;
    conflicts_count: number;
    overall_readiness_percentage: number;
    fixtures: FixtureBoardItem[];
}): string;
//# sourceMappingURL=tournament-ops.d.ts.map