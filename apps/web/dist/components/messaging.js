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
/**
 * Generates a unique message ID.
 */
export function generateMessageId() {
    return `MSG-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`.toUpperCase();
}
/**
 * Generates a unique thread ID.
 */
export function generateThreadId(context, contextId) {
    return `THR-${context}-${contextId}`.toUpperCase();
}
/**
 * Creates a new message in a thread.
 */
export function createMessage(threadId, senderId, senderName, senderRole, content, type = 'USER', attachments = [], quickAction) {
    return {
        id: generateMessageId(),
        threadId,
        senderId,
        senderName,
        senderRole,
        type,
        content,
        attachments,
        quickAction,
        timestamp: new Date().toISOString(),
        read: true, // sender always reads their own
        synced: false
    };
}
/**
 * Creates a system-generated message (clearly identified per FSD §45).
 */
export function createSystemMessage(threadId, content) {
    return createMessage(threadId, 'SYSTEM', 'CricOS System', 'SYSTEM', content, 'SYSTEM');
}
/**
 * Creates a structured quote message with pricing details.
 */
export function createQuoteMessage(threadId, senderId, senderName, serviceLabel, priceMinor, validUntil) {
    const formattedPrice = `₹${(priceMinor / 100).toLocaleString('en-IN')}`;
    return createMessage(threadId, senderId, senderName, 'PROVIDER', `Quote for ${serviceLabel}: ${formattedPrice} (valid until ${new Date(validUntil).toLocaleDateString('en-IN')})`, 'QUOTE', [{
            type: 'QUOTE_DETAIL',
            name: serviceLabel,
            metadata: {
                priceMinor,
                validUntil,
                serviceLabel
            }
        }], 'SEND_QUOTE');
}
/**
 * Calculates unread count for a thread from a given user's perspective.
 */
export function calculateUnreadCount(thread, userId) {
    return thread.messages.filter(m => !m.read && m.senderId !== userId).length;
}
/**
 * Returns quick action button configurations per FSD §45.
 */
export function getQuickActions(context) {
    const base = [
        { action: 'ACCEPT', label: 'Accept', icon: '✅', color: '#00E599' },
        { action: 'DECLINE', label: 'Decline', icon: '❌', color: '#FF3366' },
        { action: 'REQUEST_CHANGE', label: 'Request Change', icon: '✏️', color: '#FFB800' }
    ];
    if (context === 'BOOKING' || context === 'LISTING') {
        base.unshift({ action: 'SEND_QUOTE', label: 'Send Quote', icon: '💰', color: '#00D2FF' });
    }
    base.push({ action: 'UPLOAD_DOCUMENT', label: 'Upload', icon: '📎', color: '#94A3B8' }, { action: 'SHARE_LOCATION', label: 'Location', icon: '📍', color: '#A855F7' });
    return base;
}
/**
 * Persists message threads to localStorage (offline-first pattern).
 */
export function persistThreadsToStorage(threads) {
    if (typeof localStorage === 'undefined')
        return;
    localStorage.setItem('cricos_message_threads', JSON.stringify(threads));
}
/**
 * Loads message threads from localStorage.
 */
export function loadThreadsFromStorage() {
    if (typeof localStorage === 'undefined')
        return [];
    const data = localStorage.getItem('cricos_message_threads');
    if (!data)
        return [];
    try {
        return JSON.parse(data);
    }
    catch {
        return [];
    }
}
/**
 * Gets pending (unsynced) messages for server upload.
 */
export function getPendingMessages(threads) {
    return threads.flatMap(t => t.messages.filter(m => !m.synced));
}
/**
 * Renders a single message bubble HTML.
 */
export function renderMessageBubbleHtml(msg, isOwnMessage) {
    const alignment = isOwnMessage ? 'msg-own' : 'msg-other';
    const systemClass = msg.type === 'SYSTEM' ? 'msg-system' : '';
    const quoteClass = msg.type === 'QUOTE' ? 'msg-quote' : '';
    const time = new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const syncIcon = msg.synced ? '' : '<span class="msg-unsync" data-tooltip="Not yet synced to server">⏳</span>';
    let attachmentHtml = '';
    if (msg.attachments.length > 0) {
        const items = msg.attachments.map(a => {
            if (a.type === 'QUOTE_DETAIL' && a.metadata) {
                const price = `₹${(a.metadata['priceMinor'] / 100).toLocaleString('en-IN')}`;
                return `<div class="msg-quote-card" data-tooltip="Quote: ${a.name} — ${price}">
          <div class="quote-service">${a.name}</div>
          <div class="quote-price">${price}</div>
          <div class="quote-actions">
            <button class="quote-accept-btn" data-tooltip="Accept this quote">✅ Accept</button>
            <button class="quote-decline-btn" data-tooltip="Decline this quote">❌ Decline</button>
          </div>
        </div>`;
            }
            return `<div class="msg-attachment" data-tooltip="Attachment: ${a.name}">📎 ${a.name}</div>`;
        }).join('');
        attachmentHtml = `<div class="msg-attachments">${items}</div>`;
    }
    return `<div class="msg-bubble ${alignment} ${systemClass} ${quoteClass}" data-tooltip="${msg.senderName} • ${time}">
    ${!isOwnMessage && msg.type !== 'SYSTEM' ? `<div class="msg-sender">${msg.senderName} <span class="msg-role">${msg.senderRole}</span></div>` : ''}
    <div class="msg-content">${msg.content}</div>
    ${attachmentHtml}
    <div class="msg-meta">${time} ${syncIcon}</div>
  </div>`;
}
/**
 * Renders the full messaging thread panel HTML.
 */
export function renderThreadPanelHtml(thread, currentUserId) {
    const messages = thread.messages.map(m => renderMessageBubbleHtml(m, m.senderId === currentUserId)).join('');
    const participantBadges = thread.participants.map(p => `<span class="thread-participant" data-tooltip="${p.name} (${p.role})">${p.name.split(' ')[0]}</span>`).join('');
    const quickActions = getQuickActions(thread.context).map(a => `<button class="qa-btn" style="color:${a.color}" onclick="sendQuickAction('${thread.threadId}','${a.action}')" data-tooltip="${a.label}">${a.icon} ${a.label}</button>`).join('');
    return `<div class="thread-panel">
    <div class="thread-header" data-tooltip="Thread: ${thread.contextLabel}">
      <div class="thread-context">${thread.contextLabel}</div>
      <div class="thread-participants">${participantBadges}</div>
      <span class="thread-status" data-tooltip="Thread status: ${thread.status}">${thread.status}</span>
    </div>
    <div class="thread-messages">${messages}</div>
    <div class="thread-quick-actions">${quickActions}</div>
    <div class="thread-input">
      <input type="text" class="msg-input" placeholder="Type a message..." data-tooltip="Press Enter to send" />
      <button class="msg-send-btn" data-tooltip="Send message">Send</button>
    </div>
  </div>`;
}
/**
 * Creates sample messaging threads for demonstration.
 */
export function createSampleThreads() {
    const now = new Date().toISOString();
    const thread1 = {
        threadId: 'THR-BOOKING-BK001',
        context: 'BOOKING',
        contextId: 'BK-001',
        contextLabel: 'Umpire Booking — BLR T20 League Match 7',
        participants: [
            { id: 'cap-001', name: 'Virat K.', role: 'CAPTAIN' },
            { id: 'ump-001', name: 'Ravi Kumar', role: 'UMPIRE' }
        ],
        messages: [
            { ...createSystemMessage('THR-BOOKING-BK001', 'Booking request created for BLR T20 League Match 7'), synced: true, read: true },
            { ...createMessage('THR-BOOKING-BK001', 'cap-001', 'Virat K.', 'CAPTAIN', 'Hi Ravi, we need an umpire for our T20 match this Saturday at Greenfield CC, 14:00–18:00. Are you available?'), synced: true, read: true },
            { ...createMessage('THR-BOOKING-BK001', 'ump-001', 'Ravi Kumar', 'UMPIRE', 'Yes, I am available. My standard rate applies.'), synced: true, read: true },
            { ...createQuoteMessage('THR-BOOKING-BK001', 'ump-001', 'Ravi Kumar', 'T20 Umpiring (4 hours)', 150000, new Date(Date.now() + 86400_000 * 3).toISOString()), synced: true, read: false }
        ],
        unreadCount: 1,
        lastActivity: now,
        status: 'ACTIVE'
    };
    return [thread1];
}
//# sourceMappingURL=messaging.js.map