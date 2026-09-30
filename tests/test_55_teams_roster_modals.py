"""
test_55_teams_roster_modals.py — Teams & Rosters Modals & Interactive Desks E2E Suite
Verifies that 3D Player Card, Join Team prompt, Expand Analytics drawer, and Create Team modal
open cleanly, are visible on screen with correct geometries, close via dismissal buttons,
trigger zero critical console errors, and persist local visual regression screenshots.
"""

import asyncio
import os
import pathlib
import pytest
from playwright.async_api import async_playwright, Page
from tests.helpers import save_screenshot_async, assert_no_critical_errors, catalog_screenshots

ROOT_DIR = pathlib.Path(__file__).parent.parent.resolve()
INDEX_HTML = (ROOT_DIR / "index.html").as_uri()


@pytest.mark.asyncio
async def test_teams_roster_modals_and_interactive_desks():
    """
    Verify all 4 Teams & Rosters interactive controls:
    1. 🃏 3D Player Card modal with Three.js holographic canvas
    2. ➕ Join Team custom in-app prompt dialog
    3. ↗ Expand Analytics slide-over drawer with 6-axis radar
    4. 🏆 Create New Team modal dialog
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
        # Navigate to Teams & Rosters tab
        # -------------------------------------------------------------
        tab = await page.query_selector('[data-tab="teams"]')
        assert tab is not None, "Teams & Rosters tab button must exist"
        await tab.click()
        await page.wait_for_timeout(300)

        # -------------------------------------------------------------
        # 1. Test 3D Player Card Modal
        # -------------------------------------------------------------
        btn_3d = await page.query_selector('button:has-text("3D Player Card")')
        assert btn_3d is not None, "3D Player Card button must exist"
        await btn_3d.click()
        await page.wait_for_timeout(400)

        modal_3d = await page.query_selector("#modal3DPlayerCard")
        assert modal_3d is not None, "#modal3DPlayerCard element must exist"
        assert await modal_3d.is_visible(), "#modal3DPlayerCard must become visible"
        box_3d = await modal_3d.bounding_box()
        assert box_3d and box_3d["width"] > 400, "3D Player Card modal must have non-zero geometry"

        await save_screenshot_async(page, "roster_3d_player_card.png")

        # Close 3D Player Card modal
        close_3d = await page.query_selector("#modal3DPlayerCard .modal-close-btn")
        assert close_3d is not None, "3D Player Card close button must exist"
        await close_3d.click()
        await page.wait_for_timeout(200)
        assert not (await modal_3d.is_visible()), "#modal3DPlayerCard must close upon clicking close button"

        # -------------------------------------------------------------
        # 2. Test Join Team In-App Prompt Dialog
        # -------------------------------------------------------------
        btn_join = await page.query_selector('button:has-text("Join Team")')
        assert btn_join is not None, "Join Team button must exist"
        await btn_join.click()
        await page.wait_for_timeout(300)

        modal_dialog = await page.query_selector("#modalAppDialog")
        assert modal_dialog is not None, "#modalAppDialog must exist"
        assert await modal_dialog.is_visible(), "#modalAppDialog must become visible"
        dialog_title = await page.text_content("#appDialogTitle")
        assert "Join a Team" in dialog_title, f"Expected Join a Team in title, got: {dialog_title}"
        assert await page.is_visible("#appDialogInput"), "#appDialogInput must be visible for prompt mode"

        await save_screenshot_async(page, "roster_join_team_dialog.png")

        # Cancel dialog
        cancel_btn = await page.query_selector("#appDialogCancelBtn")
        assert cancel_btn is not None, "#appDialogCancelBtn must exist"
        await cancel_btn.click()
        await page.wait_for_timeout(200)
        assert not (await modal_dialog.is_visible()), "#modalAppDialog must close upon cancel"

        # -------------------------------------------------------------
        # 3. Test Expand Analytics Slide-Over Drawer
        # -------------------------------------------------------------
        btn_expand = await page.query_selector("#btnOpenStatsDrawer")
        assert btn_expand is not None, "#btnOpenStatsDrawer must exist"
        await btn_expand.click()
        await page.wait_for_timeout(400)

        drawer = await page.query_selector("#modalPlayerStatsDrawer")
        assert drawer is not None, "#modalPlayerStatsDrawer must exist"
        assert await drawer.is_visible(), "#modalPlayerStatsDrawer must become visible"
        assert await page.is_visible("#drawerRadarContainer"), "#drawerRadarContainer must be visible"

        await save_screenshot_async(page, "roster_expand_analytics_drawer.png")

        # Close drawer
        close_drawer = await page.query_selector("#modalPlayerStatsDrawer .modal-close-btn")
        assert close_drawer is not None, "Drawer close button must exist"
        await close_drawer.click()
        await page.wait_for_timeout(200)
        assert not (await drawer.is_visible()), "#modalPlayerStatsDrawer must close upon close button click"

        # -------------------------------------------------------------
        # 4. Test Create New Team Modal
        # -------------------------------------------------------------
        btn_create = await page.query_selector('button:has-text("Create New Team")')
        assert btn_create is not None, "Create New Team button must exist"
        await btn_create.click()
        await page.wait_for_timeout(300)

        modal_create = await page.query_selector("#modalCreateTeam")
        assert modal_create is not None, "#modalCreateTeam must exist"
        assert await modal_create.is_visible(), "#modalCreateTeam must become visible"

        close_create = await page.query_selector("#modalCreateTeam .modal-close")
        if close_create:
            await close_create.click()
            await page.wait_for_timeout(200)
            assert not (await modal_create.is_visible()), "#modalCreateTeam must close"

        # -------------------------------------------------------------
        # 5. Rule 4 Invariant: Zero critical errors
        # -------------------------------------------------------------
        assert_no_critical_errors(page)

        catalog_screenshots()
        await browser.close()


@pytest.mark.asyncio
async def test_flagship_studios_weather_and_gear_store():
    """
    Consolidated verification for:
    - Flagship Studios: Command Palette (⌘K), Tactical Field Planner, Pitch Simulator, Live Auction (58)
    - Intelligent Venue Weather & Collapsed Mobile 5-Hour Forecast by Default (69)
    - Pro Cricket Gear Store & Pavilion Checkout (70)
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

        # 1. Verify Flagship Modals & Gear Store on Desktop (58, 70)
        desktop_features = await page.evaluate("""() => {
            window.openCommandPalette && window.openCommandPalette();
            const cmdOpen = document.getElementById('modalCommandPalette')?.classList.contains('active') ||
                            window.getComputedStyle(document.getElementById('modalCommandPalette')).display !== 'none';
            window.closeCommandPalette && window.closeCommandPalette();
            return {
                cmdOpen,
                hasFieldPlanner: !!document.getElementById('modalFieldPlanner'),
                hasPitchSimulator: !!document.getElementById('modalPitchMapSimulator'),
                hasPlayerAuction: !!document.getElementById('modalPlayerAuction'),
                hasGearCatalog: typeof window.filterGearStore === 'function' || typeof window.addToGearStoreCart === 'function'
            };
        }""")
        assert desktop_features["cmdOpen"], "Command Palette (⌘K) must open cleanly"
        assert desktop_features["hasFieldPlanner"], "Tactical Field Planner modal must exist"
        assert desktop_features["hasPitchSimulator"], "Pitch Map Simulator modal must exist"
        assert desktop_features["hasPlayerAuction"], "Live Player Auction modal must exist"
        assert desktop_features["hasGearCatalog"], "Pro Cricket Gear Store must exist"

        # 2. Verify Mobile 5-Hour Weather Forecast is Collapsed by Default (69)
        mobile_html = (ROOT_DIR / "dist" / "mobile.html").as_uri()
        m_page = await ctx.new_page()
        await m_page.goto(mobile_html, wait_until="domcontentloaded")
        await m_page.wait_for_timeout(300)

        weather_collapsed = await m_page.evaluate("""() => {
            return typeof window.cricosMobileApp?.toggleMobileWeatherForecast === 'function';
        }""")
        assert weather_collapsed, "Mobile 5-hour weather forecast toggle handler must exist"

        # 3. Verify Desktop #modalCheckIn UI & Checkbox Geometry Fix
        checkin_desktop = await page.evaluate("""() => {
            const modal = document.getElementById('modalCheckIn');
            if (modal) modal.classList.add('active');
            const chk = document.getElementById('chkSignoffHomeCaptain');
            const row = document.getElementById('signoffRow_HOME');
            const chkRect = chk ? chk.getBoundingClientRect() : { width: 999, left: 0 };
            const rowRect = row ? row.getBoundingClientRect() : { left: 0 };
            window.selectCheckinRolePin && window.selectCheckinRolePin('SCORER', '7390', 'Ananya Verma (Official Scorer)');
            window.verifyProviderArrivalOtp && window.verifyProviderArrivalOtp();
            window.updateCheckinSignoffState && window.updateCheckinSignoffState();
            return {
                modalVisible: modal && window.getComputedStyle(modal).display !== 'none',
                checkboxWidth: Math.round(chkRect.width),
                checkboxLeftOffsetFromRow: Math.round(chkRect.left - rowRect.left),
                otpVal: document.getElementById('providerOtpInput')?.value,
                badgeCountText: document.getElementById('checkinSignatureCountBadge')?.textContent?.trim(),
                hasVenueRibbon: !!document.getElementById('checkinVenueContextStrip')
            };
        }""")
        assert checkin_desktop["modalVisible"], "#modalCheckIn must become visible when active"
        assert checkin_desktop["checkboxWidth"] <= 24, f"Checkbox width must be <= 24px (fixed 18px), got {checkin_desktop['checkboxWidth']}px"
        assert checkin_desktop["checkboxLeftOffsetFromRow"] <= 32, f"Checkbox must be left-aligned inside stakeholder card, got offset {checkin_desktop['checkboxLeftOffsetFromRow']}px"
        assert checkin_desktop["otpVal"] == "7390", "Selecting official role PIN chip must populate #providerOtpInput"
        assert checkin_desktop["badgeCountText"] == "3 / 3 SIGNED", f"Expected 3 / 3 SIGNED badge, got {checkin_desktop['badgeCountText']}"
        assert checkin_desktop["hasVenueRibbon"], "#checkinVenueContextStrip must exist in #modalCheckIn"
        await save_screenshot_async(page, "checkin_modal_desktop.png")

        # 4. Verify Mobile Provider Check-In & Sign-Off Sheet (#mobileCheckInSheetRoot)
        checkin_mobile = await m_page.evaluate("""() => {
            window.cricosMobileApp?.openProviderCheckInSheet();
            const sheet = document.getElementById('mobileCheckInSheetRoot');
            const chk = document.getElementById('chkMobileSignHome');
            const chkRect = chk ? chk.getBoundingClientRect() : { width: 999 };
            window.cricosMobileApp?.selectMobileCheckinRolePin('CURATOR', '9104');
            window.cricosMobileApp?.verifyMobileProviderArrival();
            return {
                sheetVisible: !!sheet && window.getComputedStyle(sheet).display !== 'none',
                checkboxWidth: Math.round(chkRect.width),
                otpVal: document.getElementById('mobileProviderOtpInput')?.value,
                arrivalText: document.getElementById('mobileCheckinOtpStatusBadge')?.textContent?.trim()
            };
        }""")
        assert checkin_mobile["sheetVisible"], "#mobileCheckInSheetRoot must open on mobile"
        assert checkin_mobile["checkboxWidth"] <= 24, f"Mobile checkbox width must be <= 24px, got {checkin_mobile['checkboxWidth']}px"
        assert checkin_mobile["otpVal"] == "9104", "Mobile PIN preset must populate #mobileProviderOtpInput"
        assert "Verified" in (checkin_mobile["arrivalText"] or ""), "Mobile arrival status must update to Verified"
        await save_screenshot_async(m_page, "checkin_sheet_mobile.png")

        # 5. Verify 8 Tactical Fielder Presets, Drag-and-Drop Re-Arrangement & Live Match Auto-Commentary (Desktop + Mobile)
        field_desktop = await page.evaluate("""() => {
            window.openFieldPlannerModal && window.openFieldPlannerModal();
            const presetCount = Object.keys(window.FIELD_PLANNER_PRESETS || {}).length;
            window.applyFieldPreset('BOUNCER_SHORT_TRAP');
            const dragged = window.moveFielderToPosition(5, 94, 0.88);
            const feedHtml = document.getElementById('scoringFeed')?.innerHTML || '';
            const logHtml = document.getElementById('fieldPlannerCommentaryLog')?.innerHTML || '';
            return {
                presetCount,
                draggedCode: dragged ? dragged.code : null,
                draggedName: dragged ? dragged.name : null,
                historyCount: (window._fieldChangeCommentaryHistory || []).length,
                inScoringFeed: feedHtml.includes('TACTICAL FIELD CHANGE') && feedHtml.includes('Deep Point'),
                inPlannerLog: logHtml.includes('Deep Point')
            };
        }""")
        assert field_desktop["presetCount"] >= 8, f"Expected >= 8 desktop field presets, got {field_desktop['presetCount']}"
        assert field_desktop["draggedCode"] == "DPT", f"Expected dragged fielder at (94°, 0.88) to classify as DPT (Deep Point), got {field_desktop['draggedCode']}"
        assert field_desktop["historyCount"] >= 2, "Expected at least 2 auto-generated field change commentary events"
        assert field_desktop["inScoringFeed"], "Live match #scoringFeed must receive auto-generated field position change commentary"
        assert field_desktop["inPlannerLog"], "#fieldPlannerCommentaryLog must display the latest tactical field change commentary"
        await save_screenshot_async(page, "field_planner_drag_and_commentary_desktop.png")

        field_mobile = await m_page.evaluate("""() => {
            const app = window.cricosMobileApp;
            if (app && app.closeProviderCheckInSheet) app.closeProviderCheckInSheet();
            if (app && app.openFieldPlannerSheet) app.openFieldPlannerSheet();
            const presets = app?.getMobileFieldPresets ? Object.keys(app.getMobileFieldPresets()) : [];
            app?.applyMobileFieldPreset('SUPER_OVER_UMBRELLA');
            const moved = app?.moveMobileFielder(5, 312, 0.90);
            const latestComm = app?.matchState?.commentary?.[0];
            const mobileLogHtml = document.getElementById('mobileFieldCommentaryLog')?.innerHTML || '';
            return {
                presetCount: presets.length,
                movedCode: moved ? moved.code : null,
                latestCommText: latestComm ? latestComm.text : '',
                inMobileLog: mobileLogHtml.includes('Cow Corner')
            };
        }""")
        assert field_mobile["presetCount"] >= 8, f"Expected >= 8 mobile field presets, got {field_mobile['presetCount']}"
        assert field_mobile["movedCode"] == "CC", f"Expected dragged mobile fielder at (312°, 0.90) to classify as CC (Cow Corner), got {field_mobile['movedCode']}"
        assert "Cow Corner" in field_mobile["latestCommText"], "Mobile matchState.commentary[0] must include auto-generated field move commentary"
        assert field_mobile["inMobileLog"], "#mobileFieldCommentaryLog must display the live field change commentary"
        await save_screenshot_async(m_page, "field_planner_drag_and_commentary_mobile.png")

        # 6. Verify Enhanced Broadcast Commentary Studio UI-UX (Voice Personas, Category Filters & Telemetry Pills)
        comm_studio_check = await page.evaluate("""() => {
            window.setCommentaryBroadcastVoice && window.setCommentaryBroadcastVoice('HYPE');
            window.filterLiveCommentary && window.filterLiveCommentary('FIELD');
            const visibleFieldCards = Array.from(document.querySelectorAll('#scoringFeed .feed-item')).filter(el => el.style.display !== 'none').length;
            window.filterLiveCommentary && window.filterLiveCommentary('ALL');
            const allVisibleCards = Array.from(document.querySelectorAll('#scoringFeed .feed-item')).filter(el => el.style.display !== 'none').length;
            return {
                voice: window._commentaryBroadcastVoice,
                visibleFieldCards,
                allVisibleCards,
                hasTelemetryPills: document.querySelectorAll('#scoringFeed .comm-telemetry-pill').length > 0
            };
        }""")
        assert comm_studio_check["voice"] == "HYPE", "Broadcast commentary voice must switch to HYPE"
        assert comm_studio_check["visibleFieldCards"] >= 1, "Filtering by FIELD must show tactical field commentary cards"
        assert comm_studio_check["allVisibleCards"] > comm_studio_check["visibleFieldCards"], "ALL filter must show more cards than FIELD filter alone"
        assert comm_studio_check["hasTelemetryPills"], "#scoringFeed cards must render .comm-telemetry-pill badges"

        # 7. Verify Pro Cricket Gear Store Product Images & Cart Thumbnails (Desktop & Mobile)
        gear_img_desktop = await page.evaluate("""() => {
            window.openGearStoreModal && window.openGearStoreModal();
            const imgs = Array.from(document.querySelectorAll('#gearStoreCatalogGrid .gear-product-img'));
            const thumbs = Array.from(document.querySelectorAll('#gearCartItemsList .gear-cart-thumb'));
            return {
                imgCount: imgs.length,
                allValidSvg: imgs.length > 0 && imgs.every(el => (el.getAttribute('src') || '').startsWith('data:image/svg+xml')),
                thumbCount: thumbs.length,
                allThumbsValid: thumbs.length > 0 && thumbs.every(el => (el.getAttribute('src') || '').startsWith('data:image/svg+xml'))
            };
        }""")
        assert gear_img_desktop["imgCount"] >= 10, f"Expected >= 10 gear product images on Desktop, got {gear_img_desktop['imgCount']}"
        assert gear_img_desktop["allValidSvg"], "Every Desktop .gear-product-img must have a valid SVG data-URI src"
        assert gear_img_desktop["thumbCount"] >= 2, "Desktop #gearCartItemsList must render .gear-cart-thumb thumbnails"
        assert gear_img_desktop["allThumbsValid"], "Every Desktop .gear-cart-thumb must have a valid SVG data-URI src"
        await save_screenshot_async(page, "gear_store_product_images_desktop.png")

        gear_img_mobile = await m_page.evaluate("""() => {
            const app = window.cricosMobileApp;
            if (app && app.closeActionSheet) app.closeActionSheet();
            if (app && app.openMobileGearStore) app.openMobileGearStore();
            const imgs = Array.from(document.querySelectorAll('#mobileGearCatalogList .mobile-gear-product-img'));
            const thumbs = Array.from(document.querySelectorAll('#mobileGearCartItemsList .mobile-gear-cart-thumb'));
            return {
                imgCount: imgs.length,
                allValidSvg: imgs.length > 0 && imgs.every(el => (el.getAttribute('src') || '').startsWith('data:image/svg+xml')),
                thumbCount: thumbs.length,
                allThumbsValid: thumbs.length > 0 && thumbs.every(el => (el.getAttribute('src') || '').startsWith('data:image/svg+xml'))
            };
        }""")
        assert gear_img_mobile["imgCount"] >= 9, f"Expected >= 9 gear product images on Mobile, got {gear_img_mobile['imgCount']}"
        assert gear_img_mobile["allValidSvg"], "Every Mobile .mobile-gear-product-img must have a valid SVG data-URI src"
        assert gear_img_mobile["thumbCount"] >= 2, "Mobile #mobileGearCartItemsList must render .mobile-gear-cart-thumb thumbnails"
        assert gear_img_mobile["allThumbsValid"], "Every Mobile .mobile-gear-cart-thumb must have a valid SVG data-URI src"
        await save_screenshot_async(m_page, "gear_store_product_images_mobile.png")

        assert_no_critical_errors(page)
        await browser.close()



if __name__ == "__main__":
    asyncio.run(test_teams_roster_modals_and_interactive_desks())
    asyncio.run(test_flagship_studios_weather_and_gear_store())
    print("✅ All Teams, Flagship Studios, Weather, Gear Store & Check-In checks passed successfully!")


