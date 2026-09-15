import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

interface BasketItem {
  id: string;
  listing_id: string;
  slot_id: string;
  price_minor: number;
}

// In-memory session store for baskets
const baskets = new Map<string, BasketItem[]>();

export async function basketRoutes(app: FastifyInstance) {
  app.get('/basket', async (req: FastifyRequest<{ Querystring: { user_id?: string } }>, reply: FastifyReply) => {
    const userId = req.query?.user_id || 'default-user';
    const items = baskets.get(userId) || [];
    const total_minor = items.reduce((acc, x) => acc + x.price_minor, 0);

    return reply.status(200).send({
      user_id: userId,
      items,
      total_minor,
      currency: 'INR'
    });
  });

  app.post('/basket/items', async (req: FastifyRequest<{ Body: { user_id?: string; listing_id: string; slot_id: string; price_minor?: number } }>, reply: FastifyReply) => {
    const { user_id = 'default-user', listing_id, slot_id, price_minor = 350000 } = req.body || {};
    if (!listing_id || !slot_id) {
      return reply.status(400).send({ error: 'LISTING_AND_SLOT_REQUIRED' });
    }

    const items = baskets.get(user_id) || [];
    const item: BasketItem = {
      id: `item-${Date.now()}`,
      listing_id,
      slot_id,
      price_minor
    };
    items.push(item);
    baskets.set(user_id, items);

    return reply.status(201).send({
      message: 'Item added to basket',
      item,
      items_count: items.length
    });
  });

  app.delete('/basket/items/:id', async (req: FastifyRequest<{ Params: { id: string }; Querystring: { user_id?: string } }>, reply: FastifyReply) => {
    const { id } = req.params;
    const userId = req.query?.user_id || 'default-user';
    let items = baskets.get(userId) || [];
    items = items.filter(x => x.id !== id);
    baskets.set(userId, items);

    return reply.status(200).send({
      message: 'Item removed from basket',
      items_count: items.length
    });
  });
}
