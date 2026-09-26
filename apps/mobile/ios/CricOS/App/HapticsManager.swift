//
//  HapticsManager.swift
//  CricOS — Unified Cricket Operating System (iOS)
//
//  Created for CricOS Platform Technologies.
//  Copyright © 2026 CricOS. All rights reserved.
//

import UIKit

public final class HapticsManager {
    public static let shared = HapticsManager()

    private let lightImpact = UIImpactFeedbackGenerator(style: .light)
    private let mediumImpact = UIImpactFeedbackGenerator(style: .medium)
    private let heavyImpact = UIImpactFeedbackGenerator(style: .heavy)
    private let softImpact = UIImpactFeedbackGenerator(style: .soft)
    private let rigidImpact = UIImpactFeedbackGenerator(style: .rigid)
    private let selectionFeedback = UISelectionFeedbackGenerator()
    private let notificationFeedback = UINotificationFeedbackGenerator()

    private init() {
        prepareAll()
    }

    public func prepareAll() {
        DispatchQueue.main.async {
            self.lightImpact.prepare()
            self.mediumImpact.prepare()
            self.heavyImpact.prepare()
            self.softImpact.prepare()
            self.rigidImpact.prepare()
            self.selectionFeedback.prepare()
            self.notificationFeedback.prepare()
        }
    }

    public func trigger(_ style: String) {
        DispatchQueue.main.async {
            switch style.uppercased() {
            case "LIGHT":
                self.lightImpact.impactOccurred()
            case "MEDIUM":
                self.mediumImpact.impactOccurred()
            case "HEAVY":
                self.heavyImpact.impactOccurred()
            case "SOFT":
                self.softImpact.impactOccurred()
            case "RIGID":
                self.rigidImpact.impactOccurred()
            case "SELECTION":
                self.selectionFeedback.selectionChanged()
            case "SUCCESS":
                self.notificationFeedback.notificationOccurred(.success)
            case "WARNING":
                self.notificationFeedback.notificationOccurred(.warning)
            case "ERROR":
                self.notificationFeedback.notificationOccurred(.error)
            default:
                self.mediumImpact.impactOccurred()
            }
        }
    }
}
