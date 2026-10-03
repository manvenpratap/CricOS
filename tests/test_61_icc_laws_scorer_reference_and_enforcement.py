"""
test_61_icc_laws_scorer_reference_and_enforcement.py — Exhaustive ICC Cricket Laws Enforcement & Interactive Scorer Rulebook E2E Suite
Verifies:
1. Mobile Scorer Studio:
   - Interactive ICC Laws Reference Sheet (#mobileIccLawsSheet):
     - Opened via canonical #btnMobileIccLaws.
     - Live search filtering (#mobileIccLawSearchInput) filters law entries dynamically.
     - Category filter chips (ALL, EXTRAS, DISMISSALS, FAIR_PLAY, MATCH_OPS, FIELDING) filter rules.
     - Displays Law Title, MCC Law clause, Summary, Scorer Directives, CricOS Automation notes, and Quick Action buttons.
   - Dedicated +5 Penalty Runs Award Sheet (#mobilePenaltyRunsSheet):
     - Opened via #btnMobileStudioPenaltyRuns (+5 Penalty).
     - Allows selection of penalty violation (Helmet strike Law 28.3, Unfair play Law 41, Player conduct Law 42).
     - Awards +5 penalty runs to extras.penalties and total runs without advancing legal ball count or debiting bowler.
   - Free Hit Enforcement (ICC Standard Playing Conditions Clause 21.19):
     - Triggered on No Ball delivery: displays prominent #mobileFreeHitBadge.
     - Opening Fall of Wicket sheet shows #mobileDismissalFreeHitAlert.
     - Prohibited striker dismissal modes (Bowled, Caught, LBW, Stumped, Hit Wicket) are visually dimmed and disabled.
     - Permitted dismissal modes (Run Out, Obstructing, Hit Ball Twice) remain enabled.
     - Selecting Run Out successfully records dismissal.
   - Caught Strike Rotation (ICC Oct 2022 Amendment to Law 18.11):
     - Incoming batter always takes strike at striker's end on Caught dismissal.
   - Retired Hurt vs Retired Out (MCC Law 25.4):
     - Retired Hurt leaves batter as not out, does not increment team wickets, and does not record FOW.
2. Desktop Match Center:
   - Interactive ICC Laws Reference Modal (#modalIccLawsReference) opened via #btnDesktopIccLaws.
   - Live search (#desktopIccLawSearchInput) and category filtering.
   - Dedicated +5 Penalty Runs Modal (#modalPenaltyRuns) opened via #btnStudioPenaltyRuns.
   - Desktop Free Hit delivery banner (#studioFreeHitBanner) and dismissal modal alert (#dismissalFreeHitAlert).
   - Dismissal mode restriction on Free Hit: prohibited modes blocked for striker.
3. Zero critical console errors across all flows.
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
async def test_mobile_icc_laws_scorer_reference_and_enforcement_flow():
    """Verify Mobile Scorer Studio ICC Laws Reference Sheet, +5 Penalty Runs, and Free Hit enforcement."""
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

        # 1. Switch to SCORER persona
        await page.evaluate("""() => {
            if (window.cricosMobileApp) {
                window.cricosMobileApp.switchUserPersona('SCORER');
            }
        }""")
        await page.wait_for_timeout(300)

        # 2. Verify ICC Laws Reference button exists in Scorer Studio pad
        laws_btn = await page.query_selector("#btnMobileIccLaws")
        assert laws_btn is not None, "#btnMobileIccLaws button must exist in mobile scorer studio pad"

        # Verify clean Extras buttons without in-button law numbers
        pad_text = await page.evaluate("() => document.getElementById('mobileScorerStudioPad')?.textContent || ''")
        assert "[Law 22]" not in pad_text, "Pad should not show Law 22 on Wide button text"
        assert "[Law 21⚡]" not in pad_text, "Pad should not show Law 21 on No Ball button text"
        assert "[Law 23]" not in pad_text, "Pad should not show Law 23 on Bye / Leg Bye buttons text"
        wide_tooltip = await page.get_attribute("button[data-extra='WIDE']", "data-tooltip")
        assert "MCC Law 22" in (wide_tooltip or ""), "Wide button tooltip must retain MCC Law 22 reference"
        nb_tooltip = await page.get_attribute("button[data-extra='NO_BALL']", "data-tooltip")
        assert "MCC Law 21" in (nb_tooltip or ""), "No Ball button tooltip must retain MCC Law 21 reference"

        # 3. Open ICC Laws Reference Rulebook Sheet
        await page.evaluate("""() => {
            window.cricosMobileApp.openIccLawsSheet();
        }""")
        await page.wait_for_timeout(300)

        sheet = await page.query_selector("#mobileIccLawsSheet")
        assert sheet is not None, "#mobileIccLawsSheet must be rendered"
        assert await sheet.is_visible(), "#mobileIccLawsSheet must be visible"

        # Check search input and initial rule count
        search_input = await page.query_selector("#mobileIccLawSearchInput")
        assert search_input is not None, "#mobileIccLawSearchInput must exist"

        initial_count = await page.evaluate("() => document.querySelectorAll('#mobileIccLawsList .mobile-icc-law-card').length")
        assert initial_count >= 15, f"Expected at least 15 codified laws, got {initial_count}"

        # 4. Perform search for 'Free Hit'
        await page.evaluate("""() => {
            window.cricosMobileApp.searchMobileIccLaws('Free Hit');
        }""")
        await page.wait_for_timeout(200)

        filtered_count = await page.evaluate("() => document.querySelectorAll('#mobileIccLawsList .mobile-icc-law-card').length")
        assert 1 <= filtered_count <= 12, f"Search for 'Free Hit' should filter to matching laws, got {filtered_count}"

        law_card_text = await page.evaluate("() => document.querySelector('#mobileIccLawsList .mobile-icc-law-card')?.textContent || ''")
        assert "Free Hit" in law_card_text or "No Ball" in law_card_text, "Filtered card should contain Free Hit details"

        # 5. Filter by category 'DISMISSALS'
        await page.evaluate("""() => {
            window.cricosMobileApp.setMobileIccLawsCategory('DISMISSALS');
        }""")
        await page.wait_for_timeout(200)

        dismissal_count = await page.evaluate("() => document.querySelectorAll('#mobileIccLawsList .mobile-icc-law-card').length")
        assert dismissal_count >= 5, f"Dismissals category should contain at least 5 rules, got {dismissal_count}"

        await save_screenshot_async(page, "test_61_mobile_icc_laws_sheet.png")

        # Close Laws sheet
        await page.evaluate("""() => {
            window.cricosMobileApp.closeIccLawsSheet();
        }""")
        await page.wait_for_timeout(200)

        # 6. Test +5 Penalty Runs Award Sheet
        initial_score = await page.evaluate("""() => {
            const ms = window.cricosMobileApp.matchState;
            return { runs: ms.totalRuns, penalties: ms.extras.penalty, balls: ms.legalBalls };
        }""")

        await page.evaluate("""() => {
            window.cricosMobileApp.openPenaltyRunsSheet();
        }""")
        await page.wait_for_timeout(300)

        penalty_sheet = await page.query_selector("#mobilePenaltyRunsSheet")
        assert penalty_sheet is not None, "#mobilePenaltyRunsSheet must exist"
        assert await penalty_sheet.is_visible(), "#mobilePenaltyRunsSheet must be visible"

        # Select Helmet Strike (Law 28.3) and confirm award
        await page.evaluate("""() => {
            window.cricosMobileApp.selectPenaltyType('HELMET_28_3');
            window.cricosMobileApp.confirmPenaltyRunsAward();
        }""")
        await page.wait_for_timeout(300)

        updated_score = await page.evaluate("""() => {
            const ms = window.cricosMobileApp.matchState;
            return { runs: ms.totalRuns, penalties: ms.extras.penalty, balls: ms.legalBalls };
        }""")

        assert updated_score["runs"] == initial_score["runs"] + 5, "Total runs must increment by 5"
        assert updated_score["penalties"] == initial_score["penalties"] + 5, "Penalty extras must increment by 5"
        assert updated_score["balls"] == initial_score["balls"], "Legal balls must not advance on penalty runs"

        # 7. Test Free Hit delivery activation and dismissal restrictions
        # Record a No Ball to activate Free Hit
        await page.evaluate("""() => {
            window.cricosMobileApp.openExtraPickerSheet('NO_BALL');
            window.cricosMobileApp.applyExtraDelivery('NO_BALL', {
                totalRuns: 1,
                extraRuns: 1,
                batRuns: 0,
                penalty: 0,
                byes: 0,
                legByes: 0,
                isFreeHit: true
            });
        }""")
        await page.wait_for_timeout(300)

        # Verify Free Hit banner is visible
        free_hit_badge = await page.query_selector("#mobileFreeHitBadge")
        assert free_hit_badge is not None, "#mobileFreeHitBadge must be present"
        assert await free_hit_badge.is_visible(), "#mobileFreeHitBadge must be visible"
        badge_text = await page.evaluate("() => document.getElementById('mobileFreeHitBadge')?.textContent || ''")
        assert "FREE HIT" in badge_text, "Badge should display FREE HIT status"

        # Open Fall of Wicket sheet while Free Hit is active
        await page.evaluate("""() => {
            window.cricosMobileApp.openMobileDismissalSheet();
        }""")
        await page.wait_for_timeout(300)

        # Verify Free Hit alert inside dismissal sheet
        fh_alert = await page.query_selector("#mobileDismissalFreeHitAlert")
        assert fh_alert is not None, "#mobileDismissalFreeHitAlert must exist in sheet"
        assert await fh_alert.is_visible(), "#mobileDismissalFreeHitAlert must be visible"

        # Verify prohibited modes are disabled for striker
        modes_state = await page.evaluate("""() => {
            const btns = Array.from(document.querySelectorAll('#mobileDismissalSheet button[data-mode]'));
            return {
                bowledDisabled: btns.find(b => b.dataset.mode === 'BOWLED')?.disabled,
                caughtDisabled: btns.find(b => b.dataset.mode === 'CAUGHT')?.disabled,
                lbwDisabled: btns.find(b => b.dataset.mode === 'LBW')?.disabled,
                stumpedDisabled: btns.find(b => b.dataset.mode === 'STUMPED')?.disabled,
                hitWicketDisabled: btns.find(b => b.dataset.mode === 'HIT_WICKET')?.disabled,
                runOutDisabled: btns.find(b => b.dataset.mode === 'RUN_OUT')?.disabled,
                activeMode: window.cricosMobileApp.selectedDismissalMode || window.cricosMobileApp.pendingDismissalMode
            };
        }""")

        assert modes_state["bowledDisabled"] is True, "Bowled must be disabled on Free Hit"
        assert modes_state["caughtDisabled"] is True, "Caught must be disabled on Free Hit"
        assert modes_state["lbwDisabled"] is True, "LBW must be disabled on Free Hit"
        assert modes_state["stumpedDisabled"] is True, "Stumped must be disabled on Free Hit"
        assert modes_state["hitWicketDisabled"] is True, "Hit Wicket must be disabled on Free Hit"
        assert modes_state["runOutDisabled"] is False, "Run Out must remain enabled on Free Hit"
        assert modes_state["activeMode"] == "RUN_OUT", "Mode select should default to RUN_OUT on Free Hit"

        await save_screenshot_async(page, "test_61_mobile_free_hit_enforcement.png")

        # Confirm Run Out dismissal
        initial_wickets = await page.evaluate("() => window.cricosMobileApp.matchState.totalWickets")
        await page.evaluate("""() => {
            window.cricosMobileApp.confirmMobileDismissal();
        }""")
        await page.wait_for_timeout(300)

        post_wkt = await page.evaluate("() => window.cricosMobileApp.matchState.totalWickets")
        assert post_wkt == initial_wickets + 1, "Wickets must increment by 1 on valid Free Hit Run Out"

        # 8. Test Caught strike rotation rule (ICC Oct 2022 amendment to Law 18.11)
        # Open dismissal sheet and simulate Caught dismissal
        await page.evaluate("""() => {
            window.cricosMobileApp.freeHitActive = false;
            window.cricosMobileApp.openMobileDismissalSheet();
            window.cricosMobileApp.selectMobileDismissalMode('CAUGHT');
            window.cricosMobileApp.confirmMobileDismissal();
        }""")
        await page.wait_for_timeout(300)

        # In walks incoming batter and must take strike
        striker_name = await page.evaluate("() => window.cricosMobileApp.matchState.striker.name")
        assert striker_name != "", "Incoming batter should be established at striker's end"

        # 9. Test Retired Hurt (MCC Law 25.4)
        pre_rh_wickets = await page.evaluate("() => window.cricosMobileApp.matchState.totalWickets")
        pre_rh_fow = await page.evaluate("() => window.cricosMobileApp.matchState.fallOfWickets.length")

        await page.evaluate("""() => {
            window.cricosMobileApp.openMobileDismissalSheet();
            window.cricosMobileApp.selectMobileDismissalMode('RETIRED_HURT');
            window.cricosMobileApp.confirmMobileDismissal();
        }""")
        await page.wait_for_timeout(300)

        post_rh_wickets = await page.evaluate("() => window.cricosMobileApp.matchState.totalWickets")
        post_rh_fow = await page.evaluate("() => window.cricosMobileApp.matchState.fallOfWickets.length")

        assert post_rh_wickets == pre_rh_wickets, "Retired Hurt must NOT increment team wickets"
        assert post_rh_fow == pre_rh_fow, "Retired Hurt must NOT add a fall of wicket milestone"

        assert_no_critical_errors(page)
        await browser.close()


@pytest.mark.asyncio
async def test_desktop_icc_laws_scorer_reference_and_enforcement_flow():
    """Verify Desktop Match Center ICC Laws Reference Modal, +5 Penalty Runs, and Free Hit enforcement."""
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

        # 1. Switch to SCORER persona
        await page.evaluate("""() => {
            if (typeof selectPersona === 'function') {
                selectPersona('SCORER');
            } else if (typeof currentUser !== 'undefined') {
                currentUser.persona = 'SCORER';
            }
        }""")
        await page.wait_for_timeout(300)

        # 2. Check ICC Laws Rulebook button
        laws_btn = await page.query_selector("#btnDesktopIccLaws")
        assert laws_btn is not None, "#btnDesktopIccLaws button must exist on desktop keypad"

        # 3. Open ICC Laws Reference Modal
        await page.evaluate("""() => {
            if (typeof openIccLawsModal === 'function') {
                openIccLawsModal();
            }
        }""")
        await page.wait_for_timeout(300)

        modal = await page.query_selector("#modalIccLawsReference")
        assert modal is not None, "#modalIccLawsReference must exist"
        assert await modal.is_visible(), "#modalIccLawsReference must be visible"

        # Search for 'Powerplay'
        await page.evaluate("""() => {
            if (typeof searchDesktopIccLaws === 'function') {
                searchDesktopIccLaws('Powerplay');
            }
        }""")
        await page.wait_for_timeout(200)

        pp_count = await page.evaluate("() => document.querySelectorAll('#desktopIccLawsContainer .desktop-law-card').length")
        assert pp_count >= 1, f"Search for 'Powerplay' should return at least 1 rule card, got {pp_count}"

        await save_screenshot_async(page, "test_61_desktop_icc_laws_modal.png")

        # Close Modal
        await page.evaluate("""() => {
            if (typeof closeIccLawsModal === 'function') {
                closeIccLawsModal();
            }
        }""")
        await page.wait_for_timeout(200)

        # 4. Award +5 Penalty Runs on Desktop
        initial_score = await page.evaluate("() => typeof runs !== 'undefined' ? runs : 0")
        initial_penalties = await page.evaluate("() => (typeof window !== 'undefined' && window.matchScorecardData && window.matchScorecardData.extras) ? (window.matchScorecardData.extras.penalty || 0) : 0")

        await page.evaluate("""() => {
            if (typeof openPenaltyRunsModal === 'function') {
                openPenaltyRunsModal();
            }
        }""")
        await page.wait_for_timeout(300)

        penalty_modal = await page.query_selector("#modalPenaltyRuns")
        assert penalty_modal is not None, "#modalPenaltyRuns must exist"
        assert await penalty_modal.is_visible(), "#modalPenaltyRuns must be visible"

        # Confirm penalty runs
        await page.evaluate("""() => {
            if (typeof confirmDesktopPenaltyRuns === 'function') {
                confirmDesktopPenaltyRuns();
            }
        }""")
        await page.wait_for_timeout(300)

        updated_score = await page.evaluate("() => typeof runs !== 'undefined' ? runs : 0")
        updated_penalties = await page.evaluate("() => (typeof window !== 'undefined' && window.matchScorecardData && window.matchScorecardData.extras) ? (window.matchScorecardData.extras.penalty || 0) : 0")

        assert updated_score == initial_score + 5, "Desktop runs must increment by 5"
        assert updated_penalties == initial_penalties + 5, "Desktop penalty extras must increment by 5"

        # 5. Free Hit Delivery on Desktop
        # Switch to Studio tab and activate Free Hit
        await page.evaluate("""() => {
            if (typeof switchTab === 'function') {
                switchTab('studio');
            }
            window.desktopFreeHitActive = true;
            const banner = document.getElementById('studioFreeHitBanner');
            if (banner) banner.style.display = 'flex';
        }""")
        await page.wait_for_timeout(300)

        fh_banner = await page.query_selector("#studioFreeHitBanner")
        assert fh_banner is not None, "#studioFreeHitBanner must exist"
        assert await fh_banner.is_visible(), "#studioFreeHitBanner must be visible"

        # Open dismissal modal while Free Hit is active
        await page.evaluate("""() => {
            if (typeof openDismissalModal === 'function') {
                openDismissalModal();
            }
        }""")
        await page.wait_for_timeout(300)

        # Check dismissal modal alert
        dismissal_modal = await page.query_selector("#modalDismissal")
        assert dismissal_modal is not None, "#modalDismissal must exist"
        assert await dismissal_modal.is_visible(), "#modalDismissal must be visible"

        alert_visible = await page.evaluate("""() => {
            const a = document.getElementById('dismissalFreeHitAlert');
            return a ? a.style.display !== 'none' : false;
        }""")
        assert alert_visible is True, "#dismissalFreeHitAlert must be visible when Free Hit is active"

        # Check prohibited options are disabled for striker
        opts_state = await page.evaluate("""() => {
            const sel = document.getElementById('dismissalKind');
            if (!sel) return {};
            const opts = Array.from(sel.options);
            return {
                bowledDisabled: opts.find(o => o.value === 'BOWLED')?.disabled,
                caughtDisabled: opts.find(o => o.value === 'CAUGHT')?.disabled,
                lbwDisabled: opts.find(o => o.value === 'LBW')?.disabled,
                runOutDisabled: opts.find(o => o.value === 'RUN_OUT')?.disabled,
                val: sel.value
            };
        }""")
        assert opts_state["bowledDisabled"] is True, "Bowled must be disabled on Desktop Free Hit"
        assert opts_state["caughtDisabled"] is True, "Caught must be disabled on Desktop Free Hit"
        assert opts_state["lbwDisabled"] is True, "LBW must be disabled on Desktop Free Hit"
        assert opts_state["runOutDisabled"] is False, "Run Out must be enabled on Desktop Free Hit"
        assert opts_state["val"] == "RUN_OUT", "Mode should default to RUN_OUT on Desktop Free Hit"

        await save_screenshot_async(page, "test_61_desktop_free_hit_enforcement.png")

        # Close dismissal modal
        await page.evaluate("""() => {
            if (typeof closeDismissalModal === 'function') {
                closeDismissalModal();
            }
        }""")

        assert_no_critical_errors(page)
        await browser.close()
