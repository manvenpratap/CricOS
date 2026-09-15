-- Phase 1D: Checkout & payments indexes
-- Tables already created in 0001_core.sql (order_items, payment_intents, payment_webhook_events)
CREATE INDEX IF NOT EXISTS orders_event_status
  ON orders(event_id, status);
CREATE INDEX IF NOT EXISTS order_items_provider_status
  ON order_items(provider_id, status);
