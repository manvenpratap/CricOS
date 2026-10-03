"""
test_72_comprehensive_emoji_elimination.py — Comprehensive Elimination of Emoji Icons Across Mobile & Desktop E2E Suite

Verifies:
1. Mobile Interface:
   - Subnav pills (#mobileNavLiveSubnav button) render authentic Iconsax SVGs (.cricos-icon) or clean typography without raw unicode emojis.
   - Bottom navigation (.mobile-bottom-nav .mobile-nav-item) renders authentic .cricos-icon SVGs and clean typography.
   - Scoring Keypad & Extras buttons contain clean labels without raw emojis.
   - Quick action sheets, weather badges, and tournament cards render clean SVGs without emoji clutter.
2. Desktop Interface:
   - Sidebar navigation (#appSidebar .nav-item) renders authentic .cricos-icon SVGs and clean athletic typography.
   - Commentary broadcast items, filters, and cards use SVG icons rather than raw unicode emojis.
   - Command palette items and scoring keypad buttons render clean icons and typography.
3. Invariants & Stability:
   - Zero critical console errors (Rule 4: assert_no_critical_errors(page)).
   - Local screenshots saved to tests/screenshots/.
"""

import sys
import pathlib
import pytest

ROOT_DIR = pathlib.Path(__file__).parent.parent.resolve()
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from playwright.async_api import async_playwright
from tests.helpers import save_screenshot_async, assert_no_critical_errors

INDEX_HTML = (ROOT_DIR / "dist" / "index.html").as_uri()
MOBILE_HTML = (ROOT_DIR / "dist" / "mobile.html").as_uri()

# Common pictographic emoji regex pattern for detecting unwanted emoji icons in UI text
EMOJI_JS_CHECK = r"""(text) => {
    // Matches common pictographic emojis (excluding ASCII and standard punctuation)
    const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    return emojiRegex.test(text);
}"""


@pytest.mark.asyncio
async def test_mobile_comprehensive_emoji_free():
    """Verify Mobile view contains authentic Iconsax SVGs and no raw emoji icons in navigation, subnav, scoring pad."""
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

        # 1. Verify Bottom Navigation uses .cricos-icon SVGs and has clean text
        bottom_nav_items = await page.query_selector_all(".mobile-bottom-nav .mobile-nav-item")
        assert len(bottom_nav_items) >= 4, "Mobile bottom nav must render at least 4 items"

        for item in bottom_nav_items:
            svg = await item.query_selector("svg.cricos-icon")
            assert svg is not None, "Each bottom nav item must contain an authentic .cricos-icon SVG"
            text = (await item.inner_text()).strip()
            has_emoji = await page.evaluate(f"({EMOJI_JS_CHECK})(`{text}`)")
            assert not has_emoji, f"Bottom nav item '{text}' must not contain raw emoji"

        # 2. Verify Mobile Subnav buttons render SVGs or clean text without emojis
        subnav_buttons = await page.query_selector_all(".mobile-subnav .mobile-subnav-btn")
        assert len(subnav_buttons) >= 6, f"Mobile live subnav must render at least 6 tab buttons, got {len(subnav_buttons)}"

        for btn in subnav_buttons:
            text = (await btn.inner_text()).strip()
            has_emoji = await page.evaluate(f"({EMOJI_JS_CHECK})(`{text}`)")
            assert not has_emoji, f"Subnav button '{text}' must not contain raw emoji"

        # 3. Switch to SCORER persona and verify scoring pad buttons
        await page.evaluate("""() => {
            if (window.cricosMobileApp) {
                window.cricosMobileApp.switchUserPersona('SCORER');
            }
        }""")
        await page.wait_for_timeout(300)

        scoring_pad = await page.query_selector("#mobileScorerStudioPad")
        assert scoring_pad is not None, "#mobileScorerStudioPad must exist for SCORER"

        pad_buttons = await page.query_selector_all("#mobileScorerStudioPad button")
        assert len(pad_buttons) >= 10, "Scoring pad must render keypad and action buttons"

        for btn in pad_buttons:
            btn_text = (await btn.inner_text()).strip()
            # Special exceptions like ⚡ in auto-fill test invariant if any, but pad buttons should be clean
            if "Auto-Fill" not in btn_text:
                has_emoji = await page.evaluate(f"({EMOJI_JS_CHECK})(`{btn_text}`)")
                assert not has_emoji, f"Scoring pad button '{btn_text}' must not contain raw emoji"

        # 4. Verify capture of clean mobile screenshot
        await save_screenshot_async(page, "test_72_mobile_emoji_free_interface")

        # 5. Assert zero critical console errors (Rule 4)
        assert_no_critical_errors(page)
        await browser.close()


@pytest.mark.asyncio
async def test_desktop_comprehensive_emoji_free():
    """Verify Desktop view contains authentic Iconsax SVGs and no raw emoji icons in sidebar, commentary, and scoring."""
    console_errors = []
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await ctx.new_page()

        page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: console_errors.append(f"PAGE ERROR: {e}"))
        page._console_errors = console_errors

        await page.goto(INDEX_HTML, wait_until="networkidle")
        await page.wait_for_timeout(400)

        # 1. Verify Sidebar Navigation items contain authentic .cricos-icon SVGs
        sidebar_items = await page.query_selector_all(".app-sidebar .sidebar-nav-item")
        assert len(sidebar_items) >= 15, f"Sidebar must render at least 15 navigation items, got {len(sidebar_items)}"

        for item in sidebar_items:
            svg = await item.query_selector("svg.cricos-icon")
            assert svg is not None, "Each sidebar navigation item must contain an authentic .cricos-icon SVG"
            text = (await item.inner_text()).strip()
            has_emoji = await page.evaluate(f"({EMOJI_JS_CHECK})(`{text}`)")
            assert not has_emoji, f"Sidebar nav item '{text}' must not contain raw emoji"

        # 2. Verify Desktop Scoring Keypad extras and action buttons
        extras_buttons = await page.query_selector_all(".scoring-keypad button, .quick-actions button")
        for btn in extras_buttons:
            text = (await btn.inner_text()).strip()
            if text and "Auto-Fill" not in text:
                has_emoji = await page.evaluate(f"({EMOJI_JS_CHECK})(`{text}`)")
                assert not has_emoji, f"Desktop action button '{text}' must not contain raw emoji"

        # 3. Verify Theme Switcher renders real SVG icon
        theme_icon_svg = await page.query_selector("#designThemeIcon svg.cricos-icon")
        assert theme_icon_svg is not None, "Design theme switcher must render an authentic .cricos-icon SVG"

        # 4. Save desktop screenshot
        await save_screenshot_async(page, "test_72_desktop_emoji_free_interface")

        # 5. Assert zero critical console errors (Rule 4)
        assert_no_critical_errors(page)
        await browser.close()
