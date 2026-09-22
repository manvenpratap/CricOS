import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  ROLE_PERMISSIONS_MATRIX,
  isTabAllowedForRole,
  getRolePermissions,
  getDefaultProfile,
  renderUserBadgeHtml,
  type PersonaRole
} from '../apps/web/dist/index.js';
import { signToken, verifyToken, requireRole, type UserRole } from '../apps/api/dist/middleware/auth.js';

describe('32. Role-Based Access Control (RBAC) & Feature Gating', () => {
  const allRoles: PersonaRole[] = [
    'CAPTAIN',
    'PLAYER',
    'SCORER',
    'FAN',
    'UMPIRE',
    'ADMIN',
    'ORGANISER',
    'TURF_PROVIDER'
  ];

  describe('1. Role Permissions Matrix & Tab Gating', () => {
    it('defines permissions for all 8 standard personas', () => {
      allRoles.forEach(role => {
        const perms = ROLE_PERMISSIONS_MATRIX[role];
        assert.ok(perms, `Permissions matrix missing configuration for role: ${role}`);
        assert.ok(perms.allowedTabs.length > 0, `Role ${role} has no allowed tabs`);
        assert.ok(perms.defaultTab, `Role ${role} has no default tab`);
        assert.ok(perms.allowedTabs.includes(perms.defaultTab), `Role ${role} default tab not in allowedTabs`);
        assert.ok(perms.badgeColor.startsWith('#'), `Role ${role} badge color invalid`);
        assert.ok(perms.icon, `Role ${role} missing icon`);
      });
    });

    it('enforces spectator restrictions for FAN persona', () => {
      const fanPerms = getRolePermissions('FAN');
      assert.strictEqual(fanPerms.canScore, false);
      assert.strictEqual(fanPerms.canManageLineup, false);
      assert.strictEqual(fanPerms.canAccessAdmin, false);
      assert.strictEqual(fanPerms.canAccessExplorer, false);
      assert.strictEqual(fanPerms.fanCheerConsole, true);
      assert.strictEqual(fanPerms.scoringMode, 'FAN_SPECTATOR');

      // Fans cannot access Scoring Studio, Fair Play Incidents, or API Explorer
      assert.strictEqual(isTabAllowedForRole('FAN', 'studio'), false);
      assert.strictEqual(isTabAllowedForRole('FAN', 'incidents'), false);
      assert.strictEqual(isTabAllowedForRole('FAN', 'explorer'), false);

      // Fans can access Match Center and Tournaments
      assert.strictEqual(isTabAllowedForRole('FAN', 'scoring'), true);
      assert.strictEqual(isTabAllowedForRole('FAN', 'tournaments'), true);
    });

    it('enforces official scorer capabilities for SCORER persona', () => {
      const scorerPerms = getRolePermissions('SCORER');
      assert.strictEqual(scorerPerms.canScore, true);
      assert.strictEqual(scorerPerms.canSignOffMatch, true);
      assert.strictEqual(scorerPerms.canAccessAdmin, false);
      assert.strictEqual(scorerPerms.canAccessExplorer, false);
      assert.strictEqual(scorerPerms.scoringMode, 'SCORER');

      // Scorers can access Scoring Studio and Match Center
      assert.strictEqual(isTabAllowedForRole('SCORER', 'studio'), true);
      assert.strictEqual(isTabAllowedForRole('SCORER', 'scoring'), true);

      // Scorers cannot access API Explorer or Marketplace admin
      assert.strictEqual(isTabAllowedForRole('SCORER', 'explorer'), false);
    });

    it('enforces tactical leadership capabilities for CAPTAIN persona', () => {
      const captainPerms = getRolePermissions('CAPTAIN');
      assert.strictEqual(captainPerms.canManageLineup, true);
      assert.strictEqual(captainPerms.canConductToss, true);
      assert.strictEqual(captainPerms.canSignOffMatch, true);
      assert.strictEqual(captainPerms.scoringMode, 'TACTICAL_VIEW');

      // Captains can access Teams & Rosters, Match Center, Venues, and Studio (tactical view)
      assert.strictEqual(isTabAllowedForRole('CAPTAIN', 'teams'), true);
      assert.strictEqual(isTabAllowedForRole('CAPTAIN', 'studio'), true);
      assert.strictEqual(isTabAllowedForRole('CAPTAIN', 'marketplace'), true);

      // Captains cannot access API Explorer
      assert.strictEqual(isTabAllowedForRole('CAPTAIN', 'explorer'), false);
    });

    it('enforces officiating and disciplinary capabilities for UMPIRE persona', () => {
      const umpirePerms = getRolePermissions('UMPIRE');
      assert.strictEqual(umpirePerms.canFileIncident, true);
      assert.strictEqual(umpirePerms.canSignOffMatch, true);
      assert.strictEqual(umpirePerms.scoringMode, 'OFFICIAL_OVERSIGHT');

      // Umpires can access Incidents & Trust and Match Center
      assert.strictEqual(isTabAllowedForRole('UMPIRE', 'incidents'), true);
      assert.strictEqual(isTabAllowedForRole('UMPIRE', 'scoring'), true);

      // Umpires cannot access Scoring Studio or API Explorer
      assert.strictEqual(isTabAllowedForRole('UMPIRE', 'studio'), false);
      assert.strictEqual(isTabAllowedForRole('UMPIRE', 'explorer'), false);
    });

    it('grants unrestricted access across all consoles for ADMIN persona', () => {
      const adminPerms = getRolePermissions('ADMIN');
      assert.strictEqual(adminPerms.canAccessAdmin, true);
      assert.strictEqual(adminPerms.canAccessExplorer, true);
      assert.strictEqual(adminPerms.canScore, false); // Only the scorer should be able to score
      assert.strictEqual(adminPerms.canManageTournaments, true);
      assert.strictEqual(adminPerms.canManageVenues, true);

      // Admin has all 7 tabs allowed
      ['scoring', 'teams', 'tournaments', 'marketplace', 'studio', 'incidents', 'explorer'].forEach(tab => {
        assert.strictEqual(isTabAllowedForRole('ADMIN', tab), true, `Admin should have access to ${tab}`);
      });
    });

    it('enforces that only the SCORER persona can score across all 8 roles', () => {
      const scoringRoles = allRoles.filter(role => getRolePermissions(role).canScore);
      assert.deepStrictEqual(scoringRoles, ['SCORER']);
    });
  });

  describe('2. User Profiles & Badges for All Personas', () => {
    it('generates role-appropriate profiles with career stats', () => {
      allRoles.forEach(role => {
        const profile = getDefaultProfile(role);
        assert.strictEqual(profile.role, role);
        assert.ok(profile.name.length > 0);
        assert.ok(profile.jerseyNumber >= 0);
        assert.ok(profile.careerStats.matches > 0);

        const badgeHtml = renderUserBadgeHtml(profile);
        assert.ok(badgeHtml.includes('data-tooltip'));
        assert.ok(badgeHtml.includes(role));
        assert.ok(badgeHtml.includes(profile.name));
      });
    });
  });

  describe('3. Backend JWT Token & RBAC Middleware Integration', () => {
    it('signs and verifies JWT tokens containing new persona roles', () => {
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
    });

    it('evaluates RBAC requireRole guard accurately', async () => {
      const scorerGuard = requireRole('SCORER');
      const adminGuard = requireRole('ORGANISER');

      // Test scorer access
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

      // 1. Scorer user allowed by scorer guard
      const scorerReq = {
        user: { userId: 'u1', identifier: 'sc', roles: ['SCORER' as UserRole], iat: 1, exp: 9999999999 }
      };
      await scorerGuard(scorerReq as any, mockReply as any);
      assert.strictEqual(statusCalled, 0, 'Scorer should be permitted');

      // 2. Fan user rejected by scorer guard
      statusCalled = 0;
      const fanReq = {
        user: { userId: 'u2', identifier: 'fan', roles: ['FAN' as UserRole], iat: 1, exp: 9999999999 }
      };
      await scorerGuard(fanReq as any, mockReply as any);
      assert.strictEqual(statusCalled, 403, 'Fan should be forbidden');
      assert.strictEqual(sendBody?.error, 'FORBIDDEN');

      // 3. Admin user automatically bypasses all role guards
      statusCalled = 0;
      const adminReq = {
        user: { userId: 'u3', identifier: 'admin', roles: ['ADMIN' as UserRole], iat: 1, exp: 9999999999 }
      };
      await scorerGuard(adminReq as any, mockReply as any);
      assert.strictEqual(statusCalled, 0, 'Admin should bypass scorer guard');

      await adminGuard(adminReq as any, mockReply as any);
      assert.strictEqual(statusCalled, 0, 'Admin should bypass organiser guard');
    });
  });
});
