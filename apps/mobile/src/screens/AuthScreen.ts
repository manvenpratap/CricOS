import { CricOSMobileClient, MobileSession } from '../api/mobile-client.js';

export interface AuthState {
  identifier: string;
  code: string;
  role: 'CAPTAIN' | 'PLAYER' | 'SCORER' | 'ORGANISER' | 'PROVIDER';
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

  public setRole(role: AuthState['role']): void {
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

    return `
      <div class="mobile-auth-card" style="padding: 1.5rem; background: rgba(10, 16, 28, 0.95); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; margin: 1rem 0;">
        <div style="text-align: center; margin-bottom: 1.5rem;">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🏏</div>
          <h2 style="margin: 0; font-family: 'Space Grotesk', sans-serif; font-size: 1.5rem; color: #f8fafc;">Welcome to CricOS</h2>
          <p style="margin: 0.35rem 0 0; color: #94a3b8; font-size: 0.85rem;">The Unified Cricket Operating System</p>
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
            <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #cbd5e1; margin-bottom: 0.4rem;">Select Your Persona / Role</label>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem;" id="authRolePicker">
              <button type="button" class="role-pill ${this.state.role === 'CAPTAIN' ? 'active' : ''}" onclick="window.cricosMobileApp.setAuthRole('CAPTAIN')" style="padding: 0.5rem; font-size: 0.8rem; border-radius: 6px; border: 1px solid ${this.state.role === 'CAPTAIN' ? '#00E599' : 'rgba(255,255,255,0.1)'}; background: ${this.state.role === 'CAPTAIN' ? 'rgba(0, 229, 153, 0.15)' : 'rgba(255,255,255,0.03)'}; color: #f8fafc; cursor: pointer;">🏏 Team Captain</button>
              <button type="button" class="role-pill ${this.state.role === 'PLAYER' ? 'active' : ''}" onclick="window.cricosMobileApp.setAuthRole('PLAYER')" style="padding: 0.5rem; font-size: 0.8rem; border-radius: 6px; border: 1px solid ${this.state.role === 'PLAYER' ? '#00E599' : 'rgba(255,255,255,0.1)'}; background: ${this.state.role === 'PLAYER' ? 'rgba(0, 229, 153, 0.15)' : 'rgba(255,255,255,0.03)'}; color: #f8fafc; cursor: pointer;">👤 League Player</button>
              <button type="button" class="role-pill ${this.state.role === 'SCORER' ? 'active' : ''}" onclick="window.cricosMobileApp.setAuthRole('SCORER')" style="padding: 0.5rem; font-size: 0.8rem; border-radius: 6px; border: 1px solid ${this.state.role === 'SCORER' ? '#00E599' : 'rgba(255,255,255,0.1)'}; background: ${this.state.role === 'SCORER' ? 'rgba(0, 229, 153, 0.15)' : 'rgba(255,255,255,0.03)'}; color: #f8fafc; cursor: pointer;">⚡ Official Scorer</button>
              <button type="button" class="role-pill ${this.state.role === 'ORGANISER' ? 'active' : ''}" onclick="window.cricosMobileApp.setAuthRole('ORGANISER')" style="padding: 0.5rem; font-size: 0.8rem; border-radius: 6px; border: 1px solid ${this.state.role === 'ORGANISER' ? '#00E599' : 'rgba(255,255,255,0.1)'}; background: ${this.state.role === 'ORGANISER' ? 'rgba(0, 229, 153, 0.15)' : 'rgba(255,255,255,0.03)'}; color: #f8fafc; cursor: pointer;">🏆 Tournament Dir</button>
            </div>
          </div>

          <button type="button" onclick="window.cricosMobileApp.requestOtpAction()" style="width: 100%; padding: 0.85rem; border-radius: 8px; border: none; background: linear-gradient(135deg, #00E599, #00D2FF); color: #04070D; font-weight: 700; font-size: 1rem; cursor: pointer; box-shadow: 0 4px 14px rgba(0, 229, 153, 0.3);">
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
            <button type="button" onclick="window.cricosMobileApp.verifyOtpAction()" style="flex: 2; padding: 0.85rem; border-radius: 8px; border: none; background: linear-gradient(135deg, #00E599, #00D2FF); color: #04070D; font-weight: 700; font-size: 1rem; cursor: pointer; box-shadow: 0 4px 14px rgba(0, 229, 153, 0.3);">
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
