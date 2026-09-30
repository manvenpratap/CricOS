/**
 * Domain Test Suite: Commerce, Tournaments, Marketplace & Media Operations
 *
 * Consolidates and unifies:
 * - 24-officials-availability-desk.test.ts
 * - 26-suborders-and-invoicing.test.ts
 * - 28-rfq-and-commerce.test.ts
 * - 29-tournament-ops-and-scheduling.test.ts
 * - 31-sponsorship-auctions-and-p2-p3.test.ts
 * - 43-phase1-quick-win-records-and-onboarding.test.ts (Commerce, Fee & Facility Onboarding)
 * - 44-modular-architecture-officials-and-career-stats.test.ts
 * - 48-visual-media-and-image-upload-engine.test.ts
 */
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import type { FastifyInstance } from 'fastify';

import { buildServer } from '../apps/api/dist/server.js';
import {
  evaluateRfqQuotes,
  calculateDynamicPrice,
  calculateMultiCurrencyConversion
} from '../packages/domain/dist/intelligence.js';
import { createPromotionalSettlementJournalEntry } from '../packages/commercial/dist/ledger.js';
import { OfficialsMarketplaceComponent } from '../apps/web/dist/components/officials-marketplace.js';
import { PlayerCareerComponent } from '../apps/web/dist/components/player-career.js';
import { MarketplaceScreenController } from '../apps/mobile/dist/screens/MarketplaceScreen.js';
import { TournamentsScreenController } from '../apps/mobile/dist/screens/TournamentsScreen.js';
import { ProfileScreenController } from '../apps/mobile/dist/screens/ProfileScreen.js';
import { AuthScreenController } from '../apps/mobile/dist/screens/AuthScreen.js';
import { CricOSMobileClient } from '../apps/mobile/dist/api/mobile-client.js';
import { getDashboardHtml } from '../apps/api/dist/ui/dashboard.js';
import { getMobileAppHtml } from '../apps/api/dist/ui/mobile-view.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function readFile(relPath: string): string {
  return fs.readFileSync(path.resolve(rootDir, relPath), 'utf-8');
}

function assert_no_critical_errors(html: string) {
  assert.ok(!html.includes('undefined is not'), 'No undefined-is-not errors');
  assert.ok(!html.includes('Cannot read prop'), 'No cannot-read-property errors');
}

describe('Domain: Commerce, Tournaments, Marketplace & Media Operations', () => {
  let app: FastifyInstance;
  let authToken: string;
  let createdOrderId: string;
  const eventId = 'evt-test-basket-01';
  const tournamentId = '00000000-0000-0000-0000-000000000010';

  const dashboardHtml = getDashboardHtml();
  const mobileHtml = getMobileAppHtml();
  const rootIndexHtml = readFile('index.html');
  const distIndexHtml = readFile('dist/index.html');
  const distMobileHtml = readFile('dist/mobile.html');

  let webWindow: any;
  let mobileWindow: any;
  let mobileApp: any;

  before(async () => {
    process.env.NODE_ENV = 'test';
    app = buildServer();
    await app.ready();

    // Authenticate and obtain session token
    const authRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/otp/verify',
      payload: { identifier: '+919876543210', code: '123456', role: 'CAPTAIN' }
    });
    const authBody = JSON.parse(authRes.body);
    authToken = authBody.token;

    // Web VM Sandbox Setup
    const createWebMockEl = (id = '') => {
      const el: any = {
        id,
        innerHTML: '',
        textContent: '',
        value: id === 'platformFeeSlider' ? '5' : '',
        style: {},
        classList: {
          classes: new Set<string>(),
          add: (cls: string) => el.classList.classes.add(cls),
          remove: (cls: string) => el.classList.classes.delete(cls),
          contains: (cls: string) => el.classList.classes.has(cls)
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
      localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
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
        createElementNS: (_ns: string, tag: string) => createWebMockEl(tag),
        addEventListener: () => {},
        removeEventListener: () => {}
      },
      fetch: async () => ({
        ok: true,
        json: async () => [
          { id: '1', title: 'Ground 1', category: 'GROUND', base_price_minor: 350000 },
          { id: '2', title: 'Umpire Sundaram', category: 'UMPIRE', base_price_minor: 250000 },
          { id: '3', title: 'Scorer Jayanth', category: 'SCORER', base_price_minor: 150000 }
        ]
      }),
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
        // SSE / external mock error ignored
      }
    }

    // Mobile VM Sandbox Setup
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
      document: mobileDoc,
      navigator: { userAgent: 'mobile' },
      location: { search: '', pathname: '/', reload: () => {} },
      localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
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
        mobileApp = mobileWindow.cricosMobileApp;
      } catch {
        // VM initialization
      }
    }
  });

  after(async () => {
    if (app) await app.close();
  });

  // ---- Suite 1: Officials Accreditation, Availability Desk & Modular Component ----
  describe('Suite 1: Officials Accreditation, Availability Desk & Component', () => {
    it('1. Searches and filters accredited officials by role', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/officials?role=LEAD_UMPIRE'
      });
      assert.equal(res.statusCode, 200);
      const body = JSON.parse(res.body);
      assert.ok(Array.isArray(body.officials));
      assert.ok(body.officials.length > 0);
    });

    it('2. Retrieves official professional profile, fee rate, and accreditation updates', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/officials/off-001'
      });
      assert.equal(res.statusCode, 200);
      const body = JSON.parse(res.body);
      assert.equal(body.id, 'off-001');
      assert.ok(body.match_fee_minor > 0);
      assert.equal(body.verified, true);

      const updateRes = await app.inject({
        method: 'PATCH',
        url: '/api/v1/officials/off-001/profile',
        headers: { authorization: `Bearer ${authToken}` },
        payload: { match_fee_minor: 400000, bio: 'BCCI Level-2 Certified Umpire' }
      });
      assert.equal(updateRes.statusCode, 200);
      assert.equal(JSON.parse(updateRes.body).success, true);
    });

    it('3. Manages weekly availability rules and blackout exceptions', async () => {
      const calRes = await app.inject({
        method: 'GET',
        url: '/api/v1/officials/off-001/calendar'
      });
      assert.equal(calRes.statusCode, 200);
      const calBody = JSON.parse(calRes.body);
      assert.equal(calBody.official_id, 'off-001');

      const rulesRes = await app.inject({
        method: 'PUT',
        url: '/api/v1/officials/off-001/availability/rules',
        headers: { authorization: `Bearer ${authToken}` },
        payload: {
          rules: [
            { day_of_week: 6, start_time: '08:00', end_time: '18:00', active: true },
            { day_of_week: 0, start_time: '08:00', end_time: '18:00', active: true }
          ]
        }
      });
      assert.equal(rulesRes.statusCode, 200);
      assert.equal(JSON.parse(rulesRes.body).rules.length, 2);

      const excRes = await app.inject({
        method: 'POST',
        url: '/api/v1/officials/off-001/availability/exceptions',
        headers: { authorization: `Bearer ${authToken}` },
        payload: { exception_date: '2026-11-15', is_available: false, reason: 'Personal Leave' }
      });
      assert.equal(excRes.statusCode, 200);
      assert.equal(JSON.parse(excRes.body).exception.is_available, false);
    });

    it('4. Handles assignment requests: views, accepts, and declines fixtures', async () => {
      const listRes = await app.inject({
        method: 'GET',
        url: '/api/v1/officials/off-001/requests',
        headers: { authorization: `Bearer ${authToken}` }
      });
      assert.equal(listRes.statusCode, 200);
      const listBody = JSON.parse(listRes.body);
      assert.ok(listBody.requests.length > 0);

      const acceptRes = await app.inject({
        method: 'POST',
        url: '/api/v1/officials/off-001/requests/req-01/accept',
        headers: { authorization: `Bearer ${authToken}` }
      });
      assert.equal(acceptRes.statusCode, 200);
      assert.equal(JSON.parse(acceptRes.body).status, 'ACCEPTED');

      const declineRes = await app.inject({
        method: 'POST',
        url: '/api/v1/officials/off-001/requests/req-02/decline',
        headers: { authorization: `Bearer ${authToken}` },
        payload: { reason: 'Ground too far' }
      });
      assert.equal(declineRes.statusCode, 200);
      assert.equal(JSON.parse(declineRes.body).status, 'DECLINED');
    });

    it('5. OfficialsMarketplaceComponent instantiates, filters, and onboards officials', () => {
      const comp = new OfficialsMarketplaceComponent();
      const officials = comp.getFilteredOfficials();
      assert.ok(officials.length >= 2);
      assert.ok(officials.some(o => o.role === 'UMPIRE' && o.certification === 'BCCI_LEVEL_2'));
      assert.ok(officials.some(o => o.role === 'SCORER' && o.rating >= 4.8));

      comp.setFilter('UMPIRE');
      assert.ok(comp.getFilteredOfficials().every(o => o.role === 'UMPIRE'));

      comp.onboardOfficial({
        id: 'off-new-99',
        name: 'Anil Kumar',
        role: 'UMPIRE',
        certification: 'DISTRICT_ACCREDITED',
        association: 'Bangalore Cricket Association',
        matchesOfficiated: 45,
        rating: 4.88,
        matchRateMinor: 120000,
        hourlyRateMinor: 30000,
        availability: 'AVAILABLE',
        timeSlot: '09:00 - 13:00',
        specialization: 'Junior & Division Leagues',
        badge: 'District Panel'
      });

      comp.setFilter('ALL');
      assert.strictEqual(comp.getFilteredOfficials()[0].id, 'off-new-99');
    });
  });

  // ---- Suite 2: Basket Checkout, Suborders, Invoicing & External Settlement ----
  describe('Suite 2: Basket Checkout, Suborders, Invoicing & Settlement', () => {
    it('1. Basket Checkout: converts event basket into parent order and itemized suborders', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/api/v1/events/${eventId}/basket/checkout`
      });
      assert.equal(res.statusCode, 201);
      const body = JSON.parse(res.body);
      assert.equal(body.success, true);
      assert.equal(body.event_id, eventId);
      assert.ok(body.order_id);
      assert.equal(body.suborders.length, 2);
      assert.ok(body.total_minor > 0);
      createdOrderId = body.order_id;
    });

    it('2. Suborders Breakdown & Cancellation: inspects allocations and suborder cancellation', async () => {
      const res = await app.inject({
        method: 'GET',
        url: `/api/v1/orders/${createdOrderId}/suborders`
      });
      assert.equal(res.statusCode, 200);
      const body = JSON.parse(res.body);
      assert.equal(body.order_id, createdOrderId);
      assert.equal(body.suborders[0].category, 'VENUE');
      assert.equal(body.suborders[1].category, 'OFFICIAL');

      const cancelRes = await app.inject({
        method: 'POST',
        url: `/api/v1/orders/${createdOrderId}/cancel`,
        payload: { reason: 'WEATHER_UNFAVORABLE', suborder_id: 'sub-01' }
      });
      assert.equal(cancelRes.statusCode, 200);
      const cancelBody = JSON.parse(cancelRes.body);
      assert.equal(cancelBody.status, 'CANCELLED');
      assert.equal(cancelBody.refund_eligible, true);
    });

    it('3. Payment Retry & GST Tax Invoicing: delivers compliant receipts and retry secrets', async () => {
      const retryRes = await app.inject({
        method: 'POST',
        url: `/api/v1/payments/pay-failed-01/retry`
      });
      assert.equal(retryRes.statusCode, 200);
      const retryBody = JSON.parse(retryRes.body);
      assert.equal(retryBody.status, 'REQUIRES_CONFIRMATION');
      assert.ok(retryBody.client_secret);

      const invRes = await app.inject({
        method: 'GET',
        url: `/api/v1/invoices/INV-CRIC-2026-0042`
      });
      assert.equal(invRes.statusCode, 200);
      const inv = JSON.parse(invRes.body);
      assert.equal(inv.invoice_number, 'INV-CRIC-2026-0042');
      assert.equal(inv.currency, 'INR');
      assert.equal(inv.total_amount_minor, inv.gross_base_minor + inv.platform_fee_minor + inv.cgst_minor + inv.sgst_minor);
      assert.ok(Array.isArray(inv.items));
    });

    it('4. Free External Settlement Record-Keeping in Event Basket (Web & Mobile)', () => {
      assert.ok(dashboardHtml.includes('Free External Settlement Record-Keeping'));
      assert.ok(dashboardHtml.includes('name="basketPaymentMode"'));
      assert.ok(dashboardHtml.includes('value="CASH"'));
      assert.ok(dashboardHtml.includes('value="UPI"'));
      assert.ok(dashboardHtml.includes('basketPaymentNotesInput'));

      assert.doesNotThrow(() => {
        webWindow.proceedBasketCheckout();
      });

      assert.ok(mobileHtml.includes('name="mobilePaymentMode"'));
      assert.ok(mobileHtml.includes('mobilePaymentNotesInput'));
      assert.ok(mobileHtml.includes('Record Cash Booking & Balance Ledger ✓'));
    });

    it('5. Configurable Platform Facilitation Fee (0% to 20%)', () => {
      assert.strictEqual(webWindow.cricosPlatformConfig.platformFeePercent, 5);
      assert.strictEqual(webWindow.cricosPlatformConfig.gstPercent, 18);

      webWindow.updatePlatformFeeRate(10);
      assert.strictEqual(webWindow.cricosPlatformConfig.platformFeePercent, 10);
      const feeVal = webWindow.document.getElementById('eventBasketFeeVal');
      const totalVal = webWindow.document.getElementById('eventBasketTotalVal');
      assert.strictEqual(feeVal.textContent, '₹1,500.00');
      assert.strictEqual(totalVal.textContent, '₹16,770.00');

      webWindow.updatePlatformFeeRate(0);
      assert.strictEqual(webWindow.cricosPlatformConfig.platformFeePercent, 0);
      webWindow.updatePlatformFeeRate(35);
      assert.strictEqual(webWindow.cricosPlatformConfig.platformFeePercent, 20);
      webWindow.updatePlatformFeeRate(5);
    });
  });

  // ---- Suite 3: RFQ Procurement, Commercial Catalog & Promotional Engine ----
  describe('Suite 3: RFQ Procurement, Commercial Catalog & Promotional Engine', () => {
    it('1. RFQ Lifecycle: creates RFQ, submits quote, ranks via intelligence, and awards quote', async () => {
      const createRes = await app.inject({
        method: 'POST',
        url: '/api/v1/procurement/rfq',
        payload: {
          category: 'UMPIRE',
          title: 'Semifinal Match Lead Umpire',
          description: 'Need certified umpire for high-stakes 20-over semifinal.',
          budget_minor: 350000,
          currency: 'INR'
        }
      });
      assert.equal(createRes.statusCode, 201);
      const rfq = JSON.parse(createRes.payload);

      const listRes = await app.inject({
        method: 'GET',
        url: '/api/v1/procurement/rfq?category=UMPIRE'
      });
      assert.equal(listRes.statusCode, 200);
      assert.ok(JSON.parse(listRes.payload).some((r: any) => r.id === rfq.id));

      const quoteRes = await app.inject({
        method: 'POST',
        url: '/api/v1/procurement/quotes',
        payload: {
          rfq_id: rfq.id,
          provider_id: '00000000-0000-0000-0000-000000000002',
          provider_name: 'BCCI Level 1 Umpire',
          provider_trust_rating: 96,
          quote_price_minor: 300000,
          notes: 'Available for both innings'
        }
      });
      assert.equal(quoteRes.statusCode, 201);
      const quote = JSON.parse(quoteRes.payload);

      const quotesListRes = await app.inject({
        method: 'GET',
        url: `/api/v1/procurement/rfq/${rfq.id}/quotes`
      });
      assert.equal(quotesListRes.statusCode, 200);
      const ranked = JSON.parse(quotesListRes.payload);
      assert.ok(ranked.quotes.length > 0);
      assert.ok(ranked.quotes[0].total_score >= 75);

      const acceptRes = await app.inject({
        method: 'POST',
        url: `/api/v1/procurement/quotes/${quote.id}/accept`
      });
      assert.equal(acceptRes.statusCode, 200);
      const awarded = JSON.parse(acceptRes.payload);
      assert.equal(awarded.status, 'ACCEPTED');
      assert.equal(awarded.escrow_locked, true);
    });

    it('2. Evaluates RFQ quotes algorithmically via domain intelligence', () => {
      const budgetMinor = 350000;
      const quotes = [
        { id: 'q1', quote_price_minor: 300000, provider_trust_rating: 96 },
        { id: 'q2', quote_price_minor: 400000, provider_trust_rating: 90 }
      ];
      const ranked = evaluateRfqQuotes(budgetMinor, quotes);
      assert.ok(ranked.length === 2);
      assert.strictEqual(ranked[0].id, 'q1');
      assert.ok(ranked[0].total_score > ranked[1].total_score);
    });

    it('3. Physical Commerce & Provider Listings: queries products, adds kits, and lists grounds/scorers', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/v1/marketplace/products' });
      assert.equal(res.statusCode, 200);
      const products = JSON.parse(res.payload);
      assert.ok(products.some((p: any) => p.category === 'BALLS'));

      const addRes = await app.inject({
        method: 'POST',
        url: '/api/v1/marketplace/products',
        payload: {
          provider_id: '00000000-0000-0000-0000-000000000001',
          title: 'Team Playing Kit (15 Jerseys)',
          description: 'Sublimation dry-fit cricket jerseys with team crest.',
          category: 'KITS',
          price_minor: 1200000,
          currency: 'INR'
        }
      });
      assert.equal(addRes.statusCode, 201);
      assert.equal(JSON.parse(addRes.payload).category, 'KITS');

      const scorerRes = await app.inject({ method: 'GET', url: '/api/v1/marketplace/scorers' });
      assert.equal(scorerRes.statusCode, 200);
      const groundRes = await app.inject({ method: 'GET', url: '/api/v1/marketplace/grounds/facilities' });
      assert.equal(groundRes.statusCode, 200);
      assert.ok(JSON.parse(groundRes.payload)[0].pitch_types.includes('NATURAL_TURF'));
    });

    it('4. Promotional Engine: validates coupons and commits balanced promotional settlement ledger', async () => {
      const validRes = await app.inject({
        method: 'POST',
        url: '/api/v1/checkout/coupons/validate',
        payload: { code: 'CRIC20', basket_value_minor: 200000 }
      });
      assert.equal(validRes.statusCode, 200);
      const validData = JSON.parse(validRes.payload);
      assert.equal(validData.valid, true);
      assert.equal(validData.discount_minor, 40000);
      assert.equal(validData.final_amount_minor, 160000);

      const invalidRes = await app.inject({
        method: 'POST',
        url: '/api/v1/checkout/coupons/validate',
        payload: { code: 'INVALID_CODE', basket_value_minor: 200000 }
      });
      assert.equal(invalidRes.statusCode, 404);

      const promoEntry = createPromotionalSettlementJournalEntry({
        orderId: 'ord-promo-001',
        totalPaidByCustomerMinor: 160000,
        discountSubsidyMinor: 40000,
        platformFeeMinor: 16949,
        taxMinor: 3051,
        providerPayoutMinor: 180000
      });
      assert.ok(promoEntry.id);
      assert.equal(promoEntry.lines.length, 5);
    });
  });

  // ---- Suite 4: Tournament Operations, Scheduling & Onboarding ----
  describe('Suite 4: Tournament Operations, Scheduling & Onboarding', () => {
    it('1. Bulk Fixture Import: validates, detects conflicts, and schedules round-robin fixtures', async () => {
      const importRes = await app.inject({
        method: 'POST',
        url: `/api/v1/tournaments/${tournamentId}/fixtures/bulk-import`,
        payload: {
          fixtures: [
            { round: 1, team_a: 'Northside XI', team_b: 'Riverside XI', date: '2026-10-01', time_slot: '09:00' },
            { round: 1, team_a: 'Eastern Knights', team_b: 'Southern Stars', date: '2026-10-01', time_slot: '14:00' },
            { round: 2, team_a: 'Northside XI', team_b: 'Northside XI', date: '2026-10-02', time_slot: '09:00' }
          ]
        }
      });
      assert.equal(importRes.statusCode, 201);
      const data = JSON.parse(importRes.payload);
      assert.equal(data.imported_count, 3);
      assert.equal(data.fixtures[0].conflicts.length, 0);
      assert.equal(data.fixtures[0].readiness_percentage, 100);
      assert.ok(data.fixtures[2].conflicts.length > 0);
      assert.equal(data.fixtures[2].readiness_percentage, 50);
    });

    it('2. Fixture Board: retrieves schedule with conflict count and readiness index', async () => {
      const boardRes = await app.inject({
        method: 'GET',
        url: `/api/v1/tournaments/${tournamentId}/fixture-board`
      });
      assert.equal(boardRes.statusCode, 200);
      const board = JSON.parse(boardRes.payload);
      assert.equal(board.tournament_id, tournamentId);
      assert.equal(board.total_fixtures, 3);
      assert.equal(board.conflicts_count, 1);
      assert.ok(board.overall_readiness_percentage >= 80);
    });

    it('3. Custom Tournament Onboarding (Web & Mobile Controllers)', async () => {
      const nameInput = webWindow.document.getElementById('tournamentName') || webWindow.document.getElementById('trnName');
      const teamsInput = webWindow.document.getElementById('tournamentTeams') || webWindow.document.getElementById('trnTeams');
      nameInput.value = 'Karnataka Super League';
      teamsInput.value = 'Bengaluru Strikers, Mysore Lions, Hubli Hawks, Mangalore Sharks';

      await webWindow.generateTournamentFixtures();
      const fixturesContainer = webWindow.document.getElementById('fixturesList');
      assert.ok(fixturesContainer.innerHTML.includes('Generated 6 Round-Robin Fixtures'));
      assert.ok(fixturesContainer.innerHTML.includes('Bengaluru Strikers'));

      const ctrl = new TournamentsScreenController();
      const res = ctrl.onboardTournament('Bengaluru Cup 2026', ['Team Alpha', 'Team Beta', 'Team Gamma']);
      assert.strictEqual(res.name, 'Bengaluru Cup 2026');
      assert.strictEqual(res.teams.length, 3);
      assert.strictEqual(res.fixtureCount, 3);
      assert.strictEqual(ctrl.getState().standings[0]?.qualification, 'QUALIFIED');
    });

    it('4. 100% Free Zero-Cost Verification & Auto-Fill in AuthScreenController', () => {
      assert.ok(mobileHtml.includes('100% Free Verification • Zero SMS Cost'));
      assert.ok(mobileHtml.includes('⚡ Tap to Auto-Fill 123456'));

      const client = new CricOSMobileClient({ baseUrl: 'http://localhost:3000' });
      const authCtrl = new AuthScreenController(client);
      assert.strictEqual(authCtrl.getFreeCode(), '123456');
      assert.strictEqual(authCtrl.autoFillFreeCode(), '123456');
      assert.strictEqual(authCtrl.getState().code, '123456');
    });
  });

  // ---- Suite 5: Sponsorship, Auctions, Weather Insurance & Dynamic Pricing ----
  describe('Suite 5: Sponsorship, Auctions, Weather Insurance & Dynamic Pricing', () => {
    it('1. Sponsorship Inventory & Pledges: records pledge and posts balanced double-entry journal', async () => {
      const listRes = await app.inject({
        method: 'GET',
        url: `/api/v1/sponsorship/tournaments/${tournamentId}`
      });
      assert.equal(listRes.statusCode, 200);
      assert.ok(JSON.parse(listRes.payload).length >= 2);

      const pledgeRes = await app.inject({
        method: 'POST',
        url: '/api/v1/sponsorship/pledge',
        payload: {
          tournament_id: tournamentId,
          tier: 'PLAYER_OF_MATCH',
          sponsor_name: 'CEAT Tyres',
          pledge_amount_minor: 5000000,
          currency: 'INR'
        }
      });
      assert.equal(pledgeRes.statusCode, 201);
      const pledgeData = JSON.parse(pledgeRes.payload);
      assert.equal(pledgeData.pledge.sponsor_name, 'CEAT Tyres');
      assert.equal(pledgeData.journal_entry.lines.length, 2);
    });

    it('2. Virtual Player Auction Bidding Engine: evaluates bids and enforces purse reserves', async () => {
      const bidRes = await app.inject({
        method: 'POST',
        url: '/api/v1/auctions/bid',
        payload: {
          auction_id: 'auc-001',
          team_id: 'team-2',
          player_id: 'p-101',
          bid_amount_minor: 35000000,
          team_purse_remaining_minor: 80000000,
          remaining_squad_slots: 4
        }
      });
      assert.equal(bidRes.statusCode, 200);
      assert.equal(JSON.parse(bidRes.payload).status, 'ACCEPTED');

      const lowBidRes = await app.inject({
        method: 'POST',
        url: '/api/v1/auctions/bid',
        payload: {
          auction_id: 'auc-001',
          team_id: 'team-3',
          player_id: 'p-101',
          bid_amount_minor: 30000000,
          team_purse_remaining_minor: 80000000,
          remaining_squad_slots: 4
        }
      });
      assert.equal(lowBidRes.statusCode, 400);

      const overBidRes = await app.inject({
        method: 'POST',
        url: '/api/v1/auctions/bid',
        payload: {
          auction_id: 'auc-001',
          team_id: 'team-4',
          player_id: 'p-101',
          bid_amount_minor: 75000000,
          team_purse_remaining_minor: 80000000,
          remaining_squad_slots: 4
        }
      });
      assert.equal(overBidRes.statusCode, 400);
    });

    it('3. Weather Insurance Claims: verifies rain precipitation threshold and unlocks payouts', async () => {
      const claimRes = await app.inject({
        method: 'POST',
        url: '/api/v1/insurance/claims/weather',
        payload: {
          booking_id: '00000000-0000-0000-0000-000000000021',
          match_id: 'match-001',
          precipitation_mm: 22.5
        }
      });
      assert.equal(claimRes.statusCode, 200);
      const claimData = JSON.parse(claimRes.payload);
      assert.equal(claimData.status, 'VERIFIED');
      assert.equal(claimData.payout_minor, 350000);

      const rejectedClaimRes = await app.inject({
        method: 'POST',
        url: '/api/v1/insurance/claims/weather',
        payload: {
          booking_id: '00000000-0000-0000-0000-000000000021',
          match_id: 'match-001',
          precipitation_mm: 5.0
        }
      });
      assert.equal(rejectedClaimRes.statusCode, 200);
      assert.equal(JSON.parse(rejectedClaimRes.payload).status, 'REJECTED');
    });

    it('4. Dynamic Pricing & Multi-Currency: calculates surge rates and regional tax conversions', () => {
      const normalQuote = calculateDynamicPrice('slot-01', 350000, 'LOW', false);
      assert.equal(normalQuote.final_price_minor, 350000);

      const surgeQuote = calculateDynamicPrice('slot-01', 350000, 'HIGH', true);
      assert.equal(surgeQuote.final_price_minor, 525000);
      assert.equal(surgeQuote.is_peak, true);

      const conversion = calculateMultiCurrencyConversion(350000, 'INR', 'GBP', { INR: 1.0, GBP: 0.01 });
      assert.equal(conversion.currency, 'GBP');
      assert.equal(conversion.base_minor, 3500);
      assert.equal(conversion.tax_minor, 700);
      assert.equal(conversion.total_minor, 4200);
    });
  });

  // ---- Suite 6: Career Stats, Marketplace Filtering & Facility Publishing ----
  describe('Suite 6: Career Stats, Marketplace Filtering & Facility Publishing', () => {
    it('1. PlayerCareerComponent computes longitudinal statistics and achievement badges', () => {
      const career = new PlayerCareerComponent();
      const summary = career.getCareerSummary();
      assert.ok(summary.totalRuns >= 4000);
      assert.ok(summary.careerBattingAverage > 45);
      assert.ok(summary.careerStrikeRate > 130);
      assert.ok(summary.centuries >= 5);

      const badges = career.getBadges();
      assert.ok(badges.length >= 4);
      assert.ok(badges.some(b => b.rarity === 'LEGENDARY'));

      career.addTournamentStat({
        tournamentId: 't-super-2026',
        tournamentName: 'National T20 Super Cup',
        year: 2026,
        format: 'T20',
        matches: 7,
        runs: 318,
        highScore: 88,
        average: 63.6,
        strikeRate: 161.4,
        centuries: 0,
        fifties: 3,
        wickets: 0,
        economy: 0
      });
      assert.strictEqual(career.getTournaments()[0].tournamentName, 'National T20 Super Cup');
    });

    it('2. Mobile Marketplace & Profile Controllers support slot publishing, booking and logs', () => {
      const marketplace = new MarketplaceScreenController();
      marketplace.seedDefaultSlots();
      const slots = marketplace.getSlots();
      assert.ok(slots.some(s => s.category === 'GROUND'));
      assert.ok(slots.some(s => s.category === 'UMPIRE'));

      const officialSlot = marketplace.onboardOfficialSlot({
        providerId: 'prov-ump-test',
        providerName: 'Sunil Gavaskar Umpire Academy',
        role: 'UMPIRE',
        name: 'R. K. Sharma',
        location: 'South District Oval',
        startTime: '08:00',
        endTime: '12:00',
        priceMinor: 200000,
        rating: 4.92
      });
      assert.strictEqual(officialSlot.category, 'UMPIRE');

      const receipt = marketplace.bookSlot(officialSlot.id);
      assert.strictEqual(receipt.status, 'CONFIRMED');

      const profile = new ProfileScreenController();
      assert.ok(profile.getTournaments().length >= 3);
      assert.ok(profile.getBadges().length >= 3);
      const html = profile.renderMobileHtml();
      assert.ok(html.includes('Milestone Achievement Badges'));
      assert.ok(html.includes('Tournament Performance Logs'));
    });

    it('3. Ground facility onboarding and slot publishing in Web Console and Mobile Controller', () => {
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

      const marketCtrl = new MarketplaceScreenController();
      const newSlot = marketCtrl.onboardGroundSlot({
        groundName: 'Whitefield Cricket Ground',
        surfaceType: 'Natural Grass',
        hourlyRate: 3800,
        timeSlot: '16:00 - 20:00'
      });
      assert.strictEqual(newSlot.providerName, 'Whitefield Cricket Ground');
      assert.strictEqual(newSlot.priceMinor, 380000);
    });

    it('4. Web Dashboard marketplace filters execute dynamically', () => {
      assert.ok(typeof webWindow.filterMarketplaceListings === 'function');
      webWindow.filterMarketplaceListings('UMPIRE');
      const container = webWindow.document.getElementById('listingsContainer');
      assert.ok(container.innerHTML.includes('UMPIRE') || container.innerHTML.includes('Sundaram'));
    });
  });

  // ---- Suite 7: Visual Media, Image Upload Engine & Invariants ----
  describe('Suite 7: Visual Media, Image Upload Engine & Invariants', () => {
    const dashSrc = readFile('apps/api/src/ui/dashboard.ts');
    const mobSrc = readFile('apps/api/src/ui/mobile-view.ts');

    it('1. Web Console Avatar Studio: inputs, camera overlays, presets, and reset handler', () => {
      assert.ok(dashSrc.includes('avatar-upload-studio'));
      assert.ok(dashSrc.includes('id="profilePhotoInput"'));
      assert.ok(dashSrc.includes('accept="image/*"'));
      assert.ok(dashSrc.includes('avatar-camera-overlay'));
      assert.ok(dashSrc.includes('resetUserAvatarToDefault()'));
      assert.ok(dashSrc.includes('selectPresetAvatar(0)'));
      assert.ok(dashSrc.includes('selectPresetAvatar(3)'));
      assert.ok(dashSrc.includes('function handleUserPhotoUpload(event)'));
      assert.ok(dashSrc.includes('function applyAvatarToUI(imageUrl)'));
      assert.ok(dashSrc.includes('function initAvatarDragDrop()'));
    });

    it('2. Venue / Turf facility image upload with dropzone and gallery preview', () => {
      assert.ok(dashSrc.includes('id="venueUploadDropzone"'));
      assert.ok(dashSrc.includes('id="venuePhotoInput"'));
      assert.ok(dashSrc.includes('function handleVenueImageUpload(event, slotId)'));
      assert.ok(dashSrc.includes('function updateVenueGalleryPreview(slotId)'));
      assert.ok(dashSrc.includes('function removeVenueImage(slotId, index)'));
      assert.ok(dashSrc.includes('function previewVenueImage(slotId, index)'));
      assert.ok(dashSrc.includes('10 * 1024 * 1024')); // 10MB limit
    });

    it('3. Team logo and evidence dispute uploads with global window exports', () => {
      assert.ok(dashSrc.includes('function handleTeamLogoUpload(event)'));
      assert.ok(dashSrc.includes('function handleEvidenceUpload(event, caseId)'));
      assert.ok(dashSrc.includes('window.handleUserPhotoUpload = handleUserPhotoUpload'));
      assert.ok(dashSrc.includes('window.selectPresetAvatar = selectPresetAvatar'));
      assert.ok(dashSrc.includes('window.handleVenueImageUpload = handleVenueImageUpload'));
      assert.ok(dashSrc.includes('window.handleTeamLogoUpload = handleTeamLogoUpload'));
      assert.ok(dashSrc.includes('window.handleEvidenceUpload = handleEvidenceUpload'));
    });

    it('4. Mobile profile avatar and venue photo upload methods', () => {
      assert.ok(mobSrc.includes('id="mobileProfileAvatar"'));
      assert.ok(mobSrc.includes('id="mobileProfilePhotoInput"'));
      assert.ok(mobSrc.includes('handleMobileProfilePhoto(event)'));
      assert.ok(mobSrc.includes('resetMobileAvatar()'));
      assert.ok(mobSrc.includes('selectMobilePresetAvatar(index)'));
      assert.ok(mobSrc.includes('handleMobileVenuePhoto(event)'));
    });

    it('5. Invariants: Rule 5 tooltips, zero transition: all, and distribution parity', () => {
      assert.ok(dashSrc.includes('data-tooltip="Click or drop an image file to upload custom player photo"'));
      assert.ok(dashSrc.includes('data-tooltip="Reset to standard initials monogram"'));
      assert.ok(mobSrc.includes('data-tooltip="Tap to upload your profile photo"'));

      const dashCss = dashSrc.substring(0, dashSrc.indexOf('</style>'));
      assert.strictEqual((dashCss.match(/transition:\s*all/gi) || []).length, 0);

      const mobCss = mobSrc.substring(0, mobSrc.indexOf('</style>'));
      assert.strictEqual((mobCss.match(/transition:\s*all/gi) || []).length, 0);

      assert_no_critical_errors(dashSrc);
      assert_no_critical_errors(mobSrc);

      assert.strictEqual(rootIndexHtml, distIndexHtml, 'Root index.html and dist/index.html must be byte-for-byte identical');
      assert.strictEqual(distMobileHtml, mobileHtml, 'dist/mobile.html must be identical to getMobileAppHtml()');
    });
  });

  // =========================================================================
  // Suite 6: Pro Cricket Gear Store & Pavilion Checkout (70)
  // =========================================================================
  describe('Suite 6: Pro Cricket Gear Store & Pavilion Checkout (70)', () => {
    it('1. Desktop & Mobile Pro Cricket Gear Store Catalog, Category Filtering & Custom Bat Integration', () => {
      const rootDirPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
      const dashHtml = fs.readFileSync(path.join(rootDirPath, 'index.html'), 'utf8');
      const mobHtml = fs.readFileSync(path.join(rootDirPath, 'dist', 'mobile.html'), 'utf8');
      assert.ok(dashHtml.includes('filterGearStore') && dashHtml.includes('addToGearStoreCart'), 'Desktop Gear Store filter and cart functions must exist');
      assert.ok(mobHtml.includes('addMobileGearToCart'), 'Mobile Gear Store cart handler must exist');
    });

    it('2. Provider Check-In & 3-Party Match Sign-Off Window (Desktop & Mobile) with Fixed Checkbox Geometry', () => {
      const dashSrc = readFile('apps/api/src/ui/dashboard.ts');
      const mobSrc = readFile('apps/api/src/ui/mobile-view.ts');

      // Global checkbox/radio width exclusion & 18px lock
      assert.ok(dashSrc.includes('input:not([type="checkbox"]):not([type="radio"])'), 'Desktop CSS must exclude checkbox/radio from width: 100%');
      assert.ok(dashSrc.includes('input[type="checkbox"], input[type="radio"]') && dashSrc.includes('width: 18px !important'), 'Desktop checkbox must lock to 18px width');
      assert.ok(mobSrc.includes('input[type="checkbox"], input[type="radio"]') && mobSrc.includes('width: 18px !important'), 'Mobile checkbox must lock to 18px width');

      // Desktop #modalCheckIn structure & handlers
      assert.ok(dashSrc.includes('id="checkinVenueContextStrip"'), 'Desktop Check-In must include Live Venue & Escrow Telemetry Ribbon');
      assert.ok(dashSrc.includes('id="signoffRow_HOME"') && dashSrc.includes('id="signoffRow_AWAY"') && dashSrc.includes('id="signoffRow_UMPIRE"'), 'Desktop Check-In must render structured 3-party stakeholder cards');
      assert.ok(dashSrc.includes('window.selectCheckinRolePin') && dashSrc.includes('window.verifyProviderArrivalOtp') && dashSrc.includes('window.updateCheckinSignoffState'), 'Desktop Check-In interactive handlers must be exported');

      // Mobile #mobileCheckInSheetRoot & handlers
      assert.ok(mobSrc.includes('openProviderCheckInSheet()'), 'Mobile Check-In sheet opener must exist');
      assert.ok(mobSrc.includes('id="mobileCheckInSheetRoot"'), 'Mobile Check-In sheet container must exist');
      assert.ok(mobSrc.includes('verifyMobileProviderArrival()') && mobSrc.includes('updateMobileSignoffState()') && mobSrc.includes('completeMobileDigitalSignOff()'), 'Mobile Check-In interactive handlers must exist');
    });

    it('3. Pro Cricket Gear Store Product Images (Desktop & Mobile SVG Studio Illustrations & Cart Thumbnails)', () => {
      const dashSrc = readFile('apps/api/src/ui/dashboard.ts');
      const mobSrc = readFile('apps/api/src/ui/mobile-view.ts');

      // Desktop gear product images
      assert.ok(dashSrc.includes('getGearProductImageDataUri') && dashSrc.includes('window.getGearProductImageDataUri'), 'Desktop must define getGearProductImageDataUri helper');
      assert.ok(dashSrc.includes('class="gear-product-img"') && dashSrc.includes('class="gear-product-image-wrap"'), 'Desktop gear catalog cards must render .gear-product-img inside .gear-product-image-wrap');
      assert.ok(dashSrc.includes('class="gear-cart-thumb"'), 'Desktop gear cart line items must render .gear-cart-thumb');

      // Mobile gear product images
      assert.ok(mobSrc.includes('getMobileGearProductImage(item)'), 'Mobile must define getMobileGearProductImage(item) helper');
      assert.ok(mobSrc.includes('class="mobile-gear-product-img"') && mobSrc.includes('class="mobile-gear-product-image-wrap"'), 'Mobile gear catalog cards must render .mobile-gear-product-img inside .mobile-gear-product-image-wrap');
      assert.ok(mobSrc.includes('class="mobile-gear-cart-thumb"'), 'Mobile gear cart line items must render .mobile-gear-cart-thumb');
    });

    it('4. Unified CricOS Brand Logo Crest Across Web, Mobile, Favicon & Android Adaptive Launcher Icon', () => {
      const dashSrc = readFile('apps/api/src/ui/dashboard.ts');
      const mobSrc = readFile('apps/api/src/ui/mobile-view.ts');
      const androidFg = readFile('apps/mobile/android/app/src/main/res/drawable/ic_launcher_foreground.xml');
      const androidAdaptive = readFile('apps/mobile/android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml');

      // Desktop Favicon, Sidebar, Breadcrumb, Hero & Helper
      assert.ok(dashSrc.includes('rel="icon" type="image/svg+xml"'), 'Desktop must include SVG favicon');
      assert.ok(dashSrc.includes('id="cricosSidebarBrandLogo"') && dashSrc.includes('class="cricos-brand-svg"'), 'Desktop sidebar must render SVG CricOS Brand Crest');
      assert.ok(dashSrc.includes('id="cricosBreadcrumbBrand"'), 'Desktop breadcrumb bar must render SVG CricOS Brand Crest');
      assert.ok(dashSrc.includes('id="heroTopBrandLogo"'), 'Desktop Hero Auth Gateway must render SVG CricOS Brand Crest');
      assert.ok(dashSrc.includes('window.getCricOSBrandLogoSvg'), 'Desktop must expose window.getCricOSBrandLogoSvg');

      // Mobile Favicon, Top Header, Sidebar Drawer, Hero & Helper
      assert.ok(mobSrc.includes('rel="icon" type="image/svg+xml"'), 'Mobile must include SVG favicon');
      assert.ok(mobSrc.includes('getBrandLogoSvg(size)'), 'Mobile must define getBrandLogoSvg(size) helper');
      assert.ok(mobSrc.includes('id="mobileHeaderBrandLogo"'), 'Mobile top header must render SVG CricOS Brand Crest');
      assert.ok(mobSrc.includes('id="mobileSidebarBrandLogo"'), 'Mobile sidebar drawer must render SVG CricOS Brand Crest');
      assert.ok(mobSrc.includes('id="mobileHeroBrandLogo"'), 'Mobile Hero Auth Gateway must render SVG CricOS Brand Crest');

      // Android Adaptive Launcher Icon
      assert.ok(androidFg.includes('#00E599') && androidFg.includes('#00D2FF'), 'Android adaptive icon foreground must render CricOS Telemetry Shield Crest');
      assert.ok(androidAdaptive.includes('<adaptive-icon'), 'Android mipmap-anydpi-v26/ic_launcher.xml must configure adaptive-icon');
    });
  });
});


