# =====================================================================
# FILE: infra/aws/envs/dev/variables.tf
# WHY: Only env-specific knobs live here (region, AZ, images, secrets).
# =====================================================================
variable "name"       { type = string default = "citytaster" }
variable "aws_region" { type = string default = "us-east-1" }
variable "az"         { type = string default = "us-east-1a" }

variable "instance_type"  { type = string default = "t2.micro" }
variable "key_name"       { type = string default = "" }                 # WHY: SSH access (optional)
variable "ssh_cidrs"      { type = list(string) default = ["0.0.0.0/0"] }# WHY: open for dev; tighten later

# Repo/compose placement
variable "repo_ssh_url" { type = string default = "git@github.com:anb-25/citytaster.git" }
variable "repo_path"    { type = string default = "/home/ubuntu/app" }
variable "compose_file" { type = string default = "docker-compose.yml" }

# Secrets
variable "github_deploy_key" { type = string, sensitive = true }  # export TF_VAR_github_deploy_key
variable "mongo_password"    { type = string }                    # export TF_VAR_mongo_password
