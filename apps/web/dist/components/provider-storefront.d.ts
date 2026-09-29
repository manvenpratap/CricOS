/**
 * Provider Storefront & Slot Publisher Component (UX-018, MKT-001..020)
 * Allows ground operators and equipment providers to publish capacity, manage GiST slots, and view settlement earnings.
 */
export interface ProviderSlot {
    id: string;
    slotTime: string;
    priceMinor: number;
    hasFloodlights: boolean;
    isBooked: boolean;
    pitchType: string;
}
export interface ProviderEarningsSummary {
    grossBookingsMinor: number;
    platformFeeMinor: number;
    taxGstMinor: number;
    netPayableMinor: number;
    disbursedMinor: number;
    pendingDisbursementMinor: number;
}
export declare function getDefaultProviderSlots(): ProviderSlot[];
export declare function calculateProviderEarnings(grossMinor: number): ProviderEarningsSummary;
export declare function renderProviderStorefrontModalHtml(slots: ProviderSlot[], earnings: ProviderEarningsSummary): string;
//# sourceMappingURL=provider-storefront.d.ts.map