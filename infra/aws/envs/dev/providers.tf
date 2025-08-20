# =====================================================================
# FILE: infra/aws/envs/dev/providers.tf
# WHY: Root "environment" that wires modules together for dev.
# =====================================================================
terraform {
  required_version = ">= 1.4"
  required_providers {
    aws    = { source = "hashicorp/aws", version = "~> 5.50" }  # WHY: pin for reproducibility
    random = { source = "hashicorp/random", version = "~> 3.6" }
  }
  # backend "s3" {}  # WHY: add later for remote state & team use
}

provider "aws" {
  region = var.aws_region
  default_tags { tags = { Project = "citytaster", Env = "dev" } }  # WHY: cost visibility
}

data "aws_caller_identity" "current" {}   # WHY: account id for outputs/ECR login
