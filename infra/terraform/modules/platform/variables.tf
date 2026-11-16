variable "environment" { type = string }
variable "aws_region" { type = string }
variable "atlas_org_id" { type = string }
variable "alert_email" { type = string }
variable "github_repository" {
  description = "dono/repositorio para deploy pelo GitHub Actions. Vazio = sem deploy pelo GitHub."
  type        = string
  default     = ""
}
variable "web_app_url" {
  description = "Endereço público do site. Vazio = usa o domínio do CloudFront."
  type        = string
  default     = ""
}
variable "application_mode" {
  description = "development: código de login no log do CloudWatch e Pix simulado (demo). production: só canais reais."
  type        = string
  default     = "production"
  validation {
    condition     = contains(["development", "production"], var.application_mode)
    error_message = "Use development ou production."
  }
}
variable "allow_force_destroy" {
  description = "true em ambiente descartável: destroy apaga buckets, imagens e segredos com conteúdo"
  type        = bool
  default     = false
}

variable "bedrock_region" {
  description = "(verificar) disponibilidade do Claude na região; se for outra, registrar a transferência no mapa LGPD"
  type        = string
  default     = "us-east-1"
}
variable "claude_model_id" {
  type    = string
  default = "anthropic.claude-opus-5-5"
}
variable "asaas_api_url" {
  type    = string
  default = "https://api-sandbox.asaas.com/v3"
}
variable "sms_enabled" {
  type    = bool
  default = false
}
variable "atlas_instance_size" {
  type    = string
  default = "M0"
}
variable "api_image_tag" {
  type    = string
  default = "latest"
}
variable "vision_image_tag" {
  type    = string
  default = "latest"
}
variable "api_min_tasks" {
  type    = number
  default = 1
}
variable "api_max_tasks" {
  type    = number
  default = 3
}
variable "worker_max_tasks" {
  type    = number
  default = 3
}
variable "vision_max_tasks" {
  type    = number
  default = 2
}
variable "monthly_budget_usd" {
  type    = number
  default = 150
}
variable "api_certificate_arn" {
  type    = string
  default = null
}
variable "web_certificate_arn" {
  type    = string
  default = null
}
variable "web_domain_aliases" {
  type    = list(string)
  default = []
}
variable "create_github_oidc_provider" {
  type    = bool
  default = true
}
