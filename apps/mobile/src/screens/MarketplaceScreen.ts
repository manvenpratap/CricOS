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

export class MarketplaceScreenController {
  private slots: MobileMarketplaceSlot[] = [];
  private selectedCategory: ProviderCategory | 'ALL' = 'ALL';
  private bookings: MobileBookingReceipt[] = [];

  constructor(initialSlots: MobileMarketplaceSlot[] = []) {
    this.slots = [...initialSlots];
  }

  public setSlots(slots: MobileMarketplaceSlot[]): void {
    this.slots = [...slots];
  }

  public getSlots(): MobileMarketplaceSlot[] {
    return [...this.slots];
  }

  public setCategory(category: ProviderCategory | 'ALL'): void {
    this.selectedCategory = category;
  }

  public getCategory(): ProviderCategory | 'ALL' {
    return this.selectedCategory;
  }

  public getFilteredSlots(): MobileMarketplaceSlot[] {
    if (this.selectedCategory === 'ALL') {
      return this.slots;
    }
    return this.slots.filter(s => s.category === this.selectedCategory);
  }

  public calculateBreakdown(basePriceMinor: number): MobileCommercialBreakdown {
    // 5% Platform Fee, 18% GST on (base + platform fee)
    const platformFeeMinor = Math.round(basePriceMinor * 0.05);
    const taxableAmountMinor = basePriceMinor + platformFeeMinor;
    const gstMinor = Math.round(taxableAmountMinor * 0.18);
    const totalMinor = taxableAmountMinor + gstMinor;

    return {
      baseMinor: basePriceMinor,
      platformFeeMinor,
      gstMinor,
      totalMinor
    };
  }

  public bookSlot(slotId: string): MobileBookingReceipt {
    const slotIndex = this.slots.findIndex(s => s.id === slotId);
    if (slotIndex === -1) {
      throw new Error(`Slot ${slotId} not found`);
    }

    const slot = this.slots[slotIndex]!;
    if (!slot.isAvailable) {
      throw new Error(`Slot ${slotId} is already booked or unavailable`);
    }

    // Mark slot unavailable
    slot.isAvailable = false;

    const breakdown = this.calculateBreakdown(slot.priceMinor);
    const receipt: MobileBookingReceipt = {
      bookingId: `m-bk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      slotId: slot.id,
      providerName: slot.providerName,
      category: slot.category,
      breakdown,
      bookedAt: new Date().toISOString(),
      status: 'CONFIRMED'
    };

    this.bookings.push(receipt);
    return receipt;
  }

  public getBookings(): MobileBookingReceipt[] {
    return [...this.bookings];
  }

  public renderMobileHtml(): string {
    const filtered = this.getFilteredSlots();

    return `
      <div class="mobile-marketplace-screen" style="padding:16px;background:#090d16;color:#f8fafc;font-family:sans-serif;max-width:480px;margin:auto;">
        <div style="font-size:18px;font-weight:700;margin-bottom:12px;color:#10b981;">🏟️ Cricket Marketplace</div>
        
        <!-- Filter Tabs -->
        <div style="display:flex;gap:6px;overflow-x:auto;margin-bottom:16px;">
          ${(['ALL', 'GROUND', 'UMPIRE', 'SCORER', 'COACH'] as const).map(cat => `
            <span style="padding:6px 12px;border-radius:20px;font-size:12px;font-weight:600;background:${this.selectedCategory === cat ? '#10b981' : 'rgba(255,255,255,0.06)'};color:${this.selectedCategory === cat ? '#042f2e' : '#cbd5e1'};cursor:pointer;">
              ${cat}
            </span>
          `).join('')}
        </div>

        <!-- Slot Cards -->
        <div style="display:flex;flex-direction:column;gap:12px;">
          ${filtered.map(slot => {
            const breakdown = this.calculateBreakdown(slot.priceMinor);
            return `
              <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:12px;" data-tooltip="Slot: ${slot.startTime} - ${slot.endTime}">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                  <div>
                    <div style="font-weight:700;font-size:14px;color:#f8fafc;">${slot.title}</div>
                    <div style="font-size:12px;color:#94a3b8;">${slot.location} • ⭐ ${slot.rating.toFixed(1)}</div>
                  </div>
                  <span style="font-size:11px;padding:2px 6px;border-radius:4px;background:rgba(16,185,129,0.1);color:#10b981;font-weight:600;">
                    ${slot.category}
                  </span>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;border-top:1px solid rgba(255,255,255,0.05);padding-top:8px;">
                  <div>
                    <span style="font-size:15px;font-weight:700;color:#f8fafc;">₹${(breakdown.totalMinor / 100).toFixed(2)}</span>
                    <span style="font-size:11px;color:#94a3b8;"> incl. taxes</span>
                  </div>
                  <button style="padding:6px 14px;border-radius:6px;background:${slot.isAvailable ? '#10b981' : '#475569'};color:${slot.isAvailable ? '#042f2e' : '#94a3b8'};font-weight:700;font-size:12px;border:none;cursor:pointer;" ${slot.isAvailable ? '' : 'disabled'} data-tooltip="${slot.isAvailable ? 'Book instantly with escrow hold' : 'Slot already booked'}">
                    ${slot.isAvailable ? 'Book' : 'Booked'}
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }
}
