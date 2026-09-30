"""
Test 72: UI/UX Pro Max Hero Section (Asymmetric Split Hero, Interactive 3D Command HUD,
RHB/LHB Live Mirroring, 1-Click Persona Sandbox & Modular Bento Showcase)
Verifies that:
1. Desktop (index.html?hero=1) renders the UI/UX Pro Max Split Hero with Live Broadcast Ribbon,
   Canvas Mode Switcher, Interactive 3D Command Preview HUD (#heroInteractivePreviewHud),
   RHB/LHB Stance Mirror Toggle (#btnHeroPreviewStanceToggle), 1-Click Demo Persona Launchers
   (#heroQuickPersonaLaunchBar), 4-Metric Telemetry Strip (#heroTrustMetricsStrip), and
   4-Card Bento Grid (#heroBentoFeatureGrid).
2. Mobile/APK (dist/mobile.html?hero=1) renders the Mobile Pro Max Hero with Live Broadcast Strip,
   Interactive 3D Command HUD (#mobileHeroInteractiveHud), RHB/LHB Stance Toggle, 1-Tap Quick Launch
   Chips (#mobileHeroQuickLaunchRow), and 2x2 Bento Grid (#mobileHeroBentoGrid).
"""
import os
from playwright.sync_api import sync_playwright

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DESKTOP_HERO_URL = f"file://{os.path.join(ROOT_DIR, 'index.html')}?hero=1"
MOBILE_HERO_URL = f"file://{os.path.join(ROOT_DIR, 'dist', 'mobile.html')}?hero=1"
SCREENSHOT_DIR = os.path.join(os.path.dirname(__file__), "screenshots")


def assert_no_critical_errors(errors):
    critical = [
        e for e in errors
        if "favicon" not in e.lower()
        and "net::err_" not in e.lower()
        and "failed to load resource" not in e.lower()
    ]
    assert not critical, f"Critical console/page errors detected: {critical}"


def test_desktop_ui_ux_pro_max_hero_section():
    os.makedirs(SCREENSHOT_DIR, exist_ok=True)
    errors = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 920})
        page.on("pageerror", lambda exc: errors.append(str(exc)))

        page.goto(DESKTOP_HERO_URL, wait_until="domcontentloaded")
        page.wait_for_timeout(400)

        # 1. Verify UI/UX Pro Max Hero architecture & interactive elements
        initial = page.evaluate("""() => ({
            ribbonExists: Boolean(document.getElementById('heroLiveBroadcastRibbon')),
            splitGridExists: Boolean(document.getElementById('heroSplitGrid')),
            hudExists: Boolean(document.getElementById('heroInteractivePreviewHud')),
            svgExists: Boolean(document.getElementById('heroInteractivePitchSvg')),
            quickLaunchExists: Boolean(document.getElementById('heroQuickPersonaLaunchBar')),
            trustMetricsExists: Boolean(document.getElementById('heroTrustMetricsStrip')),
            bentoGridExists: Boolean(document.getElementById('heroBentoFeatureGrid')),
            offLabel: document.getElementById('heroSvgOffSideLabel')?.textContent?.trim() || '',
            impactLabel: document.getElementById('heroSvgImpactLabel')?.textContent?.trim() || '',
            hudTitle: document.getElementById('heroHudActiveModeTitle')?.textContent?.trim() || ''
        })""")
        assert initial["ribbonExists"] is True
        assert initial["splitGridExists"] is True
        assert initial["hudExists"] is True
        assert initial["svgExists"] is True
        assert initial["quickLaunchExists"] is True
        assert initial["trustMetricsExists"] is True
        assert initial["bentoGridExists"] is True
        assert "OFF-SIDE" in initial["offLabel"]
        assert "RHB EXTRA COVER" in initial["impactLabel"]
        assert "Scorer 3D" in initial["hudTitle"]

        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "test_72_desktop_pro_max_hero_rhb.png"))

        # 2. Toggle RHB -> LHB Stance inside Hero 3D HUD and verify live biomechanical mirroring
        page.click("#btnHeroPreviewStanceToggle")
        page.wait_for_timeout(150)

        lhb_state = page.evaluate("""() => ({
            offLabel: document.getElementById('heroSvgOffSideLabel')?.textContent?.trim() || '',
            impactLabel: document.getElementById('heroSvgImpactLabel')?.textContent?.trim() || '',
            stanceBtnText: document.getElementById('btnHeroPreviewStanceToggle')?.textContent?.trim() || ''
        })""")
        assert "ON-SIDE" in lhb_state["offLabel"]
        assert "LHB EXTRA COVER" in lhb_state["impactLabel"]
        assert "LHB" in lhb_state["stanceBtnText"]

        # 3. Switch Hero Interactive Preview tabs (CAPTAIN -> UMPIRE -> COMMERCE)
        page.click("#heroPreviewTab_UMPIRE")
        page.wait_for_timeout(150)

        umpire_hud = page.evaluate("""() => ({
            hudTitle: document.getElementById('heroHudActiveModeTitle')?.textContent?.trim() || '',
            svgHtml: document.getElementById('heroSvgDynamicOverlayGroup')?.innerHTML || '',
            accessMetric: document.getElementById('heroMetricAccess')?.textContent?.trim() || ''
        })""")
        assert "Hawk-Eye DRS" in umpire_hud["hudTitle"]
        assert "DRS HAWK-EYE" in umpire_hud["svgHtml"]
        assert "UMPIRE" in umpire_hud["accessMetric"]

        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "test_72_desktop_pro_max_hero_drs.png"))

        # 4. Verify 1-Click Quick Persona Launch from Hero Stage
        page.click("#btnHeroQuickScorer")
        page.wait_for_timeout(250)

        logged_in = page.evaluate("""() => ({
            overlayDisplay: getComputedStyle(document.getElementById('cricosHeroAuthOverlay')).display,
            persona: currentUser.persona,
            name: currentUser.name
        })""")
        assert logged_in["overlayDisplay"] == "none"
        assert logged_in["persona"] == "SCORER"
        assert logged_in["name"] == "Sunil Gavaskar"

        assert_no_critical_errors(errors)
        browser.close()


def test_mobile_ui_ux_pro_max_hero_section():
    os.makedirs(SCREENSHOT_DIR, exist_ok=True)
    errors = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 412, "height": 915})
        page.on("pageerror", lambda exc: errors.append(str(exc)))

        page.goto(MOBILE_HERO_URL, wait_until="domcontentloaded")
        page.wait_for_timeout(400)

        mobile_initial = page.evaluate("""() => ({
            broadcastExists: Boolean(document.getElementById('mobileHeroBroadcastStrip')),
            hudExists: Boolean(document.getElementById('mobileHeroInteractiveHud')),
            svgExists: Boolean(document.getElementById('mobileHeroPitchSvg')),
            quickRowExists: Boolean(document.getElementById('mobileHeroQuickLaunchRow')),
            bentoExists: Boolean(document.getElementById('mobileHeroBentoGrid')),
            leftSide: document.getElementById('mobileHeroSideLeft')?.textContent?.trim() || ''
        })""")
        assert mobile_initial["broadcastExists"] is True
        assert mobile_initial["hudExists"] is True
        assert mobile_initial["svgExists"] is True
        assert mobile_initial["quickRowExists"] is True
        assert mobile_initial["bentoExists"] is True
        assert "OFF-SIDE" in mobile_initial["leftSide"]

        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "test_72_mobile_pro_max_hero.png"))

        # Toggle RHB -> LHB on Mobile Hero HUD
        page.click("#btnMobileHeroStanceToggle")
        page.wait_for_timeout(150)

        mobile_lhb = page.evaluate("""() => ({
            leftSide: document.getElementById('mobileHeroSideLeft')?.textContent?.trim() || '',
            stanceBtn: document.getElementById('btnMobileHeroStanceToggle')?.textContent?.trim() || ''
        })""")
        assert "ON-SIDE" in mobile_lhb["leftSide"]
        assert "LHB" in mobile_lhb["stanceBtn"]

        # Verify 1-Tap Quick Launch on Mobile Hero
        page.click("#btnMobileHeroQuickCaptain")
        page.wait_for_timeout(250)

        mobile_auth = page.evaluate("""() => ({
            stage: window.cricosMobileApp.heroGatewayStage,
            persona: window.cricosMobileApp.profile.persona,
            name: window.cricosMobileApp.profile.name
        })""")
        assert mobile_auth["stage"] == "AUTHENTICATED"
        assert mobile_auth["persona"] == "CAPTAIN"
        assert mobile_auth["name"] == "Virat Sharma"

        assert_no_critical_errors(errors)
        browser.close()
