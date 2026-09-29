export type ProviderTrustState = 'UNVERIFIED' | 'VERIFIED' | 'PROBATION' | 'SUSPENDED';
export interface TrustBadgeConfig {
    label: string;
    bgColor: string;
    color: string;
    tooltip: string;
}
export declare function getTrustBadgeConfig(trustState: ProviderTrustState): TrustBadgeConfig;
export declare function renderTrustBadgeHtml(trustState: ProviderTrustState): string;
//# sourceMappingURL=disputes.d.ts.map