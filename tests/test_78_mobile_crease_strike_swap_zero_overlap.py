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
async def test_mobile_crease_strike_swap_zero_overlap():
    """Verify Mobile Crease Strike Swap Button placement: zero card overlap and >=44px ergonomic touch bounds."""
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # -------------------------------------------------------------
        # 1. Compact Viewport (360x780) Layout & Zero Collision Checks
        # -------------------------------------------------------------
        mobile_url = f"file://{os.path.abspath('mobile.html')}"
        await page.set_viewport_size({"width": 360, "height": 780})
        await page.goto(mobile_url, wait_until="networkidle")
        await page.wait_for_timeout(300)

        # Switch to SCORER persona
        await page.evaluate("() => window.cricosMobileApp.switchUserPersona('SCORER')")
        await page.wait_for_timeout(300)

        # Header row and controls exist
        header_row = await page.query_selector(".mobile-crease-header-row")
        assert header_row is not None and await header_row.is_visible(), "Crease action header row must be visible"

        swap_btn = await page.query_selector("#btnMobileSwapStrike")
        assert swap_btn is not None and await swap_btn.is_visible(), "Swap strike button must be visible for Scorer"
        btn_class = await swap_btn.get_attribute("class")
        assert "btn-swap-strike-bridge" in (btn_class or ""), "Must maintain btn-swap-strike-bridge class"

        # Check accessibility attributes
        tooltip = await swap_btn.get_attribute("data-tooltip")
        assert tooltip and "Rotate strike manually" in tooltip, "Must have informative tooltip"
        aria_label = await swap_btn.get_attribute("aria-label")
        assert aria_label == "Swap Strike", "Must have accessible aria-label"

        # Check touch target size (Apple HIG / WCAG 2.5.5 >= 44x44px)
        btn_box = await swap_btn.bounding_box()
        assert btn_box is not None, "Button bounding box must exist"
        assert btn_box["height"] >= 44.0, f"Swap button height must be >= 44px, got {btn_box['height']}"
        assert btn_box["width"] >= 44.0, f"Swap button width must be >= 44px, got {btn_box['width']}"

        # Check batter cards bounding boxes
        striker = await page.query_selector("#mobileStrikerCard")
        non_striker = await page.query_selector("#mobileNonStrikerCard")
        assert striker is not None and await striker.is_visible()
        assert non_striker is not None and await non_striker.is_visible()

        striker_box = await striker.bounding_box()
        non_box = await non_striker.bounding_box()
        assert striker_box is not None and non_box is not None

        # Verify ZERO bounding box overlap between swap button and striker card
        overlap_striker = not (
            btn_box["x"] + btn_box["width"] <= striker_box["x"] or
            btn_box["x"] >= striker_box["x"] + striker_box["width"] or
            btn_box["y"] + btn_box["height"] <= striker_box["y"] or
            btn_box["y"] >= striker_box["y"] + striker_box["height"]
        )
        assert not overlap_striker, f"Swap button must not overlap Striker card! btn={btn_box}, card={striker_box}"

        # Verify ZERO bounding box overlap between swap button and non-striker card
        overlap_non_striker = not (
            btn_box["x"] + btn_box["width"] <= non_box["x"] or
            btn_box["x"] >= non_box["x"] + non_box["width"] or
            btn_box["y"] + btn_box["height"] <= non_box["y"] or
            btn_box["y"] >= non_box["y"] + non_box["height"]
        )
        assert not overlap_non_striker, f"Swap button must not overlap Non-Striker card! btn={btn_box}, card={non_box}"

        # Verify swap button is positioned above the cards
        assert btn_box["y"] + btn_box["height"] <= striker_box["y"] + 2.0, "Swap button must sit above striker card"

        # Bowler change button touch bounds
        bowler_btn = await page.query_selector("#btnMobileChangeBowler")
        assert bowler_btn is not None and await bowler_btn.is_visible()
        bowler_box = await bowler_btn.bounding_box()
        assert bowler_box is not None
        assert bowler_box["height"] >= 44.0, f"Bowler change button must be >= 44px height, got {bowler_box['height']}"

        # -------------------------------------------------------------
        # 2. Strike Rotation Functional Action Verification
        # -------------------------------------------------------------
        initial_striker = await page.evaluate("() => window.cricosMobileApp.matchState.striker.name")
        initial_non_striker = await page.evaluate("() => window.cricosMobileApp.matchState.nonStriker.name")

        await page.click("#btnMobileSwapStrike")
        await page.wait_for_timeout(300)

        new_striker = await page.evaluate("() => window.cricosMobileApp.matchState.striker.name")
        new_non_striker = await page.evaluate("() => window.cricosMobileApp.matchState.nonStriker.name")

        assert new_striker == initial_non_striker, f"Striker should now be {initial_non_striker}, got {new_striker}"
        assert new_non_striker == initial_striker, f"Non-striker should now be {initial_striker}, got {new_non_striker}"

        # -------------------------------------------------------------
        # 3. Theme Consistency Verification
        # -------------------------------------------------------------
        for theme in ["stadium", "swiss", "nordic"]:
            await page.evaluate(f"() => {{ document.body.setAttribute('data-theme', '{theme}'); window.cricosMobileApp.theme = '{theme}'; window.cricosMobileApp.render(); }}")
            await page.wait_for_timeout(150)
            swap_btn_themed = await page.query_selector("#btnMobileSwapStrike")
            assert swap_btn_themed is not None and await swap_btn_themed.is_visible(), f"Swap button must be visible in {theme} theme"

        # -------------------------------------------------------------
        # 4. Zero Critical Console Errors
        # -------------------------------------------------------------
        assert_no_critical_errors(page)
        await browser.close()
