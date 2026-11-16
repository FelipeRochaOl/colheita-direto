output "dns_name" { value = aws_lb.main.dns_name }
output "arn_suffix" { value = aws_lb.main.arn_suffix }
output "security_group_id" { value = aws_security_group.load_balancer.id }
output "api_target_group_arn" { value = aws_lb_target_group.api.arn }
output "api_https_domain_name" { value = aws_cloudfront_distribution.api.domain_name }
