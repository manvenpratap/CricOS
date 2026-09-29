export class MarketplaceScreenViewController {
    client;
    listings = [
        {
            id: 'ground-1',
            title: 'Wankhede Arena Turf Club',
            category: 'GROUND',
            location: 'South Mumbai, MH',
            rating: 4.9,
            basePriceMinor: 350000,
            slots: [
                { time: '08:00 - 12:00', status: 'AVAILABLE' },
                { time: '13:00 - 17:00', status: 'AVAILABLE' },
                { time: '18:00 - 22:00', status: 'BOOKED' }
            ]
        },
        {
            id: 'umpire-1',
            title: 'Nitin Menon Panel Umpire',
            category: 'UMPIRE',
            location: 'Indore / Central Zone',
            rating: 5.0,
            basePriceMinor: 80000,
            slots: [
                { time: 'Morning Slot', status: 'AVAILABLE' },
                { time: 'Afternoon Slot', status: 'AVAILABLE' }
            ]
        }
    ];
    constructor(client) {
        this.client = client;
    }
    renderMobileHtml() {
        return `
      <div class="mobile-marketplace-screen" style="padding: 1rem; color: #f8fafc; font-family: 'Plus Jakarta Sans', sans-serif;">
        <!-- Header banner -->
        <div style="background: rgba(10, 16, 28, 0.9); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 1.25rem; margin-bottom: 1rem;">
          <h2 style="margin: 0; font-size: 1.3rem; font-family: 'Space Grotesk', sans-serif; color: #f8fafc;">Book Venues & Officials</h2>
          <p style="margin: 0.25rem 0 0; font-size: 0.8rem; color: #94a3b8;">Guaranteed match slots with double-entry escrow security</p>
        </div>

        <!-- Listings -->
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          ${this.listings.map(l => {
            const price = (l.basePriceMinor / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 });
            const fee = ((l.basePriceMinor / 100) * 0.05).toFixed(2);
            const total = ((l.basePriceMinor / 100) * 1.05 * 1.18).toFixed(2);
            return `
              <div style="background: rgba(10, 16, 28, 0.85); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                  <div>
                    <span style="font-size: 0.7rem; background: rgba(0, 229, 153, 0.15); color: #00E599; padding: 0.15rem 0.45rem; border-radius: 4px; font-weight: 600;">${l.category}</span>
                    <h3 style="margin: 0.35rem 0 0.15rem; font-size: 1.05rem; font-family: 'Space Grotesk', sans-serif; color: #f8fafc;">${l.title}</h3>
                    <div style="font-size: 0.75rem; color: #94a3b8;">📍 ${l.location} • ★ ${l.rating} Trust Score</div>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-size: 1.15rem; font-weight: 800; color: #00E599; font-family: 'Chakra Petch', monospace;">₹${price}</div>
                    <div style="font-size: 0.65rem; color: #94a3b8;">+5% Escrow +GST</div>
                  </div>
                </div>

                <!-- Slot Matrix -->
                <div style="margin-top: 0.75rem; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 0.75rem;">
                  <div style="font-size: 0.75rem; color: #cbd5e1; font-weight: 600; margin-bottom: 0.4rem;">Hourly Availability Matrix:</div>
                  <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
                    ${l.slots.map(s => `
                      <button type="button" class="slot-pill" onclick="window.cricosMobileApp.selectSlot('${l.title}', '${s.time}', '${total}')" style="padding: 0.35rem 0.65rem; font-size: 0.75rem; border-radius: 6px; font-weight: 600; cursor: ${s.status === 'AVAILABLE' ? 'pointer' : 'not-allowed'}; border: 1px solid ${s.status === 'AVAILABLE' ? 'rgba(0, 229, 153, 0.4)' : 'rgba(255, 51, 102, 0.3)'}; background: ${s.status === 'AVAILABLE' ? 'rgba(0, 229, 153, 0.1)' : 'rgba(255, 51, 102, 0.08)'}; color: ${s.status === 'AVAILABLE' ? '#00E599' : '#ff8099'};">
                        ${s.time} • ${s.status === 'AVAILABLE' ? 'Avail' : 'Booked'}
                      </button>
                    `).join('')}
                  </div>
                </div>

                <!-- Booking trigger -->
                <button type="button" onclick="window.cricosMobileApp.bookTurfInstant('${l.title}', '${total}')" style="margin-top: 0.85rem; width: 100%; padding: 0.65rem; border-radius: 8px; border: none; background: linear-gradient(135deg, #00E599, #00D2FF); color: #04070D; font-weight: 700; font-size: 0.85rem; cursor: pointer;">
                  Instant 15-Min Hold & Book (₹${total}) →
                </button>
              </div>
            `;
        }).join('')}
        </div>
      </div>
    `;
    }
}
//# sourceMappingURL=MarketplaceScreenView.js.map