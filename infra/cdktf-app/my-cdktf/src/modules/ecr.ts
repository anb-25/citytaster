/** Purpose: Two ECR repos (backend/frontend) for your CI builds. */

import { Construct } from "constructs";
import { EcrRepository } from "@cdktf/provider-aws/lib/ecr-repository";

export interface EcrProps { namePrefix: string; backendName: string; frontendName: string; }

export class EcrModule extends Construct {
  readonly backendRepoUrl: string;
  readonly frontendRepoUrl: string;

  constructor(scope: Construct, id: string, p: EcrProps) {
    super(scope, id);

    const backend = new EcrRepository(this, "backend", {
      name: `${p.namePrefix}-${p.backendName}`,
      imageScanningConfiguration: { scanOnPush: true },
      forceDelete: true
    });

    const frontend = new EcrRepository(this, "frontend", {
      name: `${p.namePrefix}-${p.frontendName}`,
      imageScanningConfiguration: { scanOnPush: true },
      forceDelete: true
    });

    this.backendRepoUrl = backend.repositoryUrl;
    this.frontendRepoUrl = frontend.repositoryUrl;
  }
}
