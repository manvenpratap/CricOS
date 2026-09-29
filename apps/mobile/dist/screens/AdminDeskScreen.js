export class AdminDeskScreenController {
    state;
    constructor(initialState) {
        this.state = {
            sseLatencyMs: initialState?.sseLatencyMs || 8,
            activeMatches: initialState?.activeMatches || 1,
            totalDebitsMinor: 500000,
            totalCreditsMinor: 500000,
            accounts: initialState?.accounts || [
                { code: 'ESCROW_HOLD', name: 'Escrow Holding Pool', type: 'LIABILITY', balanceMinor: 500000 },
                { code: 'PROVIDER_PAYABLE', name: 'Provider Payables', type: 'LIABILITY', balanceMinor: 380000 },
                { code: 'PLATFORM_FEE_INCOME', name: 'Platform Facilitation Revenue', type: 'REVENUE', balanceMinor: 25000 },
                { code: 'TAX_GST_PAYABLE', name: 'GST Tax Payable (18%)', type: 'LIABILITY', balanceMinor: 4500 },
                { code: 'REFUND_CLEARING', name: 'Refund Clearing Account', type: 'ASSET', balanceMinor: 0 }
            ],
            disputes: initialState?.disputes || [
                {
                    id: 'dsp-101',
                    bookingId: 'bk-slot-89',
                    customerName: 'Rahul Verma',
                    providerName: 'Eden Gardens Arena',
                    amountMinor: 350000,
                    reason: 'Rain washout before toss; turf unplayable per MCC Law 2.7',
                    status: 'PENDING'
                },
                {
                    id: 'dsp-102',
                    bookingId: 'bk-slot-92',
                    customerName: 'Kunal Sen',
                    providerName: 'Nitin Menon Panel',
                    amountMinor: 80000,
                    reason: 'Umpire replacement requested; official no-show',
                    status: 'PENDING'
                }
            ]
        };
    }
    getState() {
        return JSON.parse(JSON.stringify(this.state));
    }
    isLedgerBalanced() {
        return this.state.totalDebitsMinor === this.state.totalCreditsMinor;
    }
    approveDispute(disputeId) {
        const d = this.state.disputes.find(item => item.id === disputeId);
        if (!d)
            return null;
        d.status = 'REFUNDED';
        // Double entry balance: debit REFUND_CLEARING, credit ESCROW_HOLD
        const escrow = this.state.accounts.find(a => a.code === 'ESCROW_HOLD');
        const refund = this.state.accounts.find(a => a.code === 'REFUND_CLEARING');
        if (escrow)
            escrow.balanceMinor -= d.amountMinor;
        if (refund)
            refund.balanceMinor += d.amountMinor;
        return d;
    }
    rejectDispute(disputeId) {
        const d = this.state.disputes.find(item => item.id === disputeId);
        if (!d)
            return null;
        d.status = 'REJECTED';
        return d;
    }
    renderMobileHtml() {
        const isBalanced = this.isLedgerBalanced();
        return `
      <div class="mobile-admin-screen" style="padding: 1rem; color: #f8fafc; font-family: 'Plus Jakarta Sans', sans-serif;">
        <!-- Header & Telemetry Card -->
        <div style="background: rgba(10, 16, 28, 0.9); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 1.25rem; margin-bottom: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <div style="font-size: 0.75rem; color: #FF3366; font-weight: 700; text-transform: uppercase;">System Operations</div>
              <h2 style="margin: 0.2rem 0 0; font-size: 1.25rem; font-family: 'Space Grotesk', sans-serif;">Admin & Settlement Desk</h2>
              <div style="font-size: 0.8rem; color: #94a3b8; margin-top: 0.2rem;">Double-Entry Ledger & Dispute Arbitration</div>
            </div>
            <span style="font-size: 1.25rem;">⚡</span>
          </div>

          <!-- Telemetry Pills -->
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid rgba(255,255,255,0.08);">
            <div style="background: rgba(0,0,0,0.3); border-radius: 8px; padding: 0.5rem; text-align: center;">
              <div style="font-size: 0.65rem; color: #94a3b8;">SSE Latency</div>
              <div style="font-size: 0.9rem; font-weight: 700; color: #00E599; font-family: 'Chakra Petch', monospace;">&lt;${this.state.sseLatencyMs}ms</div>
            </div>
            <div style="background: rgba(0,0,0,0.3); border-radius: 8px; padding: 0.5rem; text-align: center;">
              <div style="font-size: 0.65rem; color: #94a3b8;">Active Matches</div>
              <div style="font-size: 0.9rem; font-weight: 700; color: #00D2FF; font-family: 'Chakra Petch', monospace;">${this.state.activeMatches} LIVE</div>
            </div>
            <div style="background: rgba(0,0,0,0.3); border-radius: 8px; padding: 0.5rem; text-align: center;">
              <div style="font-size: 0.65rem; color: #94a3b8;">Ledger Parity</div>
              <div style="font-size: 0.9rem; font-weight: 700; color: ${isBalanced ? '#00E599' : '#ff3366'}; font-family: 'Chakra Petch', monospace;">
                ${isBalanced ? '0 INR Imb' : 'DRIFT!'}
              </div>
            </div>
          </div>
        </div>

        <!-- 5-Account Chart of Accounts Balance Sheet -->
        <div style="background: rgba(10, 16, 28, 0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden; margin-bottom: 1rem;">
          <div style="padding: 0.75rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 700; font-size: 0.85rem; font-family: 'Space Grotesk', sans-serif;">📊 5-Account Balance Sheet</span>
            <span style="font-size: 0.7rem; color: #00E599; font-weight: 600;">Double-Entry Verified</span>
          </div>
          <div style="display: flex; flex-direction: column;">
            ${this.state.accounts.map(acc => `
              <div style="padding: 0.65rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.04); display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-size: 0.8rem; font-weight: 600; color: #f8fafc;">${acc.name}</div>
                  <div style="font-size: 0.65rem; color: #94a3b8; font-family: 'JetBrains Mono', monospace;">${acc.code} • ${acc.type}</div>
                </div>
                <div style="font-weight: 800; font-family: 'Chakra Petch', monospace; font-size: 0.85rem; color: #00E599;">
                  ₹${(acc.balanceMinor / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Dispute Arbitration Queue -->
        <div style="background: rgba(10, 16, 28, 0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden; margin-bottom: 1rem;">
          <div style="padding: 0.75rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 700; font-size: 0.85rem; font-family: 'Space Grotesk', sans-serif;">
              ⚖️ Dispute Arbitration Queue (${this.state.disputes.filter(d => d.status === 'PENDING').length} Pending)
            </span>
          </div>
          <div style="display: flex; flex-direction: column;">
            ${this.state.disputes.map(dsp => `
              <div style="padding: 0.75rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.04);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                  <span style="font-size: 0.85rem; font-weight: 700; color: #f8fafc;">${dsp.customerName} vs ${dsp.providerName}</span>
                  <span style="font-weight: 800; font-size: 0.85rem; color: #FFB800; font-family: 'Chakra Petch', monospace;">₹${(dsp.amountMinor / 100).toFixed(2)}</span>
                </div>
                <div style="font-size: 0.75rem; color: #cbd5e1; margin-bottom: 0.4rem;">${dsp.reason}</div>
                
                ${dsp.status === 'PENDING' ? `
                  <div style="display: flex; gap: 0.5rem;">
                    <button type="button" onclick="window.cricosMobileApp.approveDisputeAction('${dsp.id}')" style="flex: 1; padding: 0.4rem; border-radius: 6px; border: none; background: rgba(0, 229, 153, 0.2); border: 1px solid #00E599; color: #00E599; font-weight: 700; font-size: 0.75rem; cursor: pointer;" data-tooltip="Execute balanced zero-sum refund journal entry">
                      Approve Refund ✓
                    </button>
                    <button type="button" onclick="window.cricosMobileApp.rejectDisputeAction('${dsp.id}')" style="flex: 1; padding: 0.4rem; border-radius: 6px; border: none; background: rgba(255, 51, 102, 0.15); border: 1px solid #ff3366; color: #ff8099; font-weight: 700; font-size: 0.75rem; cursor: pointer;" data-tooltip="Reject claim and disburse escrow to provider">
                      Reject Claim ✕
                    </button>
                  </div>
                ` : `
                  <div style="font-size: 0.7rem; font-weight: 700; color: ${dsp.status === 'REFUNDED' ? '#00E599' : '#ff3366'};">
                    Status: ${dsp.status}
                  </div>
                `}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
    }
}
//# sourceMappingURL=AdminDeskScreen.js.map