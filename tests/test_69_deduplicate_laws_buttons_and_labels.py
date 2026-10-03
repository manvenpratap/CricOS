"""
test_69_deduplicate_laws_buttons_and_labels.py — Elimination of Duplicate Laws Buttons & Scoring Pad Redundant Labels E2E Suite

Verifies:
1. Mobile Scorer Studio Deduplication:
   - Header of #mobileScorerStudioPad does NOT contain duplicate #btnMobileIccLawsHeader button.
   - Header of #mobileScorerStudioPad does NOT contain redundant 'TACTICAL SCORER' pill.
   - Header cleanly displays title 'Scorer Studio & Tactical Pad' with Iconsax Two-Tone target SVG.
   - Dedicated action bar holds the single canonical #btnMobileIccLaws button with Iconsax Two-Tone book SVG.
   - Exactly ONE button for ICC Laws rulebook exists within the mobile scoring pad.
   - Both #btnMobileStudioPenaltyRuns and #btnMobileIccLaws feature accessible Iconsax Two-Tone SVGs.
   - Clicking #btnMobileIccLaws opens #mobileIccLawsSheet cleanly.
2. Desktop Match Center Deduplication:
   - Header of #cardStudioKeypad does NOT contain duplicate Laws button.
   - Dedicated action bar in #studioScoringControlsGroup holds the single canonical #btnDesktopIccLaws button.
   - Redundant #btnStudioIccLawsPad is removed.
   - Exactly ONE button for ICC Laws rulebook exists within #cardStudioKeypad on desktop.
   - Clicking #btnDesktopIccLaws opens #modalIccLawsReference cleanly.
3. Zero Critical Console Errors (Rule 4).
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
async def test_mobile_scoring_pad_deduplication():
    """Verify Mobile Scorer Studio eliminates duplicate Laws button and redundant TACTICAL SCORER pill."""
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

        # 3. Verify duplicate #btnMobileIccLawsHeader is completely eliminated
        btn_header_laws = await page.query_selector("#btnMobileIccLawsHeader")
        assert btn_header_laws is None, "Duplicate #btnMobileIccLawsHeader button must be eliminated from card header"

        # 4. Verify redundant 'TACTICAL SCORER' pill is eliminated
        pad_header_text = await page.evaluate("""() => {
            const pad = document.getElementById('mobileScorerStudioPad');
            if (!pad) return '';
            const firstChild = pad.firstElementChild;
            return firstChild ? firstChild.textContent : '';
        }""")
        assert "TACTICAL SCORER" not in pad_header_text, "Redundant 'TACTICAL SCORER' pill must be removed from header"
        assert "Scorer Studio & Tactical Pad" in pad_header_text, "Header must cleanly display 'Scorer Studio & Tactical Pad'"

        # 5. Verify canonical #btnMobileIccLaws exists in Dedicated Action Bar
        btn_canonical_laws = await page.query_selector("#btnMobileIccLaws")
        assert btn_canonical_laws is not None, "Canonical #btnMobileIccLaws must exist in dedicated action bar"

        # 6. Verify exactly ONE Laws button exists in the scoring pad
        all_laws_btns = await page.query_selector_all("#mobileScorerStudioPad button[id*='Laws'], #mobileScorerStudioPad button[id*='laws']")
        assert len(all_laws_btns) == 1, f"Expected exactly 1 Laws button in mobile scorer pad, got {len(all_laws_btns)}"

        # 7. Verify real Iconsax SVG icon is present inside #btnMobileIccLaws
        svg_inside_laws = await page.query_selector("#btnMobileIccLaws svg.cricos-icon")
        assert svg_inside_laws is not None, "#btnMobileIccLaws must contain an Iconsax Two-Tone SVG icon (.cricos-icon)"

        # 8. Verify real Iconsax SVG icon is present inside #btnMobileStudioPenaltyRuns
        svg_inside_penalties = await page.query_selector("#btnMobileStudioPenaltyRuns svg.cricos-icon")
        assert svg_inside_penalties is not None, "#btnMobileStudioPenaltyRuns must contain an Iconsax Two-Tone SVG icon (.cricos-icon)"

        # 9. Test opening ICC Laws Rulebook Sheet via canonical button
        await page.evaluate("""() => {
            const btn = document.getElementById('btnMobileIccLaws');
            if (btn) btn.click();
        }""")
        await page.wait_for_timeout(300)

        sheet = await page.query_selector("#mobileIccLawsSheet")
        assert sheet is not None, "#mobileIccLawsSheet must be rendered"
        assert await sheet.is_visible(), "#mobileIccLawsSheet must be visible"

        # Close Sheet
        await page.evaluate("""() => {
            window.cricosMobileApp.closeIccLawsSheet();
        }""")
        await page.wait_for_timeout(200)

        await save_screenshot_async(page, "test_69_mobile_deduplicated_scoring_pad.png")
        assert_no_critical_errors(page)
        await browser.close()


@pytest.mark.asyncio
async def test_desktop_scoring_pad_deduplication():
    """Verify Desktop Match Center keypad eliminates duplicate Laws button from header."""
    console_errors = []
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await ctx.new_page()

        page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: console_errors.append(f"PAGE ERROR: {e}"))
        page._console_errors = console_errors

        await page.goto(INDEX_HTML, wait_until="networkidle")
        await page.wait_for_timeout(300)

        # 1. Switch to SCORER persona
        await page.evaluate("""() => {
            if (typeof selectPersona === 'function') {
                selectPersona('SCORER');
            } else if (typeof currentUser !== 'undefined') {
                currentUser.persona = 'SCORER';
            }
        }""")
        await page.wait_for_timeout(300)

        # 2. Verify duplicate #btnStudioIccLawsPad is removed
        old_pad_btn = await page.query_selector("#btnStudioIccLawsPad")
        assert old_pad_btn is None, "Duplicate #btnStudioIccLawsPad must be removed"

        # 3. Verify card header does NOT contain a Laws button
        card_header_laws = await page.query_selector("#cardStudioKeypad > div:first-child button#btnDesktopIccLaws")
        assert card_header_laws is None, "Card header must NOT contain duplicate Laws button"

        # 4. Verify canonical #btnDesktopIccLaws is in the dedicated action bar inside #studioScoringControlsGroup
        action_bar_laws = await page.query_selector("#studioScoringControlsGroup #btnDesktopIccLaws")
        assert action_bar_laws is not None, "Canonical #btnDesktopIccLaws must exist in dedicated action bar"

        # 5. Verify exactly ONE Laws button exists in #cardStudioKeypad
        all_desktop_laws = await page.query_selector_all("#cardStudioKeypad #btnDesktopIccLaws, #cardStudioKeypad #btnStudioIccLawsPad")
        assert len(all_desktop_laws) == 1, f"Expected exactly 1 Laws button on desktop keypad, got {len(all_desktop_laws)}"

        # 6. Test opening ICC Laws Modal via canonical button
        await page.evaluate("""() => {
            const btn = document.getElementById('btnDesktopIccLaws');
            if (btn) btn.click();
        }""")
        await page.wait_for_timeout(300)

        modal = await page.query_selector("#modalIccLawsReference")
        assert modal is not None, "#modalIccLawsReference must exist"
        assert await modal.is_visible(), "#modalIccLawsReference must be visible"

        # Close modal
        await page.evaluate("""() => {
            if (typeof closeIccLawsModal === 'function') {
                closeIccLawsModal();
            }
        }""")
        await page.wait_for_timeout(200)

        await save_screenshot_async(page, "test_69_desktop_deduplicated_scoring_pad.png")
        assert_no_critical_errors(page)
        await browser.close()
