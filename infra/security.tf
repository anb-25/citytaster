# infra/security.tf
# PURPOSE: Creates security groups to control inbound traffic to EC2 (SSH, HTTP, Frontend, Backend/API).


# Security Group for EC2 instance (web server, SSH, frontend, backend)
resource "aws_security_group" "ec2" {
  name        = "citytaster-ec2-sg"
  description = "Allow SSH, HTTP, frontend, and backend ports"
  vpc_id      = aws_vpc.main.id

  # Allow SSH from your own IP only (replace with your real IP or keep 0.0.0.0/0 for open demo—less secure)
  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Replace this!
  }

  # Allow HTTP (web) from anywhere
  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow Frontend (React, etc.) from anywhere
  ingress {
    description = "Frontend"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow Backend/API from anywhere (can restrict to private later)
  ingress {
    description = "Backend"
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow all outbound traffic (so server can download packages, reach the internet)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "citytaster-ec2-sg"
  }
}
