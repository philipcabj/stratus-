import { getSupabaseServerClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { PROVIDER_COLORS, PROVIDER_LABELS } from '@/lib/constants';
import type { Provider } from '@/lib/types';

const PROVIDERS: { key: Provider; badge: string; badgeStyle: string }[] = [
  { key: 'aws',   badge: 'Integración automática próximamente', badgeStyle: 'text-accent bg-accent/10 border-accent/30' },
  { key: 'azure', badge: 'En roadmap',  badgeStyle: 'text-ink-soft bg-bg border-line' },
  { key: 'gcp',   badge: 'En roadmap',  badgeStyle: 'text-ink-soft bg-bg border-line' },
  { key: 'oci',   badge: 'En roadmap',  badgeStyle: 'text-ink-soft bg-bg border-line' },
];

const PROVIDER_ICONS: Record<Provider, string> = {
  aws:   'AWS',
  azure: 'Az',
  gcp:   'GCP',
  oci:   'OCI',
};

export default async function ConnectorsPage() {
  const supabase = await getSupabaseServerClient();

  const { data: connections } = await supabase
    .from('cloud_connections')
    .select('provider, status, tenant_id');

  return (
    <div className="p-6">
      <PageHeader
        title="Conectores"
        subtitle="Estado de las integraciones con proveedores cloud"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {PROVIDERS.map(({ key, badge, badgeStyle }) => {
          const total     = (connections ?? []).filter(c => c.provider === key).length;
          const connected = (connections ?? []).filter(c => c.provider === key && c.status === 'connected').length;
          const errored   = (connections ?? []).filter(c => c.provider === key && c.status === 'error').length;
          const tenants   = new Set((connections ?? []).filter(c => c.provider === key).map(c => c.tenant_id)).size;

          return (
            <div key={key} className="bg-card rounded-2xl border border-line shadow-sm p-5 flex flex-col gap-4">
              {/* Provider header */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-archivo font-700 text-sm text-white"
                  style={{ backgroundColor: PROVIDER_COLORS[key] }}
                >
                  {PROVIDER_ICONS[key]}
                </div>
                <div>
                  <p className="font-archivo font-600 text-ink text-sm">{PROVIDER_LABELS[key]}</p>
                  <p className="text-xs text-ink-soft">{tenants} cliente{tenants !== 1 ? 's' : ''}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-ink-soft">Total conexiones</span>
                  <span className="font-plex-mono text-ink">{total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ink-soft">Conectadas</span>
                  <span className="font-plex-mono text-ok">{connected}</span>
                </div>
                {errored > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-soft">Con error</span>
                    <span className="font-plex-mono text-bad">{errored}</span>
                  </div>
                )}
              </div>

              {/* Status badge */}
              <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium border self-start ${badgeStyle}`}>
                {badge}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-8 p-5 bg-accent/5 border border-accent/20 rounded-2xl">
        <p className="font-archivo font-600 text-accent text-sm mb-1">¿Cómo funcionarán los conectores?</p>
        <p className="text-sm text-ink-soft leading-relaxed">
          En la Fase 2, el conector de AWS se integrará con <strong>AWS Cost Explorer</strong> para importar automáticamente los registros de consumo. Cada cuenta configurada como <em>Conectada</em> recibirá datos de costos en tiempo real según el ciclo de facturación del proveedor.
        </p>
      </div>
    </div>
  );
}
