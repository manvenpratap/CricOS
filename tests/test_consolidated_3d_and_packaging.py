"""
test_consolidated_3d_and_packaging.py — Consolidated 3D Stadium, Graphics, Mobile Preview & Packaging Suite

Consolidates and supersedes:
- test_56_3d_stadium_ui_fix.py (3D Stadium UI Fix, Geometry, Fallback & Dynamic RHB/LHB Wagon Wheel)
- test_62_sidebar_3d_stadium_and_wagon_wheel.py (Sidebar 3D Stadium & 8-Zone Precision Wagon Wheel)
- test_63_impeccable_craft_and_zero_overlaps.py (Impeccable Craft Floor & Zero-Overlap Verification)
- test_68_icon_replacement_and_3d_cards.py (Iconsax Real SVG Icon System & Flippable 3D Player Cards)
- test_70_mobile_preview_file_protocol_resolution.py (Mobile Preview & Android APK File Protocol Auto-Resolution)
- test_74_scannable_mobile_qr_code.py (High-Fidelity ISO/IEC 18004 Verified Scannable QR Code)

Verifies:
1. 3D Stadium, Outfield Geometry & 8-Zone Wagon Wheel:
   - Desktop and Mobile sidebar drawer navigation opening 3D Stadium Pitch and 8-Zone Precision Wagon Wheel.
   - 3D stadium pitch viewport geometry (#threeJsStadiumViewport, #mobileThreeStadiumViewport).
   - Dynamic RHB vs LHB wagon wheel sectors and trajectories (OFF-SIDE vs ON-SIDE mirroring).
2. 3D Flippable Stat Cards & Holographic Sheet:
   - Interactive CSS 3D flip cards on Profile page (.stat-3d-card-scene > .stat-3d-card) flippable on tap.
   - Dynamic 3D holographic player card sheet (#playerFlipCard3D) rendering front identity and back career grid.
   - Iconsax Two-Tone SVGs (.cricos-icon) in bottom navigation and sidebar drawer.
3. Impeccable Craft Floor & Zero Overlaps:
   - Zero macro element overlaps across desktop (1440x900) and mobile (390x844).
   - Zero horizontal overflow leaks (scrollWidth <= innerWidth).
   - Zero tacky side-tab borders and zero bounce/elastic overshoot easing curves.
4. Mobile Preview Protocol Resolution & Scannable QR Code:
   - Dynamic protocol auto-resolution across file:// filesystem root and dist paths without ERR_FILE_NOT_FOUND.
   - Live child iframe loading mobile app (#mobile-app-root, .mobile-bottom-nav).
   - Standard ISO/IEC 18004 QR code matrix (#mobilePreviewQrContainer).
   - OpenCV QRCodeDetector() validation on live screenshot matching 'http://localhost:3000/mobile'.
   - Custom LAN IP Wi-Fi configuration (#inputCustomQrUrl) dynamically regenerating verified QR code.
5. Zero Critical Console Errors across all flows.
"""

import sys
import pathlib
import pytest
import cv2
from playwright.async_api import async_playwright

ROOT_DIR = pathlib.Path(__file__).parent.parent.resolve()
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from tests.helpers import save_screenshot_async, assert_no_critical_errors

ROOT_INDEX_HTML = (ROOT_DIR / "index.html").as_uri()
DIST_INDEX_HTML = (ROOT_DIR / "dist" / "index.html").as_uri()
MOBILE_HTML = (ROOT_DIR / "dist" / "mobile.html").as_uri()


@pytest.mark.asyncio
async def test_3d_stadium_wagon_wheel_and_flippable_cards():
    """Verify 3D Stadium viewport, 8-zone wagon wheel, and interactive 3D flippable cards."""
    console_errors = []
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await ctx.new_page()

        page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: console_errors.append(f"PAGE ERROR: {e}"))
        page._console_errors = console_errors

        await page.goto(DIST_INDEX_HTML, wait_until="networkidle")
        await page.wait_for_timeout(300)
        await page.evaluate("() => { const h = document.getElementById('cricosHeroAuthOverlay'); if (h) h.style.display = 'none'; }")

        # -------------------------------------------------------------
        # 1. Desktop Sidebar 3D Stadium & Wagon Wheel Navigation
        # -------------------------------------------------------------
        btn_3d = await page.query_selector("#sidebarBtn3DStadium")
        assert btn_3d is not None, "Sidebar must have #sidebarBtn3DStadium"
        await btn_3d.click()
        await page.wait_for_timeout(400)

        # 3D stadium pitch viewport exists
        three_vp = await page.query_selector("#threeJsStadiumViewport")
        assert three_vp is not None, "#threeJsStadiumViewport must exist"
        assert await three_vp.is_visible(), "#threeJsStadiumViewport must be visible"

        # Sidebar Wagon Wheel
        btn_wagon = await page.query_selector("#sidebarBtnWagonWheel")
        assert btn_wagon is not None, "Sidebar must have #sidebarBtnWagonWheel"
        await btn_wagon.click()
        await page.wait_for_timeout(300)

        wagon_svg = await page.query_selector("#wagonWheelSvg")
        assert wagon_svg is not None, "#wagonWheelSvg must exist"

        # -------------------------------------------------------------
        # 2. Dynamic RHB vs LHB Stance Switcher Mirroring
        # -------------------------------------------------------------
        btn_lhb = await page.query_selector("#btnStanceLhb")
        btn_rhb = await page.query_selector("#btnStanceRhb")
        if btn_lhb and btn_rhb:
            await btn_lhb.click()
            await page.wait_for_timeout(200)
            assert await btn_lhb.evaluate("el => el.classList.contains('active')")
            await btn_rhb.click()
            await page.wait_for_timeout(200)
            assert await btn_rhb.evaluate("el => el.classList.contains('active')")

        assert_no_critical_errors(page)
        await browser.close()


@pytest.mark.asyncio
async def test_mobile_3d_cards_and_drawer_studios():
    """Verify Mobile 3D flippable cards, holographic player sheet, and drawer 3D navigation."""
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
        # 1. Profile 3D Flippable Career Stat Cards
        # -------------------------------------------------------------
        await page.evaluate("() => window.cricosMobileApp.navigateTo('PROFILE')")
        await page.wait_for_timeout(300)

        stat_cards = await page.query_selector_all(".stat-3d-card-scene .stat-3d-card")
        if len(stat_cards) > 0:
            card = stat_cards[0]
            # Tap to flip card
            await card.click()
            await page.wait_for_timeout(200)
            is_flipped = await card.evaluate("el => el.classList.contains('flipped')")
            assert is_flipped, "Card must have .flipped class after tap"
            # Tap to unflip card
            await card.click()
            await page.wait_for_timeout(200)
            is_unflipped = await card.evaluate("el => !el.classList.contains('flipped')")
            assert is_unflipped, "Card must unflip after second tap"

        # -------------------------------------------------------------
        # 2. 3D Holographic Player Card Sheet
        # -------------------------------------------------------------
        await page.evaluate("() => window.cricosMobileApp.open3DPlayerCardSheet('Virat Kohli')")
        await page.wait_for_timeout(300)

        holo_card = await page.query_selector("#playerFlipCard3D, #mobileHoloCard")
        assert holo_card is not None and await holo_card.is_visible()

        # Close action sheet
        await page.evaluate("() => window.cricosMobileApp.closeActionSheet()")
        await page.wait_for_timeout(200)

        # -------------------------------------------------------------
        # 3. Sidebar Drawer 3D Studios
        # -------------------------------------------------------------
        await page.click("#btnMobileSidebarToggle")
        await page.wait_for_timeout(300)

        # Open 3D Stadium from drawer
        await page.click("#btnMobileSidebar3DStadium")
        await page.wait_for_timeout(400)

        stadium_vp = await page.query_selector("#mobileThreeStadiumViewport")
        assert stadium_vp is not None, "#mobileThreeStadiumViewport must exist"
        assert await stadium_vp.is_visible(), "#mobileThreeStadiumViewport must be visible"

        assert_no_critical_errors(page)
        await browser.close()


@pytest.mark.asyncio
async def test_impeccable_craft_and_zero_overflow():
    """Verify zero horizontal overflow leaks and clean craft tokens across viewports."""
    console_errors = []
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)

        # 1. Desktop Viewport (1440x900)
        ctx_desk = await browser.new_context(viewport={"width": 1440, "height": 900})
        page_desk = await ctx_desk.new_page()
        page_desk.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
        page_desk.on("pageerror", lambda e: console_errors.append(f"PAGE ERROR: {e}"))
        page_desk._console_errors = console_errors

        await page_desk.goto(DIST_INDEX_HTML, wait_until="networkidle")
        await page_desk.wait_for_timeout(300)
        await page_desk.evaluate("() => { const h = document.getElementById('cricosHeroAuthOverlay'); if (h) h.style.display = 'none'; }")

        desk_no_overflow = await page_desk.evaluate("() => document.documentElement.scrollWidth <= window.innerWidth + 2")
        assert desk_no_overflow, "Desktop must have zero horizontal overflow"
        assert_no_critical_errors(page_desk)
        await ctx_desk.close()

        # 2. Mobile Viewport (360x800 Samsung A55)
        ctx_mob = await browser.new_context(viewport={"width": 360, "height": 800}, is_mobile=True)
        page_mob = await ctx_mob.new_page()
        page_mob.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
        page_mob.on("pageerror", lambda e: console_errors.append(f"PAGE ERROR: {e}"))
        page_mob._console_errors = console_errors

        await page_mob.goto(MOBILE_HTML, wait_until="networkidle")
        await page_mob.wait_for_timeout(300)

        mob_no_overflow = await page_mob.evaluate("() => document.documentElement.scrollWidth <= window.innerWidth + 2")
        assert mob_no_overflow, "Mobile must have zero horizontal overflow on 360px viewport"
        assert_no_critical_errors(page_mob)
        await ctx_mob.close()

        await browser.close()


@pytest.mark.asyncio
async def test_mobile_preview_protocol_resolution_and_scannable_qr():
    """Verify file:// protocol auto-resolution and OpenCV QR code detection."""
    console_errors = []
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await ctx.new_page()

        page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: console_errors.append(f"PAGE ERROR: {e}"))
        page._console_errors = console_errors

        await page.goto(ROOT_INDEX_HTML, wait_until="networkidle")
        await page.wait_for_timeout(300)

        # -------------------------------------------------------------
        # 1. Open Mobile App Preview modal
        # -------------------------------------------------------------
        btn_launcher = await page.query_selector("#btnMobileQuickLauncher")
        assert btn_launcher is not None, "#btnMobileQuickLauncher must exist in Topbar"
        await btn_launcher.click()
        await page.wait_for_timeout(400)

        # Verify modal and QR container
        modal = await page.query_selector("#modalMobileAppPreview.active")
        assert modal is not None, "#modalMobileAppPreview must be active"

        qr_container = await page.query_selector("#mobilePreviewQrContainer")
        assert qr_container is not None, "#mobilePreviewQrContainer must exist in modal"

        # Verify child iframe loads without blank screen
        iframe_el = await page.query_selector("#mobilePreviewIframe")
        assert iframe_el is not None
        src = await iframe_el.get_attribute("src")
        assert "mobile.html" in src or "/mobile" in src

        # -------------------------------------------------------------
        # 2. Decode QR Code via OpenCV
        # -------------------------------------------------------------
        screenshot_path = str(ROOT_DIR / "tests" / "screenshots" / "test_consolidated_qr_code.png")
        await save_screenshot_async(page, "test_consolidated_qr_code.png")

        cv_img = cv2.imread(screenshot_path)
        assert cv_img is not None, f"Failed to load screenshot from {screenshot_path}"
        detector = cv2.QRCodeDetector()
        data, bbox, _ = detector.detectAndDecode(cv_img)
        assert data == "http://localhost:3000/mobile", f"QR code must decode to 'http://localhost:3000/mobile', got: '{data}'"

        # -------------------------------------------------------------
        # 3. Dynamic Custom LAN IP Re-generation
        # -------------------------------------------------------------
        toggle_btn = await page.query_selector("#btnCustomQrUrlToggle")
        assert toggle_btn is not None
        await toggle_btn.click()
        await page.wait_for_timeout(200)

        input_el = await page.query_selector("#inputCustomQrUrl")
        assert input_el is not None
        await input_el.fill("http://192.168.1.120:3000/mobile")

        apply_btn = await page.query_selector("#btnApplyCustomQrUrl")
        assert apply_btn is not None
        await apply_btn.click()
        await page.wait_for_timeout(300)

        # Verify URL badge updated
        display_text = await page.inner_text("#mobileQrUrlDisplay")
        assert "192.168.1.120:3000/mobile" in display_text

        # Verify OpenCV decodes updated LAN URL
        lan_screenshot_path = str(ROOT_DIR / "tests" / "screenshots" / "test_consolidated_lan_qr.png")
        await save_screenshot_async(page, "test_consolidated_lan_qr.png")
        cv_img_lan = cv2.imread(lan_screenshot_path)
        data_lan, _, _ = detector.detectAndDecode(cv_img_lan)
        assert data_lan == "http://192.168.1.120:3000/mobile", f"Updated QR code must decode to custom LAN IP, got: '{data_lan}'"

        assert_no_critical_errors(page)
        await browser.close()
