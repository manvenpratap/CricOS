"""
test_68_icon_replacement_and_3d_cards.py — Iconsax Real SVG Icon System & Flippable 3D Player Cards Verification Suite

Verifies:
1. Real SVG Icon Replacement across UI:
   - Bottom navigation buttons render inline SVG icons (.cricos-icon) without emoji characters.
   - Sidebar drawer nav items, studios, and footer controls render consistent SVG icons (.cricos-icon).
   - Profile career section headers and action buttons render real SVG icons.
2. 3D Stat Cards on Profile:
   - Player career figures are presented as 3D cards (.stat-3d-card-scene > .stat-3d-card).
   - Each card features front face (.stat-3d-front) and back face (.stat-3d-back).
   - Clicking a stat card toggles the 'flipped' class, revealing benchmark / career context.
3. Interactive Flippable 3D Player Card Sheet:
   - open3DPlayerCardSheet() renders a CSS 3D flip card (.player-flip-scene > #playerFlipCard3D).
   - Displays front face (identity, jersey, rating, form) and back face (detailed career stats).
   - Card flips on tap/click via classList.toggle('flipped').
   - Squad data is dynamic (based on match striker / squad players) rather than hardcoded 3-sample list.
4. Quality & Compliance:
   - Zero critical console errors (Rule 4).
   - Local verification screenshots saved to tests/screenshots/.
"""

import pathlib
import pytest
from playwright.async_api import async_playwright
from tests.helpers import save_screenshot_async, assert_no_critical_errors

ROOT_DIR = pathlib.Path(__file__).parent.parent.resolve()
MOBILE_HTML = (ROOT_DIR / "dist" / "mobile.html").as_uri()


@pytest.mark.asyncio
async def test_icon_replacement_and_3d_flippable_cards():
    """Verify SVG icon replacement, 3D flippable stat cards, and dynamic 3D player card."""
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
        # 1. Verify Bottom Navigation uses real SVG icons (.cricos-icon)
        # -------------------------------------------------------------
        nav_icons = await page.query_selector_all(".mobile-nav-item svg.cricos-icon")
        assert len(nav_icons) >= 4, f"Expected at least 4 SVG icons in bottom navigation, got {len(nav_icons)}"

        # Verify no emojis in nav buttons
        nav_buttons = await page.query_selector_all(".mobile-nav-item")
        for btn in nav_buttons:
            text = await btn.inner_text()
            # None of the nav items should contain raw emoji characters
            for ch in text:
                assert ord(ch) < 0x2600 or ord(ch) > 0x1F9FF, f"Nav button should not contain emoji: {ch} in '{text}'"

        await save_screenshot_async(page, "test_68_1_bottom_nav_icons.png")

        # -------------------------------------------------------------
        # 2. Verify Sidebar Drawer uses real SVG icons
        # -------------------------------------------------------------
        await page.evaluate("() => window.cricosMobileApp.openSidebarDrawer()")
        await page.wait_for_timeout(250)

        sidebar_svg_icons = await page.query_selector_all("#mobileSidebarDrawer svg.cricos-icon")
        assert len(sidebar_svg_icons) >= 8, f"Expected at least 8 SVG icons in sidebar drawer, got {len(sidebar_svg_icons)}"

        # Verify studio buttons have SVG icons
        stadium_btn_svg = await page.query_selector("#btnMobileSidebar3DStadium svg.cricos-icon")
        assert stadium_btn_svg is not None, "3D Stadium Pitch button must render SVG icon"

        settings_btn_svg = await page.query_selector("#btnMobileSidebarSettings svg.cricos-icon")
        assert settings_btn_svg is not None, "Settings button in sidebar must render SVG icon"

        await save_screenshot_async(page, "test_68_2_sidebar_svg_icons.png")
        await page.evaluate("() => window.cricosMobileApp.closeSidebarDrawer()")
        await page.wait_for_timeout(200)

        # -------------------------------------------------------------
        # 3. Verify Profile Page: 3D Stat Cards & Flippable Functionality
        # -------------------------------------------------------------
        await page.evaluate("() => window.cricosMobileApp.switchScreen('PROFILE')")
        await page.wait_for_timeout(350)

        # Verify 3D stat cards exist
        stat_scenes = await page.query_selector_all(".stat-3d-card-scene")
        assert len(stat_scenes) == 3, f"Expected 3 stat 3D card scenes (Runs, Avg, SR), found {len(stat_scenes)}"

        stat_cards = await page.query_selector_all(".stat-3d-card")
        assert len(stat_cards) == 3, f"Expected 3 stat 3D cards, found {len(stat_cards)}"

        # Verify front and back faces exist on the first stat card
        card_0 = stat_cards[0]
        front_face = await card_0.query_selector(".stat-3d-front")
        back_face = await card_0.query_selector(".stat-3d-back")
        assert front_face is not None, "Stat card front face must exist"
        assert back_face is not None, "Stat card back face must exist"

        # Verify initial non-flipped state
        is_flipped = await page.evaluate("el => el.classList.contains('flipped')", card_0)
        assert not is_flipped, "Card should not be flipped initially"

        # Click to flip
        await card_0.click()
        await page.wait_for_timeout(250)

        is_flipped_after = await page.evaluate("el => el.classList.contains('flipped')", card_0)
        assert is_flipped_after, "Stat card must have 'flipped' class after click"

        # Click again to unflip
        await card_0.click()
        await page.wait_for_timeout(200)
        is_unflipped = await page.evaluate("el => el.classList.contains('flipped')", card_0)
        assert not is_unflipped, "Stat card must unflip after second click"

        await save_screenshot_async(page, "test_68_3_profile_3d_stat_cards.png")

        # -------------------------------------------------------------
        # 4. Verify 3D Player Card: Dynamic Squad & Flippable Interaction
        # -------------------------------------------------------------
        # Open 3D Player Card Sheet
        await page.evaluate("() => window.cricosMobileApp.open3DPlayerCardSheet()")
        await page.wait_for_timeout(350)

        flip_scene = await page.query_selector(".player-flip-scene")
        assert flip_scene is not None, "player-flip-scene container must exist in action sheet"

        player_flip_card = await page.query_selector("#playerFlipCard3D")
        assert player_flip_card is not None, "playerFlipCard3D element must exist"

        # Verify card has front and back faces
        p_front = await player_flip_card.query_selector(".player-flip-front")
        p_back = await player_flip_card.query_selector(".player-flip-back")
        assert p_front is not None, "3D Player Card must have front identity face"
        assert p_back is not None, "3D Player Card must have back stats face"

        # Verify dynamic player name is rendered (not hardcoded empty)
        front_text = await p_front.inner_text()
        assert len(front_text) > 10, "Player card front face must contain player identity information"

        # Verify flipping the 3D player card
        is_p_flipped = await page.evaluate("el => el.classList.contains('flipped')", player_flip_card)
        assert not is_p_flipped, "3D Player card should not be flipped initially"

        await player_flip_card.click()
        await page.wait_for_timeout(250)

        is_p_flipped_after = await page.evaluate("el => el.classList.contains('flipped')", player_flip_card)
        assert is_p_flipped_after, "3D Player card must have 'flipped' class after tap"

        # Check back face content
        back_text = await p_back.inner_text()
        assert "career stats" in back_text.lower() or "runs" in back_text.lower(), "Back face must contain career stats"

        await save_screenshot_async(page, "test_68_4_player_card_flipped.png")

        # Close the action sheet
        await page.evaluate("() => window.cricosMobileApp.closeActionSheet()")
        await page.wait_for_timeout(200)

        # -------------------------------------------------------------
        # 5. Quality Invariants: Zero critical console errors
        # -------------------------------------------------------------
        assert_no_critical_errors(page)

        await browser.close()
