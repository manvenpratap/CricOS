-- Wave 4: Contextual conversations, admin dispute queue, and commercial policies

CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY,
  event_id uuid,
  booking_id uuid,
  title text NOT NULL,
  context_type text NOT NULL DEFAULT 'MATCH',
  created_by_user_id uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS conversations_event_idx ON conversations(event_id);
CREATE INDEX IF NOT EXISTS conversations_booking_idx ON conversations(booking_id);

CREATE TABLE IF NOT EXISTS conversation_messages (
  id uuid PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES conversations(id),
  sender_user_id uuid NOT NULL REFERENCES users(id),
  message_type text NOT NULL DEFAULT 'TEXT',
  content text NOT NULL,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS conversation_messages_conv_idx ON conversation_messages(conversation_id, created_at);

CREATE TABLE IF NOT EXISTS admin_cases (
  id text PRIMARY KEY,
  case_type text NOT NULL,
  entity_name text NOT NULL,
  amount_minor integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'PENDING_REVIEW',
  assigned_to text,
  recommendation text,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

CREATE TABLE IF NOT EXISTS commercial_policies (
  id uuid PRIMARY KEY,
  version text NOT NULL UNIQUE,
  fee_percentage numeric(4,2) NOT NULL DEFAULT 5.00,
  gst_percentage numeric(4,2) NOT NULL DEFAULT 18.00,
  cancellation_bands jsonb NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
