'use client';

import { useState } from 'react';
import { createConnection, updateConnection } from '@/lib/actions/connections';
import { PROVIDER_LABELS, PROVIDER_COLORS } from '@/lib/constants';
import { Info } from 'lucide-react';
import type { CloudConnection, Provider } from '@/lib/types';

const PROVIDERS: Provider[] = ['aws', 'azure', 'gcp', 'oci'];

interface Props {
  tenantId: string;
  onSuccess: () => void;
  initial?: CloudConnection;
}

export function ConnectionForm({ tenantId, onSuccess, initial }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const fd = new FormData(e.currentTarget);
    const result = initial
      ? await updateConnection(initial.id, tenantId, fd)
      : await createConnection(tenantId, fd);
    if (result?.error) { setError(result.error); setLoading(false); }
    else { onSuccess(); }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!initial && (
        <div>
          <label className="block text-sm font-medium text-ink-soft mb-1.5">Proveedor *</label>
          <div className="grid grid-cols-2 gap-2">
            {PROVIDERS.map(p => (
              <label key={p} className="flex items-center gap-2 p-3 rounded-xl border border-line cursor-pointer hover:border-accent transition-colors has-[:checked]:border-accent has-[:checked]:bg-accent/5">
                <input type="radio" name="provider" value={p} required className="accent-accent" />
                <span className="text-sm font-medium" style={{ color: PROVIDER_COLORS[p] }}>
                  {PROVIDER_LABELS[p]}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-ink-soft mb-1.5">Nombre descriptivo *</label>
        <input
          name="display_name" required defaultValue={initial?.display_name ?? ''}
          className="w-full px-3 py-2 rounded-lg border border-line bg-bg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          placeholder="Ej: AWS Producción"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink-soft mb-1.5">Alcance</label>
        <div className="flex gap-3">
          {[
            { value: 'single_account', label: 'Cuenta individual' },
            { value: 'organization',   label: 'Organización' },
          ].map(opt => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="scope" value={opt.value} defaultChecked={opt.value === (initial?.scope ?? 'single_account')} className="accent-accent" />
              <span className="text-sm text-ink">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink-soft mb-1.5">ID de cuenta / organización</label>
        <input
          name="provider_account_id" defaultValue={initial?.provider_account_id ?? ''}
          className="w-full px-3 py-2 rounded-lg border border-line bg-bg text-ink text-sm font-plex-mono focus:outline-none focus:ring-2 focus:ring-accent"
          placeholder="123456789012"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink-soft mb-1.5">Notas internas</label>
        <textarea
          name="notes" rows={2} defaultValue={initial?.notes ?? ''}
          className="w-full px-3 py-2 rounded-lg border border-line bg-bg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
          placeholder="Ej: Cuenta de producción, gestionada por el CTO"
        />
      </div>

      <div className="flex items-center gap-2 p-3 bg-bg rounded-xl border border-line text-xs text-ink-soft">
        <Info className="w-4 h-4 flex-shrink-0" />
        La conexión se creará en estado <strong>Pendiente</strong>. El botón "Probar conexión" estará disponible en la próxima versión.
      </div>

      {error && <p className="text-sm text-bad">{error}</p>}

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit" disabled={loading}
          className="px-5 py-2.5 rounded-lg bg-ink text-white text-sm font-medium hover:bg-ink/90 disabled:opacity-60"
        >
          {loading ? 'Guardando…' : initial ? 'Guardar cambios' : 'Agregar conexión'}
        </button>
      </div>
    </form>
  );
}
