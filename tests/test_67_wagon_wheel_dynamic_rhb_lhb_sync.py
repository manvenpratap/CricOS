"""
Test 67: Dynamic Wagon Wheel RHB / LHB Orientation Sync with Selected & On-Strike Batsman
Verifies that on both Desktop (dashboard.ts) and Mobile/APK (mobile-view.ts), every Wagon Wheel
dynamically flips between RHB (OFF-SIDE Left | ON-SIDE Right) and LHB (ON-SIDE Left | OFF-SIDE Right)
whenever:
  1. A batsman pill or dropdown option is selected (Virat RHB, Hardik LHB, Rishabh LHB, Surya RHB, Jadeja LHB)
  2. Either Crease Batter Card (Striker / Non-Striker) is clicked/tapped
  3. Strike rotates (manual Swap Strike, odd runs 1/3, or Match Center Swap Strike)
  4. Match Center / Analytics Wagon Wheel batter filter chips are toggled
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
        and "file:///" not in e.lower()
        and "origin 'null'" not in e.lower()
    ]
    assert not critical, f"Unexpected critical console/page errors: {critical}"


def test_desktop_wagon_wheel_dynamic_rhb_lhb_sync():
    os.makedirs(SCREENSHOT_DIR, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()
        console_errors = []
        page.on(
            "console",
            lambda msg: console_errors.append(msg.text) if msg.type == "error" else None,
        )
        page.on("pageerror", lambda err: console_errors.append(str(err)))

        page.goto(DESKTOP_URL, wait_until="domcontentloaded")
        page.wait_for_timeout(400)

        # Authenticate with Superuser Demo Account and switch to SCORER persona
        page.locator("#btnHeroProceedToLogin").click()
        page.locator("#btnLoginAccountAdmin").click()
        page.locator("#sidebarAllowedPersonaStrip .sidebar-persona-chip[data-sidebar-persona='SCORER']").click()
        page.evaluate("switchTab('studio')")
        page.wait_for_timeout(250)

        # Verify initial on-strike batter is Virat Sharma (RHB)
        init_state = page.evaluate("""() => ({
            striker: studioStriker.name,
            nonStriker: studioNonStriker.name,
            currentStance: currentStance,
            sideLegend: document.getElementById('wagonSideLegend')?.textContent?.trim(),
            labelOff: document.getElementById('wagonLabelOff')?.textContent?.trim(),
            labelLeg: document.getElementById('wagonLabelLeg')?.textContent?.trim(),
            topLeftZone: document.getElementById('wedge_top_left')?.getAttribute('data-zone'),
            topRightZone: document.getElementById('wedge_top_right')?.getAttribute('data-zone'),
            btnRhbActive: document.getElementById('btnStanceRhb')?.classList.contains('active')
        })""")
        assert init_state["striker"] == "Virat Sharma"
        assert init_state["currentStance"] == "RHB"
        assert init_state["btnRhbActive"] is True
        assert "OFF-SIDE (Left)" in init_state["sideLegend"]
        assert init_state["labelOff"] == "◀ OFF SIDE"
        assert init_state["labelLeg"] == "ON SIDE ▶"
        assert init_state["topLeftZone"] == "THIRD_MAN"
        assert init_state["topRightZone"] == "FINE_LEG"

        # 1. Click Hardik Patel (LHB) pill button -> Wagon Wheel must flip to LHB
        page.locator("#wagonBatterBtn_Hardik").click()
        page.wait_for_timeout(150)
        hardik_state = page.evaluate("""() => ({
            currentStance: currentStance,
            filter: currentBatterFilter,
            dropdownVal: document.getElementById('wagonBatterSelectDropdown')?.value,
            sideLegend: document.getElementById('wagonSideLegend')?.textContent?.trim(),
            labelOff: document.getElementById('wagonLabelOff')?.textContent?.trim(),
            labelLeg: document.getElementById('wagonLabelLeg')?.textContent?.trim(),
            topLeftZone: document.getElementById('wedge_top_left')?.getAttribute('data-zone'),
            topRightZone: document.getElementById('wedge_top_right')?.getAttribute('data-zone'),
            btnLhbActive: document.getElementById('btnStanceLhb')?.classList.contains('active')
        })""")
        assert hardik_state["currentStance"] == "LHB"
        assert hardik_state["filter"] == "Hardik Patel"
        assert hardik_state["dropdownVal"] == "Hardik Patel"
        assert hardik_state["btnLhbActive"] is True
        assert "ON-SIDE (Left) | OFF-SIDE (Right)" in hardik_state["sideLegend"]
        assert hardik_state["labelOff"] == "OFF SIDE ▶"
        assert hardik_state["labelLeg"] == "◀ ON SIDE"
        assert hardik_state["topLeftZone"] == "FINE_LEG"
        assert hardik_state["topRightZone"] == "THIRD_MAN"

        # 2. Select squad batsmen via #wagonBatterSelectDropdown (Suryakumar RHB -> Rishabh LHB -> Rohit RHB)
        page.locator("#wagonBatterSelectDropdown").select_option("Suryakumar Yadav")
        page.wait_for_timeout(120)
        assert page.evaluate("currentStance") == "RHB"
        assert "OFF-SIDE (Left)" in page.locator("#wagonSideLegend").inner_text()

        page.locator("#wagonBatterSelectDropdown").select_option("Rishabh Pant")
        page.wait_for_timeout(120)
        assert page.evaluate("currentStance") == "LHB"
        assert "ON-SIDE (Left)" in page.locator("#wagonSideLegend").inner_text()

        # 3. Click Crease Cards (#studioStrikerCard and #studioNonStrikerCard)
        page.locator("#studioStrikerCard").click()
        page.wait_for_timeout(120)
        assert page.evaluate("currentStance") == "RHB"
        assert page.evaluate("currentBatterFilter") == "Virat Sharma"

        page.locator("#studioNonStrikerCard").click()
        page.wait_for_timeout(120)
        assert page.evaluate("currentStance") == "LHB"
        assert page.evaluate("currentBatterFilter") == "Hardik Patel"

        # 4. Swap strike (swapStudioStrike) and verify dynamic flip + no pill overwrite bug
        page.evaluate("filterWagonBatter('Virat Sharma');")
        assert page.evaluate("currentStance") == "RHB"
        page.evaluate("swapStudioStrike();")
        page.wait_for_timeout(150)
        after_swap = page.evaluate("""() => ({
            striker: studioStriker.name,
            currentStance: currentStance,
            filter: currentBatterFilter,
            viratBtnText: document.getElementById('wagonBatterBtn_Virat')?.textContent?.trim(),
            hardikBtnText: document.getElementById('wagonBatterBtn_Hardik')?.textContent?.trim()
        })""")
        assert after_swap["striker"] == "Hardik Patel"
        assert after_swap["currentStance"] == "LHB"
        assert after_swap["filter"] == "Hardik Patel"
        # Ensure Virat button stays Virat Sharma and Hardik button stays Hardik Patel
        assert "Virat Sharma" in after_swap["viratBtnText"]
        assert "Hardik Patel" in after_swap["hardikBtnText"]

        # 5. Open Match Center Analytics Wagon Wheel and verify sync
        page.evaluate("switchTab('overview'); if (typeof isMainAreaDecluttered !== 'undefined' && isMainAreaDecluttered) toggleMainAreaDeclutter(); showMatchChart('WAGON');")
        page.wait_for_timeout(150)
        mc_state = page.evaluate("""() => ({
            badge: document.getElementById('mcWagonStanceBadge')?.textContent?.trim(),
            lblOff: document.getElementById('mcWagonLabelOff')?.textContent?.trim(),
            lblLeg: document.getElementById('mcWagonLabelLeg')?.textContent?.trim(),
            zoneSel: document.getElementById('mcWagonZoneSelected')?.textContent?.trim()
        })""")
        assert mc_state["badge"] == "LHB"
        assert mc_state["lblOff"] == "OFF ▶"
        assert mc_state["lblLeg"] == "◀ ON"
        assert "ON-SIDE (Left)" in mc_state["zoneSel"]

        # Click Virat Sharma inside Match Center Wagon Wheel -> both Match Center and Studio flip to RHB
        page.locator("#btnMcWagon_Virat").dispatch_event("click")
        page.wait_for_timeout(150)
        assert page.locator("#mcWagonStanceBadge").inner_text().strip() == "RHB"
        assert page.evaluate("currentStance") == "RHB"

        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "test_67_desktop_wagon_wheel_rhb_lhb.png"))
        assert_no_critical_errors(console_errors)
        browser.close()


def test_mobile_wagon_wheel_dynamic_rhb_lhb_sync():
    os.makedirs(SCREENSHOT_DIR, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 412, "height": 915})
        page = context.new_page()
        console_errors = []
        page.on(
            "console",
            lambda msg: console_errors.append(msg.text) if msg.type == "error" else None,
        )
        page.on("pageerror", lambda err: console_errors.append(str(err)))

        page.goto(MOBILE_URL, wait_until="domcontentloaded")
        page.evaluate("localStorage.clear()")
        page.reload(wait_until="domcontentloaded")

        # Authenticate with Superuser Demo Account and switch to SCORER on Matches -> SCORE
        page.locator("#btnMobileHeroProceedToLogin").click()
        page.locator("#btnMobileAccountAdmin").click()
        page.locator("#btnMobileSidebarToggle").click()
        page.locator("#mobileSidebarPersonaStrip .mobile-sidebar-persona-chip[data-persona='SCORER']").click()
        page.evaluate("""() => {
            const app = window.cricosMobileApp;
            app.navigateTo('MATCHES');
            app.setMatchSubTab('SCORE');
        }""")
        page.wait_for_timeout(250)

        # Verify initial striker Virat K. (RHB) and non-striker Rohit S. (LHB)
        m_init = page.evaluate("""() => {
            const app = window.cricosMobileApp;
            return {
                striker: app.matchState.striker.name,
                currentStance: app.currentStance,
                strikerBadge: document.getElementById('mobileStrikerStanceBadge')?.textContent?.trim(),
                nonStrikerBadge: document.getElementById('mobileNonStrikerStanceBadge')?.textContent?.trim(),
                firstWedgeId: app.getWedgesForStance(app.currentStance)[0].id
            };
        }""")
        assert m_init["striker"] == "Virat K."
        assert m_init["currentStance"] == "RHB"
        assert m_init["strikerBadge"] == "RHB"
        assert m_init["nonStrikerBadge"] == "LHB"
        assert m_init["firstWedgeId"] == "THIRD_MAN"

        # 1. Tap Rohit S. (LHB) pill (#mobileWagonBtn_Rohit) -> Wagon Wheel flips to LHB while Crease Badges stay true
        page.locator("#mobileWagonBtn_Rohit").click()
        page.wait_for_timeout(150)
        m_rohit = page.evaluate("""() => {
            const app = window.cricosMobileApp;
            return {
                currentStance: app.currentStance,
                analyticsWagonStance: app.analyticsWagonStance,
                strikerBadge: document.getElementById('mobileStrikerStanceBadge')?.textContent?.trim(),
                nonStrikerBadge: document.getElementById('mobileNonStrikerStanceBadge')?.textContent?.trim(),
                firstWedgeId: app.getWedgesForStance(app.currentStance)[0].id
            };
        }""")
        assert m_rohit["currentStance"] == "LHB"
        assert m_rohit["analyticsWagonStance"] == "LHB"
        assert m_rohit["strikerBadge"] == "RHB"
        assert m_rohit["nonStrikerBadge"] == "LHB"
        assert m_rohit["firstWedgeId"] == "FINE_LEG"

        # 2. Select squad batsmen via #mobileWagonBatterSelect dropdown
        page.locator("#mobileWagonBatterSelect").select_option("Surya Y.")
        page.wait_for_timeout(120)
        assert page.evaluate("window.cricosMobileApp.currentStance") == "RHB"

        page.locator("#mobileWagonBatterSelect").select_option("Rishabh P.")
        page.wait_for_timeout(120)
        assert page.evaluate("window.cricosMobileApp.currentStance") == "LHB"

        # 3. Tap #mobileStrikerCard (Virat K. RHB) -> flips back to RHB
        page.locator("#mobileStrikerCard").click()
        page.wait_for_timeout(120)
        assert page.evaluate("window.cricosMobileApp.currentStance") == "RHB"

        # 4. Tap #btnMobileSwapStrike -> rotates Rohit S. (LHB) onto strike and flips Wagon Wheel to LHB
        page.locator("#btnMobileSwapStrike").click()
        page.wait_for_timeout(150)
        m_swapped = page.evaluate("""() => {
            const app = window.cricosMobileApp;
            return {
                striker: app.matchState.striker.name,
                currentStance: app.currentStance,
                strikerBadge: document.getElementById('mobileStrikerStanceBadge')?.textContent?.trim(),
                nonStrikerBadge: document.getElementById('mobileNonStrikerStanceBadge')?.textContent?.trim()
            };
        }""")
        assert m_swapped["striker"] == "Rohit S."
        assert m_swapped["currentStance"] == "LHB"
        assert m_swapped["strikerBadge"] == "LHB"
        assert m_swapped["nonStrikerBadge"] == "RHB"

        # 5. Switch to Analytics -> Wagon Wheel and verify dynamic stance sync
        page.evaluate("""() => {
            const app = window.cricosMobileApp;
            app.setMatchSubTab('ANALYTICS');
            app.toggleChart('WAGON');
        }""")
        page.wait_for_timeout(150)
        assert "LHB ORIENTATION" in page.locator("#mobileAnalyticsWagonOrientation").inner_text()

        # Click Virat K. [RHB] chip in Analytics Wagon Wheel -> flips to RHB
        page.locator("#mobileWagonPanel button[data-batter='Virat K.']").click()
        page.wait_for_timeout(150)
        assert "RHB ORIENTATION" in page.locator("#mobileAnalyticsWagonOrientation").inner_text()
        assert page.evaluate("window.cricosMobileApp.currentStance") == "RHB"

        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "test_67_mobile_wagon_wheel_rhb_lhb.png"))
        assert len(console_errors) == 0, f"Unexpected console errors: {console_errors}"
        browser.close()
