-- Cricket Platform — Core Schema
-- Reconciled baseline from starter repo + Phase 1D commercial model
-- Uses order_items (per-listing) instead of order_suborders (per-provider)

CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ============================================================
-- IDENTITY
-- ============================================================

CREATE TABLE users (
  id uuid PRIMARY KEY,
  status text NOT NULL DEFAULT 'ACTIVE',
  timezone text NOT NULL DEFAULT 'Asia/Kolkata',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE user_roles (
  user_id uuid NOT NULL REFERENCES users(id),
  role text NOT NULL,
  granted_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  PRIMARY KEY (user_id, role)
);

-- ============================================================
-- TEAMS
-- ============================================================

CREATE TABLE teams (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  owner_user_id uuid NOT NULL REFERENCES users(id),
  status text NOT NULL DEFAULT 'ACTIVE',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE team_memberships (
  id uuid PRIMARY KEY,
  team_id uuid NOT NULL REFERENCES teams(id),
  user_id uuid NOT NULL REFERENCES users(id),
  role text NOT NULL,
  joined_at timestamptz NOT NULL DEFAULT now(),
  left_at timestamptz
);
CREATE UNIQUE INDEX team_membership_active_uq
  ON team_memberships(team_id, user_id) WHERE left_at IS NULL;

-- ============================================================
-- LOCATIONS & VENUES
-- ============================================================

CREATE TABLE locations (
  id uuid PRIMARY KEY,
  address_line text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  country text NOT NULL DEFAULT 'India',
  timezone text NOT NULL DEFAULT 'Asia/Kolkata'
);

CREATE TABLE venues (
  id uuid PRIMARY KEY,
  location_id uuid NOT NULL REFERENCES locations(id),
  name text NOT NULL,
  status text NOT NULL DEFAULT 'ACTIVE'
);

-- ============================================================
-- PROVIDERS & LISTINGS
-- ============================================================

CREATE TABLE providers (
  id uuid PRIMARY KEY,
  owner_user_id uuid NOT NULL REFERENCES users(id),
  provider_type text NOT NULL,
  display_name text NOT NULL,
  status text NOT NULL DEFAULT 'ACTIVE'
);

CREATE TABLE listings (
  id uuid PRIMARY KEY,
  provider_id uuid NOT NULL REFERENCES providers(id),
  category text NOT NULL,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'ACTIVE',
  pricing_model text NOT NULL,
  base_price_minor bigint NOT NULL CHECK (base_price_minor >= 0),
  currency text NOT NULL DEFAULT 'INR'
);

CREATE TABLE availability_rules (
  id uuid PRIMARY KEY,
  provider_id uuid NOT NULL REFERENCES providers(id),
  weekday smallint NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  start_local time NOT NULL,
  end_local time NOT NULL,
  timezone text NOT NULL DEFAULT 'Asia/Kolkata',
  valid_from date,
  valid_to date
);

CREATE TABLE service_slots (
  id uuid PRIMARY KEY,
  listing_id uuid NOT NULL REFERENCES listings(id),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'AVAILABLE',
  capacity integer NOT NULL DEFAULT 1 CHECK (capacity > 0),
  version integer NOT NULL DEFAULT 1,
  CHECK (starts_at < ends_at)
);
CREATE INDEX service_slots_lookup
  ON service_slots(listing_id, starts_at, status);

-- ============================================================
-- EVENTS & MATCHES
-- ============================================================

CREATE TABLE events (
  id uuid PRIMARY KEY,
  type text NOT NULL,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'DRAFT',
  owner_user_id uuid NOT NULL REFERENCES users(id),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  timezone text NOT NULL,
  venue_id uuid REFERENCES venues(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (starts_at < ends_at)
);

CREATE TABLE matches (
  id uuid PRIMARY KEY,
  event_id uuid NOT NULL UNIQUE REFERENCES events(id),
  ruleset_version text NOT NULL,
  format text NOT NULL,
  status text NOT NULL DEFAULT 'DRAFT',
  scheduled_at timestamptz NOT NULL
);

CREATE TABLE match_teams (
  match_id uuid NOT NULL REFERENCES matches(id),
  team_id uuid NOT NULL REFERENCES teams(id),
  side text NOT NULL CHECK (side IN ('HOME','AWAY')),
  PRIMARY KEY(match_id, side),
  UNIQUE(match_id, team_id)
);

-- ============================================================
-- EVENT BASKET (resource requirements graph)
-- ============================================================

CREATE TABLE event_requirements (
  id uuid PRIMARY KEY,
  event_id uuid NOT NULL REFERENCES events(id),
  category text NOT NULL,
  required boolean NOT NULL DEFAULT true,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'OPEN'
);

CREATE TABLE event_baskets (
  id uuid PRIMARY KEY,
  event_id uuid NOT NULL UNIQUE REFERENCES events(id),
  status text NOT NULL DEFAULT 'OPEN',
  readiness_percent integer NOT NULL DEFAULT 0
    CHECK (readiness_percent BETWEEN 0 AND 100),
  committed_cost_minor bigint NOT NULL DEFAULT 0
    CHECK (committed_cost_minor >= 0),
  currency text NOT NULL DEFAULT 'INR',
  version integer NOT NULL DEFAULT 1
);

CREATE TABLE basket_items (
  id uuid PRIMARY KEY,
  basket_id uuid NOT NULL REFERENCES event_baskets(id),
  requirement_id uuid NOT NULL REFERENCES event_requirements(id),
  listing_id uuid REFERENCES listings(id),
  slot_id uuid REFERENCES service_slots(id),
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  status text NOT NULL DEFAULT 'UNRESOLVED',
  price_snapshot jsonb
);

-- ============================================================
-- INVENTORY HOLDS
-- ============================================================

CREATE TABLE inventory_holds (
  id uuid PRIMARY KEY,
  slot_id uuid NOT NULL REFERENCES service_slots(id),
  owner_user_id uuid NOT NULL REFERENCES users(id),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'ACTIVE',
  idempotency_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX inventory_hold_idem_uq
  ON inventory_holds(owner_user_id, idempotency_key);
CREATE INDEX inventory_hold_expiry
  ON inventory_holds(status, expires_at);

-- ============================================================
-- ORDERS & PAYMENTS (Phase 1D order_items model)
-- ============================================================

CREATE TABLE orders (
  id uuid PRIMARY KEY,
  event_id uuid NOT NULL REFERENCES events(id),
  basket_id uuid NOT NULL REFERENCES event_baskets(id),
  buyer_user_id uuid NOT NULL REFERENCES users(id),
  status text NOT NULL DEFAULT 'CHECKOUT',
  currency text NOT NULL DEFAULT 'INR',
  subtotal_minor bigint NOT NULL DEFAULT 0
    CHECK (subtotal_minor >= 0),
  fee_minor bigint NOT NULL DEFAULT 0
    CHECK (fee_minor >= 0),
  tax_minor bigint NOT NULL DEFAULT 0
    CHECK (tax_minor >= 0),
  discount_minor bigint NOT NULL DEFAULT 0
    CHECK (discount_minor >= 0),
  total_minor bigint NOT NULL DEFAULT 0
    CHECK (total_minor >= 0),
  checkout_idempotency_key text NOT NULL,
  policy_snapshot jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(buyer_user_id, checkout_idempotency_key)
);

CREATE TABLE order_items (
  id uuid PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES orders(id),
  provider_id uuid NOT NULL REFERENCES providers(id),
  listing_id uuid NOT NULL REFERENCES listings(id),
  slot_id uuid REFERENCES service_slots(id),
  hold_id uuid REFERENCES inventory_holds(id),
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price_minor bigint NOT NULL CHECK (unit_price_minor >= 0),
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL DEFAULT 'PENDING'
);

CREATE TABLE payment_intents (
  id uuid PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES orders(id),
  provider_intent_id text NOT NULL,
  amount_minor bigint NOT NULL CHECK (amount_minor >= 0),
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL DEFAULT 'CREATED',
  idempotency_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  captured_at timestamptz,
  UNIQUE(order_id, idempotency_key),
  UNIQUE(provider_intent_id)
);

CREATE TABLE payment_webhook_events (
  id uuid PRIMARY KEY,
  provider_event_id text NOT NULL UNIQUE,
  event_type text NOT NULL DEFAULT 'UNKNOWN',
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  received_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- BOOKINGS
-- ============================================================

CREATE TABLE bookings (
  id uuid PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES orders(id),
  listing_id uuid NOT NULL REFERENCES listings(id),
  slot_id uuid NOT NULL REFERENCES service_slots(id),
  event_id uuid NOT NULL REFERENCES events(id),
  status text NOT NULL DEFAULT 'PENDING',
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  cancellation_policy_snapshot jsonb,
  cancellation_reason text,
  no_show boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX bookings_slot_time
  ON bookings(slot_id, starts_at, ends_at, status);

-- ============================================================
-- INFRASTRUCTURE
-- ============================================================

CREATE TABLE outbox_events (
  id uuid PRIMARY KEY,
  event_type text NOT NULL,
  aggregate_type text NOT NULL,
  aggregate_id uuid NOT NULL,
  payload jsonb NOT NULL,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX outbox_unpublished
  ON outbox_events(created_at) WHERE published_at IS NULL;

CREATE TABLE audit_events (
  id uuid PRIMARY KEY,
  actor_user_id uuid REFERENCES users(id),
  action text NOT NULL,
  object_type text NOT NULL,
  object_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_object
  ON audit_events(object_type, object_id, created_at DESC);
