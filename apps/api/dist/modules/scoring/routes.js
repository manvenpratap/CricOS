import crypto from 'node:crypto';
import { query } from '../../platform/db.js';
import { createInitialScoreState, applyDelivery, undoDelivery, swapStrike, changeBowler, closeInnings } from '@cricket-platform/scoring';
import { broadcastHub } from './broadcast.js';
export function createPilotScoreState() {
    return {
        runs: 142,
        wickets: 3,
        legal_balls: 100,
        overs: 16,
        balls: 4,
        overs_display: '16.4',
        target: 178,
        max_overs: 20,
        is_innings_closed: false,
        is_match_completed: false,
        is_free_hit: false,
        striker_id: 'virat-k',
        non_striker_id: 'rohit-s',
        current_bowler_id: 'jasprit-b',
        batters: {
            'virat-k': {
                playerId: 'virat-k',
                name: 'Virat K.',
                runs: 68,
                ballsFaced: 44,
                fours: 6,
                sixes: 2,
                strikeRate: 154.55,
                isOut: false
            },
            'rohit-s': {
                playerId: 'rohit-s',
                name: 'Rohit S.',
                runs: 54,
                ballsFaced: 38,
                fours: 4,
                sixes: 1,
                strikeRate: 142.11,
                isOut: false
            }
        },
        bowlers: {
            'jasprit-b': {
                bowlerId: 'jasprit-b',
                name: 'Jasprit B.',
                legalBalls: 22,
                oversDisplay: '3.4',
                maidens: 0,
                runsConceded: 24,
                wickets: 2,
                wides: 1,
                noBalls: 0,
                economyRate: 6.55,
                currentOverBalls: 4,
                currentOverRuns: 7
            }
        },
        fall_of_wickets: [
            { wicketNumber: 1, score: 12, overs: '1.4', playerOutId: 'ishan-k' },
            { wicketNumber: 2, score: 12, overs: '1.6', playerOutId: 'surya-y' },
            { wicketNumber: 3, score: 20, overs: '2.3', playerOutId: 'shreyas-i' }
        ],
        extras: {
            wides: 5,
            no_balls: 1,
            byes: 4,
            leg_byes: 2,
            penalties: 0,
            total: 12
        }
    };
}
// In-memory score states and event history cache per match
const matchScores = new Map([
    ['match-pilot-1', createPilotScoreState()]
]);
const matchEventHistory = new Map();
export function getMatchScore(matchId) {
    if (!matchScores.has(matchId)) {
        if (matchId === 'match-pilot-1') {
            matchScores.set(matchId, createPilotScoreState());
        }
        else {
            matchScores.set(matchId, createInitialScoreState());
        }
    }
    return matchScores.get(matchId);
}
export function setMatchScore(matchId, state) {
    matchScores.set(matchId, state);
}
export async function scoringRoutes(app) {
    const handleScoreEvent = async (req, reply) => {
        const { id } = req.params;
        const body = req.body || {};
        const client_event_id = body.client_event_id || body.clientEventId || `cevt-${Date.now()}`;
        const sequence = body.sequence ?? 1;
        const bat_runs = body.bat_runs ?? body.batRuns ?? 0;
        const extra_runs = body.extra_runs ?? body.extraRuns ?? 0;
        const extra_type = body.extra_type || body.extraType || 'NONE';
        const legal_ball = body.legal_ball ?? body.legalBall ?? (extra_type !== 'WIDE' && extra_type !== 'NO_BALL');
        const is_wicket = body.is_wicket ?? body.isWicket ?? false;
        const wicket_type = body.wicket_type || body.wicketType;
        const player_out_id = body.player_out_id || body.playerOutId;
        const bowler_id = body.bowler_id || body.bowlerId;
        const striker_id = body.striker_id || body.strikerId;
        const non_striker_id = body.non_striker_id || body.nonStrikerId;
        const next_batter_id = body.next_batter_id || body.nextBatterId;
        const fielder_id = body.fielder_id || body.fielderId;
        const is_free_hit = body.is_free_hit ?? body.isFreeHit;
        const shot_zone = body.shot_zone || body.shotZone;
        const innings_id = body.innings_id || body.inningsId || '00000000-0000-0000-0000-000000000001';
        let currentState = getMatchScore(id);
        const eventPayload = {
            client_event_id,
            sequence,
            event_type: 'DELIVERY',
            bat_runs,
            extra_runs,
            extra_type,
            legal_ball,
            is_wicket,
            wicket_type,
            player_out_id,
            bowler_id: bowler_id || currentState.current_bowler_id,
            striker_id: striker_id || currentState.striker_id,
            non_striker_id: non_striker_id || currentState.non_striker_id,
            next_batter_id,
            fielder_id,
            is_free_hit,
            shot_zone
        };
        let updatedState;
        try {
            updatedState = applyDelivery(currentState, eventPayload);
            matchScores.set(id, updatedState);
            if (!matchEventHistory.has(id)) {
                matchEventHistory.set(id, []);
            }
            matchEventHistory.get(id).push(eventPayload);
        }
        catch (err) {
            return reply.status(400).send({ error: err.message });
        }
        // Determine event classification for live broadcast subscribers
        let broadcastType = 'BALL_BOWLED';
        if (updatedState.is_innings_closed) {
            broadcastType = 'INNINGS_CLOSED';
        }
        else if (is_wicket) {
            broadcastType = 'WICKET_FALLEN';
        }
        else if (legal_ball && updatedState.legal_balls % 6 === 0 && updatedState.legal_balls > 0) {
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
            await query(`INSERT INTO score_events (
          id, match_id, innings_id, client_event_id, sequence, event_type, payload
        ) VALUES ($1, $2, $3, $4, $5, 'DELIVERY', $6)
        ON CONFLICT (match_id, innings_id, sequence) DO NOTHING`, [eventId, id, innings_id, client_event_id, sequence, JSON.stringify(eventPayload)]);
        }
        catch { }
        return reply.status(201).send({
            event_id: eventId,
            eventId,
            client_event_id,
            sequence,
            match_id: id,
            matchId: id,
            broadcast_type: broadcastType,
            state: updatedState,
            event: eventPayload
        });
    };
    // Register score event endpoints (both path patterns)
    app.post('/matches/:id/score-events', handleScoreEvent);
    app.post('/scoring/matches/:id/events', handleScoreEvent);
    app.post('/scoring/matches/:id/score-events', handleScoreEvent);
    // Single-ball Undo Endpoint
    const handleUndo = async (req, reply) => {
        const { id } = req.params;
        const history = matchEventHistory.get(id);
        if (!history || history.length === 0) {
            return reply.status(400).send({ error: 'No deliveries to undo for this match' });
        }
        const { state: restoredState, undoneEvent } = undoDelivery(history, id === 'match-pilot-1' ? createPilotScoreState() : undefined);
        matchScores.set(id, restoredState);
        broadcastHub.broadcast(id, {
            type: 'UNDO_DELIVERY',
            matchId: id,
            timestamp: new Date().toISOString(),
            state: restoredState,
            event: undoneEvent || undefined
        });
        if (undoneEvent) {
            try {
                await query(`DELETE FROM score_events WHERE match_id = $1 AND client_event_id = $2`, [id, undoneEvent.client_event_id]);
            }
            catch { }
        }
        return reply.status(200).send({
            success: true,
            match_id: id,
            matchId: id,
            state: restoredState,
            undone_event: undoneEvent
        });
    };
    app.post('/scoring/matches/:id/undo', handleUndo);
    app.post('/matches/:id/undo', handleUndo);
    app.delete('/scoring/matches/:id/events/last', handleUndo);
    // Bowler Selection & Rotation Endpoint
    const handleBowlerChange = async (req, reply) => {
        const { id } = req.params;
        const body = req.body || {};
        const bowlerId = body.bowler_id || body.bowlerId;
        if (!bowlerId) {
            return reply.status(400).send({ error: 'bowler_id is required' });
        }
        const currentState = getMatchScore(id);
        let updatedState;
        try {
            updatedState = changeBowler(currentState, bowlerId, body.enforce_rule !== false);
            if (body.bowler_name && updatedState.bowlers[bowlerId]) {
                updatedState.bowlers[bowlerId].name = body.bowler_name;
            }
            matchScores.set(id, updatedState);
        }
        catch (err) {
            return reply.status(400).send({ error: err.message });
        }
        broadcastHub.broadcast(id, {
            type: 'BOWLER_CHANGED',
            matchId: id,
            timestamp: new Date().toISOString(),
            state: updatedState,
            message: `Bowler changed to ${body.bowler_name || bowlerId}`
        });
        return reply.status(200).send({
            success: true,
            match_id: id,
            state: updatedState
        });
    };
    app.post('/scoring/matches/:id/bowler', handleBowlerChange);
    app.post('/matches/:id/bowler', handleBowlerChange);
    // Manual Strike Swap Endpoint
    const handleSwapStrike = async (req, reply) => {
        const { id } = req.params;
        const currentState = getMatchScore(id);
        const updatedState = swapStrike(currentState);
        matchScores.set(id, updatedState);
        broadcastHub.broadcast(id, {
            type: 'STRIKE_SWAPPED',
            matchId: id,
            timestamp: new Date().toISOString(),
            state: updatedState
        });
        return reply.status(200).send({
            success: true,
            match_id: id,
            state: updatedState
        });
    };
    app.post('/scoring/matches/:id/swap-strike', handleSwapStrike);
    app.post('/matches/:id/swap-strike', handleSwapStrike);
    // Innings Close Endpoint
    const handleCloseInnings = async (req, reply) => {
        const { id } = req.params;
        const target = req.body?.target;
        const currentState = getMatchScore(id);
        const updatedState = closeInnings(currentState, target);
        matchScores.set(id, updatedState);
        broadcastHub.broadcast(id, {
            type: 'INNINGS_CLOSED',
            matchId: id,
            timestamp: new Date().toISOString(),
            state: updatedState
        });
        return reply.status(200).send({
            success: true,
            match_id: id,
            state: updatedState
        });
    };
    app.post('/scoring/matches/:id/innings/close', handleCloseInnings);
    app.post('/matches/:id/innings/close', handleCloseInnings);
    // Score state inquiry endpoints
    const handleScoreState = async (req, reply) => {
        const { id } = req.params;
        const state = getMatchScore(id);
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
    const handleLiveStream = async (req, reply) => {
        const { id } = req.params;
        // Flush standard SSE headers
        reply.raw.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*'
        });
        const currentState = getMatchScore(id);
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
            }
            else {
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
    // Batch Delivery Synchronization (Offline Queue Flush)
    app.post('/scoring/matches/:id/sync', async (req, reply) => {
        const { id } = req.params;
        const deliveries = req.body?.deliveries || [];
        let currentState = getMatchScore(id);
        let appliedCount = 0;
        for (const d of deliveries) {
            try {
                currentState = applyDelivery(currentState, d);
                appliedCount++;
            }
            catch { }
        }
        matchScores.set(id, currentState);
        return reply.status(200).send({
            success: true,
            match_id: id,
            synced_count: appliedCount,
            current_state: currentState,
            highest_sequence: deliveries.length > 0 ? deliveries[deliveries.length - 1].sequence : 0
        });
    });
    // Sync Status Inquiry
    app.get('/scoring/matches/:id/sync-status', async (req, reply) => {
        const { id } = req.params;
        const currentState = getMatchScore(id);
        return reply.status(200).send({
            match_id: id,
            legal_balls: currentState.legal_balls,
            total_runs: currentState.runs,
            wickets: currentState.wickets,
            is_innings_closed: currentState.is_innings_closed,
            last_synced_at: new Date().toISOString()
        });
    });
    // Score Verification (Scorer / Lead Umpire Sign-Off)
    app.post('/scoring/matches/:id/verify', async (req, reply) => {
        const { id } = req.params;
        const { verified_by = 'Rajesh Sharma (Lead Umpire)' } = req.body || {};
        const verifiedAt = new Date().toISOString();
        try {
            await query(`UPDATE matches SET score_verified_by = $1, score_verified_at = $2 WHERE id = $3`, [verified_by, verifiedAt, id]);
        }
        catch { }
        return reply.status(200).send({
            success: true,
            match_id: id,
            verified_by,
            verified_at: verifiedAt
        });
    });
    // Score Publication & Final Result Lock
    app.post('/scoring/matches/:id/publish', async (req, reply) => {
        const { id } = req.params;
        const publishedAt = new Date().toISOString();
        try {
            await query(`UPDATE matches SET status = 'COMPLETED', published_at = $1 WHERE id = $2`, [publishedAt, id]);
        }
        catch { }
        return reply.status(200).send({
            success: true,
            match_id: id,
            status: 'PUBLISHED',
            published_at: publishedAt
        });
    });
}
//# sourceMappingURL=routes.js.map