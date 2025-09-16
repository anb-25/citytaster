# infra/variables.tf
# PURPOSE: Defines input variables for region, instance type, key name, database name, and sensitive deploy key.

variable "aws_region" {
  type        = string
  default     = "us-east-1"
  description = "AWS region"
  validation {
    # Avoid HCL escapes: accept ...-<digit(s)> at the end
    condition     = can(regex("^[a-z]{2}-[a-z0-9-]+-[0-9]{1,2}$", var.aws_region))
    error_message = "Invalid AWS region format (e.g., us-east-1)."
  }
}

variable "s3_bucket_name" {
  type        = string
  description = "Name of the S3 bucket used by this stack (e.g., for CSV data)."
  validation {
    # S3 bucket naming rules (lowercase, digits, hyphen, dot; 3–63 chars)
    condition     = can(regex("^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$", var.s3_bucket_name))
    error_message = "s3_bucket_name must comply with S3 naming rules (lowercase letters, numbers, hyphens, dots; 3–63 chars)."
  }
}

variable "vpc_id" {
  type        = string
  description = "VPC ID"
  validation {
    # Accept 8- or 17-hex VPC IDs; trims surrounding whitespace safely
    condition     = can(regex("^vpc-[0-9a-f]{8,}$", trimspace(var.vpc_id)))
    error_message = "vpc_id must look like vpc-xxxxxxxx or vpc-xxxxxxxxxxxxxxxxx."
  }
}

variable "instance_type" {
  type        = string
  default     = "t2.micro"
  description = "EC2 instance type"
}

variable "key_name" {
  type        = string
  description = "Name of the SSH key pair for EC2 login"
}

variable "db_name" {
  type        = string
  default     = "CityTasterDB"
  description = "Mongo database name"
}

variable "github_deploy_key" {
  type        = string
  sensitive   = true
  default     = "" # non-null, empty by default
  description = "Private SSH deploy key for cloning private repo"
}

variable "environment" {
  type        = string
  description = "Environment name (e.g., dev/stage/prod)."
  default     = "dev"
}

variable "tags" {
  type        = map(string)
  description = "Common resource tags."
  default     = {}
}


