# infra/variables.tf
# PURPOSE: Input variables for the dev stack (ported from src/config/dev.json + main.ts wiring).

variable "project" {
  type        = string
  default     = "citytaster"
  description = "Project name, used as a resource name prefix."
}

variable "environment" {
  type        = string
  default     = "dev"
  description = "Environment name (dev/prod)."
}

variable "region" {
  type        = string
  default     = "us-east-1"
  description = "AWS region."
}

variable "vpc_id" {
  type        = string
  description = "Existing VPC to import (no VPC is created)."
}

variable "public_subnet_ids" {
  type        = list(string)
  default     = []
  description = "Existing public subnet IDs. Leave empty to use all subnets in the VPC."
}

variable "private_subnet_ids" {
  type        = list(string)
  default     = []
  description = "Existing private subnet IDs. Leave empty to use all subnets in the VPC."
}

variable "sg_default_id" {
  type        = string
  default     = ""
  description = "Existing default security group ID. Leave empty to look up the VPC's 'default' SG."
}

variable "ecr_backend_name" {
  type        = string
  default     = "backend"
  description = "Suffix for the backend ECR repo name (full name is <project>-<environment>-<this>)."
}

variable "ecr_frontend_name" {
  type        = string
  default     = "frontend"
  description = "Suffix for the frontend ECR repo name (full name is <project>-<environment>-<this>)."
}

variable "dynamo_table_name" {
  type        = string
  default     = "citytaster-session-dev"
  description = "DynamoDB table name for sessions/state."
}

variable "compose_db_name" {
  type        = string
  default     = "CityTasterDB"
  description = "Mongo database name used by the backend container."
}

variable "github_repo" {
  type        = string
  default     = "anb-25/citytaster"
  description = "GitHub <owner>/<repo> allowed to assume the deploy role via OIDC."
}

variable "deploy_role_name" {
  type        = string
  default     = "citytaster-dev-deployer"
  description = "Name of the IAM role GitHub Actions assumes via OIDC."
}

variable "deploy_role_admin" {
  type        = bool
  default     = true
  description = "If true, attach AdministratorAccess to the deploy role; otherwise ReadOnlyAccess."
}
