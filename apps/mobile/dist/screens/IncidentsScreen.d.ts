export type IncidentSeverity = 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'LEVEL_4';
export type IncidentType = 'DISSENT' | 'EQUIPMENT_ABUSE' | 'OBSCENITY' | 'BALL_TAMPERING' | 'SLOW_OVER_RATE';
export interface IncidentRecord {
    id: string;
    matchId: string;
    playerName: string;
    teamName: string;
    severity: IncidentSeverity;
    type: IncidentType;
    description: string;
    penaltyRuns: number;
    reportedAt: string;
}
export interface DrsReviewRecord {
    id: string;
    over: string;
    battingTeam: string;
    decision: 'OUT' | 'NOT_OUT' | 'UMPIRES_CALL';
    retained: boolean;
    ballTracking: string;
}
export interface IncidentsScreenState {
    matchId: string;
    matchSignedOff: boolean;
    digitalSignature?: string | null;
    incidents: IncidentRecord[];
    drsReviews: DrsReviewRecord[];
    isSubmitting: boolean;
}
export declare class IncidentsScreenController {
    private state;
    constructor(initialState?: Partial<IncidentsScreenState>);
    getState(): IncidentsScreenState;
    reportIncident(incident: Omit<IncidentRecord, 'id' | 'reportedAt'>): IncidentRecord;
    logDrsReview(review: Omit<DrsReviewRecord, 'id'>): DrsReviewRecord;
    signOffMatch(umpirePin?: string): string;
    renderMobileHtml(isUmpire?: boolean): string;
}
//# sourceMappingURL=IncidentsScreen.d.ts.map