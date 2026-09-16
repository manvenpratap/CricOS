/**
 * apps/web/src/components/event-basket.ts
 *
 * Event Basket & Automated Requirements Generator
 * Derived from Archive Specifications:
 * - 03_UX_Blueprint_v2.docx (Event Basket & Readiness Bar)
 * - 08_Sprint_Ready_P0_Backlog_v1.docx (BAS-001...010, Journey J1 Captain)
 *
 * Manages required (Venue, Umpires, Scorer) and suggested (Live Stream, Catering)
 * resources, calculates 0–100% readiness score, and renders Stitch-styled basket cards.
 */

export type RequirementCategory = 'VENUE' | 'OFFICIAL_UMPIRE' | 'OFFICIAL_SCORER' | 'LIVE_STREAM' | 'COMMENTARY' | 'CATERING';
export type RequirementStatus = 'MISSING' | 'REQUESTED' | 'HELD' | 'CONFIRMED';

export interface EventRequirementItem {
  id: string;
  category: RequirementCategory;
  title: string;
  isRequired: boolean;
  status: RequirementStatus;
  providerName?: string;
  slotTime?: string;
  priceMinor: number;
}

export interface EventReadinessResult {
  percentage: number;
  totalRequired: number;
  confirmedRequired: number;
  missingItems: EventRequirementItem[];
  isReadyToStart: boolean;
}

/**
 * Calculates event operational readiness percentage based on required resources.
 */
export function calculateEventReadiness(items: EventRequirementItem[]): EventReadinessResult {
  const required = items.filter(x => x.isRequired);
  if (required.length === 0) {
    return {
      percentage: 100,
      totalRequired: 0,
      confirmedRequired: 0,
      missingItems: [],
      isReadyToStart: true
    };
  }

  const confirmed = required.filter(x => x.status === 'CONFIRMED' || x.status === 'HELD');
  const missing = required.filter(x => x.status === 'MISSING');
  const percentage = Math.round((confirmed.length / required.length) * 100);

  return {
    percentage,
    totalRequired: required.length,
    confirmedRequired: confirmed.length,
    missingItems: missing,
    isReadyToStart: percentage === 100
  };
}

/**
 * Generates canonical default requirements for a match event.
 */
export function generateDefaultMatchRequirements(venueTitle = 'Chinnaswamy Ground B'): EventRequirementItem[] {
  return [
    {
      id: 'req-venue',
      category: 'VENUE',
      title: 'Match Venue & Turf Pitch',
      isRequired: true,
      status: 'CONFIRMED',
      providerName: venueTitle,
      slotTime: '18:00 – 22:00 (Floodlit)',
      priceMinor: 250000 // ₹2,500.00
    },
    {
      id: 'req-umpire-1',
      category: 'OFFICIAL_UMPIRE',
      title: 'Lead On-field Umpire',
      isRequired: true,
      status: 'CONFIRMED',
      providerName: 'K. Ananthapadmanabhan (BCCI Level 2)',
      slotTime: '18:00 – 22:00',
      priceMinor: 60000 // ₹600.00
    },
    {
      id: 'req-umpire-2',
      category: 'OFFICIAL_UMPIRE',
      title: 'Leg-field Umpire',
      isRequired: true,
      status: 'HELD',
      providerName: 'R. Sundaram (State Certified)',
      slotTime: '18:00 – 22:00',
      priceMinor: 50000 // ₹500.00
    },
    {
      id: 'req-scorer',
      category: 'OFFICIAL_SCORER',
      title: 'Official Electronic Scorer',
      isRequired: true,
      status: 'CONFIRMED',
      providerName: 'CricOS Digital Scorer Desk',
      slotTime: '18:00 – 22:00',
      priceMinor: 40000 // ₹400.00
    },
    {
      id: 'req-stream',
      category: 'LIVE_STREAM',
      title: 'HD Multi-Cam Live Broadcast',
      isRequired: false,
      status: 'REQUESTED',
      providerName: 'CricCast Media Crew',
      slotTime: '18:00 – 22:00',
      priceMinor: 150000 // ₹1,500.00
    },
    {
      id: 'req-catering',
      category: 'CATERING',
      title: 'Dugout Hydration & Energy Pack',
      isRequired: false,
      status: 'CONFIRMED',
      providerName: 'Electrolyte Pro Sports Pack',
      slotTime: '17:30 Dispatch',
      priceMinor: 35000 // ₹350.00
    }
  ];
}

/**
 * Renders the Stitch-styled Event Readiness Progress Bar.
 */
export function renderEventReadinessBarHtml(readiness: EventReadinessResult): string {
  const isFull = readiness.percentage === 100;
  const barColor = isFull ? '#00E599' : readiness.percentage >= 70 ? '#00D2FF' : '#FFB800';

  return `
    <div class="event-readiness-card" style="background: rgba(10, 16, 28, 0.85); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1rem; margin-bottom: 1.25rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span style="font-size: 1.1rem;">⚡</span>
          <span style="font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 0.95rem; color: #f8fafc;">
            Event Operational Readiness
          </span>
          <span style="background: ${isFull ? 'rgba(0, 229, 153, 0.15)' : 'rgba(0, 210, 255, 0.15)'}; color: ${barColor}; border: 1px solid ${barColor}44; font-size: 0.72rem; font-weight: 700; padding: 0.15rem 0.5rem; border-radius: 9999px;">
            ${readiness.percentage}% CONFIRMED
          </span>
        </div>
        <div style="font-size: 0.8rem; color: #94a3b8;">
          ${readiness.confirmedRequired} of ${readiness.totalRequired} required items secured
        </div>
      </div>

      <!-- Kinetic Progress Track -->
      <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.06); border-radius: 9999px; overflow: hidden; position: relative;">
        <div style="width: ${readiness.percentage}%; height: 100%; background: linear-gradient(90deg, #00E599, #00D2FF); border-radius: 9999px; transition: width 0.4s ease; box-shadow: 0 0 10px ${barColor}66;"></div>
      </div>

      ${readiness.missingItems.length > 0 ? `
        <div style="margin-top: 0.6rem; font-size: 0.78rem; color: #FFB800; display: flex; align-items: center; gap: 0.4rem;">
          <span>⚠️ Missing:</span>
          <span>${readiness.missingItems.map(m => m.title).join(', ')}</span>
        </div>
      ` : `
        <div style="margin-top: 0.6rem; font-size: 0.78rem; color: #00E599; display: flex; align-items: center; gap: 0.4rem;">
          <span>✓ All mandatory sporting resources confirmed. Fixture is ready for toss.</span>
        </div>
      `}
    </div>
  `;
}

/**
 * Formats minor currency to Indian Rupees.
 */
export function formatMinorInr(amountMinor: number): string {
  return `₹${(amountMinor / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
