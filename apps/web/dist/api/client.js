export class CricOSApiClient {
    baseUrl;
    token;
    constructor(options = {}) {
        this.baseUrl = options.baseUrl || 'http://localhost:3000';
        this.token = options.token;
    }
    setToken(token) {
        this.token = token;
    }
    getToken() {
        return this.token;
    }
    getBaseUrl() {
        return this.baseUrl;
    }
    getHeaders(customHeaders = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...customHeaders
        };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
        const headers = this.getHeaders(options.headers);
        try {
            const response = await fetch(url, { ...options, headers });
            let data = null;
            const text = await response.text();
            try {
                data = text ? JSON.parse(text) : null;
            }
            catch {
                data = text;
            }
            return {
                status: response.status,
                ok: response.ok,
                data,
                error: !response.ok ? (data?.error || data?.message || 'REQUEST_FAILED') : undefined
            };
        }
        catch (err) {
            return {
                status: 0,
                ok: false,
                data: null,
                error: err.message || 'NETWORK_ERROR'
            };
        }
    }
    // 1. Telemetry & Probes
    async getLiveness() {
        return this.request('/health/live', { method: 'GET' });
    }
    async getReadiness() {
        return this.request('/health/ready', { method: 'GET' });
    }
    async getMetrics() {
        return this.request('/health/metrics', { method: 'GET' });
    }
    // 2. Marketplace & Commercial
    async getMarketplaceListings() {
        return this.request('/api/v1/marketplace/listings', { method: 'GET' });
    }
    async createHold(slotId, holdMinutes = 15) {
        return this.request('/api/v1/availability/holds', {
            method: 'POST',
            body: JSON.stringify({ slot_id: slotId, hold_duration_minutes: holdMinutes })
        });
    }
    // 3. Scoring & Real-Time Broadcast
    async postScoringEvent(matchId, event) {
        return this.request(`/api/v1/scoring/matches/${matchId}/events`, {
            method: 'POST',
            body: JSON.stringify(event)
        });
    }
    // 4. Reputation, Disputes & Payouts
    async getProviderReputation(providerId) {
        return this.request(`/api/v1/reputation/provider/${providerId}`, { method: 'GET' });
    }
    async postReputationEvent(params) {
        return this.request('/api/v1/reputation/events', {
            method: 'POST',
            body: JSON.stringify(params)
        });
    }
    async resolveDispute(disputeId, params) {
        return this.request(`/api/v1/disputes/${disputeId}/resolve`, {
            method: 'POST',
            body: JSON.stringify(params)
        });
    }
    async disbursePayout(params) {
        return this.request('/api/v1/payouts/disburse', {
            method: 'POST',
            body: JSON.stringify(params)
        });
    }
    /**
     * Currency minor units formatter (integer cents/paise to formatted string)
     */
    static formatMinorUnits(amountMinor, currency = 'INR') {
        const major = (amountMinor / 100).toFixed(2);
        if (currency === 'INR') {
            return `₹${Number(major).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
        }
        return `${currency} ${major}`;
    }
}
//# sourceMappingURL=client.js.map