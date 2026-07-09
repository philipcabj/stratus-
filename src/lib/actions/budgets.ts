'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function updateBudget(tenantId: string, formData: FormData) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'No autenticado' };

  const monthly_amount_usd  = parseFloat(formData.get('monthly_amount_usd') as string);
  const alert_threshold_pct = parseInt(formData.get('alert_threshold_pct') as string, 10);

  // Fetch current budget
  const { data: current } = await supabase
    .from('budgets')
    .select('id, monthly_amount_usd')
    .eq('tenant_id', tenantId)
    .single();

  if (current) {
    // Update existing
    const { error } = await supabase
      .from('budgets')
      .update({ monthly_amount_usd, alert_threshold_pct })
      .eq('id', current.id);
    if (error) return { error: error.message };

    // Record history
    await supabase.from('budget_history').insert({
      tenant_id:  tenantId,
      old_amount: current.monthly_amount_usd,
      new_amount: monthly_amount_usd,
      changed_by: user.id,
    });
  } else {
    // Insert new
    const { error } = await supabase
      .from('budgets')
      .insert({ tenant_id: tenantId, monthly_amount_usd, alert_threshold_pct });
    if (error) return { error: error.message };

    await supabase.from('budget_history').insert({
      tenant_id:  tenantId,
      old_amount: null,
      new_amount: monthly_amount_usd,
      changed_by: user.id,
    });
  }

  revalidatePath(`/admin/clients/${tenantId}`);
  return { success: true };
}
