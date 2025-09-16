// FILE: src/stacks/types.ts
// Purpose: Strong types (interfaces) for config + module variables.
// Why:     Catch typos/missing fields in dev.json/prod.json at compile time; map 1:1 to variables.tf.

export interface ModuleVars {
  aws_region: string;        // variables.tf: aws_region
  instance_type: string;     // variables.tf: instance_type
  key_name: string;          // variables.tf: key_name
  db_name: string;           // variables.tf: db_name
  github_deploy_key?: string;// sensitive; provided via ENV at runtime
}

export interface EnvConfig {
  env: "dev" | "prod";       // used in stack id & (optional) naming
  region: string;            // AWS region for the provider
  profile?: string;          // optional AWS CLI profile
  moduleSource: string;      // path to your HCL folder (../infra), resolved to absolute
  variables: ModuleVars;     // typed module inputs
  // Optional toggle for remote state (S3) if you decide to enable later
  backend?: {
    type: "s3";
    bucket: string;
    key: string;             // e.g., citytaster/dev/terraform.tfstate
    region: string;
    dynamodbTable?: string;
    encrypt?: boolean;
  };
}

