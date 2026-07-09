'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';

export interface TabItem {
  key: string;
  label: string;
}

interface TabsProps {
  tabs: TabItem[];
  param?: string;
}

export function Tabs({ tabs, param = 'tab' }: TabsProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const active = searchParams.get(param) ?? tabs[0]?.key;

  function navigate(key: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(param, key);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex gap-1 border-b border-line mb-6">
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => navigate(tab.key)}
          className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
            active === tab.key
              ? 'border-accent text-accent'
              : 'border-transparent text-ink-soft hover:text-ink'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
