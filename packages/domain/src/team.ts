import { TeamRole } from '@cricket-platform/contracts';

export interface Team {
  id: string;
  name: string;
  ownerUserId: string;
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: Date;
}

export interface TeamMembership {
  id: string;
  teamId: string;
  userId: string;
  role: TeamRole;
  joinedAt: Date;
  leftAt?: Date;
}

export function validateTeamName(name: string): void {
  if (!name || name.trim().length < 2) {
    throw new Error('TEAM_NAME_TOO_SHORT: Team name must be at least 2 characters');
  }
  if (name.length > 80) {
    throw new Error('TEAM_NAME_TOO_LONG: Team name cannot exceed 80 characters');
  }
}
