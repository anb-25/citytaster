# infra/ecr.tf

# ECR repository for backend service
resource "aws_ecr_repository" "backend" {
  name = "citytaster-backend"
}

# ECR repository for frontend service
resource "aws_ecr_repository" "frontend" {
  name = "citytaster-frontend"
}
