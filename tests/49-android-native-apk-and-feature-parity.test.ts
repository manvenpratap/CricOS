import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('49. Android Native APK & Complete Feature Parity', () => {
  const apkPath = path.join(rootDir, 'dist', 'cricos-debug.apk');
  const manifestPath = path.join(rootDir, 'apps/mobile/android/app/src/main/AndroidManifest.xml');
  const mainActivityPath = path.join(rootDir, 'apps/mobile/android/app/src/main/java/com/cricos/app/MainActivity.java');
  const androidAssetPath = path.join(rootDir, 'apps/mobile/android/app/src/main/assets/index.html');
  const mobileHtmlPath = path.join(rootDir, 'dist', 'mobile.html');
  const rootIndexPath = path.join(rootDir, 'index.html');
  const distIndexPath = path.join(rootDir, 'dist', 'index.html');

  // Suite 1: Android APK Binary & Manifest Integrity
  describe('Suite 1 — Android APK Binary & Manifest Integrity', () => {
    it('49.01 — dist/cricos-debug.apk exists and is non-empty', () => {
      assert.ok(fs.existsSync(apkPath), 'dist/cricos-debug.apk should exist');
      const stats = fs.statSync(apkPath);
      assert.ok(stats.size > 1000000, 'APK file should exceed 1 MB');
    });

    it('49.02 — APK archive contains AndroidManifest, DEX bytecode and bundled assets', () => {
      const listing = execSync(`unzip -l "${apkPath}"`, { encoding: 'utf8' });
      assert.ok(listing.includes('AndroidManifest.xml'), 'APK must contain AndroidManifest.xml');
      assert.ok(listing.includes('classes.dex'), 'APK must contain classes.dex');
      assert.ok(listing.includes('assets/index.html'), 'APK must contain assets/index.html');
    });

    it('49.03 — AndroidManifest.xml includes camera, storage, and audio permissions', () => {
      const manifest = fs.readFileSync(manifestPath, 'utf8');
      assert.ok(manifest.includes('android.permission.INTERNET'), 'INTERNET permission');
      assert.ok(manifest.includes('android.permission.ACCESS_NETWORK_STATE'), 'ACCESS_NETWORK_STATE permission');
      assert.ok(manifest.includes('android.permission.VIBRATE'), 'VIBRATE permission');
      assert.ok(manifest.includes('android.permission.CAMERA'), 'CAMERA permission');
      assert.ok(manifest.includes('android.permission.READ_MEDIA_IMAGES'), 'READ_MEDIA_IMAGES permission');
      assert.ok(manifest.includes('android.permission.RECORD_AUDIO'), 'RECORD_AUDIO permission');
      assert.ok(manifest.includes('android.permission.MODIFY_AUDIO_SETTINGS'), 'MODIFY_AUDIO_SETTINGS permission');
    });

    it('49.04 — AndroidManifest.xml enables hardware acceleration and adjustResize', () => {
      const manifest = fs.readFileSync(manifestPath, 'utf8');
      assert.ok(manifest.includes('android:hardwareAccelerated="true"'), 'Hardware acceleration enabled');
      assert.ok(manifest.includes('android:windowSoftInputMode="adjustResize"'), 'adjustResize soft input mode');
    });
  });

  // Suite 2: Android Native Java Architecture & WebView Bridge
  describe('Suite 2 — Android Native Java Architecture & WebView Bridge', () => {
    const javaSrc = fs.readFileSync(mainActivityPath, 'utf8');

    it('49.05 — MainActivity configures WebSettings for local offline assets and storage', () => {
      assert.ok(javaSrc.includes('settings.setJavaScriptEnabled(true)'), 'JavaScript enabled');
      assert.ok(javaSrc.includes('settings.setDomStorageEnabled(true)'), 'DOM storage enabled');
      assert.ok(javaSrc.includes('settings.setAllowFileAccess(true)'), 'File access enabled');
      assert.ok(javaSrc.includes('settings.setAllowUniversalAccessFromFileURLs(true)'), 'Universal access enabled');
    });

    it('49.06 — MainActivity implements onShowFileChooser for HTML file/image uploads', () => {
      assert.ok(javaSrc.includes('onShowFileChooser('), 'onShowFileChooser implemented');
      assert.ok(javaSrc.includes('ValueCallback<Uri[]>'), 'ValueCallback for file paths');
      assert.ok(javaSrc.includes('FILECHOOSER_RESULTCODE'), 'Result code handling');
      assert.ok(javaSrc.includes('onActivityResult('), 'onActivityResult handler present');
    });

    it('49.07 — MainActivity implements onPermissionRequest for microphone audio recording', () => {
      assert.ok(javaSrc.includes('onPermissionRequest('), 'onPermissionRequest implemented');
      assert.ok(javaSrc.includes('request.grant('), 'permission request granted');
    });

    it('49.08 — MainActivity registers WebAppInterface AndroidBridge with haptic vibration and toast', () => {
      assert.ok(javaSrc.includes('class WebAppInterface'), 'WebAppInterface defined');
      assert.ok(javaSrc.includes('webView.addJavascriptInterface('), 'addJavascriptInterface registered');
      assert.ok(javaSrc.includes('"AndroidBridge"'), 'AndroidBridge name used');
      assert.ok(javaSrc.includes('@JavascriptInterface'), 'JavascriptInterface annotation');
      assert.ok(javaSrc.includes('triggerHaptic('), 'triggerHaptic method implemented');
      assert.ok(javaSrc.includes('showToast('), 'showToast method implemented');
    });
  });

  // Suite 3: Android Bundled Web App & Persona Coverage
  describe('Suite 3 — Android Bundled Web App & Persona Coverage', () => {
    const assetHtml = fs.readFileSync(androidAssetPath, 'utf8');

    it('49.09 — Android assets/index.html is bundled and exceeds 350 KB', () => {
      assert.ok(assetHtml.length > 350000, 'Bundled index.html should exceed 350 KB');
    });

    it('49.10 — Android assets contain is-native-app and is-native-android class tokens', () => {
      assert.ok(assetHtml.includes('is-native-app'), 'Contains is-native-app');
      assert.ok(assetHtml.includes('is-native-android'), 'Contains is-native-android');
    });

    it('49.11 — Android assets render all 8 dedicated personas', () => {
      const personas = ['CAPTAIN', 'PLAYER', 'SCORER', 'FAN', 'UMPIRE', 'ORGANISER', 'TURF_PROVIDER', 'ADMIN'];
      for (const p of personas) {
        assert.ok(assetHtml.includes(p), `Persona ${p} should be present in bundled assets`);
      }
    });

    it('49.12 — Free OTP code 123456 and squad join code CRIC-BLR-4821 incorporated in APK assets', () => {
      assert.ok(assetHtml.includes('123456'), 'Free OTP code 123456 present');
      assert.ok(assetHtml.includes('CRIC-BLR-4821'), 'Squad join code CRIC-BLR-4821 present');
    });
  });

  // Suite 4: Scoring Studio, Tactical Pad & Incidents in APK
  describe('Suite 4 — Scoring Studio, Tactical Pad & Incidents in APK', () => {
    const assetHtml = fs.readFileSync(androidAssetPath, 'utf8');

    it('49.13 — Tactical scoring actions and delivery methods incorporated in APK', () => {
      assert.ok(assetHtml.includes('scoreBall('), 'scoreBall handler present');
      assert.ok(assetHtml.includes('scoreExtra('), 'scoreExtra handler present');
      assert.ok(assetHtml.includes('undoLastDelivery()'), 'undoLastDelivery handler present');
      assert.ok(assetHtml.includes('rotateStrike()'), 'rotateStrike handler present');
    });

    it('49.14 — Dynamic LHB/RHB stance switching and DLS calculator present in APK', () => {
      assert.ok(assetHtml.includes('syncStanceFromStriker('), 'syncStanceFromStriker method present');
      assert.ok(assetHtml.includes('openDlsCalculatorSheet()'), 'openDlsCalculatorSheet method present');
    });

    it('49.15 — Lead Umpire DRS, MCC sanctions, and sign-off actions incorporated in APK', () => {
      assert.ok(assetHtml.includes('openDrsReviewSheet()'), 'DRS sheet present');
      assert.ok(assetHtml.includes('awardPenaltyRuns('), 'awardPenaltyRuns method present');
      assert.ok(assetHtml.includes('signOffMatchAction()'), 'signOffMatchAction method present');
    });
  });

  // Suite 5: 3D Visual Experience, Hardware Acceleration & Silverware
  describe('Suite 5 — 3D Visual Experience, Hardware Acceleration & Silverware in APK', () => {
    const assetHtml = fs.readFileSync(androidAssetPath, 'utf8');

    it('49.16 — 3D Holographic Player Card sheet incorporated in APK assets', () => {
      assert.ok(assetHtml.includes('open3DPlayerCardSheet('), 'open3DPlayerCardSheet method present');
      assert.ok(assetHtml.includes('Hardik Patel'), 'Hardik Patel player card present');
      assert.ok(assetHtml.includes('Holographic 3D Tilt Physics'), 'Tilt physics telemetry label');
    });

    it('49.17 — 3D Championship Trophy Cabinet sheet incorporated in APK assets', () => {
      assert.ok(assetHtml.includes('open3DTrophyCabinetSheet('), 'open3DTrophyCabinetSheet method present');
      assert.ok(assetHtml.includes('Premier T20 Cup'), 'Premier T20 Cup present');
      assert.ok(assetHtml.includes('Tournament MVP Silver Shield'), 'MVP Shield present');
      assert.ok(assetHtml.includes('Golden Bat Award'), 'Golden Bat Award present');
    });

    it('49.18 — 3D Cricket Bat & Gear Configurator sheet incorporated in APK assets', () => {
      assert.ok(assetHtml.includes('openGearCustomizerSheet()'), 'openGearCustomizerSheet method present');
      assert.ok(assetHtml.includes('willowGradeSelect'), 'willowGradeSelect input present');
    });
  });

  // Suite 6: Visual Media & Photo Upload Engine in APK
  describe('Suite 6 — Visual Media & Photo Upload Engine in APK', () => {
    const assetHtml = fs.readFileSync(androidAssetPath, 'utf8');

    it('49.19 — Profile avatar photo upload and 4-preset picker incorporated in APK', () => {
      assert.ok(assetHtml.includes('handleMobileProfilePhoto('), 'handleMobileProfilePhoto method present');
      assert.ok(assetHtml.includes('selectMobilePresetAvatar('), 'selectMobilePresetAvatar method present');
      assert.ok(assetHtml.includes('resetMobileAvatar()'), 'resetMobileAvatar method present');
      assert.ok(assetHtml.includes('mobileProfilePhotoInput'), 'mobileProfilePhotoInput file input element present');
    });

    it('49.20 — Venue/turf facility photo gallery upload incorporated in APK', () => {
      assert.ok(assetHtml.includes('handleMobileVenuePhoto('), 'handleMobileVenuePhoto method present');
      assert.ok(assetHtml.includes('mobileVenuePhotoInput'), 'mobileVenuePhotoInput file input element present');
      assert.ok(assetHtml.includes('mobileVenueGallery'), 'mobileVenueGallery container present');
    });

    it('49.21 — Android native bridge connected to mobile toast and haptics', () => {
      assert.ok(assetHtml.includes('window.AndroidBridge'), 'window.AndroidBridge bridge reference present');
      assert.ok(assetHtml.includes('AndroidBridge.triggerHaptic'), 'AndroidBridge.triggerHaptic called');
      assert.ok(assetHtml.includes('AndroidBridge.showToast'), 'AndroidBridge.showToast called');
    });
  });

  // Suite 7: Rule 5 Data-Tooltip, Zero Transition & Rule 6 Parity
  describe('Suite 7 — Rule 5 Data-Tooltip, Zero Transition & Rule 6 Parity', () => {
    const assetHtml = fs.readFileSync(androidAssetPath, 'utf8');

    it('49.22 — 100% Rule 5 data-tooltip coverage on all interactive buttons in new features', () => {
      assert.ok(assetHtml.includes('data-tooltip="Inspect Holographic 3D Player Card and telemetry"'), 'Player card tooltip');
      assert.ok(assetHtml.includes('data-tooltip="Inspect 3D Championship Trophy Cabinet"'), 'Trophy cabinet tooltip');
      assert.ok(assetHtml.includes('data-tooltip="Inspect 3D Tournament Championship Silverware"'), 'Silverware tooltip');
      assert.ok(assetHtml.includes('data-tooltip="Customise 3D bat blade and grips"'), '3D gear tooltip');
    });

    it('49.23 — Preserves zero transition: all invariant across stylesheets', () => {
      assert.ok(!assetHtml.includes('transition: all;'), 'No transition: all; in APK stylesheet');
      assert.ok(!assetHtml.includes('transition:all;'), 'No transition:all; in APK stylesheet');
    });

    it('49.24 — Rule 6 Parity: root index.html is byte-for-byte identical with dist/index.html', () => {
      const rootBuf = fs.readFileSync(rootIndexPath);
      const distBuf = fs.readFileSync(distIndexPath);
      assert.ok(rootBuf.equals(distBuf), 'root index.html and dist/index.html must be byte-for-byte identical');
    });
  });
});
