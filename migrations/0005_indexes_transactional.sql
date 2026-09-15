-- Phase 1B: Transactional infrastructure indexes
CREATE INDEX IF NOT EXISTS events_owner_created
  ON events(owner_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS match_teams_team
  ON match_teams(team_id);
CREATE INDEX IF NOT EXISTS outbox_aggregate
  ON outbox_events(aggregate_type, aggregate_id, created_at DESC);
