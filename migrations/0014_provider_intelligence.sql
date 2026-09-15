-- Phase 1K: Provider intelligence & replacement proposals

ALTER TABLE providers ADD COLUMN IF NOT EXISTS avg_rating numeric(4,3) NOT NULL DEFAULT 3.500;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS reliability_score numeric(5,4) NOT NULL DEFAULT 0.5000;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS service_radius_km numeric(8,2) NOT NULL DEFAULT 50.00;

CREATE TABLE IF NOT EXISTS replacement_proposals (
  id uuid PRIMARY KEY,
  booking_id uuid NOT NULL REFERENCES bookings(id),
  provider_id uuid NOT NULL REFERENCES providers(id),
  listing_id uuid NOT NULL REFERENCES listings(id),
  slot_id uuid REFERENCES service_slots(id),
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'PROPOSED',
  created_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz,
  rejected_at timestamptz
);

CREATE INDEX IF NOT EXISTS replacement_proposals_booking_status
  ON replacement_proposals(booking_id, status);
