export type ProviderTrustState = 'UNVERIFIED' | 'VERIFIED' | 'PROBATION' | 'SUSPENDED';
export interface ProviderReputationEvent {
    id: string;
    providerId: string;
    bookingId?: string;
    ratingId?: string;
    eventType: 'MATCH_COMPLETED' | 'NO_SHOW' | 'LATE_CANCELLATION' | 'RATING_RECEIVED' | 'DISPUTE_LOST' | 'DISPUTE_WON';
    scoreDelta: number;
    reliabilityBefore?: number;
    reliabilityAfter?: number;
    metadata: Record<string, unknown>;
    createdAt: Date;
}
export declare function computeReputationDelta(eventType: ProviderReputationEvent['eventType'], rating?: number): number;
/**
 * Calculates a Bayesian smoothed average rating to prevent low review counts
 * from skewing marketplace recommendations.
 *
 * Formula: (confidenceWeight * platformAvg + sum(ratings)) / (confidenceWeight + totalReviews)
 */
export declare function calculateBayesianRating(ratings: number[], platformAvg?: number, confidenceWeight?: number): number;
export interface TrustTransitionResult {
    previousState: ProviderTrustState;
    newState: ProviderTrustState;
    reliabilityScore: number;
    transitioned: boolean;
    reason: string;
    actionRequired: 'NONE' | 'NOTIFY_PROBATION' | 'SUSPEND_SLOTS_AND_ALERT';
}
/**
 * Automated Trust Circuit Breaker State Machine:
 * - < 0.65: Automatic emergency suspension (circuit breaker tripped)
 * - 0.65 - 0.79: Probationary status (warning & increased monitoring)
 * - >= 0.85: Recovery from probation back to verified status
 */
export declare function evaluateProviderTrustState(currentTrust: ProviderTrustState, reliabilityScore: number): TrustTransitionResult;
//# sourceMappingURL=reputation.d.ts.map