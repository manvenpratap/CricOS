/**
 * CricOS Scorecard Export Engine
 * Generates structured CSV and printable HTML match sheets for tournament archives.
 */

export interface BatterScorecardEntry {
  name: string;
  dismissal: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
}

export interface BowlerScorecardEntry {
  name: string;
  overs: string;
  maidens: number;
  runs: number;
  wickets: number;
  economyRate: number;
}

export interface MatchScorecardData {
  matchId: string;
  matchTitle: string;
  innings1Team: string;
  innings2Team: string;
  innings1Score: string;
  innings2Score: string;
  result: string;
  batters: BatterScorecardEntry[];
  bowlers: BowlerScorecardEntry[];
  fallOfWickets: string[];
  extras: {
    wides: number;
    noBalls: number;
    byes: number;
    legByes: number;
    total: number;
  };
}

export function generateScorecardCsv(data: MatchScorecardData): string {
  const lines: string[] = [];

  // Match Header
  lines.push(`"Match","${data.matchTitle.replace(/"/g, '""')}"`);
  lines.push(`"Match ID","${data.matchId}"`);
  lines.push(`"Result","${data.result.replace(/"/g, '""')}"`);
  lines.push('');

  // Batting Section
  lines.push('"BATTING","Dismissal","Runs","Balls","4s","6s","SR"');
  for (const b of data.batters) {
    lines.push(
      `"${b.name.replace(/"/g, '""')}","${b.dismissal.replace(/"/g, '""')}",${b.runs},${b.balls},${b.fours},${b.sixes},${b.strikeRate.toFixed(2)}`
    );
  }
  lines.push('');

  // Extras
  lines.push(
    `"EXTRAS","Total: ${data.extras.total} (b ${data.extras.byes}, lb ${data.extras.legByes}, w ${data.extras.wides}, nb ${data.extras.noBalls})"`
  );
  lines.push('');

  // Bowling Section
  lines.push('"BOWLING","Overs","Maidens","Runs","Wickets","Economy"');
  for (const bw of data.bowlers) {
    lines.push(
      `"${bw.name.replace(/"/g, '""')}",${bw.overs},${bw.maidens},${bw.runs},${bw.wickets},${bw.economyRate.toFixed(2)}`
    );
  }
  lines.push('');

  // Fall of Wickets
  if (data.fallOfWickets && data.fallOfWickets.length > 0) {
    lines.push('"FALL OF WICKETS"');
    lines.push(`"${data.fallOfWickets.join(' • ')}"`);
  }

  return lines.join('\n');
}

export function generatePrintableScorecardHtml(data: MatchScorecardData): string {
  const batterRows = data.batters
    .map(
      b => `
    <tr>
      <td style="font-weight: 600;">${b.name}</td>
      <td style="color: #64748b; font-size: 0.85em;">${b.dismissal}</td>
      <td style="font-weight: 700; text-align: right;">${b.runs}</td>
      <td style="text-align: right;">${b.balls}</td>
      <td style="text-align: right;">${b.fours}</td>
      <td style="text-align: right;">${b.sixes}</td>
      <td style="text-align: right;">${b.strikeRate.toFixed(1)}</td>
    </tr>`
    )
    .join('');

  const bowlerRows = data.bowlers
    .map(
      bw => `
    <tr>
      <td style="font-weight: 600;">${bw.name}</td>
      <td style="text-align: right;">${bw.overs}</td>
      <td style="text-align: right;">${bw.maidens}</td>
      <td style="text-align: right;">${bw.runs}</td>
      <td style="font-weight: 700; text-align: right; color: #dc2626;">${bw.wickets}</td>
      <td style="text-align: right;">${bw.economyRate.toFixed(2)}</td>
    </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${data.matchTitle} — Official Scorecard</title>
  <style>
    body { font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; margin: 2rem; color: #0f172a; }
    h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }
    .meta { font-size: 0.9rem; color: #64748b; margin-bottom: 1.5rem; }
    .result-banner { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; padding: 0.75rem 1rem; border-radius: 6px; font-weight: 700; margin-bottom: 1.5rem; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; font-size: 0.9rem; }
    th { text-align: left; background: #f8fafc; padding: 0.5rem; border-bottom: 2px solid #e2e8f0; font-size: 0.8rem; text-transform: uppercase; }
    td { padding: 0.5rem; border-bottom: 1px solid #f1f5f9; }
    .section-title { font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem; border-left: 4px solid #059669; padding-left: 0.5rem; }
    .footer { font-size: 0.75rem; color: #94a3b8; margin-top: 2rem; border-top: 1px solid #e2e8f0; padding-top: 0.5rem; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <h1>🏏 ${data.matchTitle}</h1>
  <div class="meta">Match ID: ${data.matchId} • Innings 1: ${data.innings1Score} • Innings 2: ${data.innings2Score}</div>
  <div class="result-banner">🏆 ${data.result}</div>

  <div class="section-title">Batting Card</div>
  <table>
    <thead>
      <tr>
        <th>Batter</th>
        <th>Dismissal</th>
        <th style="text-align: right;">Runs</th>
        <th style="text-align: right;">Balls</th>
        <th style="text-align: right;">4s</th>
        <th style="text-align: right;">6s</th>
        <th style="text-align: right;">SR</th>
      </tr>
    </thead>
    <tbody>
      ${batterRows}
    </tbody>
  </table>

  <div style="font-size: 0.85rem; margin-bottom: 1.5rem; background: #f8fafc; padding: 0.6rem; border-radius: 4px;">
    <strong>Extras:</strong> ${data.extras.total} (b ${data.extras.byes}, lb ${data.extras.legByes}, w ${data.extras.wides}, nb ${data.extras.noBalls})
  </div>

  <div class="section-title">Bowling Analysis</div>
  <table>
    <thead>
      <tr>
        <th>Bowler</th>
        <th style="text-align: right;">Overs</th>
        <th style="text-align: right;">Maidens</th>
        <th style="text-align: right;">Runs</th>
        <th style="text-align: right;">Wickets</th>
        <th style="text-align: right;">Econ</th>
      </tr>
    </thead>
    <tbody>
      ${bowlerRows}
    </tbody>
  </table>

  <div class="footer">Certified by CricOS Unified Cricket Platform • MCC Laws of Cricket Certified</div>
</body>
</html>`;
}
