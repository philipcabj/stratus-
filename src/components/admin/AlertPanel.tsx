import { AlertTriangle, Info, XCircle } from 'lucide-react';
import { SEVERITY_COLORS } from '@/lib/constants';
import type { AlertSeverity } from '@/lib/types';

interface AlertRow {
  id: string;
  severity: AlertSeverity;
  message: string;
  tenants?: { name: string } | null;
}

interface Props {
  alerts: AlertRow[];
}

const SeverityIcon = ({ severity }: { severity: AlertSeverity }) => {
  const cls = 'w-4 h-4 flex-shrink-0';
  if (severity === 'critical') return <XCircle className={cls} style={{ color: SEVERITY_COLORS.critical.text }} />;
  if (severity === 'warn')     return <AlertTriangle className={cls} style={{ color: SEVERITY_COLORS.warn.text }} />;
  return <Info className={cls} style={{ color: SEVERITY_COLORS.info.text }} />;
};

const SEVERITY_LABEL: Record<AlertSeverity, string> = {
  critical: 'Crítica',
  warn:     'Advertencia',
  info:     'Información',
};

export function AlertPanel({ alerts }: Props) {
  if (alerts.length === 0) {
    return <p className="text-sm text-ink-soft text-center py-4">Sin alertas abiertas</p>;
  }

  return (
    <div className="space-y-2.5">
      {alerts.map(alert => {
        const colors = SEVERITY_COLORS[alert.severity];
        return (
          <div
            key={alert.id}
            className="flex gap-3 p-3 rounded-xl border text-xs"
            style={{ backgroundColor: colors.bg, borderColor: colors.border }}
          >
            <SeverityIcon severity={alert.severity} />
            <div className="min-w-0">
              {alert.tenants?.name && (
                <p className="font-medium text-ink-soft mb-0.5">{alert.tenants.name}</p>
              )}
              <p className="text-ink leading-snug">{alert.message}</p>
              <p className="mt-1" style={{ color: colors.text }}>{SEVERITY_LABEL[alert.severity]}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
