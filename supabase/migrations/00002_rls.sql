-- ─────────────────────────────────────────────
-- ENABLE RLS
-- ─────────────────────────────────────────────
ALTER TABLE tenants           ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_records      ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets           ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts            ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────
-- HELPER FUNCTIONS (SECURITY DEFINER → bypass RLS when reading profiles)
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS text AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION current_user_tenant_id()
RETURNS uuid AS $$
  SELECT tenant_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ─────────────────────────────────────────────
-- TENANTS
-- ─────────────────────────────────────────────
CREATE POLICY "platform_admin: all tenants"
  ON tenants FOR ALL
  USING (current_user_role() = 'platform_admin');

CREATE POLICY "tenant users: own tenant"
  ON tenants FOR SELECT
  USING (id = current_user_tenant_id());

-- ─────────────────────────────────────────────
-- PROFILES
-- ─────────────────────────────────────────────
CREATE POLICY "platform_admin: all profiles"
  ON profiles FOR ALL
  USING (current_user_role() = 'platform_admin');

CREATE POLICY "users: own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

-- ─────────────────────────────────────────────
-- CLOUD CONNECTIONS
-- ─────────────────────────────────────────────
CREATE POLICY "platform_admin: all connections"
  ON cloud_connections FOR ALL
  USING (current_user_role() = 'platform_admin');

CREATE POLICY "tenant users: own connections (read)"
  ON cloud_connections FOR SELECT
  USING (tenant_id = current_user_tenant_id());

CREATE POLICY "tenant_admin: own connections (write)"
  ON cloud_connections FOR INSERT
  WITH CHECK (
    current_user_role() = 'tenant_admin'
    AND tenant_id = current_user_tenant_id()
  );

CREATE POLICY "tenant_admin: own connections (update)"
  ON cloud_connections FOR UPDATE
  USING (
    current_user_role() = 'tenant_admin'
    AND tenant_id = current_user_tenant_id()
  );

-- ─────────────────────────────────────────────
-- COST RECORDS
-- ─────────────────────────────────────────────
CREATE POLICY "platform_admin: all cost_records"
  ON cost_records FOR ALL
  USING (current_user_role() = 'platform_admin');

CREATE POLICY "tenant users: own cost_records"
  ON cost_records FOR SELECT
  USING (tenant_id = current_user_tenant_id());

-- ─────────────────────────────────────────────
-- BUDGETS
-- ─────────────────────────────────────────────
CREATE POLICY "platform_admin: all budgets"
  ON budgets FOR ALL
  USING (current_user_role() = 'platform_admin');

CREATE POLICY "tenant users: own budgets (read)"
  ON budgets FOR SELECT
  USING (tenant_id = current_user_tenant_id());

CREATE POLICY "tenant_admin: own budgets (write)"
  ON budgets FOR INSERT
  WITH CHECK (
    current_user_role() = 'tenant_admin'
    AND tenant_id = current_user_tenant_id()
  );

CREATE POLICY "tenant_admin: own budgets (update)"
  ON budgets FOR UPDATE
  USING (
    current_user_role() = 'tenant_admin'
    AND tenant_id = current_user_tenant_id()
  );

-- ─────────────────────────────────────────────
-- ALERTS
-- ─────────────────────────────────────────────
CREATE POLICY "platform_admin: all alerts"
  ON alerts FOR ALL
  USING (current_user_role() = 'platform_admin');

CREATE POLICY "tenant users: own alerts"
  ON alerts FOR SELECT
  USING (tenant_id = current_user_tenant_id());
