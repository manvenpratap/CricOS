import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { buildServer } from '../apps/api/dist/server.js';
import { signToken } from '../apps/api/dist/middleware/auth.js';
import type { FastifyInstance } from 'fastify';

describe('Wave 4: Contextual Conversations & Admin Policy Desk API', () => {
  let app: FastifyInstance;
  let userToken: string;
  let adminToken: string;
  let createdConvId: string;
  let createdPolicyId: string;

  before(async () => {
    app = buildServer();
    await app.ready();

    userToken = signToken({
      userId: 'usr-captain-01',
      identifier: 'captain@cricos.io',
      roles: ['CAPTAIN']
    });

    adminToken = signToken({
      userId: 'usr-admin-01',
      identifier: 'admin@cricos.io',
      roles: ['ADMIN']
    });
  });

  after(async () => {
    await app.close();
  });

  it('1. List Conversations: retrieves contextual threads for user', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/conversations',
      headers: { authorization: `Bearer ${userToken}` }
    });
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.ok(Array.isArray(body.conversations));
    assert.ok(body.conversations.length > 0);
  });

  it('2. Create Conversation: opens new match coordination thread', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/conversations',
      headers: { authorization: `Bearer ${userToken}` },
      payload: {
        event_id: 'evt-test-basket-01',
        title: 'Pitch Inspection & Toss Logistics',
        context_type: 'MATCH'
      }
    });
    assert.equal(res.statusCode, 201);
    const body = JSON.parse(res.body);
    assert.equal(body.success, true);
    assert.ok(body.conversation_id);
    assert.equal(body.title, 'Pitch Inspection & Toss Logistics');
    createdConvId = body.conversation_id;
  });

  it('3. Message Exchange: posts and lists messages within thread', async () => {
    // Post message
    const postRes = await app.inject({
      method: 'POST',
      url: `/api/v1/conversations/${createdConvId}/messages`,
      headers: { authorization: `Bearer ${userToken}` },
      payload: {
        content: 'Groundstaff has confirmed covers will be removed at 18:00.',
        message_type: 'TEXT'
      }
    });
    assert.equal(postRes.statusCode, 201);
    const postBody = JSON.parse(postRes.body);
    assert.equal(postBody.success, true);
    assert.ok(postBody.message_id);

    // List messages
    const listRes = await app.inject({
      method: 'GET',
      url: `/api/v1/conversations/${createdConvId}/messages`,
      headers: { authorization: `Bearer ${userToken}` }
    });
    assert.equal(listRes.statusCode, 200);
    const listBody = JSON.parse(listRes.body);
    assert.equal(listBody.conversation_id, createdConvId);
    assert.ok(Array.isArray(listBody.messages));
  });

  it('4. Notification Flow & Preferences: updates read status and channels', async () => {
    // Mark notification read
    const readRes = await app.inject({
      method: 'POST',
      url: '/api/v1/notifications/notif-test-01/read',
      headers: { authorization: `Bearer ${userToken}` }
    });
    assert.equal(readRes.statusCode, 200);
    const readBody = JSON.parse(readRes.body);
    assert.equal(readBody.success, true);
    assert.equal(readBody.read, true);

    // Get preferences
    const prefRes = await app.inject({
      method: 'GET',
      url: '/api/v1/notification-preferences',
      headers: { authorization: `Bearer ${userToken}` }
    });
    assert.equal(prefRes.statusCode, 200);
    const prefBody = JSON.parse(prefRes.body);
    assert.ok(prefBody.channels);
    assert.equal(prefBody.channels.email, true);

    // Update preferences
    const updateRes = await app.inject({
      method: 'PUT',
      url: '/api/v1/notification-preferences',
      headers: { authorization: `Bearer ${userToken}` },
      payload: {
        channels: { in_app: true, email: false, sms: false, push: true }
      }
    });
    assert.equal(updateRes.statusCode, 200);
    const updateBody = JSON.parse(updateRes.body);
    assert.equal(updateBody.success, true);
  });

  it('5. Admin Cases Desk: lists cases and views case detail', async () => {
    const listRes = await app.inject({
      method: 'GET',
      url: '/api/v1/admin/cases',
      headers: { authorization: `Bearer ${adminToken}` }
    });
    assert.equal(listRes.statusCode, 200);
    const listBody = JSON.parse(listRes.body);
    assert.ok(Array.isArray(listBody.cases));
    assert.ok(listBody.cases.length >= 3);

    const detailRes = await app.inject({
      method: 'GET',
      url: '/api/v1/admin/cases/CASE-9041',
      headers: { authorization: `Bearer ${adminToken}` }
    });
    assert.equal(detailRes.statusCode, 200);
    const detailBody = JSON.parse(detailRes.body);
    assert.equal(detailBody.id, 'CASE-9041');
    assert.equal(detailBody.case_type, 'DISPUTE');
    assert.ok(Array.isArray(detailBody.evidence));
  });

  it('6. Admin Case Adjudication: assigns case and posts decision with ledger action', async () => {
    const assignRes = await app.inject({
      method: 'POST',
      url: '/api/v1/admin/cases/CASE-9041/assign',
      headers: { authorization: `Bearer ${adminToken}` },
      payload: { assignee: 'finance-lead@cricos.io' }
    });
    assert.equal(assignRes.statusCode, 200);
    const assignBody = JSON.parse(assignRes.body);
    assert.equal(assignBody.success, true);
    assert.equal(assignBody.assigned_to, 'finance-lead@cricos.io');

    const decisionRes = await app.inject({
      method: 'POST',
      url: '/api/v1/admin/cases/CASE-9041/decision',
      headers: { authorization: `Bearer ${adminToken}` },
      payload: { decision: 'RESOLVE', notes: 'Approved 50% rain refund per weather radar proof' }
    });
    assert.equal(decisionRes.statusCode, 200);
    const decisionBody = JSON.parse(decisionRes.body);
    assert.equal(decisionBody.success, true);
    assert.equal(decisionBody.status, 'RESOLVED');
    assert.equal(decisionBody.ledger_action, 'REFUND_JOURNAL_POSTED');
  });

  it('7. Admin Audit & Commercial Policies: searches audit events and activates policy', async () => {
    // Search audit events
    const auditRes = await app.inject({
      method: 'GET',
      url: '/api/v1/admin/audit',
      headers: { authorization: `Bearer ${adminToken}` }
    });
    assert.equal(auditRes.statusCode, 200);
    const auditBody = JSON.parse(auditRes.body);
    assert.ok(Array.isArray(auditBody.audit_events));

    // Draft policy
    const policyRes = await app.inject({
      method: 'POST',
      url: '/api/v1/admin/policies',
      headers: { authorization: `Bearer ${adminToken}` },
      payload: {
        version: 'v2026.3',
        fee_percentage: 4.5,
        gst_percentage: 18.0
      }
    });
    assert.equal(policyRes.statusCode, 201);
    const policyBody = JSON.parse(policyRes.body);
    assert.equal(policyBody.success, true);
    assert.equal(policyBody.version, 'v2026.3');
    createdPolicyId = policyBody.policy_id;

    // Activate policy
    const activateRes = await app.inject({
      method: 'POST',
      url: `/api/v1/admin/policies/${createdPolicyId}/activate`,
      headers: { authorization: `Bearer ${adminToken}` }
    });
    assert.equal(activateRes.statusCode, 200);
    const activateBody = JSON.parse(activateRes.body);
    assert.equal(activateBody.success, true);
    assert.equal(activateBody.active, true);
  });
});
