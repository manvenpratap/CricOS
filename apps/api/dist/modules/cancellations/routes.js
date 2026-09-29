import { query } from '../../platform/db.js';
export async function cancellationsRoutes(app) {
    app.post('/bookings/:id/cancel', async (req, reply) => {
        const { id } = req.params;
        const { reason = 'User requested cancellation' } = req.body || {};
        try {
            await query(`UPDATE bookings SET status = 'CANCELLED' WHERE id = $1`, [id]);
        }
        catch { }
        return reply.status(200).send({
            id,
            status: 'CANCELLED',
            reason,
            refund_status: 'PENDING_SETTLEMENT'
        });
    });
}
//# sourceMappingURL=routes.js.map