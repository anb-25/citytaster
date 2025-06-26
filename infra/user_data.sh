#!/bin/bash
# Bash script for EC2 to auto-provision Docker, Git, etc.
# This version uses injected values from Terraform via templatefile()

# ====== Install Docker, Compose, AWS CLI, and Git ======
sudo apt-get update -y
sudo apt-get install -y docker.io docker-compose awscli git

# ====== Enable Docker at Boot and for ubuntu User ======
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ubuntu

# ====== Setup SSH Deploy Key for GitHub Clone ======
mkdir -p /home/ubuntu/.ssh
echo "${GITHUB_DEPLOY_KEY}" > /home/ubuntu/.ssh/id_rsa
chmod 600 /home/ubuntu/.ssh/id_rsa
chown ubuntu:ubuntu /home/ubuntu/.ssh/id_rsa

# ====== Add GitHub to Known Hosts ======
ssh-keyscan github.com >> /home/ubuntu/.ssh/known_hosts
chown ubuntu:ubuntu /home/ubuntu/.ssh/known_hosts

# ====== Clone Repo ======
sudo -u ubuntu git clone git@github.com:noob-developer25/citytaster.git /home/ubuntu/app

# ====== Download CSVs from S3 ======
sudo -u ubuntu aws s3 sync s3://${S3_BUCKET_NAME}/data /home/ubuntu/app/data --region ${AWS_REGION}

# ====== ECR Login and Docker Compose Pull ======
cd /home/ubuntu/app

# These are passed in by Terraform templatefile()
AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID}"
AWS_REGION="${AWS_REGION}"

aws ecr get-login-password --region $AWS_REGION | sudo docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

# ====== Start App via Docker Compose ======
sudo -u ubuntu docker-compose pull
sudo -u ubuntu docker-compose up -d


