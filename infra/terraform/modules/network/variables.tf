variable "name_prefix" { type = string }
variable "aws_region" { type = string }
variable "vpc_cidr" {
  type    = string
  default = "10.20.0.0/16"
}
