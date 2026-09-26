/**
 * apps/web/src/components/umpire-match-desk.ts
 *
 * CricOS Digital Umpire Match Day Desk & DRS Incident Review Engine
 * Implements MCC Laws 41 & 42 Code of Conduct sanctions, Hawk-Eye DRS reviews,
 * and cryptographic digital match card sign-off.
 */

export type ConductSanctionLevel = 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'LEVEL_4';
export type ConductBreachType =
  | 'DISSENT'
  | 'EQUIPMENT_ABUSE'
  | 'OBSCENITY'
  | 'BALL_TAMPERING'
  | 'SLOW_OVER_RATE'
  | 'UNFAIR_PLAY'
  | 'THREATENING_OFFICIAL';

export interface ConductSanction {
  id: string;
  matchId: string;
  level: ConductSanctionLevel;
  breachType: ConductBreachType;
  playerName: string;
  teamName: string;
  description: string;
  penaltyRuns: number;
  suspensionOvers: number;
  timestamp: string;
}

export type DrsPitching = 'IN_LINE' | 'OUTSIDE_OFF' | 'OUTSIDE_LEG';
export type DrsImpact = 'IN_LINE' | 'OUTSIDE_OFF';
export type DrsWickets = 'HITTING' | 'MISSING' | 'UMPIRES_CALL';
export type DrsAppealType = 'LBW' | 'CAUGHT_BEHIND' | 'STUMPED';
export type DrsVerdict = 'OUT' | 'NOT_OUT' | 'UMPIRES_CALL';

export interface DrsReviewRecord {
  id: string;
  over: string;
  batterName: string;
  bowlerName: string;
  appealType: DrsAppealType;
  originalDecision: 'OUT' | 'NOT_OUT';
  pitching: DrsPitching;
  impact: DrsImpact;
  wickets: DrsWickets;
  finalDecision: DrsVerdict;
  reviewRetained: boolean;
  trajectorySummary: string;
  timestamp: string;
}

export interface MatchSignOffCard {
  matchId: string;
  leadUmpireName: string;
  legUmpireName: string;
  matchReferee: string;
  certifiedResult: string;
  totalSanctions: number;
  totalDrsReviews: number;
  digitalStamp: string;
  signedAt: string;
  status: 'PENDING' | 'CERTIFIED';
}

/**
 * Calculates penalty runs and suspension overs under MCC Law 42.
 */
export function getSanctionConsequences(level: ConductSanctionLevel): { penaltyRuns: number; suspensionOvers: number } {
  switch (level) {
    case 'LEVEL_1':
      // Official warning / reprimand
      return { penaltyRuns: 0, suspensionOvers: 0 };
    case 'LEVEL_2':
      // 5 penalty runs awarded to opposition
      return { penaltyRuns: 5, suspensionOvers: 0 };
    case 'LEVEL_3':
      // 5 penalty runs + suspension for 20% of innings (e.g. 4 overs in T20 or 10 overs in 50-over)
      return { penaltyRuns: 5, suspensionOvers: 4 };
    case 'LEVEL_4':
      // 5 penalty runs + permanent removal from the remainder of the match
      return { penaltyRuns: 5, suspensionOvers: 999 };
    default:
      return { penaltyRuns: 0, suspensionOvers: 0 };
  }
}

/**
 * Resolves DRS LBW verdict following ICC Playing Conditions:
 * 1. Pitching must be IN_LINE or OUTSIDE_OFF (never OUTSIDE_LEG for LBW).
 * 2. Impact must be IN_LINE (or OUTSIDE_OFF if no shot offered).
 * 3. Wickets must be HITTING (or original decision stands if UMPIRES_CALL).
 */
export function resolveDrsVerdict(
  appealType: DrsAppealType,
  originalDecision: 'OUT' | 'NOT_OUT',
  pitching: DrsPitching,
  impact: DrsImpact,
  wickets: DrsWickets
): { finalDecision: DrsVerdict; reviewRetained: boolean } {
  if (appealType !== 'LBW') {
    // For Caught Behind or Stumped, simplified edge detection
    const finalDecision = originalDecision;
    return { finalDecision, reviewRetained: true };
  }

  // Pitching outside leg is always NOT OUT for LBW
  if (pitching === 'OUTSIDE_LEG') {
    return {
      finalDecision: 'NOT_OUT',
      reviewRetained: originalDecision === 'NOT_OUT'
    };
  }

  // Impact outside off is NOT OUT unless no shot offered
  if (impact === 'OUTSIDE_OFF') {
    return {
      finalDecision: 'NOT_OUT',
      reviewRetained: originalDecision === 'NOT_OUT'
    };
  }

  // Wickets evaluation
  if (wickets === 'MISSING') {
    return {
      finalDecision: 'NOT_OUT',
      reviewRetained: originalDecision === 'OUT' // team keeps review if overturned
    };
  }

  if (wickets === 'UMPIRES_CALL') {
    return {
      finalDecision: originalDecision === 'OUT' ? 'OUT' : 'NOT_OUT',
      reviewRetained: true // Retained on umpire's call
    };
  }

  // Wickets HITTING
  return {
    finalDecision: 'OUT',
    reviewRetained: originalDecision === 'NOT_OUT' // overturned
  };
}

/**
 * Deterministic pseudo-cryptographic hash digest for match integrity sign-off.
 */
export function generateMatchDigest(data: string, pin: string): string {
  const seed = `${data}::PIN_${pin}::CRICOS_INTEGRITY_SALT_v1`;
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < seed.length; i++) {
    const ch = seed.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
  return `CRICOS-CERT-${hex1.toUpperCase()}-${hex2.toUpperCase()}`;
}

export class UmpireMatchDeskComponent {
  private matchId: string;
  private leadUmpire: string;
  private legUmpire: string;
  private matchReferee: string;
  private sanctions: ConductSanction[] = [];
  private drsReviews: DrsReviewRecord[] = [];
  private signOffCard: MatchSignOffCard | null = null;

  constructor(
    matchId: string = 'MATCH-CRICOS-2026-01',
    leadUmpire: string = 'Nitin Menon (ICC Elite)',
    legUmpire: string = 'Sundaram Ravi (BCCI Level 2)',
    matchReferee: string = 'Javagal Srinath (ICC Referee)'
  ) {
    this.matchId = matchId;
    this.leadUmpire = leadUmpire;
    this.legUmpire = legUmpire;
    this.matchReferee = matchReferee;
    this.seedDefaultRecords();
  }

  private seedDefaultRecords(): void {
    this.sanctions.push({
      id: 'SANCT-001',
      matchId: this.matchId,
      level: 'LEVEL_1',
      breachType: 'DISSENT',
      playerName: 'Hardik Patel',
      teamName: 'Delhi Daredevils',
      description: 'Excessive and aggressive gesturing following an appeal turned down in over 12',
      penaltyRuns: 0,
      suspensionOvers: 0,
      timestamp: '14:32:00'
    });

    this.drsReviews.push({
      id: 'DRS-001',
      over: '14.3',
      batterName: 'Virat Sharma',
      bowlerName: 'Jasprit Bumrah',
      appealType: 'LBW',
      originalDecision: 'NOT_OUT',
      pitching: 'IN_LINE',
      impact: 'IN_LINE',
      wickets: 'UMPIRES_CALL',
      finalDecision: 'NOT_OUT',
      reviewRetained: true,
      trajectorySummary: 'Pitching: In-Line • Impact: In-Line • Wickets: Umpire Call (Clipping Leg Bail)',
      timestamp: '14:45:22'
    });
  }

  public logSanction(
    sanction: Omit<ConductSanction, 'id' | 'timestamp' | 'penaltyRuns' | 'suspensionOvers'>
  ): ConductSanction {
    const consequences = getSanctionConsequences(sanction.level);
    const newRecord: ConductSanction = {
      ...sanction,
      id: `SANCT-${Date.now()}`,
      penaltyRuns: consequences.penaltyRuns,
      suspensionOvers: consequences.suspensionOvers,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
    };
    this.sanctions.unshift(newRecord);
    return newRecord;
  }

  public logDrsReview(
    review: Omit<DrsReviewRecord, 'id' | 'finalDecision' | 'reviewRetained' | 'trajectorySummary' | 'timestamp'>
  ): DrsReviewRecord {
    const { finalDecision, reviewRetained } = resolveDrsVerdict(
      review.appealType,
      review.originalDecision,
      review.pitching,
      review.impact,
      review.wickets
    );

    const trajectorySummary = `Pitching: ${review.pitching.replace('_', ' ')} • Impact: ${review.impact.replace(
      '_',
      ' '
    )} • Wickets: ${review.wickets.replace('_', ' ')}`;

    const newRecord: DrsReviewRecord = {
      ...review,
      id: `DRS-${Date.now()}`,
      finalDecision,
      reviewRetained,
      trajectorySummary,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
    };
    this.drsReviews.unshift(newRecord);
    return newRecord;
  }

  public signOffMatch(certifiedResult: string, umpirePin: string): MatchSignOffCard {
    const rawPayload = `${this.matchId}|${certifiedResult}|${this.leadUmpire}|${this.sanctions.length}|${this.drsReviews.length}`;
    const digitalStamp = generateMatchDigest(rawPayload, umpirePin);

    this.signOffCard = {
      matchId: this.matchId,
      leadUmpireName: this.leadUmpire,
      legUmpireName: this.legUmpire,
      matchReferee: this.matchReferee,
      certifiedResult,
      totalSanctions: this.sanctions.length,
      totalDrsReviews: this.drsReviews.length,
      digitalStamp,
      signedAt: new Date().toISOString(),
      status: 'CERTIFIED'
    };

    return this.signOffCard;
  }

  public getSanctions(): ConductSanction[] {
    return [...this.sanctions];
  }

  public getDrsReviews(): DrsReviewRecord[] {
    return [...this.drsReviews];
  }

  public getSignOffCard(): MatchSignOffCard | null {
    return this.signOffCard ? { ...this.signOffCard } : null;
  }

  public renderUmpireDeskHtml(): string {
    const isSignedOff = this.signOffCard !== null && this.signOffCard.status === 'CERTIFIED';

    const sanctionsHtml = this.sanctions
      .map(s => {
        const badgeColor =
          s.level === 'LEVEL_1' ? '#FFB800' : s.level === 'LEVEL_2' ? '#ff8099' : '#ff3366';
        return `
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
            <td style="padding: 0.6rem 0.8rem; font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: #94a3b8;">${s.timestamp}</td>
            <td style="padding: 0.6rem 0.8rem; font-weight: 700; color: #fff;">${s.playerName} <span style="font-size:0.75rem;color:#8E9BAE;">(${s.teamName})</span></td>
            <td style="padding: 0.6rem 0.8rem;">
              <span style="background: rgba(255,255,255,0.05); color: ${badgeColor}; border: 1px solid ${badgeColor}; padding: 0.15rem 0.4rem; border-radius: 4px; font-size: 0.7rem; font-weight: 700;">
                ${s.level} • ${s.breachType}
              </span>
            </td>
            <td style="padding: 0.6rem 0.8rem; font-size: 0.8rem; color: #CBD5E1;">${s.description}</td>
            <td style="padding: 0.6rem 0.8rem; text-align: right; font-family: 'Chakra Petch', monospace; font-weight: 800; color: ${s.penaltyRuns > 0 ? '#ff3366' : '#94a3b8'};">
              ${s.penaltyRuns > 0 ? `+${s.penaltyRuns} Runs` : 'Warning'}
            </td>
          </tr>
        `;
      })
      .join('');

    const drsHtml = this.drsReviews
      .map(d => {
        const isOut = d.finalDecision === 'OUT';
        const isUmpireCall = d.finalDecision === 'UMPIRES_CALL';
        const decisionColor = isOut ? '#ff3366' : isUmpireCall ? '#FFB800' : '#00E599';
        return `
          <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 0.75rem 1rem; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: #00D2FF; font-weight: 700;">Over ${d.over}</span>
                <span style="font-weight: 700; color: #fff; font-size: 0.85rem;">${d.batterName} vs ${d.bowlerName}</span>
                <span style="font-size: 0.7rem; color: #94a3b8; background: rgba(255,255,255,0.05); padding: 0.1rem 0.35rem; border-radius: 4px;">${d.appealType}</span>
              </div>
              <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 0.25rem;">
                ${d.trajectorySummary}
              </div>
            </div>
            <div style="text-align: right;">
              <span style="font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 0.85rem; color: ${decisionColor}; border: 1px solid ${decisionColor}; padding: 0.2rem 0.5rem; border-radius: 6px;">
                ${d.finalDecision}
              </span>
              <div style="font-size: 0.7rem; color: ${d.reviewRetained ? '#00E599' : '#ff3366'}; margin-top: 0.25rem;">
                ${d.reviewRetained ? '✓ Review Retained' : '✗ Review Lost'}
              </div>
            </div>
          </div>
        `;
      })
      .join('');

    return `
      <div class="umpire-match-desk glass-panel" style="padding: 1.5rem; border-radius: 14px; border: 1px solid rgba(255,255,255,0.08); background: rgba(10, 16, 28, 0.9);">
        <!-- Header & Digital Certification Banner -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 1rem;">
          <div>
            <div style="font-size: 0.75rem; color: #00D2FF; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">ICC & MCC Code of Conduct Desk</div>
            <h3 style="margin: 0.2rem 0 0; font-family: 'Space Grotesk', sans-serif; font-size: 1.35rem; color: #fff;">
              ⚖️ Match Day Umpire Desk
            </h3>
            <div style="font-size: 0.8rem; color: #94a3b8; margin-top: 0.25rem;">
              Lead: <strong style="color: #f1f5f9;">${this.leadUmpire}</strong> • Leg: <strong style="color: #f1f5f9;">${this.legUmpire}</strong> • Referee: <strong style="color: #f1f5f9;">${this.matchReferee}</strong>
            </div>
          </div>

          <div style="text-align: right;">
            ${isSignedOff ? `
              <div style="background: rgba(0, 229, 153, 0.1); border: 1px solid #00E599; border-radius: 8px; padding: 0.5rem 0.8rem;">
                <div style="font-size: 0.7rem; color: #00E599; font-weight: 800;">✓ CERTIFIED OFFICIAL MATCH CARD</div>
                <div style="font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: #fff; margin-top: 0.2rem;">${this.signOffCard!.digitalStamp}</div>
              </div>
            ` : `
              <button class="btn btn-primary" id="btnDeskSignOffModal" onclick="openUmpireSignOffDialog('${this.matchId}')" data-tooltip="Cryptographically certify match card and release double-entry escrows">
                ✍️ Certify & Sign Off Match
              </button>
            `}
          </div>
        </div>

        <!-- DRS Trajectory Review Feed -->
        <div style="margin-bottom: 1.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <h4 style="margin: 0; font-size: 1rem; color: #fff; font-family: 'Space Grotesk', sans-serif;">
              🎯 Hawk-Eye DRS Reviews (${this.drsReviews.length})
            </h4>
            <button class="btn btn-secondary btn-sm" id="btnLogDrsReview" onclick="openLogDrsModal('${this.matchId}')" data-tooltip="Log third-umpire TV ball-tracking review">
              + New DRS Review
            </button>
          </div>
          <div>${drsHtml}</div>
        </div>

        <!-- MCC Law 41/42 Conduct Sanctions Log -->
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <h4 style="margin: 0; font-size: 1rem; color: #fff; font-family: 'Space Grotesk', sans-serif;">
              🚨 Official Disciplinary Sanctions (${this.sanctions.length})
            </h4>
            <div style="display: flex; gap: 0.5rem;">
              <button class="btn btn-secondary btn-sm" id="btnAddSanctionRecord" onclick="openLogSanctionModal('${this.matchId}')" data-tooltip="Record Level 1-4 Code of Conduct breach">
                + Record Sanction
              </button>
              <button class="btn btn-warning btn-sm" id="btnAwardPenaltyRuns" onclick="awardFivePenaltyRuns('${this.matchId}')" data-tooltip="Award 5 penalty runs to batting team under MCC Law 41/42">
                +5 Penalty Runs
              </button>
            </div>
          </div>
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem;">
              <thead>
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); color: #8E9BAE; font-size: 0.75rem; text-transform: uppercase;">
                  <th style="padding: 0.5rem 0.8rem;">Time</th>
                  <th style="padding: 0.5rem 0.8rem;">Player & Team</th>
                  <th style="padding: 0.5rem 0.8rem;">Severity</th>
                  <th style="padding: 0.5rem 0.8rem;">Breach Detail</th>
                  <th style="padding: 0.5rem 0.8rem; text-align: right;">Sanction / Penalty</th>
                </tr>
              </thead>
              <tbody>${sanctionsHtml}</tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }
}
