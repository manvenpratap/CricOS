/**
 * Renders Provider Arrival OTP Verification Modal (P1-011).
 */
export function renderProviderCheckInModalHtml(bookingId: string, providerName: string = 'Elite Official'): string {
  return `
    <div class="glass-panel" style="padding: 1.5rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); background: rgba(10, 16, 28, 0.95); max-width: 420px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 1.25rem;">
        <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">📍</div>
        <h3 style="margin: 0; font-family: var(--font-display); font-size: 1.3rem; color: #fff;">Provider Arrival Check-In</h3>
        <p style="font-size: 0.85rem; color: #8E9BAE; margin-top: 4px;">Enter the 4-digit OTP provided by the match captain or venue coordinator.</p>
      </div>

      <div style="margin-bottom: 1.25rem;">
        <label style="display: block; font-size: 0.8rem; color: #8E9BAE; margin-bottom: 0.5rem;">Provider</label>
        <div style="padding: 0.75rem; border-radius: 8px; background: rgba(255,255,255,0.05); color: #fff; font-weight: 600;">${providerName}</div>
      </div>

      <div style="margin-bottom: 1.5rem;">
        <label for="checkInOtpInput" style="display: block; font-size: 0.8rem; color: #8E9BAE; margin-bottom: 0.5rem;">4-Digit Arrival PIN / OTP</label>
        <input type="text" id="checkInOtpInput" maxlength="6" placeholder="• • • •" style="width: 100%; text-align: center; font-family: var(--font-mono); font-size: 1.5rem; letter-spacing: 0.5rem; padding: 0.75rem; border-radius: 8px; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.2); color: var(--turf-emerald);" />
      </div>

      <div style="display: flex; gap: 0.75rem;">
        <button class="btn btn-secondary" style="flex: 1;" onclick="closeModal('modalCheckIn')">Cancel</button>
        <button class="btn btn-primary" style="flex: 2;" onclick="submitProviderCheckIn('${bookingId}')" data-tooltip="Verify geolocation and check-in status">
          ✓ Verify Check-In
        </button>
      </div>
    </div>
  `;
}

/**
 * Renders Dual Captain & Official Match Sign-Off Modal (P1-011).
 */
export function renderMatchSignOffModalHtml(matchId: string): string {
  return `
    <div class="glass-panel" style="padding: 1.5rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); background: rgba(10, 16, 28, 0.95); max-width: 480px; margin: 0 auto;">
      <div style="margin-bottom: 1.25rem;">
        <h3 style="margin: 0; font-family: var(--font-display); font-size: 1.3rem; color: #fff;">Official Match Sign-Off</h3>
        <p style="font-size: 0.85rem; color: #8E9BAE; margin-top: 4px;">To disburse escrow payouts and freeze scorecards, all 3 stakeholders must digitally sign off.</p>
      </div>

      <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem;">
        <label style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; border-radius: 8px; background: rgba(255,255,255,0.04); cursor: pointer;">
          <input type="checkbox" id="signCaptainA" checked />
          <div>
            <div style="font-weight: 600; color: #fff; font-size: 0.9rem;">Northside XI Captain (Home)</div>
            <div style="font-size: 0.75rem; color: #8E9BAE;">Digitally confirms match result and score audit</div>
          </div>
        </label>

        <label style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; border-radius: 8px; background: rgba(255,255,255,0.04); cursor: pointer;">
          <input type="checkbox" id="signCaptainB" checked />
          <div>
            <div style="font-weight: 600; color: #fff; font-size: 0.9rem;">Riverside XI Captain (Away)</div>
            <div style="font-size: 0.75rem; color: #8E9BAE;">Digitally confirms match result and score audit</div>
          </div>
        </label>

        <label style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; border-radius: 8px; background: rgba(255,255,255,0.04); cursor: pointer;">
          <input type="checkbox" id="signOfficial" checked />
          <div>
            <div style="font-weight: 600; color: #fff; font-size: 0.9rem;">Lead Match Umpire (Official)</div>
            <div style="font-size: 0.75rem; color: #8E9BAE;">Confirms fair play, pitch condition and boundary measurements</div>
          </div>
        </label>
      </div>

      <div style="margin-bottom: 1.25rem;">
        <label for="signoffNotes" style="display: block; font-size: 0.8rem; color: #8E9BAE; margin-bottom: 0.4rem;">Official Remarks / Disciplinary Notes</label>
        <textarea id="signoffNotes" rows="2" placeholder="Optional notes (e.g. Clean sporting contest, no code of conduct breaches)" style="width: 100%; border-radius: 6px; padding: 0.5rem; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.15); color: #fff; font-size: 0.85rem;"></textarea>
      </div>

      <div style="display: flex; gap: 0.75rem;">
        <button class="btn btn-secondary" style="flex: 1;" onclick="closeModal('modalMatchSignOff')">Cancel</button>
        <button class="btn btn-primary" style="flex: 2;" onclick="submitMatchSignOff('${matchId}')" data-tooltip="Submit 3-party signatures and release escrow payouts">
          ✍ Submit Digital Sign-Off
        </button>
      </div>
    </div>
  `;
}
