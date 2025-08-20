# =====================================================================
# FILE: infra/aws/README.md
# WHY: Human guide; explains layout & how this infra serves the app.
# =====================================================================
# Folder layout (WHY each dir exists)
#
# infra/
# └── aws/                           # WHY: Cloud-specific infra for AWS only
#     ├── modules/                   # WHY: Reusable building blocks; test/compose freely
#     │   ├── vpc/                   # WHY: Networking so EC2 can be reachable & pull images
#     │   ├── security/              # WHY: Open ports (22,80,3000,5000) your app needs
#     │   ├── s3/                    # WHY: Bucket for CSV/data your app syncs on boot
#     │   ├── ecr/                   # WHY: Private registries for backend/frontend images
#     │   ├── iam/                   # WHY: EC2 permissions to pull from ECR & read S3
#     │   └── ec2_compose_host/      # WHY: Boots Ubuntu + Docker; runs docker-compose stack
#     └── envs/
#         └── dev/                   # WHY: One concrete environment; clone for staging/prod
#
# Run (local state first; backend can be added later):
#   cd infra/aws/envs/dev
#   export TF_VAR_github_deploy_key="$(cat ~/.ssh/id_rsa)"   # if repo is private
#   export TF_VAR_mongo_password="change-me"
#   terraform init && terraform apply -auto-approve
#
# After apply: open the printed public IP/DNS in your browser (web on 80).
