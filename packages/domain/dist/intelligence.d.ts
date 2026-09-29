import { MvpScorecard, MatchNarrative, DynamicPriceQuote } from '@cricket-platform/contracts';
export interface PlayerPerformanceInput {
    player_id: string;
    player_name: string;
    team_name: string;
    runs: number;
    balls_faced: number;
    fours: number;
    sixes: number;
    overs_bowled: number;
    maidens: number;
    runs_conceded: number;
    wickets: number;
    catches: number;
    stumpings: number;
    run_outs: number;
}
/**
 * Calculates MVP Impact Points and identifies Player of the Match (P1-010).
 */
export declare function calculateMvpImpactPoints(matchId: string, players: PlayerPerformanceInput[]): MvpScorecard[];
/**
 * Generates automated match narrative & detects turning point (P2-001).
 */
export declare function generateMatchNarrative(matchId: string, matchData: {
    teamA: string;
    teamB: string;
    innings1: {
        runs: number;
        wickets: number;
        overs: number;
    };
    innings2: {
        runs: number;
        wickets: number;
        overs: number;
        target: number;
    };
    winner?: string;
    topBatter?: {
        name: string;
        runs: number;
        balls: number;
    };
    topBowler?: {
        name: string;
        wickets: number;
        runs: number;
        overs: number;
    };
}): MatchNarrative;
/**
 * Calculates dynamic surge pricing based on demand level and peak hour status (P2-003).
 */
export declare function calculateDynamicPrice(slotId: string, basePriceMinor: number, demandLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME', isPeak?: boolean): DynamicPriceQuote;
/**
 * Converts currency and computes regional taxes (P2-008).
 */
export declare function calculateMultiCurrencyConversion(amountMinor: number, fromCurrency: string, toCurrency: string, rates?: Record<string, number>): {
    base_minor: number;
    tax_minor: number;
    total_minor: number;
    tax_rate: number;
    currency: string;
};
/**
 * Evaluates player auction bids enforcing purse limits & minimum reserves (P3-001).
 */
export declare function evaluateAuctionBid(params: {
    teamPurseRemainingMinor: number;
    currentHighestBidMinor: number;
    newBidMinor: number;
    remainingSquadSlots: number;
    minReservePerSlotMinor?: number;
    minIncrementMinor?: number;
}): {
    accepted: boolean;
    message: string;
    newHighestBidMinor: number;
};
/**
 * Scores and ranks RFQ quotes (P1-001).
 */
export declare function evaluateRfqQuotes(budgetMinor: number, quotes: Array<{
    id: string;
    provider_id: string;
    quote_price_minor: number;
    provider_trust_rating: number;
}>): {
    price_score: number;
    trust_score: number;
    total_score: number;
    id: string;
    provider_id: string;
    quote_price_minor: number;
    provider_trust_rating: number;
}[];
//# sourceMappingURL=intelligence.d.ts.map