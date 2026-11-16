output "connection_uri" {
  description = "mongodb+srv com usuário, senha e banco, para guardar no Secrets Manager"
  sensitive   = true
  value = "${replace(
    mongodbatlas_advanced_cluster.main.connection_strings.standard_srv,
    "mongodb+srv://",
    "mongodb+srv://${mongodbatlas_database_user.application.username}:${random_password.database_user.result}@",
  )}/${var.database_name}?retryWrites=true&w=majority"
}
