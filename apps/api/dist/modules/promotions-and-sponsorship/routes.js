import crypto from 'node:crypto';
import { query } from '../../platform/db.js';
import { evaluateAuctionBid } from '@cricket-platform/domain';
import { createSponsorshipJournalEntry } from '@cricket-platform/commercial';
export async function promotionsAndSponsorshipRoutes(app) {
    // ── P1-012: Promotional Coupons Engine ───────────────────────────────────────
    const coupons = new Map([
        ['CRIC20', { code: 'CRIC20', discount_percent: 20, min_basket_minor: 100000 }],
        ['TURF500', { code: 'TURF500', fixed_discount_minor: 50000, min_basket_minor: 250000 }],
        ['SEASONOPEN', { code: 'SEASONOPEN', discount_percent: 15, min_basket_minor: 50000 }]
    ]);
    app.post('/checkout/coupons/validate', async (req, reply) => {
        const { code, basket_value_minor, currency = 'INR' } = req.body || {};
        if (!code || basket_value_minor === undefined) {
            return reply.status(400).send({ error: 'MISSING_FIELDS' });
        }
        const coupon = coupons.get(code.toUpperCase());
        if (!coupon) {
            return reply.status(404).send({
                valid: false,
                code,
                discount_minor: 0,
                final_amount_minor: basket_value_minor,
                message: 'Invalid promo code. Please check and try again.'
            });
        }
        if (basket_value_minor < coupon.min_basket_minor) {
            return reply.status(400).send({
                valid: false,
                code,
                discount_minor: 0,
                final_amount_minor: basket_value_minor,
                message: `Promo code ${coupon.code} requires a minimum order value of ₹${coupon.min_basket_minor / 100}.`
            });
        }
        let discountMinor = 0;
        if (coupon.discount_percent) {
            discountMinor = Math.round((basket_value_minor * coupon.discount_percent) / 100);
        }
        else if (coupon.fixed_discount_minor) {
            discountMinor = Math.min(basket_value_minor, coupon.fixed_discount_minor);
        }
        const finalAmountMinor = Math.max(0, basket_value_minor - discountMinor);
        return reply.status(200).send({
            valid: true,
            code: coupon.code,
            discount_minor: discountMinor,
            final_amount_minor: finalAmountMinor,
            message: `Coupon ${coupon.code} applied! You saved ₹${(discountMinor / 100).toFixed(2)}.`
        });
    });
    // ── P2-004: Sponsorship Inventory & Prize Pool Pledges ───────────────────────
    const sponsorshipStore = new Map([
        [
            '00000000-0000-0000-0000-000000000010',
            [
                {
                    id: 'sp-001',
                    tournament_id: '00000000-0000-0000-0000-000000000010',
                    tier: 'TITLE',
                    title: 'Premier Trophy Title Sponsorship',
                    pledge_amount_minor: 25000000, // ₹2,50,000
                    currency: 'INR',
                    sponsor_name: 'RedBull Cricket Energy',
                    status: 'CONFIRMED'
                },
                {
                    id: 'sp-002',
                    tournament_id: '00000000-0000-0000-0000-000000000010',
                    tier: 'BALL_SPONSOR',
                    title: 'Official Match Ball Sponsorship',
                    pledge_amount_minor: 7500000, // ₹75,000
                    currency: 'INR',
                    sponsor_name: 'SG Cricket Gear',
                    status: 'CONFIRMED'
                },
                {
                    id: 'sp-003',
                    tournament_id: '00000000-0000-0000-0000-000000000010',
                    tier: 'PLAYER_OF_MATCH',
                    title: 'Player of the Tournament Prize Purse',
                    pledge_amount_minor: 5000000, // ₹50,000
                    currency: 'INR',
                    status: 'AVAILABLE'
                }
            ]
        ]
    ]);
    app.get('/sponsorship/tournaments/:id', async (req, reply) => {
        const { id } = req.params;
        const items = sponsorshipStore.get(id) || [];
        return reply.status(200).send(items);
    });
    app.post('/sponsorship/pledge', async (req, reply) => {
        const { tournament_id, tier, sponsor_name, pledge_amount_minor, currency = 'INR' } = req.body || {};
        if (!tournament_id || !tier || !sponsor_name || pledge_amount_minor === undefined) {
            return reply.status(400).send({ error: 'MISSING_FIELDS' });
        }
        const pledgeId = `sp-${Date.now()}`;
        const newPledge = {
            id: pledgeId,
            tournament_id,
            tier,
            title: `${sponsor_name} ${tier} Sponsorship`,
            pledge_amount_minor,
            currency,
            sponsor_name,
            status: 'CONFIRMED'
        };
        const current = sponsorshipStore.get(tournament_id) || [];
        current.push(newPledge);
        sponsorshipStore.set(tournament_id, current);
        // Double-entry ledger entry for sponsorship pledge
        const journal = createSponsorshipJournalEntry({
            tournamentId: tournament_id,
            pledgeAmountMinor: pledge_amount_minor,
            sponsorName: sponsor_name,
            currency
        });
        try {
            await query(`INSERT INTO audit_events (id, actor_user_id, action, object_type, object_id, metadata, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`, [crypto.randomUUID(), '00000000-0000-0000-0000-000000000001', 'SPONSORSHIP_PLEDGE', 'sponsorship', pledgeId, JSON.stringify({ newPledge, journalId: journal.id })]);
        }
        catch { }
        return reply.status(201).send({
            pledge: newPledge,
            journal_entry: journal,
            message: 'Sponsorship pledge accepted and locked in escrow.'
        });
    });
    // ── P3-001: Virtual Player Auction Bidding Engine ───────────────────────────
    const auctionState = {
        auction_id: 'auc-001',
        player_id: 'p-101',
        player_name: 'K.L. Rahul',
        base_price_minor: 10000000, // ₹1,00,000
        current_highest_bid_minor: 32500000, // ₹3,25,000
        highest_bidder_team_id: 'team-1',
        status: 'ACTIVE'
    };
    app.post('/auctions/bid', async (req, reply) => {
        const { auction_id, team_id, player_id, bid_amount_minor, team_purse_remaining_minor = 100000000, // 10,00,000 INR minor
        remaining_squad_slots = 5 } = req.body || {};
        if (!auction_id || !team_id || !player_id || bid_amount_minor === undefined) {
            return reply.status(400).send({ error: 'MISSING_FIELDS' });
        }
        const evaluation = evaluateAuctionBid({
            teamPurseRemainingMinor: team_purse_remaining_minor,
            currentHighestBidMinor: auctionState.current_highest_bid_minor,
            newBidMinor: bid_amount_minor,
            remainingSquadSlots: remaining_squad_slots
        });
        if (!evaluation.accepted) {
            return reply.status(400).send({
                status: 'REJECTED',
                reason: evaluation.message,
                current_highest_bid_minor: auctionState.current_highest_bid_minor,
                highest_bidder_team_id: auctionState.highest_bidder_team_id
            });
        }
        auctionState.current_highest_bid_minor = bid_amount_minor;
        auctionState.highest_bidder_team_id = team_id;
        return reply.status(200).send({
            bid_id: crypto.randomUUID(),
            auction_id,
            team_id,
            player_id,
            status: 'ACCEPTED',
            current_highest_bid_minor: bid_amount_minor,
            message: evaluation.message
        });
    });
    // ── P3-002: Weather-Triggered Insurance Claims ───────────────────────────────
    app.post('/insurance/claims/weather', async (req, reply) => {
        const { booking_id, match_id, precipitation_mm } = req.body || {};
        if (!booking_id || !match_id || precipitation_mm === undefined) {
            return reply.status(400).send({ error: 'MISSING_FIELDS' });
        }
        const threshold = 15.0; // 15mm precipitation triggers automatic rain washout claim
        const isWashout = precipitation_mm >= threshold;
        return reply.status(200).send({
            claim_id: crypto.randomUUID(),
            booking_id,
            match_id,
            precipitation_mm,
            threshold_mm: threshold,
            status: isWashout ? 'VERIFIED' : 'REJECTED',
            payout_minor: isWashout ? 350000 : 0,
            message: isWashout
                ? `Precipitation of ${precipitation_mm}mm exceeded ${threshold}mm threshold. Rain insurance payout verified and released.`
                : `Precipitation of ${precipitation_mm}mm does not exceed threshold of ${threshold}mm.`
        });
    });
    // ── P2-006: Coaching Academies & Training Subscriptions ─────────────────────
    app.get('/academies', async (_req, reply) => {
        return reply.status(200).send([
            {
                id: 'acad-001',
                name: 'Karnataka Institute of Cricket (KIOC)',
                city: 'Bengaluru',
                head_coach: 'Irfan Sait (BCCI Level 3)',
                facilities: ['16_TURF_NETS', 'BOWLING_MACHINES', 'SPEED_RADAR_GUN', 'FLOODLIT_EVENING_SESSIONS'],
                monthly_subscription_minor: 450000, // ₹4,500 / month
                currency: 'INR',
                rating: 96
            },
            {
                id: 'acad-002',
                name: 'National School of Cricket',
                city: 'Mumbai',
                head_coach: 'Sunil Joshi',
                facilities: ['8_INDOOR_ASTROTURF_NETS', 'VIDEO_ANALYSIS_STUDIO', 'PHYSIOTHERAPY_ROOM'],
                monthly_subscription_minor: 600000, // ₹6,000 / month
                currency: 'INR',
                rating: 94
            }
        ]);
    });
}
//# sourceMappingURL=routes.js.map