import { getSupabaseServerClient } from '@/lib/supabase/server';
import { syncConnection } from '@/lib/actions/sync';

export const maxDuration = 300; // 5 min para cubrir múltiples conexiones

export async function GET(request: Request): Promise<Response> {
  // Aceptar invocaciones del cron de Vercel (header x-vercel-cron)
  // o peticiones manuales con Authorization: Bearer CRON_SECRET
  const cronHeader    = request.headers.get('x-vercel-cron');
  const authorization = request.headers.get('authorization');
  const cronSecret    = process.env.CRON_SECRET;

  const isVercelCron = cronHeader === '1';
  const isManual     = cronSecret && authorization === `Bearer ${cronSecret}`;

  if (!isVercelCron && !isManual) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await getSupabaseServerClient();

  const { data: connections } = await supabase
    .from('cloud_connections')
    .select('id, display_name, tenant_id')
    .eq('provider', 'aws')
    .eq('connection_mode', 'cross_account_role')
    .eq('status', 'connected');

  const results: Record<string, { ok: boolean; error?: string }> = {};

  for (const conn of connections ?? []) {
    try {
      results[conn.id] = await syncConnection(conn.id);
    } catch (err) {
      // Error aislado — no detiene la sync de las demás conexiones
      results[conn.id] = {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  const total     = Object.keys(results).length;
  const succeeded = Object.values(results).filter(r => r.ok).length;

  return Response.json({ total, succeeded, results });
}
