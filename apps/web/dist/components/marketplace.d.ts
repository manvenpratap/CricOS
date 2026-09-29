export interface ProviderListing {
    id: string;
    name: string;
    category: 'GROUND' | 'UMPIRE' | 'SCORER' | 'STREAMER';
    location: string;
    priceMinor: number;
    rating: number;
    availableSlotId: string;
    slotTime: string;
}
export interface PriceBreakdown {
    baseMinor: number;
    platformFeeMinor: number;
    gstMinor: number;
    totalMinor: number;
}
export declare function computeCommercialBreakdown(basePriceMinor: number, platformFeeRate?: number, gstRate?: number): PriceBreakdown;
export declare function renderListingCardHtml(listing: ProviderListing): string;
//# sourceMappingURL=marketplace.d.ts.map