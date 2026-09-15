import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'node:crypto';
import { query } from '../../platform/db.js';

export async function reschedulingRoutes(app: FastifyInstance) {
  app.post('/fixtures/:id/reschedule', async (req: FastifyRequest<{
    Params: { id: string };
    Body: { new_starts_at: string; reason?: string }
  }>, reply: FastifyReply) => {
    const { id } = req.params;
    const { new_starts_at, reason = 'Adverse weather' } = req.body || {};
    if (!new_starts_at) {
      return reply.status(400).send({ error: 'NEW_STARTS_AT_REQUIRED' });
    }

    const attemptId = crypto.randomUUID();
    try {
      await query(
        `INSERT INTO fixture_reschedule_attempts (id, fixture_id, requested_slot, reason, status)
         VALUES ($1, $2, $3, $4, 'PROPOSED')`,
        [attemptId, id, new Date(new_starts_at), reason]
      );
    } catch {}

    return reply.status(200).send({
      attempt_id: attemptId,
      fixture_id: id,
      new_starts_at,
      status: 'PROPOSED',
      reason
    });
  });
}
