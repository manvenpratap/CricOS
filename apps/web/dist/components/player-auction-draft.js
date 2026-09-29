/**
 * CricOS Live Player Auction, Franchise Salary Cap Purse & Right-To-Match (RTM) Draft Engine
 * Models marquee player lots, integer minor-unit bidding increments, franchise salary caps,
 * RTM exercises, and AI valuation metrics.
 */
export const INITIAL_AUCTION_LOTS = [
    {
        id: 'lot-1',
        name: 'Hardik Patel',
        role: 'ALL_ROUNDER',
        country: 'India',
        isOverseas: false,
        basePriceMinor: 50000,
        currentBidMinor: 240000,
        highestBidderFranchiseId: 'fr-royal',
        highestBidderName: 'Royal Strikers',
        rtmEligibleFranchiseId: 'fr-titan',
        strikeRate: 174.2,
        bowlingEconomy: 7.45,
        valuationScore: 97,
        status: 'ON_THE_BLOCK',
    },
    {
        id: 'lot-2',
        name: 'Rashid Khan',
        role: 'BOWLER',
        country: 'Afghanistan',
        isOverseas: true,
        basePriceMinor: 75000,
        currentBidMinor: 75000,
        highestBidderFranchiseId: null,
        highestBidderName: null,
        rtmEligibleFranchiseId: 'fr-royal',
        strikeRate: 162.0,
        bowlingEconomy: 6.18,
        valuationScore: 98,
        status: 'UPCOMING',
    },
    {
        id: 'lot-3',
        name: 'Virat Sharma',
        role: 'BATTER',
        country: 'India',
        isOverseas: false,
        basePriceMinor: 100000,
        currentBidMinor: 350000,
        highestBidderFranchiseId: 'fr-royal',
        highestBidderName: 'Royal Strikers',
        rtmEligibleFranchiseId: null,
        strikeRate: 158.4,
        bowlingEconomy: 8.5,
        valuationScore: 99,
        status: 'SOLD',
    },
    {
        id: 'lot-4',
        name: 'Jos Buttler',
        role: 'WICKETKEEPER',
        country: 'England',
        isOverseas: true,
        basePriceMinor: 60000,
        currentBidMinor: 60000,
        highestBidderFranchiseId: null,
        highestBidderName: null,
        rtmEligibleFranchiseId: 'fr-metro',
        strikeRate: 168.9,
        bowlingEconomy: 0,
        valuationScore: 95,
        status: 'UPCOMING',
    },
];
export const INITIAL_FRANCHISE_PURSES = [
    {
        franchiseId: 'fr-royal',
        franchiseName: 'Royal Strikers',
        shortCode: 'RYS',
        totalSalaryCapMinor: 1500000,
        remainingPurseMinor: 910000,
        squadCount: 14,
        maxSquadSize: 18,
        overseasCount: 3,
        maxOverseasSize: 4,
        rtmCardsRemaining: 2,
    },
    {
        franchiseId: 'fr-titan',
        franchiseName: 'Titan XI',
        shortCode: 'TTN',
        totalSalaryCapMinor: 1500000,
        remainingPurseMinor: 1040000,
        squadCount: 13,
        maxSquadSize: 18,
        overseasCount: 2,
        maxOverseasSize: 4,
        rtmCardsRemaining: 1,
    },
    {
        franchiseId: 'fr-metro',
        franchiseName: 'Metro Spartans',
        shortCode: 'MSP',
        totalSalaryCapMinor: 1500000,
        remainingPurseMinor: 825000,
        squadCount: 15,
        maxSquadSize: 18,
        overseasCount: 4,
        maxOverseasSize: 4,
        rtmCardsRemaining: 1,
    },
];
export class PlayerAuctionDraftEngine {
    lots;
    franchises;
    constructor(lots = INITIAL_AUCTION_LOTS, franchises = INITIAL_FRANCHISE_PURSES) {
        this.lots = lots.map((l) => ({ ...l }));
        this.franchises = franchises.map((f) => ({ ...f }));
    }
    getActiveLot() {
        return (this.lots.find((l) => l.status === 'ON_THE_BLOCK') ??
            this.lots[0] ??
            INITIAL_AUCTION_LOTS[0]);
    }
    getFranchises() {
        return this.franchises;
    }
    getLots() {
        return this.lots;
    }
    placeBid(lotId, franchiseId, incrementMinor) {
        const lot = this.lots.find((l) => l.id === lotId);
        if (!lot || lot.status !== 'ON_THE_BLOCK') {
            return { ok: false, reason: 'Lot is not currently on the auction block' };
        }
        const franchise = this.franchises.find((f) => f.franchiseId === franchiseId);
        if (!franchise) {
            return { ok: false, reason: 'Franchise not found' };
        }
        if (franchise.squadCount >= franchise.maxSquadSize) {
            return { ok: false, reason: `${franchise.franchiseName} has reached maximum squad size (${franchise.maxSquadSize})` };
        }
        if (lot.isOverseas && franchise.overseasCount >= franchise.maxOverseasSize) {
            return { ok: false, reason: `${franchise.franchiseName} has zero Overseas slots remaining (${franchise.maxOverseasSize}/${franchise.maxOverseasSize})` };
        }
        const proposedBid = lot.currentBidMinor + incrementMinor;
        if (proposedBid > franchise.remainingPurseMinor) {
            return {
                ok: false,
                reason: `Bid (₹${proposedBid.toLocaleString('en-IN')}) exceeds ${franchise.franchiseName} remaining salary cap purse (₹${franchise.remainingPurseMinor.toLocaleString('en-IN')})`,
            };
        }
        lot.currentBidMinor = proposedBid;
        lot.highestBidderFranchiseId = franchise.franchiseId;
        lot.highestBidderName = franchise.franchiseName;
        return { ok: true, updatedLot: { ...lot }, franchise: { ...franchise } };
    }
    exerciseRtmCard(lotId, rtmFranchiseId) {
        const lot = this.lots.find((l) => l.id === lotId);
        if (!lot)
            return { ok: false, reason: 'Lot not found' };
        if (lot.rtmEligibleFranchiseId !== rtmFranchiseId) {
            return { ok: false, reason: 'Franchise does not hold Right-To-Match (RTM) eligibility for this player' };
        }
        const franchise = this.franchises.find((f) => f.franchiseId === rtmFranchiseId);
        if (!franchise || franchise.rtmCardsRemaining <= 0) {
            return { ok: false, reason: 'No RTM cards remaining' };
        }
        if (lot.currentBidMinor > franchise.remainingPurseMinor) {
            return { ok: false, reason: 'Insufficient salary purse to match current highest bid via RTM' };
        }
        franchise.rtmCardsRemaining -= 1;
        lot.highestBidderFranchiseId = franchise.franchiseId;
        lot.highestBidderName = `${franchise.franchiseName} (RTM Matched)`;
        return { ok: true, updatedLot: { ...lot } };
    }
    gavelSold(lotId) {
        const lot = this.lots.find((l) => l.id === lotId);
        if (!lot || !lot.highestBidderFranchiseId) {
            return { ok: false, reason: 'Cannot mark SOLD without a valid winning bid' };
        }
        const franchise = this.franchises.find((f) => f.franchiseId === lot.highestBidderFranchiseId);
        if (!franchise) {
            return { ok: false, reason: 'Winning franchise not found' };
        }
        lot.status = 'SOLD';
        franchise.remainingPurseMinor -= lot.currentBidMinor;
        franchise.squadCount += 1;
        if (lot.isOverseas) {
            franchise.overseasCount += 1;
        }
        // Advance next UPCOMING lot to ON_THE_BLOCK
        const nextLot = this.lots.find((l) => l.status === 'UPCOMING');
        if (nextLot) {
            nextLot.status = 'ON_THE_BLOCK';
        }
        return { ok: true, soldLot: { ...lot } };
    }
}
//# sourceMappingURL=player-auction-draft.js.map