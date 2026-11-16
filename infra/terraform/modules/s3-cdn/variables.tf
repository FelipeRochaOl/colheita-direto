variable "bucket_name" { type = string }
variable "serve_as_website" {
  type    = bool
  default = false
}
variable "upload_allowed_origins" {
  type    = list(string)
  default = []
}
variable "expire_voice_messages" {
  type    = bool
  default = false
}
variable "domain_aliases" {
  type    = list(string)
  default = []
}
variable "certificate_arn" {
  description = "Certificado ACM em us-east-1 (exigência do CloudFront)"
  type        = string
  default     = null
}
variable "force_destroy" {
  description = "Apaga o bucket mesmo com arquivos dentro (true só em ambiente descartável)"
  type        = bool
  default     = false
}
