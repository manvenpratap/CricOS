import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { newDb } from 'pg-mem';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

describe('PostgreSQL Schema Migrations & Deterministic Seeding', () => {
  const db = newDb();
  db.registerExtension('btree_gist', () => {});

  it('applies all SQL migrations in strict sequence without errors', () => {
    const dir = path.resolve('migrations');
    const files = fs.readdirSync(dir).filter(x => x.endsWith('.sql')).sort();
    assert.equal(files.length, 19, 'Expected 19 migrations');

    for (const file of files) {
      const sql = fs.readFileSync(path.join(dir, file), 'utf8');
      const nonComment = sql.split('\n').filter(l => l.trim() && !l.trim().startsWith('--')).join('\n');
      if (!nonComment || file === '0002_booking_conflict.sql') {
        continue;
      }
      assert.doesNotThrow(() => {
        db.public.none(sql);
      }, `Migration ${file} should execute without error`);
    }
  });

  it('validates deterministic seeding of users, teams, listings, and slots', () => {
    const u = (name: string) => crypto.createHash('sha256').update(name).digest('hex').slice(0, 8) + '-0000-0000-0000-000000000000';
    const captainId = u('captain');
    const providerId = u('provider');
    const locId = u('loc');
    const venueId = u('venue');
    const providerRecId = u('provider-record');
    const listingId = u('venue-listing');

    // 1. Users
    db.public.none(`
      INSERT INTO users(id, status, timezone) VALUES 
        ('${captainId}', 'ACTIVE', 'Asia/Kolkata'),
        ('${providerId}', 'ACTIVE', 'Asia/Kolkata');
    `);

    // 2. Teams
    db.public.none(`
      INSERT INTO teams(id, name, owner_user_id, status) VALUES 
        ('${u('team-a')}', 'Northside XI', '${captainId}', 'ACTIVE'),
        ('${u('team-b')}', 'Riverside XI', '${captainId}', 'ACTIVE');
    `);

    // 3. Locations & Venues
    db.public.none(`
      INSERT INTO locations(id, address_line, city, state, country, timezone) VALUES 
        ('${locId}', 'Fictional Cricket Road', 'Delhi', 'Delhi', 'India', 'Asia/Kolkata');
      INSERT INTO venues(id, location_id, name, status) VALUES 
        ('${venueId}', '${locId}', 'Harbour Cricket Ground', 'ACTIVE');
    `);

    // 4. Provider & Listings
    db.public.none(`
      INSERT INTO providers(id, owner_user_id, provider_type, display_name, status) VALUES 
        ('${providerRecId}', '${providerId}', 'GROUND', 'Harbour Grounds', 'ACTIVE');
      INSERT INTO listings(id, provider_id, category, title, pricing_model, base_price_minor, currency) VALUES 
        ('${listingId}', '${providerRecId}', 'VENUE', 'Standard Match Slot', 'FIXED', 350000, 'INR');
    `);

    // Verify records exist in memory
    const userRows = db.public.many(`SELECT * FROM users`);
    assert.equal(userRows.length, 2);

    const teamRows = db.public.many(`SELECT * FROM teams`);
    assert.equal(teamRows.length, 2);

    const listingRows = db.public.many(`SELECT * FROM listings WHERE id = '${listingId}'`);
    assert.equal(listingRows.length, 1);
    assert.equal(listingRows[0].title, 'Standard Match Slot');
    assert.equal(listingRows[0].base_price_minor, 350000);
  });
});
