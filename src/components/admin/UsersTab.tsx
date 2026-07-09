'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { InviteUserForm } from '@/components/admin/InviteUserForm';
import { UserTable } from '@/components/admin/UserTable';
import { UserPlus, Users } from 'lucide-react';
import type { UserRole, InvitationStatus } from '@/lib/types';

interface UserRow {
  id: string;
  full_name: string | null;
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
  tenantId: string;
  users: UserRow[];
  invitations: InvitationRow[];
}

const TENANT_ROLES = [
  { value: 'tenant_admin',  label: 'Admin cliente' },
  { value: 'tenant_viewer', label: 'Visualizador' },
];

export function UsersTab({ tenantId, users, invitations }: Props) {
  const [showInvite, setShowInvite] = useState(false);

  const hasContent = users.length > 0 || invitations.length > 0;

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-ink text-white text-sm font-medium hover:bg-ink/90 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Invitar usuario
        </button>
      </div>

      {!hasContent ? (
        <EmptyState
          icon={Users}
          title="Sin usuarios en este cliente"
          description="Invitá al primer usuario para que pueda acceder al dashboard."
          action={
            <button onClick={() => setShowInvite(true)} className="px-4 py-2 rounded-lg bg-ink text-white text-sm font-medium">
              Invitar usuario
            </button>
          }
        />
      ) : (
        <div className="bg-card rounded-2xl border border-line shadow-sm overflow-hidden p-2">
          <UserTable users={users} invitations={invitations} tenantId={tenantId} />
        </div>
      )}

      <Modal open={showInvite} onClose={() => setShowInvite(false)} title="Invitar usuario">
        <InviteUserForm
          tenantId={tenantId}
          allowedRoles={TENANT_ROLES}
          onSuccess={() => setShowInvite(false)}
        />
      </Modal>
    </div>
  );
}
