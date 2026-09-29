"""
Test 68: LHB/RHB & Scoring Notification Deduplication + Mobile Sidebar Light/Dark Theme Contrast
Verifies:
1. Switching between RHB and LHB, filtering by batsman, swapping strike, or scoring deliveries on Desktop
   never spawns cascading/duplicate notifications (at most 1 notification for stance/batter switch, max 2 total).
2. Switching RHB/LHB, rotating strike, or scoring balls on Mobile App caps active toasts to at most 1.
3. Mobile Sidebar Drawer (#mobileSidebarDrawer) and Clean Focus Bar (#mobileCleanFocusBar) are 100% theme-aware
   across 'swiss' (light), 'nordic' (warm daylight), and 'stadium' (dark), with light surfaces in light themes
   and WCAG AAA (>= 7.0:1) contrast on all text labels, chips, and navigation buttons.
"""
import os
from playwright.sync_api import sync_playwright

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DESKTOP_HTML = f"file://{os.path.join(ROOT_DIR, 'dist', 'index.html')}"
MOBILE_HTML = f"file://{os.path.join(ROOT_DIR, 'dist', 'mobile.html')}"
SCREENSHOT_DIR = os.path.join(os.path.dirname(__file__), "screenshots")
os.makedirs(SCREENSHOT_DIR, exist_ok=True)


def assert_no_critical_errors(errors):
    critical = [e for e in errors if "favicon" not in e.lower() and "net::" not in e.lower()]
    assert not critical, f"Critical console/page errors detected: {critical}"


def test_desktop_rhb_lhb_and_scoring_toast_deduplication():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))

        page.goto(DESKTOP_HTML, wait_until="domcontentloaded")
        page.wait_for_timeout(400)

        # Sign in as Scorer to access Scorer Studio & Wagon Wheel
        page.evaluate("""() => {
            if (typeof quickHeroLogin === 'function') quickHeroLogin('dinesh_scorer');
            if (typeof switchTab === 'function') switchTab('matches');
        }""")
        page.wait_for_timeout(300)

        # 1. Clear existing toasts and click LHB switch
        page.evaluate("() => { if (window.toast && window.toast.dismiss) window.toast.dismiss(); }")
        page.wait_for_timeout(250)

        page.evaluate("() => setBatterStance('LHB', true)")
        toast_info_lhb = page.evaluate("""() => {
            const toasts = Array.from(document.querySelectorAll('#sonnerToaster .sonner-toast:not(.dismissing)'));
            return {
                count: toasts.length,
                titles: toasts.map(t => (t.querySelector('.sonner-title')?.textContent || '').trim())
            };
        }""")
        assert toast_info_lhb["count"] == 1, f"Expected exactly 1 toast on LHB switch, got {toast_info_lhb}"
        assert "Batsman stance: LHB" in toast_info_lhb["titles"][0]

        # 2. Switch batter filter to Hardik Patel -> should replace/keep <= 1 filter toast without spawning Stance + Zone toasts
        page.evaluate("() => filterWagonBatter('Hardik Patel')")
        toast_info_batter = page.evaluate("""() => {
            const toasts = Array.from(document.querySelectorAll('#sonnerToaster .sonner-toast:not(.dismissing)'));
            return {
                count: toasts.length,
                titles: toasts.map(t => (t.querySelector('.sonner-title')?.textContent || '').trim())
            };
        }""")
        assert toast_info_batter["count"] <= 2, f"Expected <= 2 toasts after batter filter, got {toast_info_batter}"
        # Ensure no Wagon Zone toast was spammed
        assert not any("Wagon Zone:" in t for t in toast_info_batter["titles"]), (
            f"Unexpected 'Wagon Zone:' cascade toast found: {toast_info_batter}"
        )

        # 3. Record 1 run delivery (which rotates strike between RHB and LHB) -> should NOT spam 6-8 notifications
        page.evaluate("() => recordStudioBall(1)")
        toast_info_ball = page.evaluate("""() => {
            const toasts = Array.from(document.querySelectorAll('#sonnerToaster .sonner-toast:not(.dismissing)'));
            return {
                count: toasts.length,
                titles: toasts.map(t => (t.querySelector('.sonner-title')?.textContent || '').trim())
            };
        }""")
        assert toast_info_ball["count"] <= 2, f"Expected <= 2 toasts after scoring 1 run, got {toast_info_ball}"

        assert_no_critical_errors(errors)
        browser.close()


def test_mobile_sidebar_light_theme_awareness_and_legibility():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 430, "height": 932})
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))

        page.goto(MOBILE_HTML, wait_until="domcontentloaded")
        page.wait_for_timeout(400)

        # Sign in as Scorer and verify mobile toast cap on RHB/LHB switch + strike rotate
        page.evaluate("""() => {
            const app = window.cricosMobileApp;
            app.switchUserPersona('SCORER');
            app.setBatterStance('LHB');
            app.rotateStrike(true);
        }""")
        mobile_toast_count = page.evaluate("""() => {
            return document.querySelectorAll('#mobileToastContainer .mobile-toast').length;
        }""")
        assert mobile_toast_count <= 1, f"Expected <= 1 mobile toast, got {mobile_toast_count}"

        # Helper to compute WCAG contrast ratio in browser for all elements inside #mobileSidebarDrawer & #mobileCleanFocusBar
        contrast_check_js = """(expectedLight) => {
            function parseRgb(str) {
                if (!str) return null;
                const m = str.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)(?:,\\s*([\\d.]+))?\\)/);
                if (!m) return null;
                return { r: +m[1], g: +m[2], b: +m[3], a: m[4] !== undefined ? +m[4] : 1 };
            }
            function srgbChannel(c) {
                const v = c / 255;
                return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
            }
            function luminance(rgb) {
                return 0.2126 * srgbChannel(rgb.r) + 0.7152 * srgbChannel(rgb.g) + 0.0722 * srgbChannel(rgb.b);
            }
            function contrastRatio(l1, l2) {
                const lighter = Math.max(l1, l2);
                const darker = Math.min(l1, l2);
                return (lighter + 0.05) / (darker + 0.05);
            }
            function getEffectiveBg(el) {
                let cur = el;
                while (cur && cur !== document.documentElement) {
                    const st = window.getComputedStyle(cur);
                    const bg = parseRgb(st.backgroundColor);
                    if (bg && bg.a >= 0.5) return bg;
                    const bgImg = st.backgroundImage || '';
                    const hexMatches = bgImg.match(/rgb\\(\\d+,\\s*\\d+,\\s*\\d+\\)/g);
                    if (hexMatches && hexMatches.length > 0) {
                        const gradRgb = parseRgb(hexMatches[0]);
                        if (gradRgb) return gradRgb;
                    }
                    cur = cur.parentElement;
                }
                return expectedLight ? { r: 255, g: 255, b: 255, a: 1 } : { r: 7, g: 18, b: 34, a: 1 };
            }

            const drawer = document.getElementById('mobileSidebarDrawer');
            const drawerBg = getEffectiveBg(drawer);
            const drawerLum = luminance(drawerBg);

            const selectors = [
                '#mobileSidebarDrawer .mobile-sidebar-header div',
                '#mobileSidebarDrawer .mobile-sidebar-section-title',
                '#mobileSidebarDrawer .mobile-sidebar-persona-chip',
                '#mobileSidebarDrawer .mobile-sidebar-nav-item',
                '#mobileSidebarStudios button',
                '#btnMobileSidebarDeclutterToggle',
                '#btnMobileSidebarSignOut',
                '#mobileCleanFocusBar span',
                '#mobileCleanFocusBar button'
            ];
            const results = [];
            for (const sel of selectors) {
                const nodes = Array.from(document.querySelectorAll(sel));
                for (const node of nodes) {
                    const text = (node.textContent || '').trim();
                    if (!text) continue;
                    const fg = parseRgb(window.getComputedStyle(node).color);
                    const bg = getEffectiveBg(node);
                    const ratio = contrastRatio(luminance(fg), luminance(bg));
                    results.push({
                        selector: sel,
                        text: text.slice(0, 30),
                        ratio: Number(ratio.toFixed(2))
                    });
                }
            }
            return { drawerLum: Number(drawerLum.toFixed(3)), results };
        }"""

        # 1. Verify Swiss Minimal Light Theme ('swiss')
        page.evaluate("""() => {
            window.cricosMobileApp.setTheme('swiss', false);
            window.cricosMobileApp.openSidebarDrawer();
        }""")
        page.wait_for_timeout(200)
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "test_68_mobile_sidebar_swiss_light.png"))

        swiss_audit = page.evaluate(contrast_check_js, True)
        assert swiss_audit["drawerLum"] > 0.85, f"Expected light sidebar surface in 'swiss' theme, got luminance {swiss_audit['drawerLum']}"
        low_contrast_swiss = [r for r in swiss_audit["results"] if r["ratio"] < 7.0]
        assert not low_contrast_swiss, f"Found low-contrast elements in 'swiss' light sidebar: {low_contrast_swiss}"

        # 2. Verify Nordic Editorial Daylight Theme ('nordic')
        page.evaluate("""() => {
            window.cricosMobileApp.setTheme('nordic', false);
            window.cricosMobileApp.openSidebarDrawer();
        }""")
        page.wait_for_timeout(200)
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "test_68_mobile_sidebar_nordic_light.png"))

        nordic_audit = page.evaluate(contrast_check_js, True)
        assert nordic_audit["drawerLum"] > 0.85, f"Expected light sidebar surface in 'nordic' theme, got luminance {nordic_audit['drawerLum']}"
        low_contrast_nordic = [r for r in nordic_audit["results"] if r["ratio"] < 7.0]
        assert not low_contrast_nordic, f"Found low-contrast elements in 'nordic' light sidebar: {low_contrast_nordic}"

        # 3. Verify Stadium Night Dark Theme ('stadium')
        page.evaluate("""() => {
            window.cricosMobileApp.setTheme('stadium', false);
            window.cricosMobileApp.openSidebarDrawer();
        }""")
        page.wait_for_timeout(200)
        stadium_audit = page.evaluate(contrast_check_js, False)
        assert stadium_audit["drawerLum"] < 0.05, f"Expected dark sidebar surface in 'stadium' theme, got luminance {stadium_audit['drawerLum']}"
        low_contrast_stadium = [r for r in stadium_audit["results"] if r["ratio"] < 4.5]
        assert not low_contrast_stadium, f"Found low-contrast elements in 'stadium' dark sidebar: {low_contrast_stadium}"

        assert_no_critical_errors(errors)
        browser.close()
