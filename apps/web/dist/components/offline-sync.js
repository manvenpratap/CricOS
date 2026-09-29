/**
 * CricOS Offline Scoring & Outbox Sync Engine
 * Caches match deliveries when offline and flushes sequentially upon reconnection.
 */
export class OfflineDeliveryQueue {
    queue = [];
    storageKey;
    isSyncing = false;
    constructor(matchId = 'default') {
        this.storageKey = `cricos_offline_queue_${matchId}`;
        this.loadFromStorage();
    }
    loadFromStorage() {
        if (typeof localStorage === 'undefined')
            return;
        try {
            const raw = localStorage.getItem(this.storageKey);
            if (raw) {
                this.queue = JSON.parse(raw);
            }
        }
        catch {
            this.queue = [];
        }
    }
    persist() {
        if (typeof localStorage === 'undefined')
            return;
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.queue));
        }
        catch {
            // Storage quota exceeded or unavailable
        }
    }
    enqueue(delivery) {
        const item = {
            ...delivery,
            id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            timestamp: Date.now(),
            retryCount: 0
        };
        this.queue.push(item);
        this.persist();
        return item;
    }
    getQueue() {
        return [...this.queue];
    }
    getPendingCount() {
        return this.queue.length;
    }
    clear() {
        this.queue = [];
        this.persist();
    }
    async flush(sender) {
        if (this.isSyncing || this.queue.length === 0) {
            return { sent: 0, failed: 0 };
        }
        this.isSyncing = true;
        let sent = 0;
        let failed = 0;
        try {
            while (this.queue.length > 0) {
                const item = this.queue[0];
                try {
                    const success = await sender(item);
                    if (success) {
                        this.queue.shift();
                        this.persist();
                        sent++;
                    }
                    else {
                        item.retryCount++;
                        this.persist();
                        failed++;
                        break; // Pause flushing on transport failure
                    }
                }
                catch {
                    item.retryCount++;
                    this.persist();
                    failed++;
                    break;
                }
            }
        }
        finally {
            this.isSyncing = false;
        }
        return { sent, failed };
    }
}
//# sourceMappingURL=offline-sync.js.map