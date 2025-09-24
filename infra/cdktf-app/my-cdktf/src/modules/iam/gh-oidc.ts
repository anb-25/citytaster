/**
 * Purpose: Create a GitHub OIDC provider + an IAM role your CI can assume.
 * Why: Lets GitHub Actions deploy/push to AWS without long-lived access keys.
 *
 * Usage:
 *  - Deploy this once (dev is fine).
 *  - Put the resulting role ARN into your repo secret: DEPLOY_ROLE_ARN
 *  - Trust policy limits to your repo ("owner/repo:*"). Adjust as needed.
 */
import { Construct } from "constructs";
import { IamOpenidConnectProvider } from "@cdktf/provider-aws/lib/iam-openid-connect-provider";
import { IamRole } from "@cdktf/provider-aws/lib/iam-role";
import { IamRolePolicyAttachment } from "@cdktf/provider-aws/lib/iam-role-policy-attachment";

export interface GhOidcProps {
  repo: string;           // e.g. "anb-25/citytaster"
  roleName?: string;      // optional custom name
  admin?: boolean;        // dev convenience; set false and attach least-privilege later
}

export class GhOidc extends Construct {
  readonly roleArn: string;

  constructor(scope: Construct, id: string, p: GhOidcProps) {
    super(scope, id);

    // 1) OIDC provider for GitHub
    const provider = new IamOpenidConnectProvider(this, "provider", {
      url: "https://token.actions.githubusercontent.com",
      clientIdList: ["sts.amazonaws.com"],
      // include current + legacy thumbprints for stability
      thumbprintList: [
        "6938fd4d98bab03faadb97b34396831e3780aea1",
        "a031c46782e6e6c662c2c87c76da9aa62ccafd8e"
      ]
    });

    // 2) Role assumed by GitHub Actions via web identity
    const role = new IamRole(this, "role", {
      name: p.roleName ?? "citytaster-cdktf-deployer",
      assumeRolePolicy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: { Federated: provider.arn },
            Action: "sts:AssumeRoleWithWebIdentity",
            Condition: {
              StringEquals: {
                "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
              },
              StringLike: {
                // limit to your repository
                "token.actions.githubusercontent.com:sub": `repo:${p.repo}:*`
              }
            }
          }
        ]
      })
    });

    // 3) Attach permissions
    // For dev speed, AdministratorAccess; tighten later (ECR + CDKTF narrow policy).
    new IamRolePolicyAttachment(this, "admin", {
      role: role.name,
      policyArn: p.admin === false
        ? "arn:aws:iam::aws:policy/ReadOnlyAccess" // placeholder if you set admin=false
        : "arn:aws:iam::aws:policy/AdministratorAccess"
    });

    this.roleArn = role.arn;
  }
}
