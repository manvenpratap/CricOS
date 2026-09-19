import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { buildServer } from '../apps/api/dist/server.js';
import type { FastifyInstance } from 'fastify';

describe('Wave 1: Identity Sessions, Refresh Tokens & Consents API', () => {
  let app: FastifyInstance;
  let authToken: string;

  before(async () => {
    app = buildServer();
    await app.ready();

    // Authenticate and get token
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/otp/verify',
      payload: { identifier: '+919876543210', code: '123456', role: 'CAPTAIN' }
    });
    const body = JSON.parse(res.body);
    authToken = body.token;
  });

  after(async () => {
    await app.close();
  });

  it('1. Token Refresh: rotates token and returns new access token', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/token/refresh',
      headers: { authorization: `Bearer ${authToken}` }
    });
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.ok(body.token);
    assert.ok(body.refreshToken);
    assert.equal(body.expires_in, 86400);
  });

  it('2. Active Sessions: lists current user device sessions', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/me/sessions',
      headers: { authorization: `Bearer ${authToken}` }
    });
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.ok(Array.isArray(body.sessions));
    assert.ok(body.sessions.length > 0);
  });

  it('3. Session Revocation: deletes a specific active session', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: '/api/v1/me/sessions/sess-current-01',
      headers: { authorization: `Bearer ${authToken}` }
    });
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.equal(body.success, true);
  });

  it('4. User Consents: reads and updates privacy & terms consents', async () => {
    // Read consents
    const getRes = await app.inject({
      method: 'GET',
      url: '/api/v1/me/consents',
      headers: { authorization: `Bearer ${authToken}` }
    });
    assert.equal(getRes.statusCode, 200);
    const getBody = JSON.parse(getRes.body);
    assert.ok(Array.isArray(getBody.consents));

    // Update consent
    const putRes = await app.inject({
      method: 'PUT',
      url: '/api/v1/me/consents',
      headers: { authorization: `Bearer ${authToken}` },
      payload: { consent_type: 'MARKETING_UPDATES', granted: true }
    });
    assert.equal(putRes.statusCode, 200);
    const putBody = JSON.parse(putRes.body);
    assert.equal(putBody.success, true);
    assert.equal(putBody.consent.granted, true);
  });

  it('5. User Profile Update: updates user profile metadata', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/v1/me/profile',
      headers: { authorization: `Bearer ${authToken}` },
      payload: { display_name: 'Vikram Sharma', bio: 'Senior Match Official' }
    });
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.equal(body.success, true);
    assert.equal(body.profile.display_name, 'Vikram Sharma');
  });

  it('6. Logout: revokes active sessions successfully', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/logout',
      headers: { authorization: `Bearer ${authToken}` }
    });
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.equal(body.success, true);
  });
});
