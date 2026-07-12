'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { syncConnection } from '@/lib/actions/sync';
import { RefreshCw, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import type { SyncStatus } from '@/lib/types';

interface Props {
  connectionId: string;
  lastSyncAt:     string | null;
  lastSyncStatus: SyncStatus | null;
  lastSyncError:  string | null;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('es-AR', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

export function SyncButton({ connectionId, lastSyncAt, lastSyncStatus, lastSyncError }: Props) {
  const router  = useRouter();
  const [loading, setLoading] = useState(false);
  const [localStatus, setLocalStatus] = useState<SyncStatus | null>(lastSyncStatus);
  const [localError,  setLocalError]  = useState<string | null>(lastSyncError);

  async function handleSync() {
    setLoading(true);
    setLocalStatus('running');
    setLocalError(null);

    const result = await syncConnection(connectionId);

    setLoading(false);
    setLocalStatus(result.ok ? 'success' : 'error');
    setLocalError(result.error ?? null);
    router.refresh();
  }

  const status = loading ? 'running' : localStatus;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        {status === 'success' && <CheckCircle className="w-3.5 h-3.5 text-ok flex-shrink-0" />}
        {status === 'error'   && <XCircle     className="w-3.5 h-3.5 text-bad flex-shrink-0" />}
        {status === 'running' && <Loader2     className="w-3.5 h-3.5 text-accent animate-spin flex-shrink-0" />}

        <button
          onClick={handleSync}
          disabled={loading}
          className="flex items-center gap-1 text-xs text-ink-soft hover:text-accent transition-colors disabled:opacity-50"
        >
          <RefreshCw className="w-3 h-3" />
          {loading ? 'Sincronizando…' : 'Sincronizar'}
        </button>
      </div>

      {lastSyncAt && !loading && (
        <p className="text-[10px] text-ink-soft/70 leading-tight">
          {formatDate(lastSyncAt)}
        </p>
      )}

      {localError && !loading && (
        <p className="text-[10px] text-bad leading-tight max-w-[160px] truncate" title={localError}>
          {localError}
        </p>
      )}
    </div>
  );
}
