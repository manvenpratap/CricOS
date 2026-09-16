export interface BatterState {
  playerId: string;
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  isStriker: boolean;
}

export interface BowlerState {
  playerId: string;
  name: string;
  overs: number;
  ballsThisOver: number;
  maidens: number;
  runsConceded: number;
  wickets: number;
}

export interface FallOfWicket {
  wicketNumber: number;
  playerOut: string;
  runsAtDismissal: number;
  overNumber: string;
}

export interface DeliveryInput {
  runs: number;
  isExtra?: boolean;
  extraType?: 'WIDE' | 'NO_BALL' | 'BYE' | 'LEG_BYE';
  isWicket?: boolean;
  wicketType?: 'BOWLED' | 'CAUGHT' | 'LBW' | 'RUN_OUT' | 'STUMPED';
  dismissedPlayerId?: string;
  newBatterId?: string;
  newBatterName?: string;
}

export interface LiveMatchScreenState {
  matchId: string;
  battingTeam: string;
  bowlingTeam: string;
  totalRuns: number;
  totalWickets: number;
  legalBalls: number;
  striker: BatterState;
  nonStriker: BatterState;
  bowler: BowlerState;
  currentOverDeliveries: string[];
  fallOfWickets: FallOfWicket[];
  isOverComplete: boolean;
}

export class LiveMatchScreenController {
  private state: LiveMatchScreenState;
  private history: LiveMatchScreenState[] = [];

  constructor(initialState: LiveMatchScreenState) {
    this.state = JSON.parse(JSON.stringify(initialState));
  }

  public getState(): LiveMatchScreenState {
    return JSON.parse(JSON.stringify(this.state));
  }

  public getStriker(): BatterState {
    return this.state.striker;
  }

  public getNonStriker(): BatterState {
    return this.state.nonStriker;
  }

  public getBowler(): BowlerState {
    return this.state.bowler;
  }

  public getFormattedScore(): string {
    const overs = Math.floor(this.state.legalBalls / 6);
    const balls = this.state.legalBalls % 6;
    return `${this.state.totalRuns}/${this.state.totalWickets} (${overs}.${balls} ov)`;
  }

  public recordDelivery(delivery: DeliveryInput): LiveMatchScreenState {
    // Push snapshot for undo
    this.history.push(JSON.parse(JSON.stringify(this.state)));

    const isLegal = !delivery.isExtra || (delivery.extraType !== 'WIDE' && delivery.extraType !== 'NO_BALL');
    const runsToAdd = delivery.runs;
    
    // Update team score
    this.state.totalRuns += runsToAdd;

    // Batter stats
    if (!delivery.isExtra || delivery.extraType === 'BYE' || delivery.extraType === 'LEG_BYE' || delivery.extraType === 'NO_BALL') {
      if (delivery.extraType !== 'BYE' && delivery.extraType !== 'LEG_BYE') {
        this.state.striker.runs += delivery.runs;
        if (delivery.runs === 4) this.state.striker.fours += 1;
        if (delivery.runs === 6) this.state.striker.sixes += 1;
      }
      if (delivery.extraType !== 'WIDE') {
        this.state.striker.balls += 1;
      }
    }

    // Bowler stats
    if (delivery.extraType !== 'BYE' && delivery.extraType !== 'LEG_BYE') {
      this.state.bowler.runsConceded += runsToAdd;
    }

    // Delivery chip formatting
    let chipDisplay = '';
    if (delivery.isWicket) {
      chipDisplay = 'W';
    } else if (delivery.isExtra) {
      if (delivery.extraType === 'WIDE') chipDisplay = `${runsToAdd}wd`;
      else if (delivery.extraType === 'NO_BALL') chipDisplay = `${runsToAdd}nb`;
      else if (delivery.extraType === 'BYE') chipDisplay = `${runsToAdd}b`;
      else chipDisplay = `${runsToAdd}lb`;
    } else if (runsToAdd === 0) {
      chipDisplay = '•';
    } else {
      chipDisplay = `${runsToAdd}`;
    }
    this.state.currentOverDeliveries.push(chipDisplay);

    // Legal ball accounting
    if (isLegal) {
      this.state.legalBalls += 1;
      this.state.bowler.ballsThisOver += 1;
    }

    // Wicket accounting
    if (delivery.isWicket) {
      this.state.totalWickets += 1;
      if (delivery.wicketType !== 'RUN_OUT') {
        this.state.bowler.wickets += 1;
      }
      const overs = Math.floor(this.state.legalBalls / 6);
      const balls = this.state.legalBalls % 6;
      this.state.fallOfWickets.push({
        wicketNumber: this.state.totalWickets,
        playerOut: this.state.striker.name,
        runsAtDismissal: this.state.totalRuns,
        overNumber: `${overs}.${balls}`
      });

      // Substitute new batter if supplied
      if (delivery.newBatterId && delivery.newBatterName) {
        this.state.striker = {
          playerId: delivery.newBatterId,
          name: delivery.newBatterName,
          runs: 0,
          balls: 0,
          fours: 0,
          sixes: 0,
          isStriker: true
        };
      }
    }

    // Strike rotation on odd runs (only if not a run out where non-striker was out or similar)
    const physicalRuns = delivery.runs;
    if (physicalRuns % 2 === 1) {
      this.rotateStrike();
    }

    // Check over completion (6 legal balls in current over)
    if (this.state.bowler.ballsThisOver === 6) {
      this.state.isOverComplete = true;
      this.state.bowler.overs += 1;
      if (this.state.bowler.ballsThisOver === 6 && !this.state.currentOverDeliveries.some(d => d !== '•' && !d.includes('W'))) {
        // maiden over check
        this.state.bowler.maidens += 1;
      }
      this.state.bowler.ballsThisOver = 0;
      // Strike rotates at end of over
      this.rotateStrike();
    } else {
      this.state.isOverComplete = false;
    }

    return this.getState();
  }

  public rotateStrike(): void {
    const temp = this.state.striker;
    this.state.striker = this.state.nonStriker;
    this.state.nonStriker = temp;

    this.state.striker.isStriker = true;
    this.state.nonStriker.isStriker = false;
  }

  public startNewOver(newBowler: BowlerState): void {
    this.state.bowler = newBowler;
    this.state.currentOverDeliveries = [];
    this.state.isOverComplete = false;
  }

  public undo(): LiveMatchScreenState | null {
    const previous = this.history.pop();
    if (previous) {
      this.state = previous;
      return this.getState();
    }
    return null;
  }

  public renderMobileHtml(): string {
    const overs = Math.floor(this.state.legalBalls / 6);
    const balls = this.state.legalBalls % 6;
    const crr = this.state.legalBalls > 0
      ? ((this.state.totalRuns / this.state.legalBalls) * 6).toFixed(2)
      : '0.00';

    return `
      <div class="mobile-live-screen" style="padding:16px;background:#090d16;color:#f8fafc;font-family:sans-serif;max-width:480px;margin:auto;">
        <!-- Header -->
        <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
          <span style="font-weight:700;color:#10b981;">🔴 LIVE</span>
          <span style="font-size:12px;color:#94a3b8;">Match #${this.state.matchId}</span>
        </div>

        <!-- Score Card Banner -->
        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px;text-align:center;margin-bottom:16px;">
          <div style="font-size:14px;color:#cbd5e1;">${this.state.battingTeam}</div>
          <div style="font-size:32px;font-weight:800;color:#f8fafc;margin:6px 0;">${this.state.totalRuns}/${this.state.totalWickets}</div>
          <div style="font-size:13px;color:#94a3b8;">Overs: ${overs}.${balls} | CRR: ${crr}</div>
        </div>

        <!-- Over Strip -->
        <div style="margin-bottom:16px;">
          <div style="font-size:12px;color:#94a3b8;margin-bottom:6px;">This Over:</div>
          <div style="display:flex;gap:6px;overflow-x:auto;">
            ${this.state.currentOverDeliveries.map(d => `<span style="display:inline-block;padding:4px 8px;border-radius:6px;background:rgba(255,255,255,0.06);font-weight:600;font-size:13px;">${d}</span>`).join('')}
          </div>
        </div>

        <!-- Batters Active Strip -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">
          <div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.25);border-radius:8px;padding:10px;" data-tooltip="On Strike">
            <div style="font-size:13px;font-weight:700;color:#10b981;">${this.state.striker.name} *</div>
            <div style="font-size:12px;color:#cbd5e1;">${this.state.striker.runs} (${this.state.striker.balls})</div>
          </div>
          <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:10px;" data-tooltip="Non-Striker">
            <div style="font-size:13px;font-weight:600;color:#cbd5e1;">${this.state.nonStriker.name}</div>
            <div style="font-size:12px;color:#94a3b8;">${this.state.nonStriker.runs} (${this.state.nonStriker.balls})</div>
          </div>
        </div>

        <!-- Bowler Active Strip -->
        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:10px;margin-bottom:16px;" data-tooltip="Current Bowler Figures">
          <div style="display:flex;justify-content:space-between;font-size:13px;">
            <span style="font-weight:600;">🎳 ${this.state.bowler.name}</span>
            <span style="color:#94a3b8;">${this.state.bowler.overs}.${this.state.bowler.ballsThisOver}-${this.state.bowler.maidens}-${this.state.bowler.runsConceded}-${this.state.bowler.wickets}</span>
          </div>
        </div>

        <!-- Tactile Boundary Scoring Pad -->
        <div style="background: rgba(10, 16, 28, 0.9); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 12px; margin-bottom: 16px;">
          <div style="font-size: 12px; font-weight: 700; color: #cbd5e1; margin-bottom: 8px;">⚡ Scorer Action Pad</div>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px;">
            <button type="button" onclick="window.cricosMobileApp.scoreBall(0)" style="padding: 10px 4px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.04); color: #f8fafc; font-weight: 800; font-size: 16px; cursor: pointer;">0<span style="display: block; font-size: 10px; color: #94a3b8; font-weight: normal;">Dot</span></button>
            <button type="button" onclick="window.cricosMobileApp.scoreBall(1)" style="padding: 10px 4px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.04); color: #f8fafc; font-weight: 800; font-size: 16px; cursor: pointer;">1<span style="display: block; font-size: 10px; color: #94a3b8; font-weight: normal;">Single</span></button>
            <button type="button" onclick="window.cricosMobileApp.scoreBall(2)" style="padding: 10px 4px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.04); color: #f8fafc; font-weight: 800; font-size: 16px; cursor: pointer;">2<span style="display: block; font-size: 10px; color: #94a3b8; font-weight: normal;">Double</span></button>
            <button type="button" onclick="window.cricosMobileApp.scoreBall(3)" style="padding: 10px 4px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.04); color: #f8fafc; font-weight: 800; font-size: 16px; cursor: pointer;">3<span style="display: block; font-size: 10px; color: #94a3b8; font-weight: normal;">Triple</span></button>
            <button type="button" onclick="window.cricosMobileApp.scoreBall(4)" style="padding: 10px 4px; border-radius: 8px; border: 1px solid rgba(0, 229, 153, 0.4); background: rgba(0, 229, 153, 0.12); color: #00E599; font-weight: 800; font-size: 16px; cursor: pointer;">4<span style="display: block; font-size: 10px; color: #00E599; font-weight: normal;">Four</span></button>
            <button type="button" onclick="window.cricosMobileApp.scoreBall(6)" style="padding: 10px 4px; border-radius: 8px; border: 1px solid rgba(168, 85, 247, 0.4); background: rgba(168, 85, 247, 0.12); color: #c084fc; font-weight: 800; font-size: 16px; cursor: pointer;">6<span style="display: block; font-size: 10px; color: #c084fc; font-weight: normal;">Six</span></button>
            <button type="button" onclick="window.cricosMobileApp.promptWicketModal()" style="padding: 10px 4px; border-radius: 8px; border: 1px solid rgba(255, 51, 102, 0.4); background: rgba(255, 51, 102, 0.15); color: #ff3366; font-weight: 800; font-size: 16px; cursor: pointer;">W<span style="display: block; font-size: 10px; color: #ff8099; font-weight: normal;">Wicket</span></button>
            <button type="button" onclick="window.cricosMobileApp.scoreExtra('WIDE')" style="padding: 10px 4px; border-radius: 8px; border: 1px solid rgba(255, 184, 0, 0.4); background: rgba(255, 184, 0, 0.12); color: #ffb800; font-weight: 800; font-size: 16px; cursor: pointer;">Wd<span style="display: block; font-size: 10px; color: #ffb800; font-weight: normal;">Wide</span></button>
          </div>
        </div>
      </div>
    `;
  }
}
