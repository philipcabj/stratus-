-- ═══════════════════════════════════════════════════════════════
-- STRATUS FASE 1.5 — Schema additions
-- ═══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────
-- cloud_connections: scope, notes, provider_account_id
-- ─────────────────────────────────────────────
ALTER TABLE cloud_connections
  ADD COLUMN IF NOT EXISTS scope               text NOT NULL DEFAULT 'single_account'
    CHECK (scope IN ('organization', 'single_account')),
  ADD COLUMN IF NOT EXISTS notes              text,
  ADD COLUMN IF NOT EXISTS provider_account_id text;

-- ─────────────────────────────────────────────
-- tenants: contact info + logo
-- ─────────────────────────────────────────────
ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS contact_name  text,
  ADD COLUMN IF NOT EXISTS contact_email text,
  ADD COLUMN IF NOT EXISTS logo_url      text;

-- ─────────────────────────────────────────────
-- profiles: soft-disable flag
-- ─────────────────────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- ─────────────────────────────────────────────
-- tenant_invitations
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tenant_invitations (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id   uuid REFERENCES tenants(id) ON DELETE CASCADE,  -- null = platform_admin invite
  email       text NOT NULL,
  role        text NOT NULL
    CHECK (role IN ('platform_admin', 'tenant_admin', 'tenant_viewer')),
  status      text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  invited_by  uuid NOT NULL REFERENCES auth.users(id),
  created_at  timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz NOT NULL DEFAULT (now() + interval '7 days')
);

CREATE INDEX IF NOT EXISTS idx_invitations_email  ON tenant_invitations (email);
CREATE INDEX IF NOT EXISTS idx_invitations_tenant ON tenant_invitations (tenant_id);

-- ─────────────────────────────────────────────
-- budget_history
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS budget_history (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id   uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  old_amount  numeric(12,2),
  new_amount  numeric(12,2) NOT NULL,
  changed_by  uuid NOT NULL REFERENCES auth.users(id),
  changed_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_budget_history_tenant ON budget_history (tenant_id, changed_at DESC);
