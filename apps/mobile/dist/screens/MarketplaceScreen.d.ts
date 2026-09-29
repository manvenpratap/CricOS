export type ProviderCategory = 'GROUND' | 'UMPIRE' | 'SCORER' | 'COACH';
export interface MobileMarketplaceSlot {
    id: string;
    providerId: string;
    providerName: string;
    category: ProviderCategory;
    title: string;
    location: string;
    startTime: string;
    endTime: string;
    priceMinor: number;
    rating: number;
    isAvailable: boolean;
}
export interface MobileCommercialBreakdown {
    baseMinor: number;
    platformFeeMinor: number;
    gstMinor: number;
    totalMinor: number;
}
export interface MobileBookingReceipt {
    bookingId: string;
    slotId: string;
    providerName: string;
    category: ProviderCategory;
    breakdown: MobileCommercialBreakdown;
    bookedAt: string;
    status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
}
export declare class MarketplaceScreenController {
    private slots;
    private selectedCategory;
    private bookings;
    constructor(initialSlots?: MobileMarketplaceSlot[]);
    setSlots(slots: MobileMarketplaceSlot[]): void;
    getSlots(): MobileMarketplaceSlot[];
    setCategory(category: ProviderCategory | 'ALL'): void;
    getCategory(): ProviderCategory | 'ALL';
    getFilteredSlots(): MobileMarketplaceSlot[];
    calculateBreakdown(basePriceMinor: number, platformFeePercent?: number): MobileCommercialBreakdown;
    onboardGroundSlot(facility: {
        groundName: string;
        surfaceType: string;
        hourlyRate: number;
        timeSlot: string;
    }): MobileMarketplaceSlot;
    onboardOfficialSlot(official: {
        name: string;
        category?: 'UMPIRE' | 'SCORER';
        role?: 'UMPIRE' | 'SCORER';
        certification?: string;
        matchRate?: number;
        priceMinor?: number;
        timeSlot?: string;
        startTime?: string;
        endTime?: string;
        location?: string;
        providerId?: string;
        providerName?: string;
        rating?: number;
    }): MobileMarketplaceSlot;
    seedDefaultSlots(): void;
    bookSlot(slotId: string): MobileBookingReceipt;
    getBookings(): MobileBookingReceipt[];
    addSlot(slot: Omit<MobileMarketplaceSlot, 'id' | 'isAvailable'>): MobileMarketplaceSlot;
    toggleSlotAvailability(slotId: string): boolean;
    renderMobileHtml(isProvider?: boolean): string;
}
//# sourceMappingURL=MarketplaceScreen.d.ts.map