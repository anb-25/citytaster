/**
 * Purpose: Minimal VPC with 2 public + 2 private subnets (no NAT by default).
 * Why: Lets you move off the default VPC later, without extra cost.
 * Note: NAT disabled to avoid charges; enable when you go prod.
 */
import { Construct } from "constructs";
import { Vpc } from "@cdktf/provider-aws/lib/vpc";
import { InternetGateway } from "@cdktf/provider-aws/lib/internet-gateway";
import { Subnet } from "@cdktf/provider-aws/lib/subnet";
import { RouteTable } from "@cdktf/provider-aws/lib/route-table";
import { Route } from "@cdktf/provider-aws/lib/route";
import { RouteTableAssociation } from "@cdktf/provider-aws/lib/route-table-association";

export interface BasicVpcProps {
  cidr?: string;              // default 10.10.0.0/16
  azs: string[];              // e.g. ["us-east-1a","us-east-1b"]
  name: string;               // tag base
}

export class BasicVpc extends Construct {
  readonly vpcId: string;
  readonly publicSubnetIds: string[];
  readonly privateSubnetIds: string[];

  constructor(scope: Construct, id: string, p: BasicVpcProps) {
    super(scope, id);

    const vpc = new Vpc(this, "vpc", {
      cidrBlock: p.cidr ?? "10.10.0.0/16",
      enableDnsHostnames: true,
      enableDnsSupport: true,
      tags: { Name: p.name }
    });

    const igw = new InternetGateway(this, "igw", { vpcId: vpc.id });

    // One public+private per AZ (simple slicing of /20s)
    const pubRt = new RouteTable(this, "pubRt", { vpcId: vpc.id });
    new Route(this, "igwRoute", {
      routeTableId: pubRt.id,
      destinationCidrBlock: "0.0.0.0/0",
      gatewayId: igw.id
    });

    const publicIds: string[] = [];
    const privateIds: string[] = [];

    p.azs.forEach((az, i) => {
      const pub = new Subnet(this, `pub${i}`, {
        vpcId: vpc.id,
        availabilityZone: az,
        cidrBlock: `10.10.${i * 2}.0/24`,
        mapPublicIpOnLaunch: true,
        tags: { Name: `${p.name}-public-${az}` }
      });
      new RouteTableAssociation(this, `pubAssoc${i}`, { subnetId: pub.id, routeTableId: pubRt.id });
      publicIds.push(pub.id);

      const priv = new Subnet(this, `priv${i}`, {
        vpcId: vpc.id,
        availabilityZone: az,
        cidrBlock: `10.10.${i * 2 + 1}.0/24`,
        mapPublicIpOnLaunch: false,
        tags: { Name: `${p.name}-private-${az}` }
      });
      privateIds.push(priv.id);
    });

    this.vpcId = vpc.id;
    this.publicSubnetIds = publicIds;
    this.privateSubnetIds = privateIds;
  }
}
