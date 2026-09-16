export type MatchFormat = 'T20' | 'T10' | 'ODI' | 'HUNDRED';

export interface TournamentConfig {
  name: string;
  format: MatchFormat;
  teamIds: string[];
  maxOversPerInnings: number;
}

export interface GeneratedFixture {
  id: string;
  roundNumber: number;
  homeTeamId: string;
  awayTeamId: string;
  status: 'SCHEDULED' | 'LIVE' | 'COMPLETED';
}

export function generateTournamentSchedule(config: TournamentConfig): GeneratedFixture[] {
  const teams = [...config.teamIds];
  if (teams.length % 2 !== 0) {
    teams.push('BYE');
  }

  const fixtures: GeneratedFixture[] = [];
  const numRounds = teams.length - 1;
  const half = teams.length / 2;

  let currentRound = 1;
  for (let r = 0; r < numRounds; r++) {
    for (let i = 0; i < half; i++) {
      const home = teams[i];
      const away = teams[teams.length - 1 - i];
      if (home && away && home !== 'BYE' && away !== 'BYE') {
        fixtures.push({
          id: `fix-${currentRound}-${home}-${away}`,
          roundNumber: currentRound,
          homeTeamId: home,
          awayTeamId: away,
          status: 'SCHEDULED'
        });
      }
    }
    currentRound++;
    // Rotate array keeping index 0 fixed
    const first = teams[0];
    const rest = teams.slice(1);
    const last = rest.pop();
    if (last !== undefined && first !== undefined) {
      teams.splice(0, teams.length, first, last, ...rest);
    }
  }

  return fixtures;
}
