-- Wave 3: Suborders, multi-provider checkout, and tax invoices

CREATE TABLE IF NOT EXISTS suborders (
  id uuid PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES orders(id),
  provider_id uuid NOT NULL REFERENCES providers(id),
  listing_id uuid NOT NULL REFERENCES listings(id),
  slot_id uuid REFERENCES service_slots(id),
  base_price_minor integer NOT NULL,
  platform_fee_minor integer NOT NULL,
  tax_minor integer NOT NULL,
  total_minor integer NOT NULL,
  status text NOT NULL DEFAULT 'CONFIRMED',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS suborders_order_idx ON suborders(order_id);
CREATE INDEX IF NOT EXISTS suborders_provider_idx ON suborders(provider_id);

CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES orders(id),
  invoice_number text NOT NULL UNIQUE,
  customer_name text NOT NULL,
  customer_gstin text,
  gross_base_minor integer NOT NULL,
  platform_fee_minor integer NOT NULL,
  cgst_minor integer NOT NULL,
  sgst_minor integer NOT NULL,
  total_amount_minor integer NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  issued_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS invoices_order_idx ON invoices(order_id);
