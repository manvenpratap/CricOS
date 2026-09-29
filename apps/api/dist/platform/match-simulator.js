export class SimulatedMatchEngine {
    rngState;
    constructor(seed = 42) {
        this.rngState = seed;
    }
    // Simple, deterministic pseudo-random generator (LCG)
    nextRandom() {
        this.rngState = (this.rngState * 1664525 + 1013904223) % 4294967296;
        return this.rngState / 4294967296;
    }
    simulateMatch(config) {
        const oversLimit = config.oversPerInnings || 20;
        const maxBalls = oversLimit * 6;
        // Team 1 bats first (home team)
        const innings1 = this.simulateInnings({
            battingTeam: config.homeTeam,
            bowlingTeam: config.awayTeam,
            oversLimit,
            targetRuns: undefined
        });
        // Team 2 bats second (away team chasing innings1.runs + 1)
        const target = innings1.runs + 1;
        const innings2 = this.simulateInnings({
            battingTeam: config.awayTeam,
            bowlingTeam: config.homeTeam,
            oversLimit,
            targetRuns: target
        });
        let winnerId = null;
        let isTie = false;
        let margin = '';
        if (innings2.runs >= target) {
            winnerId = config.awayTeam.id;
            const wicketsInHand = 10 - innings2.wickets;
            margin = `${config.awayTeam.name} won by ${wicketsInHand} wicket${wicketsInHand > 1 ? 's' : ''}`;
        }
        else if (innings2.runs === innings1.runs) {
            isTie = true;
            margin = 'Match tied';
        }
        else {
            winnerId = config.homeTeam.id;
            const runMargin = innings1.runs - innings2.runs;
            margin = `${config.homeTeam.name} won by ${runMargin} run${runMargin > 1 ? 's' : ''}`;
        }
        const summary = {
            homeTeamId: config.homeTeam.id,
            awayTeamId: config.awayTeam.id,
            homeRuns: innings1.runs,
            homeBallsFaced: innings1.ballsFaced,
            homeAllOut: innings1.allOut,
            awayRuns: innings2.runs,
            awayBallsFaced: innings2.ballsFaced,
            awayAllOut: innings2.allOut,
            maxScheduledOvers: oversLimit,
            winnerId,
            isTie,
            isNoResult: false
        };
        return {
            matchId: config.matchId,
            homeTeamId: config.homeTeam.id,
            awayTeamId: config.awayTeam.id,
            innings1,
            innings2,
            winnerId,
            isTie,
            margin,
            summary
        };
    }
    simulateInnings(params) {
        const { battingTeam, bowlingTeam, oversLimit, targetRuns } = params;
        const maxBalls = oversLimit * 6;
        const maxBowlerBalls = Math.max(6, Math.floor(maxBalls / 5)); // 1/5th max quota
        let totalRuns = 0;
        let totalWickets = 0;
        let legalBalls = 0;
        let sequence = 1;
        const deliveries = [];
        // Batters setup
        const battingLineup = battingTeam.players.slice(0, 11);
        let strikerIndex = 0;
        let nonStrikerIndex = 1;
        let nextBatterIndex = 2;
        // Bowlers setup: pick bowlers from positions 6 to 10
        const bowlingLineup = bowlingTeam.players.slice(5, 11);
        const bowlerBallsCount = new Map();
        for (const b of bowlingLineup) {
            bowlerBallsCount.set(b.id, 0);
        }
        let currentBowlerIndex = 0;
        while (legalBalls < maxBalls && totalWickets < 10) {
            // Check if chase target reached
            if (targetRuns !== undefined && totalRuns >= targetRuns) {
                break;
            }
            // Check over boundary (every 6 legal balls)
            if (legalBalls > 0 && legalBalls % 6 === 0 && deliveries[deliveries.length - 1]?.legal_ball) {
                // Rotate strike at over end
                const temp = strikerIndex;
                strikerIndex = nonStrikerIndex;
                nonStrikerIndex = temp;
                // Rotate bowler
                currentBowlerIndex = (currentBowlerIndex + 1) % bowlingLineup.length;
            }
            const activeBowler = bowlingLineup[currentBowlerIndex] || bowlingTeam.players[5];
            const striker = battingLineup[strikerIndex] || battingTeam.players[0];
            const nonStriker = battingLineup[nonStrikerIndex] || battingTeam.players[1];
            // Generate delivery outcome
            const rand = this.nextRandom();
            let batRuns = 0;
            let extraRuns = 0;
            let extraType = 'NONE';
            let isLegal = true;
            let isWicket = false;
            let wicketType = undefined;
            let playerOutId = undefined;
            if (rand < 0.04) {
                // Wide ball
                extraType = 'WIDE';
                extraRuns = 1;
                isLegal = false;
                totalRuns += 1;
            }
            else if (rand < 0.06) {
                // No ball
                extraType = 'NO_BALL';
                extraRuns = 1;
                isLegal = false;
                totalRuns += 1;
            }
            else if (rand < 0.11) {
                // Wicket!
                isWicket = true;
                totalWickets += 1;
                legalBalls += 1;
                playerOutId = striker.id;
                wicketType = rand < 0.08 ? 'CAUGHT' : 'BOWLED';
                // Substitute new batter if available
                if (nextBatterIndex < battingLineup.length) {
                    strikerIndex = nextBatterIndex++;
                }
            }
            else if (rand < 0.50) {
                // Dot ball
                batRuns = 0;
                legalBalls += 1;
            }
            else if (rand < 0.78) {
                // Single
                batRuns = 1;
                totalRuns += 1;
                legalBalls += 1;
                // Odd runs: rotate strike
                const temp = strikerIndex;
                strikerIndex = nonStrikerIndex;
                nonStrikerIndex = temp;
            }
            else if (rand < 0.88) {
                // Double
                batRuns = 2;
                totalRuns += 2;
                legalBalls += 1;
            }
            else if (rand < 0.96) {
                // Boundary Four
                batRuns = 4;
                totalRuns += 4;
                legalBalls += 1;
            }
            else {
                // Maximum Six
                batRuns = 6;
                totalRuns += 6;
                legalBalls += 1;
            }
            deliveries.push({
                client_event_id: `sim-ev-${sequence}`,
                sequence: sequence++,
                event_type: isWicket ? 'WICKET' : 'DELIVERY',
                bat_runs: batRuns,
                extra_runs: extraRuns,
                extra_type: extraType,
                legal_ball: isLegal,
                is_wicket: isWicket,
                wicket_type: wicketType,
                player_out_id: playerOutId,
                bowler_id: activeBowler.id,
                striker_id: striker.id,
                non_striker_id: nonStriker.id
            });
        }
        const completedOvers = Math.floor(legalBalls / 6);
        const extraBalls = legalBalls % 6;
        const oversDisplay = `${completedOvers}.${extraBalls}`;
        return {
            battingTeamId: battingTeam.id,
            bowlingTeamId: bowlingTeam.id,
            runs: totalRuns,
            wickets: totalWickets,
            ballsFaced: legalBalls,
            oversDisplay,
            allOut: totalWickets >= 10,
            deliveries
        };
    }
}
//# sourceMappingURL=match-simulator.js.map