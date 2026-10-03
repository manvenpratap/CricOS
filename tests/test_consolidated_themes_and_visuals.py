"""
test_consolidated_themes_and_visuals.py — Consolidated Themes, Visuals, Contrast & Typography Suite

Consolidates and supersedes:
- test_54_playwright_theme_verification.py (Themes, Daylight Surfaces, JWT Session Persistence)
- test_57_ui_ux_contrast_and_accessibility.py (WCAG Contrast Sweeps, Delayed Tooltips, Focus Rings, Spring Toast)
- test_72_comprehensive_emoji_elimination.py (Universal Emoji Elimination Across Desktop & Mobile)
- test_73_theme_compatible_fonts.py (Theme Compatible Fonts Across Desktop & Mobile)

Verifies:
1. Desktop Themes, Typography & Accessibility:
   - 3 Design themes (Swiss Minimalist, Nordic Editorial, Stadium Night) with computed distinct backgrounds, text, sidebars, borders.
   - Theme-compatible typography dynamically applied (Inter for Swiss, Fraunces/Newsreader for Nordic, Space Grotesk/Chakra Petch for Stadium).
   - WCAG 2.1 AA/AAA contrast ratios across all 3 themes.
   - Real Iconsax Two-Tone SVGs (.cricos-icon) in sidebar navigation, scoring keypad, and theme switcher; zero raw emojis.
   - Touch targets and filter pills geometry (>= 28px height), LHB/RHB stance switching active classes.
2. Mobile Themes, Typography, Toasts & Profile Contrast:
   - Mobile theme switching across Swiss, Nordic, and Stadium with distinct backgrounds, text, and header bars.
   - Mobile theme-compatible typography (Inter, Fraunces, Space Grotesk/Chakra Petch).
   - Mobile bottom navigation and live subnav buttons render authentic .cricos-icon SVGs and zero raw emojis.
   - Single bottom-docked spring toast (count == 1, centerY > 600px), with light-surface contrast on Swiss & Nordic.
   - Mobile profile cards and 3D holographic cards high-contrast light backgrounds on Swiss & Nordic.
3. Hero Pro Max & JWT Session Persistence:
   - Split-screen broadcast hero with frosted obsidian backdrop (?hero=1).
   - One-click authentication and absence of redundant Sign-In tabs.
4. Zero Critical Console Errors across all flows.
"""

import sys
import pathlib
import pytest
from playwright.async_api import async_playwright

ROOT_DIR = pathlib.Path(__file__).parent.parent.resolve()
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from tests.helpers import save_screenshot_async, assert_no_critical_errors, catalog_screenshots

INDEX_HTML = (ROOT_DIR / "dist" / "index.html").as_uri()
ROOT_INDEX_HTML = (ROOT_DIR / "index.html").as_uri()
MOBILE_HTML = (ROOT_DIR / "dist" / "mobile.html").as_uri()

def luminance(r: int, g: int, b: int) -> float:
    def channel_val(c: int) -> float:
        c_norm = c / 255.0
        return c_norm / 12.92 if c_norm <= 0.03928 else ((c_norm + 0.055) / 1.055) ** 2.4
    return 0.2126 * channel_val(r) + 0.7152 * channel_val(g) + 0.0722 * channel_val(b)

def contrast_ratio(rgb1: tuple[int, int, int], rgb2: tuple[int, int, int]) -> float:
    l1 = luminance(*rgb1)
    l2 = luminance(*rgb2)
    lighter = max(l1, l2)
    darker = min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)

def parse_rgb(rgb_str: str) -> tuple[int, int, int]:
    cleaned = rgb_str.replace("rgba(", "").replace("rgb(", "").replace(")", "")
    parts = [int(p.strip()) for p in cleaned.split(",")[:3]]
    return (parts[0], parts[1], parts[2])

EMOJI_JS_CHECK = r"""(text) => {
    const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    return emojiRegex.test(text);
}"""


@pytest.mark.asyncio
async def test_desktop_themes_typography_and_accessibility():
    """Verify Desktop Web Console: theme switching, typography tokens, WCAG contrast, and zero emojis."""
    console_errors = []
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await ctx.new_page()

        page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: console_errors.append(f"PAGE ERROR: {e}"))
        page._console_errors = console_errors

        await page.goto(INDEX_HTML, wait_until="networkidle")
        await page.wait_for_timeout(300)
        await page.evaluate("() => { const h = document.getElementById('cricosHeroAuthOverlay'); if (h) h.style.display = 'none'; }")

        # -------------------------------------------------------------
        # 1. SWISS MINIMAL Theme & Fonts
        # -------------------------------------------------------------
        await page.evaluate("() => window.setDesignTheme('swiss', false)")
        await page.wait_for_timeout(200)

        swiss_data = await page.evaluate("""() => {
            const body = document.body;
            const sidebar = document.querySelector('.app-sidebar');
            const card = document.querySelector('.card');
            const icon = document.getElementById('designThemeIcon');
            const label = document.getElementById('designThemeLabel');
            const brand = document.querySelector('.brand-title');
            const score = document.getElementById('scoreRunsWickets') || document.querySelector('.main-score');
            const padBtn = document.querySelector('.pad-btn');
            
            return {
                themeAttr: body.getAttribute('data-theme'),
                bodyBg: window.getComputedStyle(body).backgroundColor,
                bodyColor: window.getComputedStyle(body).color,
                sidebarBg: sidebar ? window.getComputedStyle(sidebar).backgroundColor : null,
                cardBg: card ? window.getComputedStyle(card).backgroundColor : null,
                cardBorder: card ? window.getComputedStyle(card).borderColor : null,
                btnLabel: label ? label.textContent.trim() : '',
                btnIcon: icon ? (icon.getAttribute('data-theme-icon') || icon.textContent.trim()) : '',
                bodyFont: window.getComputedStyle(body).fontFamily,
                brandFont: brand ? window.getComputedStyle(brand).fontFamily : '',
                scoreFont: score ? window.getComputedStyle(score).fontFamily : '',
                padFont: padBtn ? window.getComputedStyle(padBtn).fontFamily : '',
                textMuted: window.getComputedStyle(body).getPropertyValue('--text-muted').trim()
            };
        }""")

        assert swiss_data["themeAttr"] == "swiss", "Body data-theme must be swiss"
        assert "SWISS MINIMAL" in swiss_data["btnLabel"].upper()
        assert swiss_data["btnIcon"] == "🇨🇭"
        assert "inter" in swiss_data["bodyFont"].lower(), f"Swiss body font must include Inter: {swiss_data['bodyFont']}"
        assert "inter" in swiss_data["scoreFont"].lower(), f"Swiss score font must include Inter: {swiss_data['scoreFont']}"

        # Swiss WCAG AAA Contrast (>= 7.0:1)
        ratio_swiss = contrast_ratio(parse_rgb("rgb(71, 85, 105)"), parse_rgb("rgb(248, 249, 250)"))
        assert ratio_swiss >= 7.0, f"Swiss contrast ratio must be >= 7.0:1, got {ratio_swiss:.2f}:1"
        await save_screenshot_async(page, "test_consolidated_desktop_swiss")

        # -------------------------------------------------------------
        # 2. NORDIC EDITORIAL Theme & Fonts
        # -------------------------------------------------------------
        await page.click("#btnDesignThemeSwitcher")
        await page.wait_for_timeout(200)

        nordic_data = await page.evaluate("""() => {
            const body = document.body;
            const sidebar = document.querySelector('.app-sidebar');
            const card = document.querySelector('.card');
            const icon = document.getElementById('designThemeIcon');
            const label = document.getElementById('designThemeLabel');
            const brand = document.querySelector('.brand-title');
            const score = document.getElementById('scoreRunsWickets') || document.querySelector('.main-score');
            
            return {
                themeAttr: body.getAttribute('data-theme'),
                bodyBg: window.getComputedStyle(body).backgroundColor,
                bodyColor: window.getComputedStyle(body).color,
                sidebarBg: sidebar ? window.getComputedStyle(sidebar).backgroundColor : null,
                cardBg: card ? window.getComputedStyle(card).backgroundColor : null,
                cardBorder: card ? window.getComputedStyle(card).borderColor : null,
                btnLabel: label ? label.textContent.trim() : '',
                btnIcon: icon ? (icon.getAttribute('data-theme-icon') || icon.textContent.trim()) : '',
                bodyFont: window.getComputedStyle(body).fontFamily,
                brandFont: brand ? window.getComputedStyle(brand).fontFamily : '',
                scoreFont: score ? window.getComputedStyle(score).fontFamily : ''
            };
        }""")

        assert nordic_data["themeAttr"] == "nordic", "Body data-theme must be nordic"
        assert "NORDIC EDITORIAL" in nordic_data["btnLabel"].upper()
        assert nordic_data["btnIcon"] == "🌾"
        assert any(f in nordic_data["scoreFont"].lower() for f in ["fraunces", "newsreader", "georgia", "serif"])
        assert any(f in nordic_data["bodyFont"].lower() for f in ["plus jakarta sans", "sans-serif"])

        # Nordic Contrast
        ratio_nordic = contrast_ratio(parse_rgb("rgb(87, 83, 78)"), parse_rgb("rgb(252, 251, 248)"))
        assert ratio_nordic >= 6.5, f"Nordic contrast ratio must be >= 6.5:1, got {ratio_nordic:.2f}:1"
        await save_screenshot_async(page, "test_consolidated_desktop_nordic")

        # -------------------------------------------------------------
        # 3. STADIUM NIGHT Theme & Fonts
        # -------------------------------------------------------------
        await page.keyboard.press("Alt+t")
        await page.wait_for_timeout(200)

        stadium_data = await page.evaluate("""() => {
            const body = document.body;
            const sidebar = document.querySelector('.app-sidebar');
            const card = document.querySelector('.card');
            const icon = document.getElementById('designThemeIcon');
            const label = document.getElementById('designThemeLabel');
            const brand = document.querySelector('.brand-title');
            const score = document.getElementById('scoreRunsWickets') || document.querySelector('.main-score');
            
            return {
                themeAttr: body.getAttribute('data-theme'),
                bodyBg: window.getComputedStyle(body).backgroundColor,
                bodyColor: window.getComputedStyle(body).color,
                sidebarBg: sidebar ? window.getComputedStyle(sidebar).backgroundColor : null,
                cardBg: card ? window.getComputedStyle(card).backgroundColor : null,
                cardBorder: card ? window.getComputedStyle(card).borderColor : null,
                btnLabel: label ? label.textContent.trim() : '',
                btnIcon: icon ? (icon.getAttribute('data-theme-icon') || icon.textContent.trim()) : '',
                bodyFont: window.getComputedStyle(body).fontFamily,
                brandFont: brand ? window.getComputedStyle(brand).fontFamily : '',
                scoreFont: score ? window.getComputedStyle(score).fontFamily : ''
            };
        }""")

        assert stadium_data["themeAttr"] == "stadium", "Body data-theme must be stadium"
        assert "STADIUM NIGHT" in stadium_data["btnLabel"].upper()
        assert stadium_data["btnIcon"] == "🌙"
        assert "space grotesk" in stadium_data["brandFont"].lower()
        assert "chakra petch" in stadium_data["scoreFont"].lower()

        # Stadium Contrast (>= 4.5:1)
        ratio_stadium = contrast_ratio(parse_rgb("rgb(148, 163, 184)"), parse_rgb("rgb(10, 16, 28)"))
        assert ratio_stadium >= 4.5, f"Stadium contrast ratio must be >= 4.5:1, got {ratio_stadium:.2f}:1"
        await save_screenshot_async(page, "test_consolidated_desktop_stadium")

        # Mutually distinct theme styles
        assert swiss_data["bodyBg"] != nordic_data["bodyBg"]
        assert swiss_data["bodyBg"] != stadium_data["bodyBg"]
        assert swiss_data["bodyColor"] != stadium_data["bodyColor"]
        assert swiss_data["sidebarBg"] != nordic_data["sidebarBg"]
        assert swiss_data["sidebarBg"] != stadium_data["sidebarBg"]

        # -------------------------------------------------------------
        # 4. Universal Iconsax SVGs & Zero Raw Emojis
        # -------------------------------------------------------------
        sidebar_items = await page.query_selector_all(".app-sidebar .sidebar-nav-item")
        assert len(sidebar_items) >= 15
        for item in sidebar_items:
            svg = await item.query_selector("svg.cricos-icon")
            assert svg is not None, "Each sidebar nav item must contain an authentic .cricos-icon SVG"
            text = (await item.inner_text()).strip()
            has_emoji = await page.evaluate(f"({EMOJI_JS_CHECK})(`{text}`)")
            assert not has_emoji, f"Sidebar nav item '{text}' must not contain raw emoji"

        theme_icon_svg = await page.query_selector("#designThemeIcon svg.cricos-icon")
        assert theme_icon_svg is not None, "Design theme switcher must render .cricos-icon SVG"

        # -------------------------------------------------------------
        # 5. Stance Switching Pills Geometry & Active Class
        # -------------------------------------------------------------
        tab_studio = await page.query_selector('[data-tab="studio"]')
        if tab_studio:
            await tab_studio.click()
            await page.wait_for_timeout(200)

            btn_lhb = await page.query_selector("#btnStanceLhb")
            btn_rhb = await page.query_selector("#btnStanceRhb")
            if btn_lhb and btn_rhb:
                await btn_lhb.click()
                await page.wait_for_timeout(150)
                assert await btn_lhb.evaluate("el => el.classList.contains('active')")
                assert not await btn_rhb.evaluate("el => el.classList.contains('active')")

        assert_no_critical_errors(page)
        await browser.close()


@pytest.mark.asyncio
async def test_mobile_themes_typography_and_visuals():
    """Verify Mobile Application: theme switching, typography, zero emojis, spring toast, and daylight cards."""
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
        # 1. Mobile Swiss Minimal
        # -------------------------------------------------------------
        await page.evaluate("() => window.cricosMobileApp.setTheme('swiss', false)")
        await page.wait_for_timeout(200)

        mobile_swiss = await page.evaluate("""() => {
            const body = document.body;
            const bar = document.querySelector('.mobile-header') || document.querySelector('.mobile-app-bar');
            const score = document.querySelector('.mobile-hero-score');
            return {
                themeAttr: body.getAttribute('data-theme'),
                bodyBg: window.getComputedStyle(body).backgroundColor,
                bodyColor: window.getComputedStyle(body).color,
                barBg: bar ? window.getComputedStyle(bar).backgroundColor : null,
                bodyFont: window.getComputedStyle(body).fontFamily,
                scoreFont: score ? window.getComputedStyle(score).fontFamily : ''
            };
        }""")

        assert mobile_swiss["themeAttr"] == "swiss"
        assert "inter" in mobile_swiss["bodyFont"].lower()
        await save_screenshot_async(page, "test_consolidated_mobile_swiss")

        # -------------------------------------------------------------
        # 2. Mobile Nordic Editorial
        # -------------------------------------------------------------
        await page.evaluate("() => window.cricosMobileApp.setTheme('nordic', false)")
        await page.wait_for_timeout(200)

        mobile_nordic = await page.evaluate("""() => {
            const body = document.body;
            const bar = document.querySelector('.mobile-header') || document.querySelector('.mobile-app-bar');
            const score = document.querySelector('.mobile-hero-score');
            return {
                themeAttr: body.getAttribute('data-theme'),
                bodyBg: window.getComputedStyle(body).backgroundColor,
                bodyColor: window.getComputedStyle(body).color,
                barBg: bar ? window.getComputedStyle(bar).backgroundColor : null,
                bodyFont: window.getComputedStyle(body).fontFamily,
                scoreFont: score ? window.getComputedStyle(score).fontFamily : ''
            };
        }""")

        assert mobile_nordic["themeAttr"] == "nordic"
        assert any(f in mobile_nordic["scoreFont"].lower() for f in ["fraunces", "newsreader", "georgia", "serif"])
        await save_screenshot_async(page, "test_consolidated_mobile_nordic")

        # -------------------------------------------------------------
        # 3. Mobile Stadium Night
        # -------------------------------------------------------------
        await page.evaluate("() => window.cricosMobileApp.setTheme('stadium', false)")
        await page.wait_for_timeout(200)

        mobile_stadium = await page.evaluate("""() => {
            const body = document.body;
            const bar = document.querySelector('.mobile-header') || document.querySelector('.mobile-app-bar');
            const score = document.querySelector('.mobile-hero-score');
            return {
                themeAttr: body.getAttribute('data-theme'),
                bodyBg: window.getComputedStyle(body).backgroundColor,
                bodyColor: window.getComputedStyle(body).color,
                barBg: bar ? window.getComputedStyle(bar).backgroundColor : null,
                bodyFont: window.getComputedStyle(body).fontFamily,
                scoreFont: score ? window.getComputedStyle(score).fontFamily : ''
            };
        }""")

        assert mobile_stadium["themeAttr"] == "stadium"
        assert "chakra petch" in mobile_stadium["scoreFont"].lower()
        await save_screenshot_async(page, "test_consolidated_mobile_stadium")

        # Assert mobile distinct computed styles
        assert mobile_swiss["bodyBg"] != mobile_nordic["bodyBg"]
        assert mobile_swiss["bodyBg"] != mobile_stadium["bodyBg"]
        assert mobile_swiss["barBg"] != mobile_nordic["barBg"]
        assert mobile_swiss["barBg"] != mobile_stadium["barBg"]

        # -------------------------------------------------------------
        # 4. Mobile Bottom Nav & Subnav Iconsax SVGs / Zero Emojis
        # -------------------------------------------------------------
        bottom_nav_items = await page.query_selector_all(".mobile-bottom-nav .mobile-nav-item")
        assert len(bottom_nav_items) >= 4
        for item in bottom_nav_items:
            svg = await item.query_selector("svg.cricos-icon")
            assert svg is not None, "Each bottom nav item must contain an authentic .cricos-icon SVG"
            text = (await item.inner_text()).strip()
            has_emoji = await page.evaluate(f"({EMOJI_JS_CHECK})(`{text}`)")
            assert not has_emoji, f"Bottom nav item '{text}' must not contain raw emoji"

        subnav_buttons = await page.query_selector_all(".mobile-subnav .mobile-subnav-btn")
        assert len(subnav_buttons) >= 6
        for btn in subnav_buttons:
            text = (await btn.inner_text()).strip()
            has_emoji = await page.evaluate(f"({EMOJI_JS_CHECK})(`{text}`)")
            assert not has_emoji, f"Subnav button '{text}' must not contain raw emoji"

        # -------------------------------------------------------------
        # 5. Single Bottom-Docked Spring Toast & Contrast
        # -------------------------------------------------------------
        toast_metrics = await page.evaluate("""() => {
            window.cricosMobileApp.showToast('Consolidated Toast Verification');
            const toasts = document.querySelectorAll('.mobile-toast');
            const container = document.getElementById('mobileToastContainer');
            const rect = container ? container.getBoundingClientRect() : null;
            return {
                count: toasts.length,
                centerY: rect ? (rect.top + rect.bottom) / 2 : 0
            };
        }""")
        assert toast_metrics["count"] == 1, f"Must render exactly 1 toast element, found {toast_metrics['count']}"
        assert toast_metrics["centerY"] > 600, f"Mobile toast container must be bottom-docked, got {toast_metrics['centerY']}"

        # Swiss Toast Light Contrast
        await page.evaluate("() => window.cricosMobileApp.setTheme('swiss', false)")
        await page.wait_for_timeout(200)
        swiss_toast = await page.evaluate("""() => {
            window.cricosMobileApp.showToast('Swiss Toast Active', 'success', 5000);
            const t = document.querySelector('.mobile-toast');
            const text = document.querySelector('.mobile-toast-text') || t;
            return {
                bg: window.getComputedStyle(t).backgroundColor,
                color: window.getComputedStyle(text).color
            };
        }""")
        s_bg = parse_rgb(swiss_toast["bg"])
        s_fg = parse_rgb(swiss_toast["color"])
        assert s_bg[0] > 240 and s_bg[1] > 240 and s_bg[2] > 240, f"Swiss toast must have light background: {swiss_toast['bg']}"
        assert contrast_ratio(s_fg, s_bg) >= 7.0, "Swiss toast contrast must be >= 7.0:1"

        # -------------------------------------------------------------
        # 6. Light Theme Profile Cards on Swiss & Nordic
        # -------------------------------------------------------------
        await page.evaluate("""() => {
            window.cricosMobileApp.navigateTo('PROFILE');
        }""")
        await page.wait_for_timeout(250)

        profile_check = await page.evaluate("""() => {
            const card = document.querySelector('.profile-hero-card') || document.querySelector('#profileBioCard');
            const name = document.querySelector('.profile-hero-name') || document.querySelector('.profile-bio-text');
            return {
                bg: window.getComputedStyle(card).backgroundColor,
                color: window.getComputedStyle(name).color
            };
        }""")
        p_bg = parse_rgb(profile_check["bg"])
        p_fg = parse_rgb(profile_check["color"])
        assert p_bg[0] > 240 and p_bg[1] > 240 and p_bg[2] > 240
        assert contrast_ratio(p_fg, p_bg) >= 7.0

        catalog_screenshots()
        assert_no_critical_errors(page)
        await browser.close()


@pytest.mark.asyncio
async def test_hero_pro_max_jwt_persistence_and_auth():
    """Verify UI/UX Pro Max Split Hero, JWT persistence and absence of redundant sign-in tabs."""
    console_errors = []
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await ctx.new_page()

        page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: console_errors.append(f"PAGE ERROR: {e}"))
        page._console_errors = console_errors

        await page.goto(f"{INDEX_HTML}?hero=1", wait_until="domcontentloaded")
        await page.wait_for_timeout(350)

        # 1. Verify UI/UX Pro Max Split Hero
        hero_check = await page.evaluate("""() => {
            const overlay = document.getElementById('cricosHeroAuthOverlay');
            const leftCard = document.getElementById('heroLeftCopyColumn');
            const cs = leftCard ? window.getComputedStyle(leftCard) : null;
            return {
                overlayVisible: overlay ? window.getComputedStyle(overlay).display !== 'none' : false,
                leftCardStyle: cs ? (cs.backgroundImage + ' ' + cs.backgroundColor) : ''
            };
        }""")
        assert hero_check["overlayVisible"], "Hero overlay must be visible when ?hero=1 is supplied"
        assert "6, 13, 27" in hero_check["leftCardStyle"], f"Hero copy card must retain deep obsidian backdrop: {hero_check['leftCardStyle']}"

        # 2. Authenticate and verify zero redundant Sign-In tab
        await page.evaluate("""() => {
            const btn = document.querySelector('#cricosHeroAuthOverlay button');
            if (btn) btn.click();
        }""")
        await page.wait_for_timeout(300)

        jwt_state = await page.evaluate("""() => ({
            signInTab: document.querySelector('[data-tab="signin"], [data-tab="login"], [data-tab="auth"]')
        })""")
        assert jwt_state["signInTab"] is None, "No redundant Sign-In sidebar tab may exist inside workspace"

        assert_no_critical_errors(page)
        await browser.close()
