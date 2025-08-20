# =====================================================================
# FILE: ops/Makefile
# WHY: One-liners to deploy, inspect, debug, and tear down.
# =====================================================================
ENV_DIR       ?= infra/aws/envs/dev
AWS_REGION    ?= us-east-1            # keep in sync with env var/variables.tf
SSH_KEY       ?= ~/.ssh/id_rsa        # update if using a different key
SSH_USER      ?= ubuntu               # Ubuntu AMI default user

# Pull TF outputs on demand (WHY: dynamic values after apply)
PUBLIC_IP        := $(shell terraform -chdir=$(ENV_DIR) output -raw ec2_public_ip 2>/dev/null || echo "")
PUBLIC_DNS       := $(shell terraform -chdir=$(ENV_DIR) output -raw ec2_public_dns 2>/dev/null || echo "")
ECR_BACKEND_URL  := $(shell terraform -chdir=$(ENV_DIR) output -raw ecr_backend_url 2>/dev/null || echo "")
ECR_FRONTEND_URL := $(shell terraform -chdir=$(ENV_DIR) output -raw ecr_frontend_url 2>/dev/null || echo "")
ACCOUNT_ID       := $(shell terraform -chdir=$(ENV_DIR) output -raw aws_account_id 2>/dev/null || echo "")

.PHONY: init plan apply outputs destroy show ip ssh logs ps doctor

init: ## WHY: init once per env
	terraform -chdir=$(ENV_DIR) init

plan: ## WHY: see what will change
	terraform -chdir=$(ENV_DIR) plan

apply: ## WHY: create/update full stack
	terraform -chdir=$(ENV_DIR) apply -auto-approve

# In a Makefile, a leading @ on a recipe line means “don’t echo this command before running it.”
# Make normally prints each command, then runs it. @ silences that echo, so you only see the 
# command’s output, not the command itself.

outputs: ## WHY: print useful endpoints/IDs
	@terraform -chdir=$(ENV_DIR) output

destroy: ## WHY: tear everything down (dev only)
	terraform -chdir=$(ENV_DIR) destroy -auto-approve

show: ## WHY: inspect current state
	terraform -chdir=$(ENV_DIR) show

ip: ## WHY: quick IP/DNS peek
	@echo PUBLIC_IP=$(PUBLIC_IP)
	@echo PUBLIC_DNS=$(PUBLIC_DNS)

ssh: ## WHY: get onto the instance to debug
ifneq ($(strip $(PUBLIC_IP)),)
	ssh -i $(SSH_KEY) $(SSH_USER)@$(PUBLIC_IP)
else
	@echo "No PUBLIC_IP yet. Run 'make apply' then 'make outputs'."
endif

logs: ## WHY: check boot logs (via SSH, interactive)
	@echo "Run inside the host: sudo tail -n 300 /var/log/cloud-init-output.log"

ps: ## WHY: list containers (via SSH, interactive)
	@echo "Run inside the host: cd /home/ubuntu/app && docker compose ps"

doctor: ## WHY: quick local preflight
	@command -v aws >/dev/null || (echo "Missing awscli"; exit 1)
	@command -v terraform >/dev/null || (echo "Missing terraform"; exit 1)
	@command -v docker >/dev/null || (echo "Missing docker"; exit 1)
	@echo "Looks good."

