import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import { buildServer } from '../dist/server.js';
import { broadcastHub, MatchBroadcastHub } from '../dist/modules/scoring/broadcast.js';
import type { FastifyInstance } from 'fastify';

describe('Real-Time Live Match Broadcast & SSE Streaming (Phase 1P)', () => {
  let app: FastifyInstance;
  let serverPort: number;

  before(async () => {
    app = buildServer();
    await app.listen({ port: 0, host: '127.0.0.1' });
    const addr = app.server.address();
    serverPort = typeof addr === 'object' && addr ? addr.port : 3000;
  });

  after(async () => {
    broadcastHub.clearAll();
    await app.close();
  });

  it('MatchBroadcastHub manages subscribers and broadcasts events', () => {
    const hub = MatchBroadcastHub.getInstance();
    const matchId = 'match-hub-test-01';

    const received: any[] = [];
    const unsubscribe = hub.subscribe(matchId, (msg) => {
      received.push(msg);
    });

    assert.strictEqual(hub.getSubscriberCount(matchId), 1);

    hub.broadcast(matchId, {
      type: 'BALL_BOWLED',
      matchId,
      timestamp: new Date().toISOString(),
      state: { runs: 4, wickets: 0 } as any
    });

    assert.strictEqual(received.length, 1);
    assert.strictEqual(received[0].type, 'BALL_BOWLED');
    assert.strictEqual(received[0].state.runs, 4);

    // Unsubscribe removes subscriber and cleans channel
    unsubscribe();
    assert.strictEqual(hub.getSubscriberCount(matchId), 0);

    hub.broadcast(matchId, {
      type: 'BALL_BOWLED',
      matchId,
      timestamp: new Date().toISOString(),
      state: { runs: 6, wickets: 0 } as any
    });

    // Did not receive new message after unsubscribing
    assert.strictEqual(received.length, 1);
  });

  it('Subscribes to SSE live stream and receives real-time ball events and initial state', async () => {
    const matchId = 'match-sse-test-02';
    const sseUrl = `http://127.0.0.1:${serverPort}/api/v1/scoring/matches/${matchId}/live`;

    const messages: string[] = [];

    // Open HTTP SSE connection
    const clientReq = await new Promise<http.ClientRequest>((resolve, reject) => {
      const req = http.get(sseUrl, (res) => {
        assert.strictEqual(res.statusCode, 200);
        assert.match(res.headers['content-type'] || '', /text\/event-stream/);

        res.on('data', (chunk: Buffer) => {
          messages.push(chunk.toString());
        });

        resolve(req);
      });
      req.on('error', reject);
    });

    // Wait 50ms for initial state handshake
    await new Promise((r) => setTimeout(r, 50));
    assert.ok(messages.some((m) => m.includes('initial_state')));

    // Post a ball event via REST API
    const postRes = await app.inject({
      method: 'POST',
      url: `/api/v1/scoring/matches/${matchId}/events`,
      payload: {
        sequence: 1,
        batRuns: 4,
        legalBall: true,
        isWicket: false
      }
    });

    assert.strictEqual(postRes.statusCode, 201);
    const body = postRes.json();
    assert.strictEqual(body.broadcast_type, 'BALL_BOWLED');
    assert.strictEqual(body.state.runs, 4);

    // Wait 50ms for SSE stream to deliver event
    await new Promise((r) => setTimeout(r, 50));
    assert.ok(messages.some((m) => m.includes('ball_bowled') && m.includes('"runs":4')));

    // Post a wicket ball
    const wicketRes = await app.inject({
      method: 'POST',
      url: `/api/v1/scoring/matches/${matchId}/events`,
      payload: {
        sequence: 2,
        batRuns: 0,
        legalBall: true,
        isWicket: true
      }
    });

    assert.strictEqual(wicketRes.statusCode, 201);
    const wicketBody = wicketRes.json();
    assert.strictEqual(wicketBody.broadcast_type, 'WICKET_FALLEN');
    assert.strictEqual(wicketBody.state.wickets, 1);

    await new Promise((r) => setTimeout(r, 50));
    assert.ok(messages.some((m) => m.includes('wicket_fallen') && m.includes('"wickets":1')));

    // Close client connection and confirm subscriber cleanup
    clientReq.destroy();
    await new Promise((r) => setTimeout(r, 50));
    assert.strictEqual(broadcastHub.getSubscriberCount(matchId), 0);
  });
});
