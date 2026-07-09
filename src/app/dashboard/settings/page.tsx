import { getSupabaseServerClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/PageHeader';
import { AdminProfileForm } from '@/components/admin/AdminProfileForm';
import { redirect } from 'next/navigation';

interface Props {
  searchParams: Promise<{ tenant?: string }>;
}

export default async function DashboardSettingsPage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = await getSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, tenant_id')
    .eq('id', user.id)
    .single();

  const tenantId = params.tenant ?? profile?.tenant_id ?? null;

  const { data: tenant } = tenantId
    ? await supabase.from('tenants').select('name').eq('id', tenantId).single()
    : { data: null };

  return (
    <div className="p-6 max-w-xl">
      <PageHeader
        title="Configuración"
        subtitle={tenant?.name ? `Cuenta — ${tenant.name}` : 'Tu cuenta'}
      />

      <div className="bg-card rounded-2xl border border-line shadow-sm p-6 mt-6">
        <h2 className="font-archivo font-600 text-ink text-sm mb-4">Perfil</h2>
        <AdminProfileForm
          userId={user.id}
          email={user.email ?? ''}
          fullName={profile?.full_name ?? ''}
        />
      </div>

      <div className="bg-card rounded-2xl border border-line shadow-sm p-6 mt-4">
        <h2 className="font-archivo font-600 text-ink text-sm mb-1">Rol</h2>
        <p className="text-sm text-ink-soft">
          {profile?.role === 'tenant_admin'   ? 'Administrador de cuenta' :
           profile?.role === 'tenant_viewer'  ? 'Visualizador' : profile?.role}
        </p>
        <p className="text-xs text-ink-soft mt-3">
          Email: <span className="font-plex-mono">{user.email}</span>
        </p>
      </div>
    </div>
  );
}
