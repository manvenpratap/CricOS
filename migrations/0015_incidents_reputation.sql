-- Phase 1L: Replacement acceptance, service incident lifecycle, and reputation feedback

CREATE TABLE IF NOT EXISTS service_incidents (
  id uuid PRIMARY KEY,
  booking_id uuid NOT NULL REFERENCES bookings(id),
  type text NOT NULL,
  status text NOT NULL,
  opened_by uuid,
  reason text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

ALTER TABLE replacement_proposals ADD COLUMN IF NOT EXISTS accepted_by uuid;
ALTER TABLE replacement_proposals ADD COLUMN IF NOT EXISTS acceptance_reason text;
ALTER TABLE replacement_proposals ADD COLUMN IF NOT EXISTS replacement_booking_id uuid;
ALTER TABLE replacement_proposals ADD COLUMN IF NOT EXISTS rejected_reason text;
ALTER TABLE replacement_proposals ADD COLUMN IF NOT EXISTS price_delta_minor bigint;
ALTER TABLE replacement_proposals ADD COLUMN IF NOT EXISTS currency text;

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS replaced_booking_id uuid;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS replacement_proposal_id uuid;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS provider_id_snapshot uuid;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS listing_id_snapshot uuid;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS price_minor_snapshot bigint;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS currency_snapshot text;

CREATE TABLE IF NOT EXISTS provider_reputation_events (
  id uuid PRIMARY KEY,
  provider_id uuid NOT NULL REFERENCES providers(id),
  booking_id uuid REFERENCES bookings(id),
  rating_id uuid REFERENCES ratings(id),
  event_type text NOT NULL,
  score_delta numeric(8,5) NOT NULL DEFAULT 0,
  reliability_before numeric(5,4),
  reliability_after numeric(5,4),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS service_incidents_booking_status ON service_incidents(booking_id, status);
CREATE INDEX IF NOT EXISTS replacement_proposals_status ON replacement_proposals(status, created_at);
CREATE INDEX IF NOT EXISTS provider_reputation_provider_created ON provider_reputation_events(provider_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS one_active_replacement_per_booking
  ON replacement_proposals(booking_id)
  WHERE status IN ('ACCEPTED', 'BOOKED');
