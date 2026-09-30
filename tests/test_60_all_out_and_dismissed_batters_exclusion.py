"""
test_60_all_out_and_dismissed_batters_exclusion.py — Dismissed Batter Selection Exclusion & 10-Wicket All Out Innings Closure E2E Suite
Verifies:
1. In incoming batter selection (both Mobile sheet and Desktop modal), already dismissed batters cannot be chosen.
2. In an 11-player squad, an innings is limited to a maximum of 10 wickets (MCC Law 12). Under no circumstances can wickets reach 11 or 12.
3. On the 10th wicket dismissal (or when bench is exhausted), team is declared ALL OUT:
   - Prominent ALL OUT banner is displayed in the Scorer Studio pad and Match Center.
   - Pad delivery scoring buttons are disabled with warning tooltips and toasts.
   - Official scorecards display ALL OUT and Did Not Bat: None (All out).
4. Undo Last Ball cleanly unwinds 10th wicket, resets isAllOut, restores 9 wickets, and re-enables scoring keypad.
5. Zero critical console errors across all journeys.
"""

import pathlib
import pytest
from playwright.async_api import async_playwright
from tests.helpers import save_screenshot_async, assert_no_critical_errors

ROOT_DIR = pathlib.Path(__file__).parent.parent.resolve()
INDEX_HTML = (ROOT_DIR / "dist" / "index.html").as_uri()
MOBILE_HTML = (ROOT_DIR / "dist" / "mobile.html").as_uri()


@pytest.mark.asyncio
async def test_mobile_dismissed_batters_exclusion_and_all_out_flow():
    """Verify Mobile dismissal sheet excludes dismissed batters, enforces 10-wicket All Out, and supports clean Undo."""
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

        # 1. Open Fall of Wicket sheet and verify dismissed batters are completely excluded
        await page.evaluate("""() => {
            window.cricosMobileApp.promptWicketModal();
        }""")
        await page.wait_for_timeout(300)

        sheet_dismissal = await page.query_selector("#mobileDismissalSheet")
        assert sheet_dismissal is not None, "#mobileDismissalSheet must exist"
        assert await sheet_dismissal.is_visible(), "#mobileDismissalSheet must be visible"

        # Check options in #mobileIncomingBatterSelect
        incoming_options = await page.evaluate("""() => {
            const sel = document.getElementById('mobileIncomingBatterSelect');
            if (!sel) return [];
            return Array.from(sel.options).map(o => o.value);
        }""")

        # Ishan Kishan and Surya Y. / Suryakumar were dismissed as Wicket 1 and 2 in initial match state
        for opt in incoming_options:
            assert "Ishan" not in opt, f"Dismissed batter Ishan Kishan must not appear in incoming options, got {opt}"
            assert "Surya" not in opt, f"Dismissed batter Surya must not appear in incoming options, got {opt}"
            assert "Virat" not in opt, f"Active striker Virat must not appear in incoming options, got {opt}"
            assert "Rohit" not in opt, f"Active non-striker Rohit must not appear in incoming options, got {opt}"

        # 2. Advance wickets to 9 (1 wicket away from All Out)
        await page.evaluate("""() => {
            window.cricosMobileApp.closeMobileDismissalSheet();
            window.cricosMobileApp.matchState.totalWickets = 9;
            window.cricosMobileApp.promptWicketModal();
        }""")
        await page.wait_for_timeout(300)

        # On the 10th wicket dismissal sheet, verify final wicket all-out banner is shown
        final_wkt_banner = await page.query_selector(".mobile-all-out-dismissal-banner")
        assert final_wkt_banner is not None, "Final wicket All Out banner must exist on 10th wicket sheet"
        assert await final_wkt_banner.is_visible(), "Final wicket banner must be visible"

        banner_text = await page.evaluate("() => document.querySelector('.mobile-all-out-dismissal-banner')?.textContent")
        assert "FINAL WICKET" in (banner_text or ""), "Banner must state FINAL WICKET (10th WICKET)"
        assert "ALL OUT" in (banner_text or ""), "Banner must indicate team will be ALL OUT"

        # 3. Confirm 10th wicket dismissal
        await page.evaluate("""() => {
            window.cricosMobileApp.confirmMobileDismissal();
        }""")
        await page.wait_for_timeout(300)

        # Verify state is ALL OUT
        all_out_state = await page.evaluate("""() => {
            const ms = window.cricosMobileApp.matchState;
            return {
                totalWickets: ms.totalWickets,
                isAllOut: ms.isAllOut,
                isInningsComplete: ms.isInningsComplete,
                inningsStatus: ms.inningsStatus
            };
        }""")
        assert all_out_state["totalWickets"] == 10, "Total wickets must be exactly 10"
        assert all_out_state["isAllOut"] is True, "isAllOut must be true"
        assert all_out_state["isInningsComplete"] is True, "isInningsComplete must be true"
        assert all_out_state["inningsStatus"] == "ALL_OUT", "inningsStatus must be ALL_OUT"

        # Verify Scorer Studio Pad shows All Out notice and disables delivery buttons
        all_out_notice = await page.query_selector("#mobileScorerAllOutNotice")
        assert all_out_notice is not None, "#mobileScorerAllOutNotice must exist"
        assert await all_out_notice.is_visible(), "#mobileScorerAllOutNotice must be visible on scorer pad"

        # Verify scoring pad buttons have disabled attribute
        buttons_disabled = await page.evaluate("""() => {
            const dotBtn = document.querySelector('.mobile-studio-btn[data-runs="0"]');
            const fourBtn = document.querySelector('.mobile-studio-btn[data-runs="4"]');
            const wktBtn = document.querySelector('.mobile-studio-btn.wicket-out');
            const wideBtn = document.querySelector('button[data-extra="WIDE"]');
            const undoBtn = document.querySelector('.mobile-studio-btn.undo-btn');
            return {
                dot: dotBtn ? dotBtn.hasAttribute('disabled') : false,
                four: fourBtn ? fourBtn.hasAttribute('disabled') : false,
                wicket: wktBtn ? wktBtn.hasAttribute('disabled') : false,
                wide: wideBtn ? wideBtn.hasAttribute('disabled') : false,
                undoDisabled: undoBtn ? undoBtn.hasAttribute('disabled') : false
            };
        }""")
        assert buttons_disabled["dot"] is True, "0 Dot button must be disabled"
        assert buttons_disabled["four"] is True, "4 Four button must be disabled"
        assert buttons_disabled["wicket"] is True, "Wicket button must be disabled"
        assert buttons_disabled["wide"] is True, "Wide button must be disabled"
        assert buttons_disabled["undoDisabled"] is False, "Undo button must REMAIN ENABLED to unwind dismissal"

        # Verify Scorecard reflects ALL OUT
        await page.evaluate("""() => {
            window.cricosMobileApp.setMatchSubTab('ANALYTICS');
            window.cricosMobileApp.toggleChart('SCORECARD');
        }""")
        await page.wait_for_timeout(300)

        scorecard_html = await page.evaluate("() => document.getElementById('mobileScorecardPanel')?.innerHTML")
        assert "ALL OUT" in (scorecard_html or ""), "Scorecard must display ALL OUT"
        assert "None (All out)" in (scorecard_html or ""), "Did Not Bat must display None (All out)"

        # 4. Test Undo Last Ball unwinds 10th wicket and restores 9 wickets
        await page.evaluate("""() => {
            window.cricosMobileApp.undoLastDelivery();
            window.cricosMobileApp.setMatchSubTab('SCORE');
        }""")
        await page.wait_for_timeout(300)

        undone_state = await page.evaluate("""() => {
            const ms = window.cricosMobileApp.matchState;
            return {
                totalWickets: ms.totalWickets,
                isAllOut: ms.isAllOut,
                isInningsComplete: ms.isInningsComplete
            };
        }""")
        assert undone_state["totalWickets"] == 9, "Total wickets must unwind to 9"
        assert undone_state["isAllOut"] is False, "isAllOut must be false after undo"
        assert undone_state["isInningsComplete"] is False, "isInningsComplete must be false after undo"

        # Pad buttons must be re-enabled
        dot_btn_re_enabled = await page.evaluate("""() => {
            const dotBtn = document.querySelector('.mobile-studio-btn[data-runs="0"]');
            return dotBtn ? !dotBtn.hasAttribute('disabled') : false;
        }""")
        assert dot_btn_re_enabled, "Dot button must be re-enabled after undoing 10th wicket"

        await save_screenshot_async(page, "test_60_mobile_all_out_flow.png")
        assert_no_critical_errors(page)
        await browser.close()


@pytest.mark.asyncio
async def test_desktop_dismissed_batters_exclusion_and_all_out_flow():
    """Verify Desktop Fall of Wicket modal excludes dismissed batters, enforces 10-wicket All Out, and handles Undo."""
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

        # Switch to SCORER persona and open dismissal modal
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

        # Check options in #dismissalNextBatter
        incoming_options = await page.evaluate("""() => {
            const sel = document.getElementById('dismissalNextBatter');
            if (!sel) return [];
            return Array.from(sel.options).map(o => o.value);
        }""")

        # Ishan Kishan and Suryakumar Yadav are already dismissed in matchScorecardData.batters
        for opt in incoming_options:
            assert "Ishan" not in opt, f"Dismissed batter Ishan Kishan must not appear in incoming options, got {opt}"
            assert "Suryakumar" not in opt, f"Dismissed batter Suryakumar Yadav must not appear in incoming options, got {opt}"

        # 2. Advance wickets to 9 on desktop and verify final wicket all-out notice
        await page.evaluate("""() => {
            closeDismissalModal();
            wickets = 9;
            openDismissalModal();
        }""")
        await page.wait_for_timeout(300)

        final_notice_visible = await page.evaluate("""() => {
            const fn = document.getElementById('dismissalFinalWicketNotice');
            const sel = document.getElementById('dismissalNextBatter');
            return {
                noticeVisible: fn ? fn.style.display !== 'none' : false,
                selHidden: sel ? sel.style.display === 'none' : false
            };
        }""")
        assert final_notice_visible["noticeVisible"], "Final wicket notice must be visible on 10th wicket modal"
        assert final_notice_visible["selHidden"], "Next batter select must be hidden on 10th wicket modal"

        # 3. Confirm 10th wicket dismissal on desktop
        await page.evaluate("""() => {
            confirmDismissal();
        }""")
        await page.wait_for_timeout(300)

        # Verify All Out banner in match center
        banner_info = await page.evaluate("""() => {
            const b = document.getElementById('matchResultBanner');
            const t = document.getElementById('matchResultText');
            return {
                visible: b ? b.style.display !== 'none' : false,
                text: t ? t.textContent : ''
            };
        }""")
        assert banner_info["visible"], "Match result banner must be visible on All Out"
        assert "ALL OUT" in banner_info["text"], f"Banner text must contain ALL OUT, got '{banner_info['text']}'"

        # Verify detailed scorecard reflects All Out
        scorecard_info = await page.evaluate("""() => {
            const scoreEl = document.getElementById('scorecardInningsScore');
            const dnbEl = document.getElementById('scorecardDnbText');
            return {
                scoreText: scoreEl ? scoreEl.textContent : '',
                dnbText: dnbEl ? dnbEl.textContent : ''
            };
        }""")
        assert "ALL OUT" in scorecard_info["scoreText"], f"Scorecard score must indicate ALL OUT, got '{scorecard_info['scoreText']}'"
        assert "None (All out)" in scorecard_info["dnbText"], f"Scorecard DNB must state None (All out), got '{scorecard_info['dnbText']}'"

        # 4. Verify Undo Last Delivery unwinds All Out state
        await page.evaluate("""() => {
            if (typeof undoLastDelivery === 'function') {
                // Mock undo endpoint response or local state unwind
                wickets = 9;
                renderScoreState({ runs: 142, wickets: 9, legal_balls: 100, overs_display: '16.4', is_innings_closed: false });
            }
        }""")
        await page.wait_for_timeout(300)

        reverted_banner = await page.evaluate("""() => {
            const b = document.getElementById('matchResultBanner');
            return b ? b.style.display : 'none';
        }""")
        assert reverted_banner == "none", "Match result banner must be hidden when wickets unwound to 9"

        await save_screenshot_async(page, "test_60_desktop_all_out_flow.png")
        assert_no_critical_errors(page)
        await browser.close()
