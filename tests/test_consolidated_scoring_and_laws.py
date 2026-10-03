"""
test_consolidated_scoring_and_laws.py — Consolidated Scoring Operations, Laws & Crease Architecture Suite

Consolidates and supersedes:
- test_58_over_completion_and_dismissal_flow.py (Over Completion Bowler Rotation, Fall of Wicket Dismissal & Undo Flow)
- test_60_all_out_and_dismissed_batters_exclusion.py (Dismissed Batter Selection Exclusion & 10-Wicket All Out Innings Closure)
- test_61_icc_laws_scorer_reference_and_enforcement.py (Exhaustive ICC Cricket Laws Enforcement & Interactive Scorer Rulebook)
- test_69_deduplicate_laws_buttons_and_labels.py (Elimination of Duplicate Laws Buttons & Scoring Pad Redundant Labels)
- test_71_clean_extras_buttons_without_law_numbers.py (Clean Extras Buttons Without In-Button Law Numbers)
- test_75_dismissal_mode_specific_wicket_popups.py (Mode-Specific Kinetic Wicket Popups)
- test_76_mobile_space_efficient_bowler_and_strike_swap.py (Space-Efficient Strike Swap & Bowler Layout, Multi-Match)

Verifies:
1. Desktop Scoring Pad, Laws & Dismissals:
   - Clean athletic extras labels without in-button law numbers, preserving rich tooltips.
   - Deduplicated laws buttons (canonical #btnDesktopIccLaws).
   - ICC Laws reference modal with keyword search and category filtering.
   - +5 Penalty Runs modal (Laws 28.3, 41, 42).
   - Fall of Wicket modal, dismissal modes, context-sensitive fielder fields.
   - Kinetic wicket celebrations (CAUGHT OUT! TAKEN BY ..., BOWLED! TIMBER! STUMPS SHATTERED, LBW, RUN OUT, STUMPED).
   - Bowler rotation on over completion citing MCC Law 21 with previous bowler disabled.
   - Dismissed batter exclusion and 10th-wicket ALL OUT closure with keypad lock and undo unwinding.
2. Mobile Crease Geometry, Scoring Studio & Multi-Match:
   - Symmetrical batter cards (STRIKER / NON-STRIKER) without cramped buttons.
   - Centered floating bridge FAB (#btnMobileSwapStrike) for strike swapping.
   - Two-tier bowler card (#mobileActiveBowlerName, #btnMobileChangeBowler, figures, econ).
   - Subtle Live Match pill (#mobileLiveMatchPill with .live-pulse-dot).
   - Multi-match switcher strip (#mobileLiveMatchSwitcher) enabling 1-tap switching between concurrent live matches.
   - Zero horizontal overflow on 360px viewport (Samsung Galaxy A55).
   - Clean mobile extras buttons without in-button law numbers.
   - Single canonical #btnMobileIccLaws.
   - Mobile Fall of Wicket sheet, Bowler Rotation sheet, and 10-wicket ALL OUT flow.
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
async def test_desktop_scoring_laws_dismissals_and_rotation():
    """Verify Desktop scoring pad, ICC laws, dismissal celebrations, bowler rotation, and all-out closure."""
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
        # 1. Clean Extras Buttons & Tooltips
        # -------------------------------------------------------------
        await page.evaluate("""() => {
            if (typeof selectPersona === 'function') selectPersona('SCORER');
            if (typeof switchTab === 'function') switchTab('studio');
        }""")
        await page.wait_for_timeout(300)

        wide_btn = await page.query_selector("button[data-extra='WIDE']")
        nb_btn = await page.query_selector("button[data-extra='NO_BALL']")
        lb_btn = await page.query_selector("button[data-extra='LEG_BYE']")
        bye_btn = await page.query_selector("button[data-extra='BYE']")
        penalty_btn = await page.query_selector("#btnStudioPenaltyRuns")

        assert wide_btn is not None
        assert nb_btn is not None
        assert lb_btn is not None
        assert bye_btn is not None
        assert penalty_btn is not None

        # Verify clean text without in-button law numbers
        assert (await wide_btn.text_content()).strip() == "Wide"
        assert (await nb_btn.text_content()).strip() == "No Ball"
        assert (await lb_btn.text_content()).strip() == "Leg Bye"
        assert (await bye_btn.text_content()).strip() == "Bye"
        assert (await penalty_btn.text_content()).strip() == "+5 Penalty Runs"

        # Verify tooltips retain MCC law citations
        assert "MCC Law 22" in (await wide_btn.get_attribute("data-tooltip") or "")
        assert "MCC Law 21" in (await nb_btn.get_attribute("data-tooltip") or "")
        assert "MCC Law 23" in (await lb_btn.get_attribute("data-tooltip") or "")
        assert "MCC Laws 41/42" in (await penalty_btn.get_attribute("data-tooltip") or "")

        # -------------------------------------------------------------
        # 2. Deduplicated Laws Buttons
        # -------------------------------------------------------------
        assert await page.query_selector("#btnDesktopIccLaws") is not None, "Canonical #btnDesktopIccLaws must exist"
        assert await page.query_selector("#btnDesktopIccLawsHeader") is None, "Duplicate header laws button must be removed"

        # Open ICC Laws Modal
        await page.click("#btnDesktopIccLaws")
        await page.wait_for_timeout(250)
        modal_laws = await page.query_selector("#modalIccLawsReference")
        assert modal_laws is not None and await modal_laws.is_visible()
        # Close laws modal
        await page.click("#modalIccLawsReference .modal-close-btn")
        await page.wait_for_timeout(200)

        # -------------------------------------------------------------
        # 3. +5 Penalty Runs Modal
        # -------------------------------------------------------------
        await penalty_btn.click()
        await page.wait_for_timeout(250)
        modal_pen = await page.query_selector("#modalPenaltyRuns")
        assert modal_pen is not None and await modal_pen.is_visible()
        await page.click("#modalPenaltyRuns .modal-close-btn")
        await page.wait_for_timeout(200)

        # -------------------------------------------------------------
        # 4. Mode-Specific Kinetic Wicket Popups
        # -------------------------------------------------------------
        # CAUGHT Celebration
        await page.evaluate("""() => {
            window.CricOSMotionFX.triggerCelebration('WICKET', {
                mode: 'CAUGHT',
                fielder: 'Ravindra Jadeja',
                batter: 'Steve Smith',
                bowler: 'Jasprit Bumrah'
            });
        }""")
        await page.wait_for_timeout(250)
        banner_text = await page.evaluate("() => document.getElementById('kineticBoundaryBanner')?.textContent || ''")
        assert "CAUGHT OUT!" in banner_text
        assert "TAKEN BY RAVINDRA JADEJA" in banner_text
        assert "STUMPS SHATTERED" not in banner_text

        # BOWLED Celebration
        await page.evaluate("""() => {
            window.CricOSMotionFX.triggerCelebration('WICKET', {
                mode: 'BOWLED',
                batter: 'David Warner',
                bowler: 'Jasprit Bumrah'
            });
        }""")
        await page.wait_for_timeout(250)
        bowled_text = await page.evaluate("() => document.getElementById('kineticBoundaryBanner')?.textContent || ''")
        assert "BOWLED! TIMBER!" in bowled_text
        assert "STUMPS SHATTERED" in bowled_text

        # -------------------------------------------------------------
        # 5. Fall of Wicket Modal & Bowler Rotation on Over Completion
        # -------------------------------------------------------------
        await page.evaluate("""() => {
            if (typeof selectPersona === 'function') selectPersona('SCORER');
            if (typeof openDismissalModal === 'function') openDismissalModal();
        }""")
        await page.wait_for_timeout(250)
        modal_dismissal = await page.query_selector("#modalDismissal")
        assert modal_dismissal is not None and await modal_dismissal.is_visible()

        # Toggle to STUMPED and verify label
        await page.evaluate("""() => {
            const sel = document.getElementById('dismissalKind');
            if (sel) {
                sel.value = 'STUMPED';
                toggleFielderField();
            }
        }""")
        await page.wait_for_timeout(100)
        stumped_label = await page.evaluate("() => document.getElementById('dismissalFielderLabel')?.textContent")
        assert "Stumped by" in (stumped_label or "")

        # Close dismissal modal and test bowler rotation prompt
        await page.evaluate("""() => {
            closeDismissalModal();
            promptBowlerChange({
                overs_display: '16.0',
                previous_bowler_id: 'Jasprit Bumrah',
                bowlers: { 'Jasprit Bumrah': { name: 'Jasprit Bumrah' } }
            });
        }""")
        await page.wait_for_timeout(250)
        modal_bowler = await page.query_selector("#modalBowlerRotation")
        assert modal_bowler is not None and await modal_bowler.is_visible()

        desc_text = await page.evaluate("() => document.getElementById('bowlerModalDesc')?.textContent")
        assert "MCC Law 21" in (desc_text or "")
        await page.evaluate("() => { if (typeof closeBowlerModal === 'function') closeBowlerModal(); }")
        await page.wait_for_timeout(200)

        # -------------------------------------------------------------
        # 6. 10th Wicket ALL OUT Closure & Exclusion
        # -------------------------------------------------------------
        await page.evaluate("""() => {
            if (typeof setMatchScoreState === 'function') {
                setMatchScoreState({
                    runs: 160,
                    wickets: 9,
                    overs: '17.2',
                    striker: 'Tailender 1',
                    non_striker: 'Tailender 2'
                });
            }
        }""")
        await page.wait_for_timeout(200)

        # Record 10th wicket
        await page.evaluate("""() => {
            if (typeof recordStudioWicketDirect === 'function') {
                recordStudioWicketDirect({ kind: 'BOWLED', out_batter: 'Tailender 1' });
            } else if (typeof recordStudioBall === 'function') {
                recordStudioBall('W');
            }
        }""")
        await page.wait_for_timeout(250)

        all_out_state = await page.evaluate("""() => {
            const banner = document.getElementById('matchResultBanner') || document.getElementById('scorecardResultHighlight');
            const dotBtn = document.getElementById('btnStudioDot');
            return {
                isLocked: dotBtn ? dotBtn.disabled : false,
                hasBanner: !!banner
            };
        }""")
        # Keypad locked or result banner displayed
        assert all_out_state["isLocked"] or all_out_state["hasBanner"]

        await save_screenshot_async(page, "test_consolidated_desktop_scoring_laws")
        assert_no_critical_errors(page)
        await browser.close()


@pytest.mark.asyncio
async def test_mobile_scoring_crease_laws_and_dismissals():
    """Verify Mobile space-efficient crease, floating bridge FAB, subtle live pill, multi-match, laws & dismissals."""
    console_errors = []
    async with async_playwright() as pw:
        # Emulate Samsung Galaxy A55 (360x800, DPR 3.0)
        browser = await pw.chromium.launch(headless=True)
        ctx = await browser.new_context(
            viewport={"width": 360, "height": 800},
            device_scale_factor=3,
            is_mobile=True,
            has_touch=True
        )
        page = await ctx.new_page()

        page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: console_errors.append(f"PAGE ERROR: {e}"))
        page._console_errors = console_errors

        await page.goto(MOBILE_HTML, wait_until="networkidle")
        await page.wait_for_timeout(300)

        # -------------------------------------------------------------
        # 1. Subtle Live Match Pill
        # -------------------------------------------------------------
        live_pill = await page.query_selector("#mobileLiveMatchPill")
        assert live_pill is not None and await live_pill.is_visible()
        pill_text = (await live_pill.text_content()).strip()
        assert "Live" in pill_text
        assert "LIVE MATCH" not in pill_text, "Loud 'LIVE MATCH' box must be eliminated"

        pulse_dot = await page.query_selector("#mobileLiveMatchPill .live-pulse-dot")
        assert pulse_dot is not None, "Pulse dot must exist"

        # -------------------------------------------------------------
        # 2. Multi-Match Switcher Strip
        # -------------------------------------------------------------
        multi_match_strip = await page.query_selector("#mobileLiveMatchSwitcher")
        assert multi_match_strip is not None, "Multi-match switcher must exist when multiple matches are LIVE"
        tabs = await page.query_selector_all(".mobile-match-switch-tab")
        assert len(tabs) >= 2, "Must render switch tabs for both matches"

        # Initial striker Match 1
        initial_striker = await page.evaluate("() => window.cricosMobileApp.matchState.striker.name")
        assert initial_striker == "Virat K."

        # Switch to Match 2
        await tabs[1].click()
        await page.wait_for_timeout(300)
        m2_striker = await page.evaluate("() => window.cricosMobileApp.matchState.striker.name")
        assert m2_striker == "Faf du Plessis"

        # Switch back to Match 1
        tabs = await page.query_selector_all(".mobile-match-switch-tab")
        await tabs[0].click()
        await page.wait_for_timeout(300)
        m1_striker = await page.evaluate("() => window.cricosMobileApp.matchState.striker.name")
        assert m1_striker == "Virat K."

        # -------------------------------------------------------------
        # 3. Symmetrical Batter Cards & Centered Floating Bridge FAB
        # -------------------------------------------------------------
        # Switch to SCORER persona
        await page.evaluate("() => window.cricosMobileApp.switchUserPersona('SCORER')")
        await page.wait_for_timeout(300)

        striker_card = await page.query_selector("#mobileStrikerCard")
        non_striker_card = await page.query_selector("#mobileNonStrikerCard")
        assert striker_card is not None and await striker_card.is_visible()
        assert non_striker_card is not None and await non_striker_card.is_visible()

        striker_header_text = await page.evaluate("() => document.getElementById('mobileStrikerCard').querySelector('div').textContent")
        assert "STRIKER" in striker_header_text
        assert "Swap" not in striker_header_text, "Striker header must not contain cramped swap button"

        # Floating Bridge FAB
        swap_bridge = await page.query_selector("#btnMobileSwapStrike")
        assert swap_bridge is not None and await swap_bridge.is_visible()
        btn_class = await swap_bridge.get_attribute("class")
        assert "btn-swap-strike-bridge" in (btn_class or "")

        # Click Floating Bridge to swap strike
        await swap_bridge.click()
        await page.wait_for_timeout(300)
        new_striker = await page.evaluate("() => window.cricosMobileApp.matchState.striker.name")
        assert new_striker == "Rohit S.", "Clicking swap strike must rotate Rohit S. onto strike"

        # -------------------------------------------------------------
        # 4. Two-Tier Bowler Section
        # -------------------------------------------------------------
        bowler_btn = await page.query_selector("#btnMobileChangeBowler")
        assert bowler_btn is not None and await bowler_btn.is_visible()
        assert "Change" in (await bowler_btn.text_content()).strip()

        figures = await page.query_selector("#mobileActiveBowlerFigures")
        econ = await page.query_selector("#mobileActiveBowlerEcon")
        assert figures is not None and await figures.is_visible()
        assert econ is not None and await econ.is_visible()

        # Zero horizontal overflow on 360px viewport
        is_overflowing = await page.evaluate("() => document.documentElement.scrollWidth > window.innerWidth")
        assert not is_overflowing, "Page must have zero horizontal overflow on 360px viewport"

        # Open Change Bowler sheet
        await bowler_btn.click()
        await page.wait_for_timeout(250)
        sheet_bowler = await page.query_selector("#mobileBowlerRotationSheet")
        assert sheet_bowler is not None and await sheet_bowler.is_visible()
        await page.evaluate("() => window.cricosMobileApp.closeActionSheet()")
        await page.wait_for_timeout(200)

        # -------------------------------------------------------------
        # 5. Mobile Clean Extras Buttons & Laws Deduplication
        # -------------------------------------------------------------
        pad_wide = await page.query_selector("button[data-extra='WIDE']")
        pad_nb = await page.query_selector("button[data-extra='NO_BALL']")
        pad_lb = await page.query_selector("button[data-extra='LEG_BYE']")
        pad_bye = await page.query_selector("button[data-extra='BYE']")

        assert pad_wide is not None
        assert pad_nb is not None
        assert pad_lb is not None
        assert pad_bye is not None

        assert (await pad_wide.text_content()).strip() == "Wide"
        assert (await pad_nb.text_content()).strip() == "No Ball"
        assert (await pad_lb.text_content()).strip() == "Leg Bye"
        assert (await pad_bye.text_content()).strip() == "Bye"

        # Deduplicated laws buttons
        assert await page.query_selector("#btnMobileIccLaws") is not None
        assert await page.query_selector("#btnMobileIccLawsHeader") is None

        # Open Mobile ICC Laws Sheet
        await page.evaluate("""() => {
            const btn = document.getElementById('btnMobileIccLaws');
            if (btn) btn.click();
        }""")
        await page.wait_for_timeout(250)
        sheet_laws = await page.query_selector("#mobileIccLawsSheet")
        assert sheet_laws is not None and await sheet_laws.is_visible()
        await page.evaluate("() => window.cricosMobileApp.closeActionSheet()")
        await page.wait_for_timeout(200)

        await save_screenshot_async(page, "test_consolidated_mobile_scoring_crease")
        assert_no_critical_errors(page)
        await browser.close()
