/**
 * apps/web/src/components/officials-marketplace.ts
 *
 * Officials Services Marketplace (Umpires & Scorers)
 * Allows certified match officials and scorers to list verified credentials,
 * rate cards, and availability for grassroots and corporate tournaments.
 */
export type MarketplaceOfficialRole = 'UMPIRE' | 'SCORER' | 'MATCH_REFEREE';
export type CertificationLevel = 'BCCI_LEVEL_2' | 'BCCI_LEVEL_1' | 'STATE_CERTIFIED' | 'DISTRICT_ACCREDITED' | 'CLUB_CERTIFIED';
export interface OfficialProfile {
    id: string;
    name: string;
    role: MarketplaceOfficialRole;
    certification: CertificationLevel;
    association: string;
    matchesOfficiated: number;
    rating: number;
    matchRateMinor: number;
    hourlyRateMinor: number;
    availability: 'AVAILABLE' | 'BOOKED' | 'PROBATION';
    timeSlot: string;
    specialization: string;
    badge: string;
}
export declare class OfficialsMarketplaceComponent {
    private officials;
    private selectedRole;
    constructor(initialOfficials?: OfficialProfile[]);
    getDefaultOfficials(): OfficialProfile[];
    setFilter(role: MarketplaceOfficialRole | 'ALL'): void;
    getFilteredOfficials(): OfficialProfile[];
    onboardOfficial(official: OfficialProfile): void;
    renderHtml(): string;
}
//# sourceMappingURL=officials-marketplace.d.ts.map