# =====================================================================
# FILE: infra/aws/envs/dev/outputs.tf
# WHY: Values you actually use after deploy (visit site, push images).
# =====================================================================
output "ec2_public_ip"   { value = module.ec2.public_ip }
output "ec2_public_dns"  { value = module.ec2.public_dns }
output "s3_bucket_name"  { value = module.s3.bucket_name }
output "ecr_backend_url" { value = module.ecr.backend_repo_url }
output "ecr_frontend_url"{ value = module.ecr.frontend_repo_url }
output "aws_account_id"  { value = data.aws_caller_identity.current.account_id }
