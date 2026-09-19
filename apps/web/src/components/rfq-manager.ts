import { RfqRequest, RfqQuote } from '@cricket-platform/contracts';

/**
 * Formats minor units to readable INR currency string.
 */
function formatMinor(amountMinor: number): string {
  return '₹' + (amountMinor / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

/**
 * Renders an RFQ card for procurement plans (UX-022, P1-001).
 */
export function renderRfqCardHtml(rfq: RfqRequest): string {
  const isAwarded = rfq.status === 'AWARDED';
  const statusBadge = isAwarded
    ? `<span class="badge badge-emerald" data-tooltip="Quote awarded and escrow committed">✓ AWARDED</span>`
    : `<span class="badge badge-cyan" data-tooltip="Open for provider bids">● OPEN</span>`;

  return `
    <div class="rfq-card glass-panel" id="rfq-${rfq.id}" style="padding: 1.25rem; border-radius: 12px; margin-bottom: 1rem; border: 1px solid rgba(255,255,255,0.08); background: rgba(10, 16, 28, 0.75);">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
        <div>
          <span class="badge badge-amber" style="font-size: 0.75rem; margin-right: 0.5rem;">${rfq.category}</span>
          ${statusBadge}
          <h4 style="margin: 0.5rem 0 0.25rem; font-family: var(--font-display); font-size: 1.1rem; color: #fff;">${rfq.title}</h4>
        </div>
        <div style="text-align: right;">
          <div style="font-family: var(--font-mono); font-size: 1.25rem; font-weight: 700; color: var(--turf-emerald);">${formatMinor(rfq.budget_minor)}</div>
          <div style="font-size: 0.75rem; color: #8E9BAE;">Budget Cap</div>
        </div>
      </div>
      <p style="font-size: 0.85rem; color: #CBD5E1; margin-bottom: 1rem; line-height: 1.4;">${rfq.description}</p>
      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.75rem;">
        <span style="font-size: 0.75rem; color: #8E9BAE;">Deadline: ${new Date(rfq.deadline).toLocaleDateString()}</span>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn btn-secondary btn-sm" onclick="viewRfqQuotes('${rfq.id}')" data-tooltip="Review submitted quotes and provider ratings">
            📊 View Quotes
          </button>
          ${!isAwarded ? `
            <button class="btn btn-primary btn-sm" onclick="openSubmitQuoteModal('${rfq.id}')" data-tooltip="Submit competitive bid for this requirement">
              💬 Submit Quote
            </button>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

/**
 * Renders a quote row for evaluation.
 */
export function renderQuoteRowHtml(quote: RfqQuote & { provider_name?: string; provider_trust_rating?: number; total_score?: number }): string {
  const isAccepted = quote.status === 'ACCEPTED';

  return `
    <div class="quote-row glass-panel" id="quote-${quote.id}" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-radius: 8px; margin-bottom: 0.75rem; background: rgba(15, 23, 42, 0.65);">
      <div>
        <div style="font-weight: 600; color: #fff; font-size: 0.95rem;">${quote.provider_name || 'Provider Partner'}</div>
        <div style="font-size: 0.8rem; color: #8E9BAE; margin-top: 2px;">
          Trust: <strong style="color: var(--amber);">${quote.provider_trust_rating || 90}%</strong> • Score: <strong>${quote.total_score || 85}/100</strong>
        </div>
        ${quote.notes ? `<div style="font-size: 0.75rem; color: #CBD5E1; margin-top: 4px; font-style: italic;">"${quote.notes}"</div>` : ''}
      </div>
      <div style="display: flex; align-items: center; gap: 1rem;">
        <div style="text-align: right;">
          <div style="font-family: var(--font-mono); font-weight: 700; color: var(--turf-emerald); font-size: 1.1rem;">${formatMinor(quote.quote_price_minor)}</div>
          <div style="font-size: 0.7rem; color: #8E9BAE;">Excl. GST</div>
        </div>
        ${isAccepted ? `
          <span class="badge badge-emerald" data-tooltip="Quote accepted and locked">✓ ACCEPTED</span>
        ` : `
          <button class="btn btn-primary btn-sm" onclick="acceptRfqQuote('${quote.id}')" data-tooltip="Award contract and lock escrow hold">
            🏆 Award Quote
          </button>
        `}
      </div>
    </div>
  `;
}
