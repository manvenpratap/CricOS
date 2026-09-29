export function computeReputationDelta(eventType, rating) {
    switch (eventType) {
        case 'MATCH_COMPLETED':
            return 0.01;
        case 'RATING_RECEIVED':
            if (rating !== undefined) {
                // rating between 1 and 5
                return (rating - 3) * 0.02;
            }
            return 0;
        case 'NO_SHOW':
            return -0.15;
        case 'LATE_CANCELLATION':
            return -0.08;
        case 'DISPUTE_LOST':
            return -0.10;
        case 'DISPUTE_WON':
            return 0.02;
        default:
            return 0;
    }
}
/**
 * Calculates a Bayesian smoothed average rating to prevent low review counts
 * from skewing marketplace recommendations.
 *
 * Formula: (confidenceWeight * platformAvg + sum(ratings)) / (confidenceWeight + totalReviews)
 */
export function calculateBayesianRating(ratings, platformAvg = 4.2, confidenceWeight = 5) {
    if (!ratings || ratings.length === 0) {
        return Number(platformAvg.toFixed(2));
    }
    const validRatings = ratings.filter((r) => r >= 1 && r <= 5);
    if (validRatings.length === 0) {
        return Number(platformAvg.toFixed(2));
    }
    const sumRatings = validRatings.reduce((sum, r) => sum + r, 0);
    const weighted = (confidenceWeight * platformAvg + sumRatings) / (confidenceWeight + validRatings.length);
    return Number(weighted.toFixed(2));
}
/**
 * Automated Trust Circuit Breaker State Machine:
 * - < 0.65: Automatic emergency suspension (circuit breaker tripped)
 * - 0.65 - 0.79: Probationary status (warning & increased monitoring)
 * - >= 0.85: Recovery from probation back to verified status
 */
export function evaluateProviderTrustState(currentTrust, reliabilityScore) {
    const score = Math.max(0.0, Math.min(1.0, reliabilityScore));
    if (currentTrust === 'UNVERIFIED') {
        return {
            previousState: currentTrust,
            newState: 'UNVERIFIED',
            reliabilityScore: score,
            transitioned: false,
            reason: 'Provider has not completed initial KYC verification',
            actionRequired: 'NONE'
        };
    }
    // Critical Failure: Circuit breaker trip
    if (score < 0.65) {
        const isNew = currentTrust !== 'SUSPENDED';
        return {
            previousState: currentTrust,
            newState: 'SUSPENDED',
            reliabilityScore: score,
            transitioned: isNew,
            reason: 'Critical: Reliability score dropped below 65% threshold',
            actionRequired: isNew ? 'SUSPEND_SLOTS_AND_ALERT' : 'NONE'
        };
    }
    // Warning Level: Probation
    if (score < 0.80) {
        if (currentTrust === 'SUSPENDED') {
            return {
                previousState: currentTrust,
                newState: 'SUSPENDED',
                reliabilityScore: score,
                transitioned: false,
                reason: 'Provider suspended; requires manual administrative clearance',
                actionRequired: 'NONE'
            };
        }
        const isNew = currentTrust !== 'PROBATION';
        return {
            previousState: currentTrust,
            newState: 'PROBATION',
            reliabilityScore: score,
            transitioned: isNew,
            reason: 'Warning: Reliability score dropped below 80% probation threshold',
            actionRequired: isNew ? 'NOTIFY_PROBATION' : 'NONE'
        };
    }
    // Good Standing / Recovery Level (>= 0.85 recovers from probation)
    if (score >= 0.85 && currentTrust === 'PROBATION') {
        return {
            previousState: currentTrust,
            newState: 'VERIFIED',
            reliabilityScore: score,
            transitioned: true,
            reason: 'Reliability score recovered above 85% requirement',
            actionRequired: 'NONE'
        };
    }
    return {
        previousState: currentTrust,
        newState: currentTrust,
        reliabilityScore: score,
        transitioned: false,
        reason: 'Reliability score within healthy operational bounds',
        actionRequired: 'NONE'
    };
}
//# sourceMappingURL=reputation.js.map