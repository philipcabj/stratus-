import Link from 'next/link';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { CloudChip } from '@/components/ui/CloudChip';
import { fmt } from '@/lib/utils';
import { Plus, Users, ExternalLink } from 'lucide-react';
import { ArchiveButton } from '@/components/admin/ArchiveButton';
import type { Provider, TenantStatus, Tenant } from '@/lib/types';

const CURRENT_PERIOD = '2026-06-01';

function TenantAvatar({ name, logoUrl }: { name: string; logoUrl: string | null }) {
  if (logoUrl) return <img src={logoUrl} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />;
  return (
    <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center text-accent font-archivo font-700 text-sm flex-shrink-0">
      {name[0]}
    </div>
  );
}

export default async function ClientsPage() {
  const supabase = await getSupabaseServerClient();

  const { data: tenants } = await supabase
    .from('tenants')
    .select('*')
    .order('name');

  const { data: connections } = await supabase
    .from('cloud_connections')
    .select('tenant_id, provider, status');

  const { data: profiles } = await supabase
    .from('profiles')
    .select('tenant_id')
    .not('tenant_id', 'is', null);

  const { data: costs } = await supabase
    .from('cost_records')
    .select('tenant_id, amount_usd')
    .eq('billing_period', CURRENT_PERIOD);

  const activeTenants = (tenants ?? []).filter(t => t.status !== 'archived');
  const archivedTenants = (tenants ?? []).filter(t => t.status === 'archived');

  interface EnrichedTenant extends Tenant {
    providers: Provider[];
    userCount: number;
    monthlyUsd: number;
  }

  function enrichTenant(t: Tenant): EnrichedTenant {
    const providers: Provider[] = Array.from(new Set(
      (connections ?? []).filter(c => c.tenant_id === t.id && c.status === 'connected').map(c => c.provider as Provider)
    ));
    const userCount = (profiles ?? []).filter(p => p.tenant_id === t.id).length;
    const monthlyUsd = (costs ?? []).filter(c => c.tenant_id === t.id).reduce((s, c) => s + Number(c.amount_usd), 0);
    return { ...(t as Tenant), providers, userCount, monthlyUsd };
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Clientes"
        subtitle={`${activeTenants.length} activos · ${archivedTenants.length} archivados`}
        right={
          <Link
            href="/admin/clients/new"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-ink text-white text-sm font-medium hover:bg-ink/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo cliente
          </Link>
        }
      />

      {activeTenants.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No hay clientes todavía"
          description="Creá el primer cliente para empezar a gestionar su consumo cloud."
          action={
            <Link href="/admin/clients/new" className="px-4 py-2 rounded-lg bg-ink text-white text-sm font-medium">
              Crear primer cliente
            </Link>
          }
        />
      ) : (
        <div className="bg-card rounded-2xl border border-line shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line">
                {['Cliente','Estado','Nubes','Usuarios','Consumo junio',''].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-medium text-ink-soft uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeTenants.map(enrichTenant).map(t => (
                <tr key={t.id} className="border-b border-line/50 hover:bg-bg/40 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <TenantAvatar name={t.name} logoUrl={t.logo_url} />
                      <div>
                        <p className="font-medium text-ink">{t.name}</p>
                        {t.contact_email && <p className="text-xs text-ink-soft mt-0.5">{t.contact_email}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={t.status as TenantStatus} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {t.providers.length > 0
                        ? t.providers.map(p => <CloudChip key={p} provider={p} />)
                        : <span className="text-xs text-ink-soft">Sin conexiones</span>}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-ink-soft">{t.userCount}</td>
                  <td className="px-5 py-4 font-plex-mono text-ink">{fmt(t.monthlyUsd)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/clients/${t.id}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-line text-xs font-medium text-ink-soft hover:text-accent hover:border-accent transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Ver detalle
                      </Link>
                      <ArchiveButton tenantId={t.id} tenantName={t.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {archivedTenants.length > 0 && (
        <div className="mt-6">
          <p className="text-xs font-medium text-ink-soft uppercase tracking-wide mb-3">Archivados</p>
          <div className="bg-card rounded-2xl border border-line shadow-sm overflow-hidden opacity-60">
            <table className="w-full text-sm">
              <tbody>
                {archivedTenants.map(t => (
                  <tr key={t.id} className="border-b border-line/50 last:border-0">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <TenantAvatar name={t.name} logoUrl={t.logo_url} />
                        <p className="font-medium text-ink-soft">{t.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5"><Badge variant="archived" /></td>
                    <td className="px-5 py-3.5">
                      <Link href={`/admin/clients/${t.id}`} className="text-xs text-accent hover:underline">Ver detalle</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
