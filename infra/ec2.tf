# infra/ec2.tf
# PURPOSE: One t3.micro instance that runs the app's docker-compose.yml (mongo + backend + frontend,
#          frontend's own nginx handles the /api reverse proxy). user_data only bootstraps
#          Docker/Compose/AWS CLI; the actual compose file + data are delivered by the deploy
#          pipeline (GitHub Actions -> S3 -> SSM RunCommand), not baked into the AMI/user_data.
#          Reached only via SSM Session Manager -- no SSH key, no port 22.

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
}

resource "aws_instance" "app" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t3.micro"
  # local.public_subnet_ids comes from a data source with no guaranteed order, and this VPC has a
  # subnet (us-east-1e) that doesn't support t3.micro -- pin to the first subnet from tfvars instead,
  # which is us-east-1a.
  subnet_id              = var.public_subnet_ids[0]
  vpc_security_group_ids = [aws_security_group.web.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2.name

  user_data_base64 = base64encode(templatefile("${path.module}/user_data.yaml.tpl", {}))

  tags = {
    Name = "${var.project}-${var.environment}-app"
  }
}

# Stable public IP so a domain pointed at this instance doesn't break if it's ever
# restarted or replaced (a plain EC2 public IP is dynamic and can change).
resource "aws_eip" "app" {
  instance = aws_instance.app.id
  domain   = "vpc"

  tags = {
    Name = "${var.project}-${var.environment}-app-eip"
  }
}
