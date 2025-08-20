# =====================================================================
# FILE: infra/aws/modules/ecr/main.tf
# WHY: Private registries for your backend & frontend images.
# =====================================================================
terraform {
  required_version  = ">= 1.4"
  required_providers { aws = { source = "hashicorp/aws", version = "~> 5.50" } }
}
provider "aws" {}
variable "backend_repo_name"  { type = string }
variable "frontend_repo_name" { type = string }

resource "aws_ecr_repository" "backend"  { name = var.backend_repo_name }
resource "aws_ecr_repository" "frontend" { name = var.frontend_repo_name }

output "backend_repo_url"  { value = aws_ecr_repository.backend.repository_url }   # WHY: used when tagging/pulling
output "frontend_repo_url" { value = aws_ecr_repository.frontend.repository_url }
