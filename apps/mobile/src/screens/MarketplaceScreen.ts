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

  public calculateBreakdown(basePriceMinor: number, platformFeePercent: number = 5): MobileCommercialBreakdown {
    const feePct = Math.max(0, Math.min(20, platformFeePercent));
    const platformFeeMinor = Math.round(basePriceMinor * (feePct / 100));
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

  public onboardGroundSlot(facility: { groundName: string; surfaceType: string; hourlyRate: number; timeSlot: string }): MobileMarketplaceSlot {
    const times = facility.timeSlot.split('-');
    const newSlot: MobileMarketplaceSlot = {
      id: `slot-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      providerId: 'prov-turf-custom',
      providerName: facility.groundName,
      category: 'GROUND',
      title: `${facility.groundName} (${facility.surfaceType})`,
      location: 'South Zone, Metro',
      startTime: times[0]?.trim() || '14:00',
      endTime: times[1]?.trim() || '18:00',
      priceMinor: Math.round(facility.hourlyRate * 100),
      rating: 5.0,
      isAvailable: true
    };
    this.slots.unshift(newSlot);
    return newSlot;
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

  public addSlot(slot: Omit<MobileMarketplaceSlot, 'id' | 'isAvailable'>): MobileMarketplaceSlot {
    const newSlot: MobileMarketplaceSlot = {
      ...slot,
      id: `slot-${Date.now()}`,
      isAvailable: true
    };
    this.slots.unshift(newSlot);
    return newSlot;
  }

  public toggleSlotAvailability(slotId: string): boolean {
    const s = this.slots.find(item => item.id === slotId);
    if (!s) return false;
    s.isAvailable = !s.isAvailable;
    return s.isAvailable;
  }

  public renderMobileHtml(isProvider: boolean = false): string {
    const filtered = this.getFilteredSlots();

    return `
      <div class="mobile-marketplace-screen" style="padding: 1rem; color: #f8fafc; font-family: 'Plus Jakarta Sans', sans-serif;">
        <!-- Header Card -->
        <div style="background: rgba(10, 16, 28, 0.9); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 1.25rem; margin-bottom: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <div style="font-size: 0.75rem; color: #00E599; font-weight: 700; text-transform: uppercase;">
                ${isProvider ? 'Provider Operations' : 'Marketplace & Booking'}
              </div>
              <h2 style="margin: 0.2rem 0 0; font-size: 1.25rem; font-family: 'Space Grotesk', sans-serif;">
                ${isProvider ? 'Turf Capacity & Storefront' : 'Book Venues & Umpires'}
              </h2>
              <div style="font-size: 0.8rem; color: #94a3b8; margin-top: 0.2rem;">
                ${isProvider ? 'Manage hourly slots, floodlights & payouts' : 'Authoritative 15-min GiST hold with escrow'}
              </div>
            </div>
            <span style="font-size: 1.25rem;">${isProvider ? '🏟️' : '🛒'}</span>
          </div>

          ${isProvider ? `
            <!-- Provider Earnings Dashboard -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.4rem; margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid rgba(255,255,255,0.08);">
              <div style="background: rgba(0,0,0,0.3); border-radius: 8px; padding: 0.5rem; text-align: center;">
                <div style="font-size: 0.65rem; color: #94a3b8;">Gross Revenue</div>
                <div style="font-size: 0.85rem; font-weight: 800; color: #00E599; font-family: 'Chakra Petch', monospace;">₹35,000</div>
              </div>
              <div style="background: rgba(0,0,0,0.3); border-radius: 8px; padding: 0.5rem; text-align: center;">
                <div style="font-size: 0.65rem; color: #94a3b8;">Net Disbursed</div>
                <div style="font-size: 0.85rem; font-weight: 800; color: #00D2FF; font-family: 'Chakra Petch', monospace;">₹32,882</div>
              </div>
              <div style="background: rgba(0,0,0,0.3); border-radius: 8px; padding: 0.5rem; text-align: center;">
                <div style="font-size: 0.65rem; color: #94a3b8;">Trust Rating</div>
                <div style="font-size: 0.85rem; font-weight: 800; color: #FFB800; font-family: 'Chakra Petch', monospace;">★ 4.9</div>
              </div>
            </div>
          ` : ''}
        </div>

        ${isProvider ? `
          <!-- Provider Slot Publisher Form -->
          <div style="background: rgba(10, 16, 28, 0.85); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1rem; margin-bottom: 1rem;">
            <div style="font-size: 0.85rem; font-weight: 700; color: #f8fafc; margin-bottom: 0.6rem; font-family: 'Space Grotesk', sans-serif;">
              ➕ Publish Hourly Match Slot
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.4rem; margin-bottom: 0.4rem;">
              <input type="text" id="slotTitleInput" placeholder="Slot Title (e.g. Pitch 2 Floodlit)" style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; padding: 0.5rem; color: #f8fafc; font-size: 0.75rem;" />
              <input type="text" id="slotPriceInput" placeholder="Price (INR, e.g. 3500)" style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; padding: 0.5rem; color: #00E599; font-size: 0.75rem; font-family: 'Chakra Petch', monospace;" />
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.4rem; margin-bottom: 0.6rem;">
              <input type="text" id="slotTimeInput" placeholder="18:00 - 22:00" style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; padding: 0.5rem; color: #f8fafc; font-size: 0.75rem;" />
              <button type="button" onclick="window.cricosMobileApp.publishSlotAction()" style="padding: 0.5rem; border-radius: 6px; border: none; background: linear-gradient(135deg, #00E599, #00D2FF); color: #04070D; font-weight: 700; font-size: 0.75rem; cursor: pointer;" data-tooltip="Publish slot to live search index">
                Publish Slot
              </button>
            </div>
          </div>
        ` : `
          <!-- Consumer Category Filter Tabs -->
          <div style="display: flex; gap: 0.4rem; overflow-x: auto; margin-bottom: 1rem; padding-bottom: 0.2rem;">
            ${(['ALL', 'GROUND', 'UMPIRE', 'SCORER', 'COACH'] as const).map(cat => `
              <button type="button" onclick="window.cricosMobileApp.setMarketCategory('${cat}')" style="padding: 0.4rem 0.8rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; border: 1px solid ${this.selectedCategory === cat ? '#00E599' : 'rgba(255,255,255,0.1)'}; background: ${this.selectedCategory === cat ? '#00E599' : 'rgba(255,255,255,0.04)'}; color: ${this.selectedCategory === cat ? '#04070D' : '#cbd5e1'}; cursor: pointer;">
                ${cat}
              </button>
            `).join('')}
          </div>
        `}

        <!-- Slot Cards -->
        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          ${filtered.map(slot => {
            const breakdown = this.calculateBreakdown(slot.priceMinor);
            return `
              <div style="background: rgba(10, 16, 28, 0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 0.85rem;" data-tooltip="Slot: ${slot.startTime} - ${slot.endTime}">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <div>
                    <div style="font-size: 0.7rem; color: #00E599; font-weight: 700;">${slot.category}</div>
                    <div style="font-weight: 700; font-size: 0.95rem; margin: 0.15rem 0; color: #f8fafc;">${slot.title}</div>
                    <div style="font-size: 0.75rem; color: #94a3b8;">★ ${slot.rating.toFixed(1)} • ${slot.location}</div>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-weight: 800; color: #00E599; font-family: 'Chakra Petch', monospace; font-size: 1.1rem;">
                      ₹${(slot.priceMinor / 100).toFixed(2)}
                    </div>
                    <div style="font-size: 0.65rem; color: #94a3b8;">per slot</div>
                  </div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.75rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.6rem;">
                  <div style="font-size: 0.75rem; color: #94a3b8;">
                    Time: <strong style="color: #cbd5e1;">${slot.startTime} - ${slot.endTime}</strong>
                  </div>
                  ${isProvider ? `
                    <button type="button" onclick="window.cricosMobileApp.toggleSlotFreeze('${slot.id}')" style="padding: 0.4rem 0.8rem; border-radius: 6px; border: 1px solid ${slot.isAvailable ? '#ff3366' : '#00E599'}; background: ${slot.isAvailable ? 'rgba(255,51,102,0.15)' : 'rgba(0,229,153,0.15)'}; color: ${slot.isAvailable ? '#ff8099' : '#00E599'}; font-weight: 700; font-size: 0.7rem; cursor: pointer;" data-tooltip="${slot.isAvailable ? 'Freeze slot to prevent bookings' : 'Unfreeze slot to accept bookings'}">
                      ${slot.isAvailable ? 'Freeze Slot ❄️' : 'Unfreeze Slot ✓'}
                    </button>
                  ` : `
                    <button type="button" onclick="window.cricosMobileApp.bookTurfInstant('${slot.title}', '${(breakdown.totalMinor / 100).toFixed(2)}')" style="padding: 0.4rem 0.85rem; border-radius: 6px; border: none; background: ${slot.isAvailable ? 'linear-gradient(135deg, #00E599, #00D2FF)' : '#475569'}; color: ${slot.isAvailable ? '#04070D' : '#94a3b8'}; font-weight: 700; font-size: 0.75rem; cursor: pointer;" ${slot.isAvailable ? '' : 'disabled'} data-tooltip="${slot.isAvailable ? 'Lock slot with 15-minute GiST hold' : 'Slot already booked'}">
                      ${slot.isAvailable ? 'Instant 15-Min Hold →' : 'Booked'}
                    </button>
                  `}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }
}

