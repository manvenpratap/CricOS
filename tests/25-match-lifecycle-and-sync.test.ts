import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { buildServer } from '../apps/api/dist/server.js';
import type { FastifyInstance } from 'fastify';

describe('Wave 2: Match Lifecycle, Fixture Rules & Scoring Sync API', () => {
  let app: FastifyInstance;
  const matchId = 'm-test-lifecycle-01';

  before(async () => {
    app = buildServer();
    await app.ready();
  });

  after(async () => {
    await app.close();
  });

  it('1. Match Rules Configuration: sets overs, ball type, and powerplay rules', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: `/api/v1/matches/${matchId}/configuration`,
      payload: {
        overs: 20,
        ball_type: 'Kookaburra White Turf',
        powerplay_overs: 6,
        dls_enabled: true
      }
    });
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.equal(body.success, true);
    assert.equal(body.configuration.overs, 20);
    assert.equal(body.configuration.ball_type, 'Kookaburra White Turf');
  });

  it('2. Match Teams & Squads: nominates participating teams and rosters', async () => {
    // Set teams
    const teamsRes = await app.inject({
      method: 'PUT',
      url: `/api/v1/matches/${matchId}/teams`,
      payload: {
        team_a_id: 'team-blr-strikers',
        team_b_id: 'team-mum-blasters'
      }
    });
    assert.equal(teamsRes.statusCode, 200);
    const teamsBody = JSON.parse(teamsRes.body);
    assert.equal(teamsBody.team_a_id, 'team-blr-strikers');

    // Set squads
    const squadRes = await app.inject({
      method: 'PUT',
      url: `/api/v1/matches/${matchId}/squads`,
      payload: {
        team_id: 'team-blr-strikers',
        playing_xi: ['p-01', 'p-02', 'p-03', 'p-04', 'p-05', 'p-06', 'p-07', 'p-08', 'p-09', 'p-10', 'p-11'],
        bench: ['p-12', 'p-13']
      }
    });
    assert.equal(squadRes.statusCode, 200);
    const squadBody = JSON.parse(squadRes.body);
    assert.equal(squadBody.playing_xi_count, 11);
    assert.equal(squadBody.bench_count, 2);
  });

  it('3. Match Stoppages: records pause event and resumes fixture with DLS target', async () => {
    // Pause match
    const pauseRes = await app.inject({
      method: 'POST',
      url: `/api/v1/matches/${matchId}/pause`,
      payload: { reason: 'HEAVY_RAIN' }
    });
    assert.equal(pauseRes.statusCode, 200);
    const pauseBody = JSON.parse(pauseRes.body);
    assert.equal(pauseBody.status, 'PAUSED');

    // Resume match with revised target
    const resumeRes = await app.inject({
      method: 'POST',
      url: `/api/v1/matches/${matchId}/resume`,
      payload: { revised_overs: 15, target_runs: 142 }
    });
    assert.equal(resumeRes.statusCode, 200);
    const resumeBody = JSON.parse(resumeRes.body);
    assert.equal(resumeBody.status, 'IN_PROGRESS');
    assert.equal(resumeBody.revised_overs, 15);
  });

  it('4. Match Timeline & Scorecard: retrieves chronological events and canonical scorecard', async () => {
    // Timeline
    const timeRes = await app.inject({
      method: 'GET',
      url: `/api/v1/matches/${matchId}/timeline`
    });
    assert.equal(timeRes.statusCode, 200);
    const timeBody = JSON.parse(timeRes.body);
    assert.ok(Array.isArray(timeBody.timeline));

    // Scorecard
    const cardRes = await app.inject({
      method: 'GET',
      url: `/api/v1/matches/${matchId}/scorecard`
    });
    assert.equal(cardRes.statusCode, 200);
    const cardBody = JSON.parse(cardRes.body);
    assert.ok(cardBody.score);
    assert.ok(Array.isArray(cardBody.batting));
    assert.ok(Array.isArray(cardBody.bowling));
    assert.ok(Array.isArray(cardBody.fall_of_wickets));
  });

  it('5. Scoring Sync & Verification: batch syncs offline deliveries, verifies and publishes score', async () => {
    // Batch sync deliveries
    const syncRes = await app.inject({
      method: 'POST',
      url: `/api/v1/scoring/matches/${matchId}/sync`,
      payload: {
        deliveries: [
          { client_event_id: 'cevt-01', sequence: 1, event_type: 'DELIVERY', bat_runs: 1, extra_runs: 0, extra_type: 'NONE', legal_ball: true, is_wicket: false },
          { client_event_id: 'cevt-02', sequence: 2, event_type: 'DELIVERY', bat_runs: 4, extra_runs: 0, extra_type: 'NONE', legal_ball: true, is_wicket: false },
          { client_event_id: 'cevt-03', sequence: 3, event_type: 'DELIVERY', bat_runs: 0, extra_runs: 0, extra_type: 'NONE', legal_ball: true, is_wicket: true }
        ]
      }
    });
    assert.equal(syncRes.statusCode, 200);
    const syncBody = JSON.parse(syncRes.body);
    assert.equal(syncBody.synced_count, 3);
    assert.equal(syncBody.current_state.runs, 5);
    assert.equal(syncBody.current_state.wickets, 1);

    // Sync status check
    const statusRes = await app.inject({
      method: 'GET',
      url: `/api/v1/scoring/matches/${matchId}/sync-status`
    });
    assert.equal(statusRes.statusCode, 200);
    const statusBody = JSON.parse(statusRes.body);
    assert.equal(statusBody.total_runs, 5);
    assert.equal(statusBody.wickets, 1);

    // Verify scorecard
    const verifyRes = await app.inject({
      method: 'POST',
      url: `/api/v1/scoring/matches/${matchId}/verify`,
      payload: { verified_by: 'Rajesh Sharma (Lead Umpire)' }
    });
    assert.equal(verifyRes.statusCode, 200);
    const verifyBody = JSON.parse(verifyRes.body);
    assert.equal(verifyBody.success, true);
    assert.equal(verifyBody.verified_by, 'Rajesh Sharma (Lead Umpire)');

    // Publish scorecard
    const pubRes = await app.inject({
      method: 'POST',
      url: `/api/v1/scoring/matches/${matchId}/publish`
    });
    assert.equal(pubRes.statusCode, 200);
    const pubBody = JSON.parse(pubRes.body);
    assert.equal(pubBody.status, 'PUBLISHED');
    assert.ok(pubBody.published_at);
  });
});
