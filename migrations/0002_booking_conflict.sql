-- Booking and hold overlap prevention using GiST exclusion constraints.
-- Requires btree_gist extension (created in 0001_core.sql).

ALTER TABLE bookings
  ADD CONSTRAINT bookings_no_overlap
  EXCLUDE USING gist (
    slot_id WITH =,
    tstzrange(starts_at, ends_at, '[)') WITH &&
  )
  WHERE (status IN ('CONFIRMED','CHECKED_IN','COMPLETED'));

ALTER TABLE inventory_holds
  ADD CONSTRAINT holds_no_overlap
  EXCLUDE USING gist (
    slot_id WITH =,
    tstzrange(starts_at, ends_at, '[)') WITH &&
  )
  WHERE (status = 'ACTIVE');
