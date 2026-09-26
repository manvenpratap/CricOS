import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { getDashboardHtml } from '../apps/api/dist/ui/dashboard.js';
import { getMobileAppHtml } from '../apps/api/dist/ui/mobile-view.js';
import { OfficialsMarketplaceComponent } from '../apps/web/dist/components/officials-marketplace.js';
import { PlayerCareerComponent } from '../apps/web/dist/components/player-career.js';
import { MarketplaceScreenController } from '../apps/mobile/dist/screens/MarketplaceScreen.js';
import { ProfileScreenController } from '../apps/mobile/dist/screens/ProfileScreen.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('44. Modular Architecture — Officials Marketplace & Player Career Stats', () => {
  const dashboardHtml = getDashboardHtml();
  const mobileHtml = getMobileAppHtml();
  const rootIndexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
  const distIndexHtml = fs.readFileSync(path.join(rootDir, 'dist', 'index.html'), 'utf8');
  const distMobileHtml = fs.readFileSync(path.join(rootDir, 'dist', 'mobile.html'), 'utf8');

  let webWindow: any;
  let mobileWindow: any;
  let mobileApp: any;

  before(() => {
    // Web VM Sandbox
    const webElements: Record<string, any> = {};
    const createWebMockEl = (id = '') => {
      const el: any = {
        id,
        innerHTML: '',
        textContent: '',
        style: {},
        classList: {
          classes: new Set<string>(),
          add: (cls: string) => el.classList.classes.add(cls),
          remove: (cls: string) => el.classList.classes.delete(cls),
          contains: (cls: string) => el.classList.classes.has(cls)
        },
        querySelector: () => createWebMockEl(),
        querySelectorAll: () => [],
        addEventListener: () => {},
        removeEventListener: () => {},
        prepend: (child: any) => {
          el.innerHTML = (child.innerHTML || child.outerHTML || '') + el.innerHTML;
        },
        appendChild: (child: any) => {
          el.innerHTML += (child.innerHTML || child.outerHTML || '');
        },
        setAttribute: () => {},
        getAttribute: () => null
      };
      return el;
    };

    const getWebEl = (id: string) => {
      if (!webElements[id]) {
        webElements[id] = createWebMockEl(id);
      }
      return webElements[id];
    };

    webWindow = {
      console,
      setTimeout: (fn: any) => { if (typeof fn === 'function') fn(); return { unref: () => {} }; },
      clearTimeout: () => {},
      setInterval: () => ({ unref: () => {} }),
      clearInterval: () => {},
      MutationObserver: class { observe() {} disconnect() {} },
      document: {
        getElementById: (id: string) => getWebEl(id),
        querySelectorAll: () => [],
        addEventListener: () => {},
        removeEventListener: () => {}
      },
      addEventListener: () => {},
      removeEventListener: () => {},
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

    const scriptMatches = [...dashboardHtml.matchAll(/<script(?![^>]*src=)>([\s\S]*?)<\/script>/g)];
    const context = vm.createContext(webWindow);
    for (const match of scriptMatches) {
      try {
        vm.runInContext(match[1], context);
      } catch {
        // VM initialization
      }
    }

    // Mobile VM Sandbox
    const mobileElements: Record<string, any> = {};
    const createMobileMockEl = (id = '') => {
      const el: any = {
        id,
        innerHTML: '',
        textContent: '',
        value: '',
        style: {},
        classList: { add: () => {}, remove: () => {} },
        setAttribute: () => {},
        getAttribute: () => null
      };
      return el;
    };

    const getMobileEl = (id: string) => {
      if (!mobileElements[id]) {
        mobileElements[id] = createMobileMockEl(id);
      }
      return mobileElements[id];
    };

    mobileWindow = {
      document: {
        getElementById: (id: string) => getMobileEl(id),
        querySelectorAll: () => [],
        addEventListener: () => {}
      },
      showToast: () => {},
      localStorage: {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {}
      }
    };

    const mobileScriptMatch = mobileHtml.match(/<script>([\s\S]*?)<\/script>/);
    if (mobileScriptMatch) {
      const scriptCode = mobileScriptMatch[1];
      const context = vm.createContext(mobileWindow);
      try {
        vm.runInContext(scriptCode, context);
        mobileApp = mobileWindow.cricosMobileApp;
      } catch {
        // VM initialization
      }
    }
  });

  // Section 1: Modular Web Officials Marketplace Component
  it('1. OfficialsMarketplaceComponent instantiates with certified BCCI & state officials', () => {
    const comp = new OfficialsMarketplaceComponent();
    const officials = comp.getFilteredOfficials();
    assert.ok(officials.length >= 2, 'Should contain at least 2 default officials');

    const umpire = officials.find(o => o.role === 'UMPIRE');
    assert.ok(umpire, 'Should have certified umpire');
    assert.strictEqual(umpire?.certification, 'BCCI_LEVEL_2');
    assert.ok(umpire?.matchRateMinor > 0);

    const scorer = officials.find(o => o.role === 'SCORER');
    assert.ok(scorer, 'Should have certified scorer');
    assert.ok(scorer?.certification === 'BCCI_LEVEL_1' || scorer?.certification === 'STATE_CERTIFIED');
    assert.ok(scorer?.rating >= 4.8);
  });

  it('2. OfficialsMarketplaceComponent filters officials by role and allows onboarding', () => {
    const comp = new OfficialsMarketplaceComponent();
    
    comp.setFilter('UMPIRE');
    const umpires = comp.getFilteredOfficials();
    assert.ok(umpires.every(o => o.role === 'UMPIRE'), 'All filtered items should be umpires');

    comp.setFilter('SCORER');
    const scorers = comp.getFilteredOfficials();
    assert.ok(scorers.every(o => o.role === 'SCORER'), 'All filtered items should be scorers');

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
    const all = comp.getFilteredOfficials();
    assert.strictEqual(all[0].id, 'off-new-99', 'Newly onboarded official should appear first');
  });

  // Section 2: Modular Web Player Career Component
  it('3. PlayerCareerComponent computes longitudinal statistics and achievement badges', () => {
    const career = new PlayerCareerComponent();
    const summary = career.getCareerSummary();

    assert.ok(summary.totalRuns >= 4000, 'Career total runs should reflect proven record');
    assert.ok(summary.careerBattingAverage > 45, 'Batting average should be > 45');
    assert.ok(summary.careerStrikeRate > 130, 'Career strike rate should be > 130');
    assert.ok(summary.centuries >= 5, 'Should have centuries logged');

    const badges = career.getBadges();
    assert.ok(badges.length >= 4, 'Should possess milestone badges');
    assert.ok(badges.some(b => b.rarity === 'LEGENDARY'), 'Should possess LEGENDARY badge');
    assert.ok(badges.some(b => b.rarity === 'RARE'), 'Should possess RARE badge');

    const tournaments = career.getTournaments();
    assert.ok(tournaments.length >= 3, 'Should possess multi-tournament records');
    assert.ok(tournaments.some(t => t.tournamentName.includes('Bangalore Premier League')));
  });

  it('4. PlayerCareerComponent supports custom tournament logs and badge unlocking', () => {
    const career = new PlayerCareerComponent();
    
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

    const tournaments = career.getTournaments();
    assert.strictEqual(tournaments[0].tournamentName, 'National T20 Super Cup');

    career.addBadge({
      id: 'bdg-custom-1',
      title: 'T20 Super Striker 🚀',
      category: 'IMPACT',
      icon: '🚀',
      description: 'Strike rate exceeding 160 across a full national tournament',
      unlockedAt: '2026-09-26',
      rarity: 'LEGENDARY'
    });

    const badges = career.getBadges();
    assert.strictEqual(badges[badges.length - 1].id, 'bdg-custom-1');
  });

  // Section 3: Mobile Marketplace Screen Controller with Officials Slots
  it('5. Mobile MarketplaceScreenController supports official slot publishing and seed defaults', () => {
    const marketplace = new MarketplaceScreenController();
    marketplace.seedDefaultSlots();
    
    const slots = marketplace.getSlots();
    assert.ok(slots.some(s => s.category === 'GROUND'), 'Should contain GROUND slot');
    assert.ok(slots.some(s => s.category === 'UMPIRE'), 'Should contain UMPIRE slot');
    assert.ok(slots.some(s => s.category === 'SCORER'), 'Should contain SCORER slot');

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
    assert.strictEqual(officialSlot.priceMinor, 200000);
    assert.strictEqual(marketplace.getSlots()[0].id, officialSlot.id);
  });

  it('6. Mobile MarketplaceScreenController books official slots and generates receipts', () => {
    const marketplace = new MarketplaceScreenController();
    marketplace.seedDefaultSlots();
    const umpireSlot = marketplace.getSlots().find(s => s.category === 'UMPIRE')!;

    const breakdown = marketplace.calculateBreakdown(umpireSlot.priceMinor);
    assert.strictEqual(breakdown.baseMinor, 180000);
    assert.ok(breakdown.totalMinor > breakdown.baseMinor, 'Total includes fee and GST');

    const receipt = marketplace.bookSlot(umpireSlot.id);
    assert.strictEqual(receipt.slotId, umpireSlot.id);
    assert.strictEqual(receipt.category, 'UMPIRE');
    assert.strictEqual(receipt.breakdown.totalMinor, breakdown.totalMinor);
    assert.strictEqual(receipt.status, 'CONFIRMED');
  });

  // Section 4: Mobile Profile Screen Controller with Badges & Tournament Logs
  it('7. Mobile ProfileScreenController tracks multi-tournament performance logs and badges', () => {
    const profile = new ProfileScreenController();
    const tournaments = profile.getTournaments();
    const badges = profile.getBadges();

    assert.ok(tournaments.length >= 3, 'Should have at least 3 season logs');
    assert.ok(badges.length >= 3, 'Should have at least 3 career badges');

    profile.addBadge({
      id: 'bdg-gold',
      title: 'Golden Arm ⚡',
      icon: '⚡',
      rarity: 'RARE',
      description: 'Breakthrough bowling wicket in consecutive powerplay overs'
    });
    assert.ok(profile.getBadges().some(b => b.id === 'bdg-gold'));

    profile.addTournamentLog({
      tournamentName: 'Corporate Super League 2026',
      year: 2026,
      matches: 8,
      runs: 380,
      average: 54.28,
      strikeRate: 148.5,
      wickets: 4
    });
    assert.strictEqual(profile.getTournaments()[0].tournamentName, 'Corporate Super League 2026');
  });

  it('8. Mobile ProfileScreenController HTML rendering includes milestone badges and tooltips', () => {
    const profile = new ProfileScreenController();
    const html = profile.renderMobileHtml();

    assert.ok(html.includes('Milestone Achievement Badges'), 'Should render Milestone Badges header');
    assert.ok(html.includes('Tournament Performance Logs'), 'Should render Tournament Logs header');
    assert.ok(html.includes('Century Master'), 'Should render Century Master badge');
    assert.ok(html.includes('Boundary King'), 'Should render Boundary King badge');
    assert.ok(html.includes('data-tooltip='), 'Should include accessible data-tooltip');
  });

  // Section 5: Web Dashboard Marketplace Filter Buttons & Profile UI
  it('9. Web Dashboard contains interactive category filter buttons with data-tooltip', () => {
    assert.ok(dashboardHtml.includes('id="btnFilterAll"'), 'Should have All filter button');
    assert.ok(dashboardHtml.includes('id="btnFilterGround"'), 'Should have Ground filter button');
    assert.ok(dashboardHtml.includes('id="btnFilterUmpire"'), 'Should have Umpire filter button');
    assert.ok(dashboardHtml.includes('id="btnFilterScorer"'), 'Should have Scorer filter button');

    assert.ok(dashboardHtml.includes('onclick="filterMarketplaceListings(\'ALL\')"'));
    assert.ok(dashboardHtml.includes('onclick="filterMarketplaceListings(\'GROUND\')"'));
    assert.ok(dashboardHtml.includes('onclick="filterMarketplaceListings(\'UMPIRE\')"'));
    assert.ok(dashboardHtml.includes('onclick="filterMarketplaceListings(\'SCORER\')"'));

    // Rule 5: data-tooltip checks
    assert.ok(dashboardHtml.includes('data-tooltip="Show all available grounds and officials"'));
    assert.ok(dashboardHtml.includes('data-tooltip="Filter turf cricket grounds"'));
    assert.ok(dashboardHtml.includes('data-tooltip="Filter certified match umpires"'));
    assert.ok(dashboardHtml.includes('data-tooltip="Filter digital match scorers"'));
  });

  it('10. Web Dashboard filterMarketplaceListings executes and filters listings dynamically', () => {
    assert.ok(typeof webWindow.filterMarketplaceListings === 'function', 'filterMarketplaceListings should be exported to window');
    
    webWindow.filterMarketplaceListings('UMPIRE');
    const container = webWindow.document.getElementById('listingsContainer');
    assert.ok(container.innerHTML.includes('UMPIRE') || container.innerHTML.includes('Sundaram'), 'Should render umpire listing');

    webWindow.filterMarketplaceListings('SCORER');
    assert.ok(container.innerHTML.includes('SCORER') || container.innerHTML.includes('Jayanth'), 'Should render scorer listing');

    webWindow.filterMarketplaceListings('ALL');
    assert.ok(container.innerHTML.includes('Ground') || container.innerHTML.includes('Sundaram'), 'Should render all listings');
  });

  it('11. Web Dashboard modalUserProfile includes milestone badges and multi-tournament table', () => {
    assert.ok(dashboardHtml.includes('Career Milestone Badges'), 'Should have Milestone Badges header');
    assert.ok(dashboardHtml.includes('Century Master'), 'Should show Century Master badge');
    assert.ok(dashboardHtml.includes('Boundary Monarch'), 'Should show Boundary Monarch badge');
    assert.ok(dashboardHtml.includes('Tactical Captain'), 'Should show Tactical Captain badge');
    assert.ok(dashboardHtml.includes('Multi-Tournament Season Records'), 'Should show multi-tournament records table');
    assert.ok(dashboardHtml.includes('Bangalore Premier League'), 'Should list Bangalore Premier League');
    assert.ok(dashboardHtml.includes('Karnataka Corporate Trophy'), 'Should list Karnataka Corporate Trophy');
  });

  // Section 6: Mobile Web View Officials Marketplace & Profile Integration
  it('12. Mobile View renders official slot publishing button and handles action sheet', () => {
    assert.ok(mobileHtml.includes('id="btnPublishOfficialSlot"') || mobileHtml.includes('id="btnListOfficialSlotQuick"'), 'Should provide official slot publishing button');
    assert.ok(mobileHtml.includes('publishOfficialSlotAction'), 'Should wire publishOfficialSlotAction');
    assert.ok(mobileHtml.includes('data-tooltip="List match officiating availability as Umpire or Scorer"') || mobileHtml.includes('data-tooltip="Publish match officiating availability slot"'), 'Should have Rule 5 tooltip');

    if (mobileApp && typeof mobileApp.publishOfficialSlotAction === 'function') {
      mobileApp.publishOfficialSlotAction();
      assert.ok(mobileApp.actionSheetOpen, 'Action sheet should open for listing official slot');
      assert.ok(mobileApp.actionSheetTitle.includes('Official'), 'Action sheet should be for official slot');
    }
  });

  it('13. Mobile View renders milestone badges and tournament performance logs in Profile', () => {
    assert.ok(mobileHtml.includes('Milestone Achievement Badges'), 'Mobile HTML should render Milestone Badges');
    assert.ok(mobileHtml.includes('Tournament Performance Logs'), 'Mobile HTML should render Tournament Performance Logs');
    assert.ok(mobileHtml.includes('Century Master 💯'), 'Should render Century Master badge');
    assert.ok(mobileHtml.includes('Boundary Monarch 🚀'), 'Should render Boundary Monarch badge');
    assert.ok(mobileHtml.includes('Bangalore Premier League'), 'Should render tournament performance record');
  });

  // Section 7: Distribution Parity & Governance Invariants
  it('14. Distribution parity: root index.html is byte-for-byte identical with dist/index.html (Rule 6)', () => {
    assert.strictEqual(
      rootIndexHtml,
      distIndexHtml,
      'Rule 6 violation: root index.html must be byte-for-byte identical to dist/index.html'
    );
  });

  it('15. Distribution artifacts: dist/mobile.html and dist/release-manifest.json exist', () => {
    assert.ok(distMobileHtml.length > 50000, 'dist/mobile.html should be populated');
    const manifestPath = path.join(rootDir, 'dist', 'release-manifest.json');
    assert.ok(fs.existsSync(manifestPath), 'dist/release-manifest.json should exist');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    assert.ok(manifest.artifacts['dist/index.html']?.sha256 || manifest.artifacts['index.html']?.sha256, 'Manifest should contain index.html SHA256');
    assert.ok(manifest.artifacts['dist/mobile.html']?.sha256, 'Manifest should contain mobile.html SHA256');
  });

  it('16. Zero transition: all invariant is preserved across all HTML stylesheets', () => {
    assert.doesNotMatch(
      dashboardHtml,
      /transition:\s*all/i,
      'dashboardHtml must not violate Emil Kowalski zero transition:all rule'
    );
    assert.doesNotMatch(
      mobileHtml,
      /transition:\s*all/i,
      'mobileHtml must not violate Emil Kowalski zero transition:all rule'
    );
    assert.doesNotMatch(
      rootIndexHtml,
      /transition:\s*all/i,
      'rootIndexHtml must not violate Emil Kowalski zero transition:all rule'
    );
  });
});
