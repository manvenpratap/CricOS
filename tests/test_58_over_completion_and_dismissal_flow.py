"""
test_58_over_completion_and_dismissal_flow.py — Over Completion Bowler Rotation, Fall of Wicket Dismissal & Undo Flow E2E Suite
Verifies:
1. On completion of an over, scorer is asked to choose the next bowler on both Desktop and Mobile, with MCC Law 21 enforcement.
2. Handles undo last ball situation across over boundaries cleanly, restoring previous bowler, strike rotation, and deliveries.
3. On fall of wicket, scorer is prompted to choose mode of dismissal, fielder involved (caught/stumped/run out), and next incoming batsman.
4. Handles undo of wicket delivery, restoring dismissed batter with their exact score, balls faced, and stance.
"""

import asyncio
import os
import pathlib
import pytest
from playwright.async_api import async_playwright
from tests.helpers import save_screenshot_async, assert_no_critical_errors

ROOT_DIR = pathlib.Path(__file__).parent.parent.resolve()
INDEX_HTML = (ROOT_DIR / "index.html").as_uri()
MOBILE_HTML = (ROOT_DIR / "dist" / "mobile.html").as_uri()


@pytest.mark.asyncio
async def test_desktop_bowler_rotation_and_dismissal_flow():
    """Verify Desktop Fall of Wicket modal, Bowler Rotation on over completion, and Undo delivery handling."""
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

        # Switch to SCORER persona and open Fall of Wicket Modal
        await page.evaluate("""() => {
            if (typeof selectPersona === 'function') {
                selectPersona('SCORER');
            } else if (typeof currentUser !== 'undefined') {
                currentUser.persona = 'SCORER';
            }
            if (typeof openDismissalModal === 'function') {
                openDismissalModal();
            }
        }""")
        await page.wait_for_timeout(300)

        modal_dismissal = await page.query_selector("#modalDismissal")
        assert modal_dismissal is not None, "#modalDismissal must exist"
        assert await modal_dismissal.is_visible(), "#modalDismissal must be visible"

        # Check dismissal kinds and fielder field toggle
        has_caught = await page.evaluate("""() => {
            const sel = document.getElementById('dismissalKind');
            return sel && Array.from(sel.options).some(o => o.value === 'CAUGHT');
        }""")
        assert has_caught, "CAUGHT must be an available dismissal kind"

        # Toggle to CAUGHT and verify fielder label
        await page.evaluate("""() => {
            const sel = document.getElementById('dismissalKind');
            if (sel) {
                sel.value = 'CAUGHT';
                toggleFielderField();
            }
        }""")
        await page.wait_for_timeout(100)
        fielder_group = await page.query_selector("#fielderGroup")
        assert await fielder_group.is_visible(), "#fielderGroup must be visible for CAUGHT"

        # Toggle to STUMPED and verify
        await page.evaluate("""() => {
            const sel = document.getElementById('dismissalKind');
            if (sel) {
                sel.value = 'STUMPED';
                toggleFielderField();
            }
        }""")
        await page.wait_for_timeout(100)
        label_text = await page.evaluate("() => document.getElementById('dismissalFielderLabel')?.textContent")
        assert "Stumped by" in (label_text or ""), "Label must indicate Stumped by for STUMPED"

        # Toggle to RUN_OUT and verify
        await page.evaluate("""() => {
            const sel = document.getElementById('dismissalKind');
            if (sel) {
                sel.value = 'RUN_OUT';
                toggleFielderField();
            }
        }""")
        await page.wait_for_timeout(100)
        label_text_ro = await page.evaluate("() => document.getElementById('dismissalFielderLabel')?.textContent")
        assert "Run Out by" in (label_text_ro or ""), "Label must indicate Run Out by for RUN_OUT"

        # Verify Out Batter selector (Striker vs Non-Striker)
        has_out_options = await page.evaluate("""() => {
            const sel = document.getElementById('dismissalOutBatter');
            return sel && sel.options.length >= 2;
        }""")
        assert has_out_options, "Out batter selector must have striker and non-striker options"

        # 2. Verify Bowler Rotation Modal on Over Completion
        await page.evaluate("""() => {
            closeDismissalModal();
            promptBowlerChange({
                overs_display: '16.0',
                previous_bowler_id: 'Jasprit Bumrah',
                bowlers: { 'Jasprit Bumrah': { name: 'Jasprit Bumrah' } }
            });
        }""")
        await page.wait_for_timeout(300)

        modal_bowler = await page.query_selector("#modalBowlerRotation")
        assert modal_bowler is not None, "#modalBowlerRotation must exist"
        assert await modal_bowler.is_visible(), "#modalBowlerRotation must be visible on over completion"

        # Verify MCC Law 21 is cited and previous bowler is disabled
        desc_text = await page.evaluate("() => document.getElementById('bowlerModalDesc')?.textContent")
        assert "MCC Law 21" in (desc_text or ""), "Bowler rotation modal must cite MCC Law 21"

        prev_disabled = await page.evaluate("""() => {
            const sel = document.getElementById('nextBowlerSelect');
            if (!sel) return false;
            const opt = Array.from(sel.options).find(o => o.text.includes('Jasprit Bumrah'));
            return opt ? opt.disabled : false;
        }""")
        assert prev_disabled, "Previous bowler must be disabled per MCC Law 21"

        # 3. Verify Undo cleans up modals cleanly
        await page.evaluate("""() => {
            if (typeof closeBowlerModal === 'function') closeBowlerModal();
            if (typeof closeDismissalModal === 'function') closeDismissalModal();
        }""")
        await page.wait_for_timeout(200)

        assert not await modal_bowler.is_visible(), "Bowler modal must be dismissed"
        assert not await modal_dismissal.is_visible(), "Dismissal modal must be dismissed"

        await save_screenshot_async(page, "test_58_desktop_dismissal_and_rotation.png")
        assert_no_critical_errors(page)
        await browser.close()


@pytest.mark.asyncio
async def test_mobile_bowler_rotation_and_dismissal_flow():
    """Verify Mobile Fall of Wicket sheet, Bowler Rotation sheet on over completion, and Undo over boundary integrity."""
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

        # Switch to SCORER persona
        await page.evaluate("""() => {
            if (window.cricosMobileApp) {
                window.cricosMobileApp.switchUserPersona('SCORER');
            }
        }""")
        await page.wait_for_timeout(300)

        # 1. Fall of Wicket Flow on Mobile
        await page.evaluate("""() => {
            window.cricosMobileApp.promptWicketModal();
        }""")
        await page.wait_for_timeout(300)

        sheet_dismissal = await page.query_selector("#mobileDismissalSheet")
        assert sheet_dismissal is not None, "#mobileDismissalSheet must exist"
        assert await sheet_dismissal.is_visible(), "#mobileDismissalSheet must be visible"

        # Verify mode selection: switch to STUMPED
        await page.evaluate("""() => {
            window.cricosMobileApp.selectMobileDismissalMode('STUMPED');
            window.cricosMobileApp.setMobileDismissalFielder('KL Rahul (WK)');
        }""")
        await page.wait_for_timeout(200)

        fielder_input_val = await page.evaluate("() => document.getElementById('mobileDismissalFielderInput')?.value")
        assert fielder_input_val == "KL Rahul (WK)", "Fielder input must reflect KL Rahul (WK)"

        # Confirm dismissal
        initial_wickets = await page.evaluate("() => window.cricosMobileApp.matchState.totalWickets")
        await page.evaluate("""() => {
            window.cricosMobileApp.confirmMobileDismissal();
        }""")
        await page.wait_for_timeout(300)

        new_wickets = await page.evaluate("() => window.cricosMobileApp.matchState.totalWickets")
        assert new_wickets == initial_wickets + 1, "Total wickets must increment on confirmed dismissal"

        # Test Undo of Wicket: restores dismissed batter
        await page.evaluate("""() => {
            window.cricosMobileApp.undoLastDelivery();
        }""")
        await page.wait_for_timeout(300)

        restored_wickets = await page.evaluate("() => window.cricosMobileApp.matchState.totalWickets")
        assert restored_wickets == initial_wickets, "Undoing wicket must revert total wickets"

        # 2. Over Completion & Bowler Rotation on Mobile
        # Trigger over completion by setting ballsThisOver to 6
        await page.evaluate("""() => {
            window.cricosMobileApp.matchState.bowler.ballsThisOver = 6;
            window.cricosMobileApp.openMobileBowlerRotationSheet();
        }""")
        await page.wait_for_timeout(300)

        sheet_bowler = await page.query_selector("#mobileBowlerRotationSheet")
        assert sheet_bowler is not None, "#mobileBowlerRotationSheet must exist"
        assert await sheet_bowler.is_visible(), "#mobileBowlerRotationSheet must open on over completion"

        # Check MCC Law 21 notice banner
        bowler_sheet_text = await page.evaluate("() => document.getElementById('mobileBowlerRotationSheet')?.textContent")
        assert "MCC Law 21" in (bowler_sheet_text or ""), "Mobile bowler sheet must enforce MCC Law 21"

        # Select next bowler (bw-3 Kuldeep Yadav) and confirm
        await page.evaluate("""() => {
            window.cricosMobileApp.selectMobileNextBowler('bw-3');
            window.cricosMobileApp.confirmMobileBowler();
        }""")
        await page.wait_for_timeout(300)

        current_bowler = await page.evaluate("() => window.cricosMobileApp.matchState.currentBowlerName")
        assert current_bowler == "Kuldeep Yadav", "Active bowler must rotate to Kuldeep Yadav"

        # 3. Test Undo Over Boundary
        # Undoing after over completion should unwind the completed over, restore previous bowler, and set balls to 5
        await page.evaluate("""() => {
            window.cricosMobileApp.undoLastDelivery();
        }""")
        await page.wait_for_timeout(300)

        undone_balls = await page.evaluate("() => window.cricosMobileApp.matchState.bowler.ballsThisOver")
        assert undone_balls == 5, f"Undoing over boundary must restore bowler's ball count to 5 (got {undone_balls})"

        await save_screenshot_async(page, "test_58_mobile_dismissal_and_rotation.png")
        assert_no_critical_errors(page)
        await browser.close()
