import type { ScoreState, ScoreEvent } from '@cricket-platform/scoring';
export type BroadcastEventType = 'CONNECTED' | 'INITIAL_STATE' | 'BALL_BOWLED' | 'OVER_COMPLETED' | 'WICKET_FALLEN' | 'INNINGS_CLOSED' | 'UNDO_DELIVERY' | 'BOWLER_CHANGED' | 'STRIKE_SWAPPED' | 'HEARTBEAT';
export interface BroadcastMessage {
    type: BroadcastEventType;
    matchId: string;
    timestamp: string;
    state: ScoreState;
    event?: ScoreEvent;
    message?: string;
}
export type SseSubscriber = (data: BroadcastMessage) => void;
export declare class MatchBroadcastHub {
    private static instance;
    private channels;
    private heartbeats;
    private constructor();
    static getInstance(): MatchBroadcastHub;
    subscribe(matchId: string, subscriber: SseSubscriber): () => void;
    broadcast(matchId: string, message: BroadcastMessage): void;
    getSubscriberCount(matchId: string): number;
    clearAll(): void;
    private startHeartbeat;
    private stopHeartbeat;
    getTotalSubscribers(): number;
    getActiveChannelCount(): number;
    closeAllChannels(): void;
}
export declare const broadcastHub: MatchBroadcastHub;
//# sourceMappingURL=broadcast.d.ts.map