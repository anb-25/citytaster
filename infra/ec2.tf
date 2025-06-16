# infra/ec2.tf

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

  # Provisioner: Use user_data or remote-exec to install Docker, Docker Compose, AWS CLI, and pull your repo
  # (You will use a deploy key for private repo access—will explain next!)
}
