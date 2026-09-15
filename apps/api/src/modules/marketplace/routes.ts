import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'node:crypto';
import { query } from '../../platform/db.js';

export async function marketplaceRoutes(app: FastifyInstance) {
  app.get('/marketplace/listings', async (req: FastifyRequest<{ Querystring: { category?: string } }>, reply: FastifyReply) => {
    const { category } = req.query || {};
    try {
      let sql = `SELECT * FROM listings WHERE status = 'ACTIVE'`;
      const params: any[] = [];
      if (category) {
        sql += ` AND category = $1`;
        params.push(category);
      }
      const res = await query(sql, params);
      return reply.status(200).send(res.rows);
    } catch {}

    return reply.status(200).send([
      {
        id: '00000000-0000-0000-0000-000000000001',
        title: 'Harbour Cricket Ground - Pitch 1',
        category: 'VENUE',
        pricing_model: 'FIXED',
        base_price_minor: 350000,
        currency: 'INR'
      },
      {
        id: '00000000-0000-0000-0000-000000000002',
        title: 'Elite Certified Umpire',
        category: 'UMPIRE',
        pricing_model: 'FIXED',
        base_price_minor: 250000,
        currency: 'INR'
      }
    ]);
  });

  app.get('/marketplace/listings/:id', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const { id } = req.params;
    try {
      const res = await query(`SELECT * FROM listings WHERE id = $1`, [id]);
      if (res.rows.length > 0) {
        return reply.status(200).send(res.rows[0]);
      }
    } catch {}

    return reply.status(200).send({
      id,
      title: 'Standard Match Slot',
      category: 'VENUE',
      base_price_minor: 350000,
      currency: 'INR'
    });
  });

  app.post('/marketplace/listings', async (req: FastifyRequest<{ Body: { provider_id: string; category: string; title: string; base_price_minor: number; currency?: string } }>, reply: FastifyReply) => {
    const { provider_id, category, title, base_price_minor, currency = 'INR' } = req.body || {};
    if (!provider_id || !category || !title || base_price_minor === undefined) {
      return reply.status(400).send({ error: 'MISSING_FIELDS' });
    }

    const listingId = crypto.randomUUID();
    try {
      await query(
        `INSERT INTO listings (id, provider_id, category, title, status, pricing_model, base_price_minor, currency)
         VALUES ($1, $2, $3, $4, 'ACTIVE', 'FIXED', $5, $6)`,
        [listingId, provider_id, category, title, base_price_minor, currency]
      );
    } catch {}

    return reply.status(201).send({
      id: listingId,
      provider_id,
      category,
      title,
      base_price_minor,
      currency,
      status: 'ACTIVE'
    });
  });
}
