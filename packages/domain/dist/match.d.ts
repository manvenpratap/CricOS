import { MatchFormat, MatchStatus } from '@cricket-platform/contracts';
export interface Match {
    id: string;
    eventId: string;
    rulesetVersion: string;
    format: MatchFormat;
    status: MatchStatus;
    tossWinnerTeamId?: string;
    tossDecision?: 'BAT' | 'BOWL';
}
export interface MatchTeam {
    matchId: string;
    teamId: string;
    side: 'HOME' | 'AWAY';
}
export declare function canTransitionMatchStatus(current: MatchStatus, target: MatchStatus): boolean;
//# sourceMappingURL=match.d.ts.map