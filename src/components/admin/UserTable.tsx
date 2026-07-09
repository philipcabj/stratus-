'use client';

import { useState } from 'react';
import { deactivateUser, reactivateUser } from '@/lib/actions/users';
import { revokeInvitation } from '@/lib/actions/invitations';
import { Badge } from '@/components/ui/Badge';
import { Copy, Check, UserX, UserCheck } from 'lucide-react';
import type { UserRole, InvitationStatus } from '@/lib/types';

interface UserRow {
  id: string;
  full_name: string | null;
  email?: string;
  role: UserRole;
  is_active: boolean;
}

interface InvitationRow {
  id: string;
  email: string;
  role: UserRole;
  status: InvitationStatus;
  expires_at: string;
  invite_url: string;
}

interface Props {
  users: UserRow[];
  invitations: InvitationRow[];
  tenantId?: string;
}

const ROLE_LABELS: Record<UserRole, string> = {
  platform_admin: 'Admin plataforma',
  tenant_admin:   'Admin cliente',
  tenant_viewer:  'Visualizador',
};

export function UserTable({ users, invitations, tenantId }: Props) {
  const [copied, setCopied] = useState<string | null>(null);

  async function handleCopy(id: string, url: string) {
    await navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="space-y-5">
      {/* Active users */}
      {users.length > 0 && (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line">
              {['Usuario','Rol','Estado',''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-ink-soft uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-line/50 hover:bg-bg/60 transition-colors">
                <td className="px-4 py-3.5">
                  <p className="font-medium text-ink">{u.full_name ?? '—'}</p>
                  {u.email && <p className="text-xs text-ink-soft mt-0.5">{u.email}</p>}
                </td>
                <td className="px-4 py-3.5 text-ink-soft text-sm">{ROLE_LABELS[u.role]}</td>
                <td className="px-4 py-3.5">
                  <Badge variant={u.is_active ? 'active' : 'inactive'} label={u.is_active ? 'Activo' : 'Inactivo'} />
                </td>
                <td className="px-4 py-3.5">
                  <form action={u.is_active
                    ? deactivateUser.bind(null, u.id, tenantId)
                    : reactivateUser.bind(null, u.id, tenantId)
                  }>
                    <button type="submit" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                      u.is_active
                        ? 'border-line text-ink-soft hover:text-bad hover:border-bad'
                        : 'border-line text-ink-soft hover:text-ok hover:border-ok'
                    }`}>
                      {u.is_active
                        ? <><UserX className="w-3.5 h-3.5" />Desactivar</>
                        : <><UserCheck className="w-3.5 h-3.5" />Reactivar</>}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pending invitations */}
      {invitations.length > 0 && (
        <div>
          <p className="text-xs font-medium text-ink-soft uppercase tracking-wide mb-2">Invitaciones pendientes</p>
          <div className="space-y-2">
            {invitations.map(inv => (
              <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl bg-bg border border-line">
                <div>
                  <p className="text-sm font-medium text-ink">{inv.email}</p>
                  <p className="text-xs text-ink-soft mt-0.5">
                    {ROLE_LABELS[inv.role]} · expira {new Date(inv.expires_at).toLocaleDateString('es-AR')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(inv.id, inv.invite_url)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-line text-xs font-medium text-ink-soft hover:text-accent hover:border-accent transition-colors"
                  >
                    {copied === inv.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied === inv.id ? 'Copiado' : 'Copiar link'}
                  </button>
                  <form action={revokeInvitation.bind(null, inv.id, tenantId)}>
                    <button type="submit" className="px-3 py-1.5 rounded-lg border border-line text-xs font-medium text-ink-soft hover:text-bad hover:border-bad transition-colors">
                      Revocar
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
