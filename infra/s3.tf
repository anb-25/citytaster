# infra/s3.tf
# PURPOSE: Assets + logs buckets (versioning/SSE on assets, public access blocked).

resource "aws_s3_bucket" "assets" {
  bucket        = "${var.project}-${var.environment}-assets"
  force_destroy = true

  tags = {
    Project = "${var.project}-${var.environment}"
    Purpose = "assets"
  }
}

resource "aws_s3_bucket_versioning" "assets" {
  bucket = aws_s3_bucket.assets.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "assets" {
  bucket = aws_s3_bucket.assets.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "assets" {
  bucket                  = aws_s3_bucket.assets.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket" "logs" {
  bucket        = "${var.project}-${var.environment}-logs"
  force_destroy = true

  tags = {
    Project = "${var.project}-${var.environment}"
    Purpose = "logs"
  }
}
