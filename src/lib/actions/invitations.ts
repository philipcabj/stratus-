'use server';

import { revalidatePath } from 'next/cache';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { UserRole } from '@/lib/types';

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

export async function createInvitation(tenantId: string | null, formData: FormData) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'No autenticado' };

  const email = formData.get('email') as string;
  const role  = formData.get('role') as UserRole;

  const { data, error } = await supabase
    .from('tenant_invitations')
    .insert({
      tenant_id:  tenantId,
      email,
      role,
      invited_by: user.id,
    })
    .select('id')
    .single();

  if (error) return { error: error.message };

  const inviteUrl = `${getBaseUrl()}/invite/${data.id}`;

  if (tenantId) revalidatePath(`/admin/clients/${tenantId}`);
  return { success: true, inviteUrl };
}

export async function revokeInvitation(invitationId: string, tenantId?: string, _formData?: FormData): Promise<void> {
  const supabase = await getSupabaseServerClient();

  const { error } = await supabase
    .from('tenant_invitations')
    .update({ status: 'revoked' })
    .eq('id', invitationId);

  if (error) throw new Error(error.message);

  if (tenantId) revalidatePath(`/admin/clients/${tenantId}`);
}

export async function acceptInvitation(invitationId: string, password: string) {
  // Needs service role to create users
  const cookieStore = await cookies();
  const supabaseAdmin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  );

  // Load invitation
  const { data: invitation, error: invErr } = await supabaseAdmin
    .from('tenant_invitations')
    .select('*')
    .eq('id', invitationId)
    .single();

  if (invErr || !invitation) return { error: 'Invitación no encontrada' };
  if (invitation.status !== 'pending') return { error: 'Esta invitación ya fue usada o revocada' };
  if (new Date(invitation.expires_at) < new Date()) {
    await supabaseAdmin
      .from('tenant_invitations')
      .update({ status: 'expired' })
      .eq('id', invitationId);
    return { error: 'La invitación expiró' };
  }

  // Create auth user
  const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
    email:             invitation.email,
    password,
    email_confirm:     true,
    user_metadata:     { role: invitation.role },
  });

  if (authErr) return { error: authErr.message };

  // Update profile (trigger creates it, we update fields)
  await supabaseAdmin
    .from('profiles')
    .update({ tenant_id: invitation.tenant_id, role: invitation.role })
    .eq('id', authData.user.id);

  // Mark invitation accepted
  await supabaseAdmin
    .from('tenant_invitations')
    .update({ status: 'accepted' })
    .eq('id', invitationId);

  return { success: true };
}
