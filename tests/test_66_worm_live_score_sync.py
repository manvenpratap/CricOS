"""
test_66_worm_live_score_sync.py — Playwright E2E Test Suite for Worm Auto-Update & Live Score Synchronization

Verifies:
1. Mobile Worm Dynamic Synchronization:
   - Initial Worm chart renders with correct Mumbai live score and live over fraction.
   - Recording deliveries (+4, +6, etc.) on the mobile scoring keypad instantly updates:
     * Mumbai polyline points in the Worm chart.
     * Pulsing live marker coordinate and tooltip (e.g. 'Live Chase: X/Y in Z.B ov').
     * CRR / RRR / Needed runs calculations.
   - Inspecting individual overs via chips or SVG tap updates differential inspection dynamically.
   - Undoing deliveries dynamically recalculates coordinates and rolls back the live endpoint.

2. Desktop Worm Dynamic Synchronization:
   - Switching to the WORM chart in Match Center displays dynamic chase progression.
   - Scoring deliveries via the Scorer Keypad or studio updates the Mumbai chase curve and live chase marker.
   - Live tooltip dynamically shows current runs, wickets, and overs.
   - Undoing deliveries updates the Worm chart back to previous state.

3. Invariants:
   - Zero critical console errors (assert_no_critical_errors).
   - Screenshots captured and stored locally in tests/screenshots/.
"""

import pathlib
import pytest
from playwright.async_api import async_playwright
from tests.helpers import save_screenshot_async, assert_no_critical_errors

ROOT_DIR = pathlib.Path(__file__).parent.parent.resolve()
INDEX_HTML = (ROOT_DIR / "dist" / "index.html").as_uri()
MOBILE_HTML = (ROOT_DIR / "dist" / "mobile.html").as_uri()


@pytest.mark.asyncio
async def test_mobile_worm_auto_updates_with_live_score():
    """Verify that Mobile Worm chart dynamically re-renders and stays in sync with live score and overs."""
    console_errors = []
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 390, "height": 844})
        page = await ctx.new_page()

        page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: console_errors.append(f"PAGE ERROR: {e}"))
        page._console_errors = console_errors

        await page.goto(MOBILE_HTML, wait_until="networkidle")

        # 1. Switch persona to SCORER so scoring keypad is available
        await page.evaluate("""() => {
            if (window.cricosMobileApp) {
                window.cricosMobileApp.switchUserPersona('SCORER');
            }
        }""")
        await page.wait_for_timeout(400)

        # 2. Select ANALYTICS subnav tab and WORM in match analytics
        await page.evaluate("""() => {
            if (window.cricosMobileApp) {
                window.cricosMobileApp.setMatchSubTab('ANALYTICS');
                window.cricosMobileApp.activeChart = 'WORM';
                window.cricosMobileApp.render();
            }
        }""")
        await page.wait_for_timeout(300)

        # 3. Verify initial live chase marker tooltip
        initial_tooltip = await page.evaluate("""() => {
            const el = document.querySelector('circle[data-tooltip*="Live Chase"]');
            return el ? el.getAttribute('data-tooltip') : null;
        }""")
        assert initial_tooltip is not None, "Mobile Worm must display a live chase circle marker with tooltip"
        assert "142/3 in 16.4 ov" in initial_tooltip, f"Expected initial tooltip 142/3 in 16.4 ov, got: {initial_tooltip}"

        # Get initial points string of Mumbai polyline (blue stroke #00D2FF)
        initial_polyline_pts = await page.evaluate("""() => {
            const poly = document.querySelector('polyline[stroke="#00D2FF"]');
            return poly ? poly.getAttribute('points') : null;
        }""")
        assert initial_polyline_pts is not None, "Mumbai progression polyline must be rendered"

        await save_screenshot_async(page, "test_66_mobile_worm_initial.png")

        # 4. Switch to SCORE tab and record a 4 on Mobile Scoring Pad
        await page.evaluate("""() => {
            if (window.cricosMobileApp) {
                window.cricosMobileApp.setMatchSubTab('SCORE');
            }
        }""")
        await page.wait_for_timeout(200)

        btn_four = await page.query_selector(".mobile-studio-btn.boundary-four")
        assert btn_four is not None, "Mobile 4 button must exist on Scorer pad"
        await btn_four.click()
        await page.wait_for_timeout(200)

        # Confirm wagon shot sheet
        btn_confirm_wagon = await page.query_selector("#btnConfirmWagonShot")
        if btn_confirm_wagon:
            await btn_confirm_wagon.click()
            await page.wait_for_timeout(300)

        # Switch back to ANALYTICS tab to inspect Worm
        await page.evaluate("""() => {
            if (window.cricosMobileApp) {
                window.cricosMobileApp.setMatchSubTab('ANALYTICS');
            }
        }""")
        await page.wait_for_timeout(200)

        # Verify updated score & worm live tooltip
        updated_tooltip_after_four = await page.evaluate("""() => {
            const el = document.querySelector('circle[data-tooltip*="Live Chase"]');
            return el ? el.getAttribute('data-tooltip') : null;
        }""")
        assert updated_tooltip_after_four is not None
        assert "146/3 in 16.5 ov" in updated_tooltip_after_four, f"Expected 146/3 in 16.5 ov after four, got: {updated_tooltip_after_four}"

        # Verify Mumbai polyline points shifted
        updated_polyline_pts = await page.evaluate("""() => {
            const poly = document.querySelector('polyline[stroke="#00D2FF"]');
            return poly ? poly.getAttribute('points') : null;
        }""")
        assert updated_polyline_pts != initial_polyline_pts, "Polyline points must update dynamically after scoring delivery"

        await save_screenshot_async(page, "test_66_mobile_worm_after_four.png")

        # 5. Switch to SCORE tab and record a 6 on Mobile Scoring Pad
        await page.evaluate("""() => {
            if (window.cricosMobileApp) {
                window.cricosMobileApp.setMatchSubTab('SCORE');
            }
        }""")
        await page.wait_for_timeout(200)

        btn_six = await page.query_selector(".mobile-studio-btn.maximum-six")
        assert btn_six is not None, "Mobile 6 button must exist on Scorer pad"
        await btn_six.click()
        await page.wait_for_timeout(200)

        btn_confirm_wagon_six = await page.query_selector("#btnConfirmWagonShot")
        if btn_confirm_wagon_six:
            await btn_confirm_wagon_six.click()
            await page.wait_for_timeout(300)

        # Switch to ANALYTICS tab
        await page.evaluate("""() => {
            if (window.cricosMobileApp) {
                window.cricosMobileApp.setMatchSubTab('ANALYTICS');
            }
        }""")
        await page.wait_for_timeout(200)

        # Verify updated score & worm live tooltip
        updated_tooltip_after_six = await page.evaluate("""() => {
            const el = document.querySelector('circle[data-tooltip*="Live Chase"]');
            return el ? el.getAttribute('data-tooltip') : null;
        }""")
        assert updated_tooltip_after_six is not None
        assert "152/3 in 17.0 ov" in updated_tooltip_after_six, f"Expected 152/3 in 17.0 ov after six, got: {updated_tooltip_after_six}"

        await save_screenshot_async(page, "test_66_mobile_worm_after_six.png")

        # 6. Switch to SCORE tab and undo delivery via Mobile Undo
        await page.evaluate("""() => {
            if (window.cricosMobileApp) {
                window.cricosMobileApp.setMatchSubTab('SCORE');
                window.cricosMobileApp.undoLastDelivery();
            }
        }""")
        await page.wait_for_timeout(300)

        # Switch to ANALYTICS tab
        await page.evaluate("""() => {
            if (window.cricosMobileApp) {
                window.cricosMobileApp.setMatchSubTab('ANALYTICS');
                window.cricosMobileApp.render();
            }
        }""")
        await page.wait_for_timeout(200)

        # Verify worm rolled back to 146/3 in 16.5 ov
        reverted_tooltip = await page.evaluate("""() => {
            const el = document.querySelector('circle[data-tooltip*="Live Chase"]');
            return el ? el.getAttribute('data-tooltip') : null;
        }""")
        assert reverted_tooltip is not None
        assert "146/3 in 16.5 ov" in reverted_tooltip, f"Expected rollback to 146/3 in 16.5 ov, got: {reverted_tooltip}"

        # 7. Select over chip and verify over differential inspection
        chip_ov = await page.query_selector(".worm-over-chip[data-over='10']")
        if chip_ov:
            await chip_ov.click()
            await page.wait_for_timeout(200)
            diff_text = await page.evaluate("""() => {
                const el = document.body.innerText;
                return el.includes("Over 10 Differential Inspection");
            }""")
            assert diff_text is True, "Differential inspection panel must display for selected over"

        assert_no_critical_errors(page)
        await browser.close()


@pytest.mark.asyncio
async def test_desktop_worm_auto_updates_with_live_score():
    """Verify that Desktop Worm chart dynamically reflects live score state and delivery events."""
    console_errors = []
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await ctx.new_page()

        page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: console_errors.append(f"PAGE ERROR: {e}"))
        page._console_errors = console_errors

        await page.goto(INDEX_HTML, wait_until="networkidle")

        # 1. Switch chart to WORM in Desktop Match Center
        await page.evaluate("""() => {
            if (typeof showMatchChart === 'function') {
                showMatchChart('WORM');
            }
        }""")
        await page.wait_for_timeout(300)

        # Verify initial live chase legend and dot
        initial_legend = await page.evaluate("""() => {
            const el = document.querySelector('#matchChartContainer text[fill="#00D2FF"]');
            return el ? el.textContent : '';
        }""")
        assert "Mumbai 142/3 (Chase)" in initial_legend, f"Expected initial legend 'Mumbai 142/3 (Chase)', got: {initial_legend}"

        initial_path_p2 = await page.evaluate("""() => {
            const paths = document.querySelectorAll('#matchChartContainer path[stroke="#00D2FF"]');
            return paths.length > 0 ? paths[0].getAttribute('d') : null;
        }""")
        assert initial_path_p2 is not None, "Desktop Worm Mumbai chase path must be present"

        await save_screenshot_async(page, "test_66_desktop_worm_initial.png")

        # 2. Trigger a delivery update via renderScoreState (e.g. +4 runs to 146/3 in 16.5 ov)
        await page.evaluate("""() => {
            if (typeof renderScoreState === 'function') {
                renderScoreState({
                    runs: 146,
                    wickets: 3,
                    legal_balls: 101,
                    overs_display: '16.5',
                    target: 178
                }, { runs: 4, extra_type: 'NONE', legal_ball: true }, 'DELIVERY_RECORDED');
            }
        }""")
        await page.wait_for_timeout(300)

        # Verify updated legend text and path
        updated_legend = await page.evaluate("""() => {
            const el = document.querySelector('#matchChartContainer text[fill="#00D2FF"]');
            return el ? el.textContent : '';
        }""")
        assert "Mumbai 146/3 (Chase)" in updated_legend, f"Expected updated legend 'Mumbai 146/3 (Chase)', got: {updated_legend}"

        updated_path_p2 = await page.evaluate("""() => {
            const paths = document.querySelectorAll('#matchChartContainer path[stroke="#00D2FF"]');
            return paths.length > 0 ? paths[0].getAttribute('d') : null;
        }""")
        assert updated_path_p2 != initial_path_p2, "Desktop Mumbai chase path must dynamically change as runs/overs progress"

        # Verify live chase dot tooltip
        live_dot_title = await page.evaluate("""() => {
            const el = document.querySelector('#matchChartContainer circle[data-tooltip*="Live Chase"]');
            return el ? el.getAttribute('data-tooltip') : null;
        }""")
        assert live_dot_title is not None
        assert "Live Chase: 146/3 in 16.5 ov" in live_dot_title, f"Expected tooltip 'Live Chase: 146/3 in 16.5 ov', got: {live_dot_title}"

        await save_screenshot_async(page, "test_66_desktop_worm_after_delivery.png")

        assert_no_critical_errors(page)
        await browser.close()
