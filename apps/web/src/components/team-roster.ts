export interface RosterPlayer {
  id: string;
  name: string;
  jerseyNumber: number;
  role: 'BATTER' | 'BOWLER' | 'ALL_ROUNDER' | 'WICKET_KEEPER';
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  isWicketKeeper?: boolean;
  isVerified?: boolean;
  battingStyle: 'RHB' | 'LHB';
}

export interface TeamDetails {
  id: string;
  name: string;
  shortCode: string;
  homeGround: string;
  primaryColor: string;
  secondaryColor: string;
  joinCode: string;
  players: RosterPlayer[];
}

export function getDefaultTeam(): TeamDetails {
  return {
    id: 'tm-blr-01',
    name: 'Bangalore Blasters',
    shortCode: 'BLR',
    homeGround: 'Chinnaswamy Turf A',
    primaryColor: '#00E599',
    secondaryColor: '#00D2FF',
    joinCode: 'CRIC-BLR-4821',
    players: [
      { id: 'p1', name: 'Virat Sharma', jerseyNumber: 18, role: 'BATTER', isCaptain: true, isVerified: true, battingStyle: 'RHB' },
      { id: 'p2', name: 'Rohit Verma', jerseyNumber: 45, role: 'BATTER', isViceCaptain: true, isVerified: true, battingStyle: 'RHB' },
      { id: 'p3', name: 'KL Rahul', jerseyNumber: 1, role: 'WICKET_KEEPER', isWicketKeeper: true, isVerified: true, battingStyle: 'RHB' },
      { id: 'p4', name: 'Hardik Patel', jerseyNumber: 33, role: 'ALL_ROUNDER', isVerified: true, battingStyle: 'RHB' },
      { id: 'p5', name: 'Rishabh Pant', jerseyNumber: 17, role: 'BATTER', isVerified: true, battingStyle: 'LHB' },
      { id: 'p6', name: 'Ravindra Jadeja', jerseyNumber: 8, role: 'ALL_ROUNDER', isVerified: true, battingStyle: 'LHB' },
      { id: 'p7', name: 'Jasprit Bumrah', jerseyNumber: 93, role: 'BOWLER', isVerified: true, battingStyle: 'RHB' },
      { id: 'p8', name: 'Mohammed Shami', jerseyNumber: 11, role: 'BOWLER', isVerified: true, battingStyle: 'RHB' },
      { id: 'p9', name: 'Kuldeep Yadav', jerseyNumber: 23, role: 'BOWLER', isVerified: true, battingStyle: 'LHB' },
      { id: 'p10', name: 'Surya Kumar', jerseyNumber: 63, role: 'BATTER', isVerified: true, battingStyle: 'RHB' },
      { id: 'p11', name: 'Arshdeep Singh', jerseyNumber: 2, role: 'BOWLER', isVerified: true, battingStyle: 'LHB' }
    ]
  };
}

export function renderPlayerCardHtml(player: RosterPlayer): string {
  const badges: string[] = [];
  if (player.isCaptain) badges.push('<span style="background:#00E599;color:#04070D;padding:0.15rem 0.4rem;border-radius:4px;font-size:0.65rem;font-weight:800;" data-tooltip="Team Captain">C</span>');
  if (player.isViceCaptain) badges.push('<span style="background:#00D2FF;color:#04070D;padding:0.15rem 0.4rem;border-radius:4px;font-size:0.65rem;font-weight:800;" data-tooltip="Vice Captain">VC</span>');
  if (player.isWicketKeeper) badges.push('<span style="background:#FFB800;color:#04070D;padding:0.15rem 0.4rem;border-radius:4px;font-size:0.65rem;font-weight:800;" data-tooltip="Wicketkeeper">WK</span>');

  return `
    <div class="player-roster-card" style="display:flex;align-items:center;justify-content:space-between;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:0.65rem 1rem;margin-bottom:0.5rem;" data-tooltip="Player: ${player.name} (${player.role})">
      <div style="display:flex;align-items:center;gap:0.75rem;">
        <span style="font-family:monospace;font-weight:800;color:#94A3B8;width:24px;">#${player.jerseyNumber}</span>
        <div>
          <div style="font-weight:700;color:#F8FAFC;display:flex;align-items:center;gap:0.4rem;">
            ${player.name} ${badges.join(' ')}
          </div>
          <div style="font-size:0.72rem;color:#94A3B8;">${player.role} • ${player.battingStyle}</div>
        </div>
      </div>
      <span style="font-size:0.72rem;padding:0.2rem 0.5rem;border-radius:9999px;background:rgba(0,229,153,0.12);color:#00E599;border:1px solid rgba(0,229,153,0.3);">
        ${player.isVerified ? '✓ Verified' : 'Pending'}
      </span>
    </div>
  `;
}
