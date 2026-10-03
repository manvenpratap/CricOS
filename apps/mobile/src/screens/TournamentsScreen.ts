export interface TournamentTeamStanding {
  position: number;
  team: string;
  played: number;
  won: number;
  lost: number;
  points: number;
  nrr: string;
  qualification: 'QUALIFIED' | 'CONTENDING' | 'ELIMINATED';
}

export interface TournamentFixture {
  id: string;
  round: number;
  team1: string;
  team2: string;
  date: string;
  venue: string;
  status: 'SCHEDULED' | 'LIVE' | 'COMPLETED';
}

export interface LeaderboardPlayer {
  rank: number;
  name: string;
  team: string;
  metric: string;
  value: number;
}

export class TournamentsScreenController {
  private currentStage: number = 2; // Group Stage (Live)
  private standings: TournamentTeamStanding[] = [
    { position: 1, team: 'Mumbai Super Strikers', played: 3, won: 3, lost: 0, points: 6, nrr: '+1.420', qualification: 'QUALIFIED' },
    { position: 2, team: 'Delhi Daredevils', played: 3, won: 2, lost: 1, points: 4, nrr: '+0.850', qualification: 'QUALIFIED' },
    { position: 3, team: 'Bangalore Royal Challengers', played: 3, won: 1, lost: 2, points: 2, nrr: '-0.420', qualification: 'CONTENDING' },
    { position: 4, team: 'Kolkata Knight Riders', played: 3, won: 0, lost: 3, points: 0, nrr: '-1.850', qualification: 'ELIMINATED' }
  ];

  private fixtures: TournamentFixture[] = [
    { id: 'fix-1', round: 1, team1: 'Delhi Daredevils', team2: 'Mumbai Super Strikers', date: 'Today, 19:30', venue: 'Wankhede Arena', status: 'LIVE' },
    { id: 'fix-2', round: 1, team1: 'Bangalore Royal Challengers', team2: 'Kolkata Knight Riders', date: 'Tomorrow, 15:30', venue: 'Chinnaswamy Stadium', status: 'SCHEDULED' },
    { id: 'fix-3', round: 2, team1: 'Mumbai Super Strikers', team2: 'Bangalore Royal Challengers', date: 'Sep 24, 19:30', venue: 'Wankhede Arena', status: 'SCHEDULED' }
  ];

  private orangeCap: LeaderboardPlayer[] = [
    { rank: 1, name: 'Virat Sharma', team: 'BLR', metric: 'Runs', value: 248 },
    { rank: 2, name: 'Rohit Sharma', team: 'MUM', metric: 'Runs', value: 215 },
    { rank: 3, name: 'KL Rahul', team: 'DEL', metric: 'Runs', value: 184 }
  ];

  private purpleCap: LeaderboardPlayer[] = [
    { rank: 1, name: 'Jasprit Bumrah', team: 'MUM', metric: 'Wickets', value: 9 },
    { rank: 2, name: 'Mohammed Siraj', team: 'BLR', metric: 'Wickets', value: 7 },
    { rank: 3, name: 'Kuldeep Yadav', team: 'DEL', metric: 'Wickets', value: 6 }
  ];

  private activeDivisionTier: 'PREMIER' | 'DIVISION_1' = 'PREMIER';
  private division1Standings: TournamentTeamStanding[] = [
    { position: 1, team: 'Punjab Kings XI', played: 3, won: 3, lost: 0, points: 6, nrr: '+1.250', qualification: 'QUALIFIED' },
    { position: 2, team: 'Rajasthan Royals Club', played: 3, won: 2, lost: 1, points: 4, nrr: '+0.667', qualification: 'QUALIFIED' },
    { position: 3, team: 'Gujarat Titans Academy', played: 3, won: 1, lost: 2, points: 2, nrr: '+0.000', qualification: 'CONTENDING' },
    { position: 4, team: 'Lucknow Super Giants CC', played: 3, won: 0, lost: 3, points: 0, nrr: '-2.000', qualification: 'ELIMINATED' }
  ];

  public getState() {
    return {
      currentStage: this.currentStage,
      activeDivisionTier: this.activeDivisionTier,
      standings: [...this.standings],
      division1Standings: [...this.division1Standings],
      fixtures: [...this.fixtures],
      orangeCap: [...this.orangeCap],
      purpleCap: [...this.purpleCap]
    };
  }

  public getDivisionStandings(tier?: 'PREMIER' | 'DIVISION_1'): TournamentTeamStanding[] {
    const selectedTier = tier || this.activeDivisionTier;
    return selectedTier === 'PREMIER' ? [...this.standings] : [...this.division1Standings];
  }

  public setActiveDivisionTier(tier: 'PREMIER' | 'DIVISION_1'): void {
    this.activeDivisionTier = tier;
  }

  public calculateNRR(runsScored: number, oversFaced: number, runsConceded: number, oversBowled: number): string {
    if (oversFaced <= 0 || oversBowled <= 0) return '+0.000';
    const nrr = runsScored / oversFaced - runsConceded / oversBowled;
    const sign = nrr >= 0 ? '+' : '';
    return `${sign}${nrr.toFixed(3)}`;
  }

  public simulatePromotionRelegation(): { promoted: string[]; relegated: string[] } {
    // Top team in Div 1 is promoted to Premier
    const promotedTeam = this.division1Standings[0]?.team || 'Punjab Kings XI';
    // Bottom team in Premier is relegated to Div 1
    const relegatedTeam = this.standings[this.standings.length - 1]?.team || 'Kolkata Knight Riders';

    return {
      promoted: [promotedTeam],
      relegated: [relegatedTeam]
    };
  }

  public setStage(stage: number): void {
    this.currentStage = stage;
  }

  public calculateEventBasket(baseMinor: number, platformFeePercent: number = 5) {
    const feePct = Math.max(0, Math.min(20, platformFeePercent));
    const platformFeeMinor = Math.round(baseMinor * (feePct / 100));
    const gstMinor = Math.round(platformFeeMinor * 0.18);
    const totalMinor = baseMinor + platformFeeMinor + gstMinor;
    return {
      baseMinor,
      platformFeePercent: feePct,
      platformFeeMinor,
      gstMinor,
      totalMinor
    };
  }

  public onboardTournament(name: string, teams: string[]): { name: string; teams: string[]; fixtureCount: number } {
    this.standings = teams.map((team, idx) => ({
      position: idx + 1,
      team,
      played: 0,
      won: 0,
      lost: 0,
      points: 0,
      nrr: '+0.000',
      qualification: idx < 2 ? 'QUALIFIED' : 'CONTENDING'
    }));
    const fixtureCount = (teams.length * (teams.length - 1)) / 2;
    return { name, teams, fixtureCount };
  }

  public renderMobileHtml(isOrganiser: boolean = false): string {
    return `
      <div class="mobile-tournaments-screen" style="padding: 1rem; color: #f8fafc; font-family: 'Plus Jakarta Sans', sans-serif;">
        <!-- Tournament Header Card -->
        <div style="background: rgba(10, 16, 28, 0.9); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 1.25rem; margin-bottom: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <div style="font-size: 0.75rem; font-weight: 700; color: #00D2FF; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem;">ICC Tier 1 Tournament</div>
              <h2 style="margin: 0; font-size: 1.25rem; font-family: 'Space Grotesk', sans-serif; color: #f8fafc;">National Club Premier League</h2>
              <div style="font-size: 0.8rem; color: #94a3b8; margin-top: 0.25rem;">8 Teams • 28 Matches • Double Round-Robin</div>
            </div>
            ${isOrganiser ? `
              <div style="display: flex; gap: 0.35rem;">
                <button type="button" id="btnMobileCreateTournament" onclick="window.cricosMobileApp.openCreateTournamentSheet()" style="padding: 0.35rem 0.6rem; border-radius: 6px; border: 1px solid #00D2FF; background: rgba(0, 210, 255, 0.15); color: #00D2FF; font-weight: 700; font-size: 0.7rem; cursor: pointer;" data-tooltip="Onboard new tournament with custom teams">
                  + New Tournament
                </button>
                <button type="button" onclick="window.cricosMobileApp.openEventBasketModal()" style="padding: 0.35rem 0.6rem; border-radius: 6px; border: 1px solid #00E599; background: rgba(0, 229, 153, 0.15); color: #00E599; font-weight: 700; font-size: 0.7rem; cursor: pointer;" data-tooltip="Manage Event Basket & Procurement">
                  Basket
                </button>
              </div>
            ` : ''}
          </div>

          <!-- 4-Stage Stepper -->
          <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid rgba(255,255,255,0.08);">
            <div style="text-align: center; flex: 1;">
              <div style="width: 22px; height: 22px; border-radius: 50%; background: #00E599; color: #04070D; font-size: 0.65rem; font-weight: 800; display: flex; align-items: center; justify-content: center; margin: 0 auto 0.2rem;">✓</div>
              <div style="font-size: 0.65rem; color: #00E599; font-weight: 600;">Squads</div>
            </div>
            <div style="height: 2px; flex: 1; background: #00E599;"></div>
            <div style="text-align: center; flex: 1;">
              <div style="width: 22px; height: 22px; border-radius: 50%; background: #00D2FF; color: #04070D; font-size: 0.65rem; font-weight: 800; display: flex; align-items: center; justify-content: center; margin: 0 auto 0.2rem; box-shadow: 0 0 8px rgba(0,210,255,0.6);">2</div>
              <div style="font-size: 0.65rem; color: #00D2FF; font-weight: 700;">Groups</div>
            </div>
            <div style="height: 2px; flex: 1; background: rgba(255,255,255,0.15);"></div>
            <div style="text-align: center; flex: 1;">
              <div style="width: 22px; height: 22px; border-radius: 50%; background: rgba(255,255,255,0.1); color: #94a3b8; font-size: 0.65rem; font-weight: 700; display: flex; align-items: center; justify-content: center; margin: 0 auto 0.2rem;">3</div>
              <div style="font-size: 0.65rem; color: #94a3b8;">Super 4s</div>
            </div>
            <div style="height: 2px; flex: 1; background: rgba(255,255,255,0.15);"></div>
            <div style="text-align: center; flex: 1;">
              <div style="width: 22px; height: 22px; border-radius: 50%; background: rgba(255,255,255,0.1); color: #94a3b8; font-size: 0.65rem; font-weight: 700; display: flex; align-items: center; justify-content: center; margin: 0 auto 0.2rem;">4</div>
              <div style="font-size: 0.65rem; color: #94a3b8;">Final</div>
            </div>
          </div>
        </div>

        <!-- Standings Table & Multi-Division Selector -->
        <div style="background: rgba(10, 16, 28, 0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; overflow: hidden; margin-bottom: 1rem;">
          <div style="padding: 0.75rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 0.85rem; font-weight: 700; font-family: 'Space Grotesk', sans-serif;">Official Standings & Net Run Rate</div>
            <div style="display: flex; gap: 0.3rem;">
              <button type="button" onclick="window.cricosMobileApp.switchDivisionAction('PREMIER')" style="background: ${this.activeDivisionTier === 'PREMIER' ? 'rgba(0, 229, 153, 0.2)' : 'rgba(255,255,255,0.05)'}; color: ${this.activeDivisionTier === 'PREMIER' ? '#00E599' : '#94a3b8'}; border: 1px solid ${this.activeDivisionTier === 'PREMIER' ? '#00E599' : 'rgba(255,255,255,0.1)'}; padding: 0.15rem 0.4rem; border-radius: 4px; font-size: 0.65rem; font-weight: 700; cursor: pointer;" data-tooltip="Switch to Premier Division standings">Premier</button>
              <button type="button" onclick="window.cricosMobileApp.switchDivisionAction('DIVISION_1')" style="background: ${this.activeDivisionTier === 'DIVISION_1' ? 'rgba(0, 210, 255, 0.2)' : 'rgba(255,255,255,0.05)'}; color: ${this.activeDivisionTier === 'DIVISION_1' ? '#00D2FF' : '#94a3b8'}; border: 1px solid ${this.activeDivisionTier === 'DIVISION_1' ? '#00D2FF' : 'rgba(255,255,255,0.1)'}; padding: 0.15rem 0.4rem; border-radius: 4px; font-size: 0.65rem; font-weight: 700; cursor: pointer;" data-tooltip="Switch to Division 1 Championship standings">Div 1</button>
            </div>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 0.75rem; text-align: left;">
            <thead>
              <tr style="color: #94a3b8; border-bottom: 1px solid rgba(255,255,255,0.08); font-size: 0.65rem; text-transform: uppercase;">
                <th style="padding: 0.5rem 0.75rem;"># Team</th>
                <th style="padding: 0.5rem 0.3rem; text-align: center;">P</th>
                <th style="padding: 0.5rem 0.3rem; text-align: center;">W</th>
                <th style="padding: 0.5rem 0.3rem; text-align: center;">L</th>
                <th style="padding: 0.5rem 0.3rem; text-align: center; color: #00E599;">Pts</th>
                <th style="padding: 0.5rem 0.75rem; text-align: right;">NRR</th>
              </tr>
            </thead>
            <tbody>
              ${(this.activeDivisionTier === 'PREMIER' ? this.standings : this.division1Standings).map((s, idx) => {
                const isPromo = this.activeDivisionTier === 'DIVISION_1' && idx === 0;
                const isReleg = this.activeDivisionTier === 'PREMIER' && idx === this.standings.length - 1;
                return `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.04); background: ${s.qualification === 'QUALIFIED' ? 'rgba(0, 229, 153, 0.03)' : 'transparent'};">
                  <td style="padding: 0.6rem 0.75rem;">
                    <div style="font-weight: 600; color: #f8fafc; display: flex; align-items: center; gap: 0.3rem;">
                      <span style="color: #94a3b8; font-size: 0.7rem;">${s.position}</span>
                      <span>${s.team}</span>
                      ${isPromo ? `<span style="font-size: 0.6rem; color: #00E599; background: rgba(0,229,153,0.15); padding: 0.1rem 0.3rem; border-radius: 3px; font-weight: 700;">↑ PROMO</span>` : ''}
                      ${isReleg ? `<span style="font-size: 0.6rem; color: #ff3366; background: rgba(255,51,102,0.15); padding: 0.1rem 0.3rem; border-radius: 3px; font-weight: 700;">↓ RELEG</span>` : ''}
                    </div>
                  </td>
                  <td style="padding: 0.6rem 0.3rem; text-align: center; color: #cbd5e1;">${s.played}</td>
                  <td style="padding: 0.6rem 0.3rem; text-align: center; color: #cbd5e1;">${s.won}</td>
                  <td style="padding: 0.6rem 0.3rem; text-align: center; color: #cbd5e1;">${s.lost}</td>
                  <td style="padding: 0.6rem 0.3rem; text-align: center; font-weight: 800; color: #00E599; font-family: 'Chakra Petch', monospace;">${s.points}</td>
                  <td style="padding: 0.6rem 0.75rem; text-align: right; font-family: 'Chakra Petch', monospace; font-weight: 700; color: ${s.nrr.startsWith('+') ? '#00E599' : '#ff3366'};">
                    ${s.nrr}
                  </td>
                </tr>
              `}).join('')}
            </tbody>
          </table>
        </div>

        <!-- Fixtures Schedule Grid -->
        <div style="background: rgba(10, 16, 28, 0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden; margin-bottom: 1rem;">
          <div style="padding: 0.75rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 700; font-size: 0.85rem; font-family: 'Space Grotesk', sans-serif;">Tournament Fixtures</span>
            ${isOrganiser ? `
              <button type="button" onclick="window.cricosMobileApp.generateFixturesAction()" style="background: none; border: 1px solid rgba(0, 229, 153, 0.3); color: #00E599; font-size: 0.65rem; padding: 0.2rem 0.5rem; border-radius: 4px; cursor: pointer;" data-tooltip="Auto-generate round-robin bracket">Auto-Schedule</button>
            ` : ''}
          </div>
          <div style="display: flex; flex-direction: column;">
            ${this.fixtures.map(f => `
              <div style="padding: 0.75rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.04); display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-size: 0.85rem; font-weight: 700; color: #f8fafc;">${f.team1} vs ${f.team2}</div>
                  <div style="font-size: 0.7rem; color: #94a3b8;">${f.date} • ${f.venue}</div>
                </div>
                <span style="font-size: 0.65rem; padding: 0.15rem 0.4rem; border-radius: 4px; font-weight: 700; ${f.status === 'LIVE' ? 'background: rgba(255,51,102,0.15); color: #ff3366; border: 1px solid #ff3366;' : 'background: rgba(255,255,255,0.06); color: #94a3b8;'}">
                  ${f.status}
                </span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Player Cap Leaderboards (Orange & Purple) -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 1rem;">
          <!-- Orange Cap -->
          <div style="background: rgba(10, 16, 28, 0.8); border: 1px solid rgba(255, 184, 0, 0.25); border-radius: 12px; padding: 0.75rem;">
            <div style="font-size: 0.75rem; font-weight: 700; color: #FFB800; margin-bottom: 0.4rem;">Orange Cap (Runs)</div>
            ${this.orangeCap.map(p => `
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 0.25rem;">
                <span style="color: #cbd5e1;">${p.rank}. ${p.name}</span>
                <span style="font-weight: 800; color: #FFB800; font-family: 'Chakra Petch', monospace;">${p.value}</span>
              </div>
            `).join('')}
          </div>

          <!-- Purple Cap -->
          <div style="background: rgba(10, 16, 28, 0.8); border: 1px solid rgba(168, 85, 247, 0.25); border-radius: 12px; padding: 0.75rem;">
            <div style="font-size: 0.75rem; font-weight: 700; color: #c084fc; margin-bottom: 0.4rem;">Purple Cap (Wkts)</div>
            ${this.purpleCap.map(p => `
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 0.25rem;">
                <span style="color: #cbd5e1;">${p.rank}. ${p.name}</span>
                <span style="font-weight: 800; color: #c084fc; font-family: 'Chakra Petch', monospace;">${p.value}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }
}
