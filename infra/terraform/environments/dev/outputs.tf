output "api_url" { value = module.platform.api_url }
output "web_url" { value = module.platform.web_url }
output "web_bucket_name" { value = module.platform.web_bucket_name }
output "ecr_repository_urls" { value = module.platform.ecr_repository_urls }
output "github_deploy_role_arn" { value = module.platform.github_deploy_role_arn }
output "nat_public_ip" { value = module.platform.nat_public_ip }
output "ecs_cluster_name" { value = module.platform.ecs_cluster_name }
output "web_distribution_id" { value = module.platform.web_distribution_id }
