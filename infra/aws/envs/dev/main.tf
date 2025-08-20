# =====================================================================
# FILE: infra/aws/envs/dev/main.tf
# WHY: Compose all modules into one runnable environment.
# =====================================================================
module "vpc" {
  source       = "../../modules/vpc"
  name         = var.name
  cidr_block   = "10.0.0.0/16"   # WHY: roomy address space
  public_cidr  = "10.0.1.0/24"   # WHY: EC2 in a public subnet for dev simplicity
  private_cidr = "10.0.2.0/24"   # WHY: future DBs/bastions without public IPs
  az           = var.az
}

module "security" {
  source         = "../../modules/security"
  name           = var.name
  vpc_id         = module.vpc.vpc_id
  ssh_cidrs      = var.ssh_cidrs
  web_port       = 80
  frontend_port  = 3000
  backend_port   = 5000
}

module "s3" {
  source    = "../../modules/s3"
  base_name = "citytaster-csv-data"  # WHY: stable prefix; random suffix adds uniqueness
}

module "ecr" {
  source             = "../../modules/ecr"
  backend_repo_name  = "citytaster-backend"
  frontend_repo_name = "citytaster-frontend"
}

module "iam" {
  source          = "../../modules/iam"
  name            = var.name
  s3_bucket_name  = module.s3.bucket_name
}

module "ec2" {
  source           = "../../modules/ec2_compose_host"
  name             = var.name
  subnet_id        = module.vpc.public_subnet_id
  sg_ids           = [module.security.sg_id]
  instance_type    = var.instance_type
  key_name         = var.key_name
  instance_profile = module.iam.instance_profile_name
  aws_region       = var.aws_region

  repo_ssh_url     = var.repo_ssh_url
  repo_path        = var.repo_path
  compose_file     = var.compose_file

  github_deploy_key = var.github_deploy_key
  s3_bucket_name    = module.s3.bucket_name
  mongo_password    = var.mongo_password
}
