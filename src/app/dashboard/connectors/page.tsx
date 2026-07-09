import { getSupabaseServerClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { CloudChip } from '@/components/ui/CloudChip';
import { Badge } from '@/components/ui/Badge';
import { Cable } from 'lucide-react';
import { redirect } from 'next/navigation';
import type { ConnectionStatus, ConnectionScope, Provider } from '@/lib/types';

interface Props {
  searchParams: Promise<{ tenant?: string }>;
}

export default async function DashboardConnectorsPage({ searchParams }: Props) {
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

  const { data: connections } = await supabase
    .from('cloud_connections')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('provider');

  const { data: tenant } = await supabase
    .from('tenants')
    .select('name')
    .eq('id', tenantId)
    .single();

  return (
    <div className="p-6">
      <PageHeader
        title="Cuentas cloud"
        subtitle={tenant?.name ? `Conexiones configuradas para ${tenant.name}` : 'Conexiones cloud configuradas'}
      />

      {(connections ?? []).length === 0 ? (
        <EmptyState
          icon={Cable}
          title="Sin cuentas cloud"
          description="Este cliente todavía no tiene cuentas cloud configuradas."
        />
      ) : (
        <div className="bg-card rounded-2xl border border-line shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line">
                {['Proveedor','Nombre','Alcance','ID de cuenta','Estado'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-ink-soft uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(connections ?? []).map(c => (
                <tr key={c.id} className="border-b border-line/50 hover:bg-bg/40 transition-colors">
                  <td className="px-4 py-3.5"><CloudChip provider={c.provider as Provider} /></td>
                  <td className="px-4 py-3.5 font-medium text-ink">{c.display_name}</td>
                  <td className="px-4 py-3.5"><Badge variant={c.scope as ConnectionScope} /></td>
                  <td className="px-4 py-3.5 font-plex-mono text-xs text-ink-soft">{c.provider_account_id ?? '—'}</td>
                  <td className="px-4 py-3.5"><Badge variant={c.status as ConnectionStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 p-4 bg-bg rounded-xl border border-line text-sm text-ink-soft">
        Para agregar o modificar conexiones cloud, contactá al administrador de la plataforma.
      </div>
    </div>
  );
}
