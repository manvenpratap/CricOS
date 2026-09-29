/**
 * apps/web/src/components/player-career.ts
 *
 * Longitudinal Multi-Tournament Player Career Analytics & Achievement Badges
 * Aggregates career statistics across multiple seasons, formats, and tournaments,
 * rendering milestone badges and performance splits.
 */
export interface TournamentStatRecord {
    tournamentId: string;
    tournamentName: string;
    year: number;
    format: 'T20' | 'ODI' | 'TEST';
    matches: number;
    runs: number;
    highScore: number;
    average: number;
    strikeRate: number;
    centuries: number;
    fifties: number;
    wickets: number;
    economy: number;
}
export interface AchievementBadge {
    id: string;
    title: string;
    category: 'MILESTONE' | 'IMPACT' | 'CAPTAINCY' | 'FIELDING';
    icon: string;
    description: string;
    unlockedAt: string;
    rarity: 'COMMON' | 'RARE' | 'LEGENDARY';
}
export interface CareerSummary {
    playerId: string;
    playerName: string;
    totalMatches: number;
    totalInnings: number;
    totalRuns: number;
    highestScore: number;
    careerBattingAverage: number;
    careerStrikeRate: number;
    centuries: number;
    fifties: number;
    totalFours: number;
    totalSixes: number;
    totalWickets: number;
    careerBowlingAverage: number;
    careerEconomy: number;
    fiveWickets: number;
    tournaments: TournamentStatRecord[];
    badges: AchievementBadge[];
}
export declare class PlayerCareerComponent {
    private careerData;
    constructor(customData?: Partial<CareerSummary>);
    getDefaultTournaments(): TournamentStatRecord[];
    getDefaultBadges(): AchievementBadge[];
    getCareerSummary(): CareerSummary;
    getTournaments(): TournamentStatRecord[];
    getBadges(): AchievementBadge[];
    addTournamentStat(stat: TournamentStatRecord): void;
    addBadge(badge: AchievementBadge): void;
    renderHtml(): string;
}
//# sourceMappingURL=player-career.d.ts.map