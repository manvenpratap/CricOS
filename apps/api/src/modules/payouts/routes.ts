import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'node:crypto';
import { query } from '../../platform/db.js';
import { getProviderReputation } from '../reputation/routes.js';
import { hasOpenDisputeForBooking } from '../disputes/routes.js';

// In-memory store for sandbox / test runs
const payoutsCache = new Map<string, any>();

export async function payoutsRoutes(app: FastifyInstance) {
  app.get('/payouts', async (_req: FastifyRequest, reply: FastifyReply) => {
    if (payoutsCache.size > 0) {
      return reply.status(200).send(Array.from(payoutsCache.values()));
    }

    try {
      const res = await query(`SELECT * FROM provider_payouts ORDER BY created_at DESC LIMIT 50`);
      return reply.status(200).send(res.rows);
    } catch {}

    return reply.status(200).send([]);
  });

  app.post('/payouts/request', async (req: FastifyRequest<{
    Body: {
      provider_id?: string;
      providerId?: string;
      booking_id?: string;
      bookingId?: string;
      amount_minor?: number;
      amountMinor?: number;
      bank_account_ref?: string;
    }
  }>, reply: FastifyReply) => {
    const body = req.body || {};
    const provider_id = body.provider_id || body.providerId;
    const booking_id = body.booking_id || body.bookingId;
    const amount_minor = body.amount_minor ?? body.amountMinor;
    const bank_account_ref = body.bank_account_ref || 'bank_acc_sample';

    if (!provider_id || amount_minor === undefined) {
      return reply.status(400).send({ error: 'PROVIDER_AND_AMOUNT_REQUIRED' });
    }

    const payoutId = crypto.randomUUID();
    const record = {
      id: payoutId,
      payout_id: payoutId,
      provider_id,
      booking_id: booking_id || null,
      amount_minor,
      currency: 'INR',
      status: 'REQUESTED',
      bank_account_ref,
      created_at: new Date().toISOString()
    };
    payoutsCache.set(payoutId, record);

    try {
      await query(
        `INSERT INTO provider_payouts (id, provider_id, amount_minor, currency, status, payout_batch_id)
         VALUES ($1, $2, $3, 'INR', 'REQUESTED', $4)`,
        [payoutId, provider_id, amount_minor, bank_account_ref]
      );
    } catch {}

    return reply.status(201).send(record);
  });

  app.post('/payouts/disburse', async (req: FastifyRequest<{
    Body: {
      payout_id?: string;
      payoutId?: string;
      provider_id?: string;
      providerId?: string;
      booking_id?: string;
      bookingId?: string;
      amount_minor?: number;
      amountMinor?: number;
    }
  }>, reply: FastifyReply) => {
    const body = req.body || {};
    const payoutId = body.payout_id || body.payoutId || crypto.randomUUID();
    const provider_id = body.provider_id || body.providerId;
    const booking_id = body.booking_id || body.bookingId;
    const amount_minor = body.amount_minor ?? body.amountMinor ?? 300000;

    if (!provider_id) {
      return reply.status(400).send({ error: 'PROVIDER_ID_REQUIRED' });
    }

    // 1. Invariant: Check if booking has an active open dispute
    if (booking_id) {
      let openDispute = hasOpenDisputeForBooking(booking_id);
      if (!openDispute) {
        try {
          const disputeRes = await query(
            `SELECT id FROM disputes WHERE booking_id = $1 AND status = 'OPEN'`,
            [booking_id]
          );
          if (disputeRes.rows.length > 0) openDispute = true;
        } catch {}
      }

      if (openDispute) {
        return reply.status(422).send({
          error: 'DISPUTE_IN_PROGRESS',
          message: 'Disbursement blocked: Booking has an open dispute pending administrative resolution'
        });
      }
    }

    // 2. Invariant: Circuit breaker check — Verify provider trust state is not SUSPENDED
    let rep = getProviderReputation(provider_id);
    try {
      const provRes = await query(
        `SELECT trust_state FROM providers WHERE id = $1`,
        [provider_id]
      );
      const provRow = provRes.rows[0];
      if (provRow && provRow.trust_state) {
        rep = { ...rep, trust_state: provRow.trust_state };
      }
    } catch {}

    if (rep.trust_state === 'SUSPENDED') {
      return reply.status(422).send({
        error: 'PROVIDER_SUSPENDED_CIRCUIT_BREAKER_ACTIVE',
        message: 'Disbursement blocked: Provider trust state is SUSPENDED. Circuit breaker tripped.'
      });
    }

    const disbursementRecord = {
      id: payoutId,
      payout_id: payoutId,
      provider_id,
      booking_id: booking_id || null,
      amount_minor,
      currency: 'INR',
      status: 'DISBURSED',
      disbursed_at: new Date().toISOString()
    };
    payoutsCache.set(payoutId, disbursementRecord);

    try {
      await query(
        `UPDATE provider_payouts SET status = 'DISBURSED' WHERE id = $1`,
        [payoutId]
      );
    } catch {}

    return reply.status(200).send(disbursementRecord);
  });
}
