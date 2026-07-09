import { getSupabaseServerClient } from '@/lib/supabase/server';
import { InviteAcceptForm } from '@/components/invite/InviteAcceptForm';
import { Cloud, AlertCircle } from 'lucide-react';

interface Props {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: Props) {
  const { token } = await params;
  const supabase = await getSupabaseServerClient();

  const { data: invitation } = await supabase
    .from('tenant_invitations')
    .select('id, email, role, status, expires_at, tenants(name)')
    .eq('id', token)
    .single();

  const isValid =
    invitation &&
    invitation.status === 'pending' &&
    new Date(invitation.expires_at) > new Date();

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F3F5F8' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#0E9BB5' }}>
            <Cloud className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-archivo font-700 text-ink text-base tracking-wide">STRATUS</p>
            <p className="text-ink-soft text-[10px] tracking-widest uppercase">Panel Multicloud</p>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-line shadow-sm p-8">
          {!isValid ? (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-bad" />
              </div>
              <h1 className="font-archivo font-700 text-ink text-lg mb-2">Invitación inválida</h1>
              <p className="text-ink-soft text-sm">
                {!invitation
                  ? 'Esta invitación no existe.'
                  : invitation.status === 'accepted'
                    ? 'Esta invitación ya fue utilizada.'
                    : invitation.status === 'revoked'
                      ? 'Esta invitación fue revocada.'
                      : 'Esta invitación expiró.'}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="font-archivo font-700 text-ink text-xl mb-1">Activar tu cuenta</h1>
                <p className="text-ink-soft text-sm">
                  Te invitaron a acceder a{' '}
                  <strong>{(invitation.tenants as unknown as { name: string } | null)?.name ?? 'Stratus'}</strong>.
                  Completá tus datos para continuar.
                </p>
              </div>

              <InviteAcceptForm
                invitationId={invitation.id}
                email={invitation.email}
                role={invitation.role}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
