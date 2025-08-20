# =====================================================================
# FILE: infra/aws/modules/vpc/main.tf
# WHY: Networking foundation; without this your EC2 can't be reachable
#      nor pull images from the internet/ECR.
# =====================================================================
terraform {
  required_version  = ">= 1.4"
  required_providers { aws = { source = "hashicorp/aws", version = "~> 5.50" } }
}
provider "aws" {}

resource "aws_vpc" "main" {
  cidr_block           = var.cidr_block
  enable_dns_support   = true   # WHY: name resolution inside VPC
  enable_dns_hostnames = true   # WHY: public DNS for instances
  tags = merge(var.tags, { Name = "${var.name}-vpc" })
}

resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_cidr
  map_public_ip_on_launch = true   # WHY: assign public IP so you can reach the host
  availability_zone       = var.az
  tags = merge(var.tags, { Name = "${var.name}-public-subnet" })
}

resource "aws_subnet" "private" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_cidr
  availability_zone = var.az
  tags = merge(var.tags, { Name = "${var.name}-private-subnet" })
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id
  tags   = merge(var.tags, { Name = "${var.name}-igw" })
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"               # WHY: default route to the internet
    gateway_id = aws_internet_gateway.igw.id
  }
  tags = merge(var.tags, { Name = "${var.name}-public-rt" })
}

resource "aws_route_table_association" "public_assoc" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}
