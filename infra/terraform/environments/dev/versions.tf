terraform {
  required_version = ">= 1.9"
  required_providers {
    aws          = { source = "hashicorp/aws", version = "~> 6.70" }
    mongodbatlas = { source = "mongodb/mongodbatlas", version = "~> 2.21" }
    random       = { source = "hashicorp/random", version = "~> 3.7" }
  }
  # Estado remoto em S3 com lock nativo (use_lockfile). O pnpm infra:start cria o bucket e configura.
  backend "s3" {}
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = { Project = "colheita-direta", ManagedBy = "terraform" }
  }
}

# Credenciais via MONGODB_ATLAS_CLIENT_ID / MONGODB_ATLAS_CLIENT_SECRET (Service Account), lidas de infra/.env.
provider "mongodbatlas" {}
