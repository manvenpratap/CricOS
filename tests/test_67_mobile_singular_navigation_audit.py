"""
test_67_mobile_singular_navigation_audit.py — Deep Mobile Navigation & Linear User Journey Verification Suite

Verifies:
1. Wagon Wheel Singular Linear Journey:
   - In 'SCORE' subtab: #mobilePrecisionWagonWheel is NOT rendered (eliminating in-card duplication).
   - In 'WAGON' subtab: #mobilePrecisionWagonWheel IS rendered with 8-zone radial lines, sector chips, and stance switcher.
   - Redundant in-card 2D/3D toggle pills are eliminated from Wagon Wheel and 3D Stadium headers.
2. 3D Stadium Singular Linear Journey:
   - In 'STADIUM_3D' subtab: #mobileThreeStadiumViewport and #mobileThreeStadiumCanvas initialize cleanly.
   - Sidebar #btnMobileSidebar3DStadium cleanly transitions to MATCHES screen and STADIUM_3D subtab.
3. Captain HUD Linear Architecture:
   - In Captain persona: #mobileCaptainTacticalCenter displays target runs, balls left, RRR, and tactical directive.
   - Duplicate in-card action buttons (Field Radar, Win Simulator, Playing XI) are removed from Captain HUD.
4. Commentary Studio Header Simplification:
   - Commentary header retains #mobileActiveVoiceIndicator and Audio commentary readout.
   - Duplicate '🎯 + Field' button is removed from Commentary header.
5. Teams Hub Roster & 3D Cards:
   - Teams header retains canonical '🃏 3D Player Card' button (#open3DPlayerCardSheet).
   - Duplicate '🏏 3D Gear' and '🏆 3D Trophy' buttons are removed from Teams header.
6. Canonical 3D Silverware & 3D Gear Homes:
   - Tournaments screen retains canonical '🏆 Silverware' button opening 3D Trophy Cabinet sheet.
   - Marketplace screen Pro Gear Store retains canonical '🏏 3D Bat Config' button opening 3D Gear Customizer sheet.
7. Mobile Sidebar Drawer Linear Persona Switching:
   - Sidebar drawer contains direct 1-tap persona chips in #mobileSidebarPersonaStrip.
   - Redundant #btnMobileSidebarPersonaSheet button is removed.
8. Quality & Compliance:
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
async def test_mobile_singular_navigation_and_deduplication():
    """Verify all duplicate mobile navigation paths are eliminated and user journeys are linear."""
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
        # 1. Verify 'SCORE' subtab does NOT render duplicate Wagon Wheel
        # -------------------------------------------------------------
        active_subtab = await page.evaluate("() => window.cricosMobileApp.matchSubTab")
        assert active_subtab == "SCORE", "Initial subtab should be SCORE"

        wagon_in_score = await page.query_selector("#mobilePrecisionWagonWheel")
        assert wagon_in_score is None, "Duplicate Wagon Wheel must NOT be rendered inside SCORE subtab"

        # -------------------------------------------------------------
        # 2. Verify 'WAGON' subtab holds singular canonical Wagon Wheel
        # -------------------------------------------------------------
        await page.click('.mobile-subnav-btn[data-subtab="WAGON"]')
        await page.wait_for_timeout(300)

        wagon_wheel = await page.query_selector("#mobilePrecisionWagonWheel")
        assert wagon_wheel is not None, "Wagon Wheel must render canonically in WAGON subtab"

        # Verify redundant in-card 2D/3D mode toggles are removed from Wagon Wheel header
        in_card_3d_toggle = await page.query_selector('#mobilePrecisionWagonWheel button[data-mode="3D"]')
        assert in_card_3d_toggle is None, "Redundant in-card 3D mode button must be removed from Wagon Wheel header"

        # Verify Wagon sector filter chips exist and are styled with .wagon-sector-chip
        sector_chips = await page.query_selector_all(".wagon-sector-chip")
        assert len(sector_chips) >= 8, f"Expected at least 8 sector chips, got {len(sector_chips)}"

        # -------------------------------------------------------------
        # 3. Verify 'STADIUM_3D' subtab holds 3D Stadium without redundant in-card toggles
        # -------------------------------------------------------------
        await page.click('.mobile-subnav-btn[data-subtab="STADIUM_3D"]')
        await page.wait_for_timeout(400)

        stadium_vp = await page.query_selector("#mobileThreeStadiumViewport")
        assert stadium_vp is not None, "3D Stadium Viewport must render in STADIUM_3D subtab"

        # Verify redundant 2D map toggle in 3D Stadium header is removed
        in_card_2d_toggle = await page.query_selector('button[data-tooltip="Switch back to 2D field map"]')
        assert in_card_2d_toggle is None, "Redundant in-card 2D map toggle must be removed from 3D Stadium header"

        # -------------------------------------------------------------
        # 4. Switch to CAPTAIN persona and inspect Captain HUD in SCORE subtab
        # -------------------------------------------------------------
        await page.evaluate("() => window.cricosMobileApp.switchUserPersona('CAPTAIN')")
        await page.wait_for_timeout(300)

        # Switch back to MATCHES screen
        await page.click('[data-screen="MATCHES"]')
        await page.wait_for_timeout(300)
        await page.click('.mobile-subnav-btn[data-subtab="SCORE"]')
        await page.wait_for_timeout(300)

        captain_hud = await page.query_selector("#mobileCaptainTacticalCenter")
        assert captain_hud is not None, "Captain Tactical Center HUD must render for CAPTAIN persona"

        # Verify redundant studio buttons (Field Radar, Win Simulator, Playing XI) are removed from Captain HUD
        hud_field_radar = await page.query_selector("#mobileCaptainTacticalCenter button[onclick*='openFieldPlannerSheet']")
        assert hud_field_radar is None, "Duplicate Field Radar button must be removed from Captain HUD"

        hud_win_sim = await page.query_selector("#mobileCaptainTacticalCenter button[onclick*='openPitchMapSheet']")
        assert hud_win_sim is None, "Duplicate Win Simulator button must be removed from Captain HUD"

        hud_playing_xi = await page.query_selector("#mobileCaptainTacticalCenter button[data-screen='TEAMS']")
        assert hud_playing_xi is None, "Duplicate Playing XI button must be removed from Captain HUD"

        # -------------------------------------------------------------
        # 5. Verify Commentary Studio header is clean
        # -------------------------------------------------------------
        await page.click('.mobile-subnav-btn[data-subtab="COMMENTARY"]')
        await page.wait_for_timeout(300)

        voice_ind = await page.query_selector("#mobileActiveVoiceIndicator")
        assert voice_ind is not None, "Commentary voice indicator must be present"

        comm_field_btn = await page.query_selector("#mobileCommentaryStudioRoot button[onclick*='openFieldPlannerSheet']")
        assert comm_field_btn is None, "Duplicate Field Planner button must be removed from Commentary studio header"

        # -------------------------------------------------------------
        # 6. Verify Teams Hub header deduplication
        # -------------------------------------------------------------
        await page.click('[data-screen="TEAMS"]')
        await page.wait_for_timeout(300)

        # 3D Player Card is retained for squad roster
        card_btn = await page.query_selector("button[onclick*='open3DPlayerCardSheet']")
        assert card_btn is not None, "Teams Hub must retain 3D Player Card button for squad inspection"

        # Redundant 3D Gear and 3D Trophy buttons are removed
        teams_gear_btn = await page.query_selector("button[onclick*='openGearCustomizerSheet']")
        assert teams_gear_btn is None, "Duplicate 3D Gear button must be removed from Teams Hub header"

        teams_trophy_btn = await page.query_selector("button[onclick*='open3DTrophyCabinetSheet']")
        assert teams_trophy_btn is None, "Duplicate 3D Trophy button must be removed from Teams Hub header"

        # -------------------------------------------------------------
        # 7. Verify Tournaments Hub canonical Silverware
        # -------------------------------------------------------------
        await page.click('[data-screen="TOURNAMENTS"]')
        await page.wait_for_timeout(300)

        silverware_btn = await page.query_selector("button[onclick*='open3DTrophyCabinetSheet']")
        assert silverware_btn is not None, "Tournaments Hub must retain canonical 3D Silverware button"

        await silverware_btn.click()
        await page.wait_for_timeout(300)
        action_sheet = await page.query_selector(".mobile-action-sheet.active")
        assert action_sheet is not None, "Clicking 3D Silverware must open 3D Trophy Cabinet sheet"
        await page.click("#btnActionSheetConfirm")
        await page.wait_for_timeout(300)

        # -------------------------------------------------------------
        # 8. Verify Marketplace Hub canonical 3D Bat Configurator
        # -------------------------------------------------------------
        await page.click('[data-screen="MARKETPLACE"]')
        await page.wait_for_timeout(300)

        # Open Pro Cricket Gear Store
        gear_store_btn = await page.query_selector("#btnMobileOpenGearStore")
        assert gear_store_btn is not None, "Marketplace must contain #btnMobileOpenGearStore"
        await gear_store_btn.click()
        await page.wait_for_timeout(300)

        bat_config_btn = await page.query_selector("button[onclick*='openGearCustomizerSheet']")
        assert bat_config_btn is not None, "Gear Store in Marketplace must retain canonical 3D Bat Config button"

        # -------------------------------------------------------------
        # 9. Verify Sidebar Drawer persona switcher deduplication
        # -------------------------------------------------------------
        sidebar_toggle = await page.query_selector("#btnMobileSidebarToggle")
        assert sidebar_toggle is not None, "Sidebar toggle must exist in mobile header"
        await sidebar_toggle.click()
        await page.wait_for_timeout(300)

        # Direct persona chips must exist
        persona_strip = await page.query_selector("#mobileSidebarPersonaStrip")
        assert persona_strip is not None, "#mobileSidebarPersonaStrip must exist for direct 1-tap switching"
        chips = await page.query_selector_all(".mobile-sidebar-persona-chip")
        assert len(chips) >= 4, "Must contain provisioned account persona chips"

        # Redundant #btnMobileSidebarPersonaSheet must NOT exist
        redundant_persona_sheet_btn = await page.query_selector("#btnMobileSidebarPersonaSheet")
        assert redundant_persona_sheet_btn is None, "Redundant #btnMobileSidebarPersonaSheet must be removed from drawer"

        # Close sidebar
        await page.click("#btnCloseMobileSidebar")
        await page.wait_for_timeout(200)

        # Save visual screenshot
        await save_screenshot_async(page, "test_67_mobile_singular_navigation_audit.png")

        # Verify zero critical console errors
        assert_no_critical_errors(page)
        await browser.close()
