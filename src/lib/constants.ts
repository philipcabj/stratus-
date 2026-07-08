import type { Provider, ServiceCategory, AlertSeverity } from './types';

export const PROVIDER_COLORS: Record<Provider, string> = {
  aws:   '#F59E0B',
  azure: '#0078D4',
  gcp:   '#34A853',
  oci:   '#C74634',
};

export const PROVIDER_BG: Record<Provider, string> = {
  aws:   '#FEF3C7',
  azure: '#DBEAFE',
  gcp:   '#D1FAE5',
  oci:   '#FEE2E2',
};

export const PROVIDER_LABELS: Record<Provider, string> = {
  aws:   'AWS',
  azure: 'Azure',
  gcp:   'Google Cloud',
  oci:   'Oracle Cloud',
};

export const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  compute:    'Cómputo',
  storage:    'Almacenamiento',
  database:   'Bases de datos',
  networking: 'Redes',
  security:   'Seguridad',
  analytics:  'Analítica',
  other:      'Otros',
};

export const SEVERITY_COLORS: Record<AlertSeverity, { bg: string; text: string; border: string }> = {
  critical: { bg: '#FEF2F2', text: '#C0392B', border: '#FECACA' },
  warn:     { bg: '#FFFBEB', text: '#D9822B', border: '#FDE68A' },
  info:     { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
};

export const MONTHS_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

// Design tokens mirroring tailwind.config.ts for use in JS (Recharts, inline styles)
export const T = {
  bg:        '#F3F5F8',
  card:      '#FFFFFF',
  ink:       '#0E1B2C',
  inkSoft:   '#5A6B80',
  line:      '#E3E8EF',
  accent:    '#0E9BB5',
  accentSoft:'#E3F4F8',
  ok:        '#1F9D6B',
  warn:      '#D9822B',
  bad:       '#C0392B',
  sidebar:   '#0E1B2C',
};
