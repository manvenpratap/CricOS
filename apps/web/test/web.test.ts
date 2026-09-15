import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  CricOSApiClient,
  calculateStrikeRate,
  calculateEconomy,
  parseDeliveryToChip,
  renderDeliveryChipHtml,
  computeCommercialBreakdown,
  renderListingCardHtml,
  getTrustBadgeConfig,
  renderTrustBadgeHtml
} from '../dist/index.js';

describe('CricOS Web Client Application (@cricket-platform/web)', () => {
  describe('1. API Client & Currency Minor Units', () => {
    it('manages authentication tokens and base URL', () => {
      const client = new CricOSApiClient({ baseUrl: 'https://api.cricos.app', token: 'sample-jwt-token' });
      assert.strictEqual(client.getBaseUrl(), 'https://api.cricos.app');
      assert.strictEqual(client.getToken(), 'sample-jwt-token');

      client.setToken('updated-token');
      assert.strictEqual(client.getToken(), 'updated-token');
    });

    it('formats integer minor units accurately into INR currency strings', () => {
      assert.strictEqual(CricOSApiClient.formatMinorUnits(350000, 'INR'), '₹3,500.00');
      assert.strictEqual(CricOSApiClient.formatMinorUnits(150050, 'INR'), '₹1,500.50');
      assert.strictEqual(CricOSApiClient.formatMinorUnits(0, 'INR'), '₹0.00');
    });
  });

  describe('2. Scoreboard Calculations & Chip Rendering', () => {
    it('calculates batter strike rate accurately', () => {
      assert.strictEqual(calculateStrikeRate(50, 25), '200.0');
      assert.strictEqual(calculateStrikeRate(33, 22), '150.0');
      assert.strictEqual(calculateStrikeRate(0, 0), '0.00');
    });

    it('calculates bowler economy rate accurately', () => {
      assert.strictEqual(calculateEconomy(24, 4), '6.00');
      assert.strictEqual(calculateEconomy(35, 3.5), '10.00');
      assert.strictEqual(calculateEconomy(0, 0), '0.00');
    });

    it('parses deliveries into appropriate chip types and renders accessible HTML', () => {
      const dot = parseDeliveryToChip({ runs: 0 });
      assert.strictEqual(dot.type, 'DOT');
      assert.ok(renderDeliveryChipHtml(dot).includes('data-tooltip'));

      const four = parseDeliveryToChip({ runs: 4 });
      assert.strictEqual(four.type, 'BOUNDARY_FOUR');
      assert.ok(renderDeliveryChipHtml(four).includes('10B981'));

      const six = parseDeliveryToChip({ runs: 6 });
      assert.strictEqual(six.type, 'MAXIMUM_SIX');
      assert.ok(renderDeliveryChipHtml(six).includes('8B5CF6'));

      const wicket = parseDeliveryToChip({ runs: 0, isWicket: true });
      assert.strictEqual(wicket.type, 'WICKET');
      assert.ok(renderDeliveryChipHtml(wicket).includes('F43F5E'));

      const extra = parseDeliveryToChip({ runs: 1, isExtra: true, extraType: 'WIDE' });
      assert.strictEqual(extra.type, 'EXTRA');
      assert.strictEqual(extra.display, '1wi');
    });
  });

  describe('3. Marketplace & Commercial Breakdown', () => {
    it('computes integer minor breakdown with platform fee and GST', () => {
      // 500000 minor (₹5,000)
      // platform fee (5%): 25000 minor (₹250)
      // GST (18%): 90000 minor (₹900)
      // total: 615000 minor (₹6,150)
      const breakdown = computeCommercialBreakdown(500000);
      assert.strictEqual(breakdown.baseMinor, 500000);
      assert.strictEqual(breakdown.platformFeeMinor, 25000);
      assert.strictEqual(breakdown.gstMinor, 90000);
      assert.strictEqual(breakdown.totalMinor, 615000);
    });

    it('renders listing card with correct styling and tooltips', () => {
      const html = renderListingCardHtml({
        id: 'venue-1',
        name: 'Wankhede Turf',
        category: 'GROUND',
        location: 'Mumbai, India',
        priceMinor: 500000,
        rating: 4.9,
        availableSlotId: 'slot-sample-1',
        slotTime: '18:00 - 22:00'
      });

      assert.ok(html.includes('Wankhede Turf'));
      assert.ok(html.includes('₹6,150.00'));
      assert.ok(html.includes('data-tooltip'));
    });
  });

  describe('4. Trust Badges & Reputation UI', () => {
    it('returns appropriate visual config for provider trust states', () => {
      const verified = getTrustBadgeConfig('VERIFIED');
      assert.strictEqual(verified.label, 'VERIFIED');
      assert.strictEqual(verified.color, '#10B981');

      const probation = getTrustBadgeConfig('PROBATION');
      assert.strictEqual(probation.label, 'PROBATION');
      assert.strictEqual(probation.color, '#F59E0B');

      const suspended = getTrustBadgeConfig('SUSPENDED');
      assert.strictEqual(suspended.label, 'SUSPENDED');
      assert.strictEqual(suspended.color, '#F43F5E');

      const badgeHtml = renderTrustBadgeHtml('VERIFIED');
      assert.ok(badgeHtml.includes('data-tooltip'));
      assert.ok(badgeHtml.includes('VERIFIED'));
    });
  });
});
