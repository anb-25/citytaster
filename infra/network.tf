# infra/network.tf
# PURPOSE: Import existing VPC/subnets/security group as data sources (no networking is created).

data "aws_vpc" "this" {
  id = var.vpc_id
}

data "aws_subnets" "public" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.this.id]
  }

  dynamic "filter" {
    for_each = length(var.public_subnet_ids) > 0 ? [1] : []
    content {
      name   = "subnet-id"
      values = var.public_subnet_ids
    }
  }
}

data "aws_subnets" "private" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.this.id]
  }

  dynamic "filter" {
    for_each = length(var.private_subnet_ids) > 0 ? [1] : []
    content {
      name   = "subnet-id"
      values = var.private_subnet_ids
    }
  }
}

data "aws_security_group" "default" {
  count  = var.sg_default_id == "" ? 1 : 0
  name   = "default"
  vpc_id = data.aws_vpc.this.id
}

locals {
  sg_default_id     = var.sg_default_id != "" ? var.sg_default_id : data.aws_security_group.default[0].id
  public_subnet_ids = data.aws_subnets.public.ids
}
