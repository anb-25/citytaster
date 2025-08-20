# =====================================================================
# FILE: infra/aws/modules/iam/main.tf
# WHY: Lets EC2 pull images from ECR and read data from S3 securely.
# =====================================================================
terraform {
  required_version  = ">= 1.4"
  required_providers { aws = { source = "hashicorp/aws", version = "~> 5.50" } }
}
provider "aws" {}

resource "aws_iam_role" "ec2_role" {
  name = "${var.name}-ec2-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{ Effect = "Allow", Principal = { Service = "ec2.amazonaws.com" }, Action = "sts:AssumeRole" }]
  })
}

resource "aws_iam_policy" "ec2_policy" {
  name        = "${var.name}-ec2-policy"
  description = "Allow EC2 to pull from ECR and read S3"
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      # WHY: docker on the host needs to authenticate/pull from ECR
      { Effect="Allow", Action=["ecr:GetAuthorizationToken","ecr:BatchCheckLayerAvailability","ecr:GetDownloadUrlForLayer","ecr:BatchGetImage"], Resource="*" },
      # WHY: boot-time sync of CSV/data from your bucket
      { Effect="Allow", Action=["s3:GetObject","s3:ListBucket"], Resource=[
          "arn:aws:s3:::${var.s3_bucket_name}",
          "arn:aws:s3:::${var.s3_bucket_name}/*"
        ] }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "attach" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = aws_iam_policy.ec2_policy.arn
}

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "${var.name}-ec2-profile"
  role = aws_iam_role.ec2_role.name
}

output "instance_profile_name" { value = aws_iam_instance_profile.ec2_profile.name }  # WHY: EC2 attaches this
