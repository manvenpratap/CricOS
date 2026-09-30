# 04 — 8-Persona RBAC, Animated Hero Login & Theme-Aware Clean Focus UX

---

## 1. UI/UX Pro Max Split Hero Section, Interactive 3D HUD & JWT Session Persistence

1. **Stage 1 — `/ui-ux-pro-max` Asymmetric 2-Column Split Hero (`#cricosHeroAuthOverlay` & `#mobileHeroAuthOverlay`)**:
   - **Top Live Broadcast Telemetry Ribbon (`#heroLiveBroadcastRibbon`)**: Live match score (`BLR 186/4 (18.2 ov) vs MUM`), Chinnaswamy Turf A micro-climate (`26°C | 920m Alt | 1.8° Out-Swing`), `0.8ms` GiST slot lock, and `5-Account Balanced` escrow ledger, plus a **60fps Canvas Visual Mode Switcher (`#heroCanvasModeBar`: `3D Wagon Arcs`, `Hawk-Eye DRS`, `Field Radar`)**.
   - **Left Column**: Kinetic headline (`#heroKineticHeadline`), dual primary/secondary CTAs (`#btnHeroProceedToLogin` + `#btnHeroCyclePreview`), **Instant 1-Click Demo Persona Quick-Launch Bar (`#heroQuickPersonaLaunchBar` & `#mobileHeroQuickLaunchRow`)** launching directly into the authenticated workspace with 1 click, and a **4-Pillar Tabular Telemetry Strip (`#heroTrustMetricsStrip`)**.
   - **Right Column (`#heroInteractivePreviewHud` & `#mobileHeroInteractiveHud`)**: Multi-layer glassmorphic **Interactive 3D Broadcast Command Preview HUD** with 4 live tabs (`🏏 3D Wagon`, `🛡️ Field Radar`, `🎯 Hawk-Eye DRS`, `🏟️ Turf & Gear`), live **`RHB ↔ LHB` Stance Mirror Toggle (`#btnHeroPreviewStanceToggle`)**, and interactive 360° SVG pitch viewport (`#heroInteractivePitchSvg`).
2. **Stage 2 — Verified Account Login & Unified JWT Session Persistence (`cricos_session_v1`)**:
   - 6 verified preset accounts with strict `allowedPersonas` arrays (`strictPersonaLock = true`):
     - **Virat Sharma**: `['CAPTAIN', 'PLAYER']`
     - **Sunil Gavaskar**: `['SCORER']`
     - **Nitin Menon**: `['UMPIRE', 'SCORER']`
     - **Jay Shah**: `['ORGANISER', 'TURF_PROVIDER']`
     - **Aarav Mehta**: `['FAN']`
     - **System Root**: All 8 personas (`CAPTAIN`, `PLAYER`, `SCORER`, `FAN`, `UMPIRE`, `ORGANISER`, `TURF_PROVIDER`, `ADMIN`)
   - Sessions are persisted across reloads in `localStorage` (`cricos_session_v1` & `cricos_access_token`) and synchronized with `this.client.setSession(...)`. When authenticated, the redundant `🔑 Sign In` tab (`button[data-screen="AUTH"]`) is completely removed from `#mobileBottomNav`, and the active session badge (`#mobileActiveSessionBadge`) is shown in `Profile`.

---

## 2. Sidebar Navigation & Clean Focus Mode Decluttering

- **Desktop (`apps/api/src/ui/dashboard.ts`)**:
  - `#appSidebar` is organized into 5 domain sections (`Core Workspaces`, `Tactical & 3D Studios`, `Match Day & Officiating`, `League, Auction & Commerce`, `Developer & Platform`) with `#sidebarAllowedPersonaStrip` in the footer.
  - `#workspaceCleanFocusBar` (`desktopCleanFocusMode = true`) scopes `.match-action-toolbar` to 1–3 persona-relevant action pills and collapses secondary telemetry until expanded via `📂 Show All Telemetry`.
- **Mobile & Native Android APK (`apps/api/src/ui/mobile-view.ts`)**:
  - Top-left `☰` button (`#btnMobileSidebarToggle`) opens the **Theme-Aware Slide-Out Left Sidebar Drawer (`#mobileSidebarDrawer`)** containing `Provisioned Account Personas`, `Core Workspaces`, `3D, Gear Store & Studios`, and `Clean Main View` toggle.

---

## 3. Universal WCAG 2.1 AA/AAA Theme Contrast Engine

CricOS supports 3 distinct architectural themes:
- **`🇨🇭 Swiss Minimal (`swiss`)`**: Crisp daylight surfaces (`#FFFFFF` / `#F8FAFC`), `#0F172A` primary ink (`16.5:1` contrast), `#065F46` emerald badges.
- **`🌾 Nordic Editorial (`nordic`)`**: Warm oat & stone daylight surfaces (`#FAF8F5` / `#F3EFEA`), `#1C1917` primary ink (`15.2:1` contrast).
- **`🌙 Stadium Night (`stadium`)`**: Deep floodlight slate (`#071222` / `#040914`), `#F8FAFC` primary ink, `#00E599` turf emerald & `#00D2FF` cyan highlights.
