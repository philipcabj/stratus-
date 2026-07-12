'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getConnector } from '@/lib/connectors/registry';

export async function syncConnection(connectionId: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = await getSupabaseServerClient();

  // Fetch la conexión con todos sus campos
  const { data: connection, error: fetchErr } = await supabase
    .from('cloud_connections')
    .select('*')
    .eq('id', connectionId)
    .single();

  if (fetchErr || !connection) {
    return { ok: false, error: 'Conexión no encontrada' };
  }

  // Marcar como running
  await supabase
    .from('cloud_connections')
    .update({ last_sync_status: 'running', last_sync_error: null })
    .eq('id', connectionId);

  const connector = getConnector(connection);
  if (!connector) {
    const err = 'Conector no disponible para este tipo de conexión';
    await supabase
      .from('cloud_connections')
      .update({ last_sync_status: 'error', last_sync_error: err })
      .eq('id', connectionId);
    return { ok: false, error: err };
  }

  const isFirstSync = !connection.last_sync_at;
  const { rows, errors } = await connector.syncCosts({ fullSync: isFirstSync });

  if (errors.length > 0 && rows.length === 0) {
    // Fallo total
    const errMsg = errors.join('; ');
    await supabase
      .from('cloud_connections')
      .update({ last_sync_status: 'error', last_sync_error: errMsg, last_sync_at: new Date().toISOString() })
      .eq('id', connectionId);
    return { ok: false, error: errMsg };
  }

  // Upsert idempotente usando el índice único (connection_id, billing_period, service_name)
  if (rows.length > 0) {
    const { error: upsertErr } = await supabase
      .from('cost_records')
      .upsert(rows, { onConflict: 'connection_id,billing_period,service_name' });

    if (upsertErr) {
      await supabase
        .from('cloud_connections')
        .update({ last_sync_status: 'error', last_sync_error: upsertErr.message, last_sync_at: new Date().toISOString() })
        .eq('id', connectionId);
      return { ok: false, error: upsertErr.message };
    }
  }

  // Actualizar estado de la conexión
  await supabase
    .from('cloud_connections')
    .update({
      last_sync_status: 'success',
      last_sync_error:  null,
      last_sync_at:     new Date().toISOString(),
      status:           'connected',
    })
    .eq('id', connectionId);

  // Evaluar alertas del tenant para el mes actual
  if (connection.tenant_id && rows.length > 0) {
    const currentPeriod = new Date();
    const billingPeriod = `${currentPeriod.getFullYear()}-${String(currentPeriod.getMonth() + 1).padStart(2, '0')}-01`;
    await evaluateAlerts(connection.tenant_id, billingPeriod, supabase);
  }

  revalidatePath(`/admin/clients/${connection.tenant_id}`);
  revalidatePath('/admin');
  revalidatePath('/dashboard');

  return { ok: true };
}

async function evaluateAlerts(
  tenantId: string,
  billingPeriod: string,
  supabase: Awaited<ReturnType<typeof import('@/lib/supabase/server').getSupabaseServerClient>>
): Promise<void> {
  // Consumo del mes actual para este tenant
  const { data: records } = await supabase
    .from('cost_records')
    .select('amount_usd')
    .eq('tenant_id', tenantId)
    .eq('billing_period', billingPeriod);

  const totalCost = (records ?? []).reduce((s, r) => s + Number(r.amount_usd), 0);
  if (totalCost === 0) return;

  // Budget del tenant
  const { data: budget } = await supabase
    .from('budgets')
    .select('monthly_amount_usd, alert_threshold_pct')
    .eq('tenant_id', tenantId)
    .single();

  if (!budget) return;

  const budgetAmount   = Number(budget.monthly_amount_usd);
  const thresholdPct   = Number(budget.alert_threshold_pct);

  // Proyección lineal al fin de mes
  const now            = new Date();
  const daysInMonth    = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dayOfMonth     = now.getDate();
  const projected      = (totalCost / dayOfMonth) * daysInMonth;

  async function ensureAlert(type: string, severity: string, message: string) {
    // No crear alerta si ya existe una abierta del mismo tipo en el mismo mes
    const { count } = await supabase
      .from('alerts')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('type', type)
      .eq('resolved', false)
      .gte('created_at', billingPeriod);

    if ((count ?? 0) === 0) {
      await supabase.from('alerts').insert({ tenant_id: tenantId, type, severity, message });
    }
  }

  if (totalCost >= budgetAmount) {
    await ensureAlert(
      'budget_exceeded',
      'critical',
      `Consumo del mes (US$ ${totalCost.toFixed(0)}) superó el presupuesto de US$ ${budgetAmount.toFixed(0)}.`
    );
  } else if (projected >= budgetAmount * (thresholdPct / 100)) {
    await ensureAlert(
      'budget_forecast',
      'warn',
      `Proyección de fin de mes (US$ ${projected.toFixed(0)}) supera el ${thresholdPct}% del presupuesto.`
    );
  }
}
