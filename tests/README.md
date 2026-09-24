# Test Coverage & Suite Map — CricOS

## Overview
Automated regression tests are executed via `./pipeline.sh test --summary` (routed through `run_tests.sh` to `pnpm test`).

## Test Suites & Modules
| Module / Workspace | Test File | Covered Capabilities |
| :--- | :--- | :--- |
| `packages/contracts` | `test/contracts.test.ts` | Shared schemas, DTOs, payload validation |
| `packages/scoring` | `test/scoring.test.ts` | MCC Laws scoring engine, strike rotation, bowling figures, maidens, single-ball undo, bowler rotation, free hit tracking, strike swap, innings close |
| `packages/domain` | `test/domain.test.ts` | Match status FSM, hold timeouts, points allocation, Bayesian ratings, trust transitions |
| `packages/commercial` | `test/ledger.test.ts` | Double-entry chart of accounts, zero-sum balancing, refund journals |
| `apps/api` | `test/api.test.ts` | Modular API route endpoints under `/api/v1` |
| `apps/api` | `test/auth.test.ts` | HMAC-SHA256 JWT tokens, RBAC roles (`ADMIN`, `ORGANISER`, `SCORER`, etc.) |
| `apps/api` | `test/payments.test.ts` | Gateway adapter, Razorpay HMAC webhook verification |
| `apps/api` | `test/broadcast.test.ts` | Real-time SSE live match broadcast hub, pub/sub multiplexer |
| `apps/api` | `test/reputation_pipeline.test.ts` | Bayesian ratings, circuit breaker slot freeze, dispute auto-refund, payout disbursement guards |
| `apps/api` | `test/production_hardening.test.ts` | Config guardrails, liveness/readiness probes, metrics telemetry, connection draining |
| `apps/web` | `test/web.test.ts` | Web client API, integer minor currency formatting, scoreboard chip rendering, commercial breakdown, trust badges |
| `apps/web` | `test/web_journeys.test.ts` | Multi-persona profiles, Playing XI squad rosters, Tactical scoring studio, 8-zone wagon wheel with batsman filtering & telemetry, round-robin fixtures |
| `apps/web` | `test/offline_and_analytics.test.ts` | Offline scoring outbox queue, RFC 4180 CSV scorecard export, printable HTML sheets, SVG Worm & Manhattan charts |
| `apps/web` | `test/archive_features.test.ts` | Archive features: Event Basket readiness meter, MCC Law 1.3 Toss & DLS rain rule, Official Desk, 5-star post-match rating, Orange/Purple Cap leaderboards |
| `apps/web` | `test/advanced_ux.test.ts` | Advanced UX: Notification Center drawer, Admin Desk & double-entry ledger audit, Provider Storefront & slot publisher |
| `apps/web` | `test/phase2e_features.test.ts` | Phase 2E Blueprint & FSD: Create Event Wizard (UX-003), Event Overview (UX-004), Official Calendar (UX-015), Contextual Messaging (FSD §45), Booking Lifecycle (Commercial §10-14), Financial Reconciliation (Commercial §17-18) |
| `apps/mobile` | `test/mobile.test.ts` | Mobile API client, offline queueing, session caching, live match controller, marketplace booking, career stats, teams lineup, incidents desk, admin ledger, tournaments stepper |
| Root | `tests/tournament-emulation.test.ts` | End-to-end synthetic tournament lifecycle, round-robin scheduling, NRR calculation, double-entry settlement verification |
| Root | `tests/operational-telemetry.test.ts` | Prometheus metrics text exposition, request latency histograms, event loop lag, OpenAPI 3.0 & /docs showcase |
| Root | `tests/distribution-packaging.test.ts` | Standalone distribution packaging, byte-for-byte HTML parity, release manifest hashes, Dockerfiles, App Store/Play Store compliance & visual assets, Floodlit Stadium Broadcast tokens |
| Root | `tests/migrations-and-seed.test.ts` | Schema reconciliation and database seed integrity (19 sequential migrations) |
| Root | `tests/23-sessions-and-consents.test.ts` | Identity Sessions, Refresh Tokens, Consents & Profile Updates |
| Root | `tests/24-officials-availability-desk.test.ts` | Officials Availability Desk, Rule-based Availability & Assignment Workflow |
| Root | `tests/25-match-lifecycle-and-sync.test.ts` | Match Lifecycle, Fixture Configuration, Timeline, Pause/Resume, Scoring Sync, Single-Ball Undo, Strike Swap, Bowler Rotation & Innings Close |
| Root | `tests/26-suborders-and-invoicing.test.ts` | Multi-Provider Basket Checkout, Suborders Breakdown, Order Cancellation & GST Invoicing |
| Root | `tests/27-conversations-and-admin-policies.test.ts` | Contextual Conversations, Notification Preferences & Admin Policy Desk |
| Root | `tests/28-rfq-and-commerce.test.ts` | RFQ & Quotes, Physical Commerce & Gear, Scorer & Media Marketplace, Promotional Coupons & Subsidy Ledger (P1-001, P1-002, P1-004, P1-005, P1-009, P1-012) |
| Root | `tests/29-tournament-ops-and-scheduling.test.ts` | Tournament Fixture Command Centre, Conflict Detection Engine, Readiness Percentage & Bulk Fixture Import (P1-006, P1-007) |
| Root | `tests/30-analytics-insights-and-fulfilment.test.ts` | Player of the Match (MVP) Impact Points, AI Match Narrative & Turning Points, Smart Recommendations, Broadcast Overlays, Provider Arrival OTP & 3-Party Sign-Off, Social Feed & Logistics (P1-008, P1-010, P1-011, P2-001, P2-002, P2-005, P2-007) |
| Root | `tests/31-sponsorship-auctions-and-p2-p3.test.ts` | Sponsorship Inventory & Pledges, Virtual Player Auction Bidding Engine, Weather-Triggered Rain Insurance, Academies, Dynamic Surge Pricing & Multi-Currency (P2-003, P2-004, P2-006, P2-008, P3-001, P3-002) |
| Root | `tests/32-role-based-access-control.test.ts` | Role-Based Access Control (RBAC), 8-Persona Matrix (Scorer, Captain, Fan, Player, Umpire, Admin, Organiser, Provider), Tab & Feature Gating, Fan Cheering Console, JWT Role Guards |
| Root | `tests/33-mobile-app-journeys.test.ts` | Multi-persona mobile app journeys (Captain, Player, Scorer, Fan, Umpire, Organiser, Turf Provider, Admin), interactive controls, tooltips & single-file release parity |
| Root | `tests/34-fan-scorecard-and-visualizations.test.ts` | Fan & spectator detailed scorecards (Innings 1/2, batting, bowling, extras, FoW, DNB), Match Center visualizations (Worm, Manhattan, Wagon Wheel, Partnerships), Fan Spectator Studio mode, mobile parity, tooltips (Rule 5), release packaging (Rule 6) |
| Root | `tests/35-persona-switching-and-profile-sync.test.ts` | Persona switching (Captain to Player, Scorer, Fan, Umpire, Admin, Organiser, Provider), real-time profile synchronization, topbar `#activePersonaBadge`, sidebar avatar/name/role, roster `YOU` badge, mobile sync, Rule 6 parity |

## Execution Protocol
```bash
# Minimal Tokens Protocol (MANDATORY)
./pipeline.sh test --summary
```
