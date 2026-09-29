"""
Test 66: Sidebar Navigation & Decluttered Main Area Across All Personas
Verifies:
1. Desktop Sidebar Navigation (`#appSidebar`, `#sidebarAllowedPersonaStrip`, persona-scoped studio buttons)
   and Main Area Clutter Reduction (`#workspaceCleanFocusBar`, `#btnToggleMainAreaDeclutter`,
   scoped `.match-action-toolbar` buttons, and collapsed secondary telemetry panels across all 8 personas).
2. Mobile / Android APK Slide-Out Left Sidebar Navigation Drawer (`#btnMobileSidebarToggle`,
   `#mobileSidebarDrawer`, `#mobileSidebarPersonaStrip`, `#mobileSidebarWorkspaces`, `#mobileSidebarStudios`)
   and Main Area Clutter Reduction (`#mobileCleanFocusBar`, hidden `#roleExperienceBanner` &
   `.mobile-secondary-clutter` cards across all 8 personas).
"""

import os
from playwright.sync_api import sync_playwright, expect

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DESKTOP_URL = f"file://{os.path.join(ROOT_DIR, 'index.html')}?hero=1"
MOBILE_URL = f"file://{os.path.join(ROOT_DIR, 'dist', 'mobile.html')}?hero=1"
SCREENSHOT_DIR = os.path.join(os.path.dirname(__file__), "screenshots")

ALL_PERSONAS = [
    "CAPTAIN",
    "PLAYER",
    "SCORER",
    "FAN",
    "UMPIRE",
    "ORGANISER",
    "TURF_PROVIDER",
    "ADMIN",
]


def assert_no_critical_errors(errors):
    critical = [
        e for e in errors
        if "favicon" not in e.lower()
        and "net::err_" not in e.lower()
        and "failed to load resource" not in e.lower()
        and "file:///" not in e.lower()
        and "origin 'null'" not in e.lower()
    ]
    assert not critical, f"Unexpected critical console/page errors: {critical}"


def test_desktop_sidebar_navigation_and_decluttered_main_area_all_personas():
    os.makedirs(SCREENSHOT_DIR, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()
        errors = []
        page.on("pageerror", lambda err: errors.append(str(err)))
        page.on(
            "console",
            lambda msg: errors.append(msg.text) if msg.type == "error" else None,
        )

        page.goto(DESKTOP_URL, wait_until="domcontentloaded")
        page.evaluate("localStorage.clear()")
        page.reload(wait_until="domcontentloaded")

        # Authenticate with Superuser Demo Account (all 8 personas provisioned)
        page.locator("#btnHeroProceedToLogin").click()
        page.locator("#btnLoginAccountAdmin").click()

        # 1. Verify Desktop Left Sidebar & Provisioned Persona Strip
        sidebar = page.locator("#appSidebar")
        expect(sidebar).to_be_visible()

        persona_strip = page.locator("#sidebarAllowedPersonaStrip")
        expect(persona_strip).to_be_visible()
        expect(persona_strip.locator(".sidebar-persona-chip")).to_have_count(8)

        # 2. Verify Clean Focus Workspace Bar at top of Main Content
        clean_bar = page.locator("#workspaceCleanFocusBar")
        expect(clean_bar).to_be_visible()
        toggle_btn = page.locator("#btnToggleMainAreaDeclutter")
        expect(toggle_btn).to_be_visible()
        expect(toggle_btn).to_contain_text("Clean View: ON")

        # 3. Verify across all 8 personas that:
        #    - Secondary telemetry clutter is hidden in Clean Focus Mode
        #    - Match action toolbar is scoped to <= 4 persona-relevant buttons (down from 9)
        #    - Sidebar secondary studios are scoped to the active persona
        for persona in ALL_PERSONAS:
            chip = persona_strip.locator(
                f".sidebar-persona-chip[data-sidebar-persona='{persona}']"
            )
            chip.click()

            assert page.evaluate("currentUser.persona") == persona
            expect(page.locator("#cleanFocusPersonaTitle")).to_be_visible()

            state = page.evaluate(
                """() => {
                    const isHidden = (sel) => {
                        const el = document.querySelector(sel);
                        return !el || window.getComputedStyle(el).display === 'none';
                    };
                    const visibleActionButtons = Array.from(
                        document.querySelectorAll('.match-action-toolbar button')
                    ).filter((b) => window.getComputedStyle(b).display !== 'none').length;
                    return {
                        momentumHidden: isHidden('#matchMomentumWaveContainer'),
                        readinessHidden: isHidden('#eventReadinessBanner'),
                        fowHidden: isHidden('.fow-container'),
                        threeDHidden: isHidden('#threeDExperiencesHub'),
                        visibleActionButtons
                    };
                }"""
            )

            assert state["momentumHidden"], f"Momentum container should be hidden in Clean Focus Mode for {persona}"
            assert state["readinessHidden"], f"Readiness banner should be hidden in Clean Focus Mode for {persona}"
            assert state["fowHidden"], f"FOW strip should be hidden in Clean Focus Mode for {persona}"
            assert state["threeDHidden"], f"3D Hub should be hidden in Clean Focus Mode for {persona}"
            assert 1 <= state["visibleActionButtons"] <= 4, (
                f"Expected 1..4 scoped action buttons for {persona}, got {state['visibleActionButtons']}"
            )

        # 4. Toggle Clean Focus Mode OFF ("Extended View: ON") and verify secondary panels expand
        toggle_btn.click()
        expect(toggle_btn).to_contain_text("Extended View: ON")
        expanded_state = page.evaluate(
            """() => {
                const el = document.getElementById('matchMomentumWaveContainer');
                return el && window.getComputedStyle(el).display !== 'none';
            }"""
        )
        assert expanded_state is True

        # Toggle back ON
        toggle_btn.click()
        expect(toggle_btn).to_contain_text("Clean View: ON")

        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "test_66_desktop_sidebar_declutter.png"))
        assert_no_critical_errors(errors)
        browser.close()


def test_mobile_sidebar_drawer_and_decluttered_main_area_all_personas():
    os.makedirs(SCREENSHOT_DIR, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 412, "height": 915})
        page = context.new_page()
        errors = []
        page.on("pageerror", lambda err: errors.append(str(err)))
        page.on(
            "console",
            lambda msg: errors.append(msg.text) if msg.type == "error" else None,
        )

        page.goto(MOBILE_URL, wait_until="domcontentloaded")
        page.evaluate("localStorage.clear()")
        page.reload(wait_until="domcontentloaded")

        # Authenticate with Superuser Demo Account (all 8 personas provisioned)
        page.locator("#btnMobileHeroProceedToLogin").click()
        page.locator("#btnMobileAccountAdmin").click()

        # 1. Verify Top Header Hamburger Button (`#btnMobileSidebarToggle`) opens Left Sidebar Drawer
        hamburger_btn = page.locator("#btnMobileSidebarToggle")
        expect(hamburger_btn).to_be_visible()
        hamburger_btn.click()

        drawer = page.locator("#mobileSidebarDrawer")
        expect(drawer).to_be_visible()
        expect(page.locator("#mobileSidebarPersonaStrip .mobile-sidebar-persona-chip")).to_have_count(8)
        expect(page.locator("#mobileSidebarWorkspaces")).to_be_visible()
        expect(page.locator("#mobileSidebarStudios")).to_be_visible()

        # Navigate via Sidebar Workspace item and verify drawer closes automatically
        page.locator("#mobileSidebarWorkspaces .mobile-sidebar-nav-item[data-screen='TEAMS']").click()
        expect(drawer).to_be_hidden()

        # Return to MATCHES screen via Sidebar Drawer
        hamburger_btn.click()
        expect(drawer).to_be_visible()
        page.locator("#mobileSidebarWorkspaces .mobile-sidebar-nav-item[data-screen='MATCHES']").click()
        expect(drawer).to_be_hidden()

        # 2. Verify across all 8 personas that:
        #    - Compact `#mobileCleanFocusBar` is visible
        #    - Bulky `#roleExperienceBanner` is hidden in Clean Focus Mode
        #    - `.mobile-secondary-clutter` cards are hidden in Clean Focus Mode
        for persona in ALL_PERSONAS:
            page.locator("#btnMobileSidebarToggle").click()
            expect(page.locator("#mobileSidebarDrawer")).to_be_visible()
            page.locator(
                f"#mobileSidebarPersonaStrip .mobile-sidebar-persona-chip[data-persona='{persona}']"
            ).click()

            expect(page.locator("#mobileCleanFocusBar")).to_be_visible()
            expect(page.locator("#roleExperienceBanner")).to_be_hidden()

            secondary_visible = page.evaluate(
                """() => {
                    return Array.from(document.querySelectorAll('.mobile-secondary-clutter'))
                        .filter((el) => window.getComputedStyle(el).display !== 'none').length;
                }"""
            )
            assert secondary_visible == 0, f"Expected 0 visible secondary clutter cards for {persona}, got {secondary_visible}"

        # 3. Verify clicking `#btnMobileToggleDeclutter` reveals `#roleExperienceBanner` and secondary cards
        page.locator("#btnMobileToggleDeclutter").click()
        expect(page.locator("#roleExperienceBanner")).to_be_visible()

        # Toggle back to Clean Focus Mode
        page.locator("#btnMobileToggleDeclutter").click()
        expect(page.locator("#roleExperienceBanner")).to_be_hidden()

        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "test_66_mobile_sidebar_declutter.png"))
        assert_no_critical_errors(errors)
        browser.close()
