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

export function validateEventWindow(startsAt: Date, endsAt: Date): void {
  if (!(startsAt.getTime() < endsAt.getTime())) {
    throw new Error('EVENT_INVALID_TIME_WINDOW: startsAt must be strictly before endsAt');
  }
}

const ALLOWED_STATUS_TRANSITIONS: Record<EventStatus, EventStatus[]> = {
  DRAFT: ['PUBLISHED', 'CANCELLED'],
  PUBLISHED: ['READY', 'CANCELLED'],
  READY: ['LIVE', 'CANCELLED'],
  LIVE: ['COMPLETED', 'DISPUTED', 'CANCELLED'],
  COMPLETED: ['DISPUTED'],
  CANCELLED: [],
  DISPUTED: ['COMPLETED', 'CANCELLED']
};

export function canTransitionEventStatus(current: EventStatus, target: EventStatus): boolean {
  return ALLOWED_STATUS_TRANSITIONS[current]?.includes(target) ?? false;
}
