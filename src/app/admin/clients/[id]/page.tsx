import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { KpiCard } from '@/components/ui/KpiCard';
import { Badge } from '@/components/ui/Badge';
import { CloudChip } from '@/components/ui/CloudChip';
import { EmptyState } from '@/components/ui/EmptyState';
import { BudgetEditor } from '@/components/admin/BudgetEditor';
import { ConnectionsTab } from '@/components/admin/ConnectionsTab';
import { UsersTab } from '@/components/admin/UsersTab';
import { TabsClient } from '@/components/admin/TabsClient';
import { fmt, calcTrend } from '@/lib/utils';
import { Pencil, Eye, Cable, Users } from 'lucide-react';
import type { Provider, TenantStatus } from '@/lib/types';

const CURRENT_PERIOD  = '2026-06-01';
const PREVIOUS_PERIOD = '2026-05-01';
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function ClientDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { tab = 'summary' } = await searchParams;
  const supabase = await getSupabaseServerClient();

  const { data: tenant } = await supabase.from('tenants').select('*').eq('id', id).single();
  if (!tenant) notFound();

  // Fetch all data in parallel
  const [
    { data: connections },
    { data: profiles },
    { data: alerts },
    { data: budget },
    { data: history },
    { data: invitations },
    { data: costs },
  ] = await Promise.all([
    supabase.from('cloud_connections').select('*').eq('tenant_id', id),
    supabase.from('profiles').select('id, full_name, role, is_active').eq('tenant_id', id),
    supabase.from('alerts').select('*').eq('tenant_id', id).eq('resolved', false),
    supabase.from('budgets').select('*').eq('tenant_id', id).single().then(r => ({ data: r.data })),
    supabase.from('budget_history').select('*').eq('tenant_id', id).order('changed_at', { ascending: false }).limit(5),
    supabase.from('tenant_invitations').select('*').eq('tenant_id', id).eq('status', 'pending'),
    supabase.from('cost_records').select('billing_period, amount_usd, provider')
      .eq('tenant_id', id).in('billing_period', [CURRENT_PERIOD, PREVIOUS_PERIOD]),
  ]);

  const currentUsd = (costs ?? []).filter(r => r.billing_period === CURRENT_PERIOD).reduce((s, r) => s + Number(r.amount_usd), 0);
  const prevUsd    = (costs ?? []).filter(r => r.billing_period === PREVIOUS_PERIOD).reduce((s, r) => s + Number(r.amount_usd), 0);
  const trend      = calcTrend(currentUsd, prevUsd);
  const budgetPct  = budget ? (currentUsd / budget.monthly_amount_usd) * 100 : 0;
  const providers  = Array.from(new Set((connections ?? []).filter(c => c.status === 'connected').map(c => c.provider as Provider)));

  // Build invitation URLs
  const invitationsWithUrl = (invitations ?? []).map(inv => ({
    ...inv,
    invite_url: `${BASE_URL}/invite/${inv.id}`,
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <PageHeader
        title={tenant.name}
        subtitle={tenant.contact_email ?? tenant.slug}
        right={
          <div className="flex items-center gap-2">
            <Badge variant={tenant.status as TenantStatus} />
            <Link
              href={`/dashboard?tenant=${id}&name=${encodeURIComponent(tenant.name)}`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-line text-sm text-ink-soft hover:text-accent hover:border-accent transition-colors"
            >
              <Eye className="w-4 h-4" />
              Ver como cliente
            </Link>
            <Link
              href={`/admin/clients/${id}/edit`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-line text-sm text-ink-soft hover:text-ink transition-colors"
            >
              <Pencil className="w-4 h-4" />
              Editar
            </Link>
          </div>
        }
      />

      {/* Tabs */}
      <Suspense fallback={null}>
        <TabsClient
          tabs={[
            { key: 'summary',     label: 'Resumen' },
            { key: 'connections', label: `Cuentas cloud (${(connections ?? []).length})` },
            { key: 'users',       label: `Usuarios (${(profiles ?? []).length})` },
          ]}
        />
      </Suspense>

      {/* Tab: Resumen */}
      {tab === 'summary' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KpiCard label="Consumo junio" value={fmt(currentUsd)} trend={trend} />
            <KpiCard label="Alertas abiertas" value={String((alerts ?? []).length)} sub={`${(alerts ?? []).filter(a => a.severity === 'critical').length} críticas`} />
            <KpiCard label="Presupuesto" value={fmt(budget?.monthly_amount_usd ?? 0)} sub={`${Math.round(budgetPct)}% utilizado`} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card title="Proveedores conectados">
              {providers.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {providers.map(p => <CloudChip key={p} provider={p} />)}
                </div>
              ) : (
                <p className="text-sm text-ink-soft">Sin nubes conectadas</p>
              )}
            </Card>
            <Card title="Presupuesto mensual">
              <BudgetEditor tenantId={id} budget={budget ?? null} history={history ?? []} />
            </Card>
          </div>
        </div>
      )}

      {/* Tab: Cuentas cloud */}
      {tab === 'connections' && (
        <ConnectionsTab tenantId={id} connections={connections ?? []} />
      )}

      {/* Tab: Usuarios */}
      {tab === 'users' && (
        <UsersTab tenantId={id} users={profiles ?? []} invitations={invitationsWithUrl} />
      )}
    </div>
  );
}
