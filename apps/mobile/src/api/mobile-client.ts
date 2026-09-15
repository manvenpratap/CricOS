export interface MobileSession {
  token: string;
  userId: string;
  role: 'ADMIN' | 'ORGANISER' | 'CAPTAIN' | 'PLAYER' | 'PROVIDER' | 'SCORER';
  expiresAt: number;
}

export interface OfflineQueueItem {
  id: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  payload?: Record<string, unknown>;
  timestamp: number;
  retryCount: number;
}

export interface MobileClientOptions {
  baseUrl?: string;
  session?: MobileSession | null;
  isOnline?: boolean;
  maxRetries?: number;
}

export class CricOSMobileClient {
  private baseUrl: string;
  private session: MobileSession | null = null;
  private isOnline: boolean = true;
  private maxRetries: number = 3;
  private offlineQueue: OfflineQueueItem[] = [];

  constructor(options: MobileClientOptions = {}) {
    this.baseUrl = options.baseUrl || 'http://localhost:3000';
    this.session = options.session || null;
    this.isOnline = options.isOnline !== undefined ? options.isOnline : true;
    this.maxRetries = options.maxRetries || 3;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  public setSession(session: MobileSession | null): void {
    this.session = session;
  }

  public getSession(): MobileSession | null {
    return this.session;
  }

  public clearSession(): void {
    this.session = null;
  }

  public isAuthenticated(): boolean {
    if (!this.session) return false;
    return Date.now() < this.session.expiresAt;
  }

  public setOnlineStatus(online: boolean): void {
    this.isOnline = online;
  }

  public getOnlineStatus(): boolean {
    return this.isOnline;
  }

  public getOfflineQueue(): OfflineQueueItem[] {
    return [...this.offlineQueue];
  }

  public clearOfflineQueue(): void {
    this.offlineQueue = [];
  }

  public queueOfflineAction(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    payload?: Record<string, unknown>
  ): OfflineQueueItem {
    const item: OfflineQueueItem = {
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

  public async syncOfflineQueue(): Promise<{ synced: number; failed: number }> {
    if (!this.isOnline) {
      return { synced: 0, failed: this.offlineQueue.length };
    }

    let synced = 0;
    let failed = 0;
    const remainingQueue: OfflineQueueItem[] = [];

    for (const item of this.offlineQueue) {
      try {
        await this.executeRequest(item.endpoint, item.method, item.payload);
        synced++;
      } catch {
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

  private async executeRequest<T = unknown>(
    endpoint: string,
    method: string,
    body?: Record<string, unknown>
  ): Promise<T> {
    if (!this.isOnline) {
      throw new Error(`Device is offline: queued ${method} ${endpoint}`);
    }

    const headers: Record<string, string> = {
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

      return (await response.json()) as T;
    } catch (err: unknown) {
      if (err instanceof Error && err.message.startsWith('HTTP')) {
        throw err;
      }
      // Transient / network failure: fallback to queueing if mutative
      if (method !== 'GET') {
        this.queueOfflineAction(endpoint, method as any, body);
      }
      throw err;
    }
  }

  // --- Domain-Specific Mobile Action Helpers ---

  public static formatMinorUnits(minorUnits: number, currency: string = 'INR'): string {
    const major = (minorUnits / 100).toFixed(2);
    const parts = major.split('.');
    const integerPart = parts[0] || '0';
    const decimalPart = parts[1] || '00';

    if (currency === 'INR') {
      const lastThree = integerPart.slice(-3);
      const otherNumbers = integerPart.slice(0, -3);
      const formattedInteger =
        otherNumbers !== ''
          ? otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree
          : lastThree;
      return `₹${formattedInteger}.${decimalPart}`;
    }

    return `${currency} ${major}`;
  }

  public async getMatchSummary(matchId: string): Promise<Record<string, unknown>> {
    return this.executeRequest(`/api/v1/scoring/matches/${matchId}`, 'GET');
  }

  public async recordBallEvent(
    matchId: string,
    ballData: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    if (!this.isOnline) {
      this.queueOfflineAction(`/api/v1/scoring/matches/${matchId}/deliveries`, 'POST', ballData);
      return { status: 'QUEUED_OFFLINE', matchId, ballData };
    }
    return this.executeRequest(`/api/v1/scoring/matches/${matchId}/deliveries`, 'POST', ballData);
  }

  public async getMarketplaceSlots(category?: string): Promise<Record<string, unknown>> {
    const query = category ? `?category=${category}` : '';
    return this.executeRequest(`/api/v1/marketplace/slots${query}`, 'GET');
  }

  public async createSlotBooking(
    slotId: string,
    paymentMethod: string = 'MOCK_UPI'
  ): Promise<Record<string, unknown>> {
    const payload = { slotId, paymentMethod };
    if (!this.isOnline) {
      this.queueOfflineAction('/api/v1/checkout/bookings', 'POST', payload);
      return { status: 'QUEUED_OFFLINE', slotId, paymentMethod };
    }
    return this.executeRequest('/api/v1/checkout/bookings', 'POST', payload);
  }
}
