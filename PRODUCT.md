# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

1. **Club Captains & Squad Players**: Managing team availability, submitting official match lineups, analyzing individual batting/bowling KPIs, tracking career progression, and displaying verified athletic passports.
2. **Grassroots League Organizers & Tournament Directors**: Creating leagues and round-robin / knockout brackets, scheduling fixtures, assigning verified match officials, monitoring live tournament standings, and managing escrow settlements.
3. **Official Scorers & Umpires**: Operating pitch-side ball-by-ball match input with real-time MCC Law adherence, recording extras, dismissals, and maiden overs, resolving disputes, and filing official match reports.
4. **Service Providers (Turf Venues, Umpires, Scorers, Live Streamers)**: Listing availability slots, managing professional hourly/match rates, and receiving automated, double-entry financial settlements with zero booking collisions.
5. **Fans, Spectators & Club Community**: Following live ball-by-ball match feeds, wagon wheels, and worm telemetry curves with real-time broadcast excitement.

## Product Purpose

CricOS is the unified operating system for recreational, grassroots, club, and professional cricket ecosystems. It exists to eliminate fragmented spreadsheets, paper scorebooks, manual bank transfers, and scheduling disputes by unifying league governance, ball-by-ball official match scoring, instant provider booking, and double-entry financial settlement into a single, high-fidelity platform. Success means a grassroots match can be scheduled, scored to international MCC standards, settled without financial discrepancy, and experienced through professional broadcast-grade telemetry on any device.

## Positioning

CricOS is primarily the **Grassroots Club Management & Social Cricket League Community Hub**, uniquely powered by:
- **MCC Laws of Cricket Compliance Engine**: Deterministic ball-by-ball strike rotation, dismissal workflows, bowler figures, and extra runs accounting that recreational score apps routinely get wrong.
- **Double-Entry Financial Settlement Ledger**: Integer minor-unit mathematical accounting guaranteeing a zero-sum platform balance with automated platform fees, dispute escrows, and verifiable payouts.
- **Collision-Free Provider Marketplace**: PostgreSQL GiST temporal exclusion constraints preventing double-booking of grounds, umpires, and scorers.
- **Professional Broadcast Telemetry & WebGL 3D Tactical Analytics**: Interactive 3D Stadium pitch overlays, 360° wagon wheels, momentum worm curves, and holographic athletic cards that give amateur cricketers the dignity and statistical depth of international athletes.

## Operating Context

- **Pitch-Side Mobile Scoring**: Live match input conducted on handheld smartphones under direct outdoor sunlight, extreme temperatures, and intermittent or low-bandwidth cellular networks. Requires high-contrast daylight themes (Swiss Minimalist, Nordic Editorial) and offline resilience.
- **Desktop Pavilion & League Administration**: Tournament bracket creation, fixture calendar management, dispute arbitration, and financial ledger settlement auditing executed on desktop browsers by league directors and club treasurers.
- **Player Athletic Identity**: Amateur and semi-pro players reviewing personal stats, 3D holographic player cards, tactical radar charts, and situational splits on mobile and desktop after matches.

## Capabilities and Constraints

- **Single-File Distributable Parity**: Root `index.html` and `mobile.html` maintain 100% byte-for-byte parity with `dist/index.html` and `dist/mobile.html`.
- **Hybrid Native Wrapper Architecture**: Single-page web application packaged with native Android Gradle (SDK 35, Java 17, WebKit bridge) and iOS SwiftUI (WebKit bridge) shells for App Store / Play Store distribution.
- **Zero-Sum Accounting**: Integer minor-currency units across all ledger transactions with zero floating-point rounding errors.
- **Full Offline Scoring**: Local match state persistence and recovery across browser refreshes and connectivity interruptions.
- **No Third-Party Runtime Analytics**: No invasive trackers or unvetted external scripts in match operations.

## Brand Commitments

- **Tone & Identity**: Authoritative athletic precision, respectful of cricket's rich traditions and MCC laws, while modern, kinetic, and broadcast-energized.
- **Iconography**: Clean, mathematically consistent two-tone Iconsax SVG icon library; no raw emojis in buttons or headers.
- **Design Themes**: Floodlit Stadium Night (`data-theme="stadium"`), Swiss Minimalist (`data-theme="swiss"`), and Nordic Editorial (`data-theme="nordic"`).
- **Core Component Invariants**: Contextual help on 100% of interactive controls (`data-tooltip="..."`), accessible modal dialogs, and minimum 44px touch targets.

## Evidence on Hand

- Complete 253-test domain and scoring validation suite in `tests/domain-*.test.ts`.
- Comprehensive Playwright visual regression test suites in `tests/test_consolidated_*.py`.
- ISO/IEC 18004 scannable QR pairing engine in `apps/api/src/ui/qr-code.ts`.
- Android Release & Debug APK artifacts in `dist/cricos-release.apk` and `dist/cricos-debug.apk`.
- Real-time SSE live match simulation engine in `apps/api/src/ui/dashboard.ts` and `apps/api/src/ui/mobile-view.ts`.

## Product Principles

1. **Cricket Law Inviolability**: The laws of cricket (MCC/ICC) are never compromised for UI convenience; scoring mechanics reflect true cricket rules including legal bowler rotations, fall-of-wicket validation, and strike changes.
2. **Grassroots Dignity & Community Empowerment**: Amateur and recreational players receive the same statistical rigor, tactical depth, and aesthetic polish as international broadcast athletes.
3. **Double-Entry Financial Integrity**: Every commercial transaction, provider fee, and team escrow must balance to zero in the ledger; minor units prevent fractional penny drift.
4. **Field-Ready Resilience & Ergonomics**: Interfaces must perform reliably pitch-side under harsh direct sunlight, with instant feedback, zero accidental data loss, and thumb-friendly touch targets.
5. **Architectural Parity & Minimal Overhead**: Single-file distributable parity ensures offline accessibility and deployment simplicity without bloated micro-framework dependencies.

## Accessibility & Inclusion

- Adherence to WCAG 2.1 Level AA across desktop and mobile surfaces.
- High-contrast daylight surfaces for outdoor usability (≥ 4.5:1 text contrast for body; ≥ 3.0:1 for large display metrics).
- Minimum 44x44px touch target bounds on mobile interactive elements.
- Accessible contextual tooltips (`data-tooltip="..."`) and screen reader attributes (`aria-label`, `role="dialog"`, `aria-modal="true"`).
- Respect for vestibular motion sensitivity (`prefers-reduced-motion`) without destroying essential state-change cues.
