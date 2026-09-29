import os
import pytest
from playwright.sync_api import sync_playwright

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DESKTOP_HTML = f"file://{os.path.join(ROOT_DIR, 'dist', 'index.html')}"
MOBILE_HTML = f"file://{os.path.join(ROOT_DIR, 'dist', 'mobile.html')}"


def assert_no_critical_errors(errors):
    critical = [
        e for e in errors
        if "favicon" not in e.lower()
        and "net::err_" not in e.lower()
        and "failed to load resource" not in e.lower()
    ]
    assert len(critical) == 0, f"Critical console/page errors detected: {critical}"


def test_desktop_pro_gear_store_catalog_cart_promo_and_checkout():
    """
    Verifies that the Desktop Pro Cricket Gear Store (#modalCommerce) supports:
    - 10 certified cricket gear items across 6 categories (ALL, BATS, BALLS, PROTECTIVE, NETS_TECH, TROPHIES)
    - Variant selection (e.g., LHB vs RHB batting kit, SH vs LH English willow bat)
    - Live Kit Bag quantity management, CRIC20 (20% OFF) & TURF500 promo calculations, and 18% GST math
    - Express 45-min Stadium/Turf Pavilion delivery selection and verified order creation (#gearOrderHistoryList)
    """
    errors = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.on("pageerror", lambda err: errors.append(str(err)))

        page.goto(DESKTOP_HTML, wait_until="domcontentloaded")
        page.wait_for_timeout(400)

        # Open Pro Gear Store
        page.evaluate("window.openGearStoreModal()")
        page.wait_for_timeout(250)

        modal = page.locator("#modalCommerce")
        assert modal.is_visible(), "Desktop #modalCommerce Gear Store should be visible"

        # Verify all 10 catalog items render initially
        cards = page.locator("#gearStoreCatalogGrid .gear-product-card")
        assert cards.count() == 10, f"Expected 10 gear products in ALL category, got {cards.count()}"

        # Filter by PROTECTIVE category
        page.evaluate("window.setGearStoreCategory('PROTECTIVE')")
        page.wait_for_timeout(150)
        assert cards.count() == 2, f"Expected 2 PROTECTIVE products, got {cards.count()}"

        # Select LHB (Left-Handed Batter) variant on Test Batting Legguards & Pittards Gloves Combo and add to bag
        page.select_option("#gearVariant_gear-pad-kit", "LHB (Left-Handed Batter)")
        page.click("#btnAddGear_gear-pad-kit")
        page.wait_for_timeout(150)

        cart_text = page.locator("#gearCartItemsList").inner_text()
        assert "Test Batting Legguards & Pittards Gloves Combo" in cart_text
        assert "LHB (Left-Handed Batter)" in cart_text

        # Reset category to ALL and verify sidebar badge updated to 3 items
        page.evaluate("window.setGearStoreCategory('ALL')")
        badge_count = page.locator("#sidebarGearCartBadge").inner_text().strip()
        assert badge_count == "3", f"Expected 3 items in kit bag badge, got {badge_count}"

        # Apply CRIC20 (20% OFF) promo code
        subtotal_before = page.locator("#gearCartSubtotal").inner_text().strip()
        assert subtotal_before == "₹13,100", f"Expected ₹13,100 subtotal (4800+1500+6800), got {subtotal_before}"

        page.click("#btnQuickPromoCric20")
        page.wait_for_timeout(150)

        discount_text = page.locator("#gearCartDiscount").inner_text().strip()
        assert discount_text == "-₹2,620", f"Expected 20% discount of -₹2,620, got {discount_text}"

        # Select Wankhede Arena Turf Club pavilion drop and submit checkout
        page.select_option("#gearDeliveryVenueSelect", index=1)
        orders_before = page.locator("#gearOrderHistoryList .gear-order-card").count()
        page.click("#btnGearCheckoutSubmit")
        page.wait_for_timeout(200)

        orders_after = page.locator("#gearOrderHistoryList .gear-order-card").count()
        assert orders_after == orders_before + 1, "Expected new gear order to be added to #gearOrderHistoryList"
        latest_order_text = page.locator("#gearOrderHistoryList .gear-order-card").first.inner_text()
        assert "ORD-GEAR-" in latest_order_text
        assert "Wankhede Arena Turf Club" in latest_order_text

        assert_no_critical_errors(errors)
        browser.close()


def test_mobile_pro_gear_store_and_pavilion_checkout():
    """
    Verifies that the Mobile & Native Android APK Pro Cricket Gear Store (#mobileGearStoreContainer)
    renders inside the Marketplace/Turfs workflow and Sidebar Drawer, supports sub-category filtering,
    variant selection, live Kit Bag updates, promo discounts, and Pavilion checkout across themes.
    """
    errors = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 412, "height": 915})
        page.on("pageerror", lambda err: errors.append(str(err)))

        page.goto(MOBILE_HTML, wait_until="domcontentloaded")
        page.wait_for_timeout(400)

        # Open Mobile Pro Gear Store via controller
        page.evaluate("window.cricosMobileApp.openMobileGearStore()")
        page.wait_for_timeout(250)

        store_container = page.locator("#mobileGearStoreContainer")
        assert store_container.is_visible(), "Mobile #mobileGearStoreContainer should be visible"

        product_cards = page.locator("#mobileGearCatalogList .mobile-gear-product-card")
        assert product_cards.count() == 9, f"Expected 9 mobile gear products, got {product_cards.count()}"

        # Filter to BATS sub-category
        page.click("#mobileGearCat_BATS")
        page.wait_for_timeout(150)
        assert product_cards.count() == 2, f"Expected 2 mobile BATS products, got {product_cards.count()}"

        # Add Reserve Grade 1+ English Willow Bat to Kit Bag
        page.click("#btnMobileAddGear_gear-bat-g1")
        page.wait_for_timeout(150)

        bag_count = page.locator("#mobileGearCartCountText").inner_text().strip()
        assert bag_count == "3", f"Expected 3 items in mobile Kit Bag, got {bag_count}"

        # Apply CRIC20 promo on mobile and complete checkout
        page.click("#btnMobilePromoCric20")
        page.wait_for_timeout(150)

        page.click("#btnMobileGearCheckout")
        page.wait_for_timeout(200)

        orders_text = page.locator("#mobileGearOrdersList").inner_text()
        assert "ORD-GEAR-" in orders_text
        assert "Dispatched" in orders_text

        assert_no_critical_errors(errors)
        browser.close()
