# path: infra/outputs.tf
# PURPOSE: Outputs important information such as EC2 IP/DNS, S3 bucket name, ECR repo URIs, and AWS account ID.

output "ec2_public_ip" {
  description = "Stable Elastic IP address of the EC2 instance -- point DNS A records here"
  value       = aws_eip.app.public_ip
}

output "ec2_public_dns" {
  description = "Public DNS name of the EC2 instance"
  value       = aws_instance.app.public_dns
}

output "s3_assets_bucket" {
  description = "S3 bucket for app assets"
  value       = aws_s3_bucket.assets.bucket
}

output "ecr_backend_url" {
  description = "ECR repo URI for backend"
  value       = aws_ecr_repository.backend.repository_url
}

output "ecr_frontend_url" {
  description = "ECR repo URI for frontend"
  value       = aws_ecr_repository.frontend.repository_url
}

output "dynamodb_table" {
  description = "DynamoDB table name"
  value       = aws_dynamodb_table.session.name
}

output "deploy_role_arn" {
  description = "IAM role ARN GitHub Actions assumes via OIDC (put into repo secret DEPLOY_ROLE_ARN)"
  value       = aws_iam_role.deploy.arn
}

output "aws_account_id" {
  description = "AWS account ID"
  value       = data.aws_caller_identity.current.account_id
}

output "hint" {
  value = "After CI pushes images, open the EC2 public DNS (port 80). Backend is /api."
}