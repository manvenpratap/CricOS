import { SponsorshipInventoryItem } from '@cricket-platform/contracts';

function formatMinor(amountMinor: number): string {
  return '₹' + (amountMinor / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

/**
 * Renders the Sponsorship Inventory showcase (P2-004).
 */
export function renderSponsorshipTierCardHtml(item: SponsorshipInventoryItem): string {
  const isConfirmed = item.status === 'CONFIRMED';
  const badge = isConfirmed
    ? `<span class="badge badge-emerald" data-tooltip="Pledged by ${item.sponsor_name}">✓ PLEDGED (${item.sponsor_name})</span>`
    : `<span class="badge badge-amber" data-tooltip="Available for corporate sponsor pledge">AVAILABLE</span>`;

  return `
    <div class="sponsorship-card glass-panel" id="spons-${item.id}" style="padding: 1.25rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); background: rgba(10, 16, 28, 0.75); margin-bottom: 1rem;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
        <div>
          <span class="badge badge-cyan" style="font-size: 0.7rem;">${item.tier}</span>
          <h4 style="margin: 0.5rem 0 0.25rem; font-family: var(--font-display); font-size: 1.1rem; color: #fff;">${item.title}</h4>
        </div>
        <div style="text-align: right;">
          <div style="font-family: var(--font-mono); font-size: 1.2rem; font-weight: 700; color: var(--turf-emerald);">${formatMinor(item.pledge_amount_minor)}</div>
          <div style="font-size: 0.7rem; color: #8E9BAE;">Prize Pool Fund</div>
        </div>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid rgba(255,255,255,0.05);">
        ${badge}
        ${!isConfirmed ? `
          <button class="btn btn-primary btn-sm" onclick="openPledgeModal('${item.id}', '${item.tournament_id}')" data-tooltip="Pledge corporate sponsorship and fund tournament purse">
            🤝 Pledge Sponsor
          </button>
        ` : ''}
      </div>
    </div>
  `;
}

/**
 * Renders the Virtual Player Auction live bidding desk (P3-001).
 */
export function renderPlayerAuctionBoardHtml(auction: {
  auction_id: string;
  player_name: string;
  role: string;
  base_price_minor: number;
  current_highest_bid_minor: number;
  highest_bidder_team: string;
  team_purse_remaining_minor: number;
}): string {
  return `
    <div class="player-auction-desk glass-panel" style="padding: 1.5rem; border-radius: 12px; border: 1px solid rgba(0, 210, 255, 0.3); background: rgba(10, 16, 28, 0.9);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
        <div>
          <span class="badge badge-purple" style="font-size: 0.75rem;">LIVE PLAYER AUCTION</span>
          <h3 style="margin: 0.4rem 0 0; font-family: var(--font-display); font-size: 1.3rem; color: #fff;">${auction.player_name}</h3>
          <div style="font-size: 0.8rem; color: #8E9BAE;">${auction.role} • Base: ${formatMinor(auction.base_price_minor)}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 0.75rem; color: #8E9BAE;">Current Highest Bid</div>
          <div style="font-family: var(--font-mono); font-size: 1.6rem; font-weight: 800; color: var(--turf-emerald);">${formatMinor(auction.current_highest_bid_minor)}</div>
          <div style="font-size: 0.75rem; color: var(--cyan); font-weight: 600;">Held by: ${auction.highest_bidder_team}</div>
        </div>
      </div>

      <div style="padding: 1rem; border-radius: 8px; background: rgba(255,255,255,0.04); margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-size: 0.75rem; color: #8E9BAE;">Your Franchise Purse Remaining</div>
          <div style="font-family: var(--font-mono); font-weight: 700; color: #fff; font-size: 1.1rem;">${formatMinor(auction.team_purse_remaining_minor)}</div>
        </div>
        <span class="badge badge-emerald">Eligible to Bid</span>
      </div>

      <div style="display: flex; gap: 0.75rem;">
        <button class="btn btn-secondary" style="flex: 1;" onclick="submitAuctionBid(2500000)" data-tooltip="Increment bid by ₹25,000">
          + ₹25,000
        </button>
        <button class="btn btn-secondary" style="flex: 1;" onclick="submitAuctionBid(5000000)" data-tooltip="Increment bid by ₹50,000">
          + ₹50,000
        </button>
        <button class="btn btn-primary" style="flex: 1;" onclick="submitAuctionBid(10000000)" data-tooltip="Increment bid by ₹1,00,000">
          + ₹1,00,000
        </button>
      </div>
    </div>
  `;
}
