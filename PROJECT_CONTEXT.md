# Project Context & Working Memory — CricOS

**Last Updated:** 2026-09-16 02:24:37
**Version:** 1.0.0-phase1s  
**Stack:** TypeScript / Node.js (Fastify, PostgreSQL, Redis, Docker, pnpm workspaces)  
**Remote:** https://github.com/manvenpratap/CricOS.git (main branch)

---

## 1. Current Status & Milestones
- **Active Phase**: Phase 1S Completed (Web & Mobile Client Application Deep Integration).
- **Test Health**: 100% Passing (87 automated tests across 11 test suites; 1.44s low-token execution via `./pipeline.sh test --summary`).
- **Build Status**: Strict TypeScript compilation with 0 errors across 8 workspace projects.
- **Runtime Daemon**: Hardened Fastify API server running on port 3000 (`http://localhost:3000/`) with zero-downtime graceful shutdown, liveness/readiness probes, and telemetry.

---

## 2. Implemented Features & Modules
- [x] **Monorepo Architecture**: pnpm workspaces (`packages/contracts`, `packages/commercial`, `packages/scoring`, `packages/domain`, `apps/api`, `apps/worker`, `apps/web`, `apps/mobile`).
- [x] **Database Migrations (0001–0015)**: Reconciled schema with GiST exclusion constraints (`btree_gist` double-booking prevention) and integer non-negative CHECK constraints.
- [x] **Fastify API Server (26 Modules)**: Complete modular route tree under `/api/v1` (Identity, Teams, Events, Marketplace, Basket, Checkout, Scoring, Tournaments, Settlement, Incidents, Operations, etc.).
- [x] **Cryptographic JWT & RBAC Middleware**: HMAC-SHA256 token signing with timing-safe comparison; preHandler role guards (`ADMIN`, `ORGANISER`, `CAPTAIN`, `PLAYER`, `PROVIDER`, `SCORER`).
- [x] **MCC Laws of Cricket Scoring Engine**: Batter scorecards, bowler figures, maidens, dynamic strike rotation, extras accounting, fall of wickets with 5-scenario golden corpus.
- [x] **Payment Gateway Adapter**: Pluggable `PaymentGatewayAdapter` with `MockPaymentAdapter` and `RazorpayPaymentAdapter` featuring HMAC-SHA256 webhook signature validation.
- [x] **Double-Entry Financial Settlement Ledger**: 5-account chart of accounts (`ESCROW_HOLD`, `PROVIDER_PAYABLE`, `PLATFORM_FEE_INCOME`, `TAX_GST_PAYABLE`, `REFUND_CLEARING`) with strict $\sum \text{Debits} \equiv \sum \text{Credits}$ balance enforcement.
- [x] **Real-Time Live Match Broadcast & SSE Streaming (Phase 1P)**: `MatchBroadcastHub` pub/sub multiplexer, SSE stream at `GET /api/v1/scoring/matches/:id/live`, automated keepalive pings, and disconnect cleanup.
- [x] **Interactive Live Match Center**: Real-time over ball strip (`[ • ] [ 1 ] [ 4 ] [ W ] [ 1wd ] [ 6 ]`), active batter & bowler statistics cards, live delivery commentary feed, and quick-action scoring controller.
- [x] **Provider Rating Aggregation & Reputation Circuit Breaker (Phase 1Q)**: Bayesian smoothed ratings (`calculateBayesianRating` with m-estimate prior), automated trust state evaluation (`evaluateProviderTrustState`), probation threshold (<80%), emergency suspension circuit breaker (<65%) with automated unbooked slot freezing (`service_slots.status = 'BLOCKED'`).
- [x] **Dispute Escalation & Double-Entry Auto-Refund**: `POST /disputes/:id/resolve` generates balanced zero-sum journal entries (`createRefundJournalEntry`: debit `REFUND_CLEARING`, credit `ESCROW_HOLD`) and enforces provider penalty (`DISPUTE_LOST` -10%).
- [x] **Guarded Payout Disbursement Pipeline**: `POST /payouts/disburse` validates that bookings have zero pending disputes and providers are in good trust standing before issuing disbursements.
- [x] **Production & Staging Deployment Hardening (Phase 1R)**: Environment configuration validation (`loadConfig`), fatal production guardrails for weak JWT secrets, zero-downtime graceful shutdown (`SIGTERM`/`SIGINT`), connection draining, cloud-native liveness (`/health/live`), readiness (`/health/ready`), and metrics telemetry (`/health/metrics`).
- [x] **Multi-Stage Containerization & Orchestration**: Production Dockerfiles (`Dockerfile.api`, `Dockerfile.worker`) using minimal Alpine images and non-root security, paired with `docker-compose.prod.yml`.
- [x] **Pre-flight Migration & Deployment Verification**: Autonomous validation CLI (`scripts/validate-deployment.mjs` / `pnpm deploy:validate`) verifying migration completeness (0001–0015), GiST constraints, and environment safety.
- [x] **Automated Continuous Integration**: GitHub Actions workflow (`.github/workflows/ci.yml`) enforcing build, typecheck, test summary, doctor, and deployment validation on all pull requests and main pushes.
- [x] **Universal Pipeline Integration**: Autonomous doctor, low-token verification loop, and self-healing runner (`./pipeline.sh`).
- [x] **Web Client Application Package (`apps/web`) (Phase 1S)**: `@cricket-platform/web` with typed API client, accessible live scoreboard with delivery chips (`[ • ] [ 1 ] [ 4 ] [ W ] [ 1wd ] [ 6 ]`), commercial fee breakdown, provider trust badges (`VERIFIED`, `PROBATION`, `SUSPENDED`), and HTML template with WCAG 2.2 AA tooltips.
- [x] **Mobile Client Application Package (`apps/mobile`) (Phase 1S)**: `@cricket-platform/mobile` with offline queueing, session persistence, `LiveMatchScreenController` with dynamic strike rotation & wicket fall tracking, `MarketplaceScreenController` with commercial fee breakdown, and `ProfileScreenController` with career figures.

---

## 3. Core Architecture & Invariants
1. **Monetary Integer Representation**: All currency amounts are strictly stored and computed in integer minor units (`amount_minor`, `price_minor`, `gross_minor`, etc.). Floating-point money is prohibited.
2. **Double-Booking Exclusion**: Booking and inventory hold collisions are enforced at the database level using PostgreSQL GiST temporal exclusion constraints (`tsrange`).
3. **Double-Entry Balance Invariant**: All financial ledger entries require non-negative debits and credits that sum to zero imbalance.
4. **Node 24 ESM Strip-Types**: Internal module dependencies and tests must import compiled JavaScript from `dist/` or use `import type` to prevent runtime module resolution errors.
5. **Universal Pipeline Token Invariant**: Test runs should use `./pipeline.sh test --summary` for token-efficient summaries.
6. **Production Secrets Invariant**: In `NODE_ENV=production`, weak or default JWT secrets are fatally rejected on startup.

---

## 4. Phase Roadmap
- [x] Phase 1N: Consolidation & Monorepo Baseline
- [x] Phase 1O: Security Hardening, MCC Scoring Engine, Gateway Adapter, Double-Entry Ledger
- [x] Phase 1P: Real-time Live Match Scoring Broadcast (SSE) & Live Scoreboard
- [x] Phase 1Q: Provider Rating Aggregation & Reputation Auto-Penalty Pipeline
- [x] Phase 1R: Staging Environment & Production Deployment Hardening
- [x] Phase 1S: Web & Mobile Client Application Deep Integration
- [ ] Phase 1T: End-to-End Synthetic Tournament Orchestration & Load Emulation
