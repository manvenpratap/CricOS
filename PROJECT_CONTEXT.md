# Project Context & Working Memory — CricOS

**Last Updated:** 2026-09-16 03:05:45
**Version:** 1.0.0-phase1w  
**Stack:** TypeScript / Node.js (Fastify, PostgreSQL, Redis, Docker, pnpm workspaces)  
**Remote:** https://github.com/manvenpratap/CricOS.git (main branch)

---

## 1. Current Status & Milestones
- **Active Phase**: Phase 1W Completed (World-Class Frontend Design Overhaul — Floodlit Stadium Broadcast & Athletic Precision Glassmorphism).
- **Test Health**: 100% Passing (108 automated tests across 14 test suites; 1.39s low-token execution via `./pipeline.sh test --summary`).
- **Build Status**: Strict TypeScript compilation with 0 errors across 8 workspace projects.
- **Runtime Daemon**: Hardened Fastify API server running on port 3000 (`http://localhost:3000/`) with floodlit stadium broadcast UI, live SSE scoring, zero-downtime graceful shutdown, liveness/readiness probes, metrics exposition, and interactive API documentation.

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
- [x] **Synthetic Tournament Orchestrator & Match Simulator (`apps/api`) (Phase 1T)**: Autonomous tournament orchestration pipeline (`TournamentOrchestrator`, `SimulatedMatchEngine`) coordinating round-robin scheduling, multi-match simulation, provider marketplace bookings, and double-entry escrow settlement.
- [x] **Domain Tournament Mathematics (`packages/domain`) (Phase 1T)**: Official ICC/MCC Net Run Rate formula (`calculateNetRunRate`), ball-fraction conversions, polygon round-robin scheduling (`generateRoundRobinSchedule`), and multi-tier standings tie-breaking (`updateTournamentStandings`).
- [x] **High-Throughput Load Emulation CLI (Phase 1T)**: `scripts/emulate-tournament.mjs` / `pnpm tournament:emulate` profiling delivery throughput (>45,000 deliveries/sec), latency, and zero-imbalance ledger verification.
- [x] **Operational Telemetry & Metrics Exposition (`apps/api`) (Phase 1U)**: Native Prometheus/OpenMetrics standard text exposition at `GET /metrics`, sub-millisecond route timing, event loop delay histogram monitoring (`perf_hooks.monitorEventLoopDelay`), RSS and heap allocation tracking, and unified telemetry summary at `GET /health/metrics`.
- [x] **OpenAPI 3.0 Specification & Interactive Documentation Showcase (`apps/api`) (Phase 1U)**: Automated OpenAPI 3.0.3 catalog at `GET /api/v1/openapi.json` spanning all 26 modular routes, interactive dark-mode glassmorphism documentation showcase at `GET /docs` featuring live copyable cURL commands, response schemas, and accessible `data-tooltip` annotations.
- [x] **Automated Performance Profiler CLI (Phase 1U)**: `scripts/benchmark-performance.mjs` / `pnpm benchmark:profile` driving multi-route concurrency load profiling, measuring latency percentiles (min, avg, p50, p95, p99, max), event loop delay, and memory delta.
- [x] **Multi-Architecture Containerization & Docker Hardening (`Dockerfile.api`, `Dockerfile.worker`) (Phase 1V)**: Multi-stage Alpine containerization supporting `linux/amd64` and `linux/arm64` cross-platform builds with complete 8-workspace package tree inclusion, non-root `USER node` security context, and native liveness healthchecks.
- [x] **Distribution Packaging & Release Manifest Pipeline (Phase 1V)**: Standalone packaging automation (`scripts/package-distribution.mjs` / `pnpm package:dist`) producing verified distribution artifacts (`dist/index.html`, `dist/docs.html`, `dist/openapi.json`), calculating SHA-256 cryptographic hashes in `dist/release-manifest.json`, and guaranteeing byte-for-byte equality between root `index.html` and `dist/index.html` (Rule 6).
- [x] **Distribution & Container Verification CLI (Phase 1V)**: `scripts/verify-distribution.mjs` / `pnpm verify:dist` validating artifact checksums, single-file parity, Dockerfile layer declarations, `.dockerignore` hygiene, and production environment templates.
- [x] **Interactive Console & Navigation Polish (Phase 1V)**: Enhanced CricOS branding (`CricOS — Unified Cricket Operating System`), responsive header navigation pills with direct links to `/docs` (OpenAPI Showcase), `/metrics` (Prometheus), and `/health/ready` (Health Probes) with 100% accessible `data-tooltip` coverage.
- [x] **World-Class Frontend Design Overhaul (Phase 1W)**: Implemented "Floodlit Stadium Broadcast & Athletic Precision Glassmorphism" design system (DFII 17/15). Replaced generic fonts with Google Fonts typography suite (`Space Grotesk`, `Plus Jakarta Sans`, `Chakra Petch`, `JetBrains Mono`), crafted 3.5rem LED scoreboard HUD with turf-emerald (`#00E599`) and cyan (`#00D2FF`) glow effects, kinetic over strip with pop-animated ball bubbles, athletic tactile scoring pad buttons, and 100% WCAG 2.2 AA accessible `data-tooltip` coverage.

---

## 3. Core Architecture & Invariants
1. **Monetary Integer Representation**: All currency amounts are strictly stored and computed in integer minor units (`amount_minor`, `price_minor`, `gross_minor`, etc.). Floating-point money is prohibited.
2. **Double-Booking Exclusion**: Booking and inventory hold collisions are enforced at the database level using PostgreSQL GiST temporal exclusion constraints (`tsrange`).
3. **Double-Entry Balance Invariant**: All financial ledger entries require non-negative debits and credits that sum to zero imbalance.
4. **Node 24 ESM Strip-Types**: Internal module dependencies and tests must import compiled JavaScript from `dist/` or use `import type` to prevent runtime module resolution errors.
5. **Universal Pipeline Token Invariant**: Test runs should use `./pipeline.sh test --summary` for token-efficient summaries.
6. **Production Secrets Invariant**: In `NODE_ENV=production`, weak or default JWT secrets are fatally rejected on startup.
7. **Single-File Distribution Invariant**: Under Rule 6, root `index.html` and `dist/index.html` must remain byte-for-byte identical.
8. **Stadium Broadcast Design Invariant**: Consistent athletic typography tokens (`--font-display`, `--font-score`, `--font-body`), pitch emerald, cyan glow, and accessible contextual tooltips on all interactive elements.

---

## 4. Phase Roadmap
- [x] Phase 1N: Consolidation & Monorepo Baseline
- [x] Phase 1O: Security Hardening, MCC Scoring Engine, Gateway Adapter, Double-Entry Ledger
- [x] Phase 1P: Real-time Live Match Scoring Broadcast (SSE) & Live Scoreboard
- [x] Phase 1Q: Provider Rating Aggregation & Reputation Auto-Penalty Pipeline
- [x] Phase 1R: Staging Environment & Production Deployment Hardening
- [x] Phase 1S: Web & Mobile Client Application Deep Integration
- [x] Phase 1T: End-to-End Synthetic Tournament Orchestration & Load Emulation
- [x] Phase 1U: Advanced Operational Telemetry, Performance Profiling & Documentation Showcase
- [x] Phase 1V: Production Multi-Architecture Packaging, Distribution Hardening & Final Polish
- [x] Phase 1W: World-Class Frontend Design Overhaul (Floodlit Stadium Broadcast & Athletic Precision)
- [x] **CricOS 1.0.0 Production Release Milestone Achieved**

