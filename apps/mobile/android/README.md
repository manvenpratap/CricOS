# CricOS Android Native Project

Standalone native Android project for CricOS, packaging the consumer mobile application, match official desk, live scoring, and career analytics into a high-performance edge-to-edge hardware-accelerated Android APK.

---

## 📋 Project Specifications

| Specification | Value |
| :--- | :--- |
| **Application ID** | `com.cricos.app` (Debug suffix: `com.cricos.app.debug`) |
| **Compile SDK** | **33** (Android 13 / Tiramisu) |
| **Target SDK** | **33** |
| **Minimum SDK** | **24** (Android 7.0 / Nougat) |
| **Build Tools** | **33.0.2** |
| **Android Gradle Plugin** | **8.1.4** |
| **Gradle Version** | **8.5** |
| **Java Version** | **Java 17 (LTS)** |
| **Primary Artifact** | `app/build/outputs/apk/debug/app-debug.apk` $\to$ `dist/cricos-debug.apk` (~2.9 MB) |

---

## 🏗 Architecture & Features

- **Edge-to-Edge True Native Presentation**: Viewport scales to `100vw × 100dvh` without fake notches, desktop emulator status bars, or device frames. Status bar and navigation bar colors match the stadium dark theme (`#04070D`).
- **Hardware-Accelerated WebView**: Configured with `WebSettings.setDomStorageEnabled(true)`, `setDatabaseEnabled(true)`, and hardware canvas acceleration.
- **Remote Web Contents Debugging**: `WebView.setWebContentsDebuggingEnabled(true)` enables live DOM and network inspection via `chrome://inspect/#devices`.
- **Pre-Packaged Offline Assets**: Evaluates `file:///android_asset/index.html` with `.is-native-app` styling, requiring zero external server dependencies for core screens.
- **Embedded Web Audio Synthesizer**: `CricOSAudioEngine` generates real-time acoustic cricket sound effects (willow bat cracks, boundary cheers, wicket oscillations, tactile clicks).
- **8-Persona Bottom Sheet Switcher**: Quick-switch drawer for Captain, Player, Scorer, Fan, Umpire, Organiser, Turf Host, and Admin with outside-click and `Escape` dismissals.
- **21st.dev Athletic KPI Cards**: Inline career stats, Olympic laurel wreath badges, and 20-match momentum form sparklines.

---

## 🚀 Building the APK

### 1. Prerequisites

- **Java 17**:
  ```bash
  export JAVA_HOME="/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home"
  ```
- **Android SDK (API 33 & Platform Tools)**:
  ```bash
  export ANDROID_HOME="$HOME/Library/Android/sdk"
  export PATH="$ANDROID_HOME/platform-tools:$PATH"
  ```

### 2. Automated Build (Recommended)

From the repository root:
```bash
# Using pnpm
pnpm run build:android

# Or running the bash script directly
bash apps/mobile/android/build-apk.sh
```

### 3. Manual Build with Gradle

```bash
# From within apps/mobile/android directory:
./gradlew clean assembleDebug --no-daemon --console=plain

# Copy to root distribution directory:
cp app/build/outputs/apk/debug/app-debug.apk ../../../dist/cricos-debug.apk
```

---

## 📲 Installation & Device Usage

### Install via ADB
```bash
adb install -r ../../../dist/cricos-debug.apk
```

### Launch MainActivity
```bash
adb shell am start -S -n com.cricos.app.debug/com.cricos.app.MainActivity
```

### Force-Stop App
```bash
adb shell am force-stop com.cricos.app.debug
```

### Logcat Streaming
```bash
adb logcat -s CricOSWebView:* Chromium:*
```

### Remote Chrome DevTools
1. Open Google Chrome on your computer.
2. Navigate to `chrome://inspect/#devices`.
3. Locate `com.cricos.app.debug` and click **inspect**.

---

## 🤖 Automated Emulator Runner

Launch an Android Virtual Device, wait for boot completion, install the APK, and capture a verification screenshot:

```bash
bash run-emulator.sh
```
