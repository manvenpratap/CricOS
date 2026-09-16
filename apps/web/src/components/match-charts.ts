/**
 * CricOS Match Analytics Chart Engine
 * Zero-dependency, responsive SVG generators for match run progression and over bar analysis.
 */

export interface WormDataPoint {
  over: number;
  runs: number;
  isWicket?: boolean;
}

export interface ManhattanOverData {
  overNumber: number;
  runs: number;
  wickets: number;
  isMaiden?: boolean;
}

/**
 * Generates an SVG Worm Chart comparing Team 1 and Team 2 run progressions
 */
export function renderWormChartSvg(
  team1Runs: WormDataPoint[],
  team2Runs: WormDataPoint[],
  options: {
    width?: number;
    height?: number;
    team1Color?: string;
    team2Color?: string;
    team1Name?: string;
    team2Name?: string;
  } = {}
): string {
  const width = options.width || 600;
  const height = options.height || 260;
  const padding = { top: 25, right: 30, bottom: 35, left: 45 };

  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const maxOver = 20;
  const maxRuns = Math.max(
    180,
    ...team1Runs.map(p => p.runs),
    ...team2Runs.map(p => p.runs)
  );

  const scaleX = (over: number) => padding.left + (over / maxOver) * plotW;
  const scaleY = (runs: number) => padding.top + plotH - (runs / maxRuns) * plotH;

  // Grid lines (every 50 runs and every 5 overs)
  const gridLines: string[] = [];
  for (let r = 50; r <= maxRuns; r += 50) {
    const y = scaleY(r);
    gridLines.push(
      `<line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="rgba(255,255,255,0.08)" stroke-dasharray="3,3" />`
    );
    gridLines.push(
      `<text x="${padding.left - 8}" y="${y + 4}" fill="#64748b" font-size="10" text-anchor="end">${r}</text>`
    );
  }

  for (let o = 5; o <= maxOver; o += 5) {
    const x = scaleX(o);
    gridLines.push(
      `<line x1="${x}" y1="${padding.top}" x2="${x}" y2="${height - padding.bottom}" stroke="rgba(255,255,255,0.06)" />`
    );
    gridLines.push(
      `<text x="${x}" y="${height - padding.bottom + 16}" fill="#64748b" font-size="10" text-anchor="middle">${o} ov</text>`
    );
  }

  // Path generator
  const createPath = (points: WormDataPoint[]) => {
    if (points.length === 0) return '';
    return points.reduce((acc, p, idx) => {
      const x = scaleX(p.over);
      const y = scaleY(p.runs);
      return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');
  };

  const path1 = createPath(team1Runs);
  const path2 = createPath(team2Runs);

  const c1 = options.team1Color || '#00E599';
  const c2 = options.team2Color || '#00D2FF';

  // Wicket dots
  const renderWicketDots = (points: WormDataPoint[], color: string) => {
    return points
      .filter(p => p.isWicket)
      .map(p => {
        const x = scaleX(p.over);
        const y = scaleY(p.runs);
        return `<circle cx="${x}" cy="${y}" r="4.5" fill="#FF3366" stroke="${color}" stroke-width="1.5"><title>Wicket at ${p.over} ov (${p.runs} runs)</title></circle>`;
      })
      .join('');
  };

  const dots1 = renderWicketDots(team1Runs, c1);
  const dots2 = renderWicketDots(team2Runs, c2);

  return `<svg viewBox="0 0 ${width} ${height}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background: rgba(0,0,0,0.25); border-radius: 8px; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
  <!-- Grid -->
  ${gridLines.join('')}
  
  <!-- Axes -->
  <line x1="${padding.left}" y1="${height - padding.bottom}" x2="${width - padding.right}" y2="${height - padding.bottom}" stroke="rgba(255,255,255,0.2)" />
  <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${height - padding.bottom}" stroke="rgba(255,255,255,0.2)" />

  <!-- Team 1 Line -->
  ${path1 ? `<path d="${path1}" fill="none" stroke="${c1}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />` : ''}
  <!-- Team 2 Line -->
  ${path2 ? `<path d="${path2}" fill="none" stroke="${c2}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />` : ''}

  <!-- Wickets -->
  ${dots1}
  ${dots2}

  <!-- Legend -->
  <g transform="translate(${padding.left + 10}, ${padding.top + 10})">
    <rect x="0" y="-8" width="12" height="4" fill="${c1}" rx="2" />
    <text x="18" y="-4" fill="${c1}" font-size="11" font-weight="700">${options.team1Name || 'Team 1'}</text>
    <rect x="100" y="-8" width="12" height="4" fill="${c2}" rx="2" />
    <text x="118" y="-4" fill="${c2}" font-size="11" font-weight="700">${options.team2Name || 'Team 2'}</text>
  </g>
</svg>`;
}

/**
 * Generates an SVG Manhattan Bar Chart displaying runs scored per over
 */
export function renderManhattanChartSvg(
  overs: ManhattanOverData[],
  options: {
    width?: number;
    height?: number;
    barColor?: string;
    wicketColor?: string;
  } = {}
): string {
  const width = options.width || 600;
  const height = options.height || 220;
  const padding = { top: 25, right: 20, bottom: 30, left: 35 };

  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const totalOvers = Math.max(20, overs.length);
  const maxRuns = Math.max(18, ...overs.map(o => o.runs));

  const barWidth = Math.max(8, (plotW / totalOvers) * 0.7);
  const slotW = plotW / totalOvers;

  const bars: string[] = [];
  const labels: string[] = [];

  for (let i = 0; i < overs.length; i++) {
    const item = overs[i]!;
    const barH = (item.runs / maxRuns) * plotH;
    const x = padding.left + i * slotW + (slotW - barWidth) / 2;
    const y = height - padding.bottom - barH;

    let color = options.barColor || '#00D2FF';
    if (item.runs >= 15) color = '#00E599'; // high scoring over
    if (item.runs <= 2 && !item.isMaiden) color = '#64748b';
    if (item.isMaiden) color = '#94a3b8';

    bars.push(
      `<rect x="${x}" y="${y}" width="${barWidth}" height="${barH}" fill="${color}" rx="3">
        <title>Over ${item.overNumber}: ${item.runs} runs, ${item.wickets} wickets</title>
      </rect>`
    );

    // Over runs label on top
    if (item.runs > 0) {
      bars.push(
        `<text x="${x + barWidth / 2}" y="${y - 4}" fill="#F8FAFC" font-size="9" text-anchor="middle" font-weight="700">${item.runs}</text>`
      );
    }

    // Wicket markers on top of bar
    if (item.wickets > 0) {
      for (let w = 0; w < item.wickets; w++) {
        bars.push(
          `<circle cx="${x + barWidth / 2}" cy="${y - 14 - w * 9}" r="3.5" fill="#FF3366" />`
        );
      }
    }

    // Over number label
    if (item.overNumber % 2 === 0 || item.overNumber === 1) {
      labels.push(
        `<text x="${x + barWidth / 2}" y="${height - padding.bottom + 14}" fill="#64748b" font-size="9" text-anchor="middle">${item.overNumber}</text>`
      );
    }
  }

  return `<svg viewBox="0 0 ${width} ${height}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background: rgba(0,0,0,0.25); border-radius: 8px; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
  <line x1="${padding.left}" y1="${height - padding.bottom}" x2="${width - padding.right}" y2="${height - padding.bottom}" stroke="rgba(255,255,255,0.15)" />
  ${bars.join('')}
  ${labels.join('')}
</svg>`;
}
