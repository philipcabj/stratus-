'use client';

import { useState } from 'react';
import { updateBudget } from '@/lib/actions/budgets';
import { fmt } from '@/lib/utils';
import type { Budget, BudgetHistory } from '@/lib/types';

interface Props {
  tenantId: string;
  budget: Budget | null;
  history: BudgetHistory[];
}

export function BudgetEditor({ tenantId, budget, history }: Props) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const fd = new FormData(e.currentTarget);
    const result = await updateBudget(tenantId, fd);
    if (result?.error) { setError(result.error); } else { setEditing(false); }
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-ink">
            {budget ? fmt(budget.monthly_amount_usd) : 'Sin presupuesto'}
          </p>
          {budget && (
            <p className="text-xs text-ink-soft mt-0.5">
              Alerta al {budget.alert_threshold_pct}%
            </p>
          )}
        </div>
        <button
          onClick={() => setEditing(e => !e)}
          className="text-xs text-accent hover:underline font-medium"
        >
          {editing ? 'Cancelar' : 'Editar'}
        </button>
      </div>

      {editing && (
        <form onSubmit={handleSubmit} className="space-y-3 p-4 bg-bg rounded-xl border border-line">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-ink-soft mb-1">Presupuesto mensual (USD)</label>
              <input
                name="monthly_amount_usd" type="number" min="0" step="100" required
                defaultValue={budget?.monthly_amount_usd ?? ''}
                className="w-full px-3 py-2 rounded-lg border border-line bg-card text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-soft mb-1">Umbral de alerta (%)</label>
              <input
                name="alert_threshold_pct" type="number" min="50" max="100" required
                defaultValue={budget?.alert_threshold_pct ?? 90}
                className="w-full px-3 py-2 rounded-lg border border-line bg-card text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>
          {error && <p className="text-xs text-bad">{error}</p>}
          <button
            type="submit" disabled={loading}
            className="px-4 py-2 rounded-lg bg-ink text-white text-xs font-medium hover:bg-ink/90 disabled:opacity-60"
          >
            {loading ? 'Guardando…' : 'Guardar presupuesto'}
          </button>
        </form>
      )}

      {history.length > 0 && (
        <div>
          <p className="text-xs font-medium text-ink-soft uppercase tracking-wide mb-2">Historial</p>
          <div className="space-y-1.5">
            {history.slice(0, 5).map(h => (
              <div key={h.id} className="flex items-center justify-between text-xs text-ink-soft">
                <span>
                  {h.old_amount != null ? `${fmt(h.old_amount)} →` : 'Nuevo:'}{' '}
                  <span className="text-ink font-medium">{fmt(h.new_amount)}</span>
                </span>
                <span>{new Date(h.changed_at).toLocaleDateString('es-AR')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
