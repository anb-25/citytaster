# infra/security.tf
# PURPOSE: Dev web security group opening HTTP (port 80) to the world.

resource "aws_security_group" "web" {
  name   = "${var.project}-${var.environment}-web-sg"
  vpc_id = data.aws_vpc.this.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project}-${var.environment}-web-sg"
  }
}
