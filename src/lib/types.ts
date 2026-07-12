export type Provider = 'aws' | 'azure' | 'gcp' | 'oci';
export type ServiceCategory = 'compute' | 'storage' | 'database' | 'networking' | 'security' | 'analytics' | 'other';
export type AlertType = 'budget_exceeded' | 'budget_forecast' | 'new_service';
export type AlertSeverity = 'info' | 'warn' | 'critical';
export type UserRole = 'platform_admin' | 'tenant_admin' | 'tenant_viewer';
export type TenantStatus = 'active' | 'inactive' | 'suspended' | 'archived';
export type ConnectionStatus = 'connected' | 'error' | 'pending';
export type ConnectionScope = 'organization' | 'single_account';
export type ConnectionMode = 'cross_account_role' | 'partner_billing';
export type SyncStatus = 'success' | 'error' | 'running';
export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: TenantStatus;
  contact_name: string | null;
  contact_email: string | null;
  logo_url: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  tenant_id: string | null;
  role: UserRole;
  full_name: string | null;
  is_active: boolean;
  created_at: string;
}

export interface CloudConnection {
  id: string;
  tenant_id: string | null;    // null solo en modo partner_billing
  provider: Provider;
  display_name: string;
  status: ConnectionStatus;
  scope: ConnectionScope;
  connection_mode: ConnectionMode;
  provider_account_id: string | null;
  notes: string | null;
  external_ref: string | null;
  // AWS-specific
  role_arn: string | null;
  external_id: string | null;
  aws_account_id: string | null;
  last_sync_at: string | null;
  last_sync_status: SyncStatus | null;
  last_sync_error: string | null;
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

export interface BudgetHistory {
  id: string;
  tenant_id: string;
  old_amount: number | null;
  new_amount: number;
  changed_by: string;
  changed_at: string;
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

export interface TenantInvitation {
  id: string;
  tenant_id: string | null;
  email: string;
  role: UserRole;
  status: InvitationStatus;
  invited_by: string;
  created_at: string;
  expires_at: string;
}

// Derived / aggregated types used in the UI

export interface TenantWithMetrics extends Tenant {
  current_month_usd: number;
  prev_month_usd: number;
  budget_usd: number;
  alert_count: number;
  providers: Provider[];
  user_count?: number;
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

export interface ProfileWithEmail extends Profile {
  email?: string;
}
