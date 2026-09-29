import { MobileUserRole } from './AuthScreen.js';
export interface CareerBattingStats {
    matches: number;
    innings: number;
    runs: number;
    ballsFaced: number;
    notOuts: number;
    highestScore: number;
    centuries: number;
    fifties: number;
    fours: number;
    sixes: number;
}
export interface CareerBowlingStats {
    matches: number;
    overs: number;
    maidens: number;
    runsConceded: number;
    wickets: number;
    bestBowling: string;
}
export interface PlayerTournamentLog {
    tournamentName: string;
    year: number;
    matches: number;
    runs: number;
    average: number;
    strikeRate: number;
    wickets: number;
}
export interface PlayerAchievementBadge {
    id: string;
    title: string;
    icon: string;
    rarity: 'COMMON' | 'RARE' | 'LEGENDARY';
    description: string;
}
export interface PlayerProfileData {
    id: string;
    name: string;
    role: 'BATTER' | 'BOWLER' | 'ALL_ROUNDER' | 'WICKET_KEEPER';
    teamName: string;
    jerseyNumber: number;
    persona: MobileUserRole;
    bio?: string;
    stance?: 'RHB' | 'LHB';
    bowlingStyle?: string;
    batting: CareerBattingStats;
    bowling: CareerBowlingStats;
    tournaments: PlayerTournamentLog[];
    badges: PlayerAchievementBadge[];
}
export declare class ProfileScreenController {
    private profile;
    constructor(profile?: Partial<PlayerProfileData>);
    getTournaments(): PlayerTournamentLog[];
    getBadges(): PlayerAchievementBadge[];
    addBadge(badge: PlayerAchievementBadge): void;
    addTournamentLog(log: PlayerTournamentLog): void;
    getProfile(): PlayerProfileData;
    updateProfile(updates: Partial<PlayerProfileData>): void;
    getBattingAverage(): string;
    getBattingStrikeRate(): string;
    getBowlingEconomy(): string;
    getBowlingAverage(): string;
    renderMobileHtml(): string;
}
//# sourceMappingURL=ProfileScreen.d.ts.map