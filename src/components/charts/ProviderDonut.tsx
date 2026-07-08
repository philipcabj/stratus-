'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { PROVIDER_COLORS, PROVIDER_LABELS } from '@/lib/constants';
import { Dot } from '@/components/ui/Dot';
import { fmt } from '@/lib/utils';
import type { ProviderSummary } from '@/lib/types';

interface Props {
  data: ProviderSummary[];
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const { provider, amount_usd } = payload[0].payload;
  return (
    <div className="bg-card border border-line rounded-xl shadow-lg p-3 text-xs">
      <p className="text-ink-soft mb-1">{PROVIDER_LABELS[provider as keyof typeof PROVIDER_LABELS]}</p>
      <p className="font-plex-mono font-600 text-ink">{fmt(amount_usd)}</p>
    </div>
  );
}

export function ProviderDonut({ data }: Props) {
  return (
    <div className="flex flex-col items-center gap-4">
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie
            data={data}
            dataKey="amount_usd"
            nameKey="provider"
            cx="50%"
            cy="50%"
            innerRadius={48}
            outerRadius={72}
            paddingAngle={3}
          >
            {data.map((entry) => (
              <Cell key={entry.provider} fill={PROVIDER_COLORS[entry.provider]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      <div className="w-full space-y-2">
        {data.map((entry) => (
          <div key={entry.provider} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Dot color={PROVIDER_COLORS[entry.provider]} />
              <span className="text-ink-soft">{PROVIDER_LABELS[entry.provider]}</span>
            </div>
            <span className="font-plex-mono text-ink font-500">{fmt(entry.amount_usd)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
