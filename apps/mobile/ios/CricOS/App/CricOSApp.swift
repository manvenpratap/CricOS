//
//  CricOSApp.swift
//  CricOS — Unified Cricket Operating System (iOS)
//
//  Created for CricOS Platform Technologies.
//  Copyright © 2026 CricOS. All rights reserved.
//

import SwiftUI
import WebKit

@main
struct CricOSApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate

    var body: some Scene {
        WindowGroup {
            ContentView()
                .preferredColorScheme(.dark)
                .background(Color(red: 4/255, green: 7/255, blue: 13/255)) // #04070D
                .ignoresSafeArea(.all)
        }
    }
}

class AppDelegate: NSObject, UIApplicationDelegate {
    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
    ) -> Bool {
        // Enforce Floodlit Stadium Dark Theme for status bar
        UINavigationBar.appearance().barTintColor = UIColor(red: 4/255, green: 7/255, blue: 13/255, alpha: 1.0)
        return true
    }
}

struct ContentView: View {
    @StateObject private var bridge = NativeBridge()

    var body: some View {
        ZStack {
            Color(red: 4/255, green: 7/255, blue: 13/255)
                .ignoresSafeArea()

            CricOSWebView(bridge: bridge)
                .ignoresSafeArea(.all, edges: .all)
        }
        .statusBar(hidden: false)
    }
}
