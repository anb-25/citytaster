# infra/outputs.tf
# PURPOSE: Outputs important information such as EC2 IP/DNS, S3 bucket name, ECR repo URIs, and AWS account ID.


# Output the public IP address of the EC2 instance (use to SSH or set as GitHub secret)
output "ec2_public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = aws_instance.main.public_ip
}

# Output the DNS name of the EC2 instance (sometimes easier than IP)
output "ec2_public_dns" {
  description = "Public DNS name of the EC2 instance"
  value       = aws_instance.main.public_dns
}

# Output the name of your S3 bucket (use for data sync in CI/CD)
output "s3_bucket_name" {
  description = "S3 bucket for CSV/data files"
  value       = aws_s3_bucket.csv_data.bucket
}

# Output the ECR repository URI for the backend (use for Docker image pushes)
output "ecr_backend_url" {
  description = "ECR repo URI for backend"
  value       = aws_ecr_repository.backend.repository_url
}

# Output the ECR repository URI for the frontend (use for Docker image pushes)
output "ecr_frontend_url" {
  description = "ECR repo URI for frontend"
  value       = aws_ecr_repository.frontend.repository_url
}

# Output the AWS Account ID (useful for ECR image tagging in CI/CD)
output "aws_account_id" {
  description = "AWS account ID"
  value       = data.aws_caller_identity.current.account_id
}
