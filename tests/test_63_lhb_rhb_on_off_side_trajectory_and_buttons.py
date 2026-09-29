"""
Test 63: LHB & RHB Stance ON/OFF Side Ball Trajectory & Shot Direction Confirmation Invariants
==============================================================================================
Verifies across both Desktop Scoring Studio (`index.html`) and Mobile/APK Scoring View (`dist/mobile.html`)
that when a Left-Handed Batsman (LHB) comes on strike:
1. Physical Left side of the pitch (`x < 180`) is `◀ ON SIDE` (`Fine Leg`, `Sq Leg`, `Mid Wicket`, `Long On`).
2. Physical Right side of the pitch (`x > 180`) is `OFF SIDE ▶` (`Third Man`, `Point`, `Cover / Extra Cover`, `Long Off`).
3. `Cover / Extra Cover`, `Point`, `Third Man`, `Long Off` are ALWAYS labeled `OFF-SIDE` (never `ON-SIDE`),
   and `Fine Leg`, `Sq Leg`, `Mid Wicket`, `Long On` are ALWAYS labeled `ON-SIDE` (never `OFF-SIDE`).
4. Ball trajectory preview rays and recorded shot trajectories agree 100% with the written confirmation buttons
   and SVG sector wedges.
"""

import pathlib
import pytest
from playwright.async_api import async_playwright
from tests.helpers import assert_no_critical_errors, save_screenshot_async, catalog_screenshots

ROOT_DIR = pathlib.Path(__file__).resolve().parents[1]
DESKTOP_HTML_URI = (ROOT_DIR / "index.html").as_uri()
MOBILE_HTML_URI = (ROOT_DIR / "dist" / "mobile.html").as_uri()


@pytest.mark.asyncio
async def test_63_desktop_lhb_rhb_on_off_side_trajectory_and_buttons():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await context.new_page()

        console_errors = []
        page.on("pageerror", lambda err: console_errors.append(str(err)))

        await page.goto(DESKTOP_HTML_URI, wait_until="domcontentloaded")
        await page.wait_for_timeout(600)

        # Activate SCORER persona and swap strike so Hardik Patel (LHB) comes on strike
        await page.evaluate("""() => {
            if (typeof currentUser !== 'undefined') currentUser.persona = 'SCORER';
            if (typeof applyRolePermissions === 'function') applyRolePermissions('SCORER');
            if (typeof swapStudioStrike === 'function') swapStudioStrike();
        }""")
        await page.wait_for_timeout(300)

        desktop_state = await page.evaluate("""() => {
            const stance = typeof currentStance !== 'undefined' ? currentStance : null;
            const wagonLabelOff = document.getElementById('wagonLabelOff');
            const wagonLabelLeg = document.getElementById('wagonLabelLeg');
            const btnLowerLeft = document.getElementById('btnZone_lower_left');
            const btnLowerRight = document.getElementById('btnZone_lower_right');

            // Select EXTRA_COVER (lower_right when LHB is active)
            selectShotZone('EXTRA_COVER');
            const coverZoneText = document.getElementById('wagonWheelSelectedZone')?.textContent?.trim();

            // Select MID_WICKET (lower_left when LHB is active)
            selectShotZone('MID_WICKET');
            const midWicketZoneText = document.getElementById('wagonWheelSelectedZone')?.textContent?.trim();

            // Check 3D Stadium fielders for LHB mirroring
            let coverFielderX = null;
            let midWicketFielderX = null;
            if (window.stadiumPitch && window.stadiumPitch.fielderPositions) {
                const cov = window.stadiumPitch.fielderPositions.find(f => f.role === 'Extra Cover');
                const mw = window.stadiumPitch.fielderPositions.find(f => f.role === 'Mid-Wicket');
                if (cov) coverFielderX = cov.x;
                if (mw) midWicketFielderX = mw.x;
            }

            return {
                stance,
                offLabelX: wagonLabelOff?.getAttribute('x'),
                offLabelText: wagonLabelOff?.textContent?.trim(),
                legLabelX: wagonLabelLeg?.getAttribute('x'),
                legLabelText: wagonLabelLeg?.textContent?.trim(),
                lowerLeftZone: btnLowerLeft?.getAttribute('data-zone'),
                lowerLeftSide: btnLowerLeft?.getAttribute('data-side'),
                lowerLeftText: btnLowerLeft?.textContent?.trim(),
                lowerRightZone: btnLowerRight?.getAttribute('data-zone'),
                lowerRightSide: btnLowerRight?.getAttribute('data-side'),
                lowerRightText: btnLowerRight?.textContent?.trim(),
                coverZoneText,
                midWicketZoneText,
                coverFielderX,
                midWicketFielderX
            };
        }""")

        assert desktop_state["stance"] == "LHB", f"Expected LHB after strike swap, got {desktop_state}"
        assert desktop_state["legLabelX"] == "35", f"ON SIDE label should be at Left (x=35) for LHB: {desktop_state}"
        assert "ON SIDE" in desktop_state["legLabelText"]
        assert desktop_state["offLabelX"] == "325", f"OFF SIDE label should be at Right (x=325) for LHB: {desktop_state}"
        assert "OFF SIDE" in desktop_state["offLabelText"]

        assert desktop_state["lowerLeftZone"] == "MID_WICKET"
        assert desktop_state["lowerLeftSide"] == "ON"
        assert "(ON)" in desktop_state["lowerLeftText"]

        assert desktop_state["lowerRightZone"] == "EXTRA_COVER"
        assert desktop_state["lowerRightSide"] == "OFF"
        assert "(OFF)" in desktop_state["lowerRightText"]

        # Verify active zone text never mixes up OFF-SIDE and ON-SIDE when LHB is on strike
        assert "OFF-SIDE" in desktop_state["coverZoneText"], f"Cover must be OFF-SIDE for LHB, got: {desktop_state['coverZoneText']}"
        assert "ON-SIDE" not in desktop_state["coverZoneText"]
        assert "ON-SIDE" in desktop_state["midWicketZoneText"], f"Mid Wicket must be ON-SIDE for LHB, got: {desktop_state['midWicketZoneText']}"
        assert "OFF-SIDE" not in desktop_state["midWicketZoneText"]

        # Verify 3D Stadium fielders mirrored for LHB (+X is Right/Off-Side, -X is Left/On-Side)
        if desktop_state["coverFielderX"] is not None:
            assert desktop_state["coverFielderX"] > 0, f"Expected Extra Cover fielder on +X (Right) for LHB, got {desktop_state['coverFielderX']}"
            assert desktop_state["midWicketFielderX"] < 0, f"Expected Mid-Wicket fielder on -X (Left) for LHB, got {desktop_state['midWicketFielderX']}"

        assert_no_critical_errors(console_errors, "test_63_desktop_lhb_rhb")
        await browser.close()


@pytest.mark.asyncio
async def test_63_mobile_apk_lhb_rhb_shot_direction_buttons_and_trajectory():
    screenshots = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 412, "height": 915})
        page = await context.new_page()

        console_errors = []
        page.on("pageerror", lambda err: console_errors.append(str(err)))

        await page.goto(MOBILE_HTML_URI, wait_until="domcontentloaded")
        await page.wait_for_timeout(600)

        # 1. Activate SCORER persona, then score 1 run and confirm to swap strike from Virat K. (RHB) to Rohit S. (LHB).
        await page.evaluate("""() => {
            window.cricosMobileApp.profile.persona = 'SCORER';
            window.cricosMobileApp.openWagonPickerSheet(1);
            window.cricosMobileApp.confirmWagonShot(false);
        }""")
        await page.wait_for_timeout(300)

        # 2. Now Rohit S. (LHB) should be on strike. Open Wagon Picker for a boundary 4.
        await page.evaluate("window.cricosMobileApp.openWagonPickerSheet(4);")
        await page.wait_for_timeout(300)

        cover_check = await page.evaluate("""() => {
            window.cricosMobileApp.selectPickerZone('EXTRA_COVER');
            const ray = document.getElementById('wagonPickerPreviewRay');
            const activeLabel = document.getElementById('wagonPickerActiveZoneLabel')?.textContent?.trim();
            const confirmBtn = document.getElementById('btnConfirmWagonShot')?.textContent?.trim();
            const colLeftText = document.getElementById('wagonPickerColLeft')?.textContent || '';
            const colRightText = document.getElementById('wagonPickerColRight')?.textContent || '';
            const wedgeCover = document.querySelector('#wagonPickerSheet .wagon-sector-wedge[data-zone="EXTRA_COVER"]');
            return {
                strikerName: window.cricosMobileApp.matchState.striker.name,
                currentStance: window.cricosMobileApp.currentStance,
                endX: parseFloat(ray?.getAttribute('data-end-x') || '180'),
                activeLabel,
                confirmBtn,
                colLeftText,
                colRightText,
                wedgeCoverPath: wedgeCover?.getAttribute('d') || '',
                wedgeCoverSide: wedgeCover?.getAttribute('data-side') || ''
            };
        }""")

        assert cover_check["strikerName"] == "Rohit S.", f"Expected Rohit S. on strike after single, got {cover_check}"
        assert cover_check["currentStance"] == "LHB", f"Expected LHB stance for Rohit S., got {cover_check}"

        # Verify Left column is ON-SIDE and Right column is OFF-SIDE for LHB
        assert "ON-SIDE (Left)" in cover_check["colLeftText"], f"Left column should be ON-SIDE for LHB: {cover_check['colLeftText']}"
        assert "Mid Wkt" in cover_check["colLeftText"]
        assert "OFF-SIDE (Right)" in cover_check["colRightText"], f"Right column should be OFF-SIDE for LHB: {cover_check['colRightText']}"
        assert "Cover" in cover_check["colRightText"]

        # Verify Cover (EXTRA_COVER) ball trajectory points to the Right (endX > 180) and is labeled OFF-SIDE
        assert cover_check["endX"] > 180, f"Expected Cover trajectory on Right (endX > 180) for LHB, got endX={cover_check['endX']}"
        assert "OFF-SIDE" in cover_check["activeLabel"], f"Expected Extra Cover (OFF-SIDE), got {cover_check['activeLabel']}"
        assert "OFF-SIDE" in cover_check["confirmBtn"], f"Expected confirm button to show OFF-SIDE, got {cover_check['confirmBtn']}"
        assert cover_check["wedgeCoverSide"] == "OFF"
        assert "342" in cover_check["wedgeCoverPath"] or "294.5" in cover_check["wedgeCoverPath"]

        shot_path = await save_screenshot_async(page, "test_63_mobile_lhb_shot_direction_cover_off_side")
        screenshots.append(shot_path)

        # Now select Mid Wkt (MID_WICKET) and verify ball trajectory points to the Left (endX < 180) and is labeled ON-SIDE
        mid_wicket_check = await page.evaluate("""() => {
            window.cricosMobileApp.selectPickerZone('MID_WICKET');
            const ray = document.getElementById('wagonPickerPreviewRay');
            const activeLabel = document.getElementById('wagonPickerActiveZoneLabel')?.textContent?.trim();
            const confirmBtn = document.getElementById('btnConfirmWagonShot')?.textContent?.trim();
            const wedgeMidWkt = document.querySelector('#wagonPickerSheet .wagon-sector-wedge[data-zone="MID_WICKET"]');
            return {
                endX: parseFloat(ray?.getAttribute('data-end-x') || '180'),
                activeLabel,
                confirmBtn,
                wedgeMidWktPath: wedgeMidWkt?.getAttribute('d') || '',
                wedgeMidWktSide: wedgeMidWkt?.getAttribute('data-side') || ''
            };
        }""")

        assert mid_wicket_check["endX"] < 180, f"Expected Mid Wicket trajectory on Left (endX < 180) for LHB, got endX={mid_wicket_check['endX']}"
        assert "ON-SIDE" in mid_wicket_check["activeLabel"], f"Expected Deep Mid Wicket (ON-SIDE), got {mid_wicket_check['activeLabel']}"
        assert "ON-SIDE" in mid_wicket_check["confirmBtn"], f"Expected confirm button to show ON-SIDE, got {mid_wicket_check['confirmBtn']}"
        assert mid_wicket_check["wedgeMidWktSide"] == "ON"
        assert "18,180" in mid_wicket_check["wedgeMidWktPath"] or "65.5" in mid_wicket_check["wedgeMidWktPath"]

        assert_no_critical_errors(console_errors, "test_63_mobile_apk_lhb_rhb")
        await browser.close()

    catalog_screenshots()
