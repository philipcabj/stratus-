'use client';

import { useState } from 'react';
import { createAwsConnection } from '@/lib/actions/connections';
import { generateCFTemplate } from '@/lib/connectors/aws/cloudformation';
import { Copy, Check, Download, ChevronRight, ChevronLeft, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

interface Props {
  tenantId: string;
  platformAccountId: string;
  onSuccess: () => void;
}

function CopyBlock({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-xs font-medium text-ink-soft">{label}</p>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-ink-soft hover:text-accent transition-colors"
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <pre className="bg-ink text-white/80 text-[11px] rounded-xl p-3 overflow-x-auto leading-relaxed font-plex-mono whitespace-pre-wrap break-all">
        {value}
      </pre>
    </div>
  );
}

export function AwsConnectWizard({ tenantId, platformAccountId, onSuccess }: Props) {
  const [step,       setStep]       = useState<0 | 1 | 2>(0);
  const [externalId, setExternalId] = useState('');
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState(false);

  function handleContinue() {
    const id = crypto.randomUUID();
    setExternalId(id);
    setStep(1);
  }

  function handleDownloadCF() {
    const json     = generateCFTemplate({ platformAccountId, externalId });
    const blob     = new Blob([json], { type: 'application/json' });
    const url      = URL.createObjectURL(blob);
    const a        = document.createElement('a');
    a.href         = url;
    a.download     = 'stratus-role-setup.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const fd = new FormData(e.currentTarget);
    fd.set('external_id', externalId);

    const result = await createAwsConnection(tenantId, fd);
    setLoading(false);

    if (!result.ok) {
      setError(result.error ?? 'Error desconocido al conectar con AWS');
    } else {
      setSuccess(true);
      setTimeout(onSuccess, 1500);
    }
  }

  const trustPolicy = JSON.stringify({
    Version: '2012-10-17',
    Statement: [{
      Effect: 'Allow',
      Principal: { AWS: `arn:aws:iam::${platformAccountId}:root` },
      Action: 'sts:AssumeRole',
      Condition: { StringEquals: { 'sts:ExternalId': externalId } },
    }],
  }, null, 2);

  const permissionsPolicy = JSON.stringify({
    Version: '2012-10-17',
    Statement: [{
      Sid: 'CostExplorerReadOnly',
      Effect: 'Allow',
      Action: ['ce:Get*', 'ce:Describe*', 'ce:List*'],
      Resource: '*',
    }],
  }, null, 2);

  // ── Paso 0: selector de modo ───────────────────────────────────────
  if (step === 0) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-ink-soft">Elegí cómo está configurada la cuenta AWS de este cliente.</p>

        <div className="space-y-3">
          {/* cross_account_role — habilitado */}
          <label className="flex items-start gap-3 p-4 rounded-xl border-2 border-accent bg-accent/5 cursor-pointer">
            <input type="radio" name="mode" value="cross_account_role" defaultChecked className="mt-0.5 accent-accent" />
            <div>
              <p className="text-sm font-medium text-ink">Cuenta directa (Cross-Account Role)</p>
              <p className="text-xs text-ink-soft mt-0.5">
                El cliente tiene su propia cuenta AWS. Crea un rol IAM que confía en nuestra cuenta y nosotros leemos los costos.
              </p>
            </div>
          </label>

          {/* partner_billing — deshabilitado */}
          <label className="flex items-start gap-3 p-4 rounded-xl border border-line opacity-50 cursor-not-allowed">
            <input type="radio" name="mode" value="partner_billing" disabled className="mt-0.5" />
            <div>
              <p className="text-sm font-medium text-ink">
                Billing Transfer / PMA
                <span className="ml-2 text-[10px] font-medium text-accent border border-accent/30 bg-accent/10 px-1.5 py-0.5 rounded-md">
                  Próximamente
                </span>
              </p>
              <p className="text-xs text-ink-soft mt-0.5">
                La cuenta del cliente transfiere su facturación a nuestra PMA. Una sola conexión alimenta múltiples clientes.
              </p>
            </div>
          </label>
        </div>

        <button
          type="button"
          onClick={handleContinue}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-ink text-white text-sm font-medium hover:bg-ink/90 transition-colors"
        >
          Continuar
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // ── Paso 1: instrucciones ──────────────────────────────────────────
  if (step === 1) {
    return (
      <div className="space-y-5">
        <div className="p-3 bg-accent/5 border border-accent/20 rounded-xl text-sm text-ink-soft">
          El cliente debe crear un rol IAM en su cuenta AWS antes de continuar. Compartí estas instrucciones con él.
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-bg border border-line">
              <p className="text-[10px] text-ink-soft uppercase tracking-wide mb-1">Nuestro Account ID</p>
              <p className="font-plex-mono text-sm text-ink font-medium">{platformAccountId}</p>
            </div>
            <div className="p-3 rounded-xl bg-bg border border-line">
              <p className="text-[10px] text-ink-soft uppercase tracking-wide mb-1">External ID</p>
              <p className="font-plex-mono text-xs text-ink font-medium break-all">{externalId}</p>
            </div>
          </div>

          <CopyBlock label="Trust Policy (pegar en el rol IAM)" value={trustPolicy} />
          <CopyBlock label="Política de permisos (adjuntar al rol)" value={permissionsPolicy} />

          <div>
            <p className="text-xs text-ink-soft mb-2">O usar la plantilla de CloudFormation que crea todo automáticamente:</p>
            <button
              type="button"
              onClick={handleDownloadCF}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-line text-sm text-ink-soft hover:text-accent hover:border-accent transition-colors"
            >
              <Download className="w-4 h-4" />
              Descargar plantilla CloudFormation
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2 border-t border-line">
          <button
            type="button"
            onClick={() => setStep(0)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-line text-sm text-ink-soft hover:text-ink transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Atrás
          </button>
          <button
            type="button"
            onClick={() => setStep(2)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-ink text-white text-sm font-medium hover:bg-ink/90 transition-colors"
          >
            Ya creé el rol — Continuar
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ── Paso 2: datos + test ───────────────────────────────────────────
  if (success) {
    return (
      <div className="flex flex-col items-center gap-3 py-8">
        <CheckCircle className="w-12 h-12 text-ok" />
        <p className="font-medium text-ink">¡Conexión exitosa!</p>
        <p className="text-sm text-ink-soft">Los costos se sincronizarán automáticamente.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-ink-soft mb-1.5">Nombre descriptivo *</label>
        <input
          name="display_name" required
          className="w-full px-3 py-2 rounded-lg border border-line bg-bg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          placeholder="Ej: AWS Producción"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-ink-soft mb-1.5">Role ARN *</label>
        <input
          name="role_arn" required
          pattern="arn:aws:iam::\d{12}:role/.+"
          className="w-full px-3 py-2 rounded-lg border border-line bg-bg text-ink text-sm font-plex-mono focus:outline-none focus:ring-2 focus:ring-accent"
          placeholder="arn:aws:iam::123456789012:role/StratusCostReaderRole"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-ink-soft mb-1.5">AWS Account ID *</label>
        <input
          name="aws_account_id" required
          pattern="\d{12}"
          maxLength={12}
          className="w-full px-3 py-2 rounded-lg border border-line bg-bg text-ink text-sm font-plex-mono focus:outline-none focus:ring-2 focus:ring-accent"
          placeholder="123456789012"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-ink-soft mb-1.5">Notas internas</label>
        <textarea
          name="notes" rows={2}
          className="w-full px-3 py-2 rounded-lg border border-line bg-bg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
          placeholder="Opcional"
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-bad">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <div className="flex items-center gap-3 pt-2 border-t border-line">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-line text-sm text-ink-soft hover:text-ink transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Atrás
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-60"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Probando conexión…' : 'Guardar y probar conexión'}
        </button>
      </div>
    </form>
  );
}
