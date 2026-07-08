-- ═══════════════════════════════════════════════════════════════
-- STRATUS — SEED DATA
-- Run AFTER migrations. Creates auth users via Supabase admin API
-- or paste directly in Supabase Studio SQL editor.
-- ═══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────
-- AUTH USERS  (use Supabase dashboard Authentication tab or this snippet)
-- ─────────────────────────────────────────────
-- Create users via SQL (only works if you have access to auth schema)
-- If not, create them from Supabase Dashboard > Authentication > Users
-- and then run the rest of this file.

-- Placeholder UUIDs — replace with real auth.users IDs after creating users
-- admin@stratus.io          → '1a9f5d2c-0207-48d7-ad79-49d9d1b6b193'
-- cliente@finanzassur.com   → 'fcf2bd62-6813-4651-b1b0-7eb49f0f20a3'

-- ─────────────────────────────────────────────
-- TENANTS
-- ─────────────────────────────────────────────
INSERT INTO tenants (id, name, slug, status) VALUES
  ('11111111-1111-1111-1111-111111111101', 'Metalúrgica Andes',  'metalurgica-andes',  'active'),
  ('11111111-1111-1111-1111-111111111102', 'Finanzas del Sur',   'finanzas-del-sur',   'active'),
  ('11111111-1111-1111-1111-111111111103', 'Retail Norte SA',    'retail-norte-sa',    'active'),
  ('11111111-1111-1111-1111-111111111104', 'Logística Pampa',    'logistica-pampa',    'active'),
  ('11111111-1111-1111-1111-111111111105', 'AgroTech BA',        'agrotech-ba',        'active');

-- ─────────────────────────────────────────────
-- PROFILES
-- NOTE: Replace UUIDs with real auth.users.id values after creating users.
-- ─────────────────────────────────────────────
INSERT INTO profiles (id, tenant_id, role, full_name) VALUES
  ('1a9f5d2c-0207-48d7-ad79-49d9d1b6b193', NULL,                                   'platform_admin', 'Admin Stratus'),
  ('fcf2bd62-6813-4651-b1b0-7eb49f0f20a3', '11111111-1111-1111-1111-111111111102', 'tenant_admin',   'Carlos Méndez');

-- ─────────────────────────────────────────────
-- CLOUD CONNECTIONS
-- ─────────────────────────────────────────────
-- Metalúrgica Andes
INSERT INTO cloud_connections (tenant_id, provider, display_name, status) VALUES
  ('11111111-1111-1111-1111-111111111101', 'aws',   'AWS Principal',        'connected'),
  ('11111111-1111-1111-1111-111111111101', 'azure', 'Azure Corp',           'connected'),
  ('11111111-1111-1111-1111-111111111101', 'gcp',   'GCP Dev',              'connected'),
  ('11111111-1111-1111-1111-111111111101', 'oci',   'Oracle Cloud',         'pending');

-- Finanzas del Sur
INSERT INTO cloud_connections (tenant_id, provider, display_name, status) VALUES
  ('11111111-1111-1111-1111-111111111102', 'aws',   'AWS Producción',       'connected'),
  ('11111111-1111-1111-1111-111111111102', 'azure', 'Azure Enterprise',     'connected'),
  ('11111111-1111-1111-1111-111111111102', 'gcp',   'GCP Analytics',        'error'),
  ('11111111-1111-1111-1111-111111111102', 'oci',   'OCI Database',         'connected');

-- Retail Norte SA
INSERT INTO cloud_connections (tenant_id, provider, display_name, status) VALUES
  ('11111111-1111-1111-1111-111111111103', 'aws',   'AWS Retail',           'connected'),
  ('11111111-1111-1111-1111-111111111103', 'azure', 'Azure Commerce',       'connected'),
  ('11111111-1111-1111-1111-111111111103', 'gcp',   'GCP BigQuery',         'connected'),
  ('11111111-1111-1111-1111-111111111103', 'oci',   'OCI Backup',           'pending');

-- Logística Pampa
INSERT INTO cloud_connections (tenant_id, provider, display_name, status) VALUES
  ('11111111-1111-1111-1111-111111111104', 'aws',   'AWS Logística',        'connected'),
  ('11111111-1111-1111-1111-111111111104', 'azure', 'Azure Maps',           'connected'),
  ('11111111-1111-1111-1111-111111111104', 'gcp',   'GCP Routing',          'connected'),
  ('11111111-1111-1111-1111-111111111104', 'oci',   'OCI Storage',          'error');

-- AgroTech BA
INSERT INTO cloud_connections (tenant_id, provider, display_name, status) VALUES
  ('11111111-1111-1111-1111-111111111105', 'aws',   'AWS IoT',              'connected'),
  ('11111111-1111-1111-1111-111111111105', 'azure', 'Azure AgroAnalytics',  'connected'),
  ('11111111-1111-1111-1111-111111111105', 'gcp',   'GCP ML Platform',      'connected'),
  ('11111111-1111-1111-1111-111111111105', 'oci',   'OCI Genomics',         'connected');

-- ─────────────────────────────────────────────
-- BUDGETS
-- ─────────────────────────────────────────────
INSERT INTO budgets (tenant_id, monthly_amount_usd, alert_threshold_pct) VALUES
  ('11111111-1111-1111-1111-111111111101', 35000.00, 90),
  ('11111111-1111-1111-1111-111111111102', 22000.00, 85),
  ('11111111-1111-1111-1111-111111111103', 18000.00, 90),
  ('11111111-1111-1111-1111-111111111104', 12000.00, 80),
  ('11111111-1111-1111-1111-111111111105', 14000.00, 90);

-- ─────────────────────────────────────────────
-- COST RECORDS — 6 months (Jan–Jun 2026)
-- Total per month aligned to mockup:
--   Ene ≈ 73k | Feb ≈ 78k | Mar ≈ 83k | Abr ≈ 87k | May ≈ 91k | Jun ≈ 97.3k
-- ─────────────────────────────────────────────

-- ── Metalúrgica Andes (largest tenant, ~35% of total)
DO $$
DECLARE
  tid uuid := '11111111-1111-1111-1111-111111111101';
  periods date[] := ARRAY['2026-01-01','2026-02-01','2026-03-01','2026-04-01','2026-05-01','2026-06-01'];
  aws_totals  numeric[] := ARRAY[9800, 10500, 11200, 11800, 12500, 13200];
  az_totals   numeric[] := ARRAY[4200,  4500,  4800,  5100,  5400,  5700];
  gcp_totals  numeric[] := ARRAY[2100,  2200,  2400,  2500,  2700,  2900];
  oci_totals  numeric[] := ARRAY[ 500,   550,   580,   600,   650,   700];
  i int;
BEGIN
  FOR i IN 1..6 LOOP
    -- AWS
    INSERT INTO cost_records (tenant_id, provider, billing_period, service_category, service_name, amount_usd) VALUES
      (tid,'aws',periods[i],'compute',   'Amazon EC2',         aws_totals[i]*0.42),
      (tid,'aws',periods[i],'database',  'Amazon RDS',         aws_totals[i]*0.22),
      (tid,'aws',periods[i],'storage',   'Amazon S3',          aws_totals[i]*0.18),
      (tid,'aws',periods[i],'networking','AWS Data Transfer',   aws_totals[i]*0.10),
      (tid,'aws',periods[i],'security',  'AWS WAF',            aws_totals[i]*0.08);
    -- Azure
    INSERT INTO cost_records (tenant_id, provider, billing_period, service_category, service_name, amount_usd) VALUES
      (tid,'azure',periods[i],'compute',   'Azure Virtual Machines', az_totals[i]*0.44),
      (tid,'azure',periods[i],'database',  'Azure SQL Database',     az_totals[i]*0.21),
      (tid,'azure',periods[i],'storage',   'Azure Blob Storage',     az_totals[i]*0.17),
      (tid,'azure',periods[i],'networking','Azure VPN Gateway',      az_totals[i]*0.09),
      (tid,'azure',periods[i],'security',  'Microsoft Defender',     az_totals[i]*0.09);
    -- GCP
    INSERT INTO cost_records (tenant_id, provider, billing_period, service_category, service_name, amount_usd) VALUES
      (tid,'gcp',periods[i],'compute',   'Compute Engine',     gcp_totals[i]*0.45),
      (tid,'gcp',periods[i],'database',  'Cloud SQL',          gcp_totals[i]*0.20),
      (tid,'gcp',periods[i],'storage',   'Cloud Storage',      gcp_totals[i]*0.18),
      (tid,'gcp',periods[i],'analytics', 'BigQuery',           gcp_totals[i]*0.17);
    -- OCI
    INSERT INTO cost_records (tenant_id, provider, billing_period, service_category, service_name, amount_usd) VALUES
      (tid,'oci',periods[i],'compute',  'OCI Compute',         oci_totals[i]*0.50),
      (tid,'oci',periods[i],'storage',  'OCI Object Storage',  oci_totals[i]*0.30),
      (tid,'oci',periods[i],'database', 'Oracle Autonomous DB',oci_totals[i]*0.20);
  END LOOP;
END $$;

-- ── Finanzas del Sur (demo tenant — Jun total ≈ 18,420)
DO $$
DECLARE
  tid uuid := '11111111-1111-1111-1111-111111111102';
  periods date[] := ARRAY['2026-01-01','2026-02-01','2026-03-01','2026-04-01','2026-05-01','2026-06-01'];
  totals  numeric[] := ARRAY[14200, 15100, 16300, 17000, 17800, 18420];
  aws_pct  numeric := 0.55;
  az_pct   numeric := 0.30;
  gcp_pct  numeric := 0.10;
  oci_pct  numeric := 0.05;
  i int;
BEGIN
  FOR i IN 1..6 LOOP
    INSERT INTO cost_records (tenant_id, provider, billing_period, service_category, service_name, amount_usd) VALUES
      (tid,'aws',periods[i],'compute',   'Amazon EC2',           totals[i]*aws_pct*0.45),
      (tid,'aws',periods[i],'database',  'Amazon RDS',           totals[i]*aws_pct*0.22),
      (tid,'aws',periods[i],'storage',   'Amazon S3',            totals[i]*aws_pct*0.17),
      (tid,'aws',periods[i],'networking','AWS Data Transfer',    totals[i]*aws_pct*0.09),
      (tid,'aws',periods[i],'security',  'AWS WAF',              totals[i]*aws_pct*0.07),
      (tid,'azure',periods[i],'compute',   'Azure Virtual Machines', totals[i]*az_pct*0.44),
      (tid,'azure',periods[i],'database',  'Azure SQL Database',     totals[i]*az_pct*0.22),
      (tid,'azure',periods[i],'storage',   'Azure Blob Storage',     totals[i]*az_pct*0.17),
      (tid,'azure',periods[i],'networking','Azure VPN Gateway',      totals[i]*az_pct*0.09),
      (tid,'azure',periods[i],'security',  'Microsoft Defender',     totals[i]*az_pct*0.08),
      (tid,'gcp',periods[i],'compute',   'Compute Engine',   totals[i]*gcp_pct*0.50),
      (tid,'gcp',periods[i],'analytics', 'BigQuery',         totals[i]*gcp_pct*0.30),
      (tid,'gcp',periods[i],'storage',   'Cloud Storage',    totals[i]*gcp_pct*0.20),
      (tid,'oci',periods[i],'database',  'Oracle Autonomous DB', totals[i]*oci_pct*0.60),
      (tid,'oci',periods[i],'storage',   'OCI Object Storage',   totals[i]*oci_pct*0.40);
  END LOOP;
END $$;

-- ── Retail Norte SA
DO $$
DECLARE
  tid uuid := '11111111-1111-1111-1111-111111111103';
  periods date[] := ARRAY['2026-01-01','2026-02-01','2026-03-01','2026-04-01','2026-05-01','2026-06-01'];
  aws_totals  numeric[] := ARRAY[8200, 8700, 9100, 9600, 10000, 10600];
  az_totals   numeric[] := ARRAY[3800, 4000, 4300, 4500,  4700,  5000];
  gcp_totals  numeric[] := ARRAY[1500, 1600, 1700, 1800,  1900,  2000];
  i int;
BEGIN
  FOR i IN 1..6 LOOP
    INSERT INTO cost_records (tenant_id, provider, billing_period, service_category, service_name, amount_usd) VALUES
      (tid,'aws',periods[i],'compute',   'Amazon EC2',         aws_totals[i]*0.40),
      (tid,'aws',periods[i],'database',  'Amazon DynamoDB',    aws_totals[i]*0.25),
      (tid,'aws',periods[i],'storage',   'Amazon S3',          aws_totals[i]*0.20),
      (tid,'aws',periods[i],'networking','CloudFront',         aws_totals[i]*0.15),
      (tid,'azure',periods[i],'compute',  'Azure App Service', az_totals[i]*0.45),
      (tid,'azure',periods[i],'database', 'Azure Cosmos DB',  az_totals[i]*0.30),
      (tid,'azure',periods[i],'storage',  'Azure Blob Storage',az_totals[i]*0.25),
      (tid,'gcp',periods[i],'analytics', 'BigQuery',          gcp_totals[i]*0.55),
      (tid,'gcp',periods[i],'compute',   'Compute Engine',    gcp_totals[i]*0.45);
  END LOOP;
END $$;

-- ── Logística Pampa
DO $$
DECLARE
  tid uuid := '11111111-1111-1111-1111-111111111104';
  periods date[] := ARRAY['2026-01-01','2026-02-01','2026-03-01','2026-04-01','2026-05-01','2026-06-01'];
  aws_totals  numeric[] := ARRAY[5100, 5400, 5700, 6000, 6200, 6500];
  az_totals   numeric[] := ARRAY[2800, 3000, 3100, 3300, 3500, 3700];
  gcp_totals  numeric[] := ARRAY[1200, 1300, 1400, 1500, 1600, 1700];
  i int;
BEGIN
  FOR i IN 1..6 LOOP
    INSERT INTO cost_records (tenant_id, provider, billing_period, service_category, service_name, amount_usd) VALUES
      (tid,'aws',periods[i],'compute',   'Amazon EC2',         aws_totals[i]*0.45),
      (tid,'aws',periods[i],'networking','AWS IoT Core',       aws_totals[i]*0.30),
      (tid,'aws',periods[i],'storage',   'Amazon S3',          aws_totals[i]*0.25),
      (tid,'azure',periods[i],'compute',  'Azure Virtual Machines', az_totals[i]*0.50),
      (tid,'azure',periods[i],'analytics','Azure Maps',              az_totals[i]*0.30),
      (tid,'azure',periods[i],'storage',  'Azure Blob Storage',      az_totals[i]*0.20),
      (tid,'gcp',periods[i],'compute',   'Compute Engine',    gcp_totals[i]*0.60),
      (tid,'gcp',periods[i],'networking','Cloud CDN',         gcp_totals[i]*0.40);
  END LOOP;
END $$;

-- ── AgroTech BA
DO $$
DECLARE
  tid uuid := '11111111-1111-1111-1111-111111111105';
  periods date[] := ARRAY['2026-01-01','2026-02-01','2026-03-01','2026-04-01','2026-05-01','2026-06-01'];
  aws_totals  numeric[] := ARRAY[6800, 7200, 7600, 8000, 8400, 8900];
  az_totals   numeric[] := ARRAY[3200, 3400, 3600, 3800, 4000, 4200];
  gcp_totals  numeric[] := ARRAY[1900, 2000, 2100, 2200, 2300, 2400];
  oci_totals  numeric[] := ARRAY[ 700,  750,  800,  850,  900,  950];
  i int;
BEGIN
  FOR i IN 1..6 LOOP
    INSERT INTO cost_records (tenant_id, provider, billing_period, service_category, service_name, amount_usd) VALUES
      (tid,'aws',periods[i],'compute',   'Amazon EC2',         aws_totals[i]*0.40),
      (tid,'aws',periods[i],'analytics', 'AWS SageMaker',      aws_totals[i]*0.35),
      (tid,'aws',periods[i],'storage',   'Amazon S3',          aws_totals[i]*0.25),
      (tid,'azure',periods[i],'analytics','Azure Machine Learning', az_totals[i]*0.45),
      (tid,'azure',periods[i],'compute',  'Azure Virtual Machines', az_totals[i]*0.35),
      (tid,'azure',periods[i],'storage',  'Azure Blob Storage',     az_totals[i]*0.20),
      (tid,'gcp',periods[i],'analytics', 'Vertex AI',         gcp_totals[i]*0.50),
      (tid,'gcp',periods[i],'compute',   'Compute Engine',    gcp_totals[i]*0.30),
      (tid,'gcp',periods[i],'storage',   'Cloud Storage',     gcp_totals[i]*0.20),
      (tid,'oci',periods[i],'compute',   'OCI Compute',        oci_totals[i]*0.45),
      (tid,'oci',periods[i],'database',  'Oracle Autonomous DB',oci_totals[i]*0.35),
      (tid,'oci',periods[i],'storage',   'OCI Object Storage', oci_totals[i]*0.20);
  END LOOP;
END $$;

-- ─────────────────────────────────────────────
-- ALERTS
-- ─────────────────────────────────────────────
INSERT INTO alerts (tenant_id, type, severity, message, resolved) VALUES
  -- Metalúrgica Andes
  ('11111111-1111-1111-1111-111111111101', 'budget_exceeded',  'critical', 'Consumo de AWS superó el presupuesto mensual (103%)', false),
  ('11111111-1111-1111-1111-111111111101', 'new_service',      'info',     'Nuevo servicio detectado: AWS Lambda', false),
  -- Finanzas del Sur
  ('11111111-1111-1111-1111-111111111102', 'budget_forecast',  'warn',     'Proyección fin de mes supera el 90% del presupuesto', false),
  ('11111111-1111-1111-1111-111111111102', 'new_service',      'info',     'Nuevo servicio detectado: Azure Cognitive Services', false),
  -- Retail Norte SA
  ('11111111-1111-1111-1111-111111111103', 'budget_exceeded',  'critical', 'Consumo total superó el presupuesto en un 12%', false),
  ('11111111-1111-1111-1111-111111111103', 'budget_forecast',  'warn',     'A este ritmo el gasto superará el presupuesto en 5 días', false),
  -- Logística Pampa
  ('11111111-1111-1111-1111-111111111104', 'new_service',      'info',     'Nuevo servicio detectado: AWS IoT Greengrass', false),
  ('11111111-1111-1111-1111-111111111104', 'budget_forecast',  'warn',     'Consumo de Azure supera el 80% del límite asignado', false),
  -- AgroTech BA
  ('11111111-1111-1111-1111-111111111105', 'new_service',      'info',     'Nuevo servicio: Oracle Autonomous Data Warehouse', false),
  ('11111111-1111-1111-1111-111111111105', 'budget_forecast',  'warn',     'GCP Vertex AI con crecimiento del 23% este mes', false);
