-- Phase 1H: Tournament operating system

CREATE TABLE IF NOT EXISTS tournaments (
  id uuid PRIMARY KEY,
  owner_user_id uuid NOT NULL REFERENCES users(id),
  name text NOT NULL,
  format text NOT NULL,
  team_count integer NOT NULL CHECK (team_count >= 2),
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'DRAFT',
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (start_date <= end_date)
);

CREATE TABLE IF NOT EXISTS tournament_teams (
  id uuid PRIMARY KEY,
  tournament_id uuid NOT NULL REFERENCES tournaments(id),
  team_id uuid NOT NULL REFERENCES teams(id),
  seed integer,
  UNIQUE(tournament_id, team_id)
);

CREATE TABLE IF NOT EXISTS fixtures (
  id uuid PRIMARY KEY,
  tournament_id uuid NOT NULL REFERENCES tournaments(id),
  home_team_id uuid NOT NULL REFERENCES teams(id),
  away_team_id uuid NOT NULL REFERENCES teams(id),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  venue_listing_id uuid REFERENCES listings(id),
  status text NOT NULL DEFAULT 'SCHEDULED',
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (starts_at < ends_at),
  CHECK (home_team_id <> away_team_id)
);

CREATE TABLE IF NOT EXISTS tournament_requirements (
  id uuid PRIMARY KEY,
  tournament_id uuid NOT NULL REFERENCES tournaments(id),
  category text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  required boolean NOT NULL DEFAULT true,
  scope text NOT NULL DEFAULT 'TOURNAMENT',
  status text NOT NULL DEFAULT 'OPEN',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fixture_requirement_allocations (
  id uuid PRIMARY KEY,
  tournament_requirement_id uuid NOT NULL REFERENCES tournament_requirements(id),
  fixture_id uuid NOT NULL REFERENCES fixtures(id),
  quantity integer NOT NULL CHECK (quantity > 0),
  status text NOT NULL DEFAULT 'PENDING',
  UNIQUE(tournament_requirement_id, fixture_id)
);

CREATE INDEX IF NOT EXISTS fixtures_tournament_time
  ON fixtures(tournament_id, starts_at);
CREATE INDEX IF NOT EXISTS tournament_requirements_status
  ON tournament_requirements(tournament_id, status);
