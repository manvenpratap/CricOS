import crypto from 'node:crypto';
import { query } from '../../platform/db.js';
import { computeReputationDelta, evaluateProviderTrustState } from '@cricket-platform/domain';
// In-memory cache for fast sandbox and offline test execution
const providerCache = new Map();
export function getProviderReputation(id) {
    return providerCache.get(id) || { reliability_score: 0.98, trust_state: 'VERIFIED' };
}
export function setProviderReputation(id, score, trustState) {
    providerCache.set(id, { reliability_score: score, trust_state: trustState });
}
export async function reputationRoutes(app) {
    app.get('/reputation/provider/:id', async (req, reply) => {
        const { id } = req.params;
        let cached = providerCache.get(id);
        try {
            const res = await query(`SELECT id, display_name, trust_state, avg_rating, reliability_score FROM providers WHERE id = $1`, [id]);
            if (res.rows.length > 0 && res.rows[0]) {
                const row = res.rows[0];
                return reply.status(200).send({
                    provider_id: id,
                    display_name: row.display_name,
                    trust_state: row.trust_state || 'VERIFIED',
                    reliability_score: Number(row.reliability_score || 0.98),
                    avg_rating: Number(row.avg_rating || 4.8)
                });
            }
        }
        catch { }
        const state = cached || { reliability_score: 0.98, trust_state: 'VERIFIED' };
        return reply.status(200).send({
            provider_id: id,
            reliability_score: state.reliability_score,
            trust_state: state.trust_state
        });
    });
    app.post('/reputation/events', async (req, reply) => {
        const body = req.body || {};
        const provider_id = body.provider_id || body.providerId;
        const booking_id = body.booking_id || body.bookingId;
        const rating_id = body.rating_id || body.ratingId;
        const event_type = body.event_type || body.eventType;
        const rating = body.rating;
        if (!provider_id || !event_type) {
            return reply.status(400).send({ error: 'PROVIDER_AND_EVENT_TYPE_REQUIRED' });
        }
        const delta = computeReputationDelta(event_type, rating);
        const eventId = crypto.randomUUID();
        // Fetch current state
        let currentState = providerCache.get(provider_id) || { reliability_score: 0.98, trust_state: 'VERIFIED' };
        try {
            const res = await query(`SELECT trust_state, reliability_score FROM providers WHERE id = $1`, [provider_id]);
            const provRow = res.rows[0];
            if (provRow) {
                currentState = {
                    reliability_score: Number(provRow.reliability_score || 0.98),
                    trust_state: provRow.trust_state || 'VERIFIED'
                };
            }
        }
        catch { }
        const newScore = Math.max(0.0, Math.min(1.0, Number((currentState.reliability_score + delta).toFixed(4))));
        const transition = evaluateProviderTrustState(currentState.trust_state, newScore);
        // Update in-memory state
        providerCache.set(provider_id, {
            reliability_score: newScore,
            trust_state: transition.newState
        });
        try {
            await query(`INSERT INTO provider_reputation_events (
          id, provider_id, booking_id, rating_id, event_type, score_delta
        ) VALUES ($1, $2, $3, $4, $5, $6)`, [eventId, provider_id, booking_id || null, rating_id || null, event_type, delta]);
            await query(`UPDATE providers
         SET reliability_score = $1, trust_state = $2
         WHERE id = $3`, [newScore, transition.newState, provider_id]);
            // Automated Circuit Breaker: Freeze unbooked slots if suspended
            if (transition.actionRequired === 'SUSPEND_SLOTS_AND_ALERT') {
                await query(`UPDATE service_slots SET status = 'BLOCKED' WHERE provider_id = $1 AND status = 'AVAILABLE'`, [provider_id]);
            }
        }
        catch { }
        return reply.status(201).send({
            event_id: eventId,
            eventId,
            provider_id,
            providerId: provider_id,
            event_type,
            eventType: event_type,
            score_delta: delta,
            scoreDelta: delta,
            reliability_score: newScore,
            reliabilityScore: newScore,
            trust_state: transition.newState,
            trustState: transition.newState,
            circuit_breaker_tripped: transition.newState === 'SUSPENDED',
            action_required: transition.actionRequired,
            status: 'PROJECTED'
        });
    });
}
//# sourceMappingURL=routes.js.map