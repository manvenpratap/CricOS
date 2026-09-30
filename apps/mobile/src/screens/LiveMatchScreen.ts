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

  constructor(initialState?: LiveMatchScreenState) {
    this.state = initialState ? JSON.parse(JSON.stringify(initialState)) : {
      matchId: 'match-mobile-1',
      battingTeam: 'Delhi Daredevils',
      bowlingTeam: 'Mumbai Super Strikers',
      totalRuns: 168,
      totalWickets: 4,
      legalBalls: 108,
      striker: { playerId: 'p1', name: 'Rohit Sharma', runs: 64, balls: 42, fours: 6, sixes: 3, isStriker: true },
      nonStriker: { playerId: 'p2', name: 'Virat Kohli', runs: 45, balls: 32, fours: 4, sixes: 1, isStriker: false },
      bowler: { playerId: 'b1', name: 'Jasprit Bumrah', overs: 3, ballsThisOver: 0, maidens: 0, runsConceded: 22, wickets: 2 },
      currentOverDeliveries: ['1', '4', '0', '2', '6', '1'],
      fallOfWickets: [
        { wicketNumber: 1, playerOut: 'Shikhar Dhawan', runsAtDismissal: 38, overNumber: '4.2' },
        { wicketNumber: 2, playerOut: 'Shreyas Iyer', runsAtDismissal: 84, overNumber: '9.5' },
        { wicketNumber: 3, playerOut: 'Rishabh Pant', runsAtDismissal: 122, overNumber: '13.1' },
        { wicketNumber: 4, playerOut: 'KL Rahul', runsAtDismissal: 154, overNumber: '17.3' }
      ],
      isOverComplete: true
    };
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

  public renderMobileHtml(userRole: string = 'SCORER', activeChart: string = 'NONE'): string {
    const overs = Math.floor(this.state.legalBalls / 6);
    const balls = this.state.legalBalls % 6;
    const crr = this.state.legalBalls > 0
      ? ((this.state.totalRuns / this.state.legalBalls) * 6).toFixed(2)
      : '0.00';

    const isFan = userRole === 'FAN';
    const isCaptain = userRole === 'CAPTAIN';
    const isScorer = userRole === 'SCORER';

    // Conditional mobile analytics panel
    let chartPanelHtml = '';
    if (activeChart === 'WORM') {
      const crr = (this.state.totalRuns / (this.state.legalBalls / 6)).toFixed(2);
      const targetRuns = 178;
      const runsNeeded = Math.max(0, targetRuns - this.state.totalRuns);
      const ballsRem = Math.max(0, 120 - this.state.legalBalls);
      const rrr = ballsRem > 0 ? ((runsNeeded / ballsRem) * 6).toFixed(2) : '0.00';

      chartPanelHtml = `
        <div style="background: rgba(10, 16, 28, 0.95); border: 1px solid rgba(0, 229, 153, 0.35); border-radius: 12px; padding: 0.85rem; margin-bottom: 1rem;">
          <div style="font-size: 0.85rem; font-weight: 800; color: #00E599; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center; font-family: 'Space Grotesk', sans-serif;">
            <span>📈 Precision Worm Progression</span>
            <span style="color: #94a3b8; font-size: 0.68rem;">Target: ${targetRuns}</span>
          </div>

          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.35rem; margin-bottom: 0.65rem;">
            <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; padding: 0.3rem; text-align: center;"><span style="display: block; font-size: 0.58rem; color: #94a3b8;">CRR</span><strong style="color: #00D2FF; font-family: monospace;">${crr}</strong></div>
            <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; padding: 0.3rem; text-align: center;"><span style="display: block; font-size: 0.58rem; color: #94a3b8;">RRR</span><strong style="color: #FFB800; font-family: monospace;">${rrr}</strong></div>
            <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; padding: 0.3rem; text-align: center;"><span style="display: block; font-size: 0.58rem; color: #94a3b8;">Needed</span><strong style="color: #00E599; font-family: monospace;">${runsNeeded} (${ballsRem}b)</strong></div>
            <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; padding: 0.3rem; text-align: center;"><span style="display: block; font-size: 0.58rem; color: #94a3b8;">Score</span><strong style="color: #f8fafc; font-family: monospace;">${this.state.totalRuns}/${this.state.totalWickets}</strong></div>
          </div>

          <svg viewBox="0 0 340 150" width="100%" height="150" xmlns="http://www.w3.org/2000/svg" style="background: rgba(0,0,0,0.35); border-radius: 8px; border: 1px solid rgba(255,255,255,0.06);">
            <line x1="30" y1="130" x2="320" y2="130" stroke="rgba(255,255,255,0.15)" />
            <line x1="30" y1="20" x2="30" y2="130" stroke="rgba(255,255,255,0.15)" />
            
            <line x1="30" y1="102" x2="320" y2="102" stroke="rgba(255,255,255,0.06)" stroke-dasharray="2,3" />
            <text x="24" y="105" fill="#64748b" font-size="7" font-family="monospace" text-anchor="end">50</text>
            <line x1="30" y1="75" x2="320" y2="75" stroke="rgba(255,255,255,0.06)" stroke-dasharray="2,3" />
            <text x="24" y="78" fill="#64748b" font-size="7" font-family="monospace" text-anchor="end">100</text>
            <line x1="30" y1="47" x2="320" y2="47" stroke="rgba(255,255,255,0.06)" stroke-dasharray="2,3" />
            <text x="24" y="50" fill="#64748b" font-size="7" font-family="monospace" text-anchor="end">150</text>

            <line x1="30" y1="32" x2="320" y2="32" stroke="rgba(255,184,0,0.7)" stroke-dasharray="4,3" stroke-width="1.2" />
            <text x="315" y="28" fill="#FFB800" font-size="7" font-weight="700" text-anchor="end">TARGET 178</text>

            <polyline points="30,130 59,121 88,105 117,96 146,83 175,71 204,59 233,48 262,37 291,28 320,20" fill="none" stroke="#00E599" stroke-width="2" opacity="0.85" />
            <polyline points="30,130 59,118 88,101 117,89 146,73 175,61 204,49 233,39 262,31" fill="none" stroke="#00D2FF" stroke-width="2.5" />
            
            <circle cx="59" cy="118" r="3.2" fill="#FF3366" stroke="#00D2FF" stroke-width="1" data-tooltip="Wicket at Ov 2: 12/1" />
            <circle cx="117" cy="89" r="3.2" fill="#FF3366" stroke="#00D2FF" stroke-width="1" data-tooltip="Wicket at Ov 6: 53/2" />
            <circle cx="175" cy="61" r="3.2" fill="#FF3366" stroke="#00D2FF" stroke-width="1" data-tooltip="Wicket at Ov 10: 88/3" />

            <circle cx="262" cy="31" r="6" fill="none" stroke="#00D2FF" stroke-width="1.2" opacity="0.7" />
            <circle cx="262" cy="31" r="3" fill="#00D2FF" stroke="#ffffff" stroke-width="1" data-tooltip="Live Point: ${this.state.totalRuns}/${this.state.totalWickets} (16.4 ov)" />
          </svg>
        </div>
      `;
    } else if (activeChart === 'MANHATTAN') {
      const overRuns = [8, 12, 6, 9, 14, 4, 7, 10, 12, 6, 8, 11, 7, 10, 6, 5];
      const maxPerOver = 18;
      const chartH = 90;
      const baseLineY = 110;
      let barsSvg = '';

      for (let i = 0; i < overRuns.length; i++) {
        const r = overRuns[i] ?? 0;
        const barH = Math.min((r / maxPerOver) * chartH, chartH);
        const barX = 32 + i * 18;
        const barY = baseLineY - barH;
        const isWicketOver = (i === 1 || i === 5 || i === 9);
        const fillCol = isWicketOver ? '#00D2FF' : '#00D2FF';
        const strokeCol = isWicketOver ? '#FF3366' : 'transparent';
        
        barsSvg += `
          <rect x="${barX}" y="${barY}" width="12" height="${barH}" rx="2" fill="${fillCol}" stroke="${strokeCol}" stroke-width="${isWicketOver ? 1.5 : 0}" data-tooltip="Over ${i + 1}: ${r} runs" />
          <text x="${barX + 6}" y="${barY - 3}" fill="#cbd5e1" font-size="7" font-family="monospace" text-anchor="middle">${r}</text>
          ${isWicketOver ? `<circle cx="${barX + 6}" cy="${barY - 9}" r="2.8" fill="#FF3366" /><text x="${barX + 6}" y="${barY - 7}" fill="#ffffff" font-size="5" font-weight="900" text-anchor="middle">W</text>` : ''}
          <text x="${barX + 6}" y="${baseLineY + 11}" fill="#64748b" font-size="6.5" font-family="monospace" text-anchor="middle">${i + 1}</text>
        `;
      }

      chartPanelHtml = `
        <div style="background: rgba(10, 16, 28, 0.95); border: 1px solid rgba(0, 210, 255, 0.35); border-radius: 12px; padding: 0.85rem; margin-bottom: 1rem;">
          <div style="font-size: 0.85rem; font-weight: 800; color: #00D2FF; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center; font-family: 'Space Grotesk', sans-serif;">
            <span>📊 Precision Manhattan Velocity</span>
            <span style="color: #94a3b8; font-size: 0.68rem;">Overs 1-16 (135 runs)</span>
          </div>
          <svg viewBox="0 0 340 135" width="100%" height="135" xmlns="http://www.w3.org/2000/svg" style="background: rgba(0,0,0,0.35); border-radius: 8px; border: 1px solid rgba(255,255,255,0.06);">
            <line x1="25" y1="${baseLineY}" x2="325" y2="${baseLineY}" stroke="rgba(255,255,255,0.15)" />
            <line x1="25" y1="35" x2="325" y2="35" stroke="rgba(255,255,255,0.06)" stroke-dasharray="2,3" />
            <text x="22" y="38" fill="#64748b" font-size="6.5" font-family="monospace" text-anchor="end">15</text>
            <line x1="25" y1="60" x2="325" y2="60" stroke="rgba(255,255,255,0.06)" stroke-dasharray="2,3" />
            <text x="22" y="63" fill="#64748b" font-size="6.5" font-family="monospace" text-anchor="end">10</text>
            <line x1="25" y1="85" x2="325" y2="85" stroke="rgba(255,255,255,0.06)" stroke-dasharray="2,3" />
            <text x="22" y="88" fill="#64748b" font-size="6.5" font-family="monospace" text-anchor="end">5</text>
            ${barsSvg}
          </svg>
        </div>
      `;
    } else if (activeChart === 'WAGON') {
      chartPanelHtml = `
        <div id="mobileWagonPanel" style="background: rgba(10, 16, 28, 0.95); border: 1px solid rgba(192, 132, 252, 0.35); border-radius: 12px; padding: 0.85rem; margin-bottom: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <span style="font-size: 0.85rem; font-weight: 800; color: #c084fc; font-family: 'Space Grotesk', sans-serif;">🎯 Mobile Precision Wagon Wheel (360° Precision Wagon Wheel)</span>
            <span style="font-size: 0.65rem; color: #00E599; font-weight: 800; background: rgba(0,229,153,0.15); padding: 0.15rem 0.45rem; border-radius: 4px; border: 1px solid rgba(0,229,153,0.3);">RHB • Striker (${this.state.striker.runs}*)</span>
          </div>
          <div style="position: relative; width: 100%; display: flex; justify-content: center; margin-bottom: 0.65rem;">
            <svg viewBox="0 0 300 300" width="260" height="260" xmlns="http://www.w3.org/2000/svg" style="border-radius: 50%; background: #030C08; border: 2px solid rgba(0,229,153,0.4); box-shadow: 0 0 15px rgba(0,229,153,0.15);">
              <circle cx="150" cy="150" r="135" fill="#092418" stroke="rgba(0, 229, 153, 0.3)" stroke-width="1.5" />
              <circle cx="150" cy="150" r="65" fill="none" stroke="rgba(0, 210, 255, 0.35)" stroke-width="1" stroke-dasharray="3,3" />
              
              <line x1="150" y1="15" x2="150" y2="285" stroke="rgba(255,255,255,0.08)" stroke-dasharray="2,2" />
              <line x1="15" y1="150" x2="285" y2="150" stroke="rgba(255,255,255,0.08)" stroke-dasharray="2,2" />
              <line x1="55" y1="55" x2="245" y2="245" stroke="rgba(255,255,255,0.06)" stroke-dasharray="2,2" />
              <line x1="55" y1="245" x2="245" y2="55" stroke="rgba(255,255,255,0.06)" stroke-dasharray="2,2" />

              <rect x="143" y="120" width="14" height="60" rx="2" fill="#8C6E3D" stroke="#ffffff" stroke-width="0.5" />
              <circle cx="150" cy="150" r="3.5" fill="#00E599" stroke="#04070D" stroke-width="1" />

              <text x="35" y="153" fill="#00D2FF" font-size="7.5" font-weight="800">OFF</text>
              <text x="265" y="153" fill="#00E599" font-size="7.5" font-weight="800" text-anchor="end">ON</text>

              <line x1="150" y1="150" x2="60" y2="225" stroke="#00E599" stroke-width="2" stroke-linecap="round" data-tooltip="4 Runs through Square Leg" />
              <circle cx="60" cy="225" r="3" fill="#00E599" stroke="#ffffff" stroke-width="0.8" />
              <line x1="150" y1="150" x2="45" y2="180" stroke="#00E599" stroke-width="2" stroke-linecap="round" data-tooltip="4 Runs through Mid Wicket" />
              <circle cx="45" cy="180" r="3" fill="#00E599" stroke="#ffffff" stroke-width="0.8" />
              <line x1="150" y1="150" x2="240" y2="195" stroke="#00E599" stroke-width="2" stroke-linecap="round" data-tooltip="4 Runs through Extra Cover" />
              <circle cx="240" cy="195" r="3" fill="#00E599" stroke="#ffffff" stroke-width="0.8" />

              <path d="M 150 150 Q 110 240 125 278" fill="none" stroke="#FFB800" stroke-width="2.5" stroke-linecap="round" data-tooltip="6 RUNS over Deep Mid Wicket" />
              <circle cx="125" cy="278" r="4" fill="#FFB800" stroke="#ffffff" stroke-width="1" />
              <path d="M 150 150 Q 210 240 185 278" fill="none" stroke="#FFB800" stroke-width="2.5" stroke-linecap="round" data-tooltip="6 RUNS over Long Off" />
              <circle cx="185" cy="278" r="4" fill="#FFB800" stroke="#ffffff" stroke-width="1" />

              <line x1="150" y1="150" x2="80" y2="85" stroke="#00D2FF" stroke-width="1.5" stroke-linecap="round" data-tooltip="1 Run" />
              <circle cx="80" cy="85" r="2.5" fill="#00D2FF" />
              <line x1="150" y1="150" x2="220" y2="75" stroke="#00D2FF" stroke-width="1.5" stroke-linecap="round" data-tooltip="2 Runs" />
              <circle cx="220" cy="75" r="2.5" fill="#00D2FF" />
              <line x1="150" y1="150" x2="190" y2="140" stroke="#64748b" stroke-width="1" stroke-dasharray="2,2" data-tooltip="Dot Ball" />
              <circle cx="190" cy="140" r="2" fill="#64748b" />
            </svg>
          </div>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.35rem; font-size: 0.7rem; text-align: center; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 0.5rem;">
            <div><span style="color: #94a3b8; display: block; font-size: 0.6rem;">Off Runs</span><strong style="color: #00D2FF;">74</strong></div>
            <div><span style="color: #94a3b8; display: block; font-size: 0.6rem;">On Runs</span><strong style="color: #00E599;">68</strong></div>
            <div><span style="color: #94a3b8; display: block; font-size: 0.6rem;">Boundaries</span><strong style="color: #FFB800;">18</strong></div>
            <div><span style="color: #94a3b8; display: block; font-size: 0.6rem;">Dot %</span><strong style="color: #cbd5e1;">24%</strong></div>
          </div>
        </div>
      `;
    } else if (activeChart === 'SCORECARD') {
      const completedOvers = Math.floor(this.state.legalBalls / 6);
      const ballsInOver = this.state.legalBalls % 6;
      const oversDisplay = `${completedOvers}.${ballsInOver}`;
      const bowlerOvers = `${this.state.bowler.overs}.${this.state.bowler.ballsThisOver}`;
      const bowlerOversFloat = this.state.bowler.overs + (this.state.bowler.ballsThisOver / 6);
      const bowlerEcon = bowlerOversFloat > 0 ? (this.state.bowler.runsConceded / bowlerOversFloat).toFixed(2) : '0.00';

      chartPanelHtml = `
        <div id="mobileScorecardPanel" style="background: rgba(10, 16, 28, 0.95); border: 1px solid rgba(255,255,255,0.18); border-radius: 12px; padding: 0.85rem; margin-bottom: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.65rem;">
            <div>
              <span style="font-size: 0.85rem; font-weight: 800; color: #f8fafc; font-family: 'Space Grotesk', sans-serif;">📄 Detailed Scorecard (Official Match Scorecard)</span>
              <div style="font-size: 0.65rem; color: #94a3b8;">Innings 2: ${this.state.totalRuns}/${this.state.totalWickets}</div>
            </div>
            <span style="font-size: 0.75rem; color: #00E599; font-weight: 800; font-family: monospace; background: rgba(0,229,153,0.12); padding: 0.2rem 0.5rem; border-radius: 6px; border: 1px solid rgba(0,229,153,0.3);">${this.state.totalRuns}/${this.state.totalWickets} (${oversDisplay} ov)</span>
          </div>

          <div style="font-size: 0.7rem; font-weight: 700; color: #00D2FF; margin-bottom: 0.35rem; text-transform: uppercase;">Batting Figures</div>
          <table style="width: 100%; border-collapse: collapse; font-size: 0.72rem; margin-bottom: 0.65rem;">
            <thead>
              <tr style="color: #64748b; border-bottom: 1px solid rgba(255,255,255,0.1); text-align: left;">
                <th style="padding: 0.3rem 0;">Batter</th>
                <th style="padding: 0.3rem 0; text-align: right;">R</th>
                <th style="padding: 0.3rem 0; text-align: right;">B</th>
                <th style="padding: 0.3rem 0; text-align: right;">4s</th>
                <th style="padding: 0.3rem 0; text-align: right;">6s</th>
                <th style="padding: 0.3rem 0; text-align: right;">SR</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                <td style="padding: 0.3rem 0; font-weight: 700;">Rohit Verma <small style="color: #94a3b8; display: block; font-size: 0.62rem;">c Pant b Bumrah</small></td>
                <td style="padding: 0.3rem 0; text-align: right; color: #cbd5e1; font-family: monospace;">8</td>
                <td style="padding: 0.3rem 0; text-align: right; color: #cbd5e1; font-family: monospace;">6</td>
                <td style="padding: 0.3rem 0; text-align: right; color: #cbd5e1; font-family: monospace;">1</td>
                <td style="padding: 0.3rem 0; text-align: right; color: #cbd5e1; font-family: monospace;">0</td>
                <td style="padding: 0.3rem 0; text-align: right; color: #94a3b8; font-family: monospace;">133.3</td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                <td style="padding: 0.3rem 0; font-weight: 700;">Suryakumar Yadav <small style="color: #94a3b8; display: block; font-size: 0.62rem;">c & b Kuldeep</small></td>
                <td style="padding: 0.3rem 0; text-align: right; color: #cbd5e1; font-family: monospace;">0</td>
                <td style="padding: 0.3rem 0; text-align: right; color: #cbd5e1; font-family: monospace;">2</td>
                <td style="padding: 0.3rem 0; text-align: right; color: #cbd5e1; font-family: monospace;">0</td>
                <td style="padding: 0.3rem 0; text-align: right; color: #cbd5e1; font-family: monospace;">0</td>
                <td style="padding: 0.3rem 0; text-align: right; color: #94a3b8; font-family: monospace;">0.0</td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                <td style="padding: 0.3rem 0; font-weight: 700;">Shreyas Iyer <small style="color: #94a3b8; display: block; font-size: 0.62rem;">b Siraj</small></td>
                <td style="padding: 0.3rem 0; text-align: right; color: #cbd5e1; font-family: monospace;">0</td>
                <td style="padding: 0.3rem 0; text-align: right; color: #cbd5e1; font-family: monospace;">1</td>
                <td style="padding: 0.3rem 0; text-align: right; color: #cbd5e1; font-family: monospace;">0</td>
                <td style="padding: 0.3rem 0; text-align: right; color: #cbd5e1; font-family: monospace;">0</td>
                <td style="padding: 0.3rem 0; text-align: right; color: #94a3b8; font-family: monospace;">0.0</td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                <td style="padding: 0.3rem 0; font-weight: 700; color: #00E599;">${this.state.striker.name} * <small style="color: #94a3b8; display: block; font-size: 0.62rem;">not out (striker)</small></td>
                <td style="padding: 0.3rem 0; text-align: right; color: #00E599; font-weight: 800; font-family: monospace;">${this.state.striker.runs}</td>
                <td style="padding: 0.3rem 0; text-align: right; color: #cbd5e1; font-family: monospace;">${this.state.striker.balls}</td>
                <td style="padding: 0.3rem 0; text-align: right; color: #cbd5e1; font-family: monospace;">${this.state.striker.fours}</td>
                <td style="padding: 0.3rem 0; text-align: right; color: #cbd5e1; font-family: monospace;">${this.state.striker.sixes}</td>
                <td style="padding: 0.3rem 0; text-align: right; color: #94a3b8; font-family: monospace;">${this.state.striker.balls > 0 ? ((this.state.striker.runs / this.state.striker.balls) * 100).toFixed(1) : '0.0'}</td>
              </tr>
              <tr>
                <td style="padding: 0.3rem 0; font-weight: 700; color: #00D2FF;">${this.state.nonStriker.name} <small style="color: #94a3b8; display: block; font-size: 0.62rem;">not out (non-striker)</small></td>
                <td style="padding: 0.3rem 0; text-align: right; color: #00D2FF; font-weight: 800; font-family: monospace;">${this.state.nonStriker.runs}</td>
                <td style="padding: 0.3rem 0; text-align: right; color: #cbd5e1; font-family: monospace;">${this.state.nonStriker.balls}</td>
                <td style="padding: 0.3rem 0; text-align: right; color: #cbd5e1; font-family: monospace;">${this.state.nonStriker.fours}</td>
                <td style="padding: 0.3rem 0; text-align: right; color: #cbd5e1; font-family: monospace;">${this.state.nonStriker.sixes}</td>
                <td style="padding: 0.3rem 0; text-align: right; color: #94a3b8; font-family: monospace;">${this.state.nonStriker.balls > 0 ? ((this.state.nonStriker.runs / this.state.nonStriker.balls) * 100).toFixed(1) : '0.0'}</td>
              </tr>
            </tbody>
          </table>

          <div style="font-size: 0.68rem; color: #94a3b8; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 0.4rem; margin-bottom: 0.65rem; display: flex; justify-content: space-between;">
            <span>Extras: <strong style="color: #FFB800;">12</strong> (b 4, lb 2, w 5, nb 1)</span>
            <span>Total: <strong style="color: #00E599;">${this.state.totalRuns}/${this.state.totalWickets}</strong> (${oversDisplay} ov)</span>
          </div>

          <div style="font-size: 0.7rem; font-weight: 700; color: #FF3366; margin-bottom: 0.35rem; text-transform: uppercase;">Fall of Wickets</div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.35rem; font-size: 0.65rem; text-align: center; margin-bottom: 0.65rem;">
            <div style="background: rgba(255,51,102,0.1); border: 1px solid rgba(255,51,102,0.25); border-radius: 6px; padding: 0.3rem;"><span style="color: #FF3366; font-weight: 800; display: block;">12/1</span><span style="color: #cbd5e1; font-size: 0.6rem;">Ishan (1.4)</span></div>
            <div style="background: rgba(255,51,102,0.1); border: 1px solid rgba(255,51,102,0.25); border-radius: 6px; padding: 0.3rem;"><span style="color: #FF3366; font-weight: 800; display: block;">12/2</span><span style="color: #cbd5e1; font-size: 0.6rem;">Surya (1.6)</span></div>
            <div style="background: rgba(255,51,102,0.1); border: 1px solid rgba(255,51,102,0.25); border-radius: 6px; padding: 0.3rem;"><span style="color: #FF3366; font-weight: 800; display: block;">20/3</span><span style="color: #cbd5e1; font-size: 0.6rem;">Shreyas (2.3)</span></div>
          </div>

          <div style="font-size: 0.7rem; font-weight: 700; color: #00E599; margin-bottom: 0.35rem; text-transform: uppercase;">Bowling Figures (DEL)</div>
          <table style="width: 100%; border-collapse: collapse; font-size: 0.72rem;">
            <thead>
              <tr style="color: #64748b; border-bottom: 1px solid rgba(255,255,255,0.1); text-align: left;">
                <th style="padding: 0.3rem 0;">Bowler</th>
                <th style="padding: 0.3rem 0; text-align: right;">O</th>
                <th style="padding: 0.3rem 0; text-align: right;">M</th>
                <th style="padding: 0.3rem 0; text-align: right;">R</th>
                <th style="padding: 0.3rem 0; text-align: right;">W</th>
                <th style="padding: 0.3rem 0; text-align: right;">ECON</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                <td style="padding: 0.3rem 0; font-weight: 700;">Mohammed Siraj</td>
                <td style="padding: 0.3rem 0; text-align: right; color: #cbd5e1; font-family: monospace;">4.0</td>
                <td style="padding: 0.3rem 0; text-align: right; color: #cbd5e1; font-family: monospace;">0</td>
                <td style="padding: 0.3rem 0; text-align: right; color: #cbd5e1; font-family: monospace;">31</td>
                <td style="padding: 0.3rem 0; text-align: right; color: #FF3366; font-weight: 800; font-family: monospace;">1</td>
                <td style="padding: 0.3rem 0; text-align: right; color: #94a3b8; font-family: monospace;">7.75</td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                <td style="padding: 0.3rem 0; font-weight: 700; color: #FFB800;">${this.state.bowler.name} *</td>
                <td style="padding: 0.3rem 0; text-align: right; color: #cbd5e1; font-family: monospace;">${bowlerOvers}</td>
                <td style="padding: 0.3rem 0; text-align: right; color: #cbd5e1; font-family: monospace;">${this.state.bowler.maidens}</td>
                <td style="padding: 0.3rem 0; text-align: right; color: #cbd5e1; font-family: monospace;">${this.state.bowler.runsConceded}</td>
                <td style="padding: 0.3rem 0; text-align: right; color: #FF3366; font-weight: 800; font-family: monospace;">${this.state.bowler.wickets}</td>
                <td style="padding: 0.3rem 0; text-align: right; color: #94a3b8; font-family: monospace;">${bowlerEcon}</td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                <td style="padding: 0.3rem 0; font-weight: 700;">Kuldeep Yadav</td>
                <td style="padding: 0.3rem 0; text-align: right; color: #cbd5e1; font-family: monospace;">4.0</td>
                <td style="padding: 0.3rem 0; text-align: right; color: #cbd5e1; font-family: monospace;">0</td>
                <td style="padding: 0.3rem 0; text-align: right; color: #cbd5e1; font-family: monospace;">33</td>
                <td style="padding: 0.3rem 0; text-align: right; color: #FF3366; font-weight: 800; font-family: monospace;">1</td>
                <td style="padding: 0.3rem 0; text-align: right; color: #94a3b8; font-family: monospace;">8.25</td>
              </tr>
              <tr>
                <td style="padding: 0.3rem 0; font-weight: 700;">Axar Patel</td>
                <td style="padding: 0.3rem 0; text-align: right; color: #cbd5e1; font-family: monospace;">4.0</td>
                <td style="padding: 0.3rem 0; text-align: right; color: #cbd5e1; font-family: monospace;">0</td>
                <td style="padding: 0.3rem 0; text-align: right; color: #cbd5e1; font-family: monospace;">33</td>
                <td style="padding: 0.3rem 0; text-align: right; color: #cbd5e1; font-family: monospace;">0</td>
                <td style="padding: 0.3rem 0; text-align: right; color: #94a3b8; font-family: monospace;">8.25</td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
    }

    return `
      <div class="mobile-live-screen" style="padding: 1rem; background: #04070D; color: #f8fafc; font-family: 'Plus Jakarta Sans', sans-serif; max-width: 480px; margin: auto;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <div style="display: flex; align-items: center; gap: 0.4rem;">
            <span style="background: rgba(255, 51, 102, 0.15); border: 1px solid #ff3366; color: #ff3366; font-size: 0.7rem; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 9999px;">🔴 LIVE</span>
            <span style="font-size: 0.75rem; color: #94a3b8;">Match #${this.state.matchId}</span>
          </div>
          <div style="display: flex; gap: 0.3rem; flex-wrap: wrap;">
            <button type="button" onclick="window.cricosMobileApp.toggleMobileChart('WORM')" style="background: ${activeChart === 'WORM' ? 'rgba(0, 229, 153, 0.25)' : 'rgba(0, 229, 153, 0.1)'}; border: 1px solid rgba(0, 229, 153, 0.3); color: #00E599; font-size: 0.68rem; padding: 0.2rem 0.45rem; border-radius: 6px; cursor: pointer;" data-tooltip="View Worm progression curve">📈 Worm</button>
            <button type="button" onclick="window.cricosMobileApp.toggleMobileChart('MANHATTAN')" style="background: ${activeChart === 'MANHATTAN' ? 'rgba(0, 210, 255, 0.25)' : 'rgba(0, 210, 255, 0.1)'}; border: 1px solid rgba(0, 210, 255, 0.3); color: #00D2FF; font-size: 0.68rem; padding: 0.2rem 0.45rem; border-radius: 6px; cursor: pointer;" data-tooltip="View Manhattan over bars">📊 Bars</button>
            <button type="button" onclick="window.cricosMobileApp.toggleMobileChart('WAGON')" style="background: ${activeChart === 'WAGON' ? 'rgba(192, 132, 252, 0.25)' : 'rgba(192, 132, 252, 0.1)'}; border: 1px solid rgba(192, 132, 252, 0.3); color: #c084fc; font-size: 0.68rem; padding: 0.2rem 0.45rem; border-radius: 6px; cursor: pointer;" data-tooltip="View 8-zone Wagon Wheel">🎯 Wagon</button>
            <button type="button" onclick="window.cricosMobileApp.toggleMobileChart('SCORECARD')" style="background: ${activeChart === 'SCORECARD' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.06)'}; border: 1px solid rgba(255, 255, 255, 0.15); color: #f8fafc; font-size: 0.68rem; padding: 0.2rem 0.45rem; border-radius: 6px; cursor: pointer;" data-tooltip="View full detailed scorecard">📄 Card</button>
          </div>
        </div>

        ${chartPanelHtml}

        <!-- Score Card Banner -->
        <div style="background: rgba(10, 16, 28, 0.9); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 1.25rem; text-align: center; margin-bottom: 1rem; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
          <div style="font-size: 0.85rem; color: #cbd5e1; font-weight: 600;">${this.state.battingTeam} vs ${this.state.bowlingTeam}</div>
          <div style="font-size: 2.75rem; font-weight: 800; color: #00E599; font-family: 'Chakra Petch', monospace; line-height: 1.1; margin: 0.35rem 0;">
            ${this.state.totalRuns}/${this.state.totalWickets}
          </div>
          <div style="font-size: 0.85rem; color: #94a3b8;">
            Overs: <strong style="color: #00D2FF; font-family: 'Chakra Petch', monospace;">${overs}.${balls}</strong> • CRR: <strong style="color: #f8fafc; font-family: 'Chakra Petch', monospace;">${crr}</strong>
          </div>
        </div>

        <!-- Over Deliveries Strip -->
        <div style="margin-bottom: 1rem;">
          <div style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.4rem; font-weight: 600;">Current Over Deliveries:</div>
          <div style="display: flex; gap: 0.4rem; overflow-x: auto; padding-bottom: 0.25rem;">
            ${this.state.currentOverDeliveries.map(d => {
              let bg = 'rgba(255,255,255,0.06)';
              let col = '#f8fafc';
              if (d === '4') { bg = 'rgba(0, 229, 153, 0.2)'; col = '#00E599'; }
              if (d === '6') { bg = 'rgba(168, 85, 247, 0.2)'; col = '#c084fc'; }
              if (d === 'W') { bg = 'rgba(255, 51, 102, 0.2)'; col = '#ff3366'; }
              return `<span style="display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%; background: ${bg}; color: ${col}; font-weight: 800; font-size: 0.8rem; font-family: 'Chakra Petch', monospace; border: 1px solid rgba(255,255,255,0.1);">${d}</span>`;
            }).join('')}
          </div>
        </div>

        <!-- Batters Active Strip -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 0.75rem;">
          <div style="background: rgba(0, 229, 153, 0.08); border: 1px solid rgba(0, 229, 153, 0.25); border-radius: 8px; padding: 0.65rem;" data-tooltip="Active striker on strike">
            <div style="font-size: 0.75rem; font-weight: 700; color: #00E599;">${this.state.striker.name} *</div>
            <div style="font-size: 0.85rem; font-weight: 800; font-family: 'Chakra Petch', monospace;">
              ${this.state.striker.runs} <small style="font-size: 0.7rem; color: #94a3b8;">(${this.state.striker.balls}b)</small>
            </div>
          </div>
          <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 0.65rem;" data-tooltip="Non-striker at bowler's end">
            <div style="font-size: 0.75rem; font-weight: 600; color: #cbd5e1;">${this.state.nonStriker.name}</div>
            <div style="font-size: 0.85rem; font-weight: 800; font-family: 'Chakra Petch', monospace;">
              ${this.state.nonStriker.runs} <small style="font-size: 0.7rem; color: #94a3b8;">(${this.state.nonStriker.balls}b)</small>
            </div>
          </div>
        </div>

        <!-- Bowler Active Strip -->
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 0.65rem; margin-bottom: 1rem; display: flex; justify-content: space-between; font-size: 0.8rem;" data-tooltip="Current Bowler Figures">
          <span style="font-weight: 600;">🎳 ${this.state.bowler.name}</span>
          <span style="color: #00D2FF; font-family: 'Chakra Petch', monospace; font-weight: 700;">
            ${this.state.bowler.overs}.${this.state.bowler.ballsThisOver}-${this.state.bowler.maidens}-${this.state.bowler.runsConceded}-${this.state.bowler.wickets}
          </span>
        </div>

        <!-- Dynamic Role-Specific Console -->
        ${isFan ? `
          <!-- 1. FAN STADIUM CHEERING & MATCH PULSE CONSOLE -->
          <div style="background: rgba(10, 16, 28, 0.95); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 14px; padding: 1rem; margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem;">
              <span style="font-size: 0.85rem; font-weight: 700; color: #c084fc; font-family: 'Space Grotesk', sans-serif;">🎪 Fan Stadium Cheering Pulse</span>
              <span style="font-size: 0.75rem; color: #00E599; font-weight: 700; font-family: 'Chakra Petch', monospace;" id="mobileCheerCounter">1,429+ Cheers</span>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.4rem; margin-bottom: 0.75rem;">
              <button type="button" onclick="window.cricosMobileApp.sendMobileCheer('🔥 Cheer BLR')" style="padding: 0.6rem 0.3rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04); color: #f8fafc; font-weight: 700; font-size: 0.75rem; cursor: pointer;">🔥 Cheer BLR</button>
              <button type="button" onclick="window.cricosMobileApp.sendMobileCheer('👏 Applause')" style="padding: 0.6rem 0.3rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04); color: #f8fafc; font-weight: 700; font-size: 0.75rem; cursor: pointer;">👏 Applause</button>
              <button type="button" onclick="window.cricosMobileApp.sendMobileCheer('💥 Boundary')" style="padding: 0.6rem 0.3rem; border-radius: 8px; border: 1px solid rgba(0, 229, 153, 0.3); background: rgba(0, 229, 153, 0.1); color: #00E599; font-weight: 700; font-size: 0.75rem; cursor: pointer;">💥 Boundary</button>
              <button type="button" onclick="window.cricosMobileApp.sendMobileCheer('⚡ Sixer!')" style="padding: 0.6rem 0.3rem; border-radius: 8px; border: 1px solid rgba(168, 85, 247, 0.3); background: rgba(168, 85, 247, 0.1); color: #c084fc; font-weight: 700; font-size: 0.75rem; cursor: pointer;">⚡ Sixer!</button>
              <button type="button" onclick="window.cricosMobileApp.sendMobileCheer('🛡️ Breakthrough')" style="padding: 0.6rem 0.3rem; border-radius: 8px; border: 1px solid rgba(255, 51, 102, 0.3); background: rgba(255, 51, 102, 0.1); color: #ff8099; font-weight: 700; font-size: 0.75rem; cursor: pointer;">🛡️ Wicket</button>
              <button type="button" onclick="window.cricosMobileApp.sendMobileCheer('👑 Virat!')" style="padding: 0.6rem 0.3rem; border-radius: 8px; border: 1px solid rgba(255, 184, 0, 0.3); background: rgba(255, 184, 0, 0.1); color: #ffb800; font-weight: 700; font-size: 0.75rem; cursor: pointer;">👑 King Kohli</button>
            </div>

            <!-- Win Probability Poll -->
            <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 0.6rem;">
              <div style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.4rem; display: flex; justify-content: space-between;">
                <span>Win Probability Poll</span>
                <span style="color: #00E599; font-weight: 700;">BLR 68% • MUM 32%</span>
              </div>
              <div style="display: flex; height: 8px; border-radius: 4px; overflow: hidden; background: rgba(255,255,255,0.1); margin-bottom: 0.5rem;">
                <div style="width: 68%; background: #00E599;"></div>
                <div style="width: 32%; background: #00D2FF;"></div>
              </div>
              <div style="display: flex; gap: 0.5rem;">
                <button type="button" onclick="window.cricosMobileApp.votePoll('BLR')" style="flex: 1; padding: 0.35rem; border-radius: 6px; border: 1px solid rgba(0, 229, 153, 0.3); background: rgba(0, 229, 153, 0.1); color: #00E599; font-weight: 700; font-size: 0.7rem; cursor: pointer;">Vote BLR</button>
                <button type="button" onclick="window.cricosMobileApp.votePoll('MUM')" style="flex: 1; padding: 0.35rem; border-radius: 6px; border: 1px solid rgba(0, 210, 255, 0.3); background: rgba(0, 210, 255, 0.1); color: #00D2FF; font-weight: 700; font-size: 0.7rem; cursor: pointer;">Vote MUM</button>
              </div>
            </div>
          </div>
        ` : ''}

        ${isCaptain ? `
          <!-- 2. CAPTAIN TACTICAL HUD -->
          <div style="background: rgba(10, 16, 28, 0.95); border: 1px solid rgba(0, 229, 153, 0.3); border-radius: 14px; padding: 1rem; margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem;">
              <span style="font-size: 0.85rem; font-weight: 700; color: #00E599; font-family: 'Space Grotesk', sans-serif;">👑 Captain Tactical View</span>
              <button type="button" onclick="window.cricosMobileApp.conductTossModal()" style="padding: 0.3rem 0.6rem; border-radius: 6px; border: none; background: linear-gradient(135deg, #00E599, #00D2FF); color: #04070D; font-weight: 700; font-size: 0.7rem; cursor: pointer;" data-tooltip="Record toss result">🪙 Toss</button>
            </div>
            <div style="font-size: 0.75rem; color: #cbd5e1; margin-bottom: 0.6rem;">
              Target Equation: Need <strong style="color: #00E599;">48 runs</strong> in <strong style="color: #00D2FF;">20 balls</strong> (RRR: 14.40)
            </div>
            <!-- Tactical Wagon Wheel Notice -->
            <div style="background: rgba(0,0,0,0.3); border-radius: 8px; padding: 0.6rem; text-align: center; font-size: 0.75rem; color: #94a3b8;">
              Tactical Field Placements: 5 Off / 4 Leg • Deep Mid Wicket & Cover Sweeper Deep
            </div>
          </div>
        ` : ''}

        ${isScorer ? `
          <!-- 3. OFFICIAL SCORER CONTROLS & WAGON WHEEL -->
          <div style="background: rgba(10, 16, 28, 0.95); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 1rem; margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem;">
              <span style="font-size: 0.8rem; font-weight: 700; color: #cbd5e1;">⚡ Live Scoring Pad</span>
              <div style="display: flex; gap: 0.3rem;">
                <button type="button" onclick="window.cricosMobileApp.swapMobileStrike()" style="padding: 0.25rem 0.5rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.15); background: transparent; color: #f8fafc; font-size: 0.7rem; cursor: pointer;" data-tooltip="Swap batsman strike">⇄ Swap Strike</button>
                <button type="button" onclick="window.cricosMobileApp.undoMobileBall()" style="padding: 0.25rem 0.5rem; border-radius: 6px; border: 1px solid rgba(255, 51, 102, 0.3); background: rgba(255, 51, 102, 0.1); color: #ff8099; font-size: 0.7rem; cursor: pointer;" data-tooltip="Undo last recorded delivery">↩ Undo</button>
              </div>
            </div>

            <!-- Primary Runs Grid -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.4rem; margin-bottom: 0.5rem;">
              <button type="button" onclick="window.cricosMobileApp.scoreBall(0)" style="padding: 10px 4px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.04); color: #f8fafc; font-weight: 800; font-size: 16px; cursor: pointer;">0<span style="display: block; font-size: 9px; color: #94a3b8;">Dot</span></button>
              <button type="button" onclick="window.cricosMobileApp.scoreBall(1)" style="padding: 10px 4px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.04); color: #f8fafc; font-weight: 800; font-size: 16px; cursor: pointer;">1<span style="display: block; font-size: 9px; color: #94a3b8;">Single</span></button>
              <button type="button" onclick="window.cricosMobileApp.scoreBall(2)" style="padding: 10px 4px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.04); color: #f8fafc; font-weight: 800; font-size: 16px; cursor: pointer;">2<span style="display: block; font-size: 9px; color: #94a3b8;">Two</span></button>
              <button type="button" onclick="window.cricosMobileApp.scoreBall(3)" style="padding: 10px 4px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.04); color: #f8fafc; font-weight: 800; font-size: 16px; cursor: pointer;">3<span style="display: block; font-size: 9px; color: #94a3b8;">Three</span></button>
              <button type="button" onclick="window.cricosMobileApp.scoreBall(4)" style="padding: 10px 4px; border-radius: 8px; border: 1px solid rgba(0, 229, 153, 0.4); background: rgba(0, 229, 153, 0.12); color: #00E599; font-weight: 800; font-size: 16px; cursor: pointer;">4<span style="display: block; font-size: 9px; color: #00E599;">Four</span></button>
              <button type="button" onclick="window.cricosMobileApp.scoreBall(6)" style="padding: 10px 4px; border-radius: 8px; border: 1px solid rgba(168, 85, 247, 0.4); background: rgba(168, 85, 247, 0.12); color: #c084fc; font-weight: 800; font-size: 16px; cursor: pointer;">6<span style="display: block; font-size: 9px; color: #c084fc;">Six</span></button>
              <button type="button" onclick="window.cricosMobileApp.promptWicketModal()" style="padding: 10px 4px; border-radius: 8px; border: 1px solid rgba(255, 51, 102, 0.4); background: rgba(255, 51, 102, 0.15); color: #ff3366; font-weight: 800; font-size: 16px; cursor: pointer;">W<span style="display: block; font-size: 9px; color: #ff8099;">Wicket</span></button>
              <button type="button" onclick="window.cricosMobileApp.scoreExtra('WIDE')" style="padding: 10px 4px; border-radius: 8px; border: 1px solid rgba(255, 184, 0, 0.4); background: rgba(255, 184, 0, 0.12); color: #ffb800; font-weight: 800; font-size: 16px; cursor: pointer;">Wd<span style="display: block; font-size: 9px; color: #ffb800;">Wide</span></button>
            </div>

            <!-- Extras Quick Strip -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.3rem; margin-bottom: 0.75rem;">
              <button type="button" onclick="window.cricosMobileApp.scoreExtra('NO_BALL')" style="padding: 0.4rem; border-radius: 6px; border: 1px solid rgba(255, 184, 0, 0.3); background: rgba(255, 184, 0, 0.08); color: #ffb800; font-size: 0.7rem; font-weight: 600; cursor: pointer;" data-tooltip="No Ball (+1 run & Free Hit)">+1 Nb Free</button>
              <button type="button" onclick="window.cricosMobileApp.scoreExtra('BYE')" style="padding: 0.4rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.03); color: #cbd5e1; font-size: 0.7rem; font-weight: 600; cursor: pointer;" data-tooltip="Bye (+1 run)">+1 Bye</button>
              <button type="button" onclick="window.cricosMobileApp.scoreExtra('LEG_BYE')" style="padding: 0.4rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.03); color: #cbd5e1; font-size: 0.7rem; font-weight: 600; cursor: pointer;" data-tooltip="Leg Bye (+1 run)">+1 Leg Bye</button>
              <button type="button" onclick="window.cricosMobileApp.scoreExtra('WIDE')" style="padding: 0.4rem; border-radius: 6px; border: 1px solid rgba(255, 184, 0, 0.3); background: rgba(255, 184, 0, 0.08); color: #ffb800; font-size: 0.7rem; font-weight: 600; cursor: pointer;" data-tooltip="Wide (+1 run)">+1 Wide</button>
            </div>

            <!-- 8-Zone Wagon Wheel Shot Selector -->
            <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 0.6rem;">
              <div style="font-size: 0.75rem; font-weight: 700; color: #94a3b8; margin-bottom: 0.4rem;">🎯 8-Zone Wagon Wheel Shot Selector:</div>
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.3rem;">
                <button type="button" onclick="window.cricosMobileApp.selectMobileWagonZone('THIRD_MAN')" style="padding: 0.35rem 0.2rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04); color: #f8fafc; font-size: 0.65rem; cursor: pointer;">Third Man</button>
                <button type="button" onclick="window.cricosMobileApp.selectMobileWagonZone('POINT')" style="padding: 0.35rem 0.2rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04); color: #f8fafc; font-size: 0.65rem; cursor: pointer;">Point</button>
                <button type="button" onclick="window.cricosMobileApp.selectMobileWagonZone('EXTRA_COVER')" style="padding: 0.35rem 0.2rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04); color: #f8fafc; font-size: 0.65rem; cursor: pointer;">Cover</button>
                <button type="button" onclick="window.cricosMobileApp.selectMobileWagonZone('LONG_OFF')" style="padding: 0.35rem 0.2rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04); color: #f8fafc; font-size: 0.65rem; cursor: pointer;">Long Off</button>
                <button type="button" onclick="window.cricosMobileApp.selectMobileWagonZone('LONG_ON')" style="padding: 0.35rem 0.2rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04); color: #f8fafc; font-size: 0.65rem; cursor: pointer;">Long On</button>
                <button type="button" onclick="window.cricosMobileApp.selectMobileWagonZone('MID_WICKET')" style="padding: 0.35rem 0.2rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04); color: #f8fafc; font-size: 0.65rem; cursor: pointer;">Mid Wkt</button>
                <button type="button" onclick="window.cricosMobileApp.selectMobileWagonZone('SQUARE_LEG')" style="padding: 0.35rem 0.2rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04); color: #f8fafc; font-size: 0.65rem; cursor: pointer;">Sq Leg</button>
                <button type="button" onclick="window.cricosMobileApp.selectMobileWagonZone('FINE_LEG')" style="padding: 0.35rem 0.2rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04); color: #f8fafc; font-size: 0.65rem; cursor: pointer;">Fine Leg</button>
              </div>
            </div>
          </div>
        ` : (!isFan && !isCaptain ? `
          <!-- NON-SCORER LOCKED NOTICE -->
          <div style="background: rgba(10, 16, 28, 0.95); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 1rem; margin-bottom: 1rem; text-align: center;">
            <div style="font-size: 0.85rem; font-weight: 700; color: #94a3b8; margin-bottom: 0.3rem;">🔒 Live Scoring Console Locked</div>
            <div style="font-size: 0.75rem; color: #64748b;">Live scoring is reserved exclusively for the assigned Official Scorer.</div>
          </div>
        ` : '')}
      </div>
    `;
  }
}
