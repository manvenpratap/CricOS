export class CricOSMobileClient {
    baseUrl;
    session = null;
    isOnline = true;
    maxRetries = 3;
    offlineQueue = [];
    constructor(options = {}) {
        this.baseUrl = options.baseUrl || 'http://localhost:3000';
        this.session = options.session || null;
        this.isOnline = options.isOnline !== undefined ? options.isOnline : true;
        this.maxRetries = options.maxRetries || 3;
    }
    getBaseUrl() {
        return this.baseUrl;
    }
    setBaseUrl(url) {
        this.baseUrl = url;
    }
    setSession(session) {
        this.session = session;
    }
    getSession() {
        return this.session;
    }
    clearSession() {
        this.session = null;
    }
    isAuthenticated() {
        if (!this.session)
            return false;
        return Date.now() < this.session.expiresAt;
    }
    setOnlineStatus(online) {
        this.isOnline = online;
    }
    getOnlineStatus() {
        return this.isOnline;
    }
    getOfflineQueue() {
        return [...this.offlineQueue];
    }
    clearOfflineQueue() {
        this.offlineQueue = [];
    }
    queueOfflineAction(endpoint, method, payload) {
        const item = {
            id: `offline-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            endpoint,
            method,
            payload,
            timestamp: Date.now(),
            retryCount: 0
        };
        this.offlineQueue.push(item);
        return item;
    }
    async syncOfflineQueue() {
        if (!this.isOnline) {
            return { synced: 0, failed: this.offlineQueue.length };
        }
        let synced = 0;
        let failed = 0;
        const remainingQueue = [];
        for (const item of this.offlineQueue) {
            try {
                await this.executeRequest(item.endpoint, item.method, item.payload);
                synced++;
            }
            catch {
                item.retryCount++;
                if (item.retryCount < this.maxRetries) {
                    remainingQueue.push(item);
                }
                failed++;
            }
        }
        this.offlineQueue = remainingQueue;
        return { synced, failed };
    }
    async executeRequest(endpoint, method, body) {
        if (!this.isOnline) {
            throw new Error(`Device is offline: queued ${method} ${endpoint}`);
        }
        const headers = {
            'Content-Type': 'application/json'
        };
        if (this.session && this.isAuthenticated()) {
            headers['Authorization'] = `Bearer ${this.session.token}`;
        }
        const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
        try {
            const response = await fetch(url, {
                method,
                headers,
                body: body ? JSON.stringify(body) : undefined
            });
            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorBody}`);
            }
            return (await response.json());
        }
        catch (err) {
            if (err instanceof Error && err.message.startsWith('HTTP')) {
                throw err;
            }
            // Transient / network failure: fallback to queueing if mutative
            if (method !== 'GET') {
                this.queueOfflineAction(endpoint, method, body);
            }
            throw err;
        }
    }
    // --- Domain-Specific Mobile Action Helpers ---
    static formatMinorUnits(minorUnits, currency = 'INR') {
        const major = (minorUnits / 100).toFixed(2);
        const parts = major.split('.');
        const integerPart = parts[0] || '0';
        const decimalPart = parts[1] || '00';
        if (currency === 'INR') {
            const lastThree = integerPart.slice(-3);
            const otherNumbers = integerPart.slice(0, -3);
            const formattedInteger = otherNumbers !== ''
                ? otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree
                : lastThree;
            return `₹${formattedInteger}.${decimalPart}`;
        }
        return `${currency} ${major}`;
    }
    async getMatchSummary(matchId) {
        return this.executeRequest(`/api/v1/scoring/matches/${matchId}`, 'GET');
    }
    async recordBallEvent(matchId, ballData) {
        if (!this.isOnline) {
            this.queueOfflineAction(`/api/v1/scoring/matches/${matchId}/deliveries`, 'POST', ballData);
            return { status: 'QUEUED_OFFLINE', matchId, ballData };
        }
        return this.executeRequest(`/api/v1/scoring/matches/${matchId}/deliveries`, 'POST', ballData);
    }
    async getMarketplaceSlots(category) {
        const query = category ? `?category=${category}` : '';
        return this.executeRequest(`/api/v1/marketplace/slots${query}`, 'GET');
    }
    async createSlotBooking(slotId, paymentMethod = 'MOCK_UPI') {
        const payload = { slotId, paymentMethod };
        if (!this.isOnline) {
            this.queueOfflineAction('/api/v1/checkout/bookings', 'POST', payload);
            return { status: 'QUEUED_OFFLINE', slotId, paymentMethod };
        }
        return this.executeRequest('/api/v1/checkout/bookings', 'POST', payload);
    }
}
//# sourceMappingURL=mobile-client.js.map