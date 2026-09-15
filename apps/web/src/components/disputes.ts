export type ProviderTrustState = 'UNVERIFIED' | 'VERIFIED' | 'PROBATION' | 'SUSPENDED';

export interface TrustBadgeConfig {
  label: string;
  bgColor: string;
  color: string;
  tooltip: string;
}

export function getTrustBadgeConfig(trustState: ProviderTrustState): TrustBadgeConfig {
  switch (trustState) {
    case 'VERIFIED':
      return {
        label: 'VERIFIED',
        bgColor: 'rgba(16, 185, 129, 0.15)',
        color: '#10B981',
        tooltip: 'Provider is verified and maintains healthy reliability (>= 80%)'
      };
    case 'PROBATION':
      return {
        label: 'PROBATION',
        bgColor: 'rgba(245, 158, 11, 0.2)',
        color: '#F59E0B',
        tooltip: 'Warning: Reliability score below 80%. Increased monitoring active.'
      };
    case 'SUSPENDED':
      return {
        label: 'SUSPENDED',
        bgColor: 'rgba(244, 63, 94, 0.25)',
        color: '#F43F5E',
        tooltip: 'Circuit breaker tripped: Reliability below 65%. Active slots frozen.'
      };
    case 'UNVERIFIED':
    default:
      return {
        label: 'UNVERIFIED',
        bgColor: 'rgba(148, 163, 184, 0.15)',
        color: '#94A3B8',
        tooltip: 'Initial onboarding in progress'
      };
  }
}

export function renderTrustBadgeHtml(trustState: ProviderTrustState): string {
  const config = getTrustBadgeConfig(trustState);
  return `<span class="trust-badge" style="background:${config.bgColor};color:${config.color};padding:0.25rem 0.6rem;border-radius:4px;font-size:0.75rem;font-weight:700;" data-tooltip="${config.tooltip}">${config.label}</span>`;
}
