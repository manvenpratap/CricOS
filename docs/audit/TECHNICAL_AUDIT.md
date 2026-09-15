# Cricket Platform — Technical Audit Report

**Date:** 2026-09-16  
**Auditor:** Lead Product Engineer (Phase 1N handover)  
**Scope:** Complete codebase audit across Phases 1A–1M + starter repository + master documentation package

---

## Executive Summary

The project contains **substantial architectural documentation and design work** but the **actual runnable implementation is far from production-ready**. The codebase exists as **13 separate phase snapshot directories**, not a single consolidated repository. Each phase is a standalone folder with its own `package.json`, overlapping/duplicated source files, and partial migrations. There is no git history, no CI/CD, no consolidated build, and no running application.

**Critical finding:** The starter repository (from the documentation package) contains the **canonical schema** (`0001_core.sql`, `0002_booking_conflict.sql`, `0003_seed.sql`) and the proper monorepo structure (`pnpm` workspace, separate packages for `domain`, `contracts`, `commercial`, `scoring`). The phase directories (1A–1M) were built as **incremental documentation-driven slices**, each containing only the new code for that phase, not an integrated application.

**Bottom line:** Before any feature work, the codebase must be consolidated into a single canonical repository, all migrations reconciled, and the application must actually compile and run against PostgreSQL.

---

## 1. What Currently Exists

### Repository Structure

| Item | Status |
|------|--------|
| Consolidated git repository | ❌ Does not exist — 13 separate phase directories |
| Single `package.json` / monorepo | ❌ Only Phase 1M has one (non-monorepo, `npm` not `pnpm`) |
| Starter repo (from docs zip) | ✅ Proper `pnpm` monorepo with `docker-compose.yml` |
| Core schema (`0001_core.sql`) | ✅ Comprehensive — 20+ tables with proper FKs, constraints, exclusion constraints |
| Phase migrations (0004–0015) | ⚠️ Exist but **not integrated** into one migration sequence |
| TypeScript source | ⚠️ ~2,950 lines across 158 files, mostly thin route/service slices |
| Domain packages | ⚠️ Starter has `domain`, `contracts`, `commercial`, `scoring`; phases ignore them |
| Tests | ⚠️ 13 unit test files, no integration tests that run against PostgreSQL |
| Documentation | ✅ Extensive — FSD, UX Blueprint, ERD, API contracts, ADRs (all `.docx`) |

### File Counts by Phase

| Phase | .ts files | .sql migrations | .test.mjs files | Total lines |
|-------|-----------|-----------------|-----------------|-------------|
| Starter repo | 5 | 3 | 0 | ~250 |
| 1A | 6 | 1 | 1 | ~120 |
| 1B | 5 | 1 | 0 | ~100 |
| 1C | 7 | 1 | 1 | ~180 |
| 1D | 8 | 1 | 1 | ~220 |
| 1E | 6 | 1 | 1 | ~180 |
| 1F | 6 | 1 | 1 | ~200 |
| 1G | 5 | 1 | 1 | ~140 |
| 1H | 7 | 1 | 1 | ~200 |
| 1I | 6 | 1 | 1 | ~180 |
| 1J | 6 | 1 | 1 | ~220 |
| 1K | 5 | 1 | 1 | ~180 |
| 1L | 11 | 2 | 2 | ~350 |
| 1M | 13 | 2 | 3 | ~380 |

---

## 2. What Compiles

| Component | Compiles? | Notes |
|-----------|-----------|-------|
| Phase 1M (`tsc`) | ✅ Reported PASS | Uses ambient `shims.d.ts` that declares `pg`, `http`, `Buffer` as `any` — this masks real type errors |
| Starter repo packages | ✅ Each compiles independently | Proper TypeScript with strict mode |
| Phases 1A–1L | ❌ Not independently compilable | No `tsconfig.json` in most, reference other phase files |
| Integrated build | ❌ No integrated build exists | Phases cannot be combined without major refactoring |

### Critical Type Safety Issue
Phase 1M uses `shims.d.ts` that redeclares core Node.js types as `any`:
```typescript
declare const process:any; declare const Buffer:any;
declare module 'pg' { const pg:any; export default pg; }
```
This means TypeScript compilation "passes" but provides **zero type safety** on database queries, HTTP handling, or any runtime values.

---

## 3. What Tests Pass

| Test File | Phase | Result | Notes |
|-----------|-------|--------|-------|
| `event.test.mjs` | 1A | ⚠️ Not runnable in isolation | Imports from phase dir structure |
| `availability.test.mjs` | 1C | ⚠️ Inline function testing only | Tests a hold-expiry function, not actual DB |
| `checkout.test.mjs` | 1D | ⚠️ Inline function testing only | Tests idempotency key generation |
| `settlement.test.mjs` | 1E | ⚠️ Inline function testing only | Tests fee allocation arithmetic |
| `trust.test.mjs` | 1F | ⚠️ Inline function testing only | Tests eligibility state machine |
| `scoring.test.mjs` | 1G | ⚠️ Inline function testing only | Tests delivery apply function |
| `tournament.test.mjs` | 1H | ⚠️ Trivial assertions | `assert.notEqual("TEAM_A","TEAM_A")` — always fails |
| `formats.test.mjs` | 1I | ✅ Meaningful | Round-robin fixture generation |
| `operations.test.mjs` | 1J | ✅ Meaningful | Dashboard readiness, conflict detection |
| `ranker.test.mjs` | 1K/1L/1M | ✅ Meaningful | Provider ranking logic |
| `replacement-acceptance.test.mjs` | 1L/1M | ⚠️ Not a real test | Runs assertions at module level, no `test()` wrapper |
| `phase1m-validation.test.mjs` | 1M | ✅ Meaningful | File-content validation tests |

### Test Coverage Assessment
- **No integration tests** run against PostgreSQL
- **No API endpoint tests** — routes are never HTTP-tested
- **No concurrency tests** — critical for booking/holds
- **No scoring golden corpus** — only 3 basic delivery tests
- Tournament test (1H) contains a **bug**: `assert.notEqual("TEAM_A","TEAM_A")` will always fail

---

## 4. What Tests Fail

| Test | Issue |
|------|-------|
| `tournament.test.mjs` (Phase 1H) | `assert.notEqual("TEAM_A","TEAM_A")` — assertion is logically broken |
| Tests importing from `../../dist/` | Will fail if `dist/` not built first |
| Cross-phase test imports | Relative paths assume specific directory nesting |

---

## 5. What Cannot Currently Be Executed

| Item | Reason |
|------|--------|
| API server | No consolidated server; Phase 1M only exposes 5 routes (health, replacement search, proposals, accept, incidents) |
| Database migrations | Not runnable — the 13 migration files are scattered across separate phase directories |
| Webhook processing | Placeholder only — no signature verification, no real provider |
| Payment flow | Sandbox adapter exists (Phase 1D) but not wired to any consolidated server |
| Booking flow | Service code exists in Phase 1E but not integrated into any running API |
| Scoring engine | Starter package has basic `applyDelivery`; Phase 1G has thin route stubs; no running scoring server |
| Tournament operations | Phase 1H/1I services exist but not wired into any server |
| Authentication | Does not exist — no auth middleware anywhere |
| Mobile/Web app | Does not exist |

---

## 6. Database Migration Status

### Intended Migration Sequence

| Migration | Source | Creates | Status |
|-----------|--------|---------|--------|
| `0001_core.sql` | Starter repo | 20+ core tables (users, teams, events, matches, bookings, payments, etc.) | ✅ Well-designed |
| `0002_booking_conflict.sql` | Starter repo | GiST exclusion constraints for booking/hold overlap prevention | ✅ Critical safety constraint |
| `0003_seed.sql` | Starter repo | Placeholder (uses seed script) | ✅ |
| `0004_phase1a.sql` | Phase 1A | Indexes on events, memberships, requirements | ✅ Additive |
| `0005_phase1b.sql` | Phase 1B | Indexes on events, match_teams, outbox | ✅ Additive |
| `0006_phase1c.sql` | Phase 1C | Indexes on listings, slots, holds, bookings | ✅ Additive |
| `0007_phase1d.sql` | Phase 1D | `orders`, `order_items`, `payment_intents`, `payment_webhook_events` | ⚠️ Creates tables that partially duplicate starter `orders`/`payments` |
| `0008_phase1e.sql` | Phase 1E | `settlement_entries`, booking no-overlap index, `order_buyer_user_id` function | ⚠️ Adds columns, function |
| `0009_phase1f.sql` | Phase 1F | `disputes`, `dispute_evidence`, `payout_batches`, `payout_items`; adds provider trust columns | ✅ |
| `0010_phase1g.sql` | Phase 1G | `score_events`, `ratings`; adds match completion columns | ✅ |
| `0011_phase1h.sql` | Phase 1H | `tournaments`, `tournament_teams`, `fixtures`, `tournament_requirements`, `fixture_requirement_allocations` | ✅ |
| `0012_phase1i.sql` | Phase 1I | `fixture_templates`; adds fixture result/reschedule columns | ✅ |
| `0013_phase1j.sql` | Phase 1J | `fixture_reschedule_attempts`, `fixture_resource_status`, `notification_jobs` | ✅ |
| `0014_phase1k.sql` | Phase 1K | `replacement_proposals`; adds provider intelligence columns | ✅ |
| `0015_phase1l.sql` | Phase 1L | `service_incidents`, `provider_reputation_events`; extends proposals/bookings | ✅ |

### Schema Inconsistencies

1. **P0 — Duplicate `orders` table:** Starter repo creates `orders` with `fee_minor`, `tax_minor`, `discount_minor`, `policy_snapshot`. Phase 1D creates a simpler `orders` with `basket_id`, `subtotal_minor`, `total_minor`, `checkout_idempotency_key`. These are **incompatible schemas**.

2. **P0 — Duplicate `bookings` schema assumptions:** Starter has `bookings` with `suborder_id` and `cancellation_policy_snapshot`. Phase migrations assume a simpler `bookings` without these columns. Phase 1L adds `replaced_booking_id`, `provider_id_snapshot`, etc.

3. **P1 — `order_items` vs `order_suborders`:** Starter uses `order_suborders` per-provider; Phase 1D uses `order_items` per-listing. Different commercial models.

4. **P1 — `payment_intents` vs `payments`:** Starter creates `payments` table. Phase 1D creates `payment_intents`. Different naming, different columns.

5. **P2 — Duplicate migration files:** `0014_phase1k.sql` and `0015_phase1l.sql` are duplicated across Phase 1K, 1L, and 1M directories (identical content in most cases, with 1M having minor additions).

6. **P2 — Missing FK on several Phase tables:** `replacement_proposals` references `bookings(id)` but `provider_id` and `listing_id` have no FK. Intentional flexibility or oversight.

---

## 7. API Inconsistencies

| Issue | Priority |
|-------|----------|
| Phase 1M server only exposes 5 routes; phases 1A–1L routes are not integrated | P0 |
| No versioned API contract enforcement — routes are handwritten HTTP handlers | P1 |
| No request validation middleware | P0 |
| No authentication/authorization middleware | P0 |
| Body parsing is done ad-hoc in each route file | P1 |
| Error responses are inconsistent across phases | P2 |
| No pagination, filtering, or query parameter handling | P1 |
| No CORS, rate limiting, or security headers | P0 |

---

## 8. Architectural Inconsistencies

| Issue | Priority | Notes |
|-------|----------|-------|
| No consolidated repository | P0 | Must merge 13 phase dirs + starter into one |
| Phase 1M ignores monorepo packages | P0 | `domain`, `contracts`, `commercial`, `scoring` packages from starter are unused |
| `shims.d.ts` masks all type errors | P0 | Every external type is `any` |
| Each phase has its own `main.ts` | P1 | 10+ server entry points, each with different routes |
| No dependency injection or service composition | P1 | Direct imports with tight coupling |
| No configuration management | P0 | Only `process.env.DATABASE_URL` |
| No middleware pattern | P1 | Auth, logging, error handling all manual |
| No outbox consumer/worker | P1 | Table exists but no processing |
| `pnpm` in starter vs `npm` in Phase 1M | P2 | Package manager inconsistency |

---

## 9. Security Gaps

| Gap | Priority |
|-----|----------|
| **No authentication** — no auth middleware, no session handling, no JWT/token | P0 |
| **No authorization** — no RBAC enforcement, no object-level access control | P0 |
| **No input validation** — request bodies parsed with `JSON.parse()`, no schema validation | P0 |
| **No rate limiting** | P0 |
| **No CSRF/XSS protection** | P0 |
| **No SQL injection protection** — uses parameterized queries (good) but no input sanitization | P1 |
| **No webhook signature verification** — payment webhook handler is a stub | P0 |
| **No secrets management** — database URL is only config | P0 |
| **No audit logging middleware** — `audit_events` table exists but nothing writes to it | P1 |
| **No encryption at rest/in transit configuration** | P1 |
| **Fixed OTP guard** exists in Phase 1M tests (good) but no real OTP implementation | P0 |

---

## 10. Production Blockers (P0)

| # | Blocker | Impact |
|---|---------|--------|
| 1 | No consolidated repository | Cannot build or deploy |
| 2 | Schema conflicts between starter and phase migrations | Cannot run migrations |
| 3 | No authentication/authorization | Cannot expose to any user |
| 4 | No real payment provider integration | Cannot process money |
| 5 | No input validation | Security vulnerability |
| 6 | No API route integration (only 5 of 40+ needed routes exist) | Most features unreachable |
| 7 | `shims.d.ts` destroying type safety | Hidden bugs |
| 8 | No CI/CD pipeline | Cannot deploy reliably |
| 9 | No environment configuration | Cannot run in staging/production |
| 10 | No mobile or web application | No user-facing product |

---

## 11. Technical Debt

| Item | Priority |
|------|----------|
| All service code uses raw SQL strings — should use query builder or at minimum a repository pattern | P2 |
| No error types/hierarchy — all errors are `new Error(string)` | P2 |
| Minified/single-line code style in most services | P3 |
| No logging framework | P1 |
| No request correlation IDs | P1 |
| HTTP server is raw `node:http` — no framework | P1 |
| No graceful shutdown handling | P2 |
| No health check beyond `{status:'ok'}` | P2 |
| No database connection pooling configuration | P2 |

---

## 12. Duplicate Implementations

| Item | Locations |
|------|-----------|
| `main.ts` (server entry) | Phase 1A, 1B, 1C, 1D, 1E, 1F, 1G, 1H, 1I, 1J, 1K, 1L, 1M |
| `db.ts` (pg pool) | Phase 1B, 1C, 1D, 1E, 1M |
| `http.ts` (HTTP helpers) | Phase 1A, 1M |
| `ranker.ts` | Phase 1K, 1L, 1M (identical) |
| `replacement/service.ts` | Phase 1K, 1L, 1M (1L/1M identical) |
| `provider-intelligence/service.ts` | Phase 1K, 1L, 1M (identical) |
| Migration `0014_phase1k.sql` | Phase 1K, 1L, 1M |
| Migration `0015_phase1l.sql` | Phase 1L, 1M |
| `ranker.test.mjs` | Phase 1K, 1L, 1M |

---

## 13. Dead Code

| Item | Notes |
|------|-------|
| `dist/` directory in Phase 1M | Build output committed alongside source |
| `_HISTORICAL_PHASE_ZIPS/` directory | Contains zip archives of earlier phases |
| Earlier phase `main.ts` files | Each superseded by the next phase |
| `order_buyer_user_id()` SQL function (Phase 1E) | Helper function noted as "replace with direct join" |

---

## 14. Placeholder Integrations

| Integration | Current State |
|-------------|---------------|
| Payment gateway | `sandbox.ts` returns fake success — no real provider adapter |
| SMS/OTP | Does not exist |
| Email | Does not exist |
| Push notifications | Does not exist |
| Object storage | Does not exist |
| CDN | Does not exist |
| Maps/geolocation | Does not exist |
| KYC/verification | Does not exist |
| Payout provider | Does not exist |
| Analytics | Does not exist |
| Error monitoring | Does not exist |
| Search/Elasticsearch | Does not exist |

---

## 15. Missing Infrastructure

| Component | Status |
|-----------|--------|
| Docker Compose | ✅ Exists in starter (PostgreSQL + Redis) |
| Dockerfile for API | ❌ |
| CI/CD pipeline (GitHub Actions, etc.) | ❌ |
| Staging environment configuration | ❌ |
| Production environment configuration | ❌ |
| Kubernetes/deployment manifests | ❌ |
| Load balancer / reverse proxy config | ❌ |
| Backup/restore scripts | ❌ |
| Monitoring/alerting configuration | ❌ |
| Log aggregation | ❌ |

---

## 16. What Works Well

Despite the significant gaps, the following aspects are strong:

1. **Schema design** — The core schema (`0001_core.sql`) is well-designed with proper FKs, check constraints, GiST exclusion constraints for double-booking prevention, and audit tables.

2. **Domain understanding** — The documentation demonstrates deep cricket domain knowledge: event-sourced scoring, tournament format handling, booking invariants, settlement rules, and provider reputation.

3. **Architectural decisions** — ADRs are well-reasoned: advisory search with authoritative holds, event-sourced reputation, production integration gates.

4. **Transactional patterns** — The `withTransaction` helper and `SELECT ... FOR UPDATE` usage shows understanding of concurrency.

5. **Commercial model** — Integer minor units for money, immutable settlement entries, payout eligibility gates.

6. **Provider ranking** — The ranker with weighted multi-factor scoring (reliability, distance, price, rating) is algorithmically sound.

7. **Reputation system** — Damped Bayesian update with replay guard prevents duplicate application.

---

## 17. Recommended Remediation Priority

### Immediate (Phase 1N — Weeks 1-2)

| Priority | Action |
|----------|--------|
| P0-1 | **Consolidate into single canonical repository** using starter repo as base |
| P0-2 | **Reconcile all migrations** into coherent sequence (0001–0015) |
| P0-3 | **Remove `shims.d.ts`** and fix real TypeScript types |
| P0-4 | **Integrate all service code** into the monorepo structure |
| P0-5 | **Run migrations against real PostgreSQL** and verify schema |
| P0-6 | **Add proper build/test/lint scripts** |
| P0-7 | **Stand up Docker Compose** development environment |

### Short-term (Phase 1N-1O — Weeks 2-4)

| Priority | Action |
|----------|--------|
| P0-8 | **Add authentication middleware** (JWT + refresh tokens) |
| P0-9 | **Add input validation** (Zod or similar) |
| P0-10 | **Add request/response logging** with correlation IDs |
| P0-11 | **Integrate all API routes** into one server |
| P0-12 | **Write integration tests** against PostgreSQL |
| P1-1 | **Add error handling middleware** with typed errors |
| P1-2 | **Add RBAC middleware** |

### Medium-term (Phase 1P-1Q — Weeks 4-8)

| Priority | Action |
|----------|--------|
| P0-13 | **Integrate real payment provider** (Razorpay adapter) |
| P0-14 | **Webhook signature verification** |
| P1-3 | **Complete scoring engine** with golden test corpus |
| P1-4 | **Settlement and payout flow** |
| P1-5 | **CI/CD pipeline** |
| P1-6 | **Staging environment** |

### Long-term (Phase 1R+ — Weeks 8+)

| Priority | Action |
|----------|--------|
| P1-7 | **Mobile application** |
| P1-8 | **Web admin console** |
| P2-1 | **Observability stack** |
| P2-2 | **Load testing** |
| P2-3 | **Security audit** |

---

## Appendix A: Starter Repository Schema (Canonical Baseline)

The starter repo's `0001_core.sql` creates these tables (the intended production schema foundation):

| Table | Purpose |
|-------|---------|
| `users` | User accounts |
| `user_roles` | Role assignments |
| `teams` | Cricket teams |
| `team_memberships` | Team roster |
| `locations` | Physical locations |
| `venues` | Cricket venues |
| `providers` | Service providers |
| `listings` | Provider service listings |
| `availability_rules` | Weekly availability patterns |
| `service_slots` | Bookable time slots |
| `events` | Matches and other events |
| `matches` | Cricket match details |
| `match_teams` | Teams in a match |
| `event_requirements` | Resource requirements |
| `event_baskets` | Aggregated event requirements |
| `basket_items` | Individual basket line items |
| `inventory_holds` | Temporary slot holds |
| `orders` | Purchase orders |
| `order_suborders` | Per-provider sub-orders |
| `bookings` | Confirmed slot bookings |
| `payments` | Payment records |
| `outbox_events` | Transactional outbox |
| `audit_events` | Audit trail |

---

## Appendix B: Identified ADRs

| ADR | Decision |
|-----|----------|
| ADR-018 | Provider ranking is advisory (never bypasses transactional authority) |
| ADR-019 | Replacement preserves incident history (original booking immutable) |
| ADR-020 | Replacement acceptance is authoritative (transactional re-validation) |
| ADR-021 | Reputation is an event-sourced projection (damped, replayable) |
| ADR-022 | Production integration validation gate (compile + test before staging) |
