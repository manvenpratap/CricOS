import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'node:crypto';
import { query } from '../../platform/db.js';
import { createInitialScoreState, applyDelivery, ScoreState, ScoreEvent } from '@cricket-platform/scoring';
import { broadcastHub, BroadcastEventType } from './broadcast.js';

// In-memory score states cache per match
const matchScores = new Map<string, ScoreState>();

export function getMatchScore(matchId: string): ScoreState {
  return matchScores.get(matchId) || createInitialScoreState();
}

export function setMatchScore(matchId: string, state: ScoreState): void {
  matchScores.set(matchId, state);
}

export async function scoringRoutes(app: FastifyInstance) {
  const handleScoreEvent = async (req: FastifyRequest<{
    Params: { id: string };
    Body: {
      client_event_id?: string;
      clientEventId?: string;
      sequence?: number;
      event_type?: 'DELIVERY';
      bat_runs?: number;
      batRuns?: number;
      extra_runs?: number;
      extraRuns?: number;
      extra_type?: 'NONE' | 'WIDE' | 'NO_BALL' | 'BYE' | 'LEG_BYE' | 'PENALTY';
      extraType?: 'NONE' | 'WIDE' | 'NO_BALL' | 'BYE' | 'LEG_BYE' | 'PENALTY';
      legal_ball?: boolean;
      legalBall?: boolean;
      is_wicket?: boolean;
      isWicket?: boolean;
      innings_id?: string;
      inningsId?: string;
    }
  }>, reply: FastifyReply) => {
    const { id } = req.params;
    const body = req.body || {};
    const client_event_id = body.client_event_id || body.clientEventId || `cevt-${Date.now()}`;
    const sequence = body.sequence ?? 1;
    const bat_runs = body.bat_runs ?? body.batRuns ?? 0;
    const extra_runs = body.extra_runs ?? body.extraRuns ?? 0;
    const extra_type = body.extra_type || body.extraType || 'NONE';
    const legal_ball = body.legal_ball ?? body.legalBall ?? (extra_type !== 'WIDE' && extra_type !== 'NO_BALL');
    const is_wicket = body.is_wicket ?? body.isWicket ?? false;
    const innings_id = body.innings_id || body.inningsId || '00000000-0000-0000-0000-000000000001';

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

    // Determine event classification for live broadcast subscribers
    let broadcastType: BroadcastEventType = 'BALL_BOWLED';
    if (updatedState.is_innings_closed) {
      broadcastType = 'INNINGS_CLOSED';
    } else if (is_wicket) {
      broadcastType = 'WICKET_FALLEN';
    } else if (legal_ball && updatedState.legal_balls % 6 === 0 && updatedState.legal_balls > 0) {
      broadcastType = 'OVER_COMPLETED';
    }

    // Fan-out to all live SSE subscribers instantaneously
    broadcastHub.broadcast(id, {
      type: broadcastType,
      matchId: id,
      timestamp: new Date().toISOString(),
      state: updatedState,
      event: eventPayload
    });

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
      eventId,
      match_id: id,
      matchId: id,
      broadcast_type: broadcastType,
      state: updatedState
    });
  };

  // Register score event endpoints (both path patterns)
  app.post('/matches/:id/score-events', handleScoreEvent);
  app.post('/scoring/matches/:id/events', handleScoreEvent);
  app.post('/scoring/matches/:id/score-events', handleScoreEvent);

  // Score state inquiry endpoints
  const handleScoreState = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const { id } = req.params;
    const state = matchScores.get(id) || createInitialScoreState();

    return reply.status(200).send({
      match_id: id,
      matchId: id,
      state
    });
  };

  app.get('/matches/:id/score-state', handleScoreState);
  app.get('/scoring/matches/:id/score-state', handleScoreState);
  app.get('/scoring/matches/:id/state', handleScoreState);

  // Real-Time Server-Sent Events (SSE) Live Broadcast stream
  const handleLiveStream = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const { id } = req.params;

    // Flush standard SSE headers
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    const currentState = matchScores.get(id) || createInitialScoreState();

    // Send initial handshake and state snapshot
    reply.raw.write(`event: initial_state\ndata: ${JSON.stringify({
      type: 'INITIAL_STATE',
      matchId: id,
      timestamp: new Date().toISOString(),
      state: currentState
    })}\n\n`);

    // Subscribe client to real-time broadcasts
    const unsubscribe = broadcastHub.subscribe(id, (msg) => {
      if (msg.type === 'HEARTBEAT') {
        reply.raw.write(`:keepalive\n\n`);
      } else {
        reply.raw.write(`event: ${msg.type.toLowerCase()}\ndata: ${JSON.stringify(msg)}\n\n`);
      }
    });

    // Cleanup subscription on client disconnect
    req.raw.on('close', () => {
      unsubscribe();
    });
  };

  app.get('/matches/:id/live', handleLiveStream);
  app.get('/scoring/matches/:id/live', handleLiveStream);
}
