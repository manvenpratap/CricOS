import { RfqRequest, RfqQuote } from '@cricket-platform/contracts';
/**
 * Renders an RFQ card reimagined with high-agency design taste (UX-022, P1-001).
 * Features liquid-glass refraction, strict typography, asymmetric bento layout,
 * and zero emojis.
 */
export declare function renderRfqCardHtml(rfq: RfqRequest): string;
/**
 * Renders a ranked quote row with 100-point algorithm breakdown and provider reputation.
 */
export declare function renderQuoteRowHtml(quote: RfqQuote & {
    provider_name?: string;
    provider_trust_rating?: number;
    total_score?: number;
}): string;
/**
 * Renders an empty state when no procurement requirements are open.
 */
export declare function renderRfqEmptyStateHtml(): string;
/**
 * Renders a loading skeleton shimmer matching exact RFQ card dimensions.
 */
export declare function renderRfqSkeletonHtml(): string;
//# sourceMappingURL=rfq-manager.d.ts.map