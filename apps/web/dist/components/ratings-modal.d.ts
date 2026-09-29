/**
 * apps/web/src/components/ratings-modal.ts
 *
 * Post-Match Reviews & Verified Trust Feedback Modal
 * Derived from Archive Specifications:
 * - 03_UX_Blueprint_v2.docx (Stage REVIEW: Rate providers and validate outcomes)
 * - 08_Sprint_Ready_P0_Backlog_v1.docx (TRU-001...008, ADM-003)
 *
 * Collects multi-dimensional ratings across Ground, Umpiring, and Scoring,
 * updating provider Bayesian reputation scores and reliability metrics.
 */
export interface DimensionalRatings {
    pitchQuality: number;
    umpiringAccuracy: number;
    scoringReliability: number;
    reviewText?: string;
}
export declare function calculateAverageRating(ratings: DimensionalRatings): number;
export declare function renderRatingsStars(score: number): string;
/**
 * Generates the HTML modal for post-match verification and rating.
 */
export declare function renderPostMatchRatingModalHtml(matchTitle?: string): string;
//# sourceMappingURL=ratings-modal.d.ts.map