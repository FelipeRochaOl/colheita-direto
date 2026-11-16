variable "name_prefix" { type = string }
variable "github_repository" {
  description = "dono/repositorio"
  type        = string
}
variable "deploy_branch" {
  type    = string
  default = "main"
}
variable "create_oidc_provider" {
  description = "O provedor OIDC do GitHub existe uma vez por conta AWS"
  type        = bool
  default     = true
}
variable "ecr_repository_arns" { type = list(string) }
variable "ecs_role_arns" { type = list(string) }
variable "web_bucket_arn" { type = string }
variable "web_distribution_arn" { type = string }
