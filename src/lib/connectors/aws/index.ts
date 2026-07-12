import { STSClient, AssumeRoleCommand } from '@aws-sdk/client-sts';
import {
  CostExplorerClient,
  GetCostAndUsageCommand,
  type ResultByTime,
} from '@aws-sdk/client-cost-explorer';
import { mapServiceCategory } from './service-mapping';
import type { CloudConnector, CostRow, SyncResult } from '../types';
import type { CloudConnection } from '@/lib/types';

type AwsCredentials = {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
};

type AwsConnection = CloudConnection & {
  tenant_id: string;
  role_arn: string;
  external_id: string;
};

function getPlatformCreds() {
  return {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    region:          process.env.AWS_REGION ?? 'us-east-1',
  };
}

async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      const isThrottle =
        err instanceof Error &&
        (err.name === 'ThrottlingException' || err.name === 'TooManyRequestsException');
      if (!isThrottle || attempt === retries - 1) throw err;
      await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
    }
  }
  throw new Error('Unreachable');
}

function monthStart(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
}

function addMonths(date: Date, n: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  d.setDate(1);
  return d;
}

export class AwsConnector implements CloudConnector {
  constructor(private connection: AwsConnection) {}

  private async assumeRole(): Promise<AwsCredentials> {
    const { accessKeyId, secretAccessKey, region } = getPlatformCreds();
    const sts = new STSClient({ region, credentials: { accessKeyId, secretAccessKey } });

    const result = await withRetry(() =>
      sts.send(new AssumeRoleCommand({
        RoleArn:         this.connection.role_arn,
        RoleSessionName: `stratus-sync-${this.connection.id.slice(0, 8)}`,
        ExternalId:      this.connection.external_id,
        DurationSeconds: 900,
      }))
    );

    if (!result.Credentials) throw new Error('STS did not return credentials');
    return {
      accessKeyId:     result.Credentials.AccessKeyId!,
      secretAccessKey: result.Credentials.SecretAccessKey!,
      sessionToken:    result.Credentials.SessionToken!,
    };
  }

  async testConnection(): Promise<{ ok: boolean; error?: string }> {
    try {
      const creds = await this.assumeRole();
      const ce = new CostExplorerClient({ region: 'us-east-1', credentials: creds });

      const now   = new Date();
      const start = monthStart(now);
      const end   = monthStart(addMonths(now, 1));

      await withRetry(() =>
        ce.send(new GetCostAndUsageCommand({
          TimePeriod:  { Start: start, End: end },
          Granularity: 'MONTHLY',
          Metrics:     ['UnblendedCost'],
          GroupBy:     [{ Type: 'DIMENSION', Key: 'SERVICE' }],
        }))
      );

      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  async syncCosts(opts: { fullSync: boolean }): Promise<SyncResult> {
    const rows: CostRow[]   = [];
    const errors: string[]  = [];

    try {
      const creds = await this.assumeRole();
      const ce = new CostExplorerClient({ region: 'us-east-1', credentials: creds });

      const now   = new Date();
      const start = opts.fullSync
        ? monthStart(addMonths(now, -6))
        : monthStart(addMonths(now, -1));
      const end   = monthStart(addMonths(now, 1));

      // Una sola llamada — minimiza costo (USD 0,01/request)
      const response = await withRetry(() =>
        ce.send(new GetCostAndUsageCommand({
          TimePeriod:  { Start: start, End: end },
          Granularity: 'MONTHLY',
          Metrics:     ['UnblendedCost'],
          GroupBy:     [{ Type: 'DIMENSION', Key: 'SERVICE' }],
        }))
      );

      for (const period of (response.ResultsByTime ?? []) as ResultByTime[]) {
        const billingPeriod = period.TimePeriod?.Start;
        if (!billingPeriod) continue;

        for (const group of period.Groups ?? []) {
          const serviceName = group.Keys?.[0] ?? 'Unknown';
          const amount      = parseFloat(group.Metrics?.['UnblendedCost']?.Amount ?? '0');

          if (amount === 0) continue;   // ignorar servicios sin costo

          rows.push({
            tenant_id:        this.connection.tenant_id,
            connection_id:    this.connection.id,
            provider:         'aws',
            billing_period:   billingPeriod,
            service_category: mapServiceCategory(serviceName),
            service_name:     serviceName,
            amount_usd:       amount,
          });
        }
      }

      // NOTA Fase 2b: en modo partner_billing, aquí iría la resolución
      // organización AWS → tenant_id via tabla aws_org_tenant_map (no implementada).
      // La interfaz CostRow ya tiene tenant_id, así que syncCosts() lo resolvería
      // internamente y la capa de persistencia (sync.ts) no cambiaría.

    } catch (err) {
      errors.push(err instanceof Error ? err.message : String(err));
    }

    return { rows, errors };
  }
}
