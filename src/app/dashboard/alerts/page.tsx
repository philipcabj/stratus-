import { Suspense } from 'react';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { AlertsTable } from '@/components/shared/AlertsTable';
import { AlertsFilter } from '@/components/shared/AlertsFilter';
import { Bell } from 'lucide-react';
import { redirect } from 'next/navigation';
import type { AlertSeverity, AlertType } from '@/lib/types';

interface Props {
  searchParams: Promise<{ tenant?: string; severity?: string; type?: string; resolved?: string }>;
}

export default async function DashboardAlertsPage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = await getSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, tenant_id')
    .eq('id', user.id)
    .single();

  const tenantId = params.tenant ?? profile?.tenant_id ?? null;
  if (!tenantId) redirect('/admin');

  let query = supabase
    .from('alerts')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(100);

  if (params.severity) query = query.eq('severity', params.severity as AlertSeverity);
  if (params.type)     query = query.eq('type', params.type as AlertType);
  if (params.resolved === 'true') query = query.eq('resolved', true);
  else query = query.eq('resolved', false);

  const { data: alerts } = await query;

  const openCount = (alerts ?? []).filter(a => !a.resolved).length;

  return (
    <div className="p-6">
      <PageHeader
        title="Alertas"
        subtitle={`${openCount} alerta${openCount !== 1 ? 's' : ''} abiertas`}
      />

      <Suspense fallback={null}>
        <AlertsFilter />
      </Suspense>

      <div className="mt-4">
        {(alerts ?? []).length === 0 ? (
          <EmptyState
            icon={Bell}
            title="Sin alertas"
            description="No hay alertas que coincidan con los filtros seleccionados."
          />
        ) : (
          <AlertsTable alerts={alerts ?? []} />
        )}
      </div>
    </div>
  );
}
