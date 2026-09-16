/**
 * apps/web/src/components/leaderboards.ts
 *
 * Tournament Player Leaderboards (Orange & Purple Caps)
 * Derived from Archive Specifications:
 * - 04_API_and_Engineering/08_Sprint_Ready_P0_Backlog_v1.docx (Story TMT-007: Leaderboard projection)
 * - 02_Product_Experience/03_UX_Blueprint_v2.docx (Competition & Standings)
 *
 * Computes and renders real-time batting and bowling statistics rankings
 * with Stitch design tokens and athletic typography.
 */

export interface BattingLeader {
  rank: number;
  playerId: string;
  name: string;
  teamName: string;
  matches: number;
  innings: number;
  runs: number;
  highScore: string;
  average: number;
  strikeRate: number;
  fours: number;
  sixes: number;
}

export interface BowlingLeader {
  rank: number;
  playerId: string;
  name: string;
  teamName: string;
  matches: number;
  overs: string;
  wickets: number;
  bestBowling: string;
  economy: number;
  maidens: number;
  dotBalls: number;
}

export function getDefaultBattingLeaders(): BattingLeader[] {
  return [
    { rank: 1, playerId: 'p-1', name: 'Virat Sharma', teamName: 'Bengaluru Strikers', matches: 5, innings: 5, runs: 284, highScore: '92*', average: 71.0, strikeRate: 154.3, fours: 28, sixes: 11 },
    { rank: 2, playerId: 'p-2', name: 'Rohit Varma', teamName: 'Mumbai Blasters', matches: 5, innings: 5, runs: 242, highScore: '84', average: 48.4, strikeRate: 148.5, fours: 22, sixes: 14 },
    { rank: 3, playerId: 'p-3', name: 'KL Rahul', teamName: 'Delhi Titans', matches: 4, innings: 4, runs: 198, highScore: '71*', average: 66.0, strikeRate: 139.4, fours: 19, sixes: 6 },
    { rank: 4, playerId: 'p-4', name: 'Suryakumar Y.', teamName: 'Mumbai Blasters', matches: 5, innings: 5, runs: 176, highScore: '64', average: 35.2, strikeRate: 181.4, fours: 15, sixes: 12 },
    { rank: 5, playerId: 'p-5', name: 'Sanju S.', teamName: 'Chennai Warriors', matches: 4, innings: 4, runs: 165, highScore: '58', average: 41.2, strikeRate: 144.7, fours: 14, sixes: 8 }
  ];
}

export function getDefaultBowlingLeaders(): BowlingLeader[] {
  return [
    { rank: 1, playerId: 'b-1', name: 'Jasprit B.', teamName: 'Mumbai Blasters', matches: 5, overs: '20.0', wickets: 12, bestBowling: '4/14', economy: 5.85, maidens: 2, dotBalls: 68 },
    { rank: 2, playerId: 'b-2', name: 'Mohammed S.', teamName: 'Bengaluru Strikers', matches: 5, overs: '19.4', wickets: 10, bestBowling: '3/18', economy: 6.75, maidens: 1, dotBalls: 54 },
    { rank: 3, playerId: 'b-3', name: 'Rashid K.', teamName: 'Delhi Titans', matches: 4, overs: '16.0', wickets: 9, bestBowling: '3/22', economy: 6.20, maidens: 1, dotBalls: 46 },
    { rank: 4, playerId: 'b-4', name: 'Yuzvendra C.', teamName: 'Chennai Warriors', matches: 4, overs: '15.0', wickets: 8, bestBowling: '4/25', economy: 7.40, maidens: 0, dotBalls: 39 },
    { rank: 5, playerId: 'b-5', name: 'Arshdeep S.', teamName: 'Delhi Titans', matches: 4, overs: '15.2', wickets: 7, bestBowling: '3/28', economy: 8.10, maidens: 0, dotBalls: 35 }
  ];
}

/**
 * Renders the Batting (Orange Cap) Leaderboard HTML.
 */
export function renderBattingLeaderboardHtml(leaders: BattingLeader[]): string {
  return `
    <div style="overflow-x: auto;">
      <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; text-align: left;">
        <thead>
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); color: #94a3b8; font-size: 0.75rem; text-transform: uppercase;">
            <th style="padding: 0.6rem 0.5rem;">Rank</th>
            <th style="padding: 0.6rem 0.5rem;">Batter</th>
            <th style="padding: 0.6rem 0.5rem;">Team</th>
            <th style="padding: 0.6rem 0.5rem; text-align: right;">Runs</th>
            <th style="padding: 0.6rem 0.5rem; text-align: right;">HS</th>
            <th style="padding: 0.6rem 0.5rem; text-align: right;">AVG</th>
            <th style="padding: 0.6rem 0.5rem; text-align: right;">SR</th>
            <th style="padding: 0.6rem 0.5rem; text-align: right;">4s/6s</th>
          </tr>
        </thead>
        <tbody>
          ${leaders.map(l => `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); ${l.rank === 1 ? 'background: rgba(255, 184, 0, 0.08);' : ''}">
              <td style="padding: 0.6rem 0.5rem; font-weight: 700; color: ${l.rank === 1 ? '#FFB800' : '#f8fafc'};">
                ${l.rank === 1 ? '👑 1' : `#${l.rank}`}
              </td>
              <td style="padding: 0.6rem 0.5rem; font-weight: 600; color: #f8fafc;">
                ${l.name}
              </td>
              <td style="padding: 0.6rem 0.5rem; color: #94a3b8;">
                ${l.teamName}
              </td>
              <td style="padding: 0.6rem 0.5rem; text-align: right; font-family: 'Chakra Petch', monospace; font-weight: 700; color: #00E599; font-size: 0.95rem;">
                ${l.runs}
              </td>
              <td style="padding: 0.6rem 0.5rem; text-align: right; font-family: 'Chakra Petch', monospace; color: #f8fafc;">
                ${l.highScore}
              </td>
              <td style="padding: 0.6rem 0.5rem; text-align: right; font-family: 'Chakra Petch', monospace; color: #00D2FF;">
                ${l.average.toFixed(1)}
              </td>
              <td style="padding: 0.6rem 0.5rem; text-align: right; font-family: 'Chakra Petch', monospace; color: #f8fafc;">
                ${l.strikeRate.toFixed(1)}
              </td>
              <td style="padding: 0.6rem 0.5rem; text-align: right; color: #94a3b8;">
                ${l.fours} / ${l.sixes}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

/**
 * Renders the Bowling (Purple Cap) Leaderboard HTML.
 */
export function renderBowlingLeaderboardHtml(leaders: BowlingLeader[]): string {
  return `
    <div style="overflow-x: auto;">
      <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; text-align: left;">
        <thead>
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); color: #94a3b8; font-size: 0.75rem; text-transform: uppercase;">
            <th style="padding: 0.6rem 0.5rem;">Rank</th>
            <th style="padding: 0.6rem 0.5rem;">Bowler</th>
            <th style="padding: 0.6rem 0.5rem;">Team</th>
            <th style="padding: 0.6rem 0.5rem; text-align: right;">Wkts</th>
            <th style="padding: 0.6rem 0.5rem; text-align: right;">Overs</th>
            <th style="padding: 0.6rem 0.5rem; text-align: right;">BBI</th>
            <th style="padding: 0.6rem 0.5rem; text-align: right;">Econ</th>
            <th style="padding: 0.6rem 0.5rem; text-align: right;">Dots</th>
          </tr>
        </thead>
        <tbody>
          ${leaders.map(l => `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); ${l.rank === 1 ? 'background: rgba(192, 132, 252, 0.08);' : ''}">
              <td style="padding: 0.6rem 0.5rem; font-weight: 700; color: ${l.rank === 1 ? '#C084FC' : '#f8fafc'};">
                ${l.rank === 1 ? '💜 1' : `#${l.rank}`}
              </td>
              <td style="padding: 0.6rem 0.5rem; font-weight: 600; color: #f8fafc;">
                ${l.name}
              </td>
              <td style="padding: 0.6rem 0.5rem; color: #94a3b8;">
                ${l.teamName}
              </td>
              <td style="padding: 0.6rem 0.5rem; text-align: right; font-family: 'Chakra Petch', monospace; font-weight: 700; color: #C084FC; font-size: 0.95rem;">
                ${l.wickets}
              </td>
              <td style="padding: 0.6rem 0.5rem; text-align: right; font-family: 'Chakra Petch', monospace; color: #f8fafc;">
                ${l.overs}
              </td>
              <td style="padding: 0.6rem 0.5rem; text-align: right; font-family: 'Chakra Petch', monospace; color: #00E599;">
                ${l.bestBowling}
              </td>
              <td style="padding: 0.6rem 0.5rem; text-align: right; font-family: 'Chakra Petch', monospace; color: #00D2FF;">
                ${l.economy.toFixed(2)}
              </td>
              <td style="padding: 0.6rem 0.5rem; text-align: right; color: #94a3b8;">
                ${l.dotBalls}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}
