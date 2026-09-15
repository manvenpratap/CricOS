export interface ApiClientOptions {
  baseUrl?: string;
  token?: string;
}

export interface ApiResponse<T = any> {
  status: number;
  ok: boolean;
  data: T;
  error?: string;
}

export class CricOSApiClient {
  private baseUrl: string;
  private token?: string;

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = options.baseUrl || 'http://localhost:3000';
    this.token = options.token;
  }

  public setToken(token: string): void {
    this.token = token;
  }

  public getToken(): string | undefined {
    return this.token;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  private getHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const headers = this.getHeaders(options.headers as Record<string, string>);

    try {
      const response = await fetch(url, { ...options, headers });
      let data: any = null;
      const text = await response.text();
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = text;
      }

      return {
        status: response.status,
        ok: response.ok,
        data,
        error: !response.ok ? (data?.error || data?.message || 'REQUEST_FAILED') : undefined
      };
    } catch (err: any) {
      return {
        status: 0,
        ok: false,
        data: null as any,
        error: err.message || 'NETWORK_ERROR'
      };
    }
  }

  // 1. Telemetry & Probes
  public async getLiveness(): Promise<ApiResponse> {
    return this.request('/health/live', { method: 'GET' });
  }

  public async getReadiness(): Promise<ApiResponse> {
    return this.request('/health/ready', { method: 'GET' });
  }

  public async getMetrics(): Promise<ApiResponse> {
    return this.request('/health/metrics', { method: 'GET' });
  }

  // 2. Marketplace & Commercial
  public async getMarketplaceListings(): Promise<ApiResponse> {
    return this.request('/api/v1/marketplace/listings', { method: 'GET' });
  }

  public async createHold(slotId: string, holdMinutes: number = 15): Promise<ApiResponse> {
    return this.request('/api/v1/availability/holds', {
      method: 'POST',
      body: JSON.stringify({ slot_id: slotId, hold_duration_minutes: holdMinutes })
    });
  }

  // 3. Scoring & Real-Time Broadcast
  public async postScoringEvent(matchId: string, event: Record<string, any>): Promise<ApiResponse> {
    return this.request(`/api/v1/scoring/matches/${matchId}/events`, {
      method: 'POST',
      body: JSON.stringify(event)
    });
  }

  // 4. Reputation, Disputes & Payouts
  public async getProviderReputation(providerId: string): Promise<ApiResponse> {
    return this.request(`/api/v1/reputation/provider/${providerId}`, { method: 'GET' });
  }

  public async postReputationEvent(params: {
    provider_id: string;
    event_type: string;
    rating?: number;
  }): Promise<ApiResponse> {
    return this.request('/api/v1/reputation/events', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  public async resolveDispute(disputeId: string, params: {
    resolution: 'UPHELD_CUSTOMER_REFUND' | 'REJECTED_PROVIDER_FAVORED' | 'RESOLVED_MUTUAL';
    resolution_notes?: string;
  }): Promise<ApiResponse> {
    return this.request(`/api/v1/disputes/${disputeId}/resolve`, {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  public async disbursePayout(params: {
    provider_id: string;
    booking_id?: string;
    amount_minor: number;
  }): Promise<ApiResponse> {
    return this.request('/api/v1/payouts/disburse', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  /**
   * Currency minor units formatter (integer cents/paise to formatted string)
   */
  public static formatMinorUnits(amountMinor: number, currency: string = 'INR'): string {
    const major = (amountMinor / 100).toFixed(2);
    if (currency === 'INR') {
      return `₹${Number(major).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    }
    return `${currency} ${major}`;
  }
}
