import { Suspense } from 'react';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { KpiCard } from '@/components/ui/KpiCard';
import { Card } from '@/components/ui/Card';
import { MonthlyStackedBar } from '@/components/charts/MonthlyStackedBar';
import { TenantTable } from '@/components/admin/TenantTable';
import { AlertPanel } from '@/components/admin/AlertPanel';
import { MonthPicker } from '@/components/ui/MonthPicker';
import { fmt, periodToMonth } from '@/lib/utils';
import { MONTHS_ES } from '@/lib/constants';
import type { MonthlyByProvider, TenantWithMetrics, Provider } from '@/lib/types';

const ALL_PERIODS = [
  '2026-06-01','2026-05-01','2026-04-01',
  '2026-03-01','2026-02-01','2026-01-01',
];

interface Props {
  searchParams: Promise<{ period?: string }>;
}

export default async function AdminPage({ searchParams }: Props) {
  const params = await searchParams;
  const currentPeriod  = params.period ?? ALL_PERIODS[0];
  const periodIndex    = ALL_PERIODS.indexOf(currentPeriod);
  const previousPeriod = ALL_PERIODS[periodIndex + 1] ?? ALL_PERIODS[ALL_PERIODS.length - 1];

  const supabase = await getSupabaseServerClient();

  // Monthly totals for stacked bar (all 6 months always shown)
  const { data: costRaw } = await supabase
    .from('cost_records')
    .select('provider, billing_period, amount_usd')
    .gte('billing_period', '2026-01-01')
    .lte('billing_period', '2026-06-01');

  const monthMap: Record<string, MonthlyByProvider> = {};
  for (const row of costRaw ?? []) {
    const month = periodToMonth(row.billing_period);
    if (!monthMap[month]) monthMap[month] = { mes: month, aws: 0, azure: 0, gcp: 0, oci: 0 };
    monthMap[month][row.provider as Provider] += Number(row.amount_usd);
  }
  const monthlyData = MONTHS_ES.slice(0, 6).map(
    m => monthMap[m] ?? { mes: m, aws: 0, azure: 0, gcp: 0, oci: 0 }
  );

  // KPI: total for selected period
  const currentTotal = (costRaw ?? [])
    .filter(r => r.billing_period === currentPeriod)
    .reduce((s, r) => s + Number(r.amount_usd), 0);

  const prevTotal = (costRaw ?? [])
    .filter(r => r.billing_period === previousPeriod)
    .reduce((s, r) => s + Number(r.amount_usd), 0);

  const trendPct = prevTotal > 0 ? ((currentTotal - prevTotal) / prevTotal) * 100 : 0;

  // Tenants with metrics for selected period
  const { data: tenants }     = await supabase.from('tenants').select('*').neq('status', 'archived');
  const { data: budgets }     = await supabase.from('budgets').select('tenant_id, monthly_amount_usd');
  const { data: alerts }      = await supabase.from('alerts').select('tenant_id, severity').eq('resolved', false);
  const { data: connections } = await supabase.from('cloud_connections').select('tenant_id, provider, status');

  const { data: tenantCosts } = await supabase
    .from('cost_records')
    .select('tenant_id, billing_period, amount_usd')
    .in('billing_period', [currentPeriod, previousPeriod]);

  const tenantsWithMetrics: TenantWithMetrics[] = (tenants ?? []).map(t => {
    const curr = (tenantCosts ?? [])
      .filter(r => r.tenant_id === t.id && r.billing_period === currentPeriod)
      .reduce((s, r) => s + Number(r.amount_usd), 0);
    const prev = (tenantCosts ?? [])
      .filter(r => r.tenant_id === t.id && r.billing_period === previousPeriod)
      .reduce((s, r) => s + Number(r.amount_usd), 0);
    const budget = budgets?.find(b => b.tenant_id === t.id)?.monthly_amount_usd ?? 0;
    const alertCount = (alerts ?? []).filter(a => a.tenant_id === t.id).length;
    const providers = Array.from(new Set(
      (connections ?? [])
        .filter(c => c.tenant_id === t.id && c.status === 'connected')
        .map(c => c.provider as Provider)
    ));
    return {
      ...t,
      current_month_usd: curr,
      prev_month_usd: prev,
      budget_usd: Number(budget),
      alert_count: alertCount,
      providers,
    };
  });

  const openAlerts    = (alerts ?? []).length;
  const criticalCount = (alerts ?? []).filter(a => a.severity === 'critical').length;
  const connectedCount = new Set(
    (connections ?? []).filter(c => c.status === 'connected').map(c => c.provider)
  ).size;

  const { data: alertsFull } = await supabase
    .from('alerts')
    .select('*, tenants(name)')
    .eq('resolved', false)
    .order('created_at', { ascending: false })
    .limit(5);

  const periodLabel = (() => {
    const idx = parseInt(currentPeriod.slice(5, 7), 10) - 1;
    return `${MONTHS_ES[idx]} ${currentPeriod.slice(0, 4)}`;
  })();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-archivo font-700 text-xl text-ink">Dashboard</h1>
          <p className="text-ink-soft text-sm mt-0.5">Consolidado de todos los clientes · {periodLabel}</p>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-xs text-ink-soft">actualizado hoy 06:00</p>
          <Suspense fallback={null}>
            <MonthPicker availableMonths={ALL_PERIODS} />
          </Suspense>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label={`Consumo total · ${periodLabel}`} value={fmt(currentTotal)} trend={trendPct} />
        <KpiCard label="Clientes activos" value={String((tenants ?? []).filter(t => t.status === 'active').length)} sub={`${openAlerts} alertas abiertas`} />
        <KpiCard label="Nubes conectadas" value={String(connectedCount)} sub="de 4 proveedores" />
        <KpiCard label="Alertas abiertas" value={String(openAlerts)} sub={criticalCount > 0 ? `${criticalCount} crítica${criticalCount !== 1 ? 's' : ''}` : 'Sin críticas'} />
      </div>

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

      <Card title="Clientes">
        <TenantTable tenants={tenantsWithMetrics} />
      </Card>
    </div>
  );
}
