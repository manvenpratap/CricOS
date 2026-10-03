"""
test_70_mobile_preview_file_protocol_resolution.py — Mobile Preview & Android APK File Protocol Auto-Resolution E2E Suite

Verifies:
1. Root index.html File Protocol Auto-Resolution:
   - Opened via file:// protocol (double-clicked / Finder filesystem navigation).
   - getMobileAppUrl() automatically resolves to 'dist/mobile.html'.
   - getApkDownloadUrl() automatically resolves to 'dist/cricos-debug.apk'.
   - Opening #modalMobileAppPreview loads the child iframe without ERR_FILE_NOT_FOUND or blank screen.
   - Child frame title is 'CricOS — Consumer Mobile App (iOS & Android)'.
   - Child frame contains live mobile application elements (#mobileAppContainer, .mobile-bottom-nav).
   - Fullscreen link (#btnMobileFullscreenLink) and standalone launcher resolve valid target.
   - APK download links (#linkMobileApkDownloadPill, #btnMobileApkDownloadFooter) point to dist/cricos-debug.apk.
2. Distribution dist/index.html File Protocol Auto-Resolution:
   - Opened via file:// protocol from within dist/ folder.
   - getMobileAppUrl() automatically resolves to 'mobile.html'.
   - getApkDownloadUrl() automatically resolves to 'cricos-debug.apk'.
   - Opening #modalMobileAppPreview loads the child iframe without ERR_FILE_NOT_FOUND or blank screen.
   - Child frame loads mobile.html directly beside dist/index.html.
   - APK download links point to cricos-debug.apk.
3. Zero Critical Console Errors (Rule 4).
4. Local screenshots saved to tests/screenshots/.
"""

import sys
import pathlib
import pytest

ROOT_DIR = pathlib.Path(__file__).parent.parent.resolve()
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from playwright.async_api import async_playwright
from tests.helpers import save_screenshot_async, assert_no_critical_errors

ROOT_INDEX_HTML = (ROOT_DIR / "index.html").as_uri()
DIST_INDEX_HTML = (ROOT_DIR / "dist" / "index.html").as_uri()


@pytest.mark.asyncio
async def test_root_index_mobile_preview_resolution():
    """Verify root index.html under file:// protocol resolves mobile preview and APK links cleanly."""
    console_errors = []
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await ctx.new_page()

        page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: console_errors.append(f"PAGE ERROR: {e}"))
        page._console_errors = console_errors

        await page.goto(ROOT_INDEX_HTML, wait_until="networkidle")
        await page.wait_for_timeout(400)

        # 1. Verify getMobileAppUrl() and getApkDownloadUrl() resolution logic
        mobile_url = await page.evaluate("getMobileAppUrl()")
        apk_url = await page.evaluate("getApkDownloadUrl()")
        assert mobile_url == "dist/mobile.html", f"Expected dist/mobile.html under root file://, got: {mobile_url}"
        assert apk_url == "dist/cricos-debug.apk", f"Expected dist/cricos-debug.apk under root file://, got: {apk_url}"

        # 2. Click canonical Topbar Mobile Launcher to open modal
        btn_launcher = await page.query_selector("#btnMobileQuickLauncher")
        assert btn_launcher is not None, "#btnMobileQuickLauncher must exist in Topbar"
        await btn_launcher.click()
        await page.wait_for_timeout(600)

        # 3. Verify modal is active
        modal = await page.query_selector("#modalMobileAppPreview.active")
        assert modal is not None, "#modalMobileAppPreview must be active"

        # 4. Verify iframe element exists and has resolved src
        iframe_el = await page.query_selector("#mobilePreviewIframe")
        assert iframe_el is not None, "#mobilePreviewIframe must exist"
        iframe_src = await iframe_el.get_attribute("src")
        assert iframe_src and "mobile.html" in iframe_src, f"iframe src must resolve to mobile.html, got: {iframe_src}"

        # 5. Verify child frame loaded successfully without ERR_FILE_NOT_FOUND
        child_frame = None
        for frame in page.frames:
            if frame != page.main_frame and "mobile.html" in frame.url:
                child_frame = frame
                break

        assert child_frame is not None, "Child frame for mobile.html must be present in page.frames"
        child_title = await child_frame.title()
        assert child_title == "CricOS — Consumer Mobile App (iOS & Android)", f"Unexpected child frame title: {child_title}"

        # Verify child frame DOM elements
        container = await child_frame.query_selector("#mobile-app-root")
        assert container is not None, "Child frame must contain #mobile-app-root"
        bottom_nav = await child_frame.query_selector(".mobile-bottom-nav")
        assert bottom_nav is not None, "Child frame must contain .mobile-bottom-nav"

        # 6. Verify Fullscreen and Standalone links
        fullscreen_link = await page.query_selector("#btnMobileFullscreenLink")
        assert fullscreen_link is not None, "#btnMobileFullscreenLink must exist"
        fullscreen_href = await fullscreen_link.get_attribute("href")
        assert fullscreen_href and "mobile.html" in fullscreen_href, f"Fullscreen link must point to mobile.html, got: {fullscreen_href}"

        # 7. Verify APK download links
        pill_apk = await page.query_selector("#linkMobileApkDownloadPill")
        assert pill_apk is not None, "#linkMobileApkDownloadPill must exist"
        pill_href = await pill_apk.get_attribute("href")
        assert pill_href == "dist/cricos-debug.apk", f"Expected dist/cricos-debug.apk, got: {pill_href}"

        footer_apk = await page.query_selector("#btnMobileApkDownloadFooter")
        assert footer_apk is not None, "#btnMobileApkDownloadFooter must exist"
        footer_href = await footer_apk.get_attribute("href")
        assert footer_href == "dist/cricos-debug.apk", f"Expected dist/cricos-debug.apk, got: {footer_href}"

        # Save screenshot
        await save_screenshot_async(page, "test_70_root_mobile_preview_modal.png")
        assert_no_critical_errors(page)
        await browser.close()


@pytest.mark.asyncio
async def test_dist_index_mobile_preview_resolution():
    """Verify dist/index.html under file:// protocol resolves mobile.html and cricos-debug.apk cleanly."""
    console_errors = []
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await ctx.new_page()

        page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: console_errors.append(f"PAGE ERROR: {e}"))
        page._console_errors = console_errors

        await page.goto(DIST_INDEX_HTML, wait_until="networkidle")
        await page.wait_for_timeout(400)

        # 1. Verify getMobileAppUrl() and getApkDownloadUrl() resolution logic inside dist/
        mobile_url = await page.evaluate("getMobileAppUrl()")
        apk_url = await page.evaluate("getApkDownloadUrl()")
        assert mobile_url == "mobile.html", f"Expected mobile.html under dist/ file://, got: {mobile_url}"
        assert apk_url == "cricos-debug.apk", f"Expected cricos-debug.apk under dist/ file://, got: {apk_url}"

        # 2. Open mobile preview modal
        await page.evaluate("openMobilePreviewModal()")
        await page.wait_for_timeout(600)

        # 3. Verify modal is active
        modal = await page.query_selector("#modalMobileAppPreview.active")
        assert modal is not None, "#modalMobileAppPreview must be active"

        # 4. Verify iframe element exists and has resolved src
        iframe_el = await page.query_selector("#mobilePreviewIframe")
        assert iframe_el is not None, "#mobilePreviewIframe must exist"
        iframe_src = await iframe_el.get_attribute("src")
        assert iframe_src and "mobile.html" in iframe_src, f"iframe src must resolve to mobile.html, got: {iframe_src}"

        # 5. Verify child frame loaded successfully
        child_frame = None
        for frame in page.frames:
            if frame != page.main_frame and "mobile.html" in frame.url:
                child_frame = frame
                break

        assert child_frame is not None, "Child frame for mobile.html must be present in page.frames"
        child_title = await child_frame.title()
        assert child_title == "CricOS — Consumer Mobile App (iOS & Android)", f"Unexpected child frame title: {child_title}"

        # 6. Verify Fullscreen link
        fullscreen_link = await page.query_selector("#btnMobileFullscreenLink")
        assert fullscreen_link is not None, "#btnMobileFullscreenLink must exist"
        fullscreen_href = await fullscreen_link.get_attribute("href")
        assert fullscreen_href == "mobile.html", f"Fullscreen link in dist must point to mobile.html, got: {fullscreen_href}"

        # 7. Verify APK download links
        pill_apk = await page.query_selector("#linkMobileApkDownloadPill")
        assert pill_apk is not None, "#linkMobileApkDownloadPill must exist"
        pill_href = await pill_apk.get_attribute("href")
        assert pill_href == "cricos-debug.apk", f"Expected cricos-debug.apk, got: {pill_href}"

        footer_apk = await page.query_selector("#btnMobileApkDownloadFooter")
        assert footer_apk is not None, "#btnMobileApkDownloadFooter must exist"
        footer_href = await footer_apk.get_attribute("href")
        assert footer_href == "cricos-debug.apk", f"Expected cricos-debug.apk, got: {footer_href}"

        # Save screenshot
        await save_screenshot_async(page, "test_70_dist_mobile_preview_modal.png")
        assert_no_critical_errors(page)
        await browser.close()
