type BadgeVariant = 'active' | 'inactive' | 'archived' | 'paused' | 'suspended'
  | 'connected' | 'error' | 'pending'
  | 'critical' | 'warn' | 'info'
  | 'accepted' | 'revoked' | 'expired'
  | 'organization' | 'single_account'
  | 'neutral';

const STYLES: Record<BadgeVariant, string> = {
  active:         'bg-emerald-50 text-emerald-700 border-emerald-200',
  connected:      'bg-emerald-50 text-emerald-700 border-emerald-200',
  accepted:       'bg-emerald-50 text-emerald-700 border-emerald-200',
  inactive:       'bg-gray-100 text-gray-500 border-gray-200',
  neutral:        'bg-gray-100 text-gray-500 border-gray-200',
  single_account: 'bg-gray-100 text-gray-500 border-gray-200',
  error:          'bg-red-50 text-red-700 border-red-200',
  critical:       'bg-red-50 text-red-700 border-red-200',
  revoked:        'bg-red-50 text-red-700 border-red-200',
  archived:       'bg-gray-100 text-gray-400 border-gray-200',
  suspended:      'bg-orange-50 text-orange-700 border-orange-200',
  paused:         'bg-orange-50 text-orange-700 border-orange-200',
  warn:           'bg-amber-50 text-amber-700 border-amber-200',
  expired:        'bg-amber-50 text-amber-700 border-amber-200',
  pending:        'bg-blue-50 text-blue-600 border-blue-200',
  info:           'bg-blue-50 text-blue-600 border-blue-200',
  organization:   'bg-violet-50 text-violet-700 border-violet-200',
};

const LABELS: Partial<Record<BadgeVariant, string>> = {
  active:         'Activo',
  inactive:       'Inactivo',
  archived:       'Archivado',
  paused:         'Pausado',
  suspended:      'Suspendido',
  connected:      'Conectado',
  error:          'Error',
  pending:        'Pendiente',
  accepted:       'Aceptada',
  revoked:        'Revocada',
  expired:        'Expirada',
  organization:   'Organización',
  single_account: 'Cuenta individual',
};

interface BadgeProps {
  variant: BadgeVariant;
  label?: string;
  className?: string;
}

export function Badge({ variant, label, className = '' }: BadgeProps) {
  const styles = STYLES[variant] ?? STYLES.neutral;
  const text = label ?? LABELS[variant] ?? variant;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${styles} ${className}`}>
      {text}
    </span>
  );
}
