# 04 — 8-Persona RBAC, Animated Hero Login & Theme-Aware Clean Focus UX

---

## 1. Two-Stage Animated Hero Landing $\rightarrow$ Persona-Scoped Login

1. **Stage 1 — 60fps Animated Stadium Hero (`#cricosHeroAuthOverlay` / `#mobileHeroAuthOverlay`)**:
   - Full-screen HTML5 `<canvas>` (`#heroStadiumCanvas` / `#mobileHeroStadiumCanvas`) rendering sweeping floodlight cones, 3D perspective turf boundary rings, and parabolic `SIX` / `FOUR` trajectories.
2. **Stage 2 — Verified Account & Entitlement Login (`#heroStageLogin` / `#mobileHeroStageLogin`)**:
   - 6 verified preset accounts with strict `allowedPersonas` arrays (`strictPersonaLock = true`):
     - **Virat Sharma**: `['CAPTAIN', 'PLAYER']`
     - **Sunil Gavaskar**: `['SCORER']`
     - **Nitin Menon**: `['UMPIRE', 'SCORER']`
     - **Jay Shah**: `['ORGANISER', 'TURF_PROVIDER']`
     - **Aarav Mehta**: `['FAN']`
     - **System Root**: All 8 personas (`CAPTAIN`, `PLAYER`, `SCORER`, `FAN`, `UMPIRE`, `ORGANISER`, `TURF_PROVIDER`, `ADMIN`)

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
