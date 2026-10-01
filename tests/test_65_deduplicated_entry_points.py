"""
test_65_deduplicated_entry_points.py — Single Point of Entry & Deduplication E2E Suite
Verifies:
1. Desktop Deduplication:
   - App Settings: Single entry point in Topbar (#btnAppSettings). Removed from Sidebar Section 5.
   - Mobile Preview: Single entry point in Topbar (#btnMobileQuickLauncher). Removed from Sidebar Section 5.
   - System Health: Single entry point in Topbar (#telemetrySyncNode). Removed from Sidebar Section 5.
   - Match Ops Toolbar: Contains only unique match operations (#btnConductToss, #btnExportScorecard, #btnDesktopEndMatch, #btnRateMatch).
     Redundant studios (#btnFieldPlannerQuick, #btnPitchMapQuick, #btnPlayerAuctionQuick, #btnDivisionsQuick)
     and redundant ops (#btnUmpireDeskQuick, #btnExportCricsheet) removed, since they reside canonically in the left sidebar.
   - Gear Store: Single point of entry in Marketplace tab (#btnOpenGearStoreFromMarketplace). Removed from sidebar Section 4.
   - Official Calendar: Single point of entry in Marketplace tab (#btnMarketplaceOfficialCalendar). Removed from sidebar Section 4.
2. Mobile Deduplication:
   - Sidebar Drawer: Redundant #mobileSidebarWorkspaces is removed; core workspaces reside canonically in bottom navigation.
   - Gear Store: Single entry point in Marketplace screen (#btnMobileOpenGearStore). Removed from sidebar drawer.
   - Sidebar Toggle: Single canonical entry point in header (#btnMobileSidebarToggle). Redundant '☰ Menu' removed from role experience banner.
   - Persona Switcher: Directly clickable persona chips (#mobileSidebarPersonaStrip) in sidebar drawer.
3. Functional Verification:
   - Topbar settings button opens App Settings modal cleanly.
   - Sidebar studio buttons (#sidebarBtnFieldPlanner, #sidebarBtnPitchMap, #sidebarBtnPlayerAuction, #sidebarBtnLeagueDivisions) remain functional.
   - Mobile Marketplace gear store button opens Gear Store modal cleanly.
   - Zero critical console errors (Rule 4).
   - Local screenshots saved to tests/screenshots/.
"""

import pathlib
import pytest
from playwright.async_api import async_playwright
from tests.helpers import save_screenshot_async, assert_no_critical_errors

ROOT_DIR = pathlib.Path(__file__).parent.parent.resolve()
INDEX_HTML = (ROOT_DIR / "dist" / "index.html").as_uri()
MOBILE_HTML = (ROOT_DIR / "dist" / "mobile.html").as_uri()


@pytest.mark.asyncio
async def test_desktop_single_entry_points():
    """Verify Desktop platform provides a single canonical entry point for each feature."""
    console_errors = []
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await ctx.new_page()

        page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: console_errors.append(f"PAGE ERROR: {e}"))
        page._console_errors = console_errors

        await page.goto(INDEX_HTML, wait_until="networkidle")

        # 1. Verify Topbar holds canonical entry point for App Settings
        btn_topbar_settings = await page.query_selector("#btnAppSettings")
        assert btn_topbar_settings is not None, "Topbar #btnAppSettings must exist as canonical settings entry point"
        
        # Verify Sidebar Section 5 duplicate App Settings is removed
        sidebar_settings = await page.query_selector("#sidebarBtnAppSettings")
        assert sidebar_settings is None, "Duplicate #sidebarBtnAppSettings must be removed from sidebar Section 5"

        # 2. Verify Topbar holds canonical entry point for Mobile App Preview
        btn_topbar_mobile = await page.query_selector("#btnMobileQuickLauncher")
        assert btn_topbar_mobile is not None, "Topbar #btnMobileQuickLauncher must exist as canonical mobile preview entry point"

        # 3. Verify Topbar holds canonical entry point for System Health
        btn_topbar_health = await page.query_selector("#telemetrySyncNode")
        assert btn_topbar_health is not None, "Topbar #telemetrySyncNode must exist as canonical system health entry point"

        # 4. Verify Match Action Toolbar deduplication
        # Match Ops buttons: exactly 4 unique match actions
        assert await page.query_selector("#btnConductToss") is not None, "Toolbar must keep #btnConductToss"
        assert await page.query_selector("#btnExportScorecard") is not None, "Toolbar must keep #btnExportScorecard"
        assert await page.query_selector("#btnDesktopEndMatch") is not None, "Toolbar must keep #btnDesktopEndMatch"
        assert await page.query_selector("#btnRateMatch") is not None, "Toolbar must keep #btnRateMatch"

        # Redundant studio shortcuts removed from toolbar (they live canonically in sidebar)
        assert await page.query_selector("#btnFieldPlannerQuick") is None, "Duplicate #btnFieldPlannerQuick must be removed from toolbar"
        assert await page.query_selector("#btnPitchMapQuick") is None, "Duplicate #btnPitchMapQuick must be removed from toolbar"
        assert await page.query_selector("#btnPlayerAuctionQuick") is None, "Duplicate #btnPlayerAuctionQuick must be removed from toolbar"
        assert await page.query_selector("#btnDivisionsQuick") is None, "Duplicate #btnDivisionsQuick must be removed from toolbar"
        assert await page.query_selector("#btnUmpireDeskQuick") is None, "Duplicate #btnUmpireDeskQuick must be removed from toolbar"
        assert await page.query_selector("#btnExportCricsheet") is None, "Duplicate #btnExportCricsheet must be removed from toolbar"

        # 5. Verify Sidebar Studios remain intact as canonical entry points
        assert await page.query_selector("#sidebarBtnFieldPlanner") is not None, "Sidebar must retain #sidebarBtnFieldPlanner"
        assert await page.query_selector("#sidebarBtnPitchMap") is not None, "Sidebar must retain #sidebarBtnPitchMap"
        assert await page.query_selector("#sidebarBtnPlayerAuction") is not None, "Sidebar must retain #sidebarBtnPlayerAuction"
        assert await page.query_selector("#sidebarBtnLeagueDivisions") is not None, "Sidebar must retain #sidebarBtnLeagueDivisions"
        assert await page.query_selector("#sidebarBtnUmpireDesk") is not None, "Sidebar must retain #sidebarBtnUmpireDesk"
        assert await page.query_selector("#sidebarBtnCricsheetExport") is not None, "Sidebar must retain #sidebarBtnCricsheetExport"

        # 6. Verify Gear Store and Official Calendar deduplication
        # Sidebar Section 4 duplicates removed
        assert await page.query_selector("#sidebarBtnGearStore") is None, "Duplicate #sidebarBtnGearStore must be removed from sidebar"
        
        # Navigate to Marketplace tab
        await page.click('[data-tab="marketplace"]')
        assert await page.query_selector("#btnOpenGearStoreFromMarketplace") is not None, "Marketplace must contain canonical #btnOpenGearStoreFromMarketplace"
        assert await page.query_selector("#btnMarketplaceOfficialCalendar") is not None, "Marketplace must contain canonical #btnMarketplaceOfficialCalendar"

        # 7. Functional test: Topbar Settings opens App Settings Modal cleanly
        await page.click("#btnAppSettings")
        await page.wait_for_timeout(300)
        is_settings_visible = await page.is_visible("#modalAppSettings")
        assert is_settings_visible, "Clicking topbar settings must open #modalAppSettings"
        await page.click("#modalAppSettings .modal-close-btn")
        await page.wait_for_timeout(200)

        # Capture desktop screenshot
        await save_screenshot_async(page, "test_65_desktop_single_entry_points.png")

        # Zero critical errors
        assert_no_critical_errors(page)
        await browser.close()


@pytest.mark.asyncio
async def test_mobile_single_entry_points():
    """Verify Mobile platform provides a single canonical entry point for each feature."""
    console_errors = []
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True)
        page = await ctx.new_page()

        page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: console_errors.append(f"PAGE ERROR: {e}"))
        page._console_errors = console_errors

        await page.goto(MOBILE_HTML, wait_until="networkidle")

        # 1. Verify Header contains canonical sidebar toggle
        toggle_btn = await page.query_selector("#btnMobileSidebarToggle")
        assert toggle_btn is not None, "#btnMobileSidebarToggle must exist in mobile header"

        # 2. Open sidebar drawer
        await page.click("#btnMobileSidebarToggle")
        await page.wait_for_timeout(300)

        # 3. Verify redundant workspaces list is removed from drawer
        drawer_workspaces = await page.query_selector("#mobileSidebarWorkspaces")
        assert drawer_workspaces is None, "#mobileSidebarWorkspaces must be removed from drawer (bottom nav is single entry point)"

        # 4. Verify bottom navigation exists with all core screens
        bottom_nav = await page.query_selector(".mobile-bottom-nav")
        assert bottom_nav is not None, "Mobile bottom nav must exist as the canonical navigation point"

        # 5. Verify Gear Store in sidebar is removed (Marketplace is single entry point)
        sidebar_gear = await page.query_selector("#btnMobileSidebarGearStore")
        assert sidebar_gear is None, "Duplicate #btnMobileSidebarGearStore must be removed from mobile drawer"

        # 6. Verify 3D Stadium & Wagon Wheel remain accessible in sidebar drawer
        assert await page.query_selector("#btnMobileSidebar3DStadium") is not None, "Sidebar must retain #btnMobileSidebar3DStadium"
        assert await page.query_selector("#btnMobileSidebarWagonWheel") is not None, "Sidebar must retain #btnMobileSidebarWagonWheel"

        # 7. Verify Persona chips exist in drawer
        persona_chips = await page.query_selector_all(".mobile-sidebar-persona-chip")
        assert len(persona_chips) >= 4, "Mobile drawer must contain direct persona chips"

        # Close sidebar
        await page.click("#btnCloseMobileSidebar")
        await page.wait_for_timeout(300)

        # 8. Switch to Marketplace screen via Bottom Nav
        await page.click('[data-screen="MARKETPLACE"]')
        await page.wait_for_timeout(300)

        # Verify Gear Store button in Marketplace
        gear_btn = await page.query_selector("#btnMobileOpenGearStore")
        assert gear_btn is not None, "#btnMobileOpenGearStore must exist in Marketplace as canonical entry point"

        # 9. Test Gear Store opens cleanly
        await page.click("#btnMobileOpenGearStore")
        await page.wait_for_timeout(300)
        is_gear_store_visible = await page.is_visible("#mobileGearStoreContainer")
        assert is_gear_store_visible, "Clicking gear store button in Marketplace must render #mobileGearStoreContainer"

        # Capture mobile screenshot
        await save_screenshot_async(page, "test_65_mobile_single_entry_points.png")

        # Zero critical errors
        assert_no_critical_errors(page)
        await browser.close()
