/**
 * apps/web/src/components/player-career.ts
 *
 * Longitudinal Multi-Tournament Player Career Analytics & Achievement Badges
 * Aggregates career statistics across multiple seasons, formats, and tournaments,
 * rendering milestone badges and performance splits.
 */
export class PlayerCareerComponent {
    careerData;
    constructor(customData) {
        this.careerData = {
            playerId: customData?.playerId || 'plr-virat-18',
            playerName: customData?.playerName || 'Virat Sharma',
            totalMatches: customData?.totalMatches ?? 124,
            totalInnings: customData?.totalInnings ?? 118,
            totalRuns: customData?.totalRuns ?? 4892,
            highestScore: customData?.highestScore ?? 122,
            careerBattingAverage: customData?.careerBattingAverage ?? 49.41,
            careerStrikeRate: customData?.careerStrikeRate ?? 134.98,
            centuries: customData?.centuries ?? 5,
            fifties: customData?.fifties ?? 38,
            totalFours: customData?.totalFours ?? 462,
            totalSixes: customData?.totalSixes ?? 118,
            totalWickets: customData?.totalWickets ?? 8,
            careerBowlingAverage: customData?.careerBowlingAverage ?? 48.00,
            careerEconomy: customData?.careerEconomy ?? 8.00,
            fiveWickets: customData?.fiveWickets ?? 0,
            tournaments: customData?.tournaments || this.getDefaultTournaments(),
            badges: customData?.badges || this.getDefaultBadges()
        };
    }
    getDefaultTournaments() {
        return [
            {
                tournamentId: 'trn-bpl-2026',
                tournamentName: 'Bangalore Premier League 2026',
                year: 2026,
                format: 'T20',
                matches: 14,
                runs: 642,
                highScore: 104,
                average: 58.36,
                strikeRate: 154.20,
                centuries: 1,
                fifties: 5,
                wickets: 2,
                economy: 7.80
            },
            {
                tournamentId: 'trn-kct-2025',
                tournamentName: 'Karnataka Corporate Trophy 2025',
                year: 2025,
                format: 'T20',
                matches: 10,
                runs: 480,
                highScore: 88,
                average: 53.33,
                strikeRate: 142.85,
                centuries: 0,
                fifties: 4,
                wickets: 3,
                economy: 8.10
            },
            {
                tournamentId: 'trn-icc-2025',
                tournamentName: 'Inter-Club Championship 2025',
                year: 2025,
                format: 'T20',
                matches: 12,
                runs: 512,
                highScore: 122,
                average: 46.54,
                strikeRate: 138.90,
                centuries: 1,
                fifties: 3,
                wickets: 1,
                economy: 8.50
            }
        ];
    }
    getDefaultBadges() {
        return [
            {
                id: 'bdg-centuries',
                title: 'Century Master 💯',
                category: 'MILESTONE',
                icon: '💯',
                description: 'Scored 5 competitive centuries with match-winning impact',
                unlockedAt: '2026-04-12',
                rarity: 'LEGENDARY'
            },
            {
                id: 'bdg-boundaries',
                title: 'Boundary Monarch 🚀',
                category: 'IMPACT',
                icon: '🚀',
                description: 'Crossed 450+ fours and 100+ sixes in tournament cricket',
                unlockedAt: '2026-02-18',
                rarity: 'RARE'
            },
            {
                id: 'bdg-captaincy',
                title: 'Tactical Maestro 👑',
                category: 'CAPTAINCY',
                icon: '👑',
                description: 'Captained squad in over 50 matches with >65% win ratio',
                unlockedAt: '2025-11-04',
                rarity: 'RARE'
            },
            {
                id: 'bdg-finisher',
                title: 'The Finisher ⚡',
                category: 'IMPACT',
                icon: '⚡',
                description: 'Remained unbeaten in 15+ successful second-innings chases',
                unlockedAt: '2025-08-20',
                rarity: 'COMMON'
            }
        ];
    }
    getCareerSummary() {
        return JSON.parse(JSON.stringify(this.careerData));
    }
    getTournaments() {
        return [...this.careerData.tournaments];
    }
    getBadges() {
        return [...this.careerData.badges];
    }
    addTournamentStat(stat) {
        this.careerData.tournaments.unshift(stat);
        this.careerData.totalMatches += stat.matches;
        this.careerData.totalRuns += stat.runs;
    }
    addBadge(badge) {
        this.careerData.badges.push(badge);
    }
    renderHtml() {
        const d = this.careerData;
        return `
      <div class="player-career-container" style="font-family: 'Plus Jakarta Sans', sans-serif; color: #FFF;">
        <!-- Header Strip -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
          <div>
            <div style="font-size: 1.2rem; font-weight: 700; color: #FFF;">Longitudinal Career Dashboard</div>
            <div style="font-size: 0.8rem; color: #94A3B8;">Multi-tournament performance figures, averages, and achievement badges</div>
          </div>
          <span style="background: rgba(0, 229, 153, 0.15); color: #00E599; border: 1px solid rgba(0,229,153,0.3); font-size: 0.75rem; font-weight: 700; padding: 0.25rem 0.65rem; border-radius: 6px;">
            ${d.totalMatches} Career Matches
          </span>
        </div>

        <!-- Career KPI Grid -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; margin-bottom: 1.5rem;">
          <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 0.85rem; text-align: center;" data-tooltip="Total Career Runs">
            <div style="font-size: 1.35rem; font-weight: 800; color: #00E599; font-family: monospace;">${d.totalRuns.toLocaleString('en-IN')}</div>
            <div style="font-size: 0.72rem; color: #94A3B8; text-transform: uppercase;">Total Runs</div>
          </div>
          <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 0.85rem; text-align: center;" data-tooltip="Career Batting Average">
            <div style="font-size: 1.35rem; font-weight: 800; color: #FFF; font-family: monospace;">${d.careerBattingAverage.toFixed(2)}</div>
            <div style="font-size: 0.72rem; color: #94A3B8; text-transform: uppercase;">Batting Avg</div>
          </div>
          <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 0.85rem; text-align: center;" data-tooltip="Career Batting Strike Rate">
            <div style="font-size: 1.35rem; font-weight: 800; color: #00D2FF; font-family: monospace;">${d.careerStrikeRate.toFixed(2)}</div>
            <div style="font-size: 0.72rem; color: #94A3B8; text-transform: uppercase;">Strike Rate</div>
          </div>
          <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 0.85rem; text-align: center;" data-tooltip="Centuries and Fifties">
            <div style="font-size: 1.35rem; font-weight: 800; color: #FFB800; font-family: monospace;">${d.centuries} / ${d.fifties}</div>
            <div style="font-size: 0.72rem; color: #94A3B8; text-transform: uppercase;">100s / 50s</div>
          </div>
        </div>

        <!-- Achievement Badges Showcase -->
        <div style="margin-bottom: 1.5rem;">
          <div style="font-size: 0.95rem; font-weight: 700; color: #FFF; margin-bottom: 0.65rem;">🏆 Career Milestone Badges</div>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 0.65rem;">
            ${d.badges.map(b => `
              <div class="badge-card" style="background: rgba(0,0,0,0.3); border: 1px solid ${b.rarity === 'LEGENDARY' ? '#FFB800' : b.rarity === 'RARE' ? '#00D2FF' : 'rgba(255,255,255,0.1)'}; border-radius: 8px; padding: 0.75rem; display: flex; align-items: center; gap: 0.65rem;" data-tooltip="${b.description}">
                <div style="font-size: 1.5rem;">${b.icon}</div>
                <div>
                  <div style="font-weight: 700; font-size: 0.85rem; color: #FFF;">${b.title}</div>
                  <div style="font-size: 0.7rem; color: #94A3B8;">${b.rarity} • ${b.unlockedAt}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Multi-Tournament History Breakdown Table -->
        <div>
          <div style="font-size: 0.95rem; font-weight: 700; color: #FFF; margin-bottom: 0.65rem;">📊 Multi-Tournament Season Logs</div>
          <div style="overflow-x: auto; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.82rem; text-align: left;">
              <thead>
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); color: #94A3B8;">
                  <th style="padding: 0.65rem 0.85rem;">Tournament</th>
                  <th style="padding: 0.65rem 0.85rem;">Format</th>
                  <th style="padding: 0.65rem 0.85rem;">Mat</th>
                  <th style="padding: 0.65rem 0.85rem;">Runs</th>
                  <th style="padding: 0.65rem 0.85rem;">HS</th>
                  <th style="padding: 0.65rem 0.85rem;">Avg</th>
                  <th style="padding: 0.65rem 0.85rem;">SR</th>
                  <th style="padding: 0.65rem 0.85rem;">Wkts</th>
                </tr>
              </thead>
              <tbody>
                ${d.tournaments.map(t => `
                  <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                    <td style="padding: 0.65rem 0.85rem; font-weight: 600; color: #FFF;">${t.tournamentName}</td>
                    <td style="padding: 0.65rem 0.85rem; color: #00D2FF;">${t.format}</td>
                    <td style="padding: 0.65rem 0.85rem;">${t.matches}</td>
                    <td style="padding: 0.65rem 0.85rem; font-weight: 700; color: #00E599; font-family: monospace;">${t.runs}</td>
                    <td style="padding: 0.65rem 0.85rem; font-family: monospace;">${t.highScore}</td>
                    <td style="padding: 0.65rem 0.85rem; font-family: monospace;">${t.average.toFixed(2)}</td>
                    <td style="padding: 0.65rem 0.85rem; font-family: monospace;">${t.strikeRate.toFixed(2)}</td>
                    <td style="padding: 0.65rem 0.85rem; font-family: monospace; color: #FFB800;">${t.wickets}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
    }
}
//# sourceMappingURL=player-career.js.map