# 05 — Intelligent Turf/Stadium Weather & Pro Cricket Gear Store

---

## 1. Intelligent Turf / Stadium Location Weather & 5-Hour Match Forecast

Both Desktop (`#matchVenueWeatherBar` & `#venueWeatherForecastPanel` in `apps/api/src/ui/dashboard.ts:17790`) and Mobile/APK (`#mobileVenueWeatherCard` in `apps/api/src/ui/mobile-view.ts:6600`) compute ground-specific meteorological and aerodynamic conditions across **5 Iconic Cricket Venues**:

| Venue ID | Stadium / Turf Ground | GPS Coordinates & Elevation | Micro-Climate Signature & Tactical Toss Impact |
| :--- | :--- | :--- | :--- |
| `chinnaswamy_turf_a` | **M. Chinnaswamy Turf Arena (Bengaluru)** | `12.9788° N, 77.5996° E • 920m ASL` | High-altitude low air density (`+4.2m` six carry), evening dew onset at `19:30 IST`, Sub-Air `<7m` drainage. **Toss: BOWL FIRST (64% chase win)** |
| `wankhede_arena` | **Wankhede Arena Turf Club (Mumbai)** | `18.9389° N, 72.8258° E • 8m ASL` | Humid `78% RH` Arabian Sea cross-breeze (`24 km/h NW`), `2.1°` late swing in Powerplay, heavy `19:15 IST` dew. **Toss: BOWL FIRST** |
| `eden_gardens_turf` | **Eden Gardens Royal Turf (Kolkata)** | `22.5646° N, 88.3433° E • 9m ASL` | Hooghly riverfront `84% RH`, earliest dew point crossing (`18:50 IST`), `34%` passing shower probability (`DLS Moderate`). **Toss: BOWL FIRST** |
| `dharamshala_hpca` | **HPCA Himalayan Stadium (Dharamshala)** | `32.1976° N, 76.3258° E • 1,457m ASL` | Cool `19°C` Dhauladhar mountain air, extreme `2.6°` new-ball seam/swing movement + `+6.5m` altitude carry, `42%` rain risk. **Toss: BOWL FIRST** |
| `chepauk_marina` | **M. A. Chidambaram Marina (Chennai)** | `13.0628° N, 80.2793° E • 7m ASL` | Warm `33°C` Marina sea breeze, abrasive dry black-clay surface offering `4.8°` sharp spin turn in 2nd innings, `8%` rain risk. **Toss: BAT FIRST** |

---

## 2. Pro Cricket Gear, Match Balls & Pavilion Equipment Store

Accessible via **`🛍️ Gear Store`** in the Desktop Left Sidebar (`#sidebarBtnGearStore`), **`🛍️ Pro Gear Store & Kit Bag`** in the Marketplace toolbar (`#btnOpenGearStoreFromMarketplace`), and **`🛍️ Pro Cricket Gear Store`** on Mobile/APK (`#mobileGearStoreContainer`):

- **10 Certified Products Across 6 Categories (`ALL`, `BATS`, `BALLS`, `PROTECTIVE`, `NETS_TECH`, `TROPHIES`)**:
  - English Willow Grade 1+ & Carbon-Composite T20 Bats (`SH`, `LH`, `Harrow` handles).
  - Kookaburra White, SG Test Red & Pink Twilight Match Leather Balls (`Box of 6`, MCC Law 4 156g).
  - BS7928:2013 Titanium Grill Helmets (`Medium`, `Large`, `XL`) & Test Batting Legguards/Pittards Gloves (`RHB` & `LHB`).
  - Smart 9-Axis IMU Bluetooth 5.3 Telemetry Cricket Balls & 12x4m Pro Practice Net Cages with 150 km/h Bowling Machines.
  - 24-Inch Gold-Plated Championship Trophies & 16 Engraved Medals.
- **3D Bat Customizer Integration**:
  - Designing a bespoke blade in `#modal3DBatCustomizer` (`addCustomBatToBasket()`) or Mobile `openGearCustomizerSheet()` (`addCustomMobileBatToCart()`) injects the exact customized willow grade, grip color, and price directly into the live **Match Kit Bag**.
- **Promo Engine, 18% GST Invoice & 45-Min Express Turf Pavilion Checkout**:
  - Supports `CRIC20` (`20% OFF`), `TURF500` (`₹500 Flat OFF`), and `CAPTAIN10` (`10% Squad Discount`).
  - Automatically calculates `Subtotal`, `Promo Discount`, `18% GST (Input Tax Credit Eligible)`, and `FREE 45-Min Express Stadium Pavilion Delivery`, creating live tracked orders (`ORD-GEAR-XXXX`).
