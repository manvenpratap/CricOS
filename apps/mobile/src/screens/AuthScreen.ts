import { CricOSMobileClient, MobileSession } from '../api/mobile-client.js';

export type MobileUserRole = 'CAPTAIN' | 'PLAYER' | 'SCORER' | 'FAN' | 'UMPIRE' | 'ORGANISER' | 'TURF_PROVIDER' | 'ADMIN';

export interface AuthState {
  identifier: string;
  code: string;
  role: MobileUserRole;
  step: 'IDENTIFIER' | 'OTP_INPUT' | 'AUTHENTICATED';
  isLoading: boolean;
  errorMessage?: string;
  debugCode?: string;
}

export class AuthScreenController {
  private client: CricOSMobileClient;
  private state: AuthState;
  private onAuthenticatedCallback?: (session: MobileSession) => void;

  constructor(client: CricOSMobileClient, onAuthenticated?: (session: MobileSession) => void) {
    this.client = client;
    this.onAuthenticatedCallback = onAuthenticated;
    this.state = {
      identifier: '+91 98765 43210',
      code: '',
      role: 'CAPTAIN',
      step: 'IDENTIFIER',
      isLoading: false
    };
  }

  public getState(): AuthState {
    return { ...this.state };
  }

  public setIdentifier(identifier: string): void {
    this.state.identifier = identifier;
  }

  public setRole(role: MobileUserRole): void {
    this.state.role = role;
  }

  public setCode(code: string): void {
    this.state.code = code;
  }

  public async requestOtp(): Promise<boolean> {
    this.state.isLoading = true;
    this.state.errorMessage = undefined;

    try {
      const res = await fetch(`${this.client.getBaseUrl()}/api/v1/auth/otp/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: this.state.identifier })
      });

      const data = await res.json() as { success?: boolean; debug_code?: string; message?: string; error?: string };

      if (res.ok && data.success) {
        this.state.step = 'OTP_INPUT';
        this.state.debugCode = data.debug_code || '123456';
        this.state.code = this.state.debugCode; // auto-populate in pilot/staging mode
        this.state.isLoading = false;
        return true;
      } else {
        this.state.errorMessage = data.message || data.error || 'Failed to request OTP';
        this.state.isLoading = false;
        return false;
      }
    } catch (err: unknown) {
      this.state.errorMessage = err instanceof Error ? err.message : 'Network error requesting OTP';
      this.state.isLoading = false;
      return false;
    }
  }

  public async verifyOtp(): Promise<boolean> {
    this.state.isLoading = true;
    this.state.errorMessage = undefined;

    try {
      const res = await fetch(`${this.client.getBaseUrl()}/api/v1/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: this.state.identifier,
          code: this.state.code,
          role: this.state.role
        })
      });

      const data = await res.json() as {
        token?: string;
        user?: { id: string; identifier: string; roles: string[]; status: string };
        error?: string;
        message?: string;
      };

      if (res.ok && data.token && data.user) {
        const session: MobileSession = {
          token: data.token,
          userId: data.user.id,
          role: (data.user.roles[0] || this.state.role) as any,
          expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
        };

        this.client.setSession(session);
        this.state.step = 'AUTHENTICATED';
        this.state.isLoading = false;

        if (this.onAuthenticatedCallback) {
          this.onAuthenticatedCallback(session);
        }
        return true;
      } else {
        this.state.errorMessage = data.message || data.error || 'Invalid OTP code';
        this.state.isLoading = false;
        return false;
      }
    } catch (err: unknown) {
      this.state.errorMessage = err instanceof Error ? err.message : 'Authentication verification failed';
      this.state.isLoading = false;
      return false;
    }
  }

  public renderHtml(): string {
    const isOtpStep = this.state.step === 'OTP_INPUT';
    const roles: Array<{ id: MobileUserRole; label: string; icon: string; tooltip: string }> = [
      { id: 'CAPTAIN', label: 'Captain', icon: '👑', tooltip: 'Captain: Manage Playing XI, conduct toss, tactical view' },
      { id: 'PLAYER', label: 'Player', icon: '🏏', tooltip: 'Player: Career figures, squad lineup, tournament standings' },
      { id: 'SCORER', label: 'Scorer', icon: '⚡', tooltip: 'Scorer: Live scoring pad, extras, wagon wheel, dismissals' },
      { id: 'FAN', label: 'Fan', icon: '🎪', tooltip: 'Fan: Stadium cheering, win probability poll, match pulse' },
      { id: 'UMPIRE', label: 'Umpire', icon: '⚖️', tooltip: 'Umpire: Fair Play & Trust, DRS reviews, match sign-off' },
      { id: 'ORGANISER', label: 'Organiser', icon: '🏆', tooltip: 'Organiser: Fixtures, event basket procurement, standings' },
      { id: 'TURF_PROVIDER', label: 'Provider', icon: '🏟️', tooltip: 'Provider: Storefront, hourly slots, earnings dashboard' },
      { id: 'ADMIN', label: 'Admin', icon: '⚡', tooltip: 'Admin: 5-account ledger integrity, dispute arbitration' }
    ];

    return `
      <div class="mobile-auth-card" style="padding: 1.25rem; background: rgba(10, 16, 28, 0.95); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; margin: 0.75rem 0;">
        <div style="text-align: center; margin-bottom: 1.25rem;">
          <div style="font-size: 2.5rem; margin-bottom: 0.4rem;">🏏</div>
          <h2 style="margin: 0; font-family: 'Space Grotesk', sans-serif; font-size: 1.4rem; color: #f8fafc;">Sign In to CricOS</h2>
          <p style="margin: 0.25rem 0 0; color: #94a3b8; font-size: 0.8rem;">Select Your Persona to Enter the Stadium</p>
        </div>

        ${this.state.errorMessage ? `
          <div style="background: rgba(255, 51, 102, 0.15); border: 1px solid #ff3366; color: #ff8099; padding: 0.75rem; border-radius: 8px; font-size: 0.85rem; margin-bottom: 1rem;">
            ⚠️ ${this.state.errorMessage}
          </div>
        ` : ''}

        ${!isOtpStep ? `
          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #cbd5e1; margin-bottom: 0.4rem;">Mobile Phone or Email</label>
            <input type="text" id="authIdentifierInput" value="${this.state.identifier}" style="width: 100%; box-sizing: border-box; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 0.75rem; color: #f8fafc; font-size: 0.95rem;" placeholder="+91 98765 43210" />
          </div>

          <div style="margin-bottom: 1.25rem;">
            <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #cbd5e1; margin-bottom: 0.4rem;">Choose Persona (8 User Types)</label>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.4rem;" id="authRolePicker">
              ${roles.map(r => `
                <button type="button" class="role-pill ${this.state.role === r.id ? 'active' : ''}" onclick="window.cricosMobileApp.setAuthRole('${r.id}')" style="padding: 0.55rem 0.4rem; font-size: 0.75rem; border-radius: 6px; border: 1px solid ${this.state.role === r.id ? '#00E599' : 'rgba(255,255,255,0.1)'}; background: ${this.state.role === r.id ? 'rgba(0, 229, 153, 0.15)' : 'rgba(255,255,255,0.03)'}; color: ${this.state.role === r.id ? '#00E599' : '#f8fafc'}; font-weight: 600; cursor: pointer; text-align: left; display: flex; align-items: center; gap: 0.35rem;" data-tooltip="${r.tooltip}">
                  <span style="font-size: 1rem;">${r.icon}</span>
                  <span>${r.label}</span>
                </button>
              `).join('')}
            </div>
          </div>

          <button type="button" onclick="window.cricosMobileApp.requestOtpAction()" style="width: 100%; padding: 0.85rem; border-radius: 8px; border: none; background: linear-gradient(135deg, #00E599, #00D2FF); color: #04070D; font-weight: 700; font-size: 0.95rem; cursor: pointer; box-shadow: 0 4px 14px rgba(0, 229, 153, 0.3);" data-tooltip="Request OTP verification code">
            ${this.state.isLoading ? 'Sending OTP Code...' : 'Send Secure OTP →'}
          </button>
        ` : `
          <div style="background: rgba(0, 229, 153, 0.1); border: 1px solid rgba(0, 229, 153, 0.3); border-radius: 8px; padding: 0.75rem; margin-bottom: 1rem; text-align: center;">
            <div style="font-size: 0.8rem; color: #94a3b8;">OTP sent to: <strong style="color: #f8fafc;">${this.state.identifier}</strong></div>
            <div style="font-size: 0.75rem; color: #00E599; margin-top: 0.25rem;">Staging Demo Code: <strong>${this.state.debugCode || '123456'}</strong></div>
          </div>

          <div style="margin-bottom: 1.25rem;">
            <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #cbd5e1; margin-bottom: 0.4rem;">Enter 6-Digit Verification Code</label>
            <input type="text" id="authCodeInput" value="${this.state.code}" maxlength="6" style="width: 100%; box-sizing: border-box; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 0.75rem; color: #00E599; font-size: 1.5rem; text-align: center; letter-spacing: 0.5rem; font-family: 'Chakra Petch', monospace;" />
          </div>

          <div style="display: flex; gap: 0.5rem;">
            <button type="button" onclick="window.cricosMobileApp.backToIdentifier()" style="flex: 1; padding: 0.85rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); background: transparent; color: #f8fafc; font-weight: 600; font-size: 0.9rem; cursor: pointer;">← Back</button>
            <button type="button" onclick="window.cricosMobileApp.verifyOtpAction()" style="flex: 2; padding: 0.85rem; border-radius: 8px; border: none; background: linear-gradient(135deg, #00E599, #00D2FF); color: #04070D; font-weight: 700; font-size: 1rem; cursor: pointer; box-shadow: 0 4px 14px rgba(0, 229, 153, 0.3);" data-tooltip="Verify OTP code and create session">
              ${this.state.isLoading ? 'Verifying...' : 'Verify & Enter App ✓'}
            </button>
          </div>
        `}

        <div style="margin-top: 1.5rem; text-align: center; font-size: 0.75rem; color: #64748b;">
          By continuing, you agree to CricOS <a href="/privacy" style="color: #00D2FF; text-decoration: none;">Privacy Policy</a> & Terms.
        </div>
      </div>
    `;
  }
}

