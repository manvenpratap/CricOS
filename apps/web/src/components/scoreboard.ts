export interface BatterStats {
  id: string;
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  isStriker?: boolean;
}

export interface BowlerStats {
  id: string;
  name: string;
  overs: number;
  maidens: number;
  runsConceded: number;
  wickets: number;
}

export interface DeliveryChip {
  ballNumber: number;
  display: string;
  type: 'DOT' | 'RUNS' | 'BOUNDARY_FOUR' | 'MAXIMUM_SIX' | 'WICKET' | 'EXTRA';
}

export function calculateStrikeRate(runs: number, balls: number): string {
  if (balls === 0) return '0.00';
  return ((runs / balls) * 100).toFixed(1);
}

export function calculateEconomy(runs: number, overs: number): string {
  if (overs === 0) return '0.00';
  return (runs / overs).toFixed(2);
}

export function parseDeliveryToChip(delivery: { runs: number; isWicket?: boolean; isExtra?: boolean; extraType?: string }): DeliveryChip {
  if (delivery.isWicket) {
    return { ballNumber: 1, display: 'W', type: 'WICKET' };
  }
  if (delivery.isExtra) {
    const extraLabel = delivery.extraType ? delivery.extraType.toLowerCase().slice(0, 2) : 'ex';
    return { ballNumber: 1, display: `${delivery.runs}${extraLabel}`, type: 'EXTRA' };
  }
  if (delivery.runs === 4) {
    return { ballNumber: 1, display: '4', type: 'BOUNDARY_FOUR' };
  }
  if (delivery.runs === 6) {
    return { ballNumber: 1, display: '6', type: 'MAXIMUM_SIX' };
  }
  if (delivery.runs === 0) {
    return { ballNumber: 1, display: '•', type: 'DOT' };
  }
  return { ballNumber: 1, display: String(delivery.runs), type: 'RUNS' };
}

export function renderDeliveryChipHtml(chip: DeliveryChip): string {
  let bg = 'rgba(255, 255, 255, 0.08)';
  let color = '#F1F5F9';
  let border = '1px solid rgba(255, 255, 255, 0.12)';
  let tooltip = `${chip.display} runs`;

  switch (chip.type) {
    case 'WICKET':
      bg = 'rgba(244, 63, 94, 0.25)';
      color = '#F43F5E';
      border = '1px solid #F43F5E';
      tooltip = 'Wicket fallen!';
      break;
    case 'MAXIMUM_SIX':
      bg = 'rgba(139, 92, 246, 0.25)';
      color = '#A78BFA';
      border = '1px solid #8B5CF6';
      tooltip = 'Maximum 6 runs!';
      break;
    case 'BOUNDARY_FOUR':
      bg = 'rgba(16, 185, 129, 0.25)';
      color = '#10B981';
      border = '1px solid #10B981';
      tooltip = 'Boundary 4 runs!';
      break;
    case 'EXTRA':
      bg = 'rgba(245, 158, 11, 0.25)';
      color = '#F59E0B';
      border = '1px solid #F59E0B';
      tooltip = `Extra delivery: ${chip.display}`;
      break;
    case 'DOT':
      color = '#94A3B8';
      tooltip = 'Dot delivery (0 runs)';
      break;
  }

  return `<div class="ball-chip" style="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:50%;background:${bg};color:${color};border:${border};font-weight:700;font-size:0.85rem;margin-right:6px;" data-tooltip="${tooltip}">${chip.display}</div>`;
}

export function renderBatterCardHtml(batter: BatterStats, isStriker: boolean): string {
  const sr = calculateStrikeRate(batter.runs, batter.balls);
  const strikeIndicator = isStriker ? '<span style="color:var(--primary,#10b981);font-weight:bold;margin-left:4px;">*</span>' : '';
  
  return `
    <div class="batter-card" style="background:rgba(0,0,0,0.3);border-radius:8px;padding:0.75rem 1rem;margin-bottom:0.5rem;display:flex;justify-content:space-between;align-items:center;">
      <div>
        <div style="font-weight:600;color:#f1f5f9;">${batter.name}${strikeIndicator}</div>
        <div style="font-size:0.75rem;color:#94a3b8;">${batter.fours}x4s, ${batter.sixes}x6s</div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:1.1rem;font-weight:700;color:#f1f5f9;">${batter.runs} <span style="font-size:0.8rem;color:#94a3b8;">(${batter.balls})</span></div>
        <div style="font-size:0.75rem;color:#06b6d4;">SR: ${sr}</div>
      </div>
    </div>
  `;
}

export function renderBowlerCardHtml(bowler: BowlerStats): string {
  const econ = calculateEconomy(bowler.runsConceded, bowler.overs);

  return `
    <div class="bowler-card" style="background:rgba(0,0,0,0.3);border-radius:8px;padding:0.75rem 1rem;display:flex;justify-content:space-between;align-items:center;">
      <div>
        <div style="font-weight:600;color:#f1f5f9;">${bowler.name}</div>
        <div style="font-size:0.75rem;color:#94a3b8;">${bowler.overs} ov (${bowler.maidens} maidens)</div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:1.1rem;font-weight:700;color:#f1f5f9;">${bowler.wickets} - ${bowler.runsConceded}</div>
        <div style="font-size:0.75rem;color:#f59e0b;">Econ: ${econ}</div>
      </div>
    </div>
  `;
}
