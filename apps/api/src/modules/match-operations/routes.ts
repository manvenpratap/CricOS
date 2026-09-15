import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { query } from '../../platform/db.js';

export async function matchOperationsRoutes(app: FastifyInstance) {
  app.post('/matches/:id/toss', async (req: FastifyRequest<{
    Params: { id: string };
    Body: { winner_team_id: string; decision: 'BAT' | 'BOWL' }
  }>, reply: FastifyReply) => {
    const { id } = req.params;
    const { winner_team_id, decision } = req.body || {};
    if (!winner_team_id || !decision) {
      return reply.status(400).send({ error: 'WINNER_AND_DECISION_REQUIRED' });
    }

    try {
      await query(
        `UPDATE matches SET status = 'TOSS_DONE' WHERE id = $1`,
        [id]
      );
    } catch {}

    return reply.status(200).send({
      match_id: id,
      status: 'TOSS_DONE',
      winner_team_id,
      decision
    });
  });

  app.post('/matches/:id/start', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const { id } = req.params;
    try {
      await query(`UPDATE matches SET status = 'INNINGS_1' WHERE id = $1`, [id]);
    } catch {}

    return reply.status(200).send({
      match_id: id,
      status: 'INNINGS_1',
      started_at: new Date().toISOString()
    });
  });
}
