import { notFound } from 'next/navigation';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/PageHeader';
import { TenantForm } from '@/components/admin/TenantForm';
import { updateTenant } from '@/lib/actions/tenants';

interface Props { params: Promise<{ id: string }> }

export default async function EditClientPage({ params }: Props) {
  const { id } = await params;
  const supabase = await getSupabaseServerClient();

  const { data: tenant } = await supabase.from('tenants').select('*').eq('id', id).single();
  if (!tenant) notFound();

  const action = updateTenant.bind(null, id);

  return (
    <div className="p-6">
      <PageHeader title={`Editar ${tenant.name}`} subtitle="Modificá los datos del cliente" />
      <div className="bg-card rounded-2xl border border-line shadow-sm p-6 max-w-xl">
        <TenantForm
          action={action}
          initialData={tenant}
          submitLabel="Guardar cambios"
          cancelHref={`/admin/clients/${id}`}
        />
      </div>
    </div>
  );
}
