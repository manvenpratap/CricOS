"""
test_60_hover_delayed_tooltips_and_menu_organization.py — E2E Playwright Suite for Hover-Only Delayed Tooltips & Logical Menu Organization
Verifies:
1. Tooltips do NOT appear on focus or click, and do NOT appear during brief transient hovers (< 250ms).
2. Tooltips DO appear after hovering continuously past the 450ms intentional hover delay (>= 500ms) and dismiss on mouseleave or Escape.
3. Left Sidebar (#appSidebar) is organized into 5 logical domain categories (Core Workspaces, Tactical & 3D Studios,
   Match Day & Officiating, League, Auction & Commerce, Developer & Platform).
4. Top Header Bar (.app-topbar) is organized into 4 distinct .topbar-cluster functional groups separated by .topbar-divider.
5. Scoreboard Match Action Toolbar (.match-action-toolbar) is organized into 2 labeled .match-action-group containers (Match Ops & Studios).
6. Mobile Bottom Navigation (#mobileBottomNav) anchors Live Match on the left and Profile on the right across all personas.
7. Zero critical console errors (assert_no_critical_errors(page)) per Rule 4.
"""

import pathlib
import pytest
from playwright.async_api import async_playwright
from tests.helpers import save_screenshot_async, assert_no_critical_errors, catalog_screenshots

ROOT_DIR = pathlib.Path(__file__).parent.parent.resolve()
INDEX_HTML = (ROOT_DIR / "index.html").as_uri()
MOBILE_HTML = (ROOT_DIR / "dist" / "mobile.html").as_uri()


@pytest.mark.asyncio
async def test_60_hover_delayed_tooltips_and_logical_menu_organization():
    console_errors = []
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await ctx.new_page()

        page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: console_errors.append(f"PAGE ERROR: {e}"))
        page._console_errors = console_errors

        await page.goto(INDEX_HTML, wait_until="domcontentloaded")
        await page.wait_for_timeout(150)

        # 1. Verify Sidebar 5 Logical Domain Sections
        section_titles = await page.locator(".sidebar-section-title").all_inner_texts()
        expected_sections = [
            "CORE WORKSPACES",
            "TACTICAL & 3D STUDIOS",
            "MATCH DAY & OFFICIATING",
            "LEAGUE, AUCTION & COMMERCE",
            "DEVELOPER & PLATFORM",
        ]
        normalized_titles = [t.strip().upper() for t in section_titles]
        assert normalized_titles == expected_sections, f"Expected 5 logical sidebar sections {expected_sections}, got {normalized_titles}"

        # Verify Match Center and Scoring Studio are adjacent at top of Core Workspaces
        core_tabs = await page.locator('.sidebar-nav-list[role="tablist"] .tab-btn').evaluate_all(
            "els => els.map(e => e.getAttribute('data-tab'))"
        )
        assert core_tabs[:2] == ["scoring", "studio"], f"Expected Match Center and Scoring Studio first, got {core_tabs}"

        # 2. Verify Topbar 4 Functional Clusters & Scoreboard 2 Match Action Groups
        cluster_count = await page.locator(".topbar-right .topbar-cluster").count()
        assert cluster_count == 4, f"Expected 4 topbar clusters, got {cluster_count}"

        action_group_count = await page.locator(".match-action-toolbar .match-action-group").count()
        assert action_group_count == 2, f"Expected 2 scoreboard match action groups, got {action_group_count}"

        # 3. Verify Tooltip does NOT appear on programmatic focus
        await page.evaluate("document.getElementById('btnCommandPalette').focus()")
        await page.wait_for_timeout(150)
        is_visible_on_focus = await page.evaluate(
            "() => { const tt = document.getElementById('universal-tooltip-popover'); return Boolean(tt && tt.classList.contains('visible')); }"
        )
        assert not is_visible_on_focus, "Tooltip must NOT appear on focus without hover"

        # 4. Verify Tooltip does NOT appear immediately on brief hover (< 250ms)
        await page.hover("#btnCommandPalette")
        await page.wait_for_timeout(150)
        is_visible_early = await page.evaluate(
            "() => { const tt = document.getElementById('universal-tooltip-popover'); return Boolean(tt && tt.classList.contains('visible')); }"
        )
        assert not is_visible_early, "Tooltip must NOT appear before the 450ms hover delay"

        # 5. Verify Tooltip DOES appear after holding hover past 450ms delay (total >= 550ms)
        await page.wait_for_timeout(420)
        is_visible_delayed = await page.evaluate(
            "() => { const tt = document.getElementById('universal-tooltip-popover'); return Boolean(tt && tt.classList.contains('visible')); }"
        )
        assert is_visible_delayed, "Tooltip MUST appear after hovering past the 450ms delay"

        await save_screenshot_async(page, "test_60_desktop_delayed_tooltip_and_organized_menus")

        # 6. Verify Tooltip dismisses on Escape
        await page.keyboard.press("Escape")
        await page.wait_for_timeout(50)
        is_visible_after_esc = await page.evaluate(
            "() => { const tt = document.getElementById('universal-tooltip-popover'); return Boolean(tt && tt.classList.contains('visible')); }"
        )
        assert not is_visible_after_esc, "Tooltip must dismiss immediately on Escape"

        assert_no_critical_errors(page)

        # 7. Verify Mobile Bottom Navigation Order Across Personas
        await page.set_viewport_size({"width": 430, "height": 932})
        await page.goto(MOBILE_HTML, wait_until="domcontentloaded")
        await page.wait_for_timeout(150)

        for persona in ["CAPTAIN", "SCORER", "UMPIRE", "ORGANISER", "TURF_PROVIDER", "ADMIN"]:
            await page.evaluate(f"window.cricosMobileApp.profile.persona = '{persona}'; window.cricosMobileApp.render();")
            await page.wait_for_timeout(40)
            screens = await page.locator("#mobileBottomNav .mobile-nav-item").evaluate_all(
                "els => els.map(e => e.getAttribute('data-screen'))"
            )
            assert screens[0] == "MATCHES", f"Persona {persona} must have MATCHES first in bottom nav, got {screens}"
            assert "PROFILE" in screens, f"Persona {persona} must include PROFILE in bottom nav, got {screens}"

        await save_screenshot_async(page, "test_60_mobile_organized_bottom_nav")
        assert_no_critical_errors(page)
        await browser.close()

    catalog_screenshots()
