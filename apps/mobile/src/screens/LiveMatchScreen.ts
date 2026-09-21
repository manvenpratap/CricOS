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

  public renderMobileHtml(userRole: string = 'SCORER'): string {
    const overs = Math.floor(this.state.legalBalls / 6);
    const balls = this.state.legalBalls % 6;
    const crr = this.state.legalBalls > 0
      ? ((this.state.totalRuns / this.state.legalBalls) * 6).toFixed(2)
      : '0.00';

    const isFan = userRole === 'FAN';
    const isCaptain = userRole === 'CAPTAIN';
    const isScorerOrAdmin = userRole === 'SCORER' || userRole === 'ADMIN';

    return `
      <div class="mobile-live-screen" style="padding: 1rem; background: #04070D; color: #f8fafc; font-family: 'Plus Jakarta Sans', sans-serif; max-width: 480px; margin: auto;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <div style="display: flex; align-items: center; gap: 0.4rem;">
            <span style="background: rgba(255, 51, 102, 0.15); border: 1px solid #ff3366; color: #ff3366; font-size: 0.7rem; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 9999px;">🔴 LIVE</span>
            <span style="font-size: 0.75rem; color: #94a3b8;">Match #${this.state.matchId}</span>
          </div>
          <div style="display: flex; gap: 0.4rem;">
            <button type="button" onclick="window.cricosMobileApp.toggleMobileChart('WORM')" style="background: rgba(0, 229, 153, 0.1); border: 1px solid rgba(0, 229, 153, 0.3); color: #00E599; font-size: 0.7rem; padding: 0.2rem 0.5rem; border-radius: 6px; cursor: pointer;" data-tooltip="View Worm progression curve">📈 Worm</button>
            <button type="button" onclick="window.cricosMobileApp.toggleMobileChart('MANHATTAN')" style="background: rgba(0, 210, 255, 0.1); border: 1px solid rgba(0, 210, 255, 0.3); color: #00D2FF; font-size: 0.7rem; padding: 0.2rem 0.5rem; border-radius: 6px; cursor: pointer;" data-tooltip="View Manhattan over bars">📊 Bars</button>
            <button type="button" onclick="window.cricosMobileApp.openScorecardModal()" style="background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.15); color: #f8fafc; font-size: 0.7rem; padding: 0.2rem 0.5rem; border-radius: 6px; cursor: pointer;" data-tooltip="Export match scorecard">📄 Card</button>
          </div>
        </div>

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

        ${isScorerOrAdmin ? `
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
        ` : ''}
      </div>
    `;
  }
}
