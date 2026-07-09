'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { MONTHS_ES } from '@/lib/constants';
import { CalendarDays } from 'lucide-react';

interface MonthPickerProps {
  availableMonths: string[]; // billing_period strings e.g. ['2026-06-01', '2026-05-01']
}

export function MonthPicker({ availableMonths }: MonthPickerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get('period') ?? availableMonths[0] ?? '';

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('period', e.target.value);
    router.push(`${pathname}?${params.toString()}`);
  }

  function formatOption(period: string) {
    const monthIdx = parseInt(period.slice(5, 7), 10) - 1;
    const year = period.slice(0, 4);
    return `${MONTHS_ES[monthIdx]} ${year}`;
  }

  return (
    <div className="flex items-center gap-2 bg-card border border-line rounded-lg px-3 py-2">
      <CalendarDays className="w-4 h-4 text-ink-soft flex-shrink-0" />
      <select
        value={current}
        onChange={handleChange}
        className="text-sm text-ink bg-transparent outline-none cursor-pointer"
      >
        {availableMonths.map(m => (
          <option key={m} value={m}>{formatOption(m)}</option>
        ))}
      </select>
    </div>
  );
}
