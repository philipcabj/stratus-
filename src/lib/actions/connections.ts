'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { Provider, ConnectionScope } from '@/lib/types';

export async function createConnection(tenantId: string, formData: FormData) {
  const supabase = await getSupabaseServerClient();

  const { error } = await supabase.from('cloud_connections').insert({
    tenant_id:           tenantId,
    provider:            formData.get('provider') as Provider,
    display_name:        formData.get('display_name') as string,
    scope:               (formData.get('scope') as ConnectionScope) ?? 'single_account',
    provider_account_id: formData.get('provider_account_id') as string | null,
    notes:               formData.get('notes') as string | null,
    status:              'pending',
  });

  if (error) return { error: error.message };
  revalidatePath(`/admin/clients/${tenantId}`);
  return { success: true };
}

export async function updateConnection(connectionId: string, tenantId: string, formData: FormData) {
  const supabase = await getSupabaseServerClient();

  const { error } = await supabase
    .from('cloud_connections')
    .update({
      display_name:        formData.get('display_name') as string,
      scope:               formData.get('scope') as ConnectionScope,
      provider_account_id: formData.get('provider_account_id') as string | null,
      notes:               formData.get('notes') as string | null,
    })
    .eq('id', connectionId);

  if (error) return { error: error.message };
  revalidatePath(`/admin/clients/${tenantId}`);
  return { success: true };
}

export async function deleteConnection(connectionId: string, tenantId: string, _formData?: FormData): Promise<void> {
  const supabase = await getSupabaseServerClient();

  const { error } = await supabase
    .from('cloud_connections')
    .delete()
    .eq('id', connectionId);

  if (error) throw new Error(error.message);
  revalidatePath(`/admin/clients/${tenantId}`);
}
