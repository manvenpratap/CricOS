/**
 * Renders the tournament fixture board with conflict & readiness indicators (UX-020, UX-021, P1-006).
 */
export function renderFixtureBoardHtml(data) {
    const conflictBadge = data.conflicts_count > 0
        ? `<span class="badge badge-rose" data-tooltip="${data.conflicts_count} scheduling conflicts detected">⚠ ${data.conflicts_count} Conflicts</span>`
        : `<span class="badge badge-emerald" data-tooltip="All fixtures collision-free">✓ Zero Conflicts</span>`;
    const rows = data.fixtures.map(f => {
        const hasConflicts = f.conflicts && f.conflicts.length > 0;
        const dateStr = new Date(f.starts_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        return `
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); ${hasConflicts ? 'background: rgba(255, 51, 102, 0.08);' : ''}">
        <td style="padding: 0.75rem 1rem; font-weight: 600; color: var(--cyan);">R${f.round}</td>
        <td style="padding: 0.75rem 1rem;">
          <div style="font-weight: 700; color: #fff;">${f.team_a} vs ${f.team_b}</div>
          <div style="font-size: 0.75rem; color: #8E9BAE;">${f.ground_id ? 'Harbour Cricket Ground' : 'Unassigned'}</div>
        </td>
        <td style="padding: 0.75rem 1rem; font-size: 0.85rem; color: #CBD5E1;">${dateStr}</td>
        <td style="padding: 0.75rem 1rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <div style="flex: 1; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; min-width: 60px;">
              <div style="width: ${f.readiness_percentage}%; height: 100%; background: ${f.readiness_percentage === 100 ? 'var(--turf-emerald)' : 'var(--amber)'};"></div>
            </div>
            <span style="font-size: 0.75rem; font-weight: 600; color: #fff;">${f.readiness_percentage}%</span>
          </div>
          ${hasConflicts ? `<div style="font-size: 0.7rem; color: var(--rose); margin-top: 2px;">${f.conflicts[0]}</div>` : ''}
        </td>
        <td style="padding: 0.75rem 1rem; text-align: right;">
          <button class="btn btn-secondary btn-sm" onclick="openFixtureProcurement('${f.fixture_id}')" data-tooltip="Procure ground, umpires & match balls for fixture">
            📋 Procure
          </button>
        </td>
      </tr>
    `;
    }).join('');
    return `
    <div class="tournament-fixture-board glass-panel" style="padding: 1.5rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); background: rgba(10, 16, 28, 0.85);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
        <div>
          <h3 style="margin: 0; font-family: var(--font-display); font-size: 1.25rem; color: #fff;">Tournament Fixture Command Centre</h3>
          <div style="font-size: 0.8rem; color: #8E9BAE; margin-top: 4px;">
            ${data.total_fixtures} Fixtures • Overall Readiness: <strong style="color: var(--turf-emerald);">${data.overall_readiness_percentage}%</strong>
          </div>
        </div>
        <div style="display: flex; gap: 0.5rem; align-items: center;">
          ${conflictBadge}
          <button class="btn btn-primary btn-sm" onclick="openBulkImportModal('${data.tournament_id}')" data-tooltip="Upload CSV or JSON fixture schedule">
            📤 Bulk Import
          </button>
        </div>
      </div>

      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
          <thead>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); color: #8E9BAE; font-size: 0.75rem; text-transform: uppercase;">
              <th style="padding: 0.5rem 1rem;">Round</th>
              <th style="padding: 0.5rem 1rem;">Matchup & Ground</th>
              <th style="padding: 0.5rem 1rem;">Date & Slot</th>
              <th style="padding: 0.5rem 1rem;">Readiness</th>
              <th style="padding: 0.5rem 1rem; text-align: right;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    </div>
  `;
}
//# sourceMappingURL=tournament-ops.js.map