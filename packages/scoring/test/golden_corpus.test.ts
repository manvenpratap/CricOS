import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialScoreState,
  applyDelivery
} from '../dist/index.js';

describe('MCC Laws of Cricket — Golden Scoring Test Corpus', () => {
  it('Scenario 1: Maiden Over & End-of-Over Strike Rotation', () => {
    let state = createInitialScoreState(undefined, 'batter-1', 'batter-2', 'bowler-1');

    // Bowl 6 consecutive legal dot balls
    for (let i = 1; i <= 6; i++) {
      state = applyDelivery(state, {
        client_event_id: `b-${i}`,
        sequence: i,
        event_type: 'DELIVERY',
        bat_runs: 0,
        extra_runs: 0,
        extra_type: 'NONE',
        legal_ball: true
      });
    }

    assert.equal(state.runs, 0);
    assert.equal(state.legal_balls, 6);
    assert.equal(state.overs_display, '1.0');

    // Bowler should have 1 maiden over and 0 runs conceded
    const bowler = state.bowlers['bowler-1'];
    assert.ok(bowler, 'Bowler record should exist');
    assert.equal(bowler.maidens, 1, 'Should record maiden over');
    assert.equal(bowler.runsConceded, 0);
    assert.equal(bowler.oversDisplay, '1.0');

    // Strike should have rotated at end of over to batter-2
    assert.equal(state.striker_id, 'batter-2', 'Strike should rotate after 6 balls');
    assert.equal(state.non_striker_id, 'batter-1');
  });

  it('Scenario 2: Strike Rotation across Singles, Boundaries, and Over Boundaries', () => {
    let state = createInitialScoreState(undefined, 'striker-A', 'striker-B', 'bowler-1');

    // Ball 1: 1 run (Single) -> strike swaps to B
    state = applyDelivery(state, {
      client_event_id: 'd-1',
      sequence: 1,
      event_type: 'DELIVERY',
      bat_runs: 1,
      extra_runs: 0,
      extra_type: 'NONE',
      legal_ball: true
    });
    assert.equal(state.striker_id, 'striker-B');
    assert.equal(state.batters['striker-A']?.runs, 1);

    // Ball 2: 2 runs (Double) -> striker B retains strike
    state = applyDelivery(state, {
      client_event_id: 'd-2',
      sequence: 2,
      event_type: 'DELIVERY',
      bat_runs: 2,
      extra_runs: 0,
      extra_type: 'NONE',
      legal_ball: true
    });
    assert.equal(state.striker_id, 'striker-B');
    assert.equal(state.batters['striker-B']?.runs, 2);

    // Ball 3: 4 runs (Boundary Four) -> striker B retains strike
    state = applyDelivery(state, {
      client_event_id: 'd-3',
      sequence: 3,
      event_type: 'DELIVERY',
      bat_runs: 4,
      extra_runs: 0,
      extra_type: 'NONE',
      legal_ball: true
    });
    assert.equal(state.striker_id, 'striker-B');
    assert.equal(state.batters['striker-B']?.runs, 6);
    assert.equal(state.batters['striker-B']?.fours, 1);

    // Ball 4: 1 run (Single) -> strike swaps to A
    state = applyDelivery(state, {
      client_event_id: 'd-4',
      sequence: 4,
      event_type: 'DELIVERY',
      bat_runs: 1,
      extra_runs: 0,
      extra_type: 'NONE',
      legal_ball: true
    });
    assert.equal(state.striker_id, 'striker-A');

    // Ball 5: 6 runs (Six) -> striker A retains strike
    state = applyDelivery(state, {
      client_event_id: 'd-5',
      sequence: 5,
      event_type: 'DELIVERY',
      bat_runs: 6,
      extra_runs: 0,
      extra_type: 'NONE',
      legal_ball: true
    });
    assert.equal(state.striker_id, 'striker-A');
    assert.equal(state.batters['striker-A']?.runs, 7);
    assert.equal(state.batters['striker-A']?.sixes, 1);

    // Ball 6: 0 runs (Dot) -> End of over: strike swaps to B
    state = applyDelivery(state, {
      client_event_id: 'd-6',
      sequence: 6,
      event_type: 'DELIVERY',
      bat_runs: 0,
      extra_runs: 0,
      extra_type: 'NONE',
      legal_ball: true
    });
    assert.equal(state.striker_id, 'striker-B', 'End of over must swap strike');
    assert.equal(state.runs, 14);
    assert.equal(state.overs_display, '1.0');
  });

  it('Scenario 3: Extras Accounting & Invariants', () => {
    let state = createInitialScoreState(undefined, 'batter-1', 'batter-2', 'bowler-1');

    // Ball 1: WIDE (+1 run) -> illegal ball, legal_balls stays 0
    state = applyDelivery(state, {
      client_event_id: 'ex-1',
      sequence: 1,
      event_type: 'DELIVERY',
      bat_runs: 0,
      extra_runs: 1,
      extra_type: 'WIDE',
      legal_ball: false
    });
    assert.equal(state.runs, 1);
    assert.equal(state.legal_balls, 0);
    assert.equal(state.extras.wides, 1);
    assert.equal(state.bowlers['bowler-1']?.runsConceded, 1);
    assert.equal(state.batters['batter-1']?.ballsFaced, 0, 'Wide does not count as ball faced');

    // Ball 2: NO BALL with 4 off the bat (+5 total)
    state = applyDelivery(state, {
      client_event_id: 'ex-2',
      sequence: 2,
      event_type: 'DELIVERY',
      bat_runs: 4,
      extra_runs: 1,
      extra_type: 'NO_BALL',
      legal_ball: false
    });
    assert.equal(state.runs, 6); // 1 + 5 = 6
    assert.equal(state.legal_balls, 0); // still 0 legal balls
    assert.equal(state.extras.no_balls, 1);
    assert.equal(state.batters['batter-1']?.runs, 4);
    assert.equal(state.batters['batter-1']?.ballsFaced, 1);
    assert.equal(state.bowlers['bowler-1']?.runsConceded, 6);

    // Ball 3: 2 BYES (legal ball, but not charged to bowler)
    state = applyDelivery(state, {
      client_event_id: 'ex-3',
      sequence: 3,
      event_type: 'DELIVERY',
      bat_runs: 0,
      extra_runs: 2,
      extra_type: 'BYE',
      legal_ball: true
    });
    assert.equal(state.runs, 8);
    assert.equal(state.legal_balls, 1); // legal ball increments!
    assert.equal(state.overs_display, '0.1');
    assert.equal(state.extras.byes, 2);
    assert.equal(state.bowlers['bowler-1']?.runsConceded, 6, 'Byes must not be charged to bowler');
  });

  it('Scenario 4: Bowler Wicket & Fall of Wickets (FOW) tracking', () => {
    let state = createInitialScoreState(undefined, 'kohli', 'rohit', 'bumrah');

    // Deliver wicket ball: Kohli caught out, next batter is rahul
    state = applyDelivery(state, {
      client_event_id: 'w-1',
      sequence: 1,
      event_type: 'DELIVERY',
      bat_runs: 0,
      extra_runs: 0,
      extra_type: 'NONE',
      legal_ball: true,
      is_wicket: true,
      wicket_type: 'CAUGHT',
      player_out_id: 'kohli',
      next_batter_id: 'rahul'
    });

    assert.equal(state.wickets, 1);
    assert.equal(state.batters['kohli']?.isOut, true);
    assert.equal(state.batters['kohli']?.dismissal?.kind, 'CAUGHT');
    assert.equal(state.bowlers['bumrah']?.wickets, 1, 'Bowler credited with caught dismissal');

    // Verify Fall of Wickets
    assert.equal(state.fall_of_wickets.length, 1);
    assert.equal(state.fall_of_wickets[0]?.wicketNumber, 1);
    assert.equal(state.fall_of_wickets[0]?.playerOutId, 'kohli');

    // Verify new batter takes crease
    assert.equal(state.striker_id, 'rahul');
    assert.equal(state.non_striker_id, 'rohit');
  });

  it('Scenario 5: Run Out of Non-Striker does NOT credit bowler with wicket', () => {
    let state = createInitialScoreState(undefined, 'striker-1', 'non-striker-1', 'bowler-1');

    // 1 run completed, but non-striker run out
    state = applyDelivery(state, {
      client_event_id: 'ro-1',
      sequence: 1,
      event_type: 'DELIVERY',
      bat_runs: 1,
      extra_runs: 0,
      extra_type: 'NONE',
      legal_ball: true,
      is_wicket: true,
      wicket_type: 'RUN_OUT',
      player_out_id: 'non-striker-1',
      next_batter_id: 'batter-3'
    });

    assert.equal(state.wickets, 1);
    assert.equal(state.bowlers['bowler-1']?.wickets, 0, 'Run out must NOT be credited to bowler');
    assert.equal(state.batters['non-striker-1']?.isOut, true);
  });
});
