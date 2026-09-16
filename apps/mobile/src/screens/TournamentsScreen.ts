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

export class TournamentsScreenController {
  private currentStage: number = 2; // Group Stage (Live)
  private standings: TournamentTeamStanding[] = [
    { position: 1, team: 'Mumbai Super Strikers', played: 3, won: 3, lost: 0, points: 6, nrr: '+1.420', qualification: 'QUALIFIED' },
    { position: 2, team: 'Delhi Daredevils', played: 3, won: 2, lost: 1, points: 4, nrr: '+0.850', qualification: 'QUALIFIED' },
    { position: 3, team: 'Bangalore Royal Challengers', played: 3, won: 1, lost: 2, points: 2, nrr: '-0.420', qualification: 'CONTENDING' },
    { position: 4, team: 'Kolkata Knight Riders', played: 3, won: 0, lost: 3, points: 0, nrr: '-1.850', qualification: 'ELIMINATED' }
  ];

  public renderMobileHtml(): string {
    return `
      <div class="mobile-tournaments-screen" style="padding: 1rem; color: #f8fafc; font-family: 'Plus Jakarta Sans', sans-serif;">
        <!-- Tournament Header Card -->
        <div style="background: rgba(10, 16, 28, 0.9); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 1.25rem; margin-bottom: 1rem;">
          <div style="font-size: 0.75rem; font-weight: 700; color: #00D2FF; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem;">ICC Tier 1 Tournament</div>
          <h2 style="margin: 0; font-size: 1.3rem; font-family: 'Space Grotesk', sans-serif; color: #f8fafc;">National Club Premier League</h2>
          <div style="font-size: 0.8rem; color: #94a3b8; margin-top: 0.25rem;">8 Teams • 28 Matches • Double Round-Robin</div>

          <!-- 4-Stage Stepper -->
          <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid rgba(255,255,255,0.08);">
            <div style="text-align: center; flex: 1;">
              <div style="width: 24px; height: 24px; border-radius: 50%; background: #00E599; color: #04070D; font-size: 0.7rem; font-weight: 800; display: flex; align-items: center; justify-content: center; margin: 0 auto 0.25rem;">✓</div>
              <div style="font-size: 0.65rem; color: #00E599; font-weight: 600;">Squads</div>
            </div>
            <div style="height: 2px; flex: 1; background: #00E599;"></div>
            <div style="text-align: center; flex: 1;">
              <div style="width: 24px; height: 24px; border-radius: 50%; background: #00D2FF; color: #04070D; font-size: 0.7rem; font-weight: 800; display: flex; align-items: center; justify-content: center; margin: 0 auto 0.25rem; box-shadow: 0 0 10px rgba(0,210,255,0.6);">⚡</div>
              <div style="font-size: 0.65rem; color: #00D2FF; font-weight: 700;">Groups</div>
            </div>
            <div style="height: 2px; flex: 1; background: rgba(255,255,255,0.15);"></div>
            <div style="text-align: center; flex: 1;">
              <div style="width: 24px; height: 24px; border-radius: 50%; background: rgba(255,255,255,0.1); color: #94a3b8; font-size: 0.7rem; font-weight: 700; display: flex; align-items: center; justify-content: center; margin: 0 auto 0.25rem;">3</div>
              <div style="font-size: 0.65rem; color: #94a3b8;">Super 4s</div>
            </div>
            <div style="height: 2px; flex: 1; background: rgba(255,255,255,0.15);"></div>
            <div style="text-align: center; flex: 1;">
              <div style="width: 24px; height: 24px; border-radius: 50%; background: rgba(255,255,255,0.1); color: #94a3b8; font-size: 0.7rem; font-weight: 700; display: flex; align-items: center; justify-content: center; margin: 0 auto 0.25rem;">🏆</div>
              <div style="font-size: 0.65rem; color: #94a3b8;">Final</div>
            </div>
          </div>
        </div>

        <!-- Standings Table -->
        <div style="background: rgba(10, 16, 28, 0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; overflow: hidden; margin-bottom: 1rem;">
          <div style="padding: 0.85rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 0.9rem; font-weight: 700; font-family: 'Space Grotesk', sans-serif;">Official Standings & Net Run Rate</div>
            <span style="font-size: 0.7rem; background: rgba(0, 229, 153, 0.15); color: #00E599; padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 600;">ICC Sec 16</span>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem; text-align: left;">
            <thead>
              <tr style="color: #94a3b8; border-bottom: 1px solid rgba(255,255,255,0.08); font-size: 0.7rem; text-transform: uppercase;">
                <th style="padding: 0.65rem 0.75rem;"># Team</th>
                <th style="padding: 0.65rem 0.4rem; text-align: center;">P</th>
                <th style="padding: 0.65rem 0.4rem; text-align: center;">W</th>
                <th style="padding: 0.65rem 0.4rem; text-align: center;">L</th>
                <th style="padding: 0.65rem 0.4rem; text-align: center; color: #00E599;">Pts</th>
                <th style="padding: 0.65rem 0.75rem; text-align: right;">NRR</th>
              </tr>
            </thead>
            <tbody>
              ${this.standings.map(s => `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.04); background: ${s.qualification === 'QUALIFIED' ? 'rgba(0, 229, 153, 0.03)' : 'transparent'};">
                  <td style="padding: 0.75rem;">
                    <div style="font-weight: 600; color: #f8fafc; display: flex; align-items: center; gap: 0.4rem;">
                      <span style="color: #94a3b8; font-size: 0.75rem;">${s.position}</span>
                      <span>${s.team}</span>
                    </div>
                  </td>
                  <td style="padding: 0.75rem 0.4rem; text-align: center; color: #cbd5e1;">${s.played}</td>
                  <td style="padding: 0.75rem 0.4rem; text-align: center; color: #cbd5e1;">${s.won}</td>
                  <td style="padding: 0.75rem 0.4rem; text-align: center; color: #cbd5e1;">${s.lost}</td>
                  <td style="padding: 0.75rem 0.4rem; text-align: center; font-weight: 800; color: #00E599; font-family: 'Chakra Petch', monospace;">${s.points}</td>
                  <td style="padding: 0.75rem; text-align: right; font-family: 'Chakra Petch', monospace; font-weight: 700; color: ${s.nrr.startsWith('+') ? '#00E599' : '#ff3366'};">
                    ${s.nrr}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
}
