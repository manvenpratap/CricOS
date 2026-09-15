import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'node:crypto';
import { query } from '../../platform/db.js';

export async function settlementRoutes(app: FastifyInstance) {
  app.get('/settlements', async (_req: FastifyRequest, reply: FastifyReply) => {
    try {
      const res = await query(`SELECT * FROM settlement_entries ORDER BY created_at DESC LIMIT 50`);
      return reply.status(200).send(res.rows);
    } catch {}

    return reply.status(200).send([]);
  });

  app.post('/settlements/process', async (req: FastifyRequest<{
    Body: { booking_id: string; provider_id: string; gross_minor: number; commission_minor: number }
  }>, reply: FastifyReply) => {
    const { booking_id, provider_id, gross_minor, commission_minor } = req.body || {};
    if (!booking_id || !provider_id || gross_minor === undefined || commission_minor === undefined) {
      return reply.status(400).send({ error: 'MISSING_FIELDS' });
    }

    const net_minor = gross_minor - commission_minor;
    const entryId = crypto.randomUUID();

    try {
      await query(
        `INSERT INTO settlement_entries (
          id, booking_id, provider_id, entry_type, gross_minor, commission_minor, net_minor, currency
        ) VALUES ($1, $2, $3, 'PAYABLE', $4, $5, $6, 'INR')`,
        [entryId, booking_id, provider_id, gross_minor, commission_minor, net_minor]
      );
    } catch {}

    return reply.status(201).send({
      id: entryId,
      booking_id,
      provider_id,
      gross_minor,
      commission_minor,
      net_minor,
      currency: 'INR',
      status: 'RECORDED'
    });
  });
}
