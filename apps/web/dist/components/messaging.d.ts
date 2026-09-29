/**
 * apps/web/src/components/messaging.ts
 *
 * Contextual Messaging & Negotiation System
 * Derived from Archive Specifications:
 * - 01_Functional_Specification_v3 (§45: Messaging & Negotiation)
 * - 02_Product_Blueprint_v1 (§20: Notifications & Workflow Automation)
 * - 03_UX_Blueprint_v2 (§14: Notifications, §13: State & Interaction Rules)
 *
 * Thread-based messaging attached to bookings/events/listings
 * with structured quick actions (Send Quote, Accept, Decline).
 * Offline-first persistence in localStorage with server sync.
 */
export type MessageType = 'USER' | 'SYSTEM' | 'QUOTE' | 'ACTION';
export type QuickAction = 'SEND_QUOTE' | 'ACCEPT' | 'DECLINE' | 'REQUEST_CHANGE' | 'UPLOAD_DOCUMENT' | 'SHARE_LOCATION';
export interface MessageAttachment {
    type: 'DOCUMENT' | 'IMAGE' | 'LOCATION' | 'QUOTE_DETAIL';
    name: string;
    url?: string;
    metadata?: Record<string, string | number>;
}
export interface Message {
    id: string;
    threadId: string;
    senderId: string;
    senderName: string;
    senderRole: string;
    type: MessageType;
    content: string;
    attachments: MessageAttachment[];
    quickAction?: QuickAction;
    timestamp: string;
    read: boolean;
    synced: boolean;
}
export type ThreadContext = 'BOOKING' | 'EVENT' | 'LISTING' | 'DISPUTE' | 'TOURNAMENT';
export interface MessageThread {
    threadId: string;
    context: ThreadContext;
    contextId: string;
    contextLabel: string;
    participants: Array<{
        id: string;
        name: string;
        role: string;
    }>;
    messages: Message[];
    unreadCount: number;
    lastActivity: string;
    status: 'ACTIVE' | 'RESOLVED' | 'ARCHIVED';
}
/**
 * Generates a unique message ID.
 */
export declare function generateMessageId(): string;
/**
 * Generates a unique thread ID.
 */
export declare function generateThreadId(context: ThreadContext, contextId: string): string;
/**
 * Creates a new message in a thread.
 */
export declare function createMessage(threadId: string, senderId: string, senderName: string, senderRole: string, content: string, type?: MessageType, attachments?: MessageAttachment[], quickAction?: QuickAction): Message;
/**
 * Creates a system-generated message (clearly identified per FSD §45).
 */
export declare function createSystemMessage(threadId: string, content: string): Message;
/**
 * Creates a structured quote message with pricing details.
 */
export declare function createQuoteMessage(threadId: string, senderId: string, senderName: string, serviceLabel: string, priceMinor: number, validUntil: string): Message;
/**
 * Calculates unread count for a thread from a given user's perspective.
 */
export declare function calculateUnreadCount(thread: MessageThread, userId: string): number;
/**
 * Returns quick action button configurations per FSD §45.
 */
export declare function getQuickActions(context: ThreadContext): Array<{
    action: QuickAction;
    label: string;
    icon: string;
    color: string;
}>;
/**
 * Persists message threads to localStorage (offline-first pattern).
 */
export declare function persistThreadsToStorage(threads: MessageThread[]): void;
/**
 * Loads message threads from localStorage.
 */
export declare function loadThreadsFromStorage(): MessageThread[];
/**
 * Gets pending (unsynced) messages for server upload.
 */
export declare function getPendingMessages(threads: MessageThread[]): Message[];
/**
 * Renders a single message bubble HTML.
 */
export declare function renderMessageBubbleHtml(msg: Message, isOwnMessage: boolean): string;
/**
 * Renders the full messaging thread panel HTML.
 */
export declare function renderThreadPanelHtml(thread: MessageThread, currentUserId: string): string;
/**
 * Creates sample messaging threads for demonstration.
 */
export declare function createSampleThreads(): MessageThread[];
//# sourceMappingURL=messaging.d.ts.map