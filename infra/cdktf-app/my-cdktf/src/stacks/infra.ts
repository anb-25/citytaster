/**
 * Purpose: Compose *dev* resources:
 *  - Read existing networking (VPC/subnets/SGs)
 *  - Create ECR repos for backend/frontend
 *  - Create S3 assets bucket + DynamoDB (pay-per-request)
 *  - Create a Web Security Group (port 80 open) for dev convenience
 *  - Launch 1x EC2 t3.micro that runs Docker Compose:
 *      mongo + backend (Flask) + frontend (nginx) + nginx (reverse-proxy/L7)
 *
 * You then hit http://<EC2 public DNS>/ (frontend) and /api (backend).
 */
import { TerraformStack, TerraformOutput } from "cdktf";
import { Construct } from "constructs";
import { AwsProvider } from "@cdktf/provider-aws/lib/provider";
import type { AppCfg } from ".";

import {
  NetworkImport,
  WebSg,
  EcrModule,
  DynamoModule,
  StorageModule,
  Ec2Compose,
  GhOidc,
} from "../modules";

export class DevStack extends TerraformStack {
  constructor(scope: Construct, id: string, cfg: AppCfg) {
    super(scope, id);

    new AwsProvider(this, "aws", { region: cfg.region });

    // --- GitHub OIDC + deploy role (create once; dev is fine) ---
    const gh = new GhOidc(this, "gh-oidc", {
      repo: "anb-25/citytaster",                // <OWNER>/<REPO>
      roleName: `${cfg.project}-${cfg.env}-cdktf-deployer`,
      admin: true                               // quick start; tighten later
});

// Expose the role ARN so you can copy it into GitHub secrets
new TerraformOutput(this, "deploy_role_arn", { value: gh.roleArn });

    // Import existing networking so we don't mutate your VPC
    const net = new NetworkImport(this, "net", {
      vpcId: cfg.vpcId,                       // keep or omit to use default VPC
      publicSubnetIds: cfg.publicSubnetIds,   // keep or omit to fetch all
      privateSubnetIds: cfg.privateSubnetIds, // keep or omit to fetch all
      sgDefaultId: cfg.sgDefaultId,           // keep or omit to auto-lookup
      sgEc2Id: cfg.sgEc2Id
});

    // Dev web SG with port 80 open to the world (learning/dev only)
    const webSg = new WebSg(this, "webSg", {
      vpcId: net.vpcId,
      name: `${cfg.project}-${cfg.env}-web-sg`
    });

    // ECR: where CI will push images citytaster-dev-{backend,frontend}
    const ecr = new EcrModule(this, "ecr", {
      namePrefix: `${cfg.project}-${cfg.env}`,
      backendName: cfg.ecrBackend,
      frontendName: cfg.ecrFrontend
    });

    // S3 + DynamoDB (handy and low cost)
    const s3 = new StorageModule(this, "s3", { namePrefix: `${cfg.project}-${cfg.env}` });
    const ddb = new DynamoModule(this, "ddb", { tableName: cfg.dynamoTable });

    // EC2 t3.micro running Docker Compose + nginx reverse proxy
    // EC2 t3.micro running Docker Compose + nginx reverse proxy
    new Ec2Compose(this, "compose", {
      name: `${cfg.project}-${cfg.env}-app`,
      subnetId: cfg.publicSubnetIds[0],   // public subnet for public DNS
      sgIds: [webSg.id],                  // allow inbound 80
      region: cfg.region,
      backendImage: `${ecr.backendRepoUrl}:latest`,
      frontendImage: `${ecr.frontendRepoUrl}:latest`,
      dbName: cfg.compose.dbName
    });


    // Outputs to help you verify quickly in console
    new TerraformOutput(this, "ecr_backend_repo", { value: ecr.backendRepoUrl });
    new TerraformOutput(this, "ecr_frontend_repo", { value: ecr.frontendRepoUrl });
    new TerraformOutput(this, "s3_assets_bucket", { value: s3.assetsBucket.bucket! });
    new TerraformOutput(this, "dynamodb_table", { value: ddb.tableName });
    new TerraformOutput(this, "hint", {
      value:
        "After CI pushes images, open the EC2 public DNS (port 80). Backend is /api."
    });
  }
}
