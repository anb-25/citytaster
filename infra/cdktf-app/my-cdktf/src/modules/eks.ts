/**
 * Purpose: Managed EKS cluster + node group + Kubernetes provider wiring.
 * Status: Keep for PROD; do NOT use in DEV (EKS/ALB/NAT not Free-Tier).
 * Notes:
 *  - Grants ELB permissions to node role (dev shortcut). In prod, switch to IRSA.
 */
import { Construct } from "constructs";
import { IamRole } from "@cdktf/provider-aws/lib/iam-role";
import { IamRolePolicyAttachment } from "@cdktf/provider-aws/lib/iam-role-policy-attachment";
import { EksCluster } from "@cdktf/provider-aws/lib/eks-cluster";
import { EksNodeGroup } from "@cdktf/provider-aws/lib/eks-node-group";
import { DataAwsEksCluster } from "@cdktf/provider-aws/lib/data-aws-eks-cluster";
import { DataAwsEksClusterAuth } from "@cdktf/provider-aws/lib/data-aws-eks-cluster-auth";
import { KubernetesProvider } from "@cdktf/provider-kubernetes/lib/provider";
import { Fn } from "cdktf";

export interface EksProps {
  clusterName: string;
  region: string;
  vpcId: string;
  subnetsForApi: string[];     // public + private
  nodeSubnets: string[];       // where nodes live
  clusterSecurityGroupId: string;
  desired: number; minSize: number; maxSize: number; instanceTypes: string[];
}

export class EksModule extends Construct {
  readonly clusterName: string;
  readonly nodeGroup: EksNodeGroup;

  constructor(scope: Construct, id: string, p: EksProps) {
    super(scope, id);

    const clusterRole = new IamRole(this, "clusterRole", {
      name: `${p.clusterName}-cluster-role`,
      assumeRolePolicy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [{ Effect: "Allow", Principal: { Service: "eks.amazonaws.com" }, Action: "sts:AssumeRole" }]
      })
    });
    new IamRolePolicyAttachment(this, "eksCluster", {
      role: clusterRole.name,
      policyArn: "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
    });
    new IamRolePolicyAttachment(this, "vpcController", {
      role: clusterRole.name,
      policyArn: "arn:aws:iam::aws:policy/AmazonEKSVpcResourceController"
    });

    const nodeRole = new IamRole(this, "nodeRole", {
      name: `${p.clusterName}-node-role`,
      assumeRolePolicy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [{ Effect: "Allow", Principal: { Service: "ec2.amazonaws.com" }, Action: "sts:AssumeRole" }]
      })
    });
    [
      "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy",
      "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly",
      "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy",
      "arn:aws:iam::aws:policy/ElasticLoadBalancingFullAccess" // replace with IRSA in prod
    ].forEach((arn, i) => new IamRolePolicyAttachment(this, `nodeAttach${i}`, { role: nodeRole.name, policyArn: arn }));

    const cluster = new EksCluster(this, "cluster", {
      name: p.clusterName,
      roleArn: clusterRole.arn,
      version: "1.29",
      vpcConfig: {
        endpointPrivateAccess: true,
        endpointPublicAccess: true,       // tighten in prod
        publicAccessCidrs: ["0.0.0.0/0"], // tighten in prod
        securityGroupIds: [p.clusterSecurityGroupId],
        subnetIds: p.subnetsForApi
      },
      enabledClusterLogTypes: ["api", "audit", "authenticator"]
    });

    this.nodeGroup = new EksNodeGroup(this, "nodes", {
      clusterName: cluster.name,
      nodeGroupName: `${p.clusterName}-ng`,
      nodeRoleArn: nodeRole.arn,
      subnetIds: p.nodeSubnets,
      scalingConfig: { desiredSize: p.desired, minSize: p.minSize, maxSize: p.maxSize },
      instanceTypes: p.instanceTypes,
      amiType: "AL2_x86_64",
      capacityType: "ON_DEMAND"
    });

    const dataCluster = new DataAwsEksCluster(this, "data", { name: cluster.name });
    const auth = new DataAwsEksClusterAuth(this, "auth", { name: cluster.name });
    new KubernetesProvider(this, "k8s", {
      host: dataCluster.endpoint,
      clusterCaCertificate: Fn.base64decode(dataCluster.certificateAuthority.get(0).data),
      token: auth.token
    });

    this.clusterName = cluster.name;
  }
}
