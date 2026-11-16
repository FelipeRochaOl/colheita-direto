terraform {
  required_providers {
    mongodbatlas = { source = "mongodb/mongodbatlas" }
    random       = { source = "hashicorp/random" }
  }
}

resource "mongodbatlas_project" "main" {
  name   = var.project_name
  org_id = var.atlas_org_id
}

# Plano gratuito M0 hospedado na AWS. Para produção com clientes pagantes: M10+ com backup e PrivateLink.
resource "mongodbatlas_advanced_cluster" "main" {
  project_id   = mongodbatlas_project.main.id
  name         = var.cluster_name
  cluster_type = "REPLICASET"
  replication_specs = [{
    region_configs = [{
      provider_name         = var.instance_size == "M0" ? "TENANT" : "AWS"
      backing_provider_name = var.instance_size == "M0" ? "AWS" : null
      region_name           = var.atlas_region
      priority              = 7
      electable_specs       = { instance_size = var.instance_size }
    }]
  }]
}

resource "random_password" "database_user" {
  length  = 32
  special = false
}

resource "mongodbatlas_database_user" "application" {
  project_id         = mongodbatlas_project.main.id
  auth_database_name = "admin"
  username           = "${var.cluster_name}-app"
  password           = random_password.database_user.result
  roles {
    role_name     = "readWrite"
    database_name = var.database_name
  }
}

# Só o IP fixo do NAT da VPC pode conectar (M0 não tem PrivateLink). Nunca 0.0.0.0/0.
resource "mongodbatlas_project_ip_access_list" "nat" {
  project_id = mongodbatlas_project.main.id
  ip_address = var.allowed_ip_address
  comment    = "NAT Gateway da VPC ${var.cluster_name}"
}
