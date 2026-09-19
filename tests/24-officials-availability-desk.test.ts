import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { buildServer } from '../apps/api/dist/server.js';
import type { FastifyInstance } from 'fastify';

describe('Wave 1: Officials Accreditation, Availability & Assignment Desk API', () => {
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

  it('1. Search Officials: filters by role and accreditation', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/officials?role=LEAD_UMPIRE'
    });
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.ok(Array.isArray(body.officials));
    assert.ok(body.officials.length > 0);
  });

  it('2. Official Profile: retrieves professional details and match rate', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/officials/off-001'
    });
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.equal(body.id, 'off-001');
    assert.ok(body.match_fee_minor > 0);
    assert.equal(body.verified, true);
  });

  it('3. Update Profile: updates official match fee and accreditation', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/v1/officials/off-001/profile',
      headers: { authorization: `Bearer ${authToken}` },
      payload: { match_fee_minor: 400000, bio: 'BCCI Level-2 Certified Umpire' }
    });
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.equal(body.success, true);
  });

  it('4. Availability Calendar: returns weekly rules and blackout exceptions', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/officials/off-001/calendar'
    });
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.equal(body.official_id, 'off-001');
    assert.ok(Array.isArray(body.weekly_rules));
    assert.ok(Array.isArray(body.exceptions));
  });

  it('5. Availability Rules: updates recurring weekly schedule', async () => {
    const res = await app.inject({
      method: 'PUT',
      url: '/api/v1/officials/off-001/availability/rules',
      headers: { authorization: `Bearer ${authToken}` },
      payload: {
        rules: [
          { day_of_week: 6, start_time: '08:00', end_time: '18:00', active: true },
          { day_of_week: 0, start_time: '08:00', end_time: '18:00', active: true }
        ]
      }
    });
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.equal(body.success, true);
    assert.equal(body.rules.length, 2);
  });

  it('6. Availability Exception: adds blackout date with reason', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/officials/off-001/availability/exceptions',
      headers: { authorization: `Bearer ${authToken}` },
      payload: { exception_date: '2026-11-15', is_available: false, reason: 'Personal Leave' }
    });
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.equal(body.success, true);
    assert.equal(body.exception.is_available, false);
  });

  it('7. Assignment Requests: views, accepts, and declines fixture assignments', async () => {
    // List incoming requests
    const listRes = await app.inject({
      method: 'GET',
      url: '/api/v1/officials/off-001/requests',
      headers: { authorization: `Bearer ${authToken}` }
    });
    assert.equal(listRes.statusCode, 200);
    const listBody = JSON.parse(listRes.body);
    assert.ok(Array.isArray(listBody.requests));
    assert.ok(listBody.requests.length > 0);

    // Accept request
    const acceptRes = await app.inject({
      method: 'POST',
      url: '/api/v1/officials/off-001/requests/req-01/accept',
      headers: { authorization: `Bearer ${authToken}` }
    });
    assert.equal(acceptRes.statusCode, 200);
    const acceptBody = JSON.parse(acceptRes.body);
    assert.equal(acceptBody.status, 'ACCEPTED');

    // Decline request
    const declineRes = await app.inject({
      method: 'POST',
      url: '/api/v1/officials/off-001/requests/req-02/decline',
      headers: { authorization: `Bearer ${authToken}` },
      payload: { reason: 'Ground too far' }
    });
    assert.equal(declineRes.statusCode, 200);
    const declineBody = JSON.parse(declineRes.body);
    assert.equal(declineBody.status, 'DECLINED');
  });
});
