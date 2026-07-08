'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Eye, X } from 'lucide-react';

export function ImpersonationBanner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tenantName = searchParams.get('name');

  if (!tenantName) return null;

  return (
    <div className="flex items-center justify-between px-5 py-2.5 bg-amber-50 border-b border-amber-300">
      <div className="flex items-center gap-2 text-amber-800 text-sm font-medium">
        <Eye className="w-4 h-4" />
        <span>
          Viendo como: <strong>{decodeURIComponent(tenantName)}</strong> — Solo lectura
        </span>
      </div>
      <button
        onClick={() => router.push('/admin')}
        className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-100 border border-amber-300
                   text-amber-800 text-xs font-medium hover:bg-amber-200 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
        Volver a admin
      </button>
    </div>
  );
}
