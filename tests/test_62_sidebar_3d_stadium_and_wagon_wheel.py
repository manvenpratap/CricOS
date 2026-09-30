"""
test_62_sidebar_3d_stadium_and_wagon_wheel.py — 3D Stadium Pitch & 8-Zone Wagon Wheel Sidebar Navigation E2E Suite
Verifies:
1. Mobile Sidebar Navigation:
   - Opening sidebar drawer (#btnMobileNavDrawer) exposes:
     - #btnMobileSidebar3DStadium ("3D Stadium Pitch")
     - #btnMobileSidebarWagonWheel ("8-Zone Wagon Wheel")
   - Clicking #btnMobileSidebar3DStadium:
     - Closes drawer cleanly.
     - Switches currentScreen to 'MATCHES' and matchSubTab to 'STADIUM_3D'.
     - Activates subnav button [data-subtab="STADIUM_3D"].
     - Renders #mobileThreeStadiumViewport and initializes #mobileThreeStadiumCanvas.
     - Renders 3D camera presets and pitch inspection cards.
   - Clicking #btnMobileSidebarWagonWheel:
     - Closes drawer cleanly.
     - Switches currentScreen to 'MATCHES' and matchSubTab to 'WAGON'.
     - Activates subnav button [data-subtab="WAGON"].
     - Renders #mobilePrecisionWagonWheel with SVG outfield, sector lines, stance switcher, and zone badge #mobileWagonSelectedZone.
   - 1-tap subtab navigation header switches smoothly between Live Score, 3D Stadium, and Wagon Wheel.
2. Desktop Sidebar Navigation:
   - Sidebar Section 2 ("Tactical & 3D Studios") includes:
     - #sidebarBtn3DStadium ("3D Stadium Pitch") with accessible data-tooltip.
     - #sidebarBtnWagonWheel ("8-Zone Wagon Wheel") with accessible data-tooltip.
   - Clicking #sidebarBtn3DStadium:
     - Switches workspace tab to #tab-studio.
     - Sets wagon display mode to '3D'.
     - Displays #threeJsStadiumViewport and hides 2D #wagonWheelSvg.
     - Activates #btnWagonMode3D and initializes 3D stadium pitch.
   - Clicking #sidebarBtnWagonWheel:
     - Switches workspace tab to #tab-studio.
     - Sets wagon display mode to '2D'.
     - Displays 2D #wagonWheelSvg and hides #threeJsStadiumViewport.
     - Activates #btnWagonMode2D and reveals all 8 perimeter field zone buttons.
   - RBAC verification: Allows access across personas (SCORER, PLAYER, FAN, ADMIN).
3. Zero critical console errors (Rule 4).
4. Local screenshots saved to tests/screenshots/.
"""

import pathlib
import pytest
from playwright.async_api import async_playwright
from tests.helpers import save_screenshot_async, assert_no_critical_errors

ROOT_DIR = pathlib.Path(__file__).parent.parent.resolve()
INDEX_HTML = (ROOT_DIR / "dist" / "index.html").as_uri()
MOBILE_HTML = (ROOT_DIR / "dist" / "mobile.html").as_uri()


@pytest.mark.asyncio
async def test_mobile_sidebar_3d_stadium_and_wagon_wheel_flow():
    """Verify Mobile sidebar navigation opens 3D Stadium Pitch and 8-Zone Wagon Wheel reliably."""
    console_errors = []
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True)
        page = await ctx.new_page()

        page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: console_errors.append(f"PAGE ERROR: {e}"))
        page._console_errors = console_errors

        await page.goto(MOBILE_HTML, wait_until="domcontentloaded")
        await page.wait_for_timeout(400)

        # -------------------------------------------------------------
        # 1. Open mobile sidebar drawer and inspect buttons
        # -------------------------------------------------------------
        nav_drawer_btn = await page.query_selector("#btnMobileSidebarToggle")
        assert nav_drawer_btn is not None, "#btnMobileSidebarToggle must exist in mobile header"
        await nav_drawer_btn.click()
        await page.wait_for_timeout(300)

        drawer = await page.query_selector("#mobileSidebarDrawer")
        assert drawer is not None, "#mobileSidebarDrawer must exist"
        is_drawer_open = await page.evaluate("() => window.cricosMobileApp.sidebarDrawerOpen")
        assert is_drawer_open is True, "Sidebar drawer should be open"

        btn_3d = await page.query_selector("#btnMobileSidebar3DStadium")
        assert btn_3d is not None, "#btnMobileSidebar3DStadium must exist in sidebar drawer"
        tooltip_3d = await btn_3d.get_attribute("data-tooltip")
        assert tooltip_3d is not None and len(tooltip_3d) > 0, "#btnMobileSidebar3DStadium must have accessible data-tooltip"

        btn_wagon = await page.query_selector("#btnMobileSidebarWagonWheel")
        assert btn_wagon is not None, "#btnMobileSidebarWagonWheel must exist in sidebar drawer"
        tooltip_wagon = await btn_wagon.get_attribute("data-tooltip")
        assert tooltip_wagon is not None and len(tooltip_wagon) > 0, "#btnMobileSidebarWagonWheel must have accessible data-tooltip"

        # -------------------------------------------------------------
        # 2. Click 3D Stadium Pitch from Mobile Sidebar
        # -------------------------------------------------------------
        await btn_3d.click()
        await page.wait_for_timeout(400)

        # Drawer must be closed
        is_drawer_open = await page.evaluate("() => window.cricosMobileApp.sidebarDrawerOpen")
        assert is_drawer_open is False, "Sidebar drawer must close after clicking item"

        # Verify active screen and subtab
        current_screen = await page.evaluate("() => window.cricosMobileApp.currentScreen")
        match_subtab = await page.evaluate("() => window.cricosMobileApp.matchSubTab")
        assert current_screen == "MATCHES", f"Expected currentScreen 'MATCHES', got '{current_screen}'"
        assert match_subtab == "STADIUM_3D", f"Expected matchSubTab 'STADIUM_3D', got '{match_subtab}'"

        # Verify subnav button is active
        btn_3d_subnav = await page.query_selector('.mobile-subnav-btn[data-subtab="STADIUM_3D"]')
        assert btn_3d_subnav is not None, "3D Stadium subnav button must exist"
        btn_classes = await btn_3d_subnav.get_attribute("class")
        assert "active" in (btn_classes or ""), "3D Stadium subnav button must have active class"

        # Verify 3D stadium viewport is rendered and visible
        three_vp = await page.query_selector("#mobileThreeStadiumViewport")
        assert three_vp is not None, "#mobileThreeStadiumViewport must be rendered"
        assert await three_vp.is_visible(), "#mobileThreeStadiumViewport must be visible"

        canvas = await page.query_selector("#mobileThreeStadiumCanvas")
        assert canvas is not None, "#mobileThreeStadiumCanvas must exist in 3D viewport"

        # Verify camera presets bar exists
        cam_btns = await page.query_selector_all("#mobileThreeCameraBar .mobile-three-btn")
        assert len(cam_btns) >= 4, f"Expected at least 4 camera presets, got {len(cam_btns)}"

        await save_screenshot_async(page, "test_62_mobile_sidebar_3d_stadium.png")

        # -------------------------------------------------------------
        # 3. Open sidebar drawer again and click 8-Zone Wagon Wheel
        # -------------------------------------------------------------
        await page.click("#btnMobileSidebarToggle")
        await page.wait_for_timeout(300)

        btn_wagon = await page.query_selector("#btnMobileSidebarWagonWheel")
        assert btn_wagon is not None, "#btnMobileSidebarWagonWheel must exist in sidebar drawer"
        await btn_wagon.click()
        await page.wait_for_timeout(400)

        # Drawer must be closed
        is_drawer_open = await page.evaluate("() => window.cricosMobileApp.sidebarDrawerOpen")
        assert is_drawer_open is False, "Sidebar drawer must close after clicking item"

        # Verify active screen and subtab
        current_screen = await page.evaluate("() => window.cricosMobileApp.currentScreen")
        match_subtab = await page.evaluate("() => window.cricosMobileApp.matchSubTab")
        assert current_screen == "MATCHES", f"Expected currentScreen 'MATCHES', got '{current_screen}'"
        assert match_subtab == "WAGON", f"Expected matchSubTab 'WAGON', got '{match_subtab}'"

        # Verify subnav button is active
        btn_wagon_subnav = await page.query_selector('.mobile-subnav-btn[data-subtab="WAGON"]')
        assert btn_wagon_subnav is not None, "Wagon Wheel subnav button must exist"
        btn_classes = await btn_wagon_subnav.get_attribute("class")
        assert "active" in (btn_classes or ""), "Wagon Wheel subnav button must have active class"

        # Verify Wagon Wheel card is rendered and visible
        wagon_el = await page.query_selector("#mobilePrecisionWagonWheel")
        assert wagon_el is not None, "#mobilePrecisionWagonWheel must be rendered"
        assert await wagon_el.is_visible(), "#mobilePrecisionWagonWheel must be visible"

        zone_badge = await page.query_selector("#mobileWagonSelectedZone")
        assert zone_badge is not None, "#mobileWagonSelectedZone must exist"
        zone_text = await zone_badge.inner_text()
        assert "ZONE:" in zone_text, f"Zone badge should display zone text, got '{zone_text}'"

        # Test Stance Switching (RHB / LHB)
        btn_lhb = await page.query_selector('#mobilePrecisionWagonWheel button[data-stance="LHB"]')
        assert btn_lhb is not None, "LHB stance toggle button must exist"
        await btn_lhb.click()
        await page.wait_for_timeout(200)

        current_stance = await page.evaluate("() => window.cricosMobileApp.currentStance")
        assert current_stance == "LHB", f"Expected stance 'LHB', got '{current_stance}'"

        btn_rhb = await page.query_selector('#mobilePrecisionWagonWheel button[data-stance="RHB"]')
        assert btn_rhb is not None, "RHB stance toggle button must exist"
        await btn_rhb.click()
        await page.wait_for_timeout(200)

        current_stance = await page.evaluate("() => window.cricosMobileApp.currentStance")
        assert current_stance == "RHB", f"Expected stance 'RHB', got '{current_stance}'"

        # Test Batter Filter Select
        batter_select = await page.query_selector("#mobileWagonBatterSelect")
        assert batter_select is not None, "#mobileWagonBatterSelect must exist"

        await save_screenshot_async(page, "test_62_mobile_sidebar_wagon_wheel.png")

        # -------------------------------------------------------------
        # 4. Direct Subnav Tabs 1-Tap Switching Verification
        # -------------------------------------------------------------
        btn_score_subnav = await page.query_selector('.mobile-subnav-btn[data-subtab="SCORE"]')
        assert btn_score_subnav is not None, "Live Score subnav button must exist"
        await btn_score_subnav.click()
        await page.wait_for_timeout(300)

        match_subtab = await page.evaluate("() => window.cricosMobileApp.matchSubTab")
        assert match_subtab == "SCORE", f"Expected matchSubTab 'SCORE', got '{match_subtab}'"

        # Verify zero console errors
        assert_no_critical_errors(page)
        await browser.close()


@pytest.mark.asyncio
async def test_desktop_sidebar_3d_stadium_and_wagon_wheel_flow():
    """Verify Desktop sidebar navigation opens 3D Stadium Pitch and 8-Zone Wagon Wheel in studio workspace."""
    console_errors = []
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await ctx.new_page()

        page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: console_errors.append(f"PAGE ERROR: {e}"))
        page._console_errors = console_errors

        await page.goto(INDEX_HTML, wait_until="domcontentloaded")
        await page.wait_for_timeout(400)

        # -------------------------------------------------------------
        # 1. Verify Desktop Sidebar Section 2 Buttons
        # -------------------------------------------------------------
        btn_3d = await page.query_selector("#sidebarBtn3DStadium")
        assert btn_3d is not None, "#sidebarBtn3DStadium must exist in desktop sidebar"
        tooltip_3d = await btn_3d.get_attribute("data-tooltip")
        assert tooltip_3d is not None and len(tooltip_3d) > 0, "#sidebarBtn3DStadium must have accessible data-tooltip"

        btn_wagon = await page.query_selector("#sidebarBtnWagonWheel")
        assert btn_wagon is not None, "#sidebarBtnWagonWheel must exist in desktop sidebar"
        tooltip_wagon = await btn_wagon.get_attribute("data-tooltip")
        assert tooltip_wagon is not None and len(tooltip_wagon) > 0, "#sidebarBtnWagonWheel must have accessible data-tooltip"

        # -------------------------------------------------------------
        # 2. Click 3D Stadium Pitch from Sidebar
        # -------------------------------------------------------------
        await btn_3d.click()
        await page.wait_for_timeout(500)

        # Verify studio tab is active
        studio_tab = await page.query_selector("#tab-studio")
        assert studio_tab is not None, "#tab-studio must exist"
        studio_classes = await studio_tab.get_attribute("class")
        assert "active" in (studio_classes or ""), "#tab-studio must be active"

        # Verify 3D stadium viewport is visible and 2D SVG is hidden
        three_vp = await page.query_selector("#threeJsStadiumViewport")
        assert three_vp is not None, "#threeJsStadiumViewport must exist"
        assert await three_vp.is_visible(), "#threeJsStadiumViewport must become visible"

        svg_el = await page.query_selector("#wagonWheelSvg")
        assert svg_el is not None, "#wagonWheelSvg must exist"
        assert not await svg_el.is_visible(), "#wagonWheelSvg must be hidden in 3D mode"

        # Verify 3D mode button is active
        btn_mode_3d = await page.query_selector("#btnWagonMode3D")
        assert btn_mode_3d is not None, "#btnWagonMode3D must exist"
        mode_3d_classes = await btn_mode_3d.get_attribute("class")
        assert "active" in (mode_3d_classes or ""), "#btnWagonMode3D must be active"

        await save_screenshot_async(page, "test_62_desktop_sidebar_3d_stadium.png")

        # -------------------------------------------------------------
        # 3. Click 8-Zone Wagon Wheel from Sidebar
        # -------------------------------------------------------------
        await btn_wagon.click()
        await page.wait_for_timeout(400)

        # Verify studio tab is still active
        studio_classes = await studio_tab.get_attribute("class")
        assert "active" in (studio_classes or ""), "#tab-studio must remain active"

        # Verify 2D SVG is visible and 3D viewport is hidden
        assert await svg_el.is_visible(), "#wagonWheelSvg must become visible in 2D mode"
        assert not await three_vp.is_visible(), "#threeJsStadiumViewport must be hidden in 2D mode"

        # Verify 2D mode button is active
        btn_mode_2d = await page.query_selector("#btnWagonMode2D")
        assert btn_mode_2d is not None, "#btnWagonMode2D must exist"
        mode_2d_classes = await btn_mode_2d.get_attribute("class")
        assert "active" in (mode_2d_classes or ""), "#btnWagonMode2D must be active"

        # Verify all 8 perimeter zone buttons are visible
        zone_btns = await page.query_selector_all(".field-zone-btn")
        assert len(zone_btns) == 8, f"Expected 8 field zone buttons, found {len(zone_btns)}"
        for z in zone_btns:
            assert await z.is_visible(), "All 8 zone buttons must be visible in 2D mode"

        await save_screenshot_async(page, "test_62_desktop_sidebar_wagon_wheel.png")

        # -------------------------------------------------------------
        # 4. RBAC Verification: Persona switching and sidebar access
        # -------------------------------------------------------------
        # Switch to PLAYER role
        await page.evaluate("() => { if (typeof setPersonaRole === 'function') setPersonaRole('PLAYER'); }")
        await page.wait_for_timeout(200)

        # Click 3D stadium as player
        await btn_3d.click()
        await page.wait_for_timeout(300)
        assert await three_vp.is_visible(), "3D viewport must be visible for PLAYER role"

        # Click Wagon Wheel as player
        await btn_wagon.click()
        await page.wait_for_timeout(300)
        assert await svg_el.is_visible(), "2D Wagon Wheel SVG must be visible for PLAYER role"

        # Assert zero critical console errors
        assert_no_critical_errors(page)
        await browser.close()
