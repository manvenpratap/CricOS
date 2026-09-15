#!/usr/bin/env node

/**
 * CricOS Performance Profiler & Benchmark Harness
 * Usage: node scripts/benchmark-performance.mjs [--concurrency 10] [--iterations 50]
 */

import { buildServer } from '../apps/api/dist/server.js';
import { metricsRegistry } from '../apps/api/dist/platform/metrics.js';

async function runBenchmark() {
  const args = process.argv.slice(2);
  let concurrency = 10;
  let iterations = 40;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--concurrency' && args[i + 1]) concurrency = parseInt(args[i + 1], 10);
    if (args[i] === '--iterations' && args[i + 1]) iterations = parseInt(args[i + 1], 10);
  }

  console.log('========================================================');
  console.log('⚡ CricOS Operational Telemetry & Performance Profiler');
  console.log('========================================================');
  console.log(`Configuration: Concurrency=${concurrency} | Total Batches=${iterations}\n`);

  const server = buildServer();
  const latencies = [];
  const startMem = process.memoryUsage();
  const overallStartTime = Date.now();

  let completed = 0;
  let errors = 0;

  // Mix of operational endpoints: Health, Metrics, Standings, Marketplace, Scoring
  const endpoints = [
    { method: 'GET', url: '/health/live' },
    { method: 'GET', url: '/health/ready' },
    { method: 'GET', url: '/health/metrics' },
    { method: 'GET', url: '/metrics' },
    { method: 'GET', url: '/api/v1/marketplace/listings' },
    { method: 'GET', url: '/api/v1/tournaments/sample-tourn/standings' },
    {
      method: 'POST',
      url: '/api/v1/tournaments/orchestrate',
      payload: { teamCount: 4, oversPerInnings: 2, seed: 100 }
    }
  ];

  for (let batch = 0; batch < iterations; batch++) {
    const promises = [];
    for (let c = 0; c < concurrency; c++) {
      const ep = endpoints[(batch * concurrency + c) % endpoints.length];
      const p = (async () => {
        const t0 = process.hrtime.bigint();
        try {
          const res = await server.inject({
            method: ep.method,
            url: ep.url,
            payload: ep.payload
          });
          const elapsed = Number(process.hrtime.bigint() - t0) / 1e6;
          latencies.push(elapsed);
          if (res.statusCode >= 400 && res.statusCode !== 503) {
            errors++;
          }
          completed++;
        } catch {
          errors++;
        }
      })();
      promises.push(p);
    }
    await Promise.all(promises);
  }

  const overallDurationMs = Math.max(Date.now() - overallStartTime, 1);
  const endMem = process.memoryUsage();

  latencies.sort((a, b) => a - b);
  const min = latencies[0] || 0;
  const max = latencies[latencies.length - 1] || 0;
  const p50 = latencies[Math.floor(latencies.length * 0.5)] || 0;
  const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
  const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;
  const sum = latencies.reduce((acc, v) => acc + v, 0);
  const avg = latencies.length > 0 ? sum / latencies.length : 0;
  const rps = Math.round((completed / (overallDurationMs / 1000)) * 10) / 10;

  const eventLoop = metricsRegistry.getEventLoopLagMs();

  console.log('--------------------------------------------------------');
  console.log('📊 BENCHMARK THROUGHPUT & LATENCY RESULTS');
  console.log('--------------------------------------------------------');
  console.log(`Total Requests Processed:  ${completed}`);
  console.log(`Failed / Error Requests:   ${errors}`);
  console.log(`Elapsed Runtime:           ${overallDurationMs} ms`);
  console.log(`Throughput:                ${rps} requests/sec\n`);

  console.log('📈 LATENCY DISTRIBUTION (ms):');
  console.log(`  Min:                     ${min.toFixed(2)} ms`);
  console.log(`  Avg:                     ${avg.toFixed(2)} ms`);
  console.log(`  p50 (Median):            ${p50.toFixed(2)} ms`);
  console.log(`  p95:                     ${p95.toFixed(2)} ms`);
  console.log(`  p99:                     ${p99.toFixed(2)} ms`);
  console.log(`  Max:                     ${max.toFixed(2)} ms\n`);

  console.log('🔄 EVENT LOOP DELAY & RESOURCE TELEMETRY:');
  console.log(`  Event Loop p50:          ${eventLoop.p50} ms`);
  console.log(`  Event Loop p95:          ${eventLoop.p95} ms`);
  console.log(`  Event Loop Mean:         ${eventLoop.mean} ms`);
  console.log(`  Heap Delta:              +${((endMem.heapUsed - startMem.heapUsed) / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`  RSS Delta:               +${((endMem.rss - startMem.rss) / (1024 * 1024)).toFixed(2)} MB\n`);

  console.log('========================================================');
  console.log('✅ Performance Profiling & Telemetry Benchmark Complete.');
  console.log('========================================================\n');
}

runBenchmark().catch(err => {
  console.error('Benchmark failed:', err);
  process.exit(1);
});
