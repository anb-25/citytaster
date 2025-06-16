# infra/main.tf

# This block tells Terraform which cloud provider (AWS) and which region to use.
provider "aws" {
  region = var.aws_region  # Uses the variable from variables.tf for flexibility.
}

data "aws_caller_identity" "current" {}

# This block locks the Terraform version and AWS provider version for consistency.
terraform {
  required_version = ">= 1.3.0"  # Ensures you're using at least Terraform 1.3.
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"          # Ensures compatibility with AWS provider v5.x.
    }
  }
}

