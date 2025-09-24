// FILE: src/stacks/types.ts
// This file defines TypeScript interfaces for configuration objects used in the CDKTF stack.
// ComposeCfg describes configuration for a compose service, such as an EC2 instance and its database.

export interface ComposeCfg {
  instanceType: string;
  dbName: string;
}

export interface AppCfg {
  project: string;
  env: "dev" | "prod";
  region: string;

  vpcId: string;
  publicSubnetIds: string[];
  privateSubnetIds: string[];

  sgDefaultId: string;
  sgEc2Id: string;
  sgVpcId: string;

  ecrBackend: string;
  ecrFrontend: string;
  dynamoTable: string;

  compose: ComposeCfg;
}

