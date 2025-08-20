# =====================================================================
# FILE: infra/aws/modules/security/variables.tf
# WHY: Make ports/CIDRs configurable; different envs can tighten rules.
# =====================================================================
variable "name"          { type = string }
variable "vpc_id"        { type = string }
variable "ssh_cidrs"     { type = list(string) default = ["0.0.0.0/0"] }
variable "web_port"      { type = number default = 80 }
variable "frontend_port" { type = number default = 3000 }
variable "backend_port"  { type = number default = 5000 }
variable "tags"          { type = map(string) default = {} }
