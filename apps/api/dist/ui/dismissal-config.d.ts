/**
 * CricOS Dismissal Popup Configuration & Kinetic Celebration Engine
 * Dynamically maps MCC Laws 30-39 and Law 25 dismissal modes to athletic visual banners.
 */
export interface DismissalPopupConfig {
    title: string;
    subtitle: string;
    icon: string;
    color: string;
    borderColor: string;
    shadowColor: string;
    particleColors: string[];
}
export declare function getDismissalPopupConfig(modeInput?: string | null, fielder?: string | null, bowler?: string | null, batter?: string | null): DismissalPopupConfig;
export declare function getDismissalConfigClientScript(): string;
//# sourceMappingURL=dismissal-config.d.ts.map