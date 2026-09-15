# 🏏 CricOS — Unified Cricket Operating System

<div align="center">

[![Tests](https://img.shields.io/badge/tests-52%20passing-10B981.svg?style=for-the-badge&logo=pytest)](https://github.com/manvenpratap/CricOS)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%205.8-3178C6.svg?style=for-the-badge&logo=typescript)](https://github.com/manvenpratap/CricOS)
[![Fastify](https://img.shields.io/badge/Fastify-4.28-000000.svg?style=for-the-badge&logo=fastify)](https://github.com/manvenpratap/CricOS)
[![Node.js](https://img.shields.io/badge/Node.js-22%20%7C%2024-339933.svg?style=for-the-badge&logo=node.js)](https://github.com/manvenpratap/CricOS)
[![MCC Laws](https://img.shields.io/badge/MCC%20Laws-Compliant-F59E0B.svg?style=for-the-badge)](https://github.com/manvenpratap/CricOS)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

**A high-performance, modular operating system powering cricket tournaments, certified official & venue marketplaces, MCC Laws ball-by-ball scoring, real-time live match broadcasting, and double-entry financial settlements.**

[Interactive Console](http://localhost:3000/) • [Architecture](#-architecture--monorepo-structure) • [Core Subsystems](#-core-subsystems) • [API Modules](#-api-modules-reference) • [Getting Started](#-getting-started) • [Pipeline & Testing](#-pipeline--self-healing-workflow)

</div>

---

## 🌟 Overview

**CricOS** unites every stakeholder in the cricket ecosystem—tournament directors, team captains, players, certified match officials, ground owners, and fans—into a single, resilient platform:

- 🏆 **Tournament & Bracket Engine**: Automated round-robin and knockout fixture bracket scheduling, points table calculations, net run rate (NRR) tracking, and match rescheduling.
- 🏪 **Certified Provider Marketplace**: On-demand booking for cricket grounds, certified umpires, scorers, commentators, and live streamers with PostgreSQL GiST temporal exclusion constraints preventing double-bookings.
- 🏏 **MCC Laws of Cricket Scoring Engine**: Ball-by-ball event-sourced scoring machine enforcing official MCC Laws (striker rotation on odd runs & 6-ball over boundaries, bowler figures, maidens, extras accounting, and fall of wickets).
- ⚡ **Real-Time Live Match Broadcast (SSE)**: Channel-based Server-Sent Events pub/sub streaming match updates to scoreboards, web portals, and mobile apps with automatic keepalives.
- 💳 **Double-Entry Financial Settlement Ledger**: Integer minor-unit pricing with zero-sum balanced double-entry accounting ($\sum \text{Debits} \equiv \sum \text{Credits}$) for customer escrows, platform fees, GST taxes, dispute refunds, and provider payouts.
- 🛡️ **Cryptographic Security & RBAC**: HMAC-SHA256 zero-dependency JWT signing with timing-safe validation and strict role guards (`ADMIN`, `ORGANISER`, `CAPTAIN`, `PLAYER`, `PROVIDER`, `SCORER`).

---

## 🏗 Architecture & Monorepo Structure

CricOS is structured as a canonical, strictly-typed monorepo managed with **pnpm workspaces**:

```
CricOS/
├── apps/
│   ├── api/                    # Unified Fastify 4.x REST API & SSE Broadcast Server (26 modules)
│   ├── worker/                 # Outbox event publisher & 15-min inventory hold expiration worker
│   ├── web/                    # Organizer, scorer, and administration client portal (Next.js)
│   └── mobile/                 # Cross-platform captain, player, and live match client (React Native)
├── packages/
│   ├── contracts/              # Canonical shared DTOs, interfaces, and lifecycle status enums
│   ├── commercial/             # Fee/tax basis-point calculator & double-entry settlement ledger
│   ├── scoring/                # MCC Laws of Cricket state machine & 5-scenario golden corpus
│   └── domain/                 # Domain entity state transitions (Events, Matches, Teams, Incidents)
├── migrations/                 # Reconciled SQL migrations (0001_core.sql - 0015_incidents_reputation.sql)
├── scripts/                    # Transactional migration runner (migrate.mjs) & pilot seeder (seed.mjs)
├── tests/                      # In-memory pg-mem schema migration & deterministic seed test suite
├── pipeline.sh                 # Autonomous project doctor, low-token verification runner, & release gate
├── run_tests.sh                # Test bridge executing all workspace package test suites
├── PROJECT_CONTEXT.md          # Living working memory on disk
├── PRODUCT.md                  # Comprehensive product specifications
└── DESIGN.md                   # Dark-mode glassmorphic design tokens & principles
```

### Workspace Packages Summary

| Package | Path | Responsibility |
|---|---|---|
| `@cricket-platform/contracts` | `packages/contracts` | Canonical types, status enums, MoneyMinor representations, and API contracts. |
| `@cricket-platform/commercial`| `packages/commercial` | Fee calculations (5% basis points), GST tax (18%), and double-entry settlement ledger. |
| `@cricket-platform/scoring`   | `packages/scoring` | Official MCC Laws scoring engine, dynamic strike rotation, maidens, and bowler figures. |
| `@cricket-platform/domain`    | `packages/domain` | Entity lifecycle validators (Events, Matches, Teams, Incidents, Reputation). |
| `@cricket-platform/api`       | `apps/api` | Fastify REST API with 26 modules, JWT/RBAC middleware, and real-time SSE broadcast. |
| `@cricket-platform/worker`    | `apps/worker` | Outbox polling and background TTL hold expiration worker. |

---

## ⚙️ Core Subsystems

### 1. MCC Laws of Cricket Scoring Engine (`@cricket-platform/scoring`)
- **Batter Scorecards**: Tracks individual runs, balls faced, boundaries (4s & 6s), strike rate, and dismissal details.
- **Bowler Spell Figures**: Tracks legal overs/balls, maiden overs (zero runs conceded), runs conceded, wickets taken, and economy rate.
- **Dynamic Strike Rotation**:
  - Automatically swaps striker and non-striker on odd runs (1, 3, 5).
  - Automatically swaps strike at the completion of each 6-ball legal over (Law 18 & 21).
- **Extras Accounting**:
  - Wides & No-Balls add penalty runs and do **not** increment legal balls faced.
  - Byes & Leg Byes add team runs without charging the bowler's runs conceded column.
- **Golden Test Corpus**: 5 automated test scenarios in `packages/scoring/test/golden_corpus.test.ts` verifying official edge cases:
  1. *Maiden Over & End-of-Over Strike Rotation*
  2. *Strike Rotation across Singles, Boundaries, and Over Boundaries*
  3. *Extras Accounting & Invariants*
  4. *Bowler Wicket & Fall of Wickets (FOW) Tracking*
  5. *Non-Striker Run Out (bowler is not credited with wicket)*

### 2. Real-Time Live Match Broadcast Hub (`apps/api`)
- **Pub/Sub Channel Multiplexer**: `MatchBroadcastHub` manages isolated match subscription channels.
- **Server-Sent Events Stream**: `GET /api/v1/scoring/matches/:id/live` opens persistent SSE connection pushing initial state and real-time event updates:
  - `BALL_BOWLED`: Delivers ball details and updated innings state.
  - `OVER_COMPLETED`: Signals end of over and strike rotation.
  - `WICKET_FALLEN`: Broadcasts dismissal details and updated fall of wickets.
  - `INNINGS_CLOSED`: Signals target achieved or all wickets fallen.
- **Keepalive Heartbeats**: Sends automated `:keepalive\n\n` pings every 15 seconds to prevent reverse-proxy timeout disconnects.

### 3. Double-Entry Settlement Ledger (`@cricket-platform/commercial`)
All monetary calculations are performed in **integer minor units** (e.g. ₹3,500.00 = `350000`) to eliminate floating-point rounding errors.
- **Chart of Accounts**:
  - `ESCROW_HOLD`: Funds held in trust upon customer checkout payment.
  - `PROVIDER_PAYABLE`: Net earnings payable to grounds, umpires, and scorers.
  - `PLATFORM_FEE_INCOME`: CricOS platform service revenue.
  - `TAX_GST_PAYABLE`: GST collected on platform fees.
  - `REFUND_CLEARING`: Transit account for cancellations and dispute refunds.
- **Zero-Sum Balance Invariant**: Enforces $\sum \text{Debits} \equiv \sum \text{Credits}$ for every settlement or refund journal entry.

### 4. Marketplace Concurrency & GiST Exclusion (`migrations/0002_booking_conflict.sql`)
Prevents double-booking race conditions directly at the PostgreSQL storage engine level:
- Uses `btree_gist` extension with PostgreSQL `tsrange` types.
- Enforces GiST exclusion constraint on `(slot_id WITH =, time_range WITH &&)` for both confirmed bookings and temporary 15-minute inventory holds.

### 5. Interactive Operations Dashboard (`apps/api/src/ui/dashboard.ts`)
Accessible at `http://localhost:3000/` featuring:
- **Live Match Center**: Live SSE connection badge, current over ball strip (`[ • ] [ 1 ] [ 4 ] [ W ] [ 1wd ] [ 6 ]`), active batsmen scorecard, bowler spell figures, and interactive delivery buttons.
- **Marketplace & Booking**: Browse certified venues, calculate commercial snapshots, and simulate checkout with webhook processing.
- **Tournament Fixtures**: Generate round-robin or knockout schedules.
- **Incident & Reputation Management**: Emergency replacement provider matching and provider reliability scores.
- **Live API Explorer**: Execute live queries directly against all 26 Fastify routes.

---

## 🗄 Reconciled Database Migrations

All schema changes are versioned as strict, sequential migrations under `migrations/`:

| Migration | Description |
|---|---|
| [`0001_core.sql`](migrations/0001_core.sql) | Baseline schema: users, teams, events, listings, service slots, orders, order items, bookings, and payments. |
| [`0002_booking_conflict.sql`](migrations/0002_booking_conflict.sql) | GiST temporal exclusion constraints preventing overlapping bookings and inventory holds. |
| [`0003_seed.sql`](migrations/0003_seed.sql) | Pilot seed records. |
| [`0004_indexes_identity.sql`](migrations/0004_indexes_identity.sql) | Performance indexes for identity lookup and team memberships. |
| [`0005_indexes_transactional.sql`](migrations/0005_indexes_transactional.sql) | Outbox event queue and transactional indexes. |
| [`0006_indexes_marketplace.sql`](migrations/0006_indexes_marketplace.sql) | Marketplace category, pricing model, and slot availability indexes. |
| [`0007_indexes_checkout.sql`](migrations/0007_indexes_checkout.sql) | Order items and payment intent lookup indexes. |
| [`0008_settlement.sql`](migrations/0008_settlement.sql) | Financial settlement ledger entries table. |
| [`0009_trust_disputes.sql`](migrations/0009_trust_disputes.sql) | Dispute management, provider trust states, and payouts. |
| [`0010_scoring_ratings.sql`](migrations/0010_scoring_ratings.sql) | Score events idempotency and ratings with validation bounds. |
| [`0011_tournaments.sql`](migrations/0011_tournaments.sql) | Tournaments and tournament fixture schedules. |
| [`0012_fixture_templates.sql`](migrations/0012_fixture_templates.sql) | Reusable fixture templates. |
| [`0013_operations.sql`](migrations/0013_operations.sql) | Operations dashboard, reschedule tracking, and notification events. |
| [`0014_provider_intelligence.sql`](migrations/0014_provider_intelligence.sql) | Provider rating, reliability scores, and replacement proposals. |
| [`0015_incidents_reputation.sql`](migrations/0015_incidents_reputation.sql) | Service incidents lifecycle and event-sourced reputation event stream. |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v22.0.0 or v24.0.0+ (ESM native)
- **pnpm**: v9.15.0+
- **PostgreSQL**: v15+ (optional for live DB; offline in-memory fallback enabled by default)

### Installation & Build

```bash
# Clone the repository
git clone https://github.com/manvenpratap/CricOS.git
cd CricOS

# Install dependencies across all workspace packages
pnpm install

# Build all packages with strict TypeScript
pnpm -r build

# Verify zero TypeScript type errors
pnpm -r typecheck
```

### Running Tests

Execute the full 52-test automated regression suite:

```bash
# Token-efficient summary (Minimal Tokens Protocol)
./pipeline.sh test --summary

# Full multi-package test runner
pnpm test
```

### Running the API Server

```bash
# Start the API server on port 3000
pnpm start

# Or in development mode with experimental strip-types
pnpm dev
```

Open **[http://localhost:3000/](http://localhost:3000/)** in your browser to launch the Interactive Operations & Testing Console.

---

## 📡 API Modules Reference

All API routes are served under the `/api/v1` namespace:

| Module | Route Prefix | Key Endpoints | Description |
|---|---|---|---|
| **Identity** | `/api/v1/auth` | `POST /otp/request`, `POST /otp/verify`, `GET /me` | OTP auth, cryptographic JWT issuance, and user profile. |
| **Teams** | `/api/v1/teams` | `POST /`, `GET /:id`, `POST /:id/members` | Team squads, captain roles, and player roster management. |
| **Events** | `/api/v1/events` | `POST /`, `GET /:id`, `POST /:id/requirements` | Event creation, requirements specification, and lifecycle. |
| **Marketplace**| `/api/v1/marketplace` | `GET /listings`, `GET /listings/:id` | Certified grounds, umpires, and scorers catalog. |
| **Availability**| `/api/v1/availability` | `GET /slots`, `POST /holds` | Slot discovery and 15-minute authoritative inventory holds. |
| **Basket** | `/api/v1/basket` | `GET /`, `POST /items`, `DELETE /items/:id` | Pre-checkout item staging and hold validation. |
| **Checkout** | `/api/v1/checkout` | `POST /`, `GET /orders/:id` | Phase 1D order generation and fee/tax calculation. |
| **Payments** | `/api/v1/payments` | `POST /intent`, `POST /webhook` | Payment intents and HMAC-SHA256 webhook signature validation. |
| **Scoring** | `/api/v1/scoring` | `POST /matches/:id/events`, `GET /matches/:id/live` | Ball delivery scoring and Server-Sent Events live stream. |
| **Settlement** | `/api/v1/settlements` | `GET /`, `POST /process` | Double-entry financial settlement journal entries. |
| **Tournaments**| `/api/v1/tournaments` | `POST /`, `POST /:id/fixtures/generate` | Tournament brackets, fixtures, and standings tables. |
| **Incidents** | `/api/v1/incidents` | `POST /`, `GET /:id` | Operational incident tracking (no-shows, ground unplayable). |
| **Replacements**| `/api/v1/replacements` | `POST /propose`, `POST /:id/accept` | Automated emergency certified provider replacement. |
| **Reputation** | `/api/v1/reputation` | `GET /providers/:id`, `POST /events` | Event-sourced reliability score updates. |
| **Operations** | `/api/v1/operations` | `GET /dashboard`, `GET /metrics` | Platform-wide operational health and SLA metrics. |

---

## 🛡 Pipeline & Self-Healing Workflow

CricOS embeds an autonomous self-healing and release pipeline via `./pipeline.sh`:

```bash
# 1. Deep Invariant Audit (Stack, distribution, tooltips, git hygiene, docs)
./pipeline.sh doctor

# 2. Autonomous Self-Healing (Remediates discrepancies and generates missing assets)
./pipeline.sh heal

# 3. Minimal Tokens Test Verification
./pipeline.sh test --summary

# 4. Guarded Shipping Gate (Runs tests, builds, updates living docs, commits, and pushes)
./pipeline.sh ship "feat(scope): your descriptive conventional commit message"
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
