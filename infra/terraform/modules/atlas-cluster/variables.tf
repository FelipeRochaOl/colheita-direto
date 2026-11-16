variable "atlas_org_id" { type = string }
variable "project_name" { type = string }
variable "cluster_name" { type = string }
variable "database_name" { type = string }
variable "allowed_ip_address" { type = string }
variable "atlas_region" {
  description = "Região AWS no formato do Atlas. (verificar) disponibilidade do M0 em SA_EAST_1."
  type        = string
  default     = "SA_EAST_1"
}
variable "instance_size" {
  type    = string
  default = "M0"
}
