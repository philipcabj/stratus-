'use client';

import { Tabs } from '@/components/ui/Tabs';
import type { TabItem } from '@/components/ui/Tabs';

interface Props { tabs: TabItem[] }

export function TabsClient({ tabs }: Props) {
  return <Tabs tabs={tabs} />;
}
