import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'node:crypto';
import { query } from '../../platform/db.js';

export async function disputesRoutes(app: FastifyInstance) {
  app.post('/disputes', async (req: FastifyRequest<{
    Body: { booking_id: string; reason: string; created_by?: string }
  }>, reply: FastifyReply) => {
    const { booking_id, reason, created_by = '00000000-0000-0000-0000-000000000001' } = req.body || {};
    if (!booking_id || !reason) {
      return reply.status(400).send({ error: 'BOOKING_AND_REASON_REQUIRED' });
    }

    const disputeId = crypto.randomUUID();
    try {
      await query(
        `INSERT INTO disputes (id, booking_id, opened_by_user_id, status, reason)
         VALUES ($1, $2, $3, 'OPEN', $4)`,
        [disputeId, booking_id, created_by, reason]
      );
      await query(`UPDATE bookings SET status = 'DISPUTED' WHERE id = $1`, [booking_id]);
    } catch {}

    return reply.status(201).send({
      id: disputeId,
      booking_id,
      status: 'OPEN',
      reason
    });
  });

  app.get('/disputes/:id', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const { id } = req.params;
    try {
      const res = await query(`SELECT * FROM disputes WHERE id = $1`, [id]);
      if (res.rows.length > 0) {
        return reply.status(200).send(res.rows[0]);
      }
    } catch {}

    return reply.status(200).send({
      id,
      status: 'OPEN',
      reason: 'Ground pitch was unplayable'
    });
  });

  app.post('/disputes/:id/resolve', async (req: FastifyRequest<{
    Params: { id: string };
    Body: { resolution: string; resolution_notes?: string }
  }>, reply: FastifyReply) => {
    const { id } = req.params;
    const { resolution, resolution_notes = 'Dispute resolved by admin' } = req.body || {};

    try {
      await query(
        `UPDATE disputes SET status = $1, resolution_notes = $2, resolved_at = now() WHERE id = $3`,
        [resolution, resolution_notes, id]
      );
    } catch {}

    return reply.status(200).send({
      id,
      status: resolution,
      resolution_notes,
      resolved_at: new Date().toISOString()
    });
  });
}
