-- Phase 1I: Fixture templates and scheduling extensions

CREATE TABLE IF NOT EXISTS fixture_templates (
  id uuid PRIMARY KEY,
  tournament_id uuid NOT NULL REFERENCES tournaments(id),
  home_team_id uuid NOT NULL REFERENCES teams(id),
  away_team_id uuid NOT NULL REFERENCES teams(id),
  stage text NOT NULL,
  round integer NOT NULL,
  sequence integer NOT NULL,
  status text NOT NULL DEFAULT 'TEMPLATE',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tournament_id, sequence)
);

ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS result text;
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS reschedule_reason text;

CREATE INDEX IF NOT EXISTS fixture_templates_tournament_round
  ON fixture_templates(tournament_id, round, sequence);
