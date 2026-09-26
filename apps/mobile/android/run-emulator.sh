#!/usr/bin/env bash
set -euo pipefail

export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

echo "==> Checking if emulator is already running..."
if ! adb get-state 2>/dev/null | grep -q "device"; then
  echo "==> Launching Android Emulator (Medium_Phone_API_36)..."
  emulator -avd Medium_Phone_API_36 -netdelay none -netspeed full > /dev/null 2>&1 &
  echo "==> Emulator launch initiated."
fi

echo "==> Waiting for device to connect via ADB..."
adb wait-for-device

echo "==> Waiting for boot completion..."
while [ "$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" != "1" ]; do
  sleep 2
done

echo "==> Device booted! Installing CricOS Native APK..."
adb install -r "$REPO_ROOT/dist/cricos-debug.apk"

echo "==> Starting CricOS MainActivity..."
adb shell am start -S -n com.cricos.app.debug/com.cricos.app.MainActivity

sleep 3
adb shell screencap -p /sdcard/cricos_verified.png
adb pull /sdcard/cricos_verified.png /Users/manvenpratapsingh/.gemini/antigravity-ide/brain/de1ba011-f54d-4ac1-b73a-c3b69648dd2b/cricos_verified.png

echo "==> Verification screenshot pulled successfully."
