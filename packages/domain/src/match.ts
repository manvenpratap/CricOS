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

const ALLOWED_MATCH_TRANSITIONS: Record<MatchStatus, MatchStatus[]> = {
  DRAFT: ['SCHEDULED', 'ABANDONED'],
  SCHEDULED: ['TOSS_DONE', 'ABANDONED'],
  TOSS_DONE: ['INNINGS_1', 'ABANDONED'],
  INNINGS_1: ['INNINGS_BREAK', 'ABANDONED'],
  INNINGS_BREAK: ['INNINGS_2', 'ABANDONED'],
  INNINGS_2: ['COMPLETED', 'TIED', 'ABANDONED'],
  COMPLETED: [],
  TIED: [],
  ABANDONED: []
};

export function canTransitionMatchStatus(current: MatchStatus, target: MatchStatus): boolean {
  return ALLOWED_MATCH_TRANSITIONS[current]?.includes(target) ?? false;
}
