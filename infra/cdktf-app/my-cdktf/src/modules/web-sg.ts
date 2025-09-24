/**
 * @file
 * @module WebSg
 * @description
 * Defines a CDKTF construct for an AWS Security Group that opens HTTP (port 80) to the world.
 * Intended for development environments only.
 *
 * Exports the `WebSg` class, which creates a security group with:
 * - Ingress rule: Allows TCP traffic on port 80 from any IPv4 address.
 * - Egress rule: Allows all outbound traffic.
 *
 * @remarks
 * Use with caution. Opening port 80 to the world is not recommended for production environments.
 */
/** Purpose: Security Group that opens HTTP/80 to the world (dev only). */


import { Construct } from "constructs";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";

export interface WebSgProps {
  vpcId: string;
  name: string;
}

export class WebSg extends Construct {
  readonly id: string;
  constructor(scope: Construct, id: string, p: WebSgProps) {
    super(scope, id);
    const sg = new SecurityGroup(this, "sg", {
      name: p.name,
      vpcId: p.vpcId,
      ingress: [{ fromPort: 80, toPort: 80, protocol: "tcp", cidrBlocks: ["0.0.0.0/0"] }],
      egress: [{ fromPort: 0, toPort: 0, protocol: "-1", cidrBlocks: ["0.0.0.0/0"] }]
    });
    this.id = sg.id;
  }
}
