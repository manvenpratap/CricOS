/**
 * apps/web/src/components/officials-marketplace.ts
 *
 * Officials Services Marketplace (Umpires & Scorers)
 * Allows certified match officials and scorers to list verified credentials,
 * rate cards, and availability for grassroots and corporate tournaments.
 */
export class OfficialsMarketplaceComponent {
    officials = [];
    selectedRole = 'ALL';
    constructor(initialOfficials = []) {
        this.officials = initialOfficials.length > 0 ? initialOfficials : this.getDefaultOfficials();
    }
    getDefaultOfficials() {
        return [
            {
                id: 'off-ump-101',
                name: 'K. S. Sundaram',
                role: 'UMPIRE',
                certification: 'BCCI_LEVEL_2',
                association: 'Karnataka State Cricket Association (KSCA)',
                matchesOfficiated: 148,
                rating: 4.95,
                matchRateMinor: 180000, // ₹1,800.00
                hourlyRateMinor: 45000,
                availability: 'AVAILABLE',
                timeSlot: '16:00 – 21:00',
                specialization: 'Elite T20 & DLS Match Calculations',
                badge: 'BCCI Elite Panel'
            },
            {
                id: 'off-ump-102',
                name: 'Rajeshwari Iyer',
                role: 'UMPIRE',
                certification: 'STATE_CERTIFIED',
                association: 'Tamil Nadu Cricket Association (TNCA)',
                matchesOfficiated: 92,
                rating: 4.88,
                matchRateMinor: 140000, // ₹1,400.00
                hourlyRateMinor: 35000,
                availability: 'AVAILABLE',
                timeSlot: '09:00 – 14:00',
                specialization: 'Strict MCC Law 41/42 Code of Conduct & DRS',
                badge: 'State Certified'
            },
            {
                id: 'off-scr-201',
                name: 'M. Jayanth',
                role: 'SCORER',
                certification: 'BCCI_LEVEL_1',
                association: 'Delhi & District Cricket Association (DDCA)',
                matchesOfficiated: 215,
                rating: 4.98,
                matchRateMinor: 120000, // ₹1,200.00
                hourlyRateMinor: 30000,
                availability: 'AVAILABLE',
                timeSlot: '14:00 – 22:00',
                specialization: 'High-Velocity Live SSE & Cricsheet XML',
                badge: 'Master Scorer'
            },
            {
                id: 'off-scr-202',
                name: 'Pooja Venkatesh',
                role: 'SCORER',
                certification: 'CLUB_CERTIFIED',
                association: 'Bangalore Cricket League',
                matchesOfficiated: 64,
                rating: 4.75,
                matchRateMinor: 90000, // ₹900.00
                hourlyRateMinor: 22500,
                availability: 'AVAILABLE',
                timeSlot: '18:00 – 22:00',
                specialization: 'Wagon Wheel & Tactical Bowling Telemetry',
                badge: 'Verified Scorer'
            }
        ];
    }
    setFilter(role) {
        this.selectedRole = role;
    }
    getFilteredOfficials() {
        if (this.selectedRole === 'ALL') {
            return [...this.officials];
        }
        return this.officials.filter(o => o.role === this.selectedRole);
    }
    onboardOfficial(official) {
        this.officials.unshift(official);
    }
    renderHtml() {
        const list = this.getFilteredOfficials();
        return `
      <div class="officials-marketplace-panel" style="font-family: 'Plus Jakarta Sans', sans-serif; color: #FFF;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
          <div>
            <div style="font-size: 1.15rem; font-weight: 700; color: #FFF;">Certified Match Officials & Scorers</div>
            <div style="font-size: 0.8rem; color: #94A3B8;">Verified BCCI, State, and Board accredited umpires & digital scorers</div>
          </div>
          <div style="display: flex; gap: 0.4rem;">
            <button class="btn ${this.selectedRole === 'ALL' ? 'btn-primary' : 'btn-secondary'}" onclick="filterOfficials('ALL')" data-tooltip="View all match officials">All</button>
            <button class="btn ${this.selectedRole === 'UMPIRE' ? 'btn-primary' : 'btn-secondary'}" onclick="filterOfficials('UMPIRE')" data-tooltip="Filter Umpires only">Umpires ⚖️</button>
            <button class="btn ${this.selectedRole === 'SCORER' ? 'btn-primary' : 'btn-secondary'}" onclick="filterOfficials('SCORER')" data-tooltip="Filter Scorers only">Scorers ⚡</button>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem;">
          ${list.map(off => `
            <div class="official-card" style="background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.15rem; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                  <span style="background: rgba(0, 229, 153, 0.15); color: #00E599; border: 1px solid rgba(0,229,153,0.3); font-size: 0.68rem; font-weight: 700; padding: 0.15rem 0.5rem; border-radius: 4px;">
                    ${off.badge}
                  </span>
                  <span style="color: #FFB800; font-size: 0.8rem; font-weight: 700;">★ ${off.rating.toFixed(2)}</span>
                </div>
                <div style="font-size: 1rem; font-weight: 700; color: #FFF; margin-bottom: 0.2rem;">${off.name}</div>
                <div style="font-size: 0.75rem; color: #94A3B8; margin-bottom: 0.6rem;">${off.association}</div>
                <div style="font-size: 0.72rem; color: #00D2FF; background: rgba(0,210,255,0.08); padding: 0.35rem 0.5rem; border-radius: 6px; margin-bottom: 0.75rem;">
                  🎯 ${off.specialization}
                </div>
                <div style="font-size: 0.75rem; color: #E2E8F0; display: flex; justify-content: space-between; margin-bottom: 0.75rem;">
                  <span>Matches: <strong>${off.matchesOfficiated}</strong></span>
                  <span>Slot: <strong>${off.timeSlot}</strong></span>
                </div>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 0.75rem;">
                <div>
                  <div style="font-size: 0.65rem; color: #94A3B8;">MATCH RATE</div>
                  <div style="font-size: 1.05rem; font-weight: 800; color: #00E599; font-family: monospace;">₹${(off.matchRateMinor / 100).toLocaleString('en-IN')}</div>
                </div>
                <button class="btn btn-primary" onclick="addOfficialToBasket('${off.id}')" style="padding: 0.4rem 0.85rem; font-size: 0.78rem;" data-tooltip="Hire ${off.name} for upcoming match">
                  Hire Official +
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    }
}
//# sourceMappingURL=officials-marketplace.js.map