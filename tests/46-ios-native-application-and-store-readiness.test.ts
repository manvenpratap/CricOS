import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const iosDir = path.join(rootDir, 'apps', 'mobile', 'ios');

describe('46. iOS Native Application & App Store Readiness', () => {

  // 1. iOS Project Architecture & Swift Source Files
  it('1.1 should include SwiftUI app lifecycle and dark pitch theme in CricOSApp.swift', () => {
    const appSwiftPath = path.join(iosDir, 'CricOS', 'App', 'CricOSApp.swift');
    assert.ok(fs.existsSync(appSwiftPath), 'CricOSApp.swift exists');
    const content = fs.readFileSync(appSwiftPath, 'utf8');

    assert.ok(content.includes('@main'), 'Contains @main attribute');
    assert.ok(content.includes('struct CricOSApp: App'), 'Defines CricOSApp SwiftUI struct');
    assert.ok(content.includes('AppDelegate'), 'Provides AppDelegate adaptor for status bar handling');
    assert.ok(content.includes('4/255, green: 7/255, blue: 13/255'), 'Enforces #04070D pitch dark background');
    assert.ok(content.includes('CricOSWebView'), 'Embeds CricOSWebView in root view hierarchy');
  });

  it('1.2 should configure edge-to-edge WKWebView, media playback, and native injection in CricOSWebView.swift', () => {
    const webViewSwiftPath = path.join(iosDir, 'CricOS', 'App', 'CricOSWebView.swift');
    assert.ok(fs.existsSync(webViewSwiftPath), 'CricOSWebView.swift exists');
    const content = fs.readFileSync(webViewSwiftPath, 'utf8');

    assert.ok(content.includes('struct CricOSWebView: UIViewRepresentable'), 'Implements UIViewRepresentable');
    assert.ok(content.includes('allowsInlineMediaPlayback = true'), 'Allows inline video/media playback');
    assert.ok(content.includes('cricosNative'), 'Registers cricosNative script message handler');
    assert.ok(content.includes('window.cricosIsNativeIOS = true'), 'Injects cricosIsNativeIOS global marker');
    assert.ok(content.includes('bounces = false'), 'Disables elastic overscroll bounces to match web styling');
    assert.ok(content.includes('contentInsetAdjustmentBehavior = .never'), 'Enforces edge-to-edge safe area layout');
    assert.ok(content.includes('CricOS-iOS/1.0.0'), 'Sets custom native iOS User-Agent');
    assert.ok(content.includes('forResource: "index", withExtension: "html", subdirectory: "www"'), 'Loads offline bundle from www/index.html');
  });

  it('1.3 should handle Taptic feedback, sharing, clipboard, and account deletion in NativeBridge.swift', () => {
    const bridgeSwiftPath = path.join(iosDir, 'CricOS', 'App', 'NativeBridge.swift');
    assert.ok(fs.existsSync(bridgeSwiftPath), 'NativeBridge.swift exists');
    const content = fs.readFileSync(bridgeSwiftPath, 'utf8');

    assert.ok(content.includes('WKScriptMessageHandler'), 'Implements WKScriptMessageHandler');
    assert.ok(content.includes('HapticsManager.shared.trigger'), 'Routes HAPTIC calls to HapticsManager');
    assert.ok(content.includes('UIActivityViewController'), 'Presents UIActivityViewController for match sharing');
    assert.ok(content.includes('UIPasteboard.general.string'), 'Handles clipboard copy operations');
    assert.ok(content.includes('Account Deleted'), 'Provides Apple Guideline 5.1.1(v) account deletion handler');
  });

  it('1.4 should provide multi-tier Taptic Engine feedback generator in HapticsManager.swift', () => {
    const hapticsSwiftPath = path.join(iosDir, 'CricOS', 'App', 'HapticsManager.swift');
    assert.ok(fs.existsSync(hapticsSwiftPath), 'HapticsManager.swift exists');
    const content = fs.readFileSync(hapticsSwiftPath, 'utf8');

    assert.ok(content.includes('UIImpactFeedbackGenerator'), 'Uses UIImpactFeedbackGenerator');
    assert.ok(content.includes('UINotificationFeedbackGenerator'), 'Uses UINotificationFeedbackGenerator');
    assert.ok(content.includes('UISelectionFeedbackGenerator'), 'Uses UISelectionFeedbackGenerator');
    assert.ok(content.includes('prepareAll()'), 'Pre-warms Taptic engines for zero-latency response');
  });

  // 2. Apple Info.plist & Bundle Configuration
  it('2.1 should declare valid bundle identifier, permissions, and status bar in Info.plist', () => {
    const plistPath = path.join(iosDir, 'CricOS', 'Resources', 'Info.plist');
    assert.ok(fs.existsSync(plistPath), 'Info.plist exists');
    const content = fs.readFileSync(plistPath, 'utf8');

    assert.ok(content.includes('<string>com.cricos.app</string>'), 'Bundle identifier is com.cricos.app');
    assert.ok(content.includes('<string>CricOS</string>'), 'Display name is CricOS');
    assert.ok(content.includes('<string>1.0.0</string>'), 'Short version string is 1.0.0');
    assert.ok(content.includes('UIStatusBarStyleLightContent'), 'Light content status bar for pitch dark theme');
    assert.ok(content.includes('UIViewControllerBasedStatusBarAppearance'), 'UIViewControllerBasedStatusBarAppearance key present');
    assert.ok(content.includes('NSCameraUsageDescription'), 'Camera permission description present');
    assert.ok(content.includes('NSPhotoLibraryUsageDescription'), 'Photo library permission description present');
    assert.ok(content.includes('ITSAppUsesNonExemptEncryption'), 'App encryption exemption declared');
  });

  // 3. Apple WWDC 2024 Privacy Manifest (PrivacyInfo.xcprivacy)
  it('3.1 should enforce zero tracking and declare functional sporting data types in PrivacyInfo.xcprivacy', () => {
    const privacyPath = path.join(iosDir, 'CricOS', 'Resources', 'PrivacyInfo.xcprivacy');
    assert.ok(fs.existsSync(privacyPath), 'PrivacyInfo.xcprivacy exists');
    const content = fs.readFileSync(privacyPath, 'utf8');

    assert.ok(content.includes('<key>NSPrivacyTracking</key>'), 'Declares NSPrivacyTracking');
    assert.ok(content.includes('<false/>'), 'Tracking is explicitly false');
    assert.ok(content.includes('NSPrivacyCollectedDataTypeName'), 'Declares Name data collection');
    assert.ok(content.includes('NSPrivacyCollectedDataTypePhoneNumber'), 'Declares Phone number collection for OTP');
    assert.ok(content.includes('NSPrivacyCollectedDataTypeUserID'), 'Declares User ID collection');
    assert.ok(content.includes('NSPrivacyCollectedDataTypePurchaseHistory'), 'Declares Purchase History for booking escrows');
  });

  // 4. Xcode Project Specification (project.pbxproj)
  it('4.1 should configure target CricOS, deployment target 16.0, and Swift version in project.pbxproj', () => {
    const pbxPath = path.join(iosDir, 'CricOS.xcodeproj', 'project.pbxproj');
    assert.ok(fs.existsSync(pbxPath), 'project.pbxproj exists');
    const content = fs.readFileSync(pbxPath, 'utf8');

    assert.ok(content.includes('productName = CricOS;'), 'Product name is CricOS');
    assert.ok(content.includes('PRODUCT_BUNDLE_IDENTIFIER = com.cricos.app;'), 'PBX bundle identifier is com.cricos.app');
    assert.ok(content.includes('IPHONEOS_DEPLOYMENT_TARGET = 16.0;'), 'Targets iOS 16.0+');
    assert.ok(content.includes('SWIFT_VERSION = 5.0;'), 'Swift version configured');
    assert.ok(content.includes('CricOSApp.swift in Sources'), 'Build phase includes CricOSApp.swift');
    assert.ok(content.includes('CricOSWebView.swift in Sources'), 'Build phase includes CricOSWebView.swift');
    assert.ok(content.includes('www in Resources'), 'Resource phase bundles www asset directory');
  });

  // 5. Offline Bundle & Asset Catalogs
  it('5.1 should embed self-contained offline mobile web app in CricOS/Resources/www/index.html', () => {
    const wwwPath = path.join(iosDir, 'CricOS', 'Resources', 'www', 'index.html');
    assert.ok(fs.existsSync(wwwPath), 'Embedded www/index.html exists');
    const stat = fs.statSync(wwwPath);
    assert.ok(stat.size > 200000, `www/index.html is a substantial distribution bundle (${stat.size} bytes)`);

    const content = fs.readFileSync(wwwPath, 'utf8');
    assert.ok(content.includes('is-native-app'), 'Contains is-native-app styling class');
    assert.ok(content.includes('is-native-ios'), 'Contains is-native-ios platform marker');
    assert.ok(content.includes('CricOS — Consumer Mobile App'), 'Contains CricOS title');
  });

  it('5.2 should configure single universal 1024x1024 App Store icon and color tokens in Assets.xcassets', () => {
    const iconJsonPath = path.join(iosDir, 'CricOS', 'Resources', 'Assets.xcassets', 'AppIcon.appiconset', 'Contents.json');
    assert.ok(fs.existsSync(iconJsonPath), 'AppIcon Contents.json exists');
    const iconJson = JSON.parse(fs.readFileSync(iconJsonPath, 'utf8'));
    assert.strictEqual(iconJson.images[0].size, '1024x1024');

    const iconImgPath = path.join(iosDir, 'CricOS', 'Resources', 'Assets.xcassets', 'AppIcon.appiconset', 'icon-1024.png');
    assert.ok(fs.existsSync(iconImgPath), 'icon-1024.png binary exists');

    const accentJsonPath = path.join(iosDir, 'CricOS', 'Resources', 'Assets.xcassets', 'AccentColor.colorset', 'Contents.json');
    assert.ok(fs.existsSync(accentJsonPath), 'AccentColor Contents.json exists');
    const accentJson = JSON.parse(fs.readFileSync(accentJsonPath, 'utf8'));
    assert.strictEqual(accentJson.colors[0].color.components.green, '0.898', 'Accent is Turf Emerald (#00E599)');
  });

  // 6. Build Script & Pipeline Integration
  it('6.1 should execute bash apps/mobile/ios/build-ios.sh with clean zero exit code', () => {
    const scriptPath = path.join(iosDir, 'build-ios.sh');
    assert.ok(fs.existsSync(scriptPath), 'build-ios.sh exists');

    const output = execSync('bash apps/mobile/ios/build-ios.sh', { cwd: rootDir, encoding: 'utf8' });
    assert.ok(output.includes('CricOS iOS Native Project Verified & Packaged'), 'Build script completes successfully');
    assert.ok(output.includes('Validated Info.plist'), 'Validates Info.plist syntax');
  });

  it('6.2 should support ./pipeline.sh ios and detect iOS project in ./pipeline.sh doctor', () => {
    const doctorOutput = execSync('./pipeline.sh doctor', { cwd: rootDir, encoding: 'utf8' });
    assert.ok(doctorOutput.includes('Detected iOS native project (SwiftUI/WebKit)'), 'Pipeline doctor detects iOS project');
    assert.ok(doctorOutput.includes('Detected Android native project'), 'Pipeline doctor detects Android project');
  });

  // 7. Apple App Store Storefront & Review Metadata
  it('7.1 should provide complete App Store review metadata with demo account in store/apple/metadata.json', () => {
    const metaPath = path.join(rootDir, 'apps', 'mobile', 'store', 'apple', 'metadata.json');
    assert.ok(fs.existsSync(metaPath), 'store/apple/metadata.json exists');
    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));

    assert.strictEqual(meta.bundle_id, 'com.cricos.app');
    assert.strictEqual(meta.app_store_info.content_rating, '4+');
    assert.strictEqual(meta.review_information.demo_account_required, true);
    assert.strictEqual(meta.review_information.demo_phone_number, '+91 98765 43210');
    assert.strictEqual(meta.review_information.demo_role, 'CAPTAIN');
    assert.ok(meta.app_store_info.description.includes('TACTICAL LIVE MATCH SCORING'));
    assert.ok(meta.app_store_info.description.includes('Apple Guideline 5.1.1(v)'));
  });
});
