-- Phase 1F: Trust, disputes & provider payouts

ALTER TABLE providers ADD COLUMN IF NOT EXISTS trust_state text NOT NULL DEFAULT 'PENDING';
ALTER TABLE providers ADD COLUMN IF NOT EXISTS verified_at timestamptz;

CREATE TABLE IF NOT EXISTS disputes (
  id uuid PRIMARY KEY,
  booking_id uuid NOT NULL REFERENCES bookings(id),
  opened_by uuid NOT NULL REFERENCES users(id),
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'OPEN',
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

CREATE TABLE IF NOT EXISTS dispute_evidence (
  id uuid PRIMARY KEY,
  dispute_id uuid NOT NULL REFERENCES disputes(id),
  submitted_by uuid NOT NULL REFERENCES users(id),
  object_key text NOT NULL,
  mime_type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payout_batches (
  id uuid PRIMARY KEY,
  provider_id uuid NOT NULL REFERENCES providers(id),
  status text NOT NULL DEFAULT 'PENDING',
  total_minor bigint NOT NULL CHECK (total_minor >= 0),
  currency text NOT NULL DEFAULT 'INR',
  batch_reference text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz
);

CREATE TABLE IF NOT EXISTS payout_items (
  id uuid PRIMARY KEY,
  payout_batch_id uuid NOT NULL REFERENCES payout_batches(id),
  booking_id uuid NOT NULL REFERENCES bookings(id),
  amount_minor bigint NOT NULL CHECK (amount_minor >= 0),
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL DEFAULT 'PENDING',
  provider_reference text
);

CREATE INDEX IF NOT EXISTS disputes_booking_status
  ON disputes(booking_id, status);
CREATE INDEX IF NOT EXISTS payout_items_booking
  ON payout_items(booking_id);
CREATE INDEX IF NOT EXISTS payout_batches_provider_status
  ON payout_batches(provider_id, status);
