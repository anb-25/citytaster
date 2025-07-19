# infra/iam.tf
# PURPOSE: Configures IAM roles and policies to grant EC2 permissions for accessing ECR and S3.


# IAM Role that the EC2 instance will assume to get AWS permissions
resource "aws_iam_role" "ec2_role" {
  name = "citytaster-ec2-role"

  # This trust policy lets EC2 instances assume the role
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect = "Allow",
      Principal = {
        Service = "ec2.amazonaws.com"  # Only EC2 can assume this role
      },
      Action = "sts:AssumeRole"
    }]
  })
}

# Policy: EC2 can pull Docker images from ECR and read CSV files from S3
resource "aws_iam_policy" "ec2_policy" {
  name        = "citytaster-ec2-policy"
  description = "Allow EC2 to access ECR and S3 buckets"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      # ECR permissions: pull images
      {
        Effect = "Allow",
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage"
        ],
        Resource = "*"
      },
      # S3 permissions: list and get objects in your bucket
      {
        Effect = "Allow",
        Action = [
          "s3:GetObject",
          "s3:ListBucket"
        ],
        Resource = [
          "arn:aws:s3:::${aws_s3_bucket.csv_data.bucket}",      # Bucket itself
          "arn:aws:s3:::${aws_s3_bucket.csv_data.bucket}/*"    # All objects inside bucket
        ]
      }
    ]
  })
}

# Attach the above policy to the EC2 role
resource "aws_iam_role_policy_attachment" "attach" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = aws_iam_policy.ec2_policy.arn
}

# Create an Instance Profile for EC2 (this is how you assign a role to an instance)
resource "aws_iam_instance_profile" "ec2_profile" {
  name = "citytaster-ec2-profile"
  role = aws_iam_role.ec2_role.name
}
