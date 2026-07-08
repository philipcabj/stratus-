'use client';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { T } from '@/lib/constants';
import type { MonthlyTotal } from '@/lib/types';

interface Props {
  data: MonthlyTotal[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-line rounded-xl shadow-lg p-3 text-xs">
      <p className="text-ink-soft mb-1">{label}</p>
      <p className="font-plex-mono font-600 text-ink">
        US$ {Math.round(payload[0].value).toLocaleString('es-AR')}
      </p>
    </div>
  );
}

export function ClientAreaChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="accentGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={T.accent} stopOpacity={0.18} />
            <stop offset="95%" stopColor={T.accent} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={T.line} />
        <XAxis dataKey="mes" tick={{ fontSize: 12, fill: T.inkSoft }} axisLine={false} tickLine={false} />
        <YAxis
          tickFormatter={v => v >= 1000 ? `${Math.round(v/1000)}k` : String(v)}
          tick={{ fontSize: 12, fill: T.inkSoft }}
          axisLine={false}
          tickLine={false}
          width={36}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: T.accent, strokeWidth: 1, strokeDasharray: '4 4' }} />
        <Area
          type="monotone"
          dataKey="usd"
          stroke={T.accent}
          strokeWidth={2}
          fill="url(#accentGrad)"
          dot={false}
          activeDot={{ r: 4, fill: T.accent, stroke: T.card, strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
