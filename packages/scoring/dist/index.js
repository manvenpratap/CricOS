export function createInitialScoreState(target, strikerId, nonStrikerId, openingBowlerId) {
    const batters = {};
    if (strikerId) {
        batters[strikerId] = {
            playerId: strikerId,
            runs: 0,
            ballsFaced: 0,
            fours: 0,
            sixes: 0,
            strikeRate: 0,
            isOut: false
        };
    }
    if (nonStrikerId) {
        batters[nonStrikerId] = {
            playerId: nonStrikerId,
            runs: 0,
            ballsFaced: 0,
            fours: 0,
            sixes: 0,
            strikeRate: 0,
            isOut: false
        };
    }
    const bowlers = {};
    if (openingBowlerId) {
        bowlers[openingBowlerId] = {
            bowlerId: openingBowlerId,
            legalBalls: 0,
            oversDisplay: '0.0',
            maidens: 0,
            runsConceded: 0,
            wickets: 0,
            wides: 0,
            noBalls: 0,
            economyRate: 0,
            currentOverBalls: 0,
            currentOverRuns: 0
        };
    }
    return {
        runs: 0,
        wickets: 0,
        legal_balls: 0,
        overs: 0,
        balls: 0,
        overs_display: '0.0',
        target,
        is_innings_closed: false,
        is_free_hit: false,
        striker_id: strikerId,
        non_striker_id: nonStrikerId,
        current_bowler_id: openingBowlerId,
        previous_bowler_id: undefined,
        batters,
        bowlers,
        fall_of_wickets: [],
        extras: {
            wides: 0,
            no_balls: 0,
            byes: 0,
            leg_byes: 0,
            penalties: 0,
            total: 0
        }
    };
}
export function calculateOver(legal_balls) {
    if (legal_balls < 0)
        throw new Error('SCORE_INVALID_LEGAL_BALLS');
    const overs = Math.floor(legal_balls / 6);
    const balls = legal_balls % 6;
    return {
        overs,
        balls,
        display: `${overs}.${balls}`
    };
}
export function calculateRunRate(runs, legal_balls) {
    if (legal_balls <= 0)
        return 0;
    return Number(((runs / legal_balls) * 6).toFixed(2));
}
export function calculateEconomy(runsConceded, legalBalls) {
    if (legalBalls <= 0)
        return 0;
    return Number(((runsConceded / legalBalls) * 6).toFixed(2));
}
export function calculateStrikeRate(runs, ballsFaced) {
    if (ballsFaced <= 0)
        return 0;
    return Number(((runs / ballsFaced) * 100).toFixed(2));
}
export function applyDelivery(state, event) {
    if (state.is_innings_closed || state.wickets >= 10) {
        throw new Error('SCORE_INNINGS_ALREADY_CLOSED: Cannot score after innings close (Team All Out or target reached)');
    }
    if (event.bat_runs < 0 || event.extra_runs < 0) {
        throw new Error('SCORE_INVALID_RUNS: Runs cannot be negative');
    }
    if (state.is_free_hit && event.is_wicket) {
        const allowedFreeHitDismissals = ['RUN_OUT', 'OBSTRUCTING', 'HIT_BALL_TWICE'];
        if (!event.wicket_type || !allowedFreeHitDismissals.includes(event.wicket_type)) {
            throw new Error(`SCORE_FREE_HIT_DISMISSAL_INVALID: Striker cannot be dismissed ${event.wicket_type || 'out'} on a Free Hit (ICC Clause 21.19 - only Run Out, Obstructing the Field, or Hit Ball Twice permitted)`);
        }
    }
    // 1. Overall runs & balls accounting
    const runsToAdd = event.bat_runs + event.extra_runs;
    const newRuns = state.runs + runsToAdd;
    const isLegal = event.legal_ball && event.extra_type !== 'WIDE' && event.extra_type !== 'NO_BALL';
    const newLegalBalls = state.legal_balls + (isLegal ? 1 : 0);
    const { overs, balls, display } = calculateOver(newLegalBalls);
    // Free hit tracking (ICC Clause 21.19): Next ball is Free Hit if this ball is NO_BALL, or if previous ball was Free Hit and this delivery was illegal
    const nextIsFreeHit = event.extra_type === 'NO_BALL' || Boolean(state.is_free_hit && !isLegal);
    // 2. Extras accounting
    const extras = { ...state.extras };
    if (event.extra_type === 'WIDE') {
        extras.wides += event.extra_runs;
        extras.total += event.extra_runs;
    }
    else if (event.extra_type === 'NO_BALL') {
        extras.no_balls += event.extra_runs;
        extras.total += event.extra_runs;
    }
    else if (event.extra_type === 'BYE') {
        extras.byes += event.extra_runs;
        extras.total += event.extra_runs;
    }
    else if (event.extra_type === 'LEG_BYE') {
        extras.leg_byes += event.extra_runs;
        extras.total += event.extra_runs;
    }
    else if (event.extra_type === 'PENALTY') {
        extras.penalties += event.extra_runs;
        extras.total += event.extra_runs;
    }
    // 3. Batter scorecard tracking
    const batters = { ...state.batters };
    const currentStrikerId = event.striker_id || state.striker_id;
    const currentNonStrikerId = event.non_striker_id || state.non_striker_id;
    if (currentStrikerId) {
        const existing = batters[currentStrikerId] || {
            playerId: currentStrikerId,
            runs: 0,
            ballsFaced: 0,
            fours: 0,
            sixes: 0,
            strikeRate: 0,
            isOut: false
        };
        // Batter faces ball on any delivery except wide
        const ballFaced = event.extra_type !== 'WIDE';
        const newBatterRuns = existing.runs + event.bat_runs;
        const newBallsFaced = existing.ballsFaced + (ballFaced ? 1 : 0);
        batters[currentStrikerId] = {
            ...existing,
            runs: newBatterRuns,
            ballsFaced: newBallsFaced,
            fours: existing.fours + (event.bat_runs === 4 ? 1 : 0),
            sixes: existing.sixes + (event.bat_runs === 6 ? 1 : 0),
            strikeRate: calculateStrikeRate(newBatterRuns, newBallsFaced)
        };
    }
    // 4. Bowler spell tracking
    const bowlers = { ...state.bowlers };
    const currentBowlerId = event.bowler_id || state.current_bowler_id;
    let bowlerOverComplete = false;
    if (currentBowlerId) {
        const existing = bowlers[currentBowlerId] || {
            bowlerId: currentBowlerId,
            legalBalls: 0,
            oversDisplay: '0.0',
            maidens: 0,
            runsConceded: 0,
            wickets: 0,
            wides: 0,
            noBalls: 0,
            economyRate: 0,
            currentOverBalls: 0,
            currentOverRuns: 0
        };
        // Bowler is charged for bat runs, wides, and no-balls, but NOT byes or leg-byes
        const runsChargedToBowler = event.bat_runs +
            (event.extra_type === 'WIDE' || event.extra_type === 'NO_BALL' ? event.extra_runs : 0);
        const bowlerLegalBalls = existing.legalBalls + (isLegal ? 1 : 0);
        const bowlerRunsConceded = existing.runsConceded + runsChargedToBowler;
        const overBalls = existing.currentOverBalls + (isLegal ? 1 : 0);
        const overRuns = existing.currentOverRuns + runsChargedToBowler;
        let maidens = existing.maidens;
        let resetOverBalls = overBalls;
        let resetOverRuns = overRuns;
        // Check if over completed (6 legal balls)
        if (isLegal && balls === 0 && newLegalBalls > 0 && newLegalBalls % 6 === 0) {
            bowlerOverComplete = true;
            if (overRuns === 0 && overBalls === 6) {
                maidens += 1;
            }
            resetOverBalls = 0;
            resetOverRuns = 0;
        }
        // Wicket credited to bowler for Bowled, Caught, LBW, Stumped, Hit Wicket (MCC Laws 30, 32, 35, 36, 39)
        // Bowler is NOT credited for Run Out (Law 38), Retired Out/Hurt (Law 25), Obstructing (Law 37), Hit Ball Twice (Law 34), Timed Out (Law 31)
        const bowlerCreditedKinds = ['BOWLED', 'CAUGHT', 'LBW', 'STUMPED', 'HIT_WICKET'];
        const isBowlerWicket = Boolean(event.is_wicket && event.wicket_type && bowlerCreditedKinds.includes(event.wicket_type));
        bowlers[currentBowlerId] = {
            ...existing,
            legalBalls: bowlerLegalBalls,
            oversDisplay: calculateOver(bowlerLegalBalls).display,
            maidens,
            runsConceded: bowlerRunsConceded,
            wickets: existing.wickets + (isBowlerWicket ? 1 : 0),
            wides: existing.wides + (event.extra_type === 'WIDE' ? 1 : 0),
            noBalls: existing.noBalls + (event.extra_type === 'NO_BALL' ? 1 : 0),
            economyRate: calculateEconomy(bowlerRunsConceded, bowlerLegalBalls),
            currentOverBalls: resetOverBalls,
            currentOverRuns: resetOverRuns
        };
    }
    // 5. Wicket dismissal & Fall of Wickets
    const isRetiredHurt = event.is_wicket && event.wicket_type === 'RETIRED_HURT';
    const isActualWicketFallen = Boolean(event.is_wicket && !isRetiredHurt);
    const newWickets = state.wickets + (isActualWicketFallen ? 1 : 0);
    const fallOfWickets = [...state.fall_of_wickets];
    let nextStriker = currentStrikerId;
    let nextNonStriker = currentNonStrikerId;
    if (event.is_wicket) {
        const outPlayerId = event.player_out_id || currentStrikerId;
        if (outPlayerId && batters[outPlayerId]) {
            batters[outPlayerId] = {
                ...batters[outPlayerId],
                isOut: !isRetiredHurt,
                dismissal: {
                    kind: event.wicket_type || 'BOWLED',
                    bowlerId: currentBowlerId,
                    fielderId: event.fielder_id,
                    description: isRetiredHurt ? 'retired not out (injury/illness)' : `${event.wicket_type || 'Bowled'} b ${currentBowlerId || 'bowler'}`
                }
            };
        }
        if (outPlayerId && isActualWicketFallen) {
            fallOfWickets.push({
                wicketNumber: newWickets,
                score: newRuns,
                overs: display,
                playerOutId: outPlayerId
            });
        }
        // New batter takes crease
        if (newWickets >= 10) {
            // 10th wicket fallen - Team is ALL OUT. No incoming batter takes crease.
            if (outPlayerId === currentStrikerId) {
                nextStriker = undefined;
            }
            else {
                nextNonStriker = undefined;
            }
        }
        else if (event.next_batter_id) {
            if (batters[event.next_batter_id]?.isOut) {
                throw new Error('SCORE_BATTER_ALREADY_DISMISSED: Player has already been dismissed in this innings');
            }
            if (event.next_batter_id === currentStrikerId || event.next_batter_id === currentNonStrikerId) {
                throw new Error('SCORE_BATTER_ALREADY_BATTING: Player is already at the crease');
            }
            batters[event.next_batter_id] = {
                playerId: event.next_batter_id,
                runs: 0,
                ballsFaced: 0,
                fours: 0,
                sixes: 0,
                strikeRate: 0,
                isOut: false
            };
            if (outPlayerId === currentStrikerId) {
                nextStriker = event.next_batter_id;
            }
            else {
                nextNonStriker = event.next_batter_id;
            }
        }
    }
    // 6. Strike rotation rules (MCC Law 18 & ICC 2022 Caught Amendment)
    const isCaughtDismissal = event.is_wicket && event.wicket_type === 'CAUGHT';
    if (isCaughtDismissal && event.next_batter_id) {
        // Under ICC Oct 2022 Standard Playing Conditions (Clause 18.11 amendment to MCC Law 18):
        // When a batter is out Caught, the incoming batter MUST always take strike at the striker's end,
        // regardless of whether the batters crossed in running prior to the catch being taken.
        if (nextStriker !== event.next_batter_id) {
            nextNonStriker = nextStriker;
            nextStriker = event.next_batter_id;
        }
    }
    else {
        // Odd runs (1, 3, 5): swap striker and non-striker
        const physicalRuns = event.bat_runs +
            (event.extra_type === 'BYE' || event.extra_type === 'LEG_BYE' ? event.extra_runs : 0);
        if (physicalRuns % 2 === 1) {
            const temp = nextStriker;
            nextStriker = nextNonStriker;
            nextNonStriker = temp;
        }
    }
    // Over completion (after 6 legal deliveries): swap striker and non-striker
    if (isLegal && balls === 0 && newLegalBalls > 0 && newLegalBalls % 6 === 0) {
        const temp = nextStriker;
        nextStriker = nextNonStriker;
        nextNonStriker = temp;
    }
    // 7. Check innings conclusion conditions
    let isClosed = state.is_innings_closed;
    if (state.target !== undefined && newRuns >= state.target) {
        isClosed = true;
    }
    if (newWickets >= 10) {
        isClosed = true;
    }
    return {
        runs: newRuns,
        wickets: newWickets,
        legal_balls: newLegalBalls,
        overs,
        balls,
        overs_display: display,
        target: state.target,
        is_innings_closed: isClosed,
        is_free_hit: nextIsFreeHit,
        striker_id: nextStriker,
        non_striker_id: nextNonStriker,
        current_bowler_id: currentBowlerId,
        previous_bowler_id: bowlerOverComplete ? currentBowlerId : state.previous_bowler_id,
        batters,
        bowlers,
        fall_of_wickets: fallOfWickets,
        extras
    };
}
export function undoDelivery(events, initial) {
    if (events.length === 0) {
        return { state: initial || createInitialScoreState(), undoneEvent: null };
    }
    const undoneEvent = events.pop() || null;
    let state = initial ? { ...initial } : createInitialScoreState();
    for (const ev of events) {
        state = applyDelivery(state, ev);
    }
    return { state, undoneEvent };
}
export function swapStrike(state) {
    return {
        ...state,
        striker_id: state.non_striker_id,
        non_striker_id: state.striker_id
    };
}
export function changeBowler(state, nextBowlerId, enforceConsecutiveRule = true) {
    if (enforceConsecutiveRule &&
        state.previous_bowler_id &&
        nextBowlerId === state.previous_bowler_id &&
        state.legal_balls > 0 &&
        state.legal_balls % 6 === 0) {
        throw new Error('SCORE_CONSECUTIVE_BOWLER_OVER: Bowler cannot bowl two consecutive overs');
    }
    const bowlers = { ...state.bowlers };
    if (!bowlers[nextBowlerId]) {
        bowlers[nextBowlerId] = {
            bowlerId: nextBowlerId,
            legalBalls: 0,
            oversDisplay: '0.0',
            maidens: 0,
            runsConceded: 0,
            wickets: 0,
            wides: 0,
            noBalls: 0,
            economyRate: 0,
            currentOverBalls: 0,
            currentOverRuns: 0
        };
    }
    return {
        ...state,
        current_bowler_id: nextBowlerId,
        bowlers
    };
}
export function closeInnings(state, target) {
    return {
        ...state,
        is_innings_closed: true,
        target: target !== undefined ? target : state.target
    };
}
export const ICC_CRICKET_LAWS_DIRECTORY = [
    {
        id: 'law-21',
        law: 'MCC Law 21 & ICC 21.19',
        title: 'No Ball & Free Hit Delivery',
        category: 'EXTRAS',
        icon: '⚡',
        badge: '1 Extra Run + Free Hit',
        summary: 'A No Ball is called for front-foot/back-foot overstepping, height above waist (beamer), illegal bowling action, or fielding restriction breaches. Under ICC Clause 21.19, all No Balls immediately award a Free Hit on the next delivery. On a Free Hit, the striker cannot be dismissed Bowled, Caught, LBW, Stumped, or Hit Wicket (only Run Out, Obstructing, and Hit Twice apply).',
        scorerRules: [
            '1 penalty run awarded to batting team extras (No Balls).',
            'Runs scored off the bat are credited directly to the striker.',
            'Delivery does not count towards the 6 legitimate balls of the over and must be re-bowled.',
            'Trigger Free Hit for the next delivery under ICC playing conditions.'
        ],
        systemEnforcement: 'Keypad No Ball button prompts extra runs picker (1nb to 7nb), increments noBall extras, charges bowler, and enables Free Hit.',
        quickActionText: 'Record No Ball',
        quickAction: 'NO_BALL'
    },
    {
        id: 'law-22',
        law: 'MCC Law 22',
        title: 'Wide Ball (Judgment & Tramlines)',
        category: 'EXTRAS',
        icon: '↔️',
        badge: '1 Extra Run + Re-Bowl',
        summary: 'A Wide Ball is judged if the ball passes wide of the striker where they cannot make reasonable contact with the bat. Under ICC T20/ODI guidelines, any ball passing down the leg side without hitting the batter is strictly called a Wide.',
        scorerRules: [
            '1 penalty run credited to team extras (Wides); bowler charged with runs conceded.',
            'Striker receives 0 balls faced and 0 runs.',
            'Additional runs completed while ball is wide are credited as Wides extras, not batter runs.',
            'Striker CAN be Stumped (Law 39.1.2) or Run Out (Law 38). Striker cannot be Bowled, Caught, or LBW.'
        ],
        systemEnforcement: 'Wide button adds 1wd-5wd to extras and over strip without incrementing the over legal ball counter.',
        quickActionText: 'Record Wide',
        quickAction: 'WIDE'
    },
    {
        id: 'law-23',
        law: 'MCC Law 23',
        title: 'Byes & Leg Byes (Extras Attribution)',
        category: 'EXTRAS',
        icon: '🛡️',
        badge: 'No Bowler Debit',
        summary: 'Byes occur when the ball misses both bat and body. Leg Byes occur when the ball hits the batter pads or person while the batter was attempting to play a stroke with the bat or attempting to avoid injury.',
        scorerRules: [
            'Runs are credited to team extras under Byes or Leg Byes.',
            'Batter receives 0 runs; balls faced increments by 1 on Leg Byes.',
            'Bowler is NOT charged with runs conceded in their bowling figures.',
            'Counts as a legitimate ball in the 6-ball over.',
            'Odd runs (1, 3) rotate strike between striker and non-striker.'
        ],
        systemEnforcement: 'Keypad Leg Bye and Bye buttons increment legal ball count and extras total without charging bowler figures.',
        quickActionText: 'Record Leg Bye',
        quickAction: 'LEG_BYE'
    },
    {
        id: 'law-17',
        law: 'MCC Law 17 & 21',
        title: 'The Over & Bowler Consecutive Quota',
        category: 'RUNS',
        icon: '🏏',
        badge: '6 Legal Balls',
        summary: 'The over consists of 6 legitimate deliveries. Neither Wides nor No Balls count as legitimate balls and must be re-bowled. A bowler cannot bowl two consecutive overs from either end.',
        scorerRules: [
            'Over completes exactly when 6 legitimate deliveries are recorded.',
            'Batters swap ends at the conclusion of the over.',
            'Scorer must select a new bowler for the subsequent over.',
            'Previous bowler is disabled from selection (MCC Law 21).',
            'Maximum 4 overs per bowler in a 20-over match (ICC 20% quota).'
        ],
        systemEnforcement: 'CricOS automatically opens the Bowler Change modal/sheet upon the 6th legal delivery, enforcing MCC Law 21 and T20 4.0 over quotas.',
        quickActionText: 'Change Bowler',
        quickAction: 'BOWLER_CHANGE'
    },
    {
        id: 'law-18',
        law: 'MCC Law 18 & ICC 18.11',
        title: 'Scoring Runs, Crossing & Caught Strike Rule',
        category: 'RUNS',
        icon: '🏃',
        badge: 'Oct 2022 Caught Rule',
        summary: 'Runs are scored when batters run between wickets. An odd number of runs completes a strike swap. Under the ICC October 2022 amendment to Law 18.11, on ANY Caught dismissal, the incoming new batter MUST take strike at the striker end regardless of crossing.',
        scorerRules: [
            '1, 3, 5 runs rotate strike; 0, 2, 4, 6 maintain striker.',
            'ICC Oct 2022 Rule: On Caught dismissals, incoming batter always takes strike.',
            'Short Run (Law 18.3): Disallowed runs must be deducted from the score.'
        ],
        systemEnforcement: 'Strike rotation engine automatically assigns incoming batter to striker position on Caught dismissals.',
        quickActionText: 'Swap Strike',
        quickAction: 'SWAP_STRIKE'
    },
    {
        id: 'law-19',
        law: 'MCC Law 19',
        title: 'Boundaries (Four & Six Allowances)',
        category: 'RUNS',
        icon: '🔥',
        badge: 'Boundary Allowances',
        summary: 'A Boundary 4 is scored when the ball makes contact with the ground inside the field before touching or crossing the boundary. A Boundary 6 is scored when the ball crosses the boundary on the full.',
        scorerRules: [
            '4 or 6 runs credited to striker score and team score.',
            'Bowler is charged with 4 or 6 runs conceded.',
            'Strike does not rotate on boundary 4 or 6.'
        ],
        systemEnforcement: 'Keypad 4 and 6 buttons update batter boundaries count, strike rate, and team total without rotating strike.',
        quickActionText: 'Score Four (4)',
        quickAction: 'SCORE_4'
    },
    {
        id: 'law-30-39',
        law: 'MCC Laws 30–39',
        title: 'The 10 Official Modes of Dismissal',
        category: 'DISMISSALS',
        icon: '🚨',
        badge: 'Full Codification',
        summary: 'A batter can only be dismissed through one of 10 official modes codified in MCC Laws: Bowled (32), Caught (33), LBW (36), Run Out (38), Stumped (39), Hit Wicket (35), Obstructing the Field (37), Hit the Ball Twice (34), Timed Out (40), and Handled the Ball (now absorbed into Obstructing under Law 37).',
        scorerRules: [
            'Bowler is credited ONLY for: Bowled, Caught, LBW, Stumped, and Hit Wicket.',
            'Bowler is NOT credited for: Run Out, Obstructing the Field, Hit Ball Twice, Timed Out, or Retired Out.',
            'Retired Hurt is NOT a dismissal and does NOT increment team wickets.'
        ],
        systemEnforcement: 'Wicket selector provides exhaustive 10 dismissal modes with accurate bowler analysis attribution.',
        quickActionText: 'Open Wicket Selector',
        quickAction: 'WICKET'
    },
    {
        id: 'law-30',
        law: 'MCC Law 32',
        title: 'Bowled (Stumps Struck & Bails Dislodged)',
        category: 'DISMISSALS',
        icon: '🎯',
        badge: 'Bowler Credited',
        summary: 'The striker is out Bowled if their wicket is put down by a ball delivered by the bowler, not being a No Ball, even if it has first touched the striker bat or person.',
        scorerRules: [
            'Bowler is credited with the wicket in their bowling analysis.',
            'Striker is out; ball is recorded as a dot ball or wicket ball.',
            'Invalid if delivery is a No Ball or Free Hit.'
        ],
        systemEnforcement: 'Dismissal dialog credits bowler wicket tally and updates scorecard.',
        quickActionText: 'Record Wicket',
        quickAction: 'WICKET'
    },
    {
        id: 'law-33',
        law: 'MCC Law 33 & ICC 18.11',
        title: 'Caught (Oct 2022 Strike Rotation Rule)',
        category: 'DISMISSALS',
        icon: '🧤',
        badge: 'Oct 2022 Strike Rule',
        summary: 'The striker is out Caught if a ball delivered by the bowler, not being a No Ball, touches the bat and is held by a fielder. Under the ICC October 2022 amendment to Law 18.11, the incoming new batter MUST always take strike at the striker end, regardless of whether batters crossed before the catch.',
        scorerRules: [
            'Bowler is credited with the wicket; fielder is credited with the catch.',
            'ICC Oct 2022 Rule: Incoming new batter MUST take strike at striker end.',
            'Invalid on Free Hit deliveries (Clause 21.19).'
        ],
        systemEnforcement: 'Strike rotation engine automatically places incoming batter on strike on Caught dismissals.',
        quickActionText: 'Record Caught',
        quickAction: 'WICKET'
    },
    {
        id: 'law-36',
        law: 'MCC Law 36',
        title: 'LBW (Leg Before Wicket)',
        category: 'DISMISSALS',
        icon: '🦵',
        badge: 'Bowler Credited',
        summary: 'The striker is out LBW if a legitimate delivery pitches in line or outside off, impacts the pads in line (or outside off if no shot offered), and would have gone on to hit the stumps.',
        scorerRules: [
            'Bowler credited with wicket; no fielder credit.',
            'Ball must not pitch outside leg stump (absolute exemption).',
            'Cannot be out LBW on a Free Hit or No Ball.'
        ],
        systemEnforcement: 'Hawk-Eye 3D ball tracking telemetry confirms Pitching, Impact, and Wickets trajectory.',
        quickActionText: 'Record LBW',
        quickAction: 'WICKET'
    },
    {
        id: 'law-38',
        law: 'MCC Law 38 & ICC 21.19',
        title: 'Run Out (Permitted on Free Hit)',
        category: 'DISMISSALS',
        icon: '⚡',
        badge: 'No Bowler Debit',
        summary: 'Either batter is out Run Out if their wicket is put down while they are out of their ground during a ball in play. Under ICC Playing Conditions Clause 21.19, Run Out is one of the strictly permitted dismissals on a Free Hit.',
        scorerRules: [
            'Bowler is NOT credited with the wicket in bowling analysis.',
            'Fielder executing the throw or breaking stumps is credited with run out assist.',
            'Scorer specifies whether striker or non-striker was out of ground.',
            'Permitted on Free Hit deliveries and Wide balls.'
        ],
        systemEnforcement: 'Dismissal selector enables striker/non-striker selection and fielder credit without debiting bowler wicket tally.',
        quickActionText: 'Record Run Out',
        quickAction: 'WICKET'
    },
    {
        id: 'law-39',
        law: 'MCC Law 39',
        title: 'Stumped (Wicketkeeper Action)',
        category: 'DISMISSALS',
        icon: '🧤',
        badge: 'Bowler & WK Credit',
        summary: 'The striker is out Stumped if they are out of their ground receiving a legitimate pitch delivery (or Wide ball) and the wicket is put down by the wicketkeeper without any fielder intervention.',
        scorerRules: [
            'Bowler is credited with wicket; wicketkeeper credited with dismissal.',
            'Possible on Wide balls (Law 39.1.2).',
            'Prohibited on Free Hit deliveries (ICC Clause 21.19).'
        ],
        systemEnforcement: 'Stumped dismissal assigns wicket to bowler and dismissal credit to wicketkeeper.',
        quickActionText: 'Record Stumped',
        quickAction: 'WICKET'
    },
    {
        id: 'law-35',
        law: 'MCC Law 35',
        title: 'Hit Wicket (Accidental Stump Dislodgement)',
        category: 'DISMISSALS',
        icon: '🪵',
        badge: 'Bowler Credited',
        summary: 'The striker is out Hit Wicket if their wicket is put down by their bat or person while preparing to receive or receiving a delivery, or setting off for a run immediately after receiving.',
        scorerRules: [
            'Bowler is credited with wicket.',
            'Prohibited on Free Hit deliveries.'
        ],
        systemEnforcement: 'Hit Wicket records wicket against bowler figures.',
        quickActionText: 'Record Hit Wicket',
        quickAction: 'WICKET'
    },
    {
        id: 'law-37',
        law: 'MCC Law 37',
        title: 'Obstructing the Field (Willful Interference)',
        category: 'DISMISSALS',
        icon: '🚫',
        badge: 'Permitted on Free Hit',
        summary: 'Either batter is out Obstructing the Field if they willfully attempt to obstruct or distract a fielder by word or action, or prevent a ball from hitting the stumps with the hand not holding the bat. Permitted on Free Hit deliveries.',
        scorerRules: [
            'Bowler is NOT credited with wicket.',
            'Permitted dismissal on Free Hit.'
        ],
        systemEnforcement: 'Dismissal modal supports Obstructing the Field for striker or non-striker.',
        quickActionText: 'Record Obstructing',
        quickAction: 'WICKET'
    },
    {
        id: 'law-34',
        law: 'MCC Law 34',
        title: 'Hit the Ball Twice (Guarding Wicket vs Second Shot)',
        category: 'DISMISSALS',
        icon: '🏏',
        badge: 'Permitted on Free Hit',
        summary: 'The striker is out Hit the Ball Twice if the ball in play touches their bat or person and they strike it a second time with bat or person before it has been touched by a fielder, except solely to guard their wicket. Permitted on Free Hit deliveries.',
        scorerRules: [
            'Bowler is NOT credited with wicket.',
            'Permitted dismissal on Free Hit.'
        ],
        systemEnforcement: 'Hit Ball Twice enabled in dismissal selector with zero bowler credit.',
        quickActionText: 'Record Hit Twice',
        quickAction: 'WICKET'
    },
    {
        id: 'law-31',
        law: 'MCC Law 31',
        title: 'Timed Out (3-Minute / 90-Second Ingress Window)',
        category: 'DISMISSALS',
        icon: '⏱️',
        badge: 'Umpire Clock',
        summary: 'An incoming batter must be in position to receive the ball or for their partner to receive the ball within 3 minutes of a wicket falling (or 90 seconds in T20 standard conditions).',
        scorerRules: [
            'Bowler is NOT credited with wicket.',
            'Umpire telemetry log records ingress violation timestamp.'
        ],
        systemEnforcement: 'Scorer ingress timer prompts warning if incoming batter is not stationed within time allowance.',
        quickActionText: 'Record Timed Out',
        quickAction: 'WICKET'
    },
    {
        id: 'law-25-4',
        law: 'MCC Law 25.4',
        title: 'Retired Hurt vs Retired Out',
        category: 'DISMISSALS',
        icon: '🏥',
        badge: 'Injury Invariant',
        summary: 'A batter may retire at any time when the ball is dead. If the retirement is due to illness, injury, or other unavoidable cause (Retired Hurt), the batter is not out and may resume later. If retirement is tactical without injury (Retired Out), the batter is out (counts against wickets, but no bowler credit).',
        scorerRules: [
            'Retired Hurt: Wickets do NOT increment; batter marked as not out; no fall of wicket recorded.',
            'Retired Out: Wickets increment by 1; fall of wicket recorded; bowler NOT credited.'
        ],
        systemEnforcement: 'CricOS distinguishes Retired Hurt from Retired Out, preventing incorrect wicket counting.',
        quickActionText: 'Record Retirement',
        quickAction: 'WICKET'
    },
    {
        id: 'law-12',
        law: 'MCC Law 12',
        title: 'Innings Duration & 10-Wicket All Out Closure',
        category: 'MATCH_OPS',
        icon: '🏁',
        badge: '10 Wickets Max',
        summary: 'In an 11-player squad, an innings is limited to a maximum of 10 wickets. When 10 wickets have fallen or all eligible bench reserves are exhausted, the batting side is declared ALL OUT and the innings is closed.',
        scorerRules: [
            'Under no circumstances can wickets reach 11 or 12.',
            'On the 10th dismissal, prompt All Out notice and close innings.',
            'Disable scoring pad buttons to prevent erroneous delivery entry.'
        ],
        systemEnforcement: 'CricOS locks scoring pads, renders ALL OUT notice, and finalizes innings total upon 10th wicket.',
        quickActionText: 'View Scorecard',
        quickAction: 'VIEW_SCORECARD'
    },
    {
        id: 'law-28-3',
        law: 'MCC Law 28.3',
        title: 'Protective Equipment (+5 Penalty Runs)',
        category: 'FIELDING',
        icon: '🪖',
        badge: '+5 Penalty Runs',
        summary: 'If a ball in play strikes a protective helmet placed on the ground by the fielding side behind the wicketkeeper, the ball becomes immediately dead and 5 penalty runs are awarded to the batting side.',
        scorerRules: [
            '5 penalty runs credited to team extras (Penalties).',
            'Ball is dead immediately upon contact.',
            'Delivery does not count towards the over; bowler is NOT debited.',
            'Any runs completed or in progress before impact are also counted.'
        ],
        systemEnforcement: '+5 Penalty Runs button directly credits penalty extras without ball progression.',
        quickActionText: 'Award +5 Penalty',
        quickAction: 'PENALTY_5'
    },
    {
        id: 'law-28-4',
        law: 'MCC Law 28.4 & ICC 28',
        title: 'Field Restrictions & Powerplay Quotas',
        category: 'FIELDING',
        icon: '🛡️',
        badge: 'Leg-Side & Ring Rules',
        summary: 'At the instant of the bowler delivery: max 5 fielders on the leg side (Law 28.4); max 2 fielders behind square on the leg side (Law 28.4.1). In Powerplay 1, max 2 fielders outside 30-yard circle.',
        scorerRules: [
            'Breach of field restrictions results in umpire calling No Ball.',
            'Free Hit awarded on next delivery.',
            'Fielders cannot change positions on Free Hit unless strike changed.'
        ],
        systemEnforcement: 'Tactical Field Radar audits fielder coordinates against 30-yard ring and leg-side constraints.',
        quickActionText: 'View Radar',
        quickAction: 'VIEW_RADAR'
    },
    {
        id: 'law-41',
        law: 'MCC Law 41',
        title: 'Unfair Play & Fake Fielding (+5 Penalty)',
        category: 'FAIR_PLAY',
        icon: '⚠️',
        badge: 'Fair Play Invariant',
        summary: 'Governs unfair play: ball tampering (41.3), dangerous bowling (41.6), pitch damage (41.12-14), and deliberate distraction or fake fielding (41.5). Umpires can award 5 penalty runs.',
        scorerRules: [
            '5 penalty runs awarded to non-offending side.',
            'Added to extras under penalties; bowler not charged.',
            'First warning issued for running on pitch.'
        ],
        systemEnforcement: 'Penalty modal records code of conduct violations and updates fair play index.',
        quickActionText: 'Award +5 Penalty',
        quickAction: 'PENALTY_5'
    },
    {
        id: 'law-42',
        law: 'MCC Law 42',
        title: 'Player Conduct (Level 1–4 Penalties)',
        category: 'FAIR_PLAY',
        icon: '⚖️',
        badge: 'Code of Conduct',
        summary: 'Governs player misconduct: Level 1 (dissent), Level 2 (dissent/throwing ball at player), Level 3 (intimidation/assault - 5 penalty runs & temporary suspension), Level 4 (violence - 5 penalty runs & removal from match).',
        scorerRules: [
            'Level 3 & 4 result in 5 penalty runs to non-offending side.',
            'Umpire telemetry log records incident report.'
        ],
        systemEnforcement: 'CricOS incident telemetry logs disciplinary actions with automated DRS/Umpire Desk audit trails.',
        quickActionText: 'Award +5 Penalty',
        quickAction: 'PENALTY_5'
    }
];
//# sourceMappingURL=index.js.map