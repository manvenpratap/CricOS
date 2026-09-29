# 07 — REST API Reference, PostgreSQL Schema & Regression Suite

---

## 1. Core Fastify REST API Endpoints (`apps/api/src/main.ts`)

| Method & Route | Domain | Description |
| :--- | :--- | :--- |
| `POST /api/v1/auth/otp/request` & `/verify` | Identity & RBAC | Passwordless OTP session creation, refresh token rotation, and `allowedPersonas` provisioning |
| `POST /api/v1/matches/:id/deliveries` | Scoring Engine | Idempotent ball-by-ball delivery ingestion, strike rotation, NRR & DLS par recalculation |
| `GET /api/v1/matches/:id/cricsheet` | Federation Export | Official Cricsheet v1.0.0 JSON & Federation XML match export |
| `POST /api/v1/marketplace/slots/:id/hold` | Turf & Officials | 15-minute PostgreSQL `btree_gist` `TSTZRANGE` reservation lock |
| `POST /api/v1/commerce/promo/apply` | Gear & Commerce | Promo code validation (`CRIC20`, `TURF500`, `CAPTAIN10`) and 18% GST invoice calculation |
| `GET /metrics` & `GET /docs` | Observability | Prometheus metrics exposition and interactive OpenAPI 3.0 Swagger showcase |

---

## 2. Consolidated Regression Test Architecture (`tests/`)

All tests execute via `./pipeline.sh test --summary` (`185 passed, 0 failed` in `<500ms`) plus **70 Playwright End-to-End Suites** (`tests/test_54_*.py` through `tests/test_70_*.py`):

| Suite | Scope |
| :--- | :--- |
| `tests/domain-scoring-and-match-ops.test.ts` | Match lifecycle, DLS, Umpire DRS, Cricsheet export, Command Palette & 11-Fielder Radar (`23 tests`) |
| `tests/domain-commerce-tournaments-and-marketplace.test.ts` | GiST turf booking, escrow ledger, GST invoicing, RFQ & sponsorship auctions (`31 tests`) |
| `tests/domain-identity-personas-and-themes.test.ts` | 8-persona RBAC matrix, WCAG AAA contrast engine, hover-delayed tooltips & themes (`35 tests`) |
| `tests/domain-mobile-journeys-and-native.test.ts` | `StandaloneMobileApp`, Android/iOS native bridges & Mobile 3D viewports (`33 tests`) |
| `tests/domain-3d-stadium-and-visual-graphics.test.ts` | Three.js WebGL pitch, 8 camera presets, floodlight states & Sonner toasts (`36 tests`) |
| `tests/test_68_toast_dedup_and_mobile_sidebar_light_theme_contrast.py` | RHB/LHB toast deduplication & mobile light-theme WCAG AAA contrast (`2 E2E tests`) |
| `tests/test_69_intelligent_venue_weather_and_forecast.py` | 5-stadium GPS micro-climate weather & 5-hour match window forecast (`2 E2E tests`) |
| `tests/test_70_pro_gear_store_and_checkout.py` | Desktop & Mobile Pro Cricket Gear Store catalog, variants, promo codes & pavilion checkout (`2 E2E tests`) |
