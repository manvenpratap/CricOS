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

describe('36. Emil Kowalski 13-Skill Design & Animation Architecture', () => {
  const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
  const distIndexHtml = fs.readFileSync(path.join(rootDir, 'dist/index.html'), 'utf8');
  const mobileHtml = fs.readFileSync(path.join(rootDir, 'dist/mobile.html'), 'utf8');
  const dashboardHtml = getDashboardHtml();
  const mobileGeneratedHtml = getMobileAppHtml();

  // ---------------------------------------------------------------------------
  // Skill 1: animation-vocabulary (Tokens & Physics Constants)
  // ---------------------------------------------------------------------------
  describe('Skill 1: animation-vocabulary (Motion Tokens & Cubic-Beziers)', () => {
    it('defines Emil Kowalski motion tokens in CSS :root', () => {
      assert.ok(indexHtml.includes('--ease-out: cubic-bezier(0.23, 1, 0.32, 1);'), 'CSS --ease-out missing');
      assert.ok(indexHtml.includes('--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);'), 'CSS --ease-in-out missing');
      assert.ok(indexHtml.includes('--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);'), 'CSS --ease-drawer missing');
      assert.ok(indexHtml.includes('--ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.15);'), 'CSS --ease-spring missing');
      assert.ok(indexHtml.includes('--duration-fast: 120ms;'), 'CSS --duration-fast missing');
      assert.ok(indexHtml.includes('--duration-normal: 200ms;'), 'CSS --duration-normal missing');
      assert.ok(indexHtml.includes('--duration-modal: 280ms;'), 'CSS --duration-modal missing');
    });

    it('exposes window.ANIMATION_TOKENS immutable dictionary to client scripts', () => {
      assert.ok(indexHtml.includes('window.ANIMATION_TOKENS = Object.freeze({'), 'window.ANIMATION_TOKENS definition missing');
      assert.ok(indexHtml.includes("easeOut: 'cubic-bezier(0.23, 1, 0.32, 1)'"), 'easeOut token missing in ANIMATION_TOKENS');
      assert.ok(indexHtml.includes("easeDrawer: 'cubic-bezier(0.32, 0.72, 0, 1)'"), 'easeDrawer token missing in ANIMATION_TOKENS');
      assert.ok(indexHtml.includes("easeSpring: 'cubic-bezier(0.175, 0.885, 0.32, 1.15)'"), 'easeSpring token missing in ANIMATION_TOKENS');
      assert.ok(indexHtml.includes('durationFast: 120'), 'durationFast missing in ANIMATION_TOKENS');
      assert.ok(indexHtml.includes('durationNormal: 200'), 'durationNormal missing in ANIMATION_TOKENS');
      assert.ok(indexHtml.includes('durationModal: 280'), 'durationModal missing in ANIMATION_TOKENS');
    });

    it('exposes canonical window.ANIMATION_VOCABULARY reverse lookup and search helper', () => {
      assert.ok(indexHtml.includes('window.ANIMATION_VOCABULARY = Object.freeze({'), 'ANIMATION_VOCABULARY definition missing');
      assert.ok(indexHtml.includes('anticipation:'), 'anticipation term missing');
      assert.ok(indexHtml.includes('damping:'), 'damping term missing');
      assert.ok(indexHtml.includes('stiffness:'), 'stiffness term missing');
      assert.ok(indexHtml.includes('mass:'), 'mass term missing');
      assert.ok(indexHtml.includes('stagger:'), 'stagger term missing');
      assert.ok(indexHtml.includes('momentum:'), 'momentum term missing');
      assert.ok(indexHtml.includes('rubberband:'), 'rubberband term missing');
      assert.ok(indexHtml.includes('holdToConfirm:'), 'holdToConfirm term missing');
      assert.ok(indexHtml.includes('instantSkip:'), 'instantSkip term missing');
      assert.ok(indexHtml.includes('window.lookupAnimationTerm = function(term) {'), 'lookupAnimationTerm helper missing');
    });
  });

  // ---------------------------------------------------------------------------
  // Skills 2 & 5: emil-design-eng & animate (Physics-Based Entrances & Compression)
  // ---------------------------------------------------------------------------
  describe('Skills 2 & 5: emil-design-eng & animate (Scale Invariants & Press Feedback)', () => {
    it('popBall keyframe starts from scale(0.88) and never scale(0)', () => {
      assert.ok(indexHtml.includes('@keyframes popBall {'), '@keyframes popBall missing');
      assert.ok(indexHtml.includes('0% { transform: scale(0.88); opacity: 0; }'), 'popBall must start at scale(0.88)');
      assert.ok(!indexHtml.includes('0% { transform: scale(0);'), 'popBall must NEVER start at scale(0)');
    });

    it('modalPopIn keyframe uses scale(0.95) translateY(8px) with --duration-modal', () => {
      assert.ok(indexHtml.includes('@keyframes modalPopIn {'), '@keyframes modalPopIn missing');
      assert.ok(indexHtml.includes('transform: scale(0.95) translateY(8px);'), 'modalPopIn entrance transform missing');
      assert.ok(indexHtml.includes('animation: modalPopIn var(--duration-modal) var(--ease-out) forwards;'), 'modal-content animation missing');
    });

    it('provides tactile button compression on :active across primary interactive elements', () => {
      assert.ok(indexHtml.includes('.pad-btn:active {'), '.pad-btn:active missing');
      assert.ok(indexHtml.includes('transform: scale(0.97) translateY(1px);'), '.pad-btn:active tactile compression missing');
      assert.ok(indexHtml.includes('.btn:active {'), '.btn:active missing');
      assert.ok(indexHtml.includes('.persona-pill-btn:active {'), '.persona-pill-btn:active missing');
      assert.ok(indexHtml.includes('.tab-btn:active {'), '.tab-btn:active missing');
    });

    it('respects prefers-reduced-motion media query to disable heavy transitions', () => {
      assert.ok(indexHtml.includes('@media (prefers-reduced-motion: reduce)'), 'prefers-reduced-motion query missing');
      assert.ok(indexHtml.includes('animation-duration: 0.01ms !important;'), 'Reduced motion animation duration override missing');
    });

    it('implements Hold-to-Confirm asymmetric timing recipe with clip-path transition', () => {
      assert.ok(indexHtml.includes('.btn-hold-confirm {'), '.btn-hold-confirm class missing');
      assert.ok(indexHtml.includes('.btn-hold-confirm .hold-progress-overlay {'), '.hold-progress-overlay class missing');
      assert.ok(indexHtml.includes('clip-path: inset(0 100% 0 0);'), 'overlay default clip-path missing');
      assert.ok(indexHtml.includes('transition: clip-path 200ms var(--ease-out);'), 'overlay reset transition missing');
      assert.ok(indexHtml.includes('.btn-hold-confirm.holding .hold-progress-overlay {'), '.holding modifier missing');
      assert.ok(indexHtml.includes('clip-path: inset(0 0 0 0);'), 'holding clip-path fill missing');
      assert.ok(indexHtml.includes('transition: clip-path 2s linear;'), 'holding 2s linear commitment transition missing');
      assert.ok(indexHtml.includes('function initHoldToConfirm() {'), 'initHoldToConfirm function missing');
    });

    it('implements blur-masked tab transitions for seamless tab switches', () => {
      assert.ok(indexHtml.includes('.tab-pane.transitioning {'), '.tab-pane.transitioning class missing');
      assert.ok(indexHtml.includes('filter: blur(2px);'), 'transitioning blur filter missing');
      assert.ok(indexHtml.includes("target.classList.add('transitioning');"), 'switchTab must add transitioning class');
    });

    it('implements staggered squad roster item entrances with 25ms delay increments', () => {
      assert.ok(indexHtml.includes('@keyframes rosterItemEnter {'), '@keyframes rosterItemEnter missing');
      assert.ok(indexHtml.includes('.player-roster-row:nth-child(1) { animation-delay: 25ms; }'), 'roster row 1 delay missing');
      assert.ok(indexHtml.includes('.player-roster-row:nth-child(2) { animation-delay: 50ms; }'), 'roster row 2 delay missing');
      assert.ok(indexHtml.includes('.player-roster-row:nth-child(5) { animation-delay: 125ms; }'), 'roster row 5 delay missing');
    });

    it('implements consecutive tooltip hover instant skip with data-instant and dynamic transform-origin', () => {
      assert.ok(indexHtml.includes('.uni-tooltip[data-instant] {'), '.uni-tooltip[data-instant] selector missing');
      assert.ok(indexHtml.includes('transition-duration: 0ms !important;'), 'data-instant zero transition duration missing');
      assert.ok(indexHtml.includes('transform-origin: var(--transform-origin, center bottom);'), 'dynamic transform-origin missing');
      assert.ok(indexHtml.includes("tooltip.setAttribute('data-instant', '');"), 'data-instant attribute toggle missing');
    });
  });

  // ---------------------------------------------------------------------------
  // Skill 3: find-animation-opportunities (Score Pulses & Micro-Interactions)
  // ---------------------------------------------------------------------------
  describe('Skill 3: find-animation-opportunities (Score Pulses & Feed Entrances)', () => {
    it('defines score-digit-pulse and digitPulse keyframe for scoreboard updates', () => {
      assert.ok(indexHtml.includes('@keyframes digitPulse {'), 'digitPulse keyframe missing');
      assert.ok(indexHtml.includes('.score-digit-pulse {'), '.score-digit-pulse class missing');
      assert.ok(indexHtml.includes("runsEl.classList.add('score-digit-pulse');"), 'Score runs element missing pulse trigger');
    });

    it('defines feedItemEnter keyframe for newly prepended commentary feed items', () => {
      assert.ok(indexHtml.includes('@keyframes feedItemEnter {'), 'feedItemEnter keyframe missing');
      assert.ok(indexHtml.includes('.feed-item {'), '.feed-item class missing');
      assert.ok(indexHtml.includes('animation: feedItemEnter var(--duration-normal) var(--ease-out) forwards;'), 'feedItemEnter animation missing on .feed-item');
    });
  });

  // ---------------------------------------------------------------------------
  // Skill 4: review-animations (Zero transition: all & Touch Hover Gating)
  // ---------------------------------------------------------------------------
  describe('Skill 4: review-animations (Compositor-Friendly CSS & Hover Gating)', () => {
    it('contains zero occurrences of transition: all anti-pattern in index.html', () => {
      const match = indexHtml.match(/transition\s*:\s*all\b/gi);
      assert.equal(match, null, 'index.html must have ZERO occurrences of transition: all');
    });

    it('contains zero occurrences of transition: all anti-pattern in mobile view', () => {
      const matchMobile = mobileHtml.match(/transition\s*:\s*all\b/gi);
      assert.equal(matchMobile, null, 'mobile view must have ZERO occurrences of transition: all');
    });

    it('gates hover transformations behind @media (hover: hover) and (pointer: fine)', () => {
      assert.ok(indexHtml.includes('@media (hover: hover) and (pointer: fine) {'), 'Hover media gate missing');
      assert.ok(indexHtml.includes('.ball-bubble:hover {'), '.ball-bubble hover must be gated');
      assert.ok(indexHtml.includes('.tab-btn:hover {'), '.tab-btn hover must be gated');
      assert.ok(indexHtml.includes('.sidebar-nav-item:hover,'), '.sidebar-nav-item hover must be gated');
      assert.ok(indexHtml.includes('.player-roster-row:hover {'), '.player-roster-row hover must be gated');
    });
  });

  // ---------------------------------------------------------------------------
  // Skill 6: ask-sonner (Stacked Notification Engine)
  // ---------------------------------------------------------------------------
  describe('Skill 6: ask-sonner (Stacked Notification Engine & window.toast)', () => {
    it('contains #sonnerToaster container with role="region" and aria-label="Notifications"', () => {
      assert.ok(indexHtml.includes('id="sonnerToaster"'), '#sonnerToaster container must exist in DOM');
      assert.ok(indexHtml.includes('role="region"'), '#sonnerToaster must have role="region"');
      assert.ok(indexHtml.includes('aria-label="Notifications"'), '#sonnerToaster must have aria-label="Notifications"');
    });

    it('defines complete window.toast API supporting all standard Sonner methods', () => {
      assert.ok(indexHtml.includes('window.toast = (function() {'), 'window.toast definition missing');
      assert.ok(indexHtml.includes("fn.success = (msg, opts) => createToast(msg, opts, 'success');"), 'toast.success missing');
      assert.ok(indexHtml.includes("fn.error = (msg, opts) => createToast(msg, opts, 'error');"), 'toast.error missing');
      assert.ok(indexHtml.includes("fn.info = (msg, opts) => createToast(msg, opts, 'info');"), 'toast.info missing');
      assert.ok(indexHtml.includes("fn.loading = (msg, opts) => createToast(msg, Object.assign({}, opts, { duration: Infinity }), 'loading');"), 'toast.loading missing');
      assert.ok(indexHtml.includes('fn.promise = async (promise, { loading, success, error }) => {'), 'toast.promise missing');
      assert.ok(indexHtml.includes('fn.dismiss = dismissToast;'), 'toast.dismiss missing');
    });

    it('supports interactive action buttons and dismissals inside toasts', () => {
      assert.ok(indexHtml.includes('.sonner-action-btn'), '.sonner-action-btn style missing');
      assert.ok(indexHtml.includes('.sonner-close-btn'), '.sonner-close-btn style missing');
      assert.ok(indexHtml.includes("label: 'Undo Delivery',"), 'Undo Delivery action label missing');
      assert.ok(indexHtml.includes('onClick: () => undoLastDelivery()'), 'Undo Delivery onClick handler missing');
    });

    it('preserves backwards compatibility by delegating showToast(msg) to window.toast', () => {
      assert.ok(indexHtml.includes('function showToast(msg, type = \'info\') {'), 'showToast backward-compat function missing');
      assert.ok(indexHtml.includes('window.toast.success(msg);'), 'showToast must forward success to window.toast');
      assert.ok(indexHtml.includes('window.toast.error(msg);'), 'showToast must forward error to window.toast');
      assert.ok(indexHtml.includes('window.toast.info(msg);'), 'showToast must forward info to window.toast');
    });

    it('supports stacked toast hover vertical expansion so stacked cards become legible on hover', () => {
      assert.ok(indexHtml.includes('#sonnerToaster:hover .sonner-toast:nth-last-child(2) {'), 'Sonner toast hover expansion (2nd card) missing');
      assert.ok(indexHtml.includes('#sonnerToaster:hover .sonner-toast:nth-last-child(3) {'), 'Sonner toast hover expansion (3rd card) missing');
      assert.ok(indexHtml.includes('transform: translateY(-70px) scale(1) !important;'), 'Sonner 2nd card hover transform missing');
      assert.ok(indexHtml.includes('transform: translateY(-140px) scale(1) !important;'), 'Sonner 3rd card hover transform missing');
    });
  });

  // ---------------------------------------------------------------------------
  // Skills 7 & 9: mobile-native & animate-expo (Touch Ergonomics & Drawers)
  // ---------------------------------------------------------------------------
  describe('Skills 7 & 9: mobile-native & animate-expo (Touch Ergonomics & Sheet Handles)', () => {
    it('sets -webkit-tap-highlight-color: transparent on html', () => {
      assert.ok(indexHtml.includes('-webkit-tap-highlight-color: transparent;'), '-webkit-tap-highlight-color missing in Web Console');
      assert.ok(mobileHtml.includes('-webkit-tap-highlight-color: transparent;'), '-webkit-tap-highlight-color missing in Mobile View');
    });

    it('includes viewport-fit=cover and removes user-scalable=no in viewport meta', () => {
      assert.ok(indexHtml.includes('viewport-fit=cover'), 'Web Console viewport-fit=cover missing');
      assert.ok(mobileHtml.includes('viewport-fit=cover'), 'Mobile View viewport-fit=cover missing');
      assert.ok(!mobileHtml.includes('user-scalable=no'), 'Mobile View must NOT contain user-scalable=no');
    });

    it('uses 100dvh for modern dynamic viewport height sizing', () => {
      assert.ok(indexHtml.includes('100dvh'), '100dvh missing in Web Console');
      assert.ok(mobileHtml.includes('100dvh'), '100dvh missing in Mobile View');
    });

    it('includes touch-action: manipulation on buttons and overscroll-behavior-y: none on drawers', () => {
      assert.ok(indexHtml.includes('touch-action: manipulation;'), 'touch-action: manipulation missing');
      assert.ok(indexHtml.includes('overscroll-behavior-y: none;'), 'overscroll-behavior-y: none missing on drawers');
    });

    it('enforces font-size: 16px minimum on inputs to prevent iOS Safari auto-zoom', () => {
      assert.ok(indexHtml.includes('font-size: 16px; /* Prevents auto-zoom in iOS Safari */'), 'iOS auto-zoom prevention font-size missing');
    });

    it('renders .sheet-drag-handle for native bottom sheet feel in mobile view', () => {
      assert.ok(mobileHtml.includes('.sheet-drag-handle'), '.sheet-drag-handle missing in Mobile View');
    });

    it('includes theme-color meta tag and disables touch callout and overscroll in mobile view', () => {
      assert.ok(mobileHtml.includes('<meta name="theme-color" content="#04070D">'), 'theme-color meta tag missing in mobile view');
      assert.ok(mobileHtml.includes('overscroll-behavior: none;'), 'overscroll-behavior: none missing in mobile view');
      assert.ok(mobileHtml.includes('-webkit-touch-callout: none;'), '-webkit-touch-callout: none missing in mobile view');
    });
  });

  // ---------------------------------------------------------------------------
  // Skill 8: apple-design (Haptics & Glassmorphism)
  // ---------------------------------------------------------------------------
  describe('Skill 8: apple-design (Haptic Patterns & Glassmorphism)', () => {
    it('implements triggerHaptic with distinct patterns for light, boundary, and wicket', () => {
      assert.ok(indexHtml.includes("function triggerHaptic(type = 'default') {"), 'triggerHaptic definition missing');
      assert.ok(indexHtml.includes("if (type === 'light') {"), 'Light haptic tap condition missing');
      assert.ok(indexHtml.includes("else if (type === 'boundary') {"), 'Boundary haptic condition missing');
      assert.ok(indexHtml.includes("else if (type === 'wicket') {"), 'Wicket haptic condition missing');
      assert.ok(indexHtml.includes('navigator.vibrate(Math.round(15 * mult));'), 'Light vibration missing');
    });

    it('applies backdrop-filter: blur(24px) for premium floodlit glassmorphism', () => {
      assert.ok(indexHtml.includes('backdrop-filter: blur(24px) !important;'), 'backdrop-filter: blur(24px) missing in Web Console');
      assert.ok(indexHtml.includes('-webkit-backdrop-filter: blur(24px) !important;'), '-webkit-backdrop-filter missing in Web Console');
    });

    it('exposes window.AppleDesignPhysics with WWDC 2018 momentum projection and rubberbanding', () => {
      assert.ok(indexHtml.includes('window.AppleDesignPhysics = Object.freeze({'), 'AppleDesignPhysics definition missing');
      assert.ok(indexHtml.includes('project: (initialVelocity, decelerationRate = 0.998)'), 'project momentum formula missing');
      assert.ok(indexHtml.includes('rubberband: (offset, dimension, coefficient = 0.55)'), 'rubberband formula missing');
      assert.ok(indexHtml.includes('springConfig: (mass = 1, stiffness = 100, damping = 10)'), 'springConfig helper missing');
    });
  });

  // ---------------------------------------------------------------------------
  // Skill 10: pick-ui-library (Curated Minimal Architecture)
  // ---------------------------------------------------------------------------
  describe('Skill 10: pick-ui-library (Curated Stack & Minimal Dependencies)', () => {
    it('implements lightweight Sonner and reactive store without heavyweight third-party runtime bloat', () => {
      assert.ok(indexHtml.includes('window.CricOSStore = {'), 'window.CricOSStore missing');
      assert.ok(indexHtml.includes('window.toast = (function() {'), 'window.toast missing');
    });
  });

  // ---------------------------------------------------------------------------
  // Skill 11: prototype (Tactile Prototyping Harness)
  // ---------------------------------------------------------------------------
  describe('Skill 11: prototype (Tactile Prototyping Switcher & 3 Divergent Variants)', () => {
    it('contains #btnTactilePrototypeToggle in top command bar with accessible tooltip', () => {
      assert.ok(indexHtml.includes('id="btnTactilePrototypeToggle"'), '#btnTactilePrototypeToggle button missing');
      assert.ok(indexHtml.includes('id="tactilePrototypeLabel"'), '#tactilePrototypeLabel text span missing');
      assert.ok(indexHtml.includes('onclick="cycleTactileVariant()"'), 'cycleTactileVariant() handler missing');
      assert.ok(indexHtml.includes('data-tooltip="Tactile Prototype: Switch between Stadium, Minimal, and Kinetic variants (Keys Alt+1-3)"'), 'Accessible data-tooltip missing on prototype toggle');
    });

    it('renders canonical floating prototype picker with highlight pill and replay button', () => {
      assert.ok(indexHtml.includes('id="protoPicker"'), '#protoPicker nav missing in DOM');
      assert.ok(indexHtml.includes('id="protoPickerHighlight"'), '#protoPickerHighlight missing in DOM');
      assert.ok(indexHtml.includes('class="proto-picker-highlight"'), '.proto-picker-highlight missing');
      assert.ok(indexHtml.includes('class="proto-picker-item" data-variant="STADIUM_HAPTIC"'), 'STADIUM_HAPTIC picker button missing');
      assert.ok(indexHtml.includes('class="proto-picker-item" data-variant="BROADCAST_MINIMAL"'), 'BROADCAST_MINIMAL picker button missing');
      assert.ok(indexHtml.includes('class="proto-picker-item" data-variant="ATHLETIC_KINETIC"'), 'ATHLETIC_KINETIC picker button missing');
      assert.ok(indexHtml.includes('class="proto-picker-item proto-picker-replay"'), 'proto-picker-replay button missing');
      assert.ok(indexHtml.includes('onclick="replayTactileAnimation()"'), 'replayTactileAnimation handler missing');
      assert.ok(indexHtml.includes('window.replayTactileAnimation = replayTactileAnimation;'), 'replayTactileAnimation window export missing');
      assert.ok(indexHtml.includes('window.updateProtoPickerHighlight = updateProtoPickerHighlight;'), 'updateProtoPickerHighlight window export missing');
    });

    it('exposes window.setScoringTactileVariant and TACTILE_VARIANTS with 3 divergent options', () => {
      assert.ok(indexHtml.includes('window.setScoringTactileVariant = setScoringTactileVariant;'), 'window.setScoringTactileVariant missing');
      assert.ok(indexHtml.includes('window.TACTILE_VARIANTS = TACTILE_VARIANTS;'), 'window.TACTILE_VARIANTS missing');
      assert.ok(indexHtml.includes('STADIUM_HAPTIC: {'), 'STADIUM_HAPTIC variant missing');
      assert.ok(indexHtml.includes('BROADCAST_MINIMAL: {'), 'BROADCAST_MINIMAL variant missing');
      assert.ok(indexHtml.includes('ATHLETIC_KINETIC: {'), 'ATHLETIC_KINETIC variant missing');
    });

    it('attaches Alt+1, Alt+2, Alt+3 keyboard shortcuts to switch tactile variants instantly', () => {
      assert.ok(indexHtml.includes("if (e.altKey && e.key === '1') {"), 'Alt+1 shortcut missing');
      assert.ok(indexHtml.includes("setScoringTactileVariant('STADIUM_HAPTIC');"), 'Alt+1 STADIUM_HAPTIC assignment missing');
      assert.ok(indexHtml.includes("if (e.altKey && e.key === '2') {"), 'Alt+2 shortcut missing');
      assert.ok(indexHtml.includes("setScoringTactileVariant('BROADCAST_MINIMAL');"), 'Alt+2 BROADCAST_MINIMAL assignment missing');
      assert.ok(indexHtml.includes("if (e.altKey && e.key === '3') {"), 'Alt+3 shortcut missing');
      assert.ok(indexHtml.includes("setScoringTactileVariant('ATHLETIC_KINETIC');"), 'Alt+3 ATHLETIC_KINETIC assignment missing');
    });

    it('sets data-tactile-variant on document.body dynamically', () => {
      assert.ok(indexHtml.includes("document.body.setAttribute('data-tactile-variant', variantKey);"), 'data-tactile-variant body sync missing');
      assert.ok(indexHtml.includes('body[data-tactile-variant="BROADCAST_MINIMAL"]'), 'BROADCAST_MINIMAL CSS modifier missing');
      assert.ok(indexHtml.includes('body[data-tactile-variant="ATHLETIC_KINETIC"]'), 'ATHLETIC_KINETIC CSS modifier missing');
    });
  });

  // ---------------------------------------------------------------------------
  // Skill 12: improve-animations (Drawer Slide-Over & Ease Curves)
  // ---------------------------------------------------------------------------
  describe('Skill 12: improve-animations (Slide-Over Drawers & Smooth Deceleration)', () => {
    it('operational slide-over drawers use --ease-drawer cubic bezier', () => {
      assert.ok(indexHtml.includes('animation: drawerSlideIn var(--duration-modal) var(--ease-drawer) forwards;'), 'drawerSlideIn animation curve missing');
      assert.ok(indexHtml.includes('@keyframes drawerSlideIn {'), 'drawerSlideIn keyframe missing');
      assert.ok(indexHtml.includes('transform: translateX(100%);'), 'drawerSlideIn from transform missing');
      assert.ok(indexHtml.includes('transform: translateX(0);'), 'drawerSlideIn to transform missing');
    });
  });

  // ---------------------------------------------------------------------------
  // Skill 13: write-swift (Domain Models & Immutable Result Types)
  // ---------------------------------------------------------------------------
  describe('Skill 13: write-swift (Domain Models & Immutable Result Types)', () => {
    it('exposes frozen window.CricOSDomain with core enums and Result constructors', () => {
      assert.ok(indexHtml.includes('window.CricOSDomain = Object.freeze({'), 'window.CricOSDomain definition missing');
      assert.ok(indexHtml.includes('Roles: Object.freeze({'), 'Roles enum missing in CricOSDomain');
      assert.ok(indexHtml.includes('MatchStatus: Object.freeze({'), 'MatchStatus enum missing in CricOSDomain');
      assert.ok(indexHtml.includes('DismissalKind: Object.freeze({'), 'DismissalKind enum missing in CricOSDomain');
      assert.ok(indexHtml.includes('TactileVariant: Object.freeze({'), 'TactileVariant enum missing in CricOSDomain');
      assert.ok(indexHtml.includes('resultOk: (data) => Object.freeze({'), 'resultOk constructor missing');
      assert.ok(indexHtml.includes('resultErr: (error) => Object.freeze({'), 'resultErr constructor missing');
      assert.ok(indexHtml.includes('map: (fn) => window.CricOSDomain.resultOk(fn(data))'), 'resultOk map method missing');
      assert.ok(indexHtml.includes('match: (branches) => branches.ok(data)'), 'resultOk match method missing');
      assert.ok(indexHtml.includes('copyOnWrite: (source, patch) => Object.freeze(Object.assign({}, source, patch))'), 'copyOnWrite missing');
    });
  });

  // ---------------------------------------------------------------------------
  // Skill 14: fixing-motion-performance (Compositor-Only Transitions & Lifecycle)
  // ---------------------------------------------------------------------------
  describe('Skill 14: fixing-motion-performance (Compositor-Only Transitions & Lifecycle)', () => {
    it('uses GPU-accelerated transform transitions instead of layout-animating left for mobile drawer', () => {
      assert.ok(
        indexHtml.includes('transform: translateX(-100%);'),
        'Mobile drawer must use translateX(-100%) for off-screen positioning'
      );
      assert.ok(
        indexHtml.includes('.app-sidebar.mobile-open {') && indexHtml.includes('transform: translateX(0);'),
        'Mobile drawer open state must use translateX(0)'
      );
      assert.ok(
        indexHtml.includes('transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);'),
        'Mobile drawer transition must animate transform exclusively'
      );
    });

    it('uses GPU-accelerated transform transitions instead of height for athletic-spectrum-bar in mobile', () => {
      assert.ok(
        mobileGeneratedHtml.includes('transform-origin: bottom;'),
        'Athletic spectrum bar must define transform-origin: bottom'
      );
      assert.ok(
        mobileGeneratedHtml.includes('transition: transform 0.25s ease, background-color 0.25s ease;'),
        'Athletic spectrum bar must animate transform and background-color instead of height'
      );
    });

    it('contains zero instances of non-performant transition: all across stylesheets', () => {
      assert.ok(!indexHtml.includes('transition: all'), 'Root index.html must not contain transition: all');
      assert.ok(!mobileGeneratedHtml.includes('transition: all'), 'Mobile view must not contain transition: all');
    });
  });

  // ---------------------------------------------------------------------------
  // Rule 6: Distribution Packaging Parity Invariant
  // ---------------------------------------------------------------------------
  describe('Rule 6: Packaging & Distribution Parity Invariants', () => {
    it('verifies index.html and dist/index.html are byte-for-byte identical', () => {
      assert.equal(
        distIndexHtml,
        indexHtml,
        'Rule 6 violation: dist/index.html must be byte-for-byte identical to root index.html'
      );
    });

    it('verifies getDashboardHtml() produces identical output to root index.html', () => {
      assert.equal(
        dashboardHtml,
        indexHtml,
        'getDashboardHtml() output must match index.html'
      );
    });

    it('verifies dist/mobile.html matches getMobileAppHtml()', () => {
      assert.equal(
        mobileHtml,
        mobileGeneratedHtml,
        'dist/mobile.html must match getMobileAppHtml()'
      );
    });
  });
});
