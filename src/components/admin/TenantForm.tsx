'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Tenant } from '@/lib/types';

function slugify(str: string) {
  return str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

interface TenantFormProps {
  action: (formData: FormData) => Promise<void | { error: string }>;
  initialData?: Partial<Tenant>;
  submitLabel?: string;
  cancelHref?: string;
}

export function TenantForm({ action, initialData, submitLabel = 'Guardar', cancelHref = '/admin/clients' }: TenantFormProps) {
  const [name, setName] = useState(initialData?.name ?? '');
  const [slug, setSlug] = useState(initialData?.slug ?? '');
  const [slugEdited, setSlugEdited] = useState(!!initialData?.slug);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleNameChange(val: string) {
    setName(val);
    if (!slugEdited) setSlug(slugify(val));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const fd = new FormData(e.currentTarget);
    const result = await action(fd);
    if (result?.error) { setError(result.error); setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-ink-soft mb-1.5">Nombre *</label>
          <input
            name="name" required value={name}
            onChange={e => handleNameChange(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-line bg-bg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="Ej: Metalúrgica Andes"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-ink-soft mb-1.5">Slug *</label>
          <input
            name="slug" required value={slug}
            onChange={e => { setSlug(e.target.value); setSlugEdited(true); }}
            className="w-full px-3 py-2 rounded-lg border border-line bg-bg text-ink text-sm font-plex-mono focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="metalurgica-andes"
          />
          <p className="text-xs text-ink-soft mt-1">Solo minúsculas, números y guiones</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-soft mb-1.5">Nombre de contacto</label>
          <input
            name="contact_name" defaultValue={initialData?.contact_name ?? ''}
            className="w-full px-3 py-2 rounded-lg border border-line bg-bg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="Juan Pérez"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-soft mb-1.5">Email de contacto</label>
          <input
            type="email" name="contact_email" defaultValue={initialData?.contact_email ?? ''}
            className="w-full px-3 py-2 rounded-lg border border-line bg-bg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="juan@empresa.com"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-ink-soft mb-1.5">URL del logo</label>
          <input
            name="logo_url" defaultValue={initialData?.logo_url ?? ''}
            className="w-full px-3 py-2 rounded-lg border border-line bg-bg text-ink text-sm font-plex-mono focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="https://..."
          />
          <p className="text-xs text-ink-soft mt-1">URL pública de la imagen (PNG/SVG, cuadrada)</p>
        </div>

        {initialData && (
          <div>
            <label className="block text-sm font-medium text-ink-soft mb-1.5">Estado</label>
            <select
              name="status" defaultValue={initialData?.status ?? 'active'}
              className="w-full px-3 py-2 rounded-lg border border-line bg-bg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="active">Activo</option>
              <option value="paused">Pausado</option>
              <option value="archived">Archivado</option>
            </select>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-bad bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit" disabled={loading}
          className="px-5 py-2.5 rounded-lg bg-ink text-white text-sm font-medium hover:bg-ink/90 transition-colors disabled:opacity-60"
        >
          {loading ? 'Guardando…' : submitLabel}
        </button>
        <Link href={cancelHref} className="px-5 py-2.5 rounded-lg border border-line text-sm text-ink-soft hover:text-ink transition-colors">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
