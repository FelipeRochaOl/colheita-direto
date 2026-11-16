module "platform" {
  source            = "../../modules/platform"
  environment       = "prod"
  aws_region        = var.aws_region
  atlas_org_id      = var.atlas_org_id
  alert_email       = var.alert_email
  github_repository = var.github_repository
  web_app_url       = var.web_app_url
  api_image_tag     = var.api_image_tag
  vision_image_tag  = var.vision_image_tag

  # Começa no M0 (piloto). Gatilho de upgrade para M10+ em docs/arquitetura.md.
  atlas_instance_size         = "M0"
  asaas_api_url               = "https://api.asaas.com/v3"
  sms_enabled                 = true
  api_min_tasks               = 2
  api_max_tasks               = 6
  worker_max_tasks            = 6
  vision_max_tasks            = 4
  monthly_budget_usd          = 400
  create_github_oidc_provider = false # já criado pelo ambiente dev na mesma conta (ajuste se usar contas separadas)
}
