# infra/vpc.tf
# PURPOSE: Defines the network infrastructure including VPC, public/private subnets, and internet gateway.


# Create a VPC (your private AWS network)
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"           # Defines the address range for your VPC (like a ZIP code)
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "citytaster-vpc"
  }
}

# Public Subnet: Where your EC2 instance (web server) will live; can access the internet.
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"        # Address range for this subnet
  map_public_ip_on_launch = true                 # EC2s launched here get public IPs (so you can SSH/web browse)
  availability_zone       = "us-east-1a"

  tags = {
    Name = "citytaster-public-subnet"
  }
}

# Private Subnet: (Future-proofing) Where you’d run things that should NOT be internet-accessible, like a production DB.
resource "aws_subnet" "private" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.2.0/24"          # Different "street"
  availability_zone = "us-east-1a"

  tags = {
    Name = "citytaster-private-subnet"
  }
}

# Internet Gateway: The door to/from the public internet.
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "citytaster-igw"
  }
}

# Public Route Table: Tells traffic from public subnet how to get to the internet.
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"                     # All traffic
    gateway_id = aws_internet_gateway.main.id    # Go out through our Internet Gateway
  }

  tags = {
    Name = "citytaster-public-rt"
  }
}

# Associate the public subnet with the public route table
resource "aws_route_table_association" "public_assoc" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}
