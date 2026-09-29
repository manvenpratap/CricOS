/**
 * CricOS Universal Command Palette (Cmd+K / Ctrl+K) & Omnisearch Studio
 * Enables zero-latency keyboard navigation across tabs, live match scoring actions,
 * 3D studio viewers, player dossiers, theme switching, and persona switching.
 */
export type CommandCategory = 'NAVIGATION' | 'LIVE_SCORING' | 'TACTICS_3D' | 'PLAYERS' | 'THEMES_PERSONAS';
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
export declare const DEFAULT_COMMAND_REGISTRY: CommandItem[];
export declare class CommandPaletteEngine {
    private items;
    constructor(customItems?: CommandItem[]);
    search(query: string): CommandItem[];
    groupByCategory(items: CommandItem[]): Record<CommandCategory, CommandItem[]>;
}
//# sourceMappingURL=command-palette.d.ts.map