import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDashboardHtml } from '../apps/api/dist/ui/dashboard.js';
import { getMobileAppHtml } from '../apps/api/dist/ui/mobile-view.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('35. Persona Switching & Real-Time Profile Synchronization', () => {
  const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
  const distIndexHtml = fs.readFileSync(path.join(rootDir, 'dist/index.html'), 'utf8');
  const dashboardHtml = getDashboardHtml();
  const mobileHtml = getMobileAppHtml();

  describe('1. Web Console DOM & Command Bar Persona Invariants', () => {
    it('contains #activePersonaBadge in top command bar with accessible tooltip and click handler', () => {
      assert.ok(indexHtml.includes('id="activePersonaBadge"'), 'activePersonaBadge must exist in top command bar');
      assert.ok(indexHtml.includes('onclick="openUserModal()"'), 'activePersonaBadge must trigger openUserModal()');
      assert.ok(indexHtml.includes('data-tooltip="Active Persona:'), 'activePersonaBadge must contain accessible data-tooltip');
    });

    it('contains sidebar profile footer elements with avatar, name, and role badge', () => {
      assert.ok(indexHtml.includes('id="headerUserAvatar"'), 'headerUserAvatar pill must exist');
      assert.ok(indexHtml.includes('id="headerUserName"'), 'headerUserName must exist');
      assert.ok(indexHtml.includes('id="headerUserRoleBadge"'), 'headerUserRoleBadge must exist');
    });

    it('contains persona pills for all 8 standard roles in modalUserProfile', () => {
      const expectedRoles = [
        'CAPTAIN',
        'PLAYER',
        'SCORER',
        'FAN',
        'UMPIRE',
        'ADMIN',
        'ORGANISER',
        'TURF_PROVIDER'
      ];
      expectedRoles.forEach(role => {
        assert.ok(
          indexHtml.includes(`data-role="${role}"`),
          `Persona pill for ${role} must exist with data-role attribute`
        );
        assert.ok(
          indexHtml.includes(`onclick="selectPersona('${role}')"`),
          `Persona pill for ${role} must call selectPersona('${role}')`
        );
      });
    });

    it('contains verified career figures card with element IDs for dynamic stat updates', () => {
      assert.ok(indexHtml.includes('id="statCareerMatches"'), 'statCareerMatches element ID must exist');
      assert.ok(indexHtml.includes('id="statCareerRuns"'), 'statCareerRuns element ID must exist');
      assert.ok(indexHtml.includes('id="statCareerAvg"'), 'statCareerAvg element ID must exist');
      assert.ok(indexHtml.includes('id="statCareerSR"'), 'statCareerSR element ID must exist');
    });
  });

  describe('2. JavaScript Client Persona Switching & State Synchronization', () => {
    it('defines rich descriptions for all roles in ROLE_PERMISSIONS to prevent undefined toast messages', () => {
      assert.ok(indexHtml.includes("description: 'Manage Playing XI, toss, declarations, and tactical pad'"), 'CAPTAIN description missing');
      assert.ok(indexHtml.includes("description: 'Career stats, RSVP, squad roster, and match fixtures'"), 'PLAYER description missing');
      assert.ok(indexHtml.includes("description: 'Ball-by-ball scoring, dismissals, wagon wheel, and match sign-off'"), 'SCORER description missing');
      assert.ok(indexHtml.includes("description: 'Live spectator broadcast, cheering console, polls, and MVP insights'"), 'FAN description missing');
    });

    it('toggles .active class across .persona-pill-btn elements in selectPersona()', () => {
      assert.ok(
        indexHtml.includes("document.querySelectorAll('.persona-pill-btn').forEach(btn => {"),
        'selectPersona must query and iterate .persona-pill-btn elements'
      );
      assert.ok(
        indexHtml.includes("btn.classList.add('active');"),
        'selectPersona must add active class to selected role pill'
      );
      assert.ok(
        indexHtml.includes("btn.classList.remove('active');"),
        'selectPersona must remove active class from unselected pills'
      );
    });

    it('synchronizes modal input fields and persona pill visual state in openUserModal()', () => {
      assert.ok(
        indexHtml.includes("if (nameInput) nameInput.value = currentUser.name || '';"),
        'openUserModal must synchronize profileInputName with currentUser.name'
      );
      assert.ok(
        indexHtml.includes("if (btn.getAttribute('data-role') === currentUser.persona) {"),
        'openUserModal must synchronize active pill highlight with currentUser.persona'
      );
    });

    it('updates top bar badge and sidebar footer profile identity in applyRolePermissions()', () => {
      // 1. Top bar active persona badge
      assert.ok(
        indexHtml.includes("badge.innerHTML = perms.icon + ' ' + perms.label.toUpperCase();"),
        'applyRolePermissions must update badge innerHTML'
      );
      assert.ok(
        indexHtml.includes("badge.style.color = perms.badgeColor;"),
        'applyRolePermissions must style badge color'
      );

      // 2. Sidebar profile footer
      assert.ok(
        indexHtml.includes("if (headerName) headerName.textContent = currentUser.name;"),
        'applyRolePermissions must update headerUserName'
      );
      assert.ok(
        indexHtml.includes("headerRole.textContent = perms.label.toUpperCase() + ' #' + currentUser.jerseyNumber;"),
        'applyRolePermissions must update headerUserRoleBadge text'
      );
      assert.ok(
        indexHtml.includes("headerAvatar.textContent = initials;"),
        'applyRolePermissions must update headerUserAvatar initials'
      );
      assert.ok(
        indexHtml.includes("headerAvatar.style.background = perms.badgeColor;"),
        'applyRolePermissions must update headerUserAvatar background color'
      );
    });

    it('decorates current active user in Playing XI roster with YOU badge in renderRoster()', () => {
      assert.ok(
        indexHtml.includes("let isYou = (typeof currentUser !== 'undefined' && currentUser.name === p.name);"),
        'renderRoster must detect if player row belongs to currentUser'
      );
      assert.ok(
        indexHtml.includes('data-tooltip="Your Current Active Profile">YOU</span>'),
        'renderRoster must render YOU badge for the active user'
      );
    });
  });

  describe('3. Mobile Webview Persona Switcher & Identity Sync', () => {
    it('populates default role profiles when switching personas in mobile app', () => {
      assert.ok(
        mobileHtml.includes("PLAYER: { name: 'Hardik P.', jersey: 33, role: 'ALL_ROUNDER'"),
        'mobile-view must define PLAYER profile defaults'
      );
      assert.ok(
        mobileHtml.includes("CAPTAIN: { name: 'Virat K.', jersey: 18, role: 'BATTER'"),
        'mobile-view must define CAPTAIN profile defaults'
      );
      assert.ok(
        mobileHtml.includes("this.profile.name = def.name;"),
        'mobile switchUserPersona must update profile.name'
      );
      assert.ok(
        mobileHtml.includes("this.profile.jerseyNumber = def.jersey;"),
        'mobile switchUserPersona must update profile.jerseyNumber'
      );
    });
  });

  describe('4. Rule 6 Packaging & Parity Verification', () => {
    it('verifies dist/index.html is byte-for-byte identical to root index.html', () => {
      assert.strictEqual(indexHtml, distIndexHtml, 'Rule 6 violation: root index.html and dist/index.html must match byte-for-byte');
    });

    it('verifies getDashboardHtml() output is identical to root index.html', () => {
      assert.strictEqual(dashboardHtml, indexHtml, 'dashboard.ts output must match index.html');
    });
  });
});
