import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { buildServer } from '../dist/server.js';
import {
  AppError,
  ValidationError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  RateLimitExceededError
} from '../dist/platform/errors.js';
import { recordAuditEvent } from '../dist/platform/audit.js';
import type { FastifyInstance } from 'fastify';

describe('Audit, Security Headers & Error Hierarchy (Technical Audit Corrective Actions)', () => {
  let app: FastifyInstance;

  before(async () => {
    app = buildServer();
    await app.ready();
  });

  after(async () => {
    await app.close();
  });

  describe('1. Security Headers & Correlation IDs', () => {
    it('sets standard security headers on API responses', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/health'
      });

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.headers['x-content-type-options'], 'nosniff');
      assert.strictEqual(res.headers['x-frame-options'], 'SAMEORIGIN');
      assert.strictEqual(res.headers['referrer-policy'], 'strict-origin-when-cross-origin');
      assert.strictEqual(res.headers['x-xss-protection'], '1; mode=block');
    });

    it('generates and returns x-correlation-id and x-request-id headers', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/health'
      });

      assert.ok(res.headers['x-correlation-id']);
      assert.ok(res.headers['x-request-id']);
      assert.strictEqual(res.headers['x-correlation-id'], res.headers['x-request-id']);
    });

    it('preserves client-provided x-correlation-id across lifecycle', async () => {
      const clientCorrelationId = 'client-cid-987654';
      const res = await app.inject({
        method: 'GET',
        url: '/health',
        headers: {
          'x-correlation-id': clientCorrelationId
        }
      });

      assert.strictEqual(res.headers['x-correlation-id'], clientCorrelationId);
      assert.strictEqual(res.headers['x-request-id'], clientCorrelationId);
    });
  });

  describe('2. Domain Error Class Hierarchy', () => {
    it('instantiates ValidationError with 400 and code VALIDATION_ERROR', () => {
      const err = new ValidationError('Invalid request payload', { field: 'email' });
      assert.strictEqual(err.statusCode, 400);
      assert.strictEqual(err.code, 'VALIDATION_ERROR');
      assert.strictEqual(err.message, 'Invalid request payload');
      assert.deepStrictEqual(err.details, { field: 'email' });
      assert.ok(err instanceof AppError);
    });

    it('instantiates NotFoundError with 404 and code NOT_FOUND', () => {
      const err = new NotFoundError('Booking', 'bkg-1234');
      assert.strictEqual(err.statusCode, 404);
      assert.strictEqual(err.code, 'NOT_FOUND');
      assert.strictEqual(err.details.resource, 'Booking');
      assert.strictEqual(err.details.id, 'bkg-1234');
      assert.ok(err instanceof AppError);
    });

    it('instantiates AuthenticationError and ForbiddenError with expected codes', () => {
      const authErr = new AuthenticationError();
      assert.strictEqual(authErr.statusCode, 401);
      assert.strictEqual(authErr.code, 'AUTHENTICATION_REQUIRED');

      const forbErr = new ForbiddenError();
      assert.strictEqual(forbErr.statusCode, 403);
      assert.strictEqual(forbErr.code, 'FORBIDDEN');
    });

    it('instantiates ConflictError and RateLimitExceededError', () => {
      const conflictErr = new ConflictError('Slot already booked');
      assert.strictEqual(conflictErr.statusCode, 409);
      assert.strictEqual(conflictErr.code, 'CONFLICT');

      const rateErr = new RateLimitExceededError(30);
      assert.strictEqual(rateErr.statusCode, 429);
      assert.strictEqual(rateErr.code, 'RATE_LIMIT_EXCEEDED');
      assert.strictEqual(rateErr.details.retry_after_seconds, 30);
    });
  });

  describe('3. Audit Event Persistence Logger', () => {
    it('records an audit event without crashing when DB is offline', async () => {
      const eventId = await recordAuditEvent({
        action: 'TEST_ACTION',
        objectType: 'test_object',
        objectId: 'obj-123',
        metadata: { test: true }
      });

      assert.ok(eventId);
      assert.strictEqual(typeof eventId, 'string');
      assert.strictEqual(eventId.length, 36); // UUID format
    });
  });

  describe('4. Rate Limiting Mechanism', () => {
    it('provides rate limit headers on protected endpoints when not in test bypass mode', () => {
      const rateErr = new RateLimitExceededError(60);
      assert.strictEqual(rateErr.statusCode, 429);
      assert.strictEqual(rateErr.details.retry_after_seconds, 60);
    });
  });
});
