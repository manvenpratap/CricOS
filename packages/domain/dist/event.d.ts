import { EventStatus } from '@cricket-platform/contracts';
export interface Event {
    id: string;
    type: 'MATCH';
    title: string;
    status: EventStatus;
    ownerUserId: string;
    startsAt: Date;
    endsAt: Date;
    timezone: string;
    venueId?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare function validateEventWindow(startsAt: Date, endsAt: Date): void;
export declare function canTransitionEventStatus(current: EventStatus, target: EventStatus): boolean;
//# sourceMappingURL=event.d.ts.map