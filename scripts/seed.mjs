import pg from 'pg';
import crypto from 'node:crypto';

const { Client } = pg;
const u = (name) => crypto.createHash('sha256').update(name).digest('hex').slice(0, 8) + '-0000-0000-0000-000000000000';

const connectionString = process.env.DATABASE_URL || 'postgresql://cricket:cricket@localhost:5432/cricket';
const client = new Client({ connectionString });

try {
  await client.connect();
  console.log('Connected to database for seeding.');

  const ids = {
    captain: u('captain'),
    provider: u('provider'),
    organiser: u('organiser'),
    teamA: u('team-a'),
    teamB: u('team-b'),
    loc: u('loc'),
    venue: u('venue'),
    providerRec: u('provider-record'),
    officialProviderRec: u('official-provider'),
    venueListing: u('venue-listing'),
    umpireListing: u('umpire-listing'),
    venueSlot: u('venue-slot'),
    umpireSlot: u('umpire-slot'),
    event1: u('event-pilot-1'),
    match1: u('match-pilot-1'),
  };

  await client.query('BEGIN');

  // 1. Users
  await client.query(`
    INSERT INTO users(id, status, timezone) VALUES 
      ($1, 'ACTIVE', 'Asia/Kolkata'),
      ($2, 'ACTIVE', 'Asia/Kolkata'),
      ($3, 'ACTIVE', 'Asia/Kolkata')
    ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status;
  `, [ids.captain, ids.provider, ids.organiser]);

  // 2. Roles
  await client.query(`
    INSERT INTO user_roles(user_id, role) VALUES 
      ($1, 'CAPTAIN'),
      ($2, 'PROVIDER'),
      ($3, 'ORGANISER')
    ON CONFLICT (user_id, role) DO NOTHING;
  `, [ids.captain, ids.provider, ids.organiser]);

  // 3. Teams
  await client.query(`
    INSERT INTO teams(id, name, owner_user_id, status) VALUES 
      ($1, 'Northside XI', $2, 'ACTIVE'),
      ($3, 'Riverside XI', $2, 'ACTIVE')
    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
  `, [ids.teamA, ids.captain, ids.teamB]);

  // 4. Locations
  await client.query(`
    INSERT INTO locations(id, address_line, city, state, country, timezone) VALUES 
      ($1, 'Fictional Cricket Road', 'Delhi', 'Delhi', 'India', 'Asia/Kolkata')
    ON CONFLICT (id) DO NOTHING;
  `, [ids.loc]);

  // 5. Venues
  await client.query(`
    INSERT INTO venues(id, location_id, name, status) VALUES 
      ($1, $2, 'Harbour Cricket Ground', 'ACTIVE')
    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
  `, [ids.venue, ids.loc]);

  // 6. Providers
  await client.query(`
    INSERT INTO providers(id, owner_user_id, provider_type, display_name, status) VALUES 
      ($1, $2, 'GROUND', 'Harbour Grounds', 'ACTIVE'),
      ($3, $2, 'OFFICIAL', 'Premier Cricket Officials', 'ACTIVE')
    ON CONFLICT (id) DO UPDATE SET display_name = EXCLUDED.display_name;
  `, [ids.providerRec, ids.provider, ids.officialProviderRec]);

  // 7. Listings
  await client.query(`
    INSERT INTO listings(id, provider_id, category, title, status, pricing_model, base_price_minor, currency) VALUES 
      ($1, $2, 'VENUE', 'Standard Match Slot', 'ACTIVE', 'FIXED', 350000, 'INR'),
      ($3, $4, 'UMPIRE', 'Match Official', 'ACTIVE', 'FIXED', 250000, 'INR')
    ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, base_price_minor = EXCLUDED.base_price_minor;
  `, [ids.venueListing, ids.providerRec, ids.umpireListing, ids.officialProviderRec]);

  // 8. Service Slots
  await client.query(`
    INSERT INTO service_slots(id, listing_id, starts_at, ends_at, status, capacity) VALUES 
      ($1, $2, date_trunc('day', now() + interval '7 days') + interval '9 hours', date_trunc('day', now() + interval '7 days') + interval '12 hours', 'AVAILABLE', 1),
      ($3, $4, date_trunc('day', now() + interval '7 days') + interval '9 hours', date_trunc('day', now() + interval '7 days') + interval '12 hours', 'AVAILABLE', 1)
    ON CONFLICT (id) DO NOTHING;
  `, [ids.venueSlot, ids.venueListing, ids.umpireSlot, ids.umpireListing]);

  await client.query('COMMIT');
  console.log('✓ Deterministic pilot fixtures seeded successfully.');
} catch (err) {
  await client.query('ROLLBACK');
  console.error('✗ Seeding failed:', err);
  process.exit(1);
} finally {
  await client.end();
}
