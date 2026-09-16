# Project Context & Working Memory — CricOS

**Last Updated:** 2026-09-16 14:08:14
**Version:** 1.0.0-phase2e (Blueprint & FSD Functional Specification Completion)  
**Stack:** TypeScript / Node.js (Fastify, PostgreSQL, Redis, Docker, pnpm workspaces)  
**Remote:** https://github.com/manvenpratap/CricOS.git (main branch)

---

## 1. Current Status & Milestones
- **Active Phase**: Phase 2E Completed (Blueprint & FSD Feature Matrix: Create Event Wizard UX-003, Event Overview & Readiness UX-004, Official Availability Calendar UX-015, Match Contextual Messaging FSD §45, Booking Lifecycle & Cancellation Engine Commercial §10-14, Financial Reconciliation & Payout Pipeline Commercial §17-18).
- **Test Health**: 100% Passing (222 automated tests across 22 test suites; 1.77s low-token execution via `./pipeline.sh test --summary`).
- **Build Status**: Strict TypeScript compilation with 0 errors across 8 workspace projects.
- **Runtime Daemon**: Hardened Fastify API server running on port 3000 (`http://localhost:3000/`) with interactive 7-tab web console, live SSE scoring, offline outbox retry queue, zero-downtime graceful shutdown, liveness/readiness probes, metrics exposition, interactive API documentation (`/docs`), tactile mobile mockup (`/mobile`), and accessible 6-modal operations desk.

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
- [x] **Synthetic Tournament Orchestrator & Match Simulator (`apps/api`) (Phase 1T)**: Autonomous tournament orchestration pipeline (`TournamentOrchestrator`, `SimulatedMatchEngine`) coordinating round-robin scheduling, multi-match simulation, provider marketplace bookings, and double-entry escrow settlement.
- [x] **Domain Tournament Mathematics (`packages/domain`) (Phase 1T)**: Official ICC/MCC Net Run Rate formula (`calculateNetRunRate`), ball-fraction conversions, polygon round-robin scheduling (`generateRoundRobinSchedule`), and multi-tier standings tie-breaking (`updateTournamentStandings`).
- [x] **High-Throughput Load Emulation CLI (Phase 1T)**: `scripts/emulate-tournament.mjs` / `pnpm tournament:emulate` profiling delivery throughput (>45,000 deliveries/sec), latency, and zero-imbalance ledger verification.
- [x] **Operational Telemetry & Metrics Exposition (`apps/api`) (Phase 1U)**: Native Prometheus/OpenMetrics standard text exposition at `GET /metrics`, sub-millisecond route timing, event loop delay histogram monitoring (`perf_hooks.monitorEventLoopDelay`), RSS and heap allocation tracking, and unified telemetry summary at `GET /health/metrics`.
- [x] **OpenAPI 3.0 Specification & Interactive Documentation Showcase (`apps/api`) (Phase 1U)**: Automated OpenAPI 3.0.3 catalog at `GET /api/v1/openapi.json` spanning all 26 modular routes, interactive dark-mode glassmorphism documentation showcase at `GET /docs` featuring live copyable cURL commands, response schemas, and accessible `data-tooltip` annotations.
- [x] **Automated Performance Profiler CLI (Phase 1U)**: `scripts/benchmark-performance.mjs` / `pnpm benchmark:profile` driving multi-route concurrency load profiling, measuring latency percentiles (min, avg, p50, p95, p99, max), event loop delay, and memory delta.
- [x] **Multi-Architecture Containerization & Docker Hardening (`Dockerfile.api`, `Dockerfile.worker`) (Phase 1V)**: Multi-stage Alpine containerization supporting `linux/amd64` and `linux/arm64` cross-platform builds with complete 8-workspace package tree inclusion, non-root `USER node` security context, and native liveness healthchecks.
- [x] **Distribution Packaging & Release Manifest Pipeline (Phase 1V)**: Standalone packaging automation (`scripts/package-distribution.mjs` / `pnpm package:dist`) producing verified distribution artifacts (`dist/index.html`, `dist/docs.html`, `dist/openapi.json`, `dist/mobile.html`), calculating SHA-256 cryptographic hashes in `dist/release-manifest.json`, and guaranteeing byte-for-byte equality between root `index.html` and `dist/index.html` (Rule 6).
- [x] **Distribution & Container Verification CLI (Phase 1V)**: `scripts/verify-distribution.mjs` / `pnpm verify:dist` validating artifact checksums, single-file parity, Dockerfile layer declarations, `.dockerignore` hygiene, and production environment templates.
- [x] **World-Class Frontend Design Overhaul (Phase 1W)**: Implemented "Floodlit Stadium Broadcast & Athletic Precision Glassmorphism" design system. Replaced generic fonts with Google Fonts typography suite (`Space Grotesk`, `Plus Jakarta Sans`, `Chakra Petch`, `JetBrains Mono`), crafted 3.5rem LED scoreboard HUD with turf-emerald (`#00E599`) and cyan (`#00D2FF`) glow effects, kinetic over strip with pop-animated ball bubbles, athletic tactile scoring pad buttons, and 100% WCAG 2.2 AA accessible `data-tooltip` coverage.
- [x] **Stitch Application Screen Architecture (Phase 1X)**: Structured 5-screen wireframe & state machine design. Implemented persistent Global Stadium Telemetry Strip (`1 LIVE`, `₹500k Escrow`, `Circuit 100%`, `<10ms SSE Latency`), Screen 1 dynamic Target Equation Bar & Fall of Wickets Timeline, Screen 2 interactive Hourly Slot Matrix (`08:00 Avail`, `13:00 Avail`, `18:00 Booked`), Screen 3 Tournament Stage Stepper with official ICC Net Run Rate precision tags (`+0.850`, `-0.420`), and Screen 5 real-time Prometheus Metric Cards.
- [x] **Scoring Delivery Deduplication & SSE Synchronization (Phase 1X.1)**: Eliminated duplicate ball bubble and feed entry generation on scoring pad clicks using deterministic `event_id` / `client_event_id` keys and bounded caches.
- [x] **Consumer Mobile Application & App Store Packaging (`apps/mobile`) (Phase 1Y)**:
  - **Expo / React Native Store Configuration**: `apps/mobile/app.json` and `apps/mobile/eas.json` configured for Google Play Store (`.aab`) and Apple App Store (`.ipa`) with package identifier `com.cricos.app`, camera, and push notification permissions.
  - **Complete Consumer Journeys**:
    1. *Authentication & Persona Selection*: Mobile OTP request and verification (`POST /api/v1/auth/otp/request` & `/verify`) with role pill switcher (`CAPTAIN`, `PLAYER`, `SCORER`, `ORGANISER`).
    2. *Player Profile & Apple 5.1.1(v) Compliance*: Dynamic batting average, strike rate, bowling economy, and in-app irreversible account deletion confirmation workflow compliant with App Store Review Guideline 5.1.1(v).
    3. *Tactile Match Scoring Center*: Mobile-optimized numeric pad (`0`, `1`, `2`, `3`, `4`, `6`, `W`, `Wd`), live over bubble strip, active batter/bowler HUD, and undo action.
    4. *Tournament Standings*: 4-stage stepper, ICC Net Run Rate calculations with 3-decimal precision (`+1.420`, `+0.850`, `-0.420`).
    5. *Turf & Official Marketplace*: Turf listings with 15-minute GiST hold timer and transparent commercial fee breakdown (5% platform fee, 18% GST).
  - **Interactive Mobile Webview Mockup**: High-fidelity iPhone mockup with Dynamic Island served at `http://localhost:3000/mobile` and directly accessible from the main console header via `📱 Mobile App`.
- [x] **Technical Audit Remediation & Hardening (Phase 1Z)**:
  - **Security & Headers**: Standard security headers (`nosniff`, `SAMEORIGIN`, `referrer-policy`, `xss-protection`) and correlation ID propagation (`x-correlation-id`, `x-request-id`).
  - **Rate Limiting**: Sliding-window rate limiter on Fastify API (`x-ratelimit-limit: 500`, 429 status code with `Retry-After`).
  - **Error Hierarchy**: Structured domain error classes (`AppError`, `ValidationError`, `AuthenticationError`, `ForbiddenError`, `NotFoundError`, `ConflictError`, `RateLimitExceededError`).
  - **Audit Logging**: Dedicated non-blocking audit logging writing mutating actions to PostgreSQL `audit_events`.
  - **Worker Outbox Alignment**: Aligned background worker outbox event polling with canonical `published_at` schema column.
  - **Database Backup & Restore Automation**: `scripts/backup-db.mjs` and `scripts/restore-db.mjs` supporting JSON table data export, SHA-256 integrity verification, and dry-run validation.
  - **Kubernetes Deployment Manifests**: Production manifests in `infra/k8s/` (namespace, configmap, secrets, api/worker deployments, ingress).
  - **Technical Audit Closure**: `docs/audit/TECHNICAL_AUDIT.md` fully updated to 100% remediated and certified production-ready.
- [x] **Complete Multi-Persona Web Frontend & Consumer Journeys (Phase 2A)**:
  - **Modular Package Exports (`apps/web`)**: Implemented `@cricket-platform/web` component library with `getDefaultProfile`, `renderUserBadgeHtml`, `getDefaultTeam`, `renderPlayerCardHtml`, `calculatePartnership`, `SHOT_ZONES_CONFIG`, `getDismissalLabel`, and `generateTournamentSchedule` polygon round-robin algorithm with bye support (100% test coverage in `apps/web/test/web_journeys.test.ts`).
  - **Interactive User Profile & Persona Switching**: Header user avatar pill (`VK`), profile configuration modal (`#modalUserProfile`) with persona pills (`CAPTAIN`, `PLAYER`, `SCORER`, `ORGANISER`, `TURF_PROVIDER`), career statistics, and Apple Guideline 5.1.1(v) compliant in-app irreversible account deletion.
  - **Teams & Squad Rosters**: Playing XI lineup (11 verified players) and Bench reserves (3 substitutes) with role badges (`C`, `VC`, `WK`, `BAT`, `BOWL`, `ALL`), dynamic franchise kit preview, and invite join code copy (`CRIC-BLR-4821`).
  - **Tactical Scoring Studio & 8-Zone Wagon Wheel**: Dual active batter cards (striker & non-striker), manual strike swap (`swapStudioStrike`), 8-zone Wagon Wheel selector (`LONG_OFF`, `LONG_ON`, `EXTRA_COVER`, `MID_WICKET`, `POINT`, `SQUARE_LEG`, `THIRD_MAN`, `FINE_LEG`), active partnership tracker, and quick extras strip (`+1 Wd`, `+1 Nb (Free Hit)`, `+1 Lb`, `+1 Bye`).
  - **Wicket Dismissal Modal Flow**: Dedicated dismissal modal (`#modalDismissal`) supporting 6 modes (`BOWLED`, `CAUGHT`, `LBW`, `RUN_OUT`, `STUMPED`, `HIT_WICKET`), conditional fielder involvement input, striker/non-striker selection, incoming batter assignment, and Fall of Wickets (FoW) timeline synchronization.
  - **Venues & Turfs 15-Minute GiST Hold**: Interactive venue slot reservation modal (`#modalCheckout`) with live 15-minute countdown timer (`14:59`), commercial breakdown (5% platform facilitation, 18% GST), and double-entry escrow confirmation.
- [x] **Offline-First Match Scoring, SVG Analytics Visuals & Scorecard Export Engine (Phase 2B)**:
  - **Modular Component Library (`apps/web`)**:
    - `OfflineDeliveryQueue` (`offline-sync.ts`): Client-side outbox queue storing pending deliveries in `localStorage`, tracking retry attempts, sequential flushing on network recovery or manual trigger, and network event listeners (`online`/`offline`).
    - `renderWormChartSvg` & `renderManhattanChartSvg` (`match-charts.ts`): Zero-dependency responsive SVG chart visualizer plotting progressive run comparative worm curves and over-by-over Manhattan bar charts with boundary indicators and wicket markers.
    - `generateScorecardCsv` & `generatePrintableScorecardHtml` (`scorecard-export.ts`): RFC 4180-compliant CSV scorecard export and clean, printer-friendly CSS match sheet ready for PDF generation.
  - **Telemetry Strip & Offline Status Badge**: Dynamic telemetry node (`#telemetrySyncNode`) displaying live connection status (`ONLINE (0 QUEUED)` / `OFFLINE (N QUEUED)` / `SYNCING...`) with instant manual sync trigger.
  - **Match Analytics Sub-Panel**: Responsive SVG charting container (`#matchChartContainer`) with kinetic toggle tabs (`📈 Worm Chart` and `📊 Manhattan Bars`).
  - **Scorecard Export Modal**: Accessible modal (`#modalScorecardExport`) with full batting scorecard, bowling analysis, CSV download (`downloadScorecardCsv()`), and printable match sheet (`printScorecardView()`).
  - **Dynamic Victory & Result Engine**: Live calculation comparing chasing score against target runs; automatically surfaces prominent athletic `#matchResultBanner` when the match reaches conclusion.
- [x] **Store Listing Readiness & Archive Documents Specification Integration (Phase 2C)**:
  - **Visual Store Assets**: Zero-dependency generator (`scripts/generate-store-assets.mjs`) emitting valid PNGs matching exact specifications: Apple App Store icon (1024x1024, 24-bit RGB without alpha), Google Play adaptive icon (512x512, 32-bit RGBA), background icon (512x512), mobile splash (1242x2436), feature graphic (1024x500), and favicon (48x48).
  - **Apple Privacy Manifest (`PrivacyInfo.xcprivacy`)**: Fully compliant with WWDC 2024 privacy requirements (`NSPrivacyTracking: false`, user defaults `CA92.1`, boot time `35F9.1`, file timestamp `C617.1`, disk space `E174.1`).
  - **Store Metadata & Legal Declarations**: Complete listing metadata in `apps/mobile/store/apple/metadata.json` and `apps/mobile/store/google/metadata.json` (Target SDK 34), Google Play Data Safety declaration in `data-safety.json`, and comprehensive legal documents (`PRIVACY_POLICY.md`, `TERMS_OF_SERVICE.md`).
  - **In-App Account Deletion Compliance**: Conforms strictly to Apple Review Guideline 5.1.1(v) and Google Play user data policies, featuring in-app modal triggers and dedicated web portal with immediate, irreversible PII deletion.
  - **Archive Documents Functional Integration**:
    - *Event Basket & Operational Readiness (`event-basket.ts`)*: 0–100% readiness calculation, missing critical checklist items tracking, and turf/umpire/ball booking status.
    - *Official Match Control & Toss Management (`match-control.ts`)*: MCC Law 1.3 toss recording with pitch condition and Bat/Bowl decisions, innings team resolution, and Duckworth-Lewis-Stern (DLS) rain-revised target mathematics.
    - *Umpire & Official Assignment Desk (`official-desk.ts`)*: Assignment card workflow (`ASSIGNED` -> `ACCEPTED` -> `CHECKED_IN` -> `COMPLETED`) with escrow disbursement protection.
    - *Post-Match 5-Star Dimensional Ratings (`ratings-modal.ts`)*: Multi-dimensional feedback for Pitch Condition, Umpire Fair Play, and Scorer Reliability with Bayesian rating engine integration.
    - *Tournament Player Leaderboards (`leaderboards.ts`)*: Orange Cap (Batting) and Purple Cap (Bowling) leaderboards with runs, strike rate, wickets, and economy metrics.
- [x] **Advanced UX, Storefront & Operational Governance (Phase 2D)**:
  - **In-App Notification Center Drawer (`notifications-drawer.ts`, UX-025, COM-001..010)**:
    - Slide-over notification drawer with active category filters (`MATCH`, `FINANCIAL`, `TRUST`, `SYSTEM`).
    - Unread badge counters (`🔔 3 unread`) and 1-click batch read actions.
    - Deep linking to relevant console tabs (`scoring`, `marketplace`, `incidents`).
  - **Event Basket Resource Procurement Modal (`#modalEventBasket`, UX-008, BAS-001..015)**:
    - Detailed line-item breakdown of match sporting requirements (Turf Arena, Lead Umpire, Match Balls, Digital Scorer).
    - Real-time double-entry escrow commercial breakdown (Subtotal, 5% Platform Fee, 18% GST, Total Escrow Deposit).
    - 1-click escrow locking action with instant toast feedback.
  - **Provider Storefront & Capacity Manager Modal (`provider-storefront.ts`, UX-018, MKT-001..020)**:
    - Financial earnings breakdown (Gross Revenue, Net Disbursed, Escrow Hold, Fee deductions).
    - Interactive slot management with instant block/unfreeze toggling.
    - Live publication form adding new hourly match slots with floodlight flags into search index.
  - **Admin Operations & Settlement Audit Desk (`admin-desk.ts`, UX-027, ADM-001..020)**:
    - Full 5-account Chart of Accounts balance integrity meter (`ESCROW_HOLD`, `PROVIDER_PAYABLE`, `PLATFORM_FEE`, `TAX_GST_PAYABLE`, `REFUND_CLEARING`) with verified 0 INR imbalance.
    - Administrative dispute arbitration queue with instant claim approval (balanced double-entry refund execution) or rejection (escrow payout release).
- [x] **Blueprint & FSD Feature Completion & Accessible Desk (`apps/web`, Phase 2E)**:
  - **Create Event Wizard (`create-event.ts`, UX-003, EVT-001..010)**:
    - 3-step event creation wizard with validation gates (Format -> Teams/Officials -> Review/Basket).
    - Multi-format configuration: T20, ODI, TEST, CUSTOM overs (5–50), ball type, powerplay overs, and estimated duration.
    - Mandatory officials procurement (Lead Umpire, Leg Umpire, Official Scorer) and automatic event basket generation.
  - **Event Overview & Procurement Readiness (`event-overview.ts`, UX-004, EVT-011..020)**:
    - 6-stage lifecycle stepper (`DRAFT` -> `BASKET_HOLD` -> `CONFIRMED` -> `IN_PROGRESS` -> `COMPLETED` -> `SETTLED`).
    - Dynamic SVG readiness ring calculating procurement percentage with held items (50%) and booked items (100%).
    - Critical resource blocker detection surfacing unbooked mandatory services (Turf, Umpires, Match Balls).
  - **Official Availability Calendar (`official-calendar.ts`, UX-015, OFC-001..015)**:
    - 7-day weekly schedule grid (06:00–20:00) with conflict detection adhering to PostgreSQL GiST temporal exclusion semantics.
    - Pre-match (30 min), post-match (30 min), and travel buffer (60 min) rule configuration.
    - Status visualization for AVAILABLE, BOOKED, BLOCKED, and BUFFER slots.
  - **Match Contextual Messaging (`messaging.ts`, FSD §45, MSG-001..015)**:
    - Scoped communication threads (`MATCH`, `BOOKING`, `DISPUTE`) with participant typing and read receipts.
    - Interactive quote cards with accept/reject price negotiation workflows in integer minor units.
    - Quick-action operational chips (`Confirm Arrival`, `Inspect Pitch`, `Ready for Toss`, `Share Scorecard`).
    - Offline outbox queue with status tracking (`SENDING`, `SENT`, `DELIVERED`, `READ`).
  - **Booking Cancellation & Rescheduling Engine (`booking-lifecycle.ts`, Commercial §10-14, BKG-001..020)**:
    - 4-tier graduated cancellation refund bands (>48h: 100%, 24-48h: 75%, 12-24h: 50%, <12h: 0%).
    - Balanced double-entry refund journal entries (`REFUND_CLEARING` / `ESCROW_HOLD` / `PLATFORM_FEE_INCOME`).
    - Reschedule price difference calculator with 3-attempt lifetime guard.
    - Rain washout force-majeure claim handling (100% full refund across all held bookings).
    - Provider no-show reporting with 100% refund, 10% compensation credit, and -15 trust score reputation penalty.
  - **Financial Reconciliation Dashboard (`reconciliation.ts`, Commercial §17-18, REC-001..015)**:
    - Provider net payout formula: $\text{Gross} - 5\% \text{ Platform Commission} - 18\% \text{ GST on Fee}$.
    - Zero-drift integer minor calculation guaranteeing exact ledger reconciliation.
    - 5-account balance sheet summary (`ESCROW_HOLD`, `PROVIDER_PAYABLE`, `PLATFORM_FEE_INCOME`, `TAX_GST_PAYABLE`, `REFUND_CLEARING`).
    - Guarded payout disbursement validation (0 pending disputes required).
    - RFC 4180-compliant CSV settlement report export.
  - **Interactive Console Modal Desk (`apps/api/src/ui/dashboard.ts`)**:
    - Navigation pills for all Phase 2E workflows (`➕ Create Match`, `📋 Readiness`, `📅 Calendar`, `💬 Chat`).
    - 6 dedicated modal backdrops (`#modalCreateEvent`, `#modalEventOverview`, `#modalOfficialCalendar`, `#modalMessaging`, `#modalBookingLifecycle`, `#modalFinancialReconciliation`).
    - 100% WCAG 2.2 AA accessible `data-tooltip` annotations, backdrop click-to-close, and Escape key dismissal.

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
9. **Scoring Delivery Deduplication Invariant**: Every delivery event is idempotently processed across concurrent SSE broadcasts and HTTP responses using deterministic `event_id` / `client_event_id` keys.
10. **Store Compliance & Account Deletion Invariant**: All consumer-facing auth flows provide explicit persona assignment and in-app account deletion under Apple Guideline 5.1.1(v).
11. **Audit & Traceability Invariant**: Mutating API requests produce structured audit log events in `audit_events` and propagate correlation IDs in responses.
12. **Offline Outbox & Zero-Dependency SVG Invariant**: Scoring outbox queue persists pending deliveries offline in `localStorage` and synchronizes sequentially; analytics visuals (Worm & Manhattan charts) are generated strictly using pure SVG without external charting library dependencies to maintain single-file portability.
13. **Store Readiness & Privacy Invariant**: All store assets and privacy manifests comply strictly with Apple App Store (WWDC 2024 Privacy Manifest, 1024x1024 RGB 24-bit no alpha icon) and Google Play Store (Target SDK 34, Data Safety, In-App Account Deletion).
14. **Operational Governance Invariant**: Administrative dispute resolutions produce balanced double-entry refund journal entries; provider capacity slots enforce temporal GiST boundaries without overlap.
15. **Graduated Cancellation & Zero-Drift Financial Invariant**: Booking cancellations strictly enforce the 4-tier refund schedule (>48h: 100%, 24-48h: 75%, 12-24h: 50%, <12h: 0%); financial reconciliations use integer minor units with exact rounding parity ($P_{\text{net}} = G - \lfloor 0.05 G \rfloor - \lfloor 0.18 \times \lfloor 0.05 G \rfloor \rfloor$) guaranteeing zero imbalance across all 5 ledger accounts.

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
- [x] Phase 1X: Stitch Application Screen Architecture UI/UX Enhancement (Global Telemetry Shell & Screen Matrix)
- [x] Phase 1Y: Consumer Mobile App & App Store Packaging (`apps/mobile` Expo EAS, Complete User Journeys)
- [x] Phase 1Z: Technical Audit Remediation & Hardening (100% Remediated, Certified Production Ready)
- [x] Phase 2A: Complete Multi-Persona Web Frontend & Consumer Journeys (Teams, Studio, Wagon Wheel, Modals)
- [x] Phase 2B: Offline-First Match Scoring Outbox, Match Analytics (SVG Worm & Manhattan Charts) & Scorecard Export Engine
- [x] Phase 2C: Play Store & App Store Listing Readiness, Privacy Manifest, Store Assets, Archive Document Features (Toss, DLS, Ratings, Readiness, Cap Leaderboards)
- [x] Phase 2D: Advanced UX, Notification Center, Event Basket Modal, Provider Storefront & Admin Settlement Desk
- [x] Phase 2E: Blueprint & FSD Feature Completion: Create Event (UX-003), Event Overview (UX-004), Official Calendar (UX-015), Messaging (FSD §45), Booking Lifecycle (Commercial §10-14), Financial Reconciliation (Commercial §17-18)
- [x] **CricOS 1.0.0 Production & Mobile Store Release Milestone Achieved**



