import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { buildServer } from '../apps/api/dist/server.js';

describe('Wave 6: Tournament Fixture Board & Scheduling API', () => {
  let app: any;

  before(async () => {
    process.env.NODE_ENV = 'test';
    app = buildServer();
    await app.ready();
  });

  after(async () => {
    if (app) await app.close();
  });

  test('1. Bulk Fixture Import: validates, detects conflicts, and schedules round-robin fixtures', async () => {
    const tournamentId = '00000000-0000-0000-0000-000000000010';

    const importRes = await app.inject({
      method: 'POST',
      url: `/api/v1/tournaments/${tournamentId}/fixtures/bulk-import`,
      payload: {
        fixtures: [
          { round: 1, team_a: 'Northside XI', team_b: 'Riverside XI', date: '2026-10-01', time_slot: '09:00' },
          { round: 1, team_a: 'Eastern Knights', team_b: 'Southern Stars', date: '2026-10-01', time_slot: '14:00' },
          { round: 2, team_a: 'Northside XI', team_b: 'Northside XI', date: '2026-10-02', time_slot: '09:00' } // Should trigger conflict
        ]
      }
    });

    assert.equal(importRes.statusCode, 201);
    const data = JSON.parse(importRes.payload);
    assert.equal(data.imported_count, 3);
    assert.equal(data.fixtures[0].conflicts.length, 0);
    assert.equal(data.fixtures[0].readiness_percentage, 100);

    // Third fixture has identical team conflict
    assert.ok(data.fixtures[2].conflicts.length > 0);
    assert.equal(data.fixtures[2].readiness_percentage, 50);
  });

  test('2. Fixture Board: retrieves schedule with conflict count and readiness index', async () => {
    const tournamentId = '00000000-0000-0000-0000-000000000010';

    const boardRes = await app.inject({
      method: 'GET',
      url: `/api/v1/tournaments/${tournamentId}/fixture-board`
    });

    assert.equal(boardRes.statusCode, 200);
    const board = JSON.parse(boardRes.payload);
    assert.equal(board.tournament_id, tournamentId);
    assert.equal(board.total_fixtures, 3);
    assert.equal(board.conflicts_count, 1);
    assert.ok(board.overall_readiness_percentage >= 80);
    assert.ok(Array.isArray(board.fixtures));
  });
});
