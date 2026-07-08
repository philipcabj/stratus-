import { getSupabaseServerClient } from '@/lib/supabase/server';
import { KpiCard } from '@/components/ui/KpiCard';
import { Card } from '@/components/ui/Card';
import { MonthlyStackedBar } from '@/components/charts/MonthlyStackedBar';
import { TenantTable } from '@/components/admin/TenantTable';
import { AlertPanel } from '@/components/admin/AlertPanel';
import { fmt, periodToMonth } from '@/lib/utils';
import { MONTHS_ES } from '@/lib/constants';
import type { MonthlyByProvider, TenantWithMetrics, Provider } from '@/lib/types';

const CURRENT_PERIOD  = '2026-06-01';
const PREVIOUS_PERIOD = '2026-05-01';

export default async function AdminPage() {
  const supabase = await getSupabaseServerClient();

  // ── Monthly totals by provider (last 6 months) for the stacked bar
  const { data: costRaw } = await supabase
    .from('cost_records')
    .select('provider, billing_period, amount_usd')
    .gte('billing_period', '2026-01-01')
    .lte('billing_period', CURRENT_PERIOD);

  const monthMap: Record<string, MonthlyByProvider> = {};
  for (const row of costRaw ?? []) {
    const month = periodToMonth(row.billing_period);
    if (!monthMap[month]) monthMap[month] = { mes: month, aws: 0, azure: 0, gcp: 0, oci: 0 };
    monthMap[month][row.provider as Provider] += Number(row.amount_usd);
  }
  const monthlyData = MONTHS_ES.slice(0, 6).map(m => monthMap[m] ?? { mes: m, aws: 0, azure: 0, gcp: 0, oci: 0 });

  // ── KPI: total current month
  const currentTotal = (costRaw ?? [])
    .filter(r => r.billing_period === CURRENT_PERIOD)
    .reduce((s, r) => s + Number(r.amount_usd), 0);

  const prevTotal = (costRaw ?? [])
    .filter(r => r.billing_period === PREVIOUS_PERIOD)
    .reduce((s, r) => s + Number(r.amount_usd), 0);

  const trendPct = prevTotal > 0 ? ((currentTotal - prevTotal) / prevTotal) * 100 : 0;

  // ── Tenants with metrics
  const { data: tenants } = await supabase.from('tenants').select('*');
  const { data: budgets } = await supabase.from('budgets').select('tenant_id, monthly_amount_usd');
  const { data: alerts }  = await supabase.from('alerts').select('tenant_id, severity').eq('resolved', false);
  const { data: connections } = await supabase.from('cloud_connections').select('tenant_id, provider, status');

  // Per-tenant current + prev month costs
  const { data: tenantCosts } = await supabase
    .from('cost_records')
    .select('tenant_id, billing_period, amount_usd')
    .in('billing_period', [CURRENT_PERIOD, PREVIOUS_PERIOD]);

  const tenantsWithMetrics: TenantWithMetrics[] = (tenants ?? []).map(t => {
    const curr = (tenantCosts ?? [])
      .filter(r => r.tenant_id === t.id && r.billing_period === CURRENT_PERIOD)
      .reduce((s, r) => s + Number(r.amount_usd), 0);
    const prev = (tenantCosts ?? [])
      .filter(r => r.tenant_id === t.id && r.billing_period === PREVIOUS_PERIOD)
      .reduce((s, r) => s + Number(r.amount_usd), 0);
    const budget = budgets?.find(b => b.tenant_id === t.id)?.monthly_amount_usd ?? 0;
    const alertCount = (alerts ?? []).filter(a => a.tenant_id === t.id).length;
    const providers = Array.from(new Set(
      (connections ?? [])
        .filter(c => c.tenant_id === t.id && c.status === 'connected')
        .map(c => c.provider as Provider)
    ));
    return { ...t, current_month_usd: curr, prev_month_usd: prev, budget_usd: Number(budget), alert_count: alertCount, providers };
  });

  // ── Alert KPIs
  const openAlerts    = (alerts ?? []).length;
  const criticalCount = (alerts ?? []).filter(a => a.severity === 'critical').length;

  // ── Connected clouds
  const connectedCount = new Set(
    (connections ?? []).filter(c => c.status === 'connected').map(c => c.provider)
  ).size;

  // ── Fetch recent alerts with tenant name for the panel
  const { data: alertsFull } = await supabase
    .from('alerts')
    .select('*, tenants(name)')
    .eq('resolved', false)
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-archivo font-700 text-xl text-ink">Dashboard</h1>
          <p className="text-ink-soft text-sm mt-0.5">Consolidado de todos los clientes · Junio 2026</p>
        </div>
        <p className="text-xs text-ink-soft">actualizado hoy 06:00</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Consumo total · Junio"
          value={fmt(currentTotal)}
          trend={trendPct}
        />
        <KpiCard
          label="Clientes activos"
          value={String((tenants ?? []).filter(t => t.status === 'active').length)}
          sub={`${openAlerts} alertas abiertas`}
        />
        <KpiCard
          label="Nubes conectadas"
          value={String(connectedCount)}
          sub="de 4 proveedores"
        />
        <KpiCard
          label="Alertas abiertas"
          value={String(openAlerts)}
          sub={criticalCount > 0 ? `${criticalCount} crítica${criticalCount !== 1 ? 's' : ''}` : 'Sin críticas'}
        />
      </div>

      {/* Charts + Alerts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <Card title="Consumo mensual por nube">
            <MonthlyStackedBar data={monthlyData} />
          </Card>
        </div>
        <div>
          <Card title="Alertas recientes">
            <AlertPanel alerts={alertsFull ?? []} />
          </Card>
        </div>
      </div>

      {/* Tenant table */}
      <Card title="Clientes">
        <TenantTable tenants={tenantsWithMetrics} />
      </Card>
    </div>
  );
}
