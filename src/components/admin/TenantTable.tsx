'use client';

import { useRouter } from 'next/navigation';
import { CloudChip } from '@/components/ui/CloudChip';
import { TrendingUp, TrendingDown, Minus, Eye } from 'lucide-react';
import { fmt, fmtPct, calcTrend } from '@/lib/utils';
import type { TenantWithMetrics, Provider } from '@/lib/types';

interface Props {
  tenants: TenantWithMetrics[];
}

function TrendBadge({ current, prev }: { current: number; prev: number }) {
  const pct = calcTrend(current, prev);
  if (pct > 0) return (
    <span className="flex items-center gap-1 text-bad text-xs font-medium">
      <TrendingUp className="w-3.5 h-3.5" />+{Math.round(pct)}%
    </span>
  );
  if (pct < 0) return (
    <span className="flex items-center gap-1 text-ok text-xs font-medium">
      <TrendingDown className="w-3.5 h-3.5" />{Math.round(pct)}%
    </span>
  );
  return <span className="flex items-center gap-1 text-ink-soft text-xs"><Minus className="w-3.5 h-3.5" />0%</span>;
}

function BudgetBar({ spent, budget }: { spent: number; budget: number }) {
  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const color = pct >= 100 ? '#C0392B' : pct >= 85 ? '#D9822B' : '#0E9BB5';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-line rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-plex-mono text-ink-soft w-10 text-right">{fmtPct(pct)}</span>
    </div>
  );
}

export function TenantTable({ tenants }: Props) {
  const router = useRouter();

  function handleViewAs(tenant: TenantWithMetrics) {
    router.push(`/dashboard?tenant=${tenant.id}&name=${encodeURIComponent(tenant.name)}`);
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line">
            {['Cliente', 'Nubes', 'Consumo junio', 'Variación', 'Presupuesto', 'Alertas', ''].map(h => (
              <th key={h} className="text-left px-4 py-3 text-xs font-medium text-ink-soft uppercase tracking-wide whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tenants.map(t => (
            <tr key={t.id} className="border-b border-line/50 hover:bg-bg/60 transition-colors">
              <td className="px-4 py-3.5">
                <div>
                  <p className="font-medium text-ink">{t.name}</p>
                  <p className="text-xs text-ink-soft mt-0.5 capitalize">{t.status}</p>
                </div>
              </td>
              <td className="px-4 py-3.5">
                <div className="flex flex-wrap gap-1">
                  {t.providers.map(p => <CloudChip key={p} provider={p} />)}
                </div>
              </td>
              <td className="px-4 py-3.5 font-plex-mono text-ink font-500">
                {fmt(t.current_month_usd)}
              </td>
              <td className="px-4 py-3.5">
                <TrendBadge current={t.current_month_usd} prev={t.prev_month_usd} />
              </td>
              <td className="px-4 py-3.5 min-w-[140px]">
                <BudgetBar spent={t.current_month_usd} budget={t.budget_usd} />
                <p className="text-xs text-ink-soft mt-1">de {fmt(t.budget_usd)}</p>
              </td>
              <td className="px-4 py-3.5">
                {t.alert_count > 0 ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-bad border border-red-200">
                    {t.alert_count} alerta{t.alert_count !== 1 ? 's' : ''}
                  </span>
                ) : (
                  <span className="text-ok text-xs">Sin alertas</span>
                )}
              </td>
              <td className="px-4 py-3.5">
                <button
                  onClick={() => handleViewAs(t)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-line
                             text-xs font-medium text-ink-soft hover:text-accent hover:border-accent
                             transition-colors whitespace-nowrap"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Ver como cliente
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
