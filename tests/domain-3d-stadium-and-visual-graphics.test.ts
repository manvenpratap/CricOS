/**
 * Domain Test Suite: 3D WebGL Stadium, Visual Graphics, Animation Engine & Precision Layouts
 *
 * Consolidates and unifies:
 * - 36-emil-animation-engine.test.ts
 * - 37-threejs-interaction.test.ts
 * - 47-motion-performance-and-design-spells.test.ts
 * - 50-chart-layout-and-no-overlap.test.ts
 * - 56-3d-stadium-ui-fix.test.ts
 */
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
const screenshotsDir = path.join(rootDir, 'tests', 'screenshots');

function readFile(relPath: string): string {
  return fs.readFileSync(path.resolve(rootDir, relPath), 'utf-8');
}

describe('Domain: 3D WebGL Stadium, Visual Graphics, Motion & Precision Layouts', () => {
  const indexHtml = readFile('index.html');
  const distIndexHtml = readFile('dist/index.html');
  const distMobileHtml = readFile('dist/mobile.html');
  const dashboardHtml = getDashboardHtml();
  const mobileHtml = getMobileAppHtml();
  const dashboardSrc = readFile('apps/api/src/ui/dashboard.ts');
  const mobileSrc = readFile('apps/api/src/ui/mobile-view.ts');

  // =========================================================================
  // Suite 1: Emil Kowalski Motion Vocabulary & Compositor Invariants
  // =========================================================================
  describe('Suite 1: Emil Kowalski Motion Vocabulary & Compositor Invariants', () => {
    it('1. Defines motion tokens in CSS :root and exposes window.ANIMATION_TOKENS and VOCABULARY', () => {
      assert.ok(indexHtml.includes('--ease-out: cubic-bezier(0.23, 1, 0.32, 1);'));
      assert.ok(indexHtml.includes('--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);'));
      assert.ok(indexHtml.includes('--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);'));
      assert.ok(indexHtml.includes('--ease-spring: cubic-bezier(0.16, 1, 0.3, 1);'));
      assert.ok(indexHtml.includes('--duration-fast: 120ms;'));
      assert.ok(indexHtml.includes('--duration-normal: 200ms;'));
      assert.ok(indexHtml.includes('--duration-modal: 280ms;'));

      assert.ok(indexHtml.includes('window.ANIMATION_TOKENS = Object.freeze({'));
      assert.ok(indexHtml.includes("easeOut: 'cubic-bezier(0.23, 1, 0.32, 1)'"));
      assert.ok(indexHtml.includes('window.ANIMATION_VOCABULARY = Object.freeze({'));
      assert.ok(indexHtml.includes('anticipation:'));
      assert.ok(indexHtml.includes('rubberband:'));
      assert.ok(indexHtml.includes('window.lookupAnimationTerm = function(term) {'));
    });

    it('2. Scale invariants: popBall starts at scale(0.88), modalPopIn uses scale(0.95), and tactile compression', () => {
      assert.ok(indexHtml.includes('@keyframes popBall {'));
      assert.ok(indexHtml.includes('0% { transform: scale(0.88); opacity: 0; }'));
      assert.ok(!indexHtml.includes('0% { transform: scale(0);'));
      assert.ok(indexHtml.includes('@keyframes modalPopIn {'));
      assert.ok(indexHtml.includes('transform: scale(0.95) translateY(8px);'));
      assert.ok(indexHtml.includes('.pad-btn:active {'));
      assert.ok(indexHtml.includes('transform: scale(0.97) translateY(1px);'));
      assert.ok(indexHtml.includes('.btn:active {'));
    });

    it('3. Enforces zero transition: all anti-pattern across all HTML and TypeScript files', () => {
      const regex = /transition:\s*all\b/i;
      assert.strictEqual(regex.test(indexHtml), false, 'index.html must not contain transition: all');
      assert.strictEqual(regex.test(mobileHtml), false, 'mobileHtml must not contain transition: all');
      assert.strictEqual(regex.test(dashboardSrc), false, 'dashboard.ts must not contain transition: all');
      assert.strictEqual(regex.test(mobileSrc), false, 'mobile-view.ts must not contain transition: all');
    });

    it('4. Uses GPU-accelerated transform transitions instead of layout-animating left/height', () => {
      assert.ok(indexHtml.includes('transform: translateX(-100%);'));
      assert.ok(indexHtml.includes('transform: translateX(0);'));
      assert.ok(indexHtml.includes('transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);'));
      assert.ok(mobileHtml.includes('transform-origin: bottom;'));
      assert.ok(mobileHtml.includes('transition: transform 0.25s ease, background-color 0.25s ease;'));
    });

    it('5. Implements Hold-to-Confirm, blur-masked tabs, staggered roster, and tooltip instant skip', () => {
      assert.ok(indexHtml.includes('.btn-hold-confirm {'));
      assert.ok(indexHtml.includes('clip-path: inset(0 100% 0 0);'));
      assert.ok(indexHtml.includes('clip-path: inset(0 0 0 0);'));
      assert.ok(indexHtml.includes('initHoldToConfirm'));
      assert.ok(indexHtml.includes('.tab-pane.transitioning {'));
      assert.ok(indexHtml.includes('filter: blur(2px);'));
      assert.ok(indexHtml.includes('@keyframes rosterItemEnter {'));
      assert.ok(indexHtml.includes('.player-roster-row:nth-child(1) { animation-delay: 25ms; }'));
      assert.ok(indexHtml.includes('.uni-tooltip[data-instant] {'));
      assert.ok(indexHtml.includes('transition-duration: 0ms !important;'));
    });
  });

  // =========================================================================
  // Suite 2: Sonner Stacked Notifications, Haptics & Design Spells
  // =========================================================================
  describe('Suite 2: Sonner Stacked Notifications, Haptics & Design Spells', () => {
    it('1. Renders #sonnerToaster container and complete window.toast API', () => {
      assert.ok(indexHtml.includes('id="sonnerToaster"'));
      assert.ok(indexHtml.includes('role="region"'));
      assert.ok(indexHtml.includes('aria-label="Notifications"'));
      assert.ok(indexHtml.includes('window.toast = (function() {'));
      assert.ok(indexHtml.includes('fn.success ='));
      assert.ok(indexHtml.includes('fn.error ='));
      assert.ok(indexHtml.includes('fn.info ='));
      assert.ok(indexHtml.includes('fn.loading ='));
      assert.ok(indexHtml.includes('fn.promise ='));
      assert.ok(indexHtml.includes('fn.dismiss ='));
      assert.ok(indexHtml.includes('showToast(msg, type = \'info\')'));
    });

    it('2. Implements stacked toast hover expansion so obscured cards expand vertically', () => {
      assert.ok(indexHtml.includes('#sonnerToaster:hover .sonner-toast:nth-last-child(2) {'));
      assert.ok(indexHtml.includes('#sonnerToaster:hover .sonner-toast:nth-last-child(3) {'));
      assert.ok(indexHtml.includes('transform: translateY(-70px) scale(1) !important;'));
      assert.ok(indexHtml.includes('transform: translateY(-140px) scale(1) !important;'));
    });

    it('3. Touch ergonomics: -webkit-tap-highlight-color, 100dvh, and iOS Safari auto-zoom prevention', () => {
      assert.ok(indexHtml.includes('-webkit-tap-highlight-color: transparent;'));
      assert.ok(mobileHtml.includes('-webkit-tap-highlight-color: transparent;'));
      assert.ok(indexHtml.includes('100dvh'));
      assert.ok(mobileHtml.includes('100dvh'));
      assert.ok(indexHtml.includes('overscroll-behavior-y: none;'));
      assert.ok(indexHtml.includes('font-size: 16px; /* Prevents auto-zoom in iOS Safari */'));
      assert.ok(mobileHtml.includes('.sheet-drag-handle'));
    });

    it('4. Implements multi-tier triggerHaptic and AppleDesignPhysics momentum models', () => {
      assert.ok(indexHtml.includes("function triggerHaptic(type = 'default') {"));
      assert.ok(indexHtml.includes("if (type === 'light') {"));
      assert.ok(indexHtml.includes("else if (type === 'boundary') {"));
      assert.ok(indexHtml.includes("else if (type === 'wicket') {"));
      assert.ok(indexHtml.includes('window.AppleDesignPhysics = Object.freeze({'));
      assert.ok(indexHtml.includes('project: (initialVelocity, decelerationRate = 0.998)'));
      assert.ok(indexHtml.includes('rubberband: (offset, dimension, coefficient = 0.55)'));
    });

    it('5. Renders live harmonic match momentum waveform canvas with IntersectionObserver', () => {
      assert.ok(dashboardSrc.includes('id="matchMomentumCanvas"'));
      assert.ok(dashboardSrc.includes('MATCH MOMENTUM WAVE'));
      assert.ok(dashboardSrc.includes('startMomentumWave'));
      assert.ok(dashboardSrc.includes('stopMomentumWave'));
      assert.ok(dashboardSrc.includes('IntersectionObserver'));
    });

    it('6. Implements gyroscopic ball widget, celebratory particle FX, and holo-foil sweep', () => {
      assert.ok(dashboardSrc.includes('ball-gyro-widget'));
      assert.ok(dashboardSrc.includes('ball-gyro-sphere'));
      assert.ok(dashboardSrc.includes('ball-gyro-seam'));
      assert.ok(dashboardSrc.includes('id="cricosCelebrationCanvas"'));
      assert.ok(dashboardSrc.includes('id="kineticBoundaryBanner"'));
      assert.ok(mobileSrc.includes('id="cricosCelebrationCanvas"'));
      assert.ok(mobileSrc.includes('id="kineticBoundaryBanner"'));
      assert.ok(dashboardSrc.includes("window.CricOSMotionFX.triggerCelebration('SIX')"));
      assert.ok(dashboardSrc.includes("window.CricOSMotionFX.triggerCelebration('WICKET'"));
      assert.ok(dashboardSrc.includes('.holo-foil-card'));
      assert.ok(dashboardSrc.includes('@keyframes holoFoilSweep'));
    });

    it('7. Tactile prototyping harness supports 3 divergent variants with Alt+1-3 shortcuts', () => {
      assert.ok(indexHtml.includes('id="btnTactilePrototypeToggle"'));
      assert.ok(indexHtml.includes('id="protoPicker"'));
      assert.ok(indexHtml.includes('window.TACTILE_VARIANTS = TACTILE_VARIANTS;'));
      assert.ok(indexHtml.includes('STADIUM_HAPTIC: {'));
      assert.ok(indexHtml.includes('BROADCAST_MINIMAL: {'));
      assert.ok(indexHtml.includes('ATHLETIC_KINETIC: {'));
      assert.ok(indexHtml.includes("if (e.altKey && e.key === '1') {"));
      assert.ok(indexHtml.includes("if (e.altKey && e.key === '2') {"));
      assert.ok(indexHtml.includes("if (e.altKey && e.key === '3') {"));
    });
  });

  // =========================================================================
  // Suite 3: Three.js WebGL Stadium & Pitch Experience
  // =========================================================================
  describe('Suite 3: Three.js WebGL Stadium & Pitch Experience', () => {
    it('1. Three.js CDN script and resilient initThreeFallback function', () => {
      assert.ok(indexHtml.includes('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'));
      assert.ok(dashboardHtml.includes('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'));
      assert.ok(indexHtml.includes('function initThreeFallback()'));
      assert.ok(indexHtml.includes('window.initThreeFallback = initThreeFallback'));
    });

    it('2. 2D/3D switcher buttons with accessible tooltips and UI fix geometry', () => {
      assert.ok(indexHtml.includes('id="btnWagonMode2D"'));
      assert.ok(indexHtml.includes('id="btnWagonMode3D"'));
      assert.ok(indexHtml.includes('data-tooltip="Switch to 2D Overhead Schematic View"'));
      assert.ok(indexHtml.includes('data-tooltip="Switch to Interactive 3D Stadium Pitch &amp; Shot Trajectories"'));
      assert.ok(dashboardSrc.includes('.wagon-wheel-card.is-3d .field-zone-btn'));
      assert.ok(dashboardSrc.includes('display: none !important;'));
      assert.ok(dashboardSrc.includes('.three-stadium-viewport {'));
      assert.ok(dashboardSrc.includes('height: 440px;'));
      assert.ok(dashboardSrc.includes('border-radius: 14px;'));
    });

    it('3. Sleek docked single-strip camera toolbar and sub toolbar with horizontal scroll', () => {
      assert.ok(dashboardSrc.includes('.three-camera-bar {'));
      assert.ok(dashboardSrc.includes('.three-sub-bar {'));
      assert.ok(dashboardSrc.includes('overflow-x: auto;'));
      assert.ok(dashboardSrc.includes('.three-bar-group {'));
      assert.ok(indexHtml.includes('id="btnCamOrbit"'));
      assert.ok(indexHtml.includes('id="btnCamBatsman"'));
      assert.ok(indexHtml.includes('id="btnCamElevation"'));
      assert.ok(indexHtml.includes('id="btnCamTopDown"'));
      assert.ok(indexHtml.includes('id="btnCamReset"'));
      assert.ok(indexHtml.includes('id="threeJsHudTooltip"'));
    });

    it('4. Headless simulation of CricOS3DInteractionManager and coordinate projection', () => {
      const fakeWindow: any = {
        devicePixelRatio: 1,
        addEventListener: () => {},
        removeEventListener: () => {}
      };
      const scriptCode = `
        ${indexHtml.slice(indexHtml.indexOf('function initThreeFallback()'), indexHtml.indexOf('window.CricOS3DInteractionManager = CricOS3DInteractionManager;'))}
        initThreeFallback();
        return { THREE: window.THREE, CricOS3DInteractionManager, ThreeJsStadiumPitch };
      `;
      const createModule = new Function('window', scriptCode);
      const { THREE, CricOS3DInteractionManager } = createModule(fakeWindow);

      assert.ok(THREE.Raycaster);
      assert.ok(THREE.Vector3);

      const fakeCanvas: any = {
        getBoundingClientRect: () => ({ left: 100, top: 50, width: 300, height: 300 }),
        addEventListener: () => {},
        removeEventListener: () => {},
        style: {}
      };
      const manager = new CricOS3DInteractionManager(
        new THREE.PerspectiveCamera(),
        new THREE.WebGLRenderer({ canvas: fakeCanvas }),
        new THREE.Scene(),
        fakeCanvas,
        { style: {} }
      );

      manager.updateMouse({ clientX: 250, clientY: 200 });
      assert.strictEqual(manager.mouse.x, 0);
      assert.strictEqual(manager.mouse.y, 0);

      const worldPos = new THREE.Vector3(0, 0, 0);
      const screenPos = manager.worldToScreen(worldPos, manager.camera, fakeCanvas);
      assert.strictEqual(screenPos.x, 150);
      assert.strictEqual(screenPos.y, 150);

      let clicked = false;
      const testMesh = new THREE.Mesh();
      manager.addClickable(testMesh, () => { clicked = true; });
      assert.strictEqual(manager.clickables.length, 1);
      manager.selectObject(testMesh, { object: testMesh, point: new THREE.Vector3(0, 0, 0) });
      assert.strictEqual(clicked, true);

      manager.dispose();
    });

    it('5. ThreeJsStadiumPitch constructs 8 wagon slices, CatmullRomCurve3 shot tubes, and Hawkeye pitch zones', () => {
      assert.ok(indexHtml.includes('buildSectorSlices()'));
      assert.ok(indexHtml.includes('THREE.CatmullRomCurve3'));
      assert.ok(indexHtml.includes('THREE.TubeGeometry'));
      assert.ok(indexHtml.includes('buildHawkeyeElements()'));
      assert.ok(indexHtml.includes('renderHawkeyeDeliveries()'));
      assert.ok(indexHtml.includes('Yorker'));
      assert.ok(indexHtml.includes('Good Length'));
      assert.ok(indexHtml.includes('Short Pitch'));
    });

    it('6. Stadium lighting engine supports Day, Dusk, and Night ambient and directional modulation', () => {
      assert.ok(indexHtml.includes('id="btnLightDay"'));
      assert.ok(indexHtml.includes('id="btnLightDusk"'));
      assert.ok(indexHtml.includes('id="btnLightNight"'));
      assert.ok(indexHtml.includes('window.setThreeStadiumLighting = setThreeStadiumLighting'));

      const fakeWindow: any = { devicePixelRatio: 1, addEventListener: () => {}, removeEventListener: () => {} };
      const scriptCode = `
        ${indexHtml.slice(indexHtml.indexOf('function initThreeFallback()'), indexHtml.indexOf('window.CricOS3DInteractionManager = CricOS3DInteractionManager;'))}
        initThreeFallback();
        return { THREE: window.THREE, ThreeJsStadiumPitch };
      `;
      const createModule = new Function('window', scriptCode);
      const { THREE, ThreeJsStadiumPitch } = createModule(fakeWindow);

      const stadium = new ThreeJsStadiumPitch();
      stadium.ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
      stadium.stadiumLights = [new THREE.DirectionalLight(0x00E599, 0.4)];
      stadium.floodlightGroup = new THREE.Group();

      stadium.setStadiumLighting('DAY');
      assert.strictEqual(stadium.currentLighting, 'DAY');
      assert.strictEqual(stadium.ambientLight.intensity, 1.0);

      stadium.setStadiumLighting('NIGHT');
      assert.strictEqual(stadium.currentLighting, 'NIGHT');
      assert.strictEqual(stadium.ambientLight.intensity, 0.45);
    });

    it('7. Interactive 3D Fielders (11 players with catch cones) and DRS LBW review verdict', () => {
      assert.ok(indexHtml.includes('buildFielderPositions()'));
      assert.ok(indexHtml.includes('Mohammed Siraj'));
      assert.ok(indexHtml.includes('KL Rahul'));
      assert.ok(indexHtml.includes('Virat Sharma'));
      assert.ok(indexHtml.includes('buildDrsElements()'));
      assert.ok(indexHtml.includes('showDrsVerdict(curve)'));
      assert.ok(indexHtml.includes('Pitching: IN LINE'));
      assert.ok(indexHtml.includes('Impact: IN LINE'));
      assert.ok(indexHtml.includes('Wickets: HITTING'));
    });

    it('8. Pitch map and wagon wheel fusion mode (Starc 146 km/h -> Kohli 92m SIX)', () => {
      assert.ok(indexHtml.includes('id="btnModeFusion"'));
      assert.ok(indexHtml.includes('buildFusionTrajectory()'));
      assert.ok(indexHtml.includes('Starc (146 km/h) -> Kohli (92m SIX)'));
    });
  });

  // =========================================================================
  // Suite 4: 3D Championship Silverware, Holographic Cards & Gear
  // =========================================================================
  describe('Suite 4: 3D Championship Silverware, Holographic Cards & Gear', () => {
    it('1. 3D Championship Trophy Cabinet constructs Premier Cup, MVP Shield, and Golden Bat', () => {
      assert.ok(indexHtml.includes('id="modal3DTrophyCabinet"'));
      assert.ok(indexHtml.includes('id="threeJsTrophyCanvas"'));
      assert.ok(indexHtml.includes('window.ThreeJsTrophyCabinet = ThreeJsTrophyCabinet'));
      assert.ok(indexHtml.includes('window.open3DTrophyCabinetModal = open3DTrophyCabinetModal'));
      assert.ok(indexHtml.includes('window.switch3DTrophy = switch3DTrophy'));

      const fakeWindow: any = { devicePixelRatio: 1, addEventListener: () => {}, removeEventListener: () => {} };
      const scriptCode = `
        ${indexHtml.slice(indexHtml.indexOf('function initThreeFallback()'), indexHtml.indexOf('window.CricOS3DInteractionManager = CricOS3DInteractionManager;'))}
        initThreeFallback();
        return { THREE: window.THREE, ThreeJsTrophyCabinet };
      `;
      const createModule = new Function('window', scriptCode);
      const { THREE, ThreeJsTrophyCabinet } = createModule(fakeWindow);

      const cabinet = new ThreeJsTrophyCabinet();
      cabinet.scene = new THREE.Scene();
      cabinet.camera = new THREE.PerspectiveCamera();

      cabinet.buildTrophy('PREMIER_CUP');
      assert.strictEqual(cabinet.currentType, 'PREMIER_CUP');
      assert.ok(cabinet.currentTrophyGroup.children.length >= 6);

      cabinet.buildTrophy('MVP_SHIELD');
      assert.strictEqual(cabinet.currentType, 'MVP_SHIELD');

      cabinet.buildTrophy('GOLDEN_BAT');
      assert.strictEqual(cabinet.currentType, 'GOLDEN_BAT');
    });

    it('2. Holographic 3D Player Card inspector adjusts rim and aura to player roles', () => {
      assert.ok(indexHtml.includes('id="modal3DPlayerCard"'));
      assert.ok(indexHtml.includes('id="threeJsPlayerCardCanvas"'));
      assert.ok(indexHtml.includes('window.ThreeJsPlayerCard = ThreeJsPlayerCard'));
      assert.ok(indexHtml.includes('window.open3DPlayerCardModal = open3DPlayerCardModal'));

      const fakeWindow: any = { devicePixelRatio: 1, addEventListener: () => {}, removeEventListener: () => {} };
      const scriptCode = `
        ${indexHtml.slice(indexHtml.indexOf('function initThreeFallback()'), indexHtml.indexOf('window.CricOS3DInteractionManager = CricOS3DInteractionManager;'))}
        initThreeFallback();
        return { THREE: window.THREE, ThreeJsPlayerCard };
      `;
      const createModule = new Function('window', scriptCode);
      const { THREE, ThreeJsPlayerCard } = createModule(fakeWindow);

      const card = new ThreeJsPlayerCard();
      card.scene = new THREE.Scene();
      card.camera = new THREE.PerspectiveCamera();
      card.specLight = new THREE.DirectionalLight();
      card.buildCard();

      card.updatePlayer('Hardik Patel', '#33', 'ALL_ROUNDER', 48.2, 162.4);
      assert.strictEqual(card.cardBorder.material.color.value, 0x00E599);

      card.updatePlayer('Virat Kohli', '#18', 'BATTER', 52.8, 144.2);
      assert.strictEqual(card.cardBorder.material.color.value, 0x00D2FF);

      card.updatePlayer('Jasprit Bumrah', '#93', 'BOWLER', 14.1, 7.15);
      assert.strictEqual(card.cardBorder.material.color.value, 0xFF3366);
    });

    it('3. 3D Cricket Bat & Gear Configurator customizes willow grades and grip colors', () => {
      assert.ok(indexHtml.includes('id="modal3DBatCustomizer"'));
      assert.ok(indexHtml.includes('id="threeJsBatCanvas"'));
      assert.ok(indexHtml.includes('id="batWillowSelect"'));
      assert.ok(indexHtml.includes('window.ThreeJsBatConfigurator = ThreeJsBatConfigurator'));
      assert.ok(indexHtml.includes('window.open3DBatCustomizerModal = open3DBatCustomizerModal'));

      const fakeWindow: any = { devicePixelRatio: 1, addEventListener: () => {}, removeEventListener: () => {} };
      const scriptCode = `
        ${indexHtml.slice(indexHtml.indexOf('function initThreeFallback()'), indexHtml.indexOf('window.CricOS3DInteractionManager = CricOS3DInteractionManager;'))}
        initThreeFallback();
        return { THREE: window.THREE, ThreeJsBatConfigurator };
      `;
      const createModule = new Function('window', scriptCode);
      const { THREE, ThreeJsBatConfigurator } = createModule(fakeWindow);

      const bat = new ThreeJsBatConfigurator();
      bat.scene = new THREE.Scene();
      bat.camera = new THREE.PerspectiveCamera();
      bat.buildBat();

      bat.setWillowGrade('ENGLISH_G1');
      assert.strictEqual(bat.currentWillow, 'ENGLISH_G1');
      assert.strictEqual(bat.bladeMesh.material.color.value, 0xE8C896);

      bat.setWillowGrade('CARBON_HYBRID');
      assert.strictEqual(bat.currentWillow, 'CARBON_HYBRID');
      assert.strictEqual(bat.bladeMesh.material.color.value, 0x27272A);

      bat.setGripColor(0x00D2FF);
      assert.strictEqual(bat.currentGripColor, 0x00D2FF);
      assert.strictEqual(bat.handleGrip.material.color.value, 0x00D2FF);
    });
  });

  // =========================================================================
  // Suite 5: WebGL rAF Lifecycle Management & Resource Conservation
  // =========================================================================
  describe('Suite 5: WebGL rAF Lifecycle Management & Resource Conservation', () => {
    it('1. Implements start, stop, and dispose across all 4 Three.js viewer classes', () => {
      const fakeWindow: any = { devicePixelRatio: 1, addEventListener: () => {}, removeEventListener: () => {} };
      const scriptCode = `
        ${indexHtml.slice(indexHtml.indexOf('function initThreeFallback()'), indexHtml.indexOf('window.CricOS3DInteractionManager = CricOS3DInteractionManager;'))}
        initThreeFallback();
        return {
          ThreeJsStadiumPitch,
          ThreeJsTrophyCabinet,
          ThreeJsPlayerCard,
          ThreeJsBatConfigurator
        };
      `;
      const createModule = new Function('window', scriptCode);
      const {
        ThreeJsStadiumPitch,
        ThreeJsTrophyCabinet,
        ThreeJsPlayerCard,
        ThreeJsBatConfigurator
      } = createModule(fakeWindow);

      const viewers = [
        new ThreeJsStadiumPitch(),
        new ThreeJsTrophyCabinet(),
        new ThreeJsPlayerCard(),
        new ThreeJsBatConfigurator()
      ];

      for (const v of viewers) {
        assert.strictEqual(typeof v.start, 'function');
        assert.strictEqual(typeof v.stop, 'function');
        assert.strictEqual(typeof v.dispose, 'function');
        assert.strictEqual(v.isPaused, false);

        v.stop();
        assert.strictEqual(v.isPaused, true);
        v.dispose();
        assert.strictEqual(v.isPaused, true);
      }
    });

    it('2. closeModal automatically invokes stop3DModalViewer and cancels animation frames', () => {
      assert.ok(indexHtml.includes('window.stop3DModalViewer = stop3DModalViewer'));
      assert.ok(indexHtml.includes('stop3DModalViewer(modalId)'));
      assert.ok(dashboardSrc.includes('function stop3DModalViewer(modalId)'));
      assert.ok(dashboardSrc.includes('cancelAnimationFrame(this.animFrameId)'));
    });

    it('3. Pauses stadium pitch loop when switching away from scoring tab', () => {
      assert.ok(
        indexHtml.includes("if (tabId === 'scoring')") &&
        indexHtml.includes('window.stadiumPitch.start()') &&
        indexHtml.includes('window.stadiumPitch.stop()')
      );
    });

    it('4. Prefers-reduced-motion media query bypasses particle explosions gracefully', () => {
      assert.ok(dashboardSrc.includes("window.matchMedia('(prefers-reduced-motion: reduce)')"));
      assert.ok(mobileSrc.includes("window.matchMedia('(prefers-reduced-motion: reduce)')"));
    });
  });

  // =========================================================================
  // Suite 6: Precision Chart Layout & Anti-Collision Invariants
  // =========================================================================
  describe('Suite 6: Precision Chart Layout & Anti-Collision Invariants', () => {
    it('1. Mobile Worm chart anchors phase labels at bottom baseline away from target line', () => {
      assert.ok(mobileSrc.includes('yBottom - 6'));
      assert.ok(mobileSrc.includes('>POWERPLAY</text>'));
      assert.ok(mobileSrc.includes('>MIDDLE</text>'));
      assert.ok(mobileSrc.includes('>DEATH</text>'));
    });

    it('2. TARGET line has high-contrast pill backdrop and centered "W" text in wicket markers', () => {
      assert.ok(mobileSrc.includes('<rect x="0" y="0" width="56" height="11" rx="3" fill="rgba(4, 7, 13, 0.88)" stroke="#FFB800"'));
      assert.ok(mobileSrc.includes('>W</text>'));
    });

    it('3. Manhattan bars configure maxRuns = 24 with adequate headroom and stacked wickets', () => {
      assert.ok(mobileSrc.includes('var maxRuns = 24;'));
      assert.ok(mobileSrc.includes('viewBox="0 0 360 170"'));
      assert.ok(dashboardSrc.includes('const maxBar = 24;'));
      assert.ok(dashboardSrc.includes('for (let r = 6; r <= maxBar; r += 6)'));
      assert.ok(dashboardSrc.includes('const wy = y - 14 - k * 9;'));
    });

    it('4. Wagon Wheel sector labels and direction labels have pill backdrops and stance repositioning', () => {
      assert.ok(mobileSrc.includes('transform="translate(126, 155)"'));
      assert.ok(mobileSrc.includes('transform="translate(194, 155)"'));
      assert.ok(dashboardSrc.includes('id="mcWagonOffGroup"'));
      assert.ok(dashboardSrc.includes('id="mcWagonLegGroup"'));
      assert.ok(dashboardSrc.includes("offGrp.setAttribute('transform', 'translate(318, 174)');"));
      assert.ok(dashboardSrc.includes("legGrp.setAttribute('transform', 'translate(42, 174)');"));
    });

    it('5. Field zone buttons maintain translateX(-50%) on hover and active states', () => {
      assert.ok(dashboardSrc.includes('.field-zone-btn[data-pos*="top"]:hover,'));
      assert.ok(dashboardSrc.includes('.field-zone-btn[data-pos*="bottom"]:hover'));
      assert.ok(dashboardSrc.includes('transform: translateX(-50%) scale(1.08);'));
    });
  });

  // =========================================================================
  // Suite 7: Visual Regression Verification & Distribution Parity
  // =========================================================================
  describe('Suite 7: Visual Regression Verification & Distribution Parity', () => {
    it('1. test_consolidated_3d_and_packaging.py exists with strict geometry and console error assertions', () => {
      const pyPath = path.join(rootDir, 'tests', 'test_consolidated_3d_and_packaging.py');
      assert.ok(fs.existsSync(pyPath));
      const pyContent = fs.readFileSync(pyPath, 'utf8');
      assert.ok(pyContent.includes('assert_no_critical_errors(page)'));
      assert.ok(pyContent.includes('threeJsStadiumViewport'));
    });

    it('2. High-resolution visual regression screenshots exist in tests/screenshots/', () => {
      assert.ok(fs.existsSync(path.join(screenshotsDir, '3d_stadium_night.png')));
      assert.ok(fs.existsSync(path.join(screenshotsDir, '3d_stadium_swiss.png')));
      assert.ok(fs.existsSync(path.join(screenshotsDir, '3d_stadium_nordic.png')));
    });

    it('3. Swiss Minimalist and Nordic Editorial theme overrides for 3D stadium', () => {
      assert.ok(dashboardSrc.includes('body[data-theme="swiss"] .three-stadium-viewport'));
      assert.ok(dashboardSrc.includes('body[data-theme="swiss"] .three-camera-bar'));
      assert.ok(dashboardSrc.includes('body[data-theme="nordic"] .three-stadium-viewport'));
      assert.ok(dashboardSrc.includes('body[data-theme="nordic"] .three-camera-bar'));
    });

    it('4. Rule 6 Packaging Parity: root index.html and dist/index.html are byte-for-byte identical', () => {
      assert.strictEqual(
        distIndexHtml,
        indexHtml,
        'dist/index.html must be byte-for-byte identical to root index.html'
      );
      assert.strictEqual(
        dashboardHtml,
        indexHtml,
        'getDashboardHtml() output must match index.html byte-for-byte'
      );
      assert.strictEqual(
        distMobileHtml,
        mobileHtml,
        'dist/mobile.html must match getMobileAppHtml()'
      );
    });
  });

  // =========================================================================
  // Suite 8: Offline Android APK 3D Fallback & LHB/RHB Trajectory Physics (62, 63, 67)
  // =========================================================================
  describe('Suite 8: Offline Android APK 3D Fallback & LHB/RHB Trajectory Physics (62, 63, 67)', () => {
    it('1. Self-Contained Offline 2.5D/3D Canvas Fallback Renderer for Android WebView (62)', () => {
      assert.ok(mobileHtml.includes('renderOfflineFallback3DStadium') || mobileHtml.includes('getContext(\'2d\')'), 'Mobile 3D stadium must include guaranteed non-blank 2D/2.5D canvas fallback when WebGL/CDN is unavailable');
      assert.ok(dashboardHtml.includes('renderDesktopFallback3DStadium') || dashboardHtml.includes('threeJsStadiumCanvas'), 'Desktop 3D stadium canvas fallback support must exist');
    });

    it('2. True OFF-SIDE vs ON-SIDE Trajectory & Fielder Mirroring for LHB vs RHB (63, 67)', () => {
      assert.ok(dashboardHtml.includes("currentStance === 'LHB'"), 'Desktop 3D & 2D trajectories must mirror X coordinates when currentStance is LHB');
      assert.ok(mobileHtml.includes("'LHB'") && mobileHtml.includes("'RHB'"), 'Mobile 3D & 2D trajectories must support LHB and RHB mirroring');
    });
  });

  // =========================================================================
  // Suite 9: 8-Preset Tactical Field Planner, Drag-and-Drop & Live Field Commentary
  // =========================================================================
  describe('Suite 9: 8-Preset Tactical Field Planner, Drag-and-Drop & Live Field Commentary', () => {
    it('1. Defines all 8 tactical fielder configurations on both Desktop and Mobile', () => {
      const presets = [
        'POWERPLAY_ATTACK',
        'POWERPLAY_SWING_TRAP',
        'MIDDLE_SPIN_TRAP',
        'BOUNCER_SHORT_TRAP',
        'OFFSIDE_RING_SQUEEZE',
        'DEATH_YORKER_DEFENSE',
        'DEATH_SLOWER_CUTTER',
        'SUPER_OVER_UMBRELLA'
      ];
      for (const preset of presets) {
        assert.ok(dashboardHtml.includes(preset), `Desktop Field Planner must include preset ${preset}`);
        assert.ok(mobileHtml.includes(preset), `Mobile Field Planner must include preset ${preset}`);
      }
    });

    it('2. Implements 360-degree MCC cricket fielding position classifier and interactive drag-and-drop handlers', () => {
      assert.ok(dashboardHtml.includes('window.classifyCricketFieldPosition = classifyCricketFieldPosition'));
      assert.ok(dashboardHtml.includes('window.startFielderDrag = startFielderDrag'));
      assert.ok(dashboardHtml.includes('window.moveFielderToPosition = moveFielderToPosition'));
      assert.ok(mobileHtml.includes('classifyMobileFieldPosition(angleDeg, radiusNorm)'));
      assert.ok(mobileHtml.includes('startMobileFielderDrag(evt, idx)'));
      assert.ok(mobileHtml.includes('moveMobileFielder(idx, angleDeg, radiusNorm)'));
    });

    it('3. Auto-generates live match commentary for field position changes and prepends to scoring feed', () => {
      assert.ok(dashboardHtml.includes('window.emitFieldChangeCommentary = emitFieldChangeCommentary'));
      assert.ok(dashboardHtml.includes('window._fieldChangeCommentaryHistory'));
      assert.ok(dashboardHtml.includes('id="fieldPlannerCommentaryLog"'));
      assert.ok(dashboardHtml.includes('TACTICAL FIELD CHANGE'));
      assert.ok(mobileHtml.includes('emitMobileFieldCommentary(summaryText)'));
      assert.ok(mobileHtml.includes('id="mobileFieldCommentaryLog"'));
    });

    it('4. Renders Broadcast Commentary Studio UI/UX with voice personas, category filters, and telemetry chips', () => {
      assert.ok(dashboardHtml.includes('id="cardLiveCommentaryStudio"'));
      assert.ok(dashboardHtml.includes('id="commentaryVoiceSelect"'));
      assert.ok(dashboardHtml.includes('id="commentaryFilterBar"'));
      assert.ok(dashboardHtml.includes('window.filterLiveCommentary = filterLiveCommentary'));
      assert.ok(dashboardHtml.includes('window.setCommentaryBroadcastVoice = setCommentaryBroadcastVoice'));
      assert.ok(dashboardHtml.includes('window.speakLatestCommentary = speakLatestCommentary'));
      assert.ok(mobileHtml.includes('id="mobileCommentaryStudioRoot"'));
      assert.ok(mobileHtml.includes('id="mobileCommentaryFilterBar"'));
      assert.ok(mobileHtml.includes('id="mobileActiveVoiceIndicator"'));
      assert.ok(mobileHtml.includes("&apos;commentaryVoice&apos;"), 'Settings pane must configure commentaryVoice');
      assert.ok(mobileHtml.includes('setMobileCommentaryVoice(voice)'));
      assert.ok(mobileHtml.includes('setMobileCommentaryFilter(filter)'));
      assert.ok(mobileHtml.includes('speakMobileCommentary()'));
    });
  });
});




