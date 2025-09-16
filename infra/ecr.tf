# infra/ecr.tf
# PURPOSE: Creates AWS ECR repositories for backend and frontend Docker images.

resource "aws_ecr_repository" "citytaster_frontend" {
  name                 = "citytaster-frontend"
  force_delete         = true
  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_repository" "citytaster_backend" {
  name                 = "citytaster-backend"
  force_delete         = true
  image_scanning_configuration {
    scan_on_push = true
  }
}