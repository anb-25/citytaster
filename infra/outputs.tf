# path: infra/outputs.tf
# PURPOSE: Outputs important information such as EC2 IP/DNS, S3 bucket name, ECR repo URIs, and AWS account ID.


# EC2 public IP
output "ec2_public_ip" {
description = "Public IP address of the EC2 instance"
value = aws_instance.main.public_ip
}


# EC2 public DNS
output "ec2_public_dns" {
description = "Public DNS name of the EC2 instance"
value = aws_instance.main.public_dns
}


# S3 bucket name
output "s3_bucket_name" {
description = "S3 bucket for CSV/data files"
value = aws_s3_bucket.csv_data.bucket
}


# ECR repository URIs — match resource names in ecr.tf
output "ecr_backend_url" {
description = "ECR repo URI for backend"
value = aws_ecr_repository.citytaster_backend.repository_url
}


output "ecr_frontend_url" {
description = "ECR repo URI for frontend"
value = aws_ecr_repository.citytaster_frontend.repository_url
}


# AWS Account ID
output "aws_account_id" {
description = "AWS account ID"
value = data.aws_caller_identity.current.account_id
}