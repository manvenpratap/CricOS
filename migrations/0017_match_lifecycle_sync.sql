-- Wave 2: Match lifecycle, rules configuration, and scoring synchronization

ALTER TABLE matches ADD COLUMN IF NOT EXISTS rules_configuration jsonb;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS pause_history jsonb;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS score_verified_by text;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS score_verified_at timestamptz;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS published_at timestamptz;

CREATE TABLE IF NOT EXISTS match_timelines (
  id uuid PRIMARY KEY,
  match_id text NOT NULL,
  event_type text NOT NULL,
  description text NOT NULL,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS match_timelines_match_idx ON match_timelines(match_id, created_at);
