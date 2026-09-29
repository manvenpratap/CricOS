"""
Test 64: Captain Persona Scoring Pad Suppression & Tactical Center Verification
===============================================================================
Verifies across both Mobile/APK (`dist/mobile.html`) and Desktop (`index.html`) that:
1. Because only official Scorers (`SCORER`) can score deliveries, the `CAPTAIN` persona
   is never shown the scoring keypad (`0, 1, 2, 3, 4, 6, W, Undo, Wide, No Ball, Leg Bye, Bye`).
2. On Mobile/APK (`dist/mobile.html`), when `CAPTAIN` views `MATCHES` (`SCORE` subtab),
   `#mobileScorerStudioPad` and `.mobile-studio-pad-grid` are absent (`0` `.pad-btn` elements),
   and `#mobileCaptainTacticalCenter` (`👑 Captain Tactical & Field Strategy Center`) is shown instead.
   When switched to `SCORER`, `#mobileScorerStudioPad` appears with all `.pad-btn` controls.
3. On Desktop (`index.html`), when `CAPTAIN` is active, `#studioScoringControlsGroup` is hidden
   (`display: none`), `#studioCardTitle` displays `👑 Captain Crease & Tactical Command`, and
   `#captainTacticalNotice` is visible (`display: block`).
"""

import pathlib
import pytest
from playwright.async_api import async_playwright
from tests.helpers import assert_no_critical_errors, save_screenshot_async, catalog_screenshots

ROOT_DIR = pathlib.Path(__file__).resolve().parents[1]
DESKTOP_HTML_URI = (ROOT_DIR / "index.html").as_uri()
MOBILE_HTML_URI = (ROOT_DIR / "dist" / "mobile.html").as_uri()


@pytest.mark.asyncio
async def test_64_mobile_captain_has_no_scoring_pad_only_scorer_does():
    screenshots = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 412, "height": 915})
        page = await context.new_page()

        console_errors = []
        page.on("pageerror", lambda err: console_errors.append(str(err)))

        await page.goto(MOBILE_HTML_URI, wait_until="domcontentloaded")
        await page.wait_for_timeout(500)

        # Ensure CAPTAIN role is selected and navigate to MATCHES -> SCORE
        captain_state = await page.evaluate("""() => {
            window.cricosMobileApp.switchUserPersona('CAPTAIN');
            window.cricosMobileApp.navigateTo('MATCHES');
            window.cricosMobileApp.setMatchSubTab('SCORE');
            const scorerPad = document.getElementById('mobileScorerStudioPad');
            const padBtns = document.querySelectorAll('.mobile-studio-pad-grid .pad-btn');
            const captainCenter = document.getElementById('mobileCaptainTacticalCenter');
            const swapBtn = document.getElementById('btnMobileSwapStrike');
            return {
                persona: window.cricosMobileApp.profile.persona,
                hasScorerPad: !!scorerPad,
                padBtnCount: padBtns.length,
                hasCaptainCenter: !!captainCenter,
                captainCenterText: captainCenter?.textContent || '',
                hasSwapStrikeBtn: !!swapBtn
            };
        }""")

        assert captain_state["persona"] == "CAPTAIN"
        assert captain_state["hasScorerPad"] is False, f"Scoring pad must NOT be rendered for CAPTAIN: {captain_state}"
        assert captain_state["padBtnCount"] == 0, f"Expected 0 pad buttons for CAPTAIN, got {captain_state['padBtnCount']}"
        assert captain_state["hasSwapStrikeBtn"] is False, "Swap strike button must not be shown to CAPTAIN"
        assert captain_state["hasCaptainCenter"] is True, "Captain Tactical & Field Strategy Center should be shown for CAPTAIN"
        assert "Captain Tactical" in captain_state["captainCenterText"]

        shot_path = await save_screenshot_async(page, "test_64_mobile_captain_no_scoring_pad")
        screenshots.append(shot_path)

        # Now switch to SCORER and verify the scoring pad IS rendered
        scorer_state = await page.evaluate("""() => {
            window.cricosMobileApp.switchUserPersona('SCORER');
            window.cricosMobileApp.navigateTo('MATCHES');
            window.cricosMobileApp.setMatchSubTab('SCORE');
            const scorerPad = document.getElementById('mobileScorerStudioPad');
            const padBtns = document.querySelectorAll('.mobile-studio-pad-grid .pad-btn');
            return {
                persona: window.cricosMobileApp.profile.persona,
                hasScorerPad: !!scorerPad,
                padBtnCount: padBtns.length
            };
        }""")

        assert scorer_state["persona"] == "SCORER"
        assert scorer_state["hasScorerPad"] is True, "Scoring pad must be rendered for SCORER"
        assert scorer_state["padBtnCount"] == 8, f"Expected 8 pad buttons for SCORER, got {scorer_state['padBtnCount']}"

        assert_no_critical_errors(console_errors, "test_64_mobile_captain_scoring_pad")
        await browser.close()

    catalog_screenshots()


@pytest.mark.asyncio
async def test_64_desktop_captain_has_scoring_controls_hidden():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await context.new_page()

        console_errors = []
        page.on("pageerror", lambda err: console_errors.append(str(err)))

        await page.goto(DESKTOP_HTML_URI, wait_until="domcontentloaded")
        await page.wait_for_timeout(500)

        desktop_captain = await page.evaluate("""() => {
            applyRolePermissions('CAPTAIN');
            switchTab('studio');
            const controls = document.getElementById('studioScoringControlsGroup');
            const title = document.getElementById('studioCardTitle')?.textContent?.trim();
            const notice = document.getElementById('captainTacticalNotice');
            return {
                controlsDisplay: controls ? window.getComputedStyle(controls).display : null,
                title,
                noticeDisplay: notice ? window.getComputedStyle(notice).display : null
            };
        }""")

        assert desktop_captain["controlsDisplay"] == "none", f"Scoring controls must be hidden for CAPTAIN on Desktop: {desktop_captain}"
        assert "Captain" in desktop_captain["title"], f"Expected Captain card title for CAPTAIN, got: {desktop_captain['title']}"
        assert desktop_captain["noticeDisplay"] == "block"

        desktop_scorer = await page.evaluate("""() => {
            applyRolePermissions('SCORER');
            switchTab('studio');
            const controls = document.getElementById('studioScoringControlsGroup');
            const title = document.getElementById('studioCardTitle')?.textContent?.trim();
            return {
                controlsDisplay: controls ? window.getComputedStyle(controls).display : null,
                title
            };
        }""")

        assert desktop_scorer["controlsDisplay"] == "block", f"Scoring controls must be visible for SCORER on Desktop: {desktop_scorer}"
        assert "Scorer Studio" in desktop_scorer["title"]

        assert_no_critical_errors(console_errors, "test_64_desktop_captain_scoring_pad")
        await browser.close()
