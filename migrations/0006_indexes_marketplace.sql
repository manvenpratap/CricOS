-- Phase 1C: Marketplace & availability indexes
CREATE INDEX IF NOT EXISTS listings_category_status
  ON listings(category, status);
CREATE INDEX IF NOT EXISTS service_slots_listing_status_time
  ON service_slots(listing_id, status, starts_at, ends_at);
CREATE INDEX IF NOT EXISTS inventory_holds_slot_active_expiry
  ON inventory_holds(slot_id, status, expires_at);
CREATE INDEX IF NOT EXISTS bookings_slot_status_time
  ON bookings(slot_id, status, starts_at, ends_at);
