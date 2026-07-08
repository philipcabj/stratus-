export type Provider = 'aws' | 'azure' | 'gcp' | 'oci';
export type ServiceCategory = 'compute' | 'storage' | 'database' | 'networking' | 'security' | 'analytics' | 'other';
export type AlertType = 'budget_exceeded' | 'budget_forecast' | 'new_service';
export type AlertSeverity = 'info' | 'warn' | 'critical';
export type UserRole = 'platform_admin' | 'tenant_admin' | 'tenant_viewer';
export type TenantStatus = 'active' | 'inactive' | 'suspended';
export type ConnectionStatus = 'connected' | 'error' | 'pending';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: TenantStatus;
  created_at: string;
}

export interface Profile {
  id: string;
  tenant_id: string | null;
  role: UserRole;
  full_name: string | null;
  created_at: string;
}

export interface CloudConnection {
  id: string;
  tenant_id: string;
  provider: Provider;
  display_name: string;
  status: ConnectionStatus;
  external_ref: string | null;
  created_at: string;
}

export interface CostRecord {
  id: string;
  tenant_id: string;
  connection_id: string | null;
  provider: Provider;
  billing_period: string;
  service_category: ServiceCategory;
  service_name: string;
  amount_usd: number;
  created_at: string;
}

export interface Budget {
  id: string;
  tenant_id: string;
  monthly_amount_usd: number;
  alert_threshold_pct: number;
  created_at: string;
}

export interface Alert {
  id: string;
  tenant_id: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  resolved: boolean;
  created_at: string;
}

// Derived / aggregated types used in the UI

export interface TenantWithMetrics extends Tenant {
  current_month_usd: number;
  prev_month_usd: number;
  budget_usd: number;
  alert_count: number;
  providers: Provider[];
}

export interface MonthlyByProvider {
  mes: string;
  aws: number;
  azure: number;
  gcp: number;
  oci: number;
}

export interface MonthlyTotal {
  mes: string;
  usd: number;
}

export interface ServiceCategorySummary {
  category: ServiceCategory;
  service_name: string;
  amount_usd: number;
  pct: number;
}

export interface ProviderSummary {
  provider: Provider;
  amount_usd: number;
  pct: number;
}
