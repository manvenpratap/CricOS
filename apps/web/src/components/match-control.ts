/**
 * apps/web/src/components/match-control.ts
 *
 * Official Toss & Match Control Engine
 * Derived from Archive Specifications:
 * - 03_UX_Blueprint_v2.docx (Match Control & Toss Panel)
 * - 08_Sprint_Ready_P0_Backlog_v1.docx (CRK-001...010, Journey J1 & J2)
 *
 * Handles official match lifecycle state machines, toss recording,
 * playing XI verification, and rain contingency target recalculations.
 */

export type MatchLifecycleStatus =
  | 'SCHEDULED'
  | 'TOSS_DONE'
  | 'INNINGS_1'
  | 'INNINGS_BREAK'
  | 'INNINGS_2'
  | 'COMPLETED'
  | 'SUPER_OVER'
  | 'ABANDONED';

export interface TossRecord {
  winnerTeamId: string;
  winnerTeamName: string;
  decision: 'BAT' | 'BOWL';
  tossTime: string;
  confirmedByOfficial: string;
}

export interface MatchControlState {
  matchId: string;
  homeTeam: { id: string; name: string; shortCode: string };
  awayTeam: { id: string; name: string; shortCode: string };
  status: MatchLifecycleStatus;
  toss: TossRecord | null;
  scheduledOvers: number;
  currentInnings: 1 | 2;
  revisedTarget?: number;
}

/**
 * Returns human-readable label and color style for match lifecycle statuses.
 */
export function getMatchStatusMeta(status: MatchLifecycleStatus): { label: string; bg: string; color: string; border: string } {
  switch (status) {
    case 'SCHEDULED':
      return { label: 'SCHEDULED', bg: 'rgba(148, 163, 184, 0.15)', color: '#94A3B8', border: 'rgba(148, 163, 184, 0.3)' };
    case 'TOSS_DONE':
      return { label: 'TOSS COMPLETED', bg: 'rgba(255, 184, 0, 0.15)', color: '#FFB800', border: 'rgba(255, 184, 0, 0.3)' };
    case 'INNINGS_1':
      return { label: 'LIVE • 1ST INNINGS', bg: 'rgba(0, 229, 153, 0.15)', color: '#00E599', border: 'rgba(0, 229, 153, 0.35)' };
    case 'INNINGS_BREAK':
      return { label: 'INNINGS BREAK', bg: 'rgba(0, 210, 255, 0.15)', color: '#00D2FF', border: 'rgba(0, 210, 255, 0.35)' };
    case 'INNINGS_2':
      return { label: 'LIVE • CHASE', bg: 'rgba(0, 229, 153, 0.2)', color: '#00E599', border: 'rgba(0, 229, 153, 0.4)' };
    case 'COMPLETED':
      return { label: 'MATCH CONCLUDED', bg: 'rgba(192, 132, 252, 0.15)', color: '#C084FC', border: 'rgba(192, 132, 252, 0.35)' };
    case 'SUPER_OVER':
      return { label: '⚡ SUPER OVER', bg: 'rgba(255, 51, 102, 0.2)', color: '#FF3366', border: 'rgba(255, 51, 102, 0.4)' };
    case 'ABANDONED':
      return { label: 'ABANDONED', bg: 'rgba(255, 51, 102, 0.12)', color: '#FF3366', border: 'rgba(255, 51, 102, 0.25)' };
  }
}

/**
 * Recalculates revised target in overs-reduced matches (rain contingency / standard run-rate adjustment).
 */
export function calculateRevisedTarget(target: number, totalOvers: number, reducedOvers: number): number {
  if (reducedOvers >= totalOvers || totalOvers <= 0) return target;
  // Proportional run rate with 5% contingency premium for chasing team
  const runRate = target / totalOvers;
  const rawTarget = Math.ceil(runRate * reducedOvers * 1.05);
  return Math.max(1, rawTarget);
}

/**
 * Evaluates batting and bowling team assignments after toss.
 */
export function resolveInningsTeams(
  homeTeam: { id: string; name: string },
  awayTeam: { id: string; name: string },
  toss: TossRecord
): { batting1st: { id: string; name: string }; bowling1st: { id: string; name: string } } {
  const tossWinner = toss.winnerTeamId === homeTeam.id ? homeTeam : awayTeam;
  const tossLoser = toss.winnerTeamId === homeTeam.id ? awayTeam : homeTeam;

  if (toss.decision === 'BAT') {
    return { batting1st: tossWinner, bowling1st: tossLoser };
  } else {
    return { batting1st: tossLoser, bowling1st: tossWinner };
  }
}
