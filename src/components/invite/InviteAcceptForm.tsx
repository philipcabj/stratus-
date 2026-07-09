'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { acceptInvitation } from '@/lib/actions/invitations';
import type { UserRole } from '@/lib/types';

interface Props {
  invitationId: string;
  email: string;
  role: UserRole;
}

const ROLE_LABELS: Record<UserRole, string> = {
  platform_admin: 'Administrador de plataforma',
  tenant_admin:   'Administrador de cuenta',
  tenant_viewer:  'Visualizador',
};

export function InviteAcceptForm({ invitationId, email, role }: Props) {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    const result = await acceptInvitation(invitationId, password);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    // Success — redirect to login
    router.push('/login?activated=1');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-ink-soft mb-1">Email</label>
        <input
          type="email"
          value={email}
          disabled
          className="w-full px-3 py-2 rounded-lg border border-line bg-line/30 text-ink-soft text-sm cursor-not-allowed"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-ink-soft mb-1">Rol asignado</label>
        <input
          type="text"
          value={ROLE_LABELS[role]}
          disabled
          className="w-full px-3 py-2 rounded-lg border border-line bg-line/30 text-ink-soft text-sm cursor-not-allowed"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-ink-soft mb-1">Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full px-3 py-2 rounded-lg border border-line bg-bg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          placeholder="Mínimo 8 caracteres"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-ink-soft mb-1">Confirmar contraseña</label>
        <input
          type="password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
          autoComplete="new-password"
          className="w-full px-3 py-2 rounded-lg border border-line bg-bg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          placeholder="Repetí la contraseña"
        />
      </div>

      {error && <p className="text-sm text-bad">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-lg font-medium text-sm text-white transition-colors disabled:opacity-50"
        style={{ backgroundColor: '#0E9BB5' }}
      >
        {loading ? 'Activando cuenta…' : 'Activar cuenta'}
      </button>
    </form>
  );
}
