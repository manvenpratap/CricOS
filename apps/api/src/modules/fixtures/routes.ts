import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'node:crypto';
import { query } from '../../platform/db.js';

export async function fixturesRoutes(app: FastifyInstance) {
  app.post('/tournaments/:id/fixtures/generate', async (req: FastifyRequest<{
    Params: { id: string };
    Body: { team_ids: string[]; venue_ids?: string[] }
  }>, reply: FastifyReply) => {
    const { id } = req.params;
    const { team_ids = [] } = req.body || {};
    if (team_ids.length < 2) {
      return reply.status(400).send({ error: 'AT_LEAST_TWO_TEAMS_REQUIRED' });
    }

    // Round robin pair generation
    const fixturesGenerated: Array<{ id: string; home: string; away: string; round: number }> = [];
    let round = 1;
    for (let i = 0; i < team_ids.length; i++) {
      for (let j = i + 1; j < team_ids.length; j++) {
        const fixtureId = crypto.randomUUID();
        fixturesGenerated.push({
          id: fixtureId,
          home: team_ids[i]!,
          away: team_ids[j]!,
          round: round++
        });
      }
    }

    return reply.status(201).send({
      tournament_id: id,
      count: fixturesGenerated.length,
      fixtures: fixturesGenerated
    });
  });

  app.get('/tournaments/:id/fixtures', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const { id } = req.params;
    try {
      const res = await query(`SELECT * FROM fixtures WHERE tournament_id = $1`, [id]);
      return reply.status(200).send(res.rows);
    } catch {}

    return reply.status(200).send([]);
  });
}
