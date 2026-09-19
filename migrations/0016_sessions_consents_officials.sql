-- Wave 1: Identity sessions, consents, and official availability desk

CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id),
  token_hash text NOT NULL,
  device_info text,
  ip_address text,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS user_sessions_user_idx ON user_sessions(user_id, revoked_at);

CREATE TABLE IF NOT EXISTS user_consents (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id),
  consent_type text NOT NULL,
  granted boolean NOT NULL DEFAULT true,
  ip_address text,
  granted_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz
);
CREATE INDEX IF NOT EXISTS user_consents_user_idx ON user_consents(user_id, consent_type);

CREATE TABLE IF NOT EXISTS official_profiles (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id),
  role text NOT NULL,
  accreditation_level text NOT NULL DEFAULT 'LEVEL_1',
  match_fee_minor integer NOT NULL DEFAULT 250000,
  bio text,
  verified boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS official_profiles_role_idx ON official_profiles(role, verified);

CREATE TABLE IF NOT EXISTS official_availability_rules (
  id uuid PRIMARY KEY,
  official_id uuid NOT NULL REFERENCES official_profiles(id),
  day_of_week integer NOT NULL,
  start_time text NOT NULL,
  end_time text NOT NULL,
  active boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS official_availability_exceptions (
  id uuid PRIMARY KEY,
  official_id uuid NOT NULL REFERENCES official_profiles(id),
  exception_date date NOT NULL,
  is_available boolean NOT NULL DEFAULT false,
  reason text
);

CREATE TABLE IF NOT EXISTS official_assignments (
  id uuid PRIMARY KEY,
  official_id uuid NOT NULL REFERENCES official_profiles(id),
  match_id text NOT NULL,
  status text NOT NULL DEFAULT 'REQUESTED',
  match_fee_minor integer NOT NULL,
  requested_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz
);
CREATE INDEX IF NOT EXISTS official_assignments_official_idx ON official_assignments(official_id, status);
