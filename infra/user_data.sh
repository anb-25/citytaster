#!/bin/bash
# Bash script for EC2 to auto-provision Docker, Git, etc.
# This version uses injected values from Terraform via templatefile()
# path: infra/user_data.sh (HARDEN: write key only when present)
#!/bin/bash
set -euo pipefail


# ===== Install Docker, Compose, Git, AWS CLI =====
sudo apt-get update -y
sudo apt-get install -y docker.io docker-compose awscli git


# ===== Enable Docker at boot & add ubuntu to group =====
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker ubuntu


# ===== Setup SSH Deploy Key for GitHub clone (only if provided) =====
%{ if length(GITHUB_DEPLOY_KEY) > 0 }
mkdir -p /home/ubuntu/.ssh
printf '%s' "${GITHUB_DEPLOY_KEY}" | sudo tee /home/ubuntu/.ssh/id_rsa >/dev/null
sudo chmod 600 /home/ubuntu/.ssh/id_rsa
sudo chown ubuntu:ubuntu /home/ubuntu/.ssh/id_rsa
%{ else }
echo "No deploy key provided; skipping SSH key setup"
%{ endif }


# ===== Add GitHub to known_hosts =====
ssh-keyscan github.com 2>/dev/null | sudo tee -a /home/ubuntu/.ssh/known_hosts >/dev/null
sudo chown ubuntu:ubuntu /home/ubuntu/.ssh/known_hosts


# ===== Clone repo =====
sudo -u ubuntu git clone git@github.com:abc-25/citytaster.git /home/ubuntu/app || true


# ===== Download CSVs from S3 =====
sudo -u ubuntu aws s3 sync s3://"${S3_BUCKET_NAME}"/data /home/ubuntu/app/data --region "${AWS_REGION}"


# ===== ECR Login and Docker Compose Up =====
cd /home/ubuntu/app || exit 0
aws ecr get-login-password --region "${AWS_REGION}" | \
sudo docker login --username AWS --password-stdin "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com" || true


sudo -u ubuntu docker-compose pull || true
sudo -u ubuntu docker-compose up -d || true

