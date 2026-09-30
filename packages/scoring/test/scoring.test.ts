import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialScoreState,
  applyDelivery,
  calculateOver,
  calculateRunRate,
  undoDelivery,
  swapStrike,
  changeBowler,
  closeInnings,
  type ScoreEvent
} from '../dist/index.js';

describe('Scoring Package', () => {
  it('initializes clean score state', () => {
    const state = createInitialScoreState(150);
    assert.equal(state.runs, 0);
    assert.equal(state.wickets, 0);
    assert.equal(state.overs_display, '0.0');
    assert.equal(state.target, 150);
    assert.equal(state.is_innings_closed, false);
    assert.equal(state.is_free_hit, false);
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

  it('correctly manages Free Hit following a No Ball', () => {
    const state = createInitialScoreState();
    // 1. No ball delivered
    const nbState = applyDelivery(state, {
      client_event_id: 'evt-nb-1',
      sequence: 1,
      event_type: 'DELIVERY',
      bat_runs: 0,
      extra_runs: 1,
      extra_type: 'NO_BALL',
      legal_ball: false
    });
    assert.equal(nbState.is_free_hit, true);
    assert.equal(nbState.runs, 1);
    assert.equal(nbState.legal_balls, 0);

    // 2. Wide on Free Hit -> Free Hit continues
    const wideOnFhState = applyDelivery(nbState, {
      client_event_id: 'evt-wd-2',
      sequence: 2,
      event_type: 'DELIVERY',
      bat_runs: 0,
      extra_runs: 1,
      extra_type: 'WIDE',
      legal_ball: false
    });
    assert.equal(wideOnFhState.is_free_hit, true);
    assert.equal(wideOnFhState.runs, 2);

    // 3. Legal delivery on Free Hit -> Free Hit consumed
    const legalFhState = applyDelivery(wideOnFhState, {
      client_event_id: 'evt-six-3',
      sequence: 3,
      event_type: 'DELIVERY',
      bat_runs: 6,
      extra_runs: 0,
      extra_type: 'NONE',
      legal_ball: true
    });
    assert.equal(legalFhState.is_free_hit, false);
    assert.equal(legalFhState.runs, 8);
    assert.equal(legalFhState.legal_balls, 1);
  });

  it('accurately performs undoDelivery and restores previous state', () => {
    const initial = createInitialScoreState(undefined, 'p-striker', 'p-nonstriker', 'p-bowler');
    const events: ScoreEvent[] = [
      {
        client_event_id: 'e1',
        sequence: 1,
        event_type: 'DELIVERY',
        bat_runs: 1,
        extra_runs: 0,
        extra_type: 'NONE',
        legal_ball: true
      },
      {
        client_event_id: 'e2',
        sequence: 2,
        event_type: 'DELIVERY',
        bat_runs: 4,
        extra_runs: 0,
        extra_type: 'NONE',
        legal_ball: true
      },
      {
        client_event_id: 'e3',
        sequence: 3,
        event_type: 'DELIVERY',
        bat_runs: 0,
        extra_runs: 0,
        extra_type: 'NONE',
        legal_ball: true,
        is_wicket: true,
        wicket_type: 'BOWLED',
        player_out_id: 'p-striker'
      }
    ];

    // Apply all 3 deliveries
    let current = initial;
    for (const ev of events) {
      current = applyDelivery(current, ev);
    }
    assert.equal(current.runs, 5);
    assert.equal(current.wickets, 1);
    assert.equal(current.legal_balls, 3);
    assert.equal(current.fall_of_wickets.length, 1);

    // Undo delivery 3 (the wicket)
    const { state: afterUndo1, undoneEvent: u1 } = undoDelivery(events, initial);
    assert.equal(u1?.client_event_id, 'e3');
    assert.equal(afterUndo1.runs, 5);
    assert.equal(afterUndo1.wickets, 0);
    assert.equal(afterUndo1.legal_balls, 2);
    assert.equal(afterUndo1.fall_of_wickets.length, 0);

    // Undo delivery 2 (the four)
    const { state: afterUndo2, undoneEvent: u2 } = undoDelivery(events, initial);
    assert.equal(u2?.client_event_id, 'e2');
    assert.equal(afterUndo2.runs, 1);
    assert.equal(afterUndo2.legal_balls, 1);

    // Undo delivery 1 (the single)
    const { state: afterUndo3, undoneEvent: u3 } = undoDelivery(events, initial);
    assert.equal(u3?.client_event_id, 'e1');
    assert.equal(afterUndo3.runs, 0);
    assert.equal(afterUndo3.legal_balls, 0);

    // Undo on empty events
    const { state: afterUndoEmpty, undoneEvent: uEmpty } = undoDelivery(events, initial);
    assert.equal(uEmpty, null);
    assert.equal(afterUndoEmpty.runs, 0);
  });

  it('accurately swaps strike with swapStrike', () => {
    const state = createInitialScoreState(undefined, 'batter-1', 'batter-2');
    assert.equal(state.striker_id, 'batter-1');
    assert.equal(state.non_striker_id, 'batter-2');

    const swapped = swapStrike(state);
    assert.equal(swapped.striker_id, 'batter-2');
    assert.equal(swapped.non_striker_id, 'batter-1');

    const swappedBack = swapStrike(swapped);
    assert.equal(swappedBack.striker_id, 'batter-1');
    assert.equal(swappedBack.non_striker_id, 'batter-2');
  });

  it('manages bowler rotation and enforces MCC consecutive overs rule', () => {
    let state = createInitialScoreState(undefined, 'b1', 'b2', 'bowler-A');
    // Bowl 6 legal balls for bowler-A
    for (let i = 1; i <= 6; i++) {
      state = applyDelivery(state, {
        client_event_id: `ball-${i}`,
        sequence: i,
        event_type: 'DELIVERY',
        bat_runs: 0,
        extra_runs: 0,
        extra_type: 'NONE',
        legal_ball: true
      });
    }
    assert.equal(state.overs, 1);
    assert.equal(state.previous_bowler_id, 'bowler-A');

    // Attempting to select bowler-A consecutively must throw
    assert.throws(
      () => changeBowler(state, 'bowler-A'),
      /SCORE_CONSECUTIVE_BOWLER_OVER/
    );

    // Changing to bowler-B succeeds
    const rotated = changeBowler(state, 'bowler-B');
    assert.equal(rotated.current_bowler_id, 'bowler-B');
    assert.ok(rotated.bowlers['bowler-B']);
  });

  it('closes innings cleanly with closeInnings', () => {
    const state = createInitialScoreState();
    const closed = closeInnings(state, 180);
    assert.equal(closed.is_innings_closed, true);
    assert.equal(closed.target, 180);
  });

  it('rejects an already dismissed batter from batting again in same innings', () => {
    let state = createInitialScoreState(undefined, 'batter-1', 'batter-2', 'bowler-1');

    // Wicket 1: batter-1 is bowled, replaced by batter-3
    state = applyDelivery(state, {
      client_event_id: 'wkt-1',
      sequence: 1,
      event_type: 'DELIVERY',
      bat_runs: 0,
      extra_runs: 0,
      extra_type: 'NONE',
      legal_ball: true,
      is_wicket: true,
      wicket_type: 'BOWLED',
      player_out_id: 'batter-1',
      next_batter_id: 'batter-3'
    });
    assert.equal(state.wickets, 1);
    assert.equal(state.batters['batter-1']?.isOut, true);
    assert.equal(state.striker_id, 'batter-3');

    // Wicket 2: batter-3 is caught. Attempting to bring back dismissed batter-1 must throw!
    assert.throws(
      () => applyDelivery(state, {
        client_event_id: 'wkt-2-invalid',
        sequence: 2,
        event_type: 'DELIVERY',
        bat_runs: 0,
        extra_runs: 0,
        extra_type: 'NONE',
        legal_ball: true,
        is_wicket: true,
        wicket_type: 'CAUGHT',
        player_out_id: 'batter-3',
        next_batter_id: 'batter-1' // Already dismissed!
      }),
      /SCORE_BATTER_ALREADY_DISMISSED/
    );
  });

  it('automatically closes innings when 10 wickets fall (All Out) and rejects further deliveries', () => {
    let state = createInitialScoreState(undefined, 'b-1', 'b-2', 'bowler-1');

    // Fall of 10 consecutive wickets
    for (let w = 1; w <= 10; w++) {
      const outId = w === 1 ? 'b-1' : `b-${w + 1}`;
      const nextId = w < 10 ? `b-${w + 2}` : undefined;
      state = applyDelivery(state, {
        client_event_id: `all-out-wkt-${w}`,
        sequence: w,
        event_type: 'DELIVERY',
        bat_runs: 0,
        extra_runs: 0,
        extra_type: 'NONE',
        legal_ball: true,
        is_wicket: true,
        wicket_type: 'BOWLED',
        player_out_id: outId,
        next_batter_id: nextId
      });
    }

    assert.equal(state.wickets, 10, 'Team must have exactly 10 wickets fallen');
    assert.equal(state.is_innings_closed, true, 'Innings must be automatically closed at 10 wickets (All Out)');

    // Attempting an 11th delivery or 11th wicket must throw!
    assert.throws(
      () => applyDelivery(state, {
        client_event_id: 'wkt-11-invalid',
        sequence: 11,
        event_type: 'DELIVERY',
        bat_runs: 1,
        extra_runs: 0,
        extra_type: 'NONE',
        legal_ball: true
      }),
      /SCORE_INNINGS_ALREADY_CLOSED/
    );
  });
});


