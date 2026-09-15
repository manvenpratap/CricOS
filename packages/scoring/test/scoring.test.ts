import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createInitialScoreState, applyDelivery, calculateOver, calculateRunRate } from '../dist/index.js';

describe('Scoring Package', () => {
  it('initializes clean score state', () => {
    const state = createInitialScoreState(150);
    assert.equal(state.runs, 0);
    assert.equal(state.wickets, 0);
    assert.equal(state.overs_display, '0.0');
    assert.equal(state.target, 150);
    assert.equal(state.is_innings_closed, false);
  });

  it('correctly processes legal boundary ball', () => {
    const state = createInitialScoreState();
    const updated = applyDelivery(state, {
      client_event_id: 'evt-1',
      sequence: 1,
      event_type: 'DELIVERY',
      bat_runs: 4,
      extra_runs: 0,
      extra_type: 'NONE',
      legal_ball: true
    });

    assert.equal(updated.runs, 4);
    assert.equal(updated.wickets, 0);
    assert.equal(updated.legal_balls, 1);
    assert.equal(updated.overs_display, '0.1');
  });

  it('correctly handles wide ball without incrementing legal ball count', () => {
    const state = createInitialScoreState();
    const updated = applyDelivery(state, {
      client_event_id: 'evt-wide-1',
      sequence: 1,
      event_type: 'DELIVERY',
      bat_runs: 0,
      extra_runs: 1,
      extra_type: 'WIDE',
      legal_ball: false
    });

    assert.equal(updated.runs, 1);
    assert.equal(updated.legal_balls, 0);
    assert.equal(updated.overs_display, '0.0');
  });

  it('closes innings when target is reached', () => {
    const state = createInitialScoreState(10);
    const updated = applyDelivery(state, {
      client_event_id: 'evt-six-1',
      sequence: 1,
      event_type: 'DELIVERY',
      bat_runs: 6,
      extra_runs: 0,
      extra_type: 'NONE',
      legal_ball: true
    });
    assert.equal(updated.is_innings_closed, false);

    const matchWinning = applyDelivery(updated, {
      client_event_id: 'evt-four-2',
      sequence: 2,
      event_type: 'DELIVERY',
      bat_runs: 4,
      extra_runs: 0,
      extra_type: 'NONE',
      legal_ball: true
    });
    assert.equal(matchWinning.runs, 10);
    assert.equal(matchWinning.is_innings_closed, true);
  });

  it('calculates over notation and run rate accurately', () => {
    const overInfo = calculateOver(17);
    assert.equal(overInfo.overs, 2);
    assert.equal(overInfo.balls, 5);
    assert.equal(overInfo.display, '2.5');

    const runRate = calculateRunRate(50, 30); // 50 runs in 5 overs = 10.00
    assert.equal(runRate, 10.0);
  });
});
