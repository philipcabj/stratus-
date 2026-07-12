import { AwsConnector } from './aws';
import type { CloudConnector } from './types';
import type { CloudConnection } from '@/lib/types';

/**
 * Devuelve el conector adecuado para una conexión, o null si no está implementado.
 * Para agregar Azure/GCP/OCI: agregar un case aquí e implementar la clase correspondiente.
 */
export function getConnector(connection: CloudConnection): CloudConnector | null {
  if (connection.provider !== 'aws') {
    // Azure, GCP, OCI — Fase 3+
    return null;
  }

  if (connection.connection_mode === 'partner_billing') {
    // Fase 2b — no implementado
    return null;
  }

  // cross_account_role requiere tenant_id, role_arn y external_id
  if (!connection.tenant_id || !connection.role_arn || !connection.external_id) {
    return null;
  }

  return new AwsConnector(
    connection as CloudConnection & { tenant_id: string; role_arn: string; external_id: string }
  );
}
