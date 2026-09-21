export type IncidentSeverity = 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'LEVEL_4';
export type IncidentType = 'DISSENT' | 'EQUIPMENT_ABUSE' | 'OBSCENITY' | 'BALL_TAMPERING' | 'SLOW_OVER_RATE';

export interface IncidentRecord {
  id: string;
  matchId: string;
  playerName: string;
  teamName: string;
  severity: IncidentSeverity;
  type: IncidentType;
  description: string;
  penaltyRuns: number;
  reportedAt: string;
}

export interface DrsReviewRecord {
  id: string;
  over: string;
  battingTeam: string;
  decision: 'OUT' | 'NOT_OUT' | 'UMPIRES_CALL';
  retained: boolean;
  ballTracking: string;
}

export interface IncidentsScreenState {
  matchId: string;
  matchSignedOff: boolean;
  incidents: IncidentRecord[];
  drsReviews: DrsReviewRecord[];
  isSubmitting: boolean;
}

export class IncidentsScreenController {
  private state: IncidentsScreenState;

  constructor(initialState?: Partial<IncidentsScreenState>) {
    this.state = {
      matchId: initialState?.matchId || 'match-pilot-1',
      matchSignedOff: initialState?.matchSignedOff || false,
      incidents: initialState?.incidents || [
        {
          id: 'inc-101',
          matchId: 'match-pilot-1',
          playerName: 'Hardik Patel',
          teamName: 'Delhi Daredevils',
          severity: 'LEVEL_1',
          type: 'DISSENT',
          description: 'Showed dissent at umpire decision following LBW appeal turn-down',
          penaltyRuns: 0,
          reportedAt: '14:28:10'
        }
      ],
      drsReviews: initialState?.drsReviews || [
        {
          id: 'drs-1',
          over: '14.3',
          battingTeam: 'Delhi Daredevils',
          decision: 'UMPIRES_CALL',
          retained: true,
          ballTracking: 'Pitching In-Line • Impact In-Line • Wickets Hitting'
        }
      ],
      isSubmitting: false
    };
  }

  public getState(): IncidentsScreenState {
    return JSON.parse(JSON.stringify(this.state));
  }

  public reportIncident(incident: Omit<IncidentRecord, 'id' | 'reportedAt'>): IncidentRecord {
    const newRecord: IncidentRecord = {
      ...incident,
      id: `inc-${Date.now()}`,
      reportedAt: new Date().toLocaleTimeString()
    };
    this.state.incidents.unshift(newRecord);
    return newRecord;
  }

  public logDrsReview(review: Omit<DrsReviewRecord, 'id'>): DrsReviewRecord {
    const newReview: DrsReviewRecord = {
      ...review,
      id: `drs-${Date.now()}`
    };
    this.state.drsReviews.unshift(newReview);
    return newReview;
  }

  public signOffMatch(): void {
    this.state.matchSignedOff = true;
  }

  public renderMobileHtml(isUmpire: boolean = true): string {
    return `
      <div class="mobile-incidents-screen" style="padding: 1rem; color: #f8fafc; font-family: 'Plus Jakarta Sans', sans-serif;">
        <!-- Header & Match Sign-off Card -->
        <div style="background: rgba(10, 16, 28, 0.9); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 1.25rem; margin-bottom: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <div style="font-size: 0.75rem; color: #38BDF8; font-weight: 700; text-transform: uppercase;">Fair Play & Integrity</div>
              <h2 style="margin: 0.2rem 0 0; font-size: 1.25rem; font-family: 'Space Grotesk', sans-serif;">Official Umpire Desk</h2>
              <div style="font-size: 0.8rem; color: #94a3b8; margin-top: 0.2rem;">Match #${this.state.matchId} • Lead Umpire Nitin Menon</div>
            </div>
            <span style="font-size: 1.25rem;">⚖️</span>
          </div>

          <div style="margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center;">
            <div>
              <span style="font-size: 0.8rem; color: #94a3b8;">Sign-off: </span>
              <strong style="color: ${this.state.matchSignedOff ? '#00E599' : '#FFB800'}; font-size: 0.85rem;">
                ${this.state.matchSignedOff ? '✓ CERTIFIED BY UMPIRE' : '⏳ PENDING MATCH CLOSE'}
              </strong>
            </div>
            ${isUmpire && !this.state.matchSignedOff ? `
              <button type="button" onclick="window.cricosMobileApp.signOffMatchAction()" style="padding: 0.4rem 0.8rem; border-radius: 6px; border: none; background: linear-gradient(135deg, #38BDF8, #00E599); color: #04070D; font-weight: 700; font-size: 0.75rem; cursor: pointer;" data-tooltip="Certify match results under MCC Laws">
                Sign Off Match ✓
              </button>
            ` : ''}
          </div>
        </div>

        <!-- File Incident Quick Action Form (for Umpire/Admin) -->
        ${isUmpire ? `
          <div style="background: rgba(10, 16, 28, 0.85); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1rem; margin-bottom: 1rem;">
            <div style="font-size: 0.85rem; font-weight: 700; color: #f8fafc; margin-bottom: 0.6rem; font-family: 'Space Grotesk', sans-serif;">
              🚨 Log Code of Conduct Breach
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 0.5rem;">
              <input type="text" id="incidentPlayerInput" placeholder="Player Name" style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; padding: 0.5rem; color: #f8fafc; font-size: 0.8rem;" />
              <select id="incidentSeveritySelect" style="background: rgba(10,16,28,0.9); border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; padding: 0.5rem; color: #f8fafc; font-size: 0.8rem;">
                <option value="LEVEL_1">Level 1 (Warning)</option>
                <option value="LEVEL_2">Level 2 (Penalty)</option>
                <option value="LEVEL_3">Level 3 (Suspension)</option>
                <option value="LEVEL_4">Level 4 (Removal)</option>
              </select>
            </div>
            <input type="text" id="incidentDescInput" placeholder="Breach details (e.g. Dissent against wide call)" style="width: 100%; box-sizing: border-box; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; padding: 0.5rem; color: #f8fafc; font-size: 0.8rem; margin-bottom: 0.6rem;" />
            <div style="display: flex; gap: 0.5rem;">
              <button type="button" onclick="window.cricosMobileApp.fileIncidentAction()" style="flex: 1; padding: 0.5rem; border-radius: 6px; border: 1px solid rgba(255, 51, 102, 0.4); background: rgba(255, 51, 102, 0.15); color: #ff8099; font-weight: 700; font-size: 0.75rem; cursor: pointer;" data-tooltip="Log official Code of Conduct breach">
                File Breach Record
              </button>
              <button type="button" onclick="window.cricosMobileApp.addPenaltyRunsAction(5)" style="padding: 0.5rem 0.8rem; border-radius: 6px; border: 1px solid rgba(255, 184, 0, 0.4); background: rgba(255, 184, 0, 0.15); color: #ffb800; font-weight: 700; font-size: 0.75rem; cursor: pointer;" data-tooltip="Award 5 penalty runs to batting team per MCC Law 41/42">
                +5 Penalty Runs
              </button>
            </div>
          </div>
        ` : ''}

        <!-- DRS Reviews History -->
        <div style="background: rgba(10, 16, 28, 0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden; margin-bottom: 1rem;">
          <div style="padding: 0.75rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 700; font-size: 0.85rem; font-family: 'Space Grotesk', sans-serif;">📺 DRS Tracking & Ball Trajectory</span>
            <span style="font-size: 0.7rem; color: #38BDF8;">UltraEdge & HawkEye</span>
          </div>
          <div style="display: flex; flex-direction: column;">
            ${this.state.drsReviews.map(d => `
              <div style="padding: 0.75rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.04);">
                <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 0.25rem;">
                  <span style="font-weight: 600; color: #f8fafc;">Over ${d.over} • ${d.battingTeam}</span>
                  <span style="font-weight: 700; color: ${d.decision === 'OUT' ? '#ff3366' : '#00E599'};">${d.decision}</span>
                </div>
                <div style="font-size: 0.75rem; color: #94a3b8;">${d.ballTracking}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Incident Feed -->
        <div style="background: rgba(10, 16, 28, 0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden; margin-bottom: 1rem;">
          <div style="padding: 0.75rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.08); font-weight: 700; font-size: 0.85rem; font-family: 'Space Grotesk', sans-serif;">
            📋 Recent Disciplinary Incidents (${this.state.incidents.length})
          </div>
          <div style="display: flex; flex-direction: column;">
            ${this.state.incidents.map(inc => `
              <div style="padding: 0.75rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.04);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                  <span style="font-size: 0.85rem; font-weight: 700; color: #ff8099;">${inc.playerName}</span>
                  <span style="font-size: 0.65rem; background: rgba(255,51,102,0.15); color: #ff3366; border: 1px solid rgba(255,51,102,0.3); padding: 0.15rem 0.4rem; border-radius: 4px; font-weight: 700;">${inc.severity}</span>
                </div>
                <div style="font-size: 0.75rem; color: #cbd5e1;">${inc.description}</div>
                <div style="font-size: 0.65rem; color: #64748b; margin-top: 0.2rem;">${inc.teamName} • ${inc.reportedAt}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }
}
