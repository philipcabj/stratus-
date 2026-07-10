'use client';

import { archiveTenant } from '@/lib/actions/tenants';

interface Props {
  tenantId: string;
  tenantName: string;
}

export function ArchiveButton({ tenantId, tenantName }: Props) {
  return (
    <form action={archiveTenant.bind(null, tenantId)}>
      <button
        type="submit"
        onClick={e => { if (!confirm(`¿Archivar ${tenantName}?`)) e.preventDefault(); }}
        className="px-3 py-1.5 rounded-lg border border-line text-xs font-medium text-ink-soft hover:text-bad hover:border-bad transition-colors"
      >
        Archivar
      </button>
    </form>
  );
}
