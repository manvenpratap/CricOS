# CricOS — iOS Native Client Application

Native iOS application for the **CricOS Unified Cricket Operating System**, targeting iOS 16.0+ across iPhone and iPad devices.

---

## 1. Architectural Highlights

- **UI Framework**: SwiftUI + WebKit (`WKWebView`) container.
- **Visual Design**: Strict adherence to CricOS Floodlit Stadium Broadcast tokens:
  - Base Obsidian: `#04070D`
  - Turf Emerald: `#00E599`
  - Electric Cyan: `#00D2FF`
  - Deep Gold / Amber: `#FFB800`
  - Boundary Rose: `#FF3366`
- **Native Taptic Feedback Engine (`HapticsManager`)**:
  - `UIImpactFeedbackGenerator` (`light`, `medium`, `heavy`, `rigid`, `soft`)
  - `UINotificationFeedbackGenerator` (`success`, `warning`, `error`)
  - `UISelectionFeedbackGenerator`
  - Seamlessly triggered via JavaScript bridge (`window.cricosNativeHaptic('SUCCESS')`).
- **Native Share Integration (`NativeBridge`)**:
  - `UIActivityViewController` for sharing match scorecards, player cards, and tournament brackets.
- **Offline First**:
  - Self-contained offline distribution bundle embedded inside `CricOS/Resources/www/index.html`.
  - Works on remote cricket fields with zero internet connection.
- **Privacy & Store Compliance**:
  - **WWDC 2024 Privacy Manifest (`PrivacyInfo.xcprivacy`)**: Fully declared API types and zero tracking (`NSPrivacyTracking = false`).
  - **Apple Guideline 5.1.1(v)**: In-app permanent account deletion with confirmation dialog.

---

## 2. Project Directory Structure

```
apps/mobile/ios/
├── CricOS/
│   ├── App/
│   │   ├── CricOSApp.swift       # SwiftUI @main App entrypoint & window configuration
│   │   ├── ContentView.swift     # Root view hierarchy & background styling
│   │   ├── CricOSWebView.swift   # WKWebView wrapper with edge-to-edge layout & script injection
│   │   ├── NativeBridge.swift    # WKScriptMessageHandler handling HAPTIC, SHARE, COPY
│   │   └── HapticsManager.swift  # Taptic Engine feedback manager
│   └── Resources/
│       ├── Assets.xcassets/      # 1024x1024 universal app icon & color assets
│       ├── Info.plist            # App bundle metadata, permissions & light status bar
│       ├── PrivacyInfo.xcprivacy # Apple WWDC 2024 Privacy Manifest
│       └── www/
│           └── index.html        # Embedded offline single-file distribution bundle
├── CricOS.xcodeproj/             # Xcode project specification (iOS 16+, Swift 5.0)
├── build-ios.sh                  # Automated packaging and asset synchronization script
└── README.md                     # Technical documentation
```

---

## 3. Developer Workflows

### Opening in Xcode
```bash
open apps/mobile/ios/CricOS.xcodeproj
```

### Packaging & Distribution Sync
```bash
# Via universal pipeline:
./pipeline.sh ios

# Or directly:
bash apps/mobile/ios/build-ios.sh
```

### Building via EAS Build (Cloud CI)
```bash
cd apps/mobile
pnpm run build:ios
```

---

## 4. App Store Review Guidelines Compliance

| Guideline | Implementation Detail | Status |
| :--- | :--- | :--- |
| **5.1.1(v) Account Deletion** | In-app irreversible account deletion sheet (`#actionSheetModal`) with double-entry refund journal trigger and native confirmation | ✅ Passed |
| **WWDC 2024 Privacy Manifest** | `PrivacyInfo.xcprivacy` with zero tracking domains and declared functional data usage | ✅ Passed |
| **Design Invariants** | Pitch dark `#04070D` status bar, zero `transition: all`, safe area edge-to-edge support | ✅ Passed |
| **Demo Review Account** | Phone: `+91 98765 43210` with staging OTP `123456` or `4821` (Captain persona) | ✅ Verified |
