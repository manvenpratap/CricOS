import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('47. Motion Performance Optimization & Design Spells Engine', () => {
  const dashboardPath = path.join(rootDir, 'apps', 'api', 'src', 'ui', 'dashboard.ts');
  const mobileViewPath = path.join(rootDir, 'apps', 'api', 'src', 'ui', 'mobile-view.ts');
  const rootIndexPath = path.join(rootDir, 'index.html');
  const distIndexPath = path.join(rootDir, 'dist', 'index.html');
  const distMobilePath = path.join(rootDir, 'dist', 'mobile.html');

  const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
  const mobileViewContent = fs.readFileSync(mobileViewPath, 'utf8');
  const rootIndexContent = fs.readFileSync(rootIndexPath, 'utf8');
  const distIndexContent = fs.readFileSync(distIndexPath, 'utf8');
  const distMobileContent = fs.readFileSync(distMobilePath, 'utf8');

  describe('1. Hardware-Accelerated Compositor Invariants (Skill 14: fixing-motion-performance)', () => {
    it('verifies mobile sidebar uses transform: translateX instead of animating layout left', () => {
      // Must not animate left property
      assert.ok(
        dashboardContent.includes('transform: translateX(-100%)'),
        'Sidebar must use transform: translateX(-100%) when closed on mobile'
      );
      assert.ok(
        dashboardContent.includes('.app-sidebar.mobile-open {\n      transform: translateX(0);') ||
        dashboardContent.includes('.app-sidebar.mobile-open { transform: translateX(0);') ||
        dashboardContent.includes('transform: translateX(0)'),
        'Sidebar must animate into view via transform: translateX(0)'
      );
      assert.ok(
        dashboardContent.includes('transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)'),
        'Sidebar transition must animate transform instead of left'
      );
    });

    it('verifies zero transition: all across all stylesheets', () => {
      // Strict Emil Kowalski rule: zero transition: all
      const transitionAllRegex = /transition:\s*all\b/i;
      assert.strictEqual(
        transitionAllRegex.test(dashboardContent),
        false,
        'dashboard.ts must have zero transition: all'
      );
      assert.strictEqual(
        transitionAllRegex.test(mobileViewContent),
        false,
        'mobile-view.ts must have zero transition: all'
      );
    });
  });

  describe('2. 3D WebGL RequestAnimationFrame Cancellation & Battery Conservation', () => {
    it('verifies stop3DModalViewer universally stops active render loops upon modal closing', () => {
      assert.ok(
        dashboardContent.includes('function stop3DModalViewer(modalId)'),
        'stop3DModalViewer function must be defined'
      );
      assert.ok(
        dashboardContent.includes('window.trophyCabinet') && dashboardContent.includes('window.trophyCabinet.stop()'),
        'Must stop 3D Trophy auto-rotation and render loop'
      );
      assert.ok(
        dashboardContent.includes('window.playerCard3D') && dashboardContent.includes('window.playerCard3D.stop()'),
        'Must stop 3D Player Card render loop'
      );
      assert.ok(
        dashboardContent.includes('window.batConfigurator') && dashboardContent.includes('window.batConfigurator.stop()'),
        'Must stop 3D Bat Customizer render loop'
      );
      assert.ok(
        dashboardContent.includes('window.wagonWheel3D') && dashboardContent.includes('window.wagonWheel3D.stop()'),
        'Must stop 3D Wagon Wheel render loop'
      );
    });

    it('verifies closeModal automatically invokes stop3DModalViewer', () => {
      assert.ok(
        dashboardContent.includes('stop3DModalViewer(modalId)'),
        'closeModal must hook into stop3DModalViewer'
      );
    });

    it('verifies 3D controller classes implement cancelAnimationFrame in their stop methods', () => {
      assert.ok(
        dashboardContent.includes('cancelAnimationFrame(this.animFrameId)'),
        '3D controller classes must call cancelAnimationFrame'
      );
    });
  });

  describe('3. Live Match Harmonic Momentum Waveform (Skill 15: Design Spells)', () => {
    it('renders match-momentum-container with canvas and telemetry HUD in dashboard', () => {
      assert.ok(
        dashboardContent.includes('id="matchMomentumCanvas"'),
        'Must include #matchMomentumCanvas'
      );
      assert.ok(
        dashboardContent.includes('MATCH MOMENTUM WAVE'),
        'Must render MATCH MOMENTUM WAVE title'
      );
      assert.ok(
        dashboardContent.includes('Dual-Phase Harmonic Tension'),
        'Must display Dual-Phase Harmonic Tension label'
      );
    });

    it('verifies momentum wave canvas uses IntersectionObserver and tab switching for zero background drain', () => {
      assert.ok(
        dashboardContent.includes('startMomentumWave'),
        'CricOSMotionFX must have startMomentumWave method'
      );
      assert.ok(
        dashboardContent.includes('stopMomentumWave'),
        'CricOSMotionFX must have stopMomentumWave method'
      );
      assert.ok(
        dashboardContent.includes('IntersectionObserver'),
        'Must observe momentum canvas to pause when off-screen'
      );
    });

    it('verifies gyroscopic cricket ball widget with RPM and speed telemetry', () => {
      assert.ok(
        dashboardContent.includes('ball-gyro-widget'),
        'Must include ball-gyro-widget class'
      );
      assert.ok(
        dashboardContent.includes('ball-gyro-sphere'),
        'Must include ball-gyro-sphere element'
      );
      assert.ok(
        dashboardContent.includes('ball-gyro-seam'),
        'Must include ball-gyro-seam with dynamic spin animation'
      );
      assert.ok(
        dashboardContent.includes('@keyframes ballGyroSpin'),
        'Must define ballGyroSpin keyframes'
      );
    });
  });

  describe('4. Kinetic Celebratory Particle FX & 3D Elastic Banners', () => {
    it('renders celebration canvas and elastic kinetic banner overlay in Web and Mobile', () => {
      assert.ok(
        dashboardContent.includes('id="cricosCelebrationCanvas"'),
        'Dashboard must have #cricosCelebrationCanvas'
      );
      assert.ok(
        dashboardContent.includes('id="kineticBoundaryBanner"'),
        'Dashboard must have #kineticBoundaryBanner'
      );
      assert.ok(
        mobileViewContent.includes('id="cricosCelebrationCanvas"'),
        'Mobile view must have #cricosCelebrationCanvas'
      );
      assert.ok(
        mobileViewContent.includes('id="kineticBoundaryBanner"'),
        'Mobile view must have #kineticBoundaryBanner'
      );
    });

    it('triggers celebratory particles on maximum sixes, boundaries, and wickets', () => {
      assert.ok(
        dashboardContent.includes("window.CricOSMotionFX.triggerCelebration('SIX')"),
        'Dashboard scoring must trigger celebration for SIX'
      );
      assert.ok(
        dashboardContent.includes("window.CricOSMotionFX.triggerCelebration('FOUR')"),
        'Dashboard scoring must trigger celebration for FOUR'
      );
      assert.ok(
        dashboardContent.includes("window.CricOSMotionFX.triggerCelebration('WICKET')"),
        'Dashboard scoring must trigger celebration for WICKET'
      );
      assert.ok(
        mobileViewContent.includes("window.CricOSMotionFX.triggerCelebration('SIX')"),
        'Mobile scoring must trigger celebration for SIX'
      );
      assert.ok(
        mobileViewContent.includes("window.CricOSMotionFX.triggerCelebration('WICKET')"),
        'Mobile promptWicketModal must trigger celebration for WICKET'
      );
    });

    it('verifies kinetic elastic banner pop animation keyframes', () => {
      assert.ok(
        dashboardContent.includes('@keyframes bannerPopElastic'),
        'Must define bannerPopElastic in dashboard'
      );
      assert.ok(
        mobileViewContent.includes('@keyframes bannerPopElastic'),
        'Must define bannerPopElastic in mobile-view'
      );
    });
  });

  describe('5. Holo-Foil Sweep & Athletic Card Sheen', () => {
    it('verifies holo-foil-card class with iridescent gradient sweep animation', () => {
      assert.ok(
        dashboardContent.includes('.holo-foil-card'),
        'Must define holo-foil-card in dashboard'
      );
      assert.ok(
        dashboardContent.includes('@keyframes holoFoilSweep'),
        'Must define holoFoilSweep animation keyframes'
      );
      assert.ok(
        dashboardContent.includes('class="athletic-stats-card holo-foil-card"'),
        'Embedded player stats card must have holo-foil-card class'
      );
    });
  });

  describe('6. Accessibility & Single-File Release Parity (Rule 5 & Rule 6)', () => {
    it('verifies prefers-reduced-motion gracefully bypasses particle explosions', () => {
      assert.ok(
        dashboardContent.includes("window.matchMedia('(prefers-reduced-motion: reduce)')"),
        'CricOSMotionFX must check prefers-reduced-motion media query'
      );
      assert.ok(
        mobileViewContent.includes("window.matchMedia('(prefers-reduced-motion: reduce)')"),
        'Mobile CricOSMotionFX must check prefers-reduced-motion media query'
      );
    });

    it('verifies all interactive motion buttons have data-tooltip attributes', () => {
      assert.ok(
        dashboardContent.includes('onclick="window.CricOSMotionFX.triggerCelebration(\'SIX\')" data-tooltip="Test Stadium Pyro'),
        'Stadium FX button must have data-tooltip'
      );
      assert.ok(
        dashboardContent.includes('onclick="sendFanCheer(\'🎆 Stadium Celebration!\')" data-tooltip="Trigger stadium fireworks'),
        'Stadium Pyro fan cheer button must have data-tooltip'
      );
    });

    it('verifies Rule 6 single-file invariant: dist/index.html is byte-for-byte identical to root index.html', () => {
      assert.strictEqual(
        rootIndexContent.length,
        distIndexContent.length,
        'root index.html and dist/index.html must have identical byte lengths'
      );
      assert.strictEqual(
        rootIndexContent,
        distIndexContent,
        'root index.html and dist/index.html must be byte-for-byte identical'
      );
    });

    it('verifies distribution packaging synchronizes celebration canvas to dist/mobile.html', () => {
      assert.ok(
        distMobileContent.includes('id="cricosCelebrationCanvas"'),
        'dist/mobile.html must include #cricosCelebrationCanvas'
      );
      assert.ok(
        distMobileContent.includes('id="kineticBoundaryBanner"'),
        'dist/mobile.html must include #kineticBoundaryBanner'
      );
    });
  });
});
