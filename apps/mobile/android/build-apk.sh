#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

export JAVA_HOME="${JAVA_HOME:-/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home}"
export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH"

echo "==> Building distribution packages..."
node "$REPO_ROOT/scripts/package-distribution.mjs"

echo "==> Syncing latest CricOS mobile web distribution into Android assets..."
mkdir -p "$SCRIPT_DIR/app/src/main/assets"
sed -e 's/<html lang="en">/<html lang="en" class="is-native-app">/' \
    -e 's/<body>/<body class="is-native-app">/' \
    -e 's/<script type="module">/<script>/' \
    "$REPO_ROOT/dist/mobile.html" > "$SCRIPT_DIR/app/src/main/assets/index.html"

echo "==> Compiling Android APK with Gradle..."
GRADLE_CMD="/tmp/gradle-8.5/bin/gradle"
if [ ! -x "$GRADLE_CMD" ]; then
  GRADLE_CMD="$SCRIPT_DIR/gradlew"
fi

cd "$SCRIPT_DIR"
"$GRADLE_CMD" assembleDebug --no-daemon --console=plain

mkdir -p "$REPO_ROOT/dist"
cp "$SCRIPT_DIR/app/build/outputs/apk/debug/app-debug.apk" "$REPO_ROOT/dist/cricos-debug.apk"

echo "==> Build successful! True native APK available at:"
echo "    - $SCRIPT_DIR/app/build/outputs/apk/debug/app-debug.apk"
echo "    - $REPO_ROOT/dist/cricos-debug.apk"
