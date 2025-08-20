# =====================================================================
# FILE: infra/aws/modules/s3/main.tf
# WHY: Bucket for CSV/data the app reads; suffix avoids global name clash.
# =====================================================================
terraform {
  required_version  = ">= 1.4"
  required_providers {
    aws    = { source = "hashicorp/aws", version = "~> 5.50" }
    random = { source = "hashicorp/random", version = "~> 3.6" }
  }
}
provider "aws" {}
variable "base_name" { type = string }

resource "random_id" "suffix" { byte_length = 4 }  # WHY: make bucket name unique

resource "aws_s3_bucket" "csv_data" {
  bucket        = "${var.base_name}-${random_id.suffix.hex}"
  force_destroy = true   # WHY: easier cleanup in dev
  tags = { Name = var.base_name }
}

output "bucket_name" { value = aws_s3_bucket.csv_data.bucket }  # WHY: IAM/user-data needs it
