interface CFTemplateOpts {
  platformAccountId: string;
  externalId: string;
  roleName?: string;
}

export function generateCFTemplate(opts: CFTemplateOpts): string {
  const { platformAccountId, externalId, roleName = 'StratusCostReaderRole' } = opts;

  const template = {
    AWSTemplateFormatVersion: '2010-09-09',
    Description: 'Stratus — Rol IAM de solo lectura para Cost Explorer (cross-account)',
    Resources: {
      StratusCostPolicy: {
        Type: 'AWS::IAM::ManagedPolicy',
        Properties: {
          ManagedPolicyName: 'StratusCostReadOnly',
          Description: 'Permite a Stratus leer datos de costos via Cost Explorer',
          PolicyDocument: {
            Version: '2012-10-17',
            Statement: [
              {
                Sid: 'CostExplorerReadOnly',
                Effect: 'Allow',
                Action: ['ce:Get*', 'ce:Describe*', 'ce:List*'],
                Resource: '*',
              },
            ],
          },
        },
      },
      StratusCostReaderRole: {
        Type: 'AWS::IAM::Role',
        Properties: {
          RoleName: roleName,
          Description: 'Rol asumido por Stratus para leer costos de Cost Explorer',
          AssumeRolePolicyDocument: {
            Version: '2012-10-17',
            Statement: [
              {
                Effect: 'Allow',
                Principal: {
                  AWS: `arn:aws:iam::${platformAccountId}:root`,
                },
                Action: 'sts:AssumeRole',
                Condition: {
                  StringEquals: {
                    'sts:ExternalId': externalId,
                  },
                },
              },
            ],
          },
          ManagedPolicyArns: [{ Ref: 'StratusCostPolicy' }],
        },
      },
    },
    Outputs: {
      RoleArn: {
        Description: 'ARN del rol — pegalo en Stratus para completar la conexión',
        Value: { 'Fn::GetAtt': ['StratusCostReaderRole', 'Arn'] },
      },
    },
  };

  return JSON.stringify(template, null, 2);
}
