output "bucket_name" { value = aws_s3_bucket.main.bucket }
output "bucket_arn" { value = aws_s3_bucket.main.arn }
output "cloudfront_domain_name" { value = var.serve_as_website ? aws_cloudfront_distribution.site[0].domain_name : null }
output "cloudfront_distribution_arn" { value = var.serve_as_website ? aws_cloudfront_distribution.site[0].arn : null }
output "cloudfront_distribution_id" { value = var.serve_as_website ? aws_cloudfront_distribution.site[0].id : null }
