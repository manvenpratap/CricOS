-- Phase 1E: Settlement entries and booking constraints

CREATE TABLE IF NOT EXISTS settlement_entries (
  id uuid PRIMARY KEY,
  booking_id uuid NOT NULL REFERENCES bookings(id),
  provider_id uuid NOT NULL REFERENCES providers(id),
  entry_type text NOT NULL,
  amount_minor bigint NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  reference text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS settlement_provider_created
  ON settlement_entries(provider_id, created_at);
CREATE INDEX IF NOT EXISTS settlement_booking
  ON settlement_entries(booking_id);

-- Prevent two active bookings from occupying the same slot interval.
-- (Complements the GiST exclusion constraint in 0002 which covers range overlap.)
CREATE UNIQUE INDEX IF NOT EXISTS one_booking_per_slot
  ON bookings(slot_id, starts_at, ends_at)
  WHERE status IN ('CONFIRMED','CHECKED_IN','COMPLETED');
