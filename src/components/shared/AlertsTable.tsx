import { AlertTriangle, Info, Zap, CheckCircle } from 'lucide-react';
import { resolveAlert } from '@/lib/actions/alerts';
import { SEVERITY_COLORS } from '@/lib/constants';
import type { AlertSeverity, AlertType } from '@/lib/types';

interface AlertRow {
  id: string;
  tenant_id: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  resolved: boolean;
  created_at: string;
  tenants?: { id: string; name: string } | null;
}

interface Props {
  alerts: AlertRow[];
  showTenant?: boolean;
}

const TYPE_LABELS: Record<AlertType, string> = {
  budget_exceeded:  'Presupuesto excedido',
  budget_forecast:  'Proyección',
  new_service:      'Nuevo servicio',
};

function SeverityIcon({ severity }: { severity: AlertSeverity }) {
  const { text } = SEVERITY_COLORS[severity];
  if (severity === 'critical') return <Zap className="w-4 h-4" style={{ color: text }} />;
  if (severity === 'warn')     return <AlertTriangle className="w-4 h-4" style={{ color: text }} />;
  return <Info className="w-4 h-4" style={{ color: text }} />;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function AlertsTable({ alerts, showTenant = false }: Props) {
  return (
    <div className="bg-card rounded-2xl border border-line shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line">
            <th className="text-left px-4 py-3 text-xs font-medium text-ink-soft uppercase tracking-wide w-8"></th>
            {showTenant && (
              <th className="text-left px-4 py-3 text-xs font-medium text-ink-soft uppercase tracking-wide">Cliente</th>
            )}
            <th className="text-left px-4 py-3 text-xs font-medium text-ink-soft uppercase tracking-wide">Tipo</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-ink-soft uppercase tracking-wide">Mensaje</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-ink-soft uppercase tracking-wide whitespace-nowrap">Fecha</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-ink-soft uppercase tracking-wide">Estado</th>
            <th className="px-4 py-3 w-10"></th>
          </tr>
        </thead>
        <tbody>
          {alerts.map(alert => {
            const colors = SEVERITY_COLORS[alert.severity];
            return (
              <tr
                key={alert.id}
                className="border-b border-line/50 hover:bg-bg/40 transition-colors"
                style={{ backgroundColor: alert.resolved ? undefined : colors.bg + '33' }}
              >
                <td className="px-4 py-3.5">
                  <SeverityIcon severity={alert.severity} />
                </td>
                {showTenant && (
                  <td className="px-4 py-3.5 text-ink font-medium whitespace-nowrap">
                    {alert.tenants?.name ?? '—'}
                  </td>
                )}
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border"
                    style={{ color: colors.text, backgroundColor: colors.bg, borderColor: colors.border }}
                  >
                    {TYPE_LABELS[alert.type]}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-ink max-w-xs">{alert.message}</td>
                <td className="px-4 py-3.5 text-ink-soft whitespace-nowrap">{formatDate(alert.created_at)}</td>
                <td className="px-4 py-3.5">
                  {alert.resolved ? (
                    <span className="flex items-center gap-1 text-xs text-ok">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Resuelta
                    </span>
                  ) : (
                    <span className="text-xs text-warn font-medium">Abierta</span>
                  )}
                </td>
                <td className="px-4 py-3.5">
                  {!alert.resolved && (
                    <form action={resolveAlert.bind(null, alert.id)}>
                      <button
                        type="submit"
                        className="text-xs text-ink-soft hover:text-ok transition-colors underline underline-offset-2"
                      >
                        Resolver
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
