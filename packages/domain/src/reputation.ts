export interface ProviderReputationEvent {
  id: string;
  providerId: string;
  bookingId?: string;
  ratingId?: string;
  eventType: 'MATCH_COMPLETED' | 'NO_SHOW' | 'LATE_CANCELLATION' | 'RATING_RECEIVED' | 'DISPUTE_LOST' | 'DISPUTE_WON';
  scoreDelta: number;
  reliabilityBefore?: number;
  reliabilityAfter?: number;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export function computeReputationDelta(eventType: ProviderReputationEvent['eventType'], rating?: number): number {
  switch (eventType) {
    case 'MATCH_COMPLETED':
      return 0.01;
    case 'RATING_RECEIVED':
      if (rating !== undefined) {
        // rating between 1 and 5
        return (rating - 3) * 0.02;
      }
      return 0;
    case 'NO_SHOW':
      return -0.15;
    case 'LATE_CANCELLATION':
      return -0.08;
    case 'DISPUTE_LOST':
      return -0.10;
    case 'DISPUTE_WON':
      return 0.02;
    default:
      return 0;
  }
}
