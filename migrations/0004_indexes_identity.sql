-- Phase 1A: Performance indexes for identity, teams, events, requirements
CREATE INDEX IF NOT EXISTS events_owner_status
  ON events(owner_user_id, status);
CREATE INDEX IF NOT EXISTS team_memberships_user_active
  ON team_memberships(user_id) WHERE left_at IS NULL;
CREATE INDEX IF NOT EXISTS event_requirements_event_status
  ON event_requirements(event_id, status);
