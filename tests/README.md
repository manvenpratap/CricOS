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
| `apps/mobile` | `test/mobile.test.ts` | Mobile API client, offline queueing, session caching, live match screen controller, marketplace booking, career stats |
| Root | `tests/migrations-and-seed.test.ts` | Schema reconciliation and database seed integrity |

## Execution Protocol
```bash
# Minimal Tokens Protocol (MANDATORY)
./pipeline.sh test --summary
```
