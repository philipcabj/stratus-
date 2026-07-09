import { Suspense } from 'react';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { AlertsTable } from '@/components/shared/AlertsTable';
import { AlertsFilter } from '@/components/shared/AlertsFilter';
import { Bell } from 'lucide-react';
import type { AlertSeverity, AlertType } from '@/lib/types';

interface Props {
  searchParams: Promise<{ severity?: string; type?: string; resolved?: string; tenant?: string }>;
}

export default async function AdminAlertsPage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = await getSupabaseServerClient();

  let query = supabase
    .from('alerts')
    .select('*, tenants(id, name)')
    .order('created_at', { ascending: false })
    .limit(100);

  if (params.severity) query = query.eq('severity', params.severity);
  if (params.type)     query = query.eq('type', params.type);
  if (params.resolved === 'true') query = query.eq('resolved', true);
  else if (params.resolved === 'false') query = query.eq('resolved', false);
  else query = query.eq('resolved', false); // default: show open only

  if (params.tenant) query = query.eq('tenant_id', params.tenant);

  const { data: alerts } = await query;

  const { data: tenants } = await supabase
    .from('tenants').select('id, name').neq('status', 'archived').order('name');

  const openCount = (alerts ?? []).filter(a => !a.resolved).length;

  return (
    <div className="p-6">
      <PageHeader
        title="Alertas"
        subtitle={`${openCount} alerta${openCount !== 1 ? 's' : ''} abiertas`}
      />

      <Suspense fallback={null}>
        <AlertsFilter tenants={tenants ?? []} />
      </Suspense>

      <div className="mt-4">
        {(alerts ?? []).length === 0 ? (
          <EmptyState
            icon={Bell}
            title="Sin alertas"
            description="No hay alertas que coincidan con los filtros seleccionados."
          />
        ) : (
          <AlertsTable alerts={alerts ?? []} showTenant />
        )}
      </div>
    </div>
  );
}
