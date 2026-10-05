---
target: apps/api/src/ui/dashboard.ts
total_score: 33
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
target_identity: "file:/Volumes/Study/Projects/CricOS/apps/api/src/ui/dashboard.ts"
target_fingerprint: "sha256:8739f271a5f4f0413517160b665e601da61a8ace767fd539c978ac0aa15c58b5"
target_path: /Volumes/Study/Projects/CricOS/apps/api/src/ui/dashboard.ts
timestamp: 2026-10-05T01-25-01Z
slug: apps-api-src-ui-dashboard-ts
---
# Impeccable Design Critique: CricOS Master Match Console & Mobile Scoring App

Method: dual-agent (A: 7b9b5c55-36d6-4b64-b019-35aa728f3ee1 · B: a98160c9-95f4-4c2d-a3dd-41eb021d048c)
Target: `apps/api/src/ui/dashboard.ts` & `apps/api/src/ui/mobile-view.ts`

### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|---|:---:|---|
| 1 | Visibility of System Status | 3.5 | Live scoreboard, over strip, and SSE are excellent; dual "Swap Strike" controls create mild ambiguity. |
| 2 | Match System / Real World | 3.5 | Authentic cricket law mechanics; minor law citation slip in bowler rotation modal (Law 21 vs Law 17.8). |
| 3 | User Control and Freedom | 3.0 | [⌘Z] and undo button work cleanly; lacks a multi-ball undo history log when rewinding multiple deliveries. |
| 4 | Consistency and Standards | 3.0 | Desktop scores instantly on keypress; mobile forces a modal wagon wheel picker on every single ball. |
| 5 | Error Prevention | 3.5 | Free Hit restrictions and All-Out lockouts are rock-solid; physical numpad keys lack rapid double-tap debounce. |
| 6 | Recognition Rather Than Recall | 3.5 | Two-tier dismissal cards and physical keycap badges minimize memory load; Tier 2 rare modes rely on text select. |
| 7 | Flexibility and Efficiency | 3.5 | Desktop expert hotkeys (0-6, W, Alt+1/2/3, Cmd+K) are fast; mobile extras buttons are tightly packed in one row. |
| 8 | Aesthetic and Minimalist Design | 3.0 | Stunning broadcast aesthetic, but default console suffers from cockpit clutter (momentum wave + gyroscope + pyro). |
| 9 | Error Recovery | 3.0 | Undo cleanly reverts state, but lacks an explicit descriptive confirmation toast detailing what was restored. |
| 10 | Help and Documentation | 3.5 | Built-in ICC Laws Rulebook and shortcut modal are great; lacks a 60-second orientation for rookie scorers. |
| **Total** | | **33.0 / 40** | **Band: GOOD (28–35)** |

### Design Specificity Verdict
- **LLM Assessment**: CricOS achieves authentic, out-of-distribution sports domain integrity. Genuine pitch geometry (22 yards, popping/bowling creases), 8-zone stance-aware wagon wheel with RHB/LHB inversion, ICC Clause 21.19 Free Hit restrictions, and two-tier dismissal taxonomy ensure it never feels like an interchangeable SaaS boilerplate.
- **Deterministic Scan**: 6 findings flagged by `impeccable detect`—all 6 are `overused-font` warnings for `Space Grotesk` and `Fraunces`. Both are sanctioned brand typography tokens explicitly approved in `DESIGN.md` and `PRODUCT.md` (100% false positives; 0 real anti-patterns).
- **Visual Overlays**: Headless browser inspection verified 0 page crashes, 0px horizontal overflow, and 7/7 core studio components active and visible across Desktop (1440px) and Mobile (390px).

### Overall Impression
CricOS is an exceptional, broadcast-grade sports operating system. The recent unifications (Master Match Console, Direct Numeric Scoring, and Two-Tier Dismissal sheets) have radically improved scoring velocity on desktop. The primary remaining friction is on mobile: an over-eager wagon wheel modal dialog interrupts every routine dot ball and single.

### What’s Working
1. **Uncompromising Cricket Law Inviolability**: Automated Free Hit disqualifications, over-boundary ball unwinding on undo, and strike rotation on odd runs eliminate amateur scoring disputes.
2. **Two-Tier Progressive Disclosure Dismissal Architecture**: The 4-card Tier 1 quick-select grid covers 95%+ of dismissals with zero cognitive overload, neatly tucking 8 rare rules into an accordion.
3. **Multi-Atmosphere Thematic Engineering**: Three purpose-built visual themes (Stadium Night for broadcast, Swiss Minimalist for outdoor daylight, and Nordic Editorial for traditional dignity).

### Priority Issues
- **[P1] Mobile Scoring Velocity Bottleneck: Mandatory Wagon Picker on Every Ball**:
  - *What*: Tapping any run button on mobile opens `wagonPickerSheet`, demanding 2 taps and a modal prompt per delivery.
  - *Why it matters*: Club cricket moves quickly (~20s per ball). Over a 20-over innings, 240+ taps cause scorer fatigue and live match lag.
  - *Fix*: Make wagon wheel logging optional or boundary-triggered (4s/6s only), with a persistent "Quick Score (Skip Wheel)" toggle.
  - *Suggested Command*: `$impeccable distill` (or `$impeccable adapt`)
- **[P1] Cockpit Congestion in Master Match Console**:
  - *What*: Desktop default view displays 12+ telemetry cards (Momentum wave, Gyroscope widget, Stadium FX, Target track, Crease cards, Keypad, Wagon wheel, FoW pills, Fan poll).
  - *Why it matters*: First-time scorers experience decision paralysis and visual noise.
  - *Fix*: Make "Clean View" the default scoring state; collapse secondary telemetry into an expandable "Broadcast Telemetry" drawer.
  - *Suggested Command*: `$impeccable layout` (or `$impeccable quieter`)
- **[P2] Hardcoded International Fielder Chips in Dismissal Dialog**:
  - *What*: Fielder chips hardcode Indian national team stars (`Ravindra Jadeja`, `KL Rahul (WK)`, `Hardik Pandya`) instead of using the active bowling squad.
  - *Why it matters*: Breaks immersion and forces club scorers to manually type teammate names.
  - *Fix*: Dynamically populate quick-select fielder chips from the active bowling team roster.
  - *Suggested Command*: `$impeccable harden`
- **[P2] Mobile Touch Target Gaps in Secondary Controls & Modal Inputs**:
  - *What*: Headless Playwright audit revealed `#btnMobileChangeBowler` (height: 18.8px) and modal inputs (`#mobileDismissalFielderInput` height: 33px) below 44px.
  - *Why it matters*: Pitch-side mobile scorers wearing gloves or operating under direct sun experience mis-taps.
  - *Fix*: Enforce `min-height: 44px` on bowler change pills and form input/select controls.
  - *Suggested Command*: `$impeccable adapt`
- **[P3] Law Citation Accuracy in Bowler Rotation Modal**:
  - *What*: Bowler rotation modal copy cites `MCC Law 21: A bowler cannot bowl two consecutive overs.` Consecutive overs are Law 17.8 (Law 21 is No Ball).
  - *Why it matters*: CricOS is positioned as an official MCC Laws engine; incorrect citations undermine credibility.
  - *Fix*: Correct citation to `MCC Law 17.8`.
  - *Suggested Command*: `$impeccable document`

### Persona Red Flags
- **Alex (Impatient Power User)**: Loves desktop numeric hotkeys (0-6, W); gets infuriated by mandatory modal wagon wheel sheets on mobile.
- **Jordan (Confused First-Timer)**: Overwhelmed by default desktop telemetry (momentum waveforms, ball gyroscopes, DLS curves); needs a simplified "Volunteer Scorer Pad".
- **Sam (Accessibility-Dependent User)**: HTML text and buttons have rich ARIA labels; WebGL 3D Stadium and HTML5 Momentum Canvas lack hidden ARIA live narration summaries.
- **Club Captain / Scorer (Pitch-Side Match-Day User)**: Direct 35°C sunlight causes glare in Stadium Night; tightly packed mobile extra buttons risk fat-finger errors.

### Minor Observations
1. **Duplicate Undo Controls**: Button 8 on keypad has `[⌘Z] Undo`, while a dedicated yellow `Undo Last Ball` button sits directly below it.
2. **Dismissal Fielder Label Semantics**: Change "Fielder Involved" to "Catch Taken By" or "Stumped By" depending on mode.
3. **Out Batter Visual Radio**: Replace Striker/Non-Striker dropdown with a 2-segment visual radio toggle.
4. **Offline Queue Visibility**: Add "Offline: N Balls Queued Locally" indicator when network drops.

### Questions to Consider
- What if mobile scoring offered gesture directional scoring (e.g. flicking or dragging the run button towards Cover/Midwicket) instead of a modal sheet?
- Should CricOS auto-switch to Swiss Minimalist when outdoors during daylight hours to eliminate sunlight glare?
- Should the Scorer persona default to a distraction-free "Official Scorer Console" with broadcast telemetry collapsed into an optional panel?
