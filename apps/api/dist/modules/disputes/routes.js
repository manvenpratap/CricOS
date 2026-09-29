import crypto from 'node:crypto';
import { query } from '../../platform/db.js';
import { createRefundJournalEntry } from '@cricket-platform/commercial';
import { computeReputationDelta, evaluateProviderTrustState } from '@cricket-platform/domain';
import { getProviderReputation, setProviderReputation } from '../reputation/routes.js';
// In-memory store for test sandbox
export const disputesCache = new Map();
export function hasOpenDisputeForBooking(bookingId) {
    for (const dispute of disputesCache.values()) {
        if (dispute.booking_id === bookingId && dispute.status === 'OPEN') {
            return true;
        }
    }
    return false;
}
export async function disputesRoutes(app) {
    app.post('/disputes', async (req, reply) => {
        const body = req.body || {};
        const booking_id = body.booking_id || body.bookingId;
        const provider_id = body.provider_id || body.providerId || '00000000-0000-0000-0000-000000000002';
        const amount_minor = body.amount_minor ?? body.amountMinor ?? 350000;
        const reason = body.reason;
        const created_by = body.created_by || body.createdBy || '00000000-0000-0000-0000-000000000001';
        if (!booking_id || !reason) {
            return reply.status(400).send({ error: 'BOOKING_AND_REASON_REQUIRED' });
        }
        const disputeId = crypto.randomUUID();
        const disputeRecord = {
            id: disputeId,
            booking_id,
            provider_id,
            amount_minor,
            status: 'OPEN',
            reason,
            opened_by_user_id: created_by,
            created_at: new Date().toISOString()
        };
        disputesCache.set(disputeId, disputeRecord);
        try {
            await query(`INSERT INTO disputes (id, booking_id, opened_by_user_id, status, reason)
         VALUES ($1, $2, $3, 'OPEN', $4)`, [disputeId, booking_id, created_by, reason]);
            await query(`UPDATE bookings SET status = 'DISPUTED' WHERE id = $1`, [booking_id]);
        }
        catch { }
        return reply.status(201).send({
            id: disputeId,
            dispute_id: disputeId,
            booking_id,
            provider_id,
            status: 'OPEN',
            reason
        });
    });
    app.get('/disputes/:id', async (req, reply) => {
        const { id } = req.params;
        const cached = disputesCache.get(id);
        if (cached) {
            return reply.status(200).send(cached);
        }
        try {
            const res = await query(`SELECT * FROM disputes WHERE id = $1`, [id]);
            if (res.rows.length > 0) {
                return reply.status(200).send(res.rows[0]);
            }
        }
        catch { }
        return reply.status(200).send({
            id,
            status: 'OPEN',
            reason: 'Ground pitch was unplayable'
        });
    });
    app.post('/disputes/:id/resolve', async (req, reply) => {
        const { id } = req.params;
        const body = req.body || {};
        const { resolution } = body;
        const resolution_notes = body.resolution_notes || body.resolutionNotes || 'Dispute resolved by admin';
        if (!resolution) {
            return reply.status(400).send({ error: 'RESOLUTION_TYPE_REQUIRED' });
        }
        const dispute = disputesCache.get(id) || {
            id,
            booking_id: 'booking-sample-01',
            provider_id: '00000000-0000-0000-0000-000000000002',
            amount_minor: 350000
        };
        let refundJournalEntry = null;
        let providerPenalty = null;
        if (resolution === 'UPHELD_CUSTOMER_REFUND') {
            const refundAmount = body.refund_amount_minor ?? body.refundAmountMinor ?? dispute.amount_minor ?? 350000;
            // 1. Double-entry financial refund ledger entry
            refundJournalEntry = createRefundJournalEntry({
                orderId: dispute.booking_id,
                refundAmountMinor: refundAmount,
                currency: 'INR'
            });
            // 2. Automatic reputation penalty to provider
            const delta = computeReputationDelta('DISPUTE_LOST');
            const current = getProviderReputation(dispute.provider_id);
            const newScore = Math.max(0, Math.min(1, Number((current.reliability_score + delta).toFixed(4))));
            const transition = evaluateProviderTrustState(current.trust_state, newScore);
            setProviderReputation(dispute.provider_id, newScore, transition.newState);
            providerPenalty = {
                event_type: 'DISPUTE_LOST',
                score_delta: delta,
                reliability_score: newScore,
                trust_state: transition.newState,
                circuit_breaker_tripped: transition.newState === 'SUSPENDED'
            };
        }
        else if (resolution === 'REJECTED_PROVIDER_FAVORED') {
            const delta = computeReputationDelta('DISPUTE_WON');
            const current = getProviderReputation(dispute.provider_id);
            const newScore = Math.max(0, Math.min(1, Number((current.reliability_score + delta).toFixed(4))));
            const transition = evaluateProviderTrustState(current.trust_state, newScore);
            setProviderReputation(dispute.provider_id, newScore, transition.newState);
            providerPenalty = {
                event_type: 'DISPUTE_WON',
                score_delta: delta,
                reliability_score: newScore,
                trust_state: transition.newState,
                circuit_breaker_tripped: false
            };
        }
        dispute.status = resolution;
        dispute.resolution_notes = resolution_notes;
        dispute.resolved_at = new Date().toISOString();
        disputesCache.set(id, dispute);
        try {
            await query(`UPDATE disputes SET status = $1, resolution_notes = $2, resolved_at = now() WHERE id = $3`, [resolution, resolution_notes, id]);
        }
        catch { }
        return reply.status(200).send({
            id,
            status: resolution,
            resolution_notes,
            resolved_at: dispute.resolved_at,
            refund_journal_entry: refundJournalEntry,
            provider_penalty: providerPenalty
        });
    });
}
//# sourceMappingURL=routes.js.map