output "secret_arns" {
  description = "Nome da variável de ambiente → ARN"
  value = merge(
    { for name, secret in aws_secretsmanager_secret.generated : name => secret.arn },
    { for name, secret in aws_secretsmanager_secret.external : name => secret.arn },
  )
}
