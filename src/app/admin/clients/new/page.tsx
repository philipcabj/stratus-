import { PageHeader } from '@/components/ui/PageHeader';
import { TenantForm } from '@/components/admin/TenantForm';
import { createTenant } from '@/lib/actions/tenants';

export default function NewClientPage() {
  return (
    <div className="p-6">
      <PageHeader title="Nuevo cliente" subtitle="Completá los datos para registrar un nuevo tenant" />
      <div className="bg-card rounded-2xl border border-line shadow-sm p-6 max-w-xl">
        <TenantForm action={createTenant} submitLabel="Crear cliente" />
      </div>
    </div>
  );
}
