export type PersonaRole = 'CAPTAIN' | 'PLAYER' | 'ORGANISER' | 'SCORER' | 'TURF_PROVIDER' | 'UMPIRE' | 'FAN' | 'ADMIN';
export interface RolePermissions {
    allowedTabs: string[];
    defaultTab: string;
    canScore: boolean;
    canManageLineup: boolean;
    canFileIncident: boolean;
    canManageTournaments: boolean;
    canManageVenues: boolean;
    canAccessApiExplorer: boolean;
    canAccessExplorer: boolean;
    canAccessAdmin: boolean;
    canAccessAdminAudit: boolean;
    canSignOffMatch: boolean;
    canConductToss: boolean;
    fanCheerConsole: boolean;
    scoringMode: 'SCORER' | 'TACTICAL_VIEW' | 'FAN_SPECTATOR' | 'OFFICIAL_OVERSIGHT';
    description: string;
    badgeColor: string;
    icon: string;
}
export declare const ROLE_PERMISSIONS_MATRIX: Record<PersonaRole, RolePermissions>;
export declare function isTabAllowedForRole(role: PersonaRole, tabId: string): boolean;
export declare function getRolePermissions(role: PersonaRole): RolePermissions;
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
export declare function getDefaultProfile(role?: PersonaRole): UserProfile;
export declare function renderUserBadgeHtml(profile: UserProfile): string;
//# sourceMappingURL=auth-modal.d.ts.map