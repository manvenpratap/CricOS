"""
Test 71: Unified Session Persistence & Removal of Redundant 'Sign In' Tab When Authenticated
Verifies that:
1. Mobile/Android (dist/mobile.html):
   - When logged in (both default authenticated boot and after Hero Login via preset/custom accounts),
     `this.client.getSession()` is populated and the `🔑 Sign In` tab (`button[data-screen="AUTH"]`)
     is NEVER displayed in `#mobileBottomNav`.
   - `localStorage.getItem('cricos_session_v1')` stores the structured JWT session (token, refreshToken,
     name, identifier, role, allowedPersonas, strictPersonaLock) and restores it across page reloads.
   - Profile tab renders `#mobileActiveSessionBadge` showing the active JWT session and Sign Out button.
   - Signing out (`logoutToHero()`) clears `this.client.getSession()` and `localStorage` and returns to
     `#mobileHeroAuthOverlay`.
2. Desktop (index.html):
   - Hero Login persists `cricos_session_v1` in `localStorage`, restores session & RBAC persona locks
     across page reload, and clears session on `logoutToHero()`.
"""
import json
import os
from playwright.sync_api import sync_playwright

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DESKTOP_BASE_URL = f"file://{os.path.join(ROOT_DIR, 'index.html')}"
DESKTOP_HERO_URL = f"{DESKTOP_BASE_URL}?hero=1"
MOBILE_BASE_URL = f"file://{os.path.join(ROOT_DIR, 'dist', 'mobile.html')}"
MOBILE_HERO_URL = f"{MOBILE_BASE_URL}?hero=1"
SCREENSHOT_DIR = os.path.join(os.path.dirname(__file__), "screenshots")


def assert_no_critical_errors(errors):
    critical = [
        e for e in errors
        if "favicon" not in e.lower()
        and "net::err_" not in e.lower()
        and "failed to load resource" not in e.lower()
    ]
    assert not critical, f"Critical console/page errors detected: {critical}"


def test_mobile_no_signin_tab_when_authenticated_and_session_persists():
    os.makedirs(SCREENSHOT_DIR, exist_ok=True)
    errors = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 412, "height": 915})
        page.on("pageerror", lambda exc: errors.append(str(exc)))

        # 1. Start at Hero Gateway (?hero=1) and sign in as Virat Sharma (CAPTAIN, PLAYER)
        page.goto(MOBILE_HERO_URL, wait_until="domcontentloaded")
        page.wait_for_timeout(350)
        page.click("#btnMobileHeroProceedToLogin")
        page.wait_for_timeout(150)
        page.click("#btnMobileAccountCaptain")
        page.wait_for_timeout(250)

        auth_nav_state = page.evaluate("""() => {
            const app = window.cricosMobileApp;
            const navScreens = Array.from(document.querySelectorAll('#mobileBottomNav .mobile-nav-item')).map(
                btn => btn.getAttribute('data-screen')
            );
            const signInTab = document.querySelector('#mobileBottomNav button[data-screen="AUTH"]');
            const session = app.client.getSession();
            const storedRaw = localStorage.getItem('cricos_session_v1');
            return {
                stage: app.heroGatewayStage,
                navScreens,
                signInTabExists: Boolean(signInTab),
                session,
                storedSession: storedRaw ? JSON.parse(storedRaw) : null
            };
        }""")

        assert auth_nav_state["stage"] == "AUTHENTICATED"
        assert auth_nav_state["signInTabExists"] is False, (
            f"Sign In tab (AUTH) must NOT appear in #mobileBottomNav when logged in! Found navScreens={auth_nav_state['navScreens']}"
        )
        assert "AUTH" not in auth_nav_state["navScreens"]
        assert auth_nav_state["session"] is not None
        assert auth_nav_state["session"]["token"] == "jwt_captain_player"
        assert auth_nav_state["storedSession"] is not None
        assert auth_nav_state["storedSession"]["name"] == "Virat Sharma"
        assert auth_nav_state["storedSession"]["allowedPersonas"] == ["CAPTAIN", "PLAYER"]

        # 2. Navigate to PROFILE tab and verify #mobileActiveSessionBadge is displayed
        page.click('#mobileBottomNav button[data-screen="PROFILE"]')
        page.wait_for_timeout(200)

        profile_badge_text = page.locator("#mobileActiveSessionBadge").inner_text()
        assert "JWT Session Active" in profile_badge_text
        assert "Virat Sharma" in profile_badge_text

        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "test_71_mobile_authenticated_no_signin_tab.png"))

        # 3. Reload into MOBILE_BASE_URL (without ?hero=1) and verify session persists & Sign In tab stays absent
        page.goto(MOBILE_BASE_URL, wait_until="domcontentloaded")
        page.wait_for_timeout(300)

        reloaded_state = page.evaluate("""() => {
            const app = window.cricosMobileApp;
            const navScreens = Array.from(document.querySelectorAll('#mobileBottomNav .mobile-nav-item')).map(
                btn => btn.getAttribute('data-screen')
            );
            return {
                stage: app.heroGatewayStage,
                name: app.profile.name,
                persona: app.profile.persona,
                allowedPersonas: app.allowedPersonas,
                strictPersonaLock: app.strictPersonaLock,
                hasSession: Boolean(app.client.getSession()),
                navScreens
            };
        }""")
        assert reloaded_state["stage"] == "AUTHENTICATED"
        assert reloaded_state["name"] == "Virat Sharma"
        assert reloaded_state["allowedPersonas"] == ["CAPTAIN", "PLAYER"]
        assert reloaded_state["strictPersonaLock"] is True
        assert reloaded_state["hasSession"] is True
        assert "AUTH" not in reloaded_state["navScreens"]

        # 4. Sign out via logoutToHero() and verify session is cleared
        page.evaluate("window.cricosMobileApp.logoutToHero()")
        page.wait_for_timeout(200)

        logged_out_state = page.evaluate("""() => ({
            stage: window.cricosMobileApp.heroGatewayStage,
            clientSession: window.cricosMobileApp.client.getSession(),
            storedSession: localStorage.getItem('cricos_session_v1'),
            heroOverlayVisible: Boolean(document.getElementById('mobileHeroAuthOverlay'))
        })""")
        assert logged_out_state["stage"] == "HERO"
        assert logged_out_state["clientSession"] is None
        assert logged_out_state["storedSession"] is None
        assert logged_out_state["heroOverlayVisible"] is True

        assert_no_critical_errors(errors)
        browser.close()


def test_desktop_session_persistence_and_logout():
    os.makedirs(SCREENSHOT_DIR, exist_ok=True)
    errors = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.on("pageerror", lambda exc: errors.append(str(exc)))

        page.goto(DESKTOP_HERO_URL, wait_until="domcontentloaded")
        page.wait_for_timeout(350)
        page.click("#btnHeroProceedToLogin")
        page.wait_for_timeout(150)
        page.click("#btnLoginAccountScorer")
        page.wait_for_timeout(250)

        desktop_session = page.evaluate("""() => {
            const raw = localStorage.getItem('cricos_session_v1');
            return {
                isAuthenticated: currentUser.isAuthenticated,
                sessionToken: currentUser.sessionToken,
                persona: currentUser.persona,
                stored: raw ? JSON.parse(raw) : null
            };
        }""")
        assert desktop_session["isAuthenticated"] is True
        assert desktop_session["sessionToken"] == "jwt_scorer_only"
        assert desktop_session["persona"] == "SCORER"
        assert desktop_session["stored"]["name"] == "Sunil Gavaskar"

        # Reload into DESKTOP_BASE_URL and verify session is restored automatically
        page.goto(DESKTOP_BASE_URL, wait_until="domcontentloaded")
        page.wait_for_timeout(300)

        restored_desktop = page.evaluate("""() => ({
            isAuthenticated: currentUser.isAuthenticated,
            name: currentUser.name,
            persona: currentUser.persona,
            allowedPersonas: currentUser.allowedPersonas,
            strictPersonaLock: currentUser.strictPersonaLock,
            overlayDisplay: getComputedStyle(document.getElementById('cricosHeroAuthOverlay')).display
        })""")
        assert restored_desktop["isAuthenticated"] is True
        assert restored_desktop["name"] == "Sunil Gavaskar"
        assert restored_desktop["persona"] == "SCORER"
        assert restored_desktop["allowedPersonas"] == ["SCORER"]
        assert restored_desktop["strictPersonaLock"] is True
        assert restored_desktop["overlayDisplay"] == "none"

        # Sign out and verify session cleared
        page.evaluate("logoutToHero()")
        page.wait_for_timeout(150)

        signed_out_desktop = page.evaluate("""() => ({
            isAuthenticated: currentUser.isAuthenticated,
            storedSession: localStorage.getItem('cricos_session_v1'),
            overlayDisplay: getComputedStyle(document.getElementById('cricosHeroAuthOverlay')).display
        })""")
        assert signed_out_desktop["isAuthenticated"] is False
        assert signed_out_desktop["storedSession"] is None
        assert signed_out_desktop["overlayDisplay"] != "none"

        assert_no_critical_errors(errors)
        browser.close()
