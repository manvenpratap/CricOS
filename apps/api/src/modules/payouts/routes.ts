import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'node:crypto';
import { query } from '../../platform/db.js';

export async function payoutsRoutes(app: FastifyInstance) {
  app.get('/payouts', async (_req: FastifyRequest, reply: FastifyReply) => {
    try {
      const res = await query(`SELECT * FROM provider_payouts ORDER BY created_at DESC LIMIT 50`);
      return reply.status(200).send(res.rows);
    } catch {}

    return reply.status(200).send([]);
  });

  app.post('/payouts/request', async (req: FastifyRequest<{
    Body: { provider_id: string; amount_minor: number; bank_account_ref?: string }
  }>, reply: FastifyReply) => {
    const { provider_id, amount_minor, bank_account_ref = 'bank_acc_sample' } = req.body || {};
    if (!provider_id || amount_minor === undefined) {
      return reply.status(400).send({ error: 'PROVIDER_AND_AMOUNT_REQUIRED' });
    }

    const payoutId = crypto.randomUUID();
    try {
      await query(
        `INSERT INTO provider_payouts (id, provider_id, amount_minor, currency, status, payout_batch_id)
         VALUES ($1, $2, $3, 'INR', 'REQUESTED', $4)`,
        [payoutId, provider_id, amount_minor, bank_account_ref]
      );
    } catch {}

    return reply.status(201).send({
      id: payoutId,
      provider_id,
      amount_minor,
      currency: 'INR',
      status: 'REQUESTED'
    });
  });
}
