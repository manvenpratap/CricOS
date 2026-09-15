import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { query } from '../../platform/db.js';

export async function operationsRoutes(app: FastifyInstance) {
  app.get('/operations/dashboard', async (_req: FastifyRequest, reply: FastifyReply) => {
    let activeMatches = 0;
    let pendingIncidents = 0;
    let activeDisputes = 0;

    try {
      const matchRes = await query(`SELECT COUNT(*)::int as cnt FROM matches WHERE status IN ('SCHEDULED', 'INNINGS_1', 'INNINGS_2')`);
      activeMatches = matchRes.rows[0]?.cnt || 0;

      const incRes = await query(`SELECT COUNT(*)::int as cnt FROM service_incidents WHERE status = 'OPEN'`);
      pendingIncidents = incRes.rows[0]?.cnt || 0;

      const dispRes = await query(`SELECT COUNT(*)::int as cnt FROM disputes WHERE status = 'OPEN'`);
      activeDisputes = dispRes.rows[0]?.cnt || 0;
    } catch {}

    return reply.status(200).send({
      timestamp: new Date().toISOString(),
      active_matches: activeMatches,
      pending_incidents: pendingIncidents,
      active_disputes: activeDisputes,
      system_health: 'HEALTHY'
    });
  });
}
