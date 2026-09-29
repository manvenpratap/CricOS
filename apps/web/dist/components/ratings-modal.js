/**
 * apps/web/src/components/ratings-modal.ts
 *
 * Post-Match Reviews & Verified Trust Feedback Modal
 * Derived from Archive Specifications:
 * - 03_UX_Blueprint_v2.docx (Stage REVIEW: Rate providers and validate outcomes)
 * - 08_Sprint_Ready_P0_Backlog_v1.docx (TRU-001...008, ADM-003)
 *
 * Collects multi-dimensional ratings across Ground, Umpiring, and Scoring,
 * updating provider Bayesian reputation scores and reliability metrics.
 */
export function calculateAverageRating(ratings) {
    const sum = ratings.pitchQuality + ratings.umpiringAccuracy + ratings.scoringReliability;
    return Number((sum / 3).toFixed(1));
}
export function renderRatingsStars(score) {
    const rounded = Math.round(score);
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += i <= rounded ? '★' : '☆';
    }
    return stars;
}
/**
 * Generates the HTML modal for post-match verification and rating.
 */
export function renderPostMatchRatingModalHtml(matchTitle = 'Delhi Daredevils vs Mumbai Super Strikers') {
    return `
    <div id="modalMatchRating" class="modal-backdrop" style="display: none; position: fixed; inset: 0; background: rgba(4, 7, 13, 0.85); backdrop-filter: blur(12px); z-index: 1000; align-items: center; justify-content: center; padding: 1rem;">
      <div class="modal-card" style="background: rgba(10, 16, 28, 0.96); border: 1px solid rgba(0, 229, 153, 0.35); border-radius: 16px; max-width: 520px; width: 100%; padding: 1.75rem; box-shadow: 0 0 50px rgba(0, 229, 153, 0.2);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
          <div>
            <div style="font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 1.25rem; color: #f8fafc;">
              ⭐ Post-Match Verification & Ratings
            </div>
            <div style="font-size: 0.82rem; color: #94a3b8; margin-top: 0.2rem;">
              ${matchTitle}
            </div>
          </div>
          <button type="button" onclick="closeMatchRatingModal()" style="background: none; border: none; color: #94a3b8; font-size: 1.5rem; cursor: pointer;">✕</button>
        </div>

        <form id="formPostMatchRating" onsubmit="submitPostMatchRating(event)">
          <!-- Dimension 1: Pitch & Turf Quality -->
          <div style="margin-bottom: 1.15rem;">
            <div style="display: flex; justify-content: space-between; font-size: 0.88rem; font-weight: 600; color: #f8fafc; margin-bottom: 0.35rem;">
              <span>🏟️ Turf & Pitch Quality</span>
              <span id="labelPitchRating" style="color: #FFB800;">5 ★</span>
            </div>
            <input type="range" id="inputRatingPitch" min="1" max="5" value="5" step="1" oninput="updateRatingDisplay('labelPitchRating', this.value)" style="width: 100%; accent-color: #00E599;">
            <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: #94a3b8;">
              <span>Poor Surface</span>
              <span>International Standard</span>
            </div>
          </div>

          <!-- Dimension 2: Umpiring Accuracy & Fair Play -->
          <div style="margin-bottom: 1.15rem;">
            <div style="display: flex; justify-content: space-between; font-size: 0.88rem; font-weight: 600; color: #f8fafc; margin-bottom: 0.35rem;">
              <span>⚖️ Official Umpiring & Fair Play</span>
              <span id="labelUmpireRating" style="color: #FFB800;">5 ★</span>
            </div>
            <input type="range" id="inputRatingUmpire" min="1" max="5" value="5" step="1" oninput="updateRatingDisplay('labelUmpireRating', this.value)" style="width: 100%; accent-color: #00D2FF;">
            <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: #94a3b8;">
              <span>Disputed Decisions</span>
              <span>Flawless Officiating</span>
            </div>
          </div>

          <!-- Dimension 3: Electronic Scoring Accuracy -->
          <div style="margin-bottom: 1.15rem;">
            <div style="display: flex; justify-content: space-between; font-size: 0.88rem; font-weight: 600; color: #f8fafc; margin-bottom: 0.35rem;">
              <span>📋 Live Electronic Scoring Accuracy</span>
              <span id="labelScorerRating" style="color: #FFB800;">5 ★</span>
            </div>
            <input type="range" id="inputRatingScorer" min="1" max="5" value="5" step="1" oninput="updateRatingDisplay('labelScorerRating', this.value)" style="width: 100%; accent-color: #C084FC;">
            <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: #94a3b8;">
              <span>Sync Lag / Errors</span>
              <span>100% Ball Precision</span>
            </div>
          </div>

          <!-- Optional Remarks -->
          <div style="margin-bottom: 1.25rem;">
            <label style="display: block; font-size: 0.82rem; color: #94a3b8; margin-bottom: 0.35rem;">Official Match Remarks (Optional):</label>
            <textarea id="inputRatingRemarks" rows="2" placeholder="Both teams adhered to MCC Spirit of Cricket..." style="width: 100%; background: #060a12; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #f8fafc; padding: 0.5rem; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.85rem;"></textarea>
          </div>

          <div style="display: flex; gap: 0.75rem;">
            <button type="button" onclick="closeMatchRatingModal()" class="btn btn-secondary" style="flex: 1;" data-tooltip="Cancel rating submission">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" style="flex: 2;" data-tooltip="Submit verified review & release escrow payouts">
              ✓ Submit & Disburse Escrow
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}
//# sourceMappingURL=ratings-modal.js.map