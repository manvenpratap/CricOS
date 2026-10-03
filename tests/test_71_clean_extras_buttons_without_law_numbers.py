"""
test_71_clean_extras_buttons_without_law_numbers.py — Clean Extras Buttons Without Law Numbers E2E Suite

Verifies:
1. Mobile Scorer Studio Extras Buttons:
   - Extras buttons have clean labels: "Wide", "No Ball", "Leg Bye", "Bye".
   - Visible button text does NOT include raw law numbers (e.g. [Law 21⚡], [Law 22], [Law 23]).
   - +5 Penalty Runs button (#btnMobileStudioPenaltyRuns) has clean label: "+5 Penalty Runs".
   - Accessible data-tooltip attributes retain official MCC Law references and contextual help (Rule 5).
   - Tapping an extra button (Wide) opens the extra runs picker sheet (#extraRunsPickerSheet).
2. Desktop Scoring Keypad Extras Buttons:
   - Extras buttons have clean labels: "Wide", "No Ball", "Leg Bye", "Bye".
   - Visible button text does NOT include raw law numbers (e.g. [Law 21⚡], [Law 22], [Law 23]).
   - +5 Penalty Runs button (#btnStudioPenaltyRuns) has clean label: "+5 Penalty Runs" without [Law 41/42 & 28.3].
   - Accessible data-tooltip attributes retain official MCC Law references and contextual help.
   - Clicking Wide opens #modalExtraPicker; clicking +5 Penalty Runs opens #modalPenaltyRuns.
3. Zero Critical Console Errors (Rule 4).
4. Local screenshots saved to tests/screenshots/.
"""

import sys
import pathlib
import pytest

ROOT_DIR = pathlib.Path(__file__).parent.parent.resolve()
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from playwright.async_api import async_playwright
from tests.helpers import save_screenshot_async, assert_no_critical_errors

INDEX_HTML = (ROOT_DIR / "dist" / "index.html").as_uri()
MOBILE_HTML = (ROOT_DIR / "dist" / "mobile.html").as_uri()


@pytest.mark.asyncio
async def test_mobile_extras_buttons_clean_labels():
    """Verify Mobile Scorer Studio extras buttons have clean labels without law numbers."""
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

        # 1. Switch to SCORER persona
        await page.evaluate("""() => {
            if (window.cricosMobileApp) {
                window.cricosMobileApp.switchUserPersona('SCORER');
            }
        }""")
        await page.wait_for_timeout(300)

        # 2. Verify Scorer Studio Pad exists
        scorer_pad = await page.query_selector("#mobileScorerStudioPad")
        assert scorer_pad is not None, "#mobileScorerStudioPad must exist for SCORER persona"

        # 3. Verify clean labels for all 4 extras buttons
        wide_btn = await page.query_selector("button[data-extra='WIDE']")
        assert wide_btn is not None, "Wide button must exist"
        wide_text = (await wide_btn.inner_text()).strip()
        assert wide_text == "Wide", f"Expected Wide button text to be 'Wide', got: '{wide_text}'"
        assert "[Law" not in wide_text, f"Wide button must not contain law number, got: '{wide_text}'"

        nb_btn = await page.query_selector("button[data-extra='NO_BALL']")
        assert nb_btn is not None, "No Ball button must exist"
        nb_text = (await nb_btn.inner_text()).strip()
        assert nb_text == "No Ball", f"Expected No Ball button text to be 'No Ball', got: '{nb_text}'"
        assert "[Law" not in nb_text, f"No Ball button must not contain law number, got: '{nb_text}'"

        lb_btn = await page.query_selector("button[data-extra='LEG_BYE']")
        assert lb_btn is not None, "Leg Bye button must exist"
        lb_text = (await lb_btn.inner_text()).strip()
        assert lb_text == "Leg Bye", f"Expected Leg Bye button text to be 'Leg Bye', got: '{lb_text}'"
        assert "[Law" not in lb_text, f"Leg Bye button must not contain law number, got: '{lb_text}'"

        bye_btn = await page.query_selector("button[data-extra='BYE']")
        assert bye_btn is not None, "Bye button must exist"
        bye_text = (await bye_btn.inner_text()).strip()
        assert bye_text == "Bye", f"Expected Bye button text to be 'Bye', got: '{bye_text}'"
        assert "[Law" not in bye_text, f"Bye button must not contain law number, got: '{bye_text}'"

        # 4. Verify +5 Penalty Runs button label
        penalty_btn = await page.query_selector("#btnMobileStudioPenaltyRuns")
        assert penalty_btn is not None, "#btnMobileStudioPenaltyRuns must exist"
        penalty_text = (await penalty_btn.inner_text()).strip()
        assert "+5 Penalty Runs" in penalty_text, f"Expected '+5 Penalty Runs', got: '{penalty_text}'"
        assert "[Law" not in penalty_text, f"Penalty Runs button must not contain law numbers, got: '{penalty_text}'"

        # 5. Verify tooltips preserve contextual Law references (Rule 5)
        wide_tooltip = await wide_btn.get_attribute("data-tooltip")
        assert wide_tooltip and "MCC Law 22" in wide_tooltip, f"Wide tooltip must reference MCC Law 22, got: {wide_tooltip}"

        nb_tooltip = await nb_btn.get_attribute("data-tooltip")
        assert nb_tooltip and "MCC Law 21" in nb_tooltip, f"No Ball tooltip must reference MCC Law 21, got: {nb_tooltip}"

        lb_tooltip = await lb_btn.get_attribute("data-tooltip")
        assert lb_tooltip and "MCC Law 23" in lb_tooltip, f"Leg Bye tooltip must reference MCC Law 23, got: {lb_tooltip}"

        bye_tooltip = await bye_btn.get_attribute("data-tooltip")
        assert bye_tooltip and "MCC Law 23" in bye_tooltip, f"Bye tooltip must reference MCC Law 23, got: {bye_tooltip}"

        # Scroll scoring pad into view and hide toast
        await page.evaluate("""() => {
            const pad = document.getElementById('mobileScorerStudioPad');
            if (pad) pad.scrollIntoView({ behavior: 'instant', block: 'center' });
            const toast = document.getElementById('mobileToastContainer');
            if (toast) toast.style.display = 'none';
        }""")
        await page.wait_for_timeout(200)
        # Save screenshot of clean scoring pad
        await save_screenshot_async(page, "test_71_mobile_clean_extras_pad.png")

        # 6. Verify clicking Wide opens extra runs picker sheet
        await wide_btn.click()
        await page.wait_for_timeout(300)
        picker_sheet = await page.query_selector("#extraRunsPickerSheet")
        assert picker_sheet is not None, "#extraRunsPickerSheet must open when Wide is tapped"

        assert_no_critical_errors(page)
        await browser.close()


@pytest.mark.asyncio
async def test_desktop_extras_buttons_clean_labels():
    """Verify Desktop Scoring Keypad extras buttons have clean labels without law numbers."""
    console_errors = []
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await ctx.new_page()

        page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: console_errors.append(f"PAGE ERROR: {e}"))
        page._console_errors = console_errors

        await page.goto(INDEX_HTML, wait_until="networkidle")
        await page.wait_for_timeout(400)

        # 1. Switch to SCORER persona on desktop and activate studio tab
        await page.evaluate("""() => {
            if (typeof selectPersona === 'function') {
                selectPersona('SCORER');
            } else if (typeof currentUser !== 'undefined') {
                currentUser.persona = 'SCORER';
            }
            if (typeof switchTab === 'function') {
                switchTab('studio');
            }
        }""")
        await page.wait_for_timeout(300)

        # 2. Verify clean labels for all 4 desktop extras buttons
        wide_btn = await page.query_selector("button[data-extra='WIDE']")
        assert wide_btn is not None, "Desktop Wide button must exist"
        wide_text = (await wide_btn.inner_text()).strip()
        assert wide_text == "Wide", f"Expected Wide button text to be 'Wide', got: '{wide_text}'"
        assert "[Law" not in wide_text, f"Wide button must not contain law number, got: '{wide_text}'"

        nb_btn = await page.query_selector("button[data-extra='NO_BALL']")
        assert nb_btn is not None, "Desktop No Ball button must exist"
        nb_text = (await nb_btn.inner_text()).strip()
        assert nb_text == "No Ball", f"Expected No Ball button text to be 'No Ball', got: '{nb_text}'"
        assert "[Law" not in nb_text, f"No Ball button must not contain law number, got: '{nb_text}'"

        lb_btn = await page.query_selector("button[data-extra='LEG_BYE']")
        assert lb_btn is not None, "Desktop Leg Bye button must exist"
        lb_text = (await lb_btn.inner_text()).strip()
        assert lb_text == "Leg Bye", f"Expected Leg Bye button text to be 'Leg Bye', got: '{lb_text}'"
        assert "[Law" not in lb_text, f"Leg Bye button must not contain law number, got: '{lb_text}'"

        bye_btn = await page.query_selector("button[data-extra='BYE']")
        assert bye_btn is not None, "Desktop Bye button must exist"
        bye_text = (await bye_btn.inner_text()).strip()
        assert bye_text == "Bye", f"Expected Bye button text to be 'Bye', got: '{bye_text}'"
        assert "[Law" not in bye_text, f"Bye button must not contain law number, got: '{bye_text}'"

        # 3. Verify +5 Penalty Runs button label
        penalty_btn = await page.query_selector("#btnStudioPenaltyRuns")
        assert penalty_btn is not None, "#btnStudioPenaltyRuns must exist"
        penalty_text = (await penalty_btn.inner_text()).strip()
        assert "+5 Penalty Runs" in penalty_text, f"Expected '+5 Penalty Runs', got: '{penalty_text}'"
        assert "[Law" not in penalty_text, f"Penalty Runs button must not contain law numbers, got: '{penalty_text}'"

        # 4. Verify tooltips preserve contextual Law references
        wide_tooltip = await wide_btn.get_attribute("data-tooltip")
        assert wide_tooltip and "MCC Law 22" in wide_tooltip, f"Wide tooltip must reference MCC Law 22, got: {wide_tooltip}"

        nb_tooltip = await nb_btn.get_attribute("data-tooltip")
        assert nb_tooltip and "MCC Law 21" in nb_tooltip, f"No Ball tooltip must reference MCC Law 21, got: {nb_tooltip}"

        lb_tooltip = await lb_btn.get_attribute("data-tooltip")
        assert lb_tooltip and "MCC Law 23" in lb_tooltip, f"Leg Bye tooltip must reference MCC Law 23, got: {lb_tooltip}"

        bye_tooltip = await bye_btn.get_attribute("data-tooltip")
        assert bye_tooltip and "MCC Law 23" in bye_tooltip, f"Bye tooltip must reference MCC Law 23, got: {bye_tooltip}"

        penalty_tooltip = await penalty_btn.get_attribute("data-tooltip")
        assert penalty_tooltip and "MCC Laws 41/42" in penalty_tooltip, f"Penalty Runs tooltip must reference MCC Laws 41/42, got: {penalty_tooltip}"

        # Scroll cardStudioKeypad into view and hide toast
        await page.evaluate("""() => {
            const pad = document.getElementById('cardStudioKeypad');
            if (pad) pad.scrollIntoView({ behavior: 'instant', block: 'center' });
            const toasts = document.getElementById('toastContainer');
            if (toasts) toasts.style.display = 'none';
        }""")
        await page.wait_for_timeout(200)
        # Save screenshot of clean scoring pad on desktop
        await save_screenshot_async(page, "test_71_desktop_clean_extras_pad.png")

        # 5. Verify clicking Wide opens extra picker modal
        await page.evaluate("""() => {
            const btn = document.querySelector("button[data-extra='WIDE']");
            if (btn) btn.click();
        }""")
        await page.wait_for_timeout(300)
        picker_modal = await page.query_selector("#modalExtraPicker.active")
        assert picker_modal is not None, "#modalExtraPicker must be active when Wide is clicked"

        # Close extra picker modal
        await page.evaluate("""() => {
            if (typeof closeStudioExtraPicker === 'function') {
                closeStudioExtraPicker();
            }
        }""")
        await page.wait_for_timeout(200)

        # 6. Verify clicking +5 Penalty Runs opens penalty runs modal
        await page.evaluate("""() => {
            const btn = document.getElementById('btnStudioPenaltyRuns');
            if (btn) btn.click();
        }""")
        await page.wait_for_timeout(300)
        penalty_modal = await page.query_selector("#modalPenaltyRuns.active")
        assert penalty_modal is not None, "#modalPenaltyRuns must be active when +5 Penalty Runs is clicked"

        # Save screenshot
        await save_screenshot_async(page, "test_71_desktop_penalty_modal.png")
        assert_no_critical_errors(page)
        await browser.close()
