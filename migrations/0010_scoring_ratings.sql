-- Phase 1G: Scoring engine & ratings

CREATE TABLE IF NOT EXISTS score_events (
  id uuid PRIMARY KEY,
  match_id uuid NOT NULL REFERENCES matches(id),
  innings_id uuid NOT NULL,
  client_event_id text NOT NULL,
  sequence integer NOT NULL,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(match_id, client_event_id),
  UNIQUE(match_id, sequence)
);

ALTER TABLE matches ADD COLUMN IF NOT EXISTS completed_at timestamptz;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS verified_by uuid;

CREATE TABLE IF NOT EXISTS ratings (
  id uuid PRIMARY KEY,
  booking_id uuid NOT NULL REFERENCES bookings(id),
  rater_user_id uuid NOT NULL REFERENCES users(id),
  rated_provider_id uuid NOT NULL REFERENCES providers(id),
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  status text NOT NULL DEFAULT 'PENDING',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(booking_id, rater_user_id)
);

CREATE INDEX IF NOT EXISTS score_events_match_sequence
  ON score_events(match_id, sequence);
CREATE INDEX IF NOT EXISTS ratings_provider_status
  ON ratings(rated_provider_id, status);
