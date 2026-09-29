/**
 * Provider Storefront & Slot Publisher Component (UX-018, MKT-001..020)
 * Allows ground operators and equipment providers to publish capacity, manage GiST slots, and view settlement earnings.
 */
export function getDefaultProviderSlots() {
    return [
        {
            id: 'slot-morning-1',
            slotTime: '06:00 - 09:00',
            priceMinor: 450000, // ₹4,500
            hasFloodlights: false,
            isBooked: true,
            pitchType: 'Natural Turf',
        },
        {
            id: 'slot-morning-2',
            slotTime: '09:00 - 12:00',
            priceMinor: 550000, // ₹5,500
            hasFloodlights: false,
            isBooked: false,
            pitchType: 'Natural Turf',
        },
        {
            id: 'slot-afternoon',
            slotTime: '13:00 - 16:00',
            priceMinor: 400000, // ₹4,000
            hasFloodlights: false,
            isBooked: false,
            pitchType: 'Astro Turf (Spin Friendly)',
        },
        {
            id: 'slot-evening',
            slotTime: '17:00 - 20:00',
            priceMinor: 750000, // ₹7,500
            hasFloodlights: true,
            isBooked: true,
            pitchType: 'Floodlit Premium Turf',
        },
        {
            id: 'slot-night',
            slotTime: '20:30 - 23:30',
            priceMinor: 850000, // ₹8,500
            hasFloodlights: true,
            isBooked: false,
            pitchType: 'Floodlit Premium Turf',
        },
    ];
}
export function calculateProviderEarnings(grossMinor) {
    // Commercial matrix: 5% platform facilitation fee, 18% GST on facilitation fee
    const platformFee = Math.round(grossMinor * 0.05);
    const taxGst = Math.round(platformFee * 0.18);
    const netPayable = grossMinor - platformFee - taxGst;
    const disbursed = Math.round(netPayable * 0.7); // 70% already disbursed
    const pending = netPayable - disbursed;
    return {
        grossBookingsMinor: grossMinor,
        platformFeeMinor: platformFee,
        taxGstMinor: taxGst,
        netPayableMinor: netPayable,
        disbursedMinor: disbursed,
        pendingDisbursementMinor: pending,
    };
}
import { formatMinorInr } from './event-basket.js';
export function renderProviderStorefrontModalHtml(slots, earnings) {
    const slotsListHtml = slots
        .map((s) => `
      <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.06); padding: 0.65rem 0.85rem; border-radius: 6px; margin-bottom: 0.5rem;">
        <div>
          <div style="font-weight: 700; font-size: 0.85rem; color: #FFF;">${s.slotTime}</div>
          <div style="font-size: 0.7rem; color: var(--text-muted);">${s.pitchType} ${s.hasFloodlights ? '• 💡 Floodlit' : ''}</div>
        </div>
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <div style="text-align: right;">
            <div style="font-weight: 700; font-family: var(--font-mono); color: var(--turf-emerald); font-size: 0.85rem;">${formatMinorInr(s.priceMinor)}</div>
            <div style="font-size: 0.65rem; color: ${s.isBooked ? 'var(--rose)' : 'var(--cyan)'}; font-weight: 700;">${s.isBooked ? 'RESERVED' : 'AVAILABLE'}</div>
          </div>
          <button class="btn btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.7rem;" onclick="toggleSlotAvailability('${s.id}')" data-tooltip="${s.isBooked ? 'Mark slot as available' : 'Block slot from marketplace'}">
            ${s.isBooked ? 'Unfreeze' : 'Block'}
          </button>
        </div>
      </div>
    `)
        .join('');
    return `
    <div id="modalProviderStorefront" class="modal-overlay" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(6px); z-index: 9999; justify-content: center; align-items: center;">
      <div class="modal-card" style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 12px; width: 620px; max-width: 95vw; max-height: 90vh; overflow-y: auto; padding: 1.5rem; box-shadow: 0 20px 50px rgba(0,0,0,0.6);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
          <div>
            <div style="font-size: 1.2rem; font-weight: 700; font-family: var(--font-display); color: #FFF; display: flex; align-items: center; gap: 0.5rem;">
              <span>🏪</span> Provider Storefront & Capacity Manager
            </div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">Publish match slots, set temporal GiST ranges, and inspect settled earnings</div>
          </div>
          <button onclick="closeProviderStorefrontModal()" style="background: none; border: none; font-size: 1.5rem; color: var(--text-muted); cursor: pointer;" data-tooltip="Close storefront modal">&times;</button>
        </div>

        <!-- Earnings Breakdown Summary -->
        <div style="background: rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 1rem; margin-bottom: 1.25rem;">
          <div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.5rem;">Settlement Earnings Breakdown (Month to Date)</div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; font-family: var(--font-mono); text-align: center;">
            <div style="background: rgba(255,255,255,0.02); padding: 0.5rem; border-radius: 6px;">
              <div style="font-size: 0.65rem; color: var(--text-muted);">Gross Revenue</div>
              <div style="font-size: 1.1rem; font-weight: 700; color: #FFF;">${formatMinorInr(earnings.grossBookingsMinor)}</div>
            </div>
            <div style="background: rgba(255,255,255,0.02); padding: 0.5rem; border-radius: 6px;">
              <div style="font-size: 0.65rem; color: var(--text-muted);">Net Disbursed</div>
              <div style="font-size: 1.1rem; font-weight: 700; color: var(--turf-emerald);">${formatMinorInr(earnings.disbursedMinor)}</div>
            </div>
            <div style="background: rgba(255,255,255,0.02); padding: 0.5rem; border-radius: 6px;">
              <div style="font-size: 0.65rem; color: var(--text-muted);">Pending Payout</div>
              <div style="font-size: 1.1rem; font-weight: 700; color: var(--amber);">${formatMinorInr(earnings.pendingDisbursementMinor)}</div>
            </div>
          </div>
          <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 0.5rem; display: flex; justify-content: space-between;">
            <span>Platform Facilitation: 5% (-${formatMinorInr(earnings.platformFeeMinor)})</span>
            <span>GST on Fee: 18% (-${formatMinorInr(earnings.taxGstMinor)})</span>
          </div>
        </div>

        <!-- Add Slot Form -->
        <div style="background: rgba(255,255,255,0.03); border: 1px dashed rgba(255,255,255,0.12); border-radius: 8px; padding: 1rem; margin-bottom: 1.25rem;">
          <div style="font-weight: 700; font-size: 0.85rem; margin-bottom: 0.5rem; color: var(--cyan);">+ Publish New Match Slot</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.5rem; margin-bottom: 0.5rem;">
            <div>
              <label style="font-size: 0.7rem; color: var(--text-muted);">Time Range</label>
              <input type="text" id="newSlotTime" value="14:00 - 17:00" style="width: 100%; padding: 0.4rem; font-size: 0.78rem; background: rgba(0,0,0,0.5); border: 1px solid var(--border-subtle); color: #FFF; border-radius: 4px;">
            </div>
            <div>
              <label style="font-size: 0.7rem; color: var(--text-muted);">Rate (INR)</label>
              <input type="number" id="newSlotRate" value="6000" style="width: 100%; padding: 0.4rem; font-size: 0.78rem; background: rgba(0,0,0,0.5); border: 1px solid var(--border-subtle); color: #FFF; border-radius: 4px;">
            </div>
            <div>
              <label style="font-size: 0.7rem; color: var(--text-muted);">Pitch Type</label>
              <select id="newSlotPitch" style="width: 100%; padding: 0.4rem; font-size: 0.78rem; background: rgba(0,0,0,0.5); border: 1px solid var(--border-subtle); color: #FFF; border-radius: 4px;">
                <option value="Natural Turf">Natural Turf</option>
                <option value="Astro Turf">Astro Turf</option>
                <option value="Matting">Matting</option>
              </select>
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;">
            <label style="font-size: 0.75rem; display: flex; align-items: center; gap: 0.35rem; color: #FFF; cursor: pointer;">
              <input type="checkbox" id="newSlotFloodlights" checked> Floodlights Available
            </label>
            <button class="btn btn-primary" style="padding: 0.35rem 0.8rem; font-size: 0.75rem;" onclick="submitNewSlotPublication()" data-tooltip="Publish slot into real-time search index">Publish Slot</button>
          </div>
        </div>

        <!-- Managed Slots List -->
        <div style="font-weight: 700; font-size: 0.85rem; margin-bottom: 0.5rem;">Published Match Slots (${slots.length})</div>
        <div id="providerSlotsContainer">
          ${slotsListHtml}
        </div>
      </div>
    </div>
  `;
}
//# sourceMappingURL=provider-storefront.js.map