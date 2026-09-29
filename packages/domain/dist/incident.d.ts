import { IncidentStatus } from '@cricket-platform/contracts';
export interface ServiceIncident {
    id: string;
    bookingId: string;
    type: 'PROVIDER_NO_SHOW' | 'WEATHER' | 'GROUND_UNFIT' | 'DISPUTE' | 'CANCELLATION' | 'OTHER';
    status: IncidentStatus;
    openedBy?: string;
    reason: string;
    metadata: Record<string, unknown>;
    createdAt: Date;
    resolvedAt?: Date;
}
export interface ReplacementProposal {
    id: string;
    incidentId: string;
    originalBookingId: string;
    proposedProviderId: string;
    proposedSlotId: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
    priceDeltaMinor: number;
    currency: string;
    createdAt: Date;
}
//# sourceMappingURL=incident.d.ts.map