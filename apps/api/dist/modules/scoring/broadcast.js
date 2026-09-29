export class MatchBroadcastHub {
    static instance;
    channels = new Map();
    heartbeats = new Map();
    constructor() { }
    static getInstance() {
        if (!MatchBroadcastHub.instance) {
            MatchBroadcastHub.instance = new MatchBroadcastHub();
        }
        return MatchBroadcastHub.instance;
    }
    subscribe(matchId, subscriber) {
        if (!this.channels.has(matchId)) {
            this.channels.set(matchId, new Set());
            this.startHeartbeat(matchId);
        }
        const subscribers = this.channels.get(matchId);
        subscribers.add(subscriber);
        return () => {
            subscribers.delete(subscriber);
            if (subscribers.size === 0) {
                this.channels.delete(matchId);
                this.stopHeartbeat(matchId);
            }
        };
    }
    broadcast(matchId, message) {
        const subscribers = this.channels.get(matchId);
        if (!subscribers || subscribers.size === 0)
            return;
        for (const sub of subscribers) {
            try {
                sub(message);
            }
            catch { }
        }
    }
    getSubscriberCount(matchId) {
        return this.channels.get(matchId)?.size || 0;
    }
    clearAll() {
        for (const timer of this.heartbeats.values()) {
            clearInterval(timer);
        }
        this.heartbeats.clear();
        this.channels.clear();
    }
    startHeartbeat(matchId) {
        if (this.heartbeats.has(matchId))
            return;
        const timer = setInterval(() => {
            const subscribers = this.channels.get(matchId);
            if (!subscribers || subscribers.size === 0) {
                this.stopHeartbeat(matchId);
                return;
            }
            for (const sub of subscribers) {
                try {
                    sub({
                        type: 'HEARTBEAT',
                        matchId,
                        timestamp: new Date().toISOString(),
                        state: null
                    });
                }
                catch { }
            }
        }, 15000);
        if (timer.unref)
            timer.unref();
        this.heartbeats.set(matchId, timer);
    }
    stopHeartbeat(matchId) {
        const timer = this.heartbeats.get(matchId);
        if (timer) {
            clearInterval(timer);
            this.heartbeats.delete(matchId);
        }
    }
    getTotalSubscribers() {
        let total = 0;
        for (const subscribers of this.channels.values()) {
            total += subscribers.size;
        }
        return total;
    }
    getActiveChannelCount() {
        return this.channels.size;
    }
    closeAllChannels() {
        for (const timer of this.heartbeats.values()) {
            clearInterval(timer);
        }
        this.heartbeats.clear();
        this.channels.clear();
    }
}
export const broadcastHub = MatchBroadcastHub.getInstance();
//# sourceMappingURL=broadcast.js.map