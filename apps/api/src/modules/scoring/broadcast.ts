import type { ScoreState, ScoreEvent } from '@cricket-platform/scoring';

export type BroadcastEventType =
  | 'CONNECTED'
  | 'INITIAL_STATE'
  | 'BALL_BOWLED'
  | 'OVER_COMPLETED'
  | 'WICKET_FALLEN'
  | 'INNINGS_CLOSED'
  | 'UNDO_DELIVERY'
  | 'BOWLER_CHANGED'
  | 'STRIKE_SWAPPED'
  | 'HEARTBEAT';

export interface BroadcastMessage {
  type: BroadcastEventType;
  matchId: string;
  timestamp: string;
  state: ScoreState;
  event?: ScoreEvent;
  message?: string;
}

export type SseSubscriber = (data: BroadcastMessage) => void;

export class MatchBroadcastHub {
  private static instance: MatchBroadcastHub;
  private channels: Map<string, Set<SseSubscriber>> = new Map();
  private heartbeats: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {}

  public static getInstance(): MatchBroadcastHub {
    if (!MatchBroadcastHub.instance) {
      MatchBroadcastHub.instance = new MatchBroadcastHub();
    }
    return MatchBroadcastHub.instance;
  }

  public subscribe(matchId: string, subscriber: SseSubscriber): () => void {
    if (!this.channels.has(matchId)) {
      this.channels.set(matchId, new Set());
      this.startHeartbeat(matchId);
    }
    const subscribers = this.channels.get(matchId)!;
    subscribers.add(subscriber);

    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0) {
        this.channels.delete(matchId);
        this.stopHeartbeat(matchId);
      }
    };
  }

  public broadcast(matchId: string, message: BroadcastMessage): void {
    const subscribers = this.channels.get(matchId);
    if (!subscribers || subscribers.size === 0) return;

    for (const sub of subscribers) {
      try {
        sub(message);
      } catch {}
    }
  }

  public getSubscriberCount(matchId: string): number {
    return this.channels.get(matchId)?.size || 0;
  }

  public clearAll(): void {
    for (const timer of this.heartbeats.values()) {
      clearInterval(timer);
    }
    this.heartbeats.clear();
    this.channels.clear();
  }

  private startHeartbeat(matchId: string): void {
    if (this.heartbeats.has(matchId)) return;
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
            state: null as any
          });
        } catch {}
      }
    }, 15000);
    if (timer.unref) timer.unref();
    this.heartbeats.set(matchId, timer);
  }

  private stopHeartbeat(matchId: string): void {
    const timer = this.heartbeats.get(matchId);
    if (timer) {
      clearInterval(timer);
      this.heartbeats.delete(matchId);
    }
  }

  public getTotalSubscribers(): number {
    let total = 0;
    for (const subscribers of this.channels.values()) {
      total += subscribers.size;
    }
    return total;
  }

  public getActiveChannelCount(): number {
    return this.channels.size;
  }

  public closeAllChannels(): void {
    for (const timer of this.heartbeats.values()) {
      clearInterval(timer);
    }
    this.heartbeats.clear();
    this.channels.clear();
  }
}

export const broadcastHub = MatchBroadcastHub.getInstance();
