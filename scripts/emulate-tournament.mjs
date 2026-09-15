#!/usr/bin/env node

/**
 * CricOS Synthetic Tournament Orchestrator & Load Benchmark
 * Usage: node scripts/emulate-tournament.mjs [--teams 4] [--overs 5] [--seed 2026]
 */

import { TournamentOrchestrator } from '../apps/api/dist/platform/tournament-orchestrator.js';

async function main() {
  const args = process.argv.slice(2);
  let teams = 4;
  let overs = 5;
  let seed = 2026;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--teams' && args[i + 1]) teams = parseInt(args[i + 1], 10);
    if (args[i] === '--overs' && args[i + 1]) overs = parseInt(args[i + 1], 10);
    if (args[i] === '--seed' && args[i + 1]) seed = parseInt(args[i + 1], 10);
  }

  console.log('========================================================');
  console.log('🏆  CricOS Synthetic Tournament Orchestration & Benchmark');
  console.log('========================================================');
  console.log(`Configuration: Teams=${teams} | Overs=${overs} | Seed=${seed}\n`);

  const orchestrator = new TournamentOrchestrator({
    tournamentName: 'CricOS Premier Champions Cup',
    teamCount: teams,
    oversPerInnings: overs,
    seed
  });

  const result = await orchestrator.orchestrate();

  console.log('--------------------------------------------------------');
  console.log(`Tournament: ${result.name} (ID: ${result.tournamentId})`);
  console.log('--------------------------------------------------------');
  console.log(`Teams:                      ${result.totalTeams}`);
  console.log(`Matches Simulated:          ${result.totalMatches}`);
  console.log(`Total Deliveries Emulated:  ${result.totalDeliveries}`);
  console.log(`Total Runs Scored:          ${result.totalRuns}`);
  console.log(`Total Wickets Fallen:       ${result.totalWickets}`);
  console.log(`Elapsed Runtime:            ${result.durationMs} ms`);
  console.log(`Throughput:                 ${result.throughputDeliveriesPerSec} deliveries/sec\n`);

  console.log('📊 FINAL TOURNAMENT STANDINGS & NET RUN RATE (NRR):');
  console.log('Pos | Team               | P | W | L | T | Pts | NRR');
  console.log('----+--------------------+---+---+---+---+-----+--------');
  result.finalStandings.forEach((s, idx) => {
    const pos = String(idx + 1).padEnd(3);
    const teamName = s.teamId.padEnd(18);
    const played = String(s.played).padEnd(2);
    const won = String(s.won).padEnd(2);
    const lost = String(s.lost).padEnd(2);
    const tied = String(s.tied).padEnd(2);
    const pts = String(s.points).padEnd(4);
    const nrrSign = s.netRunRate >= 0 ? '+' : '';
    const nrr = `${nrrSign}${s.netRunRate.toFixed(3)}`.padStart(7);
    console.log(`${pos} | ${teamName} | ${played}| ${won}| ${lost}| ${tied}| ${pts}| ${nrr}`);
  });

  console.log('\n⚖️  DOUBLE-ENTRY LEDGER RECONCILIATION:');
  console.log(`Settlement Journal Entries: ${result.ledgerSummary.totalEntries}`);
  console.log(`Total Debits:               ₹${(result.ledgerSummary.totalDebitMinor / 100).toFixed(2)}`);
  console.log(`Total Credits:              ₹${(result.ledgerSummary.totalCreditMinor / 100).toFixed(2)}`);
  console.log(`Balance Invariant (ΣD ≡ ΣC): ${result.ledgerSummary.isBalanced ? '✓ ZERO IMBALANCE (PASSED)' : '✖ FAILED'}`);

  console.log('\n⭐ PROVIDER REPUTATION & TRUST STANDING:');
  for (const p of result.providerTrustSummary) {
    console.log(`- [${p.role.padEnd(6)}] ${p.providerId.padEnd(20)}: Bayesian=${p.bayesianRating.toFixed(2)} | Status=${p.trustState}`);
  }

  console.log('========================================================');
  console.log('✅ Tournament Orchestration & Load Emulation Complete.');
  console.log('========================================================\n');
}

main().catch(err => {
  console.error('Tournament Emulation Failed:', err);
  process.exit(1);
});
