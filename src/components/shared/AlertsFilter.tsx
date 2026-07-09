'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

interface Props {
  tenants?: { id: string; name: string }[];
}

export function AlertsFilter({ tenants }: Props) {
  const router     = useRouter();
  const pathname   = usePathname();
  const searchParams = useSearchParams();

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <select
        value={searchParams.get('severity') ?? ''}
        onChange={e => update('severity', e.target.value)}
        className="px-3 py-2 rounded-lg border border-line bg-card text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent"
      >
        <option value="">Todas las severidades</option>
        <option value="critical">Crítica</option>
        <option value="warn">Advertencia</option>
        <option value="info">Información</option>
      </select>

      <select
        value={searchParams.get('type') ?? ''}
        onChange={e => update('type', e.target.value)}
        className="px-3 py-2 rounded-lg border border-line bg-card text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent"
      >
        <option value="">Todos los tipos</option>
        <option value="budget_exceeded">Presupuesto excedido</option>
        <option value="budget_forecast">Proyección de presupuesto</option>
        <option value="new_service">Nuevo servicio</option>
      </select>

      <select
        value={searchParams.get('resolved') ?? 'false'}
        onChange={e => update('resolved', e.target.value)}
        className="px-3 py-2 rounded-lg border border-line bg-card text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent"
      >
        <option value="false">Abiertas</option>
        <option value="true">Resueltas</option>
      </select>

      {tenants && (
        <select
          value={searchParams.get('tenant') ?? ''}
          onChange={e => update('tenant', e.target.value)}
          className="px-3 py-2 rounded-lg border border-line bg-card text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="">Todos los clientes</option>
          {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      )}
    </div>
  );
}
