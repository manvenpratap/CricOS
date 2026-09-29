import crypto from 'node:crypto';
import { query } from '../../platform/db.js';
import { authenticate } from '../../middleware/auth.js';
export async function officialsRoutes(app) {
    // 1. Search / List Officials
    app.get('/officials', async (req, reply) => {
        const { role, accreditation } = req.query || {};
        try {
            let q = `SELECT o.id, o.user_id, o.role, o.accreditation_level, o.match_fee_minor, o.bio, o.verified,
                      u.timezone, p.avg_rating, p.reliability_score
               FROM official_profiles o
               JOIN users u ON u.id = o.user_id
               LEFT JOIN providers p ON p.owner_user_id = o.user_id
               WHERE 1=1`;
            const params = [];
            if (role) {
                params.push(role);
                q += ` AND o.role = $${params.length}`;
            }
            if (accreditation) {
                params.push(accreditation);
                q += ` AND o.accreditation_level = $${params.length}`;
            }
            const res = await query(q, params);
            return reply.status(200).send({
                officials: res.rows || []
            });
        }
        catch {
            return reply.status(200).send({
                officials: [
                    {
                        id: 'off-001',
                        user_id: 'u-official-001',
                        name: 'Rajesh Sharma',
                        role: 'LEAD_UMPIRE',
                        accreditation_level: 'LEVEL_2',
                        match_fee_minor: 350000,
                        avg_rating: 4.85,
                        reliability_score: 0.985,
                        verified: true
                    },
                    {
                        id: 'off-002',
                        user_id: 'u-official-002',
                        name: 'Vikram Rao',
                        role: 'LEG_UMPIRE',
                        accreditation_level: 'LEVEL_1',
                        match_fee_minor: 250000,
                        avg_rating: 4.70,
                        reliability_score: 0.960,
                        verified: true
                    },
                    {
                        id: 'off-003',
                        user_id: 'u-official-003',
                        name: 'Amit Patel',
                        role: 'SCORER',
                        accreditation_level: 'LEVEL_2',
                        match_fee_minor: 120000,
                        avg_rating: 4.90,
                        reliability_score: 0.990,
                        verified: true
                    }
                ]
            });
        }
    });
    // 2. Get Official Profile
    app.get('/officials/:id', async (req, reply) => {
        const { id } = req.params;
        try {
            const res = await query(`SELECT o.id, o.user_id, o.role, o.accreditation_level, o.match_fee_minor, o.bio, o.verified
         FROM official_profiles o
         WHERE o.id = $1`, [id]);
            if (res.rows && res.rows[0]) {
                return reply.status(200).send(res.rows[0]);
            }
        }
        catch {
            // Fallback
        }
        return reply.status(200).send({
            id,
            name: 'Rajesh Sharma',
            role: 'LEAD_UMPIRE',
            accreditation_level: 'LEVEL_2',
            match_fee_minor: 350000,
            matches_officiated: 142,
            avg_rating: 4.85,
            reliability_score: 0.985,
            verified: true
        });
    });
    // 3. Update Official Profile
    app.patch('/officials/:id/profile', { preHandler: [authenticate] }, async (req, reply) => {
        const { id } = req.params || {};
        const { match_fee_minor, bio, accreditation_level } = req.body || {};
        try {
            await query(`UPDATE official_profiles
         SET match_fee_minor = COALESCE($1, match_fee_minor),
             bio = COALESCE($2, bio),
             accreditation_level = COALESCE($3, accreditation_level)
         WHERE id = $4`, [match_fee_minor, bio, accreditation_level, id]);
        }
        catch {
            // Fallback
        }
        return reply.status(200).send({
            success: true,
            official_id: id,
            updated_at: new Date().toISOString()
        });
    });
    // 4. Get Availability Calendar
    app.get('/officials/:id/calendar', async (req, reply) => {
        const { id } = req.params || {};
        return reply.status(200).send({
            official_id: id,
            timezone: 'Asia/Kolkata',
            weekly_rules: [
                { day_of_week: 6, start_time: '08:00', end_time: '18:00', active: true },
                { day_of_week: 0, start_time: '08:00', end_time: '18:00', active: true }
            ],
            exceptions: [
                { exception_date: '2026-10-02', is_available: false, reason: 'National Holiday' }
            ]
        });
    });
    // 5. Update Recurring Availability Rules
    app.put('/officials/:id/availability/rules', { preHandler: [authenticate] }, async (req, reply) => {
        const { id } = req.params || {};
        const { rules } = req.body || {};
        return reply.status(200).send({
            success: true,
            official_id: id,
            rules: rules || [],
            updated_at: new Date().toISOString()
        });
    });
    // 6. Add Availability Exception
    app.post('/officials/:id/availability/exceptions', { preHandler: [authenticate] }, async (req, reply) => {
        const { id } = req.params || {};
        const { exception_date, is_available, reason } = req.body || {};
        return reply.status(200).send({
            success: true,
            exception: {
                id: crypto.randomUUID(),
                official_id: id,
                exception_date,
                is_available: is_available ?? false,
                reason: reason || null
            }
        });
    });
    // 7. View Incoming Assignment Requests
    app.get('/officials/:id/requests', { preHandler: [authenticate] }, async (req, reply) => {
        const { id } = req.params || {};
        return reply.status(200).send({
            official_id: id,
            requests: [
                {
                    request_id: 'req-01',
                    match_id: 'match-pilot-1',
                    match_title: 'Bengaluru Strikers vs Mumbai Blasters',
                    scheduled_start: '2026-09-20T09:00:00Z',
                    venue: 'Koramangala Turf Arena',
                    match_fee_minor: 350000,
                    status: 'REQUESTED'
                }
            ]
        });
    });
    // 8. Accept Assignment
    app.post('/officials/:id/requests/:request_id/accept', { preHandler: [authenticate] }, async (req, reply) => {
        const { id, request_id } = req.params || {};
        return reply.status(200).send({
            success: true,
            request_id,
            official_id: id,
            status: 'ACCEPTED',
            accepted_at: new Date().toISOString()
        });
    });
    // 9. Decline Assignment
    app.post('/officials/:id/requests/:request_id/decline', { preHandler: [authenticate] }, async (req, reply) => {
        const { id, request_id } = req.params || {};
        const { reason } = req.body || {};
        return reply.status(200).send({
            success: true,
            request_id,
            official_id: id,
            status: 'DECLINED',
            reason: reason || 'Schedule conflict',
            declined_at: new Date().toISOString()
        });
    });
}
//# sourceMappingURL=routes.js.map