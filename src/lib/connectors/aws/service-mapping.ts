import type { ServiceCategory } from '@/lib/types';

const SERVICE_CATEGORY_MAP: Record<string, ServiceCategory> = {
  // Compute
  'Amazon EC2':                         'compute',
  'AWS Lambda':                         'compute',
  'Amazon ECS':                         'compute',
  'Amazon EKS':                         'compute',
  'AWS Fargate':                        'compute',
  'Amazon Lightsail':                   'compute',
  'AWS Batch':                          'compute',
  'Amazon EC2 Container Registry (ECR)':'compute',
  'AWS Elastic Beanstalk':              'compute',
  'Amazon AppRunner':                   'compute',

  // Storage
  'Amazon Simple Storage Service':      'storage',
  'Amazon S3':                          'storage',
  'Amazon Elastic File System':         'storage',
  'Amazon EFS':                         'storage',
  'Amazon S3 Glacier':                  'storage',
  'AWS Backup':                         'storage',
  'Amazon FSx':                         'storage',

  // Database
  'Amazon Relational Database Service': 'database',
  'Amazon RDS':                         'database',
  'Amazon DynamoDB':                    'database',
  'Amazon ElastiCache':                 'database',
  'Amazon Redshift':                    'database',
  'Amazon Aurora':                      'database',
  'Amazon DocumentDB':                  'database',
  'Amazon Neptune':                     'database',
  'Amazon Keyspaces':                   'database',
  'Amazon MemoryDB':                    'database',

  // Networking
  'Amazon CloudFront':                  'networking',
  'Amazon Route 53':                    'networking',
  'Amazon VPC':                         'networking',
  'AWS Direct Connect':                 'networking',
  'AWS Transit Gateway':                'networking',
  'Amazon API Gateway':                 'networking',
  'AWS Global Accelerator':             'networking',
  'Amazon CloudWatch':                  'networking',  // mostly ingestion/networking
  'AWS Data Transfer':                  'networking',

  // Security
  'AWS WAF':                            'security',
  'Amazon GuardDuty':                   'security',
  'AWS Shield':                         'security',
  'AWS Key Management Service':         'security',
  'AWS Secrets Manager':                'security',
  'Amazon Inspector':                   'security',
  'AWS Security Hub':                   'security',
  'AWS Certificate Manager':            'security',
  'Amazon Cognito':                     'security',
  'AWS IAM Identity Center':            'security',

  // Analytics
  'Amazon Athena':                      'analytics',
  'Amazon EMR':                         'analytics',
  'AWS Glue':                           'analytics',
  'Amazon QuickSight':                  'analytics',
  'Amazon Kinesis':                     'analytics',
  'Amazon OpenSearch Service':          'analytics',
  'AWS Lake Formation':                 'analytics',
  'Amazon MSK':                         'analytics',
};

export function mapServiceCategory(serviceName: string): ServiceCategory {
  // Exact match
  if (serviceName in SERVICE_CATEGORY_MAP) {
    return SERVICE_CATEGORY_MAP[serviceName];
  }

  // Prefix match (handles variants like "Amazon EC2-Other")
  for (const [key, category] of Object.entries(SERVICE_CATEGORY_MAP)) {
    if (serviceName.startsWith(key) || key.startsWith(serviceName)) {
      return category;
    }
  }

  console.warn(`[stratus] Unmapped AWS service: "${serviceName}" → 'other'. Add to service-mapping.ts.`);
  return 'other';
}
