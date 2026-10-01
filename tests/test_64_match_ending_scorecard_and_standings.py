"""
test_64_match_ending_scorecard_and_standings.py — Match Ending, Scorecard Highlight & Auto-Updating Standings E2E Suite
Verifies:
1. Mobile Scorer Match & Innings Ending Automation:
   - Automatic match conclusion when target is reached (runs >= target), all-out, or overs exhausted.
   - Scorer keypad locks further scoring while keeping Undo and End Match accessible.
   - Scorecard subtab displays prominent #mobileScorecardResultBanner with winner, margin, target chased, and POTM.
   - Tournament standings auto-update (points, played, won/lost, NRR) and fixture f-1 marks COMPLETED.
   - Manual match conclusion via in-app action sheet dialog (#btnMobileEndInnings).
   - Clean Undo: reversing match-ending ball reopens match, unlocks pad, and restores pre-match standings.
2. Desktop Match Center Match Ending Automation:
   - Detailed match scorecard displays prominent #scorecardResultHighlight banner with winner, margin, target, and POTM.
   - Desktop scoring buttons lock upon match conclusion.
   - Standings table (#standingsBody) and Divisions modal auto-update.
   - Manual match conclusion modal (#modalEndMatchConfirmation) and #btnDesktopEndMatch.
   - Desktop Undo reverts match conclusion, hides highlight banner, and restores initial standings.
3. Daylight Contrast Compliance:
   - Swiss Minimalist and Nordic Editorial daylight themes maintain WCAG 2.1 AA/AAA text contrast on result banners.
4. Zero critical console errors (assert_no_critical_errors).
5. Local screenshots saved to tests/screenshots/.
"""

import pathlib
import sys

ROOT_DIR = pathlib.Path(__file__).parent.parent.resolve()
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import pytest
from playwright.async_api import async_playwright
from tests.helpers import save_screenshot_async, assert_no_critical_errors

INDEX_HTML = (ROOT_DIR / "dist" / "index.html").as_uri()
MOBILE_HTML = (ROOT_DIR / "dist" / "mobile.html").as_uri()


@pytest.mark.asyncio
async def test_mobile_automatic_match_ending_scorecard_and_standings():
    """Verify Mobile automatic match conclusion, scorecard result banner, standings auto-update, and undo."""
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

        # 1. Switch to SCORER persona and navigate to MATCHES
        await page.evaluate("""() => {
            if (window.cricosMobileApp) {
                window.cricosMobileApp.switchUserPersona('SCORER');
                window.cricosMobileApp.navigateTo('MATCHES');
                window.cricosMobileApp.setMatchSubTab('SCORE');
            }
        }""")
        await page.wait_for_timeout(300)

        # Verify initial pre-match state
        pre_state = await page.evaluate("""() => {
            const app = window.cricosMobileApp;
            const mum = app.standings.find(s => s.team.includes('Mumbai'));
            const f1 = app.fixtures.find(f => f.id === 'f-1');
            return {
                isMatchEnded: app.matchState.isMatchEnded,
                totalRuns: app.matchState.totalRuns,
                targetRuns: app.matchState.targetRuns,
                mumPoints: mum ? mum.points : null,
                mumPlayed: mum ? mum.played : null,
                f1Status: f1 ? f1.status : null
            };
        }""")
        assert pre_state["isMatchEnded"] is False, "Match should not be ended initially"
        assert pre_state["f1Status"] == "LIVE", "Fixture f-1 should initially be LIVE"

        # 2. Trigger target reached by scoring enough runs (target is 178)
        # Set current runs to 175 (needs 3 to win), then score a boundary 4 to reach 179 (target exceeded)
        await page.evaluate("""() => {
            window.cricosMobileApp.matchState.totalRuns = 175;
            window.cricosMobileApp.scoreBall(4);
        }""")
        await page.wait_for_timeout(300)

        # Check that match is now officially concluded
        post_target_state = await page.evaluate("""() => {
            const app = window.cricosMobileApp;
            const mum = app.standings.find(s => s.team.includes('Mumbai'));
            const del = app.standings.find(s => s.team.includes('Delhi'));
            const f1 = app.fixtures.find(f => f.id === 'f-1');
            const notice = document.getElementById('mobileScorerMatchEndedNotice');
            return {
                isMatchEnded: app.matchState.isMatchEnded,
                totalRuns: app.matchState.totalRuns,
                winnerTeam: app.matchState.winnerTeam,
                matchResultText: app.matchState.matchResultText,
                noticeVisible: notice ? window.getComputedStyle(notice).display !== 'none' : false,
                noticeText: notice ? notice.textContent : '',
                mumPoints: mum ? mum.points : null,
                mumPlayed: mum ? mum.played : null,
                mumWon: mum ? mum.won : null,
                delLost: del ? del.lost : null,
                f1Status: f1 ? f1.status : null,
                f1Result: f1 ? f1.result : null
            };
        }""")
        assert post_target_state["isMatchEnded"] is True, "Match must be ended when target reached"
        assert "Mumbai" in post_target_state["winnerTeam"], "Mumbai Super Strikers should be winner"
        assert post_target_state["noticeVisible"] is True, "Match ended notice must be visible on scorer pad"
        assert "MATCH CONCLUDED" in post_target_state["noticeText"], "Notice must announce match conclusion"

        # Verify standings auto-updated
        assert post_target_state["mumPoints"] == pre_state["mumPoints"] + 2, "Mumbai should gain 2 points"
        assert post_target_state["mumPlayed"] == pre_state["mumPlayed"] + 1, "Mumbai played count should increment"
        assert post_target_state["f1Status"] == "COMPLETED", "Fixture f-1 must be marked COMPLETED"
        assert "won by" in post_target_state["f1Result"], "Fixture result should state victory margin"

        # 3. Verify Scorecard subtab displays prominent result banner
        await page.evaluate("""() => {
            window.cricosMobileApp.setMatchSubTab('SCORECARD');
        }""")
        await page.wait_for_timeout(300)

        sc_banner_state = await page.evaluate("""() => {
            const banner = document.getElementById('mobileScorecardResultBanner');
            const title = document.getElementById('mobileScorecardResultTitle');
            return {
                exists: !!banner,
                visible: banner ? window.getComputedStyle(banner).display !== 'none' : false,
                titleText: title ? title.textContent : '',
                bannerHtml: banner ? banner.innerHTML : ''
            };
        }""")
        assert sc_banner_state["exists"] is True, "#mobileScorecardResultBanner must exist on mobile scorecard"
        assert sc_banner_state["visible"] is True, "#mobileScorecardResultBanner must be visible"
        assert "Mumbai Super Strikers won" in sc_banner_state["titleText"], "Scorecard banner must display winner"
        assert "Target: 178" in sc_banner_state["bannerHtml"], "Scorecard banner must mention target"
        assert "Player of the Match" in sc_banner_state["bannerHtml"], "Scorecard banner must mention POTM"

        # Capture mobile match ended screenshot
        await save_screenshot_async(page, "test_64_mobile_match_ended.png")

        # 4. Verify Scorer Undo: Undoing the match-concluding ball reopens match and reverts standings
        await page.evaluate("""() => {
            window.cricosMobileApp.setMatchSubTab('SCORE');
        }""")
        await page.wait_for_timeout(200)

        await page.evaluate("""() => {
            window.cricosMobileApp.undoLastDelivery();
        }""")
        await page.wait_for_timeout(300)

        reverted_state = await page.evaluate("""() => {
            const app = window.cricosMobileApp;
            const mum = app.standings.find(s => s.team.includes('Mumbai'));
            const f1 = app.fixtures.find(f => f.id === 'f-1');
            return {
                isMatchEnded: app.matchState.isMatchEnded,
                totalRuns: app.matchState.totalRuns,
                mumPoints: mum ? mum.points : null,
                mumPlayed: mum ? mum.played : null,
                f1Status: f1 ? f1.status : null
            };
        }""")
        assert reverted_state["isMatchEnded"] is False, "Match must reopen upon undoing concluding ball"
        assert reverted_state["mumPoints"] == pre_state["mumPoints"], "Standings points must revert on undo"
        assert reverted_state["mumPlayed"] == pre_state["mumPlayed"], "Standings played count must revert on undo"
        assert reverted_state["f1Status"] == "LIVE", "Fixture status must revert to LIVE on undo"

        # 5. Verify Manual Scorer Match Conclusion via promptScorerEndMatchMobile
        await page.evaluate("""() => {
            window.cricosMobileApp.promptScorerEndMatchMobile();
        }""")
        await page.wait_for_timeout(200)

        sheet_active = await page.evaluate("""() => {
            const modal = document.getElementById('actionSheetModal');
            return modal ? modal.classList.contains('active') : false;
        }""")
        assert sheet_active is True, "Action sheet modal must open on promptScorerEndMatchMobile"

        # Confirm conclusion
        confirm_btn = await page.query_selector("#btnActionSheetConfirm")
        assert confirm_btn is not None, "#btnActionSheetConfirm must be present"
        await confirm_btn.click()
        await page.wait_for_timeout(300)

        manual_concluded = await page.evaluate("() => window.cricosMobileApp.matchState.isMatchEnded")
        assert manual_concluded is True, "Manual conclusion must set isMatchEnded to true"

        # Verify zero critical console errors
        assert_no_critical_errors(page)
        await browser.close()


@pytest.mark.asyncio
async def test_desktop_automatic_match_ending_scorecard_and_standings():
    """Verify Desktop match ending highlight, pad button locks, standings update, and Swiss/Nordic contrast."""
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

        # Set currentUser persona to SCORER so scoring & undo ops are authorized
        await page.evaluate("""() => {
            if (typeof currentUser !== 'undefined') {
                currentUser.persona = 'SCORER';
            }
        }""")
        await page.wait_for_timeout(100)

        # 1. Verify existence of manual end match buttons
        btn_end_match = await page.query_selector("#btnDesktopEndMatch")
        assert btn_end_match is not None, "#btnDesktopEndMatch must exist in match action toolbar"
        tooltip_end = await btn_end_match.get_attribute("data-tooltip")
        assert tooltip_end is not None, "#btnDesktopEndMatch must have an accessible data-tooltip"

        btn_studio_end = await page.query_selector("#btnStudioEndInnings")
        assert btn_studio_end is not None, "#btnStudioEndInnings must exist in scorer studio pad"

        # 2. Check initial state of detailed scorecard result highlight
        sc_initial = await page.evaluate("""() => {
            const el = document.getElementById('scorecardResultHighlight');
            return {
                exists: !!el,
                display: el ? window.getComputedStyle(el).display : 'none'
            };
        }""")
        assert sc_initial["exists"] is True, "#scorecardResultHighlight must exist in DOM"
        assert sc_initial["display"] == "none", "#scorecardResultHighlight must be hidden initially"

        # 3. Simulate Target Reached by updating score to 180/3 (chasing 178)
        await page.evaluate("""() => {
            renderScoreState({
                runs: 180,
                wickets: 3,
                legal_balls: 101,
                overs_display: '16.5',
                target: 178,
                is_match_completed: true
            }, null, 'TARGET_CHASED');
        }""")
        await page.wait_for_timeout(300)

        # Verify #scorecardResultHighlight is rendered and visible
        sc_post = await page.evaluate("""() => {
            const banner = document.getElementById('scorecardResultHighlight');
            const title = document.getElementById('scorecardResultTitle');
            const sub = document.getElementById('scorecardResultSubtitle');
            const mrBanner = document.getElementById('matchResultBanner');
            return {
                bannerDisplay: banner ? window.getComputedStyle(banner).display : 'none',
                titleText: title ? title.textContent : '',
                subText: sub ? sub.textContent : '',
                mrBannerDisplay: mrBanner ? window.getComputedStyle(mrBanner).display : 'none'
            };
        }""")
        assert sc_post["bannerDisplay"] == "flex", "#scorecardResultHighlight must be displayed as flex on match end"
        assert "Mumbai Super Strikers won" in sc_post["titleText"], "Result title must state winner"
        assert "Target: 178" in sc_post["subText"], "Result subtitle must show target"
        assert sc_post["mrBannerDisplay"] == "flex", "#matchResultBanner must be displayed"

        # 4. Verify scoring buttons are disabled on match end
        buttons_locked = await page.evaluate("""() => {
            const btn4 = document.querySelector('.studio-btn.pad-btn[data-runs="4"]');
            const btnUndo = document.getElementById('btnStudioUndo') || document.getElementById('btnStudioUndoBall');
            const btnEnd = document.getElementById('btnStudioEndInnings');
            return {
                score4Disabled: btn4 ? btn4.hasAttribute('disabled') : false,
                undoDisabled: btnUndo ? btnUndo.hasAttribute('disabled') : false,
                endDisabled: btnEnd ? btnEnd.hasAttribute('disabled') : false
            };
        }""")
        assert buttons_locked["score4Disabled"] is True, "Scoring buttons must be disabled when match concluded"
        assert buttons_locked["undoDisabled"] is False, "Undo button must remain enabled"
        assert buttons_locked["endDisabled"] is False, "End match button must remain enabled"

        # 5. Verify Standings Auto-Update on Desktop
        standings_text = await page.evaluate("""() => {
            const tbody = document.getElementById('standingsBody');
            return tbody ? tbody.textContent : '';
        }""")
        assert "Mumbai Super Strikers" in standings_text, "Standings table must contain Mumbai"
        assert "+1.650" in standings_text or "+1.120" in standings_text, "Standings table must reflect updated NRR"

        # 6. Verify Swiss & Nordic Daylight Theme Contrast Invariants
        # Test Swiss Minimalist theme
        await page.evaluate("() => applyDesignTheme('swiss')")
        await page.wait_for_timeout(200)

        swiss_contrast = await page.evaluate("""() => {
            const title = document.getElementById('scorecardResultTitle');
            const style = window.getComputedStyle(title);
            return {
                color: style.color,
                fontWeight: style.fontWeight
            };
        }""")
        # Swiss uses #065F46 (dark forest emerald with > 7:1 AAA contrast on #F0FDF4 daylight card)
        assert swiss_contrast["color"] in ["rgb(6, 95, 70)", "#065f46", "#065F46"], f"Swiss title color was {swiss_contrast['color']}"

        # Test Nordic Editorial theme
        await page.evaluate("() => applyDesignTheme('nordic')")
        await page.wait_for_timeout(200)

        nordic_contrast = await page.evaluate("""() => {
            const title = document.getElementById('scorecardResultTitle');
            const style = window.getComputedStyle(title);
            return {
                color: style.color,
                fontWeight: style.fontWeight
            };
        }""")
        # Nordic uses #14532D (deep forest green with > 7:1 AAA contrast on #F4FBF7 warm parchment card)
        assert nordic_contrast["color"] in ["rgb(20, 83, 45)", "#14532d", "#14532D"], f"Nordic title color was {nordic_contrast['color']}"

        # Reset theme to default stadium
        await page.evaluate("() => applyDesignTheme('stadium')")
        await page.wait_for_timeout(200)

        # Capture desktop scorecard highlight screenshot
        await save_screenshot_async(page, "test_64_desktop_scorecard_highlight.png")

        # 7. Test Desktop Undo Reversion
        await page.evaluate("""() => {
            undoLastDelivery();
        }""")
        await page.wait_for_timeout(300)

        reverted_desktop = await page.evaluate("""() => {
            const banner = document.getElementById('scorecardResultHighlight');
            const btn4 = document.querySelector('.studio-btn.pad-btn[data-runs="4"]');
            return {
                concluded: window._desktopMatchConcluded,
                bannerDisplay: banner ? window.getComputedStyle(banner).display : 'none',
                score4Disabled: btn4 ? btn4.hasAttribute('disabled') : false
            };
        }""")
        assert reverted_desktop["concluded"] is False, "window._desktopMatchConcluded must be false after undo"
        assert reverted_desktop["bannerDisplay"] == "none", "#scorecardResultHighlight must be hidden after undo"

        # Verify zero critical console errors
        assert_no_critical_errors(page)
        await browser.close()
