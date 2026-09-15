-- Phase 1J: Operations dashboard, rescheduling & notifications

ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS last_revalidated_at timestamptz;

CREATE TABLE IF NOT EXISTS fixture_reschedule_attempts (
  id uuid PRIMARY KEY,
  fixture_id uuid NOT NULL REFERENCES fixtures(id),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'PENDING',
  conflict_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fixture_resource_status (
  id uuid PRIMARY KEY,
  tournament_id uuid NOT NULL REFERENCES tournaments(id),
  fixture_id uuid NOT NULL REFERENCES fixtures(id),
  booking_id uuid REFERENCES bookings(id),
  provider_id uuid REFERENCES providers(id),
  validation_status text NOT NULL,
  validated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notification_jobs (
  id uuid PRIMARY KEY,
  event_id uuid NOT NULL,
  channel text NOT NULL,
  recipient_type text NOT NULL,
  status text NOT NULL DEFAULT 'PENDING',
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  delivered_at timestamptz
);

CREATE INDEX IF NOT EXISTS fixture_resource_status_tournament
  ON fixture_resource_status(tournament_id, validation_status);
CREATE INDEX IF NOT EXISTS notification_jobs_status
  ON notification_jobs(status, created_at);
CREATE INDEX IF NOT EXISTS reschedule_attempt_fixture
  ON fixture_reschedule_attempts(fixture_id, created_at DESC);
