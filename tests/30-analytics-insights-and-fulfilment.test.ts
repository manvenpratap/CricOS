import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { buildServer } from '../apps/api/dist/server.js';

describe('Wave 7: Analytics, AI Insights, Social & Operations Fulfilment API', () => {
  let app: any;

  before(async () => {
    process.env.NODE_ENV = 'test';
    app = buildServer();
    await app.ready();
  });

  after(async () => {
    if (app) await app.close();
  });

  test('1. Player of the Match (MVP): calculates batting, bowling & fielding impact points', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/analytics/matches/match-001/mvp'
    });
    assert.equal(res.statusCode, 200);
    const data = JSON.parse(res.payload);
    assert.ok(data.player_of_the_match);
    assert.equal(data.player_of_the_match.is_potm, true);
    assert.ok(data.player_of_the_match.total_impact_points >= 80);
    assert.ok(data.rankings.length >= 3);
  });

  test('2. AI Match Insights: produces press recap headline, summary and turning point swing', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/analytics/matches/match-001/insights'
    });
    assert.equal(res.statusCode, 200);
    const data = JSON.parse(res.payload);
    assert.ok(data.headline);
    assert.ok(data.summary);
    assert.ok(data.turning_point);
    assert.ok(data.turning_point.win_prob_swing > 0);
  });

  test('3. Smart Procurement Recommendations: ranks suitable venues, umpires and scorers', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/recommendations/procurement?format=T20'
    });
    assert.equal(res.statusCode, 200);
    const recommendations = JSON.parse(res.payload);
    assert.ok(recommendations.length >= 3);
    assert.ok(recommendations.some((r: any) => r.category === 'VENUE'));
    assert.ok(recommendations.some((r: any) => r.category === 'OFFICIAL'));
  });

  test('4. Broadcast Graphic Overlay: provides real-time score bug and delivery ticker data', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/broadcast/matches/match-001/overlay'
    });
    assert.equal(res.statusCode, 200);
    const overlay = JSON.parse(res.payload);
    assert.equal(overlay.match_id, 'match-001');
    assert.ok(overlay.striker);
    assert.ok(overlay.bowler);
    assert.ok(Array.isArray(overlay.recent_deliveries));
  });

  test('5. Provider Check-In & 3-Party Match Sign-Off: verifies OTP and unfreezes payouts', async () => {
    // 1. Provider arrival OTP check-in
    const checkInRes = await app.inject({
      method: 'POST',
      url: '/api/v1/operations/check-in',
      payload: {
        booking_id: '00000000-0000-0000-0000-000000000021',
        provider_id: '00000000-0000-0000-0000-000000000002',
        otp: '4821',
        geofence_coords: { lat: 12.9716, lng: 77.5946 }
      }
    });
    assert.equal(checkInRes.statusCode, 200);
    const checkInData = JSON.parse(checkInRes.payload);
    assert.equal(checkInData.status, 'CHECKED_IN');
    assert.equal(checkInData.geofence_verified, true);

    // 2. Dual captain & official match sign-off
    const signOffRes = await app.inject({
      method: 'POST',
      url: '/api/v1/operations/match-signoff',
      payload: {
        match_id: 'match-001',
        captain_a_signed: true,
        captain_b_signed: true,
        official_signed: true,
        signoff_notes: 'Fair contest without dispute'
      }
    });
    assert.equal(signOffRes.statusCode, 200);
    const signOffData = JSON.parse(signOffRes.payload);
    assert.equal(signOffData.status, 'SIGNOFF_COMPLETE');
    assert.equal(signOffData.payout_eligible, true);
  });

  test('6. Social Activity Feed, Follow & Share Metadata: generates cards and updates feed', async () => {
    // 1. Activity feed
    const feedRes = await app.inject({
      method: 'GET',
      url: '/api/v1/social/feed'
    });
    assert.equal(feedRes.statusCode, 200);
    const feed = JSON.parse(feedRes.payload);
    assert.ok(Array.isArray(feed));
    assert.ok(feed.length >= 2);

    // 2. Follow team
    const followRes = await app.inject({
      method: 'POST',
      url: '/api/v1/social/follow',
      payload: {
        target_id: 'team-1',
        target_type: 'TEAM'
      }
    });
    assert.equal(followRes.statusCode, 200);
    const followData = JSON.parse(followRes.payload);
    assert.equal(followData.following, true);

    // 3. Share match card
    const shareRes = await app.inject({
      method: 'GET',
      url: '/api/v1/social/matches/match-001/share'
    });
    assert.equal(shareRes.statusCode, 200);
    const shareData = JSON.parse(shareRes.payload);
    assert.ok(shareData.share_url);
    assert.ok(shareData.twitter_share_url);
  });

  test('7. Logistics Tracking: tracks cricket gear dispatch and delivery checkpoints', async () => {
    const trackRes = await app.inject({
      method: 'GET',
      url: '/api/v1/operations/logistics/ord-12345/track'
    });
    assert.equal(trackRes.statusCode, 200);
    const tracking = JSON.parse(trackRes.payload);
    assert.equal(tracking.status, 'IN_TRANSIT');
    assert.ok(tracking.tracking_number.startsWith('CRIC-TRK-'));
    assert.ok(tracking.checkpoints.length >= 3);
  });
});
