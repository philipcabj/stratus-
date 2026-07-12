'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { CloudChip } from '@/components/ui/CloudChip';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConnectionForm } from '@/components/admin/ConnectionForm';
import { deleteConnection } from '@/lib/actions/connections';
import { SyncButton } from '@/components/admin/SyncButton';
import { Plus, Cable, Pencil, Trash2 } from 'lucide-react';
import type { CloudConnection, ConnectionStatus, ConnectionScope } from '@/lib/types';

interface Props {
  tenantId: string;
  connections: CloudConnection[];
  platformAccountId?: string;
}

export function ConnectionsTab({ tenantId, connections, platformAccountId }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [editConn, setEditConn] = useState<CloudConnection | null>(null);

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-ink text-white text-sm font-medium hover:bg-ink/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Agregar cuenta cloud
        </button>
      </div>

      {connections.length === 0 ? (
        <EmptyState
          icon={Cable}
          title="Sin cuentas cloud configuradas"
          description="Este cliente todavía no tiene cuentas cloud conectadas. Agregá una para empezar."
          action={
            <button onClick={() => setShowAdd(true)} className="px-4 py-2 rounded-lg bg-ink text-white text-sm font-medium">
              Agregar cuenta
            </button>
          }
        />
      ) : (
        <div className="bg-card rounded-2xl border border-line shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line">
                {['Proveedor','Nombre','Alcance','ID de cuenta','Estado','Sincronización','Notas',''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-ink-soft uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {connections.map(c => (
                <tr key={c.id} className="border-b border-line/50 hover:bg-bg/40 transition-colors">
                  <td className="px-4 py-3.5"><CloudChip provider={c.provider} /></td>
                  <td className="px-4 py-3.5 font-medium text-ink">{c.display_name}</td>
                  <td className="px-4 py-3.5"><Badge variant={c.scope as ConnectionScope} /></td>
                  <td className="px-4 py-3.5 font-plex-mono text-xs text-ink-soft">{c.provider_account_id ?? c.aws_account_id ?? '—'}</td>
                  <td className="px-4 py-3.5"><Badge variant={c.status as ConnectionStatus} /></td>
                  <td className="px-4 py-3.5">
                    {c.provider === 'aws' && c.connection_mode === 'cross_account_role' ? (
                      <SyncButton
                        connectionId={c.id}
                        lastSyncAt={c.last_sync_at ?? null}
                        lastSyncStatus={c.last_sync_status ?? null}
                        lastSyncError={c.last_sync_error ?? null}
                      />
                    ) : (
                      <span className="text-xs text-ink-soft">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-ink-soft text-xs max-w-[160px] truncate">{c.notes ?? '—'}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setEditConn(c)} className="p-1.5 rounded-lg text-ink-soft hover:text-accent hover:bg-accent/10 transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <form action={deleteConnection.bind(null, c.id, tenantId)}>
                        <button
                          type="submit"
                          onClick={e => { if (!confirm('¿Eliminar esta conexión?')) e.preventDefault(); }}
                          className="p-1.5 rounded-lg text-ink-soft hover:text-bad hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Agregar cuenta cloud">
        <ConnectionForm tenantId={tenantId} platformAccountId={platformAccountId} onSuccess={() => { setShowAdd(false); window.location.reload(); }} />
      </Modal>

      <Modal open={!!editConn} onClose={() => setEditConn(null)} title="Editar conexión">
        {editConn && (
          <ConnectionForm
            tenantId={tenantId}
            initial={editConn}
            onSuccess={() => { setEditConn(null); window.location.reload(); }}
          />
        )}
      </Modal>
    </div>
  );
}
