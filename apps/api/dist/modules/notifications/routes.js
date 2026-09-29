import { query } from '../../platform/db.js';
export async function notificationsRoutes(app) {
    app.get('/notifications', async (_req, reply) => {
        try {
            const res = await query(`SELECT * FROM notification_events ORDER BY created_at DESC LIMIT 20`);
            return reply.status(200).send(res.rows);
        }
        catch { }
        return reply.status(200).send([]);
    });
}
//# sourceMappingURL=routes.js.map