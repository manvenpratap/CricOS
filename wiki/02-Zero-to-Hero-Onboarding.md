# 02 — Zero-to-Hero Onboarding Guide

> **Target Audience**: New Engineers, Full-Stack Developers, QA Automation Engineers, Open-Source Contributors.

---

## Part I: Technology Foundations

CricOS is built on a high-velocity TypeScript + Native Hybrid stack:
1. **Node.js & Fastify (`apps/api`)**: High-throughput HTTP & WebSocket server with native TypeScript execution (`--experimental-strip-types`).
2. **PostgreSQL 16 (`migrations/0001` – `0019`)**: Relational store utilizing `btree_gist` for time-range slot exclusion and double-entry ledger accounting.
3. **Three.js + Custom 2D Perspective Projection (`dashboard.ts` & `mobile-view.ts`)**: Dual-mode 60fps 3D rendering for the Cricket Stadium, Trophy Cabinet, Holographic Player Cards, and 3D Bat Configurator.
4. **Native Android (Java 17 / Gradle 8.5 / SDK 33) & iOS (SwiftUI / WebKit)**: Native mobile shells embedding the offline-capable CricOS mobile bundle with native haptic, share, and SQLite outbox bridges.

---

## Part II: Codebase Navigation & Directory Map

```text
CricOS/
├── apps/
│   ├── api/
│   │   └── src/
│   │       ├── main.ts                 # Fastify API server & route registration
│   │       └── ui/
│   │           ├── dashboard.ts        # Desktop Web Console (Match Center, 3D, Weather, Gear Store)
│   │           └── mobile-view.ts      # Mobile & Native APK App (8 Personas, Sidebar, 3D, Gear Store)
│   └── mobile/
│       ├── android/                    # Native Android Gradle project -> dist/cricos-debug.apk
│       └── ios/                        # Native iOS SwiftUI + WKWebView project
├── migrations/                         # 19 sequential PostgreSQL schema migrations
├── scripts/
│   └── package-dist.mjs                # Production distribution packager & SHA-256 verifier
├── dist/                               # Verified build artifacts (index.html, mobile.html, cricos-debug.apk)
├── tests/                              # 5 Consolidated Node Domain Suites + 70 Playwright E2E Suites
├── wiki/                               # Official GitHub Wiki documentation pages
└── pipeline.sh                         # Universal build, test, package, APK & release pipeline
```

---

## Part III: Developer Workflow (`./pipeline.sh`)

CricOS enforces a **Minimal Tokens & Verified Release Protocol** via `./pipeline.sh`:

```bash
# 1. Start or reload the local server on http://localhost:3000
./pipeline.sh package

# 2. Run the 185 consolidated Node domain tests in low-token summary mode
./pipeline.sh test --summary

# 3. Compile the Android APK (requires Java 17 & Android SDK)
./pipeline.sh apk

# 4. Run full verified release (test -> package -> apk -> commit -> push)
./pipeline.sh ship "feat(module): concise summary of change"
```

---

## Appendix: CricOS Domain Glossary

| Term | Definition in CricOS |
| :--- | :--- |
| **`allowedPersonas`** | Array of role identifiers (`['CAPTAIN', 'PLAYER']`, etc.) provisioned to a user account during Stage 2 Login (`dashboard.ts:19940`). |
| **`strictPersonaLock`** | Security guard preventing a logged-in account from switching into any persona outside its `allowedPersonas` entitlement. |
| **Clean Focus Mode** | Default decluttered workspace mode (`desktopCleanFocusMode = true` / `cleanFocusMode = true`) that scopes toolbars to 1–3 persona-relevant actions and tucks secondary telemetry into expandable drawers. |
| **True OFF-SIDE / ON-SIDE Invariant** | Cricket geometric rule where `Cover`, `Point`, `Third Man`, `Long Off` are always `OFF-SIDE` and `Fine Leg`, `Square Leg`, `Mid-Wicket`, `Long On` are always `ON-SIDE`, while their physical Left/Right pitch coordinates mirror when switching between `RHB` and `LHB`. |
| **GiST Hold** | A 15-minute PostgreSQL `TSTZRANGE` reservation lock preventing overlapping turf slot bookings during checkout. |
| **Pavilion Drop** | Express 45-minute match-day gear delivery from the CricOS Pro Gear Store directly to the selected stadium's umpire/scorer desk or dugout. |
