import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { getMobileAppHtml } from '../apps/api/dist/ui/mobile-view.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('41. Mobile User Sign Up, Custom Bio & Automated Role-Based App Experience', () => {
  const mobileHtml = getMobileAppHtml();
  const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
  const distMobilePath = path.join(rootDir, 'dist', 'mobile.html');
  const distMobileHtml = fs.existsSync(distMobilePath) ? fs.readFileSync(distMobilePath, 'utf8') : '';

  describe('1. Sign Up & Profile Creation Form Controls', () => {
    it('renders segmented mode tabs allowing users to switch between Sign In and Create Account', () => {
      assert.ok(mobileHtml.includes('auth-mode-tabs'), 'Must contain auth-mode-tabs container');
      assert.ok(mobileHtml.includes('setAuthMode(this.dataset.mode)'), 'Must bind setAuthMode click handler');
      assert.ok(mobileHtml.includes('data-mode="SIGN_IN"'), 'Must contain SIGN_IN tab');
      assert.ok(mobileHtml.includes('data-mode="SIGN_UP"'), 'Must contain SIGN_UP tab');
      assert.ok(mobileHtml.includes('✨ Create Account'), 'Must have user-friendly Create Account label');
    });

    it('provides comprehensive profile creation inputs for name, bio, stance, jersey, and team', () => {
      assert.ok(mobileHtml.includes('id="signupNameInput"'), 'Must have full name input');
      assert.ok(mobileHtml.includes('id="signupIdentifierInput"'), 'Must have mobile or email identifier input');
      assert.ok(mobileHtml.includes('id="signupBioInput"'), 'Must have cricket bio textarea');
      assert.ok(mobileHtml.includes('id="signupPlayingRole"'), 'Must have playing role specialization dropdown');
      assert.ok(mobileHtml.includes('id="signupBattingStance"'), 'Must have batting stance selector');
      assert.ok(mobileHtml.includes('id="signupBowlingStyle"'), 'Must have bowling style input');
      assert.ok(mobileHtml.includes('id="signupJerseyNumber"'), 'Must have jersey number input');
      assert.ok(mobileHtml.includes('id="signupTeamName"'), 'Must have club or team input');
      assert.ok(mobileHtml.includes('submitSignUpAction()'), 'Must have submitSignUpAction submission handler');
    });

    it('renders dedicated verification step for new profile registrations', () => {
      assert.ok(mobileHtml.includes('Verifying profile for:'), 'Must display verifying profile status header');
      assert.ok(mobileHtml.includes('Confirm & Launch App 🚀'), 'Must have launch app confirmation CTA');
    });
  });

  describe('2. Automated 8-Persona System Role Experience Definition', () => {
    const all8Personas = [
      'CAPTAIN',
      'PLAYER',
      'SCORER',
      'FAN',
      'UMPIRE',
      'ORGANISER',
      'TURF_PROVIDER',
      'ADMIN'
    ];

    it('renders role selector cards for all 8 user personas with automated experience routing badges', () => {
      assert.ok(mobileHtml.includes('signup-roles-grid'), 'Must include signup-roles-grid container');
      assert.ok(mobileHtml.includes('setSignupRole(this.dataset.role)'), 'Must bind setSignupRole click handler');
      assert.ok(mobileHtml.includes("data-role=\"' + rc[0] + '\""), 'Must dynamically bind data-role on role cards');

      for (const persona of all8Personas) {
        assert.ok(
          mobileHtml.includes(`'${persona}'`),
          `Must include role selector card definition for ${persona}`
        );
      }
    });

    it('defines roleExperienceConfig with titles, taglines, default screens, and quick actions for all personas', () => {
      assert.ok(mobileHtml.includes('this.roleExperienceConfig = {'), 'Must initialize roleExperienceConfig in constructor');
      assert.ok(mobileHtml.includes('Captain Tactical Command'), 'Must define Captain experience title');
      assert.ok(mobileHtml.includes('Player Athletic Headquarters'), 'Must define Player experience title');
      assert.ok(mobileHtml.includes('Scorer Studio Workspace'), 'Must define Scorer experience title');
      assert.ok(mobileHtml.includes('Stadium Fan Pulse Arena'), 'Must define Fan experience title');
      assert.ok(mobileHtml.includes('Match Officials Desk'), 'Must define Umpire experience title');
      assert.ok(mobileHtml.includes('Tournament Director Hub'), 'Must define Organiser experience title');
      assert.ok(mobileHtml.includes('Venue Operations Hub'), 'Must define Turf Provider experience title');
      assert.ok(mobileHtml.includes('Platform Governance & Audit Desk'), 'Must define Admin experience title');
    });

    it('implements applyRoleExperience() that auto-routes users to their system-defined primary workspace', () => {
      assert.ok(mobileHtml.includes('applyRoleExperience(role, isSignup)'), 'Must declare applyRoleExperience method');
      assert.ok(mobileHtml.includes('this.currentScreen = cfg.defaultScreen;'), 'Must auto-route screen based on system configuration');
      assert.ok(mobileHtml.includes('this.matchSubTab = cfg.defaultSubTab;'), 'Must auto-route subtab for scorers and fans');
    });

    it('renders the dynamic Role Experience HUD Banner across app consoles', () => {
      assert.ok(mobileHtml.includes('renderRoleExperienceBanner()'), 'Must declare renderRoleExperienceBanner method');
      assert.ok(mobileHtml.includes('role-exp-hud-banner'), 'Must render role-exp-hud-banner container');
      assert.ok(mobileHtml.includes('role-exp-hud-badge'), 'Must render role-exp-hud-badge element');
      assert.ok(mobileHtml.includes('triggerRoleQuickAction()'), 'Must bind triggerRoleQuickAction on HUD quick button');
    });
  });

  describe('3. Profile Bio Display & Action Sheet Editing', () => {
    it('displays custom user bio quote card with athletic tags in renderProfile()', () => {
      assert.ok(mobileHtml.includes('profile-bio-card'), 'Must render profile-bio-card');
      assert.ok(mobileHtml.includes('profile-bio-quote-icon'), 'Must include quote icon');
      assert.ok(mobileHtml.includes('id="profileBioText"'), 'Must have profileBioText container');
      assert.ok(mobileHtml.includes('profile-bio-tag'), 'Must render profile-bio-tag badges');
    });

    it('provides accessible Action Sheet drawer to edit bio and athletic specifications', () => {
      assert.ok(mobileHtml.includes('id="btnEditProfileBio"'), 'Must have btnEditProfileBio button');
      assert.ok(mobileHtml.includes('openEditProfileSheet()'), 'Must declare openEditProfileSheet method');
      assert.ok(mobileHtml.includes('editProfileNameInput'), 'Must include edit name input');
      assert.ok(mobileHtml.includes('editProfileBioInput'), 'Must include edit bio input');
      assert.ok(mobileHtml.includes('editProfileJerseyInput'), 'Must include edit jersey input');
      assert.ok(mobileHtml.includes('editProfileStanceInput'), 'Must include edit stance select');
      assert.ok(mobileHtml.includes('editProfileBowlingInput'), 'Must include edit bowling input');
      assert.ok(mobileHtml.includes('editProfileTeamInput'), 'Must include edit team input');
    });
  });

  describe('4. Web Console Parity & Script Hygiene', () => {
    it('synchronizes custom bio in web console modalUserProfile and state management', () => {
      assert.ok(indexHtml.includes('id="profileInputBio"'), 'Web console modalUserProfile must contain profileInputBio');
      assert.ok(indexHtml.includes('currentUser.bio = bioInput.value.trim()'), 'saveUserProfile must persist bio');
      assert.ok(indexHtml.includes('if (def.bio) currentUser.bio = def.bio;'), 'selectPersona must sync default bio');
    });

    it('enforces Emil Kowalski invariant: zero "transition: all" across new CSS rules', () => {
      const authTabsCssMatch = mobileHtml.match(/\.auth-mode-tab\s*\{[^}]+\}/);
      if (authTabsCssMatch) {
        assert.ok(!authTabsCssMatch[0].includes('transition: all'), '.auth-mode-tab must not use transition: all');
      }

      const roleCardCssMatch = mobileHtml.match(/\.signup-role-card\s*\{[^}]+\}/);
      if (roleCardCssMatch) {
        assert.ok(!roleCardCssMatch[0].includes('transition: all'), '.signup-role-card must not use transition: all');
      }

      const hudBtnCssMatch = mobileHtml.match(/\.role-exp-hud-btn\s*\{[^}]+\}/);
      if (hudBtnCssMatch) {
        assert.ok(!hudBtnCssMatch[0].includes('transition: all'), '.role-exp-hud-btn must not use transition: all');
      }
    });

    it('enforces Rule 5: 100% data-tooltip coverage on interactive signup buttons and cards', () => {
      assert.ok(mobileHtml.includes('data-tooltip="Sign in to your existing CricOS account"'));
      assert.ok(mobileHtml.includes('data-tooltip="Create a new cricket profile, custom bio, and role experience"'));
      assert.ok(mobileHtml.includes('data-tooltip="Create cricket profile and continue to verification"'));
      assert.ok(mobileHtml.includes('data-tooltip="Edit your cricket bio, jersey number, batting stance, and club specs"'));
    });

    it('compiles embedded mobile client script cleanly with zero syntax errors', () => {
      const scriptMatch = mobileHtml.match(/<script[^>]*>([\s\S]*?)<\/script>/);
      assert.ok(scriptMatch, 'Mobile view must contain an embedded script tag');
      const scriptCode = scriptMatch[1];
      assert.doesNotThrow(() => {
        new vm.Script(scriptCode);
      }, 'Embedded mobile client script must parse and compile cleanly with zero syntax errors');
    });

    it('maintains Rule 6 distribution parity across packaged files', () => {
      assert.ok(distMobileHtml.length > 0, 'dist/mobile.html must exist and contain packaged app');
      assert.ok(distMobileHtml.includes('signup-roles-grid'), 'dist/mobile.html must contain signup roles grid');
      assert.ok(distMobileHtml.includes('role-exp-hud-banner'), 'dist/mobile.html must contain role experience banner');
      assert.ok(distMobileHtml.includes('profile-bio-card'), 'dist/mobile.html must contain profile bio card');
    });
  });
});
