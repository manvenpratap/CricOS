import { CricOSMobileClient, MobileSession } from '../api/mobile-client.js';
export type MobileUserRole = 'CAPTAIN' | 'PLAYER' | 'SCORER' | 'FAN' | 'UMPIRE' | 'ORGANISER' | 'TURF_PROVIDER' | 'ADMIN';
export interface SignupProfileData {
    name: string;
    identifier: string;
    role: MobileUserRole;
    bio: string;
    playingRole: string;
    stance: 'RHB' | 'LHB';
    bowlingStyle: string;
    jerseyNumber: number;
    teamName: string;
}
export interface AuthState {
    identifier: string;
    code: string;
    role: MobileUserRole;
    step: 'IDENTIFIER' | 'OTP_INPUT' | 'AUTHENTICATED';
    mode: 'SIGN_IN' | 'SIGN_UP';
    signupData: SignupProfileData;
    isLoading: boolean;
    errorMessage?: string;
    debugCode?: string;
}
export declare class AuthScreenController {
    private client;
    private state;
    private onAuthenticatedCallback?;
    constructor(client: CricOSMobileClient, onAuthenticated?: (session: MobileSession) => void);
    getState(): AuthState;
    setMode(mode: 'SIGN_IN' | 'SIGN_UP'): void;
    getMode(): 'SIGN_IN' | 'SIGN_UP';
    setSignupData(data: Partial<SignupProfileData>): void;
    getSignupData(): SignupProfileData;
    setIdentifier(identifier: string): void;
    setRole(role: MobileUserRole): void;
    setCode(code: string): void;
    autoFillFreeCode(): string;
    getFreeCode(): string;
    requestOtp(): Promise<boolean>;
    verifyOtp(): Promise<boolean>;
    renderHtml(): string;
}
//# sourceMappingURL=AuthScreen.d.ts.map