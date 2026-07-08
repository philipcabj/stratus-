-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────
-- TENANTS
-- ─────────────────────────────────────────────
CREATE TABLE tenants (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       text NOT NULL,
  slug       text NOT NULL UNIQUE,
  status     text NOT NULL DEFAULT 'active'
               CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────
-- PROFILES  (1-to-1 with auth.users)
-- ─────────────────────────────────────────────
CREATE TABLE profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id  uuid REFERENCES tenants(id),        -- NULL for platform_admin
  role       text NOT NULL
               CHECK (role IN ('platform_admin', 'tenant_admin', 'tenant_viewer')),
  full_name  text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────
-- CLOUD CONNECTIONS
-- ─────────────────────────────────────────────
CREATE TABLE cloud_connections (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id    uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  provider     text NOT NULL CHECK (provider IN ('aws', 'azure', 'gcp', 'oci')),
  display_name text NOT NULL,
  status       text NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('connected', 'error', 'pending')),
  external_ref text,   -- safe reference to external secrets vault; never plaintext creds
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────
-- COST RECORDS
-- ─────────────────────────────────────────────
CREATE TABLE cost_records (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id        uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  connection_id    uuid REFERENCES cloud_connections(id),
  provider         text NOT NULL CHECK (provider IN ('aws', 'azure', 'gcp', 'oci')),
  billing_period   date NOT NULL,   -- first day of the billing month
  service_category text NOT NULL
    CHECK (service_category IN ('compute','storage','database','networking','security','analytics','other')),
  service_name     text NOT NULL,   -- native provider name e.g. "Amazon EC2"
  amount_usd       numeric(12,2) NOT NULL,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_cost_records_tenant_period   ON cost_records (tenant_id, billing_period);
CREATE INDEX idx_cost_records_tenant_provider ON cost_records (tenant_id, provider);

-- ─────────────────────────────────────────────
-- BUDGETS
-- ─────────────────────────────────────────────
CREATE TABLE budgets (
  id                   uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id            uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  monthly_amount_usd   numeric(12,2) NOT NULL,
  alert_threshold_pct  integer NOT NULL DEFAULT 90,
  created_at           timestamptz NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────
-- ALERTS
-- ─────────────────────────────────────────────
CREATE TABLE alerts (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id  uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  type       text NOT NULL CHECK (type IN ('budget_exceeded', 'budget_forecast', 'new_service')),
  severity   text NOT NULL CHECK (severity IN ('info', 'warn', 'critical')),
  message    text NOT NULL,
  resolved   boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────
-- AUTO-CREATE PROFILE ON SIGNUP
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, role, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'tenant_viewer'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();
