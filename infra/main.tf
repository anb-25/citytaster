# infra/main.tf
# PURPOSE: Root Terraform configuration. Sets AWS provider, region, and version constraints for infrastructure deployment.
# NOTE: This replaces the CDKTF app that used to live in infra/cdktf-app/my-cdktf; it mirrors what that
#       DevStack provisioned (imported VPC, ECR, S3, DynamoDB, GitHub OIDC deploy role, EC2 via docker-compose).

data "aws_caller_identity" "current" {}

terraform {
  required_version = ">= 1.3.0"
  required_providers {
    aws = {
      source = "hashicorp/aws"
    }
  }
}

provider "aws" {
  region = var.region
}

