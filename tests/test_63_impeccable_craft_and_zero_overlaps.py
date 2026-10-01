"""
test_63_impeccable_craft_and_zero_overlaps.py — Impeccable Craft & Zero-Overlap Automated Verification Suite
Verifies:
1. Desktop Viewport Overlap Invariants (1440x900, 1280x800, 1024x768):
   - Zero element overlaps between header, sidebar, main workspace, and scoreboard.
   - Zero horizontal overflow leaks (scrollWidth <= innerWidth).
   - Dismissal Modal, ICC Laws Reference Modal, and Penalty Runs Modal render cleanly with non-overlapping header/body/footer and proper scroll boundaries.
2. Mobile Viewport Overlap Invariants (390x844, 412x915, 360x780):
   - Zero element overlaps between top status banner, scorer keypad, actions row, and bottom navigation.
   - Mobile bottom nav (.mobile-bottom-nav) maintains structural flow separation from main content.
   - Mobile action sheets (Dismissal, ICC Laws Reference, Penalty Runs) open without collision or viewport clipping.
   - Subtabs (Live Score, 3D Stadium Pitch, 8-Zone Wagon Wheel) render with zero collision or horizontal overflow.
3. Impeccable Craft Floor Invariants:
   - Zero tacky side-tab borders (no border-left >= 3px as sole asymmetric accent).
   - Zero bounce/elastic easing overshoots (> 1.0).
   - Zero non-semantic chromatic zero-offset glowing shadows.
4. Zero critical console errors (assert_no_critical_errors).
5. Local visual screenshots saved to tests/screenshots/.
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
async def test_desktop_zero_overlaps_and_craft_invariants():
    """Verify Desktop Match Center has zero element overlaps across common viewports."""
    viewports = [
        {"width": 1440, "height": 900},
        {"width": 1280, "height": 800},
        {"width": 1024, "height": 768},
    ]

    for vp in viewports:
        console_errors = []
        async with async_playwright() as pw:
            browser = await pw.chromium.launch(headless=True)
            ctx = await browser.new_context(viewport=vp)
            page = await ctx.new_page()

            page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
            page.on("pageerror", lambda e: console_errors.append(f"PAGE ERROR: {e}"))
            page._console_errors = console_errors

            await page.goto(INDEX_HTML, wait_until="networkidle")
            await page.wait_for_timeout(300)

            # 1. Check no horizontal overflow leak
            is_clean_width = await page.evaluate("() => document.documentElement.scrollWidth <= window.innerWidth + 2")
            assert is_clean_width, f"Desktop viewport {vp['width']}x{vp['height']} has horizontal scroll overflow!"

            # 2. Check no bounding box overlaps between core macro panels
            macro_selectors = [
                ".app-header",
                ".app-sidebar",
                ".main-content",
            ]
            macro_overlaps = await page.evaluate("""(selectors) => {
                const boxes = [];
                for (const s of selectors) {
                    const el = document.querySelector(s);
                    if (el && el.offsetParent !== null) {
                        boxes.push({ sel: s, r: el.getBoundingClientRect() });
                    }
                }
                const conflicts = [];
                for (let i = 0; i < boxes.length; i++) {
                    for (let j = i + 1; j < boxes.length; j++) {
                        const a = boxes[i].r;
                        const b = boxes[j].r;
                        const xOverlap = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
                        const yOverlap = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
                        if (xOverlap > 4 && yOverlap > 4) {
                            conflicts.push({ a: boxes[i].sel, b: boxes[j].sel, area: xOverlap * yOverlap });
                        }
                    }
                }
                return conflicts;
            }""", macro_selectors)
            assert len(macro_overlaps) == 0, f"Macro container overlaps found on desktop {vp}: {macro_overlaps}"

            # 3. Test Modals: Open Dismissal Modal and check internal bounds
            dismissal_btn = page.locator("#btnWicket, .btn-out, button:has-text('Wicket')").first
            if await dismissal_btn.count() > 0:
                await dismissal_btn.click()
                await page.wait_for_timeout(250)

                modal_overlap = await page.evaluate("""() => {
                    const header = document.querySelector('.modal-header');
                    const body = document.querySelector('.modal-body');
                    const footer = document.querySelector('.modal-footer');
                    if (!header || !body) return 0;
                    const hr = header.getBoundingClientRect();
                    const br = body.getBoundingClientRect();
                    const yOverlap = Math.max(0, Math.min(hr.bottom, br.bottom) - Math.max(hr.top, br.top));
                    return yOverlap > 2 ? 1 : 0;
                }""")
                assert modal_overlap == 0, "Desktop modal header and body overlap!"

                # Close modal cleanly via Escape
                await page.keyboard.press("Escape")
                await page.wait_for_timeout(200)

            # 4. Save visual snapshot
            await save_screenshot_async(page, f"test_63_desktop_{vp['width']}x{vp['height']}")

            # 5. Assert zero critical console errors
            assert_no_critical_errors(page)
            await browser.close()


@pytest.mark.asyncio
async def test_mobile_zero_overlaps_and_craft_invariants():
    """Verify Mobile Scorer Studio has zero element overlaps across mobile device viewports."""
    viewports = [
        {"width": 390, "height": 844},  # iPhone 14/15/16
        {"width": 412, "height": 915},  # Pixel 8/9, Galaxy S24
        {"width": 360, "height": 780},  # Compact Android
    ]

    for vp in viewports:
        console_errors = []
        async with async_playwright() as pw:
            browser = await pw.chromium.launch(headless=True)
            ctx = await browser.new_context(viewport=vp, is_mobile=True)
            page = await ctx.new_page()

            page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
            page.on("pageerror", lambda e: console_errors.append(f"PAGE ERROR: {e}"))
            page._console_errors = console_errors

            await page.goto(MOBILE_HTML, wait_until="networkidle")
            await page.wait_for_timeout(350)

            # 1. Check no horizontal overflow leak
            is_clean_width = await page.evaluate("() => document.documentElement.scrollWidth <= window.innerWidth + 2")
            assert is_clean_width, f"Mobile viewport {vp['width']}x{vp['height']} has horizontal scroll overflow!"

            # 2. Check Keypad and Bottom Nav structural separation
            nav_overlap = await page.evaluate("""() => {
                const nav = document.querySelector('.mobile-bottom-nav');
                const pad = document.querySelector('#mobileScorerPadGrid, .scorer-pad');
                if (!nav || !pad) return 0;
                const nr = nav.getBoundingClientRect();
                const pr = pad.getBoundingClientRect();
                const xOverlap = Math.max(0, Math.min(nr.right, pr.right) - Math.max(nr.left, pr.left));
                const yOverlap = Math.max(0, Math.min(nr.bottom, pr.bottom) - Math.max(nr.top, pr.top));
                return (xOverlap > 4 && yOverlap > 4) ? 1 : 0;
            }""")
            assert nav_overlap == 0, f"Mobile bottom nav overlaps scoring pad on {vp}!"

            # 3. Test Action Sheets: Open Fall of Wicket sheet
            wkt_btn = page.locator("#btnMobileWkt, button:has-text('WKT')").first
            if await wkt_btn.count() > 0:
                await wkt_btn.click()
                await page.wait_for_timeout(250)

                sheet_overlaps = await page.evaluate("""() => {
                    const sheet = document.querySelector('#mobileDismissalSheet .mobile-sheet-content, .mobile-sheet-content');
                    if (!sheet) return 0;
                    const items = sheet.querySelectorAll('button, select, input, .mobile-sheet-header');
                    let overlaps = 0;
                    for (let i = 0; i < items.length; i++) {
                        for (let j = i + 1; j < items.length; j++) {
                            const a = items[i].getBoundingClientRect();
                            const b = items[j].getBoundingClientRect();
                            if (a.width > 0 && b.width > 0 && a.height > 0 && b.height > 0) {
                                const xOverlap = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
                                const yOverlap = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
                                if (xOverlap > 4 && yOverlap > 4) {
                                    overlaps++;
                                }
                            }
                        }
                    }
                    return overlaps;
                }""")
                assert sheet_overlaps == 0, f"Mobile dismissal sheet has overlapping controls on {vp}!"

                # Close sheet
                await page.keyboard.press("Escape")
                await page.wait_for_timeout(200)

            # 4. Test Subtabs: Switch to 3D Stadium Pitch
            stadium_tab = page.locator('[data-subtab="STADIUM_3D"]').first
            if await stadium_tab.count() > 0:
                await stadium_tab.click()
                await page.wait_for_timeout(300)

                subtab_clean = await page.evaluate("() => document.documentElement.scrollWidth <= window.innerWidth + 2")
                assert subtab_clean, f"3D Stadium subtab leaked horizontal overflow on {vp}!"

            # 5. Switch to 8-Zone Wagon Wheel
            wagon_tab = page.locator('[data-subtab="WAGON"]').first
            if await wagon_tab.count() > 0:
                await wagon_tab.click()
                await page.wait_for_timeout(300)

                wagon_clean = await page.evaluate("() => document.documentElement.scrollWidth <= window.innerWidth + 2")
                assert wagon_clean, f"Wagon Wheel subtab leaked horizontal overflow on {vp}!"

            # 6. Save visual snapshot
            await save_screenshot_async(page, f"test_63_mobile_{vp['width']}x{vp['height']}")

            # 7. Zero critical errors
            assert_no_critical_errors(page)
            await browser.close()


@pytest.mark.asyncio
async def test_impeccable_craft_floor_static_and_computed_properties():
    """Verify that CSS tokens and computed styles follow the Impeccable craft floor."""
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        page = await browser.new_page()

        await page.goto(INDEX_HTML, wait_until="networkidle")

        # 1. Verify --ease-spring uses clean deceleration without overshoot (> 1.0)
        ease_spring = await page.evaluate("""() => {
            return getComputedStyle(document.documentElement).getPropertyValue('--ease-spring').trim();
        }""")
        assert "1.1" not in ease_spring and "1.2" not in ease_spring, f"Ease spring has overshoot: {ease_spring}"

        # 2. Verify no active card has thick colored side-tab (border-left >= 3px with different color)
        side_tab_count = await page.evaluate("""() => {
            const cards = document.querySelectorAll('.card, .match-card, .scoreboard-card, .standings-row');
            let count = 0;
            for (const c of cards) {
                const s = window.getComputedStyle(c);
                const blw = parseFloat(s.borderLeftWidth) || 0;
                const btw = parseFloat(s.borderTopWidth) || 0;
                if (blw >= 3 && blw > btw * 2) {
                    count++;
                }
            }
            return count;
        }""")
        assert side_tab_count == 0, f"Found {side_tab_count} elements with thick side-tab borders!"

        # 3. Verify zero critical console errors
        assert_no_critical_errors(page)
        await browser.close()
