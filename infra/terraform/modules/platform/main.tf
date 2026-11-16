terraform {
  required_providers {
    aws          = { source = "hashicorp/aws" }
    mongodbatlas = { source = "mongodb/mongodbatlas" }
    random       = { source = "hashicorp/random" }
  }
}

locals {
  name_prefix = "colheita-${var.environment}"
  # Sem domínio próprio, o site usa o endereço do CloudFront (conhecido só depois do apply).
  web_app_url = var.web_app_url != "" ? var.web_app_url : "https://${module.web_site.cloudfront_domain_name}"
  service_environment = {
    NODE_ENV                      = var.application_mode
    PORT                          = "3000"
    AWS_REGION                    = var.aws_region
    BEDROCK_REGION                = var.bedrock_region
    CLAUDE_MODEL_ID               = var.claude_model_id
    WEB_APP_URL                   = local.web_app_url
    HARVEST_PHOTOS_BUCKET         = module.photos_bucket.bucket_name
    HARVEST_LOT_EVENTS_QUEUE_URL  = module.harvest_lot_events_queue.queue_url
    NOTIFICATION_EVENTS_QUEUE_URL = module.notification_events_queue.queue_url
    VISION_SERVICE_URL            = "http://vision.${local.name_prefix}.local:8000"
    ASAAS_API_URL                 = var.asaas_api_url
    SMS_ENABLED                   = tostring(var.sms_enabled)
  }
}

module "network" {
  source      = "../network"
  name_prefix = local.name_prefix
  aws_region  = var.aws_region
}

module "container_registry" {
  source           = "../ecr"
  name_prefix      = local.name_prefix
  force_delete     = var.allow_force_destroy
  repository_names = ["api", "vision"]
}

module "photos_bucket" {
  source                 = "../s3-cdn"
  bucket_name            = "${local.name_prefix}-harvest-photos"
  upload_allowed_origins = [local.web_app_url]
  expire_voice_messages  = true
  force_destroy          = var.allow_force_destroy
}

module "web_site" {
  source           = "../s3-cdn"
  bucket_name      = "${local.name_prefix}-web"
  serve_as_website = true
  force_destroy    = var.allow_force_destroy
  domain_aliases   = var.web_domain_aliases
  certificate_arn  = var.web_certificate_arn
}

module "harvest_lot_events_queue" {
  source      = "../sqs-queue"
  name_prefix = local.name_prefix
  queue_name  = "harvest-lot-events"
}

module "notification_events_queue" {
  source      = "../sqs-queue"
  name_prefix = local.name_prefix
  queue_name  = "notification-events"
}

module "database" {
  source             = "../atlas-cluster"
  atlas_org_id       = var.atlas_org_id
  project_name       = local.name_prefix
  cluster_name       = local.name_prefix
  database_name      = "colheita-direta"
  instance_size      = var.atlas_instance_size
  allowed_ip_address = module.network.nat_public_ip
}

module "secrets" {
  source                  = "../secrets"
  name_prefix             = local.name_prefix
  recovery_window_in_days = var.allow_force_destroy ? 0 : 7
  mongodb_uri             = module.database.connection_uri
}

module "load_balancer" {
  source            = "../load-balancer"
  name_prefix       = local.name_prefix
  vpc_id            = module.network.vpc_id
  public_subnet_ids = module.network.public_subnet_ids
  certificate_arn   = var.api_certificate_arn
}

resource "aws_ecs_cluster" "main" {
  name = local.name_prefix
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

resource "aws_service_discovery_private_dns_namespace" "internal" {
  name = "${local.name_prefix}.local"
  vpc  = module.network.vpc_id
}

data "aws_iam_policy_document" "api_task" {
  statement {
    sid       = "HarvestPhotos"
    actions   = ["s3:GetObject", "s3:PutObject"]
    resources = ["${module.photos_bucket.bucket_arn}/*"]
  }
  statement {
    sid       = "EventQueues"
    actions   = ["sqs:SendMessage", "sqs:ReceiveMessage", "sqs:DeleteMessage", "sqs:GetQueueAttributes"]
    resources = [module.harvest_lot_events_queue.queue_arn, module.notification_events_queue.queue_arn]
  }
  statement {
    # (verificar) ações IAM exatas exigidas pelo cliente Mantle do Bedrock.
    sid       = "ClaudeOnBedrock"
    actions   = ["bedrock:InvokeModel", "bedrock:InvokeModelWithResponseStream"]
    resources = ["*"]
  }
  statement {
    sid       = "VoiceTranscription"
    actions   = ["transcribe:StartTranscriptionJob", "transcribe:GetTranscriptionJob"]
    resources = ["*"]
  }
  statement {
    sid       = "SmsFallback"
    actions   = ["sns:Publish"]
    resources = ["*"]
  }
}

data "aws_iam_policy_document" "vision_task" {
  statement {
    # (verificar) ações IAM exatas exigidas pelo cliente Mantle do Bedrock.
    sid       = "ClaudeVisionOnBedrock"
    actions   = ["bedrock:InvokeModel"]
    resources = ["*"]
  }
}

locals {
  api_secret_arns = module.secrets.secret_arns
}

module "api_http_service" {
  source                            = "../ecs-service"
  name_prefix                       = local.name_prefix
  service_name                      = "api-http"
  cluster_id                        = aws_ecs_cluster.main.id
  cluster_name                      = aws_ecs_cluster.main.name
  vpc_id                            = module.network.vpc_id
  subnet_ids                        = module.network.private_subnet_ids
  image                             = "${module.container_registry.repository_urls["api"]}:${var.api_image_tag}"
  container_port                    = 3000
  allowed_source_security_group_ids = [module.load_balancer.security_group_id]
  target_group_arn                  = module.load_balancer.api_target_group_arn
  min_tasks                         = var.api_min_tasks
  max_tasks                         = var.api_max_tasks
  environment                       = local.service_environment
  secret_arns                       = local.api_secret_arns
  task_policy_json                  = data.aws_iam_policy_document.api_task.json
}

# Mesma imagem da API, outro comando: consome as filas SQS.
module "api_worker_service" {
  source           = "../ecs-service"
  name_prefix      = local.name_prefix
  service_name     = "api-worker"
  cluster_id       = aws_ecs_cluster.main.id
  cluster_name     = aws_ecs_cluster.main.name
  vpc_id           = module.network.vpc_id
  subnet_ids       = module.network.private_subnet_ids
  image            = "${module.container_registry.repository_urls["api"]}:${var.api_image_tag}"
  command          = ["node", "dist/worker.js"]
  min_tasks        = 1
  max_tasks        = var.worker_max_tasks
  environment      = local.service_environment
  secret_arns      = local.api_secret_arns
  task_policy_json = data.aws_iam_policy_document.api_task.json
}

module "vision_service" {
  source                            = "../ecs-service"
  name_prefix                       = local.name_prefix
  service_name                      = "vision"
  cluster_id                        = aws_ecs_cluster.main.id
  cluster_name                      = aws_ecs_cluster.main.name
  vpc_id                            = module.network.vpc_id
  subnet_ids                        = module.network.private_subnet_ids
  image                             = "${module.container_registry.repository_urls["vision"]}:${var.vision_image_tag}"
  container_port                    = 8000
  allowed_source_security_group_ids = [module.api_worker_service.security_group_id]
  service_discovery_namespace_id    = aws_service_discovery_private_dns_namespace.internal.id
  cpu                               = 1024
  memory                            = 2048
  min_tasks                         = 1
  max_tasks                         = var.vision_max_tasks
  environment = {
    CLASSIFIER_BACKEND = "claude"
    BEDROCK_REGION     = var.bedrock_region
    CLAUDE_MODEL_ID    = var.claude_model_id
  }
  task_policy_json = data.aws_iam_policy_document.vision_task.json
}

module "observability" {
  source                   = "../observability"
  name_prefix              = local.name_prefix
  alert_email              = var.alert_email
  monthly_budget_usd       = var.monthly_budget_usd
  load_balancer_arn_suffix = module.load_balancer.arn_suffix
  dead_letter_queue_names = [
    module.harvest_lot_events_queue.dead_letter_queue_name,
    module.notification_events_queue.dead_letter_queue_name,
  ]
}

module "github_deploy_role" {
  count                = var.github_repository == "" ? 0 : 1
  source               = "../github-deploy-role"
  name_prefix          = local.name_prefix
  github_repository    = var.github_repository
  create_oidc_provider = var.create_github_oidc_provider
  ecr_repository_arns  = module.container_registry.repository_arns
  ecs_role_arns = [
    module.api_http_service.task_role_arn, module.api_http_service.execution_role_arn,
    module.api_worker_service.task_role_arn, module.api_worker_service.execution_role_arn,
    module.vision_service.task_role_arn, module.vision_service.execution_role_arn,
  ]
  web_bucket_arn       = "arn:aws:s3:::${module.web_site.bucket_name}"
  web_distribution_arn = module.web_site.cloudfront_distribution_arn
}
