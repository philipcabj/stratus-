import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  trend?: number; // signed percentage
}

export function KpiCard({ label, value, sub, trend }: KpiCardProps) {
  const showTrend = trend !== undefined && trend !== null;

  return (
    <div className="bg-card rounded-2xl border border-line shadow-sm p-5 flex flex-col gap-1">
      <p className="text-xs font-medium text-ink-soft uppercase tracking-wide">{label}</p>
      <p className="font-plex-mono font-600 text-2xl text-ink leading-tight">{value}</p>

      {showTrend && (
        <div className="flex items-center gap-1 mt-1">
          {trend > 0 ? (
            <TrendingUp className="w-3.5 h-3.5 text-bad" />
          ) : trend < 0 ? (
            <TrendingDown className="w-3.5 h-3.5 text-ok" />
          ) : (
            <Minus className="w-3.5 h-3.5 text-ink-soft" />
          )}
          <span
            className={`text-xs font-medium ${
              trend > 0 ? 'text-bad' : trend < 0 ? 'text-ok' : 'text-ink-soft'
            }`}
          >
            {trend > 0 ? '+' : ''}{Math.round(trend)}% vs mes anterior
          </span>
        </div>
      )}

      {sub && !showTrend && <p className="text-xs text-ink-soft mt-1">{sub}</p>}
    </div>
  );
}
