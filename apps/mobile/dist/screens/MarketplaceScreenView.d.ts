import { CricOSMobileClient } from '../api/mobile-client.js';
export interface TurfListing {
    id: string;
    title: string;
    category: 'GROUND' | 'UMPIRE' | 'SCORER';
    location: string;
    rating: number;
    basePriceMinor: number;
    slots: {
        time: string;
        status: 'AVAILABLE' | 'HOLD' | 'BOOKED';
    }[];
}
export declare class MarketplaceScreenViewController {
    private client;
    private listings;
    constructor(client: CricOSMobileClient);
    renderMobileHtml(): string;
}
//# sourceMappingURL=MarketplaceScreenView.d.ts.map