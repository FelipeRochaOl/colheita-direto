module "platform" {
  source            = "../../modules/platform"
  environment       = "dev"
  aws_region        = var.aws_region
  atlas_org_id      = var.atlas_org_id
  alert_email       = var.alert_email
  github_repository = var.github_repository
  web_app_url       = var.web_app_url
  api_image_tag     = var.api_image_tag
  vision_image_tag  = var.vision_image_tag

  atlas_instance_size = "M0"
  application_mode    = "development" # demo sem WhatsApp/Asaas: código de login no CloudWatch, Pix simulado
  allow_force_destroy = true          # ambiente descartável: pnpm infra:stop apaga tudo
  api_max_tasks       = 2
  worker_max_tasks    = 2
  vision_max_tasks    = 1
  monthly_budget_usd  = 100
}
