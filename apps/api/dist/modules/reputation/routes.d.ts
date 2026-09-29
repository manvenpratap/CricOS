import { FastifyInstance } from 'fastify';
import { ProviderTrustState } from '@cricket-platform/domain';
export declare function getProviderReputation(id: string): {
    reliability_score: number;
    trust_state: ProviderTrustState;
};
export declare function setProviderReputation(id: string, score: number, trustState: ProviderTrustState): void;
export declare function reputationRoutes(app: FastifyInstance): Promise<void>;
//# sourceMappingURL=routes.d.ts.map