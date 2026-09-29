export function calculateTotal(input) {
    const total = input.subtotal_minor + input.fee_minor + input.tax_minor - input.discount_minor;
    if (total < 0) {
        throw new Error('COMMERCIAL_NEGATIVE_TOTAL: Total cannot be less than zero');
    }
    return {
        ...input,
        total_minor: total
    };
}
export function buildCommercialSnapshot(params) {
    const { subtotal_minor, fee_percentage_bps = 500, // 5% platform fee
    tax_percentage_bps = 1800, // 18% GST on platform fee
    discount_minor = 0, currency = 'INR', policy_version = '2026.1' } = params;
    if (subtotal_minor < 0) {
        throw new Error('COMMERCIAL_INVALID_SUBTOTAL: Subtotal must be non-negative');
    }
    // Platform fee calculated on subtotal
    const fee_minor = Math.round((subtotal_minor * fee_percentage_bps) / 10000);
    // Tax calculated on platform fee (or entire service where applicable)
    const tax_minor = Math.round((fee_minor * tax_percentage_bps) / 10000);
    return calculateTotal({
        subtotal_minor,
        fee_minor,
        tax_minor,
        discount_minor,
        currency,
        policy_version
    });
}
//# sourceMappingURL=policy.js.map