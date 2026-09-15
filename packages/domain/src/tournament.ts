import { TournamentFormat, TournamentStatus } from '@cricket-platform/contracts';

export interface Tournament {
  id: string;
  ownerUserId: string;
  name: string;
  format: TournamentFormat;
  teamCount: number;
  status: TournamentStatus;
  startDate: Date;
  endDate: Date;
}

export interface Fixture {
  id: string;
  tournamentId: string;
  eventId?: string;
  homeTeamId: string;
  awayTeamId: string;
  roundNumber: number;
  scheduledAt: Date;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'POSTPONED' | 'CANCELLED';
}

export interface Standing {
  teamId: string;
  played: number;
  won: number;
  lost: number;
  tied: number;
  noResult: number;
  points: number;
  netRunRate: number;
}

export function calculatePoints(won: number, tied: number, noResult: number): number {
  return (won * 2) + (tied * 1) + (noResult * 1);
}
