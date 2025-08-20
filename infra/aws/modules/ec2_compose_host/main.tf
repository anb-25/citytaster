# =====================================================================
# FILE: infra/aws/modules/ec2_compose_host/main.tf
# WHY: The machine that actually runs your app (compose services).
# =====================================================================
terraform {
  required_version  = ">= 1.4"
  required_providers { aws = { source = "hashicorp/aws", version = "~> 5.50" } }
}
provider "aws" {}
data "aws_caller_identity" "current" {}

# WHY: Pick latest Ubuntu LTS so docker packages are simple/stable
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]  # Canonical
  filter { name = "name" values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"] }
}

resource "aws_instance" "main" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  subnet_id              = var.subnet_id
  vpc_security_group_ids = var.sg_ids
  iam_instance_profile   = var.instance_profile

  # WHY: User-data = zero-touch bootstrap (docker, repo clone, ECR login, compose up)
  user_data = templatefile("${path.module}/templates/user-data.sh.tftpl", {
    GITHUB_DEPLOY_KEY = var.github_deploy_key
    S3_BUCKET_NAME    = var.s3_bucket_name
    AWS_REGION        = var.aws_region
    AWS_ACCOUNT_ID    = data.aws_caller_identity.current.account_id
    REPO_SSH_URL      = var.repo_ssh_url
    REPO_PATH         = var.repo_path
    COMPOSE_FILE      = var.compose_file
    MONGO_PASSWORD    = var.mongo_password
  })

  # WHY: Optional SSH access if you registered a key pair
  dynamic "key_name" {
    for_each = var.key_name == "" ? [] : [var.key_name]
    content  = var.key_name
  }

  tags = { Name = "${var.name}-ec2" }
}

output "public_ip"  { value = aws_instance.main.public_ip }   # WHY: test web/api easily
output "public_dns" { value = aws_instance.main.public_dns }
