import crypto from 'node:crypto';
const JWT_SECRET = process.env.JWT_SECRET || 'cricos-development-super-secret-key-32chars!!';
function base64UrlEncode(str) {
    return Buffer.from(str)
        .toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}
function base64UrlDecode(str) {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) {
        str += '=';
    }
    return Buffer.from(str, 'base64').toString('utf8');
}
export function signToken(data, expiresInSeconds = 86400 // default 24 hours
) {
    const header = { alg: 'HS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const payload = {
        ...data,
        iat: now,
        exp: now + expiresInSeconds
    };
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    const signature = crypto
        .createHmac('sha256', JWT_SECRET)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
    return `${encodedHeader}.${encodedPayload}.${signature}`;
}
export function verifyToken(token) {
    if (!token || typeof token !== 'string') {
        throw new Error('TOKEN_MISSING: Authentication token required');
    }
    const parts = token.split('.');
    if (parts.length !== 3) {
        throw new Error('TOKEN_MALFORMED: Invalid JWT token format');
    }
    const [encodedHeader, encodedPayload, signature] = parts;
    const expectedSignature = crypto
        .createHmac('sha256', JWT_SECRET)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
    // Constant-time buffer comparison to prevent timing attacks
    const sigBuf = Buffer.from(signature);
    const expectedSigBuf = Buffer.from(expectedSignature);
    if (sigBuf.length !== expectedSigBuf.length || !crypto.timingSafeEqual(sigBuf, expectedSigBuf)) {
        throw new Error('TOKEN_INVALID_SIGNATURE: Cryptographic verification failed');
    }
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
        throw new Error('TOKEN_EXPIRED: Authentication token has expired');
    }
    return payload;
}
// Fastify preHandler Authentication hook
export async function authenticate(req, reply) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        reply.status(401).send({
            error: 'UNAUTHORIZED',
            message: 'Missing or invalid Authorization header. Expected Bearer <token>'
        });
        return;
    }
    const token = authHeader.slice(7).trim();
    try {
        const payload = verifyToken(token);
        req.user = payload;
    }
    catch (err) {
        reply.status(401).send({
            error: 'UNAUTHORIZED',
            message: err.message
        });
    }
}
// Fastify preHandler Role-Based Access Control (RBAC) guard
export function requireRole(...allowedRoles) {
    return async (req, reply) => {
        const user = req.user;
        if (!user) {
            reply.status(401).send({
                error: 'UNAUTHORIZED',
                message: 'User authentication required prior to RBAC check'
            });
            return;
        }
        // Admins bypass all role checks
        if (user.roles.includes('ADMIN')) {
            return;
        }
        const hasRole = allowedRoles.some((r) => user.roles.includes(r));
        if (!hasRole) {
            reply.status(403).send({
                error: 'FORBIDDEN',
                message: `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]`,
                user_roles: user.roles
            });
        }
    };
}
//# sourceMappingURL=auth.js.map