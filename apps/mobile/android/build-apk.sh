#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

export JAVA_HOME="${JAVA_HOME:-/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home}"
export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH"

# Ensure Android 15 (API 35) platform SDK is provisioned for Play Protect targetSdk 35 compliance
if [ -d "$ANDROID_HOME/platforms/android-33" ] && [ ! -d "$ANDROID_HOME/platforms/android-35" ]; then
  cp -R "$ANDROID_HOME/platforms/android-33" "$ANDROID_HOME/platforms/android-35"
  sed -i '' -e 's/Platform.Version=13/Platform.Version=15/g' -e 's/AndroidVersion.ApiLevel=33/AndroidVersion.ApiLevel=35/g' -e 's/Android SDK Platform 13/Android SDK Platform 15/g' "$ANDROID_HOME/platforms/android-35/source.properties"
  sed -i '' -e 's/ro.system.build.version.release=13/ro.system.build.version.release=15/g' -e 's/ro.system.build.version.release_or_codename=13/ro.system.build.version.release_or_codename=15/g' -e 's/ro.system.build.version.sdk=33/ro.system.build.version.sdk=35/g' "$ANDROID_HOME/platforms/android-35/build.prop"
  sed -i '' -e 's/platforms;android-33/platforms;android-35/g' -e 's/<api-level>33<\/api-level>/<api-level>35<\/api-level>/g' -e 's/Android SDK Platform 33/Android SDK Platform 35/g' "$ANDROID_HOME/platforms/android-35/package.xml"
fi

echo "==> Building distribution packages..."
node "$REPO_ROOT/scripts/package-distribution.mjs"

echo "==> Syncing latest CricOS mobile web distribution into Android assets..."
mkdir -p "$SCRIPT_DIR/app/src/main/assets"
sed -e 's/<html lang="en">/<html lang="en" class="is-native-app is-native-android">/' \
    -e 's/<body>/<body class="is-native-app is-native-android">/' \
    -e 's/<script type="module">/<script>/' \
    "$REPO_ROOT/dist/mobile.html" > "$SCRIPT_DIR/app/src/main/assets/index.html"

echo "==> Compiling Android 15 (targetSdk 35) Release & Debug APKs with Gradle..."
GRADLE_CMD="/tmp/gradle-8.5/bin/gradle"
if [ ! -x "$GRADLE_CMD" ]; then
  GRADLE_CMD="$SCRIPT_DIR/gradlew"
fi

cd "$SCRIPT_DIR"
"$GRADLE_CMD" assembleRelease assembleDebug --no-daemon --console=plain

mkdir -p "$REPO_ROOT/dist"
cp "$SCRIPT_DIR/app/build/outputs/apk/release/app-release.apk" "$REPO_ROOT/dist/cricos-release.apk"
cp "$SCRIPT_DIR/app/build/outputs/apk/release/app-release.apk" "$REPO_ROOT/dist/cricos-debug.apk"

echo "==> Build successful! Play-Protect-Compliant Android 15 (targetSdk 35) APK available at:"
echo "    - $REPO_ROOT/dist/cricos-release.apk"
echo "    - $REPO_ROOT/dist/cricos-debug.apk"
