terraform {
  required_providers {
    aws    = { source = "hashicorp/aws" }
    random = { source = "hashicorp/random" }
  }
}

resource "random_password" "jwt_secret" {
  length  = 64
  special = false
}

locals {
  generated_values = {
    JWT_SECRET  = random_password.jwt_secret.result
    MONGODB_URI = var.mongodb_uri
  }
  # Preenchidos depois, à mão ou pelo setup da Meta/Asaas. Vazio = integração desligada.
  external_secret_names = [
    "ASAAS_API_KEY",
    "ASAAS_WEBHOOK_TOKEN",
    "WHATSAPP_ACCESS_TOKEN",
    "WHATSAPP_APP_SECRET",
    "WHATSAPP_VERIFY_TOKEN",
    "WHATSAPP_PHONE_NUMBER_ID",
  ]
}

resource "aws_secretsmanager_secret" "generated" {
  for_each                = local.generated_values
  name                    = "${var.name_prefix}/${each.key}"
  recovery_window_in_days = var.recovery_window_in_days
}

resource "aws_secretsmanager_secret_version" "generated" {
  for_each      = local.generated_values
  secret_id     = aws_secretsmanager_secret.generated[each.key].id
  secret_string = each.value
}

resource "aws_secretsmanager_secret" "external" {
  for_each                = toset(local.external_secret_names)
  name                    = "${var.name_prefix}/${each.key}"
  recovery_window_in_days = var.recovery_window_in_days
}

resource "aws_secretsmanager_secret_version" "external_placeholder" {
  for_each      = aws_secretsmanager_secret.external
  secret_id     = each.value.id
  secret_string = " "
  lifecycle {
    ignore_changes = [secret_string]
  }
}
