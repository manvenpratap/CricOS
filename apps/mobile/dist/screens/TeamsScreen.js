export class TeamsScreenController {
    state;
    constructor(initialState) {
        this.state = {
            teamName: initialState?.teamName || 'Bangalore Royal Challengers',
            teamCode: initialState?.teamCode || 'CRIC-BLR-4821',
            captainName: initialState?.captainName || 'Virat Sharma',
            tossConducted: initialState?.tossConducted || false,
            tossWinner: initialState?.tossWinner,
            tossDecision: initialState?.tossDecision,
            playingXI: initialState?.playingXI || [
                { id: 'p-1', name: 'Virat Sharma', jerseyNumber: 18, role: 'C', battingStance: 'RHB', bowlingStyle: 'Right-Arm Fast', isCaptain: true },
                { id: 'p-2', name: 'Faf du Plessis', jerseyNumber: 13, role: 'BAT', battingStance: 'RHB', bowlingStyle: 'Right-Arm Legbreak' },
                { id: 'p-3', name: 'Rajat Patidar', jerseyNumber: 87, role: 'BAT', battingStance: 'RHB', bowlingStyle: 'Right-Arm Offbreak' },
                { id: 'p-4', name: 'Glenn Maxwell', jerseyNumber: 32, role: 'ALL', battingStance: 'RHB', bowlingStyle: 'Right-Arm Offbreak' },
                { id: 'p-5', name: 'Rishabh Pant', jerseyNumber: 17, role: 'WK', battingStance: 'LHB', bowlingStyle: 'None' },
                { id: 'p-6', name: 'Dinesh Karthik', jerseyNumber: 21, role: 'WK', battingStance: 'RHB', bowlingStyle: 'None' },
                { id: 'p-7', name: 'Mahipal Lomror', jerseyNumber: 64, role: 'ALL', battingStance: 'LHB', bowlingStyle: 'Slow Left-Arm' },
                { id: 'p-8', name: 'Ravindra Jadeja', jerseyNumber: 8, role: 'ALL', battingStance: 'LHB', bowlingStyle: 'Slow Left-Arm' },
                { id: 'p-9', name: 'Harshal Patel', jerseyNumber: 9, role: 'BOWL', battingStance: 'RHB', bowlingStyle: 'Right-Arm Medium' },
                { id: 'p-10', name: 'Mohammed Siraj', jerseyNumber: 73, role: 'BOWL', battingStance: 'RHB', bowlingStyle: 'Right-Arm Fast' },
                { id: 'p-11', name: 'Josh Hazlewood', jerseyNumber: 38, role: 'BOWL', battingStance: 'LHB', bowlingStyle: 'Right-Arm Fast' }
            ],
            bench: initialState?.bench || [
                { id: 'p-12', name: 'Anuj Rawat', jerseyNumber: 28, role: 'WK', battingStance: 'LHB', bowlingStyle: 'None' },
                { id: 'p-13', name: 'Akash Deep', jerseyNumber: 41, role: 'BOWL', battingStance: 'RHB', bowlingStyle: 'Right-Arm Fast' },
                { id: 'p-14', name: 'Karn Sharma', jerseyNumber: 11, role: 'BOWL', battingStance: 'LHB', bowlingStyle: 'Legbreak Googly' }
            ]
        };
    }
    getState() {
        return JSON.parse(JSON.stringify(this.state));
    }
    swapPlayerWithBench(xiPlayerId, benchPlayerId) {
        const xiIndex = this.state.playingXI.findIndex(p => p.id === xiPlayerId);
        const benchIndex = this.state.bench.findIndex(p => p.id === benchPlayerId);
        if (xiIndex === -1 || benchIndex === -1)
            return false;
        const xiPlayer = this.state.playingXI[xiIndex];
        const benchPlayer = this.state.bench[benchIndex];
        this.state.playingXI[xiIndex] = benchPlayer;
        this.state.bench[benchIndex] = xiPlayer;
        return true;
    }
    recordToss(winner, decision) {
        this.state.tossConducted = true;
        this.state.tossWinner = winner;
        this.state.tossDecision = decision;
    }
    renderMobileHtml(isCaptain = true) {
        return `
      <div class="mobile-teams-screen" style="padding: 1rem; color: #f8fafc; font-family: 'Plus Jakarta Sans', sans-serif;">
        <!-- Team Header Card -->
        <div style="background: rgba(10, 16, 28, 0.9); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 1.25rem; margin-bottom: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <div style="font-size: 0.75rem; color: #00E599; font-weight: 700; text-transform: uppercase;">Franchise Roster</div>
              <h2 style="margin: 0.2rem 0 0; font-size: 1.25rem; font-family: 'Space Grotesk', sans-serif; color: #f8fafc;">${this.state.teamName}</h2>
              <div style="font-size: 0.8rem; color: #94a3b8; margin-top: 0.25rem;">Captain: <strong style="color: #f8fafc;">${this.state.captainName}</strong></div>
            </div>
            <div style="text-align: right;">
              <span style="background: rgba(0, 210, 255, 0.15); border: 1px solid rgba(0, 210, 255, 0.3); color: #00D2FF; font-size: 0.7rem; font-weight: 700; padding: 0.25rem 0.5rem; border-radius: 6px; display: inline-flex; align-items: center; gap: 0.25rem;" data-tooltip="Team Join Code">
                ${this.state.teamCode}
              </span>
            </div>
          </div>

          <!-- Toss Status / Captain Toss CTA -->
          <div style="margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 0.8rem;">
              ${this.state.tossConducted ? `
                <span style="color: #00E599; font-weight: 700;">Toss Result:</span> ${this.state.tossWinner} chose to ${this.state.tossDecision}
              ` : `
                <span style="color: #FFB800; font-weight: 600;">Toss Pending:</span> Scheduled 15m before start
              `}
            </div>
            ${isCaptain && !this.state.tossConducted ? `
              <button type="button" onclick="window.cricosMobileApp.conductTossModal()" style="padding: 0.4rem 0.8rem; border-radius: 6px; border: none; background: linear-gradient(135deg, #00E599, #00D2FF); color: #04070D; font-weight: 700; font-size: 0.75rem; cursor: pointer;" data-tooltip="Conduct official MCC match toss">
                Conduct Toss
              </button>
            ` : ''}
          </div>
        </div>

        <!-- Playing XI Lineup -->
        <div style="background: rgba(10, 16, 28, 0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden; margin-bottom: 1rem;">
          <div style="padding: 0.75rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 700; font-size: 0.9rem; font-family: 'Space Grotesk', sans-serif;">⭐ Playing XI (${this.state.playingXI.length}/11)</span>
            <span style="font-size: 0.7rem; color: #00E599; font-weight: 600;">Verified Active</span>
          </div>
          <div style="display: flex; flex-direction: column;">
            ${this.state.playingXI.map((p, idx) => `
              <div style="padding: 0.6rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.04); display: flex; justify-content: space-between; align-items: center;" data-tooltip="${p.name} - ${p.battingStance}, ${p.bowlingStyle}">
                <div style="display: flex; align-items: center; gap: 0.6rem;">
                  <span style="font-family: 'Chakra Petch', monospace; font-weight: 800; font-size: 0.8rem; color: #94a3b8; width: 18px;">${idx + 1}</span>
                  <div style="width: 28px; height: 28px; border-radius: 50%; background: rgba(0, 229, 153, 0.15); border: 1px solid rgba(0, 229, 153, 0.3); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 800; color: #00E599; font-family: 'Chakra Petch', monospace;">
                    ${p.jerseyNumber}
                  </div>
                  <div>
                    <div style="font-size: 0.85rem; font-weight: 600; color: #f8fafc;">${p.name} ${p.isCaptain ? '(C)' : ''}</div>
                    <div style="font-size: 0.7rem; color: #94a3b8;">${p.battingStance} • ${p.bowlingStyle}</div>
                  </div>
                </div>
                <div style="display: flex; align-items: center; gap: 0.4rem;">
                  <span style="font-size: 0.65rem; padding: 0.15rem 0.4rem; border-radius: 4px; background: rgba(255,255,255,0.06); color: #cbd5e1; font-weight: 700;">${p.role}</span>
                  ${isCaptain ? `
                    <button type="button" onclick="window.cricosMobileApp.benchPlayer('${p.id}')" style="background: none; border: 1px solid rgba(255,255,255,0.15); border-radius: 4px; color: #94a3b8; font-size: 0.65rem; padding: 0.2rem 0.4rem; cursor: pointer;" data-tooltip="Move to bench">Bench</button>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Bench Reserves -->
        <div style="background: rgba(10, 16, 28, 0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden; margin-bottom: 1rem;">
          <div style="padding: 0.75rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 700; font-size: 0.9rem; font-family: 'Space Grotesk', sans-serif;">Bench Reserves (${this.state.bench.length})</span>
            <span style="font-size: 0.7rem; color: #94a3b8;">Substitutes</span>
          </div>
          <div style="display: flex; flex-direction: column;">
            ${this.state.bench.map(p => `
              <div style="padding: 0.6rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.04); display: flex; justify-content: space-between; align-items: center;" data-tooltip="${p.name} - ${p.battingStance}">
                <div style="display: flex; align-items: center; gap: 0.6rem;">
                  <div style="width: 26px; height: 26px; border-radius: 50%; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 700; color: #94a3b8; font-family: 'Chakra Petch', monospace;">
                    ${p.jerseyNumber}
                  </div>
                  <div>
                    <div style="font-size: 0.85rem; font-weight: 600; color: #cbd5e1;">${p.name}</div>
                    <div style="font-size: 0.7rem; color: #64748b;">${p.battingStance} • ${p.role}</div>
                  </div>
                </div>
                ${isCaptain ? `
                  <button type="button" onclick="window.cricosMobileApp.promoteToXi('${p.id}')" style="background: rgba(0, 229, 153, 0.1); border: 1px solid rgba(0, 229, 153, 0.3); border-radius: 4px; color: #00E599; font-size: 0.65rem; padding: 0.2rem 0.5rem; font-weight: 700; cursor: pointer;" data-tooltip="Promote to Playing XI">Promote ↑</button>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
    }
}
//# sourceMappingURL=TeamsScreen.js.map