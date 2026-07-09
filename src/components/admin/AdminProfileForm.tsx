'use client';

import { useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

interface Props {
  userId: string;
  email: string;
  fullName: string;
}

export function AdminProfileForm({ userId, email, fullName }: Props) {
  const [name, setName]           = useState(fullName);
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [loading, setLoading]     = useState(false);
  const [message, setMessage]     = useState('');
  const [error, setError]         = useState('');

  const supabase = getSupabaseBrowserClient();

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    // Update profile name
    const { error: profileErr } = await supabase
      .from('profiles')
      .update({ full_name: name })
      .eq('id', userId);

    if (profileErr) {
      setError(profileErr.message);
      setLoading(false);
      return;
    }

    // Optionally update password
    if (password) {
      if (password !== confirm) {
        setError('Las contraseñas no coinciden.');
        setLoading(false);
        return;
      }
      const { error: passErr } = await supabase.auth.updateUser({ password });
      if (passErr) {
        setError(passErr.message);
        setLoading(false);
        return;
      }
    }

    setMessage('Datos actualizados correctamente.');
    setPassword('');
    setConfirm('');
    setLoading(false);
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-ink-soft mb-1">Nombre completo</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-line bg-bg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          placeholder="Tu nombre"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-ink-soft mb-1">Email</label>
        <input
          type="email"
          value={email}
          disabled
          className="w-full px-3 py-2 rounded-lg border border-line bg-line/30 text-ink-soft text-sm cursor-not-allowed"
        />
      </div>

      <hr className="border-line" />

      <p className="text-xs text-ink-soft font-medium">Cambiar contraseña (opcional)</p>

      <div>
        <label className="block text-xs font-medium text-ink-soft mb-1">Nueva contraseña</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-line bg-bg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          placeholder="Mínimo 8 caracteres"
          minLength={8}
          autoComplete="new-password"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-ink-soft mb-1">Confirmar contraseña</label>
        <input
          type="password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-line bg-bg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          placeholder="Repetí la contraseña"
          autoComplete="new-password"
        />
      </div>

      {error && <p className="text-sm text-bad">{error}</p>}
      {message && <p className="text-sm text-ok">{message}</p>}

      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 rounded-lg bg-ink text-white text-sm font-medium hover:bg-ink/90 transition-colors disabled:opacity-50"
      >
        {loading ? 'Guardando…' : 'Guardar cambios'}
      </button>
    </form>
  );
}
