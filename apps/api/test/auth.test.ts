import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { signToken, verifyToken } from '../dist/middleware/auth.js';
import { buildServer } from '../dist/server.js';
import type { FastifyInstance } from 'fastify';

describe('Security Hardening — Cryptographic JWT & RBAC Middleware', () => {
  let app: FastifyInstance;

  before(async () => {
    app = buildServer();
    await app.ready();
  });

  after(async () => {
    await app.close();
  });

  it('signs and verifies valid JWT token with user roles', () => {
    const token = signToken({
      userId: 'u-12345',
      identifier: 'captain@delhi.cricket',
      roles: ['CAPTAIN']
    });

    assert.ok(token.split('.').length === 3, 'JWT should have 3 segments');
    const decoded = verifyToken(token);
    assert.equal(decoded.userId, 'u-12345');
    assert.equal(decoded.identifier, 'captain@delhi.cricket');
    assert.deepEqual(decoded.roles, ['CAPTAIN']);
  });

  it('rejects tampered JWT signature with timing-safe check', () => {
    const token = signToken({
      userId: 'u-12345',
      identifier: 'captain@delhi.cricket',
      roles: ['CAPTAIN']
    });

    const [header, payload, signature] = token.split('.');
    // Tamper with payload
    const tamperedPayload = Buffer.from(JSON.stringify({ userId: 'hacker-99', roles: ['ADMIN'] })).toString('base64');
    const tamperedToken = `${header}.${tamperedPayload}.${signature}`;

    assert.throws(() => {
      verifyToken(tamperedToken);
    }, /TOKEN_INVALID_SIGNATURE/);
  });

  it('rejects expired token', () => {
    // 0 seconds validity
    const expiredToken = signToken(
      {
        userId: 'u-expired',
        identifier: 'expired@cricket.org',
        roles: ['PLAYER']
      },
      -10 // expired 10 seconds ago
    );

    assert.throws(() => {
      verifyToken(expiredToken);
    }, /TOKEN_EXPIRED/);
  });

  it('enforces authentication on protected routes: /auth/me returns 401 without Bearer token', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/me'
    });

    assert.equal(res.statusCode, 401);
    const body = JSON.parse(res.body);
    assert.equal(body.error, 'UNAUTHORIZED');
  });

  it('authorizes authenticated user on /auth/me with valid Bearer token', async () => {
    const token = signToken({
      userId: 'u-captain-77',
      identifier: '+919988776655',
      roles: ['CAPTAIN']
    });

    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/me',
      headers: {
        authorization: `Bearer ${token}`
      }
    });

    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.equal(body.status, 'AUTHENTICATED');
    assert.equal(body.user.userId, 'u-captain-77');
  });

  it('enforces RBAC guard: rejects CAPTAIN role from accessing financial settlement process (403)', async () => {
    const captainToken = signToken({
      userId: 'u-captain-77',
      identifier: 'captain@cricket.org',
      roles: ['CAPTAIN']
    });

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/settlements/process',
      headers: {
        authorization: `Bearer ${captainToken}`
      },
      payload: {
        booking_id: 'b-1',
        provider_id: 'p-1',
        gross_minor: 10000,
        commission_minor: 500
      }
    });

    assert.equal(res.statusCode, 403);
    const body = JSON.parse(res.body);
    assert.equal(body.error, 'FORBIDDEN');
  });

  it('enforces RBAC guard: grants ORGANISER role access to financial settlement process (201)', async () => {
    const organiserToken = signToken({
      userId: 'u-admin-1',
      identifier: 'admin@cricket.org',
      roles: ['ORGANISER']
    });

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/settlements/process',
      headers: {
        authorization: `Bearer ${organiserToken}`
      },
      payload: {
        booking_id: 'b-1',
        provider_id: 'p-1',
        gross_minor: 10000,
        commission_minor: 500
      }
    });

    assert.equal(res.statusCode, 201);
    const body = JSON.parse(res.body);
    assert.equal(body.status, 'RECORDED');
    assert.equal(body.net_minor, 9500);
  });
});
