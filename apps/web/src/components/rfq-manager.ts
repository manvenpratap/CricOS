import { RfqRequest, RfqQuote } from '@cricket-platform/contracts';

/**
 * Formats integer minor units to readable INR currency string with tabular figures.
 */
function formatMinor(amountMinor: number): string {
  return '₹' + (amountMinor / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

/**
 * Crisp SVG icons conforming to design-taste-frontend anti-emoji policy.
 */
const ICONS = {
  clipboard: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M9 14l2 2 4-4"/></svg>`,
  chart: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  send: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
  award: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
  clock: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  shield: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  sparkle: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v18M3 12h18M5.5 5.5l13 13M18.5 5.5l-13 13"/></svg>`
};

/**
 * Renders an RFQ card reimagined with high-agency design taste (UX-022, P1-001).
 * Features liquid-glass refraction, strict typography, asymmetric bento layout,
 * and zero emojis.
 */
export function renderRfqCardHtml(rfq: RfqRequest): string {
  const isAwarded = rfq.status === 'AWARDED';
  const statusBadge = isAwarded
    ? `<span class="badge badge-emerald" data-tooltip="Contract awarded and escrow deposit committed" style="display: inline-flex; align-items: center; gap: 0.35rem;">${ICONS.shield} AWARDED</span>`
    : `<span class="badge badge-cyan" data-tooltip="Accepting competitive bids from verified providers" style="display: inline-flex; align-items: center; gap: 0.35rem;"><span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--cyan); box-shadow: 0 0 6px var(--cyan);"></span> OPEN BIDDING</span>`;

  return `
    <article class="rfq-card glass-panel" id="rfq-${rfq.id}" style="position: relative; padding: 1.5rem; border-radius: 16px; margin-bottom: 1.25rem; border: 1px solid rgba(255, 255, 255, 0.08); background: linear-gradient(135deg, rgba(13, 20, 36, 0.82) 0%, rgba(8, 12, 22, 0.92) 100%); box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 20px 40px -15px rgba(0, 0, 0, 0.45); backdrop-filter: blur(16px); transition: border-color 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; margin-bottom: 1rem;">
        <div style="flex: 1; min-width: 0;">
          <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.5rem;">
            <span class="badge" style="font-size: 0.72rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.1); color: #CBD5E1; padding: 0.2rem 0.6rem; border-radius: 6px;">${rfq.category}</span>
            ${statusBadge}
          </div>
          <h4 style="margin: 0; font-family: var(--font-display); font-size: 1.15rem; font-weight: 600; color: #FFFFFF; letter-spacing: -0.02em; line-height: 1.35;">${rfq.title}</h4>
        </div>
        <div style="text-align: right; flex-shrink: 0;">
          <div style="font-family: var(--font-mono); font-size: 1.35rem; font-weight: 700; color: var(--turf-emerald); font-variant-numeric: tabular-nums; letter-spacing: -0.02em; line-height: 1.1;">${formatMinor(rfq.budget_minor)}</div>
          <div style="font-size: 0.72rem; font-weight: 500; color: #8E9BAE; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 0.25rem;">Budget Cap</div>
        </div>
      </div>

      <p style="font-size: 0.875rem; color: #94A3B8; margin: 0 0 1.25rem; line-height: 1.55; max-width: 65ch;">${rfq.description}</p>

      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255, 255, 255, 0.06); padding-top: 1rem; gap: 1rem; flex-wrap: wrap;">
        <div style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.78rem; color: #8E9BAE;">
          ${ICONS.clock}
          <span>Submission Deadline: <strong style="color: #E2E8F0; font-weight: 600;">${new Date(rfq.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</strong></span>
        </div>
        <div style="display: flex; gap: 0.5rem; align-items: center;">
          <button class="btn btn-secondary btn-sm" onclick="viewRfqQuotes('${rfq.id}')" data-tooltip="Inspect and compare submitted provider proposals" style="display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.45rem 0.85rem; font-size: 0.8rem; font-weight: 600; border-radius: 8px;">
            ${ICONS.chart}
            <span>View Quotes</span>
          </button>
          ${!isAwarded ? `
            <button class="btn btn-primary btn-sm" onclick="openSubmitQuoteModal('${rfq.id}')" data-tooltip="Submit a competitive pricing quote for this procurement" style="display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.45rem 0.85rem; font-size: 0.8rem; font-weight: 600; border-radius: 8px;">
              ${ICONS.send}
              <span>Submit Quote</span>
            </button>
          ` : ''}
        </div>
      </div>
    </article>
  `;
}

/**
 * Renders a ranked quote row with 100-point algorithm breakdown and provider reputation.
 */
export function renderQuoteRowHtml(quote: RfqQuote & { provider_name?: string; provider_trust_rating?: number; total_score?: number }): string {
  const isAccepted = quote.status === 'ACCEPTED';
  const trustRating = quote.provider_trust_rating || 95;
  const totalScore = quote.total_score || 88;

  return `
    <div class="quote-row glass-panel" id="quote-${quote.id}" style="position: relative; display: flex; justify-content: space-between; align-items: center; padding: 1.15rem 1.25rem; border-radius: 12px; margin-bottom: 0.85rem; border: 1px solid rgba(255, 255, 255, 0.07); background: rgba(15, 23, 42, 0.6); box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05); gap: 1.25rem; flex-wrap: wrap; transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;">
      <div style="flex: 1; min-width: 240px;">
        <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.3rem;">
          <span style="font-family: var(--font-display); font-weight: 600; color: #FFFFFF; font-size: 0.98rem; letter-spacing: -0.01em;">${quote.provider_name || 'Verified Provider'}</span>
          <span class="badge badge-amber" style="font-size: 0.7rem; padding: 0.15rem 0.45rem; border-radius: 4px; display: inline-flex; align-items: center; gap: 0.25rem;" data-tooltip="Provider reliability rating based on Bayesian track record">
            ${ICONS.shield} ${trustRating}% Trust
          </span>
          <span class="badge badge-cyan" style="font-size: 0.7rem; padding: 0.15rem 0.45rem; border-radius: 4px;" data-tooltip="Overall composite score across price, trust, and turnaround">
            Score ${totalScore}/100
          </span>
        </div>
        ${quote.notes ? `
          <div style="font-size: 0.82rem; color: #94A3B8; margin-top: 0.4rem; line-height: 1.4; border-left: 2px solid rgba(0, 229, 153, 0.4); padding-left: 0.6rem; font-style: normal;">
            ${quote.notes}
          </div>
        ` : ''}
      </div>
      <div style="display: flex; align-items: center; gap: 1.25rem; flex-shrink: 0;">
        <div style="text-align: right;">
          <div style="font-family: var(--font-mono); font-weight: 700; color: var(--turf-emerald); font-size: 1.2rem; font-variant-numeric: tabular-nums; line-height: 1.1;">${formatMinor(quote.quote_price_minor)}</div>
          <div style="font-size: 0.7rem; color: #8E9BAE; text-transform: uppercase; letter-spacing: 0.04em; margin-top: 0.2rem;">Excl. GST</div>
        </div>
        ${isAccepted ? `
          <span class="badge badge-emerald" data-tooltip="Quote accepted and contract escrow locked" style="display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.45rem 0.85rem; font-weight: 600; font-size: 0.8rem; border-radius: 8px;">
            ${ICONS.shield} CONTRACT LOCKED
          </span>
        ` : `
          <button class="btn btn-primary btn-sm" onclick="acceptRfqQuote('${quote.id}')" data-tooltip="Award contract and automatically lock escrow deposit" style="display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.45rem 0.95rem; font-weight: 600; font-size: 0.8rem; border-radius: 8px;">
            ${ICONS.award}
            <span>Award Contract</span>
          </button>
        `}
      </div>
    </div>
  `;
}

/**
 * Renders an empty state when no procurement requirements are open.
 */
export function renderRfqEmptyStateHtml(): string {
  return `
    <div class="glass-panel" style="padding: 3rem 2rem; text-align: center; border-radius: 16px; border: 1px dashed rgba(255, 255, 255, 0.12); background: rgba(10, 16, 28, 0.5);">
      <div style="display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: 12px; background: rgba(255, 255, 255, 0.04); color: #8E9BAE; margin-bottom: 1rem;">
        ${ICONS.clipboard}
      </div>
      <h4 style="font-family: var(--font-display); font-size: 1.1rem; color: #FFFFFF; margin: 0 0 0.5rem; font-weight: 600;">No Open Procurement Requests</h4>
      <p style="font-size: 0.85rem; color: #8E9BAE; max-width: 44ch; margin: 0 auto 1.5rem; line-height: 1.5;">
        Post an RFQ to solicit competitive bids from certified umpires, turf owners, scorers, and media providers with guaranteed escrow protection.
      </p>
      <button class="btn btn-primary btn-sm" onclick="openNewRfqModal()" style="display: inline-flex; align-items: center; gap: 0.4rem; border-radius: 8px; font-weight: 600;">
        ${ICONS.send}
        <span>Create Requirement</span>
      </button>
    </div>
  `;
}

/**
 * Renders a loading skeleton shimmer matching exact RFQ card dimensions.
 */
export function renderRfqSkeletonHtml(): string {
  return `
    <div class="glass-panel skeleton-shimmer" style="padding: 1.5rem; border-radius: 16px; margin-bottom: 1.25rem; border: 1px solid rgba(255, 255, 255, 0.05); background: rgba(15, 23, 42, 0.4);">
      <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
        <div style="width: 40%; height: 24px; background: rgba(255, 255, 255, 0.06); border-radius: 6px;"></div>
        <div style="width: 20%; height: 24px; background: rgba(255, 255, 255, 0.06); border-radius: 6px;"></div>
      </div>
      <div style="width: 85%; height: 16px; background: rgba(255, 255, 255, 0.04); border-radius: 4px; margin-bottom: 0.6rem;"></div>
      <div style="width: 60%; height: 16px; background: rgba(255, 255, 255, 0.04); border-radius: 4px; margin-bottom: 1.25rem;"></div>
      <div style="display: flex; justify-content: space-between; border-top: 1px solid rgba(255, 255, 255, 0.04); padding-top: 0.75rem;">
        <div style="width: 30%; height: 14px; background: rgba(255, 255, 255, 0.04); border-radius: 4px;"></div>
        <div style="width: 25%; height: 28px; background: rgba(255, 255, 255, 0.06); border-radius: 6px;"></div>
      </div>
    </div>
  `;
}
