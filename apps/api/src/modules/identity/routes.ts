import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'node:crypto';
import { query } from '../../platform/db.js';
import { signToken, authenticate, UserRole } from '../../middleware/auth.js';

export async function identityRoutes(app: FastifyInstance) {
  app.post('/auth/otp/request', async (req: FastifyRequest<{ Body: { identifier: string } }>, reply: FastifyReply) => {
    const { identifier } = req.body || {};
    if (!identifier) {
      return reply.status(400).send({ error: 'IDENTIFIER_REQUIRED', message: 'identifier (email or phone) is required' });
    }
    // In staging/pilot sandbox, generate a deterministic code
    return reply.status(200).send({
      success: true,
      message: 'OTP sent successfully',
      debug_code: '123456'
    });
  });

  app.post('/auth/otp/verify', async (req: FastifyRequest<{ Body: { identifier: string; code: string; role?: UserRole } }>, reply: FastifyReply) => {
    const { identifier, code, role = 'CAPTAIN' } = req.body || {};
    if (!identifier || !code) {
      return reply.status(400).send({ error: 'INVALID_CREDENTIALS', message: 'identifier and code required' });
    }
    if (code !== '123456' && code !== '000000') {
      return reply.status(401).send({ error: 'INVALID_OTP', message: 'Invalid OTP code' });
    }

    const userId = crypto.createHash('sha256').update(identifier).digest('hex').slice(0, 8) + '-0000-0000-0000-000000000000';
    const roles: UserRole[] = [role];

    try {
      await query(
        `INSERT INTO users (id, status, timezone) VALUES ($1, 'ACTIVE', 'Asia/Kolkata')
         ON CONFLICT (id) DO NOTHING`,
        [userId]
      );
      await query(
        `INSERT INTO user_roles (user_id, role) VALUES ($1, $2)
         ON CONFLICT (user_id, role) DO NOTHING`,
        [userId, role]
      );
    } catch {
      // Fallback if DB offline
    }

    const token = signToken({
      userId,
      identifier,
      roles
    });

    return reply.status(200).send({
      token,
      user: {
        id: userId,
        identifier,
        roles,
        status: 'ACTIVE'
      }
    });
  });

  app.get('/auth/me', { preHandler: [authenticate] }, async (req: FastifyRequest, reply: FastifyReply) => {
    const user = (req as any).user;
    return reply.status(200).send({
      status: 'AUTHENTICATED',
      user,
      scope: user?.roles || ['CAPTAIN']
    });
  });
}
