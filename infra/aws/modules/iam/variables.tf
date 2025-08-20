# =====================================================================
# FILE: infra/aws/modules/iam/variables.tf
# WHY: Policy ties to the specific S3 bucket you created earlier.
# =====================================================================
variable "name"           { type = string }
variable "s3_bucket_name" { type = string }
