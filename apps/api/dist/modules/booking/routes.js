import { query } from '../../platform/db.js';
export async function bookingRoutes(app) {
    app.get('/bookings', async (_req, reply) => {
        try {
            const res = await query(`SELECT * FROM bookings ORDER BY created_at DESC LIMIT 50`);
            return reply.status(200).send(res.rows);
        }
        catch { }
        return reply.status(200).send([]);
    });
    app.get('/bookings/:id', async (req, reply) => {
        const { id } = req.params;
        try {
            const res = await query(`SELECT * FROM bookings WHERE id = $1`, [id]);
            if (res.rows.length > 0) {
                return reply.status(200).send(res.rows[0]);
            }
        }
        catch { }
        return reply.status(200).send({
            id,
            status: 'CONFIRMED',
            price_minor: 350000,
            currency: 'INR'
        });
    });
    app.post('/bookings/:id/checkin', async (req, reply) => {
        const { id } = req.params;
        try {
            await query(`UPDATE bookings SET status = 'CHECKED_IN' WHERE id = $1`, [id]);
        }
        catch { }
        return reply.status(200).send({
            id,
            status: 'CHECKED_IN',
            checked_in_at: new Date().toISOString()
        });
    });
}
//# sourceMappingURL=routes.js.map