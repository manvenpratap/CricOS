/**
 * apps/web/src/components/event-overview.ts
 *
 * Event Overview & Readiness Dashboard
 * Derived from Archive Specifications:
 * - 01_Functional_Specification_v3 (§7.2 UX-004: Event Overview)
 * - 02_Product_Blueprint_v1 (§34 Event-centric abstraction, §50 Captain Home)
 * - 08_Sprint_Ready_P0_Backlog_v1 (EVT-001..005, BAS-001..015)
 *
 * Provides a unified event detail view with readiness percentage,
 * procurement status, team lineup, and event lifecycle timeline.
 */

export type EventLifecycleStage =
  | 'CREATED'
  | 'CONFIGURED'
  | 'RESOURCES_BOOKED'
  | 'READY'
  | 'LIVE'
  | 'COMPLETED'
  | 'CANCELLED';

export interface ProcurementItem {
  id: string;
  category: 'VENUE' | 'OFFICIAL' | 'EQUIPMENT' | 'SERVICE';
  label: string;
  required: boolean;
  status: 'PENDING' | 'SEARCHING' | 'HELD' | 'BOOKED' | 'CONFIRMED' | 'CANCELLED';
  providerName?: string;
  priceMinor?: number;
  holdExpiresAt?: string;
}

export interface TeamLineupStatus {
  teamId: string;
  teamName: string;
  shortCode: string;
  playingXIConfirmed: boolean;
  confirmedCount: number;
  requiredCount: number;
}

export interface EventOverviewState {
  eventId: string;
  title: string;
  format: string;
  overs: number;
  stage: EventLifecycleStage;
  scheduledDate: string;
  venueName: string;
  homeTeam: TeamLineupStatus;
  awayTeam: TeamLineupStatus;
  procurement: ProcurementItem[];
  readinessPercent: number;
  blockers: string[];
  warnings: string[];
}

/**
 * Calculates event readiness percentage from procurement items.
 * Required items that are BOOKED/CONFIRMED count toward readiness.
 * Non-required items are bonus but don't reduce the percentage.
 */
export function calculateProcurementReadiness(procurement: ProcurementItem[]): {
  percent: number;
  blockers: string[];
  warnings: string[];
} {
  const required = procurement.filter(p => p.required);
  const optional = procurement.filter(p => !p.required);

  if (required.length === 0) return { percent: 100, blockers: [], warnings: [] };

  const confirmedStatuses = new Set(['BOOKED', 'CONFIRMED']);
  const fulfilledRequired = required.filter(p => confirmedStatuses.has(p.status));
  const heldRequired = required.filter(p => p.status === 'HELD');

  const blockers = required
    .filter(p => !confirmedStatuses.has(p.status) && p.status !== 'HELD')
    .map(p => `${p.label} — ${p.status}`);

  const warnings: string[] = [];
  for (const held of heldRequired) {
    if (held.holdExpiresAt) {
      const remaining = new Date(held.holdExpiresAt).getTime() - Date.now();
      if (remaining > 0 && remaining < 600_000) {
        warnings.push(`${held.label} hold expiring in ${Math.ceil(remaining / 60_000)} min`);
      }
    }
  }

  for (const opt of optional) {
    if (opt.status === 'PENDING') {
      warnings.push(`Optional: ${opt.label} not yet booked`);
    }
  }

  // Held items count as 50% toward readiness
  const score = fulfilledRequired.length + (heldRequired.length * 0.5);
  const percent = Math.round((score / required.length) * 100);

  return { percent: Math.min(100, percent), blockers, warnings };
}

/**
 * Returns lifecycle stage metadata for rendering.
 */
export function getStageMetadata(stage: EventLifecycleStage): {
  label: string;
  icon: string;
  color: string;
  bg: string;
} {
  switch (stage) {
    case 'CREATED':
      return { label: 'Created', icon: '📝', color: '#94A3B8', bg: 'rgba(148,163,184,0.12)' };
    case 'CONFIGURED':
      return { label: 'Configured', icon: '⚙️', color: '#FFB800', bg: 'rgba(255,184,0,0.12)' };
    case 'RESOURCES_BOOKED':
      return { label: 'Resources Booked', icon: '📦', color: '#00D2FF', bg: 'rgba(0,210,255,0.12)' };
    case 'READY':
      return { label: 'Match Ready', icon: '✅', color: '#00E599', bg: 'rgba(0,229,153,0.12)' };
    case 'LIVE':
      return { label: 'Live', icon: '🔴', color: '#FF3366', bg: 'rgba(255,51,102,0.15)' };
    case 'COMPLETED':
      return { label: 'Completed', icon: '🏁', color: '#A855F7', bg: 'rgba(168,85,247,0.12)' };
    case 'CANCELLED':
      return { label: 'Cancelled', icon: '❌', color: '#FF3366', bg: 'rgba(255,51,102,0.12)' };
  }
}

/**
 * Derives the lifecycle stage from procurement and lineup state.
 */
export function deriveLifecycleStage(
  procurement: ProcurementItem[],
  homeConfirmed: boolean,
  awayConfirmed: boolean,
  isLive: boolean,
  isCompleted: boolean
): EventLifecycleStage {
  if (isCompleted) return 'COMPLETED';
  if (isLive) return 'LIVE';

  const readiness = calculateProcurementReadiness(procurement);

  if (readiness.percent === 100 && homeConfirmed && awayConfirmed) return 'READY';
  if (readiness.percent >= 50) return 'RESOURCES_BOOKED';
  if (procurement.length > 0) return 'CONFIGURED';
  return 'CREATED';
}

/**
 * Renders the event lifecycle timeline stepper HTML.
 */
export function renderLifecycleTimelineHtml(currentStage: EventLifecycleStage): string {
  const stages: EventLifecycleStage[] = ['CREATED', 'CONFIGURED', 'RESOURCES_BOOKED', 'READY', 'LIVE', 'COMPLETED'];
  const currentIdx = stages.indexOf(currentStage);

  const steps = stages.map((s, i) => {
    const meta = getStageMetadata(s);
    let stateClass: string;
    if (i < currentIdx) stateClass = 'completed';
    else if (i === currentIdx) stateClass = 'active';
    else stateClass = 'upcoming';

    return `<div class="lifecycle-step ${stateClass}" data-tooltip="${meta.label}">
      <span class="lifecycle-icon">${i < currentIdx ? '✓' : meta.icon}</span>
      <span class="lifecycle-label">${meta.label}</span>
    </div>`;
  }).join('<div class="lifecycle-connector"></div>');

  return `<div class="lifecycle-timeline">${steps}</div>`;
}

/**
 * Renders the readiness ring SVG (0–100%).
 */
export function renderReadinessRingSvg(percent: number): string {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  const color = percent >= 100 ? '#00E599' : percent >= 60 ? '#FFB800' : '#FF3366';

  return `<svg width="140" height="140" viewBox="0 0 140 140" data-tooltip="Event readiness: ${percent}%">
    <circle cx="70" cy="70" r="${radius}" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="10"/>
    <circle cx="70" cy="70" r="${radius}" fill="none" stroke="${color}" stroke-width="10"
      stroke-linecap="round" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
      transform="rotate(-90 70 70)" style="transition: stroke-dashoffset 0.6s ease;"/>
    <text x="70" y="65" text-anchor="middle" fill="${color}" font-family="'Chakra Petch',monospace" font-size="28" font-weight="700">${percent}%</text>
    <text x="70" y="85" text-anchor="middle" fill="#94A3B8" font-family="'Plus Jakarta Sans',sans-serif" font-size="11" font-weight="500">READY</text>
  </svg>`;
}

/**
 * Renders procurement status cards HTML.
 */
export function renderProcurementCardsHtml(items: ProcurementItem[]): string {
  const categoryIcons: Record<string, string> = {
    VENUE: '🏟️',
    OFFICIAL: '👨‍⚖️',
    EQUIPMENT: '🏏',
    SERVICE: '📡'
  };

  const statusBadges: Record<string, { label: string; color: string }> = {
    PENDING: { label: '❌ Pending', color: '#FF3366' },
    SEARCHING: { label: '🔍 Searching', color: '#FFB800' },
    HELD: { label: '⏳ Held', color: '#FFB800' },
    BOOKED: { label: '✅ Booked', color: '#00E599' },
    CONFIRMED: { label: '✅ Confirmed', color: '#00E599' },
    CANCELLED: { label: '❌ Cancelled', color: '#FF3366' }
  };

  const cards = items.map(item => {
    const icon = categoryIcons[item.category] ?? '📦';
    const badge = statusBadges[item.status] ?? { label: item.status, color: '#94A3B8' };
    const priceDisplay = item.priceMinor !== undefined
      ? `₹${(item.priceMinor / 100).toLocaleString('en-IN')}`
      : '—';

    return `<div class="procurement-card" data-tooltip="${item.label}: ${badge.label}${item.required ? ' (Required)' : ' (Optional)'}">
      <div class="procurement-icon">${icon}</div>
      <div class="procurement-info">
        <div class="procurement-label">${item.label}${item.required ? ' <span style="color:#FF3366;font-size:0.7rem;">REQUIRED</span>' : ''}</div>
        <div class="procurement-provider">${item.providerName ?? 'Not assigned'}</div>
      </div>
      <div class="procurement-status" style="color:${badge.color}">${badge.label}</div>
      <div class="procurement-price">${priceDisplay}</div>
    </div>`;
  }).join('');

  return `<div class="procurement-list">${cards}</div>`;
}

/**
 * Creates a sample event overview state for demonstration.
 */
export function createSampleEventOverview(): EventOverviewState {
  const procurement: ProcurementItem[] = [
    { id: 'p1', category: 'VENUE', label: 'Turf Arena – Slot 18:00', required: true, status: 'BOOKED', providerName: 'Greenfield Cricket Club', priceMinor: 350000 },
    { id: 'p2', category: 'OFFICIAL', label: 'Lead Umpire', required: true, status: 'CONFIRMED', providerName: 'Ravi Kumar (4.8★)', priceMinor: 150000 },
    { id: 'p3', category: 'OFFICIAL', label: 'Square-Leg Umpire', required: true, status: 'HELD', providerName: 'Pending Acceptance', priceMinor: 150000, holdExpiresAt: new Date(Date.now() + 300_000).toISOString() },
    { id: 'p4', category: 'OFFICIAL', label: 'Official Scorer', required: true, status: 'PENDING' },
    { id: 'p5', category: 'EQUIPMENT', label: 'Match Balls (SG Test)', required: true, status: 'BOOKED', providerName: 'CricGear Pro', priceMinor: 85000 },
    { id: 'p6', category: 'EQUIPMENT', label: 'Stumps & Bails', required: true, status: 'BOOKED', providerName: 'CricGear Pro', priceMinor: 45000 },
    { id: 'p7', category: 'SERVICE', label: 'Live Streamer', required: false, status: 'PENDING' }
  ];

  const readiness = calculateProcurementReadiness(procurement);

  return {
    eventId: 'EVT-M9K2X-A7F3B1',
    title: 'Friday Night T20 — BLR Super Kings vs MUM Warriors',
    format: 'T20',
    overs: 20,
    stage: deriveLifecycleStage(procurement, true, false, false, false),
    scheduledDate: new Date(Date.now() + 86400_000 * 2).toISOString(),
    venueName: 'Greenfield Cricket Club',
    homeTeam: { teamId: 'blr', teamName: 'BLR Super Kings', shortCode: 'BSK', playingXIConfirmed: true, confirmedCount: 11, requiredCount: 11 },
    awayTeam: { teamId: 'mum', teamName: 'MUM Warriors', shortCode: 'MW', playingXIConfirmed: false, confirmedCount: 8, requiredCount: 11 },
    procurement,
    readinessPercent: readiness.percent,
    blockers: readiness.blockers,
    warnings: readiness.warnings
  };
}
