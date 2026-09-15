import { ProviderType } from '@cricket-platform/contracts';

export interface Provider {
  id: string;
  ownerUserId: string;
  providerType: ProviderType;
  displayName: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  trustState: 'PENDING' | 'VERIFIED' | 'FLAGGED' | 'SUSPENDED';
  verifiedAt?: Date;
  avgRating: number;
  reliabilityScore: number;
}

export interface Listing {
  id: string;
  providerId: string;
  category: ProviderType;
  title: string;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  pricingModel: 'FIXED' | 'HOURLY';
  basePriceMinor: number;
  currency: string;
}
