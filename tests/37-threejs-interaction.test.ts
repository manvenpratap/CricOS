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
  // 6. 3D Web Experience Enhancements (3d-web-experience skill)
  // ---------------------------------------------------------------------------
  describe('3D Web Experience Enhancements & Performance Guardrails', () => {
    it('renders Auto-Cam and Hawkeye mode buttons with accessible tooltips', () => {
      assert.ok(indexHtml.includes('id="btnCamAuto"'), 'btnCamAuto missing');
      assert.ok(indexHtml.includes('onclick="toggleThreeAutoRotate()"'), 'btnCamAuto onclick missing');
      assert.ok(indexHtml.includes('data-tooltip="Toggle 360° Broadcast Auto-Orbit Camera"'), 'btnCamAuto tooltip missing');

      assert.ok(indexHtml.includes('id="btnThreeSubMode"'), 'btnThreeSubMode missing');
      assert.ok(indexHtml.includes('onclick="toggleThreeVisualMode()"'), 'btnThreeSubMode onclick missing');
      assert.ok(indexHtml.includes('data-tooltip="Switch to 3D Hawkeye Ball-Tracking Pitch Map"'), 'btnThreeSubMode tooltip missing');
    });

    it('renders WebGL fallback notice container for graceful degradation', () => {
      assert.ok(indexHtml.includes('id="threeJsFallbackNotice"'), 'threeJsFallbackNotice missing');
      assert.ok(indexHtml.includes('WebGL Acceleration Unavailable'), 'Fallback title missing');
      assert.ok(indexHtml.includes('onclick="setWagonDisplayMode(\'2D\')"'), 'Fallback recovery button onclick missing');
    });

    it('exports toggleThreeAutoRotate and toggleThreeVisualMode globally', () => {
      assert.ok(indexHtml.includes('window.toggleThreeAutoRotate = toggleThreeAutoRotate'), 'toggleThreeAutoRotate missing on window');
      assert.ok(indexHtml.includes('window.toggleThreeVisualMode = toggleThreeVisualMode'), 'toggleThreeVisualMode missing on window');
    });

    it('implements 4 corner floodlight stadium towers', () => {
      assert.ok(indexHtml.includes('buildFloodlights()'), 'buildFloodlights missing');
      assert.ok(indexHtml.includes('x: 14.5, z: 14.5'), 'Tower 1 coordinates missing');
      assert.ok(indexHtml.includes('x: -14.5, z: 14.5'), 'Tower 2 coordinates missing');
      assert.ok(indexHtml.includes('x: 14.5, z: -14.5'), 'Tower 3 coordinates missing');
      assert.ok(indexHtml.includes('x: -14.5, z: -14.5'), 'Tower 4 coordinates missing');
    });

    it('implements Hawkeye 4 pitch length zones and delivery trajectory tracking', () => {
      assert.ok(indexHtml.includes('buildHawkeyeElements()'), 'buildHawkeyeElements missing');
      assert.ok(indexHtml.includes('renderHawkeyeDeliveries()'), 'renderHawkeyeDeliveries missing');
      assert.ok(indexHtml.includes('Yorker'), 'Yorker zone definition missing');
      assert.ok(indexHtml.includes('Good Length'), 'Good Length zone definition missing');
      assert.ok(indexHtml.includes('Short Pitch'), 'Short Pitch zone definition missing');
      assert.ok(indexHtml.includes('Full / Driving'), 'Full / Driving zone definition missing');
    });

    it('implements animated 3D ball tracer with impact ring flash', () => {
      assert.ok(indexHtml.includes('playBallAnimation(curve, color)'), 'playBallAnimation missing');
      assert.ok(indexHtml.includes('this.activeBallTracer'), 'activeBallTracer missing');
      assert.ok(indexHtml.includes('this.impactRingMesh'), 'impactRingMesh missing');
      assert.ok(indexHtml.includes('this.ballTracerProgress'), 'ballTracerProgress missing');
    });

    it('implements mobile-aware DPR clamping and WebGL capability check', () => {
      assert.ok(indexHtml.includes('checkWebGLSupport()'), 'checkWebGLSupport missing');
      assert.ok(indexHtml.includes('const isMobile = /iPhone|iPad|iPod|Android/i.test'), 'Mobile UA check missing');
      assert.ok(indexHtml.includes('const dpr = isMobile ? 1 : Math.min'), 'DPR clamping missing');
    });

    it('simulates auto-rotate and Hawkeye visual mode toggle via headless polyfill', () => {
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
      const { THREE, CricOS3DInteractionManager, ThreeJsStadiumPitch } = createModule(fakeWindow);

      const fakeCanvas: any = {
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 360, height: 360 }),
        addEventListener: () => {},
        removeEventListener: () => {},
        style: {}
      };
      const fakeCamera = new THREE.PerspectiveCamera();
      const fakeScene = new THREE.Scene();
      const fakeRenderer = new THREE.WebGLRenderer({ canvas: fakeCanvas });

      const manager = new CricOS3DInteractionManager(
        fakeCamera,
        fakeRenderer,
        fakeScene,
        fakeCanvas,
        null
      );

      // Verify toggleAutoRotate
      assert.equal(manager.autoRotate, false, 'Auto-rotate starts disabled');
      const res = manager.toggleAutoRotate();
      assert.equal(res, true, 'toggleAutoRotate returns true when enabled');
      assert.equal(manager.autoRotate, true, 'manager.autoRotate is true');

      const initialTheta = manager.targetSpherical.theta;
      manager.updateControls();
      assert.ok(manager.targetSpherical.theta > initialTheta, 'targetSpherical.theta incremented by autoRotateSpeed');

      // Test stadium pitch construction and visual mode toggle
      const stadium = new ThreeJsStadiumPitch();
      stadium.canvas = fakeCanvas;
      stadium.scene = fakeScene;
      stadium.camera = fakeCamera;
      stadium.renderer = fakeRenderer;
      stadium.interactionManager = manager;
      stadium.shotGroup = new THREE.Group();
      stadium.hawkeyeGroup = new THREE.Group();

      assert.equal(stadium.visualMode, 'WAGON', 'Default visual mode is WAGON');
      const nextMode = stadium.toggleVisualMode();
      assert.equal(nextMode, 'HAWKEYE', 'toggleVisualMode switches to HAWKEYE');
      assert.equal(stadium.shotGroup.visible, false, 'shotGroup hidden in HAWKEYE mode');
      assert.equal(stadium.hawkeyeGroup.visible, true, 'hawkeyeGroup visible in HAWKEYE mode');

      const backMode = stadium.toggleVisualMode();
      assert.equal(backMode, 'WAGON', 'toggleVisualMode switches back to WAGON');
      assert.equal(stadium.shotGroup.visible, true, 'shotGroup visible in WAGON mode');
      assert.equal(stadium.hawkeyeGroup.visible, false, 'hawkeyeGroup hidden in WAGON mode');
    });
  });

  // ---------------------------------------------------------------------------
  // 7. Virtual Stadium Seat POVs & Camera Control Matrix
  // ---------------------------------------------------------------------------
  describe('Virtual Stadium Seat POVs & Camera Presets', () => {
    it('renders Grandstand, Pavilion, and Umpire POV buttons with accessible tooltips', () => {
      assert.ok(indexHtml.includes('id="btnCamGrandstand"'), 'btnCamGrandstand missing');
      assert.ok(indexHtml.includes('onclick="setThreeCameraPreset(\'GRANDSTAND\')"'), 'btnCamGrandstand onclick missing');
      assert.ok(indexHtml.includes('data-tooltip="Upper Grandstand Fan Seat POV"'), 'btnCamGrandstand tooltip missing');

      assert.ok(indexHtml.includes('id="btnCamPavilion"'), 'btnCamPavilion missing');
      assert.ok(indexHtml.includes('onclick="setThreeCameraPreset(\'PAVILION\')"'), 'btnCamPavilion onclick missing');
      assert.ok(indexHtml.includes('data-tooltip="Long-On Members Pavilion POV"'), 'btnCamPavilion tooltip missing');

      assert.ok(indexHtml.includes('id="btnCamUmpire"'), 'btnCamUmpire missing');
      assert.ok(indexHtml.includes('onclick="setThreeCameraPreset(\'UMPIRE\')"'), 'btnCamUmpire onclick missing');
      assert.ok(indexHtml.includes('data-tooltip="Bowler\'s End Match Umpire POV"'), 'btnCamUmpire tooltip missing');
    });

    it('implements seat POV target spherical coordinates in CricOS3DInteractionManager', () => {
      const fakeWindow: any = { devicePixelRatio: 1, addEventListener: () => {}, removeEventListener: () => {} };
      const scriptCode = `
        ${indexHtml.slice(indexHtml.indexOf('function initThreeFallback()'), indexHtml.indexOf('window.CricOS3DInteractionManager = CricOS3DInteractionManager;'))}
        initThreeFallback();
        return { THREE: window.THREE, CricOS3DInteractionManager };
      `;
      const createModule = new Function('window', scriptCode);
      const { THREE, CricOS3DInteractionManager } = createModule(fakeWindow);

      const fakeCamera = new THREE.PerspectiveCamera();
      const fakeScene = new THREE.Scene();
      const fakeRenderer = new THREE.WebGLRenderer();
      const manager = new CricOS3DInteractionManager(fakeCamera, fakeRenderer, fakeScene, null, null);

      manager.setCameraPreset('GRANDSTAND');
      assert.equal(manager.targetSpherical.radius, 48, 'Grandstand radius should be 48');

      manager.setCameraPreset('PAVILION');
      assert.equal(manager.targetSpherical.radius, 38, 'Pavilion radius should be 38');

      manager.setCameraPreset('UMPIRE');
      assert.equal(manager.targetSpherical.radius, 18, 'Umpire radius should be 18');
    });
  });

  // ---------------------------------------------------------------------------
  // 8. Dynamic Day/Night Stadium Lighting Engine
  // ---------------------------------------------------------------------------
  describe('Dynamic Day/Night Stadium Lighting Engine', () => {
    it('renders Day, Dusk, and Night lighting buttons in the 3D sub-bar', () => {
      assert.ok(indexHtml.includes('id="btnLightDay"'), 'btnLightDay missing');
      assert.ok(indexHtml.includes('id="btnLightDusk"'), 'btnLightDusk missing');
      assert.ok(indexHtml.includes('id="btnLightNight"'), 'btnLightNight missing');
      assert.ok(indexHtml.includes('onclick="setThreeStadiumLighting(\'DAY\')"'), 'btnLightDay onclick missing');
      assert.ok(indexHtml.includes('onclick="setThreeStadiumLighting(\'DUSK\')"'), 'btnLightDusk onclick missing');
      assert.ok(indexHtml.includes('onclick="setThreeStadiumLighting(\'NIGHT\')"'), 'btnLightNight onclick missing');
    });

    it('exports setThreeStadiumLighting on window and modulates scene lights', () => {
      assert.ok(indexHtml.includes('window.setThreeStadiumLighting = setThreeStadiumLighting'), 'setThreeStadiumLighting export missing');

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
      stadium.stadiumLights = [new THREE.DirectionalLight(0x00E599, 0.4), new THREE.DirectionalLight(0x00D2FF, 0.5)];
      stadium.floodlightGroup = new THREE.Group();

      stadium.setStadiumLighting('DAY');
      assert.equal(stadium.currentLighting, 'DAY', 'currentLighting should be DAY');
      assert.equal(stadium.ambientLight.intensity, 1.0, 'Day ambient intensity should be 1.0');

      stadium.setStadiumLighting('DUSK');
      assert.equal(stadium.currentLighting, 'DUSK', 'currentLighting should be DUSK');
      assert.equal(stadium.ambientLight.intensity, 0.6, 'Dusk ambient intensity should be 0.6');

      stadium.setStadiumLighting('NIGHT');
      assert.equal(stadium.currentLighting, 'NIGHT', 'currentLighting should be NIGHT');
      assert.equal(stadium.ambientLight.intensity, 0.45, 'Night ambient intensity should be 0.45');
    });
  });

  // ---------------------------------------------------------------------------
  // 9. Interactive 3D Field Placement Editor
  // ---------------------------------------------------------------------------
  describe('Interactive 3D Field Placement Editor', () => {
    it('renders Fielders mode button in the sub-bar with accessible tooltip', () => {
      assert.ok(indexHtml.includes('id="btnModeFielders"'), 'btnModeFielders missing');
      assert.ok(indexHtml.includes('onclick="setThreeVisualMode(\'FIELD\')"'), 'btnModeFielders onclick missing');
      assert.ok(indexHtml.includes('data-tooltip="11 3D Fielders with Dynamic Catch Cones &amp; Radius"'), 'btnModeFielders tooltip missing');
    });

    it('builds 11 tactical fielders with dynamic catch cones and selection telemetry', () => {
      assert.ok(indexHtml.includes('buildFielderPositions()'), 'buildFielderPositions method missing');
      assert.ok(indexHtml.includes('Mohammed Siraj'), 'Bowler fielder definition missing');
      assert.ok(indexHtml.includes('KL Rahul'), 'Wicketkeeper fielder definition missing');
      assert.ok(indexHtml.includes('Rohit Verma'), 'First slip fielder definition missing');
      assert.ok(indexHtml.includes('Ravindra Singh'), 'Point fielder definition missing');
      assert.ok(indexHtml.includes('Virat Sharma'), 'Cover fielder definition missing');
      assert.ok(indexHtml.includes('Jasprit Bumrah'), 'Long-Off fielder definition missing');

      const fakeWindow: any = { devicePixelRatio: 1, addEventListener: () => {}, removeEventListener: () => {} };
      const scriptCode = `
        ${indexHtml.slice(indexHtml.indexOf('function initThreeFallback()'), indexHtml.indexOf('window.CricOS3DInteractionManager = CricOS3DInteractionManager;'))}
        initThreeFallback();
        return { THREE: window.THREE, ThreeJsStadiumPitch, CricOS3DInteractionManager };
      `;
      const createModule = new Function('window', scriptCode);
      const { THREE, ThreeJsStadiumPitch, CricOS3DInteractionManager } = createModule(fakeWindow);

      const stadium = new ThreeJsStadiumPitch();
      stadium.scene = new THREE.Scene();
      stadium.interactionManager = new CricOS3DInteractionManager(new THREE.PerspectiveCamera(), new THREE.WebGLRenderer(), stadium.scene, null, null);
      stadium.buildFielderPositions();

      assert.ok(stadium.fieldersGroup, 'fieldersGroup created');
      assert.equal(stadium.fieldersGroup.children.length, 11, 'Must contain 11 tactical fielders');

      stadium.setVisualMode('FIELD');
      assert.equal(stadium.fieldersGroup.visible, true, 'fieldersGroup must be visible in FIELD mode');
      assert.equal(stadium.interactionManager.targetSpherical.radius, 42, 'FIELD mode switches to TOP_DOWN camera');
    });
  });

  // ---------------------------------------------------------------------------
  // 10. Procedural LBW & Stumps Tracking (DRS Review)
  // ---------------------------------------------------------------------------
  describe('Procedural LBW & Stumps Tracking (DRS Review)', () => {
    it('renders DRS Review button in the sub-bar with accessible tooltip', () => {
      assert.ok(indexHtml.includes('id="btnModeDrs"'), 'btnModeDrs missing');
      assert.ok(indexHtml.includes('onclick="setThreeVisualMode(\'DRS\')"'), 'btnModeDrs onclick missing');
      assert.ok(indexHtml.includes('data-tooltip="Procedural DRS LBW Ball-Tracking Review &amp; Stumps Collision"'), 'btnModeDrs tooltip missing');
    });

    it('implements 3-stage DRS trajectory, uncertainty cone, and MCC Law 36 verdict', () => {
      assert.ok(indexHtml.includes('buildDrsElements()'), 'buildDrsElements method missing');
      assert.ok(indexHtml.includes('showDrsVerdict(curve)'), 'showDrsVerdict method missing');
      assert.ok(indexHtml.includes('Pitching: IN LINE'), 'DRS pitching in line telemetry missing');
      assert.ok(indexHtml.includes('Impact: IN LINE'), 'DRS impact in line telemetry missing');
      assert.ok(indexHtml.includes('Wickets: HITTING'), 'DRS wickets hitting telemetry missing');

      const fakeWindow: any = { devicePixelRatio: 1, addEventListener: () => {}, removeEventListener: () => {} };
      const scriptCode = `
        ${indexHtml.slice(indexHtml.indexOf('function initThreeFallback()'), indexHtml.indexOf('window.CricOS3DInteractionManager = CricOS3DInteractionManager;'))}
        initThreeFallback();
        return { THREE: window.THREE, ThreeJsStadiumPitch, CricOS3DInteractionManager };
      `;
      const createModule = new Function('window', scriptCode);
      const { THREE, ThreeJsStadiumPitch, CricOS3DInteractionManager } = createModule(fakeWindow);

      const stadium = new ThreeJsStadiumPitch();
      stadium.scene = new THREE.Scene();
      stadium.interactionManager = new CricOS3DInteractionManager(new THREE.PerspectiveCamera(), new THREE.WebGLRenderer(), stadium.scene, null, null);
      stadium.buildDrsElements();

      assert.ok(stadium.drsGroup, 'drsGroup created');
      assert.ok(stadium.drsGroup.children.length >= 6, 'DRS group contains tubes, markers, and uncertainty cone');

      stadium.setVisualMode('DRS');
      assert.equal(stadium.drsGroup.visible, true, 'drsGroup must be visible in DRS mode');
      assert.equal(stadium.interactionManager.targetSpherical.radius, 18, 'DRS mode switches to UMPIRE POV camera');
    });
  });

  // ---------------------------------------------------------------------------
  // 11. Pitch Map & Wagon Wheel Fusion
  // ---------------------------------------------------------------------------
  describe('Pitch Map & Wagon Wheel Fusion Mode', () => {
    it('renders Fusion mode button in the sub-bar with accessible tooltip', () => {
      assert.ok(indexHtml.includes('id="btnModeFusion"'), 'btnModeFusion missing');
      assert.ok(indexHtml.includes('onclick="setThreeVisualMode(\'FUSION\')"'), 'btnModeFusion onclick missing');
      assert.ok(indexHtml.includes('data-tooltip="Simultaneous Pitch Delivery &amp; Shot Boundary Fusion"'), 'btnModeFusion tooltip missing');
    });

    it('builds seamless fusion trajectory connecting pitch delivery into 92m boundary maximum', () => {
      assert.ok(indexHtml.includes('buildFusionTrajectory()'), 'buildFusionTrajectory method missing');
      assert.ok(indexHtml.includes('Starc (146 km/h) -> Kohli (92m SIX)'), 'Fusion telemetry title missing');

      const fakeWindow: any = { devicePixelRatio: 1, addEventListener: () => {}, removeEventListener: () => {} };
      const scriptCode = `
        ${indexHtml.slice(indexHtml.indexOf('function initThreeFallback()'), indexHtml.indexOf('window.CricOS3DInteractionManager = CricOS3DInteractionManager;'))}
        initThreeFallback();
        return { THREE: window.THREE, ThreeJsStadiumPitch, CricOS3DInteractionManager };
      `;
      const createModule = new Function('window', scriptCode);
      const { THREE, ThreeJsStadiumPitch, CricOS3DInteractionManager } = createModule(fakeWindow);

      const stadium = new ThreeJsStadiumPitch();
      stadium.scene = new THREE.Scene();
      stadium.interactionManager = new CricOS3DInteractionManager(new THREE.PerspectiveCamera(), new THREE.WebGLRenderer(), stadium.scene, null, null);
      stadium.buildFusionTrajectory();

      assert.ok(stadium.fusionGroup, 'fusionGroup created');
      assert.ok(stadium.fusionGroup.children.length >= 3, 'Fusion group contains delivery tube, shot tube, and landing marker');

      stadium.setVisualMode('FUSION');
      assert.equal(stadium.fusionGroup.visible, true, 'fusionGroup must be visible in FUSION mode');
      assert.equal(stadium.interactionManager.targetSpherical.radius, 32, 'FUSION mode switches to ELEVATION camera');
    });
  });

  // ---------------------------------------------------------------------------
  // 12. Interactive 3D Championship Trophy Cabinet
  // ---------------------------------------------------------------------------
  describe('Interactive 3D Championship Trophy Cabinet', () => {
    it('renders 3D Trophy Cabinet modal, canvas, and selector buttons with accessible tooltips', () => {
      assert.ok(indexHtml.includes('id="modal3DTrophyCabinet"'), 'modal3DTrophyCabinet missing');
      assert.ok(indexHtml.includes('id="threeJsTrophyCanvas"'), 'threeJsTrophyCanvas missing');
      assert.ok(indexHtml.includes('id="btnTrophyPremier"'), 'btnTrophyPremier missing');
      assert.ok(indexHtml.includes('id="btnTrophyMvp"'), 'btnTrophyMvp missing');
      assert.ok(indexHtml.includes('id="btnTrophyBat"'), 'btnTrophyBat missing');
      assert.ok(indexHtml.includes('id="btnTrophyAutoCam"'), 'btnTrophyAutoCam missing');
    });

    it('exports ThreeJsTrophyCabinet, open3DTrophyCabinetModal, switch3DTrophy globally', () => {
      assert.ok(indexHtml.includes('window.ThreeJsTrophyCabinet = ThreeJsTrophyCabinet'), 'ThreeJsTrophyCabinet export missing');
      assert.ok(indexHtml.includes('window.open3DTrophyCabinetModal = open3DTrophyCabinetModal'), 'open3DTrophyCabinetModal export missing');
      assert.ok(indexHtml.includes('window.switch3DTrophy = switch3DTrophy'), 'switch3DTrophy export missing');
      assert.ok(indexHtml.includes('window.toggle3DTrophyAutoRotate = toggle3DTrophyAutoRotate'), 'toggle3DTrophyAutoRotate export missing');
    });

    it('constructs Premier Cup, MVP Shield, and Golden Bat 3D meshes', () => {
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
      assert.equal(cabinet.currentType, 'PREMIER_CUP', 'Current trophy type is PREMIER_CUP');
      assert.ok(cabinet.currentTrophyGroup.children.length >= 6, 'Premier cup contains base, stem, goblet, rim, and handles');

      cabinet.buildTrophy('MVP_SHIELD');
      assert.equal(cabinet.currentType, 'MVP_SHIELD', 'Current trophy type is MVP_SHIELD');
      assert.ok(cabinet.currentTrophyGroup.children.length >= 3, 'MVP shield contains stand, shield, and star medallion');

      cabinet.buildTrophy('GOLDEN_BAT');
      assert.equal(cabinet.currentType, 'GOLDEN_BAT', 'Current trophy type is GOLDEN_BAT');
      assert.ok(cabinet.currentTrophyGroup.children.length >= 3, 'Golden bat contains stand, blade, and handle');

      assert.equal(cabinet.autoRotate, true, 'Auto-rotate starts enabled');
      const toggled = cabinet.toggleAutoRotate();
      assert.equal(toggled, false, 'Auto-rotate toggles to false');
    });
  });

  // ---------------------------------------------------------------------------
  // 13. Holographic 3D Player Card Inspector
  // ---------------------------------------------------------------------------
  describe('Holographic 3D Player Card Inspector', () => {
    it('renders Holographic Player Card modal, canvas, and switcher buttons with tooltips', () => {
      assert.ok(indexHtml.includes('id="modal3DPlayerCard"'), 'modal3DPlayerCard missing');
      assert.ok(indexHtml.includes('id="threeJsPlayerCardCanvas"'), 'threeJsPlayerCardCanvas missing');
      assert.ok(indexHtml.includes('id="btnCardHardik"'), 'btnCardHardik missing');
      assert.ok(indexHtml.includes('id="btnCardVirat"'), 'btnCardVirat missing');
      assert.ok(indexHtml.includes('id="btnCardJasprit"'), 'btnCardJasprit missing');
    });

    it('exports ThreeJsPlayerCard, open3DPlayerCardModal, switch3DPlayerCard globally', () => {
      assert.ok(indexHtml.includes('window.ThreeJsPlayerCard = ThreeJsPlayerCard'), 'ThreeJsPlayerCard export missing');
      assert.ok(indexHtml.includes('window.open3DPlayerCardModal = open3DPlayerCardModal'), 'open3DPlayerCardModal export missing');
      assert.ok(indexHtml.includes('window.switch3DPlayerCard = switch3DPlayerCard'), 'switch3DPlayerCard export missing');
    });

    it('implements card body, metallic rim, crest, and dynamic role color themes', () => {
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

      assert.ok(card.cardBody, 'Card body mesh created');
      assert.ok(card.cardBorder, 'Card border mesh created');
      assert.ok(card.cardCrest, 'Card crest mesh created');

      // Test role color shift
      card.updatePlayer('Hardik Patel', '#33', 'ALL_ROUNDER', 48.2, 162.4);
      assert.equal(card.cardBorder.material.color.value, 0x00E599, 'ALL_ROUNDER uses Turf Emerald theme');

      card.updatePlayer('Virat Kohli', '#18', 'BATTER', 52.8, 144.2);
      assert.equal(card.cardBorder.material.color.value, 0x00D2FF, 'BATTER uses Cyan theme');

      card.updatePlayer('Jasprit Bumrah', '#93', 'BOWLER', 14.1, 7.15);
      assert.equal(card.cardBorder.material.color.value, 0xFF3366, 'BOWLER uses Rose theme');
    });
  });

  // ---------------------------------------------------------------------------
  // 14. 3D Cricket Bat & Gear Configurator
  // ---------------------------------------------------------------------------
  describe('3D Cricket Bat & Gear Configurator', () => {
    it('renders 3D Bat Customizer modal, canvas, willow select, and grip buttons', () => {
      assert.ok(indexHtml.includes('id="modal3DBatCustomizer"'), 'modal3DBatCustomizer missing');
      assert.ok(indexHtml.includes('id="threeJsBatCanvas"'), 'threeJsBatCanvas missing');
      assert.ok(indexHtml.includes('id="batWillowSelect"'), 'batWillowSelect missing');
      assert.ok(indexHtml.includes('id="btnGripEmerald"'), 'btnGripEmerald missing');
      assert.ok(indexHtml.includes('id="btnGripCyan"'), 'btnGripCyan missing');
      assert.ok(indexHtml.includes('id="btnGripRuby"'), 'btnGripRuby missing');
      assert.ok(indexHtml.includes('id="btnGripMidnight"'), 'btnGripMidnight missing');
    });

    it('exports ThreeJsBatConfigurator, open3DBatCustomizerModal, set3DBatGripColor globally', () => {
      assert.ok(indexHtml.includes('window.ThreeJsBatConfigurator = ThreeJsBatConfigurator'), 'ThreeJsBatConfigurator export missing');
      assert.ok(indexHtml.includes('window.open3DBatCustomizerModal = open3DBatCustomizerModal'), 'open3DBatCustomizerModal export missing');
      assert.ok(indexHtml.includes('window.set3DBatGripColor = set3DBatGripColor'), 'set3DBatGripColor export missing');
      assert.ok(indexHtml.includes('window.update3DBatCustomization = update3DBatCustomization'), 'update3DBatCustomization export missing');
      assert.ok(indexHtml.includes('window.addCustomBatToBasket = addCustomBatToBasket'), 'addCustomBatToBasket export missing');
    });

    it('constructs blade, sweet-spot spine, cane handle, grip rings, and customizes willow/grip', () => {
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

      assert.ok(bat.bladeMesh, 'Bat blade mesh created');
      assert.ok(bat.spineMesh, 'Bat spine mesh created');
      assert.ok(bat.handleGrip, 'Bat cane handle grip created');
      assert.ok(bat.batGroup.children.length >= 8, 'Bat group contains blade, spine, handle, and 5 grip rings');

      // Test willow grade customization
      bat.setWillowGrade('ENGLISH_G1');
      assert.equal(bat.currentWillow, 'ENGLISH_G1', 'Willow grade changed to ENGLISH_G1');
      assert.equal(bat.bladeMesh.material.color.value, 0xE8C896, 'Grade 1 English willow color');

      bat.setWillowGrade('CARBON_HYBRID');
      assert.equal(bat.currentWillow, 'CARBON_HYBRID', 'Willow grade changed to CARBON_HYBRID');
      assert.equal(bat.bladeMesh.material.color.value, 0x27272A, 'Carbon hybrid spine color');

      // Test grip color customization
      bat.setGripColor(0x00D2FF);
      assert.equal(bat.currentGripColor, 0x00D2FF, 'Grip color changed to Cyan');
      assert.equal(bat.handleGrip.material.color.value, 0x00D2FF, 'Handle grip material color updated to Cyan');
    });
  });

  // ---------------------------------------------------------------------------
  // 15. Distribution Packaging Parity (Rule 6 Invariant)
  // ---------------------------------------------------------------------------
  describe('Rule 15: Production Packaging & Release Parity', () => {
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


