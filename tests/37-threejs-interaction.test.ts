import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDashboardHtml } from '../apps/api/dist/ui/dashboard.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('37. Three.js Interaction & 3D WebGL Stadium Architecture', () => {
  const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
  const distIndexHtml = fs.readFileSync(path.join(rootDir, 'dist/index.html'), 'utf8');
  const dashboardHtml = getDashboardHtml();

  // ---------------------------------------------------------------------------
  // 1. Script CDN & Fallback Polyfill
  // ---------------------------------------------------------------------------
  describe('Three.js Script Tags & Resilient Math Fallback', () => {
    it('includes Three.js CDN script tag in <head>', () => {
      assert.ok(
        indexHtml.includes('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'),
        'Three.js CDN script tag missing in index.html <head>'
      );
      assert.ok(
        dashboardHtml.includes('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'),
        'Three.js CDN script tag missing in getDashboardHtml()'
      );
    });

    it('defines resilient initThreeFallback function supporting offline / Node test execution', () => {
      assert.ok(indexHtml.includes('function initThreeFallback()'), 'initThreeFallback missing in script');
      assert.ok(indexHtml.includes('window.initThreeFallback = initThreeFallback'), 'initThreeFallback not exposed on window');
    });
  });

  // ---------------------------------------------------------------------------
  // 2. DOM Elements, Mode Switching & Tooltips (Rules 5 & 6)
  // ---------------------------------------------------------------------------
  describe('DOM Elements, Mode Switcher & Accessibility Invariants', () => {
    it('renders 2D/3D mode switcher buttons with accessible data-tooltip attributes', () => {
      assert.ok(indexHtml.includes('id="btnWagonMode2D"'), 'btnWagonMode2D missing');
      assert.ok(indexHtml.includes('id="btnWagonMode3D"'), 'btnWagonMode3D missing');
      assert.ok(indexHtml.includes('onclick="setWagonDisplayMode(\'2D\')"'), '2D mode onclick missing');
      assert.ok(indexHtml.includes('onclick="setWagonDisplayMode(\'3D\')"'), '3D mode onclick missing');

      // Rule 5: Accessible tooltips
      assert.ok(indexHtml.includes('data-tooltip="Switch to 2D Overhead Schematic View"'), '2D button tooltip missing');
      assert.ok(indexHtml.includes('data-tooltip="Switch to Interactive 3D Stadium Pitch &amp; Shot Trajectories"'), '3D button tooltip missing');
    });

    it('renders 3D stadium viewport, canvas, and camera control toolbar', () => {
      assert.ok(indexHtml.includes('id="threeJsStadiumViewport"'), 'threeJsStadiumViewport container missing');
      assert.ok(indexHtml.includes('id="threeJsStadiumCanvas"'), 'threeJsStadiumCanvas missing');
      assert.ok(indexHtml.includes('id="threeCameraBar"'), 'threeCameraBar floating toolbar missing');
      assert.ok(indexHtml.includes('id="btnCamOrbit"'), 'btnCamOrbit missing');
      assert.ok(indexHtml.includes('id="btnCamBatsman"'), 'btnCamBatsman missing');
      assert.ok(indexHtml.includes('id="btnCamElevation"'), 'btnCamElevation missing');
      assert.ok(indexHtml.includes('id="btnCamTopDown"'), 'btnCamTopDown missing');
      assert.ok(indexHtml.includes('id="btnCamReset"'), 'btnCamReset missing');
    });

    it('renders floating 3D HUD Tooltip overlay with title and details elements', () => {
      assert.ok(indexHtml.includes('id="threeJsHudTooltip"'), 'threeJsHudTooltip overlay missing');
      assert.ok(indexHtml.includes('id="threeHudTitle"'), 'threeHudTitle missing');
      assert.ok(indexHtml.includes('id="threeHudDetails"'), 'threeHudDetails missing');
    });

    it('renders touch / mouse navigation guidance badge', () => {
      assert.ok(
        indexHtml.includes('class="three-instructions-badge"'),
        'three-instructions-badge missing'
      );
      assert.ok(
        indexHtml.includes('Drag to Orbit'),
        'Instruction text missing'
      );
    });
  });

  // ---------------------------------------------------------------------------
  // 3. CSS Design Tokens & Viewport Styling
  // ---------------------------------------------------------------------------
  describe('CSS Design Tokens & Viewport Aesthetics', () => {
    it('defines styles for 3D stadium viewport with circular clip and turf gradient', () => {
      assert.ok(indexHtml.includes('.three-stadium-viewport {'), 'CSS .three-stadium-viewport missing');
      assert.ok(indexHtml.includes('border-radius: 50%;'), 'Circular stadium clipping missing');
      assert.ok(indexHtml.includes('radial-gradient(circle at 50% 50%, #0E3324 0%, #092418 60%'), 'Turf radial gradient missing');
      assert.ok(indexHtml.includes('border: 2px solid rgba(0, 229, 153, 0.4);'), 'Turf emerald border missing');
    });

    it('defines floating camera bar and button styles', () => {
      assert.ok(indexHtml.includes('.three-camera-bar {'), 'CSS .three-camera-bar missing');
      assert.ok(indexHtml.includes('.three-cam-btn {'), 'CSS .three-cam-btn missing');
      assert.ok(indexHtml.includes('.three-cam-btn.active {'), 'CSS .three-cam-btn.active missing');
    });

    it('defines floating 3D HUD tooltip styling with world-to-screen coordinate positioning', () => {
      assert.ok(indexHtml.includes('.three-hud-tooltip {'), 'CSS .three-hud-tooltip missing');
      assert.ok(indexHtml.includes('transform: translate(-50%, -115%);'), 'HUD anchor offset missing');
      assert.ok(indexHtml.includes('border: 1px solid var(--turf-emerald);'), 'HUD border token missing');
    });
  });

  // ---------------------------------------------------------------------------
  // 4. CricOS3DInteractionManager Unit & Functional Verification
  // ---------------------------------------------------------------------------
  describe('CricOS3DInteractionManager Architecture', () => {
    it('exports CricOS3DInteractionManager on window', () => {
      assert.ok(
        indexHtml.includes('window.CricOS3DInteractionManager = CricOS3DInteractionManager'),
        'CricOS3DInteractionManager export missing on window'
      );
    });

    it('implements complete threejs-interaction skill methods in CricOS3DInteractionManager', () => {
      // Check required methods from SKILL.md
      assert.ok(indexHtml.includes('updateMouse(event)'), 'updateMouse method missing');
      assert.ok(indexHtml.includes('getIntersects()'), 'getIntersects method missing');
      assert.ok(indexHtml.includes('addClickable(object, callback)'), 'addClickable method missing');
      assert.ok(indexHtml.includes('addHoverable(object, onHover, onUnhover)'), 'addHoverable method missing');
      assert.ok(indexHtml.includes('worldToScreen(position, camera, canvas)'), 'worldToScreen method missing');
      assert.ok(indexHtml.includes('onClick(event)'), 'onClick method missing');
      assert.ok(indexHtml.includes('onPointerMove(event)'), 'onPointerMove method missing');
      assert.ok(indexHtml.includes('selectObject(object, hit)'), 'selectObject method missing');
      assert.ok(indexHtml.includes('clearHover()'), 'clearHover method missing');
      assert.ok(indexHtml.includes('setCameraPreset(preset)'), 'setCameraPreset method missing');
      assert.ok(indexHtml.includes('dispose()'), 'dispose method missing');
    });

    it('simulates CricOS3DInteractionManager methods via headless polyfill', () => {
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

      assert.ok(THREE, 'THREE object instantiated');
      assert.ok(THREE.Raycaster, 'THREE.Raycaster class present');
      assert.ok(THREE.Vector2, 'THREE.Vector2 class present');
      assert.ok(THREE.Vector3, 'THREE.Vector3 class present');

      const fakeCanvas: any = {
        getBoundingClientRect: () => ({ left: 100, top: 50, width: 300, height: 300 }),
        addEventListener: () => {},
        removeEventListener: () => {},
        style: {}
      };
      const fakeHud: any = { style: {} };
      const fakeCamera = new THREE.PerspectiveCamera();
      const fakeScene = new THREE.Scene();
      const fakeRenderer = new THREE.WebGLRenderer({ canvas: fakeCanvas });

      const manager = new CricOS3DInteractionManager(
        fakeCamera,
        fakeRenderer,
        fakeScene,
        fakeCanvas,
        fakeHud
      );

      // Test updateMouse conversion
      manager.updateMouse({ clientX: 250, clientY: 200 });
      assert.equal(manager.mouse.x, 0, 'mouse.x should normalize to 0 at horizontal center');
      assert.equal(manager.mouse.y, 0, 'mouse.y should normalize to 0 at vertical center');

      // Test worldToScreen conversion
      const worldPos = new THREE.Vector3(0, 0, 0);
      const screenPos = manager.worldToScreen(worldPos, fakeCamera, fakeCanvas);
      assert.ok(typeof screenPos.x === 'number', 'screenPos.x must be a number');
      assert.ok(typeof screenPos.y === 'number', 'screenPos.y must be a number');
      assert.equal(screenPos.x, 150, 'Center of 300px canvas should project to x=150');
      assert.equal(screenPos.y, 150, 'Center of 300px canvas should project to y=150');

      // Test addClickable and addHoverable
      let clicked = false;
      const testMesh = new THREE.Mesh();
      manager.addClickable(testMesh, () => { clicked = true; });
      assert.equal(manager.clickables.length, 1, 'Clickable mesh should be registered');
      assert.ok(testMesh.userData.onClick, 'onClick callback should be stored on userData');

      manager.addHoverable(testMesh, () => {}, () => {});
      assert.equal(manager.hoverables.length, 1, 'Hoverable mesh should be registered');

      // Test object selection & emissive glow
      manager.selectObject(testMesh, { object: testMesh, point: new THREE.Vector3(0, 0, 0) });
      assert.equal(manager.selectedObject, testMesh, 'selectedObject should match testMesh');
      assert.equal(testMesh.material.emissive.value, 0x00D2FF, 'Selection emissive glow should be cyan');
      assert.equal(clicked, true, 'onClick handler was triggered on selection');

      // Test camera presets
      manager.setCameraPreset('BATSMAN');
      assert.equal(manager.targetSpherical.radius, 20, 'BATSMAN preset radius');
      manager.setCameraPreset('TOP_DOWN');
      assert.equal(manager.targetSpherical.radius, 42, 'TOP_DOWN preset radius');

      // Test disposal
      manager.dispose();
    });
  });

  // ---------------------------------------------------------------------------
  // 5. ThreeJsStadiumPitch & 3D Telemetry Synchronization
  // ---------------------------------------------------------------------------
  describe('ThreeJsStadiumPitch & Shot Trajectory Synchronization', () => {
    it('exports ThreeJsStadiumPitch, setWagonDisplayMode, and camera helpers on window', () => {
      assert.ok(indexHtml.includes('window.ThreeJsStadiumPitch = ThreeJsStadiumPitch'), 'ThreeJsStadiumPitch export missing');
      assert.ok(indexHtml.includes('window.setWagonDisplayMode = setWagonDisplayMode'), 'setWagonDisplayMode export missing');
      assert.ok(indexHtml.includes('window.setThreeCameraPreset = setThreeCameraPreset'), 'setThreeCameraPreset export missing');
      assert.ok(indexHtml.includes('window.resetThreeCamera = resetThreeCamera'), 'resetThreeCamera export missing');
    });

    it('constructs 8 sector slices matching the 8 wagon wheel zones', () => {
      assert.ok(indexHtml.includes('buildSectorSlices()'), 'buildSectorSlices method missing');
      assert.ok(indexHtml.includes('zoneId: z.id'), 'zoneId userData registration missing');
      assert.ok(indexHtml.includes('selectShotZone(z.id)'), 'selectShotZone invocation from 3D sector click missing');
    });

    it('differentiates 3D shot trajectories (Sixes arc vs Boundaries ground tubes)', () => {
      assert.ok(indexHtml.includes('if (shot.isSix)'), 'Six trajectory check missing');
      assert.ok(indexHtml.includes('THREE.CatmullRomCurve3'), 'CatmullRomCurve3 trajectory missing');
      assert.ok(indexHtml.includes('THREE.TubeGeometry'), 'TubeGeometry missing');
      assert.ok(indexHtml.includes('hexColor = shot.isSix ? 0xFFB800 : shot.isBoundary ? 0x00E599'), 'Shot colors missing');
    });

    it('wires selectShotZone and renderWagonWheelRays to synchronize with 3D stadium pitch', () => {
      assert.ok(
        indexHtml.includes('window.stadiumPitch.renderShots()'),
        'renderWagonWheelRays must call window.stadiumPitch.renderShots()'
      );
      assert.ok(
        indexHtml.includes('window.stadiumPitch.highlightZone(zone)'),
        'selectShotZone must call window.stadiumPitch.highlightZone(zone)'
      );
    });
  });

  // ---------------------------------------------------------------------------
  // 6. Distribution Packaging Parity (Rule 6 Invariant)
  // ---------------------------------------------------------------------------
  describe('Rule 6: Production Packaging & Release Parity', () => {
    it('verifies root index.html and dist/index.html are byte-for-byte identical', () => {
      assert.equal(
        indexHtml,
        distIndexHtml,
        'Rule 6 violation: index.html and dist/index.html differ'
      );
    });

    it('verifies getDashboardHtml() produces byte-for-byte identical markup to index.html', () => {
      assert.equal(
        dashboardHtml,
        indexHtml,
        'getDashboardHtml() output must match index.html byte-for-byte'
      );
    });
  });
});
