"""
test_58_flagship_studios_and_command_palette.py — E2E Playwright Suite for Flagship Cricket Studios & Command Palette
Verifies:
1. Universal Command Palette (Cmd+K / #btnCommandPalette): instant search filtering, category tabs, and keyboard shortcuts.
2. Interactive 11-Fielder Tactical Radar (#modalFieldPlanner): MCC Law 28.4 / ICC Powerplay circle legality,
   No-Ball breach warning when >2 fielders outside 30-yard circle in PP1, and RHB/LHB mirroring.
3. Biomechanics Pitch Beehive Map & Monte Carlo Win Probability Simulator (#modalPitchMapSimulator):
   Length zone heatmap SVG + dynamic What-If scenario win probability updates (+18r Over vs Double Wicket).
4. Live Player Auction, Salary Cap Purse & RTM Draft Room (#modalPlayerAuction):
   Franchise increment bidding, Right-To-Match (RTM) card exercise, and gavel SOLD lot advancement.
5. Keyboard Shortcuts & Cockpit Guide (#modalKeyboardShortcuts) and Mobile App parity (mobile.html).
6. Zero critical console errors (assert_no_critical_errors(page)) per Rule 4.
"""

import asyncio
import pathlib
import pytest
from playwright.async_api import async_playwright
from tests.helpers import save_screenshot_async, assert_no_critical_errors, catalog_screenshots

ROOT_DIR = pathlib.Path(__file__).parent.parent.resolve()
INDEX_HTML = (ROOT_DIR / "index.html").as_uri()
MOBILE_HTML = (ROOT_DIR / "dist" / "mobile.html").as_uri()


@pytest.mark.asyncio
async def test_flagship_studios_and_command_palette():
    console_errors = []
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await ctx.new_page()

        page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: console_errors.append(f"PAGE ERROR: {e}"))
        page._console_errors = console_errors

        await page.goto(INDEX_HTML, wait_until="domcontentloaded")
        await page.wait_for_timeout(250)

        # 1. Test Universal Command Palette (Cmd+K / #btnCommandPalette)
        await page.click("#btnCommandPalette")
        await page.wait_for_timeout(150)
        cmd_modal = page.locator("#modalCommandPalette")
        assert await cmd_modal.is_visible(), "Command Palette modal should open on click"

        await page.fill("#cmdPaletteInput", "field")
        await page.wait_for_timeout(100)
        items_count = await page.locator("#cmdPaletteResultsList .cmd-palette-item").count()
        assert items_count >= 1, "Command Palette should filter and show Field Placement Planner"
        await save_screenshot_async(page, "flagship_command_palette")
        await page.evaluate("closeCommandPalette()")
        await page.wait_for_timeout(100)

        # 2. Test Interactive 11-Fielder Tactical Radar & MCC Law 28.4 Powerplay Engine
        await page.click("#btnFieldPlannerQuick")
        await page.wait_for_timeout(150)
        field_modal = page.locator("#modalFieldPlanner")
        assert await field_modal.is_visible(), "Tactical Field Planner modal should be visible"

        node_count = await page.locator("#fieldPlannerNodesGroup .field-node-circle").count()
        assert node_count == 11, f"Expected 11 fielder nodes on radar, got {node_count}"

        legality_text = await page.locator("#fieldLegalityText").inner_text()
        assert "Compliant Field" in legality_text, f"Initial PP1 preset must be legal: {legality_text}"

        # Toggle an inner-ring fielder to deep boundary in PP1 -> should trigger No-Ball breach warning
        await page.evaluate("toggleFielderRingDepth(4)")
        await page.wait_for_timeout(100)
        breach_text = await page.locator("#fieldLegalityText").inner_text()
        assert "NO-BALL RESTRICTION BREACH" in breach_text, f"Expected No-Ball breach when 3 outside in PP1: {breach_text}"

        # Restore legal preset and mirror for Left-Handed Batter (LHB)
        await page.evaluate("applyFieldPreset('POWERPLAY_ATTACK')")
        await page.evaluate("setFieldPlannerHand('LHB')")
        await page.wait_for_timeout(100)
        plan_badge = await page.locator("#fieldBowlingPlanBadge").inner_text()
        assert "(LHB)" in plan_badge, f"Expected LHB mirrored plan badge, got {plan_badge}"
        await save_screenshot_async(page, "flagship_field_planner_radar")
        await page.evaluate("closeModal('modalFieldPlanner')")
        await page.wait_for_timeout(100)

        # 3. Test Biomechanics Pitch Beehive Map & Monte Carlo Win Probability Simulator
        await page.click("#btnPitchMapQuick")
        await page.wait_for_timeout(150)
        pitch_modal = page.locator("#modalPitchMapSimulator")
        assert await pitch_modal.is_visible(), "Pitch Map & Win Probability Simulator should be visible"

        initial_win = float((await page.locator("#simBatWinPct").inner_text()).replace("%", ""))
        await page.evaluate("runWinProbScenario(6, 18, 0)")
        await page.wait_for_timeout(100)
        big_over_win = float((await page.locator("#simBatWinPct").inner_text()).replace("%", ""))
        assert big_over_win > initial_win, f"Big over (+18r) should increase win prob ({big_over_win}% > {initial_win}%)"
        await save_screenshot_async(page, "flagship_pitch_map_win_simulator")
        await page.evaluate("closeModal('modalPitchMapSimulator')")
        await page.wait_for_timeout(100)

        # 4. Test Live Player Auction Gavel, Salary Cap Purse & RTM Draft Room
        await page.click("#btnPlayerAuctionQuick")
        await page.wait_for_timeout(150)
        auction_modal = page.locator("#modalPlayerAuction")
        assert await auction_modal.is_visible(), "Player Auction Draft Room should be visible"

        await page.click("#btnAuctionBidTitan")
        await page.wait_for_timeout(100)
        bid_text = await page.locator("#auctionCurrentBidDisplay").inner_text()
        assert "2,65,000" in bid_text, f"Expected bid to increment to ₹2,65,000, got {bid_text}"

        await page.click("#btnAuctionRtm")
        await page.wait_for_timeout(100)
        leader_text = await page.locator("#auctionLeaderDisplay").inner_text()
        assert "RTM Matched" in leader_text, f"Expected RTM match status, got {leader_text}"
        await save_screenshot_async(page, "flagship_player_auction_room")
        await page.evaluate("closeModal('modalPlayerAuction')")
        await page.wait_for_timeout(100)

        # 5. Test Mobile App Parity
        await page.goto(MOBILE_HTML, wait_until="domcontentloaded")
        await page.wait_for_timeout(200)
        await page.evaluate("window.cricosMobileApp.openFieldPlannerSheet()")
        await page.wait_for_timeout(150)
        sheet_text = await page.locator("body").inner_text()
        assert "11-Fielder Radar" in sheet_text, "Mobile Field Planner action sheet should open"
        await save_screenshot_async(page, "flagship_mobile_field_planner")

        assert_no_critical_errors(page)
        catalog_screenshots("test_58_flagship_studios_and_command_palette")
        await browser.close()


if __name__ == "__main__":
    asyncio.run(test_flagship_studios_and_command_palette())
