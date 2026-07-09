'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function resolveAlert(alertId: string, _formData?: FormData): Promise<void> {
  const supabase = await getSupabaseServerClient();

  const { error } = await supabase
    .from('alerts')
    .update({ resolved: true })
    .eq('id', alertId);

  if (error) throw new Error(error.message);

  revalidatePath('/admin/alerts');
  revalidatePath('/admin');
  revalidatePath('/dashboard/alerts');
}
