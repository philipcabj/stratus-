'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function createTenant(formData: FormData) {
  const supabase = await getSupabaseServerClient();

  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;
  const contact_name = formData.get('contact_name') as string | null;
  const contact_email = formData.get('contact_email') as string | null;
  const logo_url = formData.get('logo_url') as string | null;

  const { data, error } = await supabase
    .from('tenants')
    .insert({ name, slug, contact_name, contact_email, logo_url, status: 'active' })
    .select('id')
    .single();

  if (error) return { error: error.message };

  revalidatePath('/admin/clients');
  redirect(`/admin/clients/${data.id}`);
}

export async function updateTenant(id: string, formData: FormData) {
  const supabase = await getSupabaseServerClient();

  const updates = {
    name:          formData.get('name') as string,
    slug:          formData.get('slug') as string,
    contact_name:  formData.get('contact_name') as string | null,
    contact_email: formData.get('contact_email') as string | null,
    logo_url:      formData.get('logo_url') as string | null,
    status:        formData.get('status') as string,
  };

  const { error } = await supabase.from('tenants').update(updates).eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/admin/clients');
  revalidatePath(`/admin/clients/${id}`);
  redirect(`/admin/clients/${id}`);
}

export async function archiveTenant(id: string, _formData?: FormData): Promise<void> {
  const supabase = await getSupabaseServerClient();

  const { error } = await supabase
    .from('tenants')
    .update({ status: 'archived' })
    .eq('id', id);

  if (error) throw new Error(error.message);

  revalidatePath('/admin/clients');
  redirect('/admin/clients');
}

export async function uploadTenantLogo(tenantId: string, file: File): Promise<string | null> {
  const supabase = await getSupabaseServerClient();
  const ext = file.name.split('.').pop();
  const path = `${tenantId}/logo.${ext}`;

  const { error } = await supabase.storage
    .from('tenant-logos')
    .upload(path, file, { upsert: true });

  if (error) return null;

  const { data } = supabase.storage.from('tenant-logos').getPublicUrl(path);
  return data.publicUrl;
}
