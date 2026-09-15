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

export function computeCommercialBreakdown(basePriceMinor: number, platformFeeRate: number = 0.05, gstRate: number = 0.18): PriceBreakdown {
  const baseMinor = Math.max(0, Math.floor(basePriceMinor));
  const platformFeeMinor = Math.floor(baseMinor * platformFeeRate);
  const gstMinor = Math.floor(baseMinor * gstRate);
  const totalMinor = baseMinor + platformFeeMinor + gstMinor;

  return {
    baseMinor,
    platformFeeMinor,
    gstMinor,
    totalMinor
  };
}

export function renderListingCardHtml(listing: ProviderListing): string {
  const breakdown = computeCommercialBreakdown(listing.priceMinor);
  const totalDisplay = `₹${(breakdown.totalMinor / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  const baseDisplay = `₹${(breakdown.baseMinor / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  return `
    <div class="listing-card" style="background:rgba(18,24,38,0.75);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:1.25rem;margin-bottom:1rem;display:flex;justify-content:space-between;align-items:center;">
      <div>
        <div style="font-size:0.75rem;color:var(--cyan,#06b6d4);font-weight:600;text-transform:uppercase;">${listing.category}</div>
        <div style="font-size:1.1rem;font-weight:700;color:#f1f5f9;margin:0.25rem 0;">${listing.name}</div>
        <div style="font-size:0.8rem;color:#94a3b8;">📍 ${listing.location} · ⏰ ${listing.slotTime}</div>
        <div style="font-size:0.8rem;color:#f59e0b;margin-top:0.25rem;">⭐ ${listing.rating.toFixed(1)} / 5.0</div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:1.25rem;font-weight:700;color:var(--primary,#10b981);">${totalDisplay}</div>
        <div style="font-size:0.75rem;color:#94a3b8;" data-tooltip="Base ${baseDisplay} + Platform Fee + 18% GST">incl. taxes & fee</div>
        <button class="btn btn-reserve" style="margin-top:0.5rem;padding:0.4rem 0.8rem;background:var(--primary,#10b981);border:none;border-radius:6px;color:#fff;font-weight:600;cursor:pointer;" data-slot-id="${listing.availableSlotId}">Reserve Slot</button>
      </div>
    </div>
  `;
}
