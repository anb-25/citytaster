# =====================================================================
# FILE: ops/push_ecr.sh
# WHY: Create ECR repos first, then build/tag/push images so the VM can pull.
# =====================================================================
#!/usr/bin/env bash
set -euo pipefail

ENV_DIR="infra/aws/envs/dev"
AWS_REGION="${AWS_REGION:-us-east-1}"   # keep aligned with your env
BACKEND_DIR="${BACKEND_DIR:-backend}"   # CHANGE if your Dockerfile path differs
FRONTEND_DIR="${FRONTEND_DIR:-frontend}"# CHANGE if your Dockerfile path differs
BACKEND_IMAGE_TAG="${BACKEND_IMAGE_TAG:-latest}" # tip: use a commit SHA too
FRONTEND_IMAGE_TAG="${FRONTEND_IMAGE_TAG:-latest}"

echo "==> Terraform init (if needed)"
terraform -chdir="$ENV_DIR" init -upgrade >/dev/null

echo "==> Creating ECR repos (targeted apply) – safe to re-run"
terraform -chdir="$ENV_DIR" apply -auto-approve -target=module.ecr >/dev/null

echo "==> Reading ECR repo URLs"
ECR_BACKEND_URL="$(terraform -chdir="$ENV_DIR" output -raw ecr_backend_url)"
ECR_FRONTEND_URL="$(terraform -chdir="$ENV_DIR" output -raw ecr_frontend_url)"
ACCOUNT_ID="$(terraform -chdir="$ENV_DIR" output -raw aws_account_id)"

echo "==> ECR login ($AWS_REGION)"
aws ecr get-login-password --region "$AWS_REGION" \
| docker login --username AWS --password-stdin "${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

echo "==> Building backend image ($BACKEND_DIR)"
docker build -t "${ECR_BACKEND_URL}:${BACKEND_IMAGE_TAG}" "$BACKEND_DIR"

echo "==> Building frontend image ($FRONTEND_DIR)"
docker build -t "${ECR_FRONTEND_URL}:${FRONTEND_IMAGE_TAG}" "$FRONTEND_DIR"

echo "==> Pushing images"
docker push "${ECR_BACKEND_URL}:${BACKEND_IMAGE_TAG}"
docker push "${ECR_FRONTEND_URL}:${FRONTEND_IMAGE_TAG}"

cat <<EOF

Done.

IMPORTANT:
- Ensure your repo's docker-compose.yml references:
    backend: image: ${ECR_BACKEND_URL}:${BACKEND_IMAGE_TAG}
    frontend: image: ${ECR_FRONTEND_URL}:${FRONTEND_IMAGE_TAG}
- The VM's user-data logs in to ECR and 'docker compose pull' will succeed now.

Next:
  make -f ops/Makefile apply
  make -f ops/Makefile outputs
  open http://<PUBLIC_IP>

EOF
