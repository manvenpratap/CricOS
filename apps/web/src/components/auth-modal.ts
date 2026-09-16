export type PersonaRole = 'CAPTAIN' | 'PLAYER' | 'ORGANISER' | 'SCORER' | 'TURF_PROVIDER';

export interface UserProfile {
  id: string;
  name: string;
  identifier: string;
  role: PersonaRole;
  jerseyNumber: number;
  battingStyle: 'RHB' | 'LHB';
  bowlingStyle: 'RIGHT_FAST' | 'RIGHT_SPIN' | 'LEFT_FAST' | 'LEFT_SPIN' | 'NONE';
  primarySkill: 'BATTER' | 'BOWLER' | 'ALL_ROUNDER' | 'WICKET_KEEPER';
  teamId?: string;
  teamName?: string;
  careerStats: {
    matches: number;
    runs: number;
    battingAverage: string;
    strikeRate: string;
    wickets: number;
    bowlingEconomy: string;
  };
}

export function getDefaultProfile(role: PersonaRole = 'CAPTAIN'): UserProfile {
  return {
    id: 'usr-default-77',
    name: 'Virat Sharma',
    identifier: '+91 98765 43210',
    role,
    jerseyNumber: 18,
    battingStyle: 'RHB',
    bowlingStyle: 'RIGHT_FAST',
    primarySkill: 'BATTER',
    teamId: 'tm-rcb-01',
    teamName: 'Bangalore Blasters',
    careerStats: {
      matches: 48,
      runs: 1850,
      battingAverage: '46.25',
      strikeRate: '144.50',
      wickets: 12,
      bowlingEconomy: '7.40'
    }
  };
}

export function renderUserBadgeHtml(profile: UserProfile): string {
  const roleColorMap: Record<PersonaRole, string> = {
    CAPTAIN: '#00E599',
    PLAYER: '#00D2FF',
    ORGANISER: '#A855F7',
    SCORER: '#FFB800',
    TURF_PROVIDER: '#38BDF8'
  };

  const badgeColor = roleColorMap[profile.role] || '#00E599';

  return `
    <div class="user-profile-badge" style="display:inline-flex;align-items:center;gap:0.6rem;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);padding:0.35rem 0.85rem;border-radius:9999px;cursor:pointer;" data-tooltip="User profile & persona switcher (${profile.role})">
      <div style="width:28px;height:28px;border-radius:50%;background:${badgeColor};color:#04070D;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.75rem;">
        ${profile.name.slice(0, 2).toUpperCase()}
      </div>
      <div style="display:flex;flex-direction:column;text-align:left;">
        <span style="font-size:0.82rem;font-weight:700;color:#F8FAFC;">${profile.name}</span>
        <span style="font-size:0.68rem;font-weight:700;color:${badgeColor};text-transform:uppercase;">${profile.role} #${profile.jerseyNumber}</span>
      </div>
    </div>
  `;
}
