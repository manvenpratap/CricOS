/**
 * CricOS Live Player Auction, Franchise Salary Cap Purse & Right-To-Match (RTM) Draft Engine
 * Models marquee player lots, integer minor-unit bidding increments, franchise salary caps,
 * RTM exercises, and AI valuation metrics.
 */
export interface AuctionPlayerLot {
    id: string;
    name: string;
    role: 'BATTER' | 'BOWLER' | 'ALL_ROUNDER' | 'WICKETKEEPER';
    country: string;
    isOverseas: boolean;
    basePriceMinor: number;
    currentBidMinor: number;
    highestBidderFranchiseId: string | null;
    highestBidderName: string | null;
    rtmEligibleFranchiseId: string | null;
    strikeRate: number;
    bowlingEconomy: number;
    valuationScore: number;
    status: 'ON_THE_BLOCK' | 'SOLD' | 'UNSOLD' | 'UPCOMING';
}
export interface FranchisePurseState {
    franchiseId: string;
    franchiseName: string;
    shortCode: string;
    totalSalaryCapMinor: number;
    remainingPurseMinor: number;
    squadCount: number;
    maxSquadSize: number;
    overseasCount: number;
    maxOverseasSize: number;
    rtmCardsRemaining: number;
}
export declare const INITIAL_AUCTION_LOTS: AuctionPlayerLot[];
export declare const INITIAL_FRANCHISE_PURSES: FranchisePurseState[];
export declare class PlayerAuctionDraftEngine {
    private lots;
    private franchises;
    constructor(lots?: AuctionPlayerLot[], franchises?: FranchisePurseState[]);
    getActiveLot(): AuctionPlayerLot;
    getFranchises(): FranchisePurseState[];
    getLots(): AuctionPlayerLot[];
    placeBid(lotId: string, franchiseId: string, incrementMinor: number): {
        ok: boolean;
        reason?: string;
        updatedLot?: AuctionPlayerLot;
        franchise?: FranchisePurseState;
    };
    exerciseRtmCard(lotId: string, rtmFranchiseId: string): {
        ok: boolean;
        reason?: string;
        updatedLot?: AuctionPlayerLot;
    };
    gavelSold(lotId: string): {
        ok: boolean;
        reason?: string;
        soldLot?: AuctionPlayerLot;
    };
}
//# sourceMappingURL=player-auction-draft.d.ts.map