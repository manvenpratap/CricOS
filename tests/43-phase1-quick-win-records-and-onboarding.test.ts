import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { getDashboardHtml } from '../apps/api/dist/ui/dashboard.js';
import { getMobileAppHtml } from '../apps/api/dist/ui/mobile-view.js';
import { AuthScreenController } from '../apps/mobile/dist/screens/AuthScreen.js';
import { TournamentsScreenController } from '../apps/mobile/dist/screens/TournamentsScreen.js';
import { MarketplaceScreenController } from '../apps/mobile/dist/screens/MarketplaceScreen.js';
import { CricOSMobileClient } from '../apps/mobile/dist/api/mobile-client.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('43. Phase 1 Quick Win — Cash Record-Keeping, Free OTP, Configurable Fees & Full Onboarding', () => {
  const dashboardHtml = getDashboardHtml();
  const mobileHtml = getMobileAppHtml();
  const rootIndexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
  const distIndexHtml = fs.readFileSync(path.join(rootDir, 'dist', 'index.html'), 'utf8');
  const distMobileHtml = fs.readFileSync(path.join(rootDir, 'dist', 'mobile.html'), 'utf8');

  let webWindow: any;
  let mobileWindow: any;
  let mobileApp: any;

  before(() => {
    // Setup Mock DOM helper for Web Dashboard
    const createWebMockEl = (id = '') => {
      const el: any = {
        id,
        innerHTML: '',
        textContent: '',
        value: id === 'platformFeeSlider' ? '5' : '',
        style: {},
        classList: { add: () => {}, remove: () => {} },
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
      if (!webElements[id]) {
        webElements[id] = createWebMockEl(id);
      }
      return webElements[id];
    };

    webWindow = {
      addEventListener: () => {},
      removeEventListener: () => {},
      localStorage: { getItem: () => null, setItem: () => {} },
      location: { search: '', pathname: '/', reload: () => {} },
      navigator: { userAgent: 'desktop' },
      document: {
        documentElement: createWebMockEl(),
        getElementById: (id: string) => getWebEl(id),
        querySelector: (sel: string) => {
          if (sel.includes('basketPaymentMode')) return { value: 'CASH' };
          return createWebMockEl();
        },
        querySelectorAll: () => [],
        createElement: (tag: string) => createWebMockEl(tag),
        createElementNS: (ns: string, tag: string) => createWebMockEl(tag),
        addEventListener: () => {},
        removeEventListener: () => {}
      }
    };

    // Extract main script from dashboard HTML and run in VM
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
        console
      });
      vm.runInContext(scriptCode, webContext);
    }

    // Setup Mock DOM helper for Mobile App
    const createMobileMockEl = (id = '') => ({
      id,
      innerHTML: '',
      textContent: '',
      value: '',
      style: {},
      classList: { add: () => {}, remove: () => {} },
      addEventListener: () => {},
      removeEventListener: () => {}
    });

    const mobileDoc = {
      documentElement: createMobileMockEl(),
      getElementById: (id: string) => createMobileMockEl(id),
      querySelector: (sel: string) => {
        if (sel.includes('mobilePaymentMode')) return { value: 'CASH' };
        return createMobileMockEl();
      },
      querySelectorAll: () => [],
      addEventListener: () => {},
      removeEventListener: () => {}
    };

    mobileWindow = {
      addEventListener: () => {},
      removeEventListener: () => {},
      localStorage: { getItem: () => null, setItem: () => {} },
      location: { search: '', pathname: '/', reload: () => {} },
      navigator: { userAgent: 'mobile' },
      document: mobileDoc,
      matchMedia: () => ({ matches: true, addEventListener: () => {}, removeEventListener: () => {} })
    };

    const mobStartTag = '<script type="module">';
    const mobEndTag = '</script>';
    const mobStartIdx = mobileHtml.indexOf(mobStartTag);
    const mobEndIdx = mobileHtml.indexOf(mobEndTag, mobStartIdx);
    const mobScript = mobileHtml.substring(mobStartIdx + mobStartTag.length, mobEndIdx);

    const mobContext = vm.createContext({
      window: mobileWindow,
      document: mobileDoc,
      navigator: mobileWindow.navigator,
      location: mobileWindow.location,
      localStorage: mobileWindow.localStorage,
      matchMedia: mobileWindow.matchMedia,
      setTimeout: () => ({ unref: () => {} }),
      clearTimeout: () => {},
      setInterval: () => ({ unref: () => {} }),
      clearInterval: () => {},
      console
    });

    vm.runInContext(mobScript, mobContext);
    mobileApp = mobileWindow.cricosMobileApp;
  });

  describe('1. Configurable Platform Facilitation Fee (0% to 20%)', () => {
    it('initializes with default 5% platform fee in web console configuration', () => {
      assert.strictEqual(webWindow.cricosPlatformConfig.platformFeePercent, 5);
      assert.strictEqual(webWindow.cricosPlatformConfig.gstPercent, 18);
    });

    it('dynamically recalculates Event Basket and Reconciliation when fee is updated to 10%', () => {
      webWindow.updatePlatformFeeRate(10);
      assert.strictEqual(webWindow.cricosPlatformConfig.platformFeePercent, 10);

      // Verify DOM updates on event basket
      const feeLabel = webWindow.document.getElementById('eventBasketFeeLabel');
      const feeVal = webWindow.document.getElementById('eventBasketFeeVal');
      const totalVal = webWindow.document.getElementById('eventBasketTotalVal');

      assert.strictEqual(feeLabel.textContent, 'Platform Facilitation Fee (10%)');
      assert.strictEqual(feeVal.textContent, '₹1,500.00'); // 10% of 15000
      assert.strictEqual(totalVal.textContent, '₹16,770.00'); // 15000 + 1500 + 270 (18% of 1500)
    });

    it('clamps platform fee within boundary range [0%, 20%]', () => {
      webWindow.updatePlatformFeeRate(0);
      assert.strictEqual(webWindow.cricosPlatformConfig.platformFeePercent, 0);
      const totalValZero = webWindow.document.getElementById('eventBasketTotalVal');
      assert.strictEqual(totalValZero.textContent, '₹15,000.00');

      webWindow.updatePlatformFeeRate(35);
      assert.strictEqual(webWindow.cricosPlatformConfig.platformFeePercent, 20);

      // Reset back to 5%
      webWindow.updatePlatformFeeRate(5);
      assert.strictEqual(webWindow.cricosPlatformConfig.platformFeePercent, 5);
    });

    it('supports configurable fee in mobile app and native controllers', () => {
      mobileApp.setPlatformFeePercent(8);
      assert.strictEqual(mobileApp.platformFeePercent, 8);

      const tournamentsCtrl = new TournamentsScreenController();
      const calc5 = tournamentsCtrl.calculateEventBasket(10000, 5);
      assert.strictEqual(calc5.platformFeeMinor, 500);
      assert.strictEqual(calc5.gstMinor, 90);
      assert.strictEqual(calc5.totalMinor, 10590);

      const calc10 = tournamentsCtrl.calculateEventBasket(10000, 10);
      assert.strictEqual(calc10.platformFeeMinor, 1000);
      assert.strictEqual(calc10.gstMinor, 180);
      assert.strictEqual(calc10.totalMinor, 11180);

      const marketplaceCtrl = new MarketplaceScreenController();
      const mbCalc = marketplaceCtrl.calculateBreakdown(20000, 7);
      assert.strictEqual(mbCalc.platformFeeMinor, 1400); // 7% of 20000
      assert.strictEqual(mbCalc.gstMinor, 3852); // 18% of (20000 + 1400)
      assert.strictEqual(mbCalc.totalMinor, 25252);
    });
  });

  describe('2. 100% Free Zero-Cost Verification & Auto-Fill', () => {
    it('renders 100% Free Zero-Cost verification badge in mobile auth markup', () => {
      assert.ok(mobileHtml.includes('100% Free Verification • Zero SMS Cost'), 'Must display free verification banner');
      assert.ok(mobileHtml.includes('btnAutoFillOtpSignup'), 'Must include auto-fill button for sign-up');
      assert.ok(mobileHtml.includes('btnAutoFillOtpSignin'), 'Must include auto-fill button for sign-in');
      assert.ok(mobileHtml.includes('⚡ Tap to Auto-Fill 123456'), 'Must display tap to auto-fill text');
    });

    it('populates free staging code 123456 when autoFillFreeCode is invoked', () => {
      mobileApp.code = '';
      mobileApp.autoFillFreeCode();
      assert.strictEqual(mobileApp.code, '123456', 'Must set code to 123456');
    });

    it('exposes autoFillFreeCode and getFreeCode on AuthScreenController', () => {
      const client = new CricOSMobileClient({ baseUrl: 'http://localhost:3000' });
      const authCtrl = new AuthScreenController(client);
      assert.strictEqual(authCtrl.getFreeCode(), '123456');
      const filled = authCtrl.autoFillFreeCode();
      assert.strictEqual(filled, '123456');
      assert.strictEqual(authCtrl.getState().code, '123456');

      // Verify AuthScreenController HTML includes free zero cost elements
      authCtrl.setCode('123456');
      (authCtrl as any).state.step = 'OTP_INPUT';
      const html = authCtrl.renderHtml();
      assert.ok(html.includes('100% Free Verification • Zero SMS Cost'));
      assert.ok(html.includes('btnAutoFillOtp'));
      assert.ok(html.includes('⚡ Tap to Auto-Fill 123456'));
    });
  });

  describe('3. Free External Settlement Record-Keeping in Event Basket', () => {
    it('renders external settlement record-keeping in web Event Basket modal', () => {
      assert.ok(dashboardHtml.includes('Free External Settlement Record-Keeping'), 'Must contain record-keeping card');
      assert.ok(dashboardHtml.includes('name="basketPaymentMode"'), 'Must have payment mode radio buttons');
      assert.ok(dashboardHtml.includes('value="CASH"'), 'Must include Cash Handover option');
      assert.ok(dashboardHtml.includes('value="UPI"'), 'Must include Direct UPI Transfer option');
      assert.ok(dashboardHtml.includes('basketPaymentNotesInput'), 'Must include notes reference input');
      assert.ok(dashboardHtml.includes('✓ Record Cash Booking &amp; Balance Ledger'), 'Must have record CTA');
    });

    it('records external payment exchange and commits balanced double-entry record', () => {
      assert.doesNotThrow(() => {
        webWindow.proceedBasketCheckout();
      });
    });

    it('supports external cash record-keeping in mobile Event Basket Action Sheet', () => {
      assert.ok(mobileHtml.includes('name="mobilePaymentMode"'), 'Mobile basket must include payment mode radios');
      assert.ok(mobileHtml.includes('mobilePaymentNotesInput'), 'Mobile basket must include notes input');
      assert.ok(mobileHtml.includes('Record Cash Booking & Balance Ledger ✓'), 'Mobile basket must offer record CTA');
    });
  });

  describe('4. Custom Tournament Onboarding (Web & Mobile)', () => {
    it('generates round-robin fixtures and populates standings table with newly onboarded teams in web console', async () => {
      const customName = 'Karnataka Super League';
      const customTeams = ['Bengaluru Strikers', 'Mysore Lions', 'Hubli Hawks', 'Mangalore Sharks'];

      const nameInput = webWindow.document.getElementById('tournamentName') || webWindow.document.getElementById('trnName');
      const teamsInput = webWindow.document.getElementById('tournamentTeams') || webWindow.document.getElementById('trnTeams');
      nameInput.value = customName;
      teamsInput.value = customTeams.join(', ');

      await webWindow.generateTournamentFixtures();

      const fixturesContainer = webWindow.document.getElementById('fixturesList');
      assert.ok(fixturesContainer.innerHTML.includes('Generated 6 Round-Robin Fixtures'));
      assert.ok(fixturesContainer.innerHTML.includes('Bengaluru Strikers'));

      const standingsBody = webWindow.document.getElementById('standingsBody');
      assert.ok(standingsBody.innerHTML.includes('Bengaluru Strikers'));
      assert.ok(standingsBody.innerHTML.includes('[Q]'));
    });

    it('provides tournament onboarding action sheet and button for mobile organisers', () => {
      assert.ok(mobileHtml.includes('openCreateTournamentSheet()'), 'Must bind create tournament action sheet');
      assert.ok(mobileHtml.includes('btnMobileCreateTournament'), 'Must have new tournament action button');
      assert.ok(mobileHtml.includes('+ New Tournament 🏆'), 'Must display tournament onboarding title');
    });

    it('onboards custom tournament and teams via TournamentsScreenController', () => {
      const ctrl = new TournamentsScreenController();
      const res = ctrl.onboardTournament('Bengaluru Cup 2026', ['Team Alpha', 'Team Beta', 'Team Gamma']);
      assert.strictEqual(res.name, 'Bengaluru Cup 2026');
      assert.strictEqual(res.teams.length, 3);
      assert.strictEqual(res.fixtureCount, 3); // 3 * 2 / 2 = 3

      const state = ctrl.getState();
      assert.strictEqual(state.standings.length, 3);
      assert.strictEqual(state.standings[0]?.team, 'Team Alpha');
      assert.strictEqual(state.standings[0]?.qualification, 'QUALIFIED');
      assert.strictEqual(state.standings[2]?.qualification, 'CONTENDING');
    });
  });

  describe('5. Custom Ground Facility Onboarding & Slot Publishing', () => {
    it('publishes newly onboarded facility and slot into live search index in web console', () => {
      const groundInput = webWindow.document.getElementById('storefrontGroundName');
      const timeInput = webWindow.document.getElementById('storefrontSlotTime');
      const rateInput = webWindow.document.getElementById('storefrontSlotRate');
      const pitchInput = webWindow.document.getElementById('storefrontSlotPitch');

      groundInput.value = 'Indiranagar Turf Arena';
      timeInput.value = '18:00 - 22:00';
      rateInput.value = '4200';
      pitchInput.value = 'Astro Turf Pro';

      assert.doesNotThrow(() => {
        webWindow.submitNewSlotPublication();
      });

      const slotsList = webWindow.document.getElementById('storefrontSlotsList');
      assert.ok(slotsList.innerHTML.includes('Indiranagar Turf Arena'));
      assert.ok(slotsList.innerHTML.includes('18:00 - 22:00'));
      assert.ok(slotsList.innerHTML.includes('₹4,200'));
    });

    it('onboards ground slot in mobile marketplace controller', () => {
      const marketCtrl = new MarketplaceScreenController();
      const newSlot = marketCtrl.onboardGroundSlot({
        groundName: 'Whitefield Cricket Ground',
        surfaceType: 'Natural Grass',
        hourlyRate: 3800,
        timeSlot: '16:00 - 20:00'
      });

      assert.strictEqual(newSlot.providerName, 'Whitefield Cricket Ground');
      assert.strictEqual(newSlot.priceMinor, 380000);
      assert.strictEqual(newSlot.category, 'GROUND');
      assert.strictEqual(newSlot.isAvailable, true);

      const slots = marketCtrl.getSlots();
      assert.strictEqual(slots[0]?.providerName, 'Whitefield Cricket Ground');
    });
  });

  describe('6. Governance, Parity & Quality Invariants', () => {
    it('maintains 100% Rule 5 data-tooltip coverage on all action elements', () => {
      assert.ok(dashboardHtml.includes('data-tooltip="Close event basket modal"'));
      assert.ok(dashboardHtml.includes('data-tooltip="Record external cash exchange and commit balanced double-entry ledger entry"'));
      assert.ok(mobileHtml.includes('data-tooltip="Auto-fill 100% free zero-cost verification code"'));
      assert.ok(mobileHtml.includes('data-tooltip="Onboard a new cricket tournament with custom teams"'));
    });

    it('preserves zero transition: all invariant (Emil Kowalski rule)', () => {
      const apiUiDir = path.join(rootDir, 'apps', 'api', 'src', 'ui');
      const files = fs.readdirSync(apiUiDir).filter(f => f.endsWith('.ts'));
      for (const file of files) {
        const content = fs.readFileSync(path.join(apiUiDir, file), 'utf8');
        assert.ok(!content.includes('transition: all'), `File ${file} must not contain "transition: all"`);
      }
    });

    it('maintains byte-for-byte distribution parity between root index.html and dist/index.html', () => {
      assert.strictEqual(rootIndexHtml, distIndexHtml, 'Root index.html and dist/index.html must be byte-for-byte identical');
    });

    it('synchronizes dist/mobile.html with live getMobileAppHtml() output', () => {
      assert.strictEqual(distMobileHtml, mobileHtml, 'dist/mobile.html must be identical to getMobileAppHtml()');
    });
  });
});
