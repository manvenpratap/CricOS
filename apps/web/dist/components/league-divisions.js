/**
 * apps/web/src/components/league-divisions.ts
 *
 * CricOS Multi-Division League Brackets & Promotion/Relegation Engine
 * Implements NRR calculation, tier ladders, playoff seeding, and season transitions.
 */
/**
 * Calculates exact Net Run Rate (NRR) per ICC Section 16 Playing Conditions.
 * NRR = (Runs Scored / Overs Faced) - (Runs Conceded / Overs Bowled)
 */
export function calculateNetRunRate(runsScored, oversFaced, runsConceded, oversBowled) {
    if (oversFaced <= 0 || oversBowled <= 0)
        return 0;
    const forRate = runsScored / oversFaced;
    const againstRate = runsConceded / oversBowled;
    const diff = forRate - againstRate;
    return Math.round(diff * 1000) / 1000;
}
/**
 * Formats numeric NRR to standard signed 3-decimal string (e.g. "+1.420" or "-0.850").
 */
export function formatNrrString(nrr) {
    const sign = nrr >= 0 ? '+' : '';
    return `${sign}${nrr.toFixed(3)}`;
}
export class LeagueDivisionsManager {
    divisions = [];
    constructor() {
        this.seedDefaultDivisions();
        this.recalculateAllStandings();
    }
    seedDefaultDivisions() {
        // Premier Division (Tier 1)
        const premierTeams = [
            {
                teamId: 'mum-strikers',
                teamName: 'Mumbai Super Strikers',
                played: 6,
                won: 5,
                lost: 1,
                tied: 0,
                noResult: 0,
                runsScored: 1120,
                oversFaced: 118.2,
                runsConceded: 980,
                oversBowled: 120,
                points: 10,
                nrr: 1.305,
                rank: 1,
                status: 'PLAYOFFS'
            },
            {
                teamId: 'del-daredevils',
                teamName: 'Delhi Daredevils',
                played: 6,
                won: 4,
                lost: 2,
                tied: 0,
                noResult: 0,
                runsScored: 1050,
                oversFaced: 120,
                runsConceded: 990,
                oversBowled: 120,
                points: 8,
                nrr: 0.500,
                rank: 2,
                status: 'PLAYOFFS'
            },
            {
                teamId: 'blr-challengers',
                teamName: 'Bangalore Royal Challengers',
                played: 6,
                won: 3,
                lost: 3,
                tied: 0,
                noResult: 0,
                runsScored: 1020,
                oversFaced: 120,
                runsConceded: 1010,
                oversBowled: 120,
                points: 6,
                nrr: 0.083,
                rank: 3,
                status: 'PLAYOFFS'
            },
            {
                teamId: 'kol-riders',
                teamName: 'Kolkata Knight Riders',
                played: 6,
                won: 2,
                lost: 4,
                tied: 0,
                noResult: 0,
                runsScored: 940,
                oversFaced: 120,
                runsConceded: 1010,
                oversBowled: 120,
                points: 4,
                nrr: -0.583,
                rank: 4,
                status: 'PLAYOFFS'
            },
            {
                teamId: 'csk-super',
                teamName: 'Chennai Super Kings',
                played: 6,
                won: 2,
                lost: 4,
                tied: 0,
                noResult: 0,
                runsScored: 910,
                oversFaced: 120,
                runsConceded: 1000,
                oversBowled: 120,
                points: 4,
                nrr: -0.750,
                rank: 5,
                status: 'RETAINED'
            },
            {
                teamId: 'hyd-risers',
                teamName: 'Hyderabad Sunrisers',
                played: 6,
                won: 0,
                lost: 6,
                tied: 0,
                noResult: 0,
                runsScored: 820,
                oversFaced: 120,
                runsConceded: 1050,
                oversBowled: 118.2,
                points: 0,
                nrr: -2.045,
                rank: 6,
                status: 'RELEGATED'
            }
        ];
        // Division 1 Championship (Tier 2)
        const div1Teams = [
            {
                teamId: 'pun-kings',
                teamName: 'Punjab Kings XI',
                played: 6,
                won: 5,
                lost: 1,
                tied: 0,
                noResult: 0,
                runsScored: 1080,
                oversFaced: 120,
                runsConceded: 930,
                oversBowled: 120,
                points: 10,
                nrr: 1.250,
                rank: 1,
                status: 'PROMOTED'
            },
            {
                teamId: 'raj-royals',
                teamName: 'Rajasthan Royals Club',
                played: 6,
                won: 4,
                lost: 2,
                tied: 0,
                noResult: 0,
                runsScored: 1040,
                oversFaced: 120,
                runsConceded: 960,
                oversBowled: 120,
                points: 8,
                nrr: 0.667,
                rank: 2,
                status: 'PROMOTED'
            },
            {
                teamId: 'guj-titans',
                teamName: 'Gujarat Titans Academy',
                played: 6,
                won: 3,
                lost: 3,
                tied: 0,
                noResult: 0,
                runsScored: 990,
                oversFaced: 120,
                runsConceded: 990,
                oversBowled: 120,
                points: 6,
                nrr: 0.000,
                rank: 3,
                status: 'RETAINED'
            },
            {
                teamId: 'luc-super',
                teamName: 'Lucknow Super Giants CC',
                played: 6,
                won: 0,
                lost: 6,
                tied: 0,
                noResult: 0,
                runsScored: 830,
                oversFaced: 120,
                runsConceded: 1070,
                oversBowled: 120,
                points: 0,
                nrr: -2.000,
                rank: 4,
                status: 'RELEGATED'
            }
        ];
        this.divisions = [
            {
                id: 'div-premier',
                tier: 'PREMIER',
                title: 'Premier League (Tier 1)',
                maxTeams: 6,
                promotionSlots: 0,
                relegationSlots: 1,
                teams: premierTeams
            },
            {
                id: 'div-champ',
                tier: 'DIVISION_1',
                title: 'Division 1 Championship (Tier 2)',
                maxTeams: 4,
                promotionSlots: 1,
                relegationSlots: 1,
                teams: div1Teams
            }
        ];
    }
    recalculateAllStandings() {
        this.divisions.forEach(div => {
            // Sort by points descending, then NRR descending
            div.teams.sort((a, b) => {
                if (b.points !== a.points)
                    return b.points - a.points;
                return b.nrr - a.nrr;
            });
            // Update ranks and promotion/relegation statuses
            div.teams.forEach((t, idx) => {
                t.rank = idx + 1;
                if (div.tier === 'PREMIER') {
                    if (idx < 4) {
                        t.status = 'PLAYOFFS';
                    }
                    else if (idx >= div.teams.length - div.relegationSlots) {
                        t.status = 'RELEGATED';
                    }
                    else {
                        t.status = 'RETAINED';
                    }
                }
                else {
                    // Lower divisions: top slots promoted, bottom slots relegated
                    if (idx < div.promotionSlots) {
                        t.status = 'PROMOTED';
                    }
                    else if (idx >= div.teams.length - div.relegationSlots && div.relegationSlots > 0) {
                        t.status = 'RELEGATED';
                    }
                    else {
                        t.status = 'RETAINED';
                    }
                }
            });
        });
    }
    getDivisions() {
        return JSON.parse(JSON.stringify(this.divisions));
    }
    getPlayoffBracket() {
        const premier = this.divisions.find(d => d.tier === 'PREMIER');
        const teams = premier ? premier.teams : [];
        const seed1 = teams[0]?.teamName || 'Seed 1';
        const seed2 = teams[1]?.teamName || 'Seed 2';
        const seed3 = teams[2]?.teamName || 'Seed 3';
        const seed4 = teams[3]?.teamName || 'Seed 4';
        return {
            qualifier1: { seed1, seed2 },
            eliminator: { seed3, seed4 },
            qualifier2: { tbd1: `Loser (${seed1} vs ${seed2})`, tbd2: `Winner (${seed3} vs ${seed4})` },
            grandFinal: {
                finalist1: `Winner Q1 (${seed1}/${seed2})`,
                finalist2: 'Winner Q2',
                prizePurseMinor: 30000000 // ₹3,00,000 purse
            }
        };
    }
    /**
     * Simulates full season rollover with automatic promotion and relegation.
     * Returns newly configured divisions for the upcoming season.
     */
    simulateSeasonTransition() {
        const premier = this.divisions.find(d => d.tier === 'PREMIER');
        const div1 = this.divisions.find(d => d.tier === 'DIVISION_1');
        // Find teams to move
        const relegatedFromPremier = premier.teams.filter(t => t.status === 'RELEGATED');
        const promotedFromDiv1 = div1.teams.filter(t => t.status === 'PROMOTED');
        // Create next season deep copies
        const nextPremierTeams = premier.teams.filter(t => t.status !== 'RELEGATED');
        const nextDiv1Teams = div1.teams.filter(t => t.status !== 'PROMOTED');
        // Move promoted teams into Premier
        promotedFromDiv1.forEach(t => {
            nextPremierTeams.push({
                ...t,
                played: 0,
                won: 0,
                lost: 0,
                tied: 0,
                noResult: 0,
                runsScored: 0,
                oversFaced: 0,
                runsConceded: 0,
                oversBowled: 0,
                points: 0,
                nrr: 0,
                rank: nextPremierTeams.length + 1,
                status: 'RETAINED'
            });
        });
        // Move relegated teams into Div 1
        relegatedFromPremier.forEach(t => {
            nextDiv1Teams.push({
                ...t,
                played: 0,
                won: 0,
                lost: 0,
                tied: 0,
                noResult: 0,
                runsScored: 0,
                oversFaced: 0,
                runsConceded: 0,
                oversBowled: 0,
                points: 0,
                nrr: 0,
                rank: nextDiv1Teams.length + 1,
                status: 'RETAINED'
            });
        });
        // Reset remaining teams
        nextPremierTeams.forEach(t => {
            t.played = 0;
            t.won = 0;
            t.lost = 0;
            t.tied = 0;
            t.noResult = 0;
            t.runsScored = 0;
            t.oversFaced = 0;
            t.runsConceded = 0;
            t.oversBowled = 0;
            t.points = 0;
            t.nrr = 0;
            t.status = 'RETAINED';
        });
        nextDiv1Teams.forEach(t => {
            t.played = 0;
            t.won = 0;
            t.lost = 0;
            t.tied = 0;
            t.noResult = 0;
            t.runsScored = 0;
            t.oversFaced = 0;
            t.runsConceded = 0;
            t.oversBowled = 0;
            t.points = 0;
            t.nrr = 0;
            t.status = 'RETAINED';
        });
        const newDivisions = [
            { ...premier, teams: nextPremierTeams },
            { ...div1, teams: nextDiv1Teams }
        ];
        return {
            promotedTeams: promotedFromDiv1.map(t => t.teamName),
            relegatedTeams: relegatedFromPremier.map(t => t.teamName),
            newDivisions
        };
    }
    renderDivisionLaddersHtml() {
        const playoff = this.getPlayoffBracket();
        const divisionSections = this.divisions
            .map(div => {
            const rows = div.teams
                .map(t => {
                const isPromo = t.status === 'PROMOTED';
                const isReleg = t.status === 'RELEGATED';
                const isPlayoffs = t.status === 'PLAYOFFS';
                const statusBadge = isPromo
                    ? `<span style="background: rgba(0,229,153,0.15); color: #00E599; border: 1px solid #00E599; padding: 0.15rem 0.4rem; border-radius: 4px; font-weight: 700; font-size: 0.68rem;">↑ PROMOTED</span>`
                    : isReleg
                        ? `<span style="background: rgba(255,51,102,0.15); color: #ff3366; border: 1px solid #ff3366; padding: 0.15rem 0.4rem; border-radius: 4px; font-weight: 700; font-size: 0.68rem;">↓ RELEGATED</span>`
                        : isPlayoffs
                            ? `<span style="background: rgba(0,210,255,0.15); color: #00D2FF; border: 1px solid #00D2FF; padding: 0.15rem 0.4rem; border-radius: 4px; font-weight: 700; font-size: 0.68rem;">★ PLAYOFFS</span>`
                            : `<span style="color: #94a3b8; font-size: 0.68rem;">RETAINED</span>`;
                return `
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); ${isPlayoffs ? 'background: rgba(0,210,255,0.03);' : isReleg ? 'background: rgba(255,51,102,0.03);' : ''}">
                <td style="padding: 0.6rem 0.8rem; font-weight: 700; color: #fff;">
                  <span style="color: #94a3b8; font-size: 0.8rem; margin-right: 0.4rem;">${t.rank}</span>
                  ${t.teamName}
                </td>
                <td style="padding: 0.6rem 0.4rem; text-align: center; color: #CBD5E1;">${t.played}</td>
                <td style="padding: 0.6rem 0.4rem; text-align: center; color: #00E599; font-weight: 700;">${t.won}</td>
                <td style="padding: 0.6rem 0.4rem; text-align: center; color: #ff8099;">${t.lost}</td>
                <td style="padding: 0.6rem 0.4rem; text-align: center; font-family: 'Chakra Petch', monospace; font-weight: 800; color: #00E599;">${t.points}</td>
                <td style="padding: 0.6rem 0.8rem; text-align: right; font-family: 'Chakra Petch', monospace; font-weight: 700; color: ${t.nrr >= 0 ? '#00E599' : '#ff3366'};">
                  ${formatNrrString(t.nrr)}
                </td>
                <td style="padding: 0.6rem 0.8rem; text-align: right;">${statusBadge}</td>
              </tr>
            `;
            })
                .join('');
            return `
          <div style="background: rgba(10, 16, 28, 0.85); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; margin-bottom: 1.25rem; overflow: hidden;">
            <div style="padding: 0.75rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center;">
              <div>
                <span style="font-family: 'Space Grotesk', sans-serif; font-size: 1rem; font-weight: 700; color: #fff;">${div.title}</span>
                <span style="font-size: 0.75rem; color: #94a3b8; margin-left: 0.5rem;">${div.teams.length} Teams</span>
              </div>
              <div style="font-size: 0.72rem; color: #00D2FF;">
                ${div.promotionSlots > 0 ? `Top ${div.promotionSlots} Promoted • ` : ''}${div.relegationSlots > 0 ? `Bottom ${div.relegationSlots} Relegated` : ''}
              </div>
            </div>
            <div style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.82rem;">
                <thead>
                  <tr style="border-bottom: 1px solid rgba(255,255,255,0.08); color: #8E9BAE; font-size: 0.7rem; text-transform: uppercase;">
                    <th style="padding: 0.5rem 0.8rem;">Team</th>
                    <th style="padding: 0.5rem 0.4rem; text-align: center;">P</th>
                    <th style="padding: 0.5rem 0.4rem; text-align: center;">W</th>
                    <th style="padding: 0.5rem 0.4rem; text-align: center;">L</th>
                    <th style="padding: 0.5rem 0.4rem; text-align: center;">Pts</th>
                    <th style="padding: 0.5rem 0.8rem; text-align: right;">NRR</th>
                    <th style="padding: 0.5rem 0.8rem; text-align: right;">Status</th>
                  </tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>
            </div>
          </div>
        `;
        })
            .join('');
        return `
      <div class="league-divisions-board" style="color: #f8fafc; font-family: 'Plus Jakarta Sans', sans-serif;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <div>
            <h3 style="margin: 0; font-family: 'Space Grotesk', sans-serif; font-size: 1.25rem; color: #fff;">
              🏆 Multi-Division League Ladders & Playoff Seeding
            </h3>
            <div style="font-size: 0.8rem; color: #94a3b8; margin-top: 0.2rem;">
              Tier 1 Premier, Tier 2 Championship with Automatic Season Promotion/Relegation
            </div>
          </div>
          <button class="btn btn-secondary btn-sm" id="btnSimulatePromotion" onclick="simulateSeasonTransitionAction()" data-tooltip="Simulate season transition with automatic promotion and relegation">
            🔄 Simulate Rollover
          </button>
        </div>

        <div>${divisionSections}</div>

        <!-- Playoff Bracket Preview Card -->
        <div style="background: rgba(10, 16, 28, 0.9); border: 1px solid rgba(0, 210, 255, 0.2); border-radius: 12px; padding: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <span style="font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 0.9rem; color: #00D2FF;">
              ⚡ Premier Division Playoff Tree (Purse: ₹3,00,000)
            </span>
            <span style="font-size: 0.7rem; color: #00E599; font-weight: 700;">ICC Page Playoff System</span>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem;">
            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 0.6rem 0.8rem;">
              <div style="font-size: 0.7rem; color: #94a3b8; font-weight: 700;">QUALIFIER 1 (1 vs 2)</div>
              <div style="font-size: 0.85rem; font-weight: 700; color: #fff; margin-top: 0.2rem;">${playoff.qualifier1.seed1}</div>
              <div style="font-size: 0.85rem; font-weight: 700; color: #fff;">${playoff.qualifier1.seed2}</div>
            </div>
            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 0.6rem 0.8rem;">
              <div style="font-size: 0.7rem; color: #94a3b8; font-weight: 700;">ELIMINATOR (3 vs 4)</div>
              <div style="font-size: 0.85rem; font-weight: 700; color: #fff; margin-top: 0.2rem;">${playoff.eliminator.seed3}</div>
              <div style="font-size: 0.85rem; font-weight: 700; color: #fff;">${playoff.eliminator.seed4}</div>
            </div>
            <div style="background: rgba(0, 229, 153, 0.05); border: 1px solid rgba(0, 229, 153, 0.3); border-radius: 8px; padding: 0.6rem 0.8rem;">
              <div style="font-size: 0.7rem; color: #00E599; font-weight: 700;">GRAND FINAL 🏆</div>
              <div style="font-size: 0.85rem; font-weight: 700; color: #fff; margin-top: 0.2rem;">Winner Q1</div>
              <div style="font-size: 0.85rem; font-weight: 700; color: #fff;">Winner Q2</div>
            </div>
          </div>
        </div>
      </div>
    `;
    }
}
//# sourceMappingURL=league-divisions.js.map