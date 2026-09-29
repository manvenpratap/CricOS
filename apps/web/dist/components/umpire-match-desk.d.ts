/**
 * apps/web/src/components/umpire-match-desk.ts
 *
 * CricOS Digital Umpire Match Day Desk & DRS Incident Review Engine
 * Implements MCC Laws 41 & 42 Code of Conduct sanctions, Hawk-Eye DRS reviews,
 * and cryptographic digital match card sign-off.
 */
export type ConductSanctionLevel = 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'LEVEL_4';
export type ConductBreachType = 'DISSENT' | 'EQUIPMENT_ABUSE' | 'OBSCENITY' | 'BALL_TAMPERING' | 'SLOW_OVER_RATE' | 'UNFAIR_PLAY' | 'THREATENING_OFFICIAL';
export interface ConductSanction {
    id: string;
    matchId: string;
    level: ConductSanctionLevel;
    breachType: ConductBreachType;
    playerName: string;
    teamName: string;
    description: string;
    penaltyRuns: number;
    suspensionOvers: number;
    timestamp: string;
}
export type DrsPitching = 'IN_LINE' | 'OUTSIDE_OFF' | 'OUTSIDE_LEG';
export type DrsImpact = 'IN_LINE' | 'OUTSIDE_OFF';
export type DrsWickets = 'HITTING' | 'MISSING' | 'UMPIRES_CALL';
export type DrsAppealType = 'LBW' | 'CAUGHT_BEHIND' | 'STUMPED';
export type DrsVerdict = 'OUT' | 'NOT_OUT' | 'UMPIRES_CALL';
export interface DrsReviewRecord {
    id: string;
    over: string;
    batterName: string;
    bowlerName: string;
    appealType: DrsAppealType;
    originalDecision: 'OUT' | 'NOT_OUT';
    pitching: DrsPitching;
    impact: DrsImpact;
    wickets: DrsWickets;
    finalDecision: DrsVerdict;
    reviewRetained: boolean;
    trajectorySummary: string;
    timestamp: string;
}
export interface MatchSignOffCard {
    matchId: string;
    leadUmpireName: string;
    legUmpireName: string;
    matchReferee: string;
    certifiedResult: string;
    totalSanctions: number;
    totalDrsReviews: number;
    digitalStamp: string;
    signedAt: string;
    status: 'PENDING' | 'CERTIFIED';
}
/**
 * Calculates penalty runs and suspension overs under MCC Law 42.
 */
export declare function getSanctionConsequences(level: ConductSanctionLevel): {
    penaltyRuns: number;
    suspensionOvers: number;
};
/**
 * Resolves DRS LBW verdict following ICC Playing Conditions:
 * 1. Pitching must be IN_LINE or OUTSIDE_OFF (never OUTSIDE_LEG for LBW).
 * 2. Impact must be IN_LINE (or OUTSIDE_OFF if no shot offered).
 * 3. Wickets must be HITTING (or original decision stands if UMPIRES_CALL).
 */
export declare function resolveDrsVerdict(appealType: DrsAppealType, originalDecision: 'OUT' | 'NOT_OUT', pitching: DrsPitching, impact: DrsImpact, wickets: DrsWickets): {
    finalDecision: DrsVerdict;
    reviewRetained: boolean;
};
/**
 * Deterministic pseudo-cryptographic hash digest for match integrity sign-off.
 */
export declare function generateMatchDigest(data: string, pin: string): string;
export declare class UmpireMatchDeskComponent {
    private matchId;
    private leadUmpire;
    private legUmpire;
    private matchReferee;
    private sanctions;
    private drsReviews;
    private signOffCard;
    constructor(matchId?: string, leadUmpire?: string, legUmpire?: string, matchReferee?: string);
    private seedDefaultRecords;
    logSanction(sanction: Omit<ConductSanction, 'id' | 'timestamp' | 'penaltyRuns' | 'suspensionOvers'>): ConductSanction;
    logDrsReview(review: Omit<DrsReviewRecord, 'id' | 'finalDecision' | 'reviewRetained' | 'trajectorySummary' | 'timestamp'>): DrsReviewRecord;
    signOffMatch(certifiedResult: string, umpirePin: string): MatchSignOffCard;
    getSanctions(): ConductSanction[];
    getDrsReviews(): DrsReviewRecord[];
    getSignOffCard(): MatchSignOffCard | null;
    renderUmpireDeskHtml(): string;
}
//# sourceMappingURL=umpire-match-desk.d.ts.map