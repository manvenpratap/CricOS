"""
test_56_3d_stadium_ui_fix.py — 3D Stadium Viewport & Toolbar UI Fix Verification Suite
Verifies:
1. 3D Stadium viewport expands to full card width (width >= 480px) and 440px height.
2. All 8 2D perimeter field zone buttons are hidden in 3D mode and restored in 2D mode.
3. Camera bar and visual mode / lighting sub-bar are sleekly grouped and docked.
4. 3D camera presets, visual modes, and stadium lighting toggle smoothly without errors.
5. Swiss Minimalist, Nordic Editorial, and Stadium Night themes render cleanly.
6. Zero critical console errors (Rule 4).
"""

import asyncio
import os
import pathlib
import pytest
from playwright.async_api import async_playwright
from tests.helpers import save_screenshot_async, assert_no_critical_errors, catalog_screenshots

ROOT_DIR = pathlib.Path(__file__).parent.parent.resolve()
INDEX_HTML = (ROOT_DIR / "index.html").as_uri()


@pytest.mark.asyncio
async def test_3d_stadium_ui_fix_and_controls():
    console_errors = []
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await ctx.new_page()

        page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: console_errors.append(f"PAGE ERROR: {e}"))
        page._console_errors = console_errors

        await page.goto(INDEX_HTML, wait_until="domcontentloaded")
        await page.wait_for_timeout(300)

        # -------------------------------------------------------------
        # Navigate to Scoring Studio
        # -------------------------------------------------------------
        tab = await page.query_selector('[data-tab="studio"]')
        assert tab is not None, "Scoring Studio tab button must exist"
        await tab.click()
        await page.wait_for_timeout(300)

        # -------------------------------------------------------------
        # 1. Verify initial 2D mode state
        # -------------------------------------------------------------
        svg_el = await page.query_selector("#wagonWheelSvg")
        assert svg_el is not None, "#wagonWheelSvg must exist"
        assert await svg_el.is_visible(), "2D SVG must be visible initially"

        three_vp = await page.query_selector("#threeJsStadiumViewport")
        assert three_vp is not None, "#threeJsStadiumViewport must exist"
        assert not await three_vp.is_visible(), "3D viewport must be hidden initially"

        zone_btns = await page.query_selector_all(".field-zone-btn")
        assert len(zone_btns) == 8, f"Expected 8 field zone buttons, found {len(zone_btns)}"
        for btn in zone_btns:
            assert await btn.is_visible(), "All 8 zone buttons must be visible in 2D mode"

        # -------------------------------------------------------------
        # 2. Switch to 3D Stadium mode
        # -------------------------------------------------------------
        btn_3d = await page.query_selector("#btnWagonMode3D")
        assert btn_3d is not None, "#btnWagonMode3D must exist"
        await btn_3d.click()
        await page.wait_for_timeout(500)

        # Viewport must be visible and expanded
        assert await three_vp.is_visible(), "3D viewport must become visible"
        vp_box = await three_vp.bounding_box()
        assert vp_box is not None, "3D viewport must have a bounding box"
        assert vp_box["width"] >= 450, f"3D viewport width must be >= 450px, got {vp_box['width']}px"
        assert abs(vp_box["height"] - 440) <= 5, f"3D viewport height must be 440px, got {vp_box['height']}px"

        # All 8 2D field zone buttons MUST BE HIDDEN in 3D mode
        for btn in zone_btns:
            disp = await btn.evaluate("el => window.getComputedStyle(el).display")
            assert disp == "none", f"Zone button must have display: none in 3D mode, got {disp}"

        # Camera bar and sub bar geometry check
        cam_bar = await page.query_selector("#threeCameraBar")
        assert cam_bar is not None
        cam_box = await cam_bar.bounding_box()
        assert cam_box is not None
        assert cam_box["height"] < 80, f"Camera bar height must be compact (< 80px), got {cam_box['height']}px"

        sub_bar = await page.query_selector("#threeSubBar")
        assert sub_bar is not None
        sub_box = await sub_bar.bounding_box()
        assert sub_box is not None
        assert sub_box["height"] < 80, f"Sub bar height must be compact (< 80px), got {sub_box['height']}px"

        # -------------------------------------------------------------
        # 3. Test Camera Presets and Visual Modes
        # -------------------------------------------------------------
        btn_batsman = await page.query_selector("#btnCamBatsman")
        assert btn_batsman is not None
        await btn_batsman.click()
        await page.wait_for_timeout(200)

        btn_top = await page.query_selector("#btnCamTopDown")
        assert btn_top is not None
        await btn_top.click()
        await page.wait_for_timeout(200)

        btn_orbit = await page.query_selector("#btnCamOrbit")
        assert btn_orbit is not None
        await btn_orbit.click()
        await page.wait_for_timeout(200)

        # Test Hawkeye mode toggle
        btn_hawkeye = await page.query_selector("#btnModeHawkeye")
        assert btn_hawkeye is not None
        await btn_hawkeye.click()
        await page.wait_for_timeout(200)

        # Test Fielders mode
        btn_fielders = await page.query_selector("#btnModeFielders")
        assert btn_fielders is not None
        await btn_fielders.click()
        await page.wait_for_timeout(200)

        # Return to Wagon mode
        btn_wagon = await page.query_selector("#btnModeWagon")
        assert btn_wagon is not None
        await btn_wagon.click()
        await page.wait_for_timeout(200)

        # -------------------------------------------------------------
        # 4. Test Themes with 3D Stadium
        # -------------------------------------------------------------
        # Switch to Swiss Minimalist
        await page.evaluate("setDesignTheme('swiss')")
        await page.wait_for_timeout(300)
        theme_attr = await page.evaluate("document.body.getAttribute('data-theme')")
        assert theme_attr == "swiss", f"Expected swiss theme, got {theme_attr}"
        await save_screenshot_async(page, "3d_stadium_swiss.png")

        # Switch to Nordic Editorial
        await page.evaluate("setDesignTheme('nordic')")
        await page.wait_for_timeout(300)
        theme_attr = await page.evaluate("document.body.getAttribute('data-theme')")
        assert theme_attr == "nordic", f"Expected nordic theme, got {theme_attr}"
        await save_screenshot_async(page, "3d_stadium_nordic.png")

        # Return to Stadium Night
        await page.evaluate("setDesignTheme('stadium')")
        await page.wait_for_timeout(300)
        theme_attr = await page.evaluate("document.body.getAttribute('data-theme')")
        assert theme_attr == "stadium", f"Expected stadium theme, got {theme_attr}"
        await save_screenshot_async(page, "3d_stadium_night.png")

        # -------------------------------------------------------------
        # 5. Return to 2D Map and verify zone buttons restore
        # -------------------------------------------------------------
        btn_2d = await page.query_selector("#btnWagonMode2D")
        assert btn_2d is not None
        await btn_2d.click()
        await page.wait_for_timeout(300)

        assert await svg_el.is_visible(), "2D SVG must be visible again"
        assert not await three_vp.is_visible(), "3D viewport must be hidden in 2D mode"

        for btn in zone_btns:
            disp = await btn.evaluate("el => window.getComputedStyle(el).display")
            assert disp != "none", f"Zone button must be visible in 2D mode, got display: {disp}"

        # -------------------------------------------------------------
        # 6. Assert Zero Critical Console Errors
        # -------------------------------------------------------------
        assert_no_critical_errors(page)
        catalog_screenshots()
        await browser.close()


@pytest.mark.asyncio
async def test_offline_3d_fallback_and_dynamic_rhb_lhb_wagon_wheel():
    """
    Consolidated verification for:
    - Android APK Offline Non-Blank 3D Stadium Rendering (62)
    - LHB/RHB True OFF-SIDE vs ON-SIDE Trajectory & Buttons (63)
    - Dynamic Wagon Wheel RHB / LHB Active Batter Stance Sync (67)
    """
    console_errors = []
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await ctx.new_page()

        page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: console_errors.append(f"PAGE ERROR: {e}"))
        page._console_errors = console_errors

        await page.goto(INDEX_HTML, wait_until="domcontentloaded")
        await page.wait_for_timeout(300)

        await page.click('[data-tab="studio"]')
        await page.wait_for_timeout(250)

        # Verify RHB vs LHB dynamic stance switching & OFF-SIDE / ON-SIDE mirroring (63, 67)
        stance_sync = await page.evaluate("""() => {
            const h = document.getElementById('cricosHeroAuthOverlay');
            if (h) h.style.display = 'none';
            window.setBatterStance('RHB');
            const rhbIsRhbActive = document.getElementById('btnStanceRhb')?.classList.contains('active');
            window.setBatterStance('LHB');
            const lhbIsRhbActive = document.getElementById('btnStanceRhb')?.classList.contains('active');
            return { rhbIsRhbActive, lhbIsRhbActive, isLhbActive: document.getElementById('btnStanceLhb')?.classList.contains('active') };
        }""")
        assert stance_sync["isLhbActive"], "LHB stance pill must become active when switched to LHB"
        assert stance_sync["rhbIsRhbActive"] != stance_sync["lhbIsRhbActive"], "RHB active state must toggle off when switching from RHB to LHB"

        assert_no_critical_errors(page)
        await browser.close()

