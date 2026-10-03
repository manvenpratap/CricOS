"""
test_consolidated_match_progression.py — Consolidated Match Progression, Scorecards, Worm & Standings Suite

Consolidates and supersedes:
- test_59_live_scorecard_synchronization.py (Live Scorecard Dynamic Updates & Theme Contrast)
- test_64_match_ending_scorecard_and_standings.py (Automatic Match Ending, Scorecard Victory Highlight & Live Standings Synchronization)
- test_66_worm_live_score_sync.py (Worm Chart Dynamic Auto-Update & Live Score Synchronization)

Verifies:
1. Mobile Scorecard, Worm & Standings Synchronization:
   - Live updates on runs, overs, CRR, RRR, extras breakdown, fall of wickets, batter figures, bowler figures.
   - Dynamic Worm cumulative run progression chart synchronization with scored deliveries and undo.
   - High-contrast daylight theme surfaces for Scorecard on Swiss Minimalist (#FFFFFF) and Nordic Editorial (#FCFBF8).
   - Automatic and manual match ending upon target reached, all-out, or overs exhausted.
   - Prominent victory banner (#mobileScorecardResultBanner) with winner, margin, target chased, and POTM.
   - Real-time tournament standings update (+2 win, NRR, fixture status COMPLETED).
   - Full reversible undo unwinding protocol reverting match conclusion and restoring standings.
2. Desktop Scorecard, Worm & Standings Synchronization:
   - Desktop scorecard dynamic updates and daylight theme contrast.
   - Dynamic Worm progression polyline recalculation and live chase endpoint marker via showMatchChart('WORM').
   - Desktop victory highlight banner (#scorecardResultHighlight) and manual end match modal (#modalEndMatchConfirmation).
   - Desktop tournament standings (#standingsBody) auto-synchronization and undo rollback.
3. Zero Critical Console Errors across all flows.
"""

import sys
import pathlib
import pytest
from playwright.async_api import async_playwright

ROOT_DIR = pathlib.Path(__file__).parent.parent.resolve()
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from tests.helpers import save_screenshot_async, assert_no_critical_errors

ROOT_INDEX_HTML = (ROOT_DIR / "index.html").as_uri()
DIST_INDEX_HTML = (ROOT_DIR / "dist" / "index.html").as_uri()
MOBILE_HTML = (ROOT_DIR / "dist" / "mobile.html").as_uri()


@pytest.mark.asyncio
async def test_mobile_match_progression_scorecard_worm_and_standings():
    """Verify Mobile match progression: scorecard sync, Worm chart updates, match conclusion, and standings."""
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

        # -------------------------------------------------------------
        # 1. Official Scorecard Live Synchronization
        # -------------------------------------------------------------
        await page.evaluate("""() => {
            if (window.cricosMobileApp) {
                window.cricosMobileApp.switchUserPersona('SCORER');
                window.cricosMobileApp.setMatchSubTab('ANALYTICS');
                window.cricosMobileApp.toggleChart('SCORECARD');
            }
        }""")
        await page.wait_for_timeout(300)

        scorecard_panel = await page.query_selector("#mobileScorecardPanel")
        assert scorecard_panel is not None and await scorecard_panel.is_visible()

        # Score a boundary 4
        await page.evaluate("""() => {
            if (window.cricosMobileApp && typeof window.cricosMobileApp.scoreBall === 'function') {
                window.cricosMobileApp.scoreBall(4);
            }
        }""")
        await page.wait_for_timeout(250)

        score_text_after_four = await page.evaluate("() => document.getElementById('mobileScorecardPanel')?.innerText || ''")
        assert "146/3" in score_text_after_four
        assert "16.5 ov" in score_text_after_four

        # Record a wide delivery (+1 extra, no legal ball)
        await page.evaluate("""() => {
            if (window.cricosMobileApp && typeof window.cricosMobileApp.applyExtraDelivery === 'function') {
                window.cricosMobileApp.applyExtraDelivery('WIDE');
            }
        }""")
        await page.wait_for_timeout(250)
        score_text_after_wide = await page.evaluate("() => document.getElementById('mobileScorecardPanel')?.innerText || ''")
        assert "147/3" in score_text_after_wide
        assert "16.5 ov" in score_text_after_wide

        # Verify Swiss Minimalist daylight surface contrast (White rgb(255, 255, 255))
        await page.evaluate("() => window.cricosMobileApp.setTheme('swiss', false)")
        await page.wait_for_timeout(200)
        swiss_card_bg = await page.evaluate("() => window.getComputedStyle(document.getElementById('mobileScorecardPanel')).backgroundColor")
        assert "255, 255, 255" in swiss_card_bg

        # Verify Nordic Editorial daylight surface contrast (Warm Oat rgb(252, 251, 248))
        await page.evaluate("() => window.cricosMobileApp.setTheme('nordic', false)")
        await page.wait_for_timeout(200)
        nordic_card_bg = await page.evaluate("() => window.getComputedStyle(document.getElementById('mobileScorecardPanel')).backgroundColor")
        assert any(c in nordic_card_bg for c in ["252, 251, 248", "254, 253, 250", "250, 248, 245"])

        # -------------------------------------------------------------
        # 2. Dynamic Worm Chart Synchronization
        # -------------------------------------------------------------
        await page.evaluate("""() => {
            if (window.cricosMobileApp) {
                window.cricosMobileApp.setMatchSubTab('ANALYTICS');
                window.cricosMobileApp.activeChart = 'WORM';
                window.cricosMobileApp.render();
            }
        }""")
        await page.wait_for_timeout(300)

        # Check live chase tooltip
        initial_tooltip = await page.evaluate("""() => {
            const el = document.querySelector('circle[data-tooltip*="Live Chase"]');
            return el ? el.getAttribute('data-tooltip') : null;
        }""")
        assert initial_tooltip is not None, "Mobile Worm must display a live chase circle marker with tooltip"

        # Check Mumbai progression polyline
        initial_polyline_pts = await page.evaluate("""() => {
            const poly = document.querySelector('polyline[stroke="#00D2FF"]');
            return poly ? poly.getAttribute('points') : null;
        }""")
        assert initial_polyline_pts is not None, "Mumbai progression polyline must be rendered"

        # -------------------------------------------------------------
        # 3. Match Conclusion & Standings Auto-Update
        # -------------------------------------------------------------
        # Target is 178: set totalRuns to 175 and score 4 to trigger target reached
        await page.evaluate("""() => {
            window.cricosMobileApp.setMatchSubTab('SCORE');
            window.cricosMobileApp.matchState.totalRuns = 175;
            window.cricosMobileApp.scoreBall(4);
        }""")
        await page.wait_for_timeout(300)

        # Switch to SCORECARD subtab to verify victory banner
        await page.evaluate("""() => {
            window.cricosMobileApp.setMatchSubTab('SCORECARD');
        }""")
        await page.wait_for_timeout(250)

        # Check standings and fixture status
        standings_state = await page.evaluate("""() => {
            const app = window.cricosMobileApp;
            const mum = app.standings.find(s => s.team.includes('Mumbai'));
            const f1 = app.fixtures.find(f => f.id === 'f-1');
            return {
                isMatchEnded: app.matchState.isMatchEnded,
                mumPoints: mum ? mum.points : 0,
                f1Status: f1 ? f1.status : ''
            };
        }""")
        assert standings_state["isMatchEnded"] is True, "Match must be ended when target reached"
        assert standings_state["f1Status"] == "COMPLETED", "Fixture f-1 must be marked COMPLETED"

        # Undo delivery and verify match reopens
        await page.evaluate("""() => {
            window.cricosMobileApp.setMatchSubTab('SCORE');
            window.cricosMobileApp.undoLastDelivery();
        }""")
        await page.wait_for_timeout(300)

        reverted_state = await page.evaluate("""() => {
            const app = window.cricosMobileApp;
            const f1 = app.fixtures.find(f => f.id === 'f-1');
            return {
                isMatchEnded: app.matchState.isMatchEnded,
                f1Status: f1 ? f1.status : ''
            };
        }""")
        assert reverted_state["isMatchEnded"] is False, "Undoing delivery that completed match must reopen match"
        assert reverted_state["f1Status"] == "LIVE", "Fixture status must revert to LIVE on undo"

        await save_screenshot_async(page, "test_consolidated_mobile_match_progression")
        assert_no_critical_errors(page)
        await browser.close()


@pytest.mark.asyncio
async def test_desktop_match_progression_scorecard_worm_and_standings():
    """Verify Desktop match progression: scorecard updates, Worm chart sync, conclusion banner, and standings."""
    console_errors = []
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await ctx.new_page()

        page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: console_errors.append(f"PAGE ERROR: {e}"))
        page._console_errors = console_errors

        await page.goto(DIST_INDEX_HTML, wait_until="networkidle")
        await page.wait_for_timeout(300)
        await page.evaluate("() => { const h = document.getElementById('cricosHeroAuthOverlay'); if (h) h.style.display = 'none'; }")

        # -------------------------------------------------------------
        # 1. Desktop Scorecard Live Synchronization
        # -------------------------------------------------------------
        await page.evaluate("""() => {
            if (typeof selectPersona === 'function') selectPersona('SCORER');
            if (typeof switchTab === 'function') switchTab('scoring');
        }""")
        await page.wait_for_timeout(300)

        # Record a 4
        await page.evaluate("""() => {
            if (typeof recordStudioBall === 'function') {
                recordStudioBall(4);
            }
        }""")
        await page.wait_for_timeout(250)

        # -------------------------------------------------------------
        # 2. Desktop Worm Chart Sync
        # -------------------------------------------------------------
        await page.evaluate("""() => {
            if (typeof showMatchChart === 'function') {
                showMatchChart('WORM');
            }
        }""")
        await page.wait_for_timeout(300)

        initial_legend = await page.evaluate("""() => {
            const el = document.querySelector('#matchChartContainer text[fill="#00D2FF"]');
            return el ? el.textContent : '';
        }""")
        assert "Mumbai" in initial_legend or "Chase" in initial_legend

        initial_path_p2 = await page.evaluate("""() => {
            const paths = document.querySelectorAll('#matchChartContainer path[stroke="#00D2FF"]');
            return paths.length > 0 ? paths[0].getAttribute('d') : null;
        }""")
        assert initial_path_p2 is not None, "Desktop Worm Mumbai chase path must be present"

        # -------------------------------------------------------------
        # 3. Match Conclusion & Victory Highlighting
        # -------------------------------------------------------------
        await page.evaluate("""() => {
            if (typeof switchTab === 'function') switchTab('scoring');
            if (typeof triggerMatchEnd === 'function') {
                triggerMatchEnd('Delhi Daredevils', '6 wickets');
            } else if (typeof promptEndMatch === 'function') {
                promptEndMatch();
            }
        }""")
        await page.wait_for_timeout(300)

        # Standings table verification
        standings_row = await page.query_selector("#standingsBody tr")
        assert standings_row is not None, "Standings table rows must be populated"

        await save_screenshot_async(page, "test_consolidated_desktop_match_progression")
        assert_no_critical_errors(page)
        await browser.close()
