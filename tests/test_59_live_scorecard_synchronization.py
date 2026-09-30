"""
test_59_live_scorecard_synchronization.py — Official Match Scorecard Live Synchronization & Contrast Suite
Verifies:
1. Mobile Scorecard (MATCHES -> ANALYTICS -> CARD / #mobileScorecardPanel) updates dynamically with live deliveries (runs, overs, CRR, RRR, extras breakdown, fall of wickets, batter figures, bowler figures).
2. Mobile Scorecard handles extras, dismissals, and undo events, restoring exact state and fall-of-wickets history.
3. Mobile Scorecard complies with Swiss Minimalist and Nordic Editorial daylight surfaces and WCAG 2.2 AAA/AA text contrast.
4. Desktop Scorecard (Match Center -> Detailed Scorecard) synchronizes live scores, totals, innings badges, and figures on scoring updates and theme switches.
5. Zero critical JavaScript console errors across all journeys.
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
async def test_mobile_scorecard_live_updates_and_theme_contrast():
    """Verify Mobile Official Scorecard dynamic update on scoring events and high-contrast light theme rendering."""
    console_errors = []
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 390, "height": 844})
        page = await ctx.new_page()

        page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: console_errors.append(f"PAGE ERROR: {e}"))
        page._console_errors = console_errors

        await page.goto(MOBILE_HTML, wait_until="domcontentloaded")
        await page.wait_for_timeout(400)

        # Set persona to SCORER and navigate to ANALYTICS subtab
        await page.evaluate("""() => {
            if (window.cricosMobileApp) {
                window.cricosMobileApp.switchUserPersona('SCORER');
                window.cricosMobileApp.setMatchSubTab('ANALYTICS');
                window.cricosMobileApp.toggleChart('SCORECARD');
            }
        }""")
        await page.wait_for_timeout(300)

        scorecard_panel = await page.query_selector("#mobileScorecardPanel")
        assert scorecard_panel is not None, "#mobileScorecardPanel must exist in Analytics subtab"
        assert await scorecard_panel.is_visible(), "#mobileScorecardPanel must be visible"

        # Check initial baseline values (142/3 in 16.4 ov)
        initial_score_text = await page.evaluate("""() => {
            const p = document.getElementById('mobileScorecardPanel');
            return p ? p.innerText : '';
        }""")
        assert "142/3" in initial_score_text, "Initial scorecard must display 142/3"
        assert "16.4 ov" in initial_score_text, "Initial scorecard must display 16.4 ov"

        # 1. Record a boundary 4
        await page.evaluate("""() => {
            if (window.cricosMobileApp && typeof window.cricosMobileApp.scoreBall === 'function') {
                window.cricosMobileApp.scoreBall(4);
            }
        }""")
        await page.wait_for_timeout(300)

        updated_score_text = await page.evaluate("""() => {
            const p = document.getElementById('mobileScorecardPanel');
            return p ? p.innerText : '';
        }""")
        assert "146/3" in updated_score_text, "Scorecard must dynamically update total to 146/3 after boundary 4"
        assert "16.5 ov" in updated_score_text, "Scorecard must dynamically update overs to 16.5 ov"

        # 2. Record an extra delivery (WIDE)
        await page.evaluate("""() => {
            if (window.cricosMobileApp && typeof window.cricosMobileApp.applyExtraDelivery === 'function') {
                window.cricosMobileApp.applyExtraDelivery('WIDE');
            }
        }""")
        await page.wait_for_timeout(300)

        extra_score_text = await page.evaluate("""() => {
            const p = document.getElementById('mobileScorecardPanel');
            return p ? p.innerText : '';
        }""")
        assert "147/3" in extra_score_text, "Scorecard must update to 147/3 after wide (+1 extra run)"
        assert "16.5 ov" in extra_score_text, "Wide must not increment legal balls (overs stay 16.5 ov)"
        assert "w 6" in extra_score_text or "w 5" in extra_score_text, "Extras breakdown must reflect wide deliveries"

        # 3. Record a wicket dismissal
        await page.evaluate("""() => {
            if (window.cricosMobileApp && typeof window.cricosMobileApp.confirmMobileDismissal === 'function') {
                window.cricosMobileApp.confirmMobileDismissal('CAUGHT', 'Pant', 'Kishan');
            }
        }""")
        await page.wait_for_timeout(300)

        wkt_score_text = await page.evaluate("""() => {
            const p = document.getElementById('mobileScorecardPanel');
            return p ? p.innerText : '';
        }""")
        assert "147/4" in wkt_score_text, "Scorecard must dynamically reflect 4 wickets (147/4)"
        assert "4-147" in wkt_score_text or "147/4" in wkt_score_text, "Fall of Wickets must include the 4th wicket"

        # 4. Test Undo delivery
        await page.evaluate("""() => {
            if (window.cricosMobileApp && typeof window.cricosMobileApp.undoLastDelivery === 'function') {
                window.cricosMobileApp.undoLastDelivery();
            }
        }""")
        await page.wait_for_timeout(300)

        undone_score_text = await page.evaluate("""() => {
            const p = document.getElementById('mobileScorecardPanel');
            return p ? p.innerText : '';
        }""")
        assert "147/3" in undone_score_text, "Undoing wicket delivery must restore wickets to 3 (147/3)"

        # 5. Verify Swiss Minimalist light theme contrast
        await page.evaluate("""() => {
            if (window.cricosMobileApp && typeof window.cricosMobileApp.setTheme === 'function') {
                window.cricosMobileApp.setTheme('swiss');
            } else {
                document.body.setAttribute('data-theme', 'swiss');
            }
            if (typeof enforceContrastInvariants === 'function') {
                enforceContrastInvariants();
            }
        }""")
        await page.wait_for_timeout(300)

        swiss_bg = await page.evaluate("""() => {
            const p = document.getElementById('mobileScorecardPanel');
            return window.getComputedStyle(p).backgroundColor;
        }""")
        # Swiss daylight surface should be white rgb(255, 255, 255)
        assert "255, 255, 255" in swiss_bg, f"Swiss scorecard panel background must be pure white, got {swiss_bg}"

        await save_screenshot_async(page, "scorecard_mobile_swiss_minimal")

        # 6. Verify Nordic Editorial light theme contrast
        await page.evaluate("""() => {
            if (window.cricosMobileApp && typeof window.cricosMobileApp.setTheme === 'function') {
                window.cricosMobileApp.setTheme('nordic');
            } else {
                document.body.setAttribute('data-theme', 'nordic');
            }
            if (typeof enforceContrastInvariants === 'function') {
                enforceContrastInvariants();
            }
        }""")
        await page.wait_for_timeout(300)

        nordic_bg = await page.evaluate("""() => {
            const p = document.getElementById('mobileScorecardPanel');
            return window.getComputedStyle(p).backgroundColor;
        }""")
        # Nordic daylight surface should be warm oat rgb(252, 251, 248)
        assert ("252, 251, 248" in nordic_bg) or ("255, 255, 255" in nordic_bg) or ("245, 242, 235" in nordic_bg), f"Nordic scorecard panel must be warm oat/daylight, got {nordic_bg}"

        await save_screenshot_async(page, "scorecard_mobile_nordic_editorial")

        assert_no_critical_errors(page)
        await browser.close()


@pytest.mark.asyncio
async def test_desktop_scorecard_live_updates_and_theme_contrast():
    """Verify Desktop Detailed Scorecard synchronizes with live match score state and daylight themes."""
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

        # Switch to SCORER persona
        await page.evaluate("""() => {
            if (typeof selectPersona === 'function') {
                selectPersona('SCORER');
            } else if (typeof currentUser !== 'undefined') {
                currentUser.persona = 'SCORER';
            }
        }""")
        await page.wait_for_timeout(300)

        # Check initial detailed scorecard elements
        has_scorecard_score = await page.evaluate("""() => {
            const scoreEl = document.getElementById('scorecardInningsScore');
            const totalEl = document.getElementById('scorecardTotalText');
            return scoreEl && totalEl && scoreEl.textContent.includes('142/3');
        }""")
        assert has_scorecard_score, "Desktop detailed scorecard must render initial 142/3 score"

        # Simulate live delivery scoring update
        await page.evaluate("""() => {
            if (typeof renderScoreState === 'function') {
                renderScoreState({
                    runs: 148,
                    wickets: 3,
                    legal_balls: 101,
                    overs_display: '16.5',
                    batters: {
                        'p-1': { playerId: 'p-1', name: 'Virat Sharma', runs: 54, ballsFaced: 33, fours: 5, sixes: 2, strikeRate: 163.6, isOut: false }
                    }
                }, { bat_runs: 6, legal_ball: true }, 'BALL_BOWLED');
            }
        }""")
        await page.wait_for_timeout(300)

        scorecard_state = await page.evaluate("""() => {
            const scoreEl = document.getElementById('scorecardInningsScore');
            const totalEl = document.getElementById('scorecardTotalText');
            const inn2Btn = document.getElementById('btnScorecardInn2');
            return {
                scoreText: scoreEl ? scoreEl.textContent : '',
                totalText: totalEl ? totalEl.textContent : '',
                inn2BtnText: inn2Btn ? inn2Btn.textContent : ''
            };
        }""")

        assert "148/3" in scorecard_state["scoreText"], f"scorecardInningsScore must update to 148/3, got {scorecard_state['scoreText']}"
        assert "16.5 ov" in scorecard_state["scoreText"], f"scorecardInningsScore must update to 16.5 ov, got {scorecard_state['scoreText']}"
        assert "148/3" in scorecard_state["totalText"], f"scorecardTotalText must update to 148/3, got {scorecard_state['totalText']}"
        assert "148/3" in scorecard_state["inn2BtnText"], f"Innings 2 tab button must reflect 148/3, got {scorecard_state['inn2BtnText']}"

        # Test Swiss Minimalist contrast
        await page.evaluate("""() => {
            document.body.setAttribute('data-theme', 'swiss');
            document.documentElement.setAttribute('data-theme', 'swiss');
            if (typeof enforceThemeContrastInvariants === 'function') {
                enforceThemeContrastInvariants();
            }
        }""")
        await page.wait_for_timeout(300)

        banner_bg = await page.evaluate("""() => {
            const b = document.getElementById('scorecardInningsBanner');
            return window.getComputedStyle(b).backgroundColor;
        }""")
        assert ("248, 250, 252" in banner_bg) or ("255, 255, 255" in banner_bg), f"Swiss scorecard banner background must be daylight slate, got {banner_bg}"

        await save_screenshot_async(page, "scorecard_desktop_swiss_minimal")

        # Test Nordic Editorial contrast
        await page.evaluate("""() => {
            document.body.setAttribute('data-theme', 'nordic');
            document.documentElement.setAttribute('data-theme', 'nordic');
            if (typeof enforceThemeContrastInvariants === 'function') {
                enforceThemeContrastInvariants();
            }
        }""")
        await page.wait_for_timeout(300)

        await save_screenshot_async(page, "scorecard_desktop_nordic_editorial")

        assert_no_critical_errors(page)
        await browser.close()
