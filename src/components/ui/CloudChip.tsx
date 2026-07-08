import { PROVIDER_COLORS, PROVIDER_BG, PROVIDER_LABELS } from '@/lib/constants';
import type { Provider } from '@/lib/types';

interface CloudChipProps {
  provider: Provider;
}

export function CloudChip({ provider }: CloudChipProps) {
  return (
    <span
      style={{
        color: PROVIDER_COLORS[provider],
        backgroundColor: PROVIDER_BG[provider],
        borderColor: PROVIDER_COLORS[provider] + '40',
      }}
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-plex-mono font-500 border"
    >
      {PROVIDER_LABELS[provider]}
    </span>
  );
}
