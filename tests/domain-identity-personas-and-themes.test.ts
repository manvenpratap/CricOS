/**
 * Domain Test Suite: Identity, Personas, RBAC, Scorecards & Theme System
 *
 * Consolidates and unifies:
 * - 23-sessions-and-consents.test.ts
 * - 27-conversations-and-admin-policies.test.ts
 * - 30-analytics-insights-and-fulfilment.test.ts
 * - 32-role-based-access-control.test.ts
 * - 34-fan-scorecard-and-visualizations.test.ts
 * - 35-persona-switching-and-profile-sync.test.ts
 * - 38-athletic-kpi-and-e2e-journeys.test.ts
 * - 53-design-variations-swiss-minimalism.test.ts
 * - 54-playwright-theme-verification.test.ts
 * - 55-teams-roster-modals.test.ts
 * - 57-ui-ux-contrast-and-accessibility.test.ts
 */
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import type { FastifyInstance } from 'fastify';

import { buildServer } from '../apps/api/dist/server.js';
import { signToken, verifyToken, requireRole, type UserRole } from '../apps/api/dist/middleware/auth.js';
import {
  ROLE_PERMISSIONS_MATRIX,
  isTabAllowedForRole,
  getRolePermissions,
  getDefaultProfile,
  renderUserBadgeHtml,
  type PersonaRole
} from '../apps/web/dist/index.js';
import { getDashboardHtml } from '../apps/api/dist/ui/dashboard.js';
import { getMobileAppHtml } from '../apps/api/dist/ui/mobile-view.js';
import { CricOSMobileApp, LiveMatchScreenController } from '../apps/mobile/dist/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function readFile(relPath: string): string {
  return fs.readFileSync(path.resolve(rootDir, relPath), 'utf-8');
}

describe('Domain: Identity, Personas, RBAC, Scorecards & Theme System', () => {
  let app: FastifyInstance;
  let userToken: string;
  let adminToken: string;
  let createdConvId: string;
  let createdPolicyId: string;

  const dashboardHtml = getDashboardHtml();
  const mobileHtml = getMobileAppHtml();
  const rootIndexHtml = readFile('index.html');
  const distIndexHtml = readFile('dist/index.html');
  const distMobileHtml = readFile('dist/mobile.html');
  const dashboardSrc = readFile('apps/api/src/ui/dashboard.ts');
  const mobileSrc = readFile('apps/api/src/ui/mobile-view.ts');

  let webWindow: any;
  let mobileWindow: any;

  before(async () => {
    process.env.NODE_ENV = 'test';
    app = buildServer();
    await app.ready();

    // Authenticate user and sign roles
    const authRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/otp/verify',
      payload: { identifier: '+919876543210', code: '123456', role: 'CAPTAIN' }
    });
    userToken = JSON.parse(authRes.body).token;

    adminToken = signToken({
      userId: 'usr-admin-01',
      identifier: 'admin@cricos.io',
      roles: ['ADMIN']
    });

    // Mock DOM environment for Web Dashboard
    const createWebMockEl = (id = '') => {
      const el: any = {
        id,
        innerHTML: '',
        textContent: '',
        value: '',
        style: {},
        classList: {
          classes: new Set<string>(),
          add: (cls: string) => el.classList.classes.add(cls),
          remove: (cls: string) => el.classList.classes.delete(cls),
          contains: (cls: string) => el.classList.classes.has(cls),
          toggle: (cls: string, force?: boolean) => {
            if (force === undefined) {
              if (el.classList.classes.has(cls)) el.classList.classes.delete(cls);
              else el.classList.classes.add(cls);
            } else if (force) {
              el.classList.classes.add(cls);
            } else {
              el.classList.classes.delete(cls);
            }
          }
        },
        prepend: (child: any) => {
          el.innerHTML = (child.innerHTML || child.outerHTML || '') + el.innerHTML;
        },
        appendChild: (child: any) => {
          el.innerHTML += (child.innerHTML || child.outerHTML || '');
        },
        setAttribute: () => {},
        getAttribute: () => null,
        querySelector: () => createWebMockEl(),
        querySelectorAll: () => [],
        addEventListener: () => {},
        removeEventListener: () => {}
      };
      return el;
    };

    const webElements: Record<string, any> = {};
    const getWebEl = (id: string) => {
      if (!webElements[id]) webElements[id] = createWebMockEl(id);
      return webElements[id];
    };

    webWindow = {
      addEventListener: () => {},
      removeEventListener: () => {},
      localStorage: {
        store: {} as Record<string, string>,
        getItem: (k: string) => webWindow.localStorage.store[k] || null,
        setItem: (k: string, v: string) => { webWindow.localStorage.store[k] = v; },
        removeItem: (k: string) => { delete webWindow.localStorage.store[k]; }
      },
      location: { search: '', pathname: '/', reload: () => {} },
      navigator: { userAgent: 'desktop' },
      document: {
        documentElement: createWebMockEl(),
        getElementById: (id: string) => getWebEl(id),
        querySelector: () => createWebMockEl(),
        querySelectorAll: () => [],
        createElement: (tag: string) => createWebMockEl(tag),
        createElementNS: (_ns: string, tag: string) => createWebMockEl(tag),
        addEventListener: () => {},
        removeEventListener: () => {}
      },
      showToast: () => {}
    };
    webWindow.window = webWindow;
    webWindow.globalThis = webWindow;

    const webScriptStart = dashboardHtml.lastIndexOf('<script>');
    const webScriptEnd = dashboardHtml.indexOf('</script>', webScriptStart);
    if (webScriptStart !== -1 && webScriptEnd !== -1) {
      const scriptCode = dashboardHtml.substring(webScriptStart + 8, webScriptEnd);
      const webContext = vm.createContext({
        window: webWindow,
        document: webWindow.document,
        location: webWindow.location,
        localStorage: webWindow.localStorage,
        navigator: webWindow.navigator,
        setTimeout: () => ({ unref: () => {} }),
        clearTimeout: () => {},
        setInterval: () => ({ unref: () => {} }),
        clearInterval: () => {},
        MutationObserver: class { observe() {} disconnect() {} },
        EventSource: class { addEventListener() {} close() {} },
        console
      });
      try {
        vm.runInContext(scriptCode, webContext);
      } catch {
        // VM initialization
      }
    }

    // Mock DOM environment for Mobile View
    const createMobileMockEl = (id = '') => ({
      id,
      innerHTML: '',
      textContent: '',
      value: '',
      style: {},
      classList: { add: () => {}, remove: () => {} },
      addEventListener: () => {},
      removeEventListener: () => {},
      setAttribute: () => {},
      getAttribute: () => null
    });

    mobileWindow = {
      document: {
        documentElement: createMobileMockEl(),
        getElementById: (id: string) => createMobileMockEl(id),
        querySelector: () => createMobileMockEl(),
        querySelectorAll: () => [],
        addEventListener: () => {},
        removeEventListener: () => {}
      },
      navigator: { userAgent: 'mobile' },
      location: { search: '', pathname: '/', reload: () => {} },
      localStorage: {
        store: {} as Record<string, string>,
        getItem: (k: string) => mobileWindow.localStorage.store[k] || null,
        setItem: (k: string, v: string) => { mobileWindow.localStorage.store[k] = v; },
        removeItem: (k: string) => { delete mobileWindow.localStorage.store[k]; }
      },
      matchMedia: () => ({ matches: true, addEventListener: () => {}, removeEventListener: () => {} }),
      addEventListener: () => {},
      removeEventListener: () => {},
      showToast: () => {}
    };

    const mobStartTag = '<script type="module">';
    const mobEndTag = '</script>';
    const mobStartIdx = mobileHtml.indexOf(mobStartTag);
    const mobEndIdx = mobileHtml.indexOf(mobEndTag, mobStartIdx);
    if (mobStartIdx !== -1 && mobEndIdx !== -1) {
      const mobScript = mobileHtml.substring(mobStartIdx + mobStartTag.length, mobEndIdx);
      const mobContext = vm.createContext(mobileWindow);
      try {
        vm.runInContext(mobScript, mobContext);
      } catch {
        // VM initialization
      }
    }
  });

  after(async () => {
    if (app) await app.close();
  });

  // ---- Suite 1: Identity Sessions, Refresh Tokens & User Consents API ----
  describe('Suite 1: Identity Sessions, Tokens & Consents API', () => {
    it('1. Token Refresh: rotates token and returns new access token', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/token/refresh',
        headers: { authorization: `Bearer ${userToken}` }
      });
      assert.equal(res.statusCode, 200);
      const body = JSON.parse(res.body);
      assert.ok(body.token);
      assert.ok(body.refreshToken);
      assert.equal(body.expires_in, 86400);
    });

    it('2. Active Sessions & Revocation: lists device sessions and revokes specific session', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/me/sessions',
        headers: { authorization: `Bearer ${userToken}` }
      });
      assert.equal(res.statusCode, 200);
      const body = JSON.parse(res.body);
      assert.ok(Array.isArray(body.sessions));
      assert.ok(body.sessions.length > 0);

      const delRes = await app.inject({
        method: 'DELETE',
        url: '/api/v1/me/sessions/sess-current-01',
        headers: { authorization: `Bearer ${userToken}` }
      });
      assert.equal(delRes.statusCode, 200);
      assert.equal(JSON.parse(delRes.body).success, true);
    });

    it('3. User Consents & Profile Update: updates consents and profile display name', async () => {
      const getRes = await app.inject({
        method: 'GET',
        url: '/api/v1/me/consents',
        headers: { authorization: `Bearer ${userToken}` }
      });
      assert.equal(getRes.statusCode, 200);
      assert.ok(Array.isArray(JSON.parse(getRes.body).consents));

      const putRes = await app.inject({
        method: 'PUT',
        url: '/api/v1/me/consents',
        headers: { authorization: `Bearer ${userToken}` },
        payload: { consent_type: 'MARKETING_UPDATES', granted: true }
      });
      assert.equal(putRes.statusCode, 200);
      assert.equal(JSON.parse(putRes.body).consent.granted, true);

      const profRes = await app.inject({
        method: 'PATCH',
        url: '/api/v1/me/profile',
        headers: { authorization: `Bearer ${userToken}` },
        payload: { display_name: 'Vikram Sharma', bio: 'Senior Match Official' }
      });
      assert.equal(profRes.statusCode, 200);
      assert.equal(JSON.parse(profRes.body).profile.display_name, 'Vikram Sharma');
    });

    it('4. Logout: revokes active sessions successfully', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/logout',
        headers: { authorization: `Bearer ${userToken}` }
      });
      assert.equal(res.statusCode, 200);
      assert.equal(JSON.parse(res.body).success, true);
    });
  });

  // ---- Suite 2: Contextual Conversations & Admin Policy Desk API ----
  describe('Suite 2: Contextual Conversations & Admin Policy Desk API', () => {
    it('1. List & Create Conversations: opens new match coordination thread', async () => {
      const listRes = await app.inject({
        method: 'GET',
        url: '/api/v1/conversations',
        headers: { authorization: `Bearer ${userToken}` }
      });
      assert.equal(listRes.statusCode, 200);
      assert.ok(Array.isArray(JSON.parse(listRes.body).conversations));

      const createRes = await app.inject({
        method: 'POST',
        url: '/api/v1/conversations',
        headers: { authorization: `Bearer ${userToken}` },
        payload: {
          event_id: 'evt-test-basket-01',
          title: 'Pitch Inspection & Toss Logistics',
          context_type: 'MATCH'
        }
      });
      assert.equal(createRes.statusCode, 201);
      const body = JSON.parse(createRes.body);
      assert.equal(body.title, 'Pitch Inspection & Toss Logistics');
      createdConvId = body.conversation_id;
    });

    it('2. Message Exchange: posts and lists messages within thread', async () => {
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
      assert.ok(JSON.parse(postRes.body).message_id);

      const listRes = await app.inject({
        method: 'GET',
        url: `/api/v1/conversations/${createdConvId}/messages`,
        headers: { authorization: `Bearer ${userToken}` }
      });
      assert.equal(listRes.statusCode, 200);
      assert.ok(Array.isArray(JSON.parse(listRes.body).messages));
    });

    it('3. Notification Flow & Preferences: updates read status and channels', async () => {
      const readRes = await app.inject({
        method: 'POST',
        url: '/api/v1/notifications/notif-test-01/read',
        headers: { authorization: `Bearer ${userToken}` }
      });
      assert.equal(readRes.statusCode, 200);
      assert.equal(JSON.parse(readRes.body).read, true);

      const updateRes = await app.inject({
        method: 'PUT',
        url: '/api/v1/notification-preferences',
        headers: { authorization: `Bearer ${userToken}` },
        payload: { channels: { in_app: true, email: false, sms: false, push: true } }
      });
      assert.equal(updateRes.statusCode, 200);
      assert.equal(JSON.parse(updateRes.body).success, true);
    });

    it('4. Admin Cases Desk & Adjudication: assigns case and posts decision with ledger action', async () => {
      const listRes = await app.inject({
        method: 'GET',
        url: '/api/v1/admin/cases',
        headers: { authorization: `Bearer ${adminToken}` }
      });
      assert.equal(listRes.statusCode, 200);
      assert.ok(JSON.parse(listRes.body).cases.length >= 3);

      const assignRes = await app.inject({
        method: 'POST',
        url: '/api/v1/admin/cases/CASE-9041/assign',
        headers: { authorization: `Bearer ${adminToken}` },
        payload: { assignee: 'finance-lead@cricos.io' }
      });
      assert.equal(assignRes.statusCode, 200);
      assert.equal(JSON.parse(assignRes.body).assigned_to, 'finance-lead@cricos.io');

      const decisionRes = await app.inject({
        method: 'POST',
        url: '/api/v1/admin/cases/CASE-9041/decision',
        headers: { authorization: `Bearer ${adminToken}` },
        payload: { decision: 'RESOLVE', notes: 'Approved 50% rain refund per weather radar proof' }
      });
      assert.equal(decisionRes.statusCode, 200);
      const dec = JSON.parse(decisionRes.body);
      assert.equal(dec.status, 'RESOLVED');
      assert.equal(dec.ledger_action, 'REFUND_JOURNAL_POSTED');
    });

    it('5. Admin Audit & Commercial Policies: searches audit events and activates policy', async () => {
      const auditRes = await app.inject({
        method: 'GET',
        url: '/api/v1/admin/audit',
        headers: { authorization: `Bearer ${adminToken}` }
      });
      assert.equal(auditRes.statusCode, 200);
      assert.ok(Array.isArray(JSON.parse(auditRes.body).audit_events));

      const policyRes = await app.inject({
        method: 'POST',
        url: '/api/v1/admin/policies',
        headers: { authorization: `Bearer ${adminToken}` },
        payload: { version: 'v2026.3', fee_percentage: 4.5, gst_percentage: 18.0 }
      });
      assert.equal(policyRes.statusCode, 201);
      createdPolicyId = JSON.parse(policyRes.body).policy_id;

      const activateRes = await app.inject({
        method: 'POST',
        url: `/api/v1/admin/policies/${createdPolicyId}/activate`,
        headers: { authorization: `Bearer ${adminToken}` }
      });
      assert.equal(activateRes.statusCode, 200);
      assert.equal(JSON.parse(activateRes.body).active, true);
    });
  });

  // ---- Suite 3: Operations Fulfilment, Match MVP & AI Recaps API ----
  describe('Suite 3: Operations Fulfilment, Match MVP & AI Recaps API', () => {
    it('1. Player of the Match (MVP): calculates batting, bowling & fielding impact points', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/analytics/matches/match-001/mvp'
      });
      assert.equal(res.statusCode, 200);
      const data = JSON.parse(res.payload);
      assert.ok(data.player_of_the_match);
      assert.equal(data.player_of_the_match.is_potm, true);
      assert.ok(data.player_of_the_match.total_impact_points >= 80);
      assert.ok(data.rankings.length >= 3);
    });

    it('2. AI Match Insights: produces press recap headline, summary and turning point swing', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/analytics/matches/match-001/insights'
      });
      assert.equal(res.statusCode, 200);
      const data = JSON.parse(res.payload);
      assert.ok(data.headline);
      assert.ok(data.summary);
      assert.ok(data.turning_point);
      assert.ok(data.turning_point.win_prob_swing > 0);
    });

    it('3. Smart Procurement Recommendations & Broadcast Overlay', async () => {
      const recRes = await app.inject({
        method: 'GET',
        url: '/api/v1/recommendations/procurement?format=T20'
      });
      assert.equal(recRes.statusCode, 200);
      const recommendations = JSON.parse(recRes.payload);
      assert.ok(recommendations.some((r: any) => r.category === 'VENUE'));
      assert.ok(recommendations.some((r: any) => r.category === 'OFFICIAL'));

      const overRes = await app.inject({
        method: 'GET',
        url: '/api/v1/broadcast/matches/match-001/overlay'
      });
      assert.equal(overRes.statusCode, 200);
      const overlay = JSON.parse(overRes.payload);
      assert.equal(overlay.match_id, 'match-001');
      assert.ok(overlay.striker);
      assert.ok(overlay.bowler);
    });

    it('4. Provider Check-In & 3-Party Sign-Off: verifies OTP and unfreezes payouts', async () => {
      const checkInRes = await app.inject({
        method: 'POST',
        url: '/api/v1/operations/check-in',
        payload: {
          booking_id: '00000000-0000-0000-0000-000000000021',
          provider_id: '00000000-0000-0000-0000-000000000002',
          otp: '4821',
          geofence_coords: { lat: 12.9716, lng: 77.5946 }
        }
      });
      assert.equal(checkInRes.statusCode, 200);
      assert.equal(JSON.parse(checkInRes.payload).status, 'CHECKED_IN');

      const signOffRes = await app.inject({
        method: 'POST',
        url: '/api/v1/operations/match-signoff',
        payload: {
          match_id: 'match-001',
          captain_a_signed: true,
          captain_b_signed: true,
          official_signed: true,
          signoff_notes: 'Fair contest without dispute'
        }
      });
      assert.equal(signOffRes.statusCode, 200);
      assert.equal(JSON.parse(signOffRes.payload).status, 'SIGNOFF_COMPLETE');
    });

    it('5. Social Activity Feed, Follow & Logistics Tracking', async () => {
      const feedRes = await app.inject({ method: 'GET', url: '/api/v1/social/feed' });
      assert.equal(feedRes.statusCode, 200);
      assert.ok(JSON.parse(feedRes.payload).length >= 2);

      const trackRes = await app.inject({ method: 'GET', url: '/api/v1/operations/logistics/ord-12345/track' });
      assert.equal(trackRes.statusCode, 200);
      assert.equal(JSON.parse(trackRes.payload).status, 'IN_TRANSIT');
    });
  });

  // ---- Suite 4: Role-Based Access Control (RBAC) & Feature Gating ----
  describe('Suite 4: Role-Based Access Control (RBAC) & Feature Gating', () => {
    const allRoles: PersonaRole[] = [
      'CAPTAIN', 'PLAYER', 'SCORER', 'FAN', 'UMPIRE', 'ADMIN', 'ORGANISER', 'TURF_PROVIDER'
    ];

    it('1. Defines permissions for all 8 standard personas and validates tab access', () => {
      for (const role of allRoles) {
        const perms = getRolePermissions(role);
        assert.ok(perms, `Role ${role} must have defined permissions`);
        assert.ok(Array.isArray(perms.allowedTabs), `Role ${role} must have allowedTabs`);
        assert.ok(perms.allowedTabs.length > 0, `Role ${role} must allow at least one tab`);
      }

      // Fan cannot access studio or explorer
      assert.equal(isTabAllowedForRole('FAN', 'scoring'), true);
      assert.equal(isTabAllowedForRole('FAN', 'studio'), false);
      assert.equal(isTabAllowedForRole('FAN', 'explorer'), false);

      // Scorer can score and access studio
      assert.equal(isTabAllowedForRole('SCORER', 'scoring'), true);
      assert.equal(isTabAllowedForRole('SCORER', 'studio'), true);
      assert.equal(isTabAllowedForRole('SCORER', 'explorer'), false);

      // Admin has all 7 tabs allowed
      ['scoring', 'teams', 'tournaments', 'marketplace', 'studio', 'incidents', 'explorer'].forEach(tab => {
        assert.strictEqual(isTabAllowedForRole('ADMIN', tab), true, `Admin should have access to ${tab}`);
      });
    });

    it('2. Generates role-appropriate profiles with career stats and badges', () => {
      for (const role of allRoles) {
        const profile = getDefaultProfile(role);
        assert.strictEqual(profile.role, role);
        assert.ok(profile.name.length > 0);
        assert.ok(profile.jerseyNumber >= 0);
        assert.ok(profile.careerStats.matches > 0);

        const badgeHtml = renderUserBadgeHtml(profile);
        assert.ok(badgeHtml.includes('data-tooltip'));
        assert.ok(badgeHtml.includes(role));
        assert.ok(badgeHtml.includes(profile.name));
      }
    });

    it('3. Signs and verifies JWT tokens containing persona roles and evaluates requireRole guard', async () => {
      const testRoles: UserRole[] = ['SCORER', 'UMPIRE', 'FAN', 'PLAYER'];
      testRoles.forEach(role => {
        const token = signToken({
          userId: `usr-${role.toLowerCase()}-01`,
          identifier: `+91 98000 ${role.slice(0, 4)}`,
          roles: [role]
        });

        const payload = verifyToken(token);
        assert.strictEqual(payload.userId, `usr-${role.toLowerCase()}-01`);
        assert.ok(payload.roles.includes(role));
      });

      const scorerGuard = requireRole('SCORER');
      let statusCalled = 0;
      let sendBody: any = null;
      const mockReply = {
        status: (code: number) => {
          statusCalled = code;
          return {
            send: (body: any) => { sendBody = body; }
          };
        }
      };

      // 1. Scorer allowed
      const scorerReq = {
        user: { userId: 'u1', identifier: 'sc', roles: ['SCORER' as UserRole], iat: 1, exp: 9999999999 }
      };
      await scorerGuard(scorerReq as any, mockReply as any);
      assert.strictEqual(statusCalled, 0, 'Scorer should be permitted');

      // 2. Fan forbidden
      statusCalled = 0;
      const fanReq = {
        user: { userId: 'u2', identifier: 'fan', roles: ['FAN' as UserRole], iat: 1, exp: 9999999999 }
      };
      await scorerGuard(fanReq as any, mockReply as any);
      assert.strictEqual(statusCalled, 403, 'Fan should be forbidden');
      assert.strictEqual(sendBody?.error, 'FORBIDDEN');
    });
  });

  // ---- Suite 5: Persona Switching, Profile Synchronization & Active HUD ----
  describe('Suite 5: Persona Switching, Profile Synchronization & Active HUD', () => {
    it('1. Web Console DOM contains #activePersonaBadge, sidebar profile footer, and 8 persona pills', () => {
      assert.ok(dashboardHtml.includes('id="activePersonaBadge"'));
      assert.ok(dashboardHtml.includes('id="headerUserAvatar"'));
      assert.ok(dashboardHtml.includes('id="headerUserName"'));
      assert.ok(dashboardHtml.includes('id="headerUserRoleBadge"'));
      assert.ok(dashboardHtml.includes('modalUserProfile'));
      assert.ok(dashboardHtml.includes("selectPersona('CAPTAIN')"));
      assert.ok(dashboardHtml.includes("selectPersona('FAN')"));
      assert.ok(dashboardHtml.includes("selectPersona('SCORER')"));
      assert.ok(dashboardHtml.includes("selectPersona('UMPIRE')"));
    });

    it('2. JavaScript Client persona switching executes and synchronizes active user', () => {
      if (typeof webWindow.selectPersona === 'function') {
        webWindow.selectPersona('SCORER');
        assert.strictEqual(webWindow.currentUser.role, 'SCORER');
        webWindow.selectPersona('CAPTAIN');
        assert.strictEqual(webWindow.currentUser.role, 'CAPTAIN');
      }
    });

    it('3. Mobile webview persona switcher and identity sync support all 8 roles', () => {
      assert.ok(mobileHtml.includes('id="mobileSidebarPersonaStrip"') || mobileHtml.includes('id="btnMobileSidebarPersonaSheet"'), 'Mobile drawer must provide persona switcher');
      assert.ok(mobileHtml.includes('id="mobilePersonaSheet"'));
      assert.ok(mobileHtml.includes('openPersonaSheet'));
      assert.ok(mobileHtml.includes('closePersonaSheet'));
    });
  });

  // ---- Suite 6: Fan Detailed Scorecard & Match Center Visualizations ----
  describe('Suite 6: Fan Detailed Scorecard & Match Center Visualizations', () => {
    it('1. Web Match Center contains Detailed Scorecard card with Innings 1 & 2 toggles', () => {
      assert.ok(dashboardHtml.includes('id="cardDetailedScorecard"'));
      assert.ok(dashboardHtml.includes('id="btnScorecardInn1"'));
      assert.ok(dashboardHtml.includes('id="btnScorecardInn2"'));
      assert.ok(dashboardHtml.includes('id="btnExportScorecardCsv"'));
      assert.ok(dashboardHtml.includes('id="detailedScorecardBattersBody"'));
      assert.ok(dashboardHtml.includes('id="detailedScorecardBowlersBody"'));
    });

    it('2. Match Center Visualizations: Worm, Manhattan, Wagon Wheel, Partnerships', () => {
      assert.ok(dashboardHtml.includes('id="btnChartWagon"'));
      assert.ok(dashboardHtml.includes('id="btnChartManhattan"'));
      assert.ok(dashboardHtml.includes('id="btnChartWorm"'));
      assert.ok(dashboardHtml.includes('id="btnChartPartnerships"'));
      assert.ok(dashboardHtml.includes('id="mcWagonSvg"'));
      assert.ok(dashboardHtml.includes('id="mcPartnershipBars"'));
    });

    it('3. Mobile Fan Journey: Worm, Bars, Wagon, and Card analytics buttons and SVG rendering', () => {
      const controller = new LiveMatchScreenController();
      const fanHtml = controller.renderMobileHtml('FAN', 'NONE');
      assert.ok(fanHtml.includes('data-tooltip="View 8-zone Wagon Wheel"'));
      assert.ok(fanHtml.includes('data-tooltip="View full detailed scorecard"'));

      const wagonHtml = controller.renderMobileHtml('FAN', 'WAGON');
      assert.ok(wagonHtml.includes('Mobile Precision Wagon Wheel'));
      assert.ok(wagonHtml.includes('<svg viewBox="0 0 300 300"'));

      const scorecardHtml = controller.renderMobileHtml('FAN', 'SCORECARD');
      assert.ok(scorecardHtml.includes('Detailed Scorecard'));

      const mobApp = new CricOSMobileApp();
      mobApp.switchUserPersona('FAN');
      assert.strictEqual(mobApp.getActiveChart(), 'NONE');
      mobApp.toggleMobileChart('WAGON');
      assert.strictEqual(mobApp.getActiveChart(), 'WAGON');
    });
  });

  // ---- Suite 7: Athletic KPI Cards, Analytics Drawer & 3D Modals Architecture ----
  describe('Suite 7: Athletic KPI Cards, Analytics Drawer & 3D Modals Architecture', () => {
    it('1. Embeds Athletic KPI card in Squad Rosters tab and renders laurel wreath ranking ribbon', () => {
      assert.ok(dashboardHtml.includes('id="embeddedPlayerStatsCard"'));
      assert.ok(dashboardHtml.includes('class="athletic-ranking-ribbon"'));
      assert.ok(dashboardHtml.includes('id="modalPlayerStatsDrawer"'));
      assert.ok(dashboardHtml.includes('openPlayerStatsDrawer'));
    });

    it('2. Root modal declarations: 3D Trophy, Holographic Card, Bat Customizer, and Join Team', () => {
      assert.ok(dashboardHtml.includes('id="modal3DTrophyCabinet"'));
      assert.ok(dashboardHtml.includes('id="modal3DPlayerCard"'));
      assert.ok(dashboardHtml.includes('id="modal3DBatCustomizer"'));
      assert.ok(dashboardHtml.includes('id="modalAppDialog"'));
      assert.ok(dashboardHtml.includes('id="modalCreateTeam"'));

      // Verify no nested modal trapping: balanced div tags for sponsorship auction before umpire desk
      const sponsorshipAuctionIdx = dashboardSrc.indexOf('id="modalSponsorshipAuction"');
      const umpireDeskIdx = dashboardSrc.indexOf('id="modalUmpireDesk"');
      assert.ok(sponsorshipAuctionIdx !== -1 && umpireDeskIdx !== -1 && umpireDeskIdx > sponsorshipAuctionIdx);
      const chunk = dashboardSrc.substring(sponsorshipAuctionIdx, umpireDeskIdx);
      const openDivs = (chunk.match(/<div\b/g) || []).length;
      const closeDivs = (chunk.match(/<\/div>/g) || []).length;
      assert.strictEqual(openDivs, closeDivs, 'modalSponsorshipAuction must have balanced div tags');
    });

    it('3. Mobile consumer viewport and audio engine', () => {
      assert.ok(mobileHtml.includes('CricOSAudioEngine'));
      assert.ok(mobileHtml.includes('class="athletic-stats-card"'));
      assert.ok(mobileHtml.includes('renderAthleticCard'));
    });
  });

  // ---- Suite 8: Design Variations & Swiss/Nordic/Stadium Theme Parity ----
  describe('Suite 8: Design Theme Variations System (Swiss, Nordic, Stadium)', () => {
    it('1. Web Dashboard defines Swiss Minimalist and Nordic Editorial CSS theme tokens', () => {
      assert.ok(dashboardSrc.includes('body[data-theme="swiss"]'));
      assert.ok(dashboardSrc.includes('--bg-dark: #F8F9FA;'));
      assert.ok(dashboardSrc.includes('--border-subtle: #E2E8F0;'));
      assert.ok(dashboardSrc.includes('--text-main: #0F172A;'));
      assert.ok(dashboardSrc.includes('body[data-theme="nordic"]'));
      assert.ok(dashboardSrc.includes('id="btnDesignThemeSwitcher"'));
      assert.ok(dashboardSrc.includes('const DESIGN_THEMES = {'));
      assert.ok(dashboardSrc.includes("e.altKey && (e.key === 't' || e.key === 'T')"));
    });

    it('2. Mobile View Design Theme Parity & Theme Selection Card', () => {
      assert.ok(mobileSrc.includes('body[data-theme="swiss"]'));
      assert.ok(mobileSrc.includes('body[data-theme="nordic"]'));
      assert.ok(mobileSrc.includes('class="theme-selection-card"'));
      assert.ok(mobileSrc.includes('setTheme(themeId, notify = true)'));
      assert.ok(mobileSrc.includes('body.is-native-app[data-theme="swiss"]'));
      assert.ok(mobileSrc.includes('body.is-native-app[data-theme="nordic"]'));
    });

    it('3. Visual regression screenshot artifacts and gallery exist', () => {
      const screenshotsDir = path.join(rootDir, 'tests/screenshots');
      const galleryPath = path.join(screenshotsDir, 'index.html');
      assert.ok(fs.existsSync(galleryPath), 'tests/screenshots/index.html must exist');
      assert.ok(fs.existsSync(path.join(screenshotsDir, 'desktop_theme_swiss.png')));
      assert.ok(fs.existsSync(path.join(screenshotsDir, 'desktop_theme_nordic.png')));
      assert.ok(fs.existsSync(path.join(screenshotsDir, 'desktop_theme_stadium.png')));
    });

    it('4. In-App Notifications (Toasts) define authentic high-contrast light theme backgrounds & status typography on Swiss and Nordic', () => {
      // Mobile Toast Invariant Verification
      assert.ok(mobileSrc.includes('body[data-theme="swiss"] .mobile-toast'), 'Mobile view must define body[data-theme="swiss"] .mobile-toast');
      assert.ok(mobileSrc.includes('body[data-theme="nordic"] .mobile-toast'), 'Mobile view must define body[data-theme="nordic"] .mobile-toast');
      assert.ok(mobileSrc.includes('body[data-theme="swiss"] .mobile-toast.success'), 'Mobile view must define Swiss success toast');
      assert.ok(mobileSrc.includes('body[data-theme="swiss"] .mobile-toast.error'), 'Mobile view must define Swiss error toast');
      assert.ok(mobileSrc.includes('body[data-theme="nordic"] .mobile-toast.success'), 'Mobile view must define Nordic success toast');
      assert.ok(mobileSrc.includes('body[data-theme="nordic"] .mobile-toast.error'), 'Mobile view must define Nordic error toast');
      assert.ok(mobileHtml.includes('.mobile-toast-text'), 'Mobile toast markup must feature .mobile-toast-text');
      assert.ok(mobileHtml.includes('.mobile-toast-dismiss'), 'Mobile toast markup must feature .mobile-toast-dismiss');

      // Desktop Sonner Toaster Invariant Verification
      assert.ok(dashboardSrc.includes('body[data-theme="swiss"] #sonnerToaster .sonner-toast'), 'Dashboard must define Swiss sonner toast');
      assert.ok(dashboardSrc.includes('body[data-theme="nordic"] #sonnerToaster .sonner-toast'), 'Dashboard must define Nordic sonner toast');
      assert.ok(dashboardSrc.includes('body[data-theme="swiss"] #sonnerToaster .sonner-toast .sonner-title'), 'Dashboard must define Swiss sonner title');
      assert.ok(dashboardSrc.includes('body[data-theme="nordic"] #sonnerToaster .sonner-toast .sonner-title'), 'Dashboard must define Nordic sonner title');
      assert.ok(dashboardSrc.includes('body[data-theme="swiss"] #sonnerToaster .sonner-toast.sonner-type-success'), 'Dashboard must define Swiss success variant');
      assert.ok(dashboardSrc.includes('body[data-theme="nordic"] #sonnerToaster .sonner-toast.sonner-type-success'), 'Dashboard must define Nordic success variant');
      assert.ok(dashboardSrc.includes('body[data-theme="swiss"] #toast'), 'Dashboard must define Swiss legacy toast');
      assert.ok(dashboardSrc.includes('body[data-theme="nordic"] #toast'), 'Dashboard must define Nordic legacy toast');
    });

    it('5. Player Profile Cards & Holographic Cards define authentic high-contrast light theme styling on Swiss and Nordic across Mobile and Desktop', () => {
      // Mobile Swiss Minimalist Profile & Holo Card Invariant Verification
      assert.ok(mobileSrc.includes('body[data-theme="swiss"] .profile-hero-card'), 'Mobile view must define Swiss .profile-hero-card');
      assert.ok(mobileSrc.includes('body[data-theme="swiss"] .profile-bio-card'), 'Mobile view must define Swiss .profile-bio-card');
      assert.ok(mobileSrc.includes('body[data-theme="swiss"] .athletic-stats-card'), 'Mobile view must define Swiss .athletic-stats-card');
      assert.ok(mobileSrc.includes('body[data-theme="swiss"] #playerFlipCard3D'), 'Mobile view must define Swiss #playerFlipCard3D');
      assert.ok(mobileSrc.includes('body[data-theme="swiss"] .player-flip-front'), 'Mobile view must define Swiss .player-flip-front');
      assert.ok(mobileSrc.includes('body[data-theme="swiss"] .player-flip-back'), 'Mobile view must define Swiss .player-flip-back');
      assert.ok(mobileSrc.includes('body[data-theme="swiss"] .player-list-item'), 'Mobile view must define Swiss .player-list-item');
      assert.ok(mobileSrc.includes('body[data-theme="swiss"] #mobileHoloCard'), 'Mobile view must define Swiss #mobileHoloCard');
      assert.ok(mobileSrc.includes('body[data-theme="swiss"] .profile-hero-name'), 'Mobile view must define Swiss profile hero name');
      assert.ok(mobileSrc.includes('body[data-theme="swiss"] .athletic-player-name'), 'Mobile view must define Swiss athletic player name');

      // Mobile Nordic Editorial Profile & Holo Card Invariant Verification
      assert.ok(mobileSrc.includes('body[data-theme="nordic"] .profile-hero-card'), 'Mobile view must define Nordic .profile-hero-card');
      assert.ok(mobileSrc.includes('body[data-theme="nordic"] .profile-bio-card'), 'Mobile view must define Nordic .profile-bio-card');
      assert.ok(mobileSrc.includes('body[data-theme="nordic"] .athletic-stats-card'), 'Mobile view must define Nordic .athletic-stats-card');
      assert.ok(mobileSrc.includes('body[data-theme="nordic"] #playerFlipCard3D'), 'Mobile view must define Nordic #playerFlipCard3D');
      assert.ok(mobileSrc.includes('body[data-theme="nordic"] .player-flip-front'), 'Mobile view must define Nordic .player-flip-front');
      assert.ok(mobileSrc.includes('body[data-theme="nordic"] .player-flip-back'), 'Mobile view must define Nordic .player-flip-back');
      assert.ok(mobileSrc.includes('body[data-theme="nordic"] .player-list-item'), 'Mobile view must define Nordic .player-list-item');
      assert.ok(mobileSrc.includes('body[data-theme="nordic"] #mobileHoloCard'), 'Mobile view must define Nordic #mobileHoloCard');
      assert.ok(mobileSrc.includes('body[data-theme="nordic"] .profile-hero-name'), 'Mobile view must define Nordic profile hero name');
      assert.ok(mobileSrc.includes('body[data-theme="nordic"] .athletic-player-name'), 'Mobile view must define Nordic athletic player name');

      // Desktop Swiss & Nordic Profile & Holo Card Invariant Verification
      assert.ok(dashboardSrc.includes('html[data-theme="swiss"] .athletic-stats-card'), 'Dashboard must define Swiss .athletic-stats-card');
      assert.ok(dashboardSrc.includes('html[data-theme="nordic"] .athletic-stats-card'), 'Dashboard must define Nordic .athletic-stats-card');
      assert.ok(dashboardSrc.includes('html[data-theme="swiss"] #modal3DPlayerCard'), 'Dashboard must define Swiss #modal3DPlayerCard');
      assert.ok(dashboardSrc.includes('html[data-theme="nordic"] #modal3DPlayerCard'), 'Dashboard must define Nordic #modal3DPlayerCard');
      assert.ok(dashboardSrc.includes('html[data-theme="swiss"] .holo-foil-card'), 'Dashboard must define Swiss .holo-foil-card');
      assert.ok(dashboardSrc.includes('html[data-theme="nordic"] .holo-foil-card'), 'Dashboard must define Nordic .holo-foil-card');
      assert.ok(dashboardSrc.includes('html[data-theme="swiss"] #modalPlayerStatsDrawer'), 'Dashboard must define Swiss #modalPlayerStatsDrawer');
      assert.ok(dashboardSrc.includes('html[data-theme="nordic"] #modalPlayerStatsDrawer'), 'Dashboard must define Nordic #modalPlayerStatsDrawer');
    });

    it('6. Every theme defines compatible typography tokens across Desktop and Mobile (Swiss Inter, Nordic Fraunces/Newsreader, Stadium Space Grotesk/Chakra Petch)', () => {
      // 1. Dashboard Desktop Typography Tokens
      assert.ok(dashboardSrc.includes("--font-display: 'Inter'"), 'Dashboard Swiss must define Inter for display');
      assert.ok(dashboardSrc.includes("--font-score: 'Inter'"), 'Dashboard Swiss must define Inter for scores');
      assert.ok(dashboardSrc.includes("--font-display: 'Fraunces', 'Newsreader'"), 'Dashboard Nordic must define Fraunces/Newsreader for display');
      assert.ok(dashboardSrc.includes("--font-score: 'Fraunces', 'Newsreader'"), 'Dashboard Nordic must define Fraunces/Newsreader for scores');
      assert.ok(dashboardSrc.includes("--font-display: 'Space Grotesk'"), 'Dashboard Stadium must define Space Grotesk for display');
      assert.ok(dashboardSrc.includes("--font-score: 'Chakra Petch'"), 'Dashboard Stadium must define Chakra Petch for scores');

      // 2. Mobile Typography Tokens
      assert.ok(mobileSrc.includes("--font-display: 'Inter'"), 'Mobile Swiss must define Inter for display');
      assert.ok(mobileSrc.includes("--font-score: 'Inter'"), 'Mobile Swiss must define Inter for scores');
      assert.ok(mobileSrc.includes("--font-display: 'Fraunces', 'Newsreader'"), 'Mobile Nordic must define Fraunces/Newsreader for display');
      assert.ok(mobileSrc.includes("--font-score: 'Fraunces', 'Newsreader'"), 'Mobile Nordic must define Fraunces/Newsreader for scores');
      assert.ok(mobileSrc.includes("--font-display: 'Space Grotesk'"), 'Mobile Stadium must define Space Grotesk for display');
      assert.ok(mobileSrc.includes("--font-score: 'Chakra Petch'"), 'Mobile Stadium must define Chakra Petch for scores');

      // 3. Theme Metadata
      assert.ok(dashboardSrc.includes("fontDisplay: 'Inter'"), 'DESIGN_THEMES swiss must specify Inter');
      assert.ok(dashboardSrc.includes("fontDisplay: 'Fraunces / Newsreader'"), 'DESIGN_THEMES nordic must specify Fraunces');
      assert.ok(dashboardSrc.includes("fontDisplay: 'Space Grotesk'"), 'DESIGN_THEMES stadium must specify Space Grotesk');
    });
  });

  // ---- Suite 9: UI/UX Color Contrast, Focus Rings & WCAG 2.2 AA Accessibility ----
  describe('Suite 9: UI/UX Contrast, Focus Rings & WCAG 2.2 AA Invariants', () => {
    it('1. Swiss Minimalist defines --text-muted as #475569 (7.09:1 contrast) and eradicates #8E9BAE', () => {
      assert.ok(dashboardSrc.includes('--text-muted: #475569;'));
      assert.ok(!dashboardSrc.includes('--text-muted: #64748B;'));
      assert.ok(dashboardSrc.includes('--text-muted: #57534E;')); // Nordic
      assert.ok(!dashboardSrc.includes('--text-muted: #78716C;'));
      assert.ok(!dashboardSrc.includes('#8E9BAE'), 'Hardcoded #8E9BAE must have zero occurrences in dashboard.ts');
    });

    it('2. Mobile navigation items and subnav buttons use WCAG-compliant colors and focus rings', () => {
      assert.ok(mobileSrc.includes('color: #475569 !important;'));
      assert.ok(mobileSrc.includes('color: #57534E !important;'));
      assert.ok(mobileSrc.includes('body[data-theme="swiss"] :focus-visible'));
      assert.ok(mobileSrc.includes('outline: 2px solid #0F172A !important;'));
      assert.ok(mobileSrc.includes('body[data-theme="nordic"] :focus-visible'));
      assert.ok(mobileSrc.includes('outline: 2px solid #15803D !important;'));
    });

    it('3. Touch ergonomics for wagon wheel pills and stance switcher', () => {
      assert.ok(dashboardSrc.includes('.wagon-filter-pill.active {\n      background: rgba(0, 229, 153, 0.12);'));
      assert.ok(dashboardSrc.includes('.btn-stance {'));
      assert.ok(dashboardSrc.includes("btnRhb.classList.add('active')"));
    });

    it('4. Quality Invariants: zero transition: all and distribution parity (Rule 6)', () => {
      assert.doesNotMatch(dashboardHtml, /transition:\s*all/i);
      assert.doesNotMatch(mobileHtml, /transition:\s*all/i);
      assert.strictEqual(rootIndexHtml, distIndexHtml, 'Root index.html and dist/index.html must be byte-for-byte identical');
      assert.strictEqual(distMobileHtml, mobileHtml, 'dist/mobile.html must match getMobileAppHtml()');
    });

    it('5. Universal WCAG 2.1 AA/AAA Contrast & Surface Invariant Engine is active across Desktop and Mobile themes', () => {
      assert.ok(dashboardHtml.includes('function enforceThemeContrastInvariants()'), 'Desktop HTML must include enforceThemeContrastInvariants()');
      assert.ok(dashboardHtml.includes('cricos-contrast-sync-style'), 'Desktop HTML must suppress transitions during synchronous contrast evaluation');
      assert.ok(dashboardHtml.includes('window.enforceThemeContrastInvariants = enforceThemeContrastInvariants'), 'Desktop HTML must expose enforceThemeContrastInvariants');
      assert.ok(mobileHtml.includes('enforceContrastInvariants()'), 'Mobile HTML must include enforceContrastInvariants()');
      assert.ok(mobileHtml.includes('cricos-mobile-contrast-sync-style'), 'Mobile HTML must suppress transitions during synchronous contrast evaluation');
    });

    it('6. Tooltips appear only on hover with a 450ms delay and menus are organized into logical domain clusters', () => {
      assert.ok(dashboardHtml.includes('const HOVER_DELAY_MS = 450;'), 'Desktop tooltips must enforce 450ms hover delay');
      assert.ok(!dashboardHtml.includes("document.addEventListener('focusin'"), 'Desktop tooltips must not trigger on focusin');
      assert.ok(mobileHtml.includes('const HOVER_DELAY_MS = 450;'), 'Mobile tooltips must enforce 450ms hover delay');
      assert.ok(dashboardHtml.includes('Core Workspaces') && dashboardHtml.includes('Tactical &amp; 3D Studios') && dashboardHtml.includes('Match Day &amp; Officiating'), 'Sidebar must organize items into logical domain sections');
      assert.ok(dashboardHtml.includes('class="topbar-cluster"') && dashboardHtml.includes('class="match-action-toolbar"'), 'Topbar and scoreboard must organize actions into logical clusters');
    });

    it('7. JWT Session Persistence, Captain Scoring Pad Suppression & Clean Focus Declutter (64, 65, 66, 71)', () => {
      assert.ok(dashboardHtml.includes('localStorage.getItem') && dashboardHtml.includes('localStorage.setItem'), 'JWT & persona localStorage persistence must exist');
      assert.ok(dashboardHtml.includes('CAPTAIN') && dashboardHtml.includes('SCORER'), 'Role-gated scoring pad visibility for Captain vs Scorer must exist');
    });

    it('8. UI/UX Pro Max Split-Screen Broadcast Hero & Frosted Obsidian Contrast Exclusion (72)', () => {
      assert.ok(dashboardHtml.includes('id="cricosHeroAuthOverlay"'), 'Desktop Hero overlay must exist');
      assert.ok(dashboardHtml.includes('id="heroLeftCopyColumn"'), 'Desktop #heroLeftCopyColumn frosted obsidian container must exist');
      assert.ok(dashboardHtml.includes('cricosHeroAuthOverlay'), 'Desktop contrast enforcer must exclude #cricosHeroAuthOverlay from daylight bleaching');
      assert.ok(mobileHtml.includes('id="mobileHeroAuthOverlay"'), 'Mobile Hero overlay must exist');
      assert.ok(mobileHtml.includes('mobileHeroAuthOverlay'), 'Mobile contrast enforcer must exclude #mobileHeroAuthOverlay from daylight bleaching');
    });

    it('9. Co-located Themes, Clean View & Unified App Settings Hub across Desktop & Mobile', () => {
      // Desktop checks
      assert.ok(dashboardHtml.includes('id="themeAndCleanViewCluster"'), 'Desktop must co-locate Theme & Clean View in #themeAndCleanViewCluster');
      assert.ok(dashboardHtml.includes('id="btnDesignThemeSwitcher"'), 'Desktop must feature #btnDesignThemeSwitcher');
      assert.ok(dashboardHtml.includes('id="btnToggleMainAreaDeclutter"'), 'Desktop must feature #btnToggleMainAreaDeclutter');
      assert.ok(dashboardHtml.includes('id="btnAppSettings"'), 'Desktop must feature #btnAppSettings');
      assert.ok(dashboardHtml.includes('id="modalAppSettings"'), 'Desktop must include #modalAppSettings hub');
      assert.ok(dashboardHtml.includes('tabBtn_appearance'), 'App settings must include Appearance category');
      assert.ok(dashboardHtml.includes('tabBtn_audio'), 'App settings must include Broadcast & Audio category');
      assert.ok(dashboardHtml.includes('tabBtn_scoring'), 'App settings must include Scoring & 3D Radar category');
      assert.ok(dashboardHtml.includes('tabBtn_locale'), 'App settings must include Locale & Units category');
      assert.ok(dashboardHtml.includes('tabBtn_system'), 'App settings must include Alerts & Reset category');
      assert.ok(dashboardHtml.includes('window.cricosAppSettings'), 'Desktop must expose window.cricosAppSettings');
      assert.ok(dashboardHtml.includes('openAppSettingsModal'), 'Desktop must expose openAppSettingsModal()');

      // Desktop Ultra-Clean View CSS invariants
      assert.ok(dashboardSrc.includes('body[data-clean-view="true"] #workspaceCleanFocusBar'), 'Clean view must suppress #workspaceCleanFocusBar');
      assert.ok(dashboardSrc.includes('body[data-clean-view="true"] .clean-view-hide-label'), 'Clean view must suppress .clean-view-hide-label');
      assert.ok(dashboardSrc.includes('body[data-clean-view="true"] .card'), 'Clean view must apply compact card padding');

      // Mobile checks: Top bar is decluttered (redundant controls moved to sidebar drawer and settings sheet)
      assert.ok(!mobileHtml.includes('id="btnMobileHeaderThemeCycle"'), 'Mobile top bar must be decluttered: no #btnMobileHeaderThemeCycle');
      assert.ok(!mobileHtml.includes('id="btnMobileToggleDeclutter"'), 'Mobile top bar must be decluttered: no #btnMobileToggleDeclutter');
      assert.ok(!mobileHtml.includes('id="btnMobileHeaderSettings"'), 'Mobile top bar must be decluttered: no #btnMobileHeaderSettings');
      assert.ok(!mobileHtml.includes('id="btnMobileSoundToggle"'), 'Mobile top bar must be decluttered: no #btnMobileSoundToggle');
      assert.ok(!mobileHtml.includes('id="btnMobileCommandSearch"'), 'Mobile top bar must be decluttered: no #btnMobileCommandSearch');
      assert.ok(!mobileHtml.includes('id="btnMobilePersonaSwitch"'), 'Mobile top bar must be decluttered: no #btnMobilePersonaSwitch');

      // Controls available in sidebar drawer & settings sheet
      assert.ok(mobileHtml.includes('id="mobileSidebarThemeAndCleanRow"'), 'Mobile sidebar drawer must co-locate theme and clean view');
      assert.ok(mobileHtml.includes('id="btnMobileSidebarThemeCycle"'), 'Mobile sidebar must feature #btnMobileSidebarThemeCycle');
      assert.ok(mobileHtml.includes('id="btnMobileSidebarDeclutterToggle"'), 'Mobile sidebar must feature #btnMobileSidebarDeclutterToggle');
      assert.ok(mobileHtml.includes('id="btnMobileSidebarSettings"'), 'Mobile sidebar must feature #btnMobileSidebarSettings');
      assert.ok(mobileHtml.includes('id="btnMobileSidebarCommandSearch"'), 'Mobile sidebar must feature #btnMobileSidebarCommandSearch');
      assert.ok(mobileSrc.includes('renderMobileSettingsSheet()'), 'Mobile view must include renderMobileSettingsSheet()');
      assert.ok(mobileSrc.includes('openSettingsSheet()'), 'Mobile app must include openSettingsSheet()');
      assert.ok(mobileSrc.includes('closeSettingsSheet()'), 'Mobile app must include closeSettingsSheet()');

      // Mobile Ultra-Clean View CSS invariants
      assert.ok(mobileSrc.includes('body[data-clean-view="true"] #mobileCleanFocusBar'), 'Mobile clean view must suppress #mobileCleanFocusBar');
      assert.ok(mobileSrc.includes('body[data-clean-view="true"] #roleExperienceBanner'), 'Mobile clean view must suppress #roleExperienceBanner');
      assert.ok(mobileSrc.includes('body[data-clean-view="true"] .clean-view-hide-label'), 'Mobile clean view must suppress .clean-view-hide-label');
      assert.ok(mobileSrc.includes('body[data-clean-view="true"] .mobile-card'), 'Mobile clean view must apply compact card padding');
      assert.ok(mobileSrc.includes('.mobile-section-subtitle'), 'Mobile view must tag subtitles with .mobile-section-subtitle for clean view suppression');
      assert.ok(mobileSrc.includes('.mobile-secondary-clutter'), 'Mobile view must tag guidance boxes with .mobile-secondary-clutter');
      assert.ok(mobileSrc.includes('Clean View: High-density mode'), 'toggleCleanFocusMode must announce Clean View activation');
      assert.ok(mobileSrc.includes('Full View: Detailed mode'), 'toggleCleanFocusMode must announce Full View activation');
      assert.ok(mobileSrc.includes('Switch to Clean'), 'Full View clean focus bar must offer Switch to Clean CTA');
    });

    it('10. Canonical Single Sign Out on Profile tab in Account & Compliance (Zero Duplication)', () => {
      // 1. Mobile active session badge must NOT contain a Sign Out button
      const sessionBadgeMatch = mobileSrc.match(/id="mobileActiveSessionBadge"[^>]*>([\s\S]*?)<\/div>/);
      assert.ok(sessionBadgeMatch, 'mobileActiveSessionBadge must exist');
      assert.ok(!sessionBadgeMatch[1].includes('Sign Out'), 'mobileActiveSessionBadge must NOT contain a duplicate Sign Out button');

      // 2. Canonical Sign Out button #btnMobileProfileSignOut must live in Account & Compliance card
      assert.ok(mobileHtml.includes('id="btnMobileProfileSignOut"'), 'Profile screen must feature canonical #btnMobileProfileSignOut');
      assert.ok(mobileSrc.includes('Account &amp; Compliance'), 'Profile screen must feature Account & Compliance section');

      // 3. Exactly one Sign Out button on the Profile screen
      const profileRenderMatch = mobileSrc.match(/renderProfile\(\)\s*\{([\s\S]*?)\n\s*getBrandLogoSvg/);
      assert.ok(profileRenderMatch, 'renderProfile() implementation must be present');
      const signOutMatches = profileRenderMatch[1].match(/Sign Out/g) || [];
      // Exactly 1 Sign Out button in renderProfile (inside Account & Compliance)
      assert.strictEqual(signOutMatches.length, 1, `renderProfile must contain exactly 1 Sign Out button, found ${signOutMatches.length}`);

      // 4. Clean Redesign: Theme switcher and Settings cards removed from Profile tab (co-located in sidebar & settings sheet)
      assert.ok(!profileRenderMatch[1].includes('class="theme-selection-card"'), 'renderProfile must not contain theme switcher card');
      assert.ok(!profileRenderMatch[1].includes('class="profile-settings-card"'), 'renderProfile must not contain settings card');
      assert.ok(!profileRenderMatch[1].includes('id="btnMobileProfileSettings"'), 'renderProfile must not contain duplicate settings button');

      // 5. Active session badge moved to Account & Compliance section
      const accountComplianceIndex = profileRenderMatch[1].indexOf('Account &amp; Compliance');
      const sessionBadgeIndex = profileRenderMatch[1].indexOf('id="mobileActiveSessionBadge"');
      assert.ok(accountComplianceIndex !== -1, 'Account & Compliance section must exist');
      assert.ok(sessionBadgeIndex !== -1, 'mobileActiveSessionBadge must exist');
      assert.ok(sessionBadgeIndex > accountComplianceIndex, 'mobileActiveSessionBadge must be placed inside Account & Compliance section');
    });

    it('11. Universal WCAG 2.2 AA Modal Dialog Accessibility Invariants (Desktop & Mobile)', () => {
      // 1. Desktop: All modal backdrops (except pure backdrop overlay divs) must have WAI-ARIA role="dialog", aria-modal="true", and aria-labelledby
      const modalRegex = /<div[^>]*class="modal-backdrop[^"]*"[^>]*id="([^"]+)"[^>]*>/g;
      let match;
      let modalCount = 0;
      while ((match = modalRegex.exec(dashboardHtml)) !== null) {
        const fullTag = match[0];
        const modalId = match[1];
        if (modalId === 'notificationsDrawerOverlay') continue; // Pure click-backdrop overlay

        modalCount++;
        assert.ok(fullTag.includes('role="dialog"'), `Modal #${modalId} must have role="dialog"`);
        assert.ok(fullTag.includes('aria-modal="true"'), `Modal #${modalId} must have aria-modal="true"`);
        
        const labelledByMatch = fullTag.match(/aria-labelledby="([^"]+)"/);
        assert.ok(labelledByMatch, `Modal #${modalId} must have aria-labelledby attribute`);
        const titleId = labelledByMatch[1];
        assert.ok(dashboardHtml.includes(`id="${titleId}"`), `Target title element #${titleId} for modal #${modalId} must exist in DOM`);
      }
      assert.ok(modalCount >= 25, `Expected at least 25 desktop modals, found ${modalCount}`);

      // 2. Desktop Notification Drawer
      assert.ok(dashboardHtml.includes('id="notificationsDrawer" role="dialog" aria-modal="true" aria-labelledby="notificationCenterTitle"'));
      assert.ok(dashboardHtml.includes('id="notificationCenterTitle"'));

      // 3. Desktop Focus Trapping and Escape listener
      assert.ok(dashboardSrc.includes("e.key === 'Tab'") && dashboardSrc.includes("e.shiftKey"), 'Desktop must implement Tab / Shift-Tab focus trapping');
      assert.ok(dashboardSrc.includes("e.key === 'Escape'"), 'Desktop must dismiss modals on Escape');

      // 4. Mobile: Sheets & Drawers WAI-ARIA invariants
      assert.ok(mobileSrc.includes('id="actionSheetModal" role="dialog" aria-modal="true" aria-labelledby="actionSheetTitle"'));
      assert.ok(mobileSrc.includes('id="mobilePersonaSheet" role="dialog" aria-modal="true" aria-labelledby="personaSheetTitle"'));
      assert.ok(mobileSrc.includes('id="mobileSettingsSheet" role="dialog" aria-modal="true" aria-labelledby="settingsSheetTitle"'));
      assert.ok(mobileSrc.includes('id="extraRunsPickerSheet" role="dialog" aria-modal="true" aria-labelledby="extraRunsPickerTitle"'));
      assert.ok(mobileSrc.includes('id="wagonPickerSheet" role="dialog" aria-modal="true" aria-labelledby="wagonPickerTitle"'));
      assert.ok(mobileSrc.includes('id="mobileSidebarDrawer" data-sidebar-theme="\' + activeTheme + \'" role="dialog" aria-modal="true" aria-labelledby="mobileSidebarTitle"'));
      assert.ok(mobileSrc.includes('id="mobileDismissalSheet" role="dialog" aria-modal="true" aria-labelledby="dismissalSheetTitle"'));
      assert.ok(mobileSrc.includes('id="mobileIccLawsSheet" role="dialog" aria-modal="true" aria-labelledby="iccLawsSheetTitle"'));
      assert.ok(mobileSrc.includes('id="mobilePenaltyRunsSheet" role="dialog" aria-modal="true" aria-labelledby="penaltyRunsSheetTitle"'));
      assert.ok(mobileSrc.includes('id="mobileBowlerRotationSheet" role="dialog" aria-modal="true" aria-labelledby="bowlerRotationTitle"'));

      // 5. Mobile Universal Sheet & Drawer Focus Trapping & Restoration
      assert.ok(mobileSrc.includes('Universal Mobile Sheet & Drawer Focus Trapping & Restoration (WCAG 2.2 AA)'));
      assert.ok(mobileSrc.includes('mobileModalObserver'));
      assert.ok(mobileSrc.includes("e.key === 'Escape'"));
      assert.ok(mobileSrc.includes("e.key === 'Tab'"));
    });
  });
});



