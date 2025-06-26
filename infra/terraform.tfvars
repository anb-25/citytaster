# The AWS region to deploy to (default: us-east-1, N. Virginia)
aws_region = "us-east-1"

# The EC2 instance type (t2.micro is free tier eligible)
instance_type = "t2.micro"

# The name of your EC2 key pair (must match a key registered in AWS EC2 console)
key_name = "citytaster-ec2"   # <-- Change if your key is named differently

# The name of your MongoDB database (should match what your app expects)
db_name = "CityTasterDB"

# The private SSH deploy key (used for pulling your private GitHub repo)
# DO NOT store your private key in this file! 
# Pass it at apply time via environment variable or CLI:
#     export TF_VAR_github_deploy_key="$(cat /path/to/private_ssh_key)"
# or
#     terraform apply -var="github_deploy_key=$(cat /path/to/private_ssh_key)"

# The names/IDs of AWS resources provisioned by Terraform (for reference or re-use)
vpc_id          = "vpc-054ade2911eaf9f54"
s3_bucket_name  = "citytaster-csv-data-c11ea24"
ecr_backend_url = "936666348915.dkr.ecr.us-east-1.amazonaws.com/citytaster-backend"
ecr_frontend_url= "936666348915.dkr.ecr.us-east-1.amazonaws.com/citytaster-frontend"

# (If using these as variables, ensure they're defined in your variables.tf)

# -------------------------------------
# Note: For production, always manage secrets (like deploy keys) via a secret manager, 
# environment variable, or CI/CD secret—not in code or tfvars.
# -------------------------------------


