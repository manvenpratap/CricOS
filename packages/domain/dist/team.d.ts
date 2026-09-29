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
export declare function validateTeamName(name: string): void;
//# sourceMappingURL=team.d.ts.map