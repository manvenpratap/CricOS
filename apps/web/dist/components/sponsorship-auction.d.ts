import { SponsorshipInventoryItem } from '@cricket-platform/contracts';
/**
 * Renders the Sponsorship Inventory showcase (P2-004).
 */
export declare function renderSponsorshipTierCardHtml(item: SponsorshipInventoryItem): string;
/**
 * Renders the Virtual Player Auction live bidding desk (P3-001).
 */
export declare function renderPlayerAuctionBoardHtml(auction: {
    auction_id: string;
    player_name: string;
    role: string;
    base_price_minor: number;
    current_highest_bid_minor: number;
    highest_bidder_team: string;
    team_purse_remaining_minor: number;
}): string;
//# sourceMappingURL=sponsorship-auction.d.ts.map