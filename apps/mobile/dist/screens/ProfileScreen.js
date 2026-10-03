export class ProfileScreenController {
    profile;
    constructor(profile) {
        this.profile = {
            id: profile?.id || 'usr-pilot-18',
            name: profile?.name || 'Virat Sharma',
            role: profile?.role || 'BATTER',
            teamName: profile?.teamName || 'Bangalore Royal Challengers',
            jerseyNumber: profile?.jerseyNumber || 18,
            persona: profile?.persona || 'CAPTAIN',
            bio: profile?.bio || 'Relentless run-machine, tactical captain, and high-intensity leader on and off the 22 yards.',
            stance: profile?.stance || 'RHB',
            bowlingStyle: profile?.bowlingStyle || 'Right-arm medium',
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
            },
            tournaments: profile?.tournaments || [
                { tournamentName: 'Bangalore Premier League 2026', year: 2026, matches: 14, runs: 642, average: 58.36, strikeRate: 154.2, wickets: 2 },
                { tournamentName: 'Karnataka Corporate Trophy 2025', year: 2025, matches: 10, runs: 480, average: 53.33, strikeRate: 142.85, wickets: 3 },
                { tournamentName: 'Inter-Club Championship 2025', year: 2025, matches: 12, runs: 512, average: 46.54, strikeRate: 138.9, wickets: 1 }
            ],
            badges: profile?.badges || [
                { id: 'bdg-1', title: 'Century Master', icon: 'medal', rarity: 'LEGENDARY', description: '5 competitive match-winning centuries' },
                { id: 'bdg-2', title: 'Boundary King', icon: 'fire', rarity: 'RARE', description: '450+ boundaries and 100+ maximum sixes' },
                { id: 'bdg-3', title: 'Tactical Captain', icon: 'crown', rarity: 'RARE', description: '50+ matches captained with >65% win rate' }
            ]
        };
    }
    getTournaments() {
        return [...this.profile.tournaments];
    }
    getBadges() {
        return [...this.profile.badges];
    }
    addBadge(badge) {
        this.profile.badges.push(badge);
    }
    addTournamentLog(log) {
        this.profile.tournaments.unshift(log);
    }
    getProfile() {
        return JSON.parse(JSON.stringify(this.profile));
    }
    updateProfile(updates) {
        this.profile = { ...this.profile, ...updates };
    }
    getBattingAverage() {
        const outs = this.profile.batting.innings - this.profile.batting.notOuts;
        if (outs <= 0) {
            return this.profile.batting.runs > 0 ? `${this.profile.batting.runs}.00*` : '0.00';
        }
        return (this.profile.batting.runs / outs).toFixed(2);
    }
    getBattingStrikeRate() {
        if (this.profile.batting.ballsFaced <= 0)
            return '0.00';
        return ((this.profile.batting.runs / this.profile.batting.ballsFaced) * 100).toFixed(2);
    }
    getBowlingEconomy() {
        if (this.profile.bowling.overs <= 0)
            return '0.00';
        return (this.profile.bowling.runsConceded / this.profile.bowling.overs).toFixed(2);
    }
    getBowlingAverage() {
        if (this.profile.bowling.wickets <= 0)
            return '0.00';
        return (this.profile.bowling.runsConceded / this.profile.bowling.wickets).toFixed(2);
    }
    renderMobileHtml() {
        const roles = [
            { id: 'CAPTAIN', label: 'Captain', icon: 'crown' },
            { id: 'PLAYER', label: 'Player', icon: 'bat' },
            { id: 'SCORER', label: 'Scorer', icon: 'lightning' },
            { id: 'FAN', label: 'Fan', icon: 'stadium' },
            { id: 'UMPIRE', label: 'Umpire', icon: 'scale' },
            { id: 'ORGANISER', label: 'Organiser', icon: 'trophy' },
            { id: 'TURF_PROVIDER', label: 'Provider', icon: 'stadium' },
            { id: 'ADMIN', label: 'Admin', icon: 'lightning' }
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
                  ${r.label}
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
        <div style="font-size: 0.9rem; font-weight: 700; margin-bottom: 0.5rem; color: #f8fafc; font-family: 'Space Grotesk', sans-serif;">Batting Career Figures</div>
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
        <div style="font-size: 0.9rem; font-weight: 700; margin-bottom: 0.5rem; color: #f8fafc; font-family: 'Space Grotesk', sans-serif;">Bowling Career Figures</div>
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

        <!-- Career Milestone Badges -->
        <div style="font-size: 0.9rem; font-weight: 700; margin-bottom: 0.5rem; color: #f8fafc; font-family: 'Space Grotesk', sans-serif;">Milestone Achievement Badges</div>
        <div style="display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1.25rem;">
          ${this.profile.badges.map(b => `
            <div style="display: flex; align-items: center; gap: 0.75rem; background: rgba(10, 16, 28, 0.7); border: 1px solid ${b.rarity === 'LEGENDARY' ? '#FFB800' : 'rgba(255,255,255,0.08)'}; border-radius: 10px; padding: 0.65rem 0.85rem;" data-tooltip="${b.description}">
              <div style="width: 26px; height: 26px; border-radius: 6px; background: rgba(0, 229, 153, 0.15); border: 1px solid rgba(0, 229, 153, 0.3); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; color: #00E599; font-weight: 800;">★</div>
              <div style="flex: 1;">
                <div style="font-size: 0.85rem; font-weight: 700; color: #f8fafc;">${b.title}</div>
                <div style="font-size: 0.7rem; color: #94a3b8;">${b.description}</div>
              </div>
              <span style="font-size: 0.65rem; color: ${b.rarity === 'LEGENDARY' ? '#FFB800' : '#00E599'}; font-weight: 700;">${b.rarity}</span>
            </div>
          `).join('')}
        </div>

        <!-- Multi-Tournament Longitudinal Form -->
        <div style="font-size: 0.9rem; font-weight: 700; margin-bottom: 0.5rem; color: #f8fafc; font-family: 'Space Grotesk', sans-serif;">Tournament Performance Logs</div>
        <div style="display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1.25rem;">
          ${this.profile.tournaments.map(t => `
            <div style="background: rgba(10, 16, 28, 0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 0.75rem;" data-tooltip="${t.tournamentName}: ${t.runs} runs @ avg ${t.average}">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
                <span style="font-size: 0.82rem; font-weight: 700; color: #f8fafc;">${t.tournamentName}</span>
                <span style="font-size: 0.7rem; color: #00D2FF; font-weight: 600;">${t.year}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: #94a3b8;">
                <span>Mat: <strong style="color: #FFF;">${t.matches}</strong></span>
                <span>Runs: <strong style="color: #00E599;">${t.runs}</strong></span>
                <span>Avg: <strong style="color: #FFF;">${t.average}</strong></span>
                <span>SR: <strong style="color: #00D2FF;">${t.strikeRate}</strong></span>
                <span>Wkts: <strong style="color: #FFB800;">${t.wickets}</strong></span>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Account Actions & Compliance -->
        <div style="background: rgba(10, 16, 28, 0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1rem; margin-bottom: 1rem;">
          <div style="font-size: 0.85rem; font-weight: 700; color: #cbd5e1; margin-bottom: 0.75rem;">Account & Session Security</div>
          
          <button type="button" onclick="window.cricosMobileApp.signOutAction()" style="width: 100%; padding: 0.75rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); background: transparent; color: #f8fafc; font-weight: 600; font-size: 0.85rem; margin-bottom: 0.75rem; cursor: pointer;" data-tooltip="Clear mobile session">
            Sign Out of CricOS
          </button>

          <!-- Apple Guideline 5.1.1(v) Compliant Account Deletion -->
          <button type="button" onclick="window.cricosMobileApp.promptDeleteAccount()" style="width: 100%; padding: 0.75rem; border-radius: 8px; border: 1px solid rgba(255, 51, 102, 0.3); background: rgba(255, 51, 102, 0.1); color: #ff6688; font-weight: 600; font-size: 0.85rem; cursor: pointer;" data-tooltip="Mandatory permanent account deletion per Apple App Store 5.1.1(v)">
            Delete Account & All Data (App Store Compliance)
          </button>
        </div>
      </div>
    `;
    }
}
//# sourceMappingURL=ProfileScreen.js.map