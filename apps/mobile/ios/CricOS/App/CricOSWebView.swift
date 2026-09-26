//
//  CricOSWebView.swift
//  CricOS — Unified Cricket Operating System (iOS)
//
//  Created for CricOS Platform Technologies.
//  Copyright © 2026 CricOS. All rights reserved.
//

import SwiftUI
import WebKit

public struct CricOSWebView: UIViewRepresentable {
    @ObservedObject var bridge: NativeBridge

    public init(bridge: NativeBridge) {
        self.bridge = bridge
    }

    public func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()

        // 1. Media & WebGL Capabilities
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []
        config.preferences.isElementFullscreenEnabled = true

        // 2. Native Bridge Injection
        let userContentController = WKUserContentController()
        userContentController.add(bridge, name: "cricosNative")

        // Inject iOS native platform markers into JavaScript runtime
        let nativeInitScript = WKUserScript(
            source: """
            window.cricosIsNativeIOS = true;
            window.cricosNativePlatform = 'iOS';
            window.cricosNativeHaptic = function(style) {
                if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.cricosNative) {
                    window.webkit.messageHandlers.cricosNative.postMessage({ action: 'HAPTIC', style: style || 'MEDIUM' });
                }
            };
            window.cricosNativeShare = function(text, url) {
                if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.cricosNative) {
                    window.webkit.messageHandlers.cricosNative.postMessage({ action: 'SHARE', text: text, url: url });
                }
            };
            """,
            injectionTime: .atDocumentStart,
            forMainFrameOnly: true
        )
        userContentController.addUserScript(nativeInitScript)
        config.userContentController = userContentController

        // 3. Initialize WKWebView with Edge-to-Edge Pitch Dark Layout
        let webView = WKWebView(frame: .zero, configuration: config)
        bridge.webView = webView
        webView.navigationDelegate = context.coordinator
        webView.uiDelegate = context.coordinator

        // Design token: #04070D
        let pitchDark = UIColor(red: 4/255, green: 7/255, blue: 13/255, alpha: 1.0)
        webView.backgroundColor = pitchDark
        webView.isOpaque = true
        webView.scrollView.backgroundColor = pitchDark
        webView.scrollView.bounces = false
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.scrollView.showsVerticalScrollIndicator = false
        webView.scrollView.showsHorizontalScrollIndicator = false

        // Custom User Agent
        webView.customUserAgent = "CricOS-iOS/1.0.0 (Native; iOS; WKWebView)"

        // 4. Load Offline Distribution Bundle or Local Fallback
        if let bundleHtmlUrl = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "www") {
            let wwwDir = bundleHtmlUrl.deletingLastPathComponent()
            webView.loadFileURL(bundleHtmlUrl, allowingReadAccessTo: wwwDir)
        } else if let localDevUrl = URL(string: "http://localhost:3000/mobile") {
            webView.load(URLRequest(url: localDevUrl))
        }

        return webView
    }

    public func updateUIView(_ uiView: WKWebView, context: Context) {
        // State updates handled reactively
    }

    public func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }

    public class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate {
        var parent: CricOSWebView

        init(_ parent: CricOSWebView) {
            self.parent = parent
        }

        public func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            // Apply native body class styling
            webView.evaluateJavaScript("document.body.classList.add('is-native-app', 'is-native-ios');", completionHandler: nil)
        }

        public func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
            print("CricOS WebView navigation failed: \(error.localizedDescription)")
        }

        public func webView(
            _ webView: WKWebView,
            runJavaScriptAlertPanelWithMessage message: String,
            initiatedByFrame frame: WKFrameInfo,
            completionHandler: @escaping () -> Void
        ) {
            // In-app alert fallback for web alerts
            let alert = UIAlertController(title: "CricOS", message: message, preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: "OK", style: .default) { _ in
                completionHandler()
            })
            if let rootVC = webView.window?.rootViewController {
                rootVC.present(alert, animated: true)
            } else {
                completionHandler()
            }
        }
    }
}
