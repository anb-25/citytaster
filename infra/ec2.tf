# infra/ec2.tf
# PURPOSE: Provisions the EC2 instance for deployment, configures AMI, networking, and user data for initialization.

# Ubuntu 22.04 LTS AMI for us-east-1 (check for latest AMI if needed)
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]  # Canonical (official Ubuntu images)

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
}

# The EC2 instance itself
resource "aws_instance" "main" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.ec2.id]
  key_name               = var.key_name

  # Attach IAM instance profile for S3/ECR access
  iam_instance_profile   = aws_iam_instance_profile.ec2_profile.name

  tags = {
    Name = "citytaster-ec2"
  }

  # IMPORTANT: coalesce to empty string to avoid nulls in templatefile
  user_data = templatefile("${path.module}/user_data.sh", {
    GITHUB_DEPLOY_KEY = var.github_deploy_key # now guaranteed non-null
    S3_BUCKET_NAME    = aws_s3_bucket.csv_data.bucket
    AWS_REGION        = var.aws_region
    AWS_ACCOUNT_ID    = data.aws_caller_identity.current.account_id
  })
}
