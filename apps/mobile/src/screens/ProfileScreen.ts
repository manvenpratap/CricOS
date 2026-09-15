export interface CareerBattingStats {
  matches: number;
  innings: number;
  runs: number;
  ballsFaced: number;
  notOuts: number;
  highestScore: number;
  centuries: number;
  fifties: number;
  fours: number;
  sixes: number;
}

export interface CareerBowlingStats {
  matches: number;
  overs: number;
  maidens: number;
  runsConceded: number;
  wickets: number;
  bestBowling: string;
}

export interface PlayerProfileData {
  id: string;
  name: string;
  role: 'BATTER' | 'BOWLER' | 'ALL_ROUNDER' | 'WICKET_KEEPER';
  teamName: string;
  jerseyNumber: number;
  batting: CareerBattingStats;
  bowling: CareerBowlingStats;
}

export class ProfileScreenController {
  private profile: PlayerProfileData;

  constructor(profile: PlayerProfileData) {
    this.profile = JSON.parse(JSON.stringify(profile));
  }

  public getProfile(): PlayerProfileData {
    return JSON.parse(JSON.stringify(this.profile));
  }

  public getBattingAverage(): string {
    const outs = this.profile.batting.innings - this.profile.batting.notOuts;
    if (outs <= 0) {
      return this.profile.batting.runs > 0 ? `${this.profile.batting.runs}.00*` : '0.00';
    }
    return (this.profile.batting.runs / outs).toFixed(2);
  }

  public getBattingStrikeRate(): string {
    if (this.profile.batting.ballsFaced <= 0) return '0.00';
    return ((this.profile.batting.runs / this.profile.batting.ballsFaced) * 100).toFixed(2);
  }

  public getBowlingEconomy(): string {
    if (this.profile.bowling.overs <= 0) return '0.00';
    return (this.profile.bowling.runsConceded / this.profile.bowling.overs).toFixed(2);
  }

  public getBowlingAverage(): string {
    if (this.profile.bowling.wickets <= 0) return '0.00';
    return (this.profile.bowling.runsConceded / this.profile.bowling.wickets).toFixed(2);
  }

  public renderMobileHtml(): string {
    return `
      <div class="mobile-profile-screen" style="padding:16px;background:#090d16;color:#f8fafc;font-family:sans-serif;max-width:480px;margin:auto;">
        <!-- Profile Header -->
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:20px;">
          <div style="width:54px;height:54px;border-radius:27px;background:rgba(16,185,129,0.15);border:2px solid #10b981;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;color:#10b981;">
            #${this.profile.jerseyNumber}
          </div>
          <div>
            <div style="font-size:18px;font-weight:700;color:#f8fafc;">${this.profile.name}</div>
            <div style="font-size:12px;color:#94a3b8;">${this.profile.role} • ${this.profile.teamName}</div>
          </div>
        </div>

        <!-- Batting Metrics Grid -->
        <div style="font-size:14px;font-weight:700;margin-bottom:8px;color:#cbd5e1;">🏏 Batting Career</div>
        <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:8px;margin-bottom:16px;">
          <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:10px;text-align:center;" data-tooltip="Total Career Runs">
            <div style="font-size:16px;font-weight:800;color:#10b981;">${this.profile.batting.runs}</div>
            <div style="font-size:11px;color:#94a3b8;">Runs</div>
          </div>
          <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:10px;text-align:center;" data-tooltip="Batting Average">
            <div style="font-size:16px;font-weight:800;color:#f8fafc;">${this.getBattingAverage()}</div>
            <div style="font-size:11px;color:#94a3b8;">Average</div>
          </div>
          <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:10px;text-align:center;" data-tooltip="Batting Strike Rate">
            <div style="font-size:16px;font-weight:800;color:#f8fafc;">${this.getBattingStrikeRate()}</div>
            <div style="font-size:11px;color:#94a3b8;">Strike Rate</div>
          </div>
        </div>

        <!-- Bowling Metrics Grid -->
        <div style="font-size:14px;font-weight:700;margin-bottom:8px;color:#cbd5e1;">🎳 Bowling Career</div>
        <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:8px;">
          <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:10px;text-align:center;" data-tooltip="Total Wickets Taken">
            <div style="font-size:16px;font-weight:800;color:#38bdf8;">${this.profile.bowling.wickets}</div>
            <div style="font-size:11px;color:#94a3b8;">Wickets</div>
          </div>
          <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:10px;text-align:center;" data-tooltip="Bowling Economy Rate">
            <div style="font-size:16px;font-weight:800;color:#f8fafc;">${this.getBowlingEconomy()}</div>
            <div style="font-size:11px;color:#94a3b8;">Economy</div>
          </div>
          <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:10px;text-align:center;" data-tooltip="Best Bowling Spell">
            <div style="font-size:16px;font-weight:800;color:#f8fafc;">${this.profile.bowling.bestBowling}</div>
            <div style="font-size:11px;color:#94a3b8;">Best</div>
          </div>
        </div>
      </div>
    `;
  }
}
