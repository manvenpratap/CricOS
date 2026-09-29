import { generateRoundRobinSchedule, initializeStandings, updateTournamentStandings, calculateBayesianRating, evaluateProviderTrustState } from '@cricket-platform/domain';
import { createSettlementJournalEntry, validateJournalEntry } from '@cricket-platform/commercial';
import { SimulatedMatchEngine } from './match-simulator.js';
export class TournamentOrchestrator {
    config;
    constructor(config = {}) {
        this.config = {
            tournamentId: config.tournamentId || `tourn-${Date.now()}`,
            tournamentName: config.tournamentName || 'CricOS Invitational Trophy',
            teamCount: config.teamCount || 4,
            oversPerInnings: config.oversPerInnings || 5,
            enableLiveBroadcast: config.enableLiveBroadcast !== undefined ? config.enableLiveBroadcast : false,
            seed: config.seed || 1001
        };
    }
    async orchestrate() {
        const startTime = Date.now();
        const teams = this.generateSyntheticTeams(this.config.teamCount);
        const teamIds = teams.map(t => t.id);
        // 1. Generate round-robin schedule
        const scheduledFixtures = generateRoundRobinSchedule(teamIds);
        let standings = initializeStandings(teamIds);
        const fixtureReports = [];
        const journalEntries = [];
        let totalDeliveries = 0;
        let totalRuns = 0;
        let totalWickets = 0;
        const engine = new SimulatedMatchEngine(this.config.seed);
        // 2. Execute matches sequentially (or concurrently in batch)
        for (let i = 0; i < scheduledFixtures.length; i++) {
            const fix = scheduledFixtures[i];
            const homeTeam = teams.find(t => t.id === fix.homeTeamId);
            const awayTeam = teams.find(t => t.id === fix.awayTeamId);
            // Provision & settle commercial service slots for this fixture:
            // Base provider fees: Ground (₹2,500) + Umpire (₹1,000) + Scorer (₹500) = ₹4,000 (400,000 minor)
            const providerPayoutMinor = 400000;
            // 5% platform fee on base = 20,000 minor
            const platformFeeMinor = Math.round(providerPayoutMinor * 0.05);
            // 18% GST on platform fee = 3,600 minor
            const taxMinor = Math.round(platformFeeMinor * 0.18);
            const totalPaidMinor = providerPayoutMinor + platformFeeMinor + taxMinor;
            const journalEntry = createSettlementJournalEntry({
                orderId: `ord-${fix.id}`,
                totalPaidMinor,
                platformFeeMinor,
                taxMinor,
                providerPayoutMinor,
                currency: 'INR'
            });
            journalEntries.push(journalEntry);
            // Simulate the match
            const matchResult = engine.simulateMatch({
                matchId: `match-${fix.id}`,
                homeTeam,
                awayTeam,
                oversPerInnings: this.config.oversPerInnings
            });
            totalDeliveries += matchResult.innings1.deliveries.length + matchResult.innings2.deliveries.length;
            totalRuns += matchResult.innings1.runs + matchResult.innings2.runs;
            totalWickets += matchResult.innings1.wickets + matchResult.innings2.wickets;
            // Update tournament standings & NRR
            standings = updateTournamentStandings(standings, matchResult.summary);
            fixtureReports.push({
                fixtureId: fix.id,
                round: fix.round,
                homeTeam: homeTeam.name,
                awayTeam: awayTeam.name,
                matchResult,
                journalEntry
            });
        }
        const durationMs = Math.max(Date.now() - startTime, 1);
        const throughput = Math.round((totalDeliveries / (durationMs / 1000)) * 10) / 10;
        // 3. Compute Double-Entry Ledger Summary
        let totalDebitMinor = 0;
        let totalCreditMinor = 0;
        let allEntriesValid = true;
        for (const entry of journalEntries) {
            if (!validateJournalEntry(entry)) {
                allEntriesValid = false;
            }
            for (const line of entry.lines) {
                if (line.entryType === 'DEBIT')
                    totalDebitMinor += line.amountMinor;
                if (line.entryType === 'CREDIT')
                    totalCreditMinor += line.amountMinor;
            }
        }
        const isBalanced = allEntriesValid && totalDebitMinor === totalCreditMinor && totalDebitMinor > 0;
        // 4. Provider Reputation Convergence
        const groundRatings = [5, 5, 4, 5, 5];
        const umpireRatings = [5, 4, 5, 4, 4];
        const scorerRatings = [5, 5, 5, 5, 5];
        const groundBayesian = calculateBayesianRating(groundRatings);
        const umpireBayesian = calculateBayesianRating(umpireRatings);
        const scorerBayesian = calculateBayesianRating(scorerRatings);
        const providerTrustSummary = [
            {
                providerId: 'prv-ground-eden',
                role: 'GROUND',
                bayesianRating: groundBayesian,
                trustState: evaluateProviderTrustState('VERIFIED', groundBayesian / 5.0).newState
            },
            {
                providerId: 'prv-umpire-anil',
                role: 'UMPIRE',
                bayesianRating: umpireBayesian,
                trustState: evaluateProviderTrustState('VERIFIED', umpireBayesian / 5.0).newState
            },
            {
                providerId: 'prv-scorer-rahul',
                role: 'SCORER',
                bayesianRating: scorerBayesian,
                trustState: evaluateProviderTrustState('VERIFIED', scorerBayesian / 5.0).newState
            }
        ];
        return {
            tournamentId: this.config.tournamentId,
            name: this.config.tournamentName,
            totalTeams: teams.length,
            totalMatches: scheduledFixtures.length,
            totalDeliveries,
            totalRuns,
            totalWickets,
            durationMs,
            throughputDeliveriesPerSec: throughput,
            fixtures: fixtureReports,
            finalStandings: standings,
            ledgerSummary: {
                totalEntries: journalEntries.length,
                totalDebitMinor,
                totalCreditMinor,
                isBalanced
            },
            providerTrustSummary
        };
    }
    generateSyntheticTeams(count) {
        const predefinedNames = [
            'Mumbai Strikers',
            'Delhi Capitals',
            'Kolkata Knights',
            'Bangalore Blasters',
            'Chennai Superstars',
            'Hyderabad Sunrisers',
            'Punjab Warriors',
            'Rajasthan Royals'
        ];
        const teams = [];
        for (let i = 0; i < count; i++) {
            const teamId = `team-synth-${i + 1}`;
            const name = predefinedNames[i % predefinedNames.length] || `Team ${i + 1}`;
            const players = [];
            for (let p = 1; p <= 11; p++) {
                let role = 'BATTER';
                if (p === 1)
                    role = 'WICKET_KEEPER';
                else if (p >= 2 && p <= 5)
                    role = 'BATTER';
                else if (p >= 6 && p <= 8)
                    role = 'ALL_ROUNDER';
                else
                    role = 'BOWLER';
                players.push({
                    id: `p-${teamId}-${p}`,
                    name: `${name.split(' ')[0]} Player ${p}`,
                    role,
                    skillRating: 7 + (p % 4)
                });
            }
            teams.push({
                id: teamId,
                name,
                players
            });
        }
        return teams;
    }
}
//# sourceMappingURL=tournament-orchestrator.js.map