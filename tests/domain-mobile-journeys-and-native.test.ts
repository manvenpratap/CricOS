/**
 * Domain Test Suite: Mobile Journeys, Scoring Studio, Native Bridge & App Packaging
 *
 * Consolidates and unifies:
 * - 33-mobile-app-journeys.test.ts
 * - 39-mobile-native-redesign-and-feature-parity.test.ts
 * - 40-mobile-scoring-studio-parity.test.ts
 * - 41-mobile-signup-and-role-experience.test.ts
 * - 42-mobile-analytics-and-card-charts.test.ts
 * - 46-ios-native-application-and-store-readiness.test.ts
 * - 49-android-native-apk-and-feature-parity.test.ts
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CricOSMobileClient,
  CricOSMobileApp,
  LiveMatchScreenController,
  TeamsScreenController,
  TournamentsScreenController,
  MarketplaceScreenController,
  IncidentsScreenController,
  AdminDeskScreenController,
  ProfileScreenController,
  type MobileUserRole
} from '../apps/mobile/dist/index.js';
import { getMobileAppHtml } from '../apps/api/dist/ui/mobile-view.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const iosDir = path.join(rootDir, 'apps', 'mobile', 'ios');
const androidDir = path.join(rootDir, 'apps', 'mobile', 'android');

function readFile(relPath: string): string {
  return fs.readFileSync(path.resolve(rootDir, relPath), 'utf-8');
}

describe('Domain: Mobile Journeys, Scoring Studio & Native Packaging', () => {
  const mobileHtml = getMobileAppHtml();
  const distMobileHtml = readFile('dist/mobile.html');
  const rootIndexHtml = readFile('index.html');
  const distIndexHtml = readFile('dist/index.html');

  // ---- Suite 1: Mobile App User Journeys & Multi-Persona Architecture ----
  describe('Suite 1: Mobile User Journeys & Multi-Persona Architecture', () => {
    const all8Roles: MobileUserRole[] = [
      'CAPTAIN', 'PLAYER', 'SCORER', 'FAN', 'UMPIRE', 'ADMIN', 'ORGANISER', 'TURF_PROVIDER'
    ];

    it('1. Initializes CricOSMobileApp and routes through all 8 user personas', () => {
      const app = new CricOSMobileApp();
      for (const role of all8Roles) {
        app.switchUserPersona(role);
        assert.equal(app.getUserPersona(), role);
        assert.ok(app.getCurrentScreen());
      }
    });

    it('2. LiveMatchScreenController renders match telemetry and pitch conditions', () => {
      const controller = new LiveMatchScreenController();
      const liveHtml = controller.renderMobileHtml('CAPTAIN');
      assert.ok(liveHtml.includes('Captain Tactical View'));
      assert.ok(liveHtml.includes('Target Equation'));
      assert.ok(liveHtml.includes('data-tooltip="Record toss result"'));
    });

    it('3. TeamsScreenController manages Playing XI lineup and Captain coin toss', () => {
      const ctrl = new TeamsScreenController();
      const state = ctrl.getState();
      assert.strictEqual(state.playingXI.length, 11);
      assert.strictEqual(state.bench.length, 3);
      assert.strictEqual(state.teamCode, 'CRIC-BLR-4821');

      ctrl.recordToss('Bangalore Royal Challengers', 'BAT');
      assert.strictEqual(ctrl.getState().tossConducted, true);
      assert.strictEqual(ctrl.getState().tossDecision, 'BAT');
    });

    it('4. Screen controllers cover Tournaments, Marketplace, Incidents, Admin & Profile', () => {
      const trn = new TournamentsScreenController();
      assert.ok(trn.getState().fixtures.length > 0);

      const mkt = new MarketplaceScreenController();
      mkt.seedDefaultSlots();
      assert.ok(mkt.getSlots().length > 0);

      const inc = new IncidentsScreenController();
      assert.strictEqual(inc.getState().matchSignedOff, false);

      const adm = new AdminDeskScreenController();
      assert.strictEqual(adm.isLedgerBalanced(), true);

      const prof = new ProfileScreenController();
      assert.ok(prof.getTournaments().length > 0);
      assert.ok(prof.getBadges().length > 0);
      assert.ok(Number(prof.getBattingAverage()) > 0);
    });
  });

  // ---- Suite 2: Mobile Native Redesign & In-App Dialog Elimination ----
  describe('Suite 2: Mobile Native Redesign & In-App Dialog Elimination', () => {
    it('1. Completely eliminates window.alert, confirm, and prompt from mobile view', () => {
      assert.strictEqual(mobileHtml.includes('alert('), false, 'mobile-view must not contain window.alert()');
      assert.strictEqual(mobileHtml.includes('confirm('), false, 'mobile-view must not contain window.confirm()');
      assert.strictEqual(mobileHtml.includes('prompt('), false, 'mobile-view must not contain window.prompt()');
    });

    it('2. Includes native in-app toast notification and modal action sheets', () => {
      assert.ok(mobileHtml.includes('id="mobileToastContainer"'));
      assert.ok(mobileHtml.includes('.mobile-toast'));
      assert.ok(mobileHtml.includes('.mobile-action-sheet'));
      assert.ok(mobileHtml.includes('openActionSheet(config)'));
      assert.ok(mobileHtml.includes('closeActionSheet()'));
    });

    it('3. Renders horizontal scrolling subnav pills with live pitch telemetry', () => {
      assert.ok(mobileHtml.includes('.mobile-subnav'));
      assert.ok(mobileHtml.includes('.mobile-subnav-btn'));
      assert.ok(mobileHtml.includes("'SCORE'"));
      assert.ok(mobileHtml.includes("'TELEMETRY'"));
    });
  });

  // ---- Suite 3: Mobile Scoring Studio & Precision Wagon Wheel Parity ----
  describe('Suite 3: Mobile Scoring Studio & Precision Wagon Wheel Parity', () => {
    it('1. Renders 4-column studio keypad grid with tactical labels and distinct glows', () => {
      assert.ok(mobileHtml.includes('mobile-studio-pad-grid'));
      assert.ok(mobileHtml.includes('boundary-four'));
      assert.ok(mobileHtml.includes('maximum-six'));
      assert.ok(mobileHtml.includes('wicket-out'));
      assert.ok(mobileHtml.includes('undo-btn'));
      assert.ok(mobileHtml.includes('mobile-studio-sublabel'));
    });

    it('2. Provides generic extras, undo last ball, and strike swap controls', () => {
      assert.ok(mobileHtml.includes('openExtraPickerSheet'));
      assert.ok(mobileHtml.includes('btnMobileStudioUndoBall'));
      assert.ok(mobileHtml.includes('undoLastDelivery()'));
      assert.ok(mobileHtml.includes('rotateStrike()'));
    });

    it('3. Incorporates 360° Wagon Wheel in mobile scoring studio', () => {
      assert.ok(mobileHtml.includes('8-Zone Precision Wagon Wheel'));
      assert.ok(mobileHtml.includes('wagon-sector-wedge'));
      assert.ok(mobileHtml.includes('setBatterStance'));
      assert.ok(mobileHtml.includes('RHB'));
      assert.ok(mobileHtml.includes('LHB'));
    });
  });

  // ---- Suite 4: Mobile Sign Up, Custom Bio & Automated Role Experience ----
  describe('Suite 4: Mobile Sign Up, Custom Bio & Automated Role Experience', () => {
    it('1. Renders segmented mode tabs switching between Sign In and Create Account', () => {
      assert.ok(mobileHtml.includes('auth-mode-tabs'));
      assert.ok(mobileHtml.includes('setAuthMode(this.dataset.mode)'));
      assert.ok(mobileHtml.includes('data-mode="SIGN_IN"'));
      assert.ok(mobileHtml.includes('data-mode="SIGN_UP"'));
      assert.ok(mobileHtml.includes('✨ Create Account'));
    });

    it('2. Automated 8-persona role experience definition and HUD banner', () => {
      assert.ok(mobileHtml.includes('signup-roles-grid'));
      assert.ok(mobileHtml.includes('this.roleExperienceConfig = {'));
      assert.ok(mobileHtml.includes('applyRoleExperience(role, isSignup)'));
    });

    it('3. Profile bio display and action sheet editing', () => {
      assert.ok(mobileHtml.includes('bio-card') || mobileHtml.includes('profile-bio') || mobileHtml.includes('custom-bio'));
      assert.ok(mobileHtml.includes('openEditProfileSheet') || mobileHtml.includes('editProfilePhotoInput'));
    });
  });

  // ---- Suite 5: Dynamic Mobile Analytics & Scorecard System ----
  describe('Suite 5: Dynamic Mobile Analytics & Scorecard System', () => {
    it('1. Renders dynamic Worm progression curve with CRR and RRR math', () => {
      const controller = new LiveMatchScreenController({
        matchId: 'match-1',
        battingTeam: 'Mumbai Indians',
        bowlingTeam: 'Delhi Capitals',
        totalRuns: 142,
        totalWickets: 3,
        legalBalls: 100, // 16.4 ov
        striker: { playerId: 'p1', name: 'Rohit Sharma', runs: 64, balls: 42, fours: 6, sixes: 3, isStriker: true },
        nonStriker: { playerId: 'p2', name: 'Virat Kohli', runs: 45, balls: 32, fours: 4, sixes: 1, isStriker: false },
        bowler: { playerId: 'b1', name: 'Jasprit Bumrah', overs: 3, ballsThisOver: 4, maidens: 0, runsConceded: 22, wickets: 2 },
        currentOverDeliveries: ['1', '4', '0', '2'],
        fallOfWickets: [],
        isOverComplete: false
      });
      const wormHtml = controller.renderMobileHtml('FAN', 'WORM');
      assert.ok(wormHtml.includes('Worm Progression') || wormHtml.includes('Worm Curve') || wormHtml.includes('worm-svg') || wormHtml.includes('svg'));
      assert.ok(wormHtml.includes('data-tooltip="Live Point: 142/3 (16.4 ov)"'), 'Initial live chase marker tooltip must show 142/3 (16.4 ov)');

      // Verify dynamic synchronization when delivery recorded
      controller.recordDelivery({ runs: 4, isExtra: false });
      const updatedWormHtml = controller.renderMobileHtml('FAN', 'WORM');
      assert.ok(updatedWormHtml.includes('data-tooltip="Live Point: 146/3 (16.5 ov)"'), 'Live chase marker must dynamically sync to 146/3 (16.5 ov)');
    });

    it('2. Renders precision Manhattan over velocity bars', () => {
      const controller = new LiveMatchScreenController();
      const manhattanHtml = controller.renderMobileHtml('FAN', 'MANHATTAN');
      assert.ok(manhattanHtml.includes('Manhattan') || manhattanHtml.includes('Velocity') || manhattanHtml.includes('bar'));
    });

    it('3. Computes and renders 360° Wagon Wheel sector telemetry', () => {
      const controller = new LiveMatchScreenController();
      const wagonHtml = controller.renderMobileHtml('FAN', 'WAGON');
      assert.ok(wagonHtml.includes('Wagon Wheel'));
      assert.ok(wagonHtml.includes('<svg'));
      assert.ok(wagonHtml.includes('Off Runs') || wagonHtml.includes('Off'));
      assert.ok(wagonHtml.includes('On Runs') || wagonHtml.includes('On'));
    });

    it('4. Renders detailed official match scorecard tables on mobile', () => {
      const controller = new LiveMatchScreenController();
      const scorecardHtml = controller.renderMobileHtml('FAN', 'SCORECARD');
      assert.ok(scorecardHtml.includes('Detailed Scorecard'));
      assert.ok(scorecardHtml.includes('Rohit Verma') || scorecardHtml.includes('Innings'));
    });
  });

  // ---- Suite 6: iOS Native Application & App Store Readiness ----
  describe('Suite 6: iOS Native Application & App Store Readiness', () => {
    it('1. SwiftUI app lifecycle, WKWebView, and pitch dark theme', () => {
      const appSwiftPath = path.join(iosDir, 'CricOS', 'App', 'CricOSApp.swift');
      assert.ok(fs.existsSync(appSwiftPath));
      const appContent = fs.readFileSync(appSwiftPath, 'utf8');
      assert.ok(appContent.includes('@main'));
      assert.ok(appContent.includes('struct CricOSApp: App'));
      assert.ok(appContent.includes('CricOSWebView'));

      const webViewSwiftPath = path.join(iosDir, 'CricOS', 'App', 'CricOSWebView.swift');
      assert.ok(fs.existsSync(webViewSwiftPath));
      const webViewContent = fs.readFileSync(webViewSwiftPath, 'utf8');
      assert.ok(webViewContent.includes('cricosNative'));
      assert.ok(webViewContent.includes('window.cricosIsNativeIOS = true'));
      assert.ok(webViewContent.includes('forResource: "index", withExtension: "html", subdirectory: "www"'));
    });

    it('2. NativeBridge and HapticsManager multi-tier Taptic Engine feedback', () => {
      const bridgeSwiftPath = path.join(iosDir, 'CricOS', 'App', 'NativeBridge.swift');
      assert.ok(fs.existsSync(bridgeSwiftPath));
      const bridgeContent = fs.readFileSync(bridgeSwiftPath, 'utf8');
      assert.ok(bridgeContent.includes('HapticsManager.shared.trigger'));
      assert.ok(bridgeContent.includes('Account Deleted'));

      const hapticsSwiftPath = path.join(iosDir, 'CricOS', 'App', 'HapticsManager.swift');
      assert.ok(fs.existsSync(hapticsSwiftPath));
      const hapticsContent = fs.readFileSync(hapticsSwiftPath, 'utf8');
      assert.ok(hapticsContent.includes('UIImpactFeedbackGenerator'));
      assert.ok(hapticsContent.includes('prepareAll()'));
    });

    it('3. Info.plist configuration, permissions, and App Store review metadata', () => {
      const plistPath = path.join(iosDir, 'CricOS', 'Resources', 'Info.plist');
      assert.ok(fs.existsSync(plistPath));
      const plistContent = fs.readFileSync(plistPath, 'utf8');
      assert.ok(plistContent.includes('<string>com.cricos.app</string>'));
      assert.ok(plistContent.includes('NSCameraUsageDescription'));

      const metaPath = path.join(rootDir, 'apps', 'mobile', 'store', 'apple', 'metadata.json');
      assert.ok(fs.existsSync(metaPath));
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
      assert.strictEqual(meta.bundle_id, 'com.cricos.app');
      assert.strictEqual(meta.app_store_info.content_rating, '4+');
      assert.strictEqual(meta.review_information.demo_account_required, true);
      assert.strictEqual(meta.review_information.demo_phone_number, '+91 98765 43210');
      assert.strictEqual(meta.review_information.demo_role, 'CAPTAIN');
    });

    it('4. iOS build script exists and is executable', () => {
      const buildScript = path.join(iosDir, 'build-ios.sh');
      assert.ok(fs.existsSync(buildScript));
      const stat = fs.statSync(buildScript);
      assert.ok((stat.mode & 0o111) !== 0, 'build-ios.sh must be executable');
    });
  });

  // ---- Suite 7: Android Native APK & Complete Feature Parity ----
  describe('Suite 7: Android Native APK & Complete Feature Parity', () => {
    it('1. dist/cricos-debug.apk exists and is non-empty', () => {
      const apkPath = path.join(rootDir, 'dist', 'cricos-debug.apk');
      assert.ok(fs.existsSync(apkPath), 'dist/cricos-debug.apk must exist');
      assert.ok(fs.statSync(apkPath).size > 100000, 'APK must exceed 100 KB');
    });

    it('2. AndroidManifest.xml permissions and hardware acceleration', () => {
      const manifestPath = path.join(androidDir, 'app', 'src', 'main', 'AndroidManifest.xml');
      assert.ok(fs.existsSync(manifestPath));
      const manifest = fs.readFileSync(manifestPath, 'utf8');
      assert.ok(manifest.includes('android.permission.INTERNET'));
      assert.ok(manifest.includes('android.permission.VIBRATE'));
      assert.ok(manifest.includes('android:hardwareAccelerated="true"'));
      assert.ok(manifest.includes('android:dataExtractionRules="@xml/data_extraction_rules"'));
    });

    it('3. MainActivity.java WebSettings, file chooser, and WebAppInterface bridge', () => {
      const mainActivityPath = path.join(androidDir, 'app', 'src', 'main', 'java', 'com', 'cricos', 'app', 'MainActivity.java');
      assert.ok(fs.existsSync(mainActivityPath));
      const java = fs.readFileSync(mainActivityPath, 'utf8');
      assert.ok(java.includes('setJavaScriptEnabled(true)'));
      assert.ok(java.includes('onShowFileChooser'));
      assert.ok(java.includes('class WebAppInterface'));
      assert.ok(java.includes('triggerHaptic('));
      assert.ok(java.includes('showToast('));
    });

    it('4. Quality Invariants: zero transition: all, 100% Rule 5 tooltips, and Rule 6 parity', () => {
      assert.doesNotMatch(mobileHtml, /transition:\s*all/i, 'mobileHtml must not violate zero transition:all');
      assert.ok(mobileHtml.includes('data-tooltip='), 'Must feature Rule 5 tooltips in mobileHtml');
      assert.strictEqual(rootIndexHtml, distIndexHtml, 'Root index.html and dist/index.html must be identical');
      assert.strictEqual(distMobileHtml, mobileHtml, 'dist/mobile.html must match getMobileAppHtml()');
    });
  });

  // ---- Suite 8: Mobile 3D Interactive Features, Stadium Viewport & Action Sheets ----
  describe('Suite 8: Mobile 3D Interactive Features, Stadium Viewport & Action Sheets', () => {
    it('1. Three.js library and fallback engine in mobile head and runtime script', () => {
      assert.ok(mobileHtml.includes('three.min.js'), 'Mobile head must load Three.js script');
      assert.ok(mobileHtml.includes('initMobileThreeFallback'), 'Fallback engine must be present');
      assert.ok(mobileHtml.includes('window.MobileThreeStadiumPitch = MobileThreeStadiumPitch'), 'Must export MobileThreeStadiumPitch');
      assert.ok(mobileHtml.includes('window.MobileThreeTrophyCabinet = MobileThreeTrophyCabinet'), 'Must export MobileThreeTrophyCabinet');
      assert.ok(mobileHtml.includes('window.MobileThreeBatConfigurator = MobileThreeBatConfigurator'), 'Must export MobileThreeBatConfigurator');
    });

    it('2. Interactive 3D Stadium Pitch Viewport in Match Center', () => {
      assert.ok(mobileHtml.includes("'STADIUM_3D'"), 'STADIUM_3D subtab must exist');
      assert.ok(mobileHtml.includes('🌐 3D Stadium'), '3D Stadium label must be in subtabs');
      assert.ok(mobileHtml.includes('id="mobileThreeStadiumCanvas"'), '3D stadium canvas element must exist');
      assert.ok(mobileHtml.includes('id="mobileThreeFallbackNotice"'), '3D fallback notice element must exist');
      assert.ok(mobileHtml.includes('renderMobile3DStadium()'), '3D stadium rendering method must exist');
      assert.ok(mobileHtml.includes('setThreeCameraPreset'), 'Camera preset controller must exist');
      assert.ok(mobileHtml.includes('setThreeVisualMode'), 'Tactical visual mode controller must exist');
      assert.ok(mobileHtml.includes('setThreeLighting'), 'Broadcast lighting controller must exist');
      assert.ok(mobileHtml.includes('BATSMAN') && mobileHtml.includes('GRANDSTAND') && mobileHtml.includes('UMPIRE'), 'All camera presets must be present');
      assert.ok(mobileHtml.includes('HAWKEYE') && mobileHtml.includes('DRS') && mobileHtml.includes('FIELDERS'), 'Tactical overlays must be present');
      assert.ok(mobileHtml.includes('DAY') && mobileHtml.includes('DUSK') && mobileHtml.includes('NIGHT'), 'Lighting states must be present');
    });

    it('3. Dual-mode 2D / 3D Stadium switch in 8-Zone Precision Wagon Wheel', () => {
      assert.ok(mobileHtml.includes('setWagonDisplayMode'), 'Mode switch handler must exist');
      assert.ok(mobileHtml.includes("setWagonDisplayMode('2D')") || mobileHtml.includes("setWagonDisplayMode(this.dataset.mode)"), '2D Map button must exist');
      assert.ok(mobileHtml.includes("setWagonDisplayMode('3D')") || mobileHtml.includes("setWagonDisplayMode(this.dataset.mode)"), '3D Stadium button must exist');
      assert.ok(mobileHtml.includes("wagonDisplayMode === '3D'"), 'Wagon mode state toggle check must exist');
    });

    it('4. Interactive 3D Championship Trophy Cabinet action sheet', () => {
      assert.ok(mobileHtml.includes('open3DTrophyCabinetSheet'), 'open3DTrophyCabinetSheet must exist');
      assert.ok(mobileHtml.includes('id="mobileTrophyCanvas"'), 'mobileTrophyCanvas must exist');
      assert.ok(mobileHtml.includes('id="btnMobileTrophyRotate"'), 'Auto-spin toggle button must exist');
      assert.ok(mobileHtml.includes('toggleMobileTrophyAutoRotate'), 'toggleMobileTrophyAutoRotate must exist');
      assert.ok(mobileHtml.includes('PREMIER_CUP') && mobileHtml.includes('MVP_SHIELD') && mobileHtml.includes('GOLDEN_BAT'), 'All 3 trophies must exist');
    });

    it('5. Interactive 3D Cricket Bat Configurator action sheet', () => {
      assert.ok(mobileHtml.includes('openGearCustomizerSheet'), 'openGearCustomizerSheet must exist');
      assert.ok(mobileHtml.includes('id="mobileBatCanvas"'), 'mobileBatCanvas must exist');
      assert.ok(mobileHtml.includes('willowGradeSelect'), 'willow grade selector must exist');
      assert.ok(mobileHtml.includes('onMobileBatWillowChange'), 'willow change handler must exist');
      assert.ok(mobileHtml.includes('setMobileBatGrip'), 'grip color setter must exist');
      assert.ok(mobileHtml.includes('#00E599') && mobileHtml.includes('#00D2FF') && mobileHtml.includes('#FFB800') && mobileHtml.includes('#1E293B'), 'Grip color chips must exist');
    });

    it('6. Interactive 3D Holographic Player Card with touch & tilt physics', () => {
      assert.ok(mobileHtml.includes('open3DPlayerCardSheet'), 'open3DPlayerCardSheet must exist');
      assert.ok(mobileHtml.includes('id="mobileHoloCard"'), 'mobileHoloCard element must exist');
      assert.ok(mobileHtml.includes('id="mobileHoloSheen"'), 'mobileHoloSheen overlay must exist');
      assert.ok(mobileHtml.includes('onHoloCardMove'), 'touch/pointer move handler must exist');
      assert.ok(mobileHtml.includes('onHoloCardLeave'), 'tilt reset handler must exist');
      assert.ok(mobileHtml.includes('perspective: 900px') || mobileHtml.includes('perspective(900px)'), '3D perspective style must exist');
    });

    it('7. Organic 3D features integrated across core product workflows without redundant showpiece cards', () => {
      // Redundant standalone showpiece card removed from Profile
      assert.ok(!mobileHtml.includes('mobile-three-studio-card'), 'Redundant 3D showpiece card removed from profile');
      assert.ok(!mobileHtml.includes('🌐 3D Visualization Studio'), 'Redundant 3D showpiece heading removed');

      // Functional 3D features organically integrated into their respective workflows:
      // 1. 3D Stadium Pitch in Match Center (Scoring & Tactical Studio)
      assert.ok(mobileHtml.includes('initMobileStadiumPitch') && mobileHtml.includes('STADIUM_3D'), '3D Stadium Pitch organically integrated into Match Center');
      // 2. 3D Championship Trophy Cabinet in Tournaments Hub
      assert.ok(mobileHtml.includes('open3DTrophyCabinetSheet'), '3D Trophy Cabinet organically integrated into Tournaments Hub');
      // 3. 3D Cricket Bat Configurator in Gear Store & Cart
      assert.ok(mobileHtml.includes('openGearCustomizerSheet'), '3D Cricket Bat Configurator organically integrated into Gear Store');
      // 4. 3D Holographic Player Card in Squad & Playing XI
      assert.ok(mobileHtml.includes('open3DPlayerCardSheet'), '3D Holographic Player Card organically integrated into Playing XI / Squads');
    });

    it('8. Clean lifecycle management and memory leak prevention', () => {
      assert.ok(mobileHtml.includes('stopMobile3DViewers'), 'stopMobile3DViewers lifecycle cleanup method must exist');
      assert.ok(mobileHtml.includes('cancelAnimationFrame'), 'Must cancel animation frames on cleanup');
    });
  });

  // =========================================================================
  // Suite 4: Android APK Toast Deduplication, Spring Physics Toast & Sidebar Contrast (68)
  // =========================================================================
  describe('Suite 4: Android APK Toast Deduplication, Spring Physics Toast & Sidebar Contrast (68)', () => {
    const mobileHtml = fs.readFileSync(path.join(rootDir, 'dist', 'mobile.html'), 'utf8');

    it('1. Single Bottom-Docked Glassmorphic Spring Toast with Live Progress Bar', () => {
      assert.ok(mobileHtml.includes('@keyframes toastDecelIn') || mobileHtml.includes('@keyframes toastSpringIn'), 'toastDecelIn keyframe animation must exist');
      assert.ok(mobileHtml.includes('@keyframes toastDecelOut') || mobileHtml.includes('@keyframes toastSpringOut'), 'toastDecelOut keyframe animation must exist');
      assert.ok(mobileHtml.includes('id="mobileToastContainer"'), 'mobileToastContainer element must exist');
      assert.ok(mobileHtml.includes('transform-origin: center bottom'), 'Toast must animate from bottom center origin');
    });

    it('2. Native Android Bridge Suppresses Duplicate Toast.makeText while Preserving Haptics', () => {
      const mainActivityPath = fs.existsSync(path.join(rootDir, 'android/app/src/main/java/com/cricos/app/MainActivity.java'))
        ? path.join(rootDir, 'android/app/src/main/java/com/cricos/app/MainActivity.java')
        : path.join(rootDir, 'apps/mobile/android/app/src/main/java/com/cricos/app/MainActivity.java');
      const mainActivityJava = fs.readFileSync(mainActivityPath, 'utf8');
      assert.ok(
        mainActivityJava.includes('Native OS Toast.makeText suppressed'),
        'MainActivity.java showToast bridge must suppress duplicate native Toast.makeText'
      );
      assert.ok(
        mainActivityJava.includes('public void triggerHaptic(String type)'),
        'MainActivity.java must expose native haptic feedback bridge'
      );
    });

    it('3. Android 15 (targetSdk 35 / compileSdk 35) Google Play Protect Privacy & Signing Compliance', () => {
      const gradleSrc = fs.readFileSync(path.join(rootDir, 'apps/mobile/android/app/build.gradle'), 'utf8');
      const manifestSrc = fs.readFileSync(path.join(rootDir, 'apps/mobile/android/app/src/main/AndroidManifest.xml'), 'utf8');
      const mainActivitySrc = fs.readFileSync(path.join(rootDir, 'apps/mobile/android/app/src/main/java/com/cricos/app/MainActivity.java'), 'utf8');

      assert.ok(gradleSrc.includes('compileSdk 35') && gradleSrc.includes('targetSdk 35'), 'Android build.gradle must target API 35 (Android 15)');
      assert.ok(gradleSrc.includes('enableV2Signing = true') && gradleSrc.includes('enableV3Signing = true'), 'APK must enable V2 and V3 signature schemes');
      assert.ok(manifestSrc.includes('android:dataExtractionRules="@xml/data_extraction_rules"'), 'Manifest must include Android 12-15 data_extraction_rules');
      assert.ok(manifestSrc.includes('android:networkSecurityConfig="@xml/network_security_config"'), 'Manifest must include network_security_config');
      assert.ok(!manifestSrc.includes('READ_EXTERNAL_STORAGE') && !manifestSrc.includes('RECORD_AUDIO'), 'Manifest must not request legacy/dangerous storage or audio permissions');
      assert.ok(mainActivitySrc.includes('setAllowUniversalAccessFromFileURLs(false)'), 'WebView must disable universal file URL access for Play Protect compliance');
    });
  });
});



