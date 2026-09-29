"""
Test 62: Android APK 3D Stadium Non-Blank Rendering & Live DOM Canvas Rebinding
===============================================================================
Verifies that in the packaged Android APK bundle (`dist/mobile.html`), even when external
CDNs are blocked or WebGL context fails:
1. `#mobileThreeStadiumCanvas` renders rich 3D pixels (>5,000 non-blank pixels) on initial load.
2. Launching from `Profile -> 3D Stadium Pitch` tile navigates properly to `MATCHES` + `STADIUM_3D`
   and renders a non-blank 3D Stadium canvas.
3. Every UI interaction that triggers `StandaloneMobileApp.prototype.render()` (Camera Presets:
   `BATSMAN`, `HIGH`, `UMPIRE`, `RESET`; Tactical Layers: `WAGON`, `HAWKEYE`, `DRS`, `FIELD`;
   Lighting: `DAY`, `DUSK`, `NIGHT`) automatically re-binds `window.mobileStadiumPitch.canvas`
   to the newly inserted DOM `<canvas>` element so the screen never goes blank.
4. Both `#mobileTrophyCanvas` (3D Trophy Cabinet) and `#mobileBatCanvas` (3D Bat Configurator)
   also re-bind and render non-blank 3D graphics.
"""

import pathlib
import pytest
from playwright.async_api import async_playwright
from tests.helpers import assert_no_critical_errors, save_screenshot_async, catalog_screenshots

ROOT_DIR = pathlib.Path(__file__).resolve().parents[1]
MOBILE_HTML_URI = (ROOT_DIR / "dist" / "mobile.html").as_uri()


async def _count_non_blank_canvas_pixels(page, canvas_id: str) -> dict:
    return await page.evaluate(
        """(canvasId) => {
            const canvas = document.getElementById(canvasId);
            if (!canvas) return { exists: false, nonBlank: 0, width: 0, height: 0, boundToLive: false };
            const ctx = canvas.getContext('2d');
            if (!ctx || canvas.width === 0 || canvas.height === 0) {
                return { exists: true, nonBlank: 0, width: canvas.width, height: canvas.height, boundToLive: false };
            }
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            let nonBlank = 0;
            let distinctColors = new Set();
            for (let i = 0; i < imgData.length; i += 16) {
                const r = imgData[i], g = imgData[i + 1], b = imgData[i + 2], a = imgData[i + 3];
                if (a > 10 && (r > 5 || g > 5 || b > 5)) {
                    nonBlank++;
                    distinctColors.add(`${r >> 4}-${g >> 4}-${b >> 4}`);
                }
            }
            let boundToLive = false;
            if (canvasId === 'mobileThreeStadiumCanvas' && window.mobileStadiumPitch) {
                boundToLive = (window.mobileStadiumPitch.canvas === canvas);
            } else if (canvasId === 'mobileTrophyCanvas' && window.mobileTrophyCabinet) {
                boundToLive = (window.mobileTrophyCabinet.canvas === canvas);
            } else if (canvasId === 'mobileBatCanvas' && window.mobileBatConfigurator) {
                boundToLive = (window.mobileBatConfigurator.canvas === canvas);
            }
            return {
                exists: true,
                nonBlank: nonBlank,
                distinctBuckets: distinctColors.size,
                width: canvas.width,
                height: canvas.height,
                boundToLive: boundToLive
            };
        }""",
        canvas_id,
    )


@pytest.mark.asyncio
async def test_62_apk_3d_stadium_non_blank_rendering():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 412, "height": 915})
        console_errors: list[str] = []
        page = await context.new_page()

        page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: console_errors.append(f"PAGE ERROR: {e}"))
        page._console_errors = console_errors

        # Block external CDN requests to verify 100% offline APK resilience
        await page.route("https://**/*", lambda route: route.abort())

        await page.goto(MOBILE_HTML_URI, wait_until="domcontentloaded")
        await page.wait_for_timeout(400)

        # 1. Navigate to Matches -> 3D Stadium sub-tab
        await page.evaluate(
            """() => {
                window.cricosMobileApp.navigateTo('MATCHES');
                window.cricosMobileApp.setMatchSubTab('STADIUM_3D');
            }"""
        )
        await page.wait_for_timeout(350)

        stats_initial = await _count_non_blank_canvas_pixels(page, "mobileThreeStadiumCanvas")
        assert stats_initial["exists"], "Expected #mobileThreeStadiumCanvas to exist in DOM"
        assert stats_initial["boundToLive"], "Expected window.mobileStadiumPitch.canvas to be bound to live DOM canvas"
        assert stats_initial["nonBlank"] > 5000, f"Expected non-blank 3D Stadium canvas on initial open, got {stats_initial}"
        assert stats_initial["distinctBuckets"] >= 8, f"Expected multi-color 3D Stadium scene (sky, turf, pitch, stands, arcs), got {stats_initial}"

        # 2. Verify Profile -> 3D Stadium Pitch tile navigation & non-blank rendering
        await page.evaluate("window.cricosMobileApp.navigateTo('PROFILE')")
        await page.wait_for_timeout(200)
        stadium_tile = page.locator('button[aria-label="3D Stadium Pitch Viewport"]')
        await stadium_tile.click(force=True)
        await page.wait_for_timeout(350)

        stats_from_profile = await _count_non_blank_canvas_pixels(page, "mobileThreeStadiumCanvas")
        assert stats_from_profile["exists"], "Expected #mobileThreeStadiumCanvas after clicking Profile -> 3D Stadium Pitch tile"
        assert stats_from_profile["boundToLive"], "Expected live DOM canvas binding after Profile -> 3D Stadium Pitch navigation"
        assert stats_from_profile["nonBlank"] > 5000, f"Expected non-blank 3D Stadium canvas from Profile tile, got {stats_from_profile}"

        # 3. Verify Camera Presets (which call this.render() and replace DOM innerHTML)
        for preset in ["BATSMAN", "HIGH", "UMPIRE", "RESET"]:
            await page.evaluate(f"window.cricosMobileApp.setThreeCameraPreset('{preset}')")
            await page.wait_for_timeout(250)
            stats_preset = await _count_non_blank_canvas_pixels(page, "mobileThreeStadiumCanvas")
            assert stats_preset["boundToLive"], f"Canvas detached after camera preset {preset}"
            assert stats_preset["nonBlank"] > 5000, f"Blank canvas after camera preset {preset}: {stats_preset}"

        # 4. Verify Tactical Layers (WAGON, HAWKEYE, DRS, FIELD, FUSION)
        for mode in ["WAGON", "HAWKEYE", "DRS", "FIELD", "FUSION"]:
            await page.evaluate(f"window.cricosMobileApp.setThreeVisualMode('{mode}')")
            await page.wait_for_timeout(250)
            stats_mode = await _count_non_blank_canvas_pixels(page, "mobileThreeStadiumCanvas")
            assert stats_mode["boundToLive"], f"Canvas detached after visual mode {mode}"
            assert stats_mode["nonBlank"] > 5000, f"Blank canvas after visual mode {mode}: {stats_mode}"

        # 5. Verify Floodlight Lighting Modes (DAY, DUSK, NIGHT)
        for light in ["DAY", "DUSK", "NIGHT"]:
            await page.evaluate(f"window.cricosMobileApp.setThreeLighting('{light}')")
            await page.wait_for_timeout(250)
            stats_light = await _count_non_blank_canvas_pixels(page, "mobileThreeStadiumCanvas")
            assert stats_light["boundToLive"], f"Canvas detached after lighting {light}"
            assert stats_light["nonBlank"] > 5000, f"Blank canvas after lighting {light}: {stats_light}"

        # Capture visual screenshot of rendered 3D Stadium in APK view
        await save_screenshot_async(page, "test_62_mobile_apk_3d_stadium_rendered.png")

        # 6. Verify 3D Trophy Cabinet & 3D Bat Configurator non-blank rendering
        await page.evaluate(
            """() => {
                window.cricosMobileApp.navigateTo('PROFILE');
                window.cricosMobileApp.open3DTrophyCabinetSheet();
            }"""
        )
        await page.wait_for_timeout(350)
        stats_trophy = await _count_non_blank_canvas_pixels(page, "mobileTrophyCanvas")
        assert stats_trophy["boundToLive"], "Trophy canvas not bound to live DOM element"
        assert stats_trophy["nonBlank"] > 1000, f"Expected non-blank 3D Trophy canvas, got {stats_trophy}"

        await page.evaluate(
            """() => {
                window.cricosMobileApp.openGearCustomizerSheet();
            }"""
        )
        await page.wait_for_timeout(350)
        stats_bat = await _count_non_blank_canvas_pixels(page, "mobileBatCanvas")
        assert stats_bat["boundToLive"], "Bat canvas not bound to live DOM element"
        assert stats_bat["nonBlank"] > 1000, f"Expected non-blank 3D Bat canvas, got {stats_bat}"

        assert_no_critical_errors(page)
        await browser.close()
        catalog_screenshots("test_62")
