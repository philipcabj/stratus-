import { Sidebar } from '@/components/ui/Sidebar';
import { ImpersonationBanner } from '@/components/ui/ImpersonationBanner';
import { Suspense } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar variant="client" />
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Banner needs useSearchParams, so wrap in Suspense */}
        <Suspense fallback={null}>
          <ImpersonationBanner />
        </Suspense>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
