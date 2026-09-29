import { FastifyInstance } from 'fastify';
import { ScoreState } from '@cricket-platform/scoring';
export declare function getMatchScore(matchId: string): ScoreState;
export declare function setMatchScore(matchId: string, state: ScoreState): void;
export declare function scoringRoutes(app: FastifyInstance): Promise<void>;
//# sourceMappingURL=routes.d.ts.map