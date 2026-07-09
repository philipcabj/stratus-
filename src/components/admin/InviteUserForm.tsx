'use client';

import { useState } from 'react';
import { createInvitation } from '@/lib/actions/invitations';
import { Copy, Check } from 'lucide-react';

interface Props {
  tenantId: string | null;
  allowedRoles: { value: string; label: string }[];
  onSuccess?: () => void;
}

export function InviteUserForm({ tenantId, allowedRoles, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inviteUrl, setInviteUrl] = useState('');
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const fd = new FormData(e.currentTarget);
    const result = await createInvitation(tenantId, fd);
    if (result?.error) {
      setError(result.error);
    } else if (result?.inviteUrl) {
      setInviteUrl(result.inviteUrl);
      onSuccess?.();
    }
    setLoading(false);
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (inviteUrl) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <p className="text-sm font-medium text-emerald-800 mb-1">Invitación creada</p>
          <p className="text-xs text-emerald-700">Copiá el link y enviáselo al usuario. Expira en 7 días.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            readOnly value={inviteUrl}
            className="flex-1 px-3 py-2 rounded-lg border border-line bg-bg text-ink text-xs font-plex-mono focus:outline-none"
          />
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-ink text-white text-xs font-medium hover:bg-ink/90 transition-colors flex-shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copiado' : 'Copiar'}
          </button>
        </div>
        <button
          onClick={() => setInviteUrl('')}
          className="text-xs text-accent hover:underline"
        >
          Invitar otro usuario
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-ink-soft mb-1.5">Email *</label>
        <input
          type="email" name="email" required
          className="w-full px-3 py-2 rounded-lg border border-line bg-bg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          placeholder="usuario@empresa.com"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-ink-soft mb-1.5">Rol *</label>
        <select
          name="role" required
          className="w-full px-3 py-2 rounded-lg border border-line bg-bg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        >
          {allowedRoles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </div>
      {error && <p className="text-sm text-bad">{error}</p>}
      <button
        type="submit" disabled={loading}
        className="w-full py-2.5 rounded-lg bg-ink text-white text-sm font-medium hover:bg-ink/90 disabled:opacity-60"
      >
        {loading ? 'Generando link…' : 'Generar link de invitación'}
      </button>
    </form>
  );
}
