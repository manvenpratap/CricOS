import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'node:crypto';

export async function procurementRoutes(app: FastifyInstance) {
  app.post('/procurement/assign', async (req: FastifyRequest<{
    Body: { fixture_id: string; requirement_id: string; provider_id: string }
  }>, reply: FastifyReply) => {
    const { fixture_id, requirement_id, provider_id } = req.body || {};
    if (!fixture_id || !requirement_id || !provider_id) {
      return reply.status(400).send({ error: 'MISSING_FIELDS' });
    }

    const assignmentId = crypto.randomUUID();
    return reply.status(200).send({
      id: assignmentId,
      fixture_id,
      requirement_id,
      provider_id,
      status: 'ASSIGNED'
    });
  });
}
