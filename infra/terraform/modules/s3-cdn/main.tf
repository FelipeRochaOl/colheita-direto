resource "aws_s3_bucket" "main" {
  bucket        = var.bucket_name
  force_destroy = var.force_destroy
}

resource "aws_s3_bucket_public_access_block" "main" {
  bucket                  = aws_s3_bucket.main.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "main" {
  bucket = aws_s3_bucket.main.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "aws:kms"
    }
  }
}

resource "aws_s3_bucket_cors_configuration" "uploads" {
  count  = length(var.upload_allowed_origins) > 0 ? 1 : 0
  bucket = aws_s3_bucket.main.id
  cors_rule {
    allowed_methods = ["PUT", "GET"]
    allowed_origins = var.upload_allowed_origins
    allowed_headers = ["*"]
    max_age_seconds = 3600
  }
}

# LGPD: áudios e transcrições do WhatsApp são apagados após 30 dias.
resource "aws_s3_bucket_lifecycle_configuration" "voice_retention" {
  count  = var.expire_voice_messages ? 1 : 0
  bucket = aws_s3_bucket.main.id
  rule {
    id     = "expire-voice-messages"
    status = "Enabled"
    filter {
      prefix = "voice-"
    }
    expiration {
      days = 30
    }
  }
}

# CloudFront só para o site estático (SPA). O bucket de fotos usa URLs assinadas.
resource "aws_cloudfront_origin_access_control" "site" {
  count                             = var.serve_as_website ? 1 : 0
  name                              = "${var.bucket_name}-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "site" {
  count               = var.serve_as_website ? 1 : 0
  enabled             = true
  default_root_object = "index.html"
  aliases             = var.domain_aliases

  origin {
    domain_name              = aws_s3_bucket.main.bucket_regional_domain_name
    origin_id                = "site"
    origin_access_control_id = aws_cloudfront_origin_access_control.site[0].id
  }

  default_cache_behavior {
    target_origin_id       = "site"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6" # Managed-CachingOptimized
  }

  # Rotas do React Router: qualquer caminho devolve o index.html.
  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }
  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = var.certificate_arn == null
    acm_certificate_arn            = var.certificate_arn
    ssl_support_method             = var.certificate_arn == null ? null : "sni-only"
  }
}

resource "aws_s3_bucket_policy" "site" {
  count  = var.serve_as_website ? 1 : 0
  bucket = aws_s3_bucket.main.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "cloudfront.amazonaws.com" }
      Action    = "s3:GetObject"
      Resource  = "${aws_s3_bucket.main.arn}/*"
      Condition = { StringEquals = { "AWS:SourceArn" = aws_cloudfront_distribution.site[0].arn } }
    }]
  })
}
