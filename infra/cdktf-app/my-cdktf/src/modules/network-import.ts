/**
 * @file
 * @module NetworkImport
 * @description
 * This module provides a CDKTF construct for importing existing AWS network resources
 * such as VPCs, subnets, and security groups as data sources. It is intended for scenarios
 * where infrastructure code needs to reference pre-existing network components rather than
 * creating new ones.
 *
 * @remarks
 * - Only data sources are used; no resources are created or modified.
 * - Useful for integrating with infrastructure managed outside of CDKTF.
 */
/** Purpose: Read existing VPC/subnets/SGs (data sources only). */

// FILE: src/modules/network-import.ts
// Purpose: Import existing VPC + subnets + SGs (no resources created).
import { Construct } from "constructs";
import { DataAwsVpc } from "@cdktf/provider-aws/lib/data-aws-vpc";
import { DataAwsSubnets } from "@cdktf/provider-aws/lib/data-aws-subnets";
import { DataAwsSecurityGroup } from "@cdktf/provider-aws/lib/data-aws-security-group";


export interface NetworkImportProps {
  /** If omitted, resolve region's default VPC */
  vpcId?: string;

  /** If omitted, return all subnets in the VPC */
  publicSubnetIds?: string[];

  /** If omitted, return all subnets in the VPC */
  privateSubnetIds?: string[];

  /** If omitted, lookup SG named "default" in the VPC */
  sgDefaultId?: string;

  /** Optional custom SG you may already have */
  sgEc2Id?: string;
}

export class NetworkImport extends Construct {
  readonly vpcId: string;

  // Subnet lookups (data sources)
  readonly publicSubnets: DataAwsSubnets;
  readonly privateSubnets: DataAwsSubnets;

  // Convenience tokens (arrays of IDs)
  readonly publicSubnetIds: string[];
  readonly privateSubnetIds: string[];

  // Security groups
  readonly sgDefaultId: string;
  readonly sgEc2Id?: string;

  constructor(scope: Construct, id: string, p: NetworkImportProps) {
    super(scope, id);

    // Resolve VPC: explicit id or default VPC
    const vpc = p.vpcId
      ? new DataAwsVpc(this, "vpc", { id: p.vpcId })
      : new DataAwsVpc(this, "vpc", { default: true });

    this.vpcId = vpc.id;

    const has = (arr?: string[]) => Array.isArray(arr) && arr.length > 0;

    // Public subnets: validate IDs if provided; else all subnets in VPC
    this.publicSubnets = new DataAwsSubnets(
      this,
      "pub",
      has(p.publicSubnetIds)
        ? {
            filter: [
              { name: "vpc-id", values: [this.vpcId] },
              { name: "subnet-id", values: p.publicSubnetIds! },
            ],
          }
        : { filter: [{ name: "vpc-id", values: [this.vpcId] }] }
    );

    // Private subnets: same behavior
    this.privateSubnets = new DataAwsSubnets(
      this,
      "priv",
      has(p.privateSubnetIds)
        ? {
            filter: [
              { name: "vpc-id", values: [this.vpcId] },
              { name: "subnet-id", values: p.privateSubnetIds! },
            ],
          }
        : { filter: [{ name: "vpc-id", values: [this.vpcId] }] }
    );

    // Expose the IDs
    this.publicSubnetIds = this.publicSubnets.ids;
    this.privateSubnetIds = this.privateSubnets.ids;

    // Default SG: pass-through or lookup by name in the VPC
    if (p.sgDefaultId) {
      this.sgDefaultId = p.sgDefaultId;
    } else {
      const def = new DataAwsSecurityGroup(this, "defaultSg", {
        name: "default",
        vpcId: this.vpcId,
      });
      this.sgDefaultId = def.id;
    }

    this.sgEc2Id = p.sgEc2Id;
  }
}
