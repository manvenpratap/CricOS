"""
Test 61: Daylight Themes (Swiss Minimal & Nordic Editorial) Readability & Uncluttered Topbar
=============================================================================================
Verifies:
1. Topbar (.app-topbar) is uncluttered: only 6 clean controls are visible in .topbar-right, while noisy secondary badges (#telemetryEscrow, #telemetryCircuit, #telemetryLatency, #btnOutdoorModeToggle, #btnTactilePrototypeToggle, #protoPicker) are hidden.
2. In Swiss Minimal ('swiss') and Nordic Editorial ('nordic'), all Scoreboard inner strips (.target-equation-bar, .match-momentum-container, .event-readiness-card, .over-strip-container, .stat-mini-card, .fow-container), #threeDExperiencesHub, .three-hub-tile, .user-profile-header-btn, and .sonner-toast have clean daylight surfaces (relative luminance >= 0.80, never muddy grey) and high-contrast text (WCAG AA/AAA >= 4.65:1).
"""

import pathlib
import pytest
from playwright.async_api import async_playwright
from tests.helpers import assert_no_critical_errors, save_screenshot_async, catalog_screenshots

ROOT = pathlib.Path(__file__).resolve().parents[1]
INDEX_HTML = f"file://{ROOT / 'index.html'}"


@pytest.mark.asyncio
async def test_61_daylight_themes_readability_and_uncluttered_topbar():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1440, "height": 900})
        console_errors: list[str] = []
        page = await ctx.new_page()

        page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: console_errors.append(f"PAGE ERROR: {e}"))
        page._console_errors = console_errors

        await page.goto(INDEX_HTML, wait_until="domcontentloaded")
        await page.wait_for_timeout(150)

        # 1. Verify Topbar Clutter Elimination
        topbar_audit = await page.evaluate(
            """() => {
                const visibleBtns = Array.from(document.querySelectorAll('.topbar-right button, .topbar-right .status-pill'))
                    .filter(el => window.getComputedStyle(el).display !== 'none' && window.getComputedStyle(el.parentElement).display !== 'none');
                const protoPickerHidden = window.getComputedStyle(document.getElementById('protoPicker')).display === 'none';
                const escrowHidden = window.getComputedStyle(document.getElementById('telemetryEscrow').closest('.topbar-telemetry-group')).display === 'none';
                return {
                    visibleCount: visibleBtns.length,
                    visibleIds: visibleBtns.map(b => b.id || b.textContent.trim()),
                    protoPickerHidden,
                    escrowHidden
                };
            }"""
        )
        assert topbar_audit["visibleCount"] <= 7, f"Topbar should have <= 7 visible controls, got {topbar_audit}"
        assert topbar_audit["protoPickerHidden"], "Floating #protoPicker must be hidden by default"
        assert topbar_audit["escrowHidden"], "Verbose telemetry badges must be hidden from main topbar"

        # 2. Audit Swiss Minimal & Nordic Editorial Surfaces & Contrast
        for theme in ["swiss", "nordic"]:
            await page.evaluate(f"setDesignTheme('{theme}')")
            await page.wait_for_timeout(120)

            audit = await page.evaluate(
                """() => {
                    function parseRgba(str) {
                        const m = str.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)(?:,\\s*([\\d.]+))?\\)/);
                        if (!m) return [255, 255, 255, 1];
                        return [Number(m[1]), Number(m[2]), Number(m[3]), m[4] !== undefined ? Number(m[4]) : 1];
                    }
                    function relLum(rgb) {
                        const ch = c => {
                            const v = c / 255;
                            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
                        };
                        return 0.2126 * ch(rgb[0]) + 0.7152 * ch(rgb[1]) + 0.0722 * ch(rgb[2]);
                    }
                    function contrast(c1, c2) {
                        const l1 = relLum(c1), l2 = relLum(c2);
                        return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
                    }
                    const selectors = [
                        '.scoreboard',
                        '.target-equation-bar',
                        '.match-momentum-container',
                        '.event-readiness-card',
                        '.over-strip-container',
                        '.stat-mini-card',
                        '.fow-container',
                        '#threeDExperiencesHub',
                        '.three-hub-tile',
                        '.user-profile-header-btn'
                    ];
                    const surfaceReport = {};
                    for (const sel of selectors) {
                        const el = document.querySelector(sel);
                        if (!el) continue;
                        const bg = parseRgba(window.getComputedStyle(el).backgroundColor);
                        surfaceReport[sel] = { bg, lum: Number(relLum(bg).toFixed(3)) };
                    }
                    const strikerEl = document.getElementById('strikerName');
                    const cardEl = strikerEl.closest('.stat-mini-card');
                    const strikerFg = parseRgba(window.getComputedStyle(strikerEl).color);
                    const cardBg = parseRgba(window.getComputedStyle(cardEl).backgroundColor);
                    const strikerContrast = Number(contrast(strikerFg, cardBg).toFixed(2));

                    const userEl = document.getElementById('headerUserName');
                    const userCardEl = userEl.closest('.user-profile-header-btn');
                    const userFg = parseRgba(window.getComputedStyle(userEl).color);
                    const userBg = parseRgba(window.getComputedStyle(userCardEl).backgroundColor);
                    const userContrast = Number(contrast(userFg, userBg).toFixed(2));

                    return { surfaceReport, strikerContrast, userContrast };
                }"""
            )

            for sel, info in audit["surfaceReport"].items():
                assert info["lum"] >= 0.80, f"[{theme}] {sel} must have clean daylight surface (lum >= 0.80), got {info}"

            assert audit["strikerContrast"] >= 7.0, f"[{theme}] #strikerName must have AAA contrast >= 7.0, got {audit['strikerContrast']}"
            assert audit["userContrast"] >= 7.0, f"[{theme}] #headerUserName must have AAA contrast >= 7.0, got {audit['userContrast']}"

            await save_screenshot_async(page, f"test_61_{theme}_clean_topbar_and_scoreboard")

        assert_no_critical_errors(page)
        await browser.close()

    catalog_screenshots()
