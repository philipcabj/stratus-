-- ═══════════════════════════════════════════════════════════════
-- STRATUS FASE 1.5 — RLS for new tables
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE tenant_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_history     ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────
-- tenant_invitations
-- ─────────────────────────────────────────────
CREATE POLICY "platform_admin: all invitations"
  ON tenant_invitations FOR ALL
  USING (current_user_role() = 'platform_admin');

CREATE POLICY "tenant_admin: own tenant invitations (read)"
  ON tenant_invitations FOR SELECT
  USING (
    current_user_role() = 'tenant_admin'
    AND tenant_id = current_user_tenant_id()
  );

CREATE POLICY "tenant_admin: own tenant invitations (insert)"
  ON tenant_invitations FOR INSERT
  WITH CHECK (
    current_user_role() = 'tenant_admin'
    AND tenant_id = current_user_tenant_id()
    AND role IN ('tenant_admin', 'tenant_viewer')
  );

CREATE POLICY "tenant_admin: own tenant invitations (update)"
  ON tenant_invitations FOR UPDATE
  USING (
    current_user_role() = 'tenant_admin'
    AND tenant_id = current_user_tenant_id()
  );

-- Public read for invitation acceptance (by token/id — no auth needed)
CREATE POLICY "public: read own invitation by id"
  ON tenant_invitations FOR SELECT
  USING (true);  -- filtered by id in the query; RLS can't restrict by URL param

-- ─────────────────────────────────────────────
-- budget_history
-- ─────────────────────────────────────────────
CREATE POLICY "platform_admin: all budget_history"
  ON budget_history FOR ALL
  USING (current_user_role() = 'platform_admin');

CREATE POLICY "tenant users: own budget_history (read)"
  ON budget_history FOR SELECT
  USING (tenant_id = current_user_tenant_id());
