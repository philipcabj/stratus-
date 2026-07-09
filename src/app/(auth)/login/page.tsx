'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { Cloud } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = getSupabaseBrowserClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isActivated   = searchParams.get('activated') === '1';
  const isDeactivated = searchParams.get('deactivated') === '1';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError || !data.user) {
      setError('Email o contraseña incorrectos');
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    router.push(profile?.role === 'platform_admin' ? '/admin' : '/dashboard');
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-ink flex items-center justify-center mb-3">
            <Cloud className="w-6 h-6 text-accent" />
          </div>
          <h1 className="font-archivo font-700 text-2xl text-ink tracking-tight">STRATUS</h1>
          <p className="text-ink-soft text-sm mt-1">Panel Multicloud</p>
        </div>

        {/* Form */}
        <div className="bg-card rounded-2xl border border-line p-8 shadow-sm">
          <h2 className="font-archivo font-600 text-lg text-ink mb-6">Iniciar sesión</h2>

          {isActivated && (
            <p className="text-sm text-ok bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-4">
              ¡Cuenta activada! Ya podés ingresar con tu email y contraseña.
            </p>
          )}
          {isDeactivated && (
            <p className="text-sm text-bad bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
              Tu cuenta fue desactivada. Contactá al administrador.
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink-soft mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-3 py-2 rounded-lg border border-line bg-bg text-ink text-sm
                           focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="usuario@empresa.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-soft mb-1.5">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-3 py-2 rounded-lg border border-line bg-bg text-ink text-sm
                           focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-bad bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-ink text-white font-medium text-sm
                         hover:bg-ink/90 transition-colors disabled:opacity-60 mt-2"
            >
              {loading ? 'Ingresando…' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
