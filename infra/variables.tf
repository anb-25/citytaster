# infra/variables.tf

# AWS region to deploy resources in; defaults to us-east-1 (N. Virginia, free tier eligible)
variable "aws_region" {
  default = "us-east-1"
}

# EC2 instance type; t2.micro is free tier eligible
variable "instance_type" {
  default = "t2.micro"
}

# The name of the SSH key pair that you will use to connect to the EC2 instance.
# You will create this in AWS or locally and register with AWS.
variable "key_name" {
  description = "Name of the SSH key pair to use for EC2 login"
}

# The name of your MongoDB database; referenced by Docker Compose/env vars later
variable "db_name" {
  description = "The name of the Mongo database"
  default     = "CityTasterDB"
}

# Deploy Key to clone GitHub repo
variable "github_deploy_key" {
  description = "Private SSH deploy key for cloning private repo"
  sensitive   = true
}



