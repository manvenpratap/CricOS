/**
 * apps/web/src/components/cricsheet-export.ts
 *
 * CricOS Cricsheet & Federation XML Export Engine with Audio Commentary Telemetry
 * Compliant with Cricsheet.org data specification (v1.0.0) and international cricket XML formats.
 */

export interface CricsheetPlayerOut {
  player: string;
  kind: string;
  fielders?: string[];
}

export interface CricsheetDelivery {
  batter: string;
  bowler: string;
  non_striker: string;
  runs: {
    batter: number;
    extras: number;
    total: number;
  };
  extras?: {
    wides?: number;
    noballs?: number;
    legbyes?: number;
    byes?: number;
    penalty?: number;
  };
  wickets?: CricsheetPlayerOut[];
}

export interface CricsheetOver {
  over: number;
  deliveries: CricsheetDelivery[];
}

export interface CricsheetInnings {
  team: string;
  overs: CricsheetOver[];
  target?: {
    overs: number;
    runs: number;
  };
}

export interface CricsheetMatchData {
  meta: {
    data_version: string;
    created: string;
    revision: number;
  };
  info: {
    balls_per_over: number;
    dates: string[];
    gender: 'male' | 'female';
    match_type: 'T20' | 'ODI' | 'TEST' | 'CLUB';
    teams: [string, string];
    toss: {
      decision: 'bat' | 'field';
      winner: string;
    };
    venue: string;
    city?: string;
    officials: {
      umpires: string[];
      scorers?: string[];
      match_referees?: string[];
    };
    outcome: {
      winner?: string;
      by?: {
        runs?: number;
        wickets?: number;
      };
      result?: 'draw' | 'tie' | 'no result';
    };
    player_of_match?: string[];
  };
  innings: CricsheetInnings[];
}

export interface SpeechCommentaryRecord {
  id: string;
  over: string;
  speaker: 'SCORER' | 'LEAD_COMMENTATOR' | 'COLOR_COMMENTATOR' | 'UMPIRE';
  audioTranscript: string;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'EXCITED' | 'CRITICAL';
  detectedAction: {
    runs?: number;
    isExtra?: boolean;
    extraType?: string;
    isWicket?: boolean;
    wicketKind?: string;
    zone?: string;
  } | null;
  timestamp: string;
}

/**
 * Intelligent NLP parser for speech-to-score live input.
 * Transforms natural commentary phrases into structured delivery actions.
 */
export function parseSpeechToScore(transcript: string): {
  runs: number;
  isExtra: boolean;
  extraType?: string;
  isWicket: boolean;
  wicketKind?: string;
  zone?: string;
} {
  const text = transcript.toLowerCase();

  // Wicket detection
  let isWicket = false;
  let wicketKind: string | undefined;
  if (text.includes('out') || text.includes('wicket') || text.includes('bowled') || text.includes('caught') || text.includes('lbw')) {
    isWicket = true;
    if (text.includes('caught behind')) wicketKind = 'caught behind';
    else if (text.includes('caught')) wicketKind = 'caught';
    else if (text.includes('bowled')) wicketKind = 'bowled';
    else if (text.includes('lbw')) wicketKind = 'lbw';
    else if (text.includes('run out')) wicketKind = 'run out';
    else if (text.includes('stumped')) wicketKind = 'stumped';
    else wicketKind = 'caught';
  }

  // Zone detection
  let zone: string | undefined;
  if (text.includes('cover')) zone = 'Cover';
  else if (text.includes('long off')) zone = 'Long Off';
  else if (text.includes('long on')) zone = 'Long On';
  else if (text.includes('mid wicket') || text.includes('midwicket')) zone = 'Mid Wkt';
  else if (text.includes('point')) zone = 'Point';
  else if (text.includes('third man')) zone = 'Third Man';
  else if (text.includes('square leg')) zone = 'Sq Leg';
  else if (text.includes('fine leg')) zone = 'Fine Leg';

  // Extras detection
  let isExtra = false;
  let extraType: string | undefined;
  if (text.includes('wide')) {
    isExtra = true;
    extraType = 'WIDE';
    return { runs: 1, isExtra, extraType, isWicket: false, zone };
  }
  if (text.includes('no ball') || text.includes('no-ball')) {
    isExtra = true;
    extraType = 'NO_BALL';
    let runs = 1;
    if (text.includes('four') || text.includes('boundary')) runs = 5;
    if (text.includes('six') || text.includes('maximum')) runs = 7;
    return { runs, isExtra, extraType, isWicket: false, zone };
  }
  if (text.includes('leg bye')) {
    isExtra = true;
    extraType = 'LEG_BYE';
    return { runs: 1, isExtra, extraType, isWicket: false, zone };
  }
  if (text.includes('bye')) {
    isExtra = true;
    extraType = 'BYE';
    return { runs: 1, isExtra, extraType, isWicket: false, zone };
  }

  // Runs detection
  let runs = 0;
  if (text.includes('six') || text.includes('maximum')) {
    runs = 6;
  } else if (text.includes('four') || text.includes('boundary')) {
    runs = 4;
  } else if (text.includes('three')) {
    runs = 3;
  } else if (text.includes('two') || text.includes('double') || text.includes('couple')) {
    runs = 2;
  } else if (text.includes('single') || text.includes('one run')) {
    runs = 1;
  } else if (text.includes('dot') || text.includes('no run')) {
    runs = 0;
  }

  return { runs, isExtra, extraType, isWicket, wicketKind, zone };
}

export class CricsheetExportEngine {
  private audioLogs: SpeechCommentaryRecord[] = [];

  constructor() {
    this.seedDefaultAudioLogs();
  }

  private seedDefaultAudioLogs(): void {
    this.audioLogs.push({
      id: 'AUD-001',
      over: '16.1',
      speaker: 'LEAD_COMMENTATOR',
      audioTranscript: 'Full length on middle stump, driven cleanly through extra cover for four!',
      sentiment: 'EXCITED',
      detectedAction: { runs: 4, isExtra: false, isWicket: false, zone: 'Cover' },
      timestamp: '15:10:04'
    });
    this.audioLogs.push({
      id: 'AUD-002',
      over: '16.4',
      speaker: 'SCORER',
      audioTranscript: 'Single to deep third man, rotating strike.',
      sentiment: 'NEUTRAL',
      detectedAction: { runs: 1, isExtra: false, isWicket: false, zone: 'Third Man' },
      timestamp: '15:12:18'
    });
  }

  public recordAudioTelemetry(
    entry: Omit<SpeechCommentaryRecord, 'id' | 'timestamp' | 'detectedAction'>
  ): SpeechCommentaryRecord {
    const detectedAction = parseSpeechToScore(entry.audioTranscript);
    const newRecord: SpeechCommentaryRecord = {
      ...entry,
      id: `AUD-${Date.now()}`,
      detectedAction,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
    };
    this.audioLogs.unshift(newRecord);
    return newRecord;
  }

  public getAudioLogs(): SpeechCommentaryRecord[] {
    return [...this.audioLogs];
  }

  /**
   * Generates official Cricsheet v1.0.0 JSON specification string.
   */
  public generateCricsheetJson(data: CricsheetMatchData): string {
    return JSON.stringify(data, null, 2);
  }

  /**
   * Generates standard XML cricket format for international federation archives.
   */
  public generateCricketXml(data: CricsheetMatchData): string {
    const teams = data.info.teams;
    const toss = data.info.toss;
    const outcome = data.info.outcome;

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<CricketMatch id="${data.meta.data_version}" matchType="${data.info.match_type}" created="${data.meta.created}">\n`;
    xml += `  <MatchInfo>\n`;
    xml += `    <Venue>${data.info.venue}</Venue>\n`;
    xml += `    <Date>${data.info.dates[0] || '2026-09-26'}</Date>\n`;
    xml += `    <Teams>\n`;
    xml += `      <Team side="1" name="${teams[0]}" />\n`;
    xml += `      <Team side="2" name="${teams[1]}" />\n`;
    xml += `    </Teams>\n`;
    xml += `    <Toss winner="${toss.winner}" decision="${toss.decision}" />\n`;
    xml += `    <Outcome winner="${outcome.winner || 'TBD'}" margin="${outcome.by?.runs ? `${outcome.by.runs} runs` : outcome.by?.wickets ? `${outcome.by.wickets} wickets` : 'N/A'}" />\n`;
    xml += `    <Officials>\n`;
    xml += `      <Umpires>${data.info.officials.umpires.join(', ')}</Umpires>\n`;
    if (data.info.officials.scorers) {
      xml += `      <Scorers>${data.info.officials.scorers.join(', ')}</Scorers>\n`;
    }
    xml += `    </Officials>\n`;
    xml += `  </MatchInfo>\n`;

    xml += `  <InningsList>\n`;
    data.innings.forEach((inn, innIdx) => {
      xml += `    <Innings number="${innIdx + 1}" team="${inn.team}">\n`;
      inn.overs.forEach(o => {
        xml += `      <Over number="${o.over}">\n`;
        o.deliveries.forEach((d, ballIdx) => {
          xml += `        <Ball index="${ballIdx + 1}" batter="${d.batter}" bowler="${d.bowler}" nonStriker="${d.non_striker}">\n`;
          xml += `          <Runs batter="${d.runs.batter}" extras="${d.runs.extras}" total="${d.runs.total}" />\n`;
          if (d.extras) {
            xml += `          <Extras wides="${d.extras.wides || 0}" noballs="${d.extras.noballs || 0}" legbyes="${d.extras.legbyes || 0}" byes="${d.extras.byes || 0}" />\n`;
          }
          if (d.wickets && d.wickets.length > 0) {
            d.wickets.forEach(w => {
              xml += `          <Wicket playerOut="${w.player}" kind="${w.kind}" />\n`;
            });
          }
          xml += `        </Ball>\n`;
        });
        xml += `      </Over>\n`;
      });
      xml += `    </Innings>\n`;
    });
    xml += `  </InningsList>\n`;
    xml += `</CricketMatch>\n`;

    return xml;
  }

  /**
   * Helper producing default live match Cricsheet object for immediate export.
   */
  public getDefaultMatchPayload(): CricsheetMatchData {
    return {
      meta: {
        data_version: '1.0.0',
        created: '2026-09-26T23:15:00Z',
        revision: 1
      },
      info: {
        balls_per_over: 6,
        dates: ['2026-09-26'],
        gender: 'male',
        match_type: 'T20',
        teams: ['Delhi Daredevils', 'Mumbai Super Strikers'],
        toss: {
          winner: 'Delhi Daredevils',
          decision: 'bat'
        },
        venue: 'Harbour Cricket Ground, South Turf',
        city: 'Mumbai',
        officials: {
          umpires: ['Nitin Menon', 'Sundaram Ravi'],
          scorers: ['Jayanth Kumar'],
          match_referees: ['Javagal Srinath']
        },
        outcome: {
          winner: 'Mumbai Super Strikers',
          by: {
            wickets: 7
          }
        },
        player_of_match: ['Rohit Sharma']
      },
      innings: [
        {
          team: 'Delhi Daredevils',
          overs: [
            {
              over: 1,
              deliveries: [
                {
                  batter: 'Virat Sharma',
                  bowler: 'Jasprit Bumrah',
                  non_striker: 'Shikhar D.',
                  runs: { batter: 0, extras: 0, total: 0 }
                },
                {
                  batter: 'Virat Sharma',
                  bowler: 'Jasprit Bumrah',
                  non_striker: 'Shikhar D.',
                  runs: { batter: 4, extras: 0, total: 4 }
                }
              ]
            }
          ]
        },
        {
          team: 'Mumbai Super Strikers',
          target: { overs: 20, runs: 179 },
          overs: [
            {
              over: 1,
              deliveries: [
                {
                  batter: 'Rohit Sharma',
                  bowler: 'Mohammed Siraj',
                  non_striker: 'Ishan K.',
                  runs: { batter: 6, extras: 0, total: 6 }
                }
              ]
            }
          ]
        }
      ]
    };
  }

  public renderExportModalHtml(): string {
    const defaultData = this.getDefaultMatchPayload();
    const cricsheetJson = this.generateCricsheetJson(defaultData);
    const cricketXml = this.generateCricketXml(defaultData);

    const audioLogRows = this.audioLogs
      .map(
        a => `
        <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 0.6rem 0.8rem; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="display: flex; gap: 0.5rem; align-items: center;">
              <span style="font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; color: #00D2FF; font-weight: 700;">Over ${a.over}</span>
              <span style="font-size: 0.72rem; font-weight: 700; color: #fff;">${a.speaker}</span>
              <span style="font-size: 0.65rem; color: #94a3b8;">${a.timestamp}</span>
            </div>
            <div style="font-size: 0.8rem; color: #CBD5E1; margin-top: 0.2rem;">
              "${a.audioTranscript}"
            </div>
          </div>
          ${
            a.detectedAction
              ? `
            <div style="text-align: right;">
              <span style="font-family: 'Chakra Petch', monospace; font-weight: 800; font-size: 0.85rem; color: #00E599; background: rgba(0,229,153,0.1); border: 1px solid #00E599; padding: 0.15rem 0.4rem; border-radius: 4px;">
                +${a.detectedAction.runs} ${a.detectedAction.zone ? `(${a.detectedAction.zone})` : ''}
              </span>
            </div>
          `
              : ''
          }
        </div>
      `
      )
      .join('');

    return `
      <div class="cricsheet-export-modal" style="color: #f8fafc; font-family: 'Plus Jakarta Sans', sans-serif;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <div>
            <h3 style="margin: 0; font-family: 'Space Grotesk', sans-serif; font-size: 1.25rem; color: #fff;">
              ⚡ Match Scorer Studio & Federation Export
            </h3>
            <div style="font-size: 0.8rem; color: #94a3b8; margin-top: 0.2rem;">
              Ball-by-ball Cricsheet (JSON) & International Cricket XML with Live Speech-to-Score Telemetry
            </div>
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-secondary btn-sm" id="btnDownloadCricsheetJson" onclick="downloadCricsheetFile('json')" data-tooltip="Download match as official Cricsheet JSON">
              📥 Cricsheet (JSON)
            </button>
            <button class="btn btn-secondary btn-sm" id="btnDownloadCricketXml" onclick="downloadCricsheetFile('xml')" data-tooltip="Download match as Federation XML">
              📥 Federation (XML)
            </button>
          </div>
        </div>

        <!-- Speech-to-Score Voice Telemetry Section -->
        <div style="background: rgba(10, 16, 28, 0.85); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1rem; margin-bottom: 1.25rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem;">
            <span style="font-size: 0.85rem; font-weight: 700; color: #00D2FF; font-family: 'Space Grotesk', sans-serif;">
              🎙️ Speech-to-Score Live Telemetry
            </span>
            <span style="font-size: 0.7rem; color: #00E599; background: rgba(0,229,153,0.1); padding: 0.15rem 0.4rem; border-radius: 4px;">
              ● Voice Engine Active
            </span>
          </div>
          <div style="display: flex; gap: 0.5rem; margin-bottom: 0.75rem;">
            <input type="text" id="audioTranscriptInput" placeholder="Speak or type commentary (e.g. 'Four runs driven past extra cover')" style="flex: 1; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; padding: 0.5rem 0.8rem; color: #fff; font-size: 0.82rem;" />
            <button class="btn btn-primary btn-sm" id="btnSubmitSpeechDelivery" onclick="submitSpeechCommentary()" data-tooltip="Parse commentary into automated delivery recording">
              ⚡ Record Spoken Ball
            </button>
          </div>
          <div>${audioLogRows}</div>
        </div>

        <!-- Code Preview Tabs -->
        <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; overflow: hidden;">
          <div style="padding: 0.5rem 1rem; background: rgba(255,255,255,0.04); border-bottom: 1px solid rgba(255,255,255,0.08); font-size: 0.75rem; color: #94a3b8; font-weight: 700; text-transform: uppercase;">
            Live Export Manifest Preview (Cricsheet JSON)
          </div>
          <pre style="margin: 0; padding: 1rem; max-height: 180px; overflow-y: auto; font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: #00E599; line-height: 1.4;"><code>${cricsheetJson.slice(0, 1000)}...</code></pre>
        </div>
      </div>
    `;
  }
}
