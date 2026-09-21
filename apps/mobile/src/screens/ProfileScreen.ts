import { MobileUserRole } from './AuthScreen.js';

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
  persona: MobileUserRole;
  batting: CareerBattingStats;
  bowling: CareerBowlingStats;
}

export class ProfileScreenController {
  private profile: PlayerProfileData;

  constructor(profile?: Partial<PlayerProfileData>) {
    this.profile = {
      id: profile?.id || 'usr-pilot-18',
      name: profile?.name || 'Virat Sharma',
      role: profile?.role || 'BATTER',
      teamName: profile?.teamName || 'Bangalore Royal Challengers',
      jerseyNumber: profile?.jerseyNumber || 18,
      persona: (profile?.persona as MobileUserRole) || 'CAPTAIN',
      batting: profile?.batting || {
        matches: 124,
        innings: 118,
        runs: 4892,
        ballsFaced: 3624,
        notOuts: 19,
        highestScore: 122,
        centuries: 5,
        fifties: 38,
        fours: 462,
        sixes: 118
      },
      bowling: profile?.bowling || {
        matches: 124,
        overs: 48,
        maidens: 1,
        runsConceded: 384,
        wickets: 8,
        bestBowling: '2/18'
      }
    };
  }

  public getProfile(): PlayerProfileData {
    return JSON.parse(JSON.stringify(this.profile));
  }

  public updateProfile(updates: Partial<PlayerProfileData>): void {
    this.profile = { ...this.profile, ...updates };
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
    const roles: Array<{ id: MobileUserRole; label: string; icon: string }> = [
      { id: 'CAPTAIN', label: 'Captain', icon: '👑' },
      { id: 'PLAYER', label: 'Player', icon: '🏏' },
      { id: 'SCORER', label: 'Scorer', icon: '⚡' },
      { id: 'FAN', label: 'Fan', icon: '🎪' },
      { id: 'UMPIRE', label: 'Umpire', icon: '⚖️' },
      { id: 'ORGANISER', label: 'Organiser', icon: '🏆' },
      { id: 'TURF_PROVIDER', label: 'Provider', icon: '🏟️' },
      { id: 'ADMIN', label: 'Admin', icon: '⚡' }
    ];

    return `
      <div class="mobile-profile-screen" style="padding: 1rem; color: #f8fafc; font-family: 'Plus Jakarta Sans', sans-serif;">
        <!-- Profile Header Card -->
        <div style="background: rgba(10, 16, 28, 0.9); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 1.25rem; margin-bottom: 1rem;">
          <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
            <div style="width: 54px; height: 54px; border-radius: 50%; background: rgba(0, 229, 153, 0.15); border: 2px solid #00E599; display: flex; align-items: center; justify-content: center; font-size: 1.35rem; font-weight: 800; color: #00E599; font-family: 'Chakra Petch', monospace;">
              #${this.profile.jerseyNumber}
            </div>
            <div style="flex: 1;">
              <div style="font-size: 1.2rem; font-weight: 700; color: #f8fafc; font-family: 'Space Grotesk', sans-serif;">${this.profile.name}</div>
              <div style="font-size: 0.8rem; color: #94a3b8; display: flex; align-items: center; gap: 0.4rem; margin-top: 0.2rem;">
                <span style="background: rgba(0, 229, 153, 0.15); color: #00E599; padding: 0.15rem 0.5rem; border-radius: 4px; font-weight: 600; font-size: 0.7rem;">${this.profile.persona}</span>
                <span>• ${this.profile.role} • ${this.profile.teamName}</span>
              </div>
            </div>
          </div>

          <!-- Persona Switcher Strip -->
          <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 0.75rem; margin-bottom: 0.75rem;">
            <div style="font-size: 0.75rem; font-weight: 700; color: #94a3b8; margin-bottom: 0.4rem;">Switch Persona (8 User Types):</div>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.3rem;">
              ${roles.map(r => `
                <button type="button" onclick="window.cricosMobileApp.switchUserPersona('${r.id}')" style="padding: 0.35rem 0.2rem; border-radius: 6px; border: 1px solid ${this.profile.persona === r.id ? '#00E599' : 'rgba(255,255,255,0.1)'}; background: ${this.profile.persona === r.id ? 'rgba(0,229,153,0.2)' : 'rgba(255,255,255,0.03)'}; color: ${this.profile.persona === r.id ? '#00E599' : '#cbd5e1'}; font-size: 0.65rem; font-weight: 600; cursor: pointer; text-align: center;" data-tooltip="Switch to ${r.label} persona">
                  ${r.icon} ${r.label}
                </button>
              `).join('')}
            </div>
          </div>

          <div style="display: flex; gap: 0.5rem; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 0.75rem;">
            <div style="flex: 1; text-align: center; background: rgba(0,0,0,0.3); padding: 0.5rem; border-radius: 8px;">
              <div style="font-size: 0.7rem; color: #94a3b8;">Escrow Wallet</div>
              <div style="font-size: 0.95rem; font-weight: 700; color: #00E599; font-family: 'Chakra Petch', monospace;">₹500,000</div>
            </div>
            <div style="flex: 1; text-align: center; background: rgba(0,0,0,0.3); padding: 0.5rem; border-radius: 8px;">
              <div style="font-size: 0.7rem; color: #94a3b8;">Trust Rating</div>
              <div style="font-size: 0.95rem; font-weight: 700; color: #FFB800;">★ 4.9 <small style="font-size: 0.65rem; color: #94a3b8;">(124 matches)</small></div>
            </div>
          </div>
        </div>

        <!-- Batting Career Metrics Grid -->
        <div style="font-size: 0.9rem; font-weight: 700; margin-bottom: 0.5rem; color: #f8fafc; font-family: 'Space Grotesk', sans-serif;">🏏 Batting Career Figures</div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.4rem; margin-bottom: 1rem;">
          <div style="background: rgba(10, 16, 28, 0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 0.65rem; text-align: center;" data-tooltip="Total Career Runs">
            <div style="font-size: 1.15rem; font-weight: 800; color: #00E599; font-family: 'Chakra Petch', monospace;">${this.profile.batting.runs}</div>
            <div style="font-size: 0.7rem; color: #94a3b8;">Runs</div>
          </div>
          <div style="background: rgba(10, 16, 28, 0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 0.65rem; text-align: center;" data-tooltip="Career Batting Average">
            <div style="font-size: 1.15rem; font-weight: 800; color: #f8fafc; font-family: 'Chakra Petch', monospace;">${this.getBattingAverage()}</div>
            <div style="font-size: 0.7rem; color: #94a3b8;">Average</div>
          </div>
          <div style="background: rgba(10, 16, 28, 0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 0.65rem; text-align: center;" data-tooltip="Career Batting Strike Rate">
            <div style="font-size: 1.15rem; font-weight: 800; color: #00D2FF; font-family: 'Chakra Petch', monospace;">${this.getBattingStrikeRate()}</div>
            <div style="font-size: 0.7rem; color: #94a3b8;">Strike Rate</div>
          </div>
        </div>

        <!-- Bowling Career Metrics Grid -->
        <div style="font-size: 0.9rem; font-weight: 700; margin-bottom: 0.5rem; color: #f8fafc; font-family: 'Space Grotesk', sans-serif;">🎳 Bowling Career Figures</div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.4rem; margin-bottom: 1.25rem;">
          <div style="background: rgba(10, 16, 28, 0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 0.65rem; text-align: center;" data-tooltip="Career Wickets Taken">
            <div style="font-size: 1.15rem; font-weight: 800; color: #00D2FF; font-family: 'Chakra Petch', monospace;">${this.profile.bowling.wickets}</div>
            <div style="font-size: 0.7rem; color: #94a3b8;">Wickets</div>
          </div>
          <div style="background: rgba(10, 16, 28, 0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 0.65rem; text-align: center;" data-tooltip="Bowling Economy Rate">
            <div style="font-size: 1.15rem; font-weight: 800; color: #f8fafc; font-family: 'Chakra Petch', monospace;">${this.getBowlingEconomy()}</div>
            <div style="font-size: 0.7rem; color: #94a3b8;">Economy</div>
          </div>
          <div style="background: rgba(10, 16, 28, 0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 0.65rem; text-align: center;" data-tooltip="Best Bowling Figures">
            <div style="font-size: 1.15rem; font-weight: 800; color: #FFB800; font-family: 'Chakra Petch', monospace;">${this.profile.bowling.bestBowling}</div>
            <div style="font-size: 0.7rem; color: #94a3b8;">Best</div>
          </div>
        </div>

        <!-- Account Actions & Compliance -->
        <div style="background: rgba(10, 16, 28, 0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1rem; margin-bottom: 1rem;">
          <div style="font-size: 0.85rem; font-weight: 700; color: #cbd5e1; margin-bottom: 0.75rem;">Account & Session Security</div>
          
          <button type="button" onclick="window.cricosMobileApp.signOutAction()" style="width: 100%; padding: 0.75rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); background: transparent; color: #f8fafc; font-weight: 600; font-size: 0.85rem; margin-bottom: 0.75rem; cursor: pointer;" data-tooltip="Clear mobile session">
            🚪 Sign Out of CricOS
          </button>

          <!-- Apple Guideline 5.1.1(v) Compliant Account Deletion -->
          <button type="button" onclick="window.cricosMobileApp.promptDeleteAccount()" style="width: 100%; padding: 0.75rem; border-radius: 8px; border: 1px solid rgba(255, 51, 102, 0.3); background: rgba(255, 51, 102, 0.1); color: #ff6688; font-weight: 600; font-size: 0.85rem; cursor: pointer;" data-tooltip="Mandatory permanent account deletion per Apple App Store 5.1.1(v)">
            🗑️ Delete Account & All Data (App Store Compliance)
          </button>
        </div>
      </div>
    `;
  }
}

