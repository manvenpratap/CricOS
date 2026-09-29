export interface MobilePlayer {
    id: string;
    name: string;
    jerseyNumber: number;
    role: 'C' | 'VC' | 'WK' | 'BAT' | 'BOWL' | 'ALL';
    battingStance: 'RHB' | 'LHB';
    bowlingStyle: string;
    isCaptain?: boolean;
}
export interface TeamsScreenState {
    teamName: string;
    teamCode: string;
    captainName: string;
    playingXI: MobilePlayer[];
    bench: MobilePlayer[];
    tossConducted: boolean;
    tossWinner?: string;
    tossDecision?: 'BAT' | 'BOWL';
}
export declare class TeamsScreenController {
    private state;
    constructor(initialState?: Partial<TeamsScreenState>);
    getState(): TeamsScreenState;
    swapPlayerWithBench(xiPlayerId: string, benchPlayerId: string): boolean;
    recordToss(winner: string, decision: 'BAT' | 'BOWL'): void;
    renderMobileHtml(isCaptain?: boolean): string;
}
//# sourceMappingURL=TeamsScreen.d.ts.map