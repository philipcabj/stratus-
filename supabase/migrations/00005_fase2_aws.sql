-- ═══════════════════════════════════════════════════════════════
-- STRATUS FASE 2 — AWS Cost Explorer connector schema
-- ═══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────
-- cloud_connections: modo de conexión + campos AWS
-- ─────────────────────────────────────────────
ALTER TABLE cloud_connections
  ADD COLUMN IF NOT EXISTS connection_mode text NOT NULL DEFAULT 'cross_account_role'
    CHECK (connection_mode IN ('cross_account_role', 'partner_billing'));

-- tenant_id pasa a nullable: partner_billing es conexión de plataforma sin tenant
ALTER TABLE cloud_connections
  ALTER COLUMN tenant_id DROP NOT NULL;

-- Garantizar que cross_account_role siempre tenga tenant_id
ALTER TABLE cloud_connections
  ADD CONSTRAINT chk_tenant_required_for_cross_account
    CHECK (connection_mode = 'partner_billing' OR tenant_id IS NOT NULL);

-- Campos específicos AWS
ALTER TABLE cloud_connections
  ADD COLUMN IF NOT EXISTS role_arn         text,
  ADD COLUMN IF NOT EXISTS external_id      text UNIQUE, -- UUID generado por nosotros (confused deputy prevention)
  ADD COLUMN IF NOT EXISTS aws_account_id   text,
  ADD COLUMN IF NOT EXISTS last_sync_at     timestamptz,
  ADD COLUMN IF NOT EXISTS last_sync_status text
    CHECK (last_sync_status IN ('success', 'error', 'running')),
  ADD COLUMN IF NOT EXISTS last_sync_error  text;

-- ─────────────────────────────────────────────
-- cost_records: índice único para upsert idempotente
-- Clave natural: connection_id + billing_period + service_name
-- Correr la sync dos veces no duplica filas.
-- ─────────────────────────────────────────────
CREATE UNIQUE INDEX IF NOT EXISTS idx_cost_records_upsert
  ON cost_records (connection_id, billing_period, service_name)
  WHERE connection_id IS NOT NULL;
