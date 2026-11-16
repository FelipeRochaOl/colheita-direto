variable "name_prefix" { type = string }
variable "service_name" { type = string }
variable "cluster_id" { type = string }
variable "cluster_name" { type = string }
variable "vpc_id" { type = string }
variable "subnet_ids" { type = list(string) }
variable "image" { type = string }

variable "command" {
  type    = list(string)
  default = null
}
variable "cpu" {
  type    = number
  default = 512
}
variable "memory" {
  type    = number
  default = 1024
}
variable "min_tasks" {
  type    = number
  default = 1
}
variable "max_tasks" {
  type    = number
  default = 3
}
variable "container_port" {
  type    = number
  default = null
}
variable "allowed_source_security_group_ids" {
  type    = list(string)
  default = []
}
variable "target_group_arn" {
  type    = string
  default = null
}
variable "service_discovery_namespace_id" {
  type    = string
  default = null
}
variable "environment" {
  type    = map(string)
  default = {}
}
variable "secret_arns" {
  description = "Nome da variável de ambiente → ARN do segredo no Secrets Manager"
  type        = map(string)
  default     = {}
}
variable "task_policy_json" {
  type    = string
  default = null
}
