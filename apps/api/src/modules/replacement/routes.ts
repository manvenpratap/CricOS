import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'node:crypto';
import { query } from '../../platform/db.js';

export async function replacementRoutes(app: FastifyInstance) {
  app.post('/incidents', async (req: FastifyRequest<{
    Body: { booking_id: string; type: string; reason: string }
  }>, reply: FastifyReply) => {
    const { booking_id, type = 'PROVIDER_NO_SHOW', reason } = req.body || {};
    if (!booking_id || !reason) {
      return reply.status(400).send({ error: 'BOOKING_AND_REASON_REQUIRED' });
    }

    const incidentId = crypto.randomUUID();
    try {
      await query(
        `INSERT INTO service_incidents (id, booking_id, type, status, reason)
         VALUES ($1, $2, $3, 'OPEN', $4)`,
        [incidentId, booking_id, type, reason]
      );
    } catch {}

    return reply.status(201).send({
      id: incidentId,
      booking_id,
      type,
      status: 'OPEN',
      reason
    });
  });

  app.post('/replacements/propose', async (req: FastifyRequest<{
    Body: { incident_id?: string; original_booking_id: string; proposed_provider_id: string; proposed_slot_id?: string; price_delta_minor?: number }
  }>, reply: FastifyReply) => {
    const { original_booking_id, proposed_provider_id, proposed_slot_id = crypto.randomUUID(), price_delta_minor = 0 } = req.body || {};
    if (!original_booking_id || !proposed_provider_id) {
      return reply.status(400).send({ error: 'ORIGINAL_BOOKING_AND_PROVIDER_REQUIRED' });
    }

    const proposalId = crypto.randomUUID();
    try {
      await query(
        `INSERT INTO replacement_proposals (id, booking_id, proposed_provider_id, proposed_slot_id, status, price_delta_minor, currency)
         VALUES ($1, $2, $3, $4, 'PENDING', $5, 'INR')`,
        [proposalId, original_booking_id, proposed_provider_id, proposed_slot_id, price_delta_minor]
      );
    } catch {}

    return reply.status(201).send({
      id: proposalId,
      original_booking_id,
      proposed_provider_id,
      proposed_slot_id,
      status: 'PENDING',
      price_delta_minor
    });
  });

  app.post('/replacements/:id/accept', async (req: FastifyRequest<{
    Params: { id: string };
    Body: { accepted_by?: string; reason?: string }
  }>, reply: FastifyReply) => {
    const { id } = req.params;
    const { accepted_by = '00000000-0000-0000-0000-000000000001', reason = 'Replacement accepted' } = req.body || {};

    try {
      await query(
        `UPDATE replacement_proposals SET status = 'ACCEPTED', accepted_by = $1, acceptance_reason = $2 WHERE id = $3`,
        [accepted_by, reason, id]
      );
    } catch {}

    return reply.status(200).send({
      id,
      status: 'ACCEPTED',
      accepted_by,
      acceptance_reason: reason
    });
  });
}
