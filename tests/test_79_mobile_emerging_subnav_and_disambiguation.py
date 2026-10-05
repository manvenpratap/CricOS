import asyncio
import os
import sys
import pathlib
import pytest
from playwright.async_api import async_playwright

ROOT_DIR = pathlib.Path(__file__).parent.parent.resolve()
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from tests.helpers import assert_no_critical_errors

@pytest.mark.asyncio
async def test_mobile_emerging_subnav_and_disambiguation():
    """Verify Mobile Studios emerging drawer, topbar SYNCED disambiguation, and removal of top venue selector."""
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        mobile_url = f"file://{os.path.abspath('dist/mobile.html')}"
        await page.set_viewport_size({"width": 390, "height": 844})
        await page.goto(mobile_url, wait_until="networkidle")
        await page.wait_for_timeout(300)

        # -------------------------------------------------------------
        # 1. Disambiguation: Topbar SYNCED vs Match Live Pill
        # -------------------------------------------------------------
        header_pulse = await page.query_selector("#mobileHeaderLivePulse")
        assert header_pulse is not None and await header_pulse.is_visible(), "Header live pulse element must exist"
        pulse_text = (await header_pulse.text_content()).strip()
        assert "SYNCED" in pulse_text, f"Header pulse must indicate engine sync status (SYNCED), got: {pulse_text}"
        assert "LIVE" not in pulse_text, "Duplicate 'LIVE' in header must be disambiguated"

        match_live_pill = await page.query_selector("#mobileLiveMatchPill")
        assert match_live_pill is not None and await match_live_pill.is_visible(), "Match live status pill must exist"
        match_live_text = (await match_live_pill.text_content()).strip()
        assert "Live" in match_live_text, f"Match pill must display 'Live', got: {match_live_text}"
        assert await page.query_selector("#mobileLiveMatchPill .live-pulse-dot") is not None, "Match live pulse dot must exist"

        # -------------------------------------------------------------
        # 2. Stadium Venue Selector Removed from beside red Live
        # -------------------------------------------------------------
        venue_badge = await page.query_selector("#mobileActiveVenueBadge")
        assert venue_badge is None, "#mobileActiveVenueBadge beside red Live must be completely removed"

        # -------------------------------------------------------------
        # 3. Top of Match View Cleared of Top Subnav
        # -------------------------------------------------------------
        scroll_body = await page.query_selector("#mobileScrollBody")
        assert scroll_body is not None
        body_subnav = await scroll_body.query_selector(".mobile-subnav")
        assert body_subnav is None, ".mobile-subnav must not be rendered at the top of scroll body"

        # -------------------------------------------------------------
        # 4. Floating Studio Trigger Pill Anchored Above Bottom Nav
        # -------------------------------------------------------------
        trigger_pill = await page.query_selector("#btnToggleMatchStudios")
        assert trigger_pill is not None and await trigger_pill.is_visible(), "Floating trigger pill must exist"
        trigger_text = (await trigger_pill.text_content()).strip()
        assert "Live Score" in trigger_text, f"Trigger pill should show active studio, got: {trigger_text}"

        trigger_box = await trigger_pill.bounding_box()
        assert trigger_box is not None
        assert trigger_box["height"] >= 44.0, f"Trigger pill touch height must be >= 44px, got {trigger_box['height']}"

        # -------------------------------------------------------------
        # 5. Emerging Drawer and Interactive Toggle
        # -------------------------------------------------------------
        drawer = await page.query_selector("#mobileMatchSubnavDrawer")
        assert drawer is not None, "Emerging match studios drawer must exist in DOM"
        drawer_class = await drawer.get_attribute("class") or ""
        assert "open" not in drawer_class, "Drawer must initially be closed"

        # Click trigger to open drawer
        await trigger_pill.click()
        await page.wait_for_timeout(200)

        drawer = await page.query_selector("#mobileMatchSubnavDrawer")
        drawer_class = await drawer.get_attribute("class") or ""
        assert "open" in drawer_class, "Drawer must be open after tapping trigger pill"

        # Check 6 subnav options inside drawer
        subnav_buttons = await page.query_selector_all(".mobile-subnav .mobile-subnav-btn")
        assert len(subnav_buttons) == 6, f"Drawer must contain 6 studio options, got {len(subnav_buttons)}"
        for btn in subnav_buttons:
            box = await btn.bounding_box()
            assert box is not None and box["height"] >= 44.0, "Subnav buttons must meet >= 44px touch target"
            tooltip = await btn.get_attribute("data-tooltip")
            assert tooltip, "Each subnav button must have data-tooltip"

        # -------------------------------------------------------------
        # 6. Studio Switching and Auto-Close
        # -------------------------------------------------------------
        wagon_btn = await page.query_selector('.mobile-subnav-btn[data-subtab="WAGON"]')
        assert wagon_btn is not None
        await wagon_btn.click()
        await page.wait_for_timeout(200)

        # Drawer should be auto-closed
        drawer = await page.query_selector("#mobileMatchSubnavDrawer")
        drawer_class = await drawer.get_attribute("class") or ""
        assert "open" not in drawer_class, "Drawer must auto-close after subtab selection"

        active_tab = await page.evaluate("() => window.cricosMobileApp.matchSubTab")
        assert active_tab == "WAGON", f"Expected active subtab WAGON, got: {active_tab}"

        trigger_pill = await page.query_selector("#btnToggleMatchStudios")
        trigger_text = (await trigger_pill.text_content()).strip()
        assert "Wagon Wheel" in trigger_text, f"Trigger pill must update to Wagon Wheel, got: {trigger_text}"

        # -------------------------------------------------------------
        # 7. Close via Close Button and Escape Key
        # -------------------------------------------------------------
        # Open drawer again
        await trigger_pill.click()
        await page.wait_for_timeout(150)
        drawer = await page.query_selector("#mobileMatchSubnavDrawer")
        assert "open" in (await drawer.get_attribute("class") or "")

        # Close via close button
        close_btn = await page.query_selector(".mobile-subnav-drawer-close")
        assert close_btn is not None
        await close_btn.click()
        await page.wait_for_timeout(150)
        drawer = await page.query_selector("#mobileMatchSubnavDrawer")
        assert "open" not in (await drawer.get_attribute("class") or "")

        # Open and close via Escape
        trigger_pill = await page.query_selector("#btnToggleMatchStudios")
        await trigger_pill.click()
        await page.wait_for_timeout(150)
        drawer = await page.query_selector("#mobileMatchSubnavDrawer")
        assert "open" in (await drawer.get_attribute("class") or "")

        await page.keyboard.press("Escape")
        await page.wait_for_timeout(150)
        drawer = await page.query_selector("#mobileMatchSubnavDrawer")
        assert "open" not in (await drawer.get_attribute("class") or "")

        # -------------------------------------------------------------
        # 8. Zero Critical Errors
        # -------------------------------------------------------------
        assert_no_critical_errors(page)
        await browser.close()
