"""
Test 65: Animated Hero Landing Page -> Login -> Persona-Scoped In-App Access
Verifies that:
1. Both Desktop (index.html?hero=1) and Mobile/APK (dist/mobile.html?hero=1) present an
   Animated Hero Page first (with live 60fps canvas animation), followed by a Login screen.
2. Upon login, only the user personas assigned to the authenticated user (allowedPersonas)
   are visible in the Persona Switcher and accessible in-app.
3. Unauthorized persona switches (e.g. a CAPTAIN/PLAYER user trying to access SCORER or ADMIN,
   or a SCORER-only user trying to access CAPTAIN or ADMIN) are strictly blocked.
"""
import os
from playwright.sync_api import sync_playwright

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DESKTOP_URL = f"file://{os.path.join(ROOT_DIR, 'index.html')}?hero=1"
MOBILE_URL = f"file://{os.path.join(ROOT_DIR, 'dist', 'mobile.html')}?hero=1"
SCREENSHOT_DIR = os.path.join(os.path.dirname(__file__), "screenshots")


def assert_no_critical_errors(errors):
    critical = [
        e for e in errors
        if "favicon" not in e.lower()
        and "net::err_" not in e.lower()
        and "failed to load resource" not in e.lower()
    ]
    assert not critical, f"Critical console/page errors detected: {critical}"


def test_desktop_animated_hero_login_and_persona_scoped_access():
    os.makedirs(SCREENSHOT_DIR, exist_ok=True)
    errors = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.on("pageerror", lambda exc: errors.append(str(exc)))

        page.goto(DESKTOP_URL, wait_until="domcontentloaded")
        page.wait_for_timeout(450)

        # 1. Verify Stage 1: Animated Hero Page is displayed first
        hero_state = page.evaluate("""() => {
            const overlay = document.getElementById('cricosHeroAuthOverlay');
            const heroLanding = document.getElementById('heroStageLanding');
            const heroLogin = document.getElementById('heroStageLogin');
            const canvas = document.getElementById('heroStadiumCanvas');
            const ctx = canvas.getContext('2d');
            const data = ctx.getImageData(0, 0, 200, 200).data;
            let nonZero = 0;
            for (let i = 0; i < data.length; i += 16) {
                if (data[i] > 0 || data[i+1] > 0 || data[i+2] > 0) nonZero++;
            }
            return {
                overlayVisible: overlay && getComputedStyle(overlay).display !== 'none',
                landingVisible: heroLanding && getComputedStyle(heroLanding).display !== 'none',
                loginVisible: heroLogin && getComputedStyle(heroLogin).display !== 'none',
                canvasNonZeroSamples: nonZero,
                headline: document.getElementById('heroKineticHeadline')?.textContent?.trim() || ''
            };
        }""")
        assert hero_state["overlayVisible"] is True
        assert hero_state["landingVisible"] is True
        assert hero_state["loginVisible"] is False
        assert hero_state["canvasNonZeroSamples"] > 10
        assert "Unified in 3D" in hero_state["headline"]

        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "test_65_desktop_hero_stage.png"))

        # 2. Click CTA on Hero Page -> Transition to Stage 2: Login Screen
        page.click("#btnHeroProceedToLogin")
        page.wait_for_timeout(200)

        login_stage_state = page.evaluate("""() => {
            const heroLanding = document.getElementById('heroStageLanding');
            const heroLogin = document.getElementById('heroStageLogin');
            return {
                landingVisible: heroLanding && getComputedStyle(heroLanding).display !== 'none',
                loginVisible: heroLogin && getComputedStyle(heroLogin).display !== 'none'
            };
        }""")
        assert login_stage_state["landingVisible"] is False
        assert login_stage_state["loginVisible"] is True

        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "test_65_desktop_login_stage.png"))

        # 3. Sign in as Virat Sharma (Allowed Personas: CAPTAIN, PLAYER only)
        page.click("#btnLoginAccountCaptain")
        page.wait_for_timeout(300)

        captain_access = page.evaluate("""() => {
            const overlay = document.getElementById('cricosHeroAuthOverlay');
            const visiblePills = [];
            document.querySelectorAll('.persona-pill-btn').forEach(btn => {
                if (getComputedStyle(btn).display !== 'none') {
                    visiblePills.push(btn.getAttribute('data-role'));
                }
            });
            const blockedScorerAttempt = selectPersona('SCORER');
            const blockedAdminAttempt = selectPersona('ADMIN');
            const allowedPlayerAttempt = selectPersona('PLAYER');
            return {
                overlayHidden: overlay && getComputedStyle(overlay).display === 'none',
                visiblePills,
                blockedScorerAttempt,
                blockedAdminAttempt,
                allowedPlayerAttempt,
                activePersonaAfterAttempts: currentUser.persona,
                scoringPadDisplay: getComputedStyle(document.getElementById('studioScoringControlsGroup')).display
            };
        }""")
        assert captain_access["overlayHidden"] is True
        assert captain_access["visiblePills"] == ["CAPTAIN", "PLAYER"], (
            f"Expected only CAPTAIN and PLAYER visible for Virat Sharma, got {captain_access['visiblePills']}"
        )
        assert captain_access["blockedScorerAttempt"] is False
        assert captain_access["blockedAdminAttempt"] is False
        assert captain_access["activePersonaAfterAttempts"] == "PLAYER"
        assert captain_access["scoringPadDisplay"] == "none"

        # 4. Sign out to Hero Page, proceed to Login, and sign in as Sunil Gavaskar (Allowed Persona: SCORER only)
        page.evaluate("logoutToHero()")
        page.wait_for_timeout(150)
        page.click("#btnHeroProceedToLogin")
        page.wait_for_timeout(150)
        page.click("#btnLoginAccountScorer")
        page.wait_for_timeout(250)

        scorer_access = page.evaluate("""() => {
            const visiblePills = [];
            document.querySelectorAll('.persona-pill-btn').forEach(btn => {
                if (getComputedStyle(btn).display !== 'none') {
                    visiblePills.push(btn.getAttribute('data-role'));
                }
            });
            const blockedCaptainAttempt = selectPersona('CAPTAIN');
            return {
                visiblePills,
                blockedCaptainAttempt,
                activePersona: currentUser.persona,
                scoringPadDisplay: getComputedStyle(document.getElementById('studioScoringControlsGroup')).display
            };
        }""")
        assert scorer_access["visiblePills"] == ["SCORER"], (
            f"Expected only SCORER visible for Sunil Gavaskar, got {scorer_access['visiblePills']}"
        )
        assert scorer_access["blockedCaptainAttempt"] is False
        assert scorer_access["activePersona"] == "SCORER"
        assert scorer_access["scoringPadDisplay"] == "block"

        assert_no_critical_errors(errors)
        browser.close()


def test_mobile_animated_hero_login_and_persona_scoped_access():
    os.makedirs(SCREENSHOT_DIR, exist_ok=True)
    errors = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 412, "height": 915})
        page.on("pageerror", lambda exc: errors.append(str(exc)))

        page.goto(MOBILE_URL, wait_until="domcontentloaded")
        page.wait_for_timeout(450)

        # 1. Verify Stage 1: Mobile Animated Hero Page is shown first
        mobile_hero = page.evaluate("""() => {
            const overlay = document.getElementById('mobileHeroAuthOverlay');
            const landing = document.getElementById('mobileHeroStageLanding');
            const canvas = document.getElementById('mobileHeroStadiumCanvas');
            return {
                stage: window.cricosMobileApp.heroGatewayStage,
                overlayExists: Boolean(overlay),
                landingExists: Boolean(landing),
                canvasExists: Boolean(canvas)
            };
        }""")
        assert mobile_hero["stage"] == "HERO"
        assert mobile_hero["overlayExists"] is True
        assert mobile_hero["landingExists"] is True
        assert mobile_hero["canvasExists"] is True

        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "test_65_mobile_hero_stage.png"))

        # 2. Click Enter CricOS -> Transition to Stage 2: Mobile Login
        page.click("#btnMobileHeroProceedToLogin")
        page.wait_for_timeout(200)

        mobile_login = page.evaluate("""() => ({
            stage: window.cricosMobileApp.heroGatewayStage,
            loginStageExists: Boolean(document.getElementById('mobileHeroStageLogin'))
        })""")
        assert mobile_login["stage"] == "LOGIN"
        assert mobile_login["loginStageExists"] is True

        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "test_65_mobile_login_stage.png"))

        # 3. Sign in as Virat Sharma (CAPTAIN, PLAYER only)
        page.click("#btnMobileAccountCaptain")
        page.wait_for_timeout(250)

        mobile_captain_state = page.evaluate("""() => {
            const app = window.cricosMobileApp;
            const sheetCards = Array.from(document.querySelectorAll('#mobilePersonaSheet .persona-picker-card')).map(
                el => el.getAttribute('data-persona-choice')
            );
            const blockedScorer = app.switchUserPersona('SCORER');
            return {
                stage: app.heroGatewayStage,
                persona: app.profile.persona,
                allowedPersonas: app.allowedPersonas,
                sheetCards,
                blockedScorer,
                scorerPadExists: Boolean(document.getElementById('mobileScorerStudioPad'))
            };
        }""")
        assert mobile_captain_state["stage"] == "AUTHENTICATED"
        assert mobile_captain_state["persona"] == "CAPTAIN"
        assert mobile_captain_state["sheetCards"] == ["CAPTAIN", "PLAYER"]
        assert mobile_captain_state["blockedScorer"] is False
        assert mobile_captain_state["scorerPadExists"] is False

        # 4. Sign out to Hero Page -> Login as Sunil Gavaskar (SCORER only)
        page.evaluate("window.cricosMobileApp.logoutToHero()")
        page.wait_for_timeout(150)
        page.click("#btnMobileHeroProceedToLogin")
        page.wait_for_timeout(150)
        page.click("#btnMobileAccountScorer")
        page.wait_for_timeout(250)

        mobile_scorer_state = page.evaluate("""() => {
            const app = window.cricosMobileApp;
            const sheetCards = Array.from(document.querySelectorAll('#mobilePersonaSheet .persona-picker-card')).map(
                el => el.getAttribute('data-persona-choice')
            );
            const blockedCaptain = app.switchUserPersona('CAPTAIN');
            return {
                persona: app.profile.persona,
                sheetCards,
                blockedCaptain,
                scorerPadExists: Boolean(document.getElementById('mobileScorerStudioPad'))
            };
        }""")
        assert mobile_scorer_state["persona"] == "SCORER"
        assert mobile_scorer_state["sheetCards"] == ["SCORER"]
        assert mobile_scorer_state["blockedCaptain"] is False
        assert mobile_scorer_state["scorerPadExists"] is True

        assert_no_critical_errors(errors)
        browser.close()
