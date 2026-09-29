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
export interface TournamentFixture {
    id: string;
    round: number;
    team1: string;
    team2: string;
    date: string;
    venue: string;
    status: 'SCHEDULED' | 'LIVE' | 'COMPLETED';
}
export interface LeaderboardPlayer {
    rank: number;
    name: string;
    team: string;
    metric: string;
    value: number;
}
export declare class TournamentsScreenController {
    private currentStage;
    private standings;
    private fixtures;
    private orangeCap;
    private purpleCap;
    private activeDivisionTier;
    private division1Standings;
    getState(): {
        currentStage: number;
        activeDivisionTier: "PREMIER" | "DIVISION_1";
        standings: TournamentTeamStanding[];
        division1Standings: TournamentTeamStanding[];
        fixtures: TournamentFixture[];
        orangeCap: LeaderboardPlayer[];
        purpleCap: LeaderboardPlayer[];
    };
    getDivisionStandings(tier?: 'PREMIER' | 'DIVISION_1'): TournamentTeamStanding[];
    setActiveDivisionTier(tier: 'PREMIER' | 'DIVISION_1'): void;
    calculateNRR(runsScored: number, oversFaced: number, runsConceded: number, oversBowled: number): string;
    simulatePromotionRelegation(): {
        promoted: string[];
        relegated: string[];
    };
    setStage(stage: number): void;
    calculateEventBasket(baseMinor: number, platformFeePercent?: number): {
        baseMinor: number;
        platformFeePercent: number;
        platformFeeMinor: number;
        gstMinor: number;
        totalMinor: number;
    };
    onboardTournament(name: string, teams: string[]): {
        name: string;
        teams: string[];
        fixtureCount: number;
    };
    renderMobileHtml(isOrganiser?: boolean): string;
}
//# sourceMappingURL=TournamentsScreen.d.ts.map