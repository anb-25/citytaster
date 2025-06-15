#!/bin/bash
# Update system and install Docker, Docker Compose, AWS CLI
sudo apt-get update -y
sudo apt-get install -y docker.io docker-compose awscli git

# Start Docker and enable at boot
sudo systemctl start docker
sudo systemctl enable docker

# Add ubuntu user to docker group (so you can run docker commands without sudo)
sudo usermod -aG docker ubuntu

# Setup SSH Deploy Key for private GitHub access
mkdir -p /home/ubuntu/.ssh
echo "${GITHUB_DEPLOY_KEY}" > /home/ubuntu/.ssh/id_rsa
chmod 600 /home/ubuntu/.ssh/id_rsa
chown ubuntu:ubuntu /home/ubuntu/.ssh/id_rsa

# Add GitHub to known hosts to prevent authenticity prompt
ssh-keyscan github.com >> /home/ubuntu/.ssh/known_hosts
chown ubuntu:ubuntu /home/ubuntu/.ssh/known_hosts

# Clone your repo (replace with your repo link if needed)
sudo -u ubuntu git clone git@github.com:noob-developer25/citytaster.git /home/ubuntu/app

# Download latest CSVs from S3 to the app's /data directory
sudo -u ubuntu aws s3 sync s3://${S3_BUCKET_NAME}/data /home/ubuntu/app/data

# Login to ECR (fetch password, login Docker, pull images)
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION="${AWS_REGION:-us-east-1}"
ECR_FRONTEND="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/citytaster-frontend:latest"
ECR_BACKEND="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/citytaster-backend:latest"

aws ecr get-login-password --region $AWS_REGION | sudo docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

# Pull images for Docker Compose stack
cd /home/ubuntu/app
sudo -u ubuntu docker-compose pull
sudo -u ubuntu docker-compose up -d
