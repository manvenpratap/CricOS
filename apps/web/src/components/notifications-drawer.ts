/**
 * Notification Center & Drawer Component (UX-025, COM-001..010)
 * Manages user match alerts, financial escrow updates, and trust notifications.
 */

export interface PlatformNotification {
  id: string;
  category: 'MATCH' | 'FINANCIAL' | 'TRUST' | 'SYSTEM';
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  actionLabel?: string;
  actionTab?: string;
}

export function getDefaultNotifications(): PlatformNotification[] {
  return [
    {
      id: 'notif-1',
      category: 'MATCH',
      title: '🪙 Match Toss Scheduled',
      body: 'Coin toss scheduled in 15 mins for M-101 (Bengaluru Strikers vs Mumbai Blasters) at Chinnaswamy Arena.',
      timestamp: '2 mins ago',
      read: false,
      actionLabel: 'Open Toss Control',
      actionTab: 'scoring',
    },
    {
      id: 'notif-2',
      category: 'FINANCIAL',
      title: '💳 Escrow Deposit Secured',
      body: '₹18,500 held in zero-imbalance escrow for Koramangala Turf Arena — Slot #2 (Confirmed).',
      timestamp: '18 mins ago',
      read: false,
      actionLabel: 'View Booking',
      actionTab: 'marketplace',
    },
    {
      id: 'notif-3',
      category: 'TRUST',
      title: '⭐ Verified Reputation Upgrade',
      body: 'Harbour Cricket Grounds reliability increased to 98.5% (+1.2% bonus from completed fixture).',
      timestamp: '1 hour ago',
      read: false,
      actionLabel: 'Check Standing',
      actionTab: 'incidents',
    },
    {
      id: 'notif-4',
      category: 'MATCH',
      title: '👨‍⚖️ Official Check-In Complete',
      body: 'Umpire Rajesh Sharma (Level-2 MCC Certified) checked in at venue 45 minutes prior to match.',
      timestamp: '2 hours ago',
      read: true,
      actionLabel: 'View Assignment',
      actionTab: 'incidents',
    },
    {
      id: 'notif-5',
      category: 'SYSTEM',
      title: '📱 App Store Listing Ready',
      body: 'CricOS build v1.0.0 passed WWDC 2024 Privacy Manifest and Google Play Target SDK 34 verification.',
      timestamp: '3 hours ago',
      read: true,
    },
  ];
}

export function filterNotifications(
  notifications: PlatformNotification[],
  filter: 'ALL' | 'UNREAD' | 'MATCH' | 'FINANCIAL' | 'TRUST'
): PlatformNotification[] {
  if (filter === 'UNREAD') {
    return notifications.filter((n) => !n.read);
  }
  if (filter === 'ALL') {
    return notifications;
  }
  return notifications.filter((n) => n.category === filter);
}

export function markAllAsRead(notifications: PlatformNotification[]): PlatformNotification[] {
  return notifications.map((n) => ({ ...n, read: true }));
}

export function getUnreadCount(notifications: PlatformNotification[]): number {
  return notifications.filter((n) => !n.read).length;
}

export function renderNotificationItemHtml(item: PlatformNotification): string {
  const categoryColors: Record<string, string> = {
    MATCH: 'var(--cyan)',
    FINANCIAL: 'var(--amber)',
    TRUST: 'var(--turf-emerald)',
    SYSTEM: 'var(--purple)',
  };
  const color = categoryColors[item.category] || 'var(--cyan)';

  return `
    <div class="notification-item ${item.read ? 'read' : 'unread'}" id="notif-item-${item.id}" style="
      padding: 0.85rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      background: ${item.read ? 'transparent' : 'rgba(0, 229, 153, 0.04)'};
      border-left: 3px solid ${item.read ? 'transparent' : color};
      transition: background 0.15s ease;
    ">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; margin-bottom: 0.25rem;">
        <span style="font-weight: 700; font-size: 0.85rem; color: #FFF;">${item.title}</span>
        <span style="font-size: 0.7rem; color: var(--text-muted); white-space: nowrap;">${item.timestamp}</span>
      </div>
      <div style="font-size: 0.78rem; color: var(--text-muted); line-height: 1.35; margin-bottom: 0.45rem;">
        ${item.body}
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 0.65rem; font-weight: 700; color: ${color}; text-transform: uppercase; letter-spacing: 0.05em; background: rgba(255,255,255,0.05); padding: 0.15rem 0.4rem; border-radius: 4px;">
          ${item.category}
        </span>
        ${
          item.actionLabel && item.actionTab
            ? `<button class="btn btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.7rem;" onclick="handleNotificationAction('${item.id}', '${item.actionTab}')" data-tooltip="Navigate to ${item.actionLabel}">
                ${item.actionLabel} &rarr;
               </button>`
            : ''
        }
      </div>
    </div>
  `;
}

export function renderNotificationsDrawerHtml(notifications: PlatformNotification[]): string {
  const unread = getUnreadCount(notifications);
  const itemsHtml = notifications.map(renderNotificationItemHtml).join('');

  return `
    <div id="notificationsDrawerOverlay" class="modal-overlay" onclick="closeNotificationsDrawer()" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 9999;"></div>
    <div id="notificationsDrawer" style="
      position: fixed;
      top: 0;
      right: -380px;
      width: 360px;
      max-width: 90vw;
      height: 100vh;
      background: var(--bg-surface);
      border-left: 1px solid var(--border-subtle);
      box-shadow: -10px 0 30px rgba(0, 0, 0, 0.5);
      z-index: 10000;
      transition: right 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;
    ">
      <div style="padding: 1.25rem 1rem; border-bottom: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span style="font-size: 1.15rem;">🔔</span>
          <span style="font-weight: 700; font-family: var(--font-display); font-size: 1rem;">Notification Center</span>
          <span id="drawerUnreadCountBadge" style="font-size: 0.7rem; background: var(--turf-emerald); color: #04070D; font-weight: 700; padding: 0.1rem 0.45rem; border-radius: 9999px;">${unread} unread</span>
        </div>
        <button onclick="closeNotificationsDrawer()" style="background: none; border: none; color: var(--text-muted); font-size: 1.2rem; cursor: pointer;" data-tooltip="Close notification drawer">&times;</button>
      </div>
      <div style="padding: 0.5rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.2);">
        <div style="display: flex; gap: 0.35rem;">
          <button class="notif-filter-pill active" onclick="filterDrawerNotifications('ALL')" data-tooltip="Show all notifications" style="font-size: 0.7rem; padding: 0.2rem 0.5rem; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.08); color: #FFF; cursor: pointer;">All</button>
          <button class="notif-filter-pill" onclick="filterDrawerNotifications('UNREAD')" data-tooltip="Show unread notifications" style="font-size: 0.7rem; padding: 0.2rem 0.5rem; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: var(--text-muted); cursor: pointer;">Unread</button>
          <button class="notif-filter-pill" onclick="filterDrawerNotifications('MATCH')" data-tooltip="Show match alerts" style="font-size: 0.7rem; padding: 0.2rem 0.5rem; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: var(--text-muted); cursor: pointer;">Match</button>
          <button class="notif-filter-pill" onclick="filterDrawerNotifications('FINANCIAL')" data-tooltip="Show escrow payments" style="font-size: 0.7rem; padding: 0.2rem 0.5rem; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: var(--text-muted); cursor: pointer;">Escrow</button>
        </div>
        <button onclick="markAllDrawerAsRead()" data-tooltip="Mark all notifications as read" style="background: none; border: none; font-size: 0.7rem; color: var(--turf-emerald); cursor: pointer; text-decoration: underline;">Mark read</button>
      </div>
      <div id="notificationItemsList" style="flex: 1; overflow-y: auto;">
        ${itemsHtml}
      </div>
    </div>
  `;
}
