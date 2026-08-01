# infra/ecr.tf
# PURPOSE: Creates AWS ECR repositories for backend and frontend Docker images.

resource "aws_ecr_repository" "backend" {
  # No environment segment here on purpose: reuses the already-deployed
  # "citytaster-backend" repo name instead of minting a new "citytaster-dev-backend".
  name         = "${var.project}-${var.ecr_backend_name}"
  force_delete = true

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_repository" "frontend" {
  name         = "${var.project}-${var.ecr_frontend_name}"
  force_delete = true

  image_scanning_configuration {
    scan_on_push = true
  }
}