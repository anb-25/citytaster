# =====================================================================
# FILE: infra/aws/modules/ec2_compose_host/variables.tf
# WHY: All knobs needed to bootstrap compose from your repo.
# =====================================================================
variable "name"             { type = string }
variable "subnet_id"        { type = string }
variable "sg_ids"           { type = list(string) }
variable "instance_type"    { type = string default = "t2.micro" }
variable "key_name"         { type = string default = "" }
variable "instance_profile" { type = string }
variable "aws_region"       { type = string }

# Repo/compose placement (WHY: user-data clones & runs compose from here)
variable "repo_ssh_url"     { type = string }                     # e.g., git@github.com:anb-25/citytaster.git
variable "repo_path"        { type = string default = "/home/ubuntu/app" }
variable "compose_file"     { type = string default = "docker-compose.yml" }

# Secrets/resources consumed at boot
variable "github_deploy_key" { type = string, sensitive = true }
variable "s3_bucket_name"    { type = string }
variable "mongo_password"    { type = string }   # if you write it into .env later, optional
