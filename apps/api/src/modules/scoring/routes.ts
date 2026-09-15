import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'node:crypto';
import { query } from '../../platform/db.js';
import { createInitialScoreState, applyDelivery, ScoreState, ScoreEvent } from '@cricket-platform/scoring';

// In-memory score states cache per match
const matchScores = new Map<string, ScoreState>();

export async function scoringRoutes(app: FastifyInstance) {
  app.post('/matches/:id/score-events', async (req: FastifyRequest<{
    Params: { id: string };
    Body: {
      client_event_id: string;
      sequence: number;
      event_type?: 'DELIVERY';
      bat_runs?: number;
      extra_runs?: number;
      extra_type?: 'NONE' | 'WIDE' | 'NO_BALL' | 'BYE' | 'LEG_BYE' | 'PENALTY';
      legal_ball?: boolean;
      is_wicket?: boolean;
      innings_id?: string;
    }
  }>, reply: FastifyReply) => {
    const { id } = req.params;
    const {
      client_event_id = `cevt-${Date.now()}`,
      sequence = 1,
      bat_runs = 0,
      extra_runs = 0,
      extra_type = 'NONE',
      legal_ball = true,
      is_wicket = false,
      innings_id = '00000000-0000-0000-0000-000000000001'
    } = req.body || {};

    let currentState = matchScores.get(id);
    if (!currentState) {
      currentState = createInitialScoreState();
    }

    const eventPayload: ScoreEvent = {
      client_event_id,
      sequence,
      event_type: 'DELIVERY',
      bat_runs,
      extra_runs,
      extra_type,
      legal_ball,
      is_wicket
    };

    let updatedState: ScoreState;
    try {
      updatedState = applyDelivery(currentState, eventPayload);
      matchScores.set(id, updatedState);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }

    const eventId = crypto.randomUUID();
    try {
      await query(
        `INSERT INTO score_events (
          id, match_id, innings_id, client_event_id, sequence, event_type, payload
        ) VALUES ($1, $2, $3, $4, $5, 'DELIVERY', $6)
        ON CONFLICT (match_id, innings_id, sequence) DO NOTHING`,
        [eventId, id, innings_id, client_event_id, sequence, JSON.stringify(eventPayload)]
      );
    } catch {}

    return reply.status(201).send({
      event_id: eventId,
      match_id: id,
      state: updatedState
    });
  });

  app.get('/matches/:id/score-state', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const { id } = req.params;
    const state = matchScores.get(id) || createInitialScoreState();

    return reply.status(200).send({
      match_id: id,
      state
    });
  });
}
