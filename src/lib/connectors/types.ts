import type { Provider, ServiceCategory } from '@/lib/types';

export interface CostRow {
  tenant_id: string;        // siempre resuelto antes de devolver; en partner_billing lo resuelve el conector
  connection_id: string;
  provider: Provider;
  billing_period: string;   // 'YYYY-MM-DD' — primer día del mes
  service_category: ServiceCategory;
  service_name: string;
  amount_usd: number;
}

export interface SyncResult {
  rows: CostRow[];
  errors: string[];
}

export interface CloudConnector {
  testConnection(): Promise<{ ok: boolean; error?: string }>;
  /**
   * fullSync=true  → últimos 6 meses (primera sync)
   * fullSync=false → mes actual + mes anterior (syncs incrementales)
   * Devuelve rows con tenant_id ya resuelto para que la capa de persistencia
   * sea agnóstica al modo de conexión (cross_account_role o partner_billing).
   */
  syncCosts(opts: { fullSync: boolean }): Promise<SyncResult>;
}
