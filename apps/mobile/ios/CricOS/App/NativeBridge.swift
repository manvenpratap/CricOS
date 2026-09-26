//
//  NativeBridge.swift
//  CricOS — Unified Cricket Operating System (iOS)
//
//  Created for CricOS Platform Technologies.
//  Copyright © 2026 CricOS. All rights reserved.
//

import UIKit
import WebKit

public class NativeBridge: NSObject, ObservableObject, WKScriptMessageHandler {
    public weak var webView: WKWebView?

    public func userContentController(
        _ userContentController: WKUserContentController,
        didReceive message: WKScriptMessage
    ) {
        guard message.name == "cricosNative" else { return }

        if let body = message.body as? [String: Any],
           let action = body["action"] as? String ?? body["type"] as? String {
            handleAction(action, payload: body)
        } else if let action = message.body as? String {
            handleAction(action, payload: [:])
        }
    }

    private func handleAction(_ action: String, payload: [String: Any]) {
        switch action.uppercased() {
        case "HAPTIC":
            let style = payload["style"] as? String ?? "MEDIUM"
            HapticsManager.shared.trigger(style)

        case "SHARE":
            let text = payload["text"] as? String ?? "Check out this match on CricOS"
            let urlString = payload["url"] as? String ?? "https://cricos.app"
            share(text: text, urlString: urlString)

        case "COPY":
            if let text = payload["text"] as? String {
                UIPasteboard.general.string = text
                HapticsManager.shared.trigger("LIGHT")
            }

        case "ACCOUNT_DELETED":
            // Apple Guideline 5.1.1(v) Native Account Purge Confirmation
            HapticsManager.shared.trigger("WARNING")
            let alert = UIAlertController(
                title: "Account Deleted",
                message: "Your CricOS account and associated sporting data have been permanently removed.",
                preferredStyle: .alert
            )
            alert.addAction(UIAlertAction(title: "OK", style: .default, handler: nil))
            topViewController()?.present(alert, animated: true)

        default:
            print("CricOS NativeBridge: Received unhandled message '\(action)'")
        }
    }

    private func share(text: String, urlString: String) {
        var items: [Any] = [text]
        if let url = URL(string: urlString) {
            items.append(url)
        }

        let activityVC = UIActivityViewController(activityItems: items, applicationActivities: nil)
        if let topVC = topViewController() {
            if let popover = activityVC.popoverPresentationController {
                popover.sourceView = topVC.view
                popover.sourceRect = CGRect(x: topVC.view.bounds.midX, y: topVC.view.bounds.midY, width: 0, height: 0)
                popover.permittedArrowDirections = []
            }
            topVC.present(activityVC, animated: true)
        }
    }

    private func topViewController() -> UIViewController? {
        guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
              let rootVC = windowScene.windows.first(where: { $0.isKeyWindow })?.rootViewController else {
            return nil
        }

        var top = rootVC
        while let presented = top.presentedViewController {
            top = presented
        }
        return top
    }
}
