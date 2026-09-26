# CricOS Mobile Client

Cross-platform mobile client for iOS and Android, powering player profiles, live MCC Laws scoring, certified marketplace bookings, and 21st.dev athletic stats.

- **Standalone Native Android Project**: Located in [`android/`](android/) targeting Android SDK 33 / AGP 8.1.4. Produces `dist/cricos-debug.apk` (2.9 MB) with true edge-to-edge layout, Web Audio sound synthesis, and multi-persona bottom sheet switcher.
- **Build Command**: `pnpm run build:android` or `bash android/build-apk.sh`.
- **Emulator Runner**: `bash android/run-emulator.sh`.
- **Detailed Documentation**: See [`android/README.md`](android/README.md) and root [`README.md#android-apk`](../../README.md#-native-android-mobile-app--apk-generation).
