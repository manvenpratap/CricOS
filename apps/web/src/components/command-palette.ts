/**
 * CricOS Universal Command Palette (Cmd+K / Ctrl+K) & Omnisearch Studio
 * Enables zero-latency keyboard navigation across tabs, live match scoring actions,
 * 3D studio viewers, player dossiers, theme switching, and persona switching.
 */

export type CommandCategory =
  | 'NAVIGATION'
  | 'LIVE_SCORING'
  | 'TACTICS_3D'
  | 'PLAYERS'
  | 'THEMES_PERSONAS';

export interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  category: CommandCategory;
  shortcut?: string;
  icon: string;
  keywords: string[];
  actionType: 'TAB' | 'MODAL' | 'FUNCTION' | 'THEME' | 'PERSONA' | 'PLAYER_CARD';
  payload: string;
}

export const DEFAULT_COMMAND_REGISTRY: CommandItem[] = [
  // Navigation
  {
    id: 'cmd-nav-matches',
    title: 'Go to Match Center & Live Scoring',
    subtitle: 'Ball-by-ball scoring studio, 3D stadium, wagon wheel & commentary',
    category: 'NAVIGATION',
    shortcut: 'G M',
    icon: '🏏',
    keywords: ['match', 'live', 'score', 'studio', 'center', 'commentary'],
    actionType: 'TAB',
    payload: 'matches',
  },
  {
    id: 'cmd-nav-tournaments',
    title: 'Go to Tournaments & Brackets',
    subtitle: 'Multi-division league ladders, NRR standings & fixture scheduling',
    category: 'NAVIGATION',
    shortcut: 'G T',
    icon: '🏆',
    keywords: ['tournament', 'league', 'bracket', 'nrr', 'standings', 'schedule'],
    actionType: 'TAB',
    payload: 'tournaments',
  },
  {
    id: 'cmd-nav-teams',
    title: 'Go to Teams & Squad Rosters',
    subtitle: 'Playing XI selector, 3D player cards, career analytics & join codes',
    category: 'NAVIGATION',
    shortcut: 'G R',
    icon: '🛡️',
    keywords: ['team', 'roster', 'squad', 'playing xi', 'lineup'],
    actionType: 'TAB',
    payload: 'teams',
  },
  {
    id: 'cmd-nav-marketplace',
    title: 'Go to Provider Marketplace & Grounds',
    subtitle: 'Book certified umpires, scorers, floodlit turfs & equipment RFQs',
    category: 'NAVIGATION',
    shortcut: 'G K',
    icon: '🏟️',
    keywords: ['marketplace', 'ground', 'turf', 'umpire', 'book', 'rfq'],
    actionType: 'TAB',
    payload: 'marketplace',
  },
  {
    id: 'cmd-nav-analytics',
    title: 'Go to Broadcast Analytics & Telemetry',
    subtitle: 'Worm velocity, Manhattan bars, pitch beehive map & win probability',
    category: 'NAVIGATION',
    shortcut: 'G A',
    icon: '📊',
    keywords: ['analytics', 'worm', 'manhattan', 'chart', 'telemetry', 'stats'],
    actionType: 'TAB',
    payload: 'analytics',
  },

  // Tactics & 3D Studio
  {
    id: 'cmd-tactics-field-planner',
    title: 'Open Tactical Field Placement & Powerplay Planner',
    subtitle: 'Interactive 11-fielder radar with MCC Law 28.4 circle validation & presets',
    category: 'TACTICS_3D',
    shortcut: 'Shift+F',
    icon: '🎯',
    keywords: ['field', 'placement', 'powerplay', 'tactics', 'slip', 'captain', 'radar'],
    actionType: 'MODAL',
    payload: 'openFieldPlannerModal',
  },
  {
    id: 'cmd-tactics-pitch-map',
    title: 'Open Pitch Beehive Map & Win Probability Simulator',
    subtitle: 'Pitching length heatmap (Yorker/Good/Short) & What-If chase Monte Carlo',
    category: 'TACTICS_3D',
    shortcut: 'Shift+P',
    icon: '🧬',
    keywords: ['pitch', 'beehive', 'length', 'yorker', 'win', 'probability', 'simulator'],
    actionType: 'MODAL',
    payload: 'openPitchMapSimulatorModal',
  },
  {
    id: 'cmd-tactics-player-auction',
    title: 'Open Live Player Auction & Franchise Draft Room',
    subtitle: 'Real-time bidding gavel, franchise salary cap purse & RTM cards',
    category: 'TACTICS_3D',
    shortcut: 'Shift+A',
    icon: '🔨',
    keywords: ['auction', 'draft', 'bid', 'franchise', 'purse', 'rtm', 'ipl'],
    actionType: 'MODAL',
    payload: 'openPlayerAuctionModal',
  },
  {
    id: 'cmd-tactics-3d-stadium',
    title: 'Switch to 3D WebGL Floodlit Stadium Pitch',
    subtitle: '8 broadcast camera angles, Hawk-Eye ball tracking & 11 live fielders',
    category: 'TACTICS_3D',
    shortcut: '3',
    icon: '🌐',
    keywords: ['3d', 'stadium', 'webgl', 'hawkeye', 'camera', 'pitch'],
    actionType: 'FUNCTION',
    payload: 'activate3DStadiumMode',
  },
  {
    id: 'cmd-tactics-dls',
    title: 'Open Duckworth-Lewis-Stern (DLS) Target Calculator',
    subtitle: 'Rain interruption par score & revised target calculator',
    category: 'TACTICS_3D',
    shortcut: 'D',
    icon: '🌧️',
    keywords: ['dls', 'rain', 'duckworth', 'target', 'par'],
    actionType: 'MODAL',
    payload: 'openDlsCalculatorModal',
  },
  {
    id: 'cmd-tactics-umpire-desk',
    title: 'Open Lead Umpire Match Desk & DRS Review',
    subtitle: 'MCC Law 41/42 disciplinary sanctions, penalty runs & LBW Hawk-Eye verdict',
    category: 'TACTICS_3D',
    shortcut: 'U',
    icon: '⚖️',
    keywords: ['umpire', 'drs', 'lbw', 'sanction', 'penalty', 'conduct'],
    actionType: 'MODAL',
    payload: 'openUmpireDeskModal',
  },

  // Live Scoring Quick Actions
  {
    id: 'cmd-score-four',
    title: 'Record Boundary 4 Runs',
    subtitle: 'Log crisp boundary four to active striker and update wagon wheel',
    category: 'LIVE_SCORING',
    shortcut: '4',
    icon: '🟢',
    keywords: ['score', 'four', '4', 'boundary', 'runs'],
    actionType: 'FUNCTION',
    payload: 'quickScoreFour',
  },
  {
    id: 'cmd-score-six',
    title: 'Record Maximum 6 Runs',
    subtitle: 'Log towering maximum six with trajectory arc & stadium celebration',
    category: 'LIVE_SCORING',
    shortcut: '6',
    icon: '🟣',
    keywords: ['score', 'six', '6', 'maximum', 'runs'],
    actionType: 'FUNCTION',
    payload: 'quickScoreSix',
  },
  {
    id: 'cmd-score-undo',
    title: 'Undo Last Delivery',
    subtitle: 'Revert fat-finger scoring mistake and restore previous striker state',
    category: 'LIVE_SCORING',
    shortcut: '⌘Z',
    icon: '↺',
    keywords: ['undo', 'revert', 'mistake', 'last ball'],
    actionType: 'FUNCTION',
    payload: 'undoLastDelivery',
  },
  {
    id: 'cmd-export-cricsheet',
    title: 'Export Cricsheet v1.0.0 JSON & Federation XML',
    subtitle: 'Download official ball-by-ball syndication feed and cryptographic digest',
    category: 'LIVE_SCORING',
    shortcut: 'E',
    icon: '📄',
    keywords: ['export', 'cricsheet', 'json', 'xml', 'download'],
    actionType: 'MODAL',
    payload: 'openCricsheetExportModal',
  },

  // Players
  {
    id: 'cmd-player-virat',
    title: 'Inspect Virat Sharma — Holographic 3D Card & Radar',
    subtitle: 'Top-Order Batter • RHB • SR 158.4 • Avg 54.2',
    category: 'PLAYERS',
    icon: '🃏',
    keywords: ['virat', 'sharma', 'kohli', 'player', 'card', 'batter'],
    actionType: 'PLAYER_CARD',
    payload: 'Virat Sharma',
  },
  {
    id: 'cmd-player-hardik',
    title: 'Inspect Hardik Patel — Holographic 3D Card & Radar',
    subtitle: 'Elite All-Rounder • RHB / Fast-Medium • SR 174.2',
    category: 'PLAYERS',
    icon: '🃏',
    keywords: ['hardik', 'patel', 'all-rounder', 'player', 'card'],
    actionType: 'PLAYER_CARD',
    payload: 'Hardik Patel',
  },
  {
    id: 'cmd-player-bumrah',
    title: 'Inspect Jasprit Bumrah — Holographic 3D Card & Radar',
    subtitle: 'Spearhead Pace Bowler • Right-Arm Fast • Econ 6.12',
    category: 'PLAYERS',
    icon: '🃏',
    keywords: ['jasprit', 'bumrah', 'bowler', 'yorker', 'player', 'card'],
    actionType: 'PLAYER_CARD',
    payload: 'Jasprit Bumrah',
  },

  // Themes & Personas
  {
    id: 'cmd-theme-stadium',
    title: 'Activate Theme: 🌙 Stadium Night (Broadcast Obsidian)',
    subtitle: 'Floodlit obsidian pitch (#04070D) with Turf Emerald & Electric Cyan LEDs',
    category: 'THEMES_PERSONAS',
    shortcut: 'Alt+1',
    icon: '🌙',
    keywords: ['theme', 'stadium', 'night', 'dark', 'obsidian'],
    actionType: 'THEME',
    payload: 'stadium',
  },
  {
    id: 'cmd-theme-swiss',
    title: 'Activate Theme: 🇨🇭 Swiss Minimalist (Daylight Grid)',
    subtitle: 'High-contrast daylight paper (#F8F9FA) with 7.09:1 WCAG AAA contrast',
    category: 'THEMES_PERSONAS',
    shortcut: 'Alt+2',
    icon: '🇨🇭',
    keywords: ['theme', 'swiss', 'minimal', 'light', 'daylight'],
    actionType: 'THEME',
    payload: 'swiss',
  },
  {
    id: 'cmd-theme-nordic',
    title: 'Activate Theme: 🌾 Nordic Editorial (Warm Parchment)',
    subtitle: 'Scandinavian warm oat canvas (#F5F0E8) with forest pine accents',
    category: 'THEMES_PERSONAS',
    shortcut: 'Alt+3',
    icon: '🌾',
    keywords: ['theme', 'nordic', 'editorial', 'warm', 'parchment'],
    actionType: 'THEME',
    payload: 'nordic',
  },
];

export class CommandPaletteEngine {
  private items: CommandItem[];

  constructor(customItems: CommandItem[] = DEFAULT_COMMAND_REGISTRY) {
    this.items = [...customItems];
  }

  public search(query: string): CommandItem[] {
    const q = query.trim().toLowerCase();
    if (!q) {
      return this.items;
    }

    const tokens = q.split(/\s+/);
    const scored = this.items
      .map((item) => {
        const haystack = [
          item.title,
          item.subtitle,
          item.category,
          ...item.keywords,
        ]
          .join(' ')
          .toLowerCase();

        let score = 0;
        for (const token of tokens) {
          if (item.title.toLowerCase().startsWith(token)) {
            score += 15;
          } else if (item.title.toLowerCase().includes(token)) {
            score += 10;
          } else if (item.keywords.some((k) => k.toLowerCase().includes(token))) {
            score += 8;
          } else if (haystack.includes(token)) {
            score += 4;
          } else {
            return { item, score: 0 };
          }
        }
        return { item, score };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score);

    return scored.map((s) => s.item);
  }

  public groupByCategory(items: CommandItem[]): Record<CommandCategory, CommandItem[]> {
    const grouped: Record<CommandCategory, CommandItem[]> = {
      NAVIGATION: [],
      TACTICS_3D: [],
      LIVE_SCORING: [],
      PLAYERS: [],
      THEMES_PERSONAS: [],
    };
    for (const item of items) {
      grouped[item.category].push(item);
    }
    return grouped;
  }
}
