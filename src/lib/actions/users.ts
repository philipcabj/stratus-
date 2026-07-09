'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function deactivateUser(userId: string, tenantId?: string, _formData?: FormData): Promise<void> {
  const supabase = await getSupabaseServerClient();

  const { error } = await supabase
    .from('profiles')
    .update({ is_active: false })
    .eq('id', userId);

  if (error) throw new Error(error.message);

  if (tenantId) revalidatePath(`/admin/clients/${tenantId}`);
  revalidatePath('/admin/clients');
}

export async function reactivateUser(userId: string, tenantId?: string, _formData?: FormData): Promise<void> {
  const supabase = await getSupabaseServerClient();

  const { error } = await supabase
    .from('profiles')
    .update({ is_active: true })
    .eq('id', userId);

  if (error) throw new Error(error.message);

  if (tenantId) revalidatePath(`/admin/clients/${tenantId}`);
  revalidatePath('/admin/clients');
}
