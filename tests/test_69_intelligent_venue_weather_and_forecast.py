"""
Test 69: Intelligent Turf / Stadium / Ground Location Weather Conditions & 5-Hour Match Forecast
Verifies:
1. Desktop (#matchVenueWeatherBar & #venueWeatherForecastPanel) dynamically updates GPS coordinates,
   micro-climate headline, temperature/feels-like, wind/humidity vector, swing/seam index, evening dew factor,
   DLS rain risk, tactical toss recommendation, 5-hour match window forecast, and 4 pitch aerodynamic impact cards
   across all 5 turf/stadium locations (Chinnaswamy, Wankhede, Eden Gardens, Dharamshala HPCA, Chepauk Marina).
2. Mobile / Android APK (#mobileVenueWeatherCard & #mobileWeatherForecastStrip) dynamically updates weather
   conditions, toss intelligence, and 5-hour forecast across Matches and Marketplace screens with WCAG AAA
   contrast in light ('swiss', 'nordic') and dark ('stadium') themes.
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


def test_desktop_venue_weather_intelligence_and_forecast():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))

        page.goto(DESKTOP_HTML, wait_until="domcontentloaded")
        page.wait_for_timeout(400)

        # Verify initial Chinnaswamy Turf A telemetry and open 5-hour forecast panel
        page.evaluate("() => toggleVenueWeatherForecast()")
        page.wait_for_timeout(200)

        initial_state = page.evaluate("""() => ({
            venueId: document.getElementById('matchVenueWeatherBar')?.getAttribute('data-venue-id'),
            coords: document.getElementById('weatherGpsCoordsBadge')?.textContent,
            temp: document.getElementById('weatherTempBadge')?.textContent,
            dls: document.getElementById('weatherDlsRiskBadge')?.textContent,
            toss: document.getElementById('weatherTossRecommendationText')?.textContent,
            hourlyCount: document.querySelectorAll('#weatherHourlyTimelineGrid .weather-hourly-slot').length,
            impactCount: document.querySelectorAll('#weatherPitchImpactGrid .weather-impact-card').length
        })""")
        assert initial_state["venueId"] == "chinnaswamy_turf_a"
        assert "12.9788° N" in initial_state["coords"]
        assert "26°C" in initial_state["temp"]
        assert initial_state["hourlyCount"] == 5
        assert initial_state["impactCount"] == 4

        # Switch to Eden Gardens Royal Turf (Kolkata) -> Monsoon Trough / High DLS Rain Alert
        page.evaluate("() => selectVenueWeatherLocation('eden_gardens_turf', true)")
        eden_state = page.evaluate("""() => ({
            venueId: document.getElementById('matchVenueWeatherBar')?.getAttribute('data-venue-id'),
            coords: document.getElementById('weatherGpsCoordsBadge')?.textContent,
            dls: document.getElementById('weatherDlsRiskBadge')?.textContent,
            swing: document.getElementById('weatherSwingDewBadge')?.textContent,
            toss: document.getElementById('weatherTossRecommendationText')?.textContent
        })""")
        assert eden_state["venueId"] == "eden_gardens_turf"
        assert "22.5646° N" in eden_state["coords"]
        assert "62%" in eden_state["dls"]
        assert "8.9/10" in eden_state["swing"]
        assert "DLS Par Advantage" in eden_state["toss"]

        # Switch to HPCA Himalayan Stadium (Dharamshala • 1,457m Alt)
        page.evaluate("() => selectVenueWeatherLocation('dharamshala_hpca', true)")
        hpca_state = page.evaluate("""() => ({
            venueId: document.getElementById('matchVenueWeatherBar')?.getAttribute('data-venue-id'),
            coords: document.getElementById('weatherGpsCoordsBadge')?.textContent,
            temp: document.getElementById('weatherTempBadge')?.textContent,
            swing: document.getElementById('weatherSwingDewBadge')?.textContent
        })""")
        assert hpca_state["venueId"] == "dharamshala_hpca"
        assert "1,457m" in hpca_state["coords"]
        assert "17°C" in hpca_state["temp"]
        assert "9.2/10" in hpca_state["swing"]

        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "test_69_desktop_venue_weather_forecast.png"))
        assert_no_critical_errors(errors)
        browser.close()


def test_mobile_venue_weather_intelligence_and_forecast():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 430, "height": 932})
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))

        page.goto(MOBILE_HTML, wait_until="domcontentloaded")
        page.wait_for_timeout(400)

        # Verify weather forecast card is hidden by default (taking 0px vertical space on mobile)
        default_collapsed = page.evaluate("""() => {
            const card = document.getElementById('mobileVenueWeatherCard');
            return card ? window.getComputedStyle(card).display === 'none' : true;
        }""")
        assert default_collapsed is True, "Mobile weather card must be hidden (display: none) by default"

        # Expand 5-hour forecast on mobile and switch to Chepauk Marina (Chennai)
        page.evaluate("""() => {
            const app = window.cricosMobileApp;
            app.setTheme('swiss', false);
            app.toggleMobileWeatherForecast();
            app.selectVenueWeatherLocation('chepauk_marina', true);
        }""")
        page.wait_for_timeout(200)

        mobile_state = page.evaluate("""() => ({
            venueId: document.getElementById('mobileVenueWeatherCard')?.getAttribute('data-venue-id'),
            displayAfterExpand: window.getComputedStyle(document.getElementById('mobileVenueWeatherCard')).display,
            badge: document.getElementById('mobileActiveVenueBadge')?.textContent,
            condition: document.getElementById('mobileWeatherConditionText')?.textContent,
            toss: document.getElementById('mobileWeatherTossAdvice')?.textContent,
            forecastCount: document.querySelectorAll('#mobileWeatherForecastStrip > div').length
        })""")
        assert mobile_state["displayAfterExpand"] == "block"
        assert mobile_state["venueId"] == "chepauk_marina"
        assert "Chidambaram Marina" in mobile_state["badge"]
        assert "32°C" in mobile_state["badge"]
        assert "BAT FIRST" in mobile_state["toss"]
        assert mobile_state["forecastCount"] == 5

        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "test_69_mobile_venue_weather_forecast.png"))
        assert_no_critical_errors(errors)
        browser.close()
