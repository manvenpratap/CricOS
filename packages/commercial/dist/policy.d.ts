export interface CommercialSnapshot {
    subtotal_minor: number;
    fee_minor: number;
    tax_minor: number;
    discount_minor: number;
    total_minor: number;
    currency: string;
    policy_version: string;
}
export interface CommercialCalculationParams {
    subtotal_minor: number;
    fee_percentage_bps?: number;
    tax_percentage_bps?: number;
    discount_minor?: number;
    currency?: string;
    policy_version?: string;
}
export declare function calculateTotal(input: Omit<CommercialSnapshot, 'total_minor'>): CommercialSnapshot;
export declare function buildCommercialSnapshot(params: CommercialCalculationParams): CommercialSnapshot;
//# sourceMappingURL=policy.d.ts.map