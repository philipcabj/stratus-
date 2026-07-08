'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { PROVIDER_COLORS, PROVIDER_LABELS, T } from '@/lib/constants';
import type { MonthlyByProvider } from '@/lib/types';

interface Props {
  data: MonthlyByProvider[];
}

function yFormatter(value: number) {
  return value >= 1000 ? `${Math.round(value / 1000)}k` : String(value);
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((sum: number, p: any) => sum + (p.value ?? 0), 0);
  return (
    <div className="bg-card border border-line rounded-xl shadow-lg p-3 text-xs min-w-[160px]">
      <p className="font-archivo font-600 text-ink mb-2">{label}</p>
      {[...payload].reverse().map((p: any) => (
        <div key={p.dataKey} className="flex justify-between gap-4 text-ink-soft mb-1">
          <span style={{ color: p.fill }}>{PROVIDER_LABELS[p.dataKey as keyof typeof PROVIDER_LABELS]}</span>
          <span className="font-plex-mono text-ink">US$ {Math.round(p.value).toLocaleString('es-AR')}</span>
        </div>
      ))}
      <div className="flex justify-between gap-4 border-t border-line mt-2 pt-2 font-medium text-ink">
        <span>Total</span>
        <span className="font-plex-mono">US$ {Math.round(total).toLocaleString('es-AR')}</span>
      </div>
    </div>
  );
}

export function MonthlyStackedBar({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} barSize={28} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={T.line} />
        <XAxis dataKey="mes" tick={{ fontSize: 12, fill: T.inkSoft }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={yFormatter} tick={{ fontSize: 12, fill: T.inkSoft }} axisLine={false} tickLine={false} width={36} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: T.bg }} />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => <span style={{ color: T.inkSoft, fontSize: 12 }}>{PROVIDER_LABELS[value as keyof typeof PROVIDER_LABELS]}</span>}
        />
        <Bar dataKey="aws"   stackId="a" fill={PROVIDER_COLORS.aws}   radius={[0,0,0,0]} />
        <Bar dataKey="azure" stackId="a" fill={PROVIDER_COLORS.azure} radius={[0,0,0,0]} />
        <Bar dataKey="gcp"   stackId="a" fill={PROVIDER_COLORS.gcp}   radius={[0,0,0,0]} />
        <Bar dataKey="oci"   stackId="a" fill={PROVIDER_COLORS.oci}   radius={[4,4,0,0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
