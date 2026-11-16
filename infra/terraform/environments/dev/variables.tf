variable "aws_region" {
  type    = string
  default = "sa-east-1"
}
variable "atlas_org_id" { type = string }
variable "alert_email" { type = string }
variable "github_repository" {
  type    = string
  default = ""
}
variable "web_app_url" {
  type    = string
  default = ""
}
variable "api_image_tag" {
  type    = string
  default = "latest"
}
variable "vision_image_tag" {
  type    = string
  default = "latest"
}
