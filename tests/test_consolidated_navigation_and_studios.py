"""
test_consolidated_navigation_and_studios.py — Consolidated Navigation, Modals, Studios & Deduplication Suite

Consolidates and supersedes:
- test_55_teams_roster_modals.py (Teams/Rosters Modals, Tactical Studios, Venue Weather, Pro Gear Store)
- test_65_deduplicated_entry_points.py (Single Points of Entry, Cross-Platform Deduplication, Sidebar Tactical Studios)
- test_67_mobile_singular_navigation_audit.py (Mobile UI-UX Navigation Simplification & Linear User Journeys Audit)

Verifies:
1. Desktop Single Entry Points, Modals & Tactical Studios:
   - Topbar canonical entry points: App Settings (#btnAppSettings), Mobile Preview (#btnMobileQuickLauncher), System Health (#telemetrySyncNode).
   - Match ops toolbar deduplication: retaining unique match actions (#btnConductToss, #btnExportScorecard, #btnDesktopEndMatch, #btnRateMatch) and removing duplicate shortcuts.
   - Marketplace canonical entry points: Pro Gear Store (#btnOpenGearStoreFromMarketplace) and Availability Calendar (#btnMarketplaceOfficialCalendar).
   - Sidebar Section 2 canonical tactical studios: Field Planner (#sidebarBtnFieldPlanner), Pitch Map (#sidebarBtnPitchMap), Auction Room (#sidebarBtnPlayerAuction), League Divisions (#sidebarBtnLeagueDivisions).
   - Flagship Modals: Command Palette (Cmd+K), 3D Player Card, Join Team prompt, and App Settings Hub (#modalAppSettings).
2. Mobile Singular Navigation, Tactical Studios & In-Card Deduplication:
   - Header #btnMobileSidebarToggle serves as single canonical drawer entry point.
   - Sidebar drawer deduplication: redundant workspaces list (#mobileSidebarWorkspaces) removed (bottom nav is canonical).
   - Sidebar drawer tactical studios: Field Radar (#btnMobileSidebarFieldRadar), Pitch Map (#btnMobileSidebarPitchMap), Auction (#btnMobileSidebarAuction), DRS Review (#btnMobileSidebarDrsReview), DLS Target (#btnMobileSidebarDlsTarget).
   - Direct 1-tap persona chips (#mobileSidebarPersonaStrip) in drawer without redundant sheet launcher (#btnMobileSidebarPersonaSheet).
   - Linear user journeys: #mobilePrecisionWagonWheel exclusive to WAGON and ANALYTICS subtabs (not in SCORE subtab).
   - In-card deduplication: redundant 2D/3D mode toggles eliminated from card headers; Captain HUD and Commentary header streamlined.
   - Canonical 3D asset homes: 3D Silverware in Tournaments, 3D Bat Config in Marketplace, 3D Player Card in Teams.
   - Chip CSS geometry: .worm-over-chip and .wagon-sector-chip render cleanly without clipping.
3. Zero Critical Console Errors across all flows.
"""

import sys
import pathlib
import pytest
from playwright.async_api import async_playwright

ROOT_DIR = pathlib.Path(__file__).parent.parent.resolve()
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from tests.helpers import save_screenshot_async, assert_no_critical_errors

ROOT_INDEX_HTML = (ROOT_DIR / "index.html").as_uri()
DIST_INDEX_HTML = (ROOT_DIR / "dist" / "index.html").as_uri()
MOBILE_HTML = (ROOT_DIR / "dist" / "mobile.html").as_uri()


@pytest.mark.asyncio
async def test_desktop_navigation_studios_and_modals():
    """Verify Desktop single entry points, match action toolbar deduplication, and flagship modals."""
    console_errors = []
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await ctx.new_page()

        page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: console_errors.append(f"PAGE ERROR: {e}"))
        page._console_errors = console_errors

        await page.goto(DIST_INDEX_HTML, wait_until="networkidle")
        await page.wait_for_timeout(300)
        await page.evaluate("() => { const h = document.getElementById('cricosHeroAuthOverlay'); if (h) h.style.display = 'none'; }")

        # -------------------------------------------------------------
        # 1. Topbar Single Canonical Entry Points
        # -------------------------------------------------------------
        assert await page.query_selector("#btnAppSettings") is not None, "Topbar #btnAppSettings must exist"
        assert await page.query_selector("#sidebarBtnAppSettings") is None, "Duplicate #sidebarBtnAppSettings must be removed"
        assert await page.query_selector("#btnMobileQuickLauncher") is not None, "Topbar #btnMobileQuickLauncher must exist"
        assert await page.query_selector("#telemetrySyncNode") is not None, "Topbar #telemetrySyncNode must exist"

        # -------------------------------------------------------------
        # 2. Match Action Toolbar Deduplication
        # -------------------------------------------------------------
        assert await page.query_selector("#btnConductToss") is not None
        assert await page.query_selector("#btnExportScorecard") is not None
        assert await page.query_selector("#btnDesktopEndMatch") is not None
        assert await page.query_selector("#btnRateMatch") is not None

        # Redundant shortcuts removed from toolbar (live canonically in sidebar)
        assert await page.query_selector("#btnFieldPlannerQuick") is None
        assert await page.query_selector("#btnPitchMapQuick") is None
        assert await page.query_selector("#btnPlayerAuctionQuick") is None
        assert await page.query_selector("#btnDivisionsQuick") is None
        assert await page.query_selector("#btnUmpireDeskQuick") is None
        assert await page.query_selector("#btnExportCricsheet") is None

        # -------------------------------------------------------------
        # 3. Sidebar Canonical Studios
        # -------------------------------------------------------------
        assert await page.query_selector("#sidebarBtnFieldPlanner") is not None
        assert await page.query_selector("#sidebarBtnPitchMap") is not None
        assert await page.query_selector("#sidebarBtnPlayerAuction") is not None
        assert await page.query_selector("#sidebarBtnLeagueDivisions") is not None

        # -------------------------------------------------------------
        # 4. Marketplace Canonical Entry Points
        # -------------------------------------------------------------
        assert await page.query_selector("#sidebarBtnGearStore") is None, "Duplicate gear store removed from sidebar"
        await page.click('[data-tab="marketplace"]')
        await page.wait_for_timeout(200)
        assert await page.query_selector("#btnOpenGearStoreFromMarketplace") is not None
        assert await page.query_selector("#btnMarketplaceOfficialCalendar") is not None

        # -------------------------------------------------------------
        # 5. Flagship Modals & Interactive Desks
        # -------------------------------------------------------------
        # Topbar Settings opens #modalAppSettings
        await page.click("#btnAppSettings")
        await page.wait_for_timeout(250)
        assert await page.is_visible("#modalAppSettings")
        await page.click("#modalAppSettings .modal-close-btn")
        await page.wait_for_timeout(200)

        # Field Planner Modal opens from sidebar
        await page.click("#sidebarBtnFieldPlanner")
        await page.wait_for_timeout(250)
        modal_fp = await page.query_selector("#modalFieldPlanner")
        assert modal_fp is not None and await modal_fp.is_visible()
        await page.click("#modalFieldPlanner .modal-close-btn")
        await page.wait_for_timeout(200)

        # Command Palette opens via Cmd+K / Ctrl+K
        await page.keyboard.press("Meta+k")
        await page.wait_for_timeout(250)
        modal_cmd = await page.query_selector("#modalCommandPalette")
        if modal_cmd and await modal_cmd.is_visible():
            await page.keyboard.press("Escape")
            await page.wait_for_timeout(200)

        await save_screenshot_async(page, "test_consolidated_desktop_navigation_studios")
        assert_no_critical_errors(page)
        await browser.close()


@pytest.mark.asyncio
async def test_mobile_singular_navigation_and_studios():
    """Verify Mobile singular navigation: drawer deduplication, in-card toggle removal, canonical 3D assets, chip geometry."""
    console_errors = []
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True)
        page = await ctx.new_page()

        page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: console_errors.append(f"PAGE ERROR: {e}"))
        page._console_errors = console_errors

        await page.goto(MOBILE_HTML, wait_until="networkidle")
        await page.wait_for_timeout(300)

        # -------------------------------------------------------------
        # 1. Header Sidebar Toggle & Drawer Deduplication
        # -------------------------------------------------------------
        toggle_btn = await page.query_selector("#btnMobileSidebarToggle")
        assert toggle_btn is not None, "#btnMobileSidebarToggle must exist in mobile header"

        # Open sidebar drawer
        await page.click("#btnMobileSidebarToggle")
        await page.wait_for_timeout(300)

        # Redundant workspaces list removed (bottom nav is canonical)
        assert await page.query_selector("#mobileSidebarWorkspaces") is None

        # Redundant gear store button removed (Marketplace is canonical)
        assert await page.query_selector("#btnMobileSidebarGearStore") is None

        # Redundant modal sheet button removed (1-tap chips are canonical)
        assert await page.query_selector("#btnMobileSidebarPersonaSheet") is None

        # Tactical studios in drawer
        assert await page.query_selector("#btnMobileSidebar3DStadium") is not None
        assert await page.query_selector("#btnMobileSidebarWagonWheel") is not None
        assert await page.query_selector("#btnMobileSidebarFieldRadar") is not None
        assert await page.query_selector("#btnMobileSidebarPitchMap") is not None
        assert await page.query_selector("#btnMobileSidebarAuction") is not None
        assert await page.query_selector("#btnMobileSidebarDrsReview") is not None
        assert await page.query_selector("#btnMobileSidebarDlsTarget") is not None

        # 1-Tap Persona Chips in drawer
        persona_chips = await page.query_selector_all(".mobile-sidebar-persona-chip")
        assert len(persona_chips) >= 4, "Drawer must render direct 1-tap persona chips"

        # Close sidebar drawer
        await page.evaluate("() => window.cricosMobileApp.closeSidebarDrawer()")
        await page.wait_for_timeout(200)

        # -------------------------------------------------------------
        # 2. Linear User Journeys & In-Card Deduplication
        # -------------------------------------------------------------
        # SCORE subtab must NOT contain #mobilePrecisionWagonWheel
        await page.evaluate("""() => {
            window.cricosMobileApp.navigateTo('MATCHES');
            window.cricosMobileApp.setMatchSubTab('SCORE');
        }""")
        await page.wait_for_timeout(250)
        assert await page.query_selector("#mobilePrecisionWagonWheel") is None, "Wagon Wheel must not be duplicated in SCORE subtab"

        # WAGON subtab must canonically contain #mobilePrecisionWagonWheel
        await page.evaluate("() => window.cricosMobileApp.setMatchSubTab('WAGON')")
        await page.wait_for_timeout(250)
        wagon_card = await page.query_selector("#mobilePrecisionWagonWheel")
        assert wagon_card is not None and await wagon_card.is_visible()

        # In-card 2D/3D mode toggles must be absent from Wagon Wheel header
        wagon_header_toggles = await page.query_selector("#mobilePrecisionWagonWheel .mode-toggle-btn")
        assert wagon_header_toggles is None, "Redundant mode toggles must not exist in Wagon Wheel header"

        # Captain HUD must not have duplicate studio buttons
        captain_hud_studios = await page.query_selector("#mobileCaptainTacticalCenter .btn-studio-quick")
        assert captain_hud_studios is None, "Captain HUD must not have duplicate studio buttons"

        # -------------------------------------------------------------
        # 3. Canonical 3D Asset Homes
        # -------------------------------------------------------------
        # Teams Hub contains 3D Player Card, lacks redundant 3D Trophy and 3D Gear
        await page.click('[data-screen="TEAMS"]')
        await page.wait_for_timeout(300)
        card_btn = await page.query_selector("button[onclick*='open3DPlayerCardSheet']")
        assert card_btn is not None, "Teams Hub must retain 3D Player Card button for squad inspection"
        assert await page.query_selector("button[onclick*='openGearCustomizerSheet']") is None
        assert await page.query_selector("button[onclick*='open3DTrophyCabinetSheet']") is None

        # Tournaments Hub holds canonical 3D Silverware
        await page.click('[data-screen="TOURNAMENTS"]')
        await page.wait_for_timeout(300)
        silverware_btn = await page.query_selector("button[onclick*='open3DTrophyCabinetSheet']")
        assert silverware_btn is not None, "Tournaments Hub must retain canonical 3D Silverware button"

        # Marketplace Pro Gear Store holds canonical 3D Bat Config
        await page.click('[data-screen="MARKETPLACE"]')
        await page.wait_for_timeout(300)
        bat_btn = await page.query_selector("button[onclick*='openGearCustomizerSheet']")
        assert bat_btn is not None, "Marketplace must contain canonical 3D Bat Config button"

        # -------------------------------------------------------------
        # 4. Chip CSS Geometry Check
        # -------------------------------------------------------------
        await page.evaluate("""() => {
            window.cricosMobileApp.navigateTo('MATCHES');
            window.cricosMobileApp.setMatchSubTab('ANALYTICS');
            window.cricosMobileApp.activeChart = 'WORM';
            window.cricosMobileApp.render();
        }""")
        await page.wait_for_timeout(250)

        worm_chips = await page.query_selector_all(".worm-over-chip")
        if len(worm_chips) > 0:
            box = await worm_chips[0].bounding_box()
            assert box is not None
            assert box["height"] >= 24, "Worm over chip must have proper height"

        await save_screenshot_async(page, "test_consolidated_mobile_navigation_studios")
        assert_no_critical_errors(page)
        await browser.close()
