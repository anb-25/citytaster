# =====================================================================
# FILE: infra/aws/modules/vpc/variables.tf
# WHY: Inputs keep this module generic; callers decide CIDRs/AZ/name.
# =====================================================================
variable "name"         { type = string }
variable "cidr_block"   { type = string }
variable "public_cidr"  { type = string }
variable "private_cidr" { type = string }
variable "az"           { type = string }  # e.g., "us-east-1a"
variable "tags"         { type = map(string) default = {} }
