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
export declare function getDefaultTeam(): TeamDetails;
export declare function renderPlayerCardHtml(player: RosterPlayer): string;
//# sourceMappingURL=team-roster.d.ts.map