/**
 * FILE: src/stacks/prod.ts
 * Purpose: PROD placeholder stack with feature flags. Nothing is created
 * unless you run with `--context env=prod` AND flip features to true.
 *
 * Notes:
 * - We keep imports commented or behind flags so the file compiles,
 *   lives in the repo, but does not affect dev.
 * - When ready, set flags in src/config/prod.json, then deploy prod.
 */
import { TerraformStack } from "cdktf";
import { Construct } from "constructs";
import { AwsProvider } from "@cdktf/provider-aws/lib/provider";

// Optional modules you’ll use later (uncomment as you enable features)
// import { BasicVpc } from "../modules/vpc-basic";
// import { EcrModule } from "../modules/ecr";
// import { StorageModule } from "../modules/s3";
// import { DynamoModule } from "../modules/dynamo";
// import { NatGatewayModule } from "../modules/nat-gateway";
// import { EksModule } from "../modules/eks";
// import { AlbControllerModule } from "../modules/alb-controller";
// import { WorkloadsModule } from "../modules/workloads";
// import { GhOidc } from "../modules/iam/gh-oidc";

type ProdFeatures = {
  useBasicVpc: boolean;    // create dedicated VPC (public+private), no NAT by default
  enableNat: boolean;      // attach NAT GW(s) (charges $$$)
  enableEcr: boolean;
  enableS3: boolean;
  enableDynamo: boolean;
  enableEks: boolean;
  enableAlb: boolean;      // requires AWS Load Balancer Controller
  enableAcm: boolean;      // HTTPS via ACM cert (with Route53)
};

export class ProdStack extends TerraformStack {
  constructor(scope: Construct, id: string, cfg: any) {
    super(scope, id);
    new AwsProvider(this, "aws", { region: cfg.region });

    // Default all features OFF so prod does nothing until you flip flags in prod.json
    const features: ProdFeatures = {
      useBasicVpc: cfg.features?.useBasicVpc ?? false,
      enableNat: cfg.features?.enableNat ?? false,
      enableEcr: cfg.features?.enableEcr ?? false,
      enableS3: cfg.features?.enableS3 ?? false,
      enableDynamo: cfg.features?.enableDynamo ?? false,
      enableEks: cfg.features?.enableEks ?? false,
      enableAlb: cfg.features?.enableAlb ?? false,
      enableAcm: cfg.features?.enableAcm ?? false,
    };

    // Pseudocode wiring (disabled by default):
    // let vpcId = cfg.vpcId;
    // let publicSubnets = cfg.publicSubnetIds as string[];
    // let privateSubnets = cfg.privateSubnetIds as string[];
    //
    // if (features.useBasicVpc) {
    //   const vpc = new BasicVpc(this, "vpc", {
    //     name: `${cfg.project}-prod`,
    //     azs: ["us-east-1a", "us-east-1b"]
    //   });
    //   vpcId = vpc.vpcId;
    //   publicSubnets = vpc.publicSubnetIds;
    //   privateSubnets = vpc.privateSubnetIds;
    // }
    //
    // if (features.enableNat) {
    //   new NatGatewayModule(this, "nat", {
    //     vpcId,
    //     allocationId: "<eipalloc-xxxx>",     // fill in
    //     publicSubnetId: publicSubnets[0],
    //     privateSubnetIds: privateSubnets
    //   });
    // }
    //
    // if (features.enableEcr) new EcrModule(this, "ecr", { ... });
    // if (features.enableS3) new StorageModule(this, "s3", { ... });
    // if (features.enableDynamo) new DynamoModule(this, "ddb", { ... });
    //
    // if (features.enableEks) {
    //   const eks = new EksModule(this, "eks", {
    //     clusterName: cfg.clusterName,
    //     region: cfg.region,
    //     vpcId,
    //     subnetsForApi: [...publicSubnets, ...privateSubnets],
    //     nodeSubnets: privateSubnets,
    //     clusterSecurityGroupId: cfg.sgVpcId,
    //     desired: cfg.desired || 3,
    //     minSize: cfg.minSize || 3,
    //     maxSize: cfg.maxSize || 6,
    //     instanceTypes: cfg.instanceTypes || ["t3.large"]
    //   });
    //
    //   if (features.enableAlb) {
    //     new AlbControllerModule(this, "alb", {
    //       clusterName: eks.clusterName,
    //       region: cfg.region,
    //       vpcId,
    //       dependsOn: [eks.nodeGroup],
    //     });
    //     new WorkloadsModule(this, "workloads", {
    //       namespace: cfg.project,
    //       apiImage: "<fill ECR backend>:prod",
    //       feImage: "<fill ECR frontend>:prod",
    //       ddbTable: "<prod-table>"
    //     });
    //   }
    // }
  }
}
