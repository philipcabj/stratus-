import { getSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { KpiCard } from '@/components/ui/KpiCard';
import { Card } from '@/components/ui/Card';
import { ClientAreaChart } from '@/components/charts/ClientAreaChart';
import { ProviderDonut } from '@/components/charts/ProviderDonut';
import { fmt, fmtPct, periodToMonth, projectEndOfMonth } from '@/lib/utils';
import { MONTHS_ES, CATEGORY_LABELS, PROVIDER_COLORS } from '@/lib/constants';
import type { MonthlyTotal, ServiceCategorySummary, ProviderSummary, Provider, ServiceCategory } from '@/lib/types';

const CURRENT_PERIOD  = '2026-06-01';
const PREVIOUS_PERIOD = '2026-05-01';

interface Props {
  searchParams: Promise<{ tenant?: string; name?: string }>;
}

export default async function DashboardPage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = await getSupabaseServerClient();

  // Determine which tenant to display
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, tenant_id')
    .eq('id', user.id)
    .single();

  let tenantId: string | null = null;

  if (profile?.role === 'platform_admin') {
    // Must have a tenant param when impersonating
    tenantId = params.tenant ?? null;
    if (!tenantId) redirect('/admin');
  } else {
    tenantId = profile?.tenant_id ?? null;
    if (!tenantId) redirect('/login');
  }

  // ── 6-month evolution
  const { data: monthly } = await supabase
    .from('cost_records')
    .select('billing_period, amount_usd')
    .eq('tenant_id', tenantId)
    .gte('billing_period', '2026-01-01')
    .lte('billing_period', CURRENT_PERIOD);

  const monthMap: Record<string, number> = {};
  for (const row of monthly ?? []) {
    const m = periodToMonth(row.billing_period);
    monthMap[m] = (monthMap[m] ?? 0) + Number(row.amount_usd);
  }
  const evolutionData: MonthlyTotal[] = MONTHS_ES.slice(0, 6).map(m => ({
    mes: m,
    usd: monthMap[m] ?? 0,
  }));

  // ── Current month totals
  const currentMonthRecords = (monthly ?? []).filter(r => r.billing_period === CURRENT_PERIOD);
  const currentTotal = currentMonthRecords.reduce((s, r) => s + Number(r.amount_usd), 0);

  const prevMonthRecords = (monthly ?? []).filter(r => r.billing_period === PREVIOUS_PERIOD);
  const prevTotal = prevMonthRecords.reduce((s, r) => s + Number(r.amount_usd), 0);

  const trendPct = prevTotal > 0 ? ((currentTotal - prevTotal) / prevTotal) * 100 : 0;
  const projection = projectEndOfMonth(currentTotal);

  // ── Budget
  const { data: budget } = await supabase
    .from('budgets')
    .select('monthly_amount_usd')
    .eq('tenant_id', tenantId)
    .single();
  const budgetAmount = Number(budget?.monthly_amount_usd ?? 0);
  const budgetPct = budgetAmount > 0 ? (currentTotal / budgetAmount) * 100 : 0;

  // ── Provider distribution for current month
  const { data: providerRows } = await supabase
    .from('cost_records')
    .select('provider, amount_usd')
    .eq('tenant_id', tenantId)
    .eq('billing_period', CURRENT_PERIOD);

  const providerMap: Record<string, number> = {};
  for (const row of providerRows ?? []) {
    providerMap[row.provider] = (providerMap[row.provider] ?? 0) + Number(row.amount_usd);
  }
  const providerData: ProviderSummary[] = Object.entries(providerMap)
    .sort((a, b) => b[1] - a[1])
    .map(([provider, amount_usd]) => ({
      provider: provider as Provider,
      amount_usd,
      pct: currentTotal > 0 ? (amount_usd / currentTotal) * 100 : 0,
    }));

  // ── Service category breakdown for current month
  const { data: categoryRows } = await supabase
    .from('cost_records')
    .select('service_category, service_name, amount_usd')
    .eq('tenant_id', tenantId)
    .eq('billing_period', CURRENT_PERIOD);

  const catMap: Record<string, { service_name: string; total: number }> = {};
  for (const row of categoryRows ?? []) {
    if (!catMap[row.service_category]) {
      catMap[row.service_category] = { service_name: row.service_name, total: 0 };
    }
    catMap[row.service_category].total += Number(row.amount_usd);
  }
  const serviceData: ServiceCategorySummary[] = Object.entries(catMap)
    .sort((a, b) => b[1].total - a[1].total)
    .map(([category, { service_name, total }]) => ({
      category: category as ServiceCategory,
      service_name,
      amount_usd: total,
      pct: currentTotal > 0 ? (total / currentTotal) * 100 : 0,
    }));

  // ── Tenant name
  const { data: tenant } = await supabase
    .from('tenants')
    .select('name')
    .eq('id', tenantId)
    .single();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-archivo font-700 text-xl text-ink">{tenant?.name ?? 'Mi empresa'}</h1>
        <p className="text-ink-soft text-sm mt-0.5">Resumen de consumo · Junio 2026</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          label="Consumo del mes"
          value={fmt(currentTotal)}
          trend={trendPct}
        />
        <div className="bg-card rounded-2xl border border-line shadow-sm p-5 flex flex-col gap-1">
          <p className="text-xs font-medium text-ink-soft uppercase tracking-wide">Presupuesto mensual</p>
          <p className="font-plex-mono font-600 text-2xl text-ink leading-tight">{fmt(budgetAmount)}</p>
          <div className="mt-2 h-1.5 bg-line rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(budgetPct, 100)}%`,
                backgroundColor: budgetPct >= 100 ? '#C0392B' : budgetPct >= 85 ? '#D9822B' : '#0E9BB5',
              }}
            />
          </div>
          <p className="text-xs text-ink-soft mt-1">{fmtPct(budgetPct)} utilizado</p>
        </div>
        <KpiCard
          label="Proyección fin de mes"
          value={fmt(projection)}
          sub={`Basado en ritmo actual · ${fmtPct(budgetAmount > 0 ? (projection / budgetAmount) * 100 : 0)} del presupuesto`}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <Card title="Evolución del consumo">
            <ClientAreaChart data={evolutionData} />
          </Card>
        </div>
        <div>
          <Card title="Distribución por nube">
            <ProviderDonut data={providerData} />
          </Card>
        </div>
      </div>

      {/* Services table */}
      <Card title="Consumo por categoría de servicio">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line">
                {['Categoría', 'Servicio', 'Monto', '% del total'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-ink-soft uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {serviceData.map(row => (
                <tr key={row.category} className="border-b border-line/50 hover:bg-bg/60 transition-colors">
                  <td className="px-4 py-3.5 font-medium text-ink">
                    {CATEGORY_LABELS[row.category]}
                  </td>
                  <td className="px-4 py-3.5 text-ink-soft text-xs">{row.service_name}</td>
                  <td className="px-4 py-3.5 font-plex-mono text-ink font-500">
                    {fmt(row.amount_usd)}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-line rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-accent"
                          style={{ width: `${row.pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-plex-mono text-ink-soft">{fmtPct(row.pct)}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
