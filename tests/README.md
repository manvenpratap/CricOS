# Test Coverage & Suite Map — CricOS

## Overview
Automated regression tests are executed via `./pipeline.sh test --summary` (routed through `run_tests.sh` to `pnpm test`).

## Test Suites & Modules
| Module / Workspace | Test File | Covered Capabilities |
| :--- | :--- | :--- |
| `packages/contracts` | `test/contracts.test.ts` | Shared schemas, DTOs, payload validation |
| `packages/scoring` | `test/scoring.test.ts` | MCC Laws scoring engine, strike rotation, bowling figures, maidens |
| `packages/domain` | `test/domain.test.ts` | Match status FSM, hold timeouts, points allocation, Bayesian ratings, trust transitions |
| `packages/commercial` | `test/ledger.test.ts` | Double-entry chart of accounts, zero-sum balancing, refund journals |
| `apps/api` | `test/api.test.ts` | Modular API route endpoints under `/api/v1` |
| `apps/api` | `test/auth.test.ts` | HMAC-SHA256 JWT tokens, RBAC roles (`ADMIN`, `ORGANISER`, `SCORER`, etc.) |
| `apps/api` | `test/payments.test.ts` | Gateway adapter, Razorpay HMAC webhook verification |
| `apps/api` | `test/broadcast.test.ts` | Real-time SSE live match broadcast hub, pub/sub multiplexer |
| `apps/api` | `test/reputation_pipeline.test.ts` | Bayesian ratings, circuit breaker slot freeze, dispute auto-refund, payout disbursement guards |
| `apps/api` | `test/production_hardening.test.ts` | Config guardrails, liveness/readiness probes, metrics telemetry, connection draining |
| `apps/web` | `test/web.test.ts` | Web client API, integer minor currency formatting, scoreboard chip rendering, commercial breakdown, trust badges |
| `apps/web` | `test/web_journeys.test.ts` | Multi-persona profiles, Playing XI squad rosters, Tactical scoring studio, 8-zone wagon wheel, round-robin fixtures |
| `apps/web` | `test/offline_and_analytics.test.ts` | Offline scoring outbox queue, RFC 4180 CSV scorecard export, printable HTML sheets, SVG Worm & Manhattan charts |
| `apps/web` | `test/archive_features.test.ts` | Archive features: Event Basket readiness meter, MCC Law 1.3 Toss & DLS rain rule, Official Desk, 5-star post-match rating, Orange/Purple Cap leaderboards |
| `apps/mobile` | `test/mobile.test.ts` | Mobile API client, offline queueing, session caching, live match screen controller, marketplace booking, career stats |
| Root | `tests/tournament-emulation.test.ts` | End-to-end synthetic tournament lifecycle, round-robin scheduling, NRR calculation, double-entry settlement verification |
| Root | `tests/operational-telemetry.test.ts` | Prometheus metrics text exposition, request latency histograms, event loop lag, OpenAPI 3.0 & /docs showcase |
| Root | `tests/distribution-packaging.test.ts` | Standalone distribution packaging, byte-for-byte HTML parity, release manifest hashes, Dockerfiles, App Store/Play Store compliance & visual assets, Floodlit Stadium Broadcast tokens |
| Root | `tests/migrations-and-seed.test.ts` | Schema reconciliation and database seed integrity |

## Execution Protocol
```bash
# Minimal Tokens Protocol (MANDATORY)
./pipeline.sh test --summary
```
