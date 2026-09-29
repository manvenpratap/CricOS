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
export declare function getDefaultNotifications(): PlatformNotification[];
export declare function filterNotifications(notifications: PlatformNotification[], filter: 'ALL' | 'UNREAD' | 'MATCH' | 'FINANCIAL' | 'TRUST'): PlatformNotification[];
export declare function markAllAsRead(notifications: PlatformNotification[]): PlatformNotification[];
export declare function getUnreadCount(notifications: PlatformNotification[]): number;
export declare function renderNotificationItemHtml(item: PlatformNotification): string;
export declare function renderNotificationsDrawerHtml(notifications: PlatformNotification[]): string;
//# sourceMappingURL=notifications-drawer.d.ts.map