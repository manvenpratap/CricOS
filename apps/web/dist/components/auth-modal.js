export const ROLE_PERMISSIONS_MATRIX = {
    CAPTAIN: {
        allowedTabs: ['scoring', 'teams', 'tournaments', 'marketplace', 'studio'],
        defaultTab: 'teams',
        canScore: false,
        canManageLineup: true,
        canFileIncident: false,
        canManageTournaments: false,
        canManageVenues: true,
        canAccessApiExplorer: false,
        canAccessExplorer: false,
        canAccessAdmin: false,
        canAccessAdminAudit: false,
        canSignOffMatch: true,
        canConductToss: true,
        fanCheerConsole: false,
        scoringMode: 'TACTICAL_VIEW',
        description: 'Team Captain: Manage Playing XI, toss, match tactics, and sign-offs',
        badgeColor: '#00E599',
        icon: '👑'
    },
    PLAYER: {
        allowedTabs: ['scoring', 'teams', 'tournaments', 'marketplace'],
        defaultTab: 'teams',
        canScore: false,
        canManageLineup: false,
        canFileIncident: false,
        canManageTournaments: false,
        canManageVenues: false,
        canAccessApiExplorer: false,
        canAccessExplorer: false,
        canAccessAdmin: false,
        canAccessAdminAudit: false,
        canSignOffMatch: false,
        canConductToss: false,
        fanCheerConsole: false,
        scoringMode: 'FAN_SPECTATOR',
        description: 'Player: View career stats, squad roster, and match fixtures',
        badgeColor: '#00D2FF',
        icon: '🏏'
    },
    SCORER: {
        allowedTabs: ['scoring', 'studio', 'tournaments'],
        defaultTab: 'studio',
        canScore: true,
        canManageLineup: false,
        canFileIncident: false,
        canManageTournaments: false,
        canManageVenues: false,
        canAccessApiExplorer: false,
        canAccessExplorer: false,
        canAccessAdmin: false,
        canAccessAdminAudit: false,
        canSignOffMatch: true,
        canConductToss: false,
        fanCheerConsole: false,
        scoringMode: 'SCORER',
        description: 'Official Scorer: Full ball-by-ball scoring, dismissals, and wagon wheel',
        badgeColor: '#FFB800',
        icon: '📋'
    },
    FAN: {
        allowedTabs: ['scoring', 'teams', 'tournaments'],
        defaultTab: 'scoring',
        canScore: false,
        canManageLineup: false,
        canFileIncident: false,
        canManageTournaments: false,
        canManageVenues: false,
        canAccessApiExplorer: false,
        canAccessExplorer: false,
        canAccessAdmin: false,
        canAccessAdminAudit: false,
        canSignOffMatch: false,
        canConductToss: false,
        fanCheerConsole: true,
        scoringMode: 'FAN_SPECTATOR',
        description: 'Fan: Live spectator broadcast, cheering console, and match insights',
        badgeColor: '#C084FC',
        icon: '🎪'
    },
    UMPIRE: {
        allowedTabs: ['scoring', 'incidents', 'tournaments'],
        defaultTab: 'incidents',
        canScore: false,
        canManageLineup: false,
        canFileIncident: true,
        canManageTournaments: false,
        canManageVenues: false,
        canAccessApiExplorer: false,
        canAccessExplorer: false,
        canAccessAdmin: false,
        canAccessAdminAudit: false,
        canSignOffMatch: true,
        canConductToss: false,
        fanCheerConsole: false,
        scoringMode: 'OFFICIAL_OVERSIGHT',
        description: 'Official Umpire: Fair play reports, dispute logging, and match sign-offs',
        badgeColor: '#38BDF8',
        icon: '⚖️'
    },
    ADMIN: {
        allowedTabs: ['scoring', 'teams', 'tournaments', 'marketplace', 'studio', 'incidents', 'explorer'],
        defaultTab: 'explorer',
        canScore: false,
        canManageLineup: true,
        canFileIncident: true,
        canManageTournaments: true,
        canManageVenues: true,
        canAccessApiExplorer: true,
        canAccessExplorer: true,
        canAccessAdmin: true,
        canAccessAdminAudit: true,
        canSignOffMatch: true,
        canConductToss: true,
        fanCheerConsole: false,
        scoringMode: 'SCORER',
        description: 'Platform Admin: Unrestricted access to all studios, ledgers, and APIs',
        badgeColor: '#FF3366',
        icon: '⚡'
    },
    ORGANISER: {
        allowedTabs: ['tournaments', 'marketplace', 'teams', 'scoring', 'incidents'],
        defaultTab: 'tournaments',
        canScore: false,
        canManageLineup: true,
        canFileIncident: true,
        canManageTournaments: true,
        canManageVenues: true,
        canAccessApiExplorer: false,
        canAccessExplorer: false,
        canAccessAdmin: false,
        canAccessAdminAudit: false,
        canSignOffMatch: false,
        canConductToss: false,
        fanCheerConsole: false,
        scoringMode: 'OFFICIAL_OVERSIGHT',
        description: 'Tournament Organiser: Fixture generator, brackets, and venue RFQs',
        badgeColor: '#A855F7',
        icon: '🏆'
    },
    TURF_PROVIDER: {
        allowedTabs: ['marketplace', 'scoring', 'incidents'],
        defaultTab: 'marketplace',
        canScore: false,
        canManageLineup: false,
        canFileIncident: false,
        canManageTournaments: false,
        canManageVenues: true,
        canAccessApiExplorer: false,
        canAccessExplorer: false,
        canAccessAdmin: false,
        canAccessAdminAudit: false,
        canSignOffMatch: true,
        canConductToss: false,
        fanCheerConsole: false,
        scoringMode: 'FAN_SPECTATOR',
        description: 'Turf Provider: Manage ground slots, surge pricing, and escrow payouts',
        badgeColor: '#34D399',
        icon: '🏟️'
    }
};
export function isTabAllowedForRole(role, tabId) {
    const perms = ROLE_PERMISSIONS_MATRIX[role];
    return perms ? perms.allowedTabs.includes(tabId) : false;
}
export function getRolePermissions(role) {
    return ROLE_PERMISSIONS_MATRIX[role] || ROLE_PERMISSIONS_MATRIX.FAN;
}
export function getDefaultProfile(role = 'CAPTAIN') {
    const profileConfigs = {
        CAPTAIN: { name: 'Virat Sharma', jersey: 18, skill: 'BATTER' },
        PLAYER: { name: 'Hardik Patel', jersey: 33, skill: 'ALL_ROUNDER' },
        SCORER: { name: 'Sunil Gavaskar', jersey: 18, skill: 'BATTER' },
        FAN: { name: 'Aarav Mehta', jersey: 7, skill: 'BATTER' },
        UMPIRE: { name: 'Nitin Menon', jersey: 44, skill: 'ALL_ROUNDER' },
        ADMIN: { name: 'System Root', jersey: 99, skill: 'ALL_ROUNDER' },
        ORGANISER: { name: 'Jay Shah', jersey: 10, skill: 'BATTER' },
        TURF_PROVIDER: { name: 'Bengaluru Turf Ops', jersey: 12, skill: 'ALL_ROUNDER' }
    };
    const cfg = profileConfigs[role] || profileConfigs.CAPTAIN;
    return {
        id: `usr-${role.toLowerCase()}-77`,
        name: cfg.name,
        identifier: '+91 98765 43210',
        role,
        jerseyNumber: cfg.jersey,
        battingStyle: 'RHB',
        bowlingStyle: 'RIGHT_FAST',
        primarySkill: cfg.skill,
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
export function renderUserBadgeHtml(profile) {
    const perms = getRolePermissions(profile.role);
    const badgeColor = perms.badgeColor;
    return `
    <div class="user-profile-badge" style="display:inline-flex;align-items:center;gap:0.6rem;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);padding:0.35rem 0.85rem;border-radius:9999px;cursor:pointer;" data-tooltip="User profile & persona switcher (${profile.role})">
      <div style="width:28px;height:28px;border-radius:50%;background:${badgeColor};color:#04070D;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.75rem;">
        ${profile.name.slice(0, 2).toUpperCase()}
      </div>
      <div style="display:flex;flex-direction:column;text-align:left;">
        <span style="font-size:0.82rem;font-weight:700;color:#F8FAFC;">${profile.name}</span>
        <span style="font-size:0.68rem;font-weight:700;color:${badgeColor};text-transform:uppercase;">${perms.icon} ${profile.role} #${profile.jerseyNumber}</span>
      </div>
    </div>
  `;
}
//# sourceMappingURL=auth-modal.js.map