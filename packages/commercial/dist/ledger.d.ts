export type LedgerAccount = 'ESCROW_HOLD' | 'PROVIDER_PAYABLE' | 'PLATFORM_FEE_INCOME' | 'TAX_GST_PAYABLE' | 'REFUND_CLEARING' | 'PROMOTIONAL_DISCOUNT_EXPENSE' | 'SPONSORSHIP_ESCROW';
export type EntryType = 'DEBIT' | 'CREDIT';
export interface JournalLine {
    account: LedgerAccount;
    entryType: EntryType;
    amountMinor: number;
    currency: string;
    description: string;
}
export interface JournalEntry {
    id: string;
    referenceId: string;
    referenceType: 'ORDER_SETTLEMENT' | 'ORDER_REFUND' | 'PAYOUT_DISBURSEMENT' | 'PROMOTIONAL_SETTLEMENT' | 'SPONSORSHIP_PLEDGE';
    timestamp: string;
    lines: JournalLine[];
}
export declare function validateJournalEntry(entry: JournalEntry): boolean;
export declare function createSettlementJournalEntry(params: {
    orderId: string;
    totalPaidMinor: number;
    platformFeeMinor: number;
    taxMinor: number;
    providerPayoutMinor: number;
    currency?: string;
    id?: string;
}): JournalEntry;
export declare function createRefundJournalEntry(params: {
    orderId: string;
    refundAmountMinor: number;
    currency?: string;
    id?: string;
}): JournalEntry;
export declare function createPromotionalSettlementJournalEntry(params: {
    orderId: string;
    totalPaidByCustomerMinor: number;
    discountSubsidyMinor: number;
    platformFeeMinor: number;
    taxMinor: number;
    providerPayoutMinor: number;
    currency?: string;
    id?: string;
}): JournalEntry;
export declare function createSponsorshipJournalEntry(params: {
    tournamentId: string;
    pledgeAmountMinor: number;
    sponsorName: string;
    currency?: string;
    id?: string;
}): JournalEntry;
//# sourceMappingURL=ledger.d.ts.map