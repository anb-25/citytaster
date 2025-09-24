/** Purpose: Dev S3 buckets (assets + logs) with versioning/SSE and public access blocked. */
import { Construct } from "constructs";
import { S3Bucket } from "@cdktf/provider-aws/lib/s3-bucket";
import { S3BucketVersioningA } from "@cdktf/provider-aws/lib/s3-bucket-versioning";
import { S3BucketServerSideEncryptionConfigurationA } from "@cdktf/provider-aws/lib/s3-bucket-server-side-encryption-configuration";
import { S3BucketPublicAccessBlock } from "@cdktf/provider-aws/lib/s3-bucket-public-access-block";
import { S3BucketPolicy } from "@cdktf/provider-aws/lib/s3-bucket-policy";
import { DataAwsIamPolicyDocument } from "@cdktf/provider-aws/lib/data-aws-iam-policy-document";

export interface StorageProps {
  namePrefix: string;          // e.g., citytaster-dev
  allowCiWriteArn?: string;    // optional: IAM Role ARN (GitHub OIDC) allowed to write
  devForceDestroy?: boolean;   // default true
}

export class StorageModule extends Construct {
  readonly assetsBucket: S3Bucket;
  readonly logsBucket: S3Bucket;

  constructor(scope: Construct, id: string, p: StorageProps) {
    super(scope, id);

    const forceDestroy = p.devForceDestroy ?? true;

    // -------- Assets bucket --------
    this.assetsBucket = new S3Bucket(this, "assets", {
      bucket: `${p.namePrefix}-assets`,
      forceDestroy,
      tags: { Project: p.namePrefix, Purpose: "assets" },
    });

    new S3BucketVersioningA(this, "assetsVer", {
      bucket: this.assetsBucket.id,
      versioningConfiguration: { status: "Enabled" },
    });

    new S3BucketServerSideEncryptionConfigurationA(this, "assetsEnc", {
      bucket: this.assetsBucket.id,
      rule: [{ applyServerSideEncryptionByDefault: { sseAlgorithm: "AES256" } }],
    });

    new S3BucketPublicAccessBlock(this, "assetsBlock", {
      bucket: this.assetsBucket.id,
      blockPublicAcls: true,
      blockPublicPolicy: true,
      ignorePublicAcls: true,
      restrictPublicBuckets: true,
    });

    // -------- Logs bucket (for future access logs, app logs, etc.) --------
    this.logsBucket = new S3Bucket(this, "logs", {
      bucket: `${p.namePrefix}-logs`,
      forceDestroy,
      tags: { Project: p.namePrefix, Purpose: "logs" },
    });

    // Optional: deny non-TLS & allow CI writes narrowly
    if (p.allowCiWriteArn) {
      const policy = new DataAwsIamPolicyDocument(this, "assetsPolicyDoc", {
        statement: [
          {
            sid: "DenyInsecureTransport",
            effect: "Deny",
            actions: ["s3:*"],
            principals: [{ type: "*", identifiers: ["*"] }],
            resources: [this.assetsBucket.arn, `${this.assetsBucket.arn}/*`],
            condition: [{ test: "Bool", variable: "aws:SecureTransport", values: ["false"] }],
          },
          {
            sid: "AllowCiWrite",
            effect: "Allow",
            actions: ["s3:ListBucket"],
            principals: [{ type: "AWS", identifiers: [p.allowCiWriteArn] }],
            resources: [this.assetsBucket.arn],
          },
          {
            sid: "AllowCiObjectRW",
            effect: "Allow",
            actions: ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
            principals: [{ type: "AWS", identifiers: [p.allowCiWriteArn] }],
            resources: [`${this.assetsBucket.arn}/*`],
          },
        ],
      });

      new S3BucketPolicy(this, "assetsPolicy", {
        bucket: this.assetsBucket.id,
        policy: policy.json,
      });
    }
  }
}

