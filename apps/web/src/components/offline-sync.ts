/**
 * CricOS Offline Scoring & Outbox Sync Engine
 * Caches match deliveries when offline and flushes sequentially upon reconnection.
 */

export interface QueuedDelivery {
  id: string;
  clientEventId: string;
  matchId: string;
  sequence: number;
  batRuns: number;
  extraRuns: number;
  extraType: string;
  legalBall: boolean;
  isWicket: boolean;
  shotZone?: string;
  timestamp: number;
  retryCount: number;
}

export class OfflineDeliveryQueue {
  private queue: QueuedDelivery[] = [];
  private readonly storageKey: string;
  private isSyncing = false;

  constructor(matchId: string = 'default') {
    this.storageKey = `cricos_offline_queue_${matchId}`;
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) {
        this.queue = JSON.parse(raw);
      }
    } catch {
      this.queue = [];
    }
  }

  private persist(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.queue));
    } catch {
      // Storage quota exceeded or unavailable
    }
  }

  public enqueue(delivery: Omit<QueuedDelivery, 'id' | 'timestamp' | 'retryCount'>): QueuedDelivery {
    const item: QueuedDelivery = {
      ...delivery,
      id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
      retryCount: 0
    };
    this.queue.push(item);
    this.persist();
    return item;
  }

  public getQueue(): QueuedDelivery[] {
    return [...this.queue];
  }

  public getPendingCount(): number {
    return this.queue.length;
  }

  public clear(): void {
    this.queue = [];
    this.persist();
  }

  public async flush(
    sender: (delivery: QueuedDelivery) => Promise<boolean>
  ): Promise<{ sent: number; failed: number }> {
    if (this.isSyncing || this.queue.length === 0) {
      return { sent: 0, failed: 0 };
    }

    this.isSyncing = true;
    let sent = 0;
    let failed = 0;

    try {
      while (this.queue.length > 0) {
        const item = this.queue[0]!;
        try {
          const success = await sender(item);
          if (success) {
            this.queue.shift();
            this.persist();
            sent++;
          } else {
            item.retryCount++;
            this.persist();
            failed++;
            break; // Pause flushing on transport failure
          }
        } catch {
          item.retryCount++;
          this.persist();
          failed++;
          break;
        }
      }
    } finally {
      this.isSyncing = false;
    }

    return { sent, failed };
  }
}
