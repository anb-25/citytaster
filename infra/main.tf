# infra/main.tf
# PURPOSE: Root Terraform configuration. Sets AWS provider, region, and version constraints for infrastructure deployment.

data "aws_caller_identity" "current" {}

# This block locks the Terraform version and AWS provider version for consistency.
terraform {
  required_version = ">= 1.3.0"  # Ensures you're using at least Terraform 1.3.
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      # version = "~> 5.0"          # Ensures compatibility with AWS provider v5.x.
    }
    
    # optional: declare random since you use random_id in s3.tf
    random = {
      source = "hashicorp/random"
    }  
  }
}

