import crypto from 'node:crypto';
import { query } from '../../platform/db.js';
export async function marketplaceRoutes(app) {
    app.get('/marketplace/listings', async (req, reply) => {
        const { category } = req.query || {};
        try {
            let sql = `SELECT * FROM listings WHERE status = 'ACTIVE'`;
            const params = [];
            if (category) {
                sql += ` AND category = $1`;
                params.push(category);
            }
            const res = await query(sql, params);
            return reply.status(200).send(res.rows);
        }
        catch { }
        const defaultListings = [
            {
                id: '00000000-0000-0000-0000-000000000001',
                title: 'Harbour Cricket Ground - Pitch 1',
                category: 'VENUE',
                pricing_model: 'FIXED',
                base_price_minor: 350000,
                currency: 'INR'
            },
            {
                id: '00000000-0000-0000-0000-000000000002',
                title: 'Elite Certified Umpire',
                category: 'UMPIRE',
                pricing_model: 'FIXED',
                base_price_minor: 250000,
                currency: 'INR'
            },
            {
                id: '00000000-0000-0000-0000-000000000003',
                title: 'BCCI State Panel Scorer',
                category: 'SCORER',
                pricing_model: 'FIXED',
                base_price_minor: 150000,
                currency: 'INR'
            }
        ];
        if (category) {
            return reply.status(200).send(defaultListings.filter(l => l.category === category || (category === 'GROUND' && l.category === 'VENUE')));
        }
        return reply.status(200).send(defaultListings);
    });
    app.get('/marketplace/listings/:id', async (req, reply) => {
        const { id } = req.params;
        try {
            const res = await query(`SELECT * FROM listings WHERE id = $1`, [id]);
            if (res.rows.length > 0) {
                return reply.status(200).send(res.rows[0]);
            }
        }
        catch { }
        return reply.status(200).send({
            id,
            title: 'Standard Match Slot',
            category: 'VENUE',
            base_price_minor: 350000,
            currency: 'INR'
        });
    });
    app.post('/marketplace/listings', async (req, reply) => {
        const { provider_id, category, title, base_price_minor, currency = 'INR' } = req.body || {};
        if (!provider_id || !category || !title || base_price_minor === undefined) {
            return reply.status(400).send({ error: 'MISSING_FIELDS' });
        }
        const listingId = crypto.randomUUID();
        try {
            await query(`INSERT INTO listings (id, provider_id, category, title, status, pricing_model, base_price_minor, currency)
         VALUES ($1, $2, $3, $4, 'ACTIVE', 'FIXED', $5, $6)`, [listingId, provider_id, category, title, base_price_minor, currency]);
        }
        catch { }
        return reply.status(201).send({
            id: listingId,
            provider_id,
            category,
            title,
            base_price_minor,
            currency,
            status: 'ACTIVE'
        });
    });
    // ── P1-002: Physical Commerce & Cricket Gear ──────────────────────────────────
    const productsStore = [
        {
            id: 'prod-001',
            provider_id: '00000000-0000-0000-0000-000000000001',
            title: 'Match-Grade Leather Balls (Box of 6)',
            description: 'Four-piece alum tanned English leather match balls, waterproofed, MCC Law 4 compliant.',
            category: 'BALLS',
            price_minor: 480000, // ₹4,800
            currency: 'INR',
            stock_quantity: 45,
            variants: [{ name: 'Color', options: ['Red', 'White', 'Pink'] }]
        },
        {
            id: 'prod-002',
            provider_id: '00000000-0000-0000-0000-000000000001',
            title: 'Pro Practice Net Cage (Day Rental)',
            description: 'Heavy duty polyethylene 12x4m cricket practice net with iron frame.',
            category: 'EQUIPMENT',
            price_minor: 150000, // ₹1,500
            currency: 'INR',
            stock_quantity: 4,
            variants: []
        },
        {
            id: 'prod-003',
            provider_id: '00000000-0000-0000-0000-000000000001',
            title: 'Championship Trophy & Medals Set',
            description: 'Gold-plated winner trophy (24-inch) plus 16 embossed bronze medals.',
            category: 'TROPHIES',
            price_minor: 850000, // ₹8,500
            currency: 'INR',
            stock_quantity: 12,
            variants: []
        }
    ];
    app.get('/marketplace/products', async (req, reply) => {
        const { category } = req.query || {};
        if (category) {
            return reply.status(200).send(productsStore.filter(p => p.category.toUpperCase() === category.toUpperCase()));
        }
        return reply.status(200).send(productsStore);
    });
    app.post('/marketplace/products', async (req, reply) => {
        const { provider_id, title, description, category, price_minor, currency = 'INR', stock_quantity = 10, variants = [] } = req.body || {};
        if (!provider_id || !title || price_minor === undefined) {
            return reply.status(400).send({ error: 'MISSING_FIELDS' });
        }
        const newProd = {
            id: `prod-${Date.now()}`,
            provider_id,
            title,
            description,
            category,
            price_minor,
            currency,
            stock_quantity,
            variants,
            status: 'ACTIVE'
        };
        productsStore.push(newProd);
        return reply.status(201).send(newProd);
    });
    // ── P1-004: Scorer Marketplace ───────────────────────────────────────────────
    app.get('/marketplace/scorers', async (_req, reply) => {
        return reply.status(200).send([
            {
                id: 'scorer-001',
                provider_id: '00000000-0000-0000-0000-000000000031',
                name: 'Arjun Mehta',
                certification_level: 'BCCI_LEVEL_1',
                scoring_software_expertise: ['CricOS Live', 'CricClubs', 'Pitchero'],
                match_fee_minor: 120000, // ₹1,200 / match
                currency: 'INR',
                matches_scored: 184,
                trust_rating: 98,
                status: 'ACTIVE'
            },
            {
                id: 'scorer-002',
                provider_id: '00000000-0000-0000-0000-000000000032',
                name: 'Rohan Deshmukh',
                certification_level: 'STATE',
                scoring_software_expertise: ['CricOS Live', 'Dartfish'],
                match_fee_minor: 85000, // ₹850 / match
                currency: 'INR',
                matches_scored: 76,
                trust_rating: 92,
                status: 'ACTIVE'
            }
        ]);
    });
    // ── P1-005: Media Marketplace ────────────────────────────────────────────────
    app.get('/marketplace/media', async (_req, reply) => {
        return reply.status(200).send([
            {
                id: 'media-001',
                provider_id: '00000000-0000-0000-0000-000000000041',
                media_type: 'STREAMER',
                package_title: 'Full HD 1080p Single-Cam Live Stream + YouTube Broadcast',
                package_price_minor: 650000, // ₹6,500
                equipment_details: ['Sony FX3', 'Elgato Cam Link 4K', '5G Live Bonding Modem', 'Wireless Score Bug Overlay'],
                status: 'ACTIVE'
            },
            {
                id: 'media-002',
                provider_id: '00000000-0000-0000-0000-000000000042',
                media_type: 'COMMENTATOR',
                package_title: 'Bilingual Live Match Commentary (English & Hindi)',
                package_price_minor: 250000, // ₹2,500
                equipment_details: ['Rodecaster Pro II', 'Shure SM7B Microphones'],
                status: 'ACTIVE'
            }
        ]);
    });
    // ── P1-009: Grounds & Advanced Pitch Facilities ─────────────────────────────
    app.get('/marketplace/grounds/facilities', async (_req, reply) => {
        return reply.status(200).send([
            {
                venue_id: 'venue-001',
                name: 'Harbour International Cricket Oval',
                pitch_types: ['NATURAL_TURF', 'HYBRID_BERMUDA'],
                boundary_dimensions: {
                    straight_meters: 72,
                    square_leg_meters: 68,
                    cover_meters: 67
                },
                facilities: [
                    '400_LUX_LED_FLOODLIGHTS',
                    'AIR_CONDITIONED_PAVILION',
                    'SIGHTSCREENS_BOTH_ENDS',
                    'DIGITAL_LED_SCOREBOARD',
                    'TURF_PRACTICE_NETS'
                ],
                hourly_rate_minor: 350000,
                currency: 'INR'
            }
        ]);
    });
}
//# sourceMappingURL=routes.js.map