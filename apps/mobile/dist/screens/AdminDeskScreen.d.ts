export interface AccountBalance {
    code: string;
    name: string;
    type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
    balanceMinor: number;
}
export interface DisputeItem {
    id: string;
    bookingId: string;
    customerName: string;
    providerName: string;
    amountMinor: number;
    reason: string;
    status: 'PENDING' | 'REFUNDED' | 'REJECTED';
}
export interface AdminDeskState {
    accounts: AccountBalance[];
    disputes: DisputeItem[];
    totalDebitsMinor: number;
    totalCreditsMinor: number;
    sseLatencyMs: number;
    activeMatches: number;
}
export declare class AdminDeskScreenController {
    private state;
    constructor(initialState?: Partial<AdminDeskState>);
    getState(): AdminDeskState;
    isLedgerBalanced(): boolean;
    approveDispute(disputeId: string): DisputeItem | null;
    rejectDispute(disputeId: string): DisputeItem | null;
    renderMobileHtml(): string;
}
//# sourceMappingURL=AdminDeskScreen.d.ts.map