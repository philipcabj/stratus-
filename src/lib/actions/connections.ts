'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getConnector } from '@/lib/connectors/registry';
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

export async function createAwsConnection(
  tenantId: string,
  formData: FormData
): Promise<{ ok: boolean; connectionId?: string; error?: string }> {
  const supabase = await getSupabaseServerClient();

  const display_name    = formData.get('display_name') as string;
  const role_arn        = formData.get('role_arn') as string;
  const aws_account_id  = formData.get('aws_account_id') as string;
  const external_id     = formData.get('external_id') as string;
  const notes           = (formData.get('notes') as string) || null;

  const { data, error } = await supabase
    .from('cloud_connections')
    .insert({
      tenant_id:       tenantId,
      provider:        'aws',
      connection_mode: 'cross_account_role',
      display_name,
      role_arn,
      aws_account_id,
      external_id,
      notes,
      scope:           'single_account',
      status:          'pending',
    })
    .select('*')
    .single();

  if (error) return { ok: false, error: error.message };

  // Probar la conexión inmediatamente
  const connector = getConnector(data);
  if (!connector) return { ok: false, connectionId: data.id, error: 'No se pudo inicializar el conector' };

  const test = await connector.testConnection();

  await supabase
    .from('cloud_connections')
    .update({ status: test.ok ? 'connected' : 'error', last_sync_error: test.error ?? null })
    .eq('id', data.id);

  revalidatePath(`/admin/clients/${tenantId}`);
  return { ok: test.ok, connectionId: data.id, error: test.error };
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
