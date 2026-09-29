import crypto from 'node:crypto';
import { query } from '../../platform/db.js';
export async function availabilityRoutes(app) {
    app.get('/availability/slots', async (req, reply) => {
        const { listing_id } = req.query || {};
        try {
            let sql = `SELECT * FROM service_slots WHERE status = 'AVAILABLE'`;
            const params = [];
            if (listing_id) {
                sql += ` AND listing_id = $1`;
                params.push(listing_id);
            }
            const res = await query(sql, params);
            return reply.status(200).send(res.rows);
        }
        catch { }
        return reply.status(200).send([]);
    });
    app.post('/availability/holds', async (req, reply) => {
        const { slot_id, starts_at, ends_at, user_id = '00000000-0000-0000-0000-000000000001' } = req.body || {};
        if (!slot_id) {
            return reply.status(400).send({ error: 'SLOT_ID_REQUIRED' });
        }
        const holdId = crypto.randomUUID();
        const heldUntil = new Date(Date.now() + 15 * 60 * 1000); // 15-minute hold TTL
        try {
            await query(`INSERT INTO inventory_holds (id, slot_id, user_id, held_until, status)
         VALUES ($1, $2, $3, $4, 'ACTIVE')`, [holdId, slot_id, user_id, heldUntil]);
        }
        catch { }
        return reply.status(201).send({
            hold_id: holdId,
            slot_id,
            user_id,
            status: 'ACTIVE',
            held_until: heldUntil.toISOString()
        });
    });
    app.delete('/availability/holds/:id', async (req, reply) => {
        const { id } = req.params;
        try {
            await query(`UPDATE inventory_holds SET status = 'RELEASED' WHERE id = $1`, [id]);
        }
        catch { }
        return reply.status(200).send({
            id,
            status: 'RELEASED'
        });
    });
}
//# sourceMappingURL=routes.js.map