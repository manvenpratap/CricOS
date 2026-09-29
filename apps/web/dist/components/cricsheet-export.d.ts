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
export declare function parseSpeechToScore(transcript: string): {
    runs: number;
    isExtra: boolean;
    extraType?: string;
    isWicket: boolean;
    wicketKind?: string;
    zone?: string;
};
export declare class CricsheetExportEngine {
    private audioLogs;
    constructor();
    private seedDefaultAudioLogs;
    recordAudioTelemetry(entry: Omit<SpeechCommentaryRecord, 'id' | 'timestamp' | 'detectedAction'>): SpeechCommentaryRecord;
    getAudioLogs(): SpeechCommentaryRecord[];
    /**
     * Generates official Cricsheet v1.0.0 JSON specification string.
     */
    generateCricsheetJson(data: CricsheetMatchData): string;
    /**
     * Generates standard XML cricket format for international federation archives.
     */
    generateCricketXml(data: CricsheetMatchData): string;
    /**
     * Helper producing default live match Cricsheet object for immediate export.
     */
    getDefaultMatchPayload(): CricsheetMatchData;
    renderExportModalHtml(): string;
}
//# sourceMappingURL=cricsheet-export.d.ts.map