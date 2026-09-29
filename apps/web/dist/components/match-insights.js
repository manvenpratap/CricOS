/**
 * Renders the Player of the Match (MVP) impact card (P1-010).
 */
export function renderMvpCardHtml(potm) {
    return `
    <div class="mvp-card glass-panel" style="padding: 1.25rem; border-radius: 12px; border: 1px solid rgba(255, 184, 0, 0.3); background: linear-gradient(135deg, rgba(255, 184, 0, 0.08), rgba(10, 16, 28, 0.85)); margin-bottom: 1.25rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
        <span class="badge badge-amber" style="font-weight: 700;" data-tooltip="Highest algorithmic impact score in match">🏆 PLAYER OF THE MATCH</span>
        <span style="font-family: var(--font-mono); font-weight: 800; font-size: 1.25rem; color: var(--amber);">${potm.total_impact_points} pts</span>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          <h3 style="margin: 0; font-family: var(--font-display); font-size: 1.3rem; color: #fff;">${potm.player_name}</h3>
          <div style="font-size: 0.85rem; color: var(--cyan); font-weight: 600; margin-top: 2px;">${potm.team_name}</div>
        </div>
        <div style="display: flex; gap: 1rem; text-align: right;">
          <div>
            <div style="font-size: 0.7rem; color: #8E9BAE;">Batting</div>
            <div style="font-family: var(--font-mono); font-weight: 700; color: #fff;">${potm.batting_impact}</div>
          </div>
          <div>
            <div style="font-size: 0.7rem; color: #8E9BAE;">Bowling</div>
            <div style="font-family: var(--font-mono); font-weight: 700; color: #fff;">${potm.bowling_impact}</div>
          </div>
          <div>
            <div style="font-size: 0.7rem; color: #8E9BAE;">Fielding</div>
            <div style="font-family: var(--font-mono); font-weight: 700; color: #fff;">${potm.fielding_impact}</div>
          </div>
        </div>
      </div>
    </div>
  `;
}
/**
 * Renders the AI match narrative recap and turning point swing gauge (P2-001).
 */
export function renderMatchNarrativeHtml(narrative) {
    const swingPct = Math.round(narrative.turning_point.win_prob_swing * 100);
    return `
    <div class="match-narrative-card glass-panel" style="padding: 1.5rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); background: rgba(10, 16, 28, 0.85); margin-bottom: 1.25rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
        <span class="badge badge-cyan" style="font-size: 0.75rem;">🤖 AI MATCH RECAP</span>
        <span style="font-size: 0.75rem; color: #8E9BAE;">Automated Press Wire</span>
      </div>

      <h3 style="margin: 0 0 0.5rem; font-family: var(--font-display); font-size: 1.2rem; color: #fff; line-height: 1.35;">${narrative.headline}</h3>
      <p style="font-size: 0.9rem; color: #CBD5E1; line-height: 1.5; margin-bottom: 1.25rem;">${narrative.summary}</p>

      <!-- Turning Point Gauge -->
      <div style="padding: 1rem; border-radius: 8px; background: rgba(0, 229, 153, 0.05); border: 1px solid rgba(0, 229, 153, 0.2);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--turf-emerald);">⚡ MATCH TURNING POINT (Over ${narrative.turning_point.over}.${narrative.turning_point.ball})</span>
          <span class="badge badge-emerald">+${swingPct}% Win Prob Swing</span>
        </div>
        <div style="font-size: 0.85rem; color: #fff;">${narrative.turning_point.description}</div>
      </div>
    </div>
  `;
}
//# sourceMappingURL=match-insights.js.map