import { getSupabaseServerClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/PageHeader';
import { PROVIDER_COLORS, PROVIDER_LABELS } from '@/lib/constants';
import type { Provider } from '@/lib/types';

const PROVIDERS: { key: Provider; badge: string; badgeStyle: string }[] = [
  { key: 'aws',   badge: 'Activo — Cost Explorer', badgeStyle: 'text-ok bg-ok/10 border-ok/30' },
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
    .select('provider, status, tenant_id, last_sync_at, last_sync_status');

  return (
    <div className="p-6">
      <PageHeader
        title="Conectores"
        subtitle="Estado de las integraciones con proveedores cloud"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {PROVIDERS.map(({ key, badge, badgeStyle }) => {
          const provConns = (connections ?? []).filter(c => c.provider === key);
          const total     = provConns.length;
          const connected = provConns.filter(c => c.status === 'connected').length;
          const errored   = provConns.filter(c => c.status === 'error').length;
          const tenants   = new Set(provConns.map(c => c.tenant_id)).size;
          const lastSync  = provConns
            .map(c => c.last_sync_at as string | null)
            .filter(Boolean)
            .sort()
            .at(-1);

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
                {lastSync && (
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-soft">Última sync</span>
                    <span className="font-plex-mono text-xs text-ink-soft">
                      {new Date(lastSync).toLocaleString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
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
        <p className="font-archivo font-600 text-accent text-sm mb-1">Cómo funciona el conector AWS</p>
        <p className="text-sm text-ink-soft leading-relaxed">
          El conector de AWS usa <strong>AWS Cost Explorer</strong> con asunción de rol cross-account (STS AssumeRole). Cada cliente crea un rol IAM que confía en nuestra plataforma; nosotros asumimos ese rol y leemos sus costos sin almacenar credenciales. La sincronización se ejecuta diariamente a las 06:00 ART y puede activarse manualmente por conexión.
        </p>
      </div>
    </div>
  );
}
