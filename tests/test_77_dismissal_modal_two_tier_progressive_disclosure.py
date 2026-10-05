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
async def test_two_tier_dismissal_progressive_disclosure():
    """Verify Mobile and Desktop dismissal dialog two-tier progressive disclosure according to Hick's Law."""
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # -------------------------------------------------------------
        # 1. Desktop Two-Tier Dismissal Modal Verification
        # -------------------------------------------------------------
        index_url = f"file://{os.path.abspath('index.html')}"
        await page.set_viewport_size({"width": 1440, "height": 900})
        await page.goto(index_url, wait_until="networkidle")
        await page.wait_for_timeout(400)

        # Open Desktop Dismissal Modal
        await page.evaluate("""() => {
            if (typeof selectPersona === 'function') selectPersona('SCORER');
            if (typeof openDismissalModal === 'function') openDismissalModal();
        }""")
        await page.wait_for_timeout(300)

        modal = await page.query_selector("#modalDismissal")
        assert modal is not None and await modal.is_visible(), "Desktop modalDismissal must be visible"

        # Check 4 Tier 1 buttons exist
        btn_caught = await page.query_selector("#btnDismissModeCaught")
        btn_bowled = await page.query_selector("#btnDismissModeBowled")
        btn_lbw = await page.query_selector("#btnDismissModeLbw")
        btn_runout = await page.query_selector("#btnDismissModeRunOut")

        assert btn_caught is not None, "Desktop Tier 1 must have Caught card"
        assert btn_bowled is not None, "Desktop Tier 1 must have Bowled card"
        assert btn_lbw is not None, "Desktop Tier 1 must have LBW card"
        assert btn_runout is not None, "Desktop Tier 1 must have Run Out card"

        # Tier 2 collapsible details should exist
        rare_details = await page.query_selector("#desktopRareDismissalDetails")
        assert rare_details is not None, "#desktopRareDismissalDetails must exist"
        is_open = await page.evaluate("() => document.getElementById('desktopRareDismissalDetails')?.open")
        assert not is_open, "Tier 2 rare details should be collapsed by default"

        # Click Caught card
        await btn_caught.click()
        await page.wait_for_timeout(150)
        kind_val = await page.evaluate("() => document.getElementById('dismissalKind')?.value")
        assert kind_val == "CAUGHT", "Clicking Caught card must set dismissalKind to CAUGHT"
        fielder_label = await page.evaluate("() => document.getElementById('dismissalFielderLabel')?.textContent")
        assert "Caught by" in (fielder_label or ""), "Caught must show Caught by fielder field"

        # Switch to Stumped via select inside details
        await page.evaluate("""() => {
            const sel = document.getElementById('dismissalKind');
            if (sel) {
                sel.value = 'STUMPED';
                syncDesktopDismissalCards();
                toggleFielderField();
            }
        }""")
        await page.wait_for_timeout(150)
        is_open_stumped = await page.evaluate("() => document.getElementById('desktopRareDismissalDetails')?.open")
        assert is_open_stumped, "Selecting Stumped must auto-expand Tier 2 details"
        summary_text = await page.evaluate("() => document.getElementById('desktopRareDismissalSummary')?.textContent")
        assert "Stumped" in (summary_text or ""), "Summary must indicate Stumped is active"

        # Capture Desktop Dismissal Screenshot
        os.makedirs("tests/screenshots", exist_ok=True)
        await page.screenshot(path="tests/screenshots/desktop_dismissal_two_tier.png")

        # Close Desktop Modal
        await page.evaluate("() => closeDismissalModal()")
        await page.wait_for_timeout(200)

        # -------------------------------------------------------------
        # 2. Mobile Two-Tier Dismissal Sheet Verification
        # -------------------------------------------------------------
        mobile_url = f"file://{os.path.abspath('mobile.html')}"
        await page.set_viewport_size({"width": 390, "height": 844})
        await page.goto(mobile_url, wait_until="networkidle")
        await page.wait_for_timeout(400)

        # Open Mobile Dismissal Sheet as Scorer
        await page.evaluate("""() => {
            window.cricosMobileApp.switchUserPersona('SCORER');
            window.cricosMobileApp.openMobileDismissalSheet();
        }""")
        await page.wait_for_timeout(300)

        sheet = await page.query_selector("#mobileDismissalSheet")
        assert sheet is not None and await sheet.is_visible(), "Mobile dismissal sheet must be visible"

        # Check Tier 1 primary cards: exactly 4 buttons in .dismissal-tier1-grid
        tier1_btns = await page.query_selector_all(".dismissal-tier1-grid button")
        assert len(tier1_btns) == 4, f"Tier 1 grid must contain exactly 4 cards, found {len(tier1_btns)}"

        # Verify rare grid is collapsed initially
        rare_grid = await page.query_selector("#rareDismissalModesGrid")
        assert rare_grid is None, "#rareDismissalModesGrid should not be rendered when collapsed"

        # Capture Mobile Collapsed Tier 1 Screenshot
        await page.screenshot(path="tests/screenshots/mobile_dismissal_tier1_collapsed.png")

        # Check Toggle Button exists
        btn_toggle_rare = await page.query_selector("#btnToggleRareDismissals")
        assert btn_toggle_rare is not None, "#btnToggleRareDismissals must exist"

        # Click Toggle Button to expand 8 rare modes
        await btn_toggle_rare.click()
        await page.wait_for_timeout(250)

        rare_grid_expanded = await page.query_selector("#rareDismissalModesGrid")
        assert rare_grid_expanded is not None and await rare_grid_expanded.is_visible(), "Rare grid must be visible after click"
        rare_btns = await page.query_selector_all("#rareDismissalModesGrid button")
        assert len(rare_btns) == 8, f"Rare grid must contain exactly 8 buttons, found {len(rare_btns)}"

        # Capture Mobile Expanded Tier 2 Screenshot
        await page.screenshot(path="tests/screenshots/mobile_dismissal_tier2_expanded.png")

        # Click Stumped in Rare Grid
        btn_stumped = await page.query_selector("#rareDismissalModesGrid button[data-mode='STUMPED']")
        assert btn_stumped is not None, "Stumped button must exist in rare grid"
        await btn_stumped.click()
        await page.wait_for_timeout(200)

        # Verify mode is now STUMPED and fielder label reflects wicketkeeper
        mode_val = await page.evaluate("() => window.cricosMobileApp.pendingDismissalMode")
        assert mode_val == "STUMPED", "Mode must be STUMPED after clicking Stumped"
        fielder_hdr = await page.evaluate("() => document.querySelector('#mobileDismissalSheet')?.textContent")
        assert "Stumped by" in (fielder_hdr or ""), "Stumped must show Stumped by (Wicketkeeper) header"

        # Verify toggle button badge indicates Stumped active
        toggle_text = await page.evaluate("() => document.getElementById('btnToggleRareDismissals')?.textContent")
        assert "Stumped" in (toggle_text or ""), f"Toggle button should show Stumped active, got: {toggle_text}"

        # Switch back to Bowled in Tier 1
        btn_bowled_mobile = await page.query_selector(".dismissal-tier1-grid button[data-mode='BOWLED']")
        assert btn_bowled_mobile is not None
        await btn_bowled_mobile.click()
        await page.wait_for_timeout(200)
        mode_val2 = await page.evaluate("() => window.cricosMobileApp.pendingDismissalMode")
        assert mode_val2 == "BOWLED", "Mode must be BOWLED after clicking Bowled in Tier 1"

        # Zero critical console errors
        assert_no_critical_errors(page)

        await browser.close()
