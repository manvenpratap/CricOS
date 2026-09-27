"""
test_54_playwright_theme_verification.py — Playwright E2E Theme Verification Suite
Verifies that all 3 themes (Swiss Minimal, Nordic Editorial, Stadium Night)
are fully operational, visually and style-computed distinct, responsive to user
interaction and shortcuts, free of critical console errors, and captured to local screenshots.
"""

import asyncio
import os
import pathlib
import pytest
from playwright.async_api import async_playwright, Page, Browser, BrowserContext
from tests.helpers import save_screenshot_async, assert_no_critical_errors, catalog_screenshots

ROOT_DIR = pathlib.Path(__file__).parent.parent.resolve()
INDEX_HTML = (ROOT_DIR / "index.html").as_uri()
MOBILE_HTML = (ROOT_DIR / "dist" / "mobile.html").as_uri()


@pytest.mark.asyncio
async def test_desktop_themes_working_and_distinct():
    """
    Verify all 3 themes in Desktop Web Console:
    1. Swiss Minimal: bright paper background, stark dark charcoal text, hairline border
    2. Nordic Editorial: warm ivory background, warm off-black text, warm stone border
    3. Stadium Night: deep obsidian pitch background, luminous white text, neon turf glow
    Asserts distinct computed styles across all 3 themes and captures local screenshots.
    """
    console_errors = []
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await ctx.new_page()

        page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: console_errors.append(f"PAGE ERROR: {e}"))
        page._console_errors = console_errors

        await page.goto(INDEX_HTML, wait_until="domcontentloaded")
        await page.wait_for_timeout(300)

        # -------------------------------------------------------------
        # 1. Test SWISS MINIMAL Theme
        # -------------------------------------------------------------
        await page.evaluate("() => window.setDesignTheme('swiss', false)")
        await page.wait_for_timeout(200)

        swiss_data = await page.evaluate("""() => {
            const body = document.body;
            const sidebar = document.querySelector('.app-sidebar');
            const card = document.querySelector('.card');
            const btn = document.getElementById('btnDesignThemeSwitcher');
            const icon = document.getElementById('designThemeIcon');
            const label = document.getElementById('designThemeLabel');
            
            return {
                themeAttr: body.getAttribute('data-theme'),
                bodyBg: window.getComputedStyle(body).backgroundColor,
                bodyColor: window.getComputedStyle(body).color,
                sidebarBg: sidebar ? window.getComputedStyle(sidebar).backgroundColor : null,
                cardBg: card ? window.getComputedStyle(card).backgroundColor : null,
                cardBorder: card ? window.getComputedStyle(card).borderColor : null,
                btnLabel: label ? label.textContent.trim() : '',
                btnIcon: icon ? icon.textContent.trim() : ''
            };
        }""")

        assert swiss_data["themeAttr"] == "swiss", "Body data-theme must be swiss"
        assert "SWISS MINIMAL" in swiss_data["btnLabel"], "Switcher label must display SWISS MINIMAL"
        assert swiss_data["btnIcon"] == "🇨🇭", "Switcher icon must display Swiss flag"
        await save_screenshot_async(page, "desktop_theme_swiss")

        # -------------------------------------------------------------
        # 2. Test NORDIC EDITORIAL Theme (via switcher click)
        # -------------------------------------------------------------
        await page.click("#btnDesignThemeSwitcher")
        await page.wait_for_timeout(200)

        nordic_data = await page.evaluate("""() => {
            const body = document.body;
            const sidebar = document.querySelector('.app-sidebar');
            const card = document.querySelector('.card');
            const icon = document.getElementById('designThemeIcon');
            const label = document.getElementById('designThemeLabel');
            
            return {
                themeAttr: body.getAttribute('data-theme'),
                bodyBg: window.getComputedStyle(body).backgroundColor,
                bodyColor: window.getComputedStyle(body).color,
                sidebarBg: sidebar ? window.getComputedStyle(sidebar).backgroundColor : null,
                cardBg: card ? window.getComputedStyle(card).backgroundColor : null,
                cardBorder: card ? window.getComputedStyle(card).borderColor : null,
                btnLabel: label ? label.textContent.trim() : '',
                btnIcon: icon ? icon.textContent.trim() : ''
            };
        }""")

        assert nordic_data["themeAttr"] == "nordic", "Body data-theme must be nordic after click"
        assert "NORDIC EDITORIAL" in nordic_data["btnLabel"], "Switcher label must display NORDIC EDITORIAL"
        assert nordic_data["btnIcon"] == "🌾", "Switcher icon must display Nordic wheat"
        await save_screenshot_async(page, "desktop_theme_nordic")

        # -------------------------------------------------------------
        # 3. Test STADIUM NIGHT Theme (via keyboard shortcut Alt+T)
        # -------------------------------------------------------------
        await page.keyboard.press("Alt+t")
        await page.wait_for_timeout(200)

        stadium_data = await page.evaluate("""() => {
            const body = document.body;
            const sidebar = document.querySelector('.app-sidebar');
            const card = document.querySelector('.card');
            const icon = document.getElementById('designThemeIcon');
            const label = document.getElementById('designThemeLabel');
            
            return {
                themeAttr: body.getAttribute('data-theme'),
                bodyBg: window.getComputedStyle(body).backgroundColor,
                bodyColor: window.getComputedStyle(body).color,
                sidebarBg: sidebar ? window.getComputedStyle(sidebar).backgroundColor : null,
                cardBg: card ? window.getComputedStyle(card).backgroundColor : null,
                cardBorder: card ? window.getComputedStyle(card).borderColor : null,
                btnLabel: label ? label.textContent.trim() : '',
                btnIcon: icon ? icon.textContent.trim() : ''
            };
        }""")

        assert stadium_data["themeAttr"] == "stadium", "Body data-theme must be stadium after Alt+T"
        assert "STADIUM NIGHT" in stadium_data["btnLabel"], "Switcher label must display STADIUM NIGHT"
        assert stadium_data["btnIcon"] == "🌙", "Switcher icon must display Moon"
        await save_screenshot_async(page, "desktop_theme_stadium")

        # -------------------------------------------------------------
        # 4. Assert Distinct Styles Across All 3 Themes
        # -------------------------------------------------------------
        # Background Colors must be mutually distinct
        assert swiss_data["bodyBg"] != nordic_data["bodyBg"], "Swiss and Nordic body backgrounds must differ"
        assert swiss_data["bodyBg"] != stadium_data["bodyBg"], "Swiss and Stadium body backgrounds must differ"
        assert nordic_data["bodyBg"] != stadium_data["bodyBg"], "Nordic and Stadium body backgrounds must differ"

        # Text Colors must be mutually distinct (Dark Charcoal vs Warm Off-Black vs White)
        assert swiss_data["bodyColor"] != stadium_data["bodyColor"], "Swiss and Stadium text colors must differ"
        assert nordic_data["bodyColor"] != stadium_data["bodyColor"], "Nordic and Stadium text colors must differ"

        # Sidebar Backgrounds must be distinct
        assert swiss_data["sidebarBg"] != stadium_data["sidebarBg"], "Swiss and Stadium sidebar backgrounds must differ"
        assert nordic_data["sidebarBg"] != stadium_data["sidebarBg"], "Nordic and Stadium sidebar backgrounds must differ"

        # Assert no critical console errors
        assert_no_critical_errors(page)
        await browser.close()


@pytest.mark.asyncio
async def test_mobile_themes_working_and_distinct():
    """
    Verify all 3 themes in Mobile Application (dist/mobile.html):
    1. Swiss Minimal on mobile
    2. Nordic Editorial on mobile
    3. Stadium Night on mobile
    Asserts distinct computed styles across all 3 themes and captures local screenshots.
    """
    console_errors = []
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 414, "height": 896})
        page = await ctx.new_page()

        page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: console_errors.append(f"PAGE ERROR: {e}"))
        page._console_errors = console_errors

        await page.goto(MOBILE_HTML, wait_until="domcontentloaded")
        await page.wait_for_timeout(300)

        # 1. Swiss Minimal on Mobile
        await page.evaluate("() => window.cricosMobileApp.setTheme('swiss', false)")
        await page.wait_for_timeout(200)

        mobile_swiss = await page.evaluate("""() => {
            const body = document.body;
            const bar = document.querySelector('.mobile-header') || document.querySelector('.mobile-app-bar');
            return {
                themeAttr: body.getAttribute('data-theme'),
                bodyBg: window.getComputedStyle(body).backgroundColor,
                bodyColor: window.getComputedStyle(body).color,
                barBg: bar ? window.getComputedStyle(bar).backgroundColor : null
            };
        }""")

        assert mobile_swiss["themeAttr"] == "swiss", "Mobile data-theme must be swiss"
        await save_screenshot_async(page, "mobile_theme_swiss")

        # 2. Nordic Editorial on Mobile
        await page.evaluate("() => window.cricosMobileApp.setTheme('nordic', false)")
        await page.wait_for_timeout(200)

        mobile_nordic = await page.evaluate("""() => {
            const body = document.body;
            const bar = document.querySelector('.mobile-header') || document.querySelector('.mobile-app-bar');
            return {
                themeAttr: body.getAttribute('data-theme'),
                bodyBg: window.getComputedStyle(body).backgroundColor,
                bodyColor: window.getComputedStyle(body).color,
                barBg: bar ? window.getComputedStyle(bar).backgroundColor : null
            };
        }""")

        assert mobile_nordic["themeAttr"] == "nordic", "Mobile data-theme must be nordic"
        await save_screenshot_async(page, "mobile_theme_nordic")

        # 3. Stadium Night on Mobile
        await page.evaluate("() => window.cricosMobileApp.setTheme('stadium', false)")
        await page.wait_for_timeout(200)

        mobile_stadium = await page.evaluate("""() => {
            const body = document.body;
            const bar = document.querySelector('.mobile-header') || document.querySelector('.mobile-app-bar');
            return {
                themeAttr: body.getAttribute('data-theme'),
                bodyBg: window.getComputedStyle(body).backgroundColor,
                bodyColor: window.getComputedStyle(body).color,
                barBg: bar ? window.getComputedStyle(bar).backgroundColor : null
            };
        }""")

        assert mobile_stadium["themeAttr"] == "stadium", "Mobile data-theme must be stadium"
        await save_screenshot_async(page, "mobile_theme_stadium")

        # Assert Mobile Themes are Distinct
        assert mobile_swiss["bodyBg"] != mobile_nordic["bodyBg"], f"Mobile Swiss and Nordic backgrounds must differ: {mobile_swiss['bodyBg']} vs {mobile_nordic['bodyBg']}"
        assert mobile_swiss["bodyBg"] != mobile_stadium["bodyBg"], "Mobile Swiss and Stadium backgrounds must differ"
        assert mobile_nordic["bodyBg"] != mobile_stadium["bodyBg"], "Mobile Nordic and Stadium backgrounds must differ"

        # Assert Mobile Text Colors are Distinct
        assert mobile_swiss["bodyColor"] != mobile_stadium["bodyColor"], "Mobile Swiss and Stadium text colors must differ"
        assert mobile_nordic["bodyColor"] != mobile_stadium["bodyColor"], "Mobile Nordic and Stadium text colors must differ"

        # Regenerate gallery
        catalog_screenshots()

        # Assert no critical console errors
        assert_no_critical_errors(page)
        await browser.close()


if __name__ == "__main__":
    asyncio.run(test_desktop_themes_working_and_distinct())
    asyncio.run(test_mobile_themes_working_and_distinct())
    print("✅ All Playwright theme checks passed successfully!")
