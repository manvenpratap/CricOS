export type MatchFormat = 'T20' | 'T10' | 'ODI' | 'HUNDRED';
export interface TournamentConfig {
    name: string;
    format: MatchFormat;
    teamIds: string[];
    maxOversPerInnings: number;
}
export interface GeneratedFixture {
    id: string;
    roundNumber: number;
    homeTeamId: string;
    awayTeamId: string;
    status: 'SCHEDULED' | 'LIVE' | 'COMPLETED';
}
export declare function generateTournamentSchedule(config: TournamentConfig): GeneratedFixture[];
//# sourceMappingURL=tournament-wizard.d.ts.map