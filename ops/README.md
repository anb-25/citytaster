# =====================================================================
# FILE: ops/README.md
# WHY: One-page run-book; *what* to run and *why*.
# =====================================================================
# Prereqs:
# - AWS CLI configured (aws configure) and perms to create AWS resources
# - Terraform >= 1.4, Docker installed locally for building images
# - SSH key pair in AWS if you plan to SSH (set var: key_name)
#
# Environment secrets (WHY: user-data needs them)
#   export TF_VAR_github_deploy_key="$(cat ~/.ssh/id_rsa)"   # if your app repo is private
#   export TF_VAR_mongo_password="change-me"
#
# Fast path:
#   1) ./ops/push_ecr.sh             # WHY: create ECR repos then build+push images
#   2) make -f ops/Makefile apply    # WHY: stand up VPC, SG, S3, IAM, EC2 and boot compose
#   3) make -f ops/Makefile outputs  # WHY: see public IP/DNS, ECR URLs, S3 name
#   4) open http://<public_ip>       # WHY: test web; API likely on :5000 for dev
#
# Debug (if the app isn't up yet):
#   1) make -f ops/Makefile ssh
#   2) sudo tail -n 200 /var/log/cloud-init-output.log
#   3) cd /home/ubuntu/app && docker compose ps && docker compose logs --no-color --tail=200
#
# Cleanup:
#   make -f ops/Makefile destroy

