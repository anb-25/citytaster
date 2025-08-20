# =====================================================================
# FILE: infra/aws/modules/security/main.tf
# WHY: Opens only the ports your compose stack needs to be reachable.
# =====================================================================
terraform {
  required_version  = ">= 1.4"
  required_providers { aws = { source = "hashicorp/aws", version = "~> 5.50" } }
}
provider "aws" {}

resource "aws_security_group" "ec2" {
  name        = "${var.name}-ec2-sg"
  description = "Allow SSH, HTTP, frontend, backend"
  vpc_id      = var.vpc_id

  # WHY: SSH for admin/debug; restrict in real envs
  ingress { description = "SSH"; from_port = 22; to_port = 22; protocol = "tcp"; cidr_blocks = var.ssh_cidrs }

  # WHY: Web entry point (nginx/static site)
  ingress { description = "HTTP"; from_port = var.web_port; to_port = var.web_port; protocol = "tcp"; cidr_blocks = ["0.0.0.0/0"] }

  # WHY: Expose dev frontend (if served directly)
  ingress { description = "Frontend"; from_port = var.frontend_port; to_port = var.frontend_port; protocol = "tcp"; cidr_blocks = ["0.0.0.0/0"] }

  # WHY: Expose backend API for easy testing (lock down later)
  ingress { description = "Backend"; from_port = var.backend_port; to_port = var.backend_port; protocol = "tcp"; cidr_blocks = ["0.0.0.0/0"] }

  # WHY: Let instance reach internet to pull images and updates
  egress  { from_port = 0; to_port = 0; protocol = "-1"; cidr_blocks = ["0.0.0.0/0"] }

  tags = merge(var.tags, { Name = "${var.name}-ec2-sg" })
}

output "sg_id" { value = aws_security_group.ec2.id }  # WHY: EC2 needs this ID
