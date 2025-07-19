# infra/s3.tf
# PURPOSE: Creates an S3 bucket for storing CSV/data files, ensuring global uniqueness with a random suffix.


# S3 bucket to store CSV/data files
resource "aws_s3_bucket" "csv_data" {
  bucket        = "citytaster-csv-data-${random_id.suffix.hex}"  # Ensures global uniqueness
  force_destroy = true  # Allows Terraform to delete even if bucket not empty (good for dev/test)
  
  tags = {
    Name = "citytaster-csv-data"
  }
}

# Random suffix for global uniqueness (can't reuse bucket names globally)
resource "random_id" "suffix" {
  byte_length = 4
}
