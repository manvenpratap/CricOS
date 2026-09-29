import { FastifyRequest, FastifyReply } from 'fastify';
export type UserRole = 'CAPTAIN' | 'ORGANISER' | 'PROVIDER' | 'ADMIN' | 'SCORER' | 'PLAYER' | 'UMPIRE' | 'FAN';
export interface AuthTokenPayload {
    userId: string;
    identifier: string;
    roles: UserRole[];
    iat: number;
    exp: number;
}
export declare function signToken(data: {
    userId: string;
    identifier: string;
    roles: UserRole[];
}, expiresInSeconds?: number): string;
export declare function verifyToken(token: string): AuthTokenPayload;
export declare function authenticate(req: FastifyRequest, reply: FastifyReply): Promise<void>;
export declare function requireRole(...allowedRoles: UserRole[]): (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
//# sourceMappingURL=auth.d.ts.map